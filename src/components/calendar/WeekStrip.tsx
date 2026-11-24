import { useMemo, useState } from 'react';
import type { AgendaItem } from '../../data/types';
import { courseLabel } from '../../data/appData';
import { addDays, dayKey, formatTime } from '../../data/format';
import { describeLocation } from '../../lib/rooms';
import './WeekStrip.css';

const todayKey = () => dayKey(new Date().toISOString());
const asDate = (key: string) => new Date(`${key}T12:00:00Z`);
/** Monday of the week of a day key. */
const mondayOf = (key: string) => addDays(key, -((asDate(key).getUTCDay() + 6) % 7));

const fmtWeekday = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'narrow' });
const fmtDayLong = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' });
const fmtShort = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short' });

/** Day keys an item covers (multi-day events show on every day). */
function daysOf(a: AgendaItem): string[] {
  const first = dayKey(a.startsAt);
  if (a.isAllDay || !a.endsAt || a.kind === 'deadline') return [first];
  const last = dayKey(new Date(Date.parse(a.endsAt) - 1).toISOString());
  const keys = [first];
  while (keys[keys.length - 1] < last && keys.length < 31) keys.push(addDays(keys[keys.length - 1], 1));
  return keys;
}

function timeText(a: AgendaItem): string {
  if (a.kind === 'exam') return 'Exam';
  if (a.isAllDay) return 'All day';
  if (a.kind === 'deadline') return `Due ${formatTime(a.startsAt)}`;
  return a.endsAt ? `${formatTime(a.startsAt)}–${formatTime(a.endsAt)}` : formatTime(a.startsAt);
}

const kindClass = (a: AgendaItem) => (a.source === 'personal' ? 'personal' : a.kind === 'event' ? 'activity' : a.kind);

type Props = { items: AgendaItem[]; onItemClick: (item: AgendaItem) => void };

/**
 * Home calendar (after the usability tests, 24 Nov 2026): one week, Mon–Sun, with colored dots per day; tap a day to
 * see its items below. The full calendar is its own page (/calendar).
 */
export default function WeekStrip({ items, onItemClick }: Props) {
  const today = todayKey();
  const [selected, setSelected] = useState(today);
  const [monday, setMonday] = useState(mondayOf(today));
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const byDay = useMemo(() => {
    const map = new Map<string, AgendaItem[]>();
    for (const a of items) for (const k of daysOf(a)) map.set(k, [...(map.get(k) ?? []), a]);
    // All-day items (exams) first, then by time
    for (const list of map.values()) list.sort((x, y) => Number(y.isAllDay) - Number(x.isAllDay) || Date.parse(x.startsAt) - Date.parse(y.startsAt));
    return map;
  }, [items]);

  function moveWeek(n: number) {
    const next = addDays(monday, 7 * n);
    setMonday(next);
    setSelected(mondayOf(today) === next ? today : next);
  }

  const dayItems = byDay.get(selected) ?? [];
  const sunday = addDays(monday, 6);

  return (
    <div className="week">
      <div className="week__bar">
        <button type="button" className="week__arrow" aria-label="Previous week" onClick={() => moveWeek(-1)}>
          ‹
        </button>
        <button
          type="button"
          className="week__range"
          onClick={() => {
            setMonday(mondayOf(today));
            setSelected(today);
          }}
          aria-label="Go to today"
        >
          {fmtShort.format(asDate(monday))} – {fmtShort.format(asDate(sunday))}
        </button>
        <button type="button" className="week__arrow" aria-label="Next week" onClick={() => moveWeek(1)}>
          ›
        </button>
      </div>

      <div className="week__days" role="tablist" aria-label="Days">
        {days.map((k) => {
          const list = byDay.get(k) ?? [];
          const kinds = [...new Set(list.map(kindClass))].slice(0, 3);
          return (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={k === selected}
              aria-label={`${fmtDayLong.format(asDate(k))}, ${list.length} items`}
              className={'week__day' + (k === selected ? ' week__day--selected' : '') + (k === today ? ' week__day--today' : '')}
              onClick={() => setSelected(k)}
            >
              <span className="week__weekday">{fmtWeekday.format(asDate(k))}</span>
              <span className="week__num">{asDate(k).getUTCDate()}</span>
              <span className="week__dots">
                {kinds.map((c) => (
                  <span key={c} className={`week__dot week__dot--${c}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <h3 className="week__daytitle">{selected === today ? `Today, ${fmtDayLong.format(asDate(selected))}` : fmtDayLong.format(asDate(selected))}</h3>
      {dayItems.length === 0 ? (
        <p className="week__empty">Nothing planned</p>
      ) : (
        <ul className="week__list">
          {dayItems.map((a) => (
            <li key={a.id}>
              <button type="button" className={`week__item week__item--${kindClass(a)}`} onClick={() => onItemClick(a)}>
                <span className="week__time">{timeText(a)}</span>
                <span className="week__text">
                  <span className="week__title">{a.title}</span>
                  {(a.courseCode || a.location) && (
                    <span className="week__meta">{[a.courseCode ? (courseLabel(a.courseCode) ?? a.courseCode) : null, describeLocation(a.location)?.label].filter(Boolean).join(' · ')}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
