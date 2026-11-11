# Reference and implementation specification
Reference: user-provided Aurora Skin mockup, saved in reference/aurora-mockup.png. It is concept artwork, not a DOM that can be measured.

Observed: dark cinema frame, frosted bottom dock, cyan-to-violet timeline, white thumb, centered circular play, upper-left title, rounded buttons, mobile layout.
Derived: system fonts, 46px controls (at least 44px during 0.96 press scale), 24px icons from one official Scaffold family, 28px frame radius, 16px dock radius, 16px dock padding, 2px cyan focus ring with 3px offset, 240px menu, 8px tooltip gap. Menus, loading and error visuals are derived because not shown in the reference.

Source order: title, centered play, timeline, play, -10, +10, mute, volume, time, speed menu, captions, fullscreen. Mobile keeps 44px targets and volume mute, with volume slider omitted when space is limited. Speed uses the Video.js radio menu. Captions use the official toggle and track selection in settings.

Living Aurora: CSS-only two-color external glow, opacity driven by intensity, playback state, time progress and normalized pointer position; a 32-pixel canvas sampled at most twice per second while playing; no audio processing. Motion stops while paused, offscreen, hidden or reduced motion. Frame color sampling stops when paused, hidden, offscreen or reduced motion; tainted CORS canvas falls back to cyan/violet.

Reference differences by design: surrounding callouts and illustrated phone are presentation artwork, excluded from functional player. Casting, favorites and information controls excluded because no corresponding service was requested. Real video, not the reference's mountain artwork. Source media and poster are independently credited. Keyboard and error states are retained even though absent in artwork.
