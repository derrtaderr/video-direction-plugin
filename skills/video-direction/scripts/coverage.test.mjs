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
  // Every name these beats reach for (kinetic-beat-slam, press-release-spring,
  // cursor-ui-demo) already appears in the last two rows, so zero are fresh.
  assert.match(r.evidence, /0 fresh of 2 required/);
});

test("an empty ledger passes: everything is fresh", () => {
  const r = checkCoverage("# Style ledger\n", [beat({})]);
  assert.equal(r.pass, true);
});

test("the piece's own ledger row is excluded from the window", () => {
  const ledger = `# Style ledger
| Date | Video | Tier | Style | Audio | Camera | Hero techniques | New capabilities tried | Destinations | Perf note | Rules used |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-01 | a | flagship | Launch Film | bed | push | x | y | li | | press-release-spring |
| 2026-09-27 | me | routine | Announcement Card | silent | drift | x | y | li | | multi-phase-camera, press-release-spring, particle-burst |
`;
  const beats = [beat({ camera: "multi-phase-camera", entrance: "particle-burst" })];
  assert.equal(checkCoverage(ledger, beats, { exclude: "me" }).pass, true);
  assert.equal(checkCoverage(ledger, beats).pass, false);
});
