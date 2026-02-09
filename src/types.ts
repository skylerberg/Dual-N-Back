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

