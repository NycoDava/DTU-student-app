import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import type { Studyplan } from '../data/types';
import './EctsDistribution.css';

/**
 * "ECTS distribution" sheet (Figma 96:138, a Studyplanner screenshot we rebuild from data):
 * your plan vs the programme's expected split, then one bar per course type (completed / planned / missing).
 * Colors are the Studyplanner type colors from the data.
 */
const OTHER_COLOR = '#9e9e9e';
const PIE = 132;

type Slice = { key: string; name: string; color: string; value: number };

function MiniPie({ title, slices }: { title: string; slices: Slice[] }) {
  const data = slices.filter((s) => s.value > 0);
  const total = data.reduce((n, s) => n + s.value, 0);
  return (
    <figure className="ects-dist__pie">
      {data.length === 0 ? (
        <div className="ects-dist__pie-empty" />
      ) : (
        <PieChart width={PIE} height={PIE}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={PIE / 2 - 2}
            innerRadius={PIE / 2 - 26}
            stroke="#fff"
            strokeWidth={2}
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          >
            {data.map((s) => (
              <Cell key={s.key} fill={s.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => [`${v} ECTS`, '']} separator="" />
          <text x={PIE / 2} y={PIE / 2} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={700}>
            {total} ECTS
          </text>
        </PieChart>
      )}
      <figcaption>{title}</figcaption>
    </figure>
  );
}

export default function EctsDistribution({ studyplan, onClose }: { studyplan: Studyplan; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const types = studyplan.ectsByType;
  const mine: Slice[] = types.map((t) => ({ key: t.typeId, name: t.name, color: t.color, value: t.completed + t.planned }));
  if (studyplan.uncategorized > 0) {
    mine.push({ key: 'other', name: 'Other', color: OTHER_COLOR, value: studyplan.uncategorized });
  }
  const programme: Slice[] = types.map((t) => ({ key: t.typeId, name: t.name, color: t.color, value: t.expected }));

  const sheet = (
    <div className="ects-dist__backdrop" onClick={onClose}>
      <div
        className="ects-dist"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ects-dist-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ects-dist__header">
          <h2 id="ects-dist-title">ECTS distribution</h2>
          <button ref={closeButton} type="button" className="ects-dist__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        {types.length === 0 ? (
          <p className="ects-dist__empty">No Studyplanner data yet.</p>
        ) : (
          <>
            <div className="ects-dist__pies">
              <MiniPie title="Your plan" slices={mine} />
              <MiniPie title="Programme" slices={programme} />
            </div>

            <ul className="ects-dist__legend">
              {mine.map((s) => (
                <li key={s.key}>
                  <i style={{ background: s.color }} />
                  {s.name}
                </li>
              ))}
            </ul>

            <h3 className="ects-dist__subtitle">Planned vs missing</h3>
            <ul className="ects-dist__bars">
              {types.map((t) => {
                const done = t.completed + t.planned;
                const over = done > t.expected;
                const base = Math.max(t.expected, done, 1);
                const missing = Math.max(t.expected - done, 0);
                return (
                  <li key={t.typeId} className="ects-dist__row">
                    <div className="ects-dist__row-head">
                      <span>{t.name}</span>
                      <span className={over ? 'ects-dist__over' : undefined}>
                        {done} / {t.expected} ECTS
                      </span>
                    </div>
                    <div
                      className="ects-dist__bar"
                      role="img"
                      aria-label={`${t.completed} completed, ${t.planned} planned, ${missing} missing of ${t.expected} ECTS`}
                    >
                      {t.completed > 0 && (
                        <span style={{ width: `${(t.completed / base) * 100}%`, background: t.color }} />
                      )}
                      {t.planned > 0 && (
                        <span style={{ width: `${(t.planned / base) * 100}%`, background: t.color, opacity: 0.4 }} />
                      )}
                    </div>
                    <div className="ects-dist__row-foot">
                      {t.completed} completed · {t.planned} planned · {missing} missing
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="ects-dist__key" aria-hidden="true">
              <span>
                <i className="ects-dist__key-done" /> Completed
              </span>
              <span>
                <i className="ects-dist__key-planned" /> Planned
              </span>
              <span>
                <i className="ects-dist__key-missing" /> Missing
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Render inside the phone frame so the sheet never covers the desktop background.
  const host = document.querySelector('.app-shell') ?? document.body;
  return createPortal(sheet, host);
}
