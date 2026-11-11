/** Decoration only. Playback and accessibility remain owned by Video.js. */
export function attachLivingAurora(host: HTMLElement, video: HTMLVideoElement) {
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let intensity = 55;
  let visible = true;
  let frame = 0;
  let sampleTimer = 0;
  let samplingUnavailable = false;
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 4;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  // Sample only 32 pixels, twice per second. Cross-origin media without CORS
  // falls back to the brand palette; no video-sized canvas or audio processing.
  const sample = () => {
    if (!context || samplingUnavailable || video.readyState < 2) return;
    try {
      context.drawImage(video, 0, 0, 8, 4);
      const { data } = context.getImageData(0, 0, 8, 4);
      let luminance = 0;
      for (let i = 24; i < 32; i++) luminance += (.2126 * data[i * 4] + .7152 * data[i * 4 + 1] + .0722 * data[i * 4 + 2]) / 255;
      host.style.setProperty('--aurora-glass-alpha', luminance / 8 > .55 ? '.94' : '.86');
      for (const name of ['left', 'right'] as const) {
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < 32; i++) { if ((i % 8 < 4) === (name === 'left')) { r += data[i * 4]; g += data[i * 4 + 1]; b += data[i * 4 + 2]; } }
        const count = 16;
        const channels = [r / count, g / count, b / count];
        const peak = Math.max(...channels);
        // Lift dark footage into useful ambient light, capped below white.
        const fallback = name === 'left' ? [55, 204, 233] : [164, 123, 245];
        const color = peak < 12 ? fallback : channels.map(channel => Math.round(Math.min(215, channel * Math.min(3, 195 / peak))));
        host.style.setProperty(`--aurora-${name}`, `rgb(${color.join(' ')})`);
      }
      host.dataset.auroraSampling = 'active';
    } catch {
      samplingUnavailable = true;
      host.dataset.auroraSampling = 'fallback';
      clearInterval(sampleTimer);
      sampleTimer = 0;
    }
  };
  const update = () => {
    const playing = !video.paused && !video.ended && !document.hidden && visible;
    host.dataset.auroraMotion = String(playing && !motion.matches && intensity > 0);
    const shouldSample = playing && !motion.matches && intensity > 0 && !samplingUnavailable;
    if (shouldSample && !sampleTimer) { sample(); if (!samplingUnavailable) sampleTimer = window.setInterval(sample, 500); }
    if (!shouldSample && sampleTimer) { clearInterval(sampleTimer); sampleTimer = 0; }
    host.dataset.auroraState = video.ended ? 'ended' : video.paused ? 'paused' : 'playing';
    host.style.setProperty('--aurora-opacity', String(intensity / 100));
    host.style.setProperty('--aurora-energy', playing ? '1' : '.82');
    host.style.setProperty('--aurora-spread', `${Math.round(8 + intensity * .42)}px`);
    host.style.setProperty('--aurora-progress', String(video.duration ? video.currentTime / video.duration : 0));
  };
  for (const event of ['play', 'pause', 'ended', 'timeupdate']) video.addEventListener(event, update, options);
  video.addEventListener('emptied', () => { samplingUnavailable = false; delete host.dataset.auroraSampling; host.style.removeProperty('--aurora-left'); host.style.removeProperty('--aurora-right'); update(); }, options);
  const sampleStill = () => { if (visible && !document.hidden && !motion.matches && intensity > 0) sample(); };
  video.addEventListener('seeked', sampleStill, options);
  document.addEventListener('visibilitychange', update, options);
  motion.addEventListener('change', update, options);
  host.addEventListener('pointermove', (event) => {
    if (motion.matches || event.pointerType === 'touch' || frame || !visible || !intensity) return;
    frame = requestAnimationFrame(() => {
      const box = host.getBoundingClientRect();
      host.style.setProperty('--aurora-x', `${Math.round((event.clientX - box.left) / box.width * 100)}%`);
      frame = 0;
    });
  }, options);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
  observer.observe(host);
  update();
  return {
    setIntensity(value: number) { intensity = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0)); update(); },
    destroy() { abort.abort(); observer.disconnect(); cancelAnimationFrame(frame); clearInterval(sampleTimer); },
  };
}
