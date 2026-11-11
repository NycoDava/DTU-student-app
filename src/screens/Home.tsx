import { Link } from 'react-router-dom';
import { initials, useCurrentUser } from '../data/currentUser';
import Calendar from '../components/calendar/Calendar';
import './Home.css';

/**
 * Home (Figma "homepage day/week/month/list": one screen, the calendar tabs switch the view).
 * Cards are empty containers for now; data is wired in later.
 */
export default function Home() {
  const { user } = useCurrentUser();

  return (
    <div className="home">
      <header className="home__header">
        <Link to="/profile" className="home__profile">
          {user.photoUrl ? (
            <img className={'home__avatar' + (user.photoHasRing ? '' : ' home__avatar--ring')} src={user.photoUrl} alt="" />
          ) : (
            <span className="home__avatar home__avatar--initials">{initials(user.name)}</span>
          )}
          <span className="home__name">{user.name}</span>
        </Link>
        <img className="home__logo" src="/images/dtu-logo-small.png" alt="DTU" />
      </header>

      <div className="home__sections">
        <section className="home__group">
          <Link to="/announcements" className="home__title">
            Study Announcements→
          </Link>
          {/* Latest announcement goes here */}
          <Link to="/announcements" className="home__card home__card--empty">
            No announcements yet
          </Link>
        </section>

        <section className="home__group">
          <Link to="/events" className="home__title">
            Upcoming Activities and Deadlines →
          </Link>
          {/* Next agenda item goes here: date block left, time / title / course right.
              Add class home__card--deadline for deadlines (red border). */}
          <Link to="/events" className="home__card home__upcoming">
            <span className="home__upcoming-date" aria-hidden="true">
              –
            </span>
            <span className="home__upcoming-text home__card--empty">No upcoming activities</span>
          </Link>
        </section>

        <section className="home__calendar">
          <h2 className="home__calendar-title">Your Calendar</h2>
          <Calendar />
        </section>
      </div>
    </div>
  );
}
