export type VisualPrompt = number;
export type AuditoryPrompt = number;

export const NUM_GRID_POSITIONS = 8;
export const NUM_SOUNDS = 8;
export const MATCHES_PER_MODALITY = 9;

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
      const excluded = new Set<number>();
      if (i >= nBack) excluded.add(visualPrompts[i - nBack]);
      visualPrompts.push(randomExcluding(NUM_GRID_POSITIONS, excluded));
    }

    // Auditory
    if (i >= nBack && auditoryMatchSet.has(i)) {
      auditoryPrompts.push(auditoryPrompts[i - nBack]);
    } else {
      const excluded = new Set<number>();
      if (i >= nBack) excluded.add(auditoryPrompts[i - nBack]);
      auditoryPrompts.push(randomExcluding(NUM_SOUNDS, excluded));
    }
  }

  return { visualPrompts, auditoryPrompts, visualMatchSteps, auditoryMatchSteps };
}
