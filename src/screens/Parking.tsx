import { useState } from 'react';
import SubHeader from '../components/SubHeader';
import LinkRow from '../components/LinkRow';
import { LINKS } from '../config/links';
import { CAMPUSES, directionsUrl, useCarParks, type Campus, type CarPark } from '../data/parking';
import { formatTime } from '../data/format';
import './Parking.css';

/**
 * Parking (author's request, idea from the DTU campus web app): Car = DTU car parks with live free spaces where sensors
 * exist (Sensade), capacity / free or paid / EV spaces for the others, directions in the phone's maps app.
 * Bike = the official DTU bicycle map (racks, covered, sharing hubs, repair stands) embedded.
 */
export default function Parking() {
  const [mode, setMode] = useState<'car' | 'bike'>('car');
  const [campus, setCampus] = useState<Campus>('lyngby');

  return (
    <div className={'sub-screen parking' + (mode === 'bike' ? ' parking--bike' : '')}>
      <SubHeader title="Parking" />

      <div className="sub-tabs parking__modes" role="tablist" aria-label="Vehicle">
        {(['car', 'bike'] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} className={'sub-tabs__tab' + (mode === m ? ' sub-tabs__tab--active' : '')} onClick={() => setMode(m)}>
            {m === 'car' ? 'Car' : 'Bike'}
          </button>
        ))}
      </div>

      <div className="parking__campuses" role="tablist" aria-label="Campus">
        {CAMPUSES.map((c) => (
          <button key={c.key} type="button" role="tab" aria-selected={campus === c.key} className={'parking__campus' + (campus === c.key ? ' is-active' : '')} onClick={() => setCampus(c.key)}>
            {c.label}
          </button>
        ))}
      </div>

      {mode === 'car' ? <CarParks campus={campus} /> : <BikeMap campus={campus} />}
    </div>
  );
}

function CarParks({ campus }: { campus: Campus }) {
  const { parks, error, updatedAt, campusOf } = useCarParks();
  if (!parks) return <p className="parking__status">{error ? 'Parking data needs an internet connection' : 'Loading…'}</p>;

  const here = parks.filter((p) => campusOf(p.lat) === campus).sort((a, b) => a.name.localeCompare(b.name, 'da'));
  const live = here.filter((p) => p.free !== null);
  const others = here.filter((p) => p.free === null);
  const ev = here.reduce((n, p) => n + p.evSpaces, 0);
  const total = here.reduce((n, p) => n + p.spaces, 0);

  return (
    <>
      <dl className="parking__stats">
        <div>
          <dt>Free now</dt>
          <dd>{live.length ? live.reduce((n, p) => n + (p.free ?? 0), 0) : '–'}</dd>
        </div>
        <div>
          <dt>Spaces</dt>
          <dd>{total}</dd>
        </div>
        <div>
          <dt>EV charging</dt>
          <dd>{ev}</dd>
        </div>
      </dl>

      {live.length > 0 && (
        <section className="parking__section">
          <h2 className="parking__heading">
            Live <span className="parking__live-dot" aria-hidden="true" />
            {updatedAt && <span className="parking__time">{formatTime(updatedAt.toISOString())}</span>}
          </h2>
          <ul className="parking__list">
            {live.map((p) => (
              <LiveLot key={p.id} park={p} />
            ))}
          </ul>
        </section>
      )}

      <section className="parking__section">
        <h2 className="parking__heading">Car parks</h2>
        <div className="parking__rows">
          {others.map((p) => (
            <LinkRow key={p.id} href={directionsUrl(p.lat, p.lng)} meta={`${p.spaces} · ${p.freeParking ? 'Free' : 'Paid'}`}>
              <span className="parking__name">{p.name}</span>
              <span className="parking__address">
                {p.address}
                {p.evSpaces > 0 && ` · ${p.evSpaces} EV`}
              </span>
            </LinkRow>
          ))}
        </div>
      </section>

      <a className="parking__credit" href={LINKS.sensadeMap} target="_blank" rel="noopener noreferrer">
        Live data by Sensade
      </a>
    </>
  );
}

function LiveLot({ park }: { park: CarPark }) {
  const free = park.free ?? 0;
  const pct = park.spaces > 0 ? Math.round(((park.spaces - free) / park.spaces) * 100) : 0;
  return (
    <li>
      <a className="parking__lot" href={directionsUrl(park.lat, park.lng)} target="_blank" rel="noopener noreferrer">
        <span className="parking__lot-head">
          <span className="parking__name">{park.name}</span>
          <span className="parking__free">
            <strong>{free}</strong> free
          </span>
        </span>
        <span className="parking__bar" aria-label={`${pct}% occupied`}>
          <span style={{ width: `${pct}%` }} />
        </span>
        <span className="parking__address">
          {park.spaces} spaces{park.evSpaces > 0 && ` · ${park.evSpaces} EV`} · {park.freeParking ? 'Free' : 'Paid'}
        </span>
      </a>
    </li>
  );
}

function BikeMap({ campus }: { campus: Campus }) {
  const src = LINKS.bikeMap[campus];
  return (
    <div className="parking__bike">
      <iframe key={src} src={src} title="DTU bicycle map" allow="geolocation" />
      <a className="parking__credit" href={src} target="_blank" rel="noopener noreferrer">
        DTU bicycle map
      </a>
    </div>
  );
}
