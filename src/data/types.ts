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
