# Screen specs

How to use: before building a screen, read ITS section here and read its Figma frame once (see CLAUDE.md).
Status per section: SPECIFIED (decided with the author) or DRAFT (inferred from low-resolution screenshots, confirm
with the author before building). If this file and Figma disagree, ask. All data comes from `app-data.json`.
Figma link of each frame: `FIGMA: <paste link>`.

Common rules
- Times are shown in Europe/Copenhagen, 24h clock, dates like "Oct 28".
- Every external link opens in a new tab (`target="_blank" rel="noopener noreferrer"`). All URLs live in
  `src/config/links.ts`, one named constant per link, never inline in components.
- "Now" for filters is the real current time, but the screen must never look empty: if no future items exist,
  show the latest ones instead of an empty screen.

---------------------------------------------------------------------------------------------------

## Home  (SPECIFIED, cleaned up 12 Nov 2026 on the author's request)
- Compact header: avatar 44 + name (17 semibold, opens Profile), small DTU logo right. Live mode: sync line under it
  ("Updated Thu 12 Nov, 14:56" + refresh icon, "Sign in" when the session is gone).
- "Study announcements" (section row with chevron) → one light card: newest study announcement title + 2-line teaser.
- "Upcoming" (section row) → one card: next activity or deadline, the SAME AgendaCard as Upcoming events (author's
  design: red border + red glow for deadlines, dark border for exams).
  One card each on purpose (author's choice, to be revisited after testing).
- "Calendar": unchanged (see Calendar).
- Agenda: a Learn calendar event with the same course + title as a deadline, within a day of it, is dropped (only the
  deadline stays), and manual events the Learn calendar already has (same course, start within 30 min) are dropped,
  in `appData.ts` `withoutCopies` — applies to Home, calendar and Upcoming events.

## Calendar  (SPECIFIED)
- Use FullCalendar (`@fullcalendar/react`, `daygrid`, `timegrid`, `list`, `interaction`; core is MIT). It provides all four
  views: Day = `timeGridDay`, Week = `timeGridWeek`, Month = `dayGridMonth`, List = `listWeek`.
- Hide FullCalendar's own toolbar. Our own segmented control calls `changeView`. Keep small prev/next arrows and a title
  ("October 2026") like the Learn calendar screenshot in the Figma frames (visual reference only, not an image to reuse).
- Events come from `agenda`. `kind: "event"` = neutral green-grey chip, `kind: "deadline"` = mauve chip (see Figma).
  Deadlines are point-in-time (no end): show them as a 30-minute chip ending at the due time.
- Phone width (393 px): the Month view cannot fit text in 7 columns. Show colored dots or very short chips (max 1 line,
  ellipsis) and `dayMaxEvents: 2` with the "+n more" popover. Tapping an event opens the preview card of Figma 157:1094
  (centered over the calendar, author's choice): title, course, location, date and time (deadlines: "Due …"), ✕, and
  "Open in DTU Learn" only when the item has a `url`. The URL is NOT passed to FullCalendar (it would become a real link).
- Day / Week views, compact (author's request 12 Nov 2026): only the hours with timed events in the visible range
  (default 08-16, at least 4 h), one row per hour, height fits the content (no inner scroll). Deadlines go to the
  all-day row with their time in the title ("23:59 Report …") so 23:59 does not stretch the grid. Highlight today.
- Style with CSS variables so it matches the app (DTU red for today and buttons, system font). No FullCalendar default blue.

## Upcoming events  (DRAFT)
FIGMA: <link>  (3 variants: All / Deadlines / Activities)
- Tabs filter `agenda` from now on, ascending: All = everything, Deadlines = `kind: "deadline"`, Activities = `kind: "event"`.
- Row: date block (month + day), time, bold title, small line "course code course name". Deadlines have a red border.
- Tap opens `url`.

## Study announcements  (SPECIFIED, built)
Route `/announcements`. Data: `studyAnnouncements[]` = DTU study announcements from student.dtu.dk (registration for exams,
3-week periods, ...), the same messages as the "Study Announcements" widget on the Learn home page. Source: the public RSS
`student.dtu.dk/en/messages/studiemeddelelser/rss` + each message page for the text (read by the local server sync;
the Learn org-level news API answers 403 to students). Course announcements stay on each course page.
- Card (Figma): "Study Announcement s1924:" + title on the next line. Tap expands date, full text, "Read on student.dtu.dk".
- Home card: the newest study announcement (title + teaser).

## My studies (tab "school", route `/student`)  (SPECIFIED; cleaned up 12 Nov 2026: section rows with chevron,
`EctsProgress compact` instead of the pie, rows Studyplanner / Exam dates / Study guidance)
FIGMA: node 7:22. Hub: "Grades and ECTS→" (/grades), ECTS pie from `studyplan.ectsByType` (slice color = type color
from Studyplanner) + "Ects completed: passed/required", "My Courses→" (/courses) with the 2 LAST VISITED courses
(`src/data/recentCourses.ts`, fallback: first active courses), "Studyplanner→" (/studyplanner), "Exams Dates→" (/exams),
"Study Guidance" external link. Until data is plugged in: grey pie, 0/120, two empty course slots.

## Grades and progress (route `/grades`, behind "Grades and ECTS")  (SPECIFIED, redesigned 12 Nov 2026)
Author's request: clearer, coherent progress section (deviation from Figma 27:16).
- Progress = `EctsProgress` (same component on My studies, compact): "55 of 120 ECTS passed", one bar passed | planned |
  missing (`summary.ectsPassed`, `summary.ectsPlanned`, `ectsRequired - passed - planned`), legend, and a status line:
  no explanatory status line (author's request: minimal). No "activities" count, no pie here.
- Rows: "ECTS by course type" (opens the ECTS distribution sheet), "Studyplanner".
- Grades: tiles "8.55 Current GPA" + "Last grade: IB 42501 Innovation in engineering · 5 ECTS"; rows "All grades" (count)
  and "GPA calculator"; "Grade trend" chart (per exam period, see data limit).

## List of grades  (SPECIFIED, built)
FIGMA: 38:24. Route `/grades/list`.
- Table: Number, Title, Grade, ECTS from `grades`, latest period first, then course code. No period headings (not in Figma).
- Grade with ECTS letter as in Figma: "10 (B)" (12 A, 10 B, 7 C, 4 D, 02 E, 00 Fx, -3 F). Not passed (e.g. "IB"):
  grade + small red "not passed" under it.

## GPA calculator  (SPECIFIED)
FIGMA: <link>  (2 variants: empty / result)
- Shows "Current GPA" (`summary.gpa`) and "Current ECTS passed" (`summary.ectsPassed`).
- Inputs: expected grade (select with the Danish 7-point scale: 12, 10, 7, 4, 02, 00, -3) and expected ECTS (number > 0).
- Button "Calculate". Formula (ECTS-weighted mean over passed numeric grades):
  `(sum(grade * ects) + G * E) / (sum(ects) + E)`, shown with 2 decimals as "Expected GPA: 9.12". Pure function in
  `src/lib/gpa.ts`, with unit tests for: no grades yet, a failed course, invalid input.
- Empty/invalid input: inline message, no calculation.

## ECTS distribution  (SPECIFIED)
- The small pie on Grades / My studies is the same "Your plan" donut (completed + planned per type), `EctsPie` -> `MiniPie`.
FIGMA: <link>
- Modal sheet over /grades (white background, never black). Author's request: compare YOUR pie (completed + planned per
  type) with the PROGRAMME pie (expected per type), they may differ (thesis 35 vs 30); then horizontal bars per type:
  completed / planned (lighter) / missing (grey).
- Data: `studyplan.ectsByType[]` = `{ typeId, name, color, expected, completed, planned }`. These are the author's own
  Studyplanner categories (Polytechnic foundation, Programme specific, Electives, Thesis...), with the same colors.
- Donut: slices = `completed + planned` per category, colored with `color`. Center text: `summary.ectsPassed` / `ectsRequired`.
  Completed part solid, planned part lighter (same hue, 40% opacity).
- Below, one row per category: name, "completed + planned / expected ECTS", small progress bar. If completed + planned is
  larger than `expected` (e.g. thesis 35 of 30), show the bar full and the number in the warning color, no error.
- `studyplan.uncategorized` (ECTS not assigned to any category) is shown as a grey "Other" slice only if > 0.

## My courses  (SPECIFIED)
FIGMA: node 116:377. Route `/courses`.
- Search pill filters by course number or name (case-insensitive). All courses as CourseCard, newest `startDate`
  first (so the current term comes first). No "Previous courses" heading (not in Figma). Empty: "No courses yet".
- Banner: the real Learn course picture, from `localImage` (served from `/course-images/`). Fallback: colored gradient with the course code.

## Course page  (SPECIFIED, built)
FIGMA: 42:205 (My Course), 227:460 (Classlist), 40:112 (Content), 93:2 (module open), 42:174 (Assignments).
Routes: `/courses/:id` (My Course), `/courses/:id/classlist`, `/courses/:id/content`, `/courses/:id/content/:path`
(path "3" or "3.1" for nested modules), `/courses/:id/assignments`. Tabs are routes, so Back works between them.
- Header: banner with the course picture + 30% overlay, course name without the term, back arrow. Tabs overlap the banner.
- Colors: Figma's Learn blue/cyan (links, values, active tab, checks) replaced by DTU red (author's decision).
- My Course: "Classlist ->" + number of people; Groups: category, group number, members n/max, number of group
  assignments (if no group: "You are not in a group in this course"); Announcements: latest 3 with full text
  (HTML entities decoded, shown as plain text), "See all (n)" expands in place. Author is not in the data: "Posted on <date>".
- Groups (12 Nov 2026): "Members: n/max" is tappable and shows the group members (initials, name, email; from
  `group.memberIds` + classlist, anonymized ids in demo data). "Group assignments: n" opens the Assignments tab.
- Content files (live mode): PDFs and images open in the in-app viewer (back arrow + file name, pages edge to edge),
  other files download; see docs/live-data.md "Course files in the app".
- Real phones (narrow touch screen): no phone frame, banner flush with the top (also under the status bar when installed).
- Classlist: dropdown All / Students / Instructors (Figma) + search by name/email (author's choice), instructors first,
  "Last, First" shown as "First Last", own row "(You)", initials avatar (no photos), email as `mailto:`.
- Content: one row per module; module view lists sub-modules and topics with a file/link icon. A topic opens
  `/files/<localPath>` if that file really exists (HEAD, not HTML), otherwise `url` (DTU Learn).
  Check = opened in this app (localStorage per course), because Learn completion is not in the data.
- Assignments: deadlines of the course in date order, "<group name>: <title>" for group work, "Due on 02 December 2026,
  23:59", past ones greyed ("Was due on"). Submission/evaluation status is not in the data: link to DTU Learn instead.
- Real names of other people only in local `app-data.real.json`. Deployed data uses `ANON=1` (fictional names).

## Study planner  (SPECIFIED)
FIGMA: node 27:19 (see design-notes). Route `/studyplanner`. Logic in `src/lib/studyplan.ts` (`buildBoard`, `placeItems`).
- Title = `user.programme.name` (currentUser, editable, not static). "N ECTS planned" = ECTS of everything placed in a
  period (not the basket); updates while dragging. "Show ECTS distribution" opens the same sheet as Grades.
- Years -> terms (semester number) -> 2 periods each: odd semester = "13 weeks autumn Y" + "January Y+1", even =
  "13 weeks spring Y+1" + "June Y+1". Period `type` 3 = 13 weeks, 4 = 3 weeks. If `studyplan.semesters` is empty,
  the semesters come from `user.programme` (start year, number of semesters), so all periods show up empty.
- Period status from today: past (ended) -> VIEW 1 "Winter exam 2025/2026 ... Result ECTS", read only, filled with
  passed grades (`v25` -> autumn 2025, `s26` -> spring 2026) + planned items. Current / future -> VIEW 2
  "Placement Status ECTS", pill "Register/withdraw not open". Status column = check icon if the course is passed.
- Empty period: "Nothing planned for this period". Basket: real list (`studyplan.basket`), empty: "Nothing in the basket yet".
- Drag & drop (@dnd-kit/core): hold 250 ms on touch (5 px drag with mouse), drop into a current/future period or back
  into the basket. Past periods and passed courses never move. Moves saved in localStorage (`studyplanner.moves.v1`),
  this browser only (prototype, not sent to DTU).
- Color square = course type color: `studyplan.courseInfo[code].typeId` (Studyplanner `CourseTypeSpecificationRelations`,
  added by the server sync) -> `ectsByType[].color`. Tap the square: choose one of the 4 types (demo, localStorage
  `studyplanner.colors.v1`, keyed by item id, "Reset" back to the DTU type). Every row can be colored: courses by code,
  activities (thesis) by `studyplan.activityTypes`, projects by their own type. Items without a DTU type start empty.
- Projects of an exam period (`studyplan.projects`, e.g. "Special course (project)" 10 ECTS, Studyplanner
  `ExamPeriod.Projects`) are shown in the 13-week period of their semester, placement "Project", and count as planned.
- Grid icon in a current/future period header = "Show schedule" (Figma 273:425): week grid Mon-Fri x 8-12 / 13-17 / 18-22
  with the slot codes (autumn E1A...E7, spring F1A...F7) and the course codes in their slot; under it per course DTU's
  schedule note (`courseInfo.scheduleText`), the schedule group and "Exam: Fri, 18 Dec 2026 (E5-B)" from the DTU exam
  timetable (`src/lib/schedule.ts` `examFor`: course number first, then group E5B -> "E5-B"). 3-week periods: no grid.

## Exam dates  (SPECIFIED)
FIGMA: node 163:1493. Route `/exams`.
- Author's decision: the official DTU timetable (`LINKS.examDates`) is static and the same for every student, so it
  is copied into `src/data/examDates.ts` (10 periods, sorted by date). Not invented; re-copy when DTU updates it.
  `app-data.json` `examDates[]` stays empty (no personal exam data).
- Period picker (pill, grows with the text): the DTU period names ("Winter exam December 2026 – January 2027",
  "Ordinary summer exam and re-exam May – June 2027", ...). Only periods not over yet; the first is selected.
- Card exactly as Figma (342x94): "DEC / 6", "Course Numbers:" + the cell text, "Grading Deadline: 12/1 2027" grey.
  Long course lists are cut at 2 lines; tapping such a card expands it. Days already past are faded.
- Link "Source: DTU exam dates" at the bottom.
- "My exams" on top (author's request, 12 Nov 2026): courses placed in the study plan and not passed, matched to the
  timetable (`myExams` in `src/lib/schedule.ts`: course number first, then schedule group E1B -> "E1-B"; odd semester =
  winter exam, even = summer exam). 3-week courses (January/June) are listed with their period, no date (not in the
  table). Days with one of my exams are highlighted in the timetable ("Your exam: 38110").
- My exams with a date are also all-day agenda items (`kind: "exam"`, dark chip in the calendar, dark date block on Home,
  in Upcoming events "All").

## Campus page  (SPECIFIED)
FIGMA: node 7:55. Route `/campus`.
- "Food and Drinks→" opens Food. Under it the 2 LAST VISITED venues (`src/data/venues.ts`, this browser only),
  topped up with the first venues of the list. A venue card does what it does on Food (only B101 is clickable).
- "Library→" opens Library. LIVE numbers (`src/data/library.ts`): "available seats now" = free seats with a sensor,
  "in the library now" = door counter, "visited today" = entries today.
- Map preview: MazeMap iframe, not touchable, centered on the user if the browser shares the position (our blue dot),
  else DTU Lyngby. Expand button opens `/campus/map` (in the app). Offline: Figma map screenshot + message.

## Map  (SPECIFIED)
FIGMA: node 30:214. Route `/campus/map`, outside the tab layout (no tab bar).
- Full MazeMap APP (`LINKS.mazemapApp`, config=DTU, campusid=89, lang=en; author's request 12 Nov 2026) inside the
  frame: search buildings/rooms, directions, floors and MazeMap's own location button. The Campus preview keeps the light
  embed (`mazemapEmbedBase`, not touchable).
- Close control: a slim bar ABOVE the map (back arrow + "Campus map"), not a floating button: the full MazeMap app has
  its own buttons in the top corners (author's request). "Reduce" button top right goes back. Do not download or copy map data.
- Keep the visible credit "Map by MazeMap" (link to `LINKS.mazemap`).
- Geolocation needs HTTPS or localhost: on a phone through `--host` (http://192.168...) the browser refuses it,
  so the map falls back to DTU Lyngby.

## Parking  (SPECIFIED, built 12 Nov 2026)
Campus page order: Food and drinks | Library | Campus map | Parking, each a section with a hairline + section row.
Idea and sources from the DTU campus web app (dashboard-a0e2c.web.app). Route `/campus/parking`; Campus page: section
"Parking" under the map with two red tiles (free car spaces now at Lyngby, EV charging spaces).
- Tabs Car / Bike, campus chips Lyngby / Ballerup / Risø.
- Car: public Sensade API (`LINKS.sensadeApi`, CORS *, read directly, refresh 60 s): stat tiles (free now, spaces,
  EV), "Live" lots with sensors (Koppels Allé A-E: free = spaces x (1 - status), occupancy bar), then all other car
  parks (name, address, spaces, Free/Paid, EV). Tap = directions in the phone's maps app (`LINKS.directions`).
  dtu.sensade.com itself cannot be embedded (X-Frame-Options), so the data is shown with our components.
- Bike: the official DTU bicycle map (`LINKS.bikeMap`, map.cas.dtu.dk, public, embeddable) in an iframe.

## Food  (SPECIFIED)
FIGMA: 30:172 (`/campus/food`) and 157:1132 (`/campus/food/101`). Same grid, order and red rounded cards as the eat@DTU
app, but the cards are real components (author's request 12 Nov 2026, the screenshot crops looked like screenshots):
venue name in a serif (`--font-display`, Playfair Display) like the app's logos, building, and the live status
"Open · until 14:00" / "Opens 11:00" / "Closed" from the real DTU opening hours (`src/lib/openingHours.ts`, tested).
- Naming (author's decision 12 Nov 2026): the grid is titled "Food and drinks" (like the Campus row) and the building 101
  grid "Food Court"; no "Eat@DTU" logo / "Select Venue". "eat@DTU" only on the hand-off button "Order in eat@DTU".
  Grid: 2 equal columns over the full width, 14 px gaps, 16 px side margins (centered).
- Venue order = eat@DTU app (Figma 275:426): Food Court, Hav a Java Central, Social Dining (monthly event, "Every month",
  All you can eat 60 kr.), Wicked Rabbit (B342), SkyLab Café, Folkekøkken (= "Ballerup - The Canteen"). No duplicate.
  Then Canteen B202 and Risø Canteen (the two "Food & Co." cards) and the Faculty Club (B101, 1st floor), hours from DTU Inside.
  Then the food trucks Spiceboat (next to B324), Det Tyrkiske Køkken (B116), Yatai (outside B414): location only (from the
  DTU campus web app), card status "Food truck", no menu and no "Order in eat@DTU" button (not in the app). Every card is clickable (12 Nov 2026):
"B101 - Food Court" opens the building 101 venues, every other card opens its venue page.
- Venue page `/campus/food/venue/:id` (Figma 275:425, eat@DTU Android app): DTU logo, name, red "Order here" button
  (opens the eat@DTU app: App Store on iPhone, Google Play otherwise; `LINKS.eatDtuIos` / `eatDtuAndroid`),
  "Weekly menu" (Mon-Fri chips, today selected; cafés: fixed list), grey box "WHEN & WHERE" + "View map of canteens &
  cafées" (opens the campus map). No ordering, bonus, news or E-Smiley in the prototype.
- Data `src/data/venueInfo.ts`: opening hours REAL (DTU Inside "Contact Information and Opening Hours", copied
  2026-11-12, `LINKS.canteenHours`); menus are SAMPLE data (only published inside the eat@DTU app; CLAUDE.md allows mock
  data for food). The kantine.cas.dtu.dk site is staff/department catering, not the student venues.

## Library  (SPECIFIED)
FIGMA: 30:193. Route `/campus/library`. Live data from the public Smart Library API (`LINKS.smartLibrary`), through the
Vite proxy (no CORS on the API): works with `npm run dev` / `npm run preview`, refresh every 30 s and when the page
comes back. Without the proxy (static hosting) the last real reading is shown with "Not live, last reading".
- Minimal (author's request): title "Library", live dot + time, then per area "N free / N occupied" (blue / orange, Figma
  colors) and one bar. Entire library = door counter vs building capacity (e.g. 514 occupied of 800). First / second floor =
  seats with a sensor. No explanatory text. Links as rows: DTU Findit, group rooms, printers. Links: `findit`, `libraryBooking`, `printing`.
## DTU page, News, Events  (SPECIFIED, built)
- Routes: `/dtu`, `/dtu/news`, `/dtu/events`, `/dtu/services` (tiles open in-app pages `/dtu/services/abroad|career|life|wellbeing`,
  which link out), `/dtu/contact`. News/events are read at runtime from `/data/app-data.json` (`src/data/dtuFeed.ts`).
- DTU page: latest news (1 with image), upcoming events (1 with image), links "Services for students" and "Contact".
- News: `news` list (image, title, date, `badge`). Tap opens `url`. Events: `events` list (image, title, date/time, location).
  Tap opens `url`. Fallback gray block if `imageUrl` fails.
- Services for students: four colored buttons that open external sites (Study Abroad, DTU Career Hub, Student life...).
- Contact: static text.

## Profile  (DRAFT)
- Mock "Edit My User Profile": header "Name (s-number)" from `currentUser`; all fields start EMPTY (author's decision),
  editable, local state only, nothing is sent.
- Change Picture: file picker (camera on phones), replaces the avatar app-wide for the session (lost on reload).
- Change PIN: inline form (new + confirm, 4-6 digits); on match updates the PIN field and says
  "prototype only, not sent to DTU". Eye icon shows/hides the PIN.
- Login: demo mode (no local server) = fake login, any input goes to Home, no network call. Live mode = real DTU login via
  the local server; errors shown under the fields; "Continue with saved data". Live mode with saved data: the splash goes straight to
  Home (log in only when a refresh needs it). Home shows "Updated: …  Refresh" (live only). See docs/live-data.md.

## External links (fill `src/config/links.ts`)
Studyplanner, DTU Learn, CampusNet, Study Abroad, DTU Career Hub, Student life, exam page, DTU contact page.
The author's list is already in `src/config/links.ts` (do not retype URLs).
