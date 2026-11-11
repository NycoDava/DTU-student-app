import type { AgendaItem, Announcement, Course, Deadline, Grade, LocalizedName, Studyplan, Summary } from './types';

/**
 * App data from `public/data/app-data.json`. main.tsx calls `initAppData()` with the loaded file BEFORE the first
 * render, so screens can read these exports synchronously. Until then (or if the file is missing) they are empty.
 */
export let summary: Summary = {
  gpa: 0,
  ectsPassed: 0,
  ectsPlanned: 0,
  ectsRequired: 120,
  coursesCount: 0,
  nextDeadline: null,
};

export let grades: Grade[] = [];

export let studyplan: Studyplan = {
  requiredEcts: 120,
  semesters: [],
  basket: [],
  ectsByType: [],
  uncategorized: { completed: 0, planned: 0 },
};

export let courses: Course[] = [];
export let announcements: Announcement[] = [];
export let agenda: AgendaItem[] = [];

type RawGrade = Omit<Grade, 'title'> & { title: string | LocalizedName };

export function initAppData(file: Record<string, unknown>) {
  const f = file as Partial<{
    summary: Summary;
    grades: RawGrade[];
    studyplan: Studyplan;
    courses: Course[];
    announcements: Announcement[];
    agenda: AgendaItem[];
  }>;
  if (f.summary) summary = { ...summary, ...f.summary };
  if (f.studyplan) studyplan = { ...studyplan, ...f.studyplan };
  // Grade titles come in both languages from CampusNet: the UI is English.
  grades = (f.grades ?? []).map((g) => ({ ...g, title: typeof g.title === 'string' ? g.title : g.title.English }));
  courses = f.courses ?? [];
  announcements = [...(f.announcements ?? [])].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  agenda = [...(f.agenda ?? [])].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}

/** "02830 Advanced project …, Fall 2026" for an agenda item / course code, from `courses`. */
export function courseLabel(courseCode: string | null): string | undefined {
  if (!courseCode) return undefined;
  const matches = courses.filter((c) => c.code === courseCode);
  // Prefer the newest run of the course.
  return matches.sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''))[0]?.name;
}

export type { Deadline };
