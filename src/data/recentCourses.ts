import type { Course } from './types';

/**
 * Remembers the last visited courses (in this browser only) for the "My Courses" cards.
 * The course page calls `markCourseVisited(course.id)` when it opens.
 */
const KEY = 'dtu-app.recentCourses';

function readIds(): string[] {
  try {
    const ids = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function markCourseVisited(id: string) {
  const ids = [id, ...readIds().filter((x) => x !== id)].slice(0, 10);
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // storage blocked (private mode): just don't remember
  }
}

/** The `count` most recently visited courses, topped up with active courses if fewer were visited. */
export function recentCourses(courses: Course[], count = 2): Course[] {
  const byId = new Map(courses.map((c) => [c.id, c]));
  const visited = readIds()
    .map((id) => byId.get(id))
    .filter((c): c is Course => c !== undefined);
  const fill = courses.filter((c) => c.isActive && !visited.includes(c));
  return [...visited, ...fill].slice(0, count);
}
