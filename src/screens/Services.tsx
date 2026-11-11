import { Link } from 'react-router-dom';
import SubHeader from '../components/SubHeader';
import './DtuPages.css';

/** "Services for students" (Figma 45:154): four colored tiles, each opens an in-app info page. */
const SERVICES = [
  { to: '/dtu/services/abroad', label: 'Study Abroad', icon: 'icon-plane.svg', w: 20, h: 16, mod: 'abroad' },
  { to: '/dtu/services/career', label: 'DTU Career Hub', icon: 'icon-job.svg', w: 24, h: 24, mod: 'career' },
  { to: '/dtu/services/life', label: 'Student Life', icon: 'icon-party.svg', w: 24, h: 24, mod: 'life' },
  { to: '/dtu/services/wellbeing', label: 'Well being & Support', icon: 'icon-heart.svg', w: 24, h: 24, mod: 'wellbeing' },
];

export default function Services() {
  return (
    <div className="sub-screen">
      <SubHeader title="Services for students" stacked />
      <nav className="services">
        {SERVICES.map((s) => (
          <Link key={s.to} to={s.to} className={'service-tile service-tile--' + s.mod}>
            {s.label}
            <img src={'/images/dtu/' + s.icon} width={s.w} height={s.h} alt="" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
