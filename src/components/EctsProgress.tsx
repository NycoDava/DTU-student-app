import { useMemo } from 'react';
import { grades, studyplan, summary } from '../data/appData';
import { useCurrentUser } from '../data/currentUser';
import { buildBoard, planEnd } from '../lib/studyplan';
import './EctsProgress.css';

const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/**
 * Degree progress in ECTS, the unit students use (replaces "N activities planned / completed" + pie):
 * one bar passed | planned | missing, a legend, and whether the plan covers the degree.
 * Same component on Grades (full) and My studies (compact), so both always say the same thing.
 */
export default function EctsProgress({ compact = false }: { compact?: boolean }) {
  const { user } = useCurrentUser();
  const end = useMemo(() => planEnd(buildBoard(studyplan, grades, user.programme)), [user.programme]);

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

      <p className={'ects-progress__status' + (missing > 0 ? ' ects-progress__status--warn' : '')}>
        {missing > 0
          ? `${missing} ECTS still missing in your plan`
          : `Your plan covers all ${required} ECTS${end ? ` · last period ends ${monthYear.format(end)}` : ''}`}
      </p>
    </div>
  );
}
