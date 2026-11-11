import '@videojs/html/video/player';
import './skin';
import template from './skin.html?raw';

export interface AuroraTrack {
  src: string;
  language: string;
  label: string;
}
export interface AuroraPlayerOptions {
  src: string;
  poster?: string;
  title?: string;
  tracks?: AuroraTrack[];
}

let sequence = 0;
/** Mount this official Video.js player, then optionally attach Living Aurora. */
export function createAuroraPlayer(options: AuroraPlayerOptions) {
  const player = document.createElement('video-player');
  const id = `aurora-${++sequence}-`;
  // Scope every generated popup/trigger reference for multiple instances.
  const markup = template.replace(/(?:vjs-[\w-]+|aurora-speed-menu)/g, value => id + value);
  player.innerHTML = markup.replace('<!-- Add a compatible media component here. -->', '<span data-media-mount></span>');
  if (options.poster) player.setAttribute('poster', options.poster);
  if (options.title) player.setAttribute('content-title', options.title);
  const container = player.querySelector('media-container')!;
  container.setAttribute('aria-label', options.title || 'Media player');
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.preload = 'metadata';
  video.playsInline = true;
  video.src = options.src;
  if (options.poster) video.poster = options.poster;
  for (const item of options.tracks ?? []) {
    const track = document.createElement('track');
    track.kind = 'captions'; track.src = item.src; track.srclang = item.language; track.label = item.label;
    video.append(track);
  }
  player.querySelector('[data-media-mount]')!.replaceWith(video);
  return {
    player, video,
    destroy() { video.pause(); video.removeAttribute('src'); video.load(); player.remove(); },
  };
}
