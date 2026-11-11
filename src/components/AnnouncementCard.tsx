import { useState } from 'react';
import type { Announcement } from '../data/types';
import './SubScreen.css';

/** Figma "Study Announcements" card: "Study Announcement <code>:" + title. Tap expands the full text. */
export default function AnnouncementCard({ item }: { item: Announcement }) {
  const [open, setOpen] = useState(false);

  return (
    <button type="button" className="sub-card announcement-card" aria-expanded={open} onClick={() => setOpen(!open)}>
      <span>
        Study Announcement {item.courseCode}:
        <br />
        {item.title}
      </span>
      {open && <span className="announcement-card__text">{item.text}</span>}
    </button>
  );
}
