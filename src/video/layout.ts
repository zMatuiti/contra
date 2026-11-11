import { createPlayer, UIElement, selectError, selectPlayback } from '@videojs/html';
import { videoFeatures } from '@videojs/html/video';

const { PlayerController } = createPlayer({ features: videoFeatures });

/** Measures the real dock so captions and duplicate center controls never collide. */
class AuroraLayout extends UIElement {
  readonly #error = new PlayerController(this, selectError);
  readonly #playback = new PlayerController(this, selectPlayback);
  #observer?: ResizeObserver;
  #abort?: AbortController;

  connectedCallback() {
    super.connectedCallback();
    this.#abort = new AbortController();
    const root = this.closest<HTMLElement>('media-container');
    const dock = root?.querySelector<HTMLElement>('.video-controls-bottom');
    if (!root || !dock) return;
    const measure = () => {
      const height = root.clientHeight;
      const bottom = parseFloat(getComputedStyle(dock).bottom) || 0;
      const clearance = dock.offsetHeight + bottom + 16;
      root.style.setProperty('--aurora-caption-clearance', `${clearance}px`);
      const crowded = height / 2 + (root.clientWidth < 600 ? 29 : 44) + 12 > height - dock.offsetHeight - bottom;
      if (crowded && root.querySelector('.video-controls-center')?.contains(document.activeElement)) root.querySelector<HTMLElement>('.video-controls-start media-play-button')?.focus();
      root.toggleAttribute('data-center-crowded', crowded);
      root.toggleAttribute('data-short-frame', height < 240);
    };
    this.#observer = new ResizeObserver(measure);
    this.#observer.observe(root);
    this.#observer.observe(dock);
    measure();
    root.querySelector('[data-aurora-retry]')?.addEventListener('click', () => {
      this.#error.value?.dismissError();
      root.querySelector('video')?.load();
      void this.#playback.value?.play().catch(() => { /* Media errors reopen the official dialog. */ });
    }, { signal: this.#abort.signal });
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#abort?.abort();
    super.disconnectedCallback();
  }
}

if (!customElements.get('aurora-layout')) customElements.define('aurora-layout', AuroraLayout);
