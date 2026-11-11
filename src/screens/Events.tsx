import { useState } from 'react';
import SubHeader from '../components/SubHeader';
import AgendaCard from '../components/AgendaCard';
import type { AgendaItem } from '../data/types';

type Tab = 'all' | 'deadline' | 'event';
const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'deadline', label: 'Deadlines' },
  { key: 'event', label: 'Activities' },
];

// TODO: replace with `agenda` from app-data.json once the data is plugged in.
const AGENDA: AgendaItem[] = [];

/** Agenda items from now on, ascending, filtered by tab. */
function upcoming(items: AgendaItem[], tab: Tab): AgendaItem[] {
  const now = Date.now();
  return items
    .filter((i) => (tab === 'all' || i.kind === tab) && Date.parse(i.endsAt ?? i.startsAt) >= now)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}

export default function Events() {
  const [tab, setTab] = useState<Tab>('all');
  const items = upcoming(AGENDA, tab);

  return (
    <div className="sub-screen">
      <SubHeader title="Upcoming Events" />

      <div className="sub-tabs" role="tablist" aria-label="Filter">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={'sub-tabs__tab' + (tab === t.key ? ' sub-tabs__tab--active' : '')}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="sub-list">
        {items.length === 0 ? (
          <li className="sub-card sub-card--empty">
            {tab === 'deadline' ? 'No upcoming deadlines' : 'No upcoming activities'}
          </li>
        ) : (
          items.map((item) => (
            <li key={item.id}>
              <AgendaCard item={item} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
