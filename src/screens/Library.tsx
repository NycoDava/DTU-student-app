import SubHeader from '../components/SubHeader';
import LinkRow from '../components/LinkRow';
import { LINKS } from '../config/links';
import { formatTime, useLibraryStatus, type SeatCount } from '../data/library';
import './Library.css';

/**
 * DTU Smart Library (Figma 30:193, made minimal on the author's request): live free / occupied places for the whole
 * library (door counter vs capacity) and seats per floor (sensors), then the library links. Blue/orange = Figma colors.
 */
export default function Library() {
  const { status, live } = useLibraryStatus();
  // Whole library: the door counter against the building capacity (e.g. 518 of 800). Floors: seats with a sensor.
  const wholeLibrary: SeatCount = { occupied: status.peopleNow, free: Math.max(status.capacity - status.peopleNow, 0) };

  return (
    <div className="sub-screen library">
      <SubHeader title="Library" />
      <p className={'library__live' + (live ? ' library__live--on' : '')}>
        <span className="library__dot" aria-hidden="true" />
        {live ? 'Live' : 'Not live, last reading'} · Updated {formatTime(status.updatedAt)}
      </p>

      <SeatBlock title="Entire library" seats={wholeLibrary} />
      <SeatBlock title="First floor" seats={status.seats.first} />
      <SeatBlock title="Second floor" seats={status.seats.second} />

      <nav className="library__links" aria-label="Library services">
        <LinkRow href={LINKS.findit}>DTU Findit</LinkRow>
        <LinkRow href={LINKS.libraryBooking}>Book a group room or booth</LinkRow>
        <LinkRow href={LINKS.printing}>Printers</LinkRow>
      </nav>
    </div>
  );
}

function SeatBlock({ title, seats }: { title: string; seats: SeatCount }) {
  const total = seats.free + seats.occupied;
  const pct = total > 0 ? Math.round((seats.occupied / total) * 100) : 0;
  return (
    <section className="library__block">
      <h2>{title}</h2>
      <div className="library__numbers">
        <span className="library__num library__num--free">
          <strong>{seats.free}</strong> free
        </span>
        <span className="library__num library__num--occupied">
          <strong>{seats.occupied}</strong> occupied
        </span>
      </div>
      <div className="library__bar" role="img" aria-label={`${pct}% occupied`}>
        <span style={{ width: `${100 - pct}%` }} />
      </div>
    </section>
  );
}
