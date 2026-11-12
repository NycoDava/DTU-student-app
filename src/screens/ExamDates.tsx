import { useLayoutEffect, useRef, useState } from 'react';
import SubHeader from '../components/SubHeader';
import { examPeriods, type ExamDay } from '../data/examDates';
import { LINKS } from '../config/links';
import { myExams } from '../data/appData';
import type { MyExam } from '../lib/schedule';
import './ExamDates.css';

/**
 * Exam dates (Figma 163:1493). On top "My exams": the user's courses from the study plan matched to the DTU timetable
 * (author's request). Below, the official DTU timetable (static, the same for everyone), one exam period at a time;
 * days with one of my exams are highlighted. Only periods that are not over yet; the first one is selected.
 */
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** Today in Copenhagen as "YYYY-MM-DD" (same format as the exam dates, so strings compare). */
function todayInCopenhagen() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Copenhagen' }).format(new Date());
}

/** "2027-01-12" -> "12/1 2027", as on the DTU page. */
function shortDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}/${m} ${y}`;
}

export default function ExamDates() {
  const today = todayInCopenhagen();
  const periods = examPeriods.filter((p) => p.exams[p.exams.length - 1].date >= today);
  const [selected, setSelected] = useState(0);
  const period = periods[selected];

  return (
    <div className="sub-screen exams">
      <SubHeader title="Exam dates" />

      {myExams.length > 0 && (
        <section className="exams__mine">
          <h2 className="exams__heading">My exams</h2>
          <ul className="exams__list">
            {myExams.map((e) => (
              <MyExamRow key={e.code} exam={e} />
            ))}
          </ul>
        </section>
      )}

      <h2 className="exams__heading">DTU exam timetable</h2>

      {period ? (
        <>
          <label className="exams__picker">
            <span className="exams__picker-text">{period.title}</span>
            <span className="exams__picker-icon">
              <img src="/icons/chevron-down.svg" width={24} height={24} alt="" />
            </span>
            <select value={selected} onChange={(e) => setSelected(Number(e.target.value))} aria-label="Exam period">
              {periods.map((p, i) => (
                <option key={p.title} value={i}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>

          <ul className="exams__list">
            {period.exams.map((exam) => (
              <ExamCard
                key={exam.date}
                exam={exam}
                past={exam.date < today}
                mine={myExams.filter((m) => m.date === exam.date).map((m) => m.code)}
              />
            ))}
          </ul>
        </>
      ) : (
        <p className="exams__empty">No upcoming exam periods in this prototype.</p>
      )}

      <a className="exams__source" href={LINKS.examDates} target="_blank" rel="noreferrer">
        Source: DTU exam dates
        <img src="/icons/external-link.svg" width={14} height={14} alt="" />
      </a>
    </div>
  );
}

/** Card 342 x 94 as in Figma. Very long course lists are cut at 2 lines; tapping the card shows them all. */
/** One of my exams, in the same card as the DTU timetable (author's design, Figma 163:1493). */
function MyExamRow({ exam }: { exam: MyExam }) {
  const [, m, d] = exam.date ? exam.date.split('-').map(Number) : [0, 0, 0];
  return (
    <li>
      <div className="exam-card">
        <span className="exam-card__date">
          {exam.date ? (
            <>
              {MONTHS[m - 1]}
              <br />
              {d}
            </>
          ) : (
            exam.period.slice(0, 3).toUpperCase()
          )}
        </span>
        <span className="exam-card__text">
          <span>
            {exam.code} {exam.name}
          </span>
          <span className="exam-card__deadline">
            {exam.date ? `${exam.period}${exam.via ? ` · ${exam.via}` : ''}` : `${exam.period} · 3-week course`}
          </span>
        </span>
      </div>
    </li>
  );
}

function ExamCard({ exam, past, mine }: { exam: ExamDay; past: boolean; mine: string[] }) {
  const [, m, d] = exam.date.split('-').map(Number);
  const coursesRef = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState(false);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const el = coursesRef.current;
    if (el && !open) setCut(el.scrollHeight > el.clientHeight + 1);
  }, [open]);

  const content = (
    <>
      <span className="exam-card__date">
        {MONTHS[m - 1]}
        <br />
        {d}
      </span>
      <span className="exam-card__text">
        <span>Course Numbers:</span>
        <span ref={coursesRef} className={'exam-card__courses' + (open ? ' exam-card__courses--open' : '')}>
          {exam.courses.join('\n')}
        </span>
        <span className="exam-card__deadline">Grading Deadline: {shortDate(exam.gradingDeadline)}</span>
        {mine.length > 0 && <span className="exam-card__mine">Your exam: {mine.join(', ')}</span>}
      </span>
    </>
  );

  const className = 'exam-card' + (past ? ' exam-card--past' : '') + (open ? ' exam-card--open' : '') + (mine.length ? ' exam-card--mine' : '');
  return (
    <li>
      {cut || open ? (
        <button type="button" className={className} onClick={() => setOpen(!open)} aria-expanded={open}>
          {content}
        </button>
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  );
}
