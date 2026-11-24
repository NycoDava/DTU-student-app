import { useEffect, useState, type FormEvent } from 'react';
import { courses } from '../../data/appData';
import { copenhagenToIso, dayKey, timeKey } from '../../data/format';
import { savePersonalEvent, type PersonalEvent } from '../../data/personalEvents';
import { Overlay } from './EventPreview';

/** What opens the form: an existing personal event (edit) or a start date/time (new, prefilled). */
export type FormTarget = { event: PersonalEvent } | { date: string; time?: string; allDay?: boolean };

const plusHour = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return `${String(Math.min(h + 1, 23)).padStart(2, '0')}:${h >= 23 ? '59' : String(m).padStart(2, '0')}`;
};

/** Bottom sheet to add or edit a personal event. Saved in this browser only (see personalEvents.ts). */
export default function EventForm({ target, onClose }: { target: FormTarget; onClose: () => void }) {
  const existing = 'event' in target ? target.event : null;
  const startTime = existing && !existing.isAllDay ? timeKey(existing.startsAt) : ('time' in target && target.time) || '09:00';

  const [title, setTitle] = useState(existing?.title ?? '');
  const [allDay, setAllDay] = useState(existing ? existing.isAllDay : 'allDay' in target && !!target.allDay);
  const [date, setDate] = useState(existing ? dayKey(existing.startsAt) : 'date' in target ? target.date : '');
  const [start, setStart] = useState(startTime);
  const [end, setEnd] = useState(existing?.endsAt && !existing.isAllDay ? timeKey(existing.endsAt) : plusHour(startTime));
  const [location, setLocation] = useState(existing?.location ?? '');
  const [courseCode, setCourseCode] = useState(existing?.courseCode ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const endBeforeStart = !allDay && end <= start;
  const canSave = title.trim() !== '' && date !== '' && !endBeforeStart;
  const activeCourses = courses.filter((c) => c.isActive);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    savePersonalEvent({
      id: existing?.id,
      title: title.trim(),
      isAllDay: allDay,
      startsAt: allDay ? date : copenhagenToIso(date, start),
      // All day: end of the day in Copenhagen (like exams), so it counts as upcoming until the evening
      endsAt: allDay ? `${date}T22:59:59.000Z` : copenhagenToIso(date, end),
      location: location.trim() || null,
      courseCode: courseCode || null,
      notes: notes.trim() || null,
    });
    onClose();
  }

  return (
    <Overlay>
      <div className="ev-sheet" onClick={onClose}>
        <form
          className="ev-sheet__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ev-sheet-title"
          onClick={(e) => e.stopPropagation()}
          onSubmit={submit}
        >
          <div className="ev-sheet__head">
            <button type="button" className="ev-sheet__text-btn" onClick={onClose}>
              Cancel
            </button>
            <h2 id="ev-sheet-title" className="ev-sheet__title">
              {existing ? 'Edit event' : 'New event'}
            </h2>
            <button type="submit" className="ev-sheet__text-btn ev-sheet__text-btn--strong" disabled={!canSave}>
              Save
            </button>
          </div>

          <label className="ev-field">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Special course meeting" autoFocus required />
          </label>

          <label className="ev-switch">
            <span>All day</span>
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
          </label>

          <label className="ev-field">
            <span>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>

          {!allDay && (
            <div className="ev-row">
              <label className="ev-field">
                <span>Starts</span>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => {
                    setStart(e.target.value);
                    if (end <= e.target.value) setEnd(plusHour(e.target.value));
                  }}
                  required
                />
              </label>
              <label className="ev-field">
                <span>Ends</span>
                <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required />
              </label>
            </div>
          )}
          {endBeforeStart && <p className="ev-error">The end must be after the start.</p>}

          <label className="ev-field">
            <span>Location (optional)</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Building 101, room S01" />
          </label>

          <label className="ev-field">
            <span>Course (optional)</span>
            <select value={courseCode} onChange={(e) => setCourseCode(e.target.value)}>
              <option value="">None</option>
              {activeCourses.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="ev-field">
            <span>Notes (optional)</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </label>

          <p className="ev-hint">Saved on this device only.</p>
        </form>
      </div>
    </Overlay>
  );
}
