import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { initials, useCurrentUser } from '../data/currentUser';
import Calendar from '../components/calendar/Calendar';
import SyncBar from '../components/SyncBar';
import LinkRow from '../components/LinkRow';
import { agenda, courseLabel, studyAnnouncements } from '../data/appData';
import { formatDay, formatMonth, formatTime } from '../data/format';
import './Home.css';

/**
 * Home (Figma "homepage day/week/month/list", cleaned up on the author's request): compact profile header, section rows
 * with a chevron, the newest study announcement, the next activity/deadline, and the calendar (unchanged).
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
  const events = useMemo(() => calendarEvents(), []);

  return (
    <div className="home">
      <header className="home__header">
        <Link to="/profile" className="home__profile" aria-label="Profile">
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

      <section className="home__group">
        <LinkRow variant="section" to="/announcements">
          Study announcements
        </LinkRow>
        {latest ? (
          <Link to="/announcements" className="home__card">
            <span className="home__card-title">{latest.title.replace(/^study announcement\s+\S+:\s*/i, '')}</span>
            <span className="home__card-text">{latest.teaser}</span>
          </Link>
        ) : (
          <p className="home__empty">No announcements yet</p>
        )}
      </section>

      <section className="home__group">
        <LinkRow variant="section" to="/events">
          Upcoming
        </LinkRow>
        {next ? (
          <Link to="/events" className={'home__card home__next' + (next.kind === 'deadline' ? ' home__next--deadline' : '')}>
            <span className="home__date">
              <span className="home__date-month">{formatMonth(next.startsAt)}</span>
              <span className="home__date-day">{formatDay(next.startsAt)}</span>
            </span>
            <span className="home__next-text">
              <span className="home__card-title">{next.title}</span>
              <span className="home__card-text">
                {!next.isAllDay && `${formatTime(next.startsAt)} · `}
                {courseLabel(next.courseCode) ?? next.courseCode}
              </span>
            </span>
          </Link>
        ) : (
          <p className="home__empty">Nothing coming up</p>
        )}
      </section>

      <section className="home__calendar">
        <h2 className="home__calendar-title">Calendar</h2>
        <Calendar events={events} />
      </section>
    </div>
  );
}
