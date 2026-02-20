<script lang="ts">
  import eyeSvg from './assets/img/eye.svg';
  import speakerSvg from './assets/img/speaker.svg';
  import fMp3 from './assets/audio/f.mp3';
  import jMp3 from './assets/audio/j.mp3';
  import qMp3 from './assets/audio/q.mp3';
  import nMp3 from './assets/audio/n.mp3';
  import rMp3 from './assets/audio/r.mp3';
  import sMp3 from './assets/audio/s.mp3';
  import tMp3 from './assets/audio/t.mp3';
  import yMp3 from './assets/audio/y.mp3';
  import type {GameResult} from './types';
  import type {Settings} from './types';
  import { loadSounds, playSound, setVolume } from './audio';
  import { buildGameSequence } from './gameSequence';
  import { makeGameResult } from './scoring';

  let {nBack, finishGame, cancelGame, settings}: {
    nBack: number,
    finishGame: (result: GameResult) => void,
    cancelGame: () => void,
    settings: Settings,
  } = $props();

  let gridBox1: HTMLDivElement | undefined, gridBox2: HTMLDivElement | undefined, gridBox3: HTMLDivElement | undefined, gridBox4: HTMLDivElement | undefined, gridBox5: HTMLDivElement | undefined, gridBox6: HTMLDivElement | undefined, gridBox7: HTMLDivElement | undefined, gridBox8: HTMLDivElement | undefined;
  let gridBoxes = $derived([ gridBox1, gridBox2, gridBox3, gridBox4, gridBox5, gridBox6, gridBox7, gridBox8, ]);

  setVolume(settings.volume);
  loadSounds([fMp3, jMp3, qMp3, nMp3, rMp3, sMp3, tMp3, yMp3]);

  const timesteps: Array<number> = [...Array(30 + nBack).keys()];
  const {
    visualPrompts,
    auditoryPrompts,
    visualMatchSteps,
    auditoryMatchSteps,
  } = buildGameSequence(nBack, timesteps);

  const clickedVisual = $state(Array(timesteps.length).fill(false));
  const clickedAuditory = $state(Array(timesteps.length).fill(false));

  let currentStep = $state(-1);
  let activeBox: number | null = $state(null);
  let gracePeriod = false;

  const gameTick = () => {
    currentStep += 1;
    gracePeriod = true;
    setTimeout(() => gracePeriod = false, 100);
    if (currentStep < timesteps.length) {
      const audioPrompt = auditoryPrompts[currentStep];
      const visualPrompt = visualPrompts[currentStep];
      playSound(audioPrompt);

      if (activeBox !== null) {
        const prevBox = gridBoxes[activeBox];
        if (prevBox) prevBox.classList.remove('grid-box-active');
      }
      activeBox = visualPrompt;

      const curBox = gridBoxes[activeBox];
      if (curBox) {
        // Force a DOM reflow before adding the class again
        void curBox.offsetWidth;
        curBox.classList.add('grid-box-active');
      }
    } else {
      clearInterval(gameInterval);
      const result = makeGameResult(visualMatchSteps, auditoryMatchSteps, clickedVisual, clickedAuditory);
      finishGame(result);
    }
  }

  const gameInterval = setInterval(gameTick, settings.trialDurationMs);

  const visualClick = () => {
    if (gracePeriod && currentStep > 0) {
      clickedVisual[currentStep - 1] = true;
    }
    else {
      clickedVisual[currentStep] = true;
    }
  }

  const auditoryClick = () => {
    if (gracePeriod && currentStep > 0) {
      clickedAuditory[currentStep - 1] = true;
    }
    else {
      clickedAuditory[currentStep] = true;
    }
  }

  const back = () => {
    clearInterval(gameInterval);
    cancelGame();
  }
</script>

<div id="game-screen" >
  <div id="n-value">
    N = {nBack}
  </div>

  <div id="grid">
    <div bind:this={gridBox1} class="grid-box"></div>
    <div bind:this={gridBox2} class="grid-box"></div>
    <div bind:this={gridBox3} class="grid-box"></div>
    <div bind:this={gridBox4} class="grid-box"></div>
    <div></div>
    <div bind:this={gridBox5} class="grid-box"></div>
    <div bind:this={gridBox6} class="grid-box"></div>
    <div bind:this={gridBox7} class="grid-box"></div>
    <div bind:this={gridBox8} class="grid-box"></div>
  </div>

  <div id="game-buttons">
    <button
      id="visual-button"
      class="game-button {clickedVisual[currentStep] ? 'game-button-clicked' : ''}"
      onmousedown={visualClick}
      ontouchstart={visualClick}
      aria-label="Visual match"
    >
      <img src="{eyeSvg}" class="game-button-image" alt="eye" />
    </button>

    <button
      id="auditory-button"
      class="game-button {clickedAuditory[currentStep] ? 'game-button-clicked' : ''}"
      onmousedown={auditoryClick}
      ontouchstart={auditoryClick}
      aria-label="Audio match"
    >
      <img src="{speakerSvg}" class="game-button-image" alt="speaker" />
    </button>
  </div>

  <!-- Back button -->
  <button onclick={back} aria-label="Go back" style="position:absolute;left:0;top:0;background:none;border:none;padding:0;cursor:pointer;">
    <svg viewBox="0 0 50 50" width=50px height=50px>
      <rect style="opacity:0.0;" width=50px height=50px x=0 y=0 />
      <polygon points='17,25 33,35 33,15' style='fill:white;' />
    </svg>
  </button>
</div>

<style>
#game-screen {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

#n-value {
  font-size: 30px;
  font-family: Sans-serif;
  text-align: center;
  margin-bottom: 20px;
}

#grid {
  margin: auto;
  width: min(80vh, 90vw);
  aspect-ratio: 1 / 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.grid-box {
  aspect-ratio: 1 / 1;
  background: #c63;
  border-radius: 10%;
}

:global(.grid-box-active) {
  animation: fade 3s linear 1;
}

@keyframes fade {
   0% {background: #c63;}
   1% {background: #fc9;}
   17% {background: #fc9;}
   18% {background: #c63;}
   100% {background: #c63;}
}

#game-buttons {
  display: flex;
  margin: auto;
  justify-content: space-around;
  width: min(80vh, 90vw);
}

.game-button {
  margin: 10px;
  border-radius: 10px;
  max-height: 300px;
  width: min(100%, 500px);
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #222;
  border-width: 2px;
  border-color: #eee;
}

.game-button-clicked {
  background-color: #9f7f60 !important;
}

.game-button-image {
  height: 40px;
}
</style>
