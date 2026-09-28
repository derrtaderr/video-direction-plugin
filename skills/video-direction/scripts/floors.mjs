const CAMERA = new Set(["every-scene", "one-drift"]);
const STATE = new Set(["ui-beats", "none"]);

function parseFloorString(s) {
  const floor = { camera: null, transitions: 0, rules: 0, stateChange: "none", deadZone: null };
  for (const part of s.split(";")) {
    const [k, v] = part.split("=").map((x) => x.trim());
    if (k === "camera" && CAMERA.has(v)) floor.camera = v;
    else if (k === "transitions") floor.transitions = Number(v);
    else if (k === "rules") floor.rules = Number(v);
    else if (k === "state-change" && STATE.has(v)) floor.stateChange = v;
    else if (k === "dead-zone") floor.deadZone = v === "none" ? null : Number(v);
  }
  if (!floor.camera) throw new Error(`floor string missing camera: ${s}`);
  return floor;
}

export function parseArchetypeFloors(markdown) {
  const floors = new Map();
  let current = null;
  for (const line of markdown.split("\n")) {
    const h = line.match(/^## \d+\. (.+)$/);
    if (h) current = h[1].trim();
    const f = line.match(/^- \*\*Motion floor:\*\* `([^`]+)`/);
    if (f && current) floors.set(current, parseFloorString(f[1]));
  }
  return floors;
}

export function parseBrandMotion(markdown) {
  const m = markdown.match(/^## Motion[^\n]*\n([\s\S]*?)(?=^## |\s*$(?![\s\S]))/m);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^\s*(rules|transitions|dead-zone)\s*:\s*([0-9.]+)\s*$/);
    if (!kv) continue;
    const key = kv[1] === "dead-zone" ? "deadZone" : kv[1];
    out[key] = Number(kv[2]);
  }
  return Object.keys(out).length ? out : null;
}

export function resolveFloor(archetypeFloor, brandMotion) {
  const floor = { ...archetypeFloor };
  const notes = [];
  if (!brandMotion) return { floor, notes };
  for (const key of ["rules", "transitions"]) {
    if (brandMotion[key] == null) continue;
    if (brandMotion[key] < floor[key]) notes.push(`brand Motion ${key}: ${brandMotion[key]} is below the archetype floor ${floor[key]}; archetype floor applies`);
    else floor[key] = brandMotion[key];
  }
  if (brandMotion.deadZone != null) {
    if (floor.deadZone != null && brandMotion.deadZone > floor.deadZone) notes.push(`brand Motion dead-zone: ${brandMotion.deadZone} is looser than the archetype cap ${floor.deadZone}; archetype cap applies`);
    else floor.deadZone = brandMotion.deadZone;
  }
  return { floor, notes };
}
