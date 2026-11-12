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

## Home  (SPECIFIED, except the first card, see note)
FIGMA: <link>
- Header: student name + DTU logo.
- "Study Announcements ->": card with the latest announcement (`announcements[0]`: course code, title, preview).
  Tap opens the Study announcements screen. NOTE: the Figma sample text ("Study Announcement n.821, winter exams") comes
  from DTU Study Administration, which is NOT in the data. We use course announcements instead. Keep the card style.
- "Upcoming Activities and Deadlines ->": the NEXT upcoming `agenda` item (event or deadline): date block (Oct 28),
  time, title, course code + course name. Deadlines have the red border. Tap opens Upcoming events.
- "Your Calendar": segmented control Day / Week / Month / List. Default view: Week. See Calendar.

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
- Week view: show 08:00-18:00 by default and scroll for the rest. Highlight today.
- Style with CSS variables so it matches the app (DTU red for today and buttons, system font). No FullCalendar default blue.

## Upcoming events  (DRAFT)
FIGMA: <link>  (3 variants: All / Deadlines / Activities)
- Tabs filter `agenda` from now on, ascending: All = everything, Deadlines = `kind: "deadline"`, Activities = `kind: "event"`.
- Row: date block (month + day), time, bold title, small line "course code course name". Deadlines have a red border.
- Tap opens `url`.

## Study announcements  (DRAFT)
- List of `announcements`, newest first: course code, title, preview (2 lines). Tap expands the full `text`.

---------------------------------------------------------------------------------------------------

## My studies (tab "school", route `/student`)  (SPECIFIED)
FIGMA: node 7:22. Hub: "Grades and ECTS→" (/grades), ECTS pie from `studyplan.ectsByType` (slice color = type color
from Studyplanner) + "Ects completed: passed/required", "My Courses→" (/courses) with the 2 LAST VISITED courses
(`src/data/recentCourses.ts`, fallback: first active courses), "Studyplanner→" (/studyplanner), "Exams Dates→" (/exams),
"Study Guidance" external link. Until data is plugged in: grey pie, 0/120, two empty course slots.

## Grades and progress (route `/grades`, behind "Grades and ECTS→")  (SPECIFIED)
FIGMA: <link>  (this is the "Grades / Progress" screen, with the chart)
- Top: "Progress" bar with `summary.ectsPassed / summary.ectsRequired` and the text "55/120 ects".
- Small donut of ECTS by category (see "ECTS distribution") and the button "Show ECTS distribution". Link "StudyPlanner ->"
  opens the Study planner screen. "N activities planned / M activities completed" are KEPT (author's decision, may change):
  courses + activities in `studyplan.semesters`, completed = course code has a passed grade (`src/lib/studyplan.ts`).
- Progress bar fill is DTU red (Figma blue, approved deviation).
- "Grades Insights": "Current GPA: x.xx" = `summary.gpa`. Link "GPA calculator ->".
- Card "Last grade": course code, title, grade, ECTS of the most recent grade (latest period; inside a period use the
  order of the data, there is no exact exam date).
- Chart (recharts, `LineChart`), interactive:
  - Blue line = the grade of each course (x = one point per course, labelled with a shortened course title).
  - Orange line = GPA evolution (ECTS-weighted mean of the passed, numeric grades up to that point). Both are DISCRETE
    lines: straight segments joining the points, with a dot on every point (`type="linear"`, NOT a step line).
  - DATA LIMIT: `grades[].period` is only a period ("v25" = winter 2025, "s26" = summer 2026), no exact date. So the order
    of courses inside a period is arbitrary (sort by period, then course code). The GPA is still computed course by course in
    that order; the GPA at the last course of a period is exact, the values inside a period are indicative.
  - A light band + label at the top marks each period ("WINTER 2025", "SPRING 2026"). Failed/"IB" courses: grade point
    shown as a hollow dot at the bottom, not counted in the GPA.
  - Horizontal scroll: the plot area is wider than the screen (about 90 px per course) inside an `overflow-x: auto` wrapper,
    the Y axis stays fixed outside the scroll area. Start scrolled to the RIGHT (latest grades visible).
  - Test feedback said "it was not clear that it scrolls": show a partially cut-off next point at the right edge, a soft
    fade on the scrolling edge, and a small hint "swipe to see earlier grades" that disappears after the first scroll.
  - Tap a point: tooltip with course code and title, grade, ECTS, period, GPA at that point. Add a small legend for the two lines.

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
- Color square: the data has no course type per course, so it is drawn empty.

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
- Full MazeMap embed (`LINKS.mazemapEmbedBase`, config=DTU) inside the black rounded frame: search, routes and
  MazeMap's own location button. "Reduce" button top right goes back. Do not download or copy map data.
- Keep the visible credit "Map by MazeMap" (link to `LINKS.mazemap`).
- Geolocation needs HTTPS or localhost: on a phone through `--host` (http://192.168...) the browser refuses it,
  so the map falls back to DTU Lyngby.

## Food  (SPECIFIED)
FIGMA: 30:172 (`/campus/food`) and 157:1132 (`/campus/food/101`). Author's request: IDENTICAL to the eat@DTU app,
so each card is a crop of the real screenshot (crop values from Figma). Only "B101 - Food Court" is clickable (opens
the building 101 venues); the others would open the order page, not built yet.

## Library  (SPECIFIED)
FIGMA: 30:193. Route `/campus/library`. Live data from the public Smart Library API (`LINKS.smartLibrary`), through the
Vite proxy (no CORS on the API): works with `npm run dev` / `npm run preview`, refresh every 30 s and when the page
comes back. Without the proxy (static hosting) the last real reading is shown with "Not live, last reading".
- Seats boxes Free (blue) / Occupied (orange) for entire library, first floor, second floor = seats with a sensor,
  plus an occupancy bar. Links: `findit`, `libraryBooking`, `printing`.
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
  the local server; errors shown under the fields; "Continue with saved data". Home shows "Updated: …  Refresh" (live only). See docs/live-data.md.

## External links (fill `src/config/links.ts`)
Studyplanner, DTU Learn, CampusNet, Study Abroad, DTU Career Hub, Student life, exam page, DTU contact page.
The author's list is already in `src/config/links.ts` (do not retype URLs).
