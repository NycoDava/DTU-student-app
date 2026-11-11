import type { Grade } from '../data/types';

/** Danish 7-point scale, best first (labels as written on the transcript). */
export const GRADE_SCALE = ['12', '10', '7', '4', '02', '00', '-3'] as const;

/** Numeric value of a 7-point grade, or null for pass/fail marks like "IB" / "BE". */
export function gradeValue(grade: string): number | null {
  return (GRADE_SCALE as readonly string[]).includes(grade.trim()) ? Number(grade) : null;
}

/** A grade counts in the GPA if it is passed, numeric and has ECTS. */
function counts(g: Grade): boolean {
  return g.passed && gradeValue(g.grade) !== null && g.ects > 0;
}

function sums(grades: Grade[]) {
  let points = 0;
  let ects = 0;
  for (const g of grades.filter(counts)) {
    points += (gradeValue(g.grade) as number) * g.ects;
    ects += g.ects;
  }
  return { points, ects };
}

/** ECTS-weighted mean of the passed numeric grades. null = no grade counts yet. */
export function computeGpa(grades: Grade[]): number | null {
  const { points, ects } = sums(grades);
  return ects > 0 ? points / ects : null;
}

export type ExpectedGpaResult = { ok: true; gpa: number } | { ok: false; error: string };

/** GPA after one more course with grade G and E ECTS: (sum(grade*ects) + G*E) / (sum(ects) + E). */
export function expectedGpa(grades: Grade[], expectedGrade: string, expectedEcts: number): ExpectedGpaResult {
  const g = gradeValue(expectedGrade);
  if (g === null) return { ok: false, error: 'Choose an expected grade.' };
  if (!Number.isFinite(expectedEcts) || expectedEcts <= 0) {
    return { ok: false, error: 'Expected ECTS must be a number greater than 0.' };
  }
  const { points, ects } = sums(grades);
  return { ok: true, gpa: (points + g * expectedEcts) / (ects + expectedEcts) };
}

/** "v25" → winter 2025, "s26" → spring 2026. Sortable key: spring before winter in the same year. */
export function periodKey(period: string): number {
  const m = /^([sv])(\d{2})$/i.exec(period.trim());
  if (!m) return Number.MAX_SAFE_INTEGER;
  return (2000 + Number(m[2])) * 2 + (m[1].toLowerCase() === 'v' ? 1 : 0);
}

export function periodLabel(period: string): string {
  const m = /^([sv])(\d{2})$/i.exec(period.trim());
  if (!m) return period.toUpperCase();
  return `${m[1].toLowerCase() === 'v' ? 'WINTER' : 'SPRING'} ${2000 + Number(m[2])}`;
}

/** Grades in time order. The data has no exact exam date: by period, then course code. */
export function sortGrades(grades: Grade[]): Grade[] {
  return [...grades].sort((a, b) => periodKey(a.period) - periodKey(b.period) || a.code.localeCompare(b.code));
}

/** The most recent grade (latest period; inside a period, the last one in the data order). */
export function lastGrade(grades: Grade[]): Grade | null {
  let best: Grade | null = null;
  for (const g of grades) if (!best || periodKey(g.period) >= periodKey(best.period)) best = g;
  return best;
}

export type GradePoint = {
  index: number;
  grade: Grade;
  /** Numeric grade if it counts in the GPA, else null. */
  value: number | null;
  /** True for failed / not numeric (IB...): drawn as a hollow dot at the bottom. */
  failed: boolean;
  /** GPA including every course up to this one (null before the first counted grade). */
  gpa: number | null;
};

/** One point per course, in time order, with the running GPA. */
export function gradeTimeline(grades: Grade[]): GradePoint[] {
  let points = 0;
  let ects = 0;
  return sortGrades(grades).map((grade, index) => {
    const ok = counts(grade);
    if (ok) {
      points += (gradeValue(grade.grade) as number) * grade.ects;
      ects += grade.ects;
    }
    return {
      index,
      grade,
      value: ok ? (gradeValue(grade.grade) as number) : null,
      failed: !ok,
      gpa: ects > 0 ? points / ects : null,
    };
  });
}
