// All external URLs of the app. Never write URLs inline in components.
export const LINKS = {
  // Core DTU systems
  learn: 'https://learn.inside.dtu.dk',
  studyplanner: 'https://studieplan.dtu.dk',
  news: 'https://www.dtu.dk/english/news/all-news',
  events: 'https://www.dtu.dk/english/calendar',

  // Study support
  studyGuidance: 'https://www.dtu.dk/english/education/guidance-and-counselling/study-guidance',
  studentHelp: 'https://student.dtu.dk/en/help-and-guidance',
  oss: 'https://www.dtu.dk/english/about/organization/supportfunctions/oss',
  contactForm: 'https://www.dtu.dk/english/about/contact/contact-form',

  // Library and printing
  findit: 'https://findit.dtu.dk/',
  freeSeats: 'https://www.bibliotek.dtu.dk/en/Free-seats',

  // eat@DTU (ordering happens in the official app, by PubQ / Food & Co)
  eatDtuIos: 'https://apps.apple.com/app/eat-dtu/id6529534162',
  eatDtuAndroid: 'https://play.google.com/store/search?q=Eat%40DTU&c=apps', // TODO: replace with the app page (package id) when known
  canteenHours: 'https://www.inside.dtu.dk/en/campus/canteens-and-catering-for-meetings/kontaktinfo-og-aabningstider',
  libraryBooking: 'https://www.supersaas.com/schedule/DTU_Library/Study_Areas_-_Lyngby',
  printing: 'https://databarprint.dtu.dk/end-user/ui/login?lang=en_US',

  // Accounts
  changePassword: 'https://password.dtu.dk/admin/change_password.aspx?lang=en',
  guestLogin: 'https://guest.dtu.dk/Sites/GuestLogin/Default.aspx',

  // Student life and career
  careerHub: 'https://dtu.jobteaser.com/', // TODO verify: the pasted link had a one-time login token, this is the stable base
  dtuSport: 'https://dtusport.dk/default.aspx',
  pf: 'https://www.pf.dk/',
  serviceportal: 'https://dtuserviceportal.ivanticloud.com/alp.aspx',
  phonebook: 'https://www.dtu.dk/english/Search?area=samesite&entity=persons',

  // Map
  mazemapEmbed:
    'https://use.mazemap.com/embed.html#v=1&campusid=89&zlevel=1&center=12.519825,55.786341&zoom=18.2&utm_medium=iframe',
  mazemap: 'https://www.mazemap.com/',
  /** Full MazeMap app (search, directions, floors). Embeddable; the hash (center, zoom...) is built in CampusMap.tsx. */
  mazemapApp: 'https://use.mazemap.com/',

  // Parking (sources used by the DTU campus web app)
  sensadeApi: 'https://api.sensade.com/guideapp/organization/67c1b612-1751-441a-b1d7-bb2a60d1db5c',
  sensadeMap: 'https://dtu.sensade.com/lyngby',
  bikeMap: {
    lyngby: 'https://map.cas.dtu.dk/llyn_bike',
    ballerup: 'https://map.cas.dtu.dk/lbal_bike',
    riso: 'https://map.cas.dtu.dk/lris_bike',
  },
  /** + "lat,lng": opens directions in the phone's maps app. */
  directions: 'https://www.google.com/maps/dir/?api=1&destination=',
  /** Base of the in-app MazeMap iframe; the hash (center, zoom...) is built in src/components/CampusMap.tsx. */
  mazemapEmbedBase: 'https://use.mazemap.com/embed.html',

  // Live library occupancy (public JSON API, proxied by Vite: see vite.config.ts)
  smartLibrary: 'https://smartlibrary.ait.dtu.dk',

  // Exams (official timetable, copied into src/data/examDates.ts)
  examDates: 'https://student.dtu.dk/en/exam/exam-dates',

  studyAbroad: 'https://www.dtu.dk/english/education/study-abroad', // TODO verify

  // TODO: author to add: CampusNet grades URL
} as const;
