/**
 * DTU room codes from the Learn calendar: "LYN.358.042 | LYN.358.039" (campus.building.room, several rooms with "|").
 * Shown as "Building 358, rooms 039, 042"; the map search is "358 042" (MazeMap finds that room first).
 */
export type RoomPlace = { label: string; mapQuery: string };

const CODE = /^([A-Z]{2,4})\.(\w+)\.(\w+)$/;

export function describeLocation(raw: string | null | undefined): RoomPlace | null {
  const text = raw?.trim();
  if (!text) return null;
  const rooms = text.split('|').map((s) => CODE.exec(s.trim()));
  // Free text (personal events, other sources): show it as it is, search MazeMap for it
  if (rooms.some((m) => !m)) return { label: text, mapQuery: text };

  const byBuilding = new Map<string, string[]>();
  for (const m of rooms as RegExpExecArray[]) byBuilding.set(m[2], [...(byBuilding.get(m[2]) ?? []), m[3]]);
  const label = [...byBuilding]
    .map(([b, list]) => {
      const sorted = [...new Set(list)].sort();
      return `Building ${b}, ${sorted.length > 1 ? 'rooms' : 'room'} ${sorted.join(', ')}`;
    })
    .join(' · ');
  const first = rooms[0]!;
  return { label, mapQuery: `${first[2]} ${first[3]}` };
}
