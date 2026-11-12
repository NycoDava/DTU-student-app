/**
 * eat@DTU venue pages (Figma 275:425, screenshots of the eat@DTU Android app).
 *
 * OPENING HOURS: real, copied from DTU Inside "Contact Information and Opening Hours" (LINKS.canteenHours) on
 * 2026-11-12; days "Monday to Friday" as in the eat@DTU app. Re-copy when DTU updates the page.
 * MENUS: SAMPLE DATA. Menus are only published inside the eat@DTU app (no public source), and CLAUDE.md allows static
 * mock data for the Campus food screens. Replace with real menus if a public source appears.
 */
export type Dish = { name: string; price: number; veg?: boolean };
export type WeekMenu = { kind: 'week'; days: Dish[][] }; // Monday..Friday
export type FixedMenu = { kind: 'fixed'; sections: { title: string; items: Dish[] }[] };

export type VenueInfo = {
  title: string;
  /** "B101" etc., as in the app ("B101 Monday to Friday 11.00 - 14.00"). */
  building: string;
  hours: { days: string; time: string }[];
  /** For venues without daily hours (Social Dining, food trucks): shown instead of the hours. */
  when?: string;
  description?: string;
  /** No menu = no menu section (food trucks: not in the eat@DTU app). */
  menu?: WeekMenu | FixedMenu;
  /** false = no "Order in eat@DTU" button (food trucks are not in the app). */
  orderable?: boolean;
};

const WEEKDAYS = 'Monday to Friday';

const coffeeMenu = (extra: Dish[] = []): FixedMenu => ({
  kind: 'fixed',
  sections: [
    {
      title: 'Coffee & drinks',
      items: [
        { name: 'Coffee', price: 22 },
        { name: 'Cappuccino', price: 32 },
        { name: 'Caffè latte', price: 34 },
        { name: 'Chai latte', price: 35 },
        { name: 'Tea', price: 20 },
      ],
    },
    {
      title: 'Food',
      items: [
        { name: 'Croissant', price: 20, veg: true },
        { name: 'Sandwich of the day', price: 45 },
        { name: 'Salad bowl', price: 55, veg: true },
        { name: 'Cake of the day', price: 30, veg: true },
        ...extra,
      ],
    },
  ],
});

const canteenWeek: WeekMenu = {
  kind: 'week',
  days: [
    [
      { name: 'Roasted chicken with root vegetables and herb sauce', price: 55 },
      { name: 'Lentil and spinach stew with rice', price: 45, veg: true },
      { name: 'Salad bar (per 100 g)', price: 14, veg: true },
    ],
    [
      { name: 'Pork tenderloin with potatoes and mushroom sauce', price: 55 },
      { name: 'Vegetable lasagne', price: 45, veg: true },
      { name: 'Soup of the day with bread', price: 35, veg: true },
    ],
    [
      { name: 'Fish of the day with dill potatoes', price: 59 },
      { name: 'Falafel with hummus and bulgur', price: 45, veg: true },
      { name: 'Salad bar (per 100 g)', price: 14, veg: true },
    ],
    [
      { name: 'Beef meatballs with tomato sauce and pasta', price: 55 },
      { name: 'Thai red curry with tofu and jasmine rice', price: 45, veg: true },
      { name: 'Soup of the day with bread', price: 35, veg: true },
    ],
    [
      { name: 'Chicken tacos with salsa and slaw', price: 55 },
      { name: 'Mushroom risotto', price: 45, veg: true },
      { name: 'Salad bar (per 100 g)', price: 14, veg: true },
    ],
  ],
};

export const venueInfo: Record<string, VenueInfo> = {
  'b101-food-court': { title: 'Food Court', building: 'B101', hours: [{ days: WEEKDAYS, time: '11.00 - 14.00' }], menu: canteenWeek },
  'b101-hav-a-java': { title: 'Hav a Java Central', building: 'B101', hours: [{ days: WEEKDAYS, time: '07.30 - 17.00' }], menu: coffeeMenu() },
  // Social Dining is a monthly dinner event, not a daily venue (eat@DTU app, Figma 275:425/275:426).
  'b101-social': {
    title: 'Social Dining',
    building: 'B101',
    hours: [],
    when: 'Every month in the Food Court',
    description: 'Every month we invite you, your friends and family to Social Dining dinner in B101.',
    menu: { kind: 'fixed', sections: [{ title: 'Dinner', items: [{ name: 'All you can eat', price: 60 }] }] },
  },
  skylab: { title: 'SkyLab Café', building: 'B374', hours: [{ days: WEEKDAYS, time: '08.00 - 15.00 (lunch 11.00 - 14.00)' }], menu: coffeeMenu([{ name: 'Lunch dish of the day', price: 55 }]) },
  'wicked-rabbit': {
    title: 'Wicked Rabbit',
    building: 'B342',
    hours: [
      { days: 'Monday to Thursday', time: '11.00 - 14.00' },
      { days: 'Friday', time: '11.00 - 13.30' },
    ],
    menu: canteenWeek,
  },
  folkekokken: { title: 'Folkekøkken', building: 'Ballerup', hours: [{ days: WEEKDAYS, time: '11.00 - 14.00' }], menu: canteenWeek },
  // The two "Food & Co." cards of the app + the Faculty Club (author, 12 Nov 2026). Hours from DTU Inside.
  'b202-canteen': { title: 'Canteen B202', building: 'B202', hours: [{ days: WEEKDAYS, time: '11.00 - 14.00' }], menu: canteenWeek },
  'riso-canteen': { title: 'Risø Canteen', building: 'Risø', hours: [{ days: WEEKDAYS, time: '07.30 - 14.00 (lunch 11.00 - 14.00)' }], menu: canteenWeek },
  'faculty-club': { title: 'Faculty Club', building: 'B101, 1st floor', hours: [{ days: WEEKDAYS, time: '11.00 - 14.00' }], menu: canteenWeek },
  // Food trucks (listed by the DTU campus web app with their location; no official hours, not in the eat@DTU app).
  spiceboat: { title: 'Spiceboat', building: 'Next to B324', hours: [], when: 'Food truck', orderable: false },
  'tyrkiske-kokken': { title: 'Det Tyrkiske Køkken', building: 'At B116', hours: [], when: 'Food truck', orderable: false },
  yatai: { title: 'Yatai', building: 'Outside B414', hours: [], when: 'Food truck', orderable: false },
  'street-food': {
    title: 'Street Food',
    building: 'B101',
    hours: [{ days: WEEKDAYS, time: '11.00 - 14.00' }],
    menu: {
      kind: 'week',
      days: [
        [{ name: 'Pulled pork burger with fries', price: 65 }, { name: 'Halloumi burger with fries', price: 60, veg: true }],
        [{ name: 'Chicken shawarma wrap', price: 60 }, { name: 'Falafel wrap', price: 55, veg: true }],
        [{ name: 'Bao buns with crispy chicken', price: 65 }, { name: 'Bao buns with tofu', price: 60, veg: true }],
        [{ name: 'Beef burrito', price: 65 }, { name: 'Bean burrito', price: 55, veg: true }],
        [{ name: 'Fish and chips', price: 65 }, { name: 'Loaded veggie fries', price: 50, veg: true }],
      ],
    },
  },
  bazaar: {
    title: 'Bazaar',
    building: 'B101',
    hours: [{ days: WEEKDAYS, time: '11.00 - 14.00' }],
    // Description as shown in the eat@DTU app (Figma 275:425).
    description:
      'A modern Indian kitchen, where stews and curries are allowed to simmer with warm spices, fresh ingredients and an abundance of flavors!',
    menu: {
      kind: 'week',
      days: [
        [{ name: 'Butter chicken with basmati rice and naan', price: 62 }, { name: 'Chana masala with rice', price: 52, veg: true }],
        [{ name: 'Lamb rogan josh with rice', price: 65 }, { name: 'Palak paneer with naan', price: 55, veg: true }],
        [{ name: 'Chicken tikka masala with rice', price: 62 }, { name: 'Dal tadka with rice', price: 50, veg: true }],
        [{ name: 'Beef madras with rice', price: 65 }, { name: 'Aloo gobi with naan', price: 52, veg: true }],
        [{ name: 'Fish curry with rice', price: 65 }, { name: 'Vegetable korma with rice', price: 52, veg: true }],
      ],
    },
  },
};
