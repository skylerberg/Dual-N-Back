export type VisualPrompt = number;
export type AuditoryPrompt = number;

export const NUM_GRID_POSITIONS = 8;
export const NUM_SOUNDS = 8;
export const MATCHES_PER_MODALITY = 9;

// Orthogonal adjacency for the 3x3 grid minus center:
// [0] [1] [2]
// [3] [ ] [4]
// [5] [6] [7]
export const VISUAL_ADJACENCY: ReadonlyArray<ReadonlyArray<number>> = [
  [1, 3], // 0
  [0, 2], // 1
  [1, 4], // 2
  [0, 5], // 3
  [2, 7], // 4
  [3, 6], // 5
  [5, 7], // 6
  [4, 6], // 7
];

export function randomExcluding(numValues: number, excluded: Set<number>): number {
  const allowed: number[] = [];
  for (let v = 0; v < numValues; v++) {
    if (!excluded.has(v)) allowed.push(v);
  }
  if (allowed.length === 0) {
    return Math.floor(Math.random() * numValues);
  }
  return allowed[Math.floor(Math.random() * allowed.length)];
}

export function getExcludedValues(prompts: number[], i: number, nBackValue?: number): Set<number> {
  const excluded = new Set<number>();

  // Exclude n-back value to prevent accidental match
  if (nBackValue !== undefined) {
    excluded.add(nBackValue);
  }

  // Anti-repetition: no 3+ consecutive identical values
  if (i >= 2 && prompts[i - 1] === prompts[i - 2]) {
    excluded.add(prompts[i - 1]);
  }

  // Anti-alternation: no ABAB pattern
  if (i >= 3 && prompts[i - 3] === prompts[i - 1] && prompts[i - 2] !== prompts[i - 1]) {
    excluded.add(prompts[i - 2]);
  }

  return excluded;
}

export function getVisualExclusions(prompts: number[], i: number): Set<number> {
  const excluded = new Set<number>();

  // Anti-spatial-walk: no 3+ consecutive adjacent positions
  if (i >= 2) {
    const prev = prompts[i - 1];
    const prevPrev = prompts[i - 2];
    if (VISUAL_ADJACENCY[prevPrev].includes(prev)) {
      for (const neighbor of VISUAL_ADJACENCY[prev]) {
        excluded.add(neighbor);
      }
    }
  }

  return excluded;
}

export function choose<T>(elements: Array<T>, count: number): Array<T> {
  const values = [...elements];
  for (let i = 0; i < count; i++) {
    const unchosenElementCount = elements.length - i;
    const chosenIndex = Math.floor(Math.random() * unchosenElementCount);
    const tmp = values[i];
    values[i] = values[chosenIndex];
    values[chosenIndex] = tmp;
  }
  return values.slice(0, count);
}

export function buildGameSequence(nBack: number, timesteps: Array<number>): {
  visualPrompts: Array<VisualPrompt>;
  auditoryPrompts: Array<AuditoryPrompt>;
  visualMatchSteps: Array<number>;
  auditoryMatchSteps: Array<number>;
} {
  const visualMatchSteps = choose(timesteps.slice(nBack), MATCHES_PER_MODALITY);
  const auditoryMatchSteps = choose(timesteps.slice(nBack), MATCHES_PER_MODALITY);

  const visualMatchSet = new Set(visualMatchSteps);
  const auditoryMatchSet = new Set(auditoryMatchSteps);

  const visualPrompts: Array<VisualPrompt> = [];
  const auditoryPrompts: Array<AuditoryPrompt> = [];

  for (let i = 0; i < timesteps.length; i++) {
    // Visual
    if (i >= nBack && visualMatchSet.has(i)) {
      visualPrompts.push(visualPrompts[i - nBack]);
    } else {
      const nBackValue = i >= nBack ? visualPrompts[i - nBack] : undefined;
      const excluded = getExcludedValues(visualPrompts, i, nBackValue);
      for (const v of getVisualExclusions(visualPrompts, i)) {
        excluded.add(v);
      }
      visualPrompts.push(randomExcluding(NUM_GRID_POSITIONS, excluded));
    }

    // Auditory
    if (i >= nBack && auditoryMatchSet.has(i)) {
      auditoryPrompts.push(auditoryPrompts[i - nBack]);
    } else {
      const nBackValue = i >= nBack ? auditoryPrompts[i - nBack] : undefined;
      const excluded = getExcludedValues(auditoryPrompts, i, nBackValue);
      auditoryPrompts.push(randomExcluding(NUM_SOUNDS, excluded));
    }
  }

  return { visualPrompts, auditoryPrompts, visualMatchSteps, auditoryMatchSteps };
}
