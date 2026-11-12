import { useState } from 'react';
import type { StudyAnnouncement } from '../data/types';
import { formatLongDateTime } from '../data/format';
import './SubScreen.css';

/** "Study announcement s1924: Registration …" → ["Study Announcement s1924:", "Registration …"] (Figma: two lines). */
function splitTitle(title: string): [string, string] {
  const m = /^(study announcement\s+\S+?):\s*(.*)$/i.exec(title);
  return m ? [`Study Announcement ${m[1].split(/\s+/).pop()}:`, m[2]] : ['Study Announcement:', title];
}

/** Figma "Study Announcements" card: "Study Announcement <id>:" + title. Tap expands the full text + link. */
export default function AnnouncementCard({ item }: { item: StudyAnnouncement }) {
  const [open, setOpen] = useState(false);
  const [head, rest] = splitTitle(item.title);

  return (
    <div className="sub-card announcement-card">
      <button type="button" className="announcement-card__toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        {head}
        <br />
        {rest}
      </button>
      {open && (
        <>
          <span className="announcement-card__date">{formatLongDateTime(item.publishedAt)}</span>
          <span className="announcement-card__text">{item.text || item.teaser}</span>
          {item.url && (
            <a className="announcement-card__link" href={item.url} target="_blank" rel="noopener noreferrer">
              Read on student.dtu.dk
            </a>
          )}
        </>
      )}
    </div>
  );
}
