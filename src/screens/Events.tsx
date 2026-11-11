import { useState } from 'react';
import SubHeader from '../components/SubHeader';
import AgendaCard from '../components/AgendaCard';
import type { AgendaItem } from '../data/types';
import { agenda, courseLabel } from '../data/appData';

type Tab = 'all' | 'deadline' | 'event';
const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'deadline', label: 'Deadlines' },
  { key: 'event', label: 'Activities' },
];

/** Agenda items from now on, ascending, filtered by tab. If none are left, the latest past ones (never empty). */
function upcoming(items: AgendaItem[], tab: Tab): AgendaItem[] {
  const now = Date.now();
  const ofTab = items.filter((i) => tab === 'all' || i.kind === tab);
  const future = ofTab.filter((i) => Date.parse(i.endsAt ?? i.startsAt) >= now);
  return future.length > 0 ? future : ofTab.slice(-5).reverse();
}

export default function Events() {
  const [tab, setTab] = useState<Tab>('all');
  const items = upcoming(agenda, tab);

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
              <AgendaCard item={item} courseLabel={courseLabel(item.courseCode)} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
