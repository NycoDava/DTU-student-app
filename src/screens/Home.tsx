import { Link } from 'react-router-dom';
import { initials, useCurrentUser } from '../data/currentUser';
import WeekStrip from '../components/calendar/WeekStrip';
import { useEventDialogs } from '../components/calendar/EventDialogs';
import SyncBar from '../components/SyncBar';
import AgendaCard from '../components/AgendaCard';
import LinkRow from '../components/LinkRow';
import { courseLabel, studyAnnouncements } from '../data/appData';
import { useAgenda } from '../data/personalEvents';
import { dayKey } from '../data/format';
import type { AgendaItem } from '../data/types';
import './Home.css';

/**
 * Home (Figma "homepage day/week/month/list", cleaned up on the author's request): compact profile header, section rows
 * with a chevron, the newest study announcement, the next activity/deadline, and a week calendar (after the usability
 * tests, 24 Nov 2026) with a button to the full Calendar page.
 */
/** Next agenda item (still running or upcoming); if none, the latest one, so the card is never empty. */
function nextAgendaItem(agenda: AgendaItem[]) {
  const now = Date.now();
  return agenda.find((a) => Date.parse(a.endsAt ?? a.startsAt) >= now) ?? agenda[agenda.length - 1];
}

export default function Home() {
  const { user } = useCurrentUser();
  const latest = studyAnnouncements[0];
  const agenda = useAgenda();
  const next = nextAgendaItem(agenda);
  const { openItem, openForm, dialogs } = useEventDialogs();

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
          <Link to="/events" className="home__agenda-link" aria-label="Upcoming activities and deadlines">
            <AgendaCard item={next} courseLabel={courseLabel(next.courseCode)} plain />
          </Link>
        ) : (
          <p className="home__empty">Nothing coming up</p>
        )}
      </section>

      <section className="home__calendar">
        <LinkRow variant="section" to="/calendar">
          Calendar
        </LinkRow>
        <WeekStrip items={agenda} onItemClick={openItem} />
        <div className="home__calendar-actions">
          <button type="button" className="home__btn" onClick={() => openForm({ date: dayKey(new Date().toISOString()) })}>
            + Add event
          </button>
        </div>
      </section>
      {dialogs}
    </div>
  );
}
