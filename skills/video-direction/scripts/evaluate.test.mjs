import test from "node:test";
import assert from "node:assert/strict";
import { evaluateFloor } from "./evaluate.mjs";

const LAUNCH = { camera: "every-scene", transitions: 1, rules: 4, stateChange: "ui-beats", deadZone: 0.08 };
const ESSAY = { camera: "every-scene", transitions: 1, rules: 3, stateChange: "none", deadZone: 0.05 };

const beats = [
  { n: 1, start: 0, role: "setup", content: "open", ui: false, camera: "zoom-out-workspace-reveal", entrance: "press-release-spring", state: "none", transition: "push-left" },
  { n: 2, start: 4, role: "turn", content: "picker", ui: true, camera: "multi-phase-camera", entrance: "kinetic-beat-slam", state: "cursor-ui-demo", transition: "cut" },
  { n: 3, start: 8, role: "resolve", content: "wordmark", ui: false, camera: "hold", entrance: "logo-assemble-lockup", state: "none", transition: "cut" },
];
const composition = { clips: [
  { id: "beat-1", n: 1, start: 0, end: 4.5, transition: "push-left", cameraId: "cam-beat-1", stamps: [{ id: "h1", rule: "press-release-spring" }] },
  { id: "beat-2", n: 2, start: 4, end: 8, transition: null, cameraId: "cam-beat-2", stamps: [{ id: "picker", rule: "cursor-ui-demo" }, { id: "slam", rule: "kinetic-beat-slam" }] },
  { id: "beat-3", n: 3, start: 8, end: 11, transition: null, cameraId: "cam-beat-3", stamps: [{ id: "mark", rule: "logo-assemble-lockup" }] },
] };
const tween = (selector, props, start, end, flags = []) => ({ selector, props, start, end, flags, summary: `${selector} ${props.join(",")}` });
const goodMap = () => ({ duration: 11, totalTweens: 8, mappedTweens: 8, deadZones: [], tweens: [
  tween("#cam-beat-1", ["scale", "x"], 0, 3),
  tween("#h1", ["opacity", "y"], 0.2, 1),
  tween("#cam-beat-2", ["scale"], 4, 6),
  tween("#picker", ["opacity"], 4.2, 5),
  tween("#slam", ["scale"], 4.5, 5.2),
  tween("#mark", ["opacity", "scale"], 8.2, 9.5),
] });

test("a full composition passes the Launch Film floor", () => {
  const r = evaluateFloor({ map: goodMap(), composition, beats, floor: LAUNCH });
  assert.equal(r.pass, true, JSON.stringify(r.checks.filter((c) => !c.pass)));
});

test("false green 1: an empty map is FAIL not measured", () => {
  const r = evaluateFloor({ map: { duration: 11, totalTweens: 0, mappedTweens: 0, tweens: [], deadZones: [] }, composition, beats, floor: LAUNCH });
  assert.equal(r.pass, false);
  assert.equal(r.checks.find((c) => c.name === "measured").pass, false);
});

test("false green 2: a missing map is FAIL not measured", () => {
  const r = evaluateFloor({ map: null, composition, beats, floor: LAUNCH });
  assert.equal(r.pass, false);
  assert.match(r.checks[0].evidence, /not measured/);
});

test("false green 3: a declared rule with no tweens fails", () => {
  const map = goodMap();
  map.tweens = map.tweens.filter((t) => t.selector !== "#picker");
  const r = evaluateFloor({ map, composition, beats, floor: LAUNCH });
  assert.equal(r.pass, false);
  assert.match(r.checks.find((c) => c.name === "stamps carry motion").evidence, /#picker \(cursor-ui-demo\) has no tween/);
});

test("false green 4: a camera wrapper that never moves fails, opacity does not count", () => {
  const map = goodMap();
  map.tweens = map.tweens.map((t) => (t.selector === "#cam-beat-2" ? tween("#cam-beat-2", ["opacity"], 4, 6) : t));
  const r = evaluateFloor({ map, composition, beats, floor: LAUNCH });
  assert.equal(r.pass, false);
  assert.match(r.checks.find((c) => c.name === "camera").evidence, /beat 2 camera #cam-beat-2 has no transform tween/);
});

test("false green 5: under the distinct-rules floor while everything else passes", () => {
  const r = evaluateFloor({ map: goodMap(), composition, beats, floor: { ...LAUNCH, rules: 5 } });
  assert.equal(r.pass, false);
  assert.match(r.checks.find((c) => c.name === "distinct rules").evidence, /4 of 5/);
});

test("a [ui] beat with state none fails Launch Film and passes Kinetic Essay", () => {
  const b = beats.map((x) => (x.n === 2 ? { ...x, state: "none" } : x));
  assert.equal(evaluateFloor({ map: goodMap(), composition, beats: b, floor: LAUNCH }).checks.find((c) => c.name === "state change").pass, false);
  assert.equal(evaluateFloor({ map: goodMap(), composition, beats: b, floor: ESSAY }).checks.find((c) => c.name === "state change").pass, true);
});

test("transitions need an overlap window; dead zones and map flags fail", () => {
  const noOverlap = { clips: composition.clips.map((c) => (c.id === "beat-1" ? { ...c, end: 4 } : c)) };
  assert.equal(evaluateFloor({ map: goodMap(), composition: noOverlap, beats, floor: LAUNCH }).checks.find((c) => c.name === "transitions").pass, false);
  const dead = goodMap(); dead.deadZones = [{ start: 9.5, end: 11, duration: 1.5 }];
  assert.equal(evaluateFloor({ map: dead, composition, beats, floor: LAUNCH }).checks.find((c) => c.name === "dead zones").pass, false);
  const flagged = goodMap(); flagged.tweens[1].flags = ["offscreen"];
  const r = evaluateFloor({ map: flagged, composition, beats, floor: LAUNCH });
  assert.equal(r.checks.find((c) => c.name === "map flags").pass, false);
  assert.match(r.checks.find((c) => c.name === "map flags").evidence, /offscreen/);
});

test("Announcement Card floor: one drift anywhere, no transitions required", () => {
  const card = { camera: "one-drift", transitions: 0, rules: 2, stateChange: "none", deadZone: null };
  const b = [{ n: 1, start: 0, role: "card", content: "held", ui: false, camera: "hold", entrance: "press-release-spring", state: "none", transition: "cut" }];
  const comp = { clips: [{ id: "beat-1", n: 1, start: 0, end: 11, transition: null, cameraId: "cam-beat-1", stamps: [{ id: "charm", rule: "particle-burst" }, { id: "price", rule: "press-release-spring" }] }] };
  const map = { duration: 11, totalTweens: 3, mappedTweens: 3, deadZones: [{ start: 8, end: 11, duration: 3 }], tweens: [tween("#cam-beat-1", ["scale"], 0, 11), tween("#charm", ["scale"], 2, 4), tween("#price", ["opacity", "y"], 6, 7)] };
  assert.equal(evaluateFloor({ map, composition: comp, beats: b, floor: card }).pass, true);
});

test("a beat with no clip fails the camera check under a one-drift floor too", () => {
  const card = { camera: "one-drift", transitions: 0, rules: 2, stateChange: "none", deadZone: null };
  const b = [
    { n: 1, start: 0, role: "card", content: "a", ui: false, camera: "hold", entrance: "press-release-spring", state: "none", transition: "cut" },
    { n: 2, start: 5, role: "card", content: "b", ui: false, camera: "multi-phase-camera", entrance: "kinetic-beat-slam", state: "none", transition: "cut" },
  ];
  const comp = { clips: [{ id: "beat-1", n: 1, start: 0, end: 10, transition: null, cameraId: "cam-beat-1", stamps: [{ id: "charm", rule: "particle-burst" }, { id: "price", rule: "press-release-spring" }] }] };
  const map = { duration: 10, totalTweens: 3, mappedTweens: 3, deadZones: [], tweens: [tween("#cam-beat-1", ["scale"], 0, 10), tween("#charm", ["scale"], 2, 4), tween("#price", ["opacity", "y"], 6, 7)] };
  const r = evaluateFloor({ map, composition: comp, beats: b, floor: card });
  assert.equal(r.pass, false);
  assert.match(r.checks.find((c) => c.name === "camera").evidence, /beat 2 has no clip id="beat-2"/);
});
