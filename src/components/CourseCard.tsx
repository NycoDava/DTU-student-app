import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../data/types';
import { courseImageSrc } from '../data/courseData';
import './CourseCard.css';

/**
 * Figma "My Courses" card: banner image on top, white strip with "code name, term".
 * Without a course it renders the empty slot. Banner falls back to a gradient with the course code.
 */
export default function CourseCard({ course }: { course?: Course }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!course) {
    return (
      <div className="course-card course-card--empty">
        <div className="course-card__banner" />
        <div className="course-card__label">No course yet</div>
      </div>
    );
  }

  const imageSrc = imageFailed ? null : courseImageSrc(course);
  return (
    <Link to={`/courses/${course.id}`} className="course-card">
      <div className="course-card__banner">
        {imageSrc ? (
          <img src={imageSrc} alt="" onError={() => setImageFailed(true)} />
        ) : (
          <span className="course-card__code">{course.code}</span>
        )}
      </div>
      <div className="course-card__label">
        {/* Learn names already read "02830 Course name, Fall 2026" */}
        {course.name}
      </div>
    </Link>
  );
}
