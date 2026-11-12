import SubHeader from '../components/SubHeader';
import VenueCard from '../components/VenueCard';
import type { Venue } from '../data/venues';
import './Food.css';

/**
 * Venue grid (Figma 30:172 = all venues, 157:1132 = venues of the Food Court in building 101).
 * Same cards and order as the eat@DTU app; the title uses the app's own wording ("Food and drinks", like the Campus
 * row) instead of the eat@DTU logo, so navigation names stay consistent (author's decision). "eat@DTU" only appears
 * where the user is sent to the official app ("Order in eat@DTU").
 */
export default function Food({ venues, title = 'Food and drinks' }: { venues: Venue[]; title?: string }) {
  return (
    <div className="sub-screen food">
      <SubHeader title={title} />
      <div className="food__grid">
        {venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>
    </div>
  );
}
