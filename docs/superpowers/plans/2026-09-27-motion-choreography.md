# Motion Choreography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the video-direction plugin demand motion per beat by name, measure it before render with a deterministic floor, and drive each brand through the whole motion library over time.

**Architecture:** A new choreography stage fills four motion columns per beat from a vocabulary the plugin ships. A zero-dependency Node checker parses the boards, the composition HTML and the animation skill's `animation-map.json`, reconciles them against a per-archetype floor, and fails the piece before any render when the floor is not met or the map could not be produced. Docs, templates, a canon entry and one reusable feature-beat composition carry the rest.

**Tech Stack:** Node 22+ (`node:test`, `node:assert`, `node:child_process`, no npm dependencies), HyperFrames compositions (HTML + GSAP on `window.__timelines`), the `hyperframes-animation` skill's `scripts/animation-map.mjs` (installed by preflight at `~/.claude/skills/hyperframes-animation/` or `~/.agents/skills/hyperframes-animation/`).

**Spec:** `docs/superpowers/specs/2026-09-27-motion-choreography-design.md`

## Global Constraints

- Node 22+. No npm dependencies in the plugin. Tests run with `node --test skills/video-direction/scripts/`.
- No new render path, no subagent, no hosted service (spec §1 non-goals). No sixth archetype.
- GREEN IS EARNED: the checker never passes on an empty map, a missing table, a script error, or declared rules with no tweens (spec §2.4).
- A brand file may raise a floor, never lower it below the archetype row (spec §2.3).
- The checker runs after `npx hyperframes check` and before `npx hyperframes render` (spec §2.4).
- Element identification: the animation map keys elements by `#id` (or `tag.class`), so every rule-owning element carries both `id` and `data-rule`; scene clips carry `id="beat-<n>"` matching the boards row number; each scene's camera wrapper carries `id="cam-beat-<n>"` (build contract additions, Task 7).
- Copy rules for all doc text: no em dashes, plugin voice as in the existing SKILL.md.
- Every commit message ends with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus

1. A composition whose camera wrapper tweens `opacity` only should not count as a camera move; a person would expect a camera move to change position or scale. Pinned in Task 5 (`test: camera opacity-only tween is not a move`).
2. A boards table with the four columns present but a beat row missing one cell (short row) should fail the choreography lint with the beat number named, not throw. Pinned in Task 3.
3. A `[ui]` beat whose state-change cell is `none` must fail the state-change check on Launch Film, and pass on Kinetic Essay where the floor does not require it. Pinned in Task 5.
4. A brand Motion section that tries to lower a floor (`rules: 2` on Launch Film) must be ignored with a note, and the archetype floor applied. Pinned in Task 2.
5. When the animation-map script exists but the composition has no registered timelines, the map reports zero tweens; that must be `FAIL: not measured`, not a pass on an empty checklist. Pinned in Task 5 and Task 6.

---

### Task 1: The motion vocabulary reference

**Files:**
- Create: `skills/video-direction/references/motion-vocabulary.md`
- Create: `skills/video-direction/scripts/vocabulary.mjs`
- Test: `skills/video-direction/scripts/vocabulary.test.mjs`

**Interfaces:**
- Produces: `parseVocabulary(markdown) -> { camera: Set<string>, entrance: Set<string>, state: Set<string>, transition: Set<string>, all: Set<string> }` and `VOCABULARY_PATH` (absolute path to the reference file, resolved from `import.meta.url`).
- Later tasks call `parseVocabulary(readFileSync(VOCABULARY_PATH, 'utf8'))` to validate board cells.

- [ ] **Step 1: Write the failing test**

```js
// skills/video-direction/scripts/vocabulary.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseVocabulary, VOCABULARY_PATH } from "./vocabulary.mjs";

test("vocabulary parses four tables with the mandatory entries", () => {
  const v = parseVocabulary(readFileSync(VOCABULARY_PATH, "utf8"));
  assert.ok(v.camera.has("hold"));
  assert.ok(v.camera.has("multi-phase-camera"));
  assert.ok(v.camera.has("zoom-out-workspace-reveal"));
  assert.ok(v.camera.has("camera-journey"));
  assert.ok(v.entrance.has("press-release-spring"));
  assert.ok(v.state.has("cursor-ui-demo"));
  assert.ok(v.state.has("none"));
  assert.ok(v.transition.has("cut"));
  assert.ok(v.transition.size >= 6);
  assert.ok(v.all.size >= 40);
});

test("every vocabulary row carries a pointer column", () => {
  const md = readFileSync(VOCABULARY_PATH, "utf8");
  const rows = md.split("\n").filter((l) => /^\| `/.test(l));
  for (const r of rows) {
    const cells = r.split("|").map((c) => c.trim()).filter(Boolean);
    assert.equal(cells.length, 3, `row needs name, when, pointer: ${r}`);
    assert.ok(cells[2].length > 3, `pointer missing: ${r}`);
  }
});

test("names are unique across tables", () => {
  const v = parseVocabulary(readFileSync(VOCABULARY_PATH, "utf8"));
  const total = v.camera.size + v.entrance.size + v.state.size + v.transition.size;
  assert.equal(total, v.all.size);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test skills/video-direction/scripts/vocabulary.test.mjs`
Expected: FAIL with "Cannot find module './vocabulary.mjs'"

- [ ] **Step 3: Write the reference file**

Create `skills/video-direction/references/motion-vocabulary.md` with this exact structure (four `##` sections, each a three-column table; names in backticks in column one):

```markdown
# Motion vocabulary

The names the choreography stage (3b) may write into the four motion columns of `boards.md`.
Each name is a recipe in the `hyperframes-animation` skill (rules at `rules/<name>.md`,
blueprints at `blueprints/<id>.md`) or a transition in its `transitions/` folder. The pointer
column says which. `hold`, `none` and `cut` are the deliberate absences; a piece may use each,
never everywhere.

## Camera

| Name | When it earns its place | Pointer |
|---|---|---|
| `hold` | The camera has a reason to stay put for this one beat (a held card, a reading beat). Never every beat | (none) |
| `multi-phase-camera` | One scene needs a pull-back, a focus and a push in sequence, with a live micro-drift | rule |
| `coordinate-target-zoom` | Punch in on something that is not centred, dwell at least a second | rule |
| `camera-cursor-tracking` | The focal point grows (typing, a list filling) and the camera should follow without jumps | rule |
| `3d-camera-flight` | Fly through a Z-space of cards or panels | rule |
| `orbit-3d-entry` | Objects arrive on an orbit around a centre | rule |
| `camera-journey` | A multi-leg motivated journey across one world: dive in, a beat fires, travel to the consequence | blueprint |
| `zoom-out-workspace-reveal` | Open tight on a detail and one decelerating pull-back reveals the whole | blueprint |
| `spatial-pan-stations` | Labelled stations on one oversized canvas, panned between | blueprint |

## Entrance

| Name | When it earns its place | Pointer |
|---|---|---|
| `press-release-spring` | The default spring entrance for any card or line | rule |
| `depth-scatter-assemble` | Many pieces arrive from scattered depth and assemble | rule |
| `grid-card-assemble` | A grid of cards assembles in a stagger | blueprint |
| `logo-assemble-lockup` | A mark assembles from parts into its lockup | blueprint |
| `kinetic-beat-slam` | Short phrases slam in on beats with distinct entrances | rule |
| `typewriter-reveal` | A live caret types and edits a line | blueprint |
| `hacker-flip-3d` | Character-level 3D flip with glyph substitution | rule |
| `gradient-text-sweep` | A gradient sweeps through letterforms | rule |
| `3d-text-depth-layers` | Large type gets a stacked extrusion | rule |
| `particle-burst` | A burst marks an arrival or a payoff | rule |
| `motion-blur-streak` | Anything that travels fast leaves a streak | rule |
| `ambient-glow-bloom` | The focused element glows | rule |
| `depth-of-field-blur` | Background objects defocus to sell depth | rule |
| `titlecard-reveal` | A title card reveals with one signature move | blueprint |

## State change

| Name | When it earns its place | Pointer |
|---|---|---|
| `none` | The beat shows no interface and nothing on it changes state | (none) |
| `cursor-ui-demo` | An interface beat: a cursor performs one action on a real card | blueprint |
| `cursor-click-ripple` | A click lands with a visible ripple | rule |
| `cursor-drag` | Something is dragged from here to there | rule |
| `multi-cursor-choreography` | Several cursors act in sequence | rule |
| `context-sensitive-cursor` | A typing cursor changes with its segment | rule |
| `control-target-sync` | A control changes and its target answers | rule |
| `panel-edit-live-sync` | An edit in one panel updates another live | blueprint |
| `card-morph-anchor` | A card morphs into its expanded state around an anchor | rule |
| `anchored-layout-expand` | A layout expands from an anchor without width/height tweens | rule |
| `counting-dynamic-scale` | A number counts up and grows with its value | rule |
| `dataviz-countup` | A stat or chart counts into place | blueprint |
| `chart-scrub-readout` | A chart scrubs and a readout follows | rule |
| `discrete-text-sequence` | Text states replace each other at thresholds | rule |
| `cta-morph-press` | A CTA is pressed and morphs into its result | blueprint |

## Transition out

| Name | When it earns its place | Pointer |
|---|---|---|
| `cut` | The idea changes and nothing should soften it. Never every boundary | (none) |
| `push-left` | The next scene pushes this one out | transition |
| `scale-through` | The next scene arrives by scaling through this one | transition |
| `blur-dissolve` | A soft blur into the next idea | transition |
| `radial-wipe` | A radial reveal of the next scene | transition |
| `cover-up` | The next scene covers this one from below | transition |
| `whip-pan` | A fast pan with motion blur into the next scene | transition |

Two bindings are mandatory: a `[ui]` beat names `cursor-ui-demo` or another state-change rule,
never `none`; a hero reveal names `zoom-out-workspace-reveal` or `camera-journey`.
```

Before committing, confirm each transition name against the installed skill: `grep -il "<name>" ~/.claude/skills/hyperframes-animation/transitions/*.md`. Replace any name that does not exist with the nearest name from `transitions/TRANSITION-REGISTRY.md`, keeping the same count.

- [ ] **Step 4: Write the parser**

```js
// skills/video-direction/scripts/vocabulary.mjs
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const VOCABULARY_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "references",
  "motion-vocabulary.md",
);

const SECTION_KEYS = { camera: "camera", entrance: "entrance", "state change": "state", "transition out": "transition" };

export function parseVocabulary(markdown) {
  const out = { camera: new Set(), entrance: new Set(), state: new Set(), transition: new Set(), all: new Set() };
  let current = null;
  for (const line of markdown.split("\n")) {
    const h = line.match(/^## (.+)$/);
    if (h) { current = SECTION_KEYS[h[1].trim().toLowerCase()] ?? null; continue; }
    const row = line.match(/^\| `([^`]+)` \|/);
    if (row && current) { out[current].add(row[1]); out.all.add(row[1]); }
  }
  return out;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test skills/video-direction/scripts/vocabulary.test.mjs`
Expected: 3 passing

- [ ] **Step 6: Commit**

```bash
git add skills/video-direction/references/motion-vocabulary.md skills/video-direction/scripts/vocabulary.mjs skills/video-direction/scripts/vocabulary.test.mjs
git commit -m "vocabulary: the names the choreography stage may write, with a parser

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Archetype motion floors and the brand override

**Files:**
- Modify: `skills/video-direction/references/style-archetypes.md` (add a `Motion floor` field to each of the five archetypes, after `Variant axes`)
- Modify: `templates/motion-brand-template.md` (add an optional `## Motion` section)
- Create: `skills/video-direction/scripts/floors.mjs`
- Test: `skills/video-direction/scripts/floors.test.mjs`

**Interfaces:**
- Produces: `parseArchetypeFloors(markdown) -> Map<string, Floor>`, `parseBrandMotion(markdown) -> Partial<Floor> | null`, `resolveFloor(archetypeFloor, brandMotion) -> { floor: Floor, notes: string[] }`.
- `Floor = { camera: "every-scene" | "one-drift", transitions: number, rules: number, stateChange: "ui-beats" | "none", deadZone: number | null }`.

- [ ] **Step 1: Write the failing test**

```js
// skills/video-direction/scripts/floors.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseArchetypeFloors, parseBrandMotion, resolveFloor } from "./floors.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ARCHETYPES = join(here, "..", "references", "style-archetypes.md");

test("all five archetypes declare a motion floor", () => {
  const floors = parseArchetypeFloors(readFileSync(ARCHETYPES, "utf8"));
  assert.deepEqual([...floors.keys()], ["Launch Film", "Mechanism Explainer", "Kinetic Essay", "Announcement Card", "Content Hero"]);
  assert.deepEqual(floors.get("Launch Film"), { camera: "every-scene", transitions: 1, rules: 4, stateChange: "ui-beats", deadZone: 0.08 });
  assert.deepEqual(floors.get("Announcement Card"), { camera: "one-drift", transitions: 0, rules: 2, stateChange: "none", deadZone: null });
});

test("brand Motion section parses and only raises", () => {
  const brand = parseBrandMotion("# Brand\n\n## Motion\n\nrules: 6\ntransitions: 2\ndead-zone: 0.05\n");
  assert.deepEqual(brand, { rules: 6, transitions: 2, deadZone: 0.05 });
  const base = { camera: "every-scene", transitions: 1, rules: 4, stateChange: "ui-beats", deadZone: 0.08 };
  const { floor, notes } = resolveFloor(base, brand);
  assert.deepEqual(floor, { camera: "every-scene", transitions: 2, rules: 6, stateChange: "ui-beats", deadZone: 0.05 });
  assert.equal(notes.length, 0);
});

test("brand Motion section cannot lower a floor", () => {
  const base = { camera: "every-scene", transitions: 1, rules: 4, stateChange: "ui-beats", deadZone: 0.08 };
  const { floor, notes } = resolveFloor(base, { rules: 2, transitions: 0 });
  assert.equal(floor.rules, 4);
  assert.equal(floor.transitions, 1);
  assert.equal(notes.length, 2);
  assert.match(notes[0], /rules: 2 is below the archetype floor 4/);
});

test("missing brand Motion section returns null and the archetype floor applies", () => {
  assert.equal(parseBrandMotion("# Brand\n\n## Constants\n"), null);
  const base = { camera: "one-drift", transitions: 0, rules: 2, stateChange: "none", deadZone: null };
  assert.deepEqual(resolveFloor(base, null).floor, base);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test skills/video-direction/scripts/floors.test.mjs`
Expected: FAIL with "Cannot find module './floors.mjs'"

- [ ] **Step 3: Add the floor field to each archetype**

In `skills/video-direction/references/style-archetypes.md`, after each archetype's `- **Variant axes:** ...` bullet, add one bullet with this exact machine-readable form:

Launch Film:
```markdown
- **Motion floor:** `camera=every-scene; transitions=1; rules=4; state-change=ui-beats; dead-zone=0.08`
  A camera move in every scene, at least one named transition, at least four distinct rules,
  a state change in every `[ui]` beat, dead zones under 8% of runtime.
```
Mechanism Explainer:
```markdown
- **Motion floor:** `camera=every-scene; transitions=1; rules=4; state-change=ui-beats; dead-zone=0.08`
  Panel scenes with content-level motion count as a camera move (a `[ui]` state change on the panel).
```
Kinetic Essay:
```markdown
- **Motion floor:** `camera=every-scene; transitions=1; rules=3; state-change=none; dead-zone=0.05`
```
Announcement Card:
```markdown
- **Motion floor:** `camera=one-drift; transitions=0; rules=2; state-change=none; dead-zone=none`
  One drift, the charm plus one entrance rule. The held frame is the point, so no dead-zone cap.
```
Content Hero:
```markdown
- **Motion floor:** `camera=one-drift; transitions=0; rules=2; state-change=none; dead-zone=none`
```

In `templates/motion-brand-template.md`, after the Delivery section, add:

```markdown
## Motion (optional)

A brand may raise the motion floor for every archetype. It may not lower one. Keys, one per
line: `rules: <n>`, `transitions: <n>`, `dead-zone: <fraction>`. Leave the section out to
accept each archetype's own floor (see `references/style-archetypes.md`).
```

- [ ] **Step 4: Write the parsers**

```js
// skills/video-direction/scripts/floors.mjs
const CAMERA = new Set(["every-scene", "one-drift"]);
const STATE = new Set(["ui-beats", "none"]);

function parseFloorString(s) {
  const floor = { camera: null, transitions: 0, rules: 0, stateChange: "none", deadZone: null };
  for (const part of s.split(";")) {
    const [k, v] = part.split("=").map((x) => x.trim());
    if (k === "camera" && CAMERA.has(v)) floor.camera = v;
    else if (k === "transitions") floor.transitions = Number(v);
    else if (k === "rules") floor.rules = Number(v);
    else if (k === "state-change" && STATE.has(v)) floor.stateChange = v;
    else if (k === "dead-zone") floor.deadZone = v === "none" ? null : Number(v);
  }
  if (!floor.camera) throw new Error(`floor string missing camera: ${s}`);
  return floor;
}

export function parseArchetypeFloors(markdown) {
  const floors = new Map();
  let current = null;
  for (const line of markdown.split("\n")) {
    const h = line.match(/^## \d+\. (.+)$/);
    if (h) current = h[1].trim();
    const f = line.match(/^- \*\*Motion floor:\*\* `([^`]+)`/);
    if (f && current) floors.set(current, parseFloorString(f[1]));
  }
  return floors;
}

export function parseBrandMotion(markdown) {
  const m = markdown.match(/^## Motion[^\n]*\n([\s\S]*?)(?=^## |\s*$(?![\s\S]))/m);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^\s*(rules|transitions|dead-zone)\s*:\s*([0-9.]+)\s*$/);
    if (!kv) continue;
    const key = kv[1] === "dead-zone" ? "deadZone" : kv[1];
    out[key] = Number(kv[2]);
  }
  return Object.keys(out).length ? out : null;
}

export function resolveFloor(archetypeFloor, brandMotion) {
  const floor = { ...archetypeFloor };
  const notes = [];
  if (!brandMotion) return { floor, notes };
  for (const key of ["rules", "transitions"]) {
    if (brandMotion[key] == null) continue;
    if (brandMotion[key] < floor[key]) notes.push(`brand Motion ${key}: ${brandMotion[key]} is below the archetype floor ${floor[key]}; archetype floor applies`);
    else floor[key] = brandMotion[key];
  }
  if (brandMotion.deadZone != null) {
    if (floor.deadZone != null && brandMotion.deadZone > floor.deadZone) notes.push(`brand Motion dead-zone: ${brandMotion.deadZone} is looser than the archetype cap ${floor.deadZone}; archetype cap applies`);
    else floor.deadZone = brandMotion.deadZone;
  }
  return { floor, notes };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test skills/video-direction/scripts/floors.test.mjs`
Expected: 4 passing

- [ ] **Step 6: Commit**

```bash
git add skills/video-direction/references/style-archetypes.md templates/motion-brand-template.md skills/video-direction/scripts/floors.mjs skills/video-direction/scripts/floors.test.mjs
git commit -m "floors: a motion floor per archetype, a brand may raise it and never lower it

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: The boards parser and the choreography lint

**Files:**
- Modify: `templates/production-doc-template.md` (the `boards.md` section: four new columns, the `[ui]` marker, the stage 3b block)
- Create: `skills/video-direction/scripts/boards.mjs`
- Test: `skills/video-direction/scripts/boards.test.mjs`

**Interfaces:**
- Consumes: `parseVocabulary` from Task 1.
- Produces: `parseBoards(markdown) -> Beat[]` where `Beat = { n: number, start: number, role: string, content: string, ui: boolean, camera: string, entrance: string, state: string, transition: string }`; `lintChoreography(beats, vocabulary, signatureMoves: string[]) -> { pass: boolean, problems: string[] }`.

- [ ] **Step 1: Write the failing test**

```js
// skills/video-direction/scripts/boards.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { parseBoards, lintChoreography } from "./boards.mjs";

const VOCAB = {
  camera: new Set(["hold", "multi-phase-camera", "zoom-out-workspace-reveal"]),
  entrance: new Set(["press-release-spring", "kinetic-beat-slam"]),
  state: new Set(["none", "cursor-ui-demo"]),
  transition: new Set(["cut", "push-left"]),
  all: new Set(["hold", "multi-phase-camera", "zoom-out-workspace-reveal", "press-release-spring", "kinetic-beat-slam", "none", "cursor-ui-demo", "cut", "push-left"]),
};

const GOOD = `# Boards
| # | Start | Role | Content | Camera | Entrance | State change | Transition out |
|---|---|---|---|---|---|---|---|
| 1 | 0.0s | setup | Cold open on the composer | zoom-out-workspace-reveal | press-release-spring | none | push-left |
| 2 | 4.0s | turn | [ui] The model picker opens | multi-phase-camera | kinetic-beat-slam | cursor-ui-demo | cut |
| 3 | 8.0s | resolve | Wordmark | hold | press-release-spring | none | cut |
`;

test("parses beats with the four motion columns and the ui marker", () => {
  const beats = parseBoards(GOOD);
  assert.equal(beats.length, 3);
  assert.deepEqual(beats[1], { n: 2, start: 4, role: "turn", content: "The model picker opens", ui: true, camera: "multi-phase-camera", entrance: "kinetic-beat-slam", state: "cursor-ui-demo", transition: "cut" });
  assert.equal(beats[0].ui, false);
});

test("good boards pass the lint", () => {
  const { pass, problems } = lintChoreography(parseBoards(GOOD), VOCAB, ["multi-phase-camera"]);
  assert.equal(pass, true, problems.join("; "));
});

test("a short row fails with the beat named, not a throw", () => {
  const md = GOOD.replace("| 3 | 8.0s | resolve | Wordmark | hold | press-release-spring | none | cut |", "| 3 | 8.0s | resolve | Wordmark | hold |");
  const { pass, problems } = lintChoreography(parseBoards(md), VOCAB, []);
  assert.equal(pass, false);
  assert.match(problems.join("\n"), /beat 3 .*missing/i);
});

test("unknown names, hold everywhere, cut everywhere, ui with none, unused signature move", () => {
  const md = `# B
| # | Start | Role | Content | Camera | Entrance | State change | Transition out |
|---|---|---|---|---|---|---|---|
| 1 | 0.0s | setup | a | hold | press-release-spring | none | cut |
| 2 | 3.0s | turn | [ui] b | hold | orbit-of-doom | none | cut |
`;
  const { pass, problems } = lintChoreography(parseBoards(md), VOCAB, ["multi-phase-camera"]);
  assert.equal(pass, false);
  const text = problems.join("\n");
  assert.match(text, /orbit-of-doom/);
  assert.match(text, /hold in every camera cell/);
  assert.match(text, /cut at every boundary/);
  assert.match(text, /beat 2 is \[ui\] .*none/);
  assert.match(text, /signature move multi-phase-camera/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test skills/video-direction/scripts/boards.test.mjs`
Expected: FAIL with "Cannot find module './boards.mjs'"

- [ ] **Step 3: Write the parser and lint**

```js
// skills/video-direction/scripts/boards.mjs
const HEADER = ["#", "start", "role", "content", "camera", "entrance", "state change", "transition out"];

function cells(line) {
  return line.split("|").slice(1, -1).map((c) => c.trim());
}

export function parseBoards(markdown) {
  const lines = markdown.split("\n");
  const hi = lines.findIndex((l) => {
    const c = cells(l).map((x) => x.toLowerCase());
    return c.length >= 8 && HEADER.every((h, i) => c[i] === h);
  });
  if (hi < 0) return [];
  const beats = [];
  for (let i = hi + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("|")) break;
    const c = cells(line);
    const n = Number(c[0]);
    if (!Number.isInteger(n)) continue;
    const content = c[3] ?? "";
    const ui = /^\[ui\]\s*/i.test(content);
    beats.push({
      n,
      start: Number(String(c[1] ?? "").replace(/s$/, "")),
      role: c[2] ?? "",
      content: content.replace(/^\[ui\]\s*/i, ""),
      ui,
      camera: c[4] ?? "",
      entrance: c[5] ?? "",
      state: c[6] ?? "",
      transition: c[7] ?? "",
      _cells: c.length,
    });
  }
  return beats;
}

export function lintChoreography(beats, vocabulary, signatureMoves = []) {
  const problems = [];
  if (!beats.length) problems.push("no choreography table found (header must be # | Start | Role | Content | Camera | Entrance | State change | Transition out)");
  for (const b of beats) {
    if (b._cells < 8) { problems.push(`beat ${b.n} is missing motion cells (has ${b._cells} of 8)`); continue; }
    for (const [col, set] of [["camera", vocabulary.camera], ["entrance", vocabulary.entrance], ["state", vocabulary.state], ["transition", vocabulary.transition]]) {
      if (!set.has(b[col])) problems.push(`beat ${b.n} ${col} "${b[col]}" is not in the motion vocabulary`);
    }
    if (b.ui && b.state === "none") problems.push(`beat ${b.n} is [ui] but its state change is none`);
  }
  const full = beats.filter((b) => b._cells >= 8);
  if (full.length && full.every((b) => b.camera === "hold")) problems.push("hold in every camera cell; at least one beat must move");
  if (full.length > 1 && full.every((b) => b.transition === "cut")) problems.push("cut at every boundary; at least one named transition");
  const used = new Set(full.flatMap((b) => [b.camera, b.entrance, b.state, b.transition]));
  for (const move of signatureMoves) if (!used.has(move)) problems.push(`signature move ${move} from style direction is never choreographed`);
  return { pass: problems.length === 0, problems };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test skills/video-direction/scripts/boards.test.mjs`
Expected: 4 passing

- [ ] **Step 5: Update the production-doc template**

In `templates/production-doc-template.md`, replace the `boards.md` table and its column definitions with:

```markdown
| # | Start | Role | Content | Camera | Entrance | State change | Transition out |
|---|---|---|---|---|---|---|---|
| 1 | 0.0s | | | | | | |

- **#** — the beat number. The composition's scene clip for this beat carries `id="beat-<#>"`.
- **Start** — when the beat begins, in seconds with the unit (`4.0s`).
- **Role** — narrative styles: the story-spine role (setup / turn / transfer / bridge /
  evidence / thesis / resolve). Static styles: the zone or reading-order position.
- **Content** — what is on screen. **Begin the cell with `[ui]` when the beat shows an
  interface**; that marker is what the motion floor reads.
- **Camera, Entrance, State change, Transition out** — filled at **stage 3b** by the Motion
  Designer, every cell a name from `references/motion-vocabulary.md`. `hold`, `none` and `cut`
  are names too; a piece never uses `hold` in every camera cell or `cut` at every boundary,
  and a `[ui]` beat never has `none` for its state change.

**Stage 3b, choreography.** After the beats are timed and before styleframes: fill the four
motion columns; make sure every signature move from `style.md` appears in them; read
`style-ledger.md`'s Rules used column and pick at least two names not used in the brand's
last two videos; write one line under the table naming the piece's **motion signature**, the
recurring move a viewer will remember. Two bindings are mandatory: a `[ui]` beat names
`cursor-ui-demo` or another state-change rule; a hero reveal names
`zoom-out-workspace-reveal` or `camera-journey`.
```

Keep the structure-check paragraphs that follow unchanged.

- [ ] **Step 6: Commit**

```bash
git add templates/production-doc-template.md skills/video-direction/scripts/boards.mjs skills/video-direction/scripts/boards.test.mjs
git commit -m "boards: four motion columns per beat, the [ui] marker, and the choreography lint

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: The composition parser (clips, cameras, rule stamps, transitions)

**Files:**
- Create: `skills/video-direction/scripts/composition.mjs`
- Test: `skills/video-direction/scripts/composition.test.mjs`

**Interfaces:**
- Produces: `parseComposition(html) -> { clips: Clip[] }` where `Clip = { id: string, n: number | null, start: number, end: number, transition: string | null, cameraId: string | null, stamps: { id: string, rule: string }[] }`.
- Convention (also written into the build contract in Task 7): scene clips are `class="clip"` elements with `id="beat-<n>"`, `data-start`, `data-duration`, optional `data-transition="<name>"`; the camera wrapper inside a scene has `id="cam-beat-<n>"`; rule-owning elements carry `id` and `data-rule`.

- [ ] **Step 1: Write the failing test**

```js
// skills/video-direction/scripts/composition.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { parseComposition } from "./composition.mjs";

const HTML = `
<div id="root" data-width="1920" data-height="1080">
  <section id="beat-1" class="clip" data-start="0" data-duration="4" data-transition="push-left">
    <div id="cam-beat-1" class="camera">
      <h1 id="h1" data-rule="press-release-spring">Every top model.</h1>
    </div>
  </section>
  <section id="beat-2" class="clip" data-start="3.5" data-duration="4.5">
    <div id="cam-beat-2" class="camera">
      <div id="picker" data-rule="cursor-ui-demo"></div>
      <div id="ripple" data-rule="cursor-click-ripple"></div>
    </div>
  </section>
  <section id="beat-3" class="clip" data-start="8" data-duration="3">
    <div id="wordmark" data-rule="press-release-spring"></div>
  </section>
</div>`;

test("parses clips, cameras, stamps and transitions in order", () => {
  const { clips } = parseComposition(HTML);
  assert.equal(clips.length, 3);
  assert.deepEqual(clips[0], { id: "beat-1", n: 1, start: 0, end: 4, transition: "push-left", cameraId: "cam-beat-1", stamps: [{ id: "h1", rule: "press-release-spring" }] });
  assert.equal(clips[1].transition, null);
  assert.deepEqual(clips[1].stamps.map((s) => s.rule), ["cursor-ui-demo", "cursor-click-ripple"]);
  assert.equal(clips[2].cameraId, null);
  assert.equal(clips[2].n, 3);
});

test("a stamp without an id is reported, not silently dropped", () => {
  const html = `<section id="beat-1" class="clip" data-start="0" data-duration="2"><div data-rule="press-release-spring"></div></section>`;
  const { clips, problems } = parseComposition(html);
  assert.equal(clips[0].stamps.length, 0);
  assert.match(problems[0], /data-rule="press-release-spring" has no id/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test skills/video-direction/scripts/composition.test.mjs`
Expected: FAIL with "Cannot find module './composition.mjs'"

- [ ] **Step 3: Write the parser**

```js
// skills/video-direction/scripts/composition.mjs
const TAG = /<([a-zA-Z][\w-]*)\b([^>]*)>/g;

function attr(attrs, name) {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`));
  return m ? m[1] : null;
}

export function parseComposition(html) {
  const clips = [];
  const problems = [];
  let current = null;
  for (const m of html.matchAll(TAG)) {
    const attrs = m[2];
    const cls = attr(attrs, "class") ?? "";
    const id = attr(attrs, "id");
    const rule = attr(attrs, "data-rule");
    if (/\bclip\b/.test(cls) && attr(attrs, "data-start") !== null) {
      const start = Number(attr(attrs, "data-start"));
      const dur = Number(attr(attrs, "data-duration") ?? 0);
      const n = id?.match(/^beat-(\d+)$/);
      current = { id: id ?? `(clip at ${m.index})`, n: n ? Number(n[1]) : null, start, end: +(start + dur).toFixed(3), transition: attr(attrs, "data-transition"), cameraId: null, stamps: [] };
      clips.push(current);
      continue;
    }
    if (!current) continue;
    if (/\bcamera\b|\bworld\b/.test(cls) && id && !current.cameraId) current.cameraId = id;
    if (rule) {
      if (!id) problems.push(`element with data-rule="${rule}" has no id inside ${current.id}; the map cannot find it`);
      else current.stamps.push({ id, rule });
    }
  }
  return { clips, problems };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test skills/video-direction/scripts/composition.test.mjs`
Expected: 2 passing

- [ ] **Step 5: Commit**

```bash
git add skills/video-direction/scripts/composition.mjs skills/video-direction/scripts/composition.test.mjs
git commit -m "composition: read clips, cameras, rule stamps and transitions from the HTML

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: The floor evaluator, with the five false-green states

**Files:**
- Create: `skills/video-direction/scripts/evaluate.mjs`
- Test: `skills/video-direction/scripts/evaluate.test.mjs`

**Interfaces:**
- Consumes: `Beat[]` (Task 3), `{ clips }` (Task 4), `Floor` (Task 2), and an animation map object with the shape the skill's script writes: `{ duration, totalTweens, mappedTweens, tweens: [{ selector, props, start, end, flags, summary }], deadZones: [{ start, end, duration }] }`.
- Produces: `evaluateFloor({ map, composition, beats, floor }) -> { pass: boolean, checks: Check[] }` where `Check = { name: string, pass: boolean, evidence: string }`; and `MOVE_PROPS` (the set of transform properties that count as a camera move).

- [ ] **Step 1: Write the failing test**

```js
// skills/video-direction/scripts/evaluate.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { evaluateFloor } from "./evaluate.mjs";

const LAUNCH = { camera: "every-scene", transitions: 1, rules: 4, stateChange: "ui-beats", deadZone: 0.08 };
const ESSAY = { camera: "every-scene", transitions: 1, rules: 3, stateChange: "none", deadZone: 0.05 };

const beats = [
  { n: 1, start: 0, role: "setup", content: "open", ui: false, camera: "zoom-out-workspace-reveal", entrance: "press-release-spring", state: "none", transition: "push-left" },
  { n: 2, start: 4, role: "turn", content: "picker", ui: true, camera: "multi-phase-camera", entrance: "kinetic-beat-slam", state: "cursor-ui-demo", transition: "cut" },
  { n: 3, start: 8, role: "resolve", content: "wordmark", ui: false, camera: "hold", entrance: "logo-assemble-lockup", state: "none", transition: "cut" },
];
const composition = { clips: [
  { id: "beat-1", n: 1, start: 0, end: 4.5, transition: "push-left", cameraId: "cam-beat-1", stamps: [{ id: "h1", rule: "press-release-spring" }] },
  { id: "beat-2", n: 2, start: 4, end: 8, transition: null, cameraId: "cam-beat-2", stamps: [{ id: "picker", rule: "cursor-ui-demo" }, { id: "slam", rule: "kinetic-beat-slam" }] },
  { id: "beat-3", n: 3, start: 8, end: 11, transition: null, cameraId: "cam-beat-3", stamps: [{ id: "mark", rule: "logo-assemble-lockup" }] },
] };
const tween = (selector, props, start, end, flags = []) => ({ selector, props, start, end, flags, summary: `${selector} ${props.join(",")}` });
const goodMap = () => ({ duration: 11, totalTweens: 8, mappedTweens: 8, deadZones: [], tweens: [
  tween("#cam-beat-1", ["scale", "x"], 0, 3),
  tween("#h1", ["opacity", "y"], 0.2, 1),
  tween("#cam-beat-2", ["scale"], 4, 6),
  tween("#picker", ["opacity"], 4.2, 5),
  tween("#slam", ["scale"], 4.5, 5.2),
  tween("#mark", ["opacity", "scale"], 8.2, 9.5),
] });

test("a full composition passes the Launch Film floor", () => {
  const r = evaluateFloor({ map: goodMap(), composition, beats, floor: LAUNCH });
  assert.equal(r.pass, true, JSON.stringify(r.checks.filter((c) => !c.pass)));
});

test("false green 1: an empty map is FAIL not measured", () => {
  const r = evaluateFloor({ map: { duration: 11, totalTweens: 0, mappedTweens: 0, tweens: [], deadZones: [] }, composition, beats, floor: LAUNCH });
  assert.equal(r.pass, false);
  assert.equal(r.checks.find((c) => c.name === "measured").pass, false);
});

test("false green 2: a missing map is FAIL not measured", () => {
  const r = evaluateFloor({ map: null, composition, beats, floor: LAUNCH });
  assert.equal(r.pass, false);
  assert.match(r.checks[0].evidence, /not measured/);
});

test("false green 3: a declared rule with no tweens fails", () => {
  const map = goodMap();
  map.tweens = map.tweens.filter((t) => t.selector !== "#picker");
  const r = evaluateFloor({ map, composition, beats, floor: LAUNCH });
  assert.equal(r.pass, false);
  assert.match(r.checks.find((c) => c.name === "stamps carry motion").evidence, /#picker \(cursor-ui-demo\) has no tween/);
});

test("false green 4: a camera wrapper that never moves fails, opacity does not count", () => {
  const map = goodMap();
  map.tweens = map.tweens.map((t) => (t.selector === "#cam-beat-2" ? tween("#cam-beat-2", ["opacity"], 4, 6) : t));
  const r = evaluateFloor({ map, composition, beats, floor: LAUNCH });
  assert.equal(r.pass, false);
  assert.match(r.checks.find((c) => c.name === "camera").evidence, /beat 2 camera #cam-beat-2 has no transform tween/);
});

test("false green 5: under the distinct-rules floor while everything else passes", () => {
  const r = evaluateFloor({ map: goodMap(), composition, beats, floor: { ...LAUNCH, rules: 5 } });
  assert.equal(r.pass, false);
  assert.match(r.checks.find((c) => c.name === "distinct rules").evidence, /4 of 5/);
});

test("a [ui] beat with state none fails Launch Film and passes Kinetic Essay", () => {
  const b = beats.map((x) => (x.n === 2 ? { ...x, state: "none" } : x));
  assert.equal(evaluateFloor({ map: goodMap(), composition, beats: b, floor: LAUNCH }).checks.find((c) => c.name === "state change").pass, false);
  assert.equal(evaluateFloor({ map: goodMap(), composition, beats: b, floor: ESSAY }).checks.find((c) => c.name === "state change").pass, true);
});

test("transitions need an overlap window; dead zones and map flags fail", () => {
  const noOverlap = { clips: composition.clips.map((c) => (c.id === "beat-1" ? { ...c, end: 4 } : c)) };
  assert.equal(evaluateFloor({ map: goodMap(), composition: noOverlap, beats, floor: LAUNCH }).checks.find((c) => c.name === "transitions").pass, false);
  const dead = goodMap(); dead.deadZones = [{ start: 9.5, end: 11, duration: 1.5 }];
  assert.equal(evaluateFloor({ map: dead, composition, beats, floor: LAUNCH }).checks.find((c) => c.name === "dead zones").pass, false);
  const flagged = goodMap(); flagged.tweens[1].flags = ["offscreen"];
  const r = evaluateFloor({ map: flagged, composition, beats, floor: LAUNCH });
  assert.equal(r.checks.find((c) => c.name === "map flags").pass, false);
  assert.match(r.checks.find((c) => c.name === "map flags").evidence, /offscreen/);
});

test("Announcement Card floor: one drift anywhere, no transitions required", () => {
  const card = { camera: "one-drift", transitions: 0, rules: 2, stateChange: "none", deadZone: null };
  const b = [{ n: 1, start: 0, role: "card", content: "held", ui: false, camera: "hold", entrance: "press-release-spring", state: "none", transition: "cut" }];
  const comp = { clips: [{ id: "beat-1", n: 1, start: 0, end: 11, transition: null, cameraId: "cam-beat-1", stamps: [{ id: "charm", rule: "particle-burst" }, { id: "price", rule: "press-release-spring" }] }] };
  const map = { duration: 11, totalTweens: 3, mappedTweens: 3, deadZones: [{ start: 8, end: 11, duration: 3 }], tweens: [tween("#cam-beat-1", ["scale"], 0, 11), tween("#charm", ["scale"], 2, 4), tween("#price", ["opacity", "y"], 6, 7)] };
  assert.equal(evaluateFloor({ map, composition: comp, beats: b, floor: card }).pass, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test skills/video-direction/scripts/evaluate.test.mjs`
Expected: FAIL with "Cannot find module './evaluate.mjs'"

- [ ] **Step 3: Write the evaluator**

```js
// skills/video-direction/scripts/evaluate.mjs
export const MOVE_PROPS = new Set(["x", "y", "z", "scale", "scaleX", "scaleY", "xPercent", "yPercent", "rotation", "rotate", "rotationX", "rotationY", "transform"]);
const BAD_FLAGS = new Set(["offscreen", "invisible", "degenerate", "collision"]);

const overlaps = (t, a, b) => t.start < b && t.end > a;

export function evaluateFloor({ map, composition, beats, floor }) {
  const checks = [];
  const add = (name, pass, evidence) => checks.push({ name, pass, evidence });

  if (!map || !Array.isArray(map.tweens) || map.mappedTweens === 0 || map.tweens.length === 0) {
    add("measured", false, "not measured: no animation map or zero mapped tweens; nothing below can be trusted");
    return { pass: false, checks };
  }
  add("measured", true, `${map.mappedTweens} tweens mapped over ${map.duration}s`);

  const clipByN = new Map(composition.clips.map((c) => [c.n, c]));
  const tweensFor = (sel) => map.tweens.filter((t) => t.selector === sel);

  // camera
  const camProblems = [];
  let moves = 0;
  for (const b of beats) {
    const clip = clipByN.get(b.n);
    if (!clip) { camProblems.push(`beat ${b.n} has no clip id="beat-${b.n}"`); continue; }
    if (b.camera === "hold") continue;
    const moving = clip.cameraId && tweensFor(`#${clip.cameraId}`).some((t) => t.props.some((p) => MOVE_PROPS.has(p)) && overlaps(t, clip.start, clip.end));
    if (moving) moves++;
    else camProblems.push(`beat ${b.n} camera ${clip.cameraId ? "#" + clip.cameraId : "(none)"} has no transform tween in its window`);
  }
  if (floor.camera === "every-scene") add("camera", camProblems.length === 0, camProblems.length ? camProblems.join("; ") : `${moves} scenes move, holds declared: ${beats.filter((b) => b.camera === "hold").length}`);
  else add("camera", moves >= 1 || composition.clips.some((c) => c.cameraId && tweensFor(`#${c.cameraId}`).some((t) => t.props.some((p) => MOVE_PROPS.has(p)))), moves >= 1 ? "one drift present" : "no camera drift anywhere");

  // stamps carry motion, and declared names are stamped
  const stampProblems = [];
  const liveRules = new Set();
  for (const b of beats) {
    const clip = clipByN.get(b.n);
    if (!clip) continue;
    const declared = [b.entrance, b.state, b.camera].filter((x) => x && !["hold", "none"].includes(x));
    for (const s of clip.stamps) {
      if (tweensFor(`#${s.id}`).length) liveRules.add(s.rule);
      else stampProblems.push(`#${s.id} (${s.rule}) has no tween`);
    }
    const stampedRules = new Set(clip.stamps.map((s) => s.rule));
    for (const d of declared) {
      const cameraName = d === b.camera;
      if (cameraName && clip.cameraId) continue; // camera rules are proven by the camera check
      if (!stampedRules.has(d)) stampProblems.push(`beat ${b.n} declares ${d} but no element carries data-rule="${d}"`);
    }
  }
  add("stamps carry motion", stampProblems.length === 0, stampProblems.length ? stampProblems.join("; ") : `${liveRules.size} stamped rules all animate`);

  // distinct rules
  const cameraRules = new Set(beats.filter((b) => b.camera !== "hold").map((b) => b.camera));
  const distinct = new Set([...liveRules, ...(moves ? cameraRules : [])]);
  add("distinct rules", distinct.size >= floor.rules, `${distinct.size} of ${floor.rules}: ${[...distinct].join(", ")}`);

  // transitions
  const sorted = [...composition.clips].sort((a, b) => a.start - b.start);
  let overlapsCount = 0;
  const transitionProblems = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const beat = beats.find((b) => b.n === sorted[i].n);
    const declaredName = beat?.transition && beat.transition !== "cut";
    const hasOverlap = sorted[i + 1].start < sorted[i].end;
    if (declaredName && hasOverlap) overlapsCount++;
    else if (declaredName) transitionProblems.push(`beat ${sorted[i].n} declares ${beat.transition} but clip beat-${sorted[i + 1].n} starts at ${sorted[i + 1].start}, after beat-${sorted[i].n} ends at ${sorted[i].end}; no overlap window`);
  }
  add("transitions", overlapsCount >= floor.transitions && transitionProblems.length === 0, transitionProblems.length ? transitionProblems.join("; ") : `${overlapsCount} of ${floor.transitions} named transitions with overlap`);

  // state change
  if (floor.stateChange === "ui-beats") {
    const uiProblems = [];
    for (const b of beats.filter((x) => x.ui)) {
      const clip = clipByN.get(b.n);
      const ok = b.state !== "none" && clip?.stamps.some((s) => s.rule === b.state && tweensFor(`#${s.id}`).some((t) => t.selector !== `#${clip.cameraId}`));
      if (!ok) uiProblems.push(`beat ${b.n} is [ui] with state change "${b.state}" and no animating stamp for it`);
    }
    add("state change", uiProblems.length === 0, uiProblems.length ? uiProblems.join("; ") : `${beats.filter((x) => x.ui).length} [ui] beats each change state`);
  } else add("state change", true, "not required by this floor");

  // dead zones
  if (floor.deadZone != null) {
    const dead = (map.deadZones ?? []).reduce((a, z) => a + (z.duration ?? z.end - z.start), 0);
    const frac = map.duration ? dead / map.duration : 1;
    add("dead zones", frac <= floor.deadZone, `${(frac * 100).toFixed(1)}% dead against a ${(floor.deadZone * 100).toFixed(0)}% cap`);
  } else add("dead zones", true, "no cap for this floor");

  // map flags
  const flagged = map.tweens.filter((t) => (t.flags ?? []).some((f) => BAD_FLAGS.has(f)));
  add("map flags", flagged.length === 0, flagged.length ? flagged.map((t) => `${t.selector}: ${t.flags.join(",")} (${t.summary})`).join("; ") : "no offscreen, invisible, degenerate or colliding tweens");

  return { pass: checks.every((c) => c.pass), checks };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test skills/video-direction/scripts/evaluate.test.mjs`
Expected: 9 passing

- [ ] **Step 5: Commit**

```bash
git add skills/video-direction/scripts/evaluate.mjs skills/video-direction/scripts/evaluate.test.mjs
git commit -m "evaluate: the motion floor as counts, with the five false-green states pinned

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: The `motion-floor` CLI, running the animation map

**Files:**
- Create: `skills/video-direction/scripts/motion-floor.mjs`
- Test: `skills/video-direction/scripts/motion-floor.test.mjs`
- Create: `skills/video-direction/scripts/fixtures/fake-animation-map.mjs` (a stand-in for the skill's script, used only by tests)

**Interfaces:**
- Consumes: Tasks 1 to 5.
- CLI: `node skills/video-direction/scripts/motion-floor.mjs --piece video-work/<slug> [--brand motion-brand.md] [--animation-map <path>]`. Reads `<piece>/boards.md`, `<piece>/style.md` (archetype from the line `**Style from the roster:** <name>`), `<piece>/composition/index.html`. Writes `<piece>/composition/.hyperframes/anim-map/motion-floor.json`. Exit 0 on pass, 1 on fail, 2 on usage error.
- Env: `HF_ANIMATION_MAP` overrides the script path; otherwise `~/.claude/skills/hyperframes-animation/scripts/animation-map.mjs`, then `~/.agents/skills/hyperframes-animation/scripts/animation-map.mjs`.
- Produces for Task 7's SKILL.md text: the one-screen summary format `MOTION FLOOR <archetype>: PASS|FAIL` followed by one line per check `  [ok|FAIL] <name>: <evidence>`.

- [ ] **Step 1: Write the fake map script and the failing test**

```js
// skills/video-direction/scripts/fixtures/fake-animation-map.mjs
// Test stand-in for the hyperframes-animation animation-map script.
// Usage: node fake-animation-map.mjs <composition-dir> --out <dir>
// Env FAKE_MAP_MODE: "good" (default) | "empty" | "crash"
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const args = process.argv.slice(2);
const out = args[args.indexOf("--out") + 1];
const mode = process.env.FAKE_MAP_MODE ?? "good";
if (mode === "crash") { console.error("boom"); process.exit(1); }
mkdirSync(out, { recursive: true });
const tween = (selector, props, start, end) => ({ selector, props, start, end, flags: [], summary: selector });
const good = { duration: 11, totalTweens: 6, mappedTweens: 6, deadZones: [], tweens: [
  tween("#cam-beat-1", ["scale", "x"], 0, 3), tween("#h1", ["opacity", "y"], 0.2, 1),
  tween("#cam-beat-2", ["scale"], 4, 6), tween("#picker", ["opacity"], 4.2, 5), tween("#slam", ["scale"], 4.5, 5.2),
  tween("#mark", ["opacity", "scale"], 8.2, 9.5),
] };
const empty = { duration: 11, totalTweens: 0, mappedTweens: 0, deadZones: [], tweens: [] };
writeFileSync(join(out, "animation-map.json"), JSON.stringify(mode === "empty" ? empty : good));
```

```js
// skills/video-direction/scripts/motion-floor.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const CLI = join(here, "motion-floor.mjs");
const FAKE = join(here, "fixtures", "fake-animation-map.mjs");

function makePiece() {
  const dir = mkdtempSync(join(tmpdir(), "piece-"));
  mkdirSync(join(dir, "composition"), { recursive: true });
  writeFileSync(join(dir, "style.md"), "# Style\n\n**Style from the roster:** Launch Film.\n**Signature moves (2–3 chosen):**\n1. multi-phase-camera\n");
  writeFileSync(join(dir, "boards.md"), `# Boards
| # | Start | Role | Content | Camera | Entrance | State change | Transition out |
|---|---|---|---|---|---|---|---|
| 1 | 0.0s | setup | open | zoom-out-workspace-reveal | press-release-spring | none | push-left |
| 2 | 4.0s | turn | [ui] picker | multi-phase-camera | kinetic-beat-slam | cursor-ui-demo | cut |
| 3 | 8.0s | resolve | wordmark | hold | logo-assemble-lockup | none | cut |
`);
  writeFileSync(join(dir, "composition", "index.html"), `<div id="root">
<section id="beat-1" class="clip" data-start="0" data-duration="4.5" data-transition="push-left"><div id="cam-beat-1" class="camera"><h1 id="h1" data-rule="press-release-spring">x</h1></div></section>
<section id="beat-2" class="clip" data-start="4" data-duration="4"><div id="cam-beat-2" class="camera"><div id="picker" data-rule="cursor-ui-demo"></div><div id="slam" data-rule="kinetic-beat-slam"></div></div></section>
<section id="beat-3" class="clip" data-start="8" data-duration="3"><div id="cam-beat-3" class="camera"><div id="mark" data-rule="logo-assemble-lockup"></div></div></section>
</div>`);
  return dir;
}

function run(piece, env = {}) {
  return spawnSync(process.execPath, [CLI, "--piece", piece, "--animation-map", FAKE], { encoding: "utf8", env: { ...process.env, ...env } });
}

test("passes on a good piece and writes motion-floor.json", () => {
  const piece = makePiece();
  const r = run(piece);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /MOTION FLOOR Launch Film: PASS/);
  const out = JSON.parse(readFileSync(join(piece, "composition", ".hyperframes", "anim-map", "motion-floor.json"), "utf8"));
  assert.equal(out.pass, true);
  assert.equal(out.archetype, "Launch Film");
});

test("an empty map is FAIL not measured, exit 1", () => {
  const r = run(makePiece(), { FAKE_MAP_MODE: "empty" });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /FAIL\] measured: not measured/);
});

test("a crashing map script is FAIL not measured with the fix named, exit 1", () => {
  const piece = makePiece();
  const r = run(piece, { FAKE_MAP_MODE: "crash" });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /not measured/);
  assert.match(r.stdout, /npx hyperframes skills update/);
  assert.ok(existsSync(join(piece, "composition", ".hyperframes", "anim-map", "motion-floor.json")));
});

test("a missing animation-map script is FAIL not measured, exit 1", () => {
  const r = spawnSync(process.execPath, [CLI, "--piece", makePiece(), "--animation-map", "/nonexistent/animation-map.mjs"], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /not measured/);
});

test("choreography lint failures stop before measuring", () => {
  const piece = makePiece();
  writeFileSync(join(piece, "boards.md"), "# Boards\n\n| Start | Role | Content |\n|---|---|---|\n| 0.0s | setup | x |\n");
  const r = run(piece);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /no choreography table/);
});

test("usage error without --piece exits 2", () => {
  const r = spawnSync(process.execPath, [CLI], { encoding: "utf8" });
  assert.equal(r.status, 2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test skills/video-direction/scripts/motion-floor.test.mjs`
Expected: FAIL with "Cannot find module './motion-floor.mjs'" (spawn returns status 1 and stdout empty; the first assertion fails)

- [ ] **Step 3: Write the CLI**

```js
#!/usr/bin/env node
// skills/video-direction/scripts/motion-floor.mjs
// The motion critic. Runs after `npx hyperframes check` and before `npx hyperframes render`.
// Usage: node motion-floor.mjs --piece video-work/<slug> [--brand motion-brand.md] [--animation-map <path>]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseVocabulary, VOCABULARY_PATH } from "./vocabulary.mjs";
import { parseArchetypeFloors, parseBrandMotion, resolveFloor } from "./floors.mjs";
import { parseBoards, lintChoreography } from "./boards.mjs";
import { parseComposition } from "./composition.mjs";
import { evaluateFloor } from "./evaluate.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const piece = opt("--piece");
if (!piece) { console.error("usage: motion-floor.mjs --piece video-work/<slug> [--brand motion-brand.md] [--animation-map <path>]"); process.exit(2); }

const compDir = join(piece, "composition");
const outDir = join(compDir, ".hyperframes", "anim-map");
mkdirSync(outDir, { recursive: true });

function finish(archetype, result, extra = {}) {
  const record = { piece, archetype, pass: result.pass, checks: result.checks, ...extra, at: new Date().toISOString() };
  writeFileSync(join(outDir, "motion-floor.json"), JSON.stringify(record, null, 2));
  console.log(`MOTION FLOOR ${archetype}: ${result.pass ? "PASS" : "FAIL"}`);
  for (const c of result.checks) console.log(`  [${c.pass ? "ok" : "FAIL"}] ${c.name}: ${c.evidence}`);
  for (const n of extra.notes ?? []) console.log(`  note: ${n}`);
  process.exit(result.pass ? 0 : 1);
}

const styleMd = readFileSync(join(piece, "style.md"), "utf8");
const archetype = (styleMd.match(/\*\*Style from the roster:\*\*\s*([^.\n(]+)/) ?? [])[1]?.trim() ?? "(unknown)";
const signatureMoves = [...styleMd.matchAll(/^\s*\d+\.\s*`?([a-z0-9-]+)`?/gm)].map((m) => m[1]);

const vocabulary = parseVocabulary(readFileSync(VOCABULARY_PATH, "utf8"));
const beats = parseBoards(readFileSync(join(piece, "boards.md"), "utf8"));
const lint = lintChoreography(beats, vocabulary, signatureMoves);
if (!lint.pass) finish(archetype, { pass: false, checks: lint.problems.map((p) => ({ name: "choreography", pass: false, evidence: p })) });

const floors = parseArchetypeFloors(readFileSync(join(here, "..", "references", "style-archetypes.md"), "utf8"));
const base = floors.get(archetype);
if (!base) finish(archetype, { pass: false, checks: [{ name: "archetype", pass: false, evidence: `"${archetype}" has no motion floor in style-archetypes.md; name the archetype in style.md as "**Style from the roster:** <name>."` }] });
const brandPath = opt("--brand");
const brand = brandPath && existsSync(brandPath) ? parseBrandMotion(readFileSync(brandPath, "utf8")) : null;
const { floor, notes } = resolveFloor(base, brand);

const candidates = [opt("--animation-map"), process.env.HF_ANIMATION_MAP,
  join(homedir(), ".claude", "skills", "hyperframes-animation", "scripts", "animation-map.mjs"),
  join(homedir(), ".agents", "skills", "hyperframes-animation", "scripts", "animation-map.mjs")].filter(Boolean);
const script = candidates.find((p) => existsSync(p));
const FIX = "install or refresh the animation skill with `npx hyperframes skills update`, or point --animation-map at scripts/animation-map.mjs";
let map = null;
let measureNote = null;
if (!script) measureNote = `not measured: no animation-map script found (${FIX})`;
else {
  const r = spawnSync(process.execPath, [script, compDir, "--out", outDir], { encoding: "utf8", env: { ...process.env, HYPERFRAMES_SKILL_BOOTSTRAP_DEPS: process.env.HYPERFRAMES_SKILL_BOOTSTRAP_DEPS ?? "1" } });
  const mapPath = join(outDir, "animation-map.json");
  if (r.status !== 0 || !existsSync(mapPath)) measureNote = `not measured: animation-map exited ${r.status} (${(r.stderr || r.stdout || "").trim().split("\n").pop()}); ${FIX}`;
  else map = JSON.parse(readFileSync(mapPath, "utf8"));
}
if (measureNote) finish(archetype, { pass: false, checks: [{ name: "measured", pass: false, evidence: measureNote }] }, { notes });

const composition = parseComposition(readFileSync(join(compDir, "index.html"), "utf8"));
const result = evaluateFloor({ map, composition, beats, floor });
if (composition.problems?.length) result.checks.push({ name: "stamps without id", pass: false, evidence: composition.problems.join("; ") });
result.pass = result.checks.every((c) => c.pass);
finish(archetype, result, { floor, notes });
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test skills/video-direction/scripts/motion-floor.test.mjs`
Expected: 6 passing

- [ ] **Step 5: Run the whole suite**

Run: `node --test skills/video-direction/scripts/`
Expected: all passing (vocabulary 3, floors 4, boards 4, composition 2, evaluate 9, motion-floor 6)

- [ ] **Step 6: Commit**

```bash
git add skills/video-direction/scripts/motion-floor.mjs skills/video-direction/scripts/motion-floor.test.mjs skills/video-direction/scripts/fixtures/fake-animation-map.mjs
git commit -m "motion-floor: the critic that counts, run before render, unmeasured is a fail

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: The skill text: stage 3b, the build contract, the motion critic, the closer

**Files:**
- Modify: `skills/video-direction/SKILL.md` (handoff table after line 38; pipeline list after stage 3 at line 146; build contract at line 239; critic rubrics at line 268; QC closer inside stage 6 at line 173)

**Interfaces:**
- Consumes: the CLI from Task 6, the vocabulary from Task 1, the marker and columns from Task 3.

- [ ] **Step 1: Write the failing test (a doc contract test)**

Append to `skills/video-direction/scripts/vocabulary.test.mjs`:

```js
test("SKILL.md wires stage 3b, the stamps, and the motion critic", () => {
  const skill = readFileSync(new URL("../SKILL.md", import.meta.url), "utf8");
  assert.match(skill, /\*\*Choreography\*\* \(stage 3b/);
  assert.match(skill, /data-rule=/);
  assert.match(skill, /id="beat-<n>"/);
  assert.match(skill, /id="cam-beat-<n>"/);
  assert.match(skill, /scripts\/motion-floor\.mjs --piece/);
  assert.match(skill, /\*\*Motion critic\*\*/);
  assert.match(skill, /three stills per beat/);
  assert.ok(skill.indexOf("motion-floor.mjs") < skill.indexOf("npx hyperframes render`** for the MP4"), "critic must be described before the render");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test skills/video-direction/scripts/vocabulary.test.mjs`
Expected: 1 failing ("SKILL.md wires stage 3b")

- [ ] **Step 3: Edit SKILL.md**

(a) In the handoff table, after the `| 3. Boardomatic |` row, insert:

```markdown
| 3b. Choreography | Each beat's Camera / Entrance / State change / Transition out names a recipe: `hyperframes-animation` rules (`rules/<name>.md`), blueprints (`blueprints/<id>.md`) or a transition. The build instantiates exactly those. |
```

(b) In the pipeline list, after item 3 (Boardomatic) and before item 4 (Styleframes), insert:

```markdown
3b. **Choreography** (stage 3b, the Motion Designer) — fill the four motion columns of the
   beat table (Camera, Entrance, State change, Transition out) with names from
   `references/motion-vocabulary.md`. Begin any beat that shows an interface with `[ui]` in
   its Content cell. Every signature move from stage 2 must appear in the columns. Read
   `style-ledger.md`'s **Rules used** column and choose at least two names the brand has not
   used in its last two videos, so the library gets used over time. Write one line under the
   table naming the piece's **motion signature**. Two bindings are mandatory: a `[ui]` beat
   names `cursor-ui-demo` or another state-change rule; a hero reveal names
   `zoom-out-workspace-reveal` or `camera-journey`. `hold`, `none` and `cut` are names; never
   `hold` in every camera cell, never `cut` at every boundary.
```

(c) In the build contract (the bulleted list under `## Build contract`), add these bullets after the first camera bullet:

```markdown
- **Scene clips carry the beat number and the stamps carry the rule.** Each beat's scene
  clip is `<section id="beat-<n>" class="clip" data-start data-duration>`; a declared
  transition out goes on it as `data-transition="<name>"` and the next clip's `data-start`
  begins before this one ends (the overlap window). Each scene's camera wrapper is
  `<div id="cam-beat-<n>" class="camera">`. Every element that instantiates a vocabulary
  rule carries both an `id` and `data-rule="<name>"`; the motion critic finds elements by
  id, so a stamp without an id is a fail.
- Camera moves are transform tweens on `#cam-beat-<n>` (scale, x, y, rotation); an opacity
  tween on the camera is not a move.
```

(d) In stage 5 (Build), after `**Then verify with npx hyperframes check** before rendering`, add:

```markdown
   **Then run the motion critic, before any render:**
   `node <plugin>/skills/video-direction/scripts/motion-floor.mjs --piece video-work/<slug> --brand motion-brand.md`
   (the `<plugin>` root is the folder this SKILL.md lives two levels under). It runs the
   animation skill's animation-map on the composition and reconciles it against the beat
   table and the archetype's motion floor. `MOTION FLOOR <archetype>: FAIL` names the check,
   the beat and the vocabulary entry that would satisfy it; fix the composition or the
   choreography columns and re-run. `not measured` is a fail, never a warning: a piece whose
   motion cannot be measured does not render. Announce the run; the map takes ~30-60s.
```

(e) In `## Critic rubrics`, add a third bullet:

```markdown
- **Motion critic** (end of build, before render): `scripts/motion-floor.mjs`. A count, not
  an opinion: camera move per scene, declared rules that animate, distinct rules against the
  archetype floor, named transitions with overlap windows, a state change in every `[ui]`
  beat, dead zones under the cap, and the animation map's own flags (offscreen, invisible,
  degenerate, collision). The floor per archetype is in `references/style-archetypes.md`; a
  brand may raise it in `motion-brand.md`'s Motion section and never lower it.
```

(f) In the Look critic bullet, after "Compare the frame side-by-side with the style's canon reference if one is named", add: "and name which anchor was used when the archetype has both a restrained and a **high-motion** anchor in `references/canon-deck.md`".

(g) In stage 6 (QC), change "extract stills at each beat" to "extract **three stills per beat** (its in, its hold, its out) onto the contact sheet, so the review sees the motion and not the pose", and in the closer's "change X" option add: "`boards.md`'s choreography columns for motion (then re-run the motion critic)". Also add to the QC ledger-row sentence: "including the new **Rules used** column (the stamped `data-rule` names, comma-separated)".

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test skills/video-direction/scripts/vocabulary.test.mjs`
Expected: 4 passing

- [ ] **Step 5: Commit**

```bash
git add skills/video-direction/SKILL.md skills/video-direction/scripts/vocabulary.test.mjs
git commit -m "skill: stage 3b choreography, the stamp contract, and the motion critic before render

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: The ledger column and the coverage rule

**Files:**
- Modify: `templates/style-ledger-template.md` (add `Rules used` column and its definition)
- Create: `skills/video-direction/scripts/coverage.mjs`
- Test: `skills/video-direction/scripts/coverage.test.mjs`
- Modify: `skills/video-direction/scripts/motion-floor.mjs` (add an optional `--ledger style-ledger.md` that runs the coverage check as a `coverage` check)

**Interfaces:**
- Produces: `checkCoverage(ledgerMarkdown, beats, { window = 2, required = 2 }) -> { pass, evidence, fresh: string[] }`.

- [ ] **Step 1: Write the failing test**

```js
// skills/video-direction/scripts/coverage.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { checkCoverage } from "./coverage.mjs";

const LEDGER = `# Style ledger
| Date | Video | Tier | Style | Audio | Camera | Hero techniques | New capabilities tried | Destinations | Perf note | Rules used |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-01 | a | flagship | Launch Film | bed | push | x | y | li | | press-release-spring, multi-phase-camera |
| 2026-09-08 | b | routine | Launch Film | bed | drift | x | y | li | | press-release-spring, cursor-ui-demo, push-left |
| 2026-09-15 | c | routine | Kinetic Essay | bed | drift | x | y | li | | kinetic-beat-slam |
`;
const beat = (o) => ({ n: 1, start: 0, role: "", content: "", ui: false, camera: "hold", entrance: "press-release-spring", state: "none", transition: "cut", ...o });

test("two fresh names against the last two videos passes", () => {
  const beats = [beat({ camera: "zoom-out-workspace-reveal" }), beat({ n: 2, entrance: "depth-scatter-assemble" })];
  const r = checkCoverage(LEDGER, beats);
  assert.equal(r.pass, true, r.evidence);
  assert.deepEqual(r.fresh.sort(), ["depth-scatter-assemble", "zoom-out-workspace-reveal"]);
});

test("only names the brand used in its last two videos fails and names them", () => {
  const beats = [beat({ entrance: "kinetic-beat-slam" }), beat({ n: 2, entrance: "press-release-spring", state: "cursor-ui-demo" })];
  const r = checkCoverage(LEDGER, beats);
  assert.equal(r.pass, false);
  assert.match(r.evidence, /1 fresh of 2 required/);
});

test("an empty ledger passes: everything is fresh", () => {
  const r = checkCoverage("# Style ledger\n", [beat({})]);
  assert.equal(r.pass, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test skills/video-direction/scripts/coverage.test.mjs`
Expected: FAIL with "Cannot find module './coverage.mjs'"

- [ ] **Step 3: Write the check, the column, and the CLI hook**

```js
// skills/video-direction/scripts/coverage.mjs
export function checkCoverage(ledgerMarkdown, beats, { window = 2, required = 2 } = {}) {
  const lines = ledgerMarkdown.split("\n").filter((l) => l.startsWith("|"));
  const header = lines[0]?.split("|").slice(1, -1).map((c) => c.trim().toLowerCase()) ?? [];
  const col = header.indexOf("rules used");
  const rows = lines.slice(2).map((l) => l.split("|").slice(1, -1).map((c) => c.trim())).filter((r) => r.some(Boolean));
  const recent = col >= 0 ? rows.slice(-window) : [];
  const used = new Set(recent.flatMap((r) => (r[col] ?? "").split(",").map((s) => s.trim()).filter(Boolean)));
  const mine = new Set(beats.flatMap((b) => [b.camera, b.entrance, b.state, b.transition]).filter((x) => x && !["hold", "none", "cut"].includes(x)));
  const fresh = [...mine].filter((x) => !used.has(x));
  const pass = fresh.length >= required;
  return { pass, fresh, evidence: `${fresh.length} fresh of ${required} required against the last ${recent.length} video(s)${fresh.length ? ": " + fresh.join(", ") : ""}` };
}
```

In `templates/style-ledger-template.md`: add `| Rules used |` as the last header cell (and a matching `|---|` and empty cell), and this definition at the end of the column list:

```markdown
- **Rules used** — the `data-rule` names the composition stamped, comma-separated. Stage 3b
  reads the last two rows here and must choose at least two names that do not appear in
  them, so the brand works its way through the motion library instead of repeating four
  moves.
```

In `skills/video-direction/scripts/motion-floor.mjs`, after `const result = evaluateFloor(...)` and before the `finish`, add:

```js
const ledgerPath = opt("--ledger");
if (ledgerPath && existsSync(ledgerPath)) {
  const { checkCoverage } = await import("./coverage.mjs");
  const cov = checkCoverage(readFileSync(ledgerPath, "utf8"), beats);
  result.checks.push({ name: "coverage", pass: cov.pass, evidence: cov.evidence });
}
```

and add `[--ledger style-ledger.md]` to the usage line; in SKILL.md's critic command (Task 7 step 3d) append ` --ledger style-ledger.md`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test skills/video-direction/scripts/`
Expected: all passing, including coverage 3

- [ ] **Step 5: Commit**

```bash
git add templates/style-ledger-template.md skills/video-direction/scripts/coverage.mjs skills/video-direction/scripts/coverage.test.mjs skills/video-direction/scripts/motion-floor.mjs skills/video-direction/SKILL.md
git commit -m "coverage: the ledger's Rules used column, and two fresh names per video

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: The high-motion canon entry and the feature-beat template

**Files:**
- Modify: `skills/video-direction/references/canon-deck.md` (append entry 4)
- Modify: `skills/video-direction/references/style-archetypes.md` (Launch Film `Canon:` line names both anchors)
- Create: `templates/feature-beat/index.html`, `templates/feature-beat/hyperframes.json`, `templates/feature-beat/meta.json`, `templates/feature-beat/package.json`, `templates/feature-beat/README.md` (copy `hyperframes.json`, `meta.json`, `package.json` from `templates/proof-frame/` and adjust the composition name to `feature-beat`)
- Test: `skills/video-direction/scripts/composition.test.mjs` (add a test that parses the template)

**Interfaces:**
- Consumes: `parseComposition` (Task 4).
- Produces: a sub-composition other pieces copy, stamped so it clears the Launch Film floor's per-beat requirements when used as a `[ui]` beat.

- [ ] **Step 1: Write the failing test**

Append to `skills/video-direction/scripts/composition.test.mjs`:

```js
import { readFileSync } from "node:fs";
test("the feature-beat template is a stamped [ui] beat with a camera", () => {
  const html = readFileSync(new URL("../../../templates/feature-beat/index.html", import.meta.url), "utf8");
  const { clips, problems } = parseComposition(html);
  assert.equal(problems.length, 0);
  assert.equal(clips.length, 1);
  assert.equal(clips[0].id, "beat-1");
  assert.equal(clips[0].cameraId, "cam-beat-1");
  const rules = clips[0].stamps.map((s) => s.rule);
  assert.ok(rules.includes("press-release-spring"));
  assert.ok(rules.includes("cursor-ui-demo"));
  assert.ok(rules.includes("cursor-click-ripple"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test skills/video-direction/scripts/composition.test.mjs`
Expected: FAIL with ENOENT on `templates/feature-beat/index.html`

- [ ] **Step 3: Write the template composition**

`templates/feature-beat/index.html` (1920×1080, 4s, one paused GSAP timeline on `window.__timelines.main`, colours and fonts via CSS variables the brand overrides):

```html
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=1920, height=1080" />
<style>
  :root { --bg: #0b1020; --fg: #f4f6fb; --muted: #9aa3b5; --accent: #5b8cff; --card: #141b2e; --font: Inter, system-ui, sans-serif; }
  html, body { margin: 0; width: 1920px; height: 1080px; background: var(--bg); font-family: var(--font); overflow: hidden; }
  #root { position: relative; width: 1920px; height: 1080px; }
  .clip { position: absolute; inset: 0; }
  .camera { position: absolute; inset: 0; transform-origin: 50% 50%; will-change: transform; }
  .copy { position: absolute; left: 160px; top: 300px; width: 620px; }
  .eyebrow { font-size: 22px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); }
  .headline { margin-top: 24px; font-size: 84px; line-height: 1.02; font-weight: 800; color: var(--fg); }
  .headline .two { color: var(--accent); display: block; }
  .sub { margin-top: 28px; font-size: 28px; color: var(--muted); }
  .card { position: absolute; left: 900px; top: 220px; width: 860px; padding: 32px; border-radius: 20px; background: var(--card); box-shadow: 0 30px 80px rgba(0,0,0,.45); will-change: transform; }
  .row { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; border-radius: 12px; color: var(--fg); font-size: 26px; }
  .row + .row { margin-top: 12px; }
  .row.selected { outline: 2px solid var(--accent); background: rgba(91,140,255,.10); }
  .check { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--muted); }
  .row.selected .check { background: var(--accent); border-color: var(--accent); }
  .cursor { position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 2px rgba(0,0,0,.4); will-change: transform; }
  .ripple { position: absolute; width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--accent); opacity: 0; transform: scale(1); will-change: transform, opacity; }
</style>
</head>
<body>
<div id="root" data-width="1920" data-height="1080" data-fps="30" data-duration="4">
  <section id="beat-1" class="clip" data-start="0" data-duration="4">
    <div id="cam-beat-1" class="camera">
      <div class="copy">
        <div id="eyebrow" class="eyebrow" data-rule="press-release-spring">Switch models anytime</div>
        <h1 id="headline" class="headline" data-rule="press-release-spring">Pick one.<span class="two">Or pick three.</span></h1>
        <div id="sub" class="sub" data-rule="press-release-spring">Compare their answers side by side.</div>
      </div>
      <div id="card" class="card" data-rule="cursor-ui-demo">
        <div class="row" id="row-1"><span>Model A</span><span class="check"></span></div>
        <div class="row" id="row-2"><span>Model B</span><span class="check"></span></div>
        <div class="row" id="row-3"><span>Model C</span><span class="check"></span></div>
      </div>
      <div id="cursor" class="cursor" data-rule="cursor-ui-demo" style="left:1500px;top:900px"></div>
      <div id="ripple" class="ripple" data-rule="cursor-click-ripple" style="left:1500px;top:900px"></div>
    </div>
  </section>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
  const ease = "power3.out";
  // press-release-spring entrances, one ease system, staggered
  tl.fromTo(["#eyebrow", "#headline", "#sub"], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease, stagger: 0.12 }, 0);
  tl.fromTo("#card", { opacity: 0, y: 40, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease }, 0.15);
  // cursor-ui-demo: the cursor travels to row 2 and clicks; the row changes state
  tl.to("#cursor", { x: -180, y: -420, duration: 0.8, ease: "power2.inOut" }, 1.0);
  tl.to("#cursor", { scale: 0.85, duration: 0.08 }, 1.85).to("#cursor", { scale: 1, duration: 0.12 }, 1.93);
  tl.call(() => document.getElementById("row-2").classList.add("selected"), null, 1.9);
  // cursor-click-ripple
  tl.fromTo("#ripple", { x: -180, y: -420, scale: 1, opacity: 0.9 }, { scale: 3.2, opacity: 0, duration: 0.5, ease: "power2.out" }, 1.88);
  // camera drift: the whole scene eases in toward the card
  tl.fromTo("#cam-beat-1", { scale: 1, x: 0 }, { scale: 1.06, x: -40, duration: 4, ease: "sine.inOut" }, 0);
  window.__timelines["main"] = tl;
</script>
</body>
</html>
```

Note for the implementer: the `tl.call` state change flips a class at a time; HyperFrames seeks a paused timeline in both directions, and a `call` does not un-flip on reverse seek. Replace it with a seek-safe tween if `npx hyperframes check` flags it: `tl.fromTo("#row-2", { "--sel": 0 }, { "--sel": 1, duration: 0.01 }, 1.9)` with the `.selected` styles driven by `--sel` via `outline-color: rgba(91,140,255, var(--sel))` and `background: rgba(91,140,255, calc(var(--sel) * .10))`. Either way the stamp `cursor-ui-demo` sits on `#card` and `#cursor`, which carry tweens.

`templates/feature-beat/README.md`:

```markdown
# Feature beat

One reusable beat for "here is what it does" sequences: a small-caps eyebrow, a two-line
headline with the second line in the accent, a grey sub line, one interface card that
performs exactly one state change under a visible cursor, and one camera drift. Copy the
`<section id="beat-1">` block into a piece, renumber it to its beat, and swap the copy and
the card. It arrives stamped (`data-rule`) so the motion critic can see it. Two seconds of
this template, repeated with different cards, is how a feature sequence reads as designed.
```

Run `npx hyperframes check` in `templates/feature-beat/` and fix what it names before committing.

- [ ] **Step 4: Append the canon entry**

Append to `skills/video-direction/references/canon-deck.md`, before `## Transferable rules extracted`:

```markdown
## 4. TypingMind promo (Tony Dinh, 2026) — second anchor for **Launch Film**, the HIGH-MOTION reference

Source: x.com/tdinh_me/status/2103795203157209270/video/1 · 40s · music only, no captions

- **Arc:** nine model logos fly in as labelled spheres at different depths, orbit with
  comet trails, converge into one orb; the orb becomes the product's input bar as the
  camera flies into the app; one feature template runs six times at two seconds each; every
  card flies out into a tilted 3D grid the camera drifts across; a typographic offer beat
  (drawn strike-through, count-up); the orbit motif bookends.
- **The feature template:** small-caps eyebrow, two-line headline with line two in the
  accent, grey sub, a real interface card on the right performing exactly one state change
  (a cursor clicks, a field takes focus, a focus ring moves, Install becomes a check, toggles
  flip). Two seconds. Reused six times, which is what reads as design.
- **Camera, not cuts:** fly-in, orbit, fly-through, drift across the grid. Scene changes are
  moves through one space.
- **Motion signatures:** comet trails on anything that travels, spring entrances with
  letter stagger, depth-of-field on background objects, glow on the focused element, count-up
  on the one number. Nothing on screen is a screenshot.
- **Reads muted.** Every beat carries without sound.

Why it anchors Launch Film as the high-motion reference: the same arc as anchor 1 (hook,
reveal, proof, resolve) carried by continuous camera and a repeated feature template. Use it
when the brand's register is energetic; use anchor 1 when it is restrained. The look critic
names which anchor it compared against.
```

In `style-archetypes.md`, change the Launch Film `Canon:` bullet to: `- **Canon:** two anchors in \`references/canon-deck.md\`: the Claude Code in-app browser launch (restrained) and the TypingMind promo (high-motion). Name which one the piece anchors to.`

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test skills/video-direction/scripts/composition.test.mjs`
Expected: 3 passing

- [ ] **Step 6: Commit**

```bash
git add skills/video-direction/references/canon-deck.md skills/video-direction/references/style-archetypes.md templates/feature-beat skills/video-direction/scripts/composition.test.mjs
git commit -m "canon + template: a high-motion Launch Film anchor and a stamped feature beat

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Rebuild the Fern & Field sample through stage 3b

**Files:**
- Modify: `examples/fern-and-field/video-work/seedling-subscription-launch/boards.md` (four motion columns, stage 3b block, motion signature line)
- Modify: `examples/fern-and-field/video-work/seedling-subscription-launch/composition/index.html` (clip `id="beat-1"`, camera `id="cam-beat-1"`, stamps, one camera drift, the charm as `particle-burst` or a drawn stem under `press-release-spring`)
- Modify: `examples/fern-and-field/style-ledger.md` (Rules used column and the row)
- Modify: `examples/fern-and-field/video-work/seedling-subscription-launch/renders/sample-video.mp4` and `examples/fern-and-field/sample-video.mp4` (re-rendered)

**Interfaces:**
- Consumes: the CLI (Task 6 and 8), the Announcement Card floor (Task 2).

- [ ] **Step 1: Write the failing check**

Run from the example's project root (`examples/fern-and-field/`):

```bash
node ../../skills/video-direction/scripts/motion-floor.mjs --piece video-work/seedling-subscription-launch --brand motion-brand.md --ledger style-ledger.md
```
Expected: FAIL (no choreography table).

- [ ] **Step 2: Choreograph the card**

Rewrite the boards table with the eight columns. Because the card is one held composition, the piece is one scene, `beat-1`, with reveal timings as sub-beats in the Content cell. The choreography row:

```markdown
| # | Start | Role | Content | Camera | Entrance | State change | Transition out |
|---|---|---|---|---|---|---|---|
| 1 | 0.0s | card | wordmark → headline → seedling charm → details → price → resolve, on one held card | multi-phase-camera | press-release-spring | none | cut |

**Motion signature.** One slow push toward the seedling as it sprouts, released on the price.
```

Because the archetype is Announcement Card (kind: static), the floor is one drift, two rules, no transitions. Stamp the composition: `<section id="beat-1" class="clip" ...>`, wrap the card in `<div id="cam-beat-1" class="camera">`, stamp the price and headline `data-rule="press-release-spring"`, the seedling `data-rule="particle-burst"` (or add `particle-burst` as the leaf unfurl's spark), and add the camera tween: `tl.fromTo("#cam-beat-1", { scale: 1 }, { scale: 1.05, duration: 6, ease: "sine.inOut" }, 2.4).to("#cam-beat-1", { scale: 1.0, duration: 2.5, ease: "sine.inOut" }, 8.5);`

- [ ] **Step 3: Run check, the critic, and render**

```bash
cd examples/fern-and-field/video-work/seedling-subscription-launch/composition && npx hyperframes check && cd ../../..
node ../../skills/video-direction/scripts/motion-floor.mjs --piece video-work/seedling-subscription-launch --brand motion-brand.md --ledger style-ledger.md
```
Expected: `MOTION FLOOR Announcement Card: PASS`. Then `npx hyperframes render` in the composition folder; copy the MP4 to `renders/sample-video.mp4` and to `examples/fern-and-field/sample-video.mp4`. Extract three stills at 3.0s, 5.0s, 9.0s into `styleframes/` and rebuild the contact sheet.

- [ ] **Step 4: Update the ledger**

Append the `Rules used` column to `examples/fern-and-field/style-ledger.md` and fill the row: `multi-phase-camera, press-release-spring, particle-burst`.

- [ ] **Step 5: Commit**

```bash
git add examples/fern-and-field
git commit -m "example: Fern & Field rebuilt through stage 3b, clears the Announcement Card floor

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Telemetry property, README, version

**Files:**
- Modify: `skills/video-direction/references/telemetry.md:33-34` (add `motion_floor` to both event property lists)
- Modify: `README.md` (one paragraph under the features list)
- Modify: `.claude-plugin/plugin.json` (version `0.2.0`)

- [ ] **Step 1: Edit telemetry**

In the `render_complete` row's properties, append `, motion_floor` (values `pass | fail | not_measured`); in `render_failed`, append `, motion_floor`. Add under the table: "`motion_floor` is read from `composition/.hyperframes/anim-map/motion-floor.json` written by the motion critic; `not_measured` when the file is absent."

- [ ] **Step 2: Edit README**

After the features list, add:

```markdown
**Motion is demanded, not hoped for.** Every beat names its camera move, entrance, state
change and transition from a motion vocabulary; a motion critic measures the composition
before it renders and fails it under the archetype's floor; and each new video has to reach
for moves the brand has not used in its last two. The result is videos that read as
designed rather than assembled.
```

- [ ] **Step 3: Bump the version and run the suite**

Set `"version": "0.2.0"` in `.claude-plugin/plugin.json`. Run `node --test skills/video-direction/scripts/`. Expected: all passing.

- [ ] **Step 4: Commit**

```bash
git add skills/video-direction/references/telemetry.md README.md .claude-plugin/plugin.json
git commit -m "release 0.2.0: motion choreography, the motion critic, and the coverage rule

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 12: The stranger arena and ship-check (vault side)

**Files:**
- Create: `~/life_os/builds/video-direction-plugin/arena/gate-2-motion/<persona>/friction-log.md` (the acceptance record)
- Modify: `~/life_os/builds/video-direction-plugin/.vibecodepm/ship-check.md` (append the run)

**Interfaces:**
- Consumes: the plugin at 0.2.0 installed from the local repo.

- [ ] **Step 1: Run the arena**

In a fresh isolated session with the plugin installed from `~/Projects/video-direction-plugin`, a persona with a quiet brand (reuse `arena/spot-check-2/steepwell/PERSONA.md` and its `motion-brand.md`) asks for a Launch Film for a real page. The persona is told nothing about stage 3b. Record every friction point in the friction log in the format of `arena/probe-1/friction-log.md`.

- [ ] **Step 2: Acceptance**

PASS requires all of: the run reached `MOTION FLOOR Launch Film: PASS` without help; the rendered video exists; the ledger row carries `Rules used`; the contact sheet shows three stills per beat. Any BLOCKER-severity friction is a fix task before ship-check.

- [ ] **Step 3: Ship-check**

Run the vibecodepm ship-check on the plugin. Append the verdict to `.vibecodepm/ship-check.md`. Publishing the version to the marketplace listing is a separate yes from Jason, per the plugin's own "render is not the ship" rule.

- [ ] **Step 4: Commit the vault records**

```bash
cd ~/life_os && git add builds/video-direction-plugin && git commit -m "video-direction: motion arena gate-2 run and ship-check recorded

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Self-review

**Spec coverage.** §2.1 vocabulary → Task 1. §2.2 stage 3b, columns, coverage, motion signature, template → Tasks 3, 7, 8. §2.3 floors and brand override → Task 2. §2.4 critic, before render, not-measured fail, stamps, camera convention, transitions, state change, dead zones, flags → Tasks 4, 5, 6, 7. §2.5 second anchor for the look critic and three stills per beat → Tasks 7, 9. §2.6 canon entry, feature-beat template, Fern & Field rebuild → Tasks 9, 10. §2.7 ledger column and telemetry property → Tasks 8, 11. §2.8 skill text → Task 7. §5 tests: five false-green states → Task 5; coverage test → Task 8; arena → Task 12; dogfood → Task 10 (Magnetiz exhibit is out of this plan, by decision 3). §6 rollout order matches Tasks 1 to 12.

**Placeholder scan.** None. Every code step carries its code. Task 9's `tl.call` caveat names the seek-safe replacement rather than deferring it.

**Type consistency.** `Beat` fields (`n, start, role, content, ui, camera, entrance, state, transition`) match across Tasks 3, 5, 6, 8. `Clip` fields (`id, n, start, end, transition, cameraId, stamps[{id, rule}]`) match across Tasks 4, 5, 6, 9. `Floor` fields (`camera, transitions, rules, stateChange, deadZone`) match across Tasks 2, 5, 6. `Check = {name, pass, evidence}` is the same in 5, 6, 8. Check names used in tests (`measured`, `camera`, `stamps carry motion`, `distinct rules`, `transitions`, `state change`, `dead zones`, `map flags`, `coverage`, `choreography`, `archetype`, `stamps without id`) match the evaluator and CLI.

**Review Focus.** Item 1 pinned in Task 5 (false green 4). Item 2 pinned in Task 3 (short row). Item 3 pinned in Task 5 (ui/none across two floors). Item 4 pinned in Task 2 (cannot lower). Item 5 pinned in Task 5 (empty map) and Task 6 (FAKE_MAP_MODE=empty).
