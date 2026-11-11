import SubHeader from '../components/SubHeader';
import { LINKS } from '../config/links';
import { formatTime, useLibraryStatus, type SeatCount } from '../data/library';
import './Library.css';

/** DTU Smart Library (Figma 30:193): live free / occupied seats per floor + library links. */
export default function Library() {
  const { status, live } = useLibraryStatus();

  return (
    <div className="sub-screen library">
      <SubHeader />
      <h1 className="library__title">
        <span>DTU</span> Smart Library
      </h1>
      <p className={'library__live' + (live ? ' library__live--on' : '')}>
        <span className="library__dot" aria-hidden="true" />
        {live ? 'Live' : 'Not live, last reading'} · Updated {formatTime(status.updatedAt)}
      </p>

      <SeatBlock title="Seats - Entire library" seats={status.seats.total} />
      <SeatBlock title="Seats - First floor" seats={status.seats.first} />
      <SeatBlock title="Seats - Second Floor" seats={status.seats.second} />

      <p className="library__people">
        {status.peopleNow} of {status.capacity} people in the library · {status.visitedToday} visits today
      </p>

      <nav className="library__links">
        <a href={LINKS.findit} target="_blank" rel="noreferrer">
          DTU Findit <img src="/icons/external-link.svg" width={16} height={16} alt="" />
        </a>
        <a href={LINKS.libraryBooking} target="_blank" rel="noreferrer">
          Book Group Room/Booth <img src="/icons/external-link.svg" width={16} height={16} alt="" />
        </a>
        <a href={LINKS.printing} target="_blank" rel="noreferrer">
          Use the Printers <img src="/icons/external-link.svg" width={16} height={16} alt="" />
        </a>
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
      <div className="library__boxes">
        <div className="library__box library__box--free">
          <span>Free</span>
          <strong>{seats.free}</strong>
        </div>
        <div className="library__box library__box--occupied">
          <span>Occupied</span>
          <strong>{seats.occupied}</strong>
        </div>
      </div>
      <div className="library__bar" role="img" aria-label={`${pct}% of seats occupied`}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="library__pct">{pct}% occupied</p>
    </section>
  );
}
