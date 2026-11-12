import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LINKS } from '../config/links';
import { dataFetchedAt, dataMode } from '../data/appFile';
import { getSession, login, refresh, type LoginError } from '../data/liveServer';
import './Login.css';

const ERRORS: Record<LoginError, string> = {
  invalid_credentials: 'DTU did not accept this username or password.',
  mfa_required: 'DTU asks for an extra confirmation (MFA). This prototype cannot do that: use the saved data.',
  rate_limited: 'Too many attempts. Wait 15 minutes and try again.',
  login_in_progress: 'A login is already in progress.',
  login_failed: 'The DTU login did not complete.',
  server_down: 'The local server did not answer. Is "npm run server" still running? Check its terminal.',
};

/**
 * Login (Figma 217:1140).
 * - Demo mode (no local server, e.g. the static test build): fake login, any input goes to Home, no network call.
 * - Live mode (local server running): the credentials go to the LOCAL server only, which logs in to DTU,
 *   then a refresh starts and Home shows its progress. The password is not stored anywhere.
 */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const expired = (location.state as { reason?: string } | null)?.reason === 'expired';
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const live = dataMode === 'live';

  // Live mode: the DTU session is still valid on the local server → no need to log in again.
  useEffect(() => {
    if (!live || expired) return;
    getSession().then((s) => s?.loggedIn && navigate('/home', { replace: true }));
  }, [live, expired, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) {
      navigate('/home');
      return;
    }
    if (!user.trim() || !password) {
      setError('Enter your DTU username and password.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await login(user.trim(), password);
    setPassword(''); // never keep the password in the page longer than needed
    if (!result.ok) {
      setBusy(false);
      // Show the server's exact reason too (never contains the password).
      setError(`${ERRORS[result.error] ?? ERRORS.login_failed}${result.detail ? ` (${result.detail})` : ''}`);
      return;
    }
    await refresh();
    navigate('/home', { replace: true });
  }

  return (
    <div className="screen login">
      <img className="login__photo" src="/images/login-campus.png" alt="DTU campus" />
      <img className="login__logo" src="/images/dtu-logo.png" alt="DTU - Technical University of Denmark" />

      <form className="login__form" onSubmit={handleSubmit}>
        <input
          className="login__input"
          type="text"
          placeholder="User"
          autoComplete="username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          disabled={busy}
        />
        <input
          className="login__input"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
        />
        {live && expired && !error && (
          <p className="login__message">Your DTU session has expired. Sign in again to refresh your data.</p>
        )}
        {error && (
          <p className="login__message login__message--error" role="alert">
            {error}
          </p>
        )}
        <button className="login__button" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Access'}
        </button>
        {live && dataFetchedAt && !busy && (
          <button type="button" className="login__offline" onClick={() => navigate('/home')}>
            Continue with saved data
          </button>
        )}
      </form>

      <div className="login__help">
        <p>
          DTU Users Can change their password{' '}
          <a href={LINKS.changePassword} target="_blank" rel="noreferrer">here</a>
        </p>
        <p>
          Guest.dtu.dk users can change their password{' '}
          <a href={LINKS.guestLogin} target="_blank" rel="noreferrer">here</a>
        </p>
        <p className="login__format">
          <b>Login in the format:</b>
          <br />
          <b>DTU Users:</b> username@dtu.dk
          <br />
          <b>DTU Students:</b> username@dtu.dk
          <br />
          <b>Guest.dtu.dk Users:</b> username@win.dtu.dk
        </p>
      </div>
    </div>
  );
}
