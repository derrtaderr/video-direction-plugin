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

test("static floors can switch off the hold-everywhere and cut-everywhere rules", () => {
  const md = `# B
| # | Start | Role | Content | Camera | Entrance | State change | Transition out |
|---|---|---|---|---|---|---|---|
| 1 | 0.0s | card | a | hold | press-release-spring | none | cut |
| 2 | 5.0s | card | b | hold | press-release-spring | none | cut |
`;
  const strict = lintChoreography(parseBoards(md), VOCAB, []);
  assert.equal(strict.pass, false);
  const relaxed = lintChoreography(parseBoards(md), VOCAB, [], { requireTransition: false, requireMove: false });
  assert.equal(relaxed.pass, true, relaxed.problems.join("; "));
});
