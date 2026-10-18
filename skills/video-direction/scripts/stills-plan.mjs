#!/usr/bin/env node
// skills/video-direction/scripts/stills-plan.mjs
// Where QC pulls its stills. Three per beat (in, hold, out) inside the beat's solo window,
// so the review sees the motion and not the pose, plus one at the middle of every overlap
// window between two clips: a transition is where two busy layouts become a muddy double
// exposure, and a still at its midpoint is the only frame that shows it.
// Usage: node stills-plan.mjs <composition/index.html>
import { readFileSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseComposition } from "./composition.mjs";

const AT = { in: 0.15, hold: 0.6, out: 0.9 };
const round = (t) => +t.toFixed(3);

// clips: parseComposition's clips ({ id, n, start, end }). The solo window is the part of a
// clip no neighbour overlaps, so in/hold/out never land mid-transition; the hold still is
// the settled frame a poster is pulled from.
export function planStills(clips) {
  const sorted = [...clips].sort((a, b) => a.start - b.start);
  const label = (c) => (c.n != null ? `beat${c.n}` : c.id);
  const stills = [];
  sorted.forEach((c, i) => {
    const prev = sorted[i - 1];
    const next = sorted[i + 1];
    const from = prev && prev.end > c.start ? prev.end : c.start;
    const to = next && next.start < c.end ? next.start : c.end;
    for (const kind of ["in", "hold", "out"]) stills.push({ name: `${label(c)}-${kind}`, t: round(from + AT[kind] * (to - from)), beat: c.n, kind });
    if (next && next.start < c.end) stills.push({ name: `${label(c)}-to-${next.n ?? next.id}-mid`, t: round((next.start + c.end) / 2), beat: c.n, kind: "mid" });
  });
  return stills.sort((a, b) => a.t - b.t);
}

function main() {
  const file = process.argv[2];
  if (!file || !existsSync(file)) {
    console.error("usage: stills-plan.mjs <composition/index.html>");
    process.exit(2);
  }
  for (const s of planStills(parseComposition(readFileSync(file, "utf8")).clips)) console.log(`${s.name}\t${s.t}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
