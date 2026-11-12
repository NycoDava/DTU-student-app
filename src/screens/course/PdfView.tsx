import { useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * In-app PDF reader (PDF.js): pages one under the other, as wide as the screen. Loaded only when a PDF is opened
 * (lazy import), so it never slows down the rest of the app. Pages are drawn when they come near the screen and
 * cleared when they are far away, so long decks do not fill the phone's memory.
 */
export default function PdfView({ url, onError }: { url: string; onError: (status: number | null) => void }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [ratio, setRatio] = useState(1.414); // height / width of page 1, used for the placeholders

  useEffect(() => {
    let cancelled = false;
    const task = getDocument({ url, disableAutoFetch: true, rangeChunkSize: 1 << 20 });
    task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => !cancelled && setProgress({ loaded, total });
    task.promise
      .then(async (pdf) => {
        const first = await pdf.getPage(1);
        const vp = first.getViewport({ scale: 1 });
        if (cancelled) return;
        setRatio(vp.height / vp.width);
        setDoc(pdf);
      })
      .catch((e: { status?: number }) => !cancelled && onError(e?.status ?? null));
    return () => {
      cancelled = true;
      task.destroy();
    };
  }, [url, onError]);

  if (!doc) {
    const mb = (n: number) => (n / 1048576).toFixed(1);
    return (
      <p className="file-viewer__status">
        {progress && progress.total > 0 ? `Loading ${mb(progress.loaded)} / ${mb(progress.total)} MB` : 'Opening…'}
      </p>
    );
  }

  return (
    <div className="pdf-view">
      {Array.from({ length: doc.numPages }, (_, i) => (
        <PdfPage key={i} doc={doc} number={i + 1} ratio={ratio} />
      ))}
    </div>
  );
}

function PdfPage({ doc, number, ratio }: { doc: PDFDocumentProxy; number: number; ratio: number }) {
  const holder = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(false);

  // Draw only pages within ~1.5 screens of the viewport.
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: '150% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const c = canvas.current;
    const el = holder.current;
    if (!c || !el) return;
    if (!near) {
      c.width = 0; // release the bitmap
      c.height = 0;
      return;
    }
    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<void> } | null = null;
    doc.getPage(number).then((page) => {
      if (cancelled) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: (el.clientWidth / base.width) * dpr });
      c.width = Math.floor(viewport.width);
      c.height = Math.floor(viewport.height);
      renderTask = page.render({ canvas: c, viewport });
      renderTask.promise.catch(() => {});
    });
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [near, doc, number]);

  return (
    <div ref={holder} className="pdf-view__page" style={{ aspectRatio: `1 / ${ratio}` }}>
      <canvas ref={canvas} aria-label={`Page ${number}`} />
    </div>
  );
}
