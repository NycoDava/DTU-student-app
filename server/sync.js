/**
 * Sync: reads every source in parallel with the in-memory session, turns the raw data into the app format with the
 * vendored normalize.cjs (same code as the scraper's normalize.js) and saves the result with `fetchedAt`.
 *
 * - One source failing never blocks the others; for a failed source the previous saved data is kept.
 * - Two outputs: app-data.live.json (real, local only) and app-data.demo.json (ANON=1, safe to publish).
 * - Both live in server/cache/ (gitignored). Nothing here contains cookies or passwords.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SessionExpired, fetchDtuFeeds, fetchGrades, fetchLearn, fetchStudyAnnouncements, fetchStudyplan } from './dtu.js';

const exec = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CACHE_DIR = path.join(HERE, 'cache');
export const LIVE_FILE = path.join(CACHE_DIR, 'app-data.live.json');
export const DEMO_FILE = path.join(CACHE_DIR, 'app-data.demo.json');
const IMAGES_DIR = path.join(HERE, '..', 'public', 'course-images');
/** Before the first sync, the demo data is the "previous" data (news/events, local file paths). */
const DEMO_PUBLIC = path.join(HERE, '..', 'public', 'data', 'app-data.json');
const FRESH_MS = 60_000; // short cache: a refresh within a minute of the last one reuses it

export const SOURCES = ['learn', 'studyplan', 'grades', 'study', 'dtu'];

/** Progress shown by the app. state: idle | running | ok | failed | kept (failed, previous data kept). */
export const syncState = {
  running: false,
  startedAt: null,
  finishedAt: null,
  error: null,
  sources: Object.fromEntries(SOURCES.map((s) => [s, { state: 'idle', ms: null, via: null, counts: null, error: null }])),
};

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

export const readSaved = () => readJson(LIVE_FILE);

async function writeAtomic(file, data) {
  const tmp = `${file}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2));
  await rename(tmp, file);
}

async function saveImage(name, body) {
  await mkdir(IMAGES_DIR, { recursive: true });
  await writeFile(path.join(IMAGES_DIR, name), body);
}

const firstLine = (e) => String(e?.message || e).split('\n')[0].slice(0, 200);

/** Runs normalize.cjs on a raw object. The raw file (it holds other people's names) only exists for a moment. */
async function normalize(raw, anon) {
  const id = randomUUID();
  const inFile = path.join(os.tmpdir(), `dtu-raw-${id}.json`);
  const outFile = path.join(os.tmpdir(), `dtu-app-${id}.json`);
  try {
    await writeFile(inFile, JSON.stringify(raw));
    await exec(process.execPath, [path.join(HERE, 'normalize.cjs'), inFile, outFile, path.join(HERE, 'manual-events.json')], {
      env: { ...process.env, ANON: anon ? '1' : '0' },
    });
    return JSON.parse(await readFile(outFile, 'utf8'));
  } finally {
    await rm(inFile, { force: true });
    await rm(outFile, { force: true });
  }
}

/**
 * Per course code, from the raw Studyplanner data (normalize.cjs drops these): course type (→ color), schedule groups
 * ("E5B", "January") and the schedule note. Used by the Studyplanner schedule view and the color squares.
 */
function courseInfoFrom(sp) {
  if (!sp) return null;
  const info = {};
  for (const r of sp.CourseTypeSpecificationRelations || []) (info[r.CourseCode] ??= {}).typeId = r.TypeId;
  const walk = (o) => {
    if (!o || typeof o !== 'object') return;
    if (o.CourseCode && 'ClassSchedule' in o) {
      const entry = (info[o.CourseCode] ??= {});
      entry.schedule = (o.ClassSchedule || []).flat().filter(Boolean);
      entry.scheduleText = o.ScheduleText?.English || null;
    }
    Object.values(o).forEach(walk);
  };
  walk(sp);
  return info;
}

/** For every failed source, copy its part of the app data from the previous saved file. */
function keepPrevious(out, prev, failed, seed) {
  if (!prev) return out;
  if (failed.has('learn')) {
    for (const k of ['courses', 'courseContent', 'deadlines', 'announcements', 'classlists', 'agenda', 'calendar']) out[k] = prev[k];
    out.summary.coursesCount = prev.summary?.coursesCount;
    out.summary.nextDeadline = prev.summary?.nextDeadline;
  } else {
    // The live sync does not download course files: keep the local paths the scraper found.
    const localPath = {};
    const walk = (mods = []) => mods.forEach((m) => (m.topics.forEach((t) => t.localPath && (localPath[t.id] = t)), walk(m.modules)));
    Object.values(prev.courseContent || {}).forEach(walk);
    const fill = (mods = []) =>
      mods.forEach((m) => {
        m.topics.forEach((t) => {
          if (!t.localPath && localPath[t.id]) Object.assign(t, { localPath: localPath[t.id].localPath, bytes: localPath[t.id].bytes });
        });
        fill(m.modules);
      });
    Object.values(out.courseContent || {}).forEach(fill);
  }
  if (failed.has('studyplan')) {
    out.studyplan = prev.studyplan;
    out.summary.ectsPlanned = prev.summary?.ectsPlanned;
    out.summary.ectsRequired = prev.summary?.ectsRequired;
    if (failed.has('grades')) {
      out.grades = prev.grades;
      out.summary.gpa = prev.summary?.gpa;
      out.summary.ectsPassed = prev.summary?.ectsPassed;
    }
  }
  if (failed.has('study')) out.studyAnnouncements = prev.studyAnnouncements ?? [];
  if (failed.has('dtu')) {
    // An empty previous list is not worth keeping: fall back to the demo data's lists.
    out.news = prev.news?.length ? prev.news : seed?.news ?? [];
    out.events = prev.events?.length ? prev.events : seed?.events ?? [];
  }
  return out;
}

let lastOkAt = 0;
let running = null;

/** Starts a sync (or returns the one already running). Resolves with the final syncState. */
export function startSync({ force = false } = {}) {
  if (running) return running;
  if (!force && Date.now() - lastOkAt < FRESH_MS) return Promise.resolve(syncState);
  running = doSync().finally(() => {
    running = null;
  });
  return running;
}

async function doSync() {
  const t0 = performance.now();
  Object.assign(syncState, { running: true, startedAt: new Date().toISOString(), finishedAt: null, error: null });
  for (const s of SOURCES) syncState.sources[s] = { state: 'running', ms: null, via: null, counts: null, error: null };

  const results = {};
  let expired = false;
  const runSource = async (name, fn) => {
    const s0 = performance.now();
    try {
      results[name] = await fn();
      syncState.sources[name] = { state: 'ok', ms: Math.round(performance.now() - s0), via: results[name].via || 'request', counts: results[name].counts || null, error: null };
    } catch (e) {
      if (e instanceof SessionExpired) expired = true;
      syncState.sources[name] = { state: 'failed', ms: Math.round(performance.now() - s0), via: null, counts: null, error: e instanceof SessionExpired ? 'session_expired' : firstLine(e) };
    }
  };

  await Promise.all([
    runSource('learn', () => fetchLearn({ saveImage })),
    runSource('studyplan', fetchStudyplan),
    runSource('grades', fetchGrades),
    runSource('study', fetchStudyAnnouncements),
    runSource('dtu', fetchDtuFeeds),
  ]);

  const failed = new Set(SOURCES.filter((s) => syncState.sources[s].state !== 'ok'));
  try {
    if (failed.size === SOURCES.length) throw new Error(expired ? 'session_expired' : 'all sources failed, saved data kept');
    const seed = await readJson(DEMO_PUBLIC);
    const prevLive = (await readJson(LIVE_FILE)) ?? seed;
    const prevDemo = (await readJson(DEMO_FILE)) ?? seed;
    const fetchedAt = new Date().toISOString();
    const raw = {
      collectedAt: fetchedAt,
      learn: results.learn?.learn || { Courses: [] },
      courseDetails: results.learn?.courseDetails || [],
      calendar: results.learn?.calendar || { ok: false, events: [] },
      classlists: results.learn?.classlists || {},
      courseImages: results.learn?.courseImages || {},
      downloads: [],
      studyplan: results.studyplan?.studyplan || null,
      grades: results.grades?.grades || [],
      dtuSite: results.dtu || { news: { items: [] }, events: { items: [] } },
    };
    const sources = Object.fromEntries(SOURCES.map((s) => [s, { ok: !failed.has(s), error: syncState.sources[s].error }]));
    const [live, demo] = await Promise.all([normalize(raw, false), normalize(raw, true)]);
    // Fields normalize.cjs does not know about (public study announcements: same in both files).
    const courseInfo = courseInfoFrom(results.studyplan?.studyplan);
    for (const out of [live, demo]) {
      out.studyAnnouncements = results.study?.studyAnnouncements ?? [];
      if (out.studyplan && courseInfo) out.studyplan.courseInfo = courseInfo;
    }
    await mkdir(CACHE_DIR, { recursive: true });
    await writeAtomic(LIVE_FILE, { ...keepPrevious(live, prevLive, failed, seed), fetchedAt, sources });
    await writeAtomic(DEMO_FILE, { ...keepPrevious(demo, prevDemo, failed, seed), fetchedAt, sources });
    for (const s of failed) if (syncState.sources[s].error !== 'session_expired') syncState.sources[s].state = prevLive ? 'kept' : 'failed';
    lastOkAt = Date.now();
  } catch (e) {
    syncState.error = firstLine(e);
  } finally {
    Object.assign(syncState, { running: false, finishedAt: new Date().toISOString() });
    console.log(`[sync] ${Math.round(performance.now() - t0)} ms`, Object.fromEntries(SOURCES.map((s) => [s, `${syncState.sources[s].state} ${syncState.sources[s].ms}ms`])));
  }
  return syncState;
}
