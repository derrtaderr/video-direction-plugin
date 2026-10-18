import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { planStills } from "./stills-plan.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const CLI = join(here, "stills-plan.mjs");

const clips = [
  { id: "beat-1", n: 1, start: 0, end: 4.5 },
  { id: "beat-2", n: 2, start: 4, end: 8 },
  { id: "beat-3", n: 3, start: 8, end: 11 },
];

test("three stills per beat inside the beat's solo window, plus one at the middle of each overlap", () => {
  assert.deepEqual(planStills(clips), [
    { name: "beat1-in", t: 0.6, beat: 1, kind: "in" },
    { name: "beat1-hold", t: 2.4, beat: 1, kind: "hold" },
    { name: "beat1-out", t: 3.6, beat: 1, kind: "out" },
    { name: "beat1-to-2-mid", t: 4.25, beat: 1, kind: "mid" },
    { name: "beat2-in", t: 5.025, beat: 2, kind: "in" },
    { name: "beat2-hold", t: 6.6, beat: 2, kind: "hold" },
    { name: "beat2-out", t: 7.65, beat: 2, kind: "out" },
    { name: "beat3-in", t: 8.45, beat: 3, kind: "in" },
    { name: "beat3-hold", t: 9.8, beat: 3, kind: "hold" },
    { name: "beat3-out", t: 10.7, beat: 3, kind: "out" },
  ]);
});

test("a hard cut gets no mid-transition still", () => {
  const cut = clips.map((c) => (c.n === 1 ? { ...c, end: 4 } : c));
  assert.equal(planStills(cut).filter((s) => s.kind === "mid").length, 0);
});

test("clips arrive in any order and are planned by start time", () => {
  assert.deepEqual(planStills([...clips].reverse()).map((s) => s.name), planStills(clips).map((s) => s.name));
});

test("CLI prints the plan from a composition, one still per line", () => {
  const dir = mkdtempSync(join(tmpdir(), "plan-"));
  const file = join(dir, "index.html");
  writeFileSync(file, `<section id="beat-1" class="clip" data-start="0" data-duration="4.5" data-transition="push-slide"></section><section id="beat-2" class="clip" data-start="4" data-duration="4"></section>`);
  const r = spawnSync(process.execPath, [CLI, file], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^beat1-in\t0\.6$/m);
  assert.match(r.stdout, /^beat1-to-2-mid\t4\.25$/m);
});

test("CLI without a composition is a usage error, exit 2", () => {
  assert.equal(spawnSync(process.execPath, [CLI], { encoding: "utf8" }).status, 2);
});
