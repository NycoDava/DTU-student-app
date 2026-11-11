import type { Grade, Studyplan } from '../data/types';

/**
 * "N activities planned / M activities completed": every course and activity placed in the study plan,
 * and how many of them already have a passed grade (matched by course code).
 */
export function activityCounts(plan: Studyplan, grades: Grade[]) {
  const passed = new Set(grades.filter((g) => g.passed).map((g) => g.code));
  let planned = 0;
  let completed = 0;
  for (const semester of plan.semesters) {
    for (const period of semester.periods) {
      planned += period.courses.length + period.activities.length;
      completed += period.courses.filter((c) => passed.has(c.code)).length;
    }
  }
  return { planned, completed };
}
