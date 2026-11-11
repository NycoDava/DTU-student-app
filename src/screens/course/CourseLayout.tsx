import { useState } from 'react';
import { NavLink, Outlet, useMatch, useOutletContext, useParams } from 'react-router-dom';
import SubHeader from '../../components/SubHeader';
import { courseImageSrc, useCourseData, type CourseData } from '../../data/courseData';
import type { ContentModule, Course } from '../../data/types';
import './Course.css';

export type CourseContext = { course: Course; data: CourseData };
export const useCourse = () => useOutletContext<CourseContext>();

/** Module at a content path like "3" or "3.1" (nested modules), or undefined. */
export function moduleAt(modules: ContentModule[], path: string): ContentModule | undefined {
  let list = modules;
  let found: ContentModule | undefined;
  for (const part of path.split('.')) {
    found = list[Number(part)];
    if (!found) return undefined;
    list = found.modules;
  }
  return found;
}

/**
 * Course page chrome (Figma 42:205 / 40:112 / 42:174): banner with the course picture and title,
 * then the tabs My Course / Content / Assignments. Inside a module (93:2) the tabs become a bar with the module title.
 */
export default function CourseLayout() {
  const { courseId = '' } = useParams();
  const data = useCourseData();
  const [imageFailed, setImageFailed] = useState(false);
  const moduleMatch = useMatch('/courses/:courseId/content/:path');
  const classlistMatch = useMatch('/courses/:courseId/classlist');

  const course = data.courses.find((c) => c.id === courseId);
  if (data.loading) return null;
  if (!course) {
    return (
      <div className="sub-screen">
        <SubHeader title="Course" />
        <p className="course-empty">Course not found.</p>
      </div>
    );
  }

  const base = `/courses/${course.id}`;
  const imageSrc = imageFailed ? null : courseImageSrc(course);
  const module = moduleMatch ? moduleAt(data.courseContent[course.id] ?? [], moduleMatch.params.path ?? '') : undefined;
  // "02830 Advanced project in …, Fall 2026" → title without the term (the code is already in the name).
  const title = course.name.replace(/,\s*(Spring|Fall|Summer|January|June|August)\s+\d{4}$/i, '');
  const tabClass = ({ isActive }: { isActive: boolean }) => 'course-tabs__tab' + (isActive ? ' is-active' : '');

  return (
    <div className="course-page">
      <div className="course-banner">
        {imageSrc ? (
          <img className="course-banner__img" src={imageSrc} alt="" onError={() => setImageFailed(true)} />
        ) : (
          <span className="course-banner__code">{course.code}</span>
        )}
        <div className="course-banner__back">
          <SubHeader />
        </div>
        <h1 className="course-banner__title">{title}</h1>
      </div>

      {module ? (
        <div className="course-module-bar">{module.title}</div>
      ) : (
        <nav className="course-tabs" aria-label="Course sections">
          <NavLink to={base} end className={({ isActive }) => tabClass({ isActive: isActive || !!classlistMatch })}>
            My Course
          </NavLink>
          <NavLink to={`${base}/content`} className={tabClass}>
            Content
          </NavLink>
          <NavLink to={`${base}/assignments`} className={tabClass}>
            Assignments
          </NavLink>
        </nav>
      )}

      <div className="course-body">
        <Outlet context={{ course, data } satisfies CourseContext} />
      </div>
    </div>
  );
}
