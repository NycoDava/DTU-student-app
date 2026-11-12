import { useMemo, useState } from 'react';
import LinkRow from '../../components/LinkRow';
import { plainText } from '../../data/courseData';
import { formatLongDateTime } from '../../data/format';
import type { Person } from '../../data/types';
import { useCourse } from './CourseLayout';

const LINK_PROPS = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** My Course tab (Figma 42:205): Classlist link, Groups, course announcements. */
export function MyCourseTab() {
  const { course, data } = useCourse();
  const [showAll, setShowAll] = useState(false);

  const classlist = data.classlists[course.id];
  const group = classlist?.group ?? null;
  const groupAssignments = data.deadlines.filter((d) => d.courseId === course.id && d.isGroup).length;
  const announcements = data.announcements
    .filter((a) => a.courseId === course.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const shown = showAll ? announcements : announcements.slice(0, 3);

  return (
    <div className="my-course">
      <section className="my-course__block">
        {classlist?.ok ? (
          <LinkRow variant="section" to={`/courses/${course.id}/classlist`} meta={`${classlist.people.length} people`}>
            Classlist
          </LinkRow>
        ) : (
          <>
            <span className="my-course__heading">Classlist</span>
            <p className="my-course__light">Not available for this course</p>
          </>
        )}
      </section>

      <section className="my-course__block">
        <h2 className="my-course__heading">Groups</h2>
        {group ? (
          <>
            <p className="my-course__light">{group.category}</p>
            <p className="my-course__light">
              Group: <span className="my-course__value">{group.name.replace(/^Group\s*/i, '')}</span>
            </p>
            <p className="my-course__light">
              Members:{' '}
              <span className="my-course__value">
                {group.members}/{group.maxMembers}
              </span>
            </p>
          </>
        ) : (
          <p className="my-course__light">You are not in a group in this course</p>
        )}
        <p className="my-course__light">
          Group assignments: <span className="my-course__value">{groupAssignments}</span>
        </p>
      </section>

      <section className="my-course__block my-course__block--last">
        <h2 className="my-course__heading my-course__heading--bold">Announcements</h2>
        {announcements.length === 0 && <p className="my-course__light">No announcements in this course</p>}
        {shown.map((a) => (
          <article key={a.id} className="my-course__announcement">
            {a.url ? (
              <a href={a.url} {...LINK_PROPS} className="my-course__ann-title">
                {a.title}
              </a>
            ) : (
              <span className="my-course__ann-title">{a.title}</span>
            )}
            <p className="my-course__light">Posted on {formatLongDateTime(a.createdAt)}</p>
            <p className="my-course__ann-text">{plainText(a.text)}</p>
          </article>
        ))}
        {announcements.length > 3 && (
          <button type="button" className="my-course__see-all" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show less' : `See all (${announcements.length})`}
          </button>
        )}
      </section>
    </div>
  );
}

/** "Bærentzen, J. Andreas" → "J. Andreas Bærentzen" (Learn stores "Last, First"). */
const displayName = (name: string) => {
  const [last, first] = name.split(/,\s*/);
  return first ? `${first} ${last}` : name;
};
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^\p{L}/u.test(w))
    .map((w) => w[0])
    .filter((_, i, all) => i === 0 || i === all.length - 1)
    .join('')
    .toUpperCase();
const isStudent = (p: Person) => p.role === 'Student';

/** Avatar color token (--avatar-1..6 in tokens.css), picked from the person id so it stays stable. */
const avatarColor = (id: string) => `var(--avatar-${(Number(id.replace(/\D/g, '') || 0) % 6) + 1})`;

type Filter = 'all' | 'students' | 'instructors';

/** Classlist (Figma 227:460): search, role filter, instructors first, own row marked "You". Initials only, no photos. */
export function ClasslistTab() {
  const { course, data } = useCourse();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const people = useMemo(
    () =>
      (data.classlists[course.id]?.people ?? [])
        .map((p) => ({ ...p, display: displayName(p.name) }))
        .sort((a, b) => Number(isStudent(a)) - Number(isStudent(b)) || a.display.localeCompare(b.display)),
    [data.classlists, course.id],
  );

  const q = query.trim().toLowerCase();
  const list = people.filter(
    (p) =>
      (filter === 'all' || (filter === 'students') === isStudent(p)) &&
      (!q || p.display.toLowerCase().includes(q) || (p.email ?? '').toLowerCase().includes(q)),
  );

  return (
    <div className="classlist">
      <div className="classlist__head">
        <h2 className="classlist__title">Classlist</h2>
        <label className="classlist__filter">
          <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} aria-label="Show">
            <option value="all">All</option>
            <option value="students">Students</option>
            <option value="instructors">Instructors</option>
          </select>
          <img src="/icons/chevron-down.svg" width={24} height={24} alt="" />
        </label>
      </div>
      <label className="classlist__search">
        <img src="/icons/search.svg" width={20} height={20} alt="" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          aria-label="Search the classlist"
        />
      </label>

      <ul className="classlist__list">
        {list.map((p) => (
          <li key={p.id} className="classlist__row">
            <span
              className="classlist__avatar"
              style={{ background: avatarColor(p.id) }}
              aria-hidden
            >
              {initials(p.display)}
            </span>
            <span className="classlist__name">
              {p.display}
              {p.isMe && <span className="classlist__you"> (You)</span>}
            </span>
            <span className="classlist__details">
              <span>
                <b>email</b>:{' '}
                {p.email ? <a href={`mailto:${p.email}`}>{p.email}</a> : '–'}
              </span>
              <span>
                <b>role</b>: {isStudent(p) ? 'Student' : 'Instructor'}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="course-empty">{people.length ? 'Nobody matches' : 'No classlist for this course'}</p>}
    </div>
  );
}
