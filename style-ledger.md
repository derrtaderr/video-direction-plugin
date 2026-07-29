# Style ledger

One row per shipped video — the memory that keeps this brand's videos from repeating
themselves. The `video-direction` skill reads the recent rows at stage 2 (style direction)
to rotate the variant axes, and appends one row at QC (stage 6) after a render passes.

| Date | Video | Tier | Style | Audio | Camera | Hero techniques | New capabilities tried | Destinations | Perf note |
|---|---|---|---|---|---|---|---|---|---|
| 2026-07-28 | launch-film | flagship | Launch Film | silent | cut + eased push-in per exhibit (×3), eased pull-back to wide | Gallery-frame triptych with the three exhibit videos as framework-owned playback; spotlight lighting (each exhibit lit only on its beat, all three relit at the thesis); one bone value-accent per frame; Playfair Display / JetBrains Mono | First media-playback piece (video-in-frame exhibits, data-media-start trims); two-canvas variant authoring (16:9 master + recomposed 1:1, not a crop); pixel-hacker sprite integration (stepped pose swap, canonical sheet) | README/lab hero (16:9), LinkedIn native (1:1), X native (1:1) | Check clean (0 err / 0 warn, 16/16 AA), hook readable by 1.9s; QC stills caught an evidence line over a light exhibit, fixed via spotlight logic. Rev 2 post-review: Steepwell exhibit replaced with the recipe-book card (directed via the returning-brand path, video-work/steepwell-recipe-card) after "how is that a warm cookbook?"; pixel-hacker maker's mark added at the resolve (point pose + emitted install-line underline; house mascot policy stays none). Site hero re-encoded CRF 26 ≤2.5 MB for the lab page |

**Column definitions:**

- **Date** — ship date (`YYYY-MM-DD`).
- **Video** — the piece's slug (its `video-work/<slug>/` folder name).
- **Tier** — importance tier (flagship / routine / test).
- **Style** — which archetype from the roster.
- **Audio** — silent / bed / VO / music (the render's actual audio mode).
- **Camera** — the camera moves used (push-in, pull-back reveal, drift, target-zoom), or
  `none` for a held-camera piece.
- **Hero techniques** — the signature moves and notable craft; what made it work.
- **New capabilities tried** — anything used for the first time here.
- **Destinations** — where it shipped (the rows from the delivery matrix).
- **Perf note** — the QC or performance read after it went out; a one-line gut check.

## Observations

<!-- Standing notes the style pick should weigh: what's proven, what's still untried, any
palette/lint quirks to treat as noise, styles never shipped yet. Empty until there is
something worth carrying forward. -->

- The house is a gallery frame: it holds NO saturated hue by design, so its videos vary by
  value, framing, and layout, never by a new brand color. Watch that a repeat piece does
  not reach for color to feel different — vary the framing and the type instead.

## Capability watch

<!-- The rendering capabilities baselined (version, registry item count) and what to
re-check each retro. Empty until the first ship. -->
