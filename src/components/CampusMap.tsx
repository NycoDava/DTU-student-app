import { useEffect, useState } from 'react';
import { LINKS } from '../config/links';
import './CampusMap.css';

/**
 * MazeMap embedded in the app (iframe, needs internet).
 * - `mini`: Campus page preview, not touchable, centered on the user when the browser shares the position
 *   (blue dot drawn by us in the center; MazeMap's embed has no "show my position" option).
 * - full: the real interactive map (search, routes, MazeMap's own location button).
 * Offline: the Figma screenshot of the map with a message.
 */
const DTU_LYNGBY = { lng: 12.519825, lat: 55.786341 };

function embedUrl(center: { lng: number; lat: number }, zoom: number) {
  return `${LINKS.mazemapEmbedBase}#v=1&config=DTU&zlevel=1&center=${center.lng},${center.lat}&zoom=${zoom}&utm_medium=iframe`;
}

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

/** Position of the user, or null (no permission / not available). Asked once per page. */
function usePosition() {
  const [pos, setPos] = useState<{ lng: number; lat: number } | null>(null);
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lng: p.coords.longitude, lat: p.coords.latitude }),
      () => setPos(null),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);
  return pos;
}

export default function CampusMap({ mini = false }: { mini?: boolean }) {
  const online = useOnline();
  const pos = usePosition();

  if (!online) {
    return (
      <div className="campus-map campus-map--offline">
        <img src="/images/campus/map-offline.png" alt="" />
        <p>Map needs an internet connection</p>
      </div>
    );
  }

  const src = embedUrl(pos ?? DTU_LYNGBY, mini ? (pos ? 17.5 : 16) : pos ? 17 : 16);
  return (
    <div className={'campus-map' + (mini ? ' campus-map--mini' : '')}>
      <iframe
        key={src}
        src={src}
        title={mini ? 'Campus map preview' : 'Campus map by MazeMap'}
        allow="geolocation"
        tabIndex={mini ? -1 : undefined}
      />
      {mini && pos && <span className="campus-map__me" aria-label="You are here" />}
      <a className="campus-map__credit" href={LINKS.mazemap} target="_blank" rel="noreferrer">
        Map by MazeMap
      </a>
    </div>
  );
}
