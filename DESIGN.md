---
name: Aurora Skin
colors:
  canvas: "#070a13"
  surface: "#141827"
  cyan: "#64e1f8"
  violet: "#b191fa"
  ink: "#f0f2fa"
  muted: "#a4aec5"
typography:
  display:
    fontFamily: Segoe UI
    fontSize: 88px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.03em
  data:
    fontFamily: Cascadia Code, monospace
    fontSize: 12px
    fontWeight: 400
rounded:
  player: 28px
  controls: 24px
spacing:
  unit: 4px
  panel: 20px
---
# Aurora Skin
## Overview
A cinema-first Video.js skin, based on the supplied mockup. The signature is a low-cost cyan/violet atmospheric halo reacting to playback and pointer position.
## Colors
Dark opaque-enough control surfaces keep white icons readable across bright and dark footage. Cyan and violet are the supplied brand accents.
## Typography
System font stack inside the player; no font downloads. Reference font is unknown. Monospace utility labels outside the player; secondary functional labels are at least 12px.
## Layout
The demo is a restrained viewing room: navigation, editorial title, large player, compact atmosphere toolbar, integration details. Mobile preserves the player and uses a compact control row and a dedicated timeline/time row.
## Elevation & Depth
Glass is concentrated in the control dock, menu and center play button. Ambient light lives behind the player, never over the film.
## Shapes
28px frame, 24px dock (16px on mobile), 10px buttons, circular center play.
## Components
Use official Video.js state, controls, sliders, menu, captions, gestures, error dialog and announcements. Custom code controls appearance, ambient frame sampling and optional instance-safe mounting; official Video.js components own all media interactions.
## Do's and Don'ts
No fake controls, cast affordances without a receiver integration, or playback claims without evidence. Reduced motion removes atmospheric animation and pointer reactivity.
