import { myExams as findMyExams, type MyExam } from '../lib/schedule';
import type { AgendaItem, Announcement, Course, Deadline, Grade, LocalizedName, StudyAnnouncement, Studyplan, Summary } from './types';

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
/** DTU study announcements (not the course announcements), newest first. */
export let studyAnnouncements: StudyAnnouncement[] = [];
/** The user's upcoming exams (study plan + DTU exam timetable), soonest first. */
export let myExams: MyExam[] = [];

/** Who the data belongs to (from the sync, never from the code). */
export type Profile = {
  name: string | null;
  studentId: string | null;
  programme: string | null;
  /** Demo only: photo exported with `npm run demo-data -- --photo` (live mode reads it from the server). */
  photo: string | null;
};
export let profile: Profile = { name: null, studentId: null, programme: null, photo: null };

type RawGrade = Omit<Grade, 'title'> & { title: string | LocalizedName };
type RawPerson = { name?: string; username?: string; isMe?: boolean };

/** `profile` of the file; older files have none, then the "isMe" entry of a classlist gives name and username. */
function profileFrom(file: Record<string, unknown>): Profile {
  const p = (file.profile ?? {}) as Partial<Profile>;
  const lists = Object.values((file.classlists ?? {}) as Record<string, { people?: RawPerson[] }>);
  const me = lists.flatMap((cl) => cl.people ?? []).find((person) => person.isMe);
  return {
    name: p.name ?? me?.name ?? null,
    studentId: p.studentId ?? me?.username ?? null,
    programme: p.programme ?? null,
    photo: p.photo ?? null,
  };
}

export function initAppData(file: Record<string, unknown>) {
  const f = file as Partial<{
    summary: Summary;
    grades: RawGrade[];
    studyplan: Studyplan;
    courses: Course[];
    announcements: Announcement[];
    agenda: AgendaItem[];
    studyAnnouncements: StudyAnnouncement[];
  }>;
  profile = profileFrom(file);
  if (f.summary) summary = { ...summary, ...f.summary };
  if (f.studyplan) studyplan = { ...studyplan, ...f.studyplan };
  // Grade titles come in both languages from CampusNet: the UI is English.
  grades = (f.grades ?? []).map((g) => ({ ...g, title: typeof g.title === 'string' ? g.title : g.title.English }));
  courses = f.courses ?? [];
  announcements = [...(f.announcements ?? [])].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  studyAnnouncements = [...(f.studyAnnouncements ?? [])].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const passed = new Set(grades.filter((g) => g.passed).map((g) => g.code));
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Copenhagen' }).format(new Date());
  myExams = findMyExams(studyplan, passed).filter((e) => !e.date || e.date >= today);
  agenda = [...withoutCopies(f.agenda ?? []), ...examItems(myExams)].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}

/**
 * Duplicates out (author's decision): the Learn calendar also lists every assignment due date as an event (same course
 * and title as a deadline, within a day) → keep only the deadline. Manual events that the Learn calendar now has → drop.
 */
function withoutCopies(items: AgendaItem[]): AgendaItem[] {
  const key = (a: AgendaItem) => `${a.courseCode ?? ''}|${a.title.trim().toLowerCase()}`;
  const deadlines = new Map<string, number[]>();
  for (const d of items) if (d.kind === 'deadline') deadlines.set(key(d), [...(deadlines.get(key(d)) ?? []), Date.parse(d.startsAt)]);
  const learnEvents = items.filter((a) => a.kind === 'event' && a.source === 'learn');
  return items.filter((a) => {
    if (a.kind !== 'event') return true;
    // Learn calendar copy of an assignment deadline
    if ((deadlines.get(key(a)) ?? []).some((t) => Math.abs(t - Date.parse(a.startsAt)) <= 86_400_000)) return false;
    // Manual event (manual-events.json) for a slot the Learn calendar already has: same course, start within 30 min
    if (a.source === 'manual') {
      return !learnEvents.some((l) => l.courseCode === a.courseCode && Math.abs(Date.parse(l.startsAt) - Date.parse(a.startsAt)) <= 1_800_000);
    }
    return true;
  });
}

/** Exams with a date as all-day agenda items (calendar, Home, Upcoming events). */
function examItems(exams: MyExam[]): AgendaItem[] {
  return exams
    .filter((e) => e.date)
    .map((e) => ({
      id: `exam-${e.code}`,
      kind: 'exam' as const,
      source: 'studyplan',
      courseCode: e.code,
      title: `Exam${e.via && e.via !== e.code ? ` (${e.via})` : ''}`,
      location: null,
      startsAt: e.date!,
      endsAt: `${e.date}T22:59:59.000Z`, // end of the day in Copenhagen
      isAllDay: true,
      url: null,
    }));
}

/** "02830 Advanced project …, Fall 2026" for an agenda item / course code, from `courses`. */
export function courseLabel(courseCode: string | null): string | undefined {
  if (!courseCode) return undefined;
  const matches = courses.filter((c) => c.code === courseCode);
  // Prefer the newest run of the course.
  const learnName = matches.sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''))[0]?.name;
  if (learnName) return learnName;
  const exam = myExams.find((e) => e.code === courseCode);
  return exam ? `${exam.code} ${exam.name}` : undefined;
}

export type { Deadline };
