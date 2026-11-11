import { useEffect, useRef, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceArea, Tooltip, XAxis, YAxis } from 'recharts';
import type { Grade } from '../data/types';
import { gradeTimeline, periodLabel, type GradePoint } from '../lib/gpa';
import './GradesChart.css';

/**
 * Grade trend (blue) vs running GPA (orange), one point per course, in period order.
 * The plot scrolls horizontally (about 90 px per course) and starts at the right; the Y axis stays fixed.
 */
const PX_PER_COURSE = 90;
const HEIGHT = 214;
const MARGIN = { top: 22, right: 20, bottom: 4, left: 20 };
const Y_TICKS = [-3, 0, 2, 4, 7, 10, 12];
const Y_DOMAIN: [number, number] = [-3, 12];
const GRADE_COLOR = 'var(--chart-grade)';
const GPA_COLOR = 'var(--chart-gpa)';

type Row = GradePoint & { failedY: number | null; label: string };

function shortTitle(title: string) {
  return title.length > 12 ? title.slice(0, 11) + '…' : title;
}

/** Consecutive runs of the same period → shaded bands. */
function periodBands(rows: Row[]) {
  const bands: { period: string; from: number; to: number }[] = [];
  for (const r of rows) {
    const last = bands[bands.length - 1];
    if (last && last.period === r.grade.period) last.to = r.index;
    else bands.push({ period: r.grade.period, from: r.index, to: r.index });
  }
  return bands;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="grades-chart__tooltip">
      <strong>
        {p.grade.code} {p.grade.title}
      </strong>
      <span>
        Grade: {p.grade.grade} · {p.grade.ects} ECTS
      </span>
      <span>{periodLabel(p.grade.period)}</span>
      <span>GPA here: {p.gpa === null ? '–' : p.gpa.toFixed(2)}</span>
    </div>
  );
}

export default function GradesChart({ grades }: { grades: Grade[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [atStart, setAtStart] = useState(false);

  const rows: Row[] = gradeTimeline(grades).map((p) => ({
    ...p,
    failedY: p.failed ? Y_DOMAIN[0] : null,
    label: shortTitle(p.grade.title),
  }));

  // Start scrolled to the right: latest grades visible.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [rows.length]);

  if (rows.length === 0) {
    return <div className="grades-chart grades-chart--empty">No grades yet</div>;
  }

  const width = Math.max(rows.length * PX_PER_COURSE + MARGIN.left + MARGIN.right, 280);
  const xDomain: [number, number] = [-0.5, rows.length - 0.5];

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    setScrolled(true);
    setAtStart(el.scrollLeft <= 2);
  }

  return (
    <div className="grades-chart">
      <div className="grades-chart__legend" aria-hidden="true">
        <span>
          <i style={{ background: GRADE_COLOR }} /> Grade
        </span>
        <span>
          <i style={{ background: GPA_COLOR }} /> GPA
        </span>
      </div>

      <div className="grades-chart__body">
        {/* Fixed Y axis: a chart that only draws the axis */}
        <LineChart width={30} height={HEIGHT} data={rows} margin={{ ...MARGIN, left: 0, right: 0 }}>
          <YAxis
            domain={Y_DOMAIN}
            ticks={Y_TICKS}
            width={30}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--color-placeholder)' }}
            interval={0}
          />
          <XAxis dataKey="index" hide />
        </LineChart>

        <div
          ref={scroller}
          className={'grades-chart__scroll' + (atStart || width <= 320 ? '' : ' grades-chart__scroll--more')}
          onScroll={onScroll}
          aria-label="Grades over time, scroll horizontally"
        >
          <LineChart width={width} height={HEIGHT} data={rows} margin={MARGIN}>
            {periodBands(rows).map((b, i) => (
              <ReferenceArea
                key={`${b.period}-${b.from}`}
                x1={b.from - 0.5}
                x2={b.to + 0.5}
                y1={Y_DOMAIN[0]}
                y2={Y_DOMAIN[1]}
                fill={i % 2 === 0 ? 'var(--chart-band)' : 'transparent'}
                stroke="none"
                ifOverflow="visible"
                label={{ value: periodLabel(b.period), position: 'insideTop', dy: -18, fontSize: 9, fill: 'var(--color-placeholder)' }}
              />
            ))}
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis
              type="number"
              dataKey="index"
              domain={xDomain}
              ticks={rows.map((r) => r.index)}
              tickFormatter={(i: number) => rows[i]?.label ?? ''}
              tick={{ fontSize: 9, fill: 'var(--color-placeholder)' }}
              tickLine={false}
              axisLine={false}
              interval={0}
              height={18}
            />
            <YAxis domain={Y_DOMAIN} ticks={Y_TICKS} hide />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--chart-grid)' }} />
            <Line
              type="linear"
              dataKey="value"
              stroke={GRADE_COLOR}
              strokeWidth={2}
              dot={{ r: 4, fill: GRADE_COLOR, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="gpa"
              stroke={GPA_COLOR}
              strokeWidth={2}
              dot={{ r: 4, fill: GPA_COLOR, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              connectNulls
              isAnimationActive={false}
            />
            {/* Failed / IB: hollow dot at the bottom, no line */}
            <Line
              dataKey="failedY"
              stroke="none"
              dot={{ r: 4, fill: '#fff', stroke: GRADE_COLOR, strokeWidth: 2 }}
              activeDot={false}
              isAnimationActive={false}
              legendType="none"
            />
          </LineChart>
        </div>
      </div>

      {!scrolled && width > 320 && <p className="grades-chart__hint">← swipe to see earlier grades</p>}
    </div>
  );
}
