import { createPlayer, UIElement, selectPlaybackRate, type PropertyValues } from '@videojs/html';
import { videoFeatures } from '@videojs/html/video';

const { PlayerController } = createPlayer({ features: videoFeatures });

/** Text-only state display; the official radio group owns all speed actions. */
class AuroraSpeedValue extends UIElement {
  readonly #rate = new PlayerController(this, selectPlaybackRate);

  update(changed: PropertyValues) {
    super.update(changed);
    const rate = this.#rate.value?.playbackRate ?? 1;
    this.textContent = `${rate === 1 ? '1.0' : rate}×`;
  }
}

if (!customElements.get('aurora-speed-value')) customElements.define('aurora-speed-value', AuroraSpeedValue);
