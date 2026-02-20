<script lang="ts">
  import Game from './Game.svelte';
  import Score from './Score.svelte';
  import PlayButton from './PlayButton.svelte';
  import History from './History.svelte';
  import Settings from './Settings.svelte';
  import type {GameResult, GameLogEntry, Settings as SettingsType} from './types';
  import { DEFAULT_SETTINGS } from './types';

  type State = 'Home' | 'Game' | 'Score' | 'History' | 'Settings';
  let page: State = $state('Home');
  let nBack = $state(1);
  let gameLog: Array<GameLogEntry> = $state([]);
  let gamesToday = $state(0);
  let settings: SettingsType = $state({ ...DEFAULT_SETTINGS });

  const getDateString = (date: Date): string => {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  }

  let today = getDateString(new Date());

  try {
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
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      settings = JSON.parse(storedSettings);
    }
  } catch {
    localStorage.removeItem('nBack');
    localStorage.removeItem('gameLog');
    localStorage.removeItem('settings');
  }

  const startGame = () => {
    page = 'Game';
  }

  const cancelGame = () => {
    page = 'Home';
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

  const updateSettings = (s: SettingsType) => {
    settings = s;
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  const goHome = () => {
    page = 'Home';
  }
</script>

{#if page === 'Home'}
  <div id="home-screen">
    <PlayButton nBack={nBack} nColor={undefined} startGame={startGame} gamesToday={gamesToday} />
    <div id="home-nav">
      <button class="nav-button" onclick={() => page = 'History'}>History</button>
      <button class="nav-button" onclick={() => page = 'Settings'}>Settings</button>
    </div>
  </div>
{:else if page === 'Game'}
  <Game nBack={nBack} finishGame={finishGame} cancelGame={cancelGame} settings={settings} />
{:else if page === 'Score' && gameResult}
  <Score nBack={nBack} setNBack={setNBack} startGame={startGame} gameResult={gameResult} gamesToday={gamesToday} />
{:else if page === 'History'}
  <History gameLog={gameLog} goBack={goHome} />
{:else if page === 'Settings'}
  <Settings settings={settings} updateSettings={updateSettings} nBack={nBack} setNBack={setNBack} goBack={goHome} />
{/if}

<style>
  #home-screen {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  #home-nav {
    display: flex;
    gap: 20px;
    margin-top: 10px;
  }

  .nav-button {
    background: none;
    border: none;
    color: #ccc;
    font-size: 14pt;
    cursor: pointer;
    padding: 8px 16px;
  }

  .nav-button:hover {
    color: #fff;
  }
</style>
