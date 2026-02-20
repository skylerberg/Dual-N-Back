<script lang="ts">
  import playSvg from './assets/img/play.svg';

  let {nBack, startGame, nColor, gamesToday}: {
    nBack: number,
    startGame: () => void,
    nColor: undefined | 'green' | 'red',
    gamesToday: number,
  } = $props();
</script>

<button id="play" onclick={startGame} aria-label="Start game">
  <div class="n-equals {nColor}">N = {nBack}</div>
  <img id="play-svg" src={playSvg} alt="play"/>
  <div class="daily-progress">{gamesToday} / 20</div>
</button>

<style>
  .n-equals {
    font-size: 26pt;
  }

  .daily-progress {
    font-size: 14pt;
  }

  :global(.green) {
    color: green;
  }

  :global(.red) {
    color: red;
  }

  #play {
    margin: 20px;
    height: min(25%, 40vw);
    background: unset;
    border: unset;
  }

  #play-svg {
    height: 100%;
    cursor: pointer;
  }
</style>
