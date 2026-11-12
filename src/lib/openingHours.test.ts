import { describe, expect, it } from 'vitest';
import { venueStatus } from './openingHours';
import type { VenueInfo } from '../data/venueInfo';

const menu = { kind: 'fixed' as const, sections: [] };
const canteen: VenueInfo = { title: 'X', building: 'B101', hours: [{ days: 'Monday to Friday', time: '11.00 - 14.00' }], menu };
const rabbit: VenueInfo = {
  title: 'Wicked Rabbit',
  building: 'B342',
  hours: [
    { days: 'Monday to Thursday', time: '11.00 - 14.00' },
    { days: 'Friday', time: '11.00 - 13.30' },
  ],
  menu,
};

// Copenhagen is UTC+1 in November.
const at = (iso: string) => new Date(iso);

describe('venue opening status', () => {
  it('is open during the hours, with the closing time', () => {
    expect(venueStatus(canteen, at('2026-11-12T11:30:00Z'))).toEqual({ open: true, label: 'Open · until 14:00' });
  });

  it('says when it opens later today', () => {
    expect(venueStatus(canteen, at('2026-11-12T08:00:00Z'))).toEqual({ open: false, label: 'Opens 11:00' });
  });

  it('is closed after the hours and at the weekend', () => {
    expect(venueStatus(canteen, at('2026-11-12T14:30:00Z')).label).toBe('Closed');
    expect(venueStatus(canteen, at('2026-11-14T11:00:00Z')).label).toBe('Closed'); // Saturday
  });

  it('uses the Friday hours on Friday', () => {
    expect(venueStatus(rabbit, at('2026-11-13T12:00:00Z')).label).toBe('Open · until 13:30'); // Fri 13:00 local
    expect(venueStatus(rabbit, at('2026-11-13T12:45:00Z')).label).toBe('Closed'); // Fri 13:45 local
  });
});
