export type GameResult = {
  visual: {
    truePositives: number,
    falsePositives: number,
    falseNegatives: number,
  },
  auditory: {
    truePositives: number,
    falsePositives: number,
    falseNegatives: number,
  },
};

export type GameLogEntry = {
  nBack: number;
  result: GameResult;
  date: string;
};

export type Settings = {
  volume: number;
  trialDurationMs: number;
};

export const DEFAULT_SETTINGS: Settings = {
  volume: 0.8,
  trialDurationMs: 2000,
};

