import { Link } from 'react-router-dom';
import { markVenueVisited, type Venue } from '../data/venues';
import './VenueCard.css';

/** eat@DTU venue card: a crop of the real app screenshot inside a red rounded border. */
export default function VenueCard({ venue }: { venue: Venue }) {
  const { w, h, left, top } = venue.crop;
  const image = (
    <img
      src={venue.image}
      alt={venue.name}
      className="venue-card__img"
      style={{ width: `${w}%`, height: `${h}%`, left: `${left}%`, top: `${top}%` }}
    />
  );

  if (!venue.to) return <div className="venue-card">{image}</div>;
  return (
    <Link to={venue.to} className="venue-card venue-card--link" onClick={() => markVenueVisited(venue.id)}>
      {image}
    </Link>
  );
}
