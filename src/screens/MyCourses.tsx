import { useState } from 'react';
import SubHeader from '../components/SubHeader';
import CourseCard from '../components/CourseCard';
import { useCourseData } from '../data/courseData';
import './MyCourses.css';

/** My Courses (Figma 116:377): search by course number or name, all courses, newest term first. */
export default function MyCourses() {
  const [query, setQuery] = useState('');
  const { courses, loading } = useCourseData();

  const q = query.trim().toLowerCase();
  const list = courses
    .filter((c) => !q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
    .sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));

  return (
    <div className="sub-screen my-courses">
      <SubHeader />
      <label className="my-courses__search">
        <img src="/icons/search.svg" width={24} height={24} alt="" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for courses"
          aria-label="Search for courses by number or name"
        />
      </label>

      <ul className="my-courses__list">
        {list.map((course) => (
          <li key={course.id}>
            <CourseCard course={course} />
          </li>
        ))}
      </ul>
      {!loading && list.length === 0 && (
        <p className="my-courses__empty">{q ? `No course matches “${query.trim()}”` : 'No courses yet'}</p>
      )}
    </div>
  );
}
