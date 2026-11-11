import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../data/types';
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

  const showImage = course.localImage && !imageFailed;
  return (
    <Link to={`/courses/${course.id}`} className="course-card">
      <div className="course-card__banner">
        {showImage ? (
          <img src={`/course-images/${course.localImage}`} alt="" onError={() => setImageFailed(true)} />
        ) : (
          <span className="course-card__code">{course.code}</span>
        )}
      </div>
      <div className="course-card__label">
        {course.code} {course.name}, {course.term}
      </div>
    </Link>
  );
}
