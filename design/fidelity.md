# Visual review — Aurora Skin

Reference: `reference/aurora-mockup.png`, user supplied. This is an original implementation inspired by a concept image, with the later requested premium redesign. It is not represented as a pixel-exact reproduction. No popup DOM or reference state recordings were available to measure.

| Surface | Implementation | Evidence / status |
| --- | --- | --- |
| Identity | Large cyan Aurora / violet serif Skin wordmark, original SVG light ribbons | desktop.png; intentional creative evolution requested by user |
| Main frame | 28px frame with cyan and violet illuminated corners | desktop.png; observed |
| Frosted dock | Dark adaptive opacity, specular inset highlight, 24px dock radius | desktop.png, bright-video.png, dark-video.png; observed |
| Timeline | Cyan/violet true seek progress, buffer layer, white thumb | dark-video.png shows full ended progress; pointer and keyboard tested |
| Center play | Circular 88px glass lens, 46px dock controls, optically shifted play triangle | desktop.png; color scrim strengthened after white-frame inspection |
| Mobile | Square cinema viewport, two-row 46px controls, volume mute, full touch track | mobile.png, mobile-tested.png; 390px touch-tested and 320px overflow tested |
| Menus / error / buffering | Official component states, dark glass surfaces, 44px+ menu rows | error.png, loading.png; speed, captions and keyboard interaction tested |
| Ambient | External sampled-color halo, intensity presets, reduced-motion static fallback | Real playback and fallback tests; no audio-reactivity claim |

Deliberate differences from mockup: no drawn phone, callout labels or nonfunctional casting/favorite buttons. Different licensed media and poster. System fonts and official Scaffold icons rather than traced illustration glyphs. Required focus/error states are derived from the palette because the reference does not show them. The original control ordering was adjusted in markup, with focus order following visual order.

Light and dark footage were checked with a real decoded white/black video fixture, including its quiet audio track. A static dark scrim keeps the dock readable when effects are disabled. Screenshots alone do not establish full WCAG conformance. Browser interaction and axe results are documented in ../VALIDATION.md.
