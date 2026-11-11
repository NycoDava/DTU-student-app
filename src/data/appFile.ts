/**
 * The one data file of the app (`public/data/app-data.json`), fetched once and shared by every hook that needs it.
 * Resolves to `{}` if the file is missing, so screens show their empty states instead of crashing.
 */
let filePromise: Promise<Record<string, unknown>> | null = null;

export function loadAppFile(): Promise<Record<string, unknown>> {
  filePromise ??= fetch('/data/app-data.json')
    .then((res) => (res.ok ? res.json() : {}))
    .catch(() => ({}));
  return filePromise;
}
