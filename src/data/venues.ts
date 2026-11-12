/**
 * eat@DTU venues, in the order of the eat@DTU app (Figma 30:172 and 157:1132). The cards are real components
 * (VenueCard): name, building and opening status come from `venueInfo.ts`.
 */
export type Venue = {
  id: string;
  name: string;
  /** Key in venueInfo when it differs from `id` (Food Court appears twice in the app grid). */
  infoId?: string;
  /** In-app page that opens on tap: building 101 list for Food Court, the venue page for all others. */
  to?: string;
};

const foodCourt: Venue = { id: 'b101-food-court', name: 'B101 - Food Court', to: '/campus/food/101' };

/** "Select Venue" on Food and Drinks, in the order of the Figma frame (Food Court appears twice there). */
export const venues: Venue[] = [
  foodCourt,
  { id: 'b101-hav-a-java', name: 'B101 - Hav a Java Central', to: '/campus/food/venue/b101-hav-a-java' },
  { id: 'b101-social', name: 'B101 Social', to: '/campus/food/venue/b101-social' },
  { ...foodCourt, id: 'b101-food-court-2', infoId: 'b101-food-court' },
  { id: 'skylab', name: 'SkyLab', to: '/campus/food/venue/skylab' },
  { id: 'ballerup-canteen', name: 'Ballerup - The Canteen', to: '/campus/food/venue/ballerup-canteen' },
];

/** Venues inside building 101 (Figma 157:1132). */
export const venues101: Venue[] = [
  { id: 'wicked-rabbit', name: 'Wicked Rabbit', to: '/campus/food/venue/wicked-rabbit' },
  { id: 'folkekokken', name: 'Folkekøkken', to: '/campus/food/venue/folkekokken' },
  { id: 'street-food', name: 'Street Food', to: '/campus/food/venue/street-food' },
  { id: 'bazaar', name: 'Bazaar', to: '/campus/food/venue/bazaar' },
];

// ---- Last visited venues (this browser only), shown on the Campus page ----

const KEY = 'dtu-app.recentVenues';
const all = [...venues, ...venues101];

export function markVenueVisited(id: string) {
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    localStorage.setItem(KEY, JSON.stringify([id, ...ids.filter((x) => x !== id)].slice(0, 10)));
  } catch {
    // storage blocked: just don't remember
  }
}

/** The `count` last visited venues, topped up with the first venues of the list. */
export function recentVenues(count = 2): Venue[] {
  let ids: string[] = [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (Array.isArray(raw)) ids = raw.filter((x): x is string => typeof x === 'string');
  } catch {
    // ignore
  }
  const visited = ids.map((id) => all.find((v) => v.id === id)).filter((v): v is Venue => !!v);
  const fill = venues.filter((v) => !visited.some((x) => x.name === v.name));
  const unique = [...visited, ...fill].filter((v, i, list) => list.findIndex((x) => x.name === v.name) === i);
  return unique.slice(0, count);
}
