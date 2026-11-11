import { useEffect, useState } from 'react';

/**
 * Live DTU Library occupancy from the public API behind smartlibrary.ait.dtu.dk (`LINKS.smartLibrary`).
 * The API sends no CORS headers, so the browser calls `/api/smartlibrary` on our own server and Vite forwards it
 * (proxy in vite.config.ts, works with `npm run dev` and `npm run preview`). On a plain static host there is no
 * proxy: then the last real reading below (SNAPSHOT) is shown, marked as not live.
 */
export type SeatCount = { free: number; occupied: number };

export type LibraryStatus = {
  /** People inside now (door counter). */
  peopleNow: number;
  /** Max people allowed in the building. */
  capacity: number;
  /** Entries since the counter was reset today. */
  visitedToday: number;
  /** Seats with a sensor. */
  seats: { total: SeatCount; first: SeatCount; second: SeatCount };
  /** ISO time of the reading. */
  updatedAt: string;
};

const API_PATH = '/api/smartlibrary';
const REFRESH_MS = 30_000;

/** Real reading of 2026-11-11 17:43, used only when the live API cannot be reached. */
const SNAPSHOT: LibraryStatus = {
  peopleNow: 566,
  capacity: 800,
  visitedToday: 3270,
  seats: { total: { free: 72, occupied: 96 }, first: { free: 39, occupied: 41 }, second: { free: 33, occupied: 55 } },
  updatedAt: '2026-11-11T17:43:15+01:00',
};

type ApiZone = { location: string; currently_occupied: number; currently_freeSpaces: number };
type ApiResponse = {
  libraryPeopleCounter?: { occupancy: number; total: number; total_in: number; timestamp: string };
  occupancyApiResponse?: { data?: ApiZone[] };
};

function parse(json: ApiResponse): LibraryStatus | null {
  const counter = json.libraryPeopleCounter;
  const zones = json.occupancyApiResponse?.data ?? [];
  const zone = (name: string): SeatCount | null => {
    const z = zones.find((x) => x.location === name);
    return z ? { free: z.currently_freeSpaces, occupied: z.currently_occupied } : null;
  };
  const total = zone('DTU Library');
  const first = zone('DTU Library 1. Floor');
  const second = zone('DTU Library 2. Floor');
  if (!counter || !total || !first || !second) return null;
  return {
    peopleNow: counter.occupancy,
    capacity: counter.total,
    visitedToday: counter.total_in,
    seats: { total, first, second },
    updatedAt: counter.timestamp,
  };
}

/** Library status, refreshed every 30 s and whenever the page becomes visible again. */
export function useLibraryStatus(): { status: LibraryStatus; live: boolean } {
  const [state, setState] = useState<{ status: LibraryStatus; live: boolean }>({ status: SNAPSHOT, live: false });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(API_PATH, { cache: 'no-store' });
        const status = res.ok ? parse(await res.json()) : null;
        if (!cancelled && status) setState({ status, live: true });
        else if (!cancelled) setState((s) => ({ ...s, live: false }));
      } catch {
        if (!cancelled) setState((s) => ({ ...s, live: false }));
      }
    }

    load();
    const timer = window.setInterval(load, REFRESH_MS);
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return state;
}

/** "17:43" in Copenhagen time. */
export function formatTime(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Copenhagen', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}
