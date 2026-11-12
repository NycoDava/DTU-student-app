/**
 * Client of the local DTU data server (server/index.js), reached through the Vite proxy at /api/local.
 * If the server does not answer (static build, server not started), the app runs in demo mode:
 * fake login + anonymized demo data. See docs/live-data.md.
 */
const BASE = '/api/local';

export type SourceName = 'learn' | 'studyplan' | 'grades' | 'study' | 'dtu';
export type SourceState = { state: 'idle' | 'running' | 'ok' | 'failed' | 'kept'; ms: number | null; error: string | null };
export type SyncState = { running: boolean; finishedAt: string | null; error: string | null; sources: Record<SourceName, SourceState> };
export type Session = {
  server: true;
  loggedIn: boolean;
  user: { name: string; username: string } | null;
  sync: SyncState;
  saved: { fetchedAt: string } | null;
};

export const SOURCE_LABELS: Record<SourceName, string> = {
  learn: 'Courses',
  studyplan: 'Studyplan',
  grades: 'Grades',
  study: 'Announcements',
  dtu: 'DTU news',
};

export async function getSession(): Promise<Session | null> {
  try {
    const res = await fetch(`${BASE}/session`, { cache: 'no-store', signal: AbortSignal.timeout(2000) });
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('application/json')) return null;
    const data = await res.json();
    return data?.server === true ? (data as Session) : null;
  } catch {
    return null;
  }
}

let serverPromise: Promise<boolean> | null = null;
/** True when the local server answers (checked once per page load). */
export function hasLiveServer(): Promise<boolean> {
  serverPromise ??= getSession().then((s) => s !== null);
  return serverPromise;
}

async function post(path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const isJson = (res.headers.get('content-type') ?? '').includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : {};
  return { status: res.status, ok: res.ok, data, isJson };
}

export type LoginError = 'invalid_credentials' | 'mfa_required' | 'rate_limited' | 'login_in_progress' | 'login_failed' | 'server_down';

/** Sends the credentials to the LOCAL server only (127.0.0.1), which types them into the DTU login form. */
export async function login(username: string, password: string): Promise<{ ok: true } | { ok: false; error: LoginError; detail?: string }> {
  try {
    const r = await post('/login', { username, password });
    if (r.ok) return { ok: true };
    // Not JSON = the Vite proxy answered (502/504): the local server stopped or crashed during the login.
    if (!r.isJson) return { ok: false, error: 'server_down', detail: `HTTP ${r.status} from the proxy` };
    return { ok: false, error: (r.data.error as LoginError) ?? 'login_failed', detail: r.data.detail };
  } catch {
    return { ok: false, error: 'server_down' };
  }
}

export const logout = () => post('/logout');

/** Starts a refresh. `expired` = the session is gone: ask for username + password again. */
export async function refresh(): Promise<'started' | 'expired'> {
  const r = await post('/refresh?force=1');
  return r.status === 401 ? 'expired' : 'started';
}
