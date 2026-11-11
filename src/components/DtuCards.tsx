import { useState } from 'react';
import type { DtuEvent, NewsItem } from '../data/types';
import './DtuCards.css';

/** Image that turns into a gray block when the URL is missing or fails to load. */
function CardImage({ src, className }: { src: string | null; className: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={className + ' dtu-card__img--fallback'} />;
  return <img className={className} src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

/** News card (Figma 9:124 / 116:336): image 229 high, red badge on the image, white caption. Opens dtu.dk. */
export function NewsCard({ item, captionWeight = 'semibold' }: { item: NewsItem; captionWeight?: 'semibold' | 'medium' }) {
  return (
    <a className="news-card" href={item.url} target="_blank" rel="noopener noreferrer">
      <CardImage src={item.imageUrl} className="news-card__img" />
      <div className="news-card__bottom">
        {item.badge && <span className="news-card__badge">{item.badge}</span>}
        <p className={'news-card__title news-card__title--' + captionWeight}>{item.title}</p>
      </div>
    </a>
  );
}

/** Event card (Figma 116:351): image, white caption bar with the title. Opens dtu.dk. */
export function EventCard({ item, tall = false }: { item: DtuEvent; tall?: boolean }) {
  return (
    <a className="event-card" href={item.url} target="_blank" rel="noopener noreferrer">
      <CardImage src={item.imageUrl} className={'event-card__img' + (tall ? ' event-card__img--tall' : '')} />
      <p className="event-card__title">{item.title}</p>
    </a>
  );
}

/** Placeholder card while the data loads or when there is nothing to show. */
export function EmptyCard({ text }: { text: string }) {
  return <p className="dtu-card-empty">{text}</p>;
}
