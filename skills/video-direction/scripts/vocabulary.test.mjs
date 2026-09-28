import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseVocabulary, VOCABULARY_PATH } from "./vocabulary.mjs";

test("vocabulary parses four tables with the mandatory entries", () => {
  const v = parseVocabulary(readFileSync(VOCABULARY_PATH, "utf8"));
  assert.ok(v.camera.has("hold"));
  assert.ok(v.camera.has("multi-phase-camera"));
  assert.ok(v.camera.has("zoom-out-workspace-reveal"));
  assert.ok(v.camera.has("camera-journey"));
  assert.ok(v.entrance.has("press-release-spring"));
  assert.ok(v.state.has("cursor-ui-demo"));
  assert.ok(v.state.has("none"));
  assert.ok(v.transition.has("cut"));
  assert.ok(v.transition.size >= 6);
  assert.ok(v.all.size >= 40);
});

test("every vocabulary row carries a pointer column", () => {
  const md = readFileSync(VOCABULARY_PATH, "utf8");
  const rows = md.split("\n").filter((l) => /^\| `/.test(l));
  for (const r of rows) {
    const cells = r.split("|").map((c) => c.trim()).filter(Boolean);
    assert.equal(cells.length, 3, `row needs name, when, pointer: ${r}`);
    assert.ok(cells[2].length > 3, `pointer missing: ${r}`);
  }
});

test("names are unique across tables", () => {
  const v = parseVocabulary(readFileSync(VOCABULARY_PATH, "utf8"));
  const total = v.camera.size + v.entrance.size + v.state.size + v.transition.size;
  assert.equal(total, v.all.size);
});

test("SKILL.md wires stage 3b, the stamps, and the motion critic", () => {
  const skill = readFileSync(new URL("../SKILL.md", import.meta.url), "utf8");
  assert.match(skill, /\*\*Choreography\*\* \(stage 3b/);
  assert.match(skill, /data-rule=/);
  assert.match(skill, /id="beat-<n>"/);
  assert.match(skill, /id="cam-beat-<n>"/);
  assert.match(skill, /scripts\/motion-floor\.mjs --piece/);
  assert.match(skill, /\*\*Motion critic\*\*/);
  assert.match(skill, /three stills per beat/);
  assert.ok(skill.indexOf("motion-floor.mjs") < skill.indexOf("npx hyperframes render`** for the MP4"), "critic must be described before the render");
});
