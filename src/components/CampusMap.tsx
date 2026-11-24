import { useEffect, useState } from 'react';
import { LINKS } from '../config/links';
import './CampusMap.css';

/**
 * MazeMap embedded in the app (iframe, needs internet).
 * - `mini`: Campus page preview, not touchable, centered on the user when the browser shares the position
 *   (blue dot drawn by us in the center; MazeMap's embed has no "show my position" option).
 * - full: the full MazeMap app (search buildings and rooms, directions, floors, its own location button).
 * Offline: the Figma screenshot of the map with a message.
 */
const DTU_LYNGBY = { lng: 12.519825, lat: 55.786341 };

function embedUrl(center: { lng: number; lat: number }, zoom: number) {
  return `${LINKS.mazemapEmbedBase}#v=1&config=DTU&zlevel=1&center=${center.lng},${center.lat}&zoom=${zoom}&lang=en&utm_medium=iframe`;
}

/** Full MazeMap app (author's request: search a building, get directions). English UI. */
function appUrl(center: { lng: number; lat: number }, zoom: number, search?: string) {
  const query = search ? `&search=${encodeURIComponent(search)}` : '';
  return `${LINKS.mazemapApp}#v=1&config=DTU&campusid=89&zlevel=1&center=${center.lng},${center.lat}&zoom=${zoom}&lang=en${query}`;
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

/** `search`: opens the full map with that search ("358 042" = room 042 in building 358, from a calendar item). */
export default function CampusMap({ mini = false, search }: { mini?: boolean; search?: string }) {
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

  const center = pos ?? DTU_LYNGBY;
  // Preview: the light embed (not touchable). Full screen: the whole MazeMap app with search and directions.
  const src = mini ? embedUrl(center, pos ? 17.5 : 16) : appUrl(center, pos ? 17 : 16, search);
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
