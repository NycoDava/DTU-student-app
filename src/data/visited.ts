import { useCallback, useState } from 'react';

/**
 * Modules and files the user has opened in this app, per course (Figma shows a check on them).
 * Learn has no completion data in app-data.json, so this lives in the browser only. Storage may be blocked: never throw.
 */
function read(courseId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(`visited:${courseId}`) ?? '[]');
  } catch {
    return [];
  }
}

export function useVisited(courseId: string) {
  const [keys, setKeys] = useState<string[]>(() => read(courseId));

  const mark = useCallback(
    (key: string) =>
      setKeys((prev) => {
        if (prev.includes(key)) return prev;
        const next = [...prev, key];
        try {
          localStorage.setItem(`visited:${courseId}`, JSON.stringify(next));
        } catch {
          /* private mode: the check just won't persist */
        }
        return next;
      }),
    [courseId],
  );

  return { has: (key: string) => keys.includes(key), mark };
}
