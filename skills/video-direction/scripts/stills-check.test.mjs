import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parseSignalStats, judge } from "./stills-check-core.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const CLI = join(here, "stills-check.mjs");

const FFMPEG_OK = spawnSync("ffmpeg", ["-version"]).status === 0;

const SOLID_STATS_TEXT = `frame:0    pts:0       pts_time:0
lavfi.signalstats.YMIN=16
lavfi.signalstats.YLOW=16
lavfi.signalstats.YAVG=16
lavfi.signalstats.YHIGH=16
lavfi.signalstats.YMAX=16
lavfi.signalstats.UMIN=128
`;

test("parseSignalStats reads YMIN/YMAX out of ffmpeg's metadata=print output", () => {
  const stats = parseSignalStats(SOLID_STATS_TEXT);
  assert.deepEqual(stats, { ymin: 16, ymax: 16 });
});

test("parseSignalStats returns null when the fields are absent", () => {
  assert.equal(parseSignalStats("no stats here"), null);
  assert.equal(parseSignalStats(""), null);
  assert.equal(parseSignalStats(null), null);
});

test("judge flags a blank, passes a normal still, and allows a named deliberate blank", () => {
  const stills = [
    { name: "beat1-in.png", range: 2 },
    { name: "beat1-hold.png", range: 42 },
    { name: "beat1-out.png", range: 1 },
  ];
  const result = judge(stills, { minRange: 8, allow: ["beat1-out.png"] });
  assert.equal(result.pass, false);
  assert.equal(result.blankCount, 1);
  const byName = Object.fromEntries(result.results.map((r) => [r.name, r.status]));
  assert.equal(byName["beat1-in.png"], "BLANK");
  assert.equal(byName["beat1-hold.png"], "ok");
  assert.equal(byName["beat1-out.png"], "allowed");
});

function makeStillsDir() {
  return mkdtempSync(join(tmpdir(), "stills-"));
}

test("CLI: a black still and a varied still, exit 1, stills-check.json written", (t) => {
  if (!FFMPEG_OK) return t.skip("ffmpeg -version failed on this machine");
  const dir = makeStillsDir();
  const solid = spawnSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=black:s=64x64:d=1", "-frames:v", "1", "-y", join(dir, "solid.png")]);
  assert.equal(solid.status, 0, solid.stderr?.toString());
  let grad = spawnSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "gradients=s=64x64:d=1", "-frames:v", "1", "-y", join(dir, "grad.png")]);
  if (grad.status !== 0) {
    grad = spawnSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "testsrc=s=64x64:d=1", "-frames:v", "1", "-y", join(dir, "grad.png")]);
  }
  assert.equal(grad.status, 0, grad.stderr?.toString());

  const r = spawnSync(process.execPath, [CLI, dir], { encoding: "utf8" });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /\[BLANK\] solid\.png/);
  assert.match(r.stdout, /\[ok\] grad\.png/);
  assert.ok(existsSync(join(dir, "stills-check.json")));
  const record = JSON.parse(readFileSync(join(dir, "stills-check.json"), "utf8"));
  assert.equal(record.pass, false);
  assert.equal(record.blankCount, 1);
});

test("CLI: an empty directory is FAIL (no stills found), exit 2", (t) => {
  if (!FFMPEG_OK) return t.skip("ffmpeg -version failed on this machine");
  const dir = makeStillsDir();
  const r = spawnSync(process.execPath, [CLI, dir], { encoding: "utf8" });
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stdout, /STILLS .*: FAIL \(no stills found\)/);
});
