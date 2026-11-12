import type { Studyplan } from '../data/types';
import { MiniPie, planSlices } from './EctsDistribution';

/**
 * ECTS pie of the Grades / My studies preview (112 x 112): the same "Your plan" chart as the ECTS distribution sheet
 * (completed + planned ECTS per course type, type colors), so the two can never disagree.
 */
export default function EctsPie({ studyplan }: { studyplan: Studyplan }) {
  const slices = planSlices(studyplan);
  return (
    <div className="ects-pie" role="img" aria-label={slices.filter((s) => s.value > 0).map((s) => `${s.name}: ${s.value} ECTS`).join(', ')}>
      <MiniPie slices={slices} size={112} />
    </div>
  );
}
