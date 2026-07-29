---
status: complete
generated_by: brand-init (solo-user, derived from repo identity)
---

# video-direction — Motion Brand System

> The motion brand for video-direction itself — the free Claude Code plugin that directs
> AI-made brand videos. This file is the source of truth for every video the plugin makes
> about the plugin. The house look is a gallery wall on purpose: a quiet neutral-dark room
> whose only job is to frame the work hung on it. When this brand appears beside the brands
> it directs, it must recede so they read as the subjects.

## Constants (every video keeps these)

- **World.** Warm near-black charcoal `#17130E` — a lit gallery wall, faint warmth so a
  framed clip of white, cream, or paper sits on it without a cold seam. Second world: none.
  One room, held; the color enters only through the framed exhibits.
- **Accent.** Bone `#F4EFE6` is THE accent — carried by value, not hue. On the charcoal
  wall the single brightest bone element is the meaning (the turn word, the install line),
  and everything else steps down to a muted warm gray. The house owns NO saturated hue on
  purpose, so the brands it frames own all the color. Scarcity rule: Strict — exactly one
  bone accent element per frame; the eye always has one place to land.
- **Type.** Headings in a restrained editorial serif; labels, placards, and the install
  line in a mono. Serif for the house's own sentences, mono for anything that reads as a
  caption or code. Headlines short, no orphan words.
- **Texture.** A faint warm film grain on the wall, matched to the world — the canon's warm
  textured field. Never busy; it reads as a lit surface, not a pattern.
- **Logo / wordmark.** The wordmark `video-direction` set lowercase in the mono, in bone.
  No letter carries a separate accent, so no logo-exemption applies. No icon, no mascot.
  Every video ends on the wordmark plus the install line.
- **Register.** Quiet, exact, deferential — the frame, not the picture. It states the
  problem plainly and hands the floor to the work. Banned words: no "revolutionary", no
  "game-changing", no "seamless", no "slop" on screen (say "looks the same").

## Styles / roster (pick by message type)

The five archetypes, tuned to the gallery house. The neutral spec (skeleton, audio default,
length, variant axes, kind) lives in
`skills/video-direction/references/style-archetypes.md`.

1. **Launch Film** — announcing the plugin or a milestone. 20–45s, charcoal-wall cold-open
   → the problem it answers → the work revealed in frames → one proof → wordmark plus
   install line resolve; eased hero push-in on the reveal, one bone word making the turn,
   the framed exhibits carrying all the color. [narrative]
2. **Mechanism Explainer** — how the staged process works, step by step. 20–45s, charcoal
   wall, one placard per stage (treatment → style → boards → styleframes → build → QC), a
   single bone marker tracing the active stage, a held frame at each so the eye can read it.
   [narrative]
3. **Kinetic Essay** — the thesis that nothing forces a look decision. 15–30s, mono/serif
   kinetic type on the wall, one bone word per beat carrying the turn, cuts on the track's
   grid. [narrative]
4. **Announcement Card** — a date, a version, or one CTA on a single held frame. ≤12s,
   charcoal wall, wordmark top → the one fact in serif → tidy mono detail list → CTA / date
   landing LAST in bone. One charm: a single framing rule drawing itself once. [static]
5. **Content Hero** — a line, stat, or a maker's note repurposed for the feed. 8–20s,
   hero-scale serif first line on the wall, one bone accent on the load-bearing word, a
   subtle wordmark frame that never competes. Reads with sound off. [static]

## Selection rules (when the message type is ambiguous)

- Announcement / date / version / one CTA → **Announcement Card**.
- How the process works / steps → **Mechanism Explainer**.
- New release / launch / milestone → **Launch Film**.
- A take / argument / POV line → **Kinetic Essay**.
- A post / quote / stat repurposed for the feed → **Content Hero**.
- Default when still unclear → **Announcement Card**.

## Audio

- Default bed: a quiet, low, unhurried instrumental — a gallery-room hum, never a track that
  performs. VO: type-led, no VO by default; a low VO is allowed on a Launch Film when it
  genuinely helps.
- **Silent permitted?** Yes — the type and the framed exhibits carry the piece; a silent
  render is correct for muted-autoplay feeds. Render silent and note it; the hook lands
  inside 2 seconds either way. This line wins over any general audio floor.

## Delivery

- Aspect / size: master widescreen 1920×1080 (16:9) for the README / lab hero; a 1:1
  1080×1080 cut for LinkedIn and X native. Master ≤ ~2.5 MB target for the site hero; feed
  cut ≤ 10 MB. Cut variants from the master, never author them separately.
- Must read with sound off; captions or on-screen type where words carry the meaning; the
  2-second hook rule applies to the feed cut. Per-destination specs in `delivery-matrix.md`.
