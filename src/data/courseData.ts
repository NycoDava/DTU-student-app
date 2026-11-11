import { useEffect, useState } from 'react';
import { loadAppFile } from './appFile';
import type { Announcement, Classlist, ContentModule, Course, Deadline } from './types';

/** Course-related parts of app-data.json (My courses + course page). */
export type CourseData = {
  courses: Course[];
  courseContent: Record<string, ContentModule[]>;
  deadlines: Deadline[];
  announcements: Announcement[];
  classlists: Record<string, Classlist>;
};

const EMPTY: CourseData = { courses: [], courseContent: {}, deadlines: [], announcements: [], classlists: {} };

let dataPromise: Promise<CourseData> | null = null;

function load(): Promise<CourseData> {
  dataPromise ??= loadAppFile().then((file) => ({ ...EMPTY, ...(file as Partial<CourseData>) }));
  return dataPromise;
}

export function useCourseData() {
  const [data, setData] = useState<CourseData | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);
  return { ...(data ?? EMPTY), loading: data === null };
}

/** Banner picture: the scraper stores "course_images/<id>.jpg"; the app serves the file from /course-images/. */
export function courseImageSrc(course: Course): string | null {
  if (!course.localImage) return null;
  return '/course-images/' + course.localImage.split('/').pop();
}

/** Learn announcements are HTML-escaped text ("&#160;"): decode to plain text (never rendered as HTML). */
export function plainText(html: string): string {
  return new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() ?? '';
}
