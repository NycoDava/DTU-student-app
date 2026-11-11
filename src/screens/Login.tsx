import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LINKS } from '../config/links';
import './Login.css';

/** Fake login: fields accept any input, Access always goes to Home. No network call. */
export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    navigate('/home');
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
        />
        <input
          className="login__input"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login__button" type="submit">
          Access
        </button>
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
