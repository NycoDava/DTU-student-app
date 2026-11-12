import LinkRow from '../components/LinkRow';
import { EmptyCard, EventCard, NewsCard } from '../components/DtuCards';
import { useDtuFeed } from '../data/dtuFeed';
import './Dtu.css';

/**
 * Tab "DTU" (Figma "dtu page", 9:124, cleaned up): latest news, next event, Services for students, Contacts.
 * Deviation (author's request): section titles are tappable rows with a chevron instead of underlined "Title->" links.
 */
export default function Dtu() {
  const { news, events, loading } = useDtuFeed();
  const emptyText = loading ? 'Loading…' : 'Nothing to show right now.';

  return (
    <div className="dtu">
      <img className="dtu__logo" src="/images/dtu-logo-small.png" alt="DTU" />

      <section className="dtu__block">
        <LinkRow variant="section" to="/dtu/news">
          News
        </LinkRow>
        {news[0] ? <NewsCard item={news[0]} /> : <EmptyCard text={emptyText} />}
      </section>

      <section className="dtu__block">
        <LinkRow variant="section" to="/dtu/events">
          Upcoming events at DTU
        </LinkRow>
        {events[0] ? <EventCard item={events[0]} /> : <EmptyCard text={emptyText} />}
      </section>

      <nav className="dtu__rows" aria-label="More">
        <LinkRow to="/dtu/services">Services for students</LinkRow>
        <LinkRow to="/dtu/contact">Contacts</LinkRow>
      </nav>
    </div>
  );
}
