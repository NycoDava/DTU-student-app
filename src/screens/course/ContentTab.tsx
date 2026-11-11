import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LINKS } from '../../config/links';
import { useVisited } from '../../data/visited';
import type { ContentTopic } from '../../data/types';
import CheckIcon from './CheckIcon';
import { moduleAt, useCourse } from './CourseLayout';

/** Content tab (Figma 40:112): one row per Learn module, check on the ones already opened. */
export function ContentTab() {
  const { course, data } = useCourse();
  const visited = useVisited(course.id);
  const modules = data.courseContent[course.id] ?? [];

  if (modules.length === 0) return <p className="course-empty">No content in this course</p>;
  return (
    <ul className="course-rows">
      {modules.map((m, i) => (
        <li key={i}>
          <Link to={`/courses/${course.id}/content/${i}`} className="course-row">
            <span className="course-row__title">{m.title}</span>
            {visited.has(`m:${i}`) && <CheckIcon />}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** "files/02830/x.pdf" → "/files/02830/x.pdf" (the author copies the scraper's files/ folder to public/files/). */
const localHref = (path: string) => '/' + path.split('/').map(encodeURIComponent).join('/');

/**
 * Downloaded copies that really exist. The dev server answers missing files with index.html,
 * so a file only counts when the response is not HTML.
 */
function useLocalFiles(topics: ContentTopic[]) {
  const [found, setFound] = useState<Record<number, string>>({});
  useEffect(() => {
    let alive = true;
    topics
      .filter((t) => t.localPath)
      .forEach((t) => {
        const href = localHref(t.localPath!);
        fetch(href, { method: 'HEAD' })
          .then((res) => {
            const isHtml = (res.headers.get('content-type') ?? '').includes('text/html');
            if (alive && res.ok && !isHtml) setFound((f) => ({ ...f, [t.id]: href }));
          })
          .catch(() => {});
      });
    return () => {
      alive = false;
    };
  }, [topics]);
  return found;
}

/** Inside a module (Figma 93:2): sub-modules and files/links. Opens the local copy if present, otherwise DTU Learn. */
export function ModuleView() {
  const { path = '' } = useParams();
  const { course, data } = useCourse();
  const visited = useVisited(course.id);
  const module = moduleAt(data.courseContent[course.id] ?? [], path);
  const local = useLocalFiles(module?.topics ?? EMPTY);

  // Opening a module ticks it (and its parents) in the Content list.
  const { mark } = visited;
  useEffect(() => {
    if (!module) return;
    const parts = path.split('.');
    parts.forEach((_, i) => mark(`m:${parts.slice(0, i + 1).join('.')}`));
  }, [path, module, mark]);

  if (!module) return <p className="course-empty">This module does not exist.</p>;
  if (module.modules.length === 0 && module.topics.length === 0) {
    return <p className="course-empty">This module is empty</p>;
  }

  return (
    <ul className="course-rows">
      {module.modules.map((m, i) => (
        <li key={`m${i}`}>
          <Link to={`/courses/${course.id}/content/${path}.${i}`} className="course-row">
            <span className="course-row__title">{m.title}</span>
            {visited.has(`m:${path}.${i}`) && <CheckIcon />}
          </Link>
        </li>
      ))}
      {module.topics.map((t) => {
        const href = local[t.id] ?? t.url ?? course.url ?? LINKS.learn;
        return (
          <li key={t.id}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="course-row"
              onClick={() => visited.mark(`t:${t.id}`)}
            >
              <img
                className="course-row__kind"
                src={t.kind === 'File' ? '/icons/file.svg' : '/icons/external-link.svg'}
                width={20}
                height={20}
                alt={t.kind === 'File' ? 'File' : 'Link'}
              />
              <span className="course-row__title">{t.title}</span>
              {visited.has(`t:${t.id}`) && <CheckIcon />}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

const EMPTY: ContentTopic[] = [];
