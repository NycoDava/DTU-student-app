import { describe, expect, it } from 'vitest';
import { describeLocation } from './rooms';

describe('describeLocation', () => {
  it('formats DTU room codes and builds the map search', () => {
    expect(describeLocation('LYN.358.042 | LYN.358.039')).toEqual({ label: 'Building 358, rooms 039, 042', mapQuery: '358 042' });
    expect(describeLocation('LYN.101.S01')).toEqual({ label: 'Building 101, room S01', mapQuery: '101 S01' });
    expect(describeLocation('LYN.358.042 | LYN.306.031')?.label).toBe('Building 358, room 042 · Building 306, room 031');
  });
  it('keeps free text and ignores empty values', () => {
    expect(describeLocation('Library, 2nd floor')).toEqual({ label: 'Library, 2nd floor', mapQuery: 'Library, 2nd floor' });
    expect(describeLocation('  ')).toBeNull();
    expect(describeLocation(null)).toBeNull();
  });
});
