import { useState } from 'react';
import SubHeader from '../components/SubHeader';
import EctsProgress from '../components/EctsProgress';
import LinkRow from '../components/LinkRow';
import GradesChart from '../components/GradesChart';
import EctsDistribution from '../components/EctsDistribution';
import { grades, studyplan, summary } from '../data/appData';
import { lastGrade } from '../lib/gpa';
import '../components/SubScreen.css';
import './Grades.css';

/**
 * "Grades and ECTS" (Figma 27:16, cleaned up): degree progress in ECTS on top, then grades (GPA, last grade, trend).
 * Deviation from Figma (author's request): "N activities planned/completed" + pie replaced by one ECTS progress bar;
 * underlined "→" links replaced by tappable rows.
 */
export default function Grades() {
  const [showDistribution, setShowDistribution] = useState(false);
  const last = lastGrade(grades);

  return (
    <div className="sub-screen grades">
      <SubHeader title="Progress" />

      <section className="grades__section">
        <EctsProgress />
        <div className="grades__rows">
          <LinkRow onClick={() => setShowDistribution(true)}>ECTS by course type</LinkRow>
          <LinkRow to="/studyplanner">Studyplanner</LinkRow>
        </div>
      </section>

      <section className="grades__section">
        <h2 className="grades__title">Grades</h2>

        <div className="grades__stats">
          <div className="grades__stat">
            <span className="grades__stat-value">{summary.gpa.toFixed(2)}</span>
            <span className="grades__stat-label">Current GPA</span>
          </div>
          <div className="grades__stat grades__stat--wide">
            <span className="grades__stat-label">Last grade</span>
            {last ? (
              <span className="grades__last">
                <strong>{last.grade}</strong> {last.code} {last.title} · {last.ects} ECTS
              </span>
            ) : (
              <span className="grades__muted">No grades yet</span>
            )}
          </div>
        </div>

        <div className="grades__rows">
          <LinkRow to="/grades/list" meta={`${grades.length}`}>
            All grades
          </LinkRow>
          <LinkRow to="/grades/calculator">GPA calculator</LinkRow>
        </div>

        <h3 className="grades__subtitle">Grade trend</h3>
        <GradesChart grades={grades} />
      </section>

      {showDistribution && <EctsDistribution studyplan={studyplan} onClose={() => setShowDistribution(false)} />}
    </div>
  );
}
