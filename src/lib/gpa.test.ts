import { describe, expect, it } from 'vitest';
import type { Grade } from '../data/types';
import { computeGpa, expectedGpa, gradeTimeline, lastGrade, periodKey, periodLabel } from './gpa';

// Test fixtures only (not app data).
const g = (code: string, grade: string, ects: number, period: string, passed = true): Grade => ({
  code,
  title: `Course ${code}`,
  ects,
  grade,
  passed,
  period,
});

describe('expectedGpa', () => {
  it('with no grades yet, the expected GPA is the expected grade', () => {
    expect(expectedGpa([], '7', 5)).toEqual({ ok: true, gpa: 7 });
  });

  it('is the ECTS-weighted mean including the new course', () => {
    const r = expectedGpa([g('A', '12', 5, 's25'), g('B', '10', 10, 's25')], '7', 5);
    expect(r.ok && r.gpa).toBeCloseTo((12 * 5 + 10 * 10 + 7 * 5) / 20);
  });

  it('ignores failed courses and pass/fail marks', () => {
    const r = expectedGpa([g('A', '10', 5, 's25'), g('B', 'IB', 5, 's25', false), g('C', '-3', 5, 'v25', false)], '10', 5);
    expect(r).toEqual({ ok: true, gpa: 10 });
  });

  it('rejects invalid input', () => {
    expect(expectedGpa([], '', 5).ok).toBe(false);
    expect(expectedGpa([], '8', 5).ok).toBe(false);
    expect(expectedGpa([], '7', 0).ok).toBe(false);
    expect(expectedGpa([], '7', -5).ok).toBe(false);
    expect(expectedGpa([], '7', Number.NaN).ok).toBe(false);
  });
});

describe('computeGpa', () => {
  it('is null without grades', () => {
    expect(computeGpa([])).toBeNull();
  });
});

describe('periods and timeline', () => {
  it('orders spring before winter of the same year', () => {
    expect(periodKey('s25')).toBeLessThan(periodKey('v25'));
    expect(periodKey('v25')).toBeLessThan(periodKey('s26'));
    expect(periodLabel('v25')).toBe('WINTER 2025');
    expect(periodLabel('s26')).toBe('SPRING 2026');
  });

  it('builds a running GPA and marks failed points', () => {
    const t = gradeTimeline([g('B', '7', 5, 's26'), g('A', '12', 5, 'v25'), g('C', 'IB', 5, 's26', false)]);
    expect(t.map((p) => p.grade.code)).toEqual(['A', 'B', 'C']);
    expect(t.map((p) => p.gpa)).toEqual([12, 9.5, 9.5]);
    expect(t[2].failed).toBe(true);
    expect(t[2].value).toBeNull();
  });

  it('finds the last grade', () => {
    expect(lastGrade([g('A', '12', 5, 's26'), g('B', '7', 5, 'v25')])?.code).toBe('A');
    expect(lastGrade([])).toBeNull();
  });
});
