import type { Course, EctsByType } from './types';

/**
 * PLACEHOLDER until the Studyplanner data is plugged in.
 * TODO: replace with `summary.ectsPassed`, `summary.ectsRequired`, `studyplan.ectsByType` and `courses` from app-data.json.
 */
export const studyProgress: { completed: number; required: number; byType: EctsByType[] } = {
  completed: 0,
  required: 120,
  byType: [],
};

export const allCourses: Course[] = [];
