import { useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import type { DatesSetArg, EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import type { AgendaItem } from '../../data/types';
import { formatTime } from '../../data/format';
import type { FormTarget } from './EventForm';
import './Calendar.css';

/** Our segmented control → FullCalendar view names (see docs/screens.md, Calendar). */
const VIEWS = [
  { key: 'day', label: 'Day', fcView: 'timeGridDay' },
  { key: 'three', label: '3 days', fcView: 'timeGridThreeDay' },
  { key: 'week', label: 'Week', fcView: 'timeGridWeek' },
  { key: 'month', label: 'Month', fcView: 'dayGridMonth' },
] as const;

type ViewKey = (typeof VIEWS)[number]['key'];

const fmtDay = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtShort = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const fmtMonth = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });

function titleFor(view: ViewKey, start: Date, end: Date): string {
  const last = new Date(end.getTime() - 1); // FullCalendar end is exclusive
  switch (view) {
    case 'day':
      return fmtDay.format(start);
    case 'three':
    case 'week':
      return `${fmtShort.format(start)} – ${fmtShort.format(last)} ${last.getFullYear()}`;
    case 'month':
      // Month view starts in the previous month: use the middle of the range
      return fmtMonth.format(new Date((start.getTime() + end.getTime()) / 2));
  }
}

function eventClassNames(arg: EventContentArg): string[] {
  const { kind, source } = arg.event.extendedProps;
  return [
    kind === 'deadline' ? 'cal-event--deadline' : kind === 'exam' ? 'cal-event--exam' : 'cal-event--activity',
    ...(source === 'personal' ? ['cal-event--personal'] : []),
  ];
}

/**
 * Agenda → FullCalendar events. Exams (and all-day personal events) sit in the all-day row; deadlines are
 * 30-minute chips ending at the due time. No `url`: FullCalendar would render a real link, the preview opens it.
 */
function toEvents(items: AgendaItem[]): EventInput[] {
  return items.map((a) => {
    const isDeadline = a.kind === 'deadline';
    return {
      id: a.id,
      // Deadlines: due time in the title (FullCalendar's own time is hidden, the chip starts 30 min earlier)
      title: `${isDeadline ? `${formatTime(a.startsAt)} ` : ''}${a.courseCode && !a.title.startsWith(a.courseCode) ? `${a.courseCode} ${a.title}` : a.title}`,
      start: isDeadline ? new Date(Date.parse(a.startsAt) - 30 * 60_000).toISOString() : a.startsAt,
      end: isDeadline ? a.startsAt : (a.endsAt ?? undefined),
      allDay: a.isAllDay,
      extendedProps: { kind: a.kind, source: a.source },
    };
  });
}

type Props = {
  items: AgendaItem[];
  onItemClick: (item: AgendaItem) => void;
  /** Tap on an empty slot or day: new event prefilled with that time. */
  onEmptyClick: (target: FormTarget) => void;
};

/**
 * Full-screen calendar (page /calendar): Day / 3 days / Week / Month (List replaced by 3 days after the usability tests), 24 hours scrollable in Day/Week
 * (starts at 08:00), all-day row without label, shown only when the range has exams (author's decision 24 Nov 2026).
 */
export default function Calendar({ items, onItemClick, onEmptyClick }: Props) {
  const calendarRef = useRef<FullCalendar>(null);
  const [view, setView] = useState<ViewKey>('week');
  const [title, setTitle] = useState('');
  const [range, setRange] = useState<{ start: number; end: number } | null>(null);
  // The all-day row (exams) only when the visible range has an all-day item: otherwise it is an empty band
  const hasAllDay = items.some(
    (a) => a.isAllDay && range && Date.parse(a.startsAt) < range.end && Date.parse(a.endsAt ?? a.startsAt) + 86_400_000 > range.start,
  );
  const events = useMemo(() => toEvents(items), [items]);
  const byId = useMemo(() => new Map(items.map((a) => [a.id, a])), [items]);

  const api = () => calendarRef.current?.getApi();

  function changeView(key: ViewKey) {
    setView(key);
    api()?.changeView(VIEWS.find((v) => v.key === key)!.fcView);
  }

  function handleEventClick(info: EventClickArg) {
    info.jsEvent.preventDefault();
    const item = byId.get(info.event.id);
    if (item) onItemClick(item);
  }

  function handleDateClick(arg: DateClickArg) {
    const date = arg.dateStr.slice(0, 10);
    if (arg.view.type === 'dayGridMonth') onEmptyClick({ date });
    else if (arg.allDay) onEmptyClick({ date, allDay: true });
    else onEmptyClick({ date, time: arg.dateStr.slice(11, 16) });
  }

  function handleDatesSet(arg: DatesSetArg) {
    const key = VIEWS.find((v) => v.fcView === arg.view.type)?.key ?? 'week';
    setTitle(titleFor(key, arg.start, arg.end));
    setRange({ start: arg.start.getTime(), end: arg.end.getTime() });
  }

  return (
    <div className="cal cal--full">
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

      <div className="cal-toolbar">
        <div className="cal-toolbar__nav">
          <button type="button" className="cal-toolbar__btn" aria-label="Previous" onClick={() => api()?.prev()}>
            ‹
          </button>
          <button type="button" className="cal-toolbar__btn" aria-label="Next" onClick={() => api()?.next()}>
            ›
          </button>
        </div>
        <span className="cal-toolbar__title">{title}</span>
        <button type="button" className="cal-toolbar__today" onClick={() => api()?.today()}>
          Today
        </button>
      </div>

      <div className="cal-grid">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          height="100%"
          firstDay={1}
          locale="en-gb"
          events={events}
          scrollTime="08:00:00"
          slotDuration="01:00:00"
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventClassNames={eventClassNames}
          datesSet={handleDatesSet}
          nowIndicator
          allDaySlot={hasAllDay}
          allDayText=""
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
          dayMaxEvents={3}
          views={{
            timeGridDay: { dayHeaders: false },
            dayGridMonth: { dayHeaderFormat: { weekday: 'short' } },
            // 3 days from the shown date (today first); ‹ › move by 3 days
            timeGridThreeDay: { type: 'timeGrid', duration: { days: 3 } },
          }}
        />
      </div>
    </div>
  );
}
