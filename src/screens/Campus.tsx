import { Link } from 'react-router-dom';
import LinkRow from '../components/LinkRow';
import VenueCard from '../components/VenueCard';
import CampusMap from '../components/CampusMap';
import { recentVenues } from '../data/venues';
import { useLibraryStatus } from '../data/library';
import './Campus.css';

/**
 * Tab "map" (Figma "campus page", 7:55, cleaned up): last visited venues, live library numbers, campus map preview.
 * Deviation (author's request): tappable section rows, library numbers as three stat tiles.
 */
export default function Campus() {
  const recent = recentVenues(2);
  const { status } = useLibraryStatus();

  return (
    <div className="campus">
      <img className="campus__logo" src="/images/dtu-logo-small.png" alt="DTU" />

      <section className="campus__food">
        <LinkRow variant="section" to="/campus/food">
          Food and drinks
        </LinkRow>
        <div className="campus__venues">
          {recent.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>

      <section className="campus__library">
        <LinkRow variant="section" to="/campus/library">
          Library
        </LinkRow>
        <dl className="campus__stats">
          <div>
            <dt>Free seats</dt>
            <dd>{Math.max(status.capacity - status.peopleNow, 0)}</dd>
          </div>
          <div>
            <dt>People inside</dt>
            <dd>{status.peopleNow}</dd>
          </div>
          <div>
            <dt>Visits today</dt>
            <dd>{status.visitedToday}</dd>
          </div>
        </dl>
      </section>

      <div className="campus__map">
        <CampusMap mini />
        <Link to="/campus/map" className="campus__expand" aria-label="Open the full map">
          <img src="/icons/expand.svg" width={42} height={42} alt="" />
        </Link>
      </div>
    </div>
  );
}
