import { Link } from 'react-router-dom';
import { EmptyCard, EventCard, NewsCard } from '../components/DtuCards';
import { useDtuFeed } from '../data/dtuFeed';
import './Dtu.css';

/** Tab "DTU" (Figma "dtu page", 9:124): latest news, next event, Services for students, Contacts. */
export default function Dtu() {
  const { news, events, loading } = useDtuFeed();
  const emptyText = loading ? 'Loading…' : 'Nothing to show right now.';

  return (
    <div className="dtu">
      <img className="dtu__logo" src="/images/dtu-logo-small.png" alt="DTU" />

      <section className="dtu__block">
        <Link to="/dtu/news" className="dtu__heading">
          News→
        </Link>
        {news[0] ? <NewsCard item={news[0]} /> : <EmptyCard text={emptyText} />}
      </section>

      <section className="dtu__block dtu__block--events">
        <Link to="/dtu/events" className="dtu__heading">
          Upcoming Events in DTU→
        </Link>
        {events[0] ? <EventCard item={events[0]} /> : <EmptyCard text={emptyText} />}
      </section>

      <nav className="dtu__links">
        <Link to="/dtu/services" className="dtu__heading dtu__heading--small">
          Services for students→
        </Link>
        <Link to="/dtu/contact" className="dtu__heading dtu__heading--small">
          Contacts→
        </Link>
      </nav>
    </div>
  );
}
