import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { AgendaItem } from '../../data/types';
import { courseLabel } from '../../data/appData';
import { formatLongDateTime, formatTime } from '../../data/format';

const fmtDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const sameDay = (a: string, b: string) => formatLongDateTime(a).split(',')[0] === formatLongDateTime(b).split(',')[0];

/** "30 September 2026, 13:00 – 17:00", or with both dates when it spans days. Deadlines: "Due 12 November 2026, 23:59". */
function whenText(a: AgendaItem): string {
  if (a.isAllDay) return fmtDate.format(new Date(`${a.startsAt.slice(0, 10)}T00:00:00Z`));
  if (a.kind === 'deadline' || !a.endsAt) return `${a.kind === 'deadline' ? 'Due ' : ''}${formatLongDateTime(a.startsAt)}`;
  return sameDay(a.startsAt, a.endsAt)
    ? `${formatLongDateTime(a.startsAt)} – ${formatTime(a.endsAt)}`
    : `${formatLongDateTime(a.startsAt)} – ${formatLongDateTime(a.endsAt)}`;
}

/** Overlays (preview, event form) cover the whole phone column, not just the scrolled content. */
export function Overlay({ children }: { children: ReactNode }) {
  return createPortal(children, document.querySelector('.app-shell') ?? document.body);
}

type Props = {
  item: AgendaItem;
  onClose: () => void;
  /** Personal events only: Edit / Delete buttons. */
  onEdit?: () => void;
  onDelete?: () => void;
};

/** Event preview card (Figma 157:1094): tap outside or ✕ closes it; "Open in DTU Learn" only when there is a link. */
export default function EventPreview({ item, onClose, onEdit, onDelete }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const personal = item.source === 'personal';
  const course = item.courseCode ? (courseLabel(item.courseCode) ?? item.courseCode) : null;

  return (
    <Overlay>
      <div className="cal-preview" onClick={onClose}>
        <div
          className={'cal-preview__card' + (item.kind !== 'event' ? ` cal-preview__card--${item.kind}` : '') + (personal ? ' cal-preview__card--personal' : '')}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cal-preview-title"
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className="cal-preview__close" aria-label="Close" onClick={onClose}>
            ✕
          </button>
          <h3 id="cal-preview-title" className="cal-preview__title">
            {item.title}
          </h3>
          {course && <p className="cal-preview__line cal-preview__course">{course}</p>}
          {item.location && <p className="cal-preview__line">{item.location}</p>}
          <p className="cal-preview__line">{whenText(item)}</p>
          {item.notes && <p className="cal-preview__line cal-preview__notes">{item.notes}</p>}
          {item.kind === 'deadline' && <p className="cal-preview__note">Assignment deadline in DTU Learn.</p>}
          {personal && <p className="cal-preview__note">Personal event, saved on this device.</p>}
          {item.url && (
            <a className="cal-preview__open" href={item.url} target="_blank" rel="noopener noreferrer">
              Open in DTU Learn
            </a>
          )}
          {personal && (
            <div className="cal-preview__actions">
              <button type="button" className="cal-preview__open" onClick={onEdit}>
                Edit
              </button>
              <button type="button" className="cal-preview__ghost" onClick={onDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}
