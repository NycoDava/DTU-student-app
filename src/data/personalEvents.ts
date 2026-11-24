import { useMemo, useSyncExternalStore } from 'react';
import { agenda } from './appData';
import type { AgendaItem } from './types';

/**
 * Personal events the user adds in the calendar (special course, side project...). Saved in this browser only
 * (localStorage, author's decision 24 Nov 2026), merged into the agenda (Home, Calendar, Upcoming events).
 */
export type PersonalEvent = {
  id: string;
  title: string;
  /** Timed: ISO UTC. All-day: "YYYY-MM-DD" (one day). */
  startsAt: string;
  endsAt: string | null;
  isAllDay: boolean;
  location: string | null;
  courseCode: string | null;
  notes: string | null;
};

const KEY = 'dtu-app.personal-events';
const listeners = new Set<() => void>();

function load(): PersonalEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

let items: PersonalEvent[] = load();

function save(next: PersonalEvent[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode / storage blocked: keep the change for this session only
  }
  listeners.forEach((l) => l());
}

export function savePersonalEvent(e: Omit<PersonalEvent, 'id'> & { id?: string }) {
  if (e.id && items.some((p) => p.id === e.id)) save(items.map((p) => (p.id === e.id ? ({ ...e, id: e.id } as PersonalEvent) : p)));
  else save([...items, { ...e, id: `personal-${Date.now().toString(36)}` }]);
}

export function deletePersonalEvent(id: string) {
  save(items.filter((p) => p.id !== id));
}

export function getPersonalEvent(id: string): PersonalEvent | undefined {
  return items.find((p) => p.id === id);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePersonalEvents(): PersonalEvent[] {
  return useSyncExternalStore(subscribe, () => items);
}

const toAgendaItem = (p: PersonalEvent): AgendaItem => ({
  id: p.id,
  kind: 'event',
  source: 'personal',
  courseCode: p.courseCode,
  title: p.title,
  location: p.location,
  startsAt: p.startsAt,
  endsAt: p.endsAt,
  isAllDay: p.isAllDay,
  url: null,
  notes: p.notes,
});

/** The app agenda + personal events, sorted by start. Re-renders when a personal event changes. */
export function useAgenda(): AgendaItem[] {
  const personal = usePersonalEvents();
  return useMemo(
    () => [...agenda, ...personal.map(toAgendaItem)].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
    [personal],
  );
}
