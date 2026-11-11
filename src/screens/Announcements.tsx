import SubHeader from '../components/SubHeader';
import AnnouncementCard from '../components/AnnouncementCard';
import { announcements } from '../data/appData';

export default function Announcements() {
  const items = announcements; // newest first

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
