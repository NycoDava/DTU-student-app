import SubHeader from '../components/SubHeader';
import { grades } from '../data/appData';
import { periodKey } from '../lib/gpa';
import './GradesList.css';

/** Danish 7-point scale → ECTS letter, shown as in Figma: "10 (B)". */
const ECTS_LETTER: Record<string, string> = { '12': 'A', '10': 'B', '7': 'C', '4': 'D', '02': 'E', '00': 'Fx', '-3': 'F' };

/** List of grades (Figma 38:24): Number / Title / Grade / ECTS, latest exam period first, then course code. */
export default function GradesList() {
  const list = [...grades].sort((a, b) => periodKey(b.period) - periodKey(a.period) || a.code.localeCompare(b.code));

  return (
    <div className="sub-screen grades-list">
      <SubHeader title="List of Grades" />
      <div className="grades-list__row grades-list__row--head" aria-hidden="true">
        <span>Number</span>
        <span className="grades-list__title">Title</span>
        <span>Grade</span>
        <span>ECTS</span>
      </div>
      <ul className="grades-list__list">
        {list.map((g) => (
          <li key={`${g.code}-${g.period}`} className={'grades-list__row' + (g.passed ? '' : ' grades-list__row--failed')}>
            <span>{g.code}</span>
            <span className="grades-list__title">{g.title}</span>
            <span>
              {ECTS_LETTER[g.grade] ? `${g.grade} (${ECTS_LETTER[g.grade]})` : g.grade}
              {!g.passed && <span className="grades-list__note">not passed</span>}
            </span>
            <span>{g.ects}</span>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="grades-list__empty">No grades yet</p>}
    </div>
  );
}
