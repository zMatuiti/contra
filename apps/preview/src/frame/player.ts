import '@videojs/html/video/player';

import '@/video/skin';
import skinTemplate from '@/video/skin.html?raw';

// What the preview plays. Change these to try the skin with your own media; any Mux or HLS URL works.
const SRC = './media/aurora.mp4';
const POSTER = './media/aurora-poster-1280.webp';
/** Chapters for the time slider, served from `apps/preview/public`. */
const CHAPTERS = './cosmic-dawn-chapters.vtt';

const MEDIA_PLACEHOLDER = '<!-- Add a compatible media component here. -->';

export function createPlayer(): HTMLElement {
  const player = document.createElement('video-player');
  player.setAttribute('poster', POSTER);

  player.innerHTML = skinTemplate.replace(
    MEDIA_PLACEHOLDER,
    `<video src="${SRC}" playsinline crossorigin preload="metadata"><track kind="captions" label="English" srclang="en" src="./media/aurora-en.vtt"><track kind="chapters" label="English" srclang="en" src="${CHAPTERS}" default></video>`
  );

  return player;
}
