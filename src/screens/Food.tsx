import SubHeader from '../components/SubHeader';
import VenueCard from '../components/VenueCard';
import type { Venue } from '../data/venues';
import './Food.css';

/** eat@DTU "Select Venue" (Figma 30:172 = all venues, 157:1132 = venues of building 101). Kept identical to eat@DTU. */
export default function Food({ venues, compact = false }: { venues: Venue[]; compact?: boolean }) {
  return (
    <div className="sub-screen food">
      <SubHeader />
      <h1 className="food__title">
        Eat@<span>DTU</span>
      </h1>
      <p className="food__subtitle">Select Venue</p>
      <div className={'food__grid' + (compact ? ' food__grid--compact' : '')}>
        {venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>
    </div>
  );
}
