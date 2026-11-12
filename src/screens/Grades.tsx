import { useState } from 'react';
import { Link } from 'react-router-dom';
import SubHeader from '../components/SubHeader';
import EctsPie from '../components/EctsPie';
import GradesChart from '../components/GradesChart';
import EctsDistribution from '../components/EctsDistribution';
import { grades, studyplan, summary } from '../data/appData';
import { lastGrade } from '../lib/gpa';
import { activityCounts } from '../lib/studyplan';
import '../components/SubScreen.css';
import './Grades.css';

/** "Grades and ECTS" (Figma 27:16): ECTS progress on top, grade insights and trend chart below. */
export default function Grades() {
  const [showDistribution, setShowDistribution] = useState(false);
  const { planned, completed } = activityCounts(studyplan, grades);
  const progress = summary.ectsRequired > 0 ? Math.min(summary.ectsPassed / summary.ectsRequired, 1) : 0;
  const last = lastGrade(grades);

  return (
    <div className="sub-screen grades">
      <SubHeader title="Progress" />

      <div
        className="grades__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={summary.ectsRequired}
        aria-valuenow={summary.ectsPassed}
        aria-label="ECTS completed"
      >
        <span className="grades__bar-fill" style={{ width: `${progress * 100}%` }} />
        <span className="grades__bar-text">
          {summary.ectsPassed}/{summary.ectsRequired} ects
        </span>
      </div>

      <div className="grades__plan">
        <div className="grades__pie-col">
          <EctsPie studyplan={studyplan} />
          <button type="button" className="grades__dist-button" onClick={() => setShowDistribution(true)}>
            Show ECTS distribution
          </button>
        </div>
        <div className="grades__counts">
          <p>{planned} activities planned</p>
          <p>{completed} activities completed</p>
          <Link to="/studyplanner" className="grades__link grades__link--planner">
            StudyPlanner→
          </Link>
        </div>
      </div>

      <hr className="grades__divider" />

      <section className="grades__insights">
        <h2 className="grades__title">Grades</h2>
        <Link to="/grades/list" className="grades__link grades__link--center">
          Your list of grades →
        </Link>

        <h3 className="grades__subtitle">Grades Insights</h3>
        <div className="grades__gpa-row">
          <span className="grades__gpa">Current GPA: {summary.gpa.toFixed(2)}</span>
          <Link to="/grades/calculator" className="grades__link grades__link--small">
            GPA calculator →
          </Link>
        </div>

        <div className="grades__last">
          Last grade:
          <br />
          {last ? (
            `${last.code} ${last.title}: ${last.grade} (${last.ects}ects)`
          ) : (
            <span className="grades__muted">No grades yet</span>
          )}
        </div>

        <GradesChart grades={grades} />
      </section>

      {showDistribution && <EctsDistribution studyplan={studyplan} onClose={() => setShowDistribution(false)} />}
    </div>
  );
}
