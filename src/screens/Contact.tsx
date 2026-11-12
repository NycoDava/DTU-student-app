import SubHeader from '../components/SubHeader';
import LinkRow from '../components/LinkRow';
import { LINKS } from '../config/links';
import './DtuPages.css';

const place = (address: string) => LINKS.mapsSearch + encodeURIComponent(address);

/**
 * "Contact" (Figma 45:127, redesigned on the author's request like the other screens): sections of tappable rows.
 * Phone numbers call, addresses open the maps app, web pages open in a new tab. Same facts as before (fax numbers
 * dropped: not useful on a phone).
 */
export default function Contact() {
  return (
    <div className="sub-screen">
      <SubHeader title="Contact" />
      <div className="contact">
        <section className="contact__section">
          <h2 className="contact__heading">Help</h2>
          <LinkRow href={LINKS.serviceportal}>IT help (DTU Serviceportal)</LinkRow>
          <LinkRow href={LINKS.phonebook}>Phonebook</LinkRow>
        </section>

        <section className="contact__section">
          <h2 className="contact__heading">DTU main office</h2>
          <LinkRow href="tel:+4545252525" meta="Mon–Fri 8–16">
            +45 45 25 25 25
          </LinkRow>
          <LinkRow href={LINKS.contactForm}>Contact form</LinkRow>
          <LinkRow href={place('Anker Engelunds Vej 101, 2800 Kongens Lyngby')} icon="map">
            <span className="contact__address">
              Anker Engelunds Vej 101
              <span>2800 Kongens Lyngby</span>
            </span>
          </LinkRow>
        </section>

        <section className="contact__section">
          <h2 className="contact__heading">Study programmes and student affairs</h2>
          <LinkRow href={LINKS.oss}>Office for Study Programmes and Student Affairs</LinkRow>
          <LinkRow href="tel:+4545251199">+45 45 25 11 99</LinkRow>
          <LinkRow href={place('Anker Engelunds Vej 101, 2800 Kongens Lyngby')} icon="map">
            <span className="contact__address">
              Anker Engelunds Vej 101, ground floor
              <span>2800 Kongens Lyngby</span>
            </span>
          </LinkRow>
        </section>

        <section className="contact__section">
          <h2 className="contact__heading">Finance and accounting</h2>
          <LinkRow href="tel:+4545251088">+45 45 25 10 88</LinkRow>
          <LinkRow href={place('Lundtoftevej 150, 2800 Kongens Lyngby')} icon="map">
            <span className="contact__address">
              Lundtoftevej 150
              <span>2800 Kongens Lyngby</span>
            </span>
          </LinkRow>
        </section>
      </div>
    </div>
  );
}
