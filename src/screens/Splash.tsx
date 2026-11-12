import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataFetchedAt, dataMode } from '../data/appFile';
import './Splash.css';

const SPLASH_MS = 1000;

/**
 * "open app" frame: only the DTU logo, shown for one second.
 * Live mode with saved data: straight to Home (log in only when a refresh needs it). Demo mode: the login screen.
 */
export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const next = dataMode === 'live' && dataFetchedAt ? '/home' : '/login';
    const timer = setTimeout(() => navigate(next, { replace: true }), SPLASH_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="screen splash">
      <img className="splash__logo" src="/images/dtu-logo.png" alt="DTU - Technical University of Denmark" />
    </div>
  );
}
