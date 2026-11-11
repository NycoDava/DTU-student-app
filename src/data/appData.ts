import type { Course, Grade, Studyplan, Summary } from './types';

/**
 * PLACEHOLDER app data: everything empty / zero until the real `public/data/app-data.json` is plugged in.
 * TODO: replace these constants with the loaded file. Screens only read from here, so nothing else changes.
 */
export const summary: Summary = {
  gpa: 0,
  ectsPassed: 0,
  ectsPlanned: 0,
  ectsRequired: 120,
  coursesCount: 0,
  nextDeadline: null,
};

export const grades: Grade[] = [];

export const studyplan: Studyplan = {
  requiredEcts: 120,
  semesters: [],
  basket: [],
  ectsByType: [],
  uncategorized: 0,
};

export const courses: Course[] = [];
