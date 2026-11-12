import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { DatesSetArg, EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import { formatLongDateTime, formatTime } from '../../data/format';
import './Calendar.css';

/** What the preview card shows (Figma 157:1094). */
type Preview = {
  title: string;
  kind: 'event' | 'deadline' | 'exam';
  allDay: boolean;
  course: string | null;
  location: string | null;
  start: string;
  end: string | null;
  link: string | null;
};

const sameDay = (a: string, b: string) => formatLongDateTime(a).split(',')[0] === formatLongDateTime(b).split(',')[0];

/** "30 September 2026, 13:00 – 17:00", or with both dates when it spans days. Deadlines: "Due 12 November 2026, 23:59". */
const fmtDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function whenText(p: Preview): string {
  if (p.allDay) return fmtDate.format(new Date(`${p.start.slice(0, 10)}T00:00:00Z`));
  if (p.kind === 'deadline' || !p.end) return `${p.kind === 'deadline' ? 'Due ' : ''}${formatLongDateTime(p.start)}`;
  return sameDay(p.start, p.end)
    ? `${formatLongDateTime(p.start)} – ${formatTime(p.end)}`
    : `${formatLongDateTime(p.start)} – ${formatLongDateTime(p.end)}`;
}

/** Event preview card (Figma 157:1094): tap outside or ✕ closes it; "Open in DTU Learn" only when there is a link. */
function EventPreview({ preview, onClose }: { preview: Preview; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="cal-preview" onClick={onClose}>
      <div
        className={'cal-preview__card' + (preview.kind !== 'event' ? ` cal-preview__card--${preview.kind}` : '')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cal-preview-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="cal-preview__close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
        <h3 id="cal-preview-title" className="cal-preview__title">
          {preview.title}
        </h3>
        {preview.course && <p className="cal-preview__line cal-preview__course">{preview.course}</p>}
        {preview.location && <p className="cal-preview__line">{preview.location}</p>}
        <p className="cal-preview__line">{whenText(preview)}</p>
        {preview.kind === 'deadline' && <p className="cal-preview__note">Assignment deadline in DTU Learn.</p>}
        {preview.link && (
          <a className="cal-preview__open" href={preview.link} target="_blank" rel="noopener noreferrer">
            Open in DTU Learn
          </a>
        )}
      </div>
    </div>
  );
}

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
 * to get the green-grey or mauve chip. Home passes the whole `agenda`.
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
  const kind = arg.event.extendedProps.kind;
  return [kind === 'deadline' ? 'cal-event--deadline' : kind === 'exam' ? 'cal-event--exam' : 'cal-event--activity'];
}

const hourFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Copenhagen', hour: '2-digit', minute: '2-digit', hour12: false });
/** Copenhagen time of a date as hours with decimals (13:30 -> 13.5). */
function localHours(d: Date): number {
  const [h, m] = hourFmt.format(d).split(':').map(Number);
  return (h % 24) + m / 60;
}
const pad = (h: number) => `${String(h).padStart(2, '0')}:00:00`;

/**
 * Day / Week views (author's request, keep it compact): deadlines (mostly 23:59) go to the all-day row with their time
 * in the title, so they do not stretch the grid to midnight; exams are all-day already.
 */
function forTimeGrid(events: EventInput[]): EventInput[] {
  return events.map((e) =>
    e.extendedProps?.kind === 'deadline' && e.start
      ? { ...e, allDay: true, end: undefined, title: `${hourFmt.format(new Date(e.start as string))} ${e.title}` }
      : e,
  );
}

/** Hours shown in Day / Week: only the span of the timed events in the visible range (default 08-16), at least 4 h. */
function hourWindow(events: EventInput[], range: { start: Date; end: Date } | null) {
  let min = 24;
  let max = 0;
  for (const e of events) {
    if (e.allDay || !e.start || !range) continue;
    const start = new Date(e.start as string);
    const end = e.end ? new Date(e.end as string) : new Date(start.getTime() + 30 * 60_000);
    if (end <= range.start || start >= range.end) continue;
    min = Math.min(min, Math.floor(localHours(start)));
    max = Math.max(max, Math.ceil(localHours(end) || 24));
  }
  if (min >= max) return { min: 8, max: 16 };
  while (max - min < 4) {
    if (min > 0) min--;
    if (max - min < 4 && max < 24) max++;
  }
  return { min, max };
}

export default function Calendar({ events = [] }: Props) {
  const calendarRef = useRef<FullCalendar>(null);
  const [view, setView] = useState<ViewKey>('week');
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null);
  const timeGrid = view === 'day' || view === 'week';
  const shown = timeGrid ? forTimeGrid(events) : events;
  const hours = hourWindow(shown, range);

  function handleEventClick(info: EventClickArg) {
    info.jsEvent.preventDefault();
    const e = info.event;
    const x = e.extendedProps as { kind?: Preview['kind']; plainTitle?: string; course?: string; location?: string; link?: string };
    setPreview({
      title: x.plainTitle ?? e.title,
      kind: x.kind ?? 'event',
      allDay: e.allDay,
      course: x.course ?? null,
      location: x.location || null,
      start: e.startStr,
      end: e.endStr || null,
      link: x.link ?? null,
    });
  }

  const api = () => calendarRef.current?.getApi();

  function changeView(key: ViewKey) {
    const target = VIEWS.find((v) => v.key === key)!;
    setView(key);
    api()?.changeView(target.fcView);
  }

  function handleDatesSet(arg: DatesSetArg) {
    const key = VIEWS.find((v) => v.fcView === arg.view.type)?.key ?? 'week';
    setTitle(titleFor(key, arg.start, arg.end));
    setRange({ start: arg.start, end: arg.end });
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
            height="auto"
            firstDay={1}
            locale="en-gb"
            events={shown}
            slotMinTime={pad(hours.min)}
            slotMaxTime={pad(hours.max)}
            slotDuration="01:00:00"
            eventClick={handleEventClick}
            eventClassNames={eventClassNames}
            datesSet={handleDatesSet}
            nowIndicator
            allDayText="all day"
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
      {preview && <EventPreview preview={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
