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
  nextDeadline: Deadline | null;
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

/** Studyplanner names come in both languages. */
export type LocalizedName = { English: string; Danish: string };

export type StudyplanCourse = { code: string; name: LocalizedName; ects: number; scheduleGroup: string | null };
export type StudyplanActivity = { name: LocalizedName; ects: number };

/** One period of a semester. `type` 3 = 13-week period, 4 = 3-week period (January / June). */
export type StudyplanPeriod = {
  type: number;
  year: number;
  courses: StudyplanCourse[];
  activities: StudyplanActivity[];
};

export type BasketItem =
  | ({ kind: 'course' } & StudyplanCourse)
  | ({ kind: 'activity'; scheduleGroup?: string | null } & StudyplanActivity);

export type Studyplan = {
  requiredEcts: number;
  semesters: { number: number; year: number; periods: StudyplanPeriod[] }[];
  basket: BasketItem[];
  ectsByType: EctsByType[];
  /** ECTS not assigned to any course type. */
  uncategorized: { completed: number; planned: number };
};

/** `news[]`: dtu.dk news. */
export type NewsItem = {
  id: string;
  title: string;
  url: string;
  teaser: string;
  publishedAt: string;
  imageUrl: string | null;
  badge: string | null;
};

/** `events[]`: dtu.dk calendar events. */
export type DtuEvent = {
  id: string;
  title: string;
  url: string;
  teaser: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  organizers: string | null;
  imageUrl: string | null;
  subjects: string[];
};

/** One file / link inside a Learn content module (`courseContent[courseId]`). */
export type ContentTopic = {
  id: number;
  title: string;
  kind: 'File' | 'Link' | 'ContentService';
  url: string | null;
  /** Relative to the scraper folder ("files/02830/…"); served from /files/… when the author copies it. */
  localPath: string | null;
  bytes: number | null;
};

export type ContentModule = { title: string; topics: ContentTopic[]; modules: ContentModule[] };

export type Deadline = {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  title: string;
  dueAt: string; // ISO, UTC
  isGroup: boolean;
  url: string | null;
};

export type Person = {
  id: string;
  name: string;
  email: string | null;
  username: string | null;
  role: string;
  isMe: boolean;
};

export type Classlist = {
  ok: boolean;
  myId: string | null;
  myRoleId: string | null;
  people: Person[];
  group: { category: string; name: string; members: number; maxMembers: number } | null;
};

/** DTU study announcement (student.dtu.dk, shown by the "Study Announcements" widget on the Learn home page). */
export type StudyAnnouncement = {
  id: string; // "s1924"
  title: string; // "Study announcement s1924: Registration for the 3-week period January 2027"
  url: string | null;
  publishedAt: string; // ISO, UTC
  teaser: string;
  text: string; // plain text with paragraph breaks
};
