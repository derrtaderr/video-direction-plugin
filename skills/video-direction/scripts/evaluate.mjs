export const MOVE_PROPS = new Set(["x", "y", "z", "scale", "scaleX", "scaleY", "xPercent", "yPercent", "rotation", "rotate", "rotationX", "rotationY", "transform"]);
const BAD_FLAGS = new Set(["offscreen", "invisible", "degenerate", "collision"]);

const overlaps = (t, a, b) => t.start < b && t.end > a;

export function evaluateFloor({ map, composition, beats, floor, vocabulary }) {
  const checks = [];
  const add = (name, pass, evidence) => checks.push({ name, pass, evidence });

  if (!map || !Array.isArray(map.tweens) || map.mappedTweens === 0 || map.tweens.length === 0) {
    add("measured", false, "not measured: no animation map or zero mapped tweens; nothing below can be trusted");
    return { pass: false, checks };
  }
  add("measured", true, `${map.mappedTweens} tweens mapped over ${map.duration}s`);

  const clipByN = new Map(composition.clips.map((c) => [c.n, c]));
  const tweensFor = (sel) => map.tweens.filter((t) => t.selector === sel);

  // camera
  const camProblems = [];
  let moves = 0;
  for (const b of beats) {
    const clip = clipByN.get(b.n);
    if (!clip) { camProblems.push(`beat ${b.n} has no clip id="beat-${b.n}"`); continue; }
    if (b.camera === "hold") continue;
    const moving = clip.cameraId && tweensFor(`#${clip.cameraId}`).some((t) => t.props.some((p) => MOVE_PROPS.has(p)) && overlaps(t, clip.start, clip.end));
    if (moving) moves++;
    else camProblems.push(`beat ${b.n} camera ${clip.cameraId ? "#" + clip.cameraId : "(none)"} has no transform tween in its window`);
  }
  const missing = camProblems.filter((p) => p.includes("has no clip"));
  if (floor.camera === "every-scene") add("camera", camProblems.length === 0, camProblems.length ? camProblems.join("; ") : `${moves} scenes move, holds declared: ${beats.filter((b) => b.camera === "hold").length}`);
  else {
    const drifted = moves >= 1 || composition.clips.some((c) => c.cameraId && tweensFor(`#${c.cameraId}`).some((t) => t.props.some((p) => MOVE_PROPS.has(p))));
    add("camera", missing.length === 0 && drifted, missing.length ? missing.join("; ") : (drifted ? "one drift present" : "no camera drift anywhere"));
  }

  // stamps carry motion, and declared names are stamped
  const stampProblems = [];
  const liveRules = new Set();
  for (const b of beats) {
    const clip = clipByN.get(b.n);
    if (!clip) continue;
    const declared = [b.entrance, b.state, b.camera].filter((x) => x && !["hold", "none"].includes(x));
    for (const s of clip.stamps) {
      if (vocabulary && vocabulary.all && !vocabulary.all.has(s.rule)) { stampProblems.push(`#${s.id} (${s.rule}) is not a vocabulary name`); continue; }
      if (tweensFor(`#${s.id}`).length) liveRules.add(s.rule);
      else stampProblems.push(`#${s.id} (${s.rule}) has no tween`);
    }
    const stampedRules = new Set(clip.stamps.map((s) => s.rule));
    for (const d of declared) {
      const cameraName = d === b.camera;
      if (cameraName && clip.cameraId) continue; // camera rules are proven by the camera check
      if (!stampedRules.has(d)) stampProblems.push(`beat ${b.n} declares ${d} but no element carries data-rule="${d}"`);
    }
  }
  add("stamps carry motion", stampProblems.length === 0, stampProblems.length ? stampProblems.join("; ") : `${liveRules.size} stamped rules all animate`);

  // distinct rules
  const distinct = new Set(liveRules);
  add("distinct rules", distinct.size >= floor.rules, `${distinct.size} of ${floor.rules}: ${[...distinct].join(", ")}`);

  // transitions: a declared transition (anything but cut) needs BOTH the structural
  // overlap between clips AND a stamped element carrying that transition's name whose
  // tweens fall inside the overlap window [next.start, prev.end]. A clip-level crossfade
  // makes the map flag a collision between the two clip wrappers; that is handled as an
  // exemption in the map-flags check below, not here.
  const sorted = [...composition.clips].sort((a, b) => a.start - b.start);
  let overlapsCount = 0;
  const transitionProblems = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const prev = sorted[i];
    const next = sorted[i + 1];
    const beat = beats.find((b) => b.n === prev.n);
    const name = beat?.transition && beat.transition !== "cut" ? beat.transition : null;
    if (!name) continue;
    const windowStart = next.start;
    const windowEnd = prev.end;
    const hasOverlap = windowStart < windowEnd;
    const candidates = [...prev.stamps, ...next.stamps].filter((s) => s.rule === name);
    const hasMotion = candidates.some((s) => tweensFor(`#${s.id}`).some((t) => overlaps(t, windowStart, windowEnd)));
    if (hasOverlap && hasMotion) { overlapsCount++; continue; }
    const missing = [];
    if (!hasOverlap) missing.push("overlap");
    if (!hasMotion) missing.push("motion");
    transitionProblems.push(`beat ${prev.n} declares ${name} but ${missing.join(" and ")} missing (window [${windowStart}, ${windowEnd}])`);
  }
  add("transitions", overlapsCount >= floor.transitions && transitionProblems.length === 0, transitionProblems.length ? transitionProblems.join("; ") : `${overlapsCount} of ${floor.transitions} named transitions with overlap and motion`);

  // state change
  if (floor.stateChange === "ui-beats") {
    const uiProblems = [];
    for (const b of beats.filter((x) => x.ui)) {
      const clip = clipByN.get(b.n);
      const ok = b.state !== "none" && clip?.stamps.some((s) => s.rule === b.state && tweensFor(`#${s.id}`).some((t) => t.selector !== `#${clip.cameraId}`));
      if (!ok) uiProblems.push(`beat ${b.n} is [ui] with state change "${b.state}" and no animating stamp for it`);
    }
    add("state change", uiProblems.length === 0, uiProblems.length ? uiProblems.join("; ") : `${beats.filter((x) => x.ui).length} [ui] beats each change state`);
  } else add("state change", true, "not required by this floor");

  // dead zones
  if (floor.deadZone != null) {
    const dead = (map.deadZones ?? []).reduce((a, z) => a + (z.duration ?? z.end - z.start), 0);
    const frac = map.duration ? dead / map.duration : 1;
    add("dead zones", frac <= floor.deadZone, `${(frac * 100).toFixed(1)}% dead against a ${(floor.deadZone * 100).toFixed(0)}% cap`);
  } else add("dead zones", true, "no cap for this floor");

  // map flags. A clip-level crossfade legitimately makes the map flag a `collision`
  // between the two clip wrappers (#beat-<n>); that flag alone is exempt on those
  // selectors. Any other bad flag on a clip wrapper, or any bad flag anywhere else,
  // still fails.
  const CLIP_WRAPPER = /^#beat-\d+$/;
  const flagged = map.tweens.filter((t) => {
    const bad = (t.flags ?? []).filter((f) => BAD_FLAGS.has(f));
    if (!bad.length) return false;
    const remaining = CLIP_WRAPPER.test(t.selector) ? bad.filter((f) => f !== "collision") : bad;
    return remaining.length > 0;
  });
  add("map flags", flagged.length === 0, flagged.length ? flagged.map((t) => `${t.selector}: ${t.flags.join(",")} (${t.summary})`).join("; ") : "no offscreen, invisible, degenerate or colliding tweens");

  return { pass: checks.every((c) => c.pass), checks };
}
