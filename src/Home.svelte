<script lang="ts">
  import Game from './Game.svelte';
  import Score from './Score.svelte';
  import PlayButton from './PlayButton.svelte';
  import type {GameResult} from './types';

  type State = 'Home' | 'Game' | 'Score';
  let page: State = $state('Home');
  let nBack = $state(1);
  let gameLog: Array<any> = $state([]);
  let gamesToday = $state(0);

  const getDateString = (date: Date): string => {
    return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
  }

  let today = getDateString(new Date());

  const storedNBack = localStorage.getItem('nBack');
  if (storedNBack) {
    nBack = JSON.parse(storedNBack);
  }
  const storedGameLog = localStorage.getItem('gameLog');
  if (storedGameLog) {
    gameLog = JSON.parse(storedGameLog);
    for (let game of gameLog) {
      if (game.date === today) {
        gamesToday += 1;
      }
    }
  }

  const startGame = () => {
    page = 'Game';
  }

  const cancelGame = () => {
    page = 'Game';
  }

  let gameResult: undefined | GameResult = $state(undefined);

  const finishGame = (result: GameResult) => {
    gameResult = result;
    gameLog.push({
      nBack,
      result,
      date: today,
    });
    localStorage.setItem('gameLog', JSON.stringify(gameLog));
    gamesToday += 1;
    page = 'Score';
  }

  const setNBack = (n: number) => {
    nBack = n;
    localStorage.setItem('nBack', JSON.stringify(nBack));
  }
</script>

{#if page === 'Home'}
  <div id="home-screen">
    <PlayButton nBack={nBack} startGame={startGame} gamesToday={gamesToday} />
  </div>
{:else if page === 'Game'}
  <Game nBack={nBack} finishGame={finishGame} cancelGame={cancelGame} />
{:else if page === 'Score' && gameResult}
  <Score nBack={nBack} setNBack={setNBack} startGame={startGame} gameResult={gameResult} gamesToday={gamesToday} />
{/if}

<style>
  #home-screen {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
  }
</style>
