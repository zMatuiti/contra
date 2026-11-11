# Reload / cold-boot fix — 2026-11-11

## Reproduction and root cause

A cache-disabled local preview load at 300ms network latency, 100,000 B/s download and CPU 4x reproduced the reported white page and oversized background graphic. During the first 181 sampled animation frames, both the HTML and body background were transparent and the decorative SVG remained in document flow, displacing the actual interface.

The demo stylesheet was imported through the player JavaScript entry. In development, that meant its styles were injected only after the component module graph downloaded. The production build already emitted stylesheet links and did not reproduce white body frames in the initial public test, but had no explicit critical dark-canvas fallback and showed an empty player mount until JavaScript initialized.

## Fix

- Load demo.css directly from the document head, independently of the player module graph.
- Define the dark color scheme/canvas and bound the decorative SVG with a small inline critical style before external resources.
- Render the existing responsive poster and a small accessible boot status in the initial HTML. It has no simulated playback controls and is removed when the real Video.js player mounts.
- Keep the existing skin, imagery, typography and Video.js state unchanged.

## Evidence

The same constrained local check after the fix recorded zero transparent-canvas frames in the sampled first 181 frames. The SVG was absolutely positioned at the top and no longer pushed content down. `boot-dev-after.json` records the frames; `implementation/cold-boot-delayed-player.png` shows the real initial HTML while all player scripts are intentionally held.

Two regression scenarios cover delayed scripts followed by real playback, and three consecutive reloads with the official player restored. Full source/production and published-origin results are recorded in VALIDATION.md and the test result artifacts. This is Chrome desktop/emulated-touch evidence, not a Safari or physical-device certification.
