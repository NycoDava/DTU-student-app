import { NavLink } from 'react-router-dom';
import './TabBar.css';

/** Figma "navigation bar" (157:274): red pill, icons only. */
const TABS = [
  { to: '/home', label: 'Home', icon: '/images/tabbar/home.svg' },
  { to: '/student', label: 'Grades and study', icon: '/images/tabbar/school.svg' },
  { to: '/campus', label: 'Campus', icon: '/images/tabbar/map.svg' },
  { to: '/dtu', label: 'DTU', icon: null },
];

export default function TabBar() {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          aria-label={tab.label}
          className={({ isActive }) => 'tabbar__tab' + (isActive ? ' tabbar__tab--active' : '')}
        >
          {tab.icon ? (
            <img src={tab.icon} alt="" />
          ) : (
            <span className="tabbar__dtu">
              <img src="/images/tabbar/dtu.png" alt="" />
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
