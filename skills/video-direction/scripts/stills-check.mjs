#!/usr/bin/env node
// skills/video-direction/scripts/stills-check.mjs
// The blank-still gate. QC already extracts three stills per beat (in, hold, out); this
// makes looking at them mechanical instead of relying on someone opening every PNG. A
// still whose luma never varies is a beat that rendered nothing, whatever hyperframes
// check and the motion critic say.
// Usage: node stills-check.mjs <dir> [--min-range 8] [--allow <glob-or-name>...]
import { readdirSync, statSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { parseSignalStats, judge } from "./stills-check-core.mjs";

const USAGE = "usage: stills-check.mjs <dir> [--min-range 8] [--allow <glob-or-name>...]";

function parseArgs(argv) {
  const positional = [];
  let minRange = 8;
  const allow = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--min-range") {
      minRange = Number(argv[++i]);
    } else if (a === "--allow") {
      i++;
      while (i < argv.length && !argv[i].startsWith("--")) {
        allow.push(argv[i]);
        i++;
      }
      i--;
    } else if (!a.startsWith("--")) {
      positional.push(a);
    }
  }
  return { dir: positional[0], minRange, allow };
}

function writeRecord(dir, record) {
  writeFileSync(join(dir, "stills-check.json"), JSON.stringify(record, null, 2));
}

function main() {
  const { dir, minRange, allow } = parseArgs(process.argv.slice(2));
  if (!dir || !Number.isFinite(minRange)) {
    console.error(USAGE);
    process.exit(2);
  }
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    console.error(`stills-check.mjs: not a directory: ${dir}`);
    console.error(USAGE);
    process.exit(2);
  }

  const files = readdirSync(dir)
    .filter((f) => /\.(png|jpg)$/i.test(f))
    .sort();

  if (files.length === 0) {
    writeRecord(dir, { dir, minRange, allow, results: [], pass: false, blankCount: 0, reason: "no stills found", at: new Date().toISOString() });
    console.log(`STILLS ${dir}: FAIL (no stills found)`);
    process.exit(2);
  }

  const measured = [];
  for (const name of files) {
    const filePath = join(dir, name);
    const r = spawnSync("ffmpeg", ["-v", "error", "-i", filePath, "-vf", "signalstats,metadata=print:file=-", "-f", "null", "-"], { encoding: "utf8" });

    if (r.error) {
      const message = `not measured: ffmpeg is not available (${r.error.message})`;
      writeRecord(dir, { dir, minRange, allow, results: measured, pass: false, error: message, at: new Date().toISOString() });
      console.error(`STILLS ${dir}: ${message}`);
      process.exit(1);
    }
    if (r.status !== 0) {
      const detail = (r.stderr || r.stdout || "").trim().split("\n").slice(-3).join(" / ");
      const message = `not measured: ffmpeg errored on ${name} (exit ${r.status}): ${detail}`;
      writeRecord(dir, { dir, minRange, allow, results: measured, pass: false, error: message, at: new Date().toISOString() });
      console.error(`STILLS ${dir}: ${message}`);
      process.exit(1);
    }

    const stats = parseSignalStats(r.stdout) ?? parseSignalStats(r.stderr);
    if (!stats) {
      const raw = (r.stdout || r.stderr || "").trim().slice(0, 500);
      const message = `not measured: could not parse signalstats output for ${name}`;
      writeRecord(dir, { dir, minRange, allow, results: measured, pass: false, error: message, raw, at: new Date().toISOString() });
      console.error(`STILLS ${dir}: ${message}`);
      console.error(raw);
      process.exit(1);
    }

    measured.push({ name, range: stats.ymax - stats.ymin });
  }

  const { pass, results, blankCount } = judge(measured, { minRange, allow });
  for (const r of results) {
    console.log(`  [${r.status}] ${r.name}: luma range ${r.range}`);
  }
  writeRecord(dir, { dir, minRange, allow, results, pass, blankCount, at: new Date().toISOString() });
  console.log(pass ? `STILLS ${dir}: PASS` : `STILLS ${dir}: FAIL (${blankCount} blank)`);
  process.exit(pass ? 0 : 1);
}

main();
