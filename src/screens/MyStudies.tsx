import { Link } from 'react-router-dom';
import EctsPie from '../components/EctsPie';
import CourseCard from '../components/CourseCard';
import { allCourses, studyProgress } from '../data/studyProgress';
import { recentCourses } from '../data/recentCourses';
import { LINKS } from '../config/links';
import './MyStudies.css';

/** Tab "school" (Figma "my studies", 7:22): ECTS overview, last visited courses, shortcuts. */
export default function MyStudies() {
  const courses = recentCourses(allCourses, 2);
  const slots = [courses[0], courses[1]];

  return (
    <div className="studies">
      <img className="studies__logo" src="/images/dtu-logo-small.png" alt="DTU" />

      <Link to="/grades" className="studies__title studies__title--big">
        Grades and ECTS→
      </Link>

      <div className="studies__ects">
        <EctsPie data={studyProgress.byType} />
        <p className="studies__ects-text">
          Ects completed:
          <br />
          {studyProgress.completed}/{studyProgress.required}
        </p>
      </div>

      <hr className="studies__divider" />

      <Link to="/courses" className="studies__title studies__title--big">
        My Courses→
      </Link>
      <div className="studies__courses">
        {slots.map((course, i) => (
          <CourseCard key={course?.id ?? `empty-${i}`} course={course} />
        ))}
      </div>

      <nav className="studies__links">
        <Link to="/studyplanner" className="studies__title">
          Studyplanner→
        </Link>
        <Link to="/exams" className="studies__title">
          Exams Dates→
        </Link>
      </nav>

      <a className="studies__guidance" href={LINKS.studyGuidance} target="_blank" rel="noopener noreferrer">
        Study Guidance
        <img src="/icons/external-link.svg" width={17} height={17} alt="" />
      </a>
    </div>
  );
}
