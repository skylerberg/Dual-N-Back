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
    const adjusted = new Date(date.getTime() - 4 * 60 * 60 * 1000);
    return `${adjusted.getFullYear()}/${adjusted.getMonth() + 1}/${adjusted.getDate()}`;
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
    <button class="corner-nav top-left" onclick={() => page = 'History'}>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    </button>
    <button class="corner-nav top-right" onclick={() => page = 'Settings'}>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </button>
    <PlayButton nBack={nBack} nColor={undefined} startGame={startGame} gamesToday={gamesToday} />
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
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
</style>
