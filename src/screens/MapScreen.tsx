import { useNavigate } from 'react-router-dom';
import CampusMap from '../components/CampusMap';
import './MapScreen.css';

/** Full map inside the app (Figma "Map", 30:214): no tab bar, MazeMap search on top, "reduce" button back to Campus. */
export default function MapScreen() {
  const navigate = useNavigate();

  function close() {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate('/campus');
  }

  return (
    <div className="map-screen">
      <div className="map-screen__frame">
        <CampusMap />
        <button type="button" className="map-screen__reduce" onClick={close} aria-label="Close the full map">
          <img src="/icons/reduce.svg" width={46} height={46} alt="" />
        </button>
      </div>
    </div>
  );
}
