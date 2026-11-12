import { Link } from 'react-router-dom';
import { markVenueVisited, type Venue } from '../data/venues';
import { venueInfo } from '../data/venueInfo';
import { venueStatus } from '../lib/openingHours';
import './VenueCard.css';

/**
 * eat@DTU venue card (layout of the eat@DTU Android app: 2-column grid, red rounded border), rebuilt as a real component
 * instead of a screenshot crop (author's request): venue name set in a serif like the app's logos, building, and
 * "Open · until 14:00" / "Opens 11:00" / "Closed" from the real DTU opening hours.
 */
export default function VenueCard({ venue }: { venue: Venue }) {
  const info = venueInfo[venue.infoId ?? venue.id];
  const status = info ? venueStatus(info) : null;
  const content = (
    <>
      <span className="venue-card__logo">
        <span className="venue-card__name">{info?.title ?? venue.name}</span>
      </span>
      <span className="venue-card__meta">
        <span className="venue-card__building">{info?.building ?? ''}</span>
        {status && (
          <span className={'venue-card__status' + (status.open ? ' is-open' : '')}>
            <i aria-hidden="true" />
            {status.label}
          </span>
        )}
      </span>
    </>
  );

  if (!venue.to) return <div className="venue-card">{content}</div>;
  return (
    <Link to={venue.to} className="venue-card venue-card--link" onClick={() => markVenueVisited(venue.id)}>
      {content}
    </Link>
  );
}
