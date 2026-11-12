import type { Grade, Studyplan } from '../data/types';

/**
 * "N activities planned / M activities completed".
 * Completed = passed grades. Planned = courses and activities placed in the study plan that are not passed yet
 * (the Studyplanner export only lists future placements; passed courses come from the grades).
 */
export function activityCounts(plan: Studyplan, grades: Grade[]) {
  const passed = new Set(grades.filter((g) => g.passed).map((g) => g.code));
  let planned = 0;
  for (const semester of plan.semesters) {
    for (const period of semester.periods) {
      planned += period.courses.filter((c) => !passed.has(c.code)).length + period.activities.length;
    }
  }
  return { planned, completed: passed.size };
}

// ---------------------------------------------------------------------------------------------------------------
// Studyplanner board: years -> semesters ("terms") -> periods -> items. See docs/screens.md "Study planner".
// ---------------------------------------------------------------------------------------------------------------

/** Where an item sits: a period key (e.g. "s3-13w") or the basket. */
export const BASKET = 'basket';

export type PlanItem = {
  id: string;
  code: string | null;
  name: string;
  ects: number;
  /** Schedule group ("E5B") or the short period name ("JAN") for 3-week periods. */
  placement: string | null;
  /** Grade text when the course is passed ("12", "BE"...). */
  grade: string | null;
  /** Passed courses and courses in past periods cannot be moved. */
  locked: boolean;
};

export type PeriodStatus = 'past' | 'current' | 'future';

export type PlanPeriod = {
  key: string;
  semester: number;
  /** "13 weeks autumn 2026", "January 2027" */
  label: string;
  /** Title of the completed view: "Winter exam 2025/2026", "January exam 2026" */
  examLabel: string;
  shortName: string | null;
  start: Date;
  end: Date;
  status: PeriodStatus;
};

export type PlanYear = { number: number; label: string; semesters: { number: number; periods: PlanPeriod[] }[] };


function utc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day));
}

/**
 * The two periods of a semester. Odd semesters start in autumn, even ones in spring.
 * `firstYear` = calendar year in which the programme starts (September).
 */
function semesterPeriods(semester: number, firstYear: number, today: Date): PlanPeriod[] {
  const autumn = semester % 2 === 1;
  const y = firstYear + Math.floor((semester - 1) / 2); // year of the autumn that opens this year of study
  const raw = autumn
    ? [
        { kind: '13w', label: `13 weeks autumn ${y}`, exam: `Winter exam ${y}/${y + 1}`, short: null, start: utc(y, 8, 1), end: utc(y + 1, 0, 1) },
        { kind: '3w', label: `January ${y + 1}`, exam: `January exam ${y + 1}`, short: 'JAN', start: utc(y + 1, 0, 1), end: utc(y + 1, 1, 1) },
      ]
    : [
        { kind: '13w', label: `13 weeks spring ${y + 1}`, exam: `Spring exam ${y}/${y + 1}`, short: null, start: utc(y + 1, 1, 1), end: utc(y + 1, 5, 1) },
        { kind: '3w', label: `June ${y + 1}`, exam: `June exam ${y + 1}`, short: 'JUN', start: utc(y + 1, 5, 1), end: utc(y + 1, 7, 1) },
      ];
  return raw.map((p) => ({
    key: `s${semester}-${p.kind}`,
    semester,
    label: p.label,
    examLabel: p.exam,
    shortName: p.short,
    start: p.start,
    end: p.end,
    status: today >= p.end ? 'past' : today >= p.start ? 'current' : 'future',
  }));
}

/** Grade period "v25" (winter 2025) / "s26" (summer 2026) -> key of the 13-week period it belongs to. */
function gradePeriodKey(period: string, firstYear: number): string | null {
  const m = /^([vs])(\d{2})$/.exec(period);
  if (!m) return null;
  const year = 2000 + Number(m[2]);
  const semester = m[1] === 'v' ? (year - firstYear) * 2 + 1 : (year - firstYear) * 2;
  return semester >= 1 ? `s${semester}-13w` : null;
}

export type PlanBoard = {
  years: PlanYear[];
  periods: PlanPeriod[];
  items: Record<string, PlanItem>;
  /** Where each item is when nothing was moved. */
  defaultPlace: Record<string, string>;
};

/**
 * Builds the board from the study plan + grades. When `studyplan.semesters` is empty (placeholder data),
 * the semesters come from the programme (start year + number of semesters), so every period shows up empty.
 */
export function buildBoard(
  plan: Studyplan,
  grades: Grade[],
  programme: { startYear: number; semesters: number },
  today = new Date(),
): PlanBoard {
  const firstYear = plan.semesters[0]?.year ?? programme.startYear;
  const count = plan.semesters.length || programme.semesters;
  const passed = new Map(grades.filter((g) => g.passed).map((g) => [g.code, g]));

  const years: PlanYear[] = [];
  const periods: PlanPeriod[] = [];
  for (let s = 1; s <= count; s++) {
    const yearNo = Math.ceil(s / 2);
    let year = years.find((y) => y.number === yearNo);
    if (!year) {
      const y = firstYear + yearNo - 1;
      year = { number: yearNo, label: `Year of study ${yearNo} September ${y} - 31 August ${y + 1}`, semesters: [] };
      years.push(year);
    }
    const ps = semesterPeriods(s, firstYear, today);
    year.semesters.push({ number: s, periods: ps });
    periods.push(...ps);
  }

  const items: Record<string, PlanItem> = {};
  const defaultPlace: Record<string, string> = {};
  const add = (item: PlanItem, place: string) => {
    let id = item.id;
    for (let n = 2; items[id]; n++) id = `${item.id}#${n}`; // same activity name twice ("elective course")
    items[id] = { ...item, id };
    defaultPlace[id] = place;
  };

  // Planned courses and activities, as placed in the official Studyplanner.
  for (const semester of plan.semesters) {
    semester.periods.forEach((p) => {
      const period = periods.find((x) => x.key === `s${semester.number}-${p.type === 4 ? '3w' : '13w'}`);
      if (!period) return;
      for (const c of p.courses) {
        const g = passed.get(c.code);
        add(
          { id: c.code, code: c.code, name: c.name.English, ects: c.ects, placement: c.scheduleGroup ?? period.shortName, grade: g?.grade ?? null, locked: !!g || period.status === 'past' },
          period.key,
        );
      }
      for (const a of p.activities) {
        add({ id: a.name.English, code: null, name: a.name.English, ects: a.ects, placement: period.shortName, grade: null, locked: period.status === 'past' }, period.key);
      }
    });
  }

  // Projects of an exam period (e.g. a 10 ECTS special course): in the 13-week period of their semester.
  for (const pr of plan.projects ?? []) {
    const period = periods.find((x) => x.key === `s${pr.semester}-13w`);
    if (!period) continue;
    add({ id: `project-${pr.id}`, code: null, name: pr.name, ects: pr.ects, placement: 'Project', grade: null, locked: period.status === 'past' }, period.key);
  }

  // Passed courses that the plan does not place: put them in the period of their exam.
  for (const g of passed.values()) {
    if (items[g.code]) continue;
    const key = gradePeriodKey(g.period, firstYear);
    if (key && periods.some((p) => p.key === key)) {
      add({ id: g.code, code: g.code, name: g.title, ects: g.ects, placement: null, grade: g.grade, locked: true }, key);
    }
  }

  for (const b of plan.basket) {
    const code = b.kind === 'course' ? b.code : null;
    add({ id: code ?? b.name.English, code, name: b.name.English, ects: b.ects, placement: b.scheduleGroup ?? null, grade: null, locked: false }, BASKET);
  }

  return { years, periods, items, defaultPlace };
}

/** Final place of every item: saved moves win, but only into periods that are not past and only for movable items. */
export function placeItems(board: PlanBoard, moves: Record<string, string>): Record<string, string> {
  const open = new Set(board.periods.filter((p) => p.status !== 'past').map((p) => p.key));
  open.add(BASKET);
  const place: Record<string, string> = { ...board.defaultPlace };
  for (const [id, target] of Object.entries(moves)) {
    if (board.items[id] && !board.items[id].locked && open.has(target)) place[id] = target;
  }
  return place;
}
