<script lang="ts">
  import type { Settings } from './types';
  import { setVolume } from './audio';

  let { settings, updateSettings, nBack, setNBack, goBack }: {
    settings: Settings,
    updateSettings: (s: Settings) => void,
    nBack: number,
    setNBack: (n: number) => void,
    goBack: () => void,
  } = $props();

  let volumePercent = $state(Math.round(settings.volume * 100));

  const onVolumeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    volumePercent = Number(target.value);
    const volume = volumePercent / 100;
    setVolume(volume);
    updateSettings({ ...settings, volume });
  }

  const decreaseN = () => {
    if (nBack > 1) setNBack(nBack - 1);
  }

  const increaseN = () => {
    setNBack(nBack + 1);
  }
</script>

<div id="settings-screen">
  <button class="back-button" onclick={goBack} aria-label="Go back">
    <svg viewBox="0 0 50 50" width="30" height="30">
      <polygon points='17,25 33,35 33,15' style='fill:white;' />
    </svg>
  </button>

  <h2>Settings</h2>

  <div class="setting">
    <label for="volume-slider">Volume: {volumePercent}%</label>
    <input
      id="volume-slider"
      type="range"
      min="0"
      max="100"
      value={volumePercent}
      oninput={onVolumeChange}
    />
  </div>

  <div class="setting">
    <span>N-Back Level</span>
    <div class="n-selector">
      <button class="n-button" onclick={decreaseN} disabled={nBack <= 1} aria-label="Decrease N">-</button>
      <span class="n-value">{nBack}</span>
      <button class="n-button" onclick={increaseN} aria-label="Increase N">+</button>
    </div>
  </div>
</div>

<style>
  #settings-screen {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 30px;
  }

  h2 {
    margin: 0;
    font-size: 20pt;
  }

  .back-button {
    position: absolute;
    left: 0;
    top: 0;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .setting {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font-size: 14pt;
  }

  #volume-slider {
    width: min(80vw, 300px);
    accent-color: #fc9;
  }

  .n-selector {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .n-button {
    width: 40px;
    height: 40px;
    font-size: 20pt;
    background: #222;
    color: #eee;
    border: 2px solid #eee;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .n-button:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .n-value {
    font-size: 20pt;
    min-width: 30px;
    text-align: center;
  }
</style>
