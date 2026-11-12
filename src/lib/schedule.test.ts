import { describe, expect, it } from 'vitest';
import { examFor, normalizeGroup, slotGrid } from './schedule';

describe('schedule groups', () => {
  it('normalizes group names', () => {
    expect(normalizeGroup('E5B')).toBe('E5B');
    expect(normalizeGroup('e5-b')).toBe('E5B');
    expect(normalizeGroup('F7')).toBe('F7');
    expect(normalizeGroup('January')).toBeNull();
  });

  it('places slots like the DTU week grid', () => {
    const g = slotGrid('E');
    expect(g[0][0]).toBe('E1A'); // Monday 8-12
    expect(g[1][2]).toBe('E5B'); // Wednesday 13-17
    expect(g[1][3]).toBe('E1B'); // Thursday 13-17
    expect(g[2][1]).toBe('E7'); // Tuesday 18-22
  });
});

describe('exam day from the DTU timetable', () => {
  it('finds the winter exam of an autumn schedule group', () => {
    expect(examFor('02830', ['E5B'], 'E', 2026)?.date).toBe('2026-12-18');
    expect(examFor('38110', ['E1B'], 'E', 2026)?.date).toBe('2026-12-08');
  });

  it('does not confuse E1-A with E1-B', () => {
    expect(examFor(null, ['E1A'], 'E', 2026)?.date).toBe('2026-12-07');
  });

  it('returns null for 3-week courses', () => {
    expect(examFor('38400', ['January'], 'E', 2026)).toBeNull();
  });
});
