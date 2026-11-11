import { useState, type FormEvent } from 'react';
import SubHeader from '../components/SubHeader';
import { grades, summary } from '../data/appData';
import { expectedGpa, GRADE_SCALE } from '../lib/gpa';
import '../components/SubScreen.css';
import './GpaCalculator.css';

/** "GPA calculator" (Figma 44:40): pick an expected grade and ECTS, see the expected GPA. */
export default function GpaCalculator() {
  const [grade, setGrade] = useState('');
  const [ects, setEcts] = useState('5');
  const [result, setResult] = useState<{ text: string; ok: boolean } | null>(null);

  function calculate(e: FormEvent) {
    e.preventDefault();
    const r = expectedGpa(grades, grade, Number(ects.replace(',', '.')));
    setResult(r.ok ? { text: r.gpa.toFixed(2), ok: true } : { text: r.error, ok: false });
  }

  function step(delta: number) {
    const n = Number(ects.replace(',', '.'));
    const next = Math.max(0, (Number.isFinite(n) ? n : 0) + delta);
    setEcts(String(next));
    setResult(null);
  }

  return (
    <div className="sub-screen gpa-calc">
      <SubHeader title="GPA calculator" />

      <form className="gpa-calc__form" onSubmit={calculate} noValidate>
        <p className="gpa-calc__line">Current GPA: {summary.gpa.toFixed(2)}</p>
        <p className="gpa-calc__line">Current ECTS passed: {summary.ectsPassed}</p>

        <fieldset className="gpa-calc__group">
          <legend className="gpa-calc__line">Expected grade:</legend>
          <div className="gpa-calc__chips">
            {GRADE_SCALE.map((g) => (
              <button
                key={g}
                type="button"
                className={'gpa-calc__chip' + (grade === g ? ' gpa-calc__chip--active' : '')}
                aria-pressed={grade === g}
                onClick={() => {
                  setGrade(g);
                  setResult(null);
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="gpa-calc__group">
          <span className="gpa-calc__line">Ects expected:</span>
          <span className="gpa-calc__stepper">
            <button type="button" onClick={() => step(-2.5)} aria-label="Less ECTS">
              −
            </button>
            <input
              type="text"
              inputMode="decimal"
              value={ects}
              onChange={(e) => {
                setEcts(e.target.value);
                setResult(null);
              }}
            />
            <button type="button" onClick={() => step(2.5)} aria-label="More ECTS">
              +
            </button>
          </span>
        </label>

        <button type="submit" className="gpa-calc__submit">
          Calculate
        </button>
      </form>

      {result && (
        <p className={'gpa-calc__result' + (result.ok ? '' : ' gpa-calc__result--error')} role="status">
          {result.ok ? (
            <>
              Expected GPA: <strong>{result.text}</strong>
            </>
          ) : (
            result.text
          )}
        </p>
      )}
    </div>
  );
}
