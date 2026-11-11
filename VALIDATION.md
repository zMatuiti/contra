# Validation — 2026-11-11

## Executed checks

- `npm run typecheck`: passed (TypeScript source/app check).
- `npm run build`: passed, Vite production build; includes demo, credits, workbench and standalone preview.
- `npm audit --audit-level=high`: 0 vulnerabilities at execution time.
- Initial development-server suite: 18/18 passed before the final public-token test was added.
- **Refined local production build: 23/23 passed**, no retries, installed Google Chrome via Playwright; `AURORA_BASE_URL=http://127.0.0.1:4173 node node_modules/@playwright/test/cli.js test`.
- Machine-readable final result: `design/production-test-results.json`.

## What the production suite proves

1. Official play/pause buttons start, stop and resume a real decoded MP4, with advancing currentTime and no page errors in that test.
2. Enter/K/M/arrows/Home/End operate playback, seeking and mute; visible focus outline is present.
3. Forward/back 10s, pointer timeline seeking and keyboard volume alter actual media state.
4. Keyboard speed menu changes playbackRate and its visible label.
5. Caption controls show real active VTT cues and can select Spanish via the settings menu.
6. Fullscreen enters/exits through official controls in Chrome.
7. A real ended event yields replay and restarts media.
8. A deliberately held network request shows buffering, then resumes real playback when released.
9. A 404 media response produces the official labeled alertdialog and error description.
10. Real playback drives canvas color sampling; pause stops motion and ambient off sets intensity to zero. Focus mode toggles.
11. Reduced-motion playback continues without atmospheric animation or recurring sampling.
12. Idle controls hide; keyboard focus restores them.
13. Desktop axe scan reports no violations for selected WCAG A/AA rule tags, and the shortcuts dialog closes with Escape and restores focus.
14. At 390px with emulated touch: play, seek, timeline tap, pause, at-least-44px pressed button geometry, no horizontal page overflow and axe scan pass.
15. A real decoded white/black H.264 fixture drives Adaptive Glass opacity .94/.86; an AAC test tone is decoded.
16. A simulated canvas SecurityError falls back without breaking actual playback.
17. Atmosphere presets and keyboard-operable intensity change the live settings.
18. 320px overflow check; workbench, standalone player preview and credits load.
19. External public theme tokens change the actual computed radius and timeline gradient.

The main aurora film is silent. Volume state is tested, and an audio-bearing fixture is decoded; acoustic listening quality is not established by this suite. The canvas security fallback uses an injected SecurityError, not a live third-party CORS failure.

## Visual evidence

`design/implementation/` contains desktop/mobile viewing-room captures plus loading, error, bright-video and dark-video states. Extra production captures show captions, mobile captions, speed menu and focus. Visual caption inspection caught the inherited offset being covered by the taller dock; caption clearance was raised to 160px and the mobile center control is hidden while captions are active, leaving the bottom play control available. Screenshots were visually inspected for frame/dock alignment and legibility, including the central play surface over white video; its dark base was strengthened after that inspection.

## Not verified

- Physical Android/iPhone touch, Safari/WebKit, Firefox, native iOS fullscreen and real device performance.
- Screen-reader interaction, all languages/RTL combinations, every shipped default shortcut, touch double-tap gestures, picture-in-picture, casting or AirPlay. Casting/AirPlay affordances were intentionally removed because no receiver integration is configured.
- A real third-party non-CORS source, HLS/Mux asset, Mux account upload or API credentials.
- A published Vercel origin, production HTTP range delivery, public project integration or contest submission.
- Full WCAG conformance, contest eligibility, dates, judging scores, bonus qualification or a guaranteed prize.

The Vercel configuration and local production build are ready; deployment remains a separate operation. No live hosting or commercial validation is implied by local browser evidence.


## Refinement pass

The follow-up pass preserves the dark cinematic design and adds a measured compact dock, time aligned with the timeline, 24px icons, clearer secondary text, speed control state display using official PlayerController, and a recoverable retry action. Ambient colors are spatially sampled, lifted for dark footage and smoothly interpolated; source changes reset fallback state and bfcache restoration reattaches the optional effects.

The local production suite now includes 23 scenarios, including actual retry after a failed source, compact Settings speed changes, and no center/dock collisions at 320/390/600/768px in square and 16:9 frames. Two rendered-halo tests validate preset spread/opacity and complete off. The standalone source composition also updates speed without the demo helper.

Under the same single local lab profile (150ms latency, 200,000 B/s download, CPU 4x), LCP changed from 5,360ms to 2,128ms, with CLS 0. This is not a field CWV claim. The mobile poster changed from 482,993 bytes to 11,906 bytes; desktop is 53,978 bytes. The old JPEG is outside deployed public assets, and the build no longer installs the ffmpeg tool used only for preparing media.

Historical audit findings in design/audit-2026-11-11.md predate these fixes. New deployment evidence will be recorded separately in DEPLOYMENT.md. Physical-device and cross-browser/screen-reader validation remain outstanding. Mux and real-site bonus qualification remain unverified; no score is guaranteed.
