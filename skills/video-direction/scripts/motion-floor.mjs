#!/usr/bin/env node
// skills/video-direction/scripts/motion-floor.mjs
// The motion critic. Runs after `npx hyperframes check` and before `npx hyperframes render`.
// Usage: node motion-floor.mjs --piece video-work/<slug> [--brand motion-brand.md] [--animation-map <path>]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseVocabulary, VOCABULARY_PATH } from "./vocabulary.mjs";
import { parseArchetypeFloors, parseBrandMotion, resolveFloor } from "./floors.mjs";
import { parseBoards, lintChoreography } from "./boards.mjs";
import { parseComposition } from "./composition.mjs";
import { evaluateFloor } from "./evaluate.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const piece = opt("--piece");
if (!piece) { console.error("usage: motion-floor.mjs --piece video-work/<slug> [--brand motion-brand.md] [--animation-map <path>]"); process.exit(2); }

const compDir = join(piece, "composition");
const outDir = join(compDir, ".hyperframes", "anim-map");
mkdirSync(outDir, { recursive: true });

function finish(archetype, result, extra = {}) {
  const record = { piece, archetype, pass: result.pass, checks: result.checks, ...extra, at: new Date().toISOString() };
  writeFileSync(join(outDir, "motion-floor.json"), JSON.stringify(record, null, 2));
  console.log(`MOTION FLOOR ${archetype}: ${result.pass ? "PASS" : "FAIL"}`);
  for (const c of result.checks) console.log(`  [${c.pass ? "ok" : "FAIL"}] ${c.name}: ${c.evidence}`);
  for (const n of extra.notes ?? []) console.log(`  note: ${n}`);
  process.exit(result.pass ? 0 : 1);
}

const styleMd = readFileSync(join(piece, "style.md"), "utf8");
const archetype = (styleMd.match(/\*\*Style from the roster:\*\*\s*([^.\n(]+)/) ?? [])[1]?.trim() ?? "(unknown)";
const signatureMoves = [...styleMd.matchAll(/^\s*\d+\.\s*`?([a-z0-9-]+)`?/gm)].map((m) => m[1]);

// Resolve the floor before linting: the lint options (whether a move or a named
// transition is required) are driven by what this archetype's floor demands.
const floors = parseArchetypeFloors(readFileSync(join(here, "..", "references", "style-archetypes.md"), "utf8"));
const base = floors.get(archetype);
if (!base) finish(archetype, { pass: false, checks: [{ name: "archetype", pass: false, evidence: `"${archetype}" has no motion floor in style-archetypes.md; name the archetype in style.md as "**Style from the roster:** <name>."` }] });
const brandPath = opt("--brand");
const brand = brandPath && existsSync(brandPath) ? parseBrandMotion(readFileSync(brandPath, "utf8")) : null;
const { floor, notes } = resolveFloor(base, brand);

const vocabulary = parseVocabulary(readFileSync(VOCABULARY_PATH, "utf8"));
const beats = parseBoards(readFileSync(join(piece, "boards.md"), "utf8"));
const lint = lintChoreography(beats, vocabulary, signatureMoves, { requireTransition: floor.transitions >= 1, requireMove: floor.camera === "every-scene" });
if (!lint.pass) finish(archetype, { pass: false, checks: lint.problems.map((p) => ({ name: "choreography", pass: false, evidence: p })) }, { notes });

const candidates = [opt("--animation-map"), process.env.HF_ANIMATION_MAP,
  join(homedir(), ".claude", "skills", "hyperframes-animation", "scripts", "animation-map.mjs"),
  join(homedir(), ".agents", "skills", "hyperframes-animation", "scripts", "animation-map.mjs")].filter(Boolean);
const script = candidates.find((p) => existsSync(p));
const FIX = "install or refresh the animation skill with `npx hyperframes skills update`, or point --animation-map at scripts/animation-map.mjs";
let map = null;
let measureNote = null;
if (!script) measureNote = `not measured: no animation-map script found (${FIX})`;
else {
  const r = spawnSync(process.execPath, [script, compDir, "--out", outDir], { encoding: "utf8", env: { ...process.env, HYPERFRAMES_SKILL_BOOTSTRAP_DEPS: process.env.HYPERFRAMES_SKILL_BOOTSTRAP_DEPS ?? "1" } });
  const mapPath = join(outDir, "animation-map.json");
  if (r.status !== 0 || !existsSync(mapPath)) measureNote = `not measured: animation-map exited ${r.status} (${(r.stderr || r.stdout || "").trim().split("\n").pop()}); ${FIX}`;
  else map = JSON.parse(readFileSync(mapPath, "utf8"));
}
if (measureNote) finish(archetype, { pass: false, checks: [{ name: "measured", pass: false, evidence: measureNote }] }, { notes });

const composition = parseComposition(readFileSync(join(compDir, "index.html"), "utf8"));
const result = evaluateFloor({ map, composition, beats, floor });
if (composition.problems?.length) result.checks.push({ name: "stamps without id", pass: false, evidence: composition.problems.join("; ") });
result.pass = result.checks.every((c) => c.pass);
finish(archetype, result, { floor, notes });
