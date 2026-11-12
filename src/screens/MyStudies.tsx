import CourseCard from '../components/CourseCard';
import EctsProgress from '../components/EctsProgress';
import LinkRow from '../components/LinkRow';
import { courses as allCourses } from '../data/appData';
import { recentCourses } from '../data/recentCourses';
import { LINKS } from '../config/links';
import './MyStudies.css';

/**
 * Tab "school" (Figma "my studies", 7:22, cleaned up): ECTS progress, last visited courses, shortcuts.
 * Deviation (author's request): section titles are tappable rows with a chevron instead of underlined "Title→" links,
 * and the pie is replaced by the same ECTS progress bar as on Grades.
 */
export default function MyStudies() {
  const courses = recentCourses(allCourses, 2);
  const slots = [courses[0], courses[1]];

  return (
    <div className="studies">
      <img className="studies__logo" src="/images/dtu-logo-small.png" alt="DTU" />

      <section className="studies__section">
        <LinkRow variant="section" to="/grades">
          Grades and ECTS
        </LinkRow>
        <EctsProgress compact />
      </section>

      <section className="studies__section">
        <LinkRow variant="section" to="/courses">
          My courses
        </LinkRow>
        <div className="studies__courses">
          {slots.map((course, i) => (
            <CourseCard key={course?.id ?? `empty-${i}`} course={course} />
          ))}
        </div>
      </section>

      <nav className="studies__rows" aria-label="More">
        <LinkRow to="/studyplanner">Studyplanner</LinkRow>
        <LinkRow to="/exams">Exam dates</LinkRow>
        <LinkRow href={LINKS.studyGuidance}>Study guidance</LinkRow>
      </nav>
    </div>
  );
}
