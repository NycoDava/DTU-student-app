import type { AgendaItem } from '../data/types';
import { formatDay, formatMonth, formatTime } from '../data/format';
import './SubScreen.css';

/**
 * One agenda row (Figma "Upcoming Events" card): date block, then time / title / course in grey.
 * Deadlines get the red border. `courseLabel` = "02830 Course name, Fall 2026" (resolved from `courses`).
 */
export default function AgendaCard({ item, courseLabel }: { item: AgendaItem; courseLabel?: string }) {
  const isDeadline = item.kind === 'deadline';
  const content = (
    <>
      <span className="agenda-card__date">
        {formatMonth(item.startsAt)}
        <br />
        {formatDay(item.startsAt)}
      </span>
      <span className="agenda-card__text">
        {!item.isAllDay && <span className="agenda-card__line">{formatTime(item.startsAt)}</span>}
        <span className="agenda-card__line">{item.title}</span>
        {(courseLabel ?? item.courseCode) && (
          <span className="agenda-card__line agenda-card__course">{courseLabel ?? item.courseCode}</span>
        )}
      </span>
    </>
  );
  const className = 'agenda-card' + (isDeadline ? ' agenda-card--deadline' : '') + (item.kind === 'exam' ? ' agenda-card--exam' : '');

  return item.url ? (
    <a className={className} href={item.url} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}
