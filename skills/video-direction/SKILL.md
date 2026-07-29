---
name: video-direction
description: Use when creating, directing, or art-directing any brand video, promo, launch film, product story, social card, or motion graphic, or before writing or editing any video composition intended to ship. Also fires when choosing how a video should look, move, or sound, or when an AI-made video "looks generic" and needs a look decision forced.
---

# Video Direction

Act as the director of a small studio. The process supplies the taste: look, timing,
and sound are explicit staged artifacts with gates, so output quality never depends on
a vague prompt or anyone's eye on the day. The single failure this process exists to
prevent: AI-generated videos that all look the same because nothing forced a look
decision.

This skill owns the **direction** — the plan for a video worth rendering. It does not
render anything itself. Rendering is a separate framework (see **Execution layer**
below). Read that section before the pipeline so the plan and the renderer mesh.

## Execution layer — this process directs, HyperFrames renders

The direction pipeline produces a plan. **HyperFrames** turns the plan into pixels and
an MP4. The user installs HyperFrames separately; it is fetched on demand via `npx`, so
there is nothing to install ahead of time beyond Node 22+ and ffmpeg.

- Invoke the **`hyperframes`** skill to author and render. It is a full second process
  with its own vocabulary (project state, a workflow route table, an intent interview,
  a composition contract). Your direction artifacts are the input to it, not a rival to
  it.
- **Preflight once, before building:** `npx hyperframes doctor` (checks Chrome, ffmpeg,
  Node). Fix what it names before rendering. Announce that this runs and may take ~30s
  on a cold `npx` fetch (see **Announce stages**).

**How the six direction stages map onto the HyperFrames workflow:**

| Direction stage | HyperFrames handoff |
|---|---|
| 1. Treatment | Becomes the brief. HyperFrames' intent interview / `BRIEF.md` is already answered by your treatment — hand it over instead of re-interviewing from scratch. |
| 2. Style direction | Picks the workflow route. Short motion-first card → the motion-graphics route; longer narrative/product film → the product-launch route. When unsure, take the LIGHTER route and build directly against the composition contract rather than running heavy narrative ceremony. |
| 3. Boardomatic | The beat table drives the composition's timeline (clip timing, cuts on beat/VO boundaries). |
| 4. Styleframes | Scaffold first (`npx hyperframes init` inside the piece's `composition/` folder — note `init` may nest a subfolder named after the project; check where it put the files and flatten them into `composition/` if it did), build the still frame, render it with `npx hyperframes snapshot` (skip `check` on deliberate stills — it flags motionless frames), then Read the image and art-direct it. |
| 5. Build | Write the HyperFrames composition (the `index.html` with `class="clip"` elements and `data-*` timing attributes). Invoke the `hyperframes` authoring skills for the composition contract. Once your own `index.html` stands, delete the scaffold's example sub-compositions (`compositions/*.html`) it no longer references — `check` scans them anyway, and their errors muddy yours. **Then verify with `npx hyperframes check`** before rendering — it catches timing, font, and determinism errors, and its output now speaks only about files you wrote. |
| 6. QC | **Render with `npx hyperframes render`** for the MP4, then extract stills at each beat and verify against the delivery spec. |

If a HyperFrames command fails, re-run `npx hyperframes doctor` and `npx hyperframes
check`, and report the finding with its fix rather than a raw stack trace. Note:
HyperFrames maps some fonts to its own set at render time (a hand-picked serif/sans may
be substituted) and its starter scaffold defaults to 1920×1080 — set your delivery
aspect (e.g. 1080×1080) in the composition explicitly if the brand calls for it.

## The brand file — `motion-brand.md`

Read the brand's motion system file FIRST. It lives in the user's project as
`motion-brand.md` and is the source of truth for every video.

**When there is no `motion-brand.md` at all** (empty state): the user has not run
`/brand-init` yet. Point them there first — the brand file is what stops every video looking
the same. If they only want a throwaway test before committing to their own brand, offer the
bundled example: `examples/fern-and-field/motion-brand.md` (a fictional garden-supply brand,
with a matching sample render alongside it). Copy it in or read it directly, run one video
against it to see the process, then run `/brand-init` for real. Do not invent a brand
silently.

A brand file should carry these sections:

- **Constants** — what every video keeps (world/background, type, texture, logo,
  register). Never broken.
- **Styles / roster** — the named looks, each tied to a message type. These are the five
  archetypes (Launch Film, Mechanism Explainer, Kinetic Essay, Announcement Card, Content
  Hero); their neutral spec — skeleton, audio default, length, variant axes, kind — lives
  in `references/style-archetypes.md`, the single source both this skill and `/brand-init`
  read.
- **Selection rules** — how to pick a style when the message type is ambiguous.
- **Audio** — bed/VO defaults and whether silent is permitted.
- **Delivery** — aspect, size budget, sound-off legibility.

Constants are never broken. Differentiation happens between styles and along the
variant axes, never by bending a constant.

**When a section is missing** (hand-written brand files often lack one): do not assume
it exists and do not invent a rule the brand did not choose. Infer conservatively from
the Constants, do the smallest safe thing, note the gap in one line, and suggest the
user add it (via `/brand-init`, or by hand — see the template). Examples:

- No **selection rules** and the message type is ambiguous → pick the closest style by
  its described message type, name the pick and why, move on. Do not stall asking.
- No **delivery** spec → default to a common social spec (square 1080×1080, sound-off
  legible) and note it as an assumption.
- No **audio** section → treat as "bed preferred, silent permitted" and note it.

## Where artifacts live

One folder per piece: `video-work/<slug>/`. Inside it (note: HyperFrames may write renders into `composition/renders/` — copy the FINAL file up to the piece's `renders/` so deliverables live in one place):

- `treatment.md`, `style.md`, `boards.md` — the direction docs (treatment, the stage-2
  style direction, and the boardomatic).
- `styleframes/` — the still-frame explorations (A/B pairs).
- `composition/` — the HyperFrames project (index.html, assets).
- `renders/` — the final MP4 and poster.

A skeleton for the per-piece direction docs (the `treatment.md`, `style.md`, and
`boards.md` structures plus this folder contract) is at
`templates/production-doc-template.md`.

State everything to disk as you go. The `.md` files and the composition ARE the memory;
a run that dies mid-way resumes from the last stage on disk, not from chat.

## Solo-user mode

When the director and the client are the same person (a solo founder shipping their own
brand), the approval gates collapse to **self-review checkpoints**. "Post the A/B pair
for a pick" becomes "render both, Read both, pick the stronger and record why." "Render
only after the user approves" is a checkpoint you clear yourself. Do not stall waiting
for a second human who is not there — but do still stop, look, and decide at each gate.

## Announce stages

Never run a multi-minute step silently. Before each stage and each render, say what is
about to happen and roughly how long ("boards locked · rendering styleframes, ~40s").
Flag the cold-`npx` pause on the first HyperFrames call so a first-timer does not Ctrl-C
thinking it hung. Renders longer than ~60s should surface progress.

## The pipeline (produce each artifact in order; each gates the next)

1. **Treatment** — one paragraph: the ONE idea, the arc, runtime budget, audio mode,
   destination list. Audio mode follows the brand file (see **Audio precedence**). If
   the message type is ambiguous, pick per the brand's selection rules; if there are
   none, pick the closest style and say why. Do not ask.
2. **Style direction** — name the style from the roster, list the 2–3 signature moves
   this video uses, and note the variant axes chosen (so repeat videos vary
   deliberately). This pick also selects the HyperFrames workflow route. Read the
   project's **`style-ledger.md`** here (one row per shipped video; `/brand-init`
   scaffolds it from `templates/style-ledger-template.md`): vary the variant axes
   against the recent rows and never repeat the last video's combination — and cite the
   ledger in one line when you do ("last card was centered, seedling charm — going
   left-aligned, accent on the CTA"). No ledger on disk (a hand-written brand setup)?
   Note it once, suggest copying the template in, and continue.
3. **Boardomatic** — the beat table: one row per beat with start time, role, and
   content. Run the **structure check** for the style's kind (below) before timing.
   Music-driven pieces choose the actual track NOW (cuts land on beats); VO pieces lock
   the script now.
4. **Styleframes** — NOTE for static single-frame styles (announcement cards, held-frame pieces): stages 4 and 5 naturally collapse — you must build the composition to produce the styleframe, so build the frame first, snapshot it, review it as the styleframe, then finish the motion pass. Say so when it happens; do not pretend two stages ran. For flagship pieces (launch films, anything flagged important):
   render TWO fully-designed still frames of the same hero moment in two directions and
   present them for an A/B pick before building. For routine pieces, render ONE
   styleframe and self-check it against the look rubric. A/B comparison happens on
   STILLS only — never render two videos. Present the candidate frames beside the canon
   reference frame the chosen style anchors to (the archetype's teardown in
   `references/canon-deck.md`, when one exists), so the pick is judged against a
   known-good standard, not in a vacuum.
5. **Build** — the composition, per the build contract below.
6. **QC** — (after QC closes, fire the consent-gated telemetry events per `references/telemetry.md` — render_complete on success, render_failed on a failed run; silent no-op without consent) — render the MP4, verify against the delivery spec (duration, aspect, size,
   captions where words carry, hook inside 2s), and extract stills at each beat to
   confirm the frames match the boards. On a successful render, **append one row to the
   project's `style-ledger.md`** using the template's exact columns (Date, Video, Tier,
   Style, Audio, Camera, Hero techniques, New capabilities tried, Destinations, Perf
   note) — the piece's slug, its style and kind of audio/camera actually shipped, and
   the destinations it went to. No ledger on disk? Note it once (same posture as a
   missing brand-file section) and continue.

### Structure check — scope it to the style's kind

Not every video is an argument. Run the check that fits:

- **Narrative styles** (product story, explainer, launch film, anything that makes a
  case over time): the **story-spine check**. Every beat carries a named role (setup /
  turn / transfer / bridge / evidence / thesis / resolve) and consecutive beats connect
  with "but" or "therefore," never "and then." Compress the ARGUMENT, not just the best
  lines — an evidence beat without its bridge floats.
- **Static / stacked-info styles** (a launch card, a price card, a stacked-info
  composition where the whole point is one held frame): a lighter **hierarchy check**
  instead. One idea per zone, a clear reading order (eye lands where it should first),
  and the punchline (price, CTA, date) lands LAST in the reading order. Do not force
  "but/therefore" onto a card that is not making an argument.

Decide which kind the chosen style is at stage 2 and state it, so the right check runs.

### Audio precedence

Teach the audio floor: no shipped video should be silent by accident — a bed or VO
carries mood and holds attention (ambient site loops excepted). **But the user's brand
file wins.** If `motion-brand.md` permits silent, a silent render is correct: render it
silent and add a one-line note ("silent per brand; add a bed at `composition/audio/` or
a VO key to score it"). State it once, plainly. Never lecture a user whose own brand
chose silence, and never block a render to go source a track they did not ask for.

## Build contract

- Camera on every scene where the style calls for one: cut to change ideas, move to
  direct attention within one idea. Eased push-ins, hold, never yo-yo. A static centered
  window may hold for at most one beat. **Punch-in framing is checked against WORLD
  BOUNDS, not just the focal point** — the viewport spans cx ± (halfWidth/scale),
  cy ± (halfHeight/scale) (plus any drift amplitude), and every edge must stay inside
  the surface being framed, or the void behind it shows. Verify with a still at the
  beat's dwell before rendering.
- Multi-panel scenes with content-level motion (typing, line-draws, traveling chips)
  may hold a static camera — the camera rule targets single-window screen-recording
  sameness, not composed diagram scenes.
- ONE ease/spring system declared once and reused for every entrance. Staggered reveals
  (nothing arrives all at once); revealed text holds long enough to read (~2.5s per
  line).
- Accent color carries MEANING (the metric, the state change, the price, the CTA),
  never decoration. Count accent uses per frame against the brand's scarcity rule.
  **Logo/wordmark exemption:** a persistent logo or wordmark that carries the accent
  (e.g. a colored "&" in the wordmark) is identity, not a competing accent, and is
  exempt from the per-frame count — PROVIDED it does not share a frame with a second
  meaning-bearing use of the same accent. When it would (the accent wordmark on the same
  card as the accent price), resolve it explicitly: hold the wordmark in a neutral/mono
  weight everywhere except the final resolve frame, where it becomes the single accent.
  State the resolution; do not leave two accents competing.
- Text on screen follows the brand's voice/type rules. Numbers shown must be true and
  sourced from the request or the brand's verified materials — never invented.
- Deterministic and seek-safe: single paused timeline, hard-set state at every scene
  boundary, no wall-clock or randomness.

## Critic rubrics (run both before QC; they answer different questions)

- **Look critic** (after styleframes): anti-slop checklist — static centered window that
  never moves, style drift between scenes, default-font reflexes, decoration-only
  accent, more than the brand's allowed accent per frame, containers nested more than
  ~2 deep, off-register energy. Compare the frame side-by-side with the style's canon
  reference if one is named (canon references live in `references/canon-deck.md` — the
  teardown for the archetype the piece anchors to), and against the brand constants.
- **Timing critic** (after boards): every beat earns its seconds; cuts land on beat/VO
  boundaries; total fits the runtime budget; the hook lands inside 2 seconds; and — for
  narrative styles — the story spine holds (read the beats as a chain, flag "and then"
  joins and evidence beats whose setup was cut). For static/stacked styles, check the
  hierarchy instead: reading order and the punchline landing last.

## Craft rules (earned in production; do not relearn them)

1. The generic look is a briefing failure, not a model limitation — vague direction gets
   the statistical average of the training set. The roster and the boards ARE the
   briefing; specificity is the whole job.
2. A house style is 2–3 signature motifs applied with system-level consistency.
   Consistency is the brand; the eased camera is the craft; the cold-open arc is the
   difference between a demo and a film.
3. Compress the argument, not just the best lines. A punchline pulled without its setup
   floats — cut whole beats, never a beat's connective tissue.
4. Music-driven cutting: choose the track before animating and align the first beat to a
   known grid time, then place cuts ON the grid by construction (pad the track head so
   beat one lands exactly on the first cut).
5. Accent carries meaning, never decoration. One meaning-bearing accent moment per
   frame; the eye should always know where the point is.
6. If a brand element performs (an ident, a chip, a character where the brand has one):
   the performed action correlates with the title taken literally, worn/silhouette-scale
   elements beat hand-scale ones, and the action should emit a visible effect that
   carries the verb.
7. The stills loop is how frames get directed: render, Read the image, art-direct your
   own frame, iterate. Long iteration counts are normal; budget for them by importance.
   A frame you never looked at is a frame you never directed.
8. Never gate the underlying content on the video — if the video is not ready, the
   content ships without it.
