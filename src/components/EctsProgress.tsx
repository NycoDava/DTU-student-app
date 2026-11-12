import { summary } from '../data/appData';
import './EctsProgress.css';

/**
 * Degree progress in ECTS, the unit students use (replaces "N activities planned / completed" + pie):
 * one bar passed | planned | missing and a legend. No explanatory text (author's request: keep it minimal).
 * Same component on Grades (full) and My studies (compact), so both always say the same thing.
 */
export default function EctsProgress({ compact = false }: { compact?: boolean }) {
  const required = summary.ectsRequired;
  const passed = summary.ectsPassed;
  const planned = summary.ectsPlanned;
  const missing = Math.max(required - passed - planned, 0);
  const scale = Math.max(required, passed + planned, 1);
  const pct = (n: number) => `${(n / scale) * 100}%`;

  return (
    <div className={'ects-progress' + (compact ? ' ects-progress--compact' : '')}>
      <p className="ects-progress__headline">
        <strong>{passed}</strong> of {required} ECTS passed
      </p>

      <div
        className="ects-progress__bar"
        role="img"
        aria-label={`${passed} ECTS passed, ${planned} planned, ${missing} missing, of ${required}`}
      >
        <span className="ects-progress__seg ects-progress__seg--passed" style={{ width: pct(passed) }} />
        <span className="ects-progress__seg ects-progress__seg--planned" style={{ width: pct(planned) }} />
        {required < scale && <span className="ects-progress__goal" style={{ left: pct(required) }} aria-hidden="true" />}
      </div>

      <ul className="ects-progress__legend">
        <li>
          <i className="ects-progress__dot ects-progress__dot--passed" /> {passed} passed
        </li>
        <li>
          <i className="ects-progress__dot ects-progress__dot--planned" /> {planned} planned
        </li>
        <li>
          <i className="ects-progress__dot ects-progress__dot--missing" /> {missing} missing
        </li>
      </ul>
    </div>
  );
}
