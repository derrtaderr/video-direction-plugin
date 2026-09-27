import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseArchetypeFloors, parseBrandMotion, resolveFloor } from "./floors.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ARCHETYPES = join(here, "..", "references", "style-archetypes.md");

test("all five archetypes declare a motion floor", () => {
  const floors = parseArchetypeFloors(readFileSync(ARCHETYPES, "utf8"));
  assert.deepEqual([...floors.keys()], ["Launch Film", "Mechanism Explainer", "Kinetic Essay", "Announcement Card", "Content Hero"]);
  assert.deepEqual(floors.get("Launch Film"), { camera: "every-scene", transitions: 1, rules: 4, stateChange: "ui-beats", deadZone: 0.08 });
  assert.deepEqual(floors.get("Announcement Card"), { camera: "one-drift", transitions: 0, rules: 2, stateChange: "none", deadZone: null });
});

test("brand Motion section parses and only raises", () => {
  const brand = parseBrandMotion("# Brand\n\n## Motion\n\nrules: 6\ntransitions: 2\ndead-zone: 0.05\n");
  assert.deepEqual(brand, { rules: 6, transitions: 2, deadZone: 0.05 });
  const base = { camera: "every-scene", transitions: 1, rules: 4, stateChange: "ui-beats", deadZone: 0.08 };
  const { floor, notes } = resolveFloor(base, brand);
  assert.deepEqual(floor, { camera: "every-scene", transitions: 2, rules: 6, stateChange: "ui-beats", deadZone: 0.05 });
  assert.equal(notes.length, 0);
});

test("brand Motion section cannot lower a floor", () => {
  const base = { camera: "every-scene", transitions: 1, rules: 4, stateChange: "ui-beats", deadZone: 0.08 };
  const { floor, notes } = resolveFloor(base, { rules: 2, transitions: 0 });
  assert.equal(floor.rules, 4);
  assert.equal(floor.transitions, 1);
  assert.equal(notes.length, 2);
  assert.match(notes[0], /rules: 2 is below the archetype floor 4/);
});

test("missing brand Motion section returns null and the archetype floor applies", () => {
  assert.equal(parseBrandMotion("# Brand\n\n## Constants\n"), null);
  const base = { camera: "one-drift", transitions: 0, rules: 2, stateChange: "none", deadZone: null };
  assert.deepEqual(resolveFloor(base, null).floor, base);
});
