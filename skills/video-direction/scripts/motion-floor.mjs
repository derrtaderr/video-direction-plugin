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

const NEEDS = "a piece needs style.md, boards.md and composition/index.html";

function finish(archetype, result, extra = {}) {
  const record = { piece, archetype, pass: result.pass, checks: result.checks, ...extra, at: new Date().toISOString() };
  writeFileSync(join(outDir, "motion-floor.json"), JSON.stringify(record, null, 2));
  console.log(`MOTION FLOOR ${archetype}: ${result.pass ? "PASS" : "FAIL"}`);
  for (const c of result.checks) console.log(`  [${c.pass ? "ok" : "FAIL"}] ${c.name}: ${c.evidence}`);
  for (const n of extra.notes ?? []) console.log(`  note: ${n}`);
  process.exit(result.pass ? 0 : 1);
}

// Signature moves are only the numbered lines inside the "**Signature moves" section of
// style.md. Scanning the whole file would pick up any numbered list (e.g. "Variant axes
// chosen") and fabricate lint failures for names that were never declared as signature
// moves.
function extractSignatureMoves(styleMd) {
  const lines = styleMd.split("\n");
  const start = lines.findIndex((l) => /^\*\*Signature moves/.test(l));
  if (start < 0) return [];
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\*\*/.test(lines[i]) || /^##/.test(lines[i])) { end = i; break; }
  }
  const slice = lines.slice(start, end).join("\n");
  return [...slice.matchAll(/^\s*\d+\.\s*`?([a-z0-9-]+)`?/gm)].map((m) => m[1]);
}

async function main() {
  const stylePath = join(piece, "style.md");
  if (!existsSync(stylePath)) return finish("(unknown)", { pass: false, checks: [{ name: "inputs", pass: false, evidence: `missing style.md; ${NEEDS}` }] });
  const styleMd = readFileSync(stylePath, "utf8");
  const archetype = (styleMd.match(/\*\*Style from the roster:\*\*\s*([^.\n(]+)/) ?? [])[1]?.trim() ?? "(unknown)";
  const signatureMoves = extractSignatureMoves(styleMd);

  // Resolve the floor before linting: the lint options (whether a move or a named
  // transition is required) are driven by what this archetype's floor demands.
  const floors = parseArchetypeFloors(readFileSync(join(here, "..", "references", "style-archetypes.md"), "utf8"));
  const base = floors.get(archetype);
  if (!base) return finish(archetype, { pass: false, checks: [{ name: "archetype", pass: false, evidence: `"${archetype}" has no motion floor in style-archetypes.md; name the archetype in style.md as "**Style from the roster:** <name>."` }] });
  const brandPath = opt("--brand");
  const brand = brandPath && existsSync(brandPath) ? parseBrandMotion(readFileSync(brandPath, "utf8")) : null;
  const { floor, notes } = resolveFloor(base, brand);

  const boardsPath = join(piece, "boards.md");
  if (!existsSync(boardsPath)) return finish(archetype, { pass: false, checks: [{ name: "inputs", pass: false, evidence: `missing boards.md; ${NEEDS}` }] }, { notes });
  const vocabulary = parseVocabulary(readFileSync(VOCABULARY_PATH, "utf8"));
  const beats = parseBoards(readFileSync(boardsPath, "utf8"));
  const lint = lintChoreography(beats, vocabulary, signatureMoves, { requireTransition: floor.transitions >= 1, requireMove: floor.camera === "every-scene" });
  if (!lint.pass) return finish(archetype, { pass: false, checks: lint.problems.map((p) => ({ name: "choreography", pass: false, evidence: p })) }, { notes });

  const FIX = "install or refresh the animation skill with `npx hyperframes skills update`, or point --animation-map at scripts/animation-map.mjs";
  // An explicit --animation-map or HF_ANIMATION_MAP names one path; if it does not exist
  // that is the failure, immediately, naming the path. The homedir fallback chain is only
  // consulted when neither was given, so a test (or a real run) that names a bad path
  // never silently falls through to whatever happens to be installed on the machine.
  const explicit = opt("--animation-map") || process.env.HF_ANIMATION_MAP || null;
  let script = null;
  let measureNote = null;
  if (explicit) {
    if (existsSync(explicit)) script = explicit;
    else measureNote = `not measured: animation-map script not found at ${explicit} (${FIX})`;
  } else {
    const homedirCandidates = [
      join(homedir(), ".claude", "skills", "hyperframes-animation", "scripts", "animation-map.mjs"),
      join(homedir(), ".agents", "skills", "hyperframes-animation", "scripts", "animation-map.mjs"),
    ];
    script = homedirCandidates.find((p) => existsSync(p));
    if (!script) measureNote = `not measured: no animation-map script found (${FIX})`;
  }
  let map = null;
  if (script) {
    const r = spawnSync(process.execPath, [script, compDir, "--out", outDir], { encoding: "utf8", env: { ...process.env, HYPERFRAMES_SKILL_BOOTSTRAP_DEPS: process.env.HYPERFRAMES_SKILL_BOOTSTRAP_DEPS ?? "1" } });
    const mapPath = join(outDir, "animation-map.json");
    if (r.status !== 0 || !existsSync(mapPath)) measureNote = `not measured: animation-map exited ${r.status} (${(r.stderr || r.stdout || "").trim().split("\n").pop()}); ${FIX}`;
    else map = JSON.parse(readFileSync(mapPath, "utf8"));
  }
  if (measureNote) return finish(archetype, { pass: false, checks: [{ name: "measured", pass: false, evidence: measureNote }] }, { notes });

  const indexPath = join(compDir, "index.html");
  if (!existsSync(indexPath)) return finish(archetype, { pass: false, checks: [{ name: "inputs", pass: false, evidence: `missing composition/index.html; ${NEEDS}` }] }, { notes });
  const composition = parseComposition(readFileSync(indexPath, "utf8"));
  const result = evaluateFloor({ map, composition, beats, floor });
  if (composition.problems?.length) result.checks.push({ name: "stamps without id", pass: false, evidence: composition.problems.join("; ") });
  result.pass = result.checks.every((c) => c.pass);
  return finish(archetype, result, { floor, notes });
}

await main();
