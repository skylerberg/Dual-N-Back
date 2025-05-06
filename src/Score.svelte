<script lang="ts">
  import eyeSvg from './assets/img/eye.svg';
  import speakerSvg from './assets/img/speaker.svg';
  import PlayButton from './PlayButton.svelte';
  import type {GameResult} from './types';

  let {nBack, setNBack, startGame, gameResult}: {
    nBack: number,
    setNBack: (n: number) => void,
    startGame: () => void,
    gameResult: GameResult | undefined,
  } = $props();

  const totalCorrect = gameResult.visual.truePositives + gameResult.auditory.truePositives;
  const totalOpportunities = (
    gameResult.visual.truePositives +
      gameResult.visual.falseNegatives +
      gameResult.visual.falsePositives +
      gameResult.auditory.truePositives +
      gameResult.auditory.falseNegatives +
      gameResult.auditory.falsePositives
  );
  const dPrime = totalCorrect / totalOpportunities

  let nColor: undefined | 'green' | 'red' = $state(undefined);

  if (dPrime >= 0.85) {
    nColor = 'green';
    setNBack(nBack + 1);
  } else if (dPrime < 0.7 && nBack > 1) {
    nColor = 'red';
    setNBack(nBack - 1);
  }
</script>

<div id='score-screen'>
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
    <div>d' = {Math.round(dPrime * 100)}%</div>
  </div>

  <PlayButton nColor={nColor} nBack={nBack} startGame={startGame} />
</div>

<style>
  #score-screen {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  #score-table {
    font-size: min(5vw, 16pt);
  }

  .table-icon {
    width: min(10vw, 32pt);
  }
</style>
