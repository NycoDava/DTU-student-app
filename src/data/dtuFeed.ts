import { useEffect, useState } from 'react';
import type { DtuEvent, NewsItem } from './types';

/**
 * dtu.dk news and events from `public/data/app-data.json` (fetched once, shared by all DTU screens).
 * The rest of the app still uses the placeholder constants in appData.ts.
 */
type Feed = { news: NewsItem[]; events: DtuEvent[] };

let feedPromise: Promise<Feed> | null = null;

function loadFeed(): Promise<Feed> {
  feedPromise ??= fetch('/data/app-data.json')
    .then((res) => (res.ok ? res.json() : {}))
    .then((data: Partial<Feed>) => prepare(data.news ?? [], data.events ?? []))
    .catch(() => ({ news: [], events: [] }));
  return feedPromise;
}

const time = (iso: string) => new Date(iso).getTime();

function prepare(news: NewsItem[], events: DtuEvent[]): Feed {
  const now = Date.now();
  const sortedNews = [...news].sort((a, b) => time(b.publishedAt) - time(a.publishedAt));
  // Upcoming or still running events, soonest first. If none, show the latest ones (never an empty screen).
  const byStart = [...events].sort((a, b) => time(a.startsAt) - time(b.startsAt));
  const upcoming = byStart.filter((e) => time(e.endsAt ?? e.startsAt) >= now);
  return { news: sortedNews, events: upcoming.length > 0 ? upcoming : byStart.reverse() };
}

export function useDtuFeed() {
  const [feed, setFeed] = useState<Feed | null>(null);
  useEffect(() => {
    let alive = true;
    loadFeed().then((f) => alive && setFeed(f));
    return () => {
      alive = false;
    };
  }, []);
  return { news: feed?.news ?? [], events: feed?.events ?? [], loading: feed === null };
}
