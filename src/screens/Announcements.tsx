import SubHeader from '../components/SubHeader';
import AnnouncementCard from '../components/AnnouncementCard';
import { studyAnnouncements } from '../data/appData';

export default function Announcements() {
  // DTU study announcements (student.dtu.dk), newest first. Course announcements live on each course page.
  const items = studyAnnouncements;

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
