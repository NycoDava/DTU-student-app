import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './LinkRow.css';

/**
 * One tappable row with a chevron (replaces the underlined "Title→" text links).
 * - `section`: a section title that opens its page ("News", "My courses"), bigger, no divider.
 * - `row` (default): a list row ("Studyplanner", "GPA calculator") with a hairline under it.
 * Pass `to` (in-app page), `href` (external, opens a new tab) or `onClick` (opens a sheet).
 */
type Props = {
  children: ReactNode;
  variant?: 'section' | 'row';
  /** Small grey text on the right, before the chevron ("8.55", "34 people"). */
  meta?: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
};

function Chevron({ external }: { external?: boolean }) {
  return external ? (
    <img className="link-row__icon" src="/icons/external-link.svg" width={16} height={16} alt="" />
  ) : (
    <svg className="link-row__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LinkRow({ children, variant = 'row', meta, to, href, onClick }: Props) {
  const className = `link-row link-row--${variant}`;
  const inner = (
    <>
      <span className="link-row__label">{children}</span>
      {meta != null && <span className="link-row__meta">{meta}</span>}
      <Chevron external={!!href} />
    </>
  );
  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}
