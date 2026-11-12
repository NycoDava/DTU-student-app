import type { ReactNode } from 'react';
import SubHeader from './SubHeader';
import LinkRow from './LinkRow';
import './ServicePage.css';

/**
 * One template for the "Services for students" pages (author's request: the pages were walls of copied text):
 * picture, title + one-line summary, one red main action, the key points as expandable sections (nothing removed,
 * only folded), and secondary links as rows.
 */
type Props = {
  title: string;
  lead: string;
  image?: { src: string; alt?: string; contain?: boolean };
  action: { label: string; href: string };
  sections: { title: string; body: ReactNode }[];
  links?: { label: string; href: string }[];
};

export default function ServicePage({ title, lead, image, action, sections, links = [] }: Props) {
  return (
    <div className="sub-screen service-page">
      <SubHeader />
      {image && (
        <img className={'service-page__image' + (image.contain ? ' service-page__image--contain' : '')} src={image.src} alt={image.alt ?? ''} />
      )}
      <h1 className="service-page__title">{title}</h1>
      <p className="service-page__lead">{lead}</p>

      <a className="service-page__action" href={action.href} target="_blank" rel="noopener noreferrer">
        <span>{action.label}</span>
        <img src="/icons/external-link.svg" width={16} height={16} alt="" />
      </a>

      <div className="service-page__sections">
        {sections.map((s) => (
          <details key={s.title} className="service-page__section">
            <summary>
              <span>{s.title}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <div className="service-page__body">{s.body}</div>
          </details>
        ))}
      </div>

      {links.length > 0 && (
        <nav className="service-page__links" aria-label="More">
          {links.map((l) => (
            <LinkRow key={l.href} href={l.href}>
              {l.label}
            </LinkRow>
          ))}
        </nav>
      )}
    </div>
  );
}
