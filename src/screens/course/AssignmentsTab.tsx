import { LINKS } from '../../config/links';
import { formatLongDateTime } from '../../data/format';
import { useCourse } from './CourseLayout';

/**
 * Assignments tab (Figma 42:174): one card per deadline of this course, in date order, past ones greyed.
 * Learn submission/evaluation status is not in the data, so the card links to DTU Learn instead.
 */
export function AssignmentsTab() {
  const { course, data } = useCourse();
  const group = data.classlists[course.id]?.group ?? null;
  const now = Date.now();
  const list = data.deadlines
    .filter((d) => d.courseId === course.id)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));

  if (list.length === 0) return <p className="course-empty">No assignments in this course</p>;
  return (
    <ul className="assignments">
      {list.map((d) => {
        const past = new Date(d.dueAt).getTime() < now;
        const href = d.url ?? course.url ?? LINKS.learn;
        return (
          <li key={d.id} className={'assignment' + (past ? ' assignment--past' : '')}>
            <a href={href} target="_blank" rel="noopener noreferrer" className="assignment__title">
              {d.isGroup && group ? `${group.name}: ${d.title}` : d.title}
            </a>
            <p className="assignment__meta">
              {past ? 'Was due on' : 'Due on'} {formatLongDateTime(d.dueAt)}
            </p>
            <p className="assignment__meta">{d.isGroup ? 'Group assignment' : 'Individual assignment'}</p>
            <a href={href} target="_blank" rel="noopener noreferrer" className="assignment__learn">
              Submission and evaluation status in DTU Learn
              <img src="/icons/external-link.svg" width={12} height={12} alt="" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
