/* THE PIXEL HACKER — canonical character sheet data
 * Source of truth for geometry. Scenes draw poses from here, never improvise the character.
 * Grid: 12 columns. Torso 12 rows + legs 5 rows (17 total) unless noted.
 * Two canonical cell sizes: P=7 (full-screen/terminal pieces), P=12 (dot-world scenes, ~5x dot pitch).
 * Constants: hoodie geometry and the orange face glint are identity — never restyle per scene.
 */

const HACKER_COLORS = {
  h: "#3f3f46", // hood
  H: "#2a2a31", // hood shadow (inner edge / back crease)
  f: "#0d0d12", // face void
  g: "#F97316", // THE GLINT — the one orange pixel; identity, always present when face shows
  b: "#27272A", // body
  z: "#9a4a10", // zipper (front views only)
  a: "#3f3f46", // arms
  l: "#1A1A1F", // legs
  s: "#45454d", // shoes
  m: "#52525B"  // mug prop (legacy; props are per-scene)
};

/* ---------- FRONT (canonical, shipped in while-you-slept 2026-06) ---------- */

const TORSO_FRONT = [
  "...hhhhhh...",
  "..hhhhhhhh..",
  "..hHffffhh..",
  "..hHfgfffh..",
  "..hHffffhh..",
  "...hhhhhh...",
  "..bbbbbbbb..",
  ".abbbzbbbb..",
  ".abbbzbbbb..",
  ".abbbzbbbb..",
  ".abbbbbbbb..",
  "...bbbbbb..."
];

const TORSO_TYPE = [
  "...hhhhhh...",
  "..hhhhhhhh..",
  "..hHffffhh..",
  "..hHfgfffh..",
  "..hHffffhh..",
  "...hhhhhh...",
  "..bbbbbbbb..",
  "..bbbzbbbaa.",
  "..bbbzbbbaa.",
  "..bbbzbbbb..",
  "..bbbbbbbb..",
  "...bbbbbb..."
];

/* raised right hand near the face; the mug (or any prop) attaches at the sip anchor, never baked in */
const TORSO_SIP = [
  "...hhhhhh...",
  "..hhhhhhhh..",
  "..hHffffhh..",
  "..hHfgfffh..",
  "..hHffffhh..",
  "...hhhhhh...",
  "..bbbbbbbb..",
  ".abbbzbbba..",
  ".abbbzbbba..",
  ".abbbzbbbb..",
  ".abbbbbbbb..",
  "...bbbbbb..."
];

const TORSO_POINT = [
  "...hhhhhh...",
  "..hhhhhhhh..",
  "..hHffffhh..",
  "..hHfgfffh..",
  "..hHffffhh..",
  "...hhhhhh...",
  "..bbbbbbbb..",
  ".abbbzbaaaa.",
  ".abbbzbbbb..",
  ".abbbzbbbb..",
  ".abbbbbbbb..",
  "...bbbbbb..."
];

const TORSO_CARRY = [
  "...hhhhhh...",
  "..hhhhhhhh..",
  "..hHffffhh..",
  "..hHfgfffh..",
  "..hHffffhh..",
  "..ahhhhhha..",
  "..abbbbbba..",
  "..bbbzbbbb..",
  "..bbbzbbbb..",
  "..bbbzbbbb..",
  "..bbbbbbbb..",
  "...bbbbbb..."
];

const TORSO_CLIMB = [
  "...hhhhhh..a",
  "..hhhhhhhh.a",
  "..hHffffhha.",
  "..hHfgfffha.",
  "..hHffffhh..",
  "...hhhhhh...",
  "..bbbbbbbb..",
  "..bbbzbbbb..",
  "..bbbzbbbb..",
  "..bbbzbbbb..",
  "..bbbbbbbb..",
  "...bbbbbb..."
];

/* ---------- PROFILE (right-facing; mirror rows for left) ---------- */

const TORSO_PROFILE = [
  "...hhhhhh...",
  "..hhhhhhhh..",
  "..hhhhHfff..",
  "..hhhhHfgf..",
  "..hhhhHfff..",
  "...hhhhhh...",
  "..bbbbbbbb..",
  "..bbabbbbz..",
  "..bbabbbbz..",
  "..bbabbbbz..",
  "..bbbbbbbb..",
  "...bbbbbb..."
];

/* ---------- BACK (no face, hood crease reads as back of head) ---------- */

const TORSO_BACK = [
  "...hhhhhh...",
  "..hhhHHhhh..",
  "..hhhHHhhh..",
  "..hhhHHhhh..",
  "..hhhhhhhh..",
  "...hhhhhh...",
  "..bbbbbbbb..",
  ".abbbbbbbba.",
  ".abbbbbbbba.",
  ".abbbbbbbba.",
  "..bbbbbbbb..",
  "...bbbbbb..."
];

/* ---------- LEGS ---------- */

const LEGS_WALK_A = [
  "...ll...ll..",
  "..ll.....ll.",
  "..ll.....ll.",
  ".ll.......ll",
  ".ss.......ss"
];

const LEGS_STAND = [
  "....llll....",
  "....llll....",
  "....l..l....",
  "....l..l....",
  "....ss.ss..."
];

const LEGS_CLIMB = [
  "...ll..ll...",
  "...ll...l...",
  "....l...l...",
  "....l...ll..",
  "....s....s.."
];

const LEGS_PROFILE = [
  "....llll....",
  "....llll....",
  "....l..l....",
  "....l..l....",
  "....ss.ss..."
];

/* Sitting on an edge, legs dangling — 3 rows, feet do not reach the ground line */
const LEGS_SIT = [
  "...ll..ll...",
  "...ll..ll...",
  "...ss..ss..."
];

/* ---------- POSE REGISTRY (torso + legs pairs; the menu scenes compose from) ---------- */

const HACKER_POSES = {
  /* views */
  front:   { torso: TORSO_FRONT,   legs: LEGS_STAND },
  profile: { torso: TORSO_PROFILE, legs: LEGS_PROFILE },
  back:    { torso: TORSO_BACK,    legs: LEGS_STAND },
  /* cycles */
  walkA:   { torso: TORSO_FRONT,   legs: LEGS_WALK_A },
  walkB:   { torso: TORSO_FRONT,   legs: LEGS_STAND },
  type:    { torso: TORSO_TYPE,    legs: LEGS_STAND },
  sip:     { torso: TORSO_SIP,     legs: LEGS_STAND },
  /* scene verbs */
  point:   { torso: TORSO_POINT,   legs: LEGS_STAND },
  carry:   { torso: TORSO_CARRY,   legs: LEGS_STAND },
  climb:   { torso: TORSO_CLIMB,   legs: LEGS_CLIMB },
  sit:     { torso: TORSO_FRONT,   legs: LEGS_SIT }
};

/* ---------- REGISTERED PROPS (attach at anchors; never baked into torso rows) ---------- */

/* magnifier — first post-sheet prop (sting-vibecodepm, 2026-07-25). LESSON: passed the isolated
   silhouette check but FAILED in-scene legibility at card scale (read as a mask on the front view).
   Hand-scale props are below the pantomime legibility bar — prefer WORN costume pieces that change
   the silhouette + an emitted effect (see motion-brand-system.md pantomime rules). Kept for
   large-P uses only. */
const PROP_MAGNIFIER = [
  ".mmm..",
  "m...m.",
  "m...m.",
  "m...m.",
  ".mmmd.",
  "....dd"
];

const HACKER_PROPS = {
  magnifier: { rows: PROP_MAGNIFIER, colors: { m: "#52525B", d: "#3f3f46" }, anchor: "sip" }
};

/* ---------- REGISTERED COSTUMES (worn, silhouette-changing — the pantomime-legible tier) ----------
   Costumes are OVERLAY layers + leg-set swaps; torso rows stay immutable. First registered:
   SCUBA (sting-vibecodepm v2, 2026-07-25) — passed the P=5 in-scene bar in 2 rounds.
   Canonical grids live in compositions/sting-vibecodepm/{dark,cream}/index.html:
   - mask visor overlay (V #9BA3AD): front rows 2-3 "...VVVVVV..."/"...VV.VVV..." (glint cell open);
     profile rows 2-3 at the leading edge; poolside variant pushed to rows 1-2.
   - fins leg-set: profile heel + long forward blade "...sssssssss"; front splayed "sssss..sssss";
   - headfirst dive sprite (inverted, fins up) + 2-frame splash + 3-size bubble circles.
   Copy from those compositions when a scene needs the diver; promote here in full if reuse recurs. */

/* Prop anchor cells (col,row on the 17-row composite) per pose — the ONE prop per scene attaches here */
const HACKER_ANCHORS = {
  sip:   { col: 10, row: 8,  note: "mug in raised right hand" },
  point: { col: 11, row: 7,  note: "tip of extended right arm" },
  carry: { col: 5,  row: 3,  note: "prop rides above the head, centered" },
  type:  { col: 9,  row: 7,  note: "keys under raised hands" }
};

function buildHackerSprite(host, poseName, P, colors) {
  const C = colors || HACKER_COLORS;
  const pose = HACKER_POSES[poseName];
  const rows = pose.torso.concat(pose.legs);
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === ".") continue;
      const px = document.createElement("div");
      px.style.position = "absolute";
      px.style.width = P + "px";
      px.style.height = P + "px";
      px.style.transform = `translate(${x * P}px, ${y * P}px)`;
      px.style.background = C[c] || "#333";
      host.appendChild(px);
    }
  });
}

/* mirror a pose horizontally (profile left = mirror of profile right) */
function mirrorRows(rows) {
  return rows.map(r => r.split("").reverse().join(""));
}

if (typeof module !== "undefined") {
  module.exports = { HACKER_COLORS, HACKER_POSES, HACKER_ANCHORS, HACKER_PROPS, mirrorRows };
}
if (typeof window !== "undefined") {
  window.HACKER_SHEET = { HACKER_COLORS, HACKER_POSES, HACKER_ANCHORS, HACKER_PROPS, buildHackerSprite, mirrorRows };
}
