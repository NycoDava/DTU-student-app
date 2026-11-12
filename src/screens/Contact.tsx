import SubHeader from '../components/SubHeader';
import { LINKS } from '../config/links';
import LinkRow from '../components/LinkRow';
import './DtuPages.css';

const ext = { target: '_blank', rel: 'noopener noreferrer' };

/** "Contact" (Figma 45:127): static DTU contact info. */
export default function Contact() {
  return (
    <div className="sub-screen">
      <SubHeader title="Contact" stacked />
      <div className="contact">
        <nav className="contact__rows" aria-label="Help">
          <LinkRow href={LINKS.serviceportal}>IT help (DTU Serviceportal)</LinkRow>
          <LinkRow href={LINKS.phonebook}>Phonebook</LinkRow>
        </nav>

        <section>
          <h2>Main address</h2>
          <p>
            Technical University of Denmark
            <br />
            Anker Engelunds Vej 101
            <br />
            2800 Kongens Lyngby
          </p>
          <ul>
            <li>
              Tel.: <a href="tel:+4545252525">+45 45 25 25 25</a>
            </li>
            <li>
              <a href={LINKS.contactForm} {...ext}>
                Send e-mail (via contact form)
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2>Opening hours of the reception:</h2>
          <p className="contact__hours">Monday - Friday: 8 a.m. – 4 p.m.</p>
        </section>

        <section className="contact__medium">
          <h2>Information regarding Studies:</h2>
          <a href={LINKS.oss} {...ext}>
            Office for Study Programmes and Student Affairs
          </a>
          <p>
            Technical University of Denmark
            <br />
            Anker Engelunds Vej 101, ground floor
            <br />
            2800 Kongens Lyngby
          </p>
          <ul>
            <li>
              Tel: <a href="tel:+4545251199">+45 45 25 11 99</a>
            </li>
            <li>Fax: +45 45 87 02 16</li>
          </ul>
        </section>

        <section className="contact__medium">
          <h2>Information regarding Finance and Accounting:</h2>
          <p>
            Office for Finance and Accounting
            <br />
            Technical University of Denmark
            <br />
            Lundtoftevej 150
            <br />
            2800 Kongens Lyngby
          </p>
          <ul>
            <li>
              Tel: <a href="tel:+4545251088">+45 45 25 10 88</a>
            </li>
            <li>Fax: +45 45 88 80 40</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
