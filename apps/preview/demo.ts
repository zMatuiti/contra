import { createAuroraPlayer } from '../../src/video/create-player';
import { attachLivingAurora } from '../../src/video/living-aurora';

const { player, video } = createAuroraPlayer({
  src: './media/aurora.mp4', poster: matchMedia('(max-width:760px)').matches ? './media/aurora-poster-640.webp' : './media/aurora-poster-1280.webp', title: 'Beyond the horizon',
  tracks: [{ src: './media/aurora-en.vtt', language: 'en', label: 'English' }, { src: './media/aurora-es.vtt', language: 'es', label: 'Español' }],
});
document.querySelector('#player')!.append(player);
document.querySelectorAll('.player-placeholder, .player-boot').forEach(element => element.remove());
const stage = document.querySelector<HTMLElement>('#stage')!;
let aurora = attachLivingAurora(stage, video);
const intensity = document.querySelector<HTMLInputElement>('#intensity')!;
const ambientToggle = document.querySelector<HTMLButtonElement>('#ambient-toggle')!;
const presetDescriptions: Record<string, string> = { '25': 'Subtle · A quiet edge of light.', '55': 'Balanced · A soft halo.', '90': 'Vivid · A wide wash of color.' };
const apply = () => {
  const enabled = ambientToggle.getAttribute('aria-pressed') === 'true';
  document.querySelector('output')!.textContent = `${intensity.value}%`;
  document.querySelector('#preset-description')!.textContent = enabled ? (presetDescriptions[intensity.value] || `Custom · ${intensity.value}% ambient intensity.`) : 'Ambient light is off.';
  aurora.setIntensity(ambientToggle.getAttribute('aria-pressed') === 'true' ? Number(intensity.value) : 0);
  document.querySelectorAll<HTMLButtonElement>('[data-intensity]').forEach(button => button.setAttribute('aria-pressed', String(enabled && button.dataset.intensity === intensity.value)));
};
document.querySelectorAll<HTMLButtonElement>('[data-intensity]').forEach(button => button.addEventListener('click', () => {
  intensity.value = button.dataset.intensity!;
  ambientToggle.setAttribute('aria-pressed', 'true');
  apply();
}));
intensity.addEventListener('input', apply);
ambientToggle.addEventListener('click', () => { ambientToggle.setAttribute('aria-pressed', String(ambientToggle.getAttribute('aria-pressed') !== 'true')); apply(); });
document.querySelector('#focus-toggle')!.addEventListener('click', (event) => {
  const active = document.body.classList.toggle('focus-mode');
  (event.currentTarget as HTMLElement).setAttribute('aria-pressed', String(active));
});
const dialog = document.querySelector<HTMLDialogElement>('#shortcuts')!;
document.querySelector('#shortcuts-open')!.addEventListener('click', () => dialog.showModal());
document.querySelector('#shortcuts-close')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog && (event.offsetX < 0 || event.offsetY < 0 || event.offsetX > dialog.clientWidth || event.offsetY > dialog.clientHeight)) dialog.close(); });
let toastTimer: ReturnType<typeof setTimeout>;
document.querySelector('#copy-code')!.addEventListener('click', async () => {
  const toast = document.querySelector('#toast')!;
  try { await navigator.clipboard.writeText(document.querySelector('#integration-code')!.textContent!); toast.textContent = 'Example copied. Full integration is in README.md.'; }
  catch { toast.textContent = 'Select and copy the example, or open README.md.'; }
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.textContent = ''; }, 4000);
});
window.addEventListener('pagehide', () => aurora.destroy());
window.addEventListener('pageshow', event => { if (event.persisted) { aurora = attachLivingAurora(stage, video); apply(); } });
