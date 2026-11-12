import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataFetchedAt, dataMode } from '../data/appFile';
import { SOURCE_LABELS, getSession, refresh, type Session, type SourceName } from '../data/liveServer';
import './SyncBar.css';

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Copenhagen',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const ICON = { idle: '', running: '…', ok: '✓', failed: '✕', kept: '✕' } as const;

/** Saved data older than this is refreshed automatically when the app opens (if the DTU session is still valid). */
const STALE_MS = 30 * 60_000;
let autoRefreshTried = false; // once per page load

/**
 * "Updated: Thu 12 Nov, 10:32 · Refresh" (live mode only, not in Figma). Data older than 30 min is refreshed by itself
 * when the app opens and the DTU session is still valid. While a refresh runs it shows the progress
 * per source; when it ends the page reloads with the new data. A source that failed keeps its last saved data.
 * Expired session → the login screen asks for username + password again.
 */
export default function SyncBar() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const sawRunning = useRef(false);

  const poll = useCallback(async function pollOnce(): Promise<void> {
    const s = await getSession();
    setSession(s);
    if (!s) return;
    if (s.sync.running) {
      sawRunning.current = true;
      setTimeout(pollOnce, 800);
    } else if (sawRunning.current) {
      sawRunning.current = false;
      if (!s.sync.error) window.location.reload(); // new data saved: reload it
    }
  }, []);

  useEffect(() => {
    if (dataMode !== 'live') return;
    (async () => {
      const s = await getSession();
      const stale = !dataFetchedAt || Date.now() - new Date(dataFetchedAt).getTime() > STALE_MS;
      if (s?.loggedIn && stale && !s.sync.running && !autoRefreshTried) {
        autoRefreshTried = true;
        if ((await refresh()) === 'started') sawRunning.current = true;
      }
      poll();
    })();
  }, [poll]);

  if (dataMode !== 'live') return null;

  async function onRefresh() {
    if (!session?.loggedIn) {
      navigate('/login', { state: { reason: 'expired' } });
      return;
    }
    if ((await refresh()) === 'expired') {
      navigate('/login', { state: { reason: 'expired' } });
      return;
    }
    sawRunning.current = true;
    poll();
  }

  const running = !!session?.sync.running;
  const sources = Object.entries(session?.sync.sources ?? {}) as [SourceName, Session['sync']['sources'][SourceName]][];
  // After the reload, show the sources that failed in the last sync (they show saved data).
  const shown = running ? sources : sources.filter(([, s]) => s.state === 'failed' || s.state === 'kept');

  return (
    <section className="sync-bar" aria-live="polite">
      <div className="sync-bar__row">
        <span className="sync-bar__updated">
          {dataFetchedAt ? `Updated: ${fmt.format(new Date(dataFetchedAt))}` : 'No saved data yet'}
        </span>
        {/* Hidden until the session state is known, so it never flashes "Sign in to refresh" by mistake */}
        {session && (
          <button type="button" className="sync-bar__button" onClick={onRefresh} disabled={running}>
            {running ? 'Refreshing…' : session.loggedIn ? 'Refresh' : 'Sign in to refresh'}
          </button>
        )}
      </div>
      {shown.length > 0 && (
        <ul className="sync-bar__sources">
          {shown.map(([name, s]) => (
            <li key={name} className={`sync-bar__source sync-bar__source--${s.state}`} title={s.error ?? undefined}>
              {SOURCE_LABELS[name]} {ICON[s.state]}
              {s.state === 'kept' && <span className="sync-bar__note"> saved data</span>}
            </li>
          ))}
        </ul>
      )}
      {session?.sync.error && !running && <p className="sync-bar__error">Refresh failed: {session.sync.error}. Showing saved data.</p>}
    </section>
  );
}
