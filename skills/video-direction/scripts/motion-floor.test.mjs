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
| 1 | 0.0s | setup | open | zoom-out-workspace-reveal | press-release-spring | none | push-slide |
| 2 | 4.0s | turn | [ui] picker | multi-phase-camera | kinetic-beat-slam | cursor-ui-demo | cut |
| 3 | 8.0s | resolve | wordmark | hold | logo-assemble-lockup | none | cut |
`);
  writeFileSync(join(dir, "composition", "index.html"), `<div id="root">
<section id="beat-1" class="clip" data-start="0" data-duration="4.5" data-transition="push-slide"><div id="cam-beat-1" class="camera"><h1 id="h1" data-rule="press-release-spring">x</h1></div></section>
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
