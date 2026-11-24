import SubHeader from '../components/SubHeader';
import Calendar from '../components/calendar/Calendar';
import { useEventDialogs } from '../components/calendar/EventDialogs';
import { useAgenda } from '../data/personalEvents';
import { dayKey } from '../data/format';
import './CalendarPage.css';

/**
 * Full calendar (route /calendar, opened from Home; after the usability tests, 24 Nov 2026): Day / Week / Month / List,
 * tap an item for its preview, tap an empty slot or "+" to add a personal event (saved on this device).
 */
export default function CalendarPage() {
  const items = useAgenda();
  const { openItem, openForm, dialogs } = useEventDialogs();

  return (
    <div className="calendar-page">
      <SubHeader title="Calendar" />
      <div className="calendar-page__body">
        <Calendar items={items} onItemClick={openItem} onEmptyClick={openForm} />
      </div>
      <button
        type="button"
        className="calendar-page__add"
        aria-label="Add event"
        onClick={() => openForm({ date: dayKey(new Date().toISOString()) })}
      >
        +
      </button>
      {dialogs}
    </div>
  );
}
