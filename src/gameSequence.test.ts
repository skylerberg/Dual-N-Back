import { describe, it, expect } from 'vitest';
import {
  randomExcluding,
  getExcludedValues,
  getVisualExclusions,
  buildGameSequence,
  VISUAL_ADJACENCY,
  NUM_GRID_POSITIONS,
  NUM_SOUNDS,
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

describe('getExcludedValues', () => {
  it('excludes nBackValue when provided', () => {
    const excluded = getExcludedValues([], 0, 3);
    expect(excluded.has(3)).toBe(true);
  });

  it('excludes repeated value (anti-repetition)', () => {
    const excluded = getExcludedValues([5, 5], 2);
    expect(excluded.has(5)).toBe(true);
  });

  it('does not exclude when last two differ', () => {
    const excluded = getExcludedValues([3, 5], 2);
    expect(excluded.has(3)).toBe(false);
    expect(excluded.has(5)).toBe(false);
  });

  it('excludes B in ABA pattern (anti-alternation)', () => {
    // prompts = [A, B, A] at indices 0,1,2 — checking index 3
    // A=2, B=7
    const excluded = getExcludedValues([2, 7, 2], 3);
    expect(excluded.has(7)).toBe(true);
  });

  it('does not trigger anti-alternation for AAA', () => {
    // [3, 3, 3] — prompts[0]===prompts[2] but prompts[1]===prompts[2], not ABA
    const excluded = getExcludedValues([3, 3, 3], 3);
    // anti-repetition fires (3), but anti-alternation should not
    expect(excluded.has(3)).toBe(true); // from anti-repetition
    expect(excluded.size).toBe(1);
  });

  it('combines nBackValue and anti-repetition', () => {
    const excluded = getExcludedValues([5, 5], 2, 3);
    expect(excluded.has(5)).toBe(true);
    expect(excluded.has(3)).toBe(true);
  });
});

describe('getVisualExclusions', () => {
  it('returns empty for i < 2', () => {
    expect(getVisualExclusions([0], 1).size).toBe(0);
  });

  it('excludes neighbors when last two are adjacent', () => {
    // 0 and 1 are adjacent
    const excluded = getVisualExclusions([0, 1], 2);
    // neighbors of 1 are [0, 2]
    expect(excluded.has(0)).toBe(true);
    expect(excluded.has(2)).toBe(true);
  });

  it('returns empty when last two are not adjacent', () => {
    // 0 and 7 are not adjacent
    const excluded = getVisualExclusions([0, 7], 2);
    expect(excluded.size).toBe(0);
  });
});

describe('VISUAL_ADJACENCY', () => {
  it('has exactly 2 neighbors per position', () => {
    for (let i = 0; i < 8; i++) {
      expect(VISUAL_ADJACENCY[i].length).toBe(2);
    }
  });

  it('is symmetric', () => {
    for (let i = 0; i < 8; i++) {
      for (const neighbor of VISUAL_ADJACENCY[i]) {
        expect(VISUAL_ADJACENCY[neighbor]).toContain(i);
      }
    }
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

        // Anti-chunking checks only on non-match steps
        const isVisualMatch = i >= nBack && visualMatchSet.has(i);
        const isAuditoryMatch = i >= nBack && auditoryMatchSet.has(i);

        // No triple repetition
        if (!isVisualMatch && i >= 2) {
          if (visualPrompts[i - 1] === visualPrompts[i - 2]) {
            expect(visualPrompts[i]).not.toBe(visualPrompts[i - 1]);
          }
        }
        if (!isAuditoryMatch && i >= 2) {
          if (auditoryPrompts[i - 1] === auditoryPrompts[i - 2]) {
            expect(auditoryPrompts[i]).not.toBe(auditoryPrompts[i - 1]);
          }
        }

        // No ABAB alternation
        if (!isVisualMatch && i >= 3) {
          const a = visualPrompts[i - 3];
          const b = visualPrompts[i - 2];
          const c = visualPrompts[i - 1];
          if (a === c && b !== c) {
            // A-B-A pattern, current should not be B
            expect(visualPrompts[i]).not.toBe(b);
          }
        }
        if (!isAuditoryMatch && i >= 3) {
          const a = auditoryPrompts[i - 3];
          const b = auditoryPrompts[i - 2];
          const c = auditoryPrompts[i - 1];
          if (a === c && b !== c) {
            expect(auditoryPrompts[i]).not.toBe(b);
          }
        }

        // No spatial walks (visual only)
        if (!isVisualMatch && i >= 2) {
          const prevPrev = visualPrompts[i - 2];
          const prev = visualPrompts[i - 1];
          if (VISUAL_ADJACENCY[prevPrev].includes(prev)) {
            expect(VISUAL_ADJACENCY[prev]).not.toContain(visualPrompts[i]);
          }
        }
      }
    }
  }

  it('enforces constraints at nBack=2', () => runTests(2));
  it('enforces constraints at nBack=3', () => runTests(3));
  it('enforces constraints at nBack=4', () => runTests(4));
});
