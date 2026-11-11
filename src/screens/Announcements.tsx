import SubHeader from '../components/SubHeader';
import AnnouncementCard from '../components/AnnouncementCard';
import type { Announcement } from '../data/types';

// TODO: replace with `announcements` from app-data.json once the data is plugged in.
const ANNOUNCEMENTS: Announcement[] = [];

export default function Announcements() {
  const items = [...ANNOUNCEMENTS].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return (
    <div className="sub-screen">
      <SubHeader title="Study Announcements" stacked />
      <ul className="sub-list sub-list--announcements">
        {items.length === 0 ? (
          <li className="sub-card sub-card--empty">No announcements yet</li>
        ) : (
          items.map((item) => (
            <li key={item.id}>
              <AnnouncementCard item={item} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
