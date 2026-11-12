import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SubHeader from '../components/SubHeader';
import { LINKS } from '../config/links';
import { venueInfo, type Dish } from '../data/venueInfo';
import './VenuePage.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/** Today as 0..4 (Monday..Friday) in Copenhagen; weekend shows Monday. */
function todayIndex() {
  const day = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Copenhagen', weekday: 'long' }).format(new Date());
  const i = DAYS.indexOf(day);
  return i < 0 ? 0 : i;
}

/** Ordering happens in the real eat@DTU app: App Store on iPhone, Google Play otherwise. */
function orderUrl() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ? LINKS.eatDtuIos : LINKS.eatDtuAndroid;
}

/**
 * eat@DTU venue page (Figma 275:425, the eat@DTU Android app): name, "Order here" (opens the eat@DTU app),
 * weekly menu, "WHEN & WHERE" with the real DTU opening hours, link to the campus map. No ordering in the prototype.
 */
export default function VenuePage() {
  const { venueId = '' } = useParams();
  const info = venueInfo[venueId];
  const [day, setDay] = useState(todayIndex);

  if (!info) {
    return (
      <div className="sub-screen venue">
        <SubHeader title="Venue" />
        <p className="venue__empty">This venue does not exist.</p>
      </div>
    );
  }

  return (
    <div className="sub-screen venue">
      <header className="venue__top">
        <SubHeader />
        <img className="venue__logo" src="/images/dtu-logo-small.png" alt="DTU" />
      </header>

      <h1 className="venue__name">{info.title}</h1>

      <a className="venue__order" href={orderUrl()} target="_blank" rel="noopener noreferrer">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2 6 0 8v10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Order in eat@DTU</span>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>

      <section className="venue__section">
        <h2 className="venue__heading">Weekly menu</h2>
        {info.menu.kind === 'week' ? (
          <>
            <div className="venue__days" role="tablist" aria-label="Day">
              {DAYS.map((d, i) => (
                <button key={d} type="button" role="tab" aria-selected={day === i} className={'venue__day' + (day === i ? ' is-active' : '')} onClick={() => setDay(i)}>
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
            <DishList dishes={info.menu.days[day]} />
          </>
        ) : (
          info.menu.sections.map((s) => (
            <div key={s.title} className="venue__group">
              <h3 className="venue__subheading">{s.title}</h3>
              <DishList dishes={s.items} />
            </div>
          ))
        )}
      </section>

      <section className="venue__info">
        <h2 className="venue__caps">{info.title}</h2>
        {info.description && <p>{info.description}</p>}
        <h2 className="venue__caps">When &amp; where</h2>
        {info.hours.map((h) => (
          <p key={h.days}>
            <strong>{info.building}</strong> {h.days} {h.time}
          </p>
        ))}
        <h2 className="venue__caps">Find food &amp; drinks on campus</h2>
        <Link to="/campus/map" className="venue__map-link">
          View map of canteens &amp; cafées
        </Link>
      </section>
    </div>
  );
}

function DishList({ dishes }: { dishes: Dish[] }) {
  return (
    <ul className="venue__dishes">
      {dishes.map((d) => (
        <li key={d.name} className="venue__dish">
          <span className="venue__dish-name">
            {d.name}
            {d.veg && <span className="venue__veg">Veg</span>}
          </span>
          <span className="venue__price">{d.price} kr.</span>
        </li>
      ))}
    </ul>
  );
}
