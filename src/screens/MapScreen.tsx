import { useNavigate, useSearchParams } from 'react-router-dom';
import CampusMap from '../components/CampusMap';
import './MapScreen.css';

/**
 * Full map (Figma "Map", 30:214), no tab bar. The close control sits in a bar ABOVE the map (author's request): the full
 * MazeMap app has its own buttons in the top corners, a floating button covered one of them.
 */
export default function MapScreen() {
  const navigate = useNavigate();
  const search = useSearchParams()[0].get('search') ?? undefined; // from "Show on map" in the calendar

  function close() {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate('/campus');
  }

  return (
    <div className="map-screen">
      <header className="map-screen__bar">
        <button type="button" className="map-screen__back" onClick={close} aria-label="Close the map">
          <img src="/icons/back.svg" width={32} height={32} alt="" />
        </button>
        <h1 className="map-screen__title">Campus map</h1>
      </header>
      <div className="map-screen__frame">
        <CampusMap search={search} />
      </div>
    </div>
  );
}
