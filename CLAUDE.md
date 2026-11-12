# DTU Student App (prototype)

Mobile-first web app prototype for the course 02830 (Advanced Project in Digital Media Engineering, DTU).
It unifies tools students currently use separately (DTU Learn, CampusNet grades, Studyplanner, dtu.dk news/events)
into one app with an aggregated view ("what do I have to do today / this week").
It is a PROTOTYPE for usability testing, not a product. Prefer simple, readable code over clever code.

## Stack and commands
- Vite + React + TypeScript, React Router. Plain CSS with CSS variables (design tokens). No heavy UI library.
- Charts: `recharts`. Calendar: FullCalendar (all four views: Day, Week, Month, List). Map: official MazeMap iframe embed.
- All external URLs are named constants in `src/config/links.ts`.
- Commands: `npm run dev` (use `npm run dev -- --host` to open it on a phone), `npm run build` (must pass).
- Live data: `npm run server` (local DTU server, `server/`, 127.0.0.1:8787, reached via the Vite proxy `/api/local`),
  `npm run demo-data` (copies the anonymized output of the last sync to `public/data/app-data.json`). See `docs/live-data.md`.
- UI language: English (the Figma frames are in English).

## Layout rules
- Design width is 393 x 852 px (phone). Build mobile first.
- On desktop, show the app in a centered column, max-width 393px, full height (`100dvh`), so it looks like a phone.
- Bottom tab bar is fixed on every main screen (icons only, no labels).
- Touch targets at least 44 px. Scrolling must work with one finger, no hover-only interactions.
- Colors, fonts and spacing come from the Figma variables / frames. Put them in `src/styles/tokens.css` once and reuse.
  The brand color is DTU red (dark red borders and tab bar). Where a Figma element clearly breaks the palette
  (for example the blue login button), use the DTU red and tell me what you changed.

## Figma
- Frames are read with the Figma MCP server. Rate limit: 200 calls/day, 10/minute, and one frame costs about 3 calls.
- Read each frame ONCE. After reading, write a short note in `docs/design-notes.md` (frame name, layout, key
  measurements, behavior) and work from the note afterwards instead of re-reading Figma.
- Never ask Figma to "describe" a frame without building something from it.
- Some frames contain a screenshot image instead of real layers (calendar views, Studyplanner). Treat the image as a
  visual reference only; build the real UI from the data.

## Data (single source of truth)
- The app reads ONE JSON file in the app-data format. Live mode (local server running): the server's last saved sync
  (`server/cache/app-data.live.json`, via `/api/local/data`). Demo mode (no server, static build): `public/data/app-data.json`,
  always generated with `ANON=1`. Both are the output of normalize.js (scraper or `server/normalize.cjs`), so they hold everything collected (courses, content, deadlines, grades, studyplan, news, events, classlists). Only the raw
  intermediate file `dtu_data.json` is off limits (huge, raw). It contains the author's REAL
  study data (the professor requires real data, do not invent data). Its `classlists` are anonymized (`ANON=1`).
  Do not create a fictional dataset.
- Write a typed loader in `src/data/` (TypeScript types for the schema below) and derive everything from it.
  Do not hard-code numbers like GPA or ECTS in components. They come from `summary`.
- All timestamps are ISO strings in UTC. Display them in `Europe/Copenhagen` with `Intl.DateTimeFormat`.
- Schema of `app-data.json`:
  - `summary`: `gpa`, `ectsPassed`, `ectsPlanned` (= planned ECTS still to take, not a total), `ectsRequired`, `coursesCount`, `nextDeadline`
  - `courses[]`: `id`, `code`, `term`, `name`, `isActive`, `startDate`, `endDate`, `imageUrl`, `localImage`, `url`
  - `courseContent[courseId]`: modules `[{ title, topics: [{ id, title, kind: "File"|"Link"|"ContentService", url, localPath, bytes }], modules: [...] }]`
  - `deadlines[]`: `id`, `courseId`, `courseCode`, `courseName`, `title`, `dueAt`, `isGroup`, `url`
  - `announcements[]`: `id`, `courseId`, `courseCode`, `courseName`, `title`, `preview`, `text`, `createdAt`, `isPinned`, `url`
  - `grades[]`: `code`, `title`, `ects`, `grade` ("12", "10", "IB"...), `passed`, `period`
  - `studyplan`: `requiredEcts`, `semesters[{ number, year, periods[{ type, year, courses[{ code, name, ects, scheduleGroup }], activities[{ name, ects }] }] }]`, `basket[]`, `ectsByType[{ typeId, name, color, expected, completed, planned }]`, `uncategorized`
  - `classlists[courseId]`: `{ ok, myId, myRoleId, people[{ id, name, email, username, role, isMe }], group: { category, name, members, maxMembers } | null }`
  - `agenda[]`: unified list for Home and all calendar views. `id`, `kind` ("event" | "deadline"), `source`, `courseCode`, `title`, `location`, `startsAt`, `endsAt`, `isAllDay`, `url`
  - `news[]`: `id`, `title`, `url`, `teaser`, `publishedAt`, `imageUrl`, `badge`
  - `events[]`: `id`, `title`, `url`, `teaser`, `startsAt`, `endsAt`, `location`, `organizers`, `imageUrl`, `subjects`
  - `examDates[]`: empty for now (no data source). Screen shows an empty state or a link out.
- Course banner: use `localImage` (downloaded by the scraper; the author copies the folder to `public/course-images/`, so
  the path is `/course-images/<file name>`). `imageUrl` needs a Learn login, so never rely on it. If no image loads, fall back to a
  colored gradient banner with the course code.
- `topics[].localPath` (downloaded files) is relative to the scraper folder. For the local app, files live in `public/files/...`.
  Open the local file if it exists, otherwise open `url` (DTU Learn).

## Scope (what to build, in this order)
1. Project setup, tokens, tab bar, routing with empty screens, login. Demo mode (no local server): fake login (accepts any
   input, goes to Home, no network call). Live mode (local server answers): real DTU login through the local server.
2. Home: study announcements, upcoming activities and deadlines, calendar. The calendar uses FullCalendar, so all four
   views (Day, Week, Month, List) are built together from `agenda`; the work is the styling. See docs/screens.md.
3. Upcoming events (tabs: All / Deadlines / Activities), study announcements list.
4. My courses, course page (My Course / Content / Assignments tabs).
5. Grades (GPA, ECTS, trend chart, list of grades, GPA calculator) and Studyplanner as a simple list per semester + ECTS chart.
6. DTU page: news, events, services, contact.
7. Campus: library seats, food, map. These can be static mock data.
- Pages that only link out to a DTU website (study abroad, career hub, etc.) are just a card that opens the URL.
- Do not build anything outside this list without asking.

## Working rules
- One screen per task. Start every task with a short plan (Plan mode) and wait for my OK before large changes.
- After each screen: `npm run build` passes, then tell me exactly which route to open and what to check.
- Commit after each working screen, with a clear message.
- FIDELITY: the Figma design is the target. Reproduce each frame as closely as possible (layout, spacing, colors, type,
  icons). Deviate only when needed: real data instead of sample text, responsive width, touch targets, or an element that
  Figma shows as an image (see Figma rules). Tell me every deviation.
- Some frames are hand-drawn without auto layout. Use the frame's screenshot as the visual truth and build the layout with
  flexbox/grid to match it. Do not copy absolute positions blindly if they break at other widths.

## Screen specs
- `docs/screens.md` holds the spec of every screen: data used, behavior, states, and decisions that Figma cannot show.
  Before building a screen, read ITS section only (plus the Figma frame once). If the spec and Figma disagree, ask me.
- Known data limit: grades only carry an exam period (`v25` = winter 2025, `s26` = summer 2026), not an exact date.
  Any "trend" is per period, not per day.

## Token economy (I am on the Claude Pro plan, limits are shared and finite)
- Never open `app-data*.json` in full. To see its shape, use a short Node one-liner that prints keys and the first item.
- Keep answers and diffs short. Do not re-read files you already read in this session. Do not paste whole files back to me.
- Suggest `/clear` between unrelated screens and `/compact` before long breaks.

## Privacy and safety (important)
- NEVER read, open, copy or print `.env`, `dtu_data.json`, or any file containing credentials.
- Never put credentials in the client code or git. The real grades/studyplan in `app-data.json` are the author's own and may be committed.
- `.gitignore` must include: `.env`, `dtu_data.json`, `public/data/app-data.real.json` (non-anonymized classlists), `public/files/`,
  `node_modules/`, `server/cache/` (live sync output with real names).
- Live login (local server): every user runs the server on their OWN computer with their OWN account. Credentials are never
  stored, logged, or sent to any host other than DTU; they are only typed into the DTU login form. The session (cookies) lives
  only in memory, no automatic re-login. The server listens only on 127.0.0.1 (Host header checked, JSON-only POSTs, no CORS).
  Usability testers never enter real DTU credentials: tests use the static demo build.
- The demo build contains no real data of other people: `public/data/app-data.json` is always the `ANON=1` output
  (`npm run demo-data` refuses non-anonymized classlists). Real grades/studyplan of the author are allowed.
- `classlists` contains OTHER PEOPLE's names and emails: the file with real names is `app-data.real.json` (gitignored). Anything deployed or handed in must be generated with `ANON=1` (fictional names for everyone except the author). No photos: initials avatars.
