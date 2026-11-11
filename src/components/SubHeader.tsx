import { useNavigate } from 'react-router-dom';
import './SubScreen.css';

/**
 * Header of every sub-screen: red back arrow (top left) + title.
 * `stacked` puts the title on its own row under the arrow (long titles, e.g. Study Announcements).
 */
export default function SubHeader({ title, stacked = false }: { title?: string; stacked?: boolean }) {
  const navigate = useNavigate();

  function goBack() {
    // history.state.idx is set by React Router; 0 means there is no previous page in the app.
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate('/home');
  }

  return (
    <header className={'sub-header' + (stacked ? ' sub-header--stacked' : '')}>
      <button type="button" className="sub-header__back" onClick={goBack} aria-label="Back">
        <img src="/icons/back.svg" width={36} height={36} alt="" />
      </button>
      {title && <h1 className="sub-header__title">{title}</h1>}
    </header>
  );
}
