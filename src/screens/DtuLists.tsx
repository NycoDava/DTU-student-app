import SubHeader from '../components/SubHeader';
import { EmptyCard, EventCard, NewsCard } from '../components/DtuCards';
import { useDtuFeed } from '../data/dtuFeed';
import './DtuPages.css';

/** "News from DTU" (Figma 116:336): all news from app-data, newest first. */
export function DtuNews() {
  const { news, loading } = useDtuFeed();
  return (
    <div className="sub-screen">
      <SubHeader title="News from DTU" />
      <div className="dtu-list dtu-list--news">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} captionWeight="medium" />
        ))}
        {news.length === 0 && <EmptyCard text={loading ? 'Loading…' : 'No news right now.'} />}
      </div>
    </div>
  );
}

/** "Events in DTU" (Figma 116:351): upcoming events, soonest first. */
export function DtuEvents() {
  const { events, loading } = useDtuFeed();
  return (
    <div className="sub-screen">
      <SubHeader title="Events in DTU" />
      <div className="dtu-list">
        {events.map((item) => (
          <EventCard key={item.id} item={item} tall />
        ))}
        {events.length === 0 && <EmptyCard text={loading ? 'Loading…' : 'No events right now.'} />}
      </div>
    </div>
  );
}
