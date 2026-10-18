#!/usr/bin/env node
// skills/video-direction/scripts/bake-poster.mjs
// Bakes the poster in as frame 0 of the MP4. Feeds and players use the first frame as the
// thumbnail, so a video that opens on a blank or mid-entrance frame shows that everywhere
// it is shared. Frame 0 is REPLACED, never added: the frame count, frame rate, duration
// and audio stay exactly as rendered, so audio sync cannot drift. The script probes the
// video before and after and keeps the original if anything moved.
// Usage: node bake-poster.mjs <video.mp4> <poster.jpg|png> [--out <path>]
import { existsSync, renameSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const USAGE = "usage: bake-poster.mjs <video.mp4> <poster.jpg|png> [--out <path>]";

export function validateInputs({ video, poster, out }) {
  const problems = [];
  if (!video || !existsSync(video)) problems.push(`video not found: ${video}`);
  if (!poster || !existsSync(poster)) problems.push(`poster not found: ${poster}`);
  if (poster && out && resolve(out) === resolve(poster)) problems.push(`--out ${out} would overwrite the poster`);
  return problems;
}

// The poster is scaled to the video's own size and laid over frame 0 only (eq(n,0)); every
// other frame passes through untouched. Video is re-encoded (it has to be, one frame
// changed) with passthrough timing so no frame is duplicated or dropped; audio is copied.
export function bakeArgs({ video, poster, out, width, height }) {
  return [
    "-v", "error", "-y", "-i", video, "-i", poster,
    "-filter_complex", `[1:v]scale=${width}:${height}[poster];[0:v][poster]overlay=0:0:enable='eq(n,0)'[v]`,
    "-map", "[v]", "-map", "0:a?",
    "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
    "-fps_mode", "passthrough",
    "-c:a", "copy",
    "-movflags", "+faststart",
    out,
  ];
}

export function probeArgs(file) {
  return ["-v", "error", "-count_frames", "-show_entries", "stream=codec_type,width,height,r_frame_rate,nb_frames,nb_read_frames:format=duration", "-of", "json", file];
}

export function parseProbe(text) {
  let data;
  try { data = JSON.parse(text); } catch { return null; }
  const v = (data.streams ?? []).find((s) => s.codec_type === "video");
  if (!v) return null;
  const [num, den] = String(v.r_frame_rate ?? "0/1").split("/").map(Number);
  return {
    width: Number(v.width),
    height: Number(v.height),
    fps: den ? +(num / den).toFixed(3) : 0,
    frames: Number(v.nb_read_frames ?? v.nb_frames),
    duration: Number(data.format?.duration),
    audio: data.streams.some((s) => s.codec_type === "audio"),
  };
}

// Duration may move by container rounding, never by a frame or more.
export function compareProbes(before, after) {
  const problems = [];
  if (after.frames !== before.frames) problems.push(`frame count ${before.frames} became ${after.frames}`);
  if (after.fps !== before.fps) problems.push(`frame rate ${before.fps} became ${after.fps}`);
  if (Math.abs(after.duration - before.duration) >= 1 / (before.fps || 30)) problems.push(`duration ${before.duration.toFixed(3)}s became ${after.duration.toFixed(3)}s`);
  if (before.audio && !after.audio) problems.push("audio was dropped");
  return problems;
}

function probe(file) {
  const r = spawnSync("ffprobe", probeArgs(file), { encoding: "utf8" });
  if (r.error || r.status !== 0) return null;
  return parseProbe(r.stdout);
}

function main() {
  const args = process.argv.slice(2);
  const at = args.indexOf("--out");
  const outArg = at >= 0 ? args[at + 1] : null;
  const [video, poster] = args.filter((a, i) => !a.startsWith("--") && !(at >= 0 && i === at + 1));
  const out = outArg ?? video;
  const problems = validateInputs({ video, poster, out });
  if (!video || !poster || problems.length) {
    for (const p of problems) console.error(`bake-poster.mjs: ${p}`);
    console.error(USAGE);
    process.exit(2);
  }

  const before = probe(video);
  if (!before) { console.error(`POSTER ${video}: FAIL not measured (ffprobe could not read the video; is ffmpeg installed?)`); process.exit(1); }
  const tmp = `${out}.baking.mp4`;
  const r = spawnSync("ffmpeg", bakeArgs({ video, poster, out: tmp, width: before.width, height: before.height }), { encoding: "utf8" });
  if (r.error || r.status !== 0) {
    rmSync(tmp, { force: true });
    console.error(`POSTER ${video}: FAIL ffmpeg ${r.error ? r.error.message : `exited ${r.status}: ${(r.stderr || "").trim().split("\n").slice(-2).join(" / ")}`}`);
    process.exit(1);
  }
  const after = probe(tmp);
  const drift = after ? compareProbes(before, after) : ["the baked video could not be probed"];
  if (drift.length) {
    rmSync(tmp, { force: true });
    console.error(`POSTER ${video}: FAIL the original is kept; ${drift.join("; ")}`);
    process.exit(1);
  }
  renameSync(tmp, out);
  console.log(`POSTER ${out}: baked as frame 0 (${after.frames} frames at ${after.fps}fps, ${after.duration.toFixed(3)}s, audio ${after.audio ? "copied" : "none"})`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
