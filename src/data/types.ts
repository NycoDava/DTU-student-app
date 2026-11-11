/** Types for the parts of `public/data/app-data.json` used so far (see CLAUDE.md for the full schema). */

export type AgendaItem = {
  id: string;
  kind: 'event' | 'deadline';
  source: string;
  courseCode: string | null;
  title: string;
  location: string | null;
  startsAt: string; // ISO, UTC
  endsAt: string | null;
  isAllDay: boolean;
  url: string | null;
};

export type Announcement = {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  title: string;
  preview: string;
  text: string;
  createdAt: string; // ISO, UTC
  isPinned: boolean;
  url: string | null;
};

export type Course = {
  id: string;
  code: string;
  term: string;
  name: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  /** File name downloaded by the scraper; served from /course-images/<file name>. */
  localImage: string | null;
  url: string | null;
};

/** One slice of the ECTS pie (`studyplan.ectsByType`). */
export type EctsByType = {
  typeId: string;
  name: string;
  color: string;
  expected: number;
  completed: number;
  planned: number;
};

export type Summary = {
  gpa: number;
  ectsPassed: number;
  /** Planned ECTS still to take (not a total). */
  ectsPlanned: number;
  ectsRequired: number;
  coursesCount: number;
  nextDeadline: string | null;
};

export type Grade = {
  code: string;
  title: string;
  ects: number;
  /** "12", "10", "7", "4", "02", "00", "-3", or "IB", "BE", ... */
  grade: string;
  passed: boolean;
  /** Exam period, e.g. "v25" (winter 2025), "s26" (summer/spring 2026). */
  period: string;
};

export type StudyplanCourse = { code: string; name: string; ects: number; scheduleGroup: string | null };
export type StudyplanActivity = { name: string; ects: number };

export type Studyplan = {
  requiredEcts: number;
  semesters: {
    number: number;
    year: number;
    periods: { type: string; year: number; courses: StudyplanCourse[]; activities: StudyplanActivity[] }[];
  }[];
  basket: StudyplanCourse[];
  ectsByType: EctsByType[];
  uncategorized: number;
};
