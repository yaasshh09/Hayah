# Hyperframes Composition Brief: Hayati

## Objective
A 2:30 hackathon demo film for Hayati (ADU Software Engineering Innovation Cup 2K26, theme "Engineering Tomorrow's Families: Software Solutions for Connected and Caring UAE") that explains every feature with heavy motion design, a music bed, and dense SFX.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape, 1920x1080, 30fps
- Duration: 150s (user override of the 15-25s default)

## Source Material
- Project root: repo root
- Primary files read: README.md, pages/landing.html, signin, dashboard, calendar, finance, AI, settings, assets/preferences.js, src/routes
- Real UI: viewport screenshots in `composition/assets/shots/` captured from the running app (light, dark, child, every finance tab)
- Family avatars: SVG generator copied from pages/landing.html
- Copy that must appear verbatim:
  - "your family, planned together."
  - "A calendar that knows what Eid will cost."
  - "Kids see pocket money. Parents see everything."
  - "An intelligent co-pilot for family life."
  - "Make room for what matters."
  - "One family. One clearer plan."

## Creative Direction
- Tone: app-store with cinematic drops; warm UAE family launch film
- Captions in first person (my voice as the builder), no em dashes, no narration
- Avoid generic SaaS language, abstract filler, redesigning the product

## Visual Identity
- Canvas #f1eff5 / #fff mesh with lavender #9f8fe0, gold #e8b765, mint #7fe0c3 blobs; ink #111; muted #85858c
- Bricolage Grotesque display, Manrope body, Reem Kufi Arabic (local woff2 in assets/fonts)

## Storyboard
See `brag-plan.md`. Twelve sub-composition scenes, cuts on bar lines of the 120 BPM track.

## Audio
- Music: assets/music/bgm.mp3 (happy-beats vol 1) at 0.32, fade 146-150s
- Cue locks: 16.0 logo slam, 95.85 child switch, 119.84 AI answer, 143.8 end card
- Audio-reactive: bass and level per frame in assets/audio-data.js drive background glow
- SFX: Kenney CC0 set copied into assets/sfx plus synthesized whoosh, swish, riser, boom, sparkle, pop (ffmpeg); placed inside each scene with scene-local times
