import { examPeriods, type ExamDay } from '../data/examDates';

/**
 * DTU schedule groups (Studyplanner "Show schedule", Figma 273:425). A 13-week course sits in one weekly slot:
 * autumn = E1A…E7, spring = F1A…F7. The same slot decides the exam day in the DTU exam timetable (examDates.ts).
 */
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export const TIMES = ['8-12', '13-17', '18-22'] as const;

/** Slot of each cell [time][day], without the season letter. null = no slot. */
const GRID: (string | null)[][] = [
  ['1A', '3A', '5A', '2B', '4B'],
  ['2A', '4A', '5B', '1B', '3B'],
  [null, '7', null, null, null],
];

export type Season = 'E' | 'F';

/** Slot codes of the week grid for a season: grid[time][day] = "E1A" | null. */
export const slotGrid = (season: Season) => GRID.map((row) => row.map((s) => (s ? season + s : null)));

/** "E5B" / "e5-b" / "E 5 B" → "E5B". Anything else (e.g. "January") → null. */
export function normalizeGroup(group: string): string | null {
  const m = /^\s*([EF])\s*(\d)\s*-?\s*([AB])?\s*$/i.exec(group);
  return m ? `${m[1].toUpperCase()}${m[2]}${(m[3] ?? '').toUpperCase()}` : null;
}

const fmtExam = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export type ExamMatch = { date: string; label: string; via: string };

/**
 * Exam day of a course in the DTU exam timetable: first by course number (some courses are listed by number),
 * then by schedule group ("E5B" → "E5-B", "E7" → "E7"). Autumn courses → winter exam of that year,
 * spring courses → ordinary summer exam. 3-week courses (January/June) are not in the table: null.
 */
export function examFor(code: string | null, groups: string[], season: Season, year: number): ExamMatch | null {
  const period = examPeriods.find((p) =>
    season === 'E' ? p.title.startsWith(`Winter exam December ${year}`) : p.title.startsWith('Ordinary summer exam') && p.title.endsWith(String(year)),
  );
  if (!period) return null;
  const has = (day: ExamDay, token: string) => day.courses.some((line) => new RegExp(`(^|[^\w-])${token}([^\w-]|$)`, 'i').test(line));
  const done = (day: ExamDay, via: string) => ({ date: day.date, label: fmtExam.format(new Date(`${day.date}T00:00:00Z`)), via });

  if (code) {
    const byCode = period.exams.find((d) => has(d, code));
    if (byCode) return done(byCode, code);
  }
  for (const g of groups) {
    const n = normalizeGroup(g);
    if (!n || n[0] !== season) continue;
    const token = n.length === 3 ? `${n.slice(0, 2)}-${n[2]}` : n; // E5B → E5-B, E7 → E7
    const day = period.exams.find((d) => has(d, token));
    if (day) return done(day, token);
  }
  return null;
}
