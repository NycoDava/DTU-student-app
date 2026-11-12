/**
 * normalize.js: turns the raw scraper output (dtu_data.json) into the single
 * file the app reads (app-data.json).
 *
 * Run:  node normalize.js [input] [output]
 *       node normalize.js dtu_data.json app-data.json
 *
 * Everything the app shows (GPA, ECTS passed, deadlines, ...) is DERIVED here
 * from one source, so numbers can never disagree between screens.
 */
const fs = require('fs');

const LEARN = 'https://learn.inside.dtu.dk';
const inFile = process.argv[2] || 'dtu_data.json';
const outFile = process.argv[3] || 'app-data.json';
const raw = JSON.parse(fs.readFileSync(inFile, 'utf8'));

const isList = (x) => Array.isArray(x);
const stripHtml = (html = '') =>
  String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

// "DTU_f26_02808" -> { code: "02808", term: "f26" }
const parseCourseCode = (c) => {
  const m = /^DTU_([a-z]\d{2})_(.+)$/i.exec(c || '');
  return m ? { term: m[1], code: m[2] } : { term: null, code: c };
};

// ---------- courses ----------
const courses = (raw.learn?.Courses || []).map((c) => {
  const { term, code } = parseCourseCode(c.Code);
  return {
    id: c.OrgUnitId,
    code,
    term,
    name: c.Name,
    isActive: c.IsActive,
    startDate: c.StartDate,
    endDate: c.EndDate,
    imageUrl: c.FormattedImageLink ? LEARN + c.FormattedImageLink : null,
    localImage: (raw.courseImages || {})[c.OrgUnitId] || null, // downloaded banner, relative to the scraper folder
    url: `${LEARN}/d2l/home/${c.OrgUnitId}`,
  };
});
const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));

// ---------- downloaded files (topicId -> local path) ----------
const localFiles = Object.fromEntries((raw.downloads || []).map((d) => [`${d.courseId}-${d.topicId}`, d]));

// ---------- per-course details ----------
const deadlines = [];
const announcements = [];
const courseContent = {};

for (const e of raw.courseDetails || []) {
  const course = courseById[e.orgUnitId];
  if (!course) continue;

  if (isList(e.assignments)) {
    for (const a of e.assignments) {
      if (a.IsHidden) continue;
      deadlines.push({
        id: `${e.orgUnitId}-${a.Id}`,
        courseId: e.orgUnitId,
        courseCode: course.code,
        courseName: course.name,
        title: a.Name,
        dueAt: a.DueDate || null, // ISO, UTC
        isGroup: a.GroupTypeId ? a.GroupTypeId > 0 : false,
        url: course.url,
      });
    }
  }

  if (isList(e.announcements)) {
    for (const n of e.announcements) {
      if (n.IsHidden || n.IsPublished === false) continue;
      const text = stripHtml(n.Body?.Html || n.Body?.Text || n.Body);
      announcements.push({
        id: `${e.orgUnitId}-${n.Id}`,
        courseId: e.orgUnitId,
        courseCode: course.code,
        courseName: course.name,
        title: n.Title,
        preview: text.slice(0, 200),
        text,
        createdAt: n.StartDate || n.CreatedDate || null,
        isPinned: !!n.IsPinned,
        url: course.url,
      });
    }
  }

  const modules = e.content?.Modules;
  if (isList(modules)) {
    const mapModule = (m) => ({
      title: m.Title,
      topics: (m.Topics || [])
        .filter((t) => !t.IsHidden)
        .map((t) => {
          const dl = localFiles[`${e.orgUnitId}-${t.TopicId}`];
          return {
            id: t.TopicId,
            title: t.Title,
            kind: t.TypeIdentifier, // File | Link | ContentService
            url: t.Url ? LEARN + t.Url : null, // opens on DTU Learn
            localPath: dl ? dl.localPath : null, // present only if downloaded
            bytes: dl ? dl.bytes : null,
          };
        }),
      modules: (m.Modules || []).filter((x) => !x.IsHidden).map(mapModule),
    });
    courseContent[e.orgUnitId] = modules.filter((m) => !m.IsHidden).map(mapModule);
  }
}

const byDueAsc = (a, b) => (a.dueAt || '9999').localeCompare(b.dueAt || '9999');
deadlines.sort(byDueAsc);
announcements.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

// ---------- calendar (Learn) ----------
// Accepts both an array and { Objects: [...] } and tolerant field names.
const calRaw = raw.calendar?.events || [];
const calendar = calRaw
  .map((ev) => {
    const ou = ev.OrgUnitId ?? ev.orgUnitId ?? null;
    const course = ou ? courseById[ou] : null;
    return {
      id: String(ev.CalendarEventId ?? ev.Id ?? `${ou}-${ev.StartDateTime}-${ev.Title}`),
      courseId: ou,
      courseCode: course ? course.code : null,
      title: ev.Title || ev.Name || '',
      location: ev.LocationName || ev.Location || null,
      startsAt: ev.StartDateTime || ev.StartDate || null,
      endsAt: ev.EndDateTime || ev.EndDate || null,
      isAllDay: !!ev.IsAllDayEvent,
      description: stripHtml(ev.Description?.Html || ev.Description?.Text || ev.Description || '').slice(0, 300),
    };
  })
  .sort((a, b) => (a.startsAt || '').localeCompare(b.startsAt || ''));

// ---------- dtu.dk news + events ----------
const cleanItems = (feed) =>
  (feed?.items || []).map((i) => ({ ...i, teaser: (i.teaser || '').slice(0, 220) }));
const news = cleanItems(raw.dtuSite?.news).sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
// dtu.dk events: soonest first
const events = cleanItems(raw.dtuSite?.events).sort((a, b) => (a.startsAt || '').localeCompare(b.startsAt || ''));

// ---------- manual events (what Learn does not expose: lectures, group work...) ----------
// Optional file manual-events.json (3rd argument, default next to this script). Times are
// Copenhagen local time. Two kinds of entries:
//   one-off:  { "title": "Group work", "courseCode": "02830", "location": "Bldg 306",
//               "startsAt": "2026-11-18T13:00", "endsAt": "2026-11-18T17:00" }
//   weekly:   { "title": "Lecture", "courseCode": "02830", "weekday": 3, "start": "13:00",
//               "end": "17:00", "from": "2026-09-02", "to": "2026-12-02", "skip": ["2026-10-14"] }
//             (weekday: 1 = Monday ... 7 = Sunday)
const TZ = 'Europe/Copenhagen';
const tzOffsetMs = (utcMs) => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TZ,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(new Date(utcMs))
      .map((x) => [x.type, x.value])
  );
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - utcMs;
};
// "2026-11-18" + "13:00" (Copenhagen) -> ISO UTC
const localToIso = (date, time) => {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi, 0);
  return new Date(guess - tzOffsetMs(guess)).toISOString();
};
const manualFile = process.argv[4] || 'manual-events.json';
const manualEvents = [];
if (fs.existsSync(manualFile)) {
  const entries = JSON.parse(fs.readFileSync(manualFile, 'utf8'));
  const courseByCode = Object.fromEntries(courses.map((c) => [c.code, c]));
  const push = (e, date, start, end) =>
    manualEvents.push({
      id: `manual-${manualEvents.length + 1}`,
      courseId: courseByCode[e.courseCode]?.id ?? null,
      courseCode: e.courseCode || null,
      title: e.title,
      location: e.location || null,
      startsAt: localToIso(date, start),
      endsAt: localToIso(date, end),
      isAllDay: false,
      description: '',
    });
  for (const e of entries) {
    if (e.weekday) {
      const skip = new Set(e.skip || []);
      const [fy, fm, fd] = e.from.split('-').map(Number);
      const [ty, tm, td] = e.to.split('-').map(Number);
      for (let t = Date.UTC(fy, fm - 1, fd); t <= Date.UTC(ty, tm - 1, td); t += 24 * 3600 * 1000) {
        const dt = new Date(t);
        const isoWeekday = dt.getUTCDay() === 0 ? 7 : dt.getUTCDay();
        const date = dt.toISOString().slice(0, 10);
        if (isoWeekday === e.weekday && !skip.has(date)) push(e, date, e.start, e.end);
      }
    } else {
      const [date, start] = e.startsAt.split('T');
      push(e, date, start, e.endsAt.split('T')[1]);
    }
  }
}

// ---------- agenda: ONE list for Home, calendar views and "Upcoming" ----------
// kind: "event" (Learn calendar + manual) or "deadline" (assignment due dates)
const agenda = [
  ...calendar.map((e) => ({ ...e, kind: 'event', source: 'learn' })),
  ...manualEvents.map((e) => ({ ...e, kind: 'event', source: 'manual' })),
  ...deadlines
    .filter((d) => d.dueAt)
    .map((d) => ({
      id: `deadline-${d.id}`,
      kind: 'deadline',
      source: 'learn',
      courseId: d.courseId,
      courseCode: d.courseCode,
      title: d.title,
      location: null,
      startsAt: d.dueAt,
      endsAt: null,
      isAllDay: false,
      url: d.url,
    })),
].sort((a, b) => (a.startsAt || '').localeCompare(b.startsAt || ''));

// ---------- grades (single source: studyplan exam results) ----------
// Falls back to the CampusNet table if exam results are missing.
let grades = [];
const exam = raw.studyplan?.examResults || [];
if (exam.length) {
  grades = exam.map((r) => ({
    code: r.CourseCode,
    title: r.Name,
    ects: Number(r.Ects),
    grade: r.Grade, // "12", "10", "IB", ...
    passed: !!r.Passed,
    period: r.Period,
  }));
} else {
  grades = (raw.grades || []).map((g) => ({
    code: g.number,
    title: g.title,
    ects: Number(g.ects),
    grade: g.grade.split(' ')[0],
    passed: g.grade.split(' ')[0] !== 'IB',
    period: g.date,
  }));
}

const passed = grades.filter((g) => g.passed);
const numeric = passed.filter((g) => /^-?\d+$/.test(String(g.grade)));
const ectsPassed = passed.reduce((s, g) => s + g.ects, 0);
const gradedEcts = numeric.reduce((s, g) => s + g.ects, 0);
const gpa = gradedEcts ? numeric.reduce((s, g) => s + Number(g.grade) * g.ects, 0) / gradedEcts : null;

// ---------- study plan ----------
const sp = raw.studyplan || {};
const semesters = (sp.ReportingPeriods || []).flatMap((rp) =>
  (rp.Semesters || []).map((s) => ({
    number: s.Number,
    year: rp.From ? Number(rp.From.slice(0, 4)) : null,
    periods: (s.Periods || []).map((p) => ({
      type: p.Type,
      year: p.Year,
      courses: (p.Courses || []).map((c) => ({
        code: c.CourseCode,
        name: c.Name,
        ects: c.Ects,
        scheduleGroup: c.ClassSchedule?.[0]?.[0] || null,
      })),
      activities: (p.Activities || []).map((a) => ({ name: a.Name, ects: a.Ects })),
    })),
  }))
);

const studyplan = {
  requiredEcts: sp.RequiredEcts ?? null,
  semesters,
  basket: [
    ...(sp.BasketCourses || []).map((c) => ({ kind: 'course', code: c.CourseCode, name: c.Name, ects: c.Ects })),
    ...(sp.BasketActivities || []).map((a) => ({ kind: 'activity', name: a.Name, ects: a.Ects })),
  ],
};

// ---------- ECTS by study-plan category (same names and colors as the Studyplanner) ----------
// Categories: studyplan.Types (name, color, expected ECTS). Courses/projects are linked to a category by
// CourseTypeSpecificationRelations / ProjectTypeSpecificationRelations.
//   completed = passed exam results
//   planned   = courses and activities placed in a semester + projects of an exam period (not graded yet)
// The basket ("cestino") is NOT counted as planned.
const courseType = Object.fromEntries((sp.CourseTypeSpecificationRelations || []).map((r) => [r.CourseCode, r.TypeId]));
const projectType = Object.fromEntries((sp.ProjectTypeSpecificationRelations || []).map((r) => [r.ProjectId, r.TypeId]));
const byType = Object.fromEntries(
  (sp.Types || []).map((t) => [
    t.Id,
    { typeId: t.Id, name: t.Name?.English || t.Name?.Danish || `Type ${t.Id}`, color: `#${t.Color}`, expected: t.ExpectedEcts ?? 0, completed: 0, planned: 0 },
  ])
);
let uncategorizedCompleted = 0;
let uncategorizedPlanned = 0;
for (const r of exam) {
  if (!r.Passed) continue;
  const t = courseType[r.CourseCode] ?? projectType[r.ProjectId];
  if (byType[t]) byType[t].completed += Number(r.Ects);
  else uncategorizedCompleted += Number(r.Ects);
}
const addPlanned = (typeId, ects) => {
  if (byType[typeId]) byType[typeId].planned += Number(ects || 0);
  else uncategorizedPlanned += Number(ects || 0);
};
for (const rp of sp.ReportingPeriods || []) {
  for (const sem of rp.Semesters || []) {
    for (const p of sem.Periods || []) {
      for (const c of p.Courses || []) addPlanned(courseType[c.CourseCode], c.Ects);
      for (const a of p.Activities || []) addPlanned(a.TypeId, a.Ects);
    }
    for (const pr of sem.ExamPeriod?.Projects || []) addPlanned(projectType[pr.ProjectId], pr.Ects);
  }
}
studyplan.ectsByType = Object.values(byType);
studyplan.uncategorized = { completed: uncategorizedCompleted, planned: uncategorizedPlanned };
const ectsPlanned = studyplan.ectsByType.reduce((sum, t) => sum + t.planned, 0) + uncategorizedPlanned;

// ---------- classlists (people in each course) + my group ----------
// Personal data of other people: it only exists in YOUR local app-data.real.json. Never commit or share it.
// ANON=1 replaces the names/emails of everyone except you with fictional ones (use it for anything you deploy or hand in).
const ANON = process.env.ANON === '1';
const FIRST = ['Anna','Lars','Mette','Jonas','Sofie','Emil','Clara','Mads','Freja','Oliver','Ida','Noah','Laura','Victor','Maja','Axel','Nora','Felix','Julie','Oscar'];
const LAST = ['Jensen','Nielsen','Hansen','Pedersen','Andersen','Larsen','Sorensen','Rasmussen','Madsen','Kristensen'];
const classlists = {};
for (const [courseId, cl] of Object.entries(raw.classlists || {})) {
  const users = (cl.users || []).map((u) => {
    const isMe = cl.myId != null && String(u.id) === String(cl.myId);
    const sameRole = cl.myRoleId != null && u.roleId != null && String(u.roleId) === String(cl.myRoleId);
    const role = cl.roleNames?.[String(u.roleId)] || (sameRole ? 'Student' : 'Instructor / staff');
    return { id: u.id, name: u.name, email: u.email, username: u.username, role, isMe };
  });
  if (ANON) {
    users.forEach((u, i) => {
      if (u.isMe) return;
      u.name = `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length) % LAST.length]}`;
      u.username = `s${900000 + i}`;
      u.email = `${u.name.toLowerCase().replace(' ', '.')}@example.com`;
      u.id = `anon-${courseId}-${i}`;
    });
  }
  // instructors first, then alphabetical
  users.sort((a, b) => (a.role === 'Student') - (b.role === 'Student') || a.name.localeCompare(b.name));
  classlists[courseId] = { ok: !!cl.ok, people: users, group: cl.group || null };
}

const out = {
  schemaVersion: 1,
  collectedAt: raw.collectedAt,
  timezone: 'Europe/Copenhagen',
  summary: {
    gpa: gpa === null ? null : Math.round(gpa * 100) / 100,
    ectsPassed,
    ectsPlanned,
    ectsRequired: studyplan.requiredEcts,
    coursesCount: courses.length,
    nextDeadline: deadlines.find((d) => d.dueAt && d.dueAt >= new Date().toISOString()) || null,
  },
  courses,
  courseContent,
  classlists, // courseId -> { people: [{ name, email, role, isMe }], group }
  deadlines,
  announcements,
  grades,
  studyplan,
  agenda, // events + manual events + deadlines, sorted: use this for Home and calendar views
  calendar, // raw Learn calendar events (may be empty)
  news, // dtu.dk news (RSS)
  events, // dtu.dk events (RSS; publishedAt is publication date, not event date)
  examDates: [], // no source found yet
};

fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
console.log(`Wrote ${outFile}`);
console.log({
  courses: courses.length,
  deadlines: deadlines.length,
  announcements: announcements.length,
  grades: grades.length,
  calendar: calendar.length,
  manualEvents: manualEvents.length,
  agenda: agenda.length,
  news: news.length,
  events: events.length,
  files: (raw.downloads || []).length,
  ectsPassed,
  ectsPlanned,
  gpa: out.summary.gpa,
});
