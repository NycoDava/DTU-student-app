import { Link } from 'react-router-dom';
import VenueCard from '../components/VenueCard';
import CampusMap from '../components/CampusMap';
import { recentVenues } from '../data/venues';
import { useLibraryStatus } from '../data/library';
import './Campus.css';

/** Tab "map" (Figma "campus page", 7:55): last visited venues, live library numbers, campus map preview. */
export default function Campus() {
  const recent = recentVenues(2);
  const { status } = useLibraryStatus();

  return (
    <div className="campus">
      <img className="campus__logo" src="/images/dtu-logo-small.png" alt="DTU" />

      <section className="campus__food">
        <Link to="/campus/food" className="campus__heading">
          Food and Drinks→
        </Link>
        <div className="campus__venues">
          {recent.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>

      <section className="campus__library">
        <Link to="/campus/library" className="campus__heading">
          Library→
        </Link>
        <p>available seats now: {status.seats.total.free}</p>
        <p>in the library now: {status.peopleNow}</p>
        <p>visited today: {status.visitedToday}</p>
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
