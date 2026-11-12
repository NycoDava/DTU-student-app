import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { initials, useCurrentUser } from '../data/currentUser';
import Calendar from '../components/calendar/Calendar';
import SyncBar from '../components/SyncBar';
import { agenda, courseLabel, studyAnnouncements } from '../data/appData';
import { formatDay, formatMonth, formatTime } from '../data/format';
import './Home.css';

/**
 * Home (Figma "homepage day/week/month/list": one screen, the calendar tabs switch the view).
 * Cards are empty containers for now; data is wired in later.
 */
/** Next agenda item (still running or upcoming); if none, the latest one, so the card is never empty. */
function nextAgendaItem() {
  const now = Date.now();
  return agenda.find((a) => Date.parse(a.endsAt ?? a.startsAt) >= now) ?? agenda[agenda.length - 1];
}

/** The whole agenda as FullCalendar events (kind → chip color). */
const calendarEvents = () =>
  agenda.map((a) => ({
    id: a.id,
    title: a.courseCode && !a.title.startsWith(a.courseCode) ? `${a.courseCode} ${a.title}` : a.title,
    start: a.startsAt,
    end: a.endsAt ?? undefined,
    allDay: a.isAllDay,
    // No `url` here: FullCalendar would render a real link that a tap can follow. The preview card opens it instead.
    extendedProps: {
      kind: a.kind,
      plainTitle: a.title,
      course: courseLabel(a.courseCode) ?? a.courseCode,
      location: a.location,
      link: a.url ?? null,
    },
  }));

export default function Home() {
  const { user } = useCurrentUser();
  const latest = studyAnnouncements[0];
  const next = nextAgendaItem();
  const events = useMemo(calendarEvents, []);

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

      <SyncBar />

      <div className="home__sections">
        <section className="home__group">
          <Link to="/announcements" className="home__title">
            Study Announcements→
          </Link>
          {latest ? (
            <Link to="/announcements" className="home__card home__announcement">
              <span className="home__announcement-title">{latest.title.replace(/^study announcement/i, 'Study Announcement')}</span>
              <span className="home__announcement-preview">{latest.teaser}</span>
            </Link>
          ) : (
            <Link to="/announcements" className="home__card home__card--empty">
              No announcements yet
            </Link>
          )}
        </section>

        <section className="home__group">
          <Link to="/events" className="home__title">
            Upcoming Activities and Deadlines →
          </Link>
          {next ? (
            <Link
              to="/events"
              className={'home__card home__upcoming' + (next.kind === 'deadline' ? ' home__card--deadline' : '')}
            >
              <span className="home__upcoming-date">
                {formatMonth(next.startsAt)}
                <br />
                {formatDay(next.startsAt)}
              </span>
              <span className="home__upcoming-text">
                {!next.isAllDay && <span className="home__upcoming-line">{formatTime(next.startsAt)}</span>}
                <span className="home__upcoming-line">{next.title}</span>
                <span className="home__upcoming-line home__upcoming-course">
                  {courseLabel(next.courseCode) ?? next.courseCode}
                </span>
              </span>
            </Link>
          ) : (
            <Link to="/events" className="home__card home__upcoming">
              <span className="home__upcoming-date" aria-hidden="true">
                –
              </span>
              <span className="home__upcoming-text home__card--empty">No upcoming activities</span>
            </Link>
          )}
        </section>

        <section className="home__calendar">
          <h2 className="home__calendar-title">Your Calendar</h2>
          <Calendar events={events} />
        </section>
      </div>
    </div>
  );
}
