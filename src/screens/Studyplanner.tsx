import { useMemo, useState } from 'react';
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
import './Studyplanner.css';

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
  return (
    <div ref={setNodeRef} className={'planner__period planner__drop' + (isOver ? ' planner__drop--over' : '')}>
      <div className="planner__period-head">
        <span>{period.label}</span>
        <span className="planner__cols">
          <span>Placement</span>
          <span>Status</span>
          <span>ECTS</span>
          <img src="/icons/grid.svg" width={12} height={12} alt="" />
        </span>
      </div>
      <ul className="planner__rows">
        {items.length === 0 ? (
          <EmptyRow text="Nothing planned for this period" />
        ) : (
          items.map((item) => <DraggableRow key={item.id} item={item} />)
        )}
      </ul>
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
  return (
    <span className="planner__name">
      <span className="planner__square" aria-hidden="true" />
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
