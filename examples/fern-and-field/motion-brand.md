---
status: complete
---

# Fern & Field — Motion Brand System

> The video brand layer for Fern & Field, a native-plant garden-supply company for home
> growers. This file is the source of truth for every video. Fern & Field is fictional —
> a worked example that ships with the plugin so you can see a filled brand file and a
> sample render before you build your own.

## Constants (every video keeps these)

- **World.** Background `#FAF7F0` (warm off-white paper). Second world: a deep-moss dark
  frame `#22291F`, allowed only for one closing emphasis moment.
- **Accent.** `#2F6B4F` (fern green) is THE accent — it carries meaning (the key word, the
  price, the CTA), never decoration. Scarcity rule: one green element per frame, never two
  greens competing.
- **Type.** Headings in a friendly serif (Georgia is fine), body in a clean sans (system
  sans is fine). Headlines short, no orphan words.
- **Texture.** A very subtle leaf-vein or dot texture behind cards on the paper world;
  never busy.
- **Logo / wordmark.** The wordmark "Fern & Field" set in the serif, the "&" in fern green.
  No icon, no mascot. Every video ends on the wordmark + `fernandfield.com`.
  _Logo-exemption:_ the green "&" is identity, exempt from the one-green-per-frame count,
  EXCEPT on any frame where it would sit beside a second green use (e.g. the accent price).
  On that frame, hold the "&" in a neutral/mono weight and let it become green only on the
  final resolve frame.
- **Register.** Warm, unhurried, trustworthy — like a good garden-center employee who knows
  their stuff and is never salesy. No sparkle. Banned words: no "revolutionary", no
  "game-changing".

## Styles / roster (pick by message type)

The five archetypes, tuned to Fern & Field. The neutral spec (skeleton, audio default,
length, variant axes, kind) lives in `skills/video-direction/references/style-archetypes.md`.

1. **Launch Film** — a new product, season, or milestone. 20–40s, paper-world cold-open →
   the problem → the thing revealed → one proof → wordmark resolve; eased push-in on the
   reveal, quiet folk bed. [narrative]
2. **Mechanism Explainer** — how a product works or where it comes from, step by step.
   20–45s, paper-world panel per step, one green tracing the active path, a held frame at
   each step so the eye can read it. [narrative]
3. **Kinetic Essay** — a growing tip or a seasonal point of view. 15–30s, serif kinetic
   type, one green word per beat carrying the turn, calm folk bed. [narrative]
4. **Announcement Card** (Fern & Field's "Launch Card") — a date, a price, or one CTA on a
   single held frame. ≤12s, square, static card (wordmark top → serif headline → tidy detail
   list → CTA/price landing LAST), ONE charm animation (a seedling sprouting, a leaf
   unfurling, the price settling in green). Ends on the wordmark. [static]
5. **Content Hero** — a post, quote, stat, or customer note repurposed for the feed. 8–20s,
   hero-scale first line, one green on the load-bearing word, a subtle brand frame that
   never competes with the words. Reads with sound off. [static]

## Selection rules (when the message type is ambiguous)

- A date, a price, or a single CTA → **Announcement Card**. How a product works or where it
  comes from → **Mechanism Explainer**. A new product, season, or milestone → **Launch
  Film**. A growing tip or seasonal take → **Kinetic Essay**. A repurposed post, quote, or
  review → **Content Hero**.
- Default when still unclear: **Announcement Card**.

## Audio

- Default bed: gentle acoustic / folk-adjacent instrumental. Quiet.
- VO: type-led, no VO by default. A voice is allowed on a Launch Film or Mechanism Explainer
  when narration genuinely helps.
- **Silent permitted?** Yes — silent is acceptable when no bed is on hand; render silent and
  note it on the render. This line wins over any general audio floor.

## Delivery

- Aspect / size: square 1080×1080 for social; ≤ 8 MB.
- Must read with sound off; captions where words carry the meaning.
