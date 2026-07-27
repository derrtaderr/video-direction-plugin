# Style archetypes — the five tuned looks

This is the single source of truth for the roster. Both `/brand-init` (which
*instantiates* these into a brand's `motion-brand.md`) and the `video-direction` skill
(which *selects* from them at treatment time) read this file. Do not redefine the five
anywhere else — point here.

The user does not design styles. They inherit five archetypes, each already tuned to a
message type, and `/brand-init` fills the brand's world, type, accent, and register into
the skeletons. An archetype is a message-type-to-look contract with a beat skeleton, an
audio default, a length budget, a narrative-or-static kind, and the variant axes a repeat
video moves along so it never repeats itself.

Every archetype carries a **kind**: `narrative` runs the story-spine check (every beat a
named role, beats joined by "but" / "therefore", never "and then"); `static` runs the
lighter hierarchy check (one idea per zone, clear reading order, punchline lands last).
See the skill's **Structure check** section.

---

## 1. Launch Film

- **For:** announcing a new product, feature, company, or milestone — the flagship piece.
- **Kind:** narrative (story-spine).
- **Length:** 20–40s.
- **Skeleton:** cold-open hook (a state or a question, no logo yet) → the problem it
  answers → the thing itself, revealed → one piece of proof (a number, a moment) →
  wordmark resolve on the closing frame. Each beat connects to the next with "but" or
  "therefore".
- **Audio default:** scored — a bed with an arc, or VO over a bed. Not silent; this piece
  carries mood.
- **Signature moves (pick 2–3):** eased hero push-in on the reveal, one accent word doing
  the turn, a cut on the music's first downbeat.
- **Variant axes:** pace (slow-burn vs punchy), voice (VO-led vs type-led), reveal style
  (build-on vs cut-to), closing-frame world (primary vs dark emphasis frame).

## 2. Mechanism Explainer

- **For:** showing how something works, step by step — the "here's the machine" piece.
- **Kind:** narrative (story-spine), but panel/diagram scenes may hold a static camera
  (the camera-move rule targets single-window screen-recording sameness, not composed
  diagram scenes).
- **Length:** 20–45s.
- **Skeleton:** setup (what we're about to see) → step 1 → step 2 → step 3 → payoff (what
  you now have). Steps connect with "therefore"; if two steps only relate by "and then",
  one of them is not earning its beat.
- **Audio default:** VO-led, or a bed with captions where the words carry the mechanism.
- **Signature moves (pick 2–3):** content-level motion (typing, line-draws, traveling
  chips between panels), one accent tracing the active path, a held frame at each step's
  dwell so the eye can read it (~2.5s per line).
- **Variant axes:** panel layout (stacked vs traveling), VO vs captions, step count (3 vs
  4), accent role (path-tracer vs state-marker).

## 3. Kinetic Essay

- **For:** a point of view, an argument, a manifesto line — text-forward, the "here's what
  I think" piece.
- **Kind:** narrative (story-spine). The argument is the spine; compress the argument, not
  just the best lines.
- **Length:** 15–30s.
- **Skeleton:** thesis line → the tension or objection → the turn → the landing. Kinetic
  typography, one beat per line, cuts on the VO or music grid.
- **Audio default:** a bed with a strong rhythm the cuts land on, or a spoken VO. Rarely
  silent — the rhythm is half the form.
- **Signature moves (pick 2–3):** staggered word/line reveals, one accent word per beat
  carrying the turn, cut density matched to the track's grid.
- **Variant axes:** type treatment (serif-editorial vs mono-technical), cut density (sparse
  vs rapid), voice (VO vs type-led), accent cadence (one word vs one line).

## 4. Announcement Card

- **For:** one held frame with a fact to land — a date, a price, an event, a single CTA.
- **Kind:** static (hierarchy check). Do not force "but/therefore" onto a card; run the
  reading-order check instead.
- **Length:** ≤12s.
- **Skeleton:** wordmark top → headline (the one fact) → supporting details list → CTA /
  date / price landing LAST in the reading order. One animated charm element, everything
  else still.
- **Audio default:** a quiet bed, or silent — silent is permitted for a card and often
  right. Note it on the render.
- **Signature moves (pick 2–3):** a single charm animation (never the whole card moving),
  the accent reserved for the punchline, generous air so the eye lands where it should
  first.
- **Variant axes:** layout (centered vs left-aligned), charm element (which one moves),
  accent target (headline vs CTA), aspect (square vs vertical).

## 5. Content Hero

- **For:** turning a post, quote, stat, or testimonial into a branded social clip — the
  content atom, the highest-frequency piece.
- **Kind:** static (hierarchy check) by default; a light narrative build is allowed when
  the quote has a turn in it.
- **Length:** 8–20s.
- **Skeleton:** hook line or stat, hero-scale → the body/quote → source attribution →
  brand frame (wordmark + handle/URL). Reads with sound off.
- **Audio default:** a bed, silent-friendly — must be legible and complete with sound off
  because it lives in a muted feed.
- **Signature moves (pick 2–3):** hero-scale first line, one accent on the load-bearing
  word or number, a subtle brand frame that never competes with the words.
- **Variant axes:** hero element (quote vs stat vs headline), background (primary world vs
  a tinted variant), accent target, aspect (square vs vertical for stories/reels).

---

## Instantiation note (for `/brand-init`)

Instantiate all five for every brand. Each becomes a one-line roster entry in the brand's
voice: fill the world background, the type register, the accent, and the register/tone into
the skeleton, and mark each entry `[narrative]` or `[static]` so the right structure check
runs. The brand does not pick which archetypes exist — it inherits all five, tuned. The
**Selection rules** section is what decides *which* one a given ask maps to.
