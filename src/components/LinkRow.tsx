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
  /** Icon on the right. Default: chevron (in-app), external (href), phone (tel: links). */
  icon?: 'phone' | 'map';
};

function Chevron({ external, icon }: { external?: boolean; icon?: 'phone' | 'map' }) {
  if (icon === 'phone') {
    return (
      <svg className="link-row__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === 'map') {
    return (
      <svg className="link-row__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return external ? (
    <img className="link-row__icon" src="/icons/external-link.svg" width={16} height={16} alt="" />
  ) : (
    <svg className="link-row__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LinkRow({ children, variant = 'row', meta, to, href, onClick, icon }: Props) {
  const className = `link-row link-row--${variant}`;
  const inner = (
    <>
      <span className="link-row__label">{children}</span>
      {meta != null && <span className="link-row__meta">{meta}</span>}
      <Chevron external={!!href} icon={icon ?? (href?.startsWith('tel:') ? 'phone' : undefined)} />
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
    // Calls and e-mails open in place; web pages in a new tab.
    const inPlace = /^(tel|mailto):/.test(href);
    return (
      <a href={href} className={className} {...(inPlace ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>
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
