import type { VenueInfo } from '../data/venueInfo';

/**
 * "Open now" for an eat@DTU venue, from its DTU opening hours ("Monday to Friday" + "11.00 - 14.00").
 * Times are Copenhagen time. Returns what the venue card shows:
 *   open → "Open · until 14:00", closed but opening later today → "Opens 11:00", otherwise "Closed".
 */
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** "Monday to Friday" -> [0..4], "Friday" -> [4]. */
function dayRange(text: string): number[] {
  const m = /^(\w+)(?:\s+to\s+(\w+))?$/i.exec(text.trim());
  if (!m) return [];
  const from = DAY_NAMES.indexOf(m[1]);
  const to = m[2] ? DAY_NAMES.indexOf(m[2]) : from;
  if (from < 0 || to < 0) return [];
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/** "08.00 - 15.00 (lunch 11.00 - 14.00)" -> minutes [480, 900] (the first range). */
function timeRange(text: string): [number, number] | null {
  const m = /(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})/.exec(text);
  if (!m) return null;
  return [Number(m[1]) * 60 + Number(m[2]), Number(m[3]) * 60 + Number(m[4])];
}

const clock = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export type VenueStatus = { open: boolean; label: string };

export function venueStatus(info: VenueInfo, now: Date = new Date()): VenueStatus {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Copenhagen', weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const day = DAY_NAMES.indexOf(parts.weekday);
  const minutes = (Number(parts.hour) % 24) * 60 + Number(parts.minute);

  for (const h of info.hours) {
    if (!dayRange(h.days).includes(day)) continue;
    const range = timeRange(h.time);
    if (!range) continue;
    if (minutes >= range[0] && minutes < range[1]) return { open: true, label: `Open · until ${clock(range[1])}` };
    if (minutes < range[0]) return { open: false, label: `Opens ${clock(range[0])}` };
  }
  return { open: false, label: 'Closed' };
}
