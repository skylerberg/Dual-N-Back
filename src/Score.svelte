<script lang="ts">
  import eyeSvg from './assets/img/eye.svg';
  import speakerSvg from './assets/img/speaker.svg';
  import PlayButton from './PlayButton.svelte';
  import type {GameResult} from './types';
  import { calculateScore, SCORE_THRESHOLD_UP, SCORE_THRESHOLD_DOWN } from './scoring';

  let {nBack, setNBack, startGame, gameResult, gamesToday, goToHistory, goToSettings}: {
    nBack: number,
    setNBack: (n: number) => void,
    startGame: () => void,
    gameResult: GameResult,
    gamesToday: number,
    goToHistory: () => void,
    goToSettings: () => void,
  } = $props();

  const score = calculateScore(gameResult);

  let nColor: undefined | 'green' | 'red' = $state(undefined);

  if (score >= SCORE_THRESHOLD_UP) {
    nColor = 'green';
    setNBack(nBack + 1);
  } else if (score < SCORE_THRESHOLD_DOWN && nBack > 1) {
    nColor = 'red';
    setNBack(nBack - 1);
  }
</script>

<div id='score-screen'>
  <button class="corner-nav top-left" onclick={goToHistory}>
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  </button>
  <button class="corner-nav top-right" onclick={goToSettings}>
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  </button>
  <table id="score-table">
    <thead>
      <tr>
        <th>
          <img class="table-icon" src={eyeSvg} alt="Visual" />
        </th>
        <th></th>
        <th>
          <img class="table-icon" src={speakerSvg} alt="Audio" />
        </th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>{gameResult.visual.truePositives}</td>
        <td style='font-weight:bold;'>Hits</td>
        <td>{gameResult.auditory.truePositives}</td>
      </tr>
      <tr>
        <td>{gameResult.visual.falseNegatives}</td>
        <td style='font-weight:bold;'>Misses</td>
        <td>{gameResult.auditory.falseNegatives}</td>
      </tr>
      <tr>
        <td>{gameResult.visual.falsePositives}</td>
        <td style='font-weight:bold;'>False Alarms</td>
        <td>{gameResult.auditory.falsePositives}</td>
      </tr>
    </tbody>
  </table>

  <div id="outcome">
    <div>d' = {score}%</div>
  </div>

  <PlayButton nColor={nColor} nBack={nBack} startGame={startGame} gamesToday={gamesToday} />
</div>

<style>
  #score-screen {
    position: relative;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .corner-nav {
    position: absolute;
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;
    padding: 12px;
  }

  .corner-nav:hover {
    color: #fff;
  }

  .top-left {
    top: 0;
    left: 0;
  }

  .top-right {
    top: 0;
    right: 0;
  }

  #score-table {
    font-size: min(5vw, 16pt);
  }

  .table-icon {
    width: min(10vw, 32pt);
  }
</style>
