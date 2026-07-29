# [Brand Name] — Motion Brand System

> One-line description of the brand and who it is for. This file is the source of truth
> for every video. Fill in every `[bracket]`; delete the guidance notes as you go.
> Minimal but sufficient beats long and vague — a tight brand file makes tighter videos.
>
> `/brand-init` writes this file for you and adds a `status:` frontmatter header
> (`incomplete` while the interview is mid-flight, `complete` when done). A hand-written
> file can skip the frontmatter entirely — its absence means complete.

## Constants (every video keeps these)

- **World.** Background `[#HEX]` ([describe: e.g. warm paper, deep ink, clean white]).
  Any second world (e.g. a dark closing frame) and when it is allowed: `[#HEX, when]`.
- **Accent.** `[#HEX]` is THE accent — it carries meaning (the key word, the metric, the
  price, the CTA), never decoration. Scarcity rule: `[one accent element per frame /
  never two competing]`.
- **Type.** Headings in `[typeface or category, e.g. a friendly serif]`, body in
  `[typeface or category, e.g. a clean sans]`. Headlines short, no orphan words.
- **Texture.** `[allowed subtle texture, or "none — flat"]`. Never busy.
- **Logo / wordmark.** `[the wordmark and how it is set]`. Every video ends on it.
  _Logo-exemption:_ if the wordmark carries the accent color (e.g. one letter in the
  accent), note it here — a persistent accent wordmark is identity, exempt from the
  one-accent-per-frame count, EXCEPT on any frame where it would sit beside a second
  accent use (then hold it neutral until the final resolve frame).
- **Register.** `[the tone in a phrase, e.g. warm, unhurried, trustworthy]`. Plus any
  banned words `[e.g. no "revolutionary", "game-changing"]`.

## Styles / roster (pick by message type)

The five archetypes, each tuned to a message type. `/brand-init` instantiates all five in
your brand's terms; by hand, fill each skeleton with your world, type, accent, and register.
The neutral spec (skeleton, audio default, length, variant axes, kind) lives in
`skills/video-direction/references/style-archetypes.md` — that is the single source; do not
invent new styles here.

1. **Launch Film** — new product / launch / milestone. `[length, the ONE signature move,
   how it ends]`. [narrative]
2. **Mechanism Explainer** — how it works, step by step. `[length, look and motion]`. [narrative]
3. **Kinetic Essay** — a take / argument / POV line. `[length, look and motion]`. [narrative]
4. **Announcement Card** — a date / price / event / one CTA, one held frame. `[length, look
   and motion]`. [static]
5. **Content Hero** — a post / quote / stat repurposed for the feed. `[length, look and
   motion]`. [static]

_Each entry is tagged narrative or static:_ narrative styles get the story-spine check;
static/stacked-info styles get the lighter hierarchy check.

## Selection rules (when the message type is ambiguous)

- `[If the ask reads like X → pick style 1. If it reads like Y → pick style 2.]`
- Default when still unclear: `[name the safe default style]`.

## Audio

- Default bed: `[e.g. gentle acoustic instrumental / none]`.
- VO: `[when narration is used, or "type-led, no VO"]`.
- **Silent permitted?** `[yes — silent is acceptable, note it on the render / no — every
  video carries a bed or VO]`. This line wins over any general audio floor.

## Delivery

- Aspect / size: `[e.g. square 1080×1080 for social; ≤ [N] MB]`.
- `[Must read with sound off / captions where words carry]`.

_Shipping one master to several places (site hero + feed + vertical)? The per-destination
spec table lives in `templates/delivery-matrix-template.md` — copy it into your project and
each destination gets its own aspect, length, and finish._

---

<!--
SCALE REFERENCE (delete before use) — a filled example, roughly the size to aim for:

## Constants
- World. Background #F5F3EE (soft paper). Dark closing frame in #20242B for one emphasis moment.
- Accent. #2E6E6A (deep teal) — the key word, the number, the CTA. Never two teals competing.
- Type. Headings in a friendly serif, body in a clean sans. Short headlines.
- Texture. A faint paper grain behind cards; never busy.
- Logo. Wordmark "[Brand]" in the serif, the dot in teal. Ends every video with the URL.
  The teal dot is exempt from the one-accent rule except on the same frame as the CTA.
- Register. Calm, precise, unhurried. No hype words.

## Styles
1. Launch Film — new product/milestone. 20-30s, cold-open hook → the thing → one proof →
   wordmark resolve, eased push-in on the reveal. [narrative]
2. Mechanism Explainer — how it works. 20-40s, panel per step, one accent traces the path. [narrative]
3. Kinetic Essay — a POV line. 15-25s, serif kinetic type, one accent word per beat. [narrative]
4. Announcement Card — a date/price/CTA. ≤12s, square, STATIC card (wordmark top, headline,
   details, CTA), one animated charm. Ends on the wordmark. [static]
5. Content Hero — a quote/stat for the feed. 8-15s, hero line, sound-off legible. [static]

## Selection rules
- Announcement/date → Announcement Card. How-it-works → Mechanism Explainer. New product →
  Launch Film. A take → Kinetic Essay. A repurposed post → Content Hero. Default: Announcement Card.

## Audio
- Bed: quiet instrumental. VO: none, type-led. Silent permitted? Yes — render silent and note it.

## Delivery
- Square 1080×1080, ≤ 8 MB, must read with sound off.
-->
