import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import type { EctsByType } from '../data/types';

/**
 * ECTS pie (112 x 112). One slice per course type from the Studyplanner, in the type's own color,
 * size = completed ECTS. No data yet → plain grey circle.
 */
const SIZE = 112;

export default function EctsPie({ data }: { data: EctsByType[] }) {
  const slices = data.filter((d) => d.completed > 0);

  if (slices.length === 0) {
    return <div className="ects-pie ects-pie--empty" role="img" aria-label="No ECTS data yet" />;
  }

  return (
    <div className="ects-pie" role="img" aria-label={slices.map((s) => `${s.name}: ${s.completed} ECTS`).join(', ')}>
      <PieChart width={SIZE} height={SIZE}>
        <Pie
          data={slices}
          dataKey="completed"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={SIZE / 2 - 2}
          stroke="#fff"
          strokeWidth={2}
          startAngle={90}
          endAngle={-270}
          isAnimationActive={false}
          labelLine={false}
          label={({ cx, cy, midAngle, outerRadius, value }) => {
            const r = (outerRadius as number) * 0.6;
            const a = (-(midAngle as number) * Math.PI) / 180;
            return (
              <text
                x={(cx as number) + r * Math.cos(a)}
                y={(cy as number) + r * Math.sin(a)}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#fff"
                fontSize={7}
                fontWeight={700}
              >
                {value} ECTS
              </text>
            );
          }}
        >
          {slices.map((s) => (
            <Cell key={s.typeId} fill={s.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} ECTS`, '']} separator="" />
      </PieChart>
    </div>
  );
}
