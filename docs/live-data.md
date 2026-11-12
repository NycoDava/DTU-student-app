# Live data (local DTU server)

The app has two modes, chosen automatically at start:

| Mode | When | Login | Data |
|---|---|---|---|
| **Live** | `npm run server` is running and the app is served by Vite (`npm run dev` / `npm run preview`) | Real: the credentials go to the local server, which logs in to DTU | Last saved sync (`server/cache/app-data.live.json`, real data, gitignored) |
| **Demo** | No server answers (static build for usability tests, server off) | Fake (any input → Home, no network call) | `public/data/app-data.json` (anonymized with `ANON=1`) |

## How it works
1. `POST /api/login`: Playwright (headless Chromium) fills the ADFS form (`#userNameInput`, `#passwordInput`, `#submitButton`) once,
   then opens studieplan.dtu.dk and CampusNet once so their cookies are written into the same browser context.
2. All data is read with `context.request` (same cookies as the context: no CORS, no cookie export).
3. A sync builds the same RAW shape as `dtu-scraper.js` and runs the vendored `server/normalize.cjs` (copy of the scraper's
   `normalize.js`) twice: real → `app-data.live.json`, `ANON=1` → `app-data.demo.json`. Both carry `fetchedAt` and per-source status.
4. A source that fails keeps its previous saved data; the other sources are updated anyway.
5. `npm run demo-data` copies the anonymized file to `public/data/app-data.json` (refuses if any classlist entry is not anonymized).

## Log in once (12 Nov 2026)
- Live mode with saved data: the app opens straight on Home with the last saved data (no login screen).
- The login screen only appears when a refresh needs it ("Sign in to refresh", or a 401 session_expired), or when there
  is no saved data yet. If the server still has a valid session, /login redirects to Home.
- When the app opens and the session is valid, data older than 30 minutes is refreshed automatically.
- Keep-alive: while a session exists the server makes one light Learn request (whoami) every 10 minutes, so the DTU
  session does not time out for inactivity. DTU still ends it after its absolute lifetime; then one new login is needed.
- Still true: the password is never stored, the session (cookies) only lives in memory. Restarting `npm run server`
  ends the session (the saved data stays).
- `DTU_SERVER_PORT` sets the server port for both `npm run server` and the Vite proxy (default 8787).

## Course files in the app (12 Nov 2026)
- `GET /api/files/:orgUnitId/:topicId` (`?download=1` for a download): the server fetches the file from Learn with the
  session the first time it is opened (`/d2l/api/le/1.100/{ou}/content/topics/{id}/file`), then serves it with Range
  support. Kept ONLY IN MEMORY: dropped 30 min after the last use, above 300 MB in total, and when the server stops.
  Nothing on disk; `Cache-Control: no-store`, so the phone keeps no copy. A file in memory opens without a session.
- Measured: 0.3 MB in ~1 s, 3.2 MB in ~0.8 s, 87.5 MB in ~20 s (first time); from memory ~4 ms.
- App: in live mode a PDF or image topic opens the in-app viewer (`/courses/:id/file/:topicId`, PDF.js, lazy-loaded,
  pages drawn only near the screen). Other files (PPTX, DOCX) download through the server. Demo mode: unchanged
  (local copy if present, otherwise DTU Learn).

## Endpoints (Phase 0, measured 12 Nov 2026 with context.request)

| Source | Endpoint | Kind | Result | Time |
|---|---|---|---|---|
| Learn | `/d2l/api/versions/` | API JSON | 200 (LE 1.100, LP 1.64) | ~440 ms (first call) |
| Learn | `/d2l/le/manageCourses/api/mycourses?...` | API JSON | 200, 12 courses | 90–140 ms |
| Learn | `/d2l/api/le/1.100/{ou}/content/toc` | API JSON | 200 | ~130 ms |
| Learn | `/d2l/api/le/1.100/{ou}/news/` | API JSON | 200 | ~230 ms |
| Learn | `/d2l/api/le/1.100/{ou}/dropbox/folders/` | API JSON | 200 | ~150 ms |
| Learn | `/d2l/api/le/1.100/{ou}/classlist/` | API JSON | 200 | ~115 ms |
| Learn | `/d2l/api/lp/1.64/users/whoami`, `/{ou}/groupcategories/` | API JSON | 200 | 70–100 ms |
| Learn | course banner image | binary | 200 image/jpeg | ~220 ms |
| Learn | all 12 courses × 3 routes, concurrency 4, no pauses | API JSON | 36/36 ok | ~4.1 s |
| Learn | `/d2l/api/le/1.100/calendar/events/myEvents/` | API JSON | **400** `Invalid Parameters: Request has missing or invalid parameters.` (with and without `associated=true`) | – |
| Studyplanner | `https://studieplan.dtu.dk` | parsing (`var data = {...}`) | 200, 10 exam results | 250–500 ms |
| Grades | `https://campusnet.dtu.dk/cnnet/Grades/Grades.aspx` | parsing (Cheerio, `table.gradesList`) | 200, 10 rows | 60–230 ms |
| dtu.dk | `/api/v1/news/newslist`, `/api/v1/calendar/calendareventlist` | API JSON | **403** (HTML error page; the headless page also loads no API calls) | – |

## Timings (end-to-end tests through the server)
- Login (ADFS + platform entries): 7–17 s. Wrong password detected in 1–2.5 s.
- Refresh, all sources in parallel: ~4.1 s (Learn ~3.7 s, Studyplanner ~0.3 s, Grades ~0.06 s, dtu.dk fails fast and keeps saved data).
- Second refresh within 60 s: ~3 ms (short cache).
- App: Access → Home ~22 s (login + start of the refresh), new data shown ~30 s after Access.
- For comparison the scraper takes minutes (pages one by one, 300 ms pause per call).

## Fallbacks (per source)
- Learn: if `context.request` fails for a non-auth reason, the same URL is fetched inside the Learn page (`fetch` with credentials, like the scraper).
- Studyplanner, Grades: if the direct GET does not contain the data, the page is opened like the scraper does.
- Calendar: not available via API (400 above); the agenda uses Learn deadlines + `server/manual-events.json`, as before.
- dtu.dk news/events: kept from the last saved data (they are public and change slowly). The manual scraper still collects them (headed browser).
- Everything fails: the saved data stays and the app shows it with its date.

## Fragile points
- **CAS hand-off (Studyplanner).** The first GET sometimes returns a JS page (`<title>Cas</title> window.location.href='…?ticket=ST-…'`)
  instead of the plan. `get()` follows it (DTU hosts only, max 2 hops, ticket never logged). If DTU changes this page, the fallback opens the page.
- **Scraping-based sources** depend on markup: `var data = {...}` (Studyplanner) and the table with headers Number/Title (CampusNet).
- **Learn API version** is discovered at login (`/d2l/api/versions/`); routes use the latest LE/LP version.
- **ADFS form selectors** (`#userNameInput`, `#passwordInput`, `#submitButton`, `#errorText`). If DTU enables MFA, login returns `mfa_required`.
- **Session length** is decided by DTU (a few hours). Expiry is detected when a response is the ADFS login page → 401 `session_expired` → the app asks for username + password again. No automatic re-login (the password is not kept).
- **Rate limit** (5 login attempts / 15 min) is in memory: restarting the server resets it.
- Course files are not downloaded by the live sync (too slow); local file paths found by the scraper are kept.

## How to test
1. Terminal 1: `npm run server` (prints `DTU local server on http://127.0.0.1:8787`).
2. Terminal 2: `npm run dev`, open `/login`, enter your DTU username (`username@dtu.dk` or `sXXXXXX`) and password → Access.
3. Home shows "Refreshing…" with chips Courses / Studyplan / Grades / DTU news, then reloads with "Updated: <day, time>".
4. Tap "Refresh" again: new data in ~4 s. Stop the server and reload: the app is in demo mode (fake login, no sync bar).
5. Session expired / logged out: "Refresh" opens the login with "Your DTU session has expired…". "Continue with saved data" skips login.
6. Before publishing the demo: `npm run demo-data`, then `npm run build`.
