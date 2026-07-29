# Boardomatic — launch-film

Beat table. Kind is narrative, so the **story-spine check** runs (every beat a named role;
consecutive beats join with "but" or "therefore", never "and then"). The three exhibit
videos appear as framed clips inside the composition (framework-owned media playback),
punched into on their evidence beats. Master 16:9 1920×1080, ~42s, silent/type-led.

| Start | Role | Link in | Content |
|---|---|---|---|
| 0.0s | setup (hook) | — | Warm charcoal wall, faint grain. Bone serif hero type slams in by ~0.4s and is readable by 1s: **"Every AI video looks the same."** A small mono line fades under it at ~2.0s: `you typed "make me a launch video."` Hook is landed inside 2s. |
| 4.0s | turn | therefore | Hero line clears. One bone line lands: **"Nothing forced a look decision."** The word **"decision"** is the single brightest bone accent; the rest steps to muted gray. This is the reason nobody names. |
| 7.5s | transfer | therefore | The wall reveals three empty rounded frames, hung like a gallery (staggered in, left to right). Bone line above: **"So here are three brands. None of them designers."** Sets up the exhibits. |
| 11.0s | evidence 1 | but (each is different) | Cut + eased push-in on frame 1. The **Ledgerline** clip plays inside it (clean white studio, geometric sans, green accent). Mono placard: `Ledgerline · bookkeeping app`. Bone line at dwell (~2.5s hold): **"It asked to feel clean, not techy."** |
| 17.5s | evidence 2 | but | Hard cut to frame 2, eased push-in. The **Steepwell** clip plays (warm paper, editorial serif, amber accent). Mono placard: `Steepwell · loose-leaf tea`. Bone line: **"It asked to feel like a well-worn recipe book."** |
| 24.0s | evidence 3 | but | Hard cut to frame 3, eased push-in. The **Fern & Field** clip plays (warm paper, serif, fern-green accent, seedling charm). Mono placard: `Fern & Field · garden supply`. Bone line: **"It asked to sound like a good garden-center employee."** |
| 30.0s | thesis | therefore | Pull back — the three framed clips sit together on the wall, still playing small. Bone line: **"One free plugin directed all three, each in its own look."** Mono sub: `a 15-minute brand interview, then every video ships in your look instead of the model's average.` |
| 36.5s | resolve | therefore | The frames dim to the wall. Wordmark **`video-direction`** in bone mono, centered. Install line (single bone accent): `/plugin marketplace add derrtaderr/video-direction-plugin`. Sub line: **free · your keys · your machine**. Holds to 42s. |

## Story-spine check

- Every beat carries a named role: setup → turn → transfer → evidence×3 → thesis →
  resolve. No floating beats.
- Connectors read as a chain, no "and then": hook → **therefore** the reason (turn) →
  **therefore** here are three (transfer) → **but** each is different (evidence 1) → **but**
  (evidence 2) → **but** (evidence 3) → **therefore** one system did all three (thesis) →
  **therefore** here is how you install it (resolve). Holds.
- The argument is compressed, not just the best lines: each evidence beat keeps its bridge
  (the placard names the brand, the bone line names the plain-language fact). Pull either
  and the beat floats, so both stay.
- Positioning language matches `gtm.md` §1: what it is (free Claude Code plugin, the
  director, 15-minute interview, your look vs the model's average — thesis beat + sub),
  against what (one-shot prompting "make me a launch video" — hook), the reader (the builder
  who ships and posts launch videos — implied by the install resolve).

## Timing critic

- **Hook inside 2s:** yes — hero type readable by ~1s, the "make me a launch video" mono
  line lands at 2.0s. Pass.
- **Every beat earns its seconds:** hook 4.0s (two lines), turn 3.5s (one line + accent),
  transfer 3.5s (frames stagger in + one line), evidence 6.5 / 6.5 / 6.0s (each needs the
  clip to move + placard + line, ~2.5s read floor met), thesis 6.5s (two lines + pull-back),
  resolve 5.5s (wordmark + install line hold). No beat is starved; no beat idles.
- **Cuts land on beat boundaries:** the three evidence beats are hard cuts between framed
  works (the chosen reveal axis); each cut is a beat boundary. Silent piece, so no music
  grid to honor, but the cuts are still on the argument's boundaries, not mid-line.
- **Total fits budget:** 42.0s ≤ 45s master. Pass.
- **Story spine holds:** confirmed above.

## Audio note

Silent per `motion-brand.md` (silent permitted, type-led). Render silent; the on-screen
type and the framed exhibits carry it. To score it, drop a low, unhurried gallery-room bed
into `composition/audio/` — the house default, never a track that performs.

## Amendment (2026-07-28, post-review)

- **Evidence 2 content:** the framed Steepwell clip is now `steepwell-recipe-card` (the
  recipe-book Announcement Card, directed at `video-work/steepwell-recipe-card/`), media
  window 0-6.5s; thesis window media 2.5-9s. Beat structure, placard, and the ask quote
  unchanged.
- **Resolve beat addition:** the pixel hacker maker's mark (stand → point, stepped) plus
  the emitted bone underline under the install line, 37.9s → end. See style.md.
