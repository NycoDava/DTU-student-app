import SubHeader from '../components/SubHeader';
import { LINKS } from '../config/links';
import './DtuPages.css';

/** Info pages behind "Services for students" (Figma 224:1162, 224:1270, 224:1324, 224:1216). Static text. */

const ext = { target: '_blank', rel: 'noopener noreferrer' };

/** Figma 224:1162 */
export function CareerHub() {
  return (
    <div className="sub-screen">
      <SubHeader />
      <article className="info-page info-page--career">
        <img className="info-page__logo" src="/images/dtu/careerhub-logo.png" width={253} height={69} alt="DTU Career Hub, empowered by JobTeaser" />
        <p className="info-page__lead">
          Do you need collaborators? Do you have a project? Are you doing an internship? Then DTU Career Hub is the place
          for you.
        </p>
        <div>
          <p>
            <a href={LINKS.careerHub} {...ext}>
              DTU Career Hub
            </a>{' '}
            is a matchmaking site that makes it easier for businesses, students and DTU employees to get in touch with
            each other.
            <br />
            <a href={LINKS.careerHub} {...ext}>
              DTU Career Hub
            </a>{' '}
            contains postings on internships and projects
          </p>
          <ul>
            <li>from companies and organizations to students</li>
            <li>from supervisors to students</li>
            <li>from students to students.</li>
          </ul>
          <h2 className="info-page__gap">As a DTU student, you will find relevant companies and postings</h2>
          <ul>
            <li>Get an overview of relevant projects and internships</li>
            <li>Create relationships with a company</li>
            <li>Find students who can work with you on projects.</li>
          </ul>
        </div>
      </article>
    </div>
  );
}

/** Figma 224:1270 */
export function StudyAbroad() {
  return (
    <div className="sub-screen">
      <SubHeader title="Why go on Exchange?" stacked />
      <article className="info-page info-page--abroad">
        <img className="info-page__img" src="/images/dtu/study-abroad.png" width={344} height={206} alt="" />
        <div>
          <h2>Boost your CV</h2>
          <p>
            Having an exchange stay listed on your CV may help give you an international angle and edge for your future
            job search and career. It is up to you what you choose to highlight from your studies abroad - maybe specific
            courses you have completed, unique research facilities or professors you may have had the opportunity to work
            with or the personal growth you will have gained both academically and personally abroad.
          </p>
          <h2>Improve your language skills</h2>
          <p>
            By studying abroad you will have a great possibility to improve your language skills, whether you choose to go
            to an English-speaking country maybe or a country with another local - and teaching language such as Spanish,
            Italian or German. Either way this could be a great strength as you look for international career
            possibilities later on.
          </p>
          <h2>Create an international network</h2>
          <p>
            Once abroad, you will have great opportunities to get an international network of friends and contacts at your
            host university, as you will meet local and international students, teachers and staff from all corners of the
            world. Additionally, you may choose to join a local sports club/ community or one of the many clubs and
            societies available at most universities abroad.
          </p>
          <p>
            Having an international network of friends and contacts may provide you with a new perspective on the world,
            your studies and maybe even your life in general. On top of that, your ability to understand and work together
            with people from all different backgrounds, cultures and nationalities will come to your advantage, as you look
            for a job and career as a global engineer.
          </p>
          <h2>Experience and learn to adapt to a whole new culture</h2>
          <p>
            As part of being on exchange, you will need to keep an open mind as well as a willingness to both understand
            and adapt to the new country and culture you will a part of. You will learn to work with students and
            professors across many different cultures - a strength that is sought by employers and international companies
            today and may as a result give you a great advantage, when both expanding your network at DTU as well applying
            for a job after you graduate.
          </p>
        </div>
        <a className="info-page__more" href={LINKS.studyAbroad} {...ext}>
          Find out more
          <img src="/icons/external-link.svg" width={16} height={16} alt="" />
        </a>
      </article>
    </div>
  );
}

/** Figma 224:1324 */
export function StudentLife() {
  return (
    <div className="sub-screen">
      <SubHeader title="Student Life at DTU" stacked />
      <article className="info-page info-page--life">
        <img className="info-page__img info-page__img--bleed" src="/images/dtu/student-life.png" width={407} height={229} alt="" />
        <div>
          <h2>Sports at DTU</h2>
          <p>
            Outdoors you can play soccer (football), rugby, basket, or beach volleyball. You can also go sailing on
            Øresund or soar through the air in a hang glider.
          </p>
          <p className="info-page__link">
            <a href={LINKS.dtuSport} {...ext}>
              Check out your options on DTU Sport
            </a>
            .
          </p>
          <h2 className="info-page__gap">5 km jogging trail</h2>
          <p>
            DTU has its own jogging trail on campus. Each year DTU's student union, Polyteknisk Forening (PF), holds a Fun
            Run on the Friday before the autumn holidays begin.
          </p>
          <h2>Festive events</h2>
          <p>
            DTU and PF arrange two huge parties each year: the Indian Summer Party in September and the Annual
            Commemoration Day in April or May.
          </p>
          <p>Throughout the year several other parties are held on campus and in the S-Huset.</p>
          <p className="info-page__link">
            <a href={LINKS.pf} {...ext}>
              Check out PF
            </a>
          </p>
          <h2 className="info-page__gap">Late Summer Party</h2>
          <p>
            Kicks off the autumn semester! DTU sets up huge tents outdoors where the various study programmes hold creative
            theme parties.
          </p>
          <h2>Annual Commemoration Day</h2>
          <p>
            The Commemoration Day is a festive highlight in the academic calendar. The President of DTU is on hand to
            welcome royalty, students, and staff.
          </p>
          <p>
            The programme is a festive mixture of speeches, award ceremonies, banquet, dancing, and music into the wee small
            hours of the morning.
          </p>
          <p>
            You might notice that the Danes have a rather relaxed attitude to alcohol and that most of your fellow students
            enjoy a beer or two. However you will probably also notice that the majority know how to hold their liquor.
          </p>
        </div>
      </article>
    </div>
  );
}

/** Figma 224:1216 */
export function Wellbeing() {
  return (
    <div className="sub-screen">
      <SubHeader title="Wellbeing & Support" stacked />
      <article className="info-page info-page--wellbeing">
        <p className="info-page__intro">
          Your wellbeing matters. Find guidance, support and resources to help you throughout your studies.
        </p>
        <img className="info-page__img info-page__img--bleed" src="/images/dtu/wellbeing.png" width={1466} height={829} alt="" />
        <div className="info-page__semibold">
          <h2>Student Counselling</h2>
          <p>
            Get confidential support and professional guidance if you're experiencing stress, personal difficulties or
            challenges during your studies.
          </p>
          <h2>Study Guidance</h2>
          <p>Get help with study planning, academic decisions, course choices and challenges related to your education.</p>
          <h2>Special Educational Support (SPS)</h2>
          <p>
            Explore support options and possible accommodations for students with disabilities or functional impairments.
          </p>
          <h2>Student Chaplain</h2>
          <p>A confidential conversation when dealing with difficult life situations, grief or personal challenges.</p>
        </div>
        <p className="info-page__center">
          <a href={LINKS.studentHelp} {...ext}>
            DTU Help and Guidance
          </a>
          .
        </p>
      </article>
    </div>
  );
}
