/**
 * eat@DTU venues. The cards are kept IDENTICAL to the eat@DTU app: each card shows a crop of a real screenshot
 * (public/images/campus), with the crop values copied from the Figma frames (30:172 and 157:1132).
 * `crop` = size and offset of the screenshot inside the card, in % of the card (Figma "h, w, left, top").
 */
export type Crop = { w: number; h: number; left: number; top: number };

export type Venue = {
  id: string;
  name: string;
  image: string;
  crop: Crop;
  /** In-app page that opens on tap: building 101 list for Food Court, the venue page for all others. */
  to?: string;
};

const MAIN = '/images/campus/eat-venues.jpg';
const B101 = '/images/campus/eat-101.jpg';

const foodCourt: Venue = {
  id: 'b101-food-court',
  name: 'B101 - Food Court',
  image: MAIN,
  crop: { w: 216.9, h: 432.55, left: -5.63, top: -56.29 },
  to: '/campus/food/101',
};

/** "Select Venue" on Food and Drinks, in the order of the Figma frame (Food Court appears twice there). */
export const venues: Venue[] = [
  foodCourt,
  { id: 'b101-hav-a-java', name: 'B101 - Hav a Java Central', image: MAIN, to: '/campus/food/venue/b101-hav-a-java', crop: { w: 217.2, h: 432.58, left: -110.14, top: -56.29 } },
  { id: 'b101-social', name: 'B101 Social', image: MAIN, to: '/campus/food/venue/b101-social', crop: { w: 216.9, h: 480.03, left: -5.63, top: -185.79 } },
  { ...foodCourt, id: 'b101-food-court-2' },
  { id: 'skylab', name: 'SkyLab', image: MAIN, to: '/campus/food/venue/skylab', crop: { w: 208.77, h: 431.76, left: -3.55, top: -266.55 } },
  { id: 'ballerup-canteen', name: 'Ballerup - The Canteen', image: MAIN, to: '/campus/food/venue/ballerup-canteen', crop: { w: 216.9, h: 424.64, left: -110.83, top: -262.7 } },
];

/** Venues inside building 101 (Figma 157:1132). */
export const venues101: Venue[] = [
  { id: 'wicked-rabbit', name: 'Wicked Rabbit', image: B101, to: '/campus/food/venue/wicked-rabbit', crop: { w: 216.9, h: 470.55, left: -5.63, top: -61.23 } },
  { id: 'folkekokken', name: 'Folkekøkken', image: B101, to: '/campus/food/venue/folkekokken', crop: { w: 214.12, h: 470.55, left: -108.77, top: -61.23 } },
  { id: 'street-food', name: 'Street Food', image: B101, to: '/campus/food/venue/street-food', crop: { w: 210.08, h: 464.27, left: -3.57, top: -167.08 } },
  { id: 'bazaar', name: 'Bazaar', image: B101, to: '/campus/food/venue/bazaar', crop: { w: 214.12, h: 461.2, left: -108.77, top: -165.31 } },
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
