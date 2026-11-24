import { hasLiveServer } from './liveServer';

/**
 * The one data file of the app, fetched once and shared by every hook that needs it.
 * - Local server running: the data saved by its last sync (real data, survives an expired session).
 * - Otherwise (static build, server off): the anonymized demo file `public/data/app-data.json`.
 * Resolves to `{}` if nothing loads, so screens show their empty states instead of crashing.
 */
export type DataMode = 'live' | 'demo';
export let dataMode: DataMode = 'demo';
/** When the shown data was collected (ISO), for "Updated: …". */
export let dataFetchedAt: string | null = null;

let filePromise: Promise<Record<string, unknown>> | null = null;

const getJson = (url: string) =>
  fetch(url, { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

async function load(): Promise<Record<string, unknown>> {
  if (await hasLiveServer()) {
    dataMode = 'live';
    const saved = await getJson('/api/local/data');
    if (saved) {
      dataFetchedAt = saved.fetchedAt ?? saved.collectedAt ?? null;
      return saved;
    }
    // Live mode without saved data (first run of a new user): empty screens until the first sync, never the demo
    // file (it holds the author's data).
    return {};
  }
  const demo = (await getJson('/data/app-data.json')) ?? {};
  dataFetchedAt = dataFetchedAt ?? demo.fetchedAt ?? demo.collectedAt ?? null;
  return demo;
}

export function loadAppFile(): Promise<Record<string, unknown>> {
  filePromise ??= load();
  return filePromise;
}
