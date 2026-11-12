/**
 * Local DTU data server. Run it on YOUR computer with YOUR account:  npm run server
 *
 * Security rules (see CLAUDE.md):
 * - Listens on 127.0.0.1 only; requests with another Host header are refused (DNS rebinding).
 * - Credentials are only typed into the DTU login form (Playwright). They are never stored, logged or sent
 *   to any host other than DTU. The session (cookies) lives only in memory; no automatic re-login.
 * - POST bodies must be JSON (blocks cross-site form posts). No CORS headers: other sites cannot read responses.
 *
 * The app talks to it through the Vite proxy: /api/local/* -> http://127.0.0.1:8787/api/*
 */
import http from 'node:http';
import { LEARN, SessionExpired, closeSession, fetchGrades, fetchStudyplan, getJson, getSession, login, publicUser, shutdown } from './dtu.js';
import { readSaved, startSync, syncState } from './sync.js';

const PORT = Number(process.env.DTU_SERVER_PORT || 8787);
const HOST = '127.0.0.1';
const ALLOWED_HOSTS = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]);

// ---- Login rate limit: 5 attempts per 15 minutes, one at a time ----
const attempts = [];
let loginBusy = false;
function rateLimited() {
  const now = Date.now();
  while (attempts.length && now - attempts[0] > 15 * 60_000) attempts.shift();
  return attempts.length >= 5;
}

// ---- Short cache for the live GET routes ----
const cache = new Map();
async function cached(key, fn, ttl = 60_000) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value;
  const value = await fn();
  cache.set(key, { at: Date.now(), value });
  return value;
}

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > 10_000) {
        reject(new Error('body too large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(new Error('invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

const sessionInfo = () => {
  const s = getSession();
  return { loggedIn: !!s, user: s ? publicUser() : null, since: s?.since ?? null };
};

/** Live routes need the session: 401 tells the app to ask for username + password again. */
async function live(res, fn) {
  if (!getSession()) return send(res, 401, { error: 'not_logged_in' });
  try {
    send(res, 200, await fn());
  } catch (e) {
    if (e instanceof SessionExpired) return send(res, 401, { error: 'session_expired' });
    send(res, 502, { error: 'upstream_failed', detail: String(e.message).slice(0, 200) });
  }
}

const routes = {
  'GET /api/session': async (req, res) => {
    const saved = await readSaved();
    send(res, 200, { server: true, ...sessionInfo(), sync: syncState, saved: saved ? { fetchedAt: saved.fetchedAt, sources: saved.sources } : null });
  },

  'POST /api/login': async (req, res) => {
    if (loginBusy) return send(res, 409, { error: 'login_in_progress' });
    if (rateLimited()) return send(res, 429, { error: 'rate_limited', detail: 'Too many attempts, wait 15 minutes' });
    let body;
    try {
      body = await readBody(req);
    } catch (e) {
      return send(res, 400, { error: 'bad_request', detail: e.message });
    }
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!username || !password) return send(res, 400, { error: 'bad_request', detail: 'username and password are required' });
    attempts.push(Date.now());
    loginBusy = true;
    try {
      const result = await login(username, password);
      console.log(`[login] ${result.ok ? 'ok' : `${result.error}: ${result.detail}`}`); // never the credentials
      if (!result.ok) {
        const status = { invalid_credentials: 401, mfa_required: 409 }[result.error] ?? 502;
        return send(res, status, { error: result.error, detail: result.detail });
      }
      cache.clear();
      send(res, 200, { ok: true, ...sessionInfo() });
    } finally {
      loginBusy = false;
    }
  },

  'POST /api/logout': async (req, res) => {
    await closeSession();
    cache.clear();
    send(res, 200, { ok: true, ...sessionInfo() });
  },

  /** Starts a sync in the background; the app polls GET /api/session for per-source progress. */
  'POST /api/refresh': async (req, res) => {
    if (!getSession()) return send(res, 401, { error: 'not_logged_in' });
    const force = new URL(req.url, 'http://x').searchParams.get('force') === '1';
    startSync({ force });
    send(res, 202, { ok: true, sync: syncState });
  },

  /** The saved data of the last successful sync (app format). Works without a session. */
  'GET /api/data': async (req, res) => {
    const saved = await readSaved();
    if (!saved) return send(res, 404, { error: 'no_saved_data' });
    send(res, 200, saved);
  },

  // ---- Live routes (raw platform data, 60 s cache) ----
  'GET /api/courses': (req, res) =>
    live(res, () =>
      cached('courses', () =>
        getJson(`${LEARN}/d2l/le/manageCourses/api/mycourses?pageSize=20&sort=current&autoPinCourses=false&orgUnitTypeId=3&promotePins=true&embedDepth=0`, { learnPage: true }),
      ),
    ),
  'GET /api/studyplan': (req, res) =>
    live(res, () =>
      cached('studyplan', async () => (await fetchStudyplan()).studyplan),
    ),
  'GET /api/grades': (req, res) =>
    live(res, () =>
      cached('grades', async () => (await fetchGrades()).grades),
    ),
  /** Aggregate: same as /api/data, but refreshes first if the session is valid. */
  'GET /api/all': (req, res) =>
    live(res, async () => {
      await startSync();
      return readSaved();
    }),
};

/** GET /api/courses/:orgUnitId -> content, announcements, assignments, classlist, group categories. */
async function courseDetail(req, res, id) {
  if (!/^\d+$/.test(id)) return send(res, 400, { error: 'bad_request' });
  return live(res, () =>
    cached(`course-${id}`, async () => {
      const { le, lp } = getSession();
      const base = `${LEARN}/d2l/api/le/${le}/${id}`;
      const [content, announcements, assignments, classlist, groupCategories] = await Promise.all([
        getJson(`${base}/content/toc`, { learnPage: true }),
        getJson(`${base}/news/`, { learnPage: true }),
        getJson(`${base}/dropbox/folders/`, { learnPage: true }),
        getJson(`${base}/classlist/`, { learnPage: true }).catch(() => null),
        lp ? getJson(`${LEARN}/d2l/api/lp/${lp}/${id}/groupcategories/`).catch(() => null) : null,
      ]);
      return { orgUnitId: id, content, announcements, assignments, classlist, groupCategories };
    }),
  );
}

const server = http.createServer(async (req, res) => {
  const t0 = performance.now();
  res.on('finish', () => console.log(`${req.method} ${req.url.split('?')[0]} ${res.statusCode} ${Math.round(performance.now() - t0)}ms`));

  if (!ALLOWED_HOSTS.has(req.headers.host || '')) return send(res, 403, { error: 'forbidden_host' });
  if (req.method === 'POST' && !(req.headers['content-type'] || '').startsWith('application/json')) {
    return send(res, 415, { error: 'json_required' });
  }
  const pathname = new URL(req.url, 'http://x').pathname.replace(/\/$/, '');
  const route = routes[`${req.method} ${pathname}`];
  try {
    if (route) return await route(req, res);
    const m = req.method === 'GET' && /^\/api\/courses\/([^/]+)$/.exec(pathname);
    if (m) return await courseDetail(req, res, m[1]);
    send(res, 404, { error: 'not_found' });
  } catch (e) {
    send(res, 500, { error: 'server_error', detail: String(e.message).slice(0, 200) });
  }
});

server.listen(PORT, HOST, () => console.log(`DTU local server on http://${HOST}:${PORT} (localhost only)`));

// An unexpected error must not kill the server (the app would only see a proxy error).
process.on('unhandledRejection', (e) => console.error('[error] unhandled rejection:', String(e?.message || e).split(String.fromCharCode(10))[0]));
process.on('uncaughtException', (e) => console.error('[error] uncaught exception:', String(e?.message || e).split(String.fromCharCode(10))[0]));
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.error(`Port ${PORT} is already in use: another "npm run server" is running.`);
  else console.error('[error]', e.message);
  process.exit(1);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    await shutdown();
    process.exit(0);
  });
}
