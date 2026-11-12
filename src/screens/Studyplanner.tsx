import { createContext, useContext, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import SubHeader from '../components/SubHeader';
import EctsDistribution from '../components/EctsDistribution';
import { grades, studyplan } from '../data/appData';
import { useCurrentUser } from '../data/currentUser';
import { BASKET, buildBoard, placeItems, type PlanItem, type PlanPeriod } from '../lib/studyplan';
import { DAYS, TIMES, examFor, normalizeGroup, slotGrid, type Season } from '../lib/schedule';
import './Studyplanner.css';

// ---- Course colors: DTU course type (studyplan.courseInfo) -> color of that type (ectsByType). ----
// Demo feature: the user can pick another of the 4 types for a course; kept in this browser only.
const COLOR_KEY = 'studyplanner.colors.v1';

function loadColors(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(COLOR_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveColors(colors: Record<string, string>) {
  try {
    localStorage.setItem(COLOR_KEY, JSON.stringify(colors));
  } catch {
    // Storage blocked: the choice lasts until reload.
  }
}

type ColorApi = { colorOf: (code: string | null) => string | null; pick: (item: PlanItem) => void };
const ColorContext = createContext<ColorApi>({ colorOf: () => null, pick: () => {} });

const courseInfo = (code: string | null) => (code ? studyplan.courseInfo?.[code] : undefined);
/** Type ids are numbers in the Studyplanner data and strings in ectsByType: compare them as strings. */
const dtuTypeOf = (code: string | null) => {
  const id = courseInfo(code)?.typeId;
  return id == null ? undefined : String(id);
};

/**
 * Studyplanner (Figma 27:19). Past periods use the "completed" view (Result / ECTS),
 * current and future periods the "planning" view (Placement / Status / ECTS) and accept dropped courses.
 * Moves (long press + drag) are kept in this browser only.
 */
const STORAGE_KEY = 'studyplanner.moves.v1';

function loadMoves(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveMoves(moves: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moves));
  } catch {
    // Storage blocked (private mode): moves just last until reload.
  }
}

const sum = (items: PlanItem[]) => items.reduce((total, i) => total + i.ects, 0);

export default function Studyplanner() {
  const { user } = useCurrentUser();
  const board = useMemo(() => buildBoard(studyplan, grades, user.programme), [user.programme]);
  const [moves, setMoves] = useState(loadMoves);
  const [dragging, setDragging] = useState<PlanItem | null>(null);
  const [showDistribution, setShowDistribution] = useState(false);
  const [colors, setColors] = useState(loadColors);
  const [picking, setPicking] = useState<PlanItem | null>(null);

  const typeOf = (code: string | null) => (code ? colors[code] ?? dtuTypeOf(code) : undefined);
  const colorApi: ColorApi = {
    colorOf: (code) => studyplan.ectsByType.find((t) => String(t.typeId) === typeOf(code))?.color ?? null,
    pick: (item) => setPicking(item),
  };

  function chooseType(code: string, typeId: string | null) {
    const next = { ...colors };
    if (typeId === null) delete next[code];
    else next[code] = typeId;
    setColors(next);
    saveColors(next);
    setPicking(null);
  }

  const place = placeItems(board, moves);
  const itemsIn = (key: string) => Object.values(board.items).filter((i) => place[i.id] === key);
  const plannedEcts = sum(Object.values(board.items).filter((i) => place[i.id] !== BASKET));

  // Mouse: drag after 5 px. Touch: hold 250 ms, so a normal swipe still scrolls the page.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  );

  function onDragStart(e: DragStartEvent) {
    setDragging(board.items[String(e.active.id)] ?? null);
  }

  function onDragEnd(e: DragEndEvent) {
    setDragging(null);
    if (!e.over) return;
    const id = String(e.active.id);
    const target = String(e.over.id);
    if (place[id] === target) return;
    const next = { ...moves, [id]: target };
    setMoves(next);
    saveMoves(next);
  }

  return (
    <div className="sub-screen planner">
      <SubHeader />
      <h1 className="planner__programme">{user.programme.name}</h1>
      <div className="planner__summary">
        <p className="planner__planned">{plannedEcts} ECTS planned</p>
        <button type="button" className="planner__dist-button" onClick={() => setShowDistribution(true)}>
          Show ECTS distribution
        </button>
      </div>

      <ColorContext.Provider value={colorApi}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setDragging(null)}
      >
        {board.years.map((year) => {
          const yearItems = year.semesters.flatMap((s) => s.periods.flatMap((p) => itemsIn(p.key)));
          return (
            <section key={year.number} className="planner__year">
              <h2 className="planner__year-label">{year.label}</h2>
              {year.semesters.map((semester) => (
                <div key={semester.number} className="planner__term">
                  <h3 className="planner__term-bar">{semester.number}. Term</h3>
                  {semester.periods.map((period) =>
                    period.status === 'past' ? (
                      <PastPeriod key={period.key} period={period} items={itemsIn(period.key)} />
                    ) : (
                      <OpenPeriod key={period.key} period={period} items={itemsIn(period.key)} />
                    ),
                  )}
                </div>
              ))}
              <p className="planner__year-total">ECTS in this year of study: {sum(yearItems)}</p>
            </section>
          );
        })}

        <Basket items={itemsIn(BASKET)} />

        <DragOverlay dropAnimation={null}>{dragging && <ItemRow item={dragging} lifted />}</DragOverlay>
      </DndContext>
      </ColorContext.Provider>

      {picking?.code && (
        <ColorPicker
          item={picking}
          current={typeOf(picking.code)}
          dtuType={dtuTypeOf(picking.code)}
          onPick={(typeId) => chooseType(picking.code!, typeId)}
          onClose={() => setPicking(null)}
        />
      )}

      {showDistribution && <EctsDistribution studyplan={studyplan} onClose={() => setShowDistribution(false)} />}
    </div>
  );
}

/** View 1: a period that is over. Read only, with the grade. */
function PastPeriod({ period, items }: { period: PlanPeriod; items: PlanItem[] }) {
  return (
    <div className="planner__period">
      <div className="planner__period-head">
        <span>{period.examLabel}</span>
        <span className="planner__cols planner__cols--past">
          <span>Result</span>
          <span>ECTS</span>
        </span>
      </div>
      <ul className="planner__rows">
        {items.length === 0 ? (
          <EmptyRow text="Nothing planned for this period" />
        ) : (
          items.map((item) => (
            <li key={item.id} className="planner__row">
              <ItemName item={item} />
              <span className="planner__cols planner__cols--past">
                <span>{item.grade ?? ''}</span>
                <span className="planner__ects">{item.ects}</span>
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

/** View 2: current or future period. Drop target; its courses can be dragged. */
function OpenPeriod({ period, items }: { period: PlanPeriod; items: PlanItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: period.key });
  const [showSchedule, setShowSchedule] = useState(false);
  return (
    <div ref={setNodeRef} className={'planner__period planner__drop' + (isOver ? ' planner__drop--over' : '')}>
      <div className="planner__period-head">
        <span>{period.label}</span>
        <span className="planner__cols">
          <span>Placement</span>
          <span>Status</span>
          <span>ECTS</span>
          <button
            type="button"
            className={'planner__schedule-btn' + (showSchedule ? ' is-on' : '')}
            aria-expanded={showSchedule}
            aria-label={showSchedule ? 'Hide schedule' : 'Show schedule'}
            onClick={() => setShowSchedule(!showSchedule)}
          >
            <img src="/icons/grid.svg" width={12} height={12} alt="" />
          </button>
        </span>
      </div>
      <ul className="planner__rows">
        {items.length === 0 ? (
          <EmptyRow text="Nothing planned for this period" />
        ) : (
          items.map((item) => <DraggableRow key={item.id} item={item} />)
        )}
      </ul>
      {showSchedule && <ScheduleView period={period} items={items} />}
      <p className="planner__register">Register/withdraw not open</p>
    </div>
  );
}

function Basket({ items }: { items: PlanItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: BASKET });
  return (
    <section ref={setNodeRef} className={'planner__basket planner__drop' + (isOver ? ' planner__drop--over' : '')}>
      <h2 className="planner__basket-title">Basket</h2>
      <ul className="planner__rows">
        {items.length === 0 ? (
          <EmptyRow text="Nothing in the basket yet" />
        ) : (
          items.map((item) => <DraggableRow key={item.id} item={item} />)
        )}
      </ul>
    </section>
  );
}

function DraggableRow({ item }: { item: PlanItem }) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id: item.id, disabled: item.locked });
  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={'planner__row-wrap' + (isDragging ? ' planner__row-wrap--ghost' : '')}
      aria-label={item.locked ? undefined : `${item.code ?? ''} ${item.name}, hold and drag to move`}
    >
      <ItemRow item={item} />
    </li>
  );
}

function ItemRow({ item, lifted = false }: { item: PlanItem; lifted?: boolean }) {
  return (
    <div className={'planner__row' + (item.locked ? '' : ' planner__row--movable') + (lifted ? ' planner__row--lifted' : '')}>
      <ItemName item={item} />
      <span className="planner__cols">
        <span className="planner__placement">{item.placement ?? ''}</span>
        <span className="planner__status">
          {item.grade && <img src="/icons/check.svg" width={14} height={14} alt="Passed" />}
        </span>
        <span className="planner__ects">{item.ects}</span>
      </span>
    </div>
  );
}

function ItemName({ item }: { item: PlanItem }) {
  const { colorOf, pick } = useContext(ColorContext);
  const color = colorOf(item.code);
  return (
    <span className="planner__name">
      {item.code ? (
        <button
          type="button"
          className="planner__square-btn"
          aria-label={`Course type color of ${item.code}`}
          onPointerDown={(e) => e.stopPropagation()} // a tap on the square never starts a drag
          onClick={() => pick(item)}
        >
          <span className="planner__square" style={color ? { background: color, borderColor: color } : undefined} />
        </button>
      ) : (
        <span className="planner__square" aria-hidden="true" />
      )}
      <span>{item.code ? `${item.code} ${item.name}` : item.name}</span>
    </span>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <li className="planner__row planner__row--empty">
      <span>{text}</span>
    </li>
  );
}

/** Schedule groups of a course: from the Studyplanner data, else the placement column. */
const groupsOf = (item: PlanItem) => courseInfo(item.code)?.schedule ?? (item.placement ? [item.placement] : []);

/**
 * "Show schedule" (Figma 273:425, like the official Studyplanner): week grid Monday-Friday x 8-12 / 13-17 / 18-22 with
 * the slot codes and the courses in their slot, DTU's schedule notes, and the exam day from the DTU exam timetable.
 */
function ScheduleView({ period, items }: { period: PlanPeriod; items: PlanItem[] }) {
  const courses = items.filter((i) => i.code);
  const threeWeeks = period.key.endsWith('-3w');
  const season: Season = /spring/i.test(period.label) ? 'F' : 'E';
  const year = period.start.getUTCFullYear();
  const grid = slotGrid(season);
  const inSlot = (slot: string) =>
    courses.filter((c) => groupsOf(c).some((g) => normalizeGroup(g) === slot)).map((c) => c.code as string);

  return (
    <div className="planner__schedule">
      {threeWeeks ? (
        <p className="planner__schedule-note">3-week period: the courses run full time on weekdays.</p>
      ) : (
        <table className="planner__grid">
          <thead>
            <tr>
              <th aria-label="Time" />
              {DAYS.map((d) => (
                <th key={d} scope="col">
                  {d.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIMES.map((time, r) => (
              <tr key={time}>
                <th scope="row">{time}</th>
                {grid[r].map((slot, d) => (
                  <td key={d}>
                    {slot && <span className="planner__slot">{slot}</span>}
                    {slot &&
                      inSlot(slot).map((code) => (
                        <span key={code} className="planner__slot-course">
                          {code}
                        </span>
                      ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {courses.length === 0 ? (
        <p className="planner__schedule-note">No courses in this period.</p>
      ) : (
        <dl className="planner__notes">
          {courses.map((c) => {
            const exam = threeWeeks ? null : examFor(c.code, groupsOf(c), season, year);
            const note = courseInfo(c.code)?.scheduleText;
            return (
              <div key={c.id} className="planner__note">
                <dt>{c.code}</dt>
                <dd>
                  {note && <span>{note}</span>}
                  <span>Schedule: {groupsOf(c).join(', ') || '–'}</span>
                  <span className="planner__exam">
                    {exam
                      ? `Exam: ${exam.label} (${exam.via})`
                      : threeWeeks
                        ? 'Exam: at the end of the 3-week period'
                        : 'Exam: not in the DTU exam timetable'}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
      )}
      {!threeWeeks && (
        <p className="planner__schedule-source">
          Exam days from the DTU exam timetable (see Exam dates). Project courses may have no written exam.
        </p>
      )}
    </div>
  );
}

/** Demo: choose the course type (color) of a course. Saved in this browser only, never sent to DTU. */
function ColorPicker({
  item,
  current,
  dtuType,
  onPick,
  onClose,
}: {
  item: PlanItem;
  current: string | undefined;
  dtuType: string | undefined;
  onPick: (typeId: string | null) => void;
  onClose: () => void;
}) {
  return (
    <div className="planner__picker-backdrop" onClick={onClose}>
      <div
        className="planner__picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="picker-title" className="planner__picker-title">
          {item.code} {item.name}
        </h2>
        <p className="planner__picker-hint">Course type (demo, saved in this browser only)</p>
        <ul className="planner__picker-list">
          {studyplan.ectsByType.map((t) => (
            <li key={t.typeId}>
              <button
                type="button"
                className={'planner__picker-option' + (current === String(t.typeId) ? ' is-current' : '')}
                onClick={() => onPick(String(t.typeId))}
              >
                <span className="planner__square" style={{ background: t.color, borderColor: t.color }} />
                <span>{t.name}</span>
                {dtuType === String(t.typeId) && <span className="planner__picker-dtu">DTU</span>}
              </button>
            </li>
          ))}
        </ul>
        <div className="planner__picker-actions">
          <button type="button" onClick={() => onPick(null)}>
            Reset
          </button>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
