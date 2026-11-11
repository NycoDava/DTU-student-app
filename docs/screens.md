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
  ellipsis) and `dayMaxEvents: 2` with the "+n more" popover. Tapping an event opens a bottom sheet: title, date and time,
  location, course, button "Open in DTU Learn" (`url`).
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
  opens the Study planner screen. (The old "12 activities planned / 8 completed" lines are REMOVED.)
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

## List of grades  (DRAFT)
- Table: Number, Title, Grade, ECTS from `grades`, latest period first, then course code. "IB" is shown as "IB (not passed)".

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
- Data: `studyplan.ectsByType[]` = `{ typeId, name, color, expected, completed, planned }`. These are the author's own
  Studyplanner categories (Polytechnic foundation, Programme specific, Electives, Thesis...), with the same colors.
- Donut: slices = `completed + planned` per category, colored with `color`. Center text: `summary.ectsPassed` / `ectsRequired`.
  Completed part solid, planned part lighter (same hue, 40% opacity).
- Below, one row per category: name, "completed + planned / expected ECTS", small progress bar. If completed + planned is
  larger than `expected` (e.g. thesis 35 of 30), show the bar full and the number in the warning color, no error.
- `studyplan.uncategorized` (ECTS not assigned to any category) is shown as a grey "Other" slice only if > 0.

## My courses  (DRAFT)
- Search box filters by code or name. Cards with banner, "code name". Show the courses of the CURRENT term first
  (`term` derived from today: Sep-Jan = "e"+year, Feb-Aug = "f"+year); older terms under "Previous courses".
- Banner: the real Learn course picture, from `localImage` (served from `/course-images/`). Fallback: colored gradient with the course code.

## Course page  (DRAFT)
- Tabs: My Course / Content / Assignments.
- Content: `courseContent[courseId]` as collapsible modules. A topic opens `localPath` if present, otherwise `url`.
  Show a small icon by `kind` (file, link).
- Assignments: `deadlines` of this course: title, due date, "group" badge when `isGroup`, past ones greyed.
- My Course tab (SPECIFIED): blocks in this order:
  1. Course announcements of this course (latest 3, "see all").
  2. "Classlist ->" card with the number of people. Opens the Classlist screen.
  3. "Groups" card: from `classlists[courseId].group` -> category, group name, "n of max members". If null: "You are not in a
     group in this course". Under it: number of group assignments (`deadlines` of this course with `isGroup`).
- Classlist screen: search box, filter chips All / Students / Instructors (role from `people[].role`), instructors first,
  your own row marked "You". Row: initials avatar (colored circle), name, role. Tap on a person shows the email with
  a `mailto:` link. NEVER load profile photos.
- Real names of other people only in local `app-data.real.json`. Deployed data uses `ANON=1` (fictional names).

## Study planner  (DRAFT)
- Do NOT rebuild the official site. A list per semester (`studyplan.semesters`): course code, name, ECTS, schedule group;
  below, the "basket" and a total ECTS bar (planned vs required). Link "Open Studyplanner" to the official site.

## Exam dates  (DRAFT)
- `examDates` is empty in real data (no source). Do not invent dates. Empty state:
  "Exam dates are not available in this prototype" + link to the official exam page.

---------------------------------------------------------------------------------------------------

## Campus page  (SPECIFIED)
FIGMA: <link>
- "Food and Drinks ->": two Food Court cards (static) that open the Food screen.
- "Library ->": "available seats now", "in the library now", "visited today" (static placeholder numbers, clearly marked as
  "example data" in a small note; no data source yet). Link opens the Library screen (seats free/occupied: whole library, first floor, second floor).
- Map preview at the bottom: a small MazeMap embed that is NOT interactive (`pointer-events: none`) with an "expand"
  button in the corner that opens the Map screen.

## Map  (SPECIFIED)
FIGMA: <link>
- Full-screen official MazeMap embed (iframe), with a "collapse" button that goes back to Campus.
  Do not try to download or copy the map data: use the official embed.
- Embed URL (campus 89 = DTU Lyngby):
  `https://use.mazemap.com/embed.html#v=1&campusid=89&zlevel=1&center=12.519825,55.786341&zoom=18.2&utm_medium=iframe`
  Preview: same URL with a lower zoom (about 16). Attributes: `allow="geolocation"`, `title="Map by MazeMap"`, no border.
- Keep the visible credit "Map by MazeMap" (link to https://www.mazemap.com/) as the embed snippet requires.
- The iframe needs internet. Geolocation (the blue dot) needs HTTPS: it will not work on `http://<LAN-IP>:5173`, only on the
  deployed HTTPS version (or localhost).

## Food / Library  (DRAFT)
- Static screens. Food: grid of venue cards (logo + name + building). Library: free/occupied counters per area.

---------------------------------------------------------------------------------------------------

## DTU page, News, Events  (DRAFT)
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
- Fake login: any input goes to Home, no network call.

## External links (fill `src/config/links.ts`)
Studyplanner, DTU Learn, CampusNet, Study Abroad, DTU Career Hub, Student life, exam page, DTU contact page.
The author's list is already in `src/config/links.ts` (do not retype URLs).
