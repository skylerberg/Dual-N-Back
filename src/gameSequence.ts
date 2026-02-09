export type VisualPrompt = number;
export type AuditoryPrompt = number;

export const NUM_GRID_POSITIONS = 8;
export const NUM_SOUNDS = 8;
export const MATCHES_PER_MODALITY = 9;

const randomVisual = (): VisualPrompt => {
  return Math.floor(Math.random() * NUM_GRID_POSITIONS);
};
const randomAudio = (): AuditoryPrompt => {
  return Math.floor(Math.random() * NUM_SOUNDS);
};

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

  let visualPrompts: Array<VisualPrompt> = [];
  let auditoryPrompts: Array<AuditoryPrompt> = [];

  for (let i = 0; i < timesteps.length; i++) {
    visualPrompts.push(randomVisual());
    auditoryPrompts.push(randomAudio());
  }

  for (let i = 0; i < timesteps.length; i++) {
    if (i >= nBack) {
      if (visualMatchSteps.some((visualMatchStep) => visualMatchStep === i)) {
        visualPrompts[i] = visualPrompts[i - nBack];
      } else {
        while (visualPrompts[i] === visualPrompts[i - nBack]) {
          visualPrompts[i] = randomVisual();
        }
      }

      if (auditoryMatchSteps.some((auditoryMatchStep) => auditoryMatchStep === i)) {
        auditoryPrompts[i] = auditoryPrompts[i - nBack];
      } else {
        while (auditoryPrompts[i] === auditoryPrompts[i - nBack]) {
          auditoryPrompts[i] = randomAudio();
        }
      }
    }
  }

  return { visualPrompts, auditoryPrompts, visualMatchSteps, auditoryMatchSteps };
}
