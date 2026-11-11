import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Splash.css';

const SPLASH_MS = 1000;

/** "open app" frame: only the DTU logo, shown for one second. */
export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login', { replace: true }), SPLASH_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="screen splash">
      <img className="splash__logo" src="/images/dtu-logo.png" alt="DTU - Technical University of Denmark" />
    </div>
  );
}
