import { lazy, Suspense, useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SubHeader from '../../components/SubHeader';
import { LINKS } from '../../config/links';
import { useCourseData } from '../../data/courseData';
import type { ContentModule, ContentTopic } from '../../data/types';
import './FileViewer.css';

const PdfView = lazy(() => import('./PdfView'));

/** File extension of a Learn topic ("pdf", "pptx", ...), from its URL, local path or title. */
export function topicExt(t: ContentTopic): string {
  const src = (t.url || t.localPath || t.title || '').split('?')[0];
  const m = /\.([a-z0-9]{2,5})$/i.exec(src);
  return m ? m[1].toLowerCase() : '';
}

export const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp']);

function findTopic(modules: ContentModule[], id: number): ContentTopic | undefined {
  for (const m of modules) {
    const t = m.topics.find((x) => x.id === id) ?? findTopic(m.modules, id);
    if (t) return t;
  }
  return undefined;
}

/**
 * In-app file viewer (live mode): the local server fetches the file from Learn when it is opened and keeps it only in
 * memory. PDFs open in the PDF reader, images directly. Nothing is stored on the phone (no-store).
 */
export default function FileViewer() {
  const { courseId = '', topicId = '' } = useParams();
  const data = useCourseData();
  const [error, setError] = useState<number | null | undefined>(undefined);
  const onError = useCallback((status: number | null) => setError(status), []);

  const topic = findTopic(data.courseContent[courseId] ?? [], Number(topicId));
  const course = data.courses.find((c) => c.id === courseId);
  const url = `/api/local/files/${courseId}/${topicId}`;
  const ext = topic ? topicExt(topic) : 'pdf';
  const learnUrl = topic?.url ?? course?.url ?? LINKS.learn;

  return (
    <div className="file-viewer">
      <div className="file-viewer__header">
        <SubHeader title={topic?.title ?? 'File'} />
      </div>

      {error !== undefined ? (
        <div className="file-viewer__error">
          {error === 401 ? (
            <>
              <p>Your DTU session has expired.</p>
              <Link to="/login" state={{ reason: 'expired' }} className="file-viewer__button">
                Sign in
              </Link>
            </>
          ) : (
            <p>This file could not be opened.</p>
          )}
          <a href={learnUrl} target="_blank" rel="noopener noreferrer" className="file-viewer__link">
            Open in DTU Learn
          </a>
        </div>
      ) : IMAGE_EXT.has(ext) ? (
        <img className="file-viewer__image" src={url} alt={topic?.title ?? ''} onError={() => setError(null)} />
      ) : (
        <Suspense fallback={<p className="file-viewer__status">Opening…</p>}>
          <PdfView url={url} onError={onError} />
        </Suspense>
      )}
    </div>
  );
}
