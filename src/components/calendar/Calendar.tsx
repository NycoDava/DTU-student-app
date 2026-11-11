import { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { DatesSetArg, EventContentArg, EventInput } from '@fullcalendar/core';
import './Calendar.css';

/** Our segmented control → FullCalendar view names (see docs/screens.md, Calendar). */
const VIEWS = [
  { key: 'day', label: 'Day', fcView: 'timeGridDay' },
  { key: 'week', label: 'Week', fcView: 'timeGridWeek' },
  { key: 'month', label: 'Month', fcView: 'dayGridMonth' },
  { key: 'list', label: 'List', fcView: 'listWeek' },
] as const;

type ViewKey = (typeof VIEWS)[number]['key'];

/**
 * Events are FullCalendar EventInput objects. Set `extendedProps.kind` to "event" or "deadline"
 * to get the green-grey or mauve chip. Empty for now: agenda data is wired in later.
 */
type Props = { events?: EventInput[] };

const fmtDay = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtMonth = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });

/** Titles like the DTU Learn calendar: "23 October, 2026", "October 2026". */
function longDate(d: Date): string {
  const parts = fmtDay.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('day')} ${get('month')}, ${get('year')}`;
}

function titleFor(view: ViewKey, start: Date, end: Date): string {
  const last = new Date(end.getTime() - 1); // FullCalendar end is exclusive
  switch (view) {
    case 'day':
      return longDate(start);
    case 'week':
      return `${longDate(start)} - ${longDate(last)}`;
    case 'month': {
      // Month view starts in the previous month: use the middle of the range
      const mid = new Date((start.getTime() + end.getTime()) / 2);
      return fmtMonth.format(mid);
    }
    case 'list':
      return 'Upcoming events';
  }
}

function eventClassNames(arg: EventContentArg): string[] {
  return arg.event.extendedProps.kind === 'deadline' ? ['cal-event--deadline'] : ['cal-event--activity'];
}

export default function Calendar({ events = [] }: Props) {
  const calendarRef = useRef<FullCalendar>(null);
  const [view, setView] = useState<ViewKey>('week');
  const [title, setTitle] = useState('');

  const api = () => calendarRef.current?.getApi();

  function changeView(key: ViewKey) {
    const target = VIEWS.find((v) => v.key === key)!;
    setView(key);
    api()?.changeView(target.fcView);
  }

  function handleDatesSet(arg: DatesSetArg) {
    const key = VIEWS.find((v) => v.fcView === arg.view.type)?.key ?? 'week';
    setTitle(titleFor(key, arg.start, arg.end));
  }

  return (
    <div className="cal">
      <div className="cal-tabs" role="tablist" aria-label="Calendar view">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={view === v.key}
            className={`cal-tabs__tab cal-tabs__tab--${v.key}` + (view === v.key ? ' cal-tabs__tab--active' : '')}
            onClick={() => changeView(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="cal-box">
        <div className="cal-toolbar">
          <div className="cal-toolbar__nav">
            <button type="button" className="cal-toolbar__btn" aria-label="Previous" onClick={() => api()?.prev()}>
              ‹
            </button>
            <button type="button" className="cal-toolbar__btn" aria-label="Next" onClick={() => api()?.next()}>
              ›
            </button>
          </div>
          <button type="button" className="cal-toolbar__title" onClick={() => api()?.today()} title="Go to today">
            {title}
          </button>
        </div>

        <div className="cal-grid">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={false}
            height="100%"
            firstDay={1}
            locale="en-gb"
            events={events}
            eventClassNames={eventClassNames}
            datesSet={handleDatesSet}
            nowIndicator
            allDayText="all day"
            scrollTime="07:00:00"
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            dayHeaderFormat={{ weekday: 'short' }}
            dayMaxEvents={2}
            noEventsContent="No upcoming events"
            views={{
              timeGridDay: { dayHeaders: false },
              listWeek: { listDayFormat: { weekday: 'long', day: 'numeric', month: 'long' }, listDaySideFormat: false as const },
            }}
          />
        </div>
      </div>
    </div>
  );
}
