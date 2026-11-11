# better-ui pass

Applied the requested `better-ui` skill to the viewing room and Aurora skin. Scope: Google Chrome desktop, emulated touch at 390px, 320px overflow and the playback states covered by the browser suite.

## Surfaces and concentric radii

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | src/video/skin.css | Flat inherited scaffold and mismatched dock geometry | Layered specular glass, 24px dock radius, 10px buttons / 14px vertical inset; mobile radius 16px with 6px inset | Concentric radius, deliberate surface depth |
| MEDIUM | apps/preview/demo.css | Generic small heading and dark rectangle | Original light ribbons, larger Aurora identity and illuminated frame corners | Establish a specific visual identity |
| MEDIUM | apps/preview/demo.css | 12px preset outer / 9px inner / 4px padding | 12px outer / 8px inner / 4px padding | Exact concentric selector geometry |

## Interaction and optical alignment

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| HIGH | src/video/skin.css | White-frame inspection exposed insufficient center-button contrast | Dark glass base below specular layers | Controls must remain visible over bright media |
| HIGH | src/video/skin.css | Generated caption offset was covered by the taller dock; center play overlapped mobile cues | 160px caption clearance; center control hides on narrow players while captions are active | Preserve subtitle legibility |
| HIGH | apps/preview/index.html | Horizontal code region had no keyboard focus access | Named, focusable region | Scrollable content must be reachable |
| MEDIUM | src/video/skin.css | Abrupt display swapping and .95 press scale | Play/pause/replay opacity/scale/blur transitions with cubic-bezier(.2,0,0,1), .96 press scale | Interruptible state motion and tactile feedback |
| MEDIUM | src/video/skin.css | 44px buttons scaled below 44px while held on touch | 46px controls, at least 44px at .96 scale | Preserve target geometry during press |
| LOW | src/video/skin.css | Geometrically centered triangle | 2px physical optical correction | Play triangle appears centered |

## Verification

Inspected desktop and mobile screenshots, focus outline, press geometry, paused/playing/ended states, speed/caption menus, loading, error, reduced motion, and white/black frame captures. Real playback was exercised in Chrome. Automated axe scans cover the initial desktop and mobile state; this is not a screen-reader audit. No browser Animations-panel replay at 10% speed, physical touch device, Safari, Firefox, Mux source or deployed Vercel origin was verified.

Approve for the inspected Chrome surfaces; no remaining HIGH finding in that inspected scope. Unverified environments remain listed in ../VALIDATION.md.
