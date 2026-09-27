# Motion choreography: make the direction pipeline use the whole motion library

Date: 2026-09-27. Status: APPROVED by Jason 2026-09-27 ("looks good. lets move on"). Approach A. §7 decisions taken at their recommended settings the same day: proposed floors stand until the first arena run; coverage against the last two videos; Fern & Field dogfood first.

## 1. The problem, stated from evidence

The plugin's videos are simple. The latest S-tier film on the author's own account shows six
frames with one layout: dark field, small-caps eyebrow, headline, rows that fade in, footer
wordmark. The author's capability map diagnosed the same thing on 2026-07-25: camera moves
underused and the single biggest lever, scene transitions never used, one of 24 text effects
used, 3D unused. It prescribed seven departures. None landed.

The capability is installed. The HyperFrames animation skill the plugin already depends on
ships 22 blueprints, about 50 atomic motion rules, 43 transitions, and an `animation-map.mjs`
script that measures a composition's motion. Every technique in a professional SaaS promo
(the TypingMind teardown in the canon deck after this change) has a named rule there.

The cause is structural. Nothing in the pipeline binds a beat to a technique. Style direction
names two or three signature moves. The boards name beat, role and content. The build contract
asks for a camera, one spring and staggers. The animator satisfies that with the simplest
composition that passes: reveals on a static layout. The look critic compares stills to a
canon of three restrained clips, so restraint reads as correct. No critic counts motion.

**Goal.** A video built through this plugin reads as the work of a professional motion
designer, because the pipeline demands motion per beat by name, measures it before rendering,
and drives the brand through the library over time. Jason's words: "I don't feel like we are
utilizing all the motion design skills available. Ours is very simple and I want them to look
like a professional motion designer created them."

**Non-goals.** No new rendering path. No subagent. No hosted service. No change to
`/brand-init`'s interview beyond one new ledger column. No sixth archetype.

## 2. What changes, by component

### 2.1 The motion vocabulary (new reference)

`skills/video-direction/references/motion-vocabulary.md`. One page. Four tables, one per
choreography column, each row a name, one line on when it earns its place, and the recipe
pointer (`hyperframes-animation` rule or blueprint id, or `transitions/catalog.md` name).

- **Camera**: `multi-phase-camera`, `coordinate-target-zoom`, `camera-cursor-tracking`,
  `3d-camera-flight`, `orbit-3d-entry`, plus blueprints `camera-journey`,
  `zoom-out-workspace-reveal`, `spatial-pan-stations`; and `hold` (allowed, never in every
  beat).
- **Entrance**: `press-release-spring`, `depth-scatter-assemble`, `grid-card-assemble`,
  `logo-assemble-lockup`, `kinetic-beat-slam`, `typewriter-reveal`, `hacker-flip-3d`,
  `gradient-text-sweep`, `3d-text-depth-layers`, `particle-burst`, `motion-blur-streak`,
  `ambient-glow-bloom`, `depth-of-field-blur`.
- **State change** (what the interface does inside the beat): `cursor-click-ripple`,
  `cursor-drag`, `multi-cursor-choreography`, `context-sensitive-cursor`,
  `control-target-sync`, `panel-edit-live-sync`, `card-morph-anchor`,
  `anchored-layout-expand`, `counting-dynamic-scale`, `dataviz-countup`,
  `chart-scrub-readout`, `discrete-text-sequence`; and blueprint `cursor-ui-demo`.
- **Transition out**: the Tier-B-ready names from `TRANSITION-REGISTRY.md` (push, scale,
  blur, dissolve, radial, cover families) plus `cut` (allowed, never for every boundary).

Two bindings are mandatory, not optional: a beat that shows an interface instantiates
`cursor-ui-demo` or names a state-change rule; a hero reveal instantiates
`zoom-out-workspace-reveal` or `camera-journey`.

The vocabulary is the plugin's own file so a stranger's install never depends on a path. The
recipes stay in the animation skill, which the preflight already installs.

### 2.2 Stage 3b, Choreography (new stage; Motion Designer role)

Runs after the Editor's boards and before styleframes. Output: four new columns on the beat
table in `boards.md`:

| # | Start | Role | Content | Camera | Entrance | State change | Transition out |
|---|---|---|---|---|---|---|---|

Rules of the stage:

1. Every cell names a vocabulary entry. `hold` and `cut` are entries; a beat may use one of
   them, never both, and no piece uses `hold` in every camera cell or `cut` at every boundary.
2. The style's signature moves (stage 2) must appear in the columns; a signature move that is
   never choreographed is a stage-2 error, reported as such.
3. **Coverage.** Read `style-ledger.md`'s new `Rules used` column. At least two entries in
   this piece must not appear in the brand's last two videos. This is the rule that makes the
   library get used over time; without it the floor is met by the same four rules forever.
4. Static archetypes (Announcement Card, Content Hero by default) fill the columns too, with
   the lighter floor in §2.3, so a card still moves on purpose.
5. The Motion Designer writes one line under the table naming the piece's motion signature
   (the recurring move the viewer will remember), the same way stage 2 names the look.

The production-doc template gains the columns and a filled example.

### 2.3 The motion floor, per archetype (spec addition)

`references/style-archetypes.md` gains a **Motion floor** field per archetype:

| Archetype | Camera | Transitions | Distinct rules | State change | Dead zone cap |
|---|---|---|---|---|---|
| Launch Film | a move in every scene | ≥ 1 named | ≥ 4 | in every interface beat | ≤ 8% of runtime |
| Mechanism Explainer | a move in every scene, or content-level motion in panel scenes | ≥ 1 named | ≥ 4 | in every interface beat | ≤ 8% |
| Kinetic Essay | a move in every scene | ≥ 1 named | ≥ 3 (text rules count) | not required | ≤ 5% |
| Announcement Card | one drift | none required | ≥ 2 (charm + entrance) | not required | none (held frame is the point) |
| Content Hero | one drift | none required | ≥ 2 | not required | none |

A brand file may raise a floor in `motion-brand.md` under a new optional **Motion** section.
It may not lower one below the archetype's row. When the section is absent, the archetype
row applies and the gap is noted once, the same posture as the other missing sections.

### 2.4 The motion critic (new checker, deterministic)

`skills/video-direction/scripts/motion-floor.mjs`. Runs at the close of stage 5, after
`npx hyperframes check` and **before** `npx hyperframes render`, so a failed floor costs no
render.

Inputs: the composition directory, the archetype (from `style.md`), the choreography table
(from `boards.md`), the optional brand Motion section.

Steps:

1. Run the animation skill's `animation-map.mjs` on the composition, writing
   `animation-map.json` into `composition/.hyperframes/anim-map/`. If the script is missing,
   cannot bootstrap, or exits non-zero, the verdict is **FAIL: not measured**. Not a warning.
2. Read the map. Reconcile against the table:
   - **Camera**: each scene clip's camera wrapper (`.camera` or `.world`, by convention in
     the build contract) has at least one transform tween inside the scene's window, except
     scenes whose table cell says `hold`.
   - **Declared rules carry motion**: the build stamps `data-rule="<name>"` on the element
     each rule owns; every stamped element has at least one mapped tween, and every table
     entry has a stamped element.
   - **Distinct rules** counted from the stamps, compared to the floor.
   - **Transitions**: each declared boundary has an overlap window in the map (the next
     clip's tweens begin before the previous clip's end), or a stamped transition element.
   - **State change**: interface beats have a stamped state-change rule with tweens on a
     non-camera element. An interface beat is any beat whose Content cell begins with the
     marker `[ui]`; the Editor writes the marker at stage 3, and the Role column keeps its
     story-spine value untouched.
   - **Dead zones**: the map's `deadZones` total against the cap.
   - **The map's own flags**: `offscreen`, `invisible`, `degenerate`, `collision` on any
     tween is a FAIL with the tween's summary line quoted.
3. Emit `motion-floor.json` (pass/fail per check with the evidence line) and a one-screen
   summary. FAIL names the check, the beat, and the vocabulary entry that would satisfy it.

Green is earned. There is no state in which an empty map, a missing table, or a script error
produces a pass.

### 2.5 Stage 4 and the stills loop, extended to motion

Styleframes stay stills. The look critic gains a second reference: the canon deck's
high-motion anchor for the archetype. And QC's per-beat stills become **three per beat** (in,
hold, out) on the contact sheet, so a reviewer sees the motion, not the pose.

### 2.6 Canon and template

- `references/canon-deck.md`: a second Launch Film anchor, the TypingMind promo teardown
  (from the author's vault, condensed: beat table, the system underneath, the feature
  template), labelled **high-motion**. The look critic names which anchor it compared against.
- `templates/feature-beat/`: one HyperFrames sub-composition: small-caps eyebrow, two-line
  two-tone headline, grey sub line, an interface card that performs exactly one state change,
  one camera drift, stamped with its rules. Documented as the reusable beat for "here is what
  it does" sequences. Brand-agnostic: colours and type come from `motion-brand.md`.
- `examples/fern-and-field`: the sample video rebuilt through stage 3b so the repo's own
  example clears the Launch Film floor. Its ledger row shows the new column filled.

### 2.7 Ledger and telemetry

- `templates/style-ledger-template.md` gains a **Rules used** column (the stamped names,
  comma-separated). QC writes it. Stage 3b reads it for coverage.
- `references/telemetry.md`: `render_complete` and `render_failed` gain one property,
  `motion_floor: pass | fail | not_measured`. Consent-gated as before; nothing else changes.

### 2.8 Skill text

`SKILL.md`: stage 3b inserted; the handoff table gains a row; the build contract gains the
`data-rule` stamp and the camera-wrapper convention; the critic section gains the motion
critic with its position (after check, before render); the QC closer's "change X" routes
motion objections to `boards.md`'s choreography columns. The description does not change.

## 3. Data flow

treatment → style (signature moves) → boards (beats) → **choreography (four columns,
coverage against the ledger)** → styleframes (look critic, two anchors) → build (stamps) →
`hyperframes check` → **motion-floor (animation-map → reconcile → pass/fail)** → render → QC
(three stills per beat; ledger row with rules used; telemetry with the floor result).

## 4. Error handling

- Animation-map missing or failing: FAIL not measured, with the exact command to fix
  (`npx hyperframes skills update`, or the bootstrap env the script names).
- Table incomplete: stage 3b refuses to hand off and names the empty cells.
- Floor fail: the summary names the beat and a vocabulary entry; the fix routes to
  `boards.md` (choreography) or the composition, never to the floor.
- Brand Motion section below the archetype floor: the archetype floor applies, one line
  says so.
- Static styles where stages 4 and 5 collapse: the floor still runs before the final render.

## 5. Testing

- **Unit, `motion-floor.test.mjs`** on fixture maps: the five false-green states (empty map;
  script exit non-zero; declared rules with no tweens; camera wrapper never moves; a piece
  under the distinct-rules floor that passes every other check) each FAIL; one full fixture
  PASSES; a static-card fixture passes the lighter floor.
- **Coverage rule test**: a ledger with two prior rows and a table reusing only their rules
  fails stage 3b's handoff.
- **Arena**: a fresh persona with a quiet brand (Steepwell or a new one) reaches a rendered
  Launch Film that clears the floor unaided. The friction log is the acceptance record.
- **Dogfood**: the Fern & Field rebuild; then the author's Magnetiz worked-example exhibit
  (Thought Leader plan, rank 1) built through the new stage after the brand re-anchor the
  ledger already requires.

## 6. Rollout

1. Vocabulary, archetype floors, template columns, ledger column (docs only).
2. `motion-floor.mjs` with tests; wire into SKILL.md at the check/render seam.
3. Canon entry and the feature-beat template.
4. Fern & Field rebuild; arena run; friction log; fixes.
5. Telemetry property; README one paragraph; version bump; ship-check.

## 7. Open decisions, all Jason's

1. The exact floor numbers in §2.3 are proposals; the first arena run and the first dogfood
   may move them. Green stays earned either way.
2. Whether the coverage rule's "last two videos" should be "last three".
3. Whether the Magnetiz dogfood waits for the brand re-anchor or runs on the example brand
   first. Recommendation: example brand first, so the plugin's proof does not wait on a
   Magnetiz decision.

## 8. Success

A stranger's first Launch Film through this plugin clears the Launch Film floor without
help, and Jason looks at a video built through stage 3b and does not call it simple.
