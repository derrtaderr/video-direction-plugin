// skills/video-direction/scripts/fixtures/fake-animation-map.mjs
// Test stand-in for the hyperframes-animation animation-map script.
// Usage: node fake-animation-map.mjs <composition-dir> --out <dir>
// Env FAKE_MAP_MODE: "good" (default) | "empty" | "crash" | "needs-bootstrap"
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const args = process.argv.slice(2);
const out = args[args.indexOf("--out") + 1];
const mode = process.env.FAKE_MAP_MODE ?? "good";
if (mode === "crash") { console.error("boom"); process.exit(1); }
if (mode === "needs-bootstrap") { console.error("packages not installed; set HYPERFRAMES_SKILL_BOOTSTRAP_DEPS=1 to allow install"); process.exit(1); }
mkdirSync(out, { recursive: true });
const tween = (selector, props, start, end) => ({ selector, props, start, end, flags: [], summary: selector });
const good = { duration: 11, totalTweens: 7, mappedTweens: 7, deadZones: [], tweens: [
  tween("#cam-beat-1", ["scale", "x"], 0, 3), tween("#h1", ["opacity", "y"], 0.2, 1),
  tween("#beat-1-out", ["xPercent"], 4, 4.5),
  tween("#cam-beat-2", ["scale"], 4, 6), tween("#picker", ["opacity"], 4.2, 5), tween("#slam", ["scale"], 4.5, 5.2),
  tween("#mark", ["opacity", "scale"], 8.2, 9.5),
] };
const empty = { duration: 11, totalTweens: 0, mappedTweens: 0, deadZones: [], tweens: [] };
writeFileSync(join(out, "animation-map.json"), JSON.stringify(mode === "empty" ? empty : good));
