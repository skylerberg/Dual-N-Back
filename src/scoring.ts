import type { GameResult } from './types';

export const SCORE_THRESHOLD_UP = 85;
export const SCORE_THRESHOLD_DOWN = 60;

export function makeGameResult(
  visualMatchSteps: Array<number>,
  auditoryMatchSteps: Array<number>,
  clickedVisual: Array<boolean>,
  clickedAuditory: Array<boolean>,
): GameResult {
  const visualTruePositives = visualMatchSteps.filter((step) => clickedVisual[step]).length;
  const auditoryTruePositives = auditoryMatchSteps.filter((step) => clickedAuditory[step]).length;
  return {
    visual: {
      truePositives: visualTruePositives,
      falseNegatives: visualMatchSteps.filter((step) => !clickedVisual[step]).length,
      falsePositives: clickedVisual.filter((step) => step).length - visualTruePositives,
    },
    auditory: {
      truePositives: auditoryTruePositives,
      falseNegatives: auditoryMatchSteps.filter((step) => !clickedAuditory[step]).length,
      falsePositives: clickedAuditory.filter((step) => step).length - auditoryTruePositives,
    },
  };
}

export function calculateScore(gameResult: GameResult): number {
  const totalCorrect = gameResult.visual.truePositives + gameResult.auditory.truePositives;
  const totalOpportunities =
    gameResult.visual.truePositives +
    gameResult.visual.falseNegatives +
    gameResult.visual.falsePositives +
    gameResult.auditory.truePositives +
    gameResult.auditory.falseNegatives +
    gameResult.auditory.falsePositives;
  const dPrime = totalCorrect / totalOpportunities;
  return Math.round(dPrime * 100);
}
