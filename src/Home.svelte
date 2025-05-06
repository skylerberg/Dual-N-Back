<script lang="ts">
  import Game from './Game.svelte';
  import Score from './Score.svelte';
  import PlayButton from './PlayButton.svelte';
  import type {GameResult} from './types';

  type State = 'Home' | 'Game' | 'Score';
  let page: State = $state('Home');
  let nBack = $state(1);

  const startGame = () => {
    page = 'Game';
  }

  let gameResult: undefined | GameResult = $state(undefined);

  const finishGame = (result: GameResult) => {
    gameResult = result;
    page = 'Score';
  }

  const setNBack = (n: number) => {
    nBack = n;
  }
</script>

{#if page === 'Home'}
  <div id="home-screen">
    <PlayButton nBack={nBack} startGame={startGame} />
  </div>
{:else if page === 'Game'}
  <Game nBack={nBack} finishGame={finishGame} />
{:else if page === 'Score' && gameResult}
  <Score nBack={nBack} setNBack={setNBack} startGame={startGame} gameResult={gameResult} />
{/if}

<div class='screen'>

  <!--
    <div id='#help' style='width:50px;height:50px;position:absolute;left:0;bottom:0;margin:auto'>
      <svg viewBox='-10 -10 20 20' width=30px height=30px style='position:absolute;left:10px;bottom:10px'>
        <circle cx=0px cy=0px r=10px style='fill:black;' />
        <text x=0 y=0 style='fill:white;font-size:15px;font-family:Sans-serif;text-anchor:middle;dominant-baseline:central'>?</text>
      </svg>
    </div>

    <div id='msgs' style='position:absolute;bottom:4pt;right:4pt;text-align:right;'>
    </div>
-->
</div>

<style>
  #home-screen {
    display: flex;
    align-items: center;
    flex-direction: column;
    align-content: center;
  }

  #n-equals {
    font-size: 26pt;
  }

  #play {
    display: flex;
    align-items: center;
    justify-content: center;
    left: 0;
    top: 35%;
    height: 30%;
    width: 100%;
  }

  #play-svg {
    display: block;
    margin: auto;
    height: 100%;
    cursor: pointer;
  }
</style>
