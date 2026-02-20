import { describe, it, expect } from 'vitest';
import {
  randomExcluding,
  buildGameSequence,
} from './gameSequence';

describe('randomExcluding', () => {
  it('returns a value in range', () => {
    for (let i = 0; i < 100; i++) {
      const v = randomExcluding(8, new Set());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(8);
    }
  });

  it('never returns an excluded value', () => {
    const excluded = new Set([0, 1, 2, 3, 4, 5]);
    for (let i = 0; i < 100; i++) {
      const v = randomExcluding(8, excluded);
      expect(excluded.has(v)).toBe(false);
    }
  });

  it('falls back to unrestricted when all values excluded', () => {
    const excluded = new Set([0, 1, 2, 3, 4, 5, 6, 7]);
    const v = randomExcluding(8, excluded);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(8);
  });
});

describe('buildGameSequence integration', () => {
  const ITERATIONS = 200;

  function runTests(nBack: number) {
    const timesteps = Array.from({ length: 20 + nBack }, (_, i) => i);

    for (let iter = 0; iter < ITERATIONS; iter++) {
      const { visualPrompts, auditoryPrompts, visualMatchSteps, auditoryMatchSteps } =
        buildGameSequence(nBack, timesteps);

      const visualMatchSet = new Set(visualMatchSteps);
      const auditoryMatchSet = new Set(auditoryMatchSteps);

      expect(visualPrompts.length).toBe(timesteps.length);
      expect(auditoryPrompts.length).toBe(timesteps.length);

      for (let i = 0; i < timesteps.length; i++) {
        // Verify match steps have correct values
        if (i >= nBack && visualMatchSet.has(i)) {
          expect(visualPrompts[i]).toBe(visualPrompts[i - nBack]);
        }
        if (i >= nBack && auditoryMatchSet.has(i)) {
          expect(auditoryPrompts[i]).toBe(auditoryPrompts[i - nBack]);
        }

        // Verify non-match steps don't accidentally match
        if (i >= nBack && !visualMatchSet.has(i)) {
          expect(visualPrompts[i]).not.toBe(visualPrompts[i - nBack]);
        }
        if (i >= nBack && !auditoryMatchSet.has(i)) {
          expect(auditoryPrompts[i]).not.toBe(auditoryPrompts[i - nBack]);
        }
      }
    }
  }

  it('enforces match/non-match correctness at nBack=2', () => runTests(2));
  it('enforces match/non-match correctness at nBack=3', () => runTests(3));
  it('enforces match/non-match correctness at nBack=4', () => runTests(4));
});
