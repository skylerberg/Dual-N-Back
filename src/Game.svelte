<script lang="ts">
  import { tick } from 'svelte';
  import eyeSvg from './assets/img/eye.svg';
  import speakerSvg from './assets/img/speaker.svg';
  import fMp3 from './assets/audio/f.mp3';
  import iMp3 from './assets/audio/i.mp3';
  import jMp3 from './assets/audio/j.mp3';
  import qMp3 from './assets/audio/q.mp3';
  import nMp3 from './assets/audio/n.mp3';
  import rMp3 from './assets/audio/r.mp3';
  import sMp3 from './assets/audio/s.mp3';
  import tMp3 from './assets/audio/t.mp3';
  import yMp3 from './assets/audio/y.mp3';
  import type {GameResult} from './types';

  let {nBack, finishGame}: {
    nBack: number,
    finishGame: (result: GameResult) => void,
  } = $props();

  let gridBox1, gridBox2, gridBox3, gridBox4, gridBox5, gridBox6, gridBox7, gridBox8;
  let gridBoxes = $derived([ gridBox1, gridBox2, gridBox3, gridBox4, gridBox5, gridBox6, gridBox7, gridBox8, ]);

  let sounds = [
    //new Audio(fMp3),
    new Audio(iMp3),
    new Audio(jMp3),
    new Audio(qMp3),
    new Audio(nMp3),
    new Audio(rMp3),
    new Audio(sMp3),
    new Audio(tMp3),
    new Audio(yMp3),
  ]

  type VisualPrompt = number;
  type AuditoryPrompt = number;

  const randomVisual = (): VisualPrompt => {
    return Math.floor(Math.random() * 8);
  }
  const randomAudio = randomVisual;

  const choose = (elements: Array<any>, count: number): Array<any> => {
    const values = [...elements];
    for (let i = 0; i < count; i++) {
      const unchosenElementCount = elements.length - i;
      const chosenIndex = Math.floor(Math.random() * unchosenElementCount);
      const tmp = values[i];
      values[i] = values[chosenIndex];
      values[chosenIndex] = tmp;
    }
    return values.slice(0, count);
  }

  const buildGameSequence = (nBack: number): {
    visualPrompts: Array<VisualPrompt>,
    auditoryPrompts: Array<AuditoryPrompt>,
    visualMatchSteps: Array<number>,
    auditoryMatchSteps: Array<number>,
  } => {
    const visualMatchSteps = choose(timesteps.slice(nBack), 6);
    const auditoryMatchSteps = choose(timesteps.slice(nBack), 6);

    let visualPrompts: Array<VisualPrompt> = [];
    let auditoryPrompts: Array<AuditoryPrompt> = [];

    for (let i = 0; i < timesteps.length; i++) {
      visualPrompts.push(randomVisual());
      auditoryPrompts.push(randomAudio());
    }

    for (let i = 0; i < timesteps.length; i++) {
      if (i >= nBack) {
        if (visualMatchSteps.some((visualMatchStep) => visualMatchStep === i)) {
          visualPrompts[i] = visualPrompts[i - nBack];
        }
        else {
          while (visualPrompts[i] === visualPrompts[i - nBack]) {
            visualPrompts[i] = randomVisual();
          }
        }

        if (auditoryMatchSteps.some((auditoryMatchStep) => auditoryMatchStep === i)) {
          auditoryPrompts[i] = auditoryPrompts[i - nBack];
        }
        else {
          while (auditoryPrompts[i] === auditoryPrompts[i - nBack]) {
            auditoryPrompts[i] = randomAudio();
          }
        }
      }
    }

    return {visualPrompts, auditoryPrompts, visualMatchSteps, auditoryMatchSteps};
  }

  const timesteps: Array<number> = [...Array(20 + nBack).keys()];
  const {
    visualPrompts,
    auditoryPrompts,
    visualMatchSteps,
    auditoryMatchSteps,
  } = buildGameSequence(nBack);

  const clickedVisual = $state(Array(timesteps.length).fill(false));
  const clickedAuditory = $state(Array(timesteps.length).fill(false));

  //vis_delays = [];
  //letter_delays = [];

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
      sounds[audioPrompt].play();

      if (activeBox !== null) {
        gridBoxes[activeBox].classList.remove('grid-box-active');
      }
      activeBox = visualPrompt;
      
      // Force a DOM reflow before adding the class again
      void gridBoxes[activeBox].offsetWidth;
      
      gridBoxes[activeBox].classList.add('grid-box-active');
      //playLetter(letter_idx);
    } else {
      //setActiveBox(-1);
      clearInterval(gameInterval);
      const result = makeGameResult();
      finishGame(result);
      //updateStats();
      //N = Math.max(1, N+calculateScore());
      //localStorage.setItem("N", N);
    }
  }

  const gameInterval = setInterval(gameTick, 2000);

  const visualClick = () => {
    if (gracePeriod) {
      clickedVisual[currentStep - 1] = true;
    }
    else {
      clickedVisual[currentStep] = true;
    }
  }

  const auditoryClick = () => {
    if (gracePeriod) {
      clickedAuditory[currentStep - 1] = true;
    }
    else {
      clickedAuditory[currentStep] = true;
    }
  }

  const makeGameResult = (): GameResult => {
    const visualTruePositives = visualMatchSteps.filter((step) => clickedVisual[step]).length;
    const auditoryTruePositives = auditoryMatchSteps.filter((step) => clickedAuditory[step]).length;
    return {
      visual: {
        truePositives: visualTruePositives,
        falseNegatives: visualMatchSteps.filter((step) => !clickedVisual[step]).length,
        falsePositives: clickedVisual.filter((step) => step).length - visualTruePositives,
      },
      auditory: {
        truePositives: auditoryTruePositives,
        falseNegatives: auditoryMatchSteps.filter((step) => !clickedAuditory[step]).length,
        falsePositives: clickedAuditory.filter((step) => step).length - auditoryTruePositives,
      }
    };
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
    >
      <img src="{eyeSvg}" class="game-button-image" alt="eye" />
    </button>

    <button
      id="auditory-button"
      class="game-button {clickedAuditory[currentStep] ? 'game-button-clicked' : ''}"
      onmousedown={auditoryClick}
      contouchstart={auditoryClick}
    >
      <img src="{speakerSvg}" class="game-button-image" alt="speaker" />
    </button>
  </div>

  <!-- Back button -->
  <svg id="#back" viewBox="0 0 50 50" width=50px height=50px style="position:absolute;left:0;top:0;">
    <rect style="opacity:0.0;" width=50px height=50px x=0 y=0 />
    <polygon points='17,25 33,35 33,15' style='fill:black;' />
  </svg>
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
  width: 100%;
  display: flex;
  margin: auto;
  justify-content: space-around;
  width: min(80vh, 90vw);
}

.game-button {
  margin: 10px;
  background-color: #d9d9d9;
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
