// skills/video-direction/scripts/caption-check-core.mjs
// Pure geometry and judging for the caption gate. Kept apart from caption-check.mjs so it is
// unit-testable without a browser; the same functions are serialized into the page.

// Two boxes collide only when they share area. Edges that touch are clear.
export function intersects(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

// Every `step` seconds from 0 through the duration, the end included when it lands on a step.
export function sampleTimes(duration, step = 0.25) {
  const out = [];
  for (let i = 0; i * step <= duration + 1e-9; i++) out.push(+(i * step).toFixed(3));
  return out;
}

// An element is part of the set when it draws something itself. Wrappers, sections and the
// root <svg> are boxes around drawing, not drawing, and would collide with every caption.
// Self-contained (no module constants): caption-check.mjs serializes it into the page.
export function paintsItself({ tag, ownText, background, backgroundImage, borderWidth }) {
  const media = ["IMG", "VIDEO", "CANVAS", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "image", "use"];
  if (media.includes(tag)) return true;
  if (ownText) return true;
  if (backgroundImage && backgroundImage !== "none") return true;
  if (borderWidth > 0) return true;
  if (background && !/rgba\([^)]*,\s*0\)$/.test(background) && background !== "transparent") return true;
  return false;
}

// A backdrop (a full-frame fill, a vignette, a grain layer) sits under everything by design.
export function isBackdrop(box, { width, height }, share = 0.6) {
  const w = Math.max(0, Math.min(box.right, width) - Math.max(box.left, 0));
  const h = Math.max(0, Math.min(box.bottom, height) - Math.max(box.top, 0));
  return (w * h) / (width * height) >= share;
}

// samples: [{ t, captions: [box], set: [{ name, box }] }]
export function judgeSamples(samples) {
  const fails = [];
  let captioned = 0;
  for (const s of samples) {
    if (!s.captions.length) continue;
    captioned++;
    const hits = [...new Set(s.set.filter((e) => s.captions.some((c) => intersects(c, e.box))).map((e) => e.name))];
    if (hits.length) fails.push({ t: s.t, hits });
  }
  const note = captioned ? "" : "no caption was visible at any sample; check the --caption selector if the piece has captions";
  return { pass: fails.length === 0, captioned, fails, note };
}
