import ServicePage from '../components/ServicePage';
import { LINKS } from '../config/links';

/**
 * Info pages behind "Services for students" (Figma 224:1162, 224:1270, 224:1324, 224:1216), rebuilt on one template
 * (ServicePage) on the author's request. The text is the same as before (from the DTU pages), folded into sections.
 */

/** Figma 224:1162 */
export function CareerHub() {
  return (
    <ServicePage
      title="DTU Career Hub"
      lead="Internships, projects and collaborators: the matchmaking site for DTU students, companies and staff."
      image={{ src: '/images/dtu/careerhub-logo.png', alt: 'DTU Career Hub, empowered by JobTeaser', contain: true }}
      action={{ label: 'Open DTU Career Hub', href: LINKS.careerHub }}
      sections={[
        {
          title: 'What you find there',
          body: (
            <>
              <p>
                DTU Career Hub is a matchmaking site that makes it easier for businesses, students and DTU employees to get
                in touch with each other. It contains postings on internships and projects
              </p>
              <ul>
                <li>from companies and organizations to students</li>
                <li>from supervisors to students</li>
                <li>from students to students.</li>
              </ul>
            </>
          ),
        },
        {
          title: 'As a DTU student',
          body: (
            <ul>
              <li>Get an overview of relevant projects and internships</li>
              <li>Create relationships with a company</li>
              <li>Find students who can work with you on projects.</li>
            </ul>
          ),
        },
      ]}
    />
  );
}

/** Figma 224:1270 */
export function StudyAbroad() {
  return (
    <ServicePage
      title="Study abroad"
      lead="Why go on exchange: a stronger CV, new languages, an international network and a new culture."
      image={{ src: '/images/dtu/study-abroad.png' }}
      action={{ label: 'Explore exchange at DTU', href: LINKS.studyAbroad }}
      sections={[
        {
          title: 'Boost your CV',
          body: (
            <p>
              Having an exchange stay listed on your CV may help give you an international angle and edge for your future
              job search and career. It is up to you what you choose to highlight from your studies abroad - maybe specific
              courses you have completed, unique research facilities or professors you may have had the opportunity to work
              with or the personal growth you will have gained both academically and personally abroad.
            </p>
          ),
        },
        {
          title: 'Improve your language skills',
          body: (
            <p>
              By studying abroad you will have a great possibility to improve your language skills, whether you choose to go
              to an English-speaking country maybe or a country with another local - and teaching language such as Spanish,
              Italian or German. Either way this could be a great strength as you look for international career
              possibilities later on.
            </p>
          ),
        },
        {
          title: 'Create an international network',
          body: (
            <>
              <p>
                Once abroad, you will have great opportunities to get an international network of friends and contacts at
                your host university, as you will meet local and international students, teachers and staff from all
                corners of the world. Additionally, you may choose to join a local sports club/ community or one of the many
                clubs and societies available at most universities abroad.
              </p>
              <p>
                Having an international network of friends and contacts may provide you with a new perspective on the world,
                your studies and maybe even your life in general. On top of that, your ability to understand and work
                together with people from all different backgrounds, cultures and nationalities will come to your advantage,
                as you look for a job and career as a global engineer.
              </p>
            </>
          ),
        },
        {
          title: 'Adapt to a whole new culture',
          body: (
            <p>
              As part of being on exchange, you will need to keep an open mind as well as a willingness to both understand
              and adapt to the new country and culture you will a part of. You will learn to work with students and
              professors across many different cultures - a strength that is sought by employers and international
              companies today and may as a result give you a great advantage, when both expanding your network at DTU as
              well applying for a job after you graduate.
            </p>
          ),
        },
      ]}
    />
  );
}

/** Figma 224:1324 */
export function StudentLife() {
  return (
    <ServicePage
      title="Student life"
      lead="Sports, a jogging trail on campus and big parties with PF, the student union."
      image={{ src: '/images/dtu/student-life.png' }}
      action={{ label: 'See sports at DTU Sport', href: LINKS.dtuSport }}
      sections={[
        {
          title: 'Sports at DTU',
          body: (
            <p>
              Outdoors you can play soccer (football), rugby, basket, or beach volleyball. You can also go sailing on
              Øresund or soar through the air in a hang glider.
            </p>
          ),
        },
        {
          title: '5 km jogging trail',
          body: (
            <p>
              DTU has its own jogging trail on campus. Each year DTU's student union, Polyteknisk Forening (PF), holds a Fun
              Run on the Friday before the autumn holidays begin.
            </p>
          ),
        },
        {
          title: 'Festive events',
          body: (
            <>
              <p>
                DTU and PF arrange two huge parties each year: the Indian Summer Party in September and the Annual
                Commemoration Day in April or May.
              </p>
              <p>Throughout the year several other parties are held on campus and in the S-Huset.</p>
            </>
          ),
        },
        {
          title: 'Late Summer Party',
          body: (
            <p>
              Kicks off the autumn semester! DTU sets up huge tents outdoors where the various study programmes hold
              creative theme parties.
            </p>
          ),
        },
        {
          title: 'Annual Commemoration Day',
          body: (
            <>
              <p>
                The Commemoration Day is a festive highlight in the academic calendar. The President of DTU is on hand to
                welcome royalty, students, and staff.
              </p>
              <p>
                The programme is a festive mixture of speeches, award ceremonies, banquet, dancing, and music into the wee
                small hours of the morning.
              </p>
              <p>
                You might notice that the Danes have a rather relaxed attitude to alcohol and that most of your fellow
                students enjoy a beer or two. However you will probably also notice that the majority know how to hold their
                liquor.
              </p>
            </>
          ),
        },
      ]}
      links={[{ label: 'PF, the student union', href: LINKS.pf }]}
    />
  );
}

/** Figma 224:1216 */
export function Wellbeing() {
  return (
    <ServicePage
      title="Wellbeing & support"
      lead="Your wellbeing matters. Find guidance, support and resources to help you throughout your studies."
      image={{ src: '/images/dtu/wellbeing.png' }}
      action={{ label: 'DTU Help and Guidance', href: LINKS.studentHelp }}
      sections={[
        {
          title: 'Student counselling',
          body: (
            <p>
              Get confidential support and professional guidance if you're experiencing stress, personal difficulties or
              challenges during your studies.
            </p>
          ),
        },
        {
          title: 'Study guidance',
          body: <p>Get help with study planning, academic decisions, course choices and challenges related to your education.</p>,
        },
        {
          title: 'Special Educational Support (SPS)',
          body: <p>Explore support options and possible accommodations for students with disabilities or functional impairments.</p>,
        },
        {
          title: 'Student chaplain',
          body: <p>A confidential conversation when dealing with difficult life situations, grief or personal challenges.</p>,
        },
      ]}
      links={[{ label: 'Study guidance', href: LINKS.studyGuidance }]}
    />
  );
}
