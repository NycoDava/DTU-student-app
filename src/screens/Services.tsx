import { Link } from 'react-router-dom';
import SubHeader from '../components/SubHeader';
import './DtuPages.css';

/**
 * "Services for students" (Figma 45:154, redesigned on the author's request): one row per service with its icon in a
 * soft circle of the Figma color, title, a one-line description and a chevron (replaces the four saturated tiles).
 */
const SERVICES = [
  { to: '/dtu/services/abroad', label: 'Study abroad', desc: 'Exchange semesters worldwide', icon: 'icon-plane.svg', mod: 'abroad' },
  { to: '/dtu/services/career', label: 'DTU Career Hub', desc: 'Internships, projects and jobs', icon: 'icon-job.svg', mod: 'career' },
  { to: '/dtu/services/life', label: 'Student life', desc: 'Sports, parties and PF', icon: 'icon-party.svg', mod: 'life' },
  { to: '/dtu/services/wellbeing', label: 'Wellbeing & support', desc: 'Guidance, counselling and help', icon: 'icon-heart.svg', mod: 'wellbeing' },
];

export default function Services() {
  return (
    <div className="sub-screen">
      <SubHeader title="Services for students" stacked />
      <nav className="services">
        {SERVICES.map((s) => (
          <Link key={s.to} to={s.to} className={'service-row service-row--' + s.mod}>
            <span className="service-row__circle" aria-hidden="true">
              <span className="service-row__icon" style={{ WebkitMaskImage: `url(/images/dtu/${s.icon})`, maskImage: `url(/images/dtu/${s.icon})` }} />
            </span>
            <span className="service-row__text">
              <span className="service-row__label">{s.label}</span>
              <span className="service-row__desc">{s.desc}</span>
            </span>
            <svg className="service-row__chevron" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ))}
      </nav>
    </div>
  );
}
