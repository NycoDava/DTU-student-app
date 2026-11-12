/**
 * DTU session + data sources for the local server.
 *
 * One Playwright login (ADFS form, like dtu-scraper.js), then every platform entry is opened once so its cookies
 * are written into the same browser context. After that, data is read with context.request (same cookies, no CORS).
 * The session lives ONLY in memory: no cookies or passwords are written to disk or logged.
 */
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

export const LEARN = 'https://learn.inside.dtu.dk';
export const STUDYPLAN = 'https://studieplan.dtu.dk';
export const GRADES = 'https://campusnet.dtu.dk/cnnet/Grades/Grades.aspx';
const MYCOURSES = `${LEARN}/d2l/le/manageCourses/api/mycourses?pageSize=20&sort=current&autoPinCourses=false&orgUnitTypeId=3&promotePins=true&embedDepth=0`;
const DTU_FEEDS = {
  news: 'https://www.dtu.dk/api/v1/news/newslist',
  events: 'https://www.dtu.dk/api/v1/calendar/calendareventlist',
};

/** Thrown when DTU answers with the login page: the session is over, the user must log in again. */
export class SessionExpired extends Error {
  constructor() {
    super('session_expired');
  }
}

/** At most `n` requests in flight (shared by all sources). */
function limiter(n) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= n || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    fn()
      .then(resolve, reject)
      .finally(() => {
        active--;
        next();
      });
  };
  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
}

let browser = null;
/** The one in-memory session: { context, page, le, lp, me, since } or null. */
let session = null;

export const getSession = () => session;

export async function closeSession() {
  const s = session;
  session = null;
  if (s) await s.context.close().catch(() => {});
}

export async function shutdown() {
  await closeSession();
  if (browser) await browser.close().catch(() => {});
  browser = null;
}

const MFA_HINT = /approve|authenticator|verification code|verify your identity|multi-factor|two-step|mfa/i;

/**
 * Logs in with the ADFS form. The password is only typed into the form and never kept.
 * Returns { ok: true, user } or { ok: false, error: 'invalid_credentials' | 'mfa_required' | 'login_failed', detail }.
 */
export async function login(username, password) {
  await closeSession();
  browser ??= await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const fail = async (error, detail) => {
    await context.close().catch(() => {});
    return { ok: false, error, detail };
  };

  try {
    await page.goto(LEARN, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.fill('#userNameInput', username, { timeout: 15000 });
    await page.fill('#passwordInput', password);
    await page.click('#submitButton');
  } catch (e) {
    return fail('login_failed', `login form not reachable: ${firstLine(e)}`);
  }

  const outcome = await Promise.race([
    page.waitForURL('**/learn.inside.dtu.dk/**', { timeout: 45000 }).then(() => 'ok'),
    page
      .waitForFunction(() => (document.querySelector('#errorText')?.textContent || '').trim().length > 0, null, { timeout: 45000 })
      .then(() => 'invalid'),
  ]).catch(() => 'timeout');

  if (outcome === 'invalid') return fail('invalid_credentials', 'DTU rejected the username or password');
  if (outcome !== 'ok') {
    const text = await page.locator('body').innerText().catch(() => '');
    if (MFA_HINT.test(text)) return fail('mfa_required', `confirmation requested on ${new URL(page.url()).host}`);
    return fail('login_failed', `did not reach Learn (now on ${new URL(page.url()).host})`);
  }

  // Open each platform entry once (in parallel) so their cookies exist in this context.
  const entries = await Promise.all(
    [STUDYPLAN, GRADES].map(async (url) => {
      const p = await context.newPage();
      const target = new URL(url).host;
      try {
        // Wait until the SSO redirects end on the platform itself, otherwise its cookies are not written yet.
        // CAS hand-off pages are also followed later by get(), so a short wait is enough here.
        await p.goto(url, { waitUntil: 'load', timeout: 30000 });
        await p.waitForURL((u) => u.host === target, { timeout: 8000 }).catch(() => {});
        return { url, host: new URL(p.url()).host };
      } catch (e) {
        return { url, error: firstLine(e) };
      } finally {
        await p.close().catch(() => {});
      }
    }),
  );

  session = { context, page, le: null, lp: null, me: null, since: new Date().toISOString(), entries };
  try {
    const versions = await getJson(`${LEARN}/d2l/api/versions/`);
    session.le = versions.find((v) => v.ProductCode === 'le')?.LatestVersion ?? null;
    session.lp = versions.find((v) => v.ProductCode === 'lp')?.LatestVersion ?? null;
    if (session.lp) session.me = await getJson(`${LEARN}/d2l/api/lp/${session.lp}/users/whoami`);
  } catch (e) {
    if (e instanceof SessionExpired) return fail('login_failed', 'session lost right after login');
  }
  return { ok: true, user: publicUser() };
}

export function publicUser() {
  const me = session?.me;
  return me ? { name: `${me.FirstName} ${me.LastName}`.trim(), username: me.UniqueName } : null;
}

const firstLine = (e) => String(e?.message || e).split('\n')[0].slice(0, 200);
const run = limiter(4);

/** A response that is the ADFS login page means the cookies are no longer valid. */
function looksLikeLogin(res, text) {
  const host = new URL(res.url()).host;
  return /^sts\.|login\.microsoftonline/i.test(host) || /id="userNameInput"/.test(text);
}

/**
 * GET with the session cookies. Returns { ok, status, text, ms }. Throws SessionExpired.
 * `learnPage: true` = if context.request fails (not for auth reasons), retry like the scraper: fetch() inside the page.
 */
/** CAS (Studyplanner) answers with a JS hand-off page "<title>Cas</title> window.location.href='...?ticket=ST-...'". */
const CAS_HANDOFF = /<title>\s*Cas\s*<\/title>[\s\S]*?window\.location\.href\s*=\s*'(https:\/\/[^']+)'/i;
const isDtuHost = (u) => /(^|\.)dtu\.dk$/i.test(new URL(u).hostname);

export async function get(url, { learnPage = false } = {}) {
  if (!session) throw new SessionExpired();
  const t0 = performance.now();
  let res = await run(() => session.context.request.get(url, { failOnStatusCode: false, timeout: 30000 }));
  let text = await res.text();
  // Follow CAS hand-offs like a browser would (DTU hosts only, at most twice). The ticket is never logged.
  for (let hops = 0; hops < 2; hops++) {
    const next = CAS_HANDOFF.exec(text)?.[1];
    if (!next || !isDtuHost(next)) break;
    res = await run(() => session.context.request.get(next, { failOnStatusCode: false, timeout: 30000 }));
    text = await res.text();
  }
  if (looksLikeLogin(res, text)) {
    await closeSession();
    throw new SessionExpired();
  }
  if (res.ok() || !learnPage) return { ok: res.ok(), status: res.status(), text, ms: Math.round(performance.now() - t0), via: 'request' };

  // Fallback (scraper path): same-origin fetch inside the authenticated Learn page.
  const viaPage = await run(() =>
    session.page.evaluate(async (u) => {
      const r = await fetch(u, { credentials: 'include' });
      return { ok: r.ok, status: r.status, text: await r.text() };
    }, url),
  ).catch((e) => ({ ok: false, status: 0, text: firstLine(e) }));
  return { ...viaPage, ms: Math.round(performance.now() - t0), via: 'page' };
}

export async function getJson(url, opts) {
  const r = await get(url, opts);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url.replace(LEARN, '')} ${r.text.slice(0, 120)}`);
  return JSON.parse(r.text);
}

// ===================================================================================================
// Sources. Each returns the same RAW shape dtu-scraper.js writes, so the vendored normalize.cjs works unchanged.
// ===================================================================================================

/** Learn: courses, content/news/dropbox per course, classlists + groups (current term), calendar, banner images. */
export async function fetchLearn({ saveImage }) {
  const { le, lp } = session;
  if (!le) throw new Error('Learn API version unknown');
  const learn = await getJson(MYCOURSES, { learnPage: true });
  const courses = learn.Courses || [];

  const routes = { content: 'content/toc', announcements: 'news/', assignments: 'dropbox/folders/' };
  const courseDetails = await Promise.all(
    courses.map(async (course) => {
      const entry = { orgUnitId: course.OrgUnitId, course };
      await Promise.all(
        Object.entries(routes).map(async ([name, route]) => {
          const r = await get(`${LEARN}/d2l/api/le/${le}/${course.OrgUnitId}/${route}`, { learnPage: true });
          entry[name] = r.ok ? JSON.parse(r.text) : { error: true, status: r.status, snippet: r.text.slice(0, 200) };
        }),
      );
      return entry;
    }),
  );

  // Classlists + my group only for the newest term (e.g. e26), like CLASSLIST_TERMS in the scraper.
  const termOf = (c) => (/^DTU_([a-z]\d{2})_/i.exec(c.Code) || [])[1];
  const newest = [...courses].sort((a, b) => String(b.StartDate || '').localeCompare(String(a.StartDate || '')))[0];
  const currentTerm = newest ? termOf(newest) : null;
  const me = session.me;
  const rolesRes = lp ? await get(`${LEARN}/d2l/api/lp/${lp}/roles/`) : null;
  const roleNames = rolesRes?.ok ? Object.fromEntries(JSON.parse(rolesRes.text).map((r) => [String(r.Identifier), r.DisplayName])) : {};
  const classlists = {};
  await Promise.all(
    courses
      .filter((c) => termOf(c) === currentTerm)
      .map(async (c) => {
        const entry = { ok: false, status: null, myId: me ? String(me.Identifier) : null, myRoleId: null, roleNames, users: [], group: null };
        const res = await get(`${LEARN}/d2l/api/le/${le}/${c.OrgUnitId}/classlist/`, { learnPage: true });
        entry.status = res.status;
        if (res.ok) {
          const data = JSON.parse(res.text);
          entry.users = (Array.isArray(data) ? data : data.Objects || data.Items || []).map(mapPerson);
          entry.ok = true;
        }
        entry.myRoleId = entry.users.find((u) => u.id === entry.myId)?.roleId ?? null;
        if (lp && entry.myId) {
          const cats = await get(`${LEARN}/d2l/api/lp/${lp}/${c.OrgUnitId}/groupcategories/`);
          if (cats.ok) {
            for (const cat of JSON.parse(cats.text)) {
              const gr = await get(`${LEARN}/d2l/api/lp/${lp}/${c.OrgUnitId}/groupcategories/${cat.GroupCategoryId}/groups/`);
              if (!gr.ok) continue;
              for (const g of JSON.parse(gr.text)) {
                const members = (g.Enrollments || []).map(String);
                if (members.includes(entry.myId)) {
                  entry.group = { category: cat.Name, name: g.Name, members: members.length, maxMembers: cat.MaxUsersPerGroup ?? null };
                }
              }
            }
          }
        }
        classlists[c.OrgUnitId] = entry;
      }),
  );

  // Calendar: the Brightspace API answers 400 "Invalid Parameters" for this account (see docs/live-data.md).
  // One attempt with millisecond dates + course ids; otherwise the agenda uses deadlines + manual events.
  const day = 864e5;
  const ids = courses.map((c) => c.OrgUnitId).join(',');
  const cal = await get(
    `${LEARN}/d2l/api/le/${le}/calendar/events/myEvents/?orgUnitIdsCSV=${ids}&startDateTime=${new Date(Date.now() - 30 * day).toISOString()}&endDateTime=${new Date(Date.now() + 150 * day).toISOString()}`,
  );
  const calEvents = cal.ok ? (d => (Array.isArray(d) ? d : d.Objects || []))(JSON.parse(cal.text)) : [];
  const calendar = { ok: cal.ok, source: cal.ok ? 'api' : null, events: calEvents, errors: cal.ok ? [] : [`api: status ${cal.status}`] };

  // Banner images (need the login): written to public/course-images/<orgUnitId>.<ext>.
  const courseImages = {};
  await Promise.all(
    courses.map(async (c) => {
      const link = c.FormattedImageLink || c.ImageLink;
      if (!link) return;
      const res = await run(() => session.context.request.get(/^https?:/.test(link) ? link : LEARN + link, { failOnStatusCode: false, timeout: 30000 })).catch(() => null);
      const type = res ? (res.headers()['content-type'] || '').split(';')[0] : '';
      if (!res?.ok() || !type.startsWith('image/')) return;
      const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
      await saveImage(`${c.OrgUnitId}.${ext}`, await res.body());
      courseImages[c.OrgUnitId] = `course_images/${c.OrgUnitId}.${ext}`;
    }),
  );

  return { learn, courseDetails, classlists, calendar, courseImages, counts: { courses: courses.length } };
}

const mapPerson = (u) => ({
  id: String(u.Identifier ?? u.UserId ?? u.id ?? ''),
  name: u.DisplayName || [u.FirstName, u.LastName].filter(Boolean).join(' ').trim() || u.Username || '',
  email: u.Email || u.EmailAddress || null,
  username: u.Username || u.OrgDefinedId || null,
  roleId: u.RoleId ?? null,
});

/** Studyplanner: the whole plan is embedded in the page as `var data = {...}`. GET + parse, page as fallback. */
export async function fetchStudyplan() {
  const r = await get(STUDYPLAN);
  let data = null;
  const m = r.ok ? r.text.match(/var data = (\{[\s\S]*?\});/) : null;
  if (m) data = JSON.parse(m[1]);
  let via = 'request';
  if (!data) {
    // Fallback (scraper path): open the page and read window.data. Keep why the direct GET failed.
    const hint = /<form[^>]*SAMLResponse|name="SAMLResponse"/i.test(r.text) ? 'SAML auto-post form' : `HTTP ${r.status}, ${r.text.length} bytes, no "var data"`;
    via = `page (request: ${hint})`;
    const p = await session.context.newPage();
    try {
      await p.goto(STUDYPLAN, { waitUntil: 'domcontentloaded', timeout: 45000 });
      data = await p.evaluate(() => (typeof window.data !== 'undefined' ? window.data : null));
    } finally {
      await p.close().catch(() => {});
    }
  }
  if (!data) throw new Error(`"var data" not found on studieplan.dtu.dk (HTTP ${r.status})`);
  data.examResults = (data.ReportingPeriods || []).flatMap((rp) => rp.Semesters || []).flatMap((s) => s.ExamPeriod?.Results || []);
  return { studyplan: data, via, counts: { examResults: data.examResults.length } };
}

/** CampusNet grades: HTML table (class gradesList). GET + Cheerio, page as fallback. */
export async function fetchGrades() {
  const parse = (html) => {
    const $ = cheerio.load(html);
    const rows = [];
    $('table').each((_, table) => {
      const head = $(table).find('tr').first().text();
      if (!(head.includes('Number') && head.includes('Title'))) return;
      $(table)
        .find('tr')
        .slice(1)
        .each((_, row) => {
          const cells = $(row).find('td');
          if (cells.length >= 5) {
            rows.push({
              number: $(cells[0]).text().trim(),
              title: $(cells[1]).text().trim(),
              grade: $(cells[2]).text().trim(),
              ects: $(cells[3]).text().trim(),
              date: $(cells[4]).text().trim(),
            });
          }
        });
    });
    return rows;
  };
  const r = await get(GRADES);
  let grades = r.ok ? parse(r.text) : [];
  let via = 'request';
  if (grades.length === 0) {
    via = 'page';
    const p = await session.context.newPage();
    try {
      await p.goto(GRADES, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await p.waitForSelector('table.gradesList', { timeout: 20000 }).catch(() => {});
      grades = parse(await p.content());
    } finally {
      await p.close().catch(() => {});
    }
  }
  if (grades.length === 0) throw new Error(`table.gradesList not found on CampusNet (HTTP ${r.status})`);
  return { grades, via, counts: { grades: grades.length } };
}

/**
 * Public dtu.dk news/events (no login). Direct GET answers 403 (www.dtu.dk blocks automated/headless clients),
 * so this usually fails and the sync keeps the last saved lists.
 */
export async function fetchDtuFeeds() {
  const results = {};
  for (const [key, url] of Object.entries(DTU_FEEDS)) {
    if (!session) throw new SessionExpired();
    const res = await run(() => session.context.request.get(url, { failOnStatusCode: false, timeout: 15000 }));
    if (!res.ok()) throw new Error(`HTTP ${res.status()} from www.dtu.dk${new URL(url).pathname}`);
    results[key] = JSON.parse(await res.text()).Results || [];
  }
  // Same mapping as parseDtuNews / parseDtuEvents in dtu-scraper.js.
  const flat = (t) => String(t || '').replace(/\s+/g, ' ').trim();
  const iso = (v) => (Number.isNaN(new Date(v).getTime()) ? null : new Date(v).toISOString());
  const abs = (u) => (u ? new URL(u, 'https://www.dtu.dk').toString() : null);
  return {
    news: {
      items: results.news.map((n) => ({
        id: n.Id, title: flat(n.Title), url: n.Url, teaser: flat(n.Summary), publishedAt: iso(n.Date),
        imageUrl: abs(n.Image?.SmallUrl || n.Image?.NormalUrl || n.Image?.ImageUrl), badge: n.Badge?.Title || null,
      })),
    },
    events: {
      items: results.events.map((e) => ({
        id: e.Id, title: flat(e.Title), url: e.Url, teaser: flat(e.Text), startsAt: iso(e.Date), endsAt: iso(e.ToDate),
        location: String(e.Location || '').split(/\r?\n/).map(flat).filter(Boolean).join(', ') || null,
        organizers: flat(e.Organizers) || null, imageUrl: abs(e.ImageUrl), subjects: (e.Subjects || []).map((s) => s.TitleEnglish).filter(Boolean),
      })),
    },
  };
}
