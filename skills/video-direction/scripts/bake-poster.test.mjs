import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { validateInputs, bakeArgs, parseProbe, compareProbes } from "./bake-poster.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const CLI = join(here, "bake-poster.mjs");
const FFMPEG_OK = spawnSync("ffmpeg", ["-version"]).status === 0 && spawnSync("ffprobe", ["-version"]).status === 0;

test("validateInputs names a missing video, a missing poster and an output that is the poster", () => {
  const dir = mkdtempSync(join(tmpdir(), "bake-"));
  const video = join(dir, "v.mp4");
  const poster = join(dir, "poster.jpg");
  assert.deepEqual(validateInputs({ video, poster, out: video }), [`video not found: ${video}`, `poster not found: ${poster}`]);
  writeFileSync(video, "x");
  writeFileSync(poster, "x");
  assert.deepEqual(validateInputs({ video, poster, out: video }), []);
  assert.match(validateInputs({ video, poster, out: poster })[0], /would overwrite the poster/);
  assert.match(validateInputs({ video: join(dir, "v.mov"), poster, out: video })[0], /video not found/);
});

test("bakeArgs overlays the poster, scaled to the video, on frame 0 only and copies the audio", () => {
  const args = bakeArgs({ video: "in.mp4", poster: "p.jpg", out: "out.mp4", width: 1080, height: 1920 });
  assert.deepEqual(args.slice(0, 7), ["-v", "error", "-y", "-i", "in.mp4", "-i", "p.jpg"]);
  const graph = args[args.indexOf("-filter_complex") + 1];
  assert.equal(graph, "[1:v]scale=1080:1920[poster];[0:v][poster]overlay=0:0:enable='eq(n,0)'[v]");
  assert.deepEqual(args.slice(args.indexOf("-map"), args.indexOf("-map") + 4), ["-map", "[v]", "-map", "0:a?"]);
  assert.equal(args[args.indexOf("-c:a") + 1], "copy");
  assert.equal(args[args.indexOf("-fps_mode") + 1], "passthrough");
  assert.equal(args.at(-1), "out.mp4");
});

const PROBE = JSON.stringify({
  streams: [
    { codec_type: "video", width: 1080, height: 1080, r_frame_rate: "30/1", nb_frames: "30" },
    { codec_type: "audio" },
  ],
  format: { duration: "1.000000" },
});

test("parseProbe reads size, frame rate, frame count, duration and audio", () => {
  assert.deepEqual(parseProbe(PROBE), { width: 1080, height: 1080, fps: 30, frames: 30, duration: 1, audio: true });
  assert.equal(parseProbe("{}"), null);
});

test("compareProbes passes an identical timeline and names each drift", () => {
  const before = parseProbe(PROBE);
  assert.deepEqual(compareProbes(before, { ...before, duration: 1.02 }), []);
  const drift = compareProbes(before, { ...before, frames: 31, fps: 25, duration: 1.2, audio: false });
  assert.deepEqual(drift, ["frame count 30 became 31", "frame rate 30 became 25", "duration 1.000s became 1.200s", "audio was dropped"]);
});

test("CLI without a video and a poster is a usage error, exit 2", () => {
  assert.equal(spawnSync(process.execPath, [CLI], { encoding: "utf8" }).status, 2);
  assert.equal(spawnSync(process.execPath, [CLI, "/nope/v.mp4", "/nope/p.jpg"], { encoding: "utf8" }).status, 2);
});

test("CLI: frame 0 becomes the poster, frame count, duration and audio unchanged", (t) => {
  if (!FFMPEG_OK) return t.skip("ffmpeg or ffprobe is not available on this machine");
  const dir = mkdtempSync(join(tmpdir(), "bake-"));
  const video = join(dir, "v.mp4");
  const poster = join(dir, "poster.png");
  const made = spawnSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "testsrc=s=160x120:r=30:d=1", "-f", "lavfi", "-i", "sine=frequency=440:duration=1", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", "-y", video]);
  assert.equal(made.status, 0, made.stderr?.toString());
  assert.equal(spawnSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "color=c=red:s=160x120:d=1", "-frames:v", "1", "-y", poster]).status, 0);
  const r = spawnSync(process.execPath, [CLI, video, poster], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /POSTER .*: baked as frame 0 \(30 frames at 30fps, 1\.0\d\ds, audio copied\)/);
  assert.ok(!existsSync(video + ".baking.mp4"));
  // Frame 0 is now the solid red poster (chroma V near 240); frame 1 is still the test pattern.
  const avgV = (n) => Number(spawnSync("ffmpeg", ["-v", "error", "-i", video, "-vf", `select=eq(n\\,${n}),signalstats,metadata=print:file=-`, "-frames:v", "1", "-f", "null", "-"], { encoding: "utf8" }).stdout.match(/VAVG=([\d.]+)/)[1]);
  assert.ok(avgV(0) > 200, `frame 0 V average ${avgV(0)} is not the red poster`);
  assert.ok(avgV(1) < 200, `frame 1 V average ${avgV(1)} should still be the original video`);
});
