const audioContext = new AudioContext();
const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

let audioBuffers: AudioBuffer[] = [];

export function setVolume(volume: number): void {
  gainNode.gain.value = volume;
}

export function loadSounds(urls: string[]): void {
  Promise.all(
    urls.map(url =>
      fetch(url)
        .then(r => r.arrayBuffer())
        .then(buf => audioContext.decodeAudioData(buf))
        .catch(err => {
          console.warn('Failed to load sound:', url, err);
          return null;
        })
    )
  ).then(buffers => {
    audioBuffers = buffers.filter((b): b is AudioBuffer => b !== null);
  });
}

export function playSound(index: number): void {
  audioContext.resume();
  const buffer = audioBuffers[index];
  if (!buffer) return;
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(gainNode);
  source.start(0);
}
