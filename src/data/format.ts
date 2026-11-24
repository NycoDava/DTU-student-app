/** Date helpers. Data is UTC; everything is shown in Copenhagen time, 24h clock. */
const TZ = 'Europe/Copenhagen';

const monthFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, month: 'short' });
const dayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });

/** "Nov" */
export const formatMonth = (iso: string) => monthFmt.format(new Date(iso));
/** "4" */
export const formatDay = (iso: string) => dayFmt.format(new Date(iso));
/** "13:00" */
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));

const longDateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: '2-digit', month: 'long', year: 'numeric' });
/** "23 September 2026, 23:59" */
export const formatLongDateTime = (iso: string) => `${longDateFmt.format(new Date(iso))}, ${formatTime(iso)}`;

const keyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });

/** Copenhagen calendar day of an ISO time, "2026-11-24". A plain date ("2026-11-24", all-day items) stays as it is. */
export const dayKey = (iso: string) => (iso.length <= 10 ? iso : keyFmt.format(new Date(iso)));

/** "14:30" in Copenhagen (for <input type="time">). */
export const timeKey = (iso: string) => formatTime(iso);

/** Copenhagen wall time ("2026-11-24", "14:30") → ISO UTC, DST-safe. */
export function copenhagenToIso(date: string, time: string): string {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  // Offset of Copenhagen at that moment: its wall time read back as if it were UTC, minus the UTC time
  const wall = new Date(guess).toLocaleString('sv-SE', { timeZone: TZ }).replace(' ', 'T') + 'Z';
  const offset = Date.parse(wall) - guess;
  return new Date(guess - offset).toISOString();
}

/** Adds days to a "YYYY-MM-DD" key. */
export function addDays(key: string, n: number): string {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
