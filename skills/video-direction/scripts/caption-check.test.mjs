import test from "node:test";
import assert from "node:assert/strict";
import { intersects, sampleTimes, judgeSamples, paintsItself, isBackdrop, compositionSize } from "./caption-check-core.mjs";

const cap = { left: 600, right: 1320, top: 900, bottom: 980 };

test("intersects is true only when two boxes share area; touching edges do not count", () => {
  assert.equal(intersects(cap, { left: 1000, right: 1100, top: 950, bottom: 1050 }), true);
  assert.equal(intersects(cap, { left: 1320, right: 1400, top: 900, bottom: 980 }), false);
  assert.equal(intersects(cap, { left: 600, right: 1320, top: 800, bottom: 900 }), false);
});

test("sampleTimes steps from 0 through the duration and includes the end", () => {
  assert.deepEqual(sampleTimes(1, 0.25), [0, 0.25, 0.5, 0.75, 1]);
  assert.deepEqual(sampleTimes(0.6, 0.25), [0, 0.25, 0.5]);
});

test("judgeSamples fails on any sample with set under a caption and counts captioned samples", () => {
  const r = judgeSamples([
    { t: 0, captions: [], set: [{ name: "#copier", box: cap }] },
    { t: 0.25, captions: [cap], set: [{ name: "#copier", box: { left: 900, right: 1000, top: 700, bottom: 950 } }] },
    { t: 0.5, captions: [cap], set: [{ name: "#chart", box: { left: 0, right: 500, top: 0, bottom: 500 } }] },
  ]);
  assert.equal(r.pass, false);
  assert.equal(r.captioned, 2);
  assert.deepEqual(r.fails, [{ t: 0.25, hits: ["#copier"] }]);
});

test("judgeSamples passes when every captioned sample is clear", () => {
  const r = judgeSamples([{ t: 1, captions: [cap], set: [{ name: "#chart", box: { left: 0, right: 500, top: 0, bottom: 500 } }] }]);
  assert.equal(r.pass, true);
  assert.equal(r.captioned, 1);
});

test("judgeSamples with no captioned sample is a pass that says so, never a silent green", () => {
  const r = judgeSamples([{ t: 0, captions: [], set: [] }]);
  assert.equal(r.pass, true);
  assert.equal(r.captioned, 0);
  assert.match(r.note, /no caption/);
});

test("paintsItself counts media, text, fills and borders, never a bare wrapper", () => {
  assert.equal(paintsItself({ tag: "IMG" }), true);
  assert.equal(paintsItself({ tag: "path" }), true);
  assert.equal(paintsItself({ tag: "DIV", ownText: true }), true);
  assert.equal(paintsItself({ tag: "DIV", background: "rgb(20, 20, 20)" }), true);
  assert.equal(paintsItself({ tag: "DIV", background: "rgba(0, 0, 0, 0)" }), false);
  assert.equal(paintsItself({ tag: "DIV", backgroundImage: "linear-gradient(red, blue)" }), true);
  assert.equal(paintsItself({ tag: "DIV", borderWidth: 2 }), true);
  assert.equal(paintsItself({ tag: "DIV" }), false);
  assert.equal(paintsItself({ tag: "svg" }), false);
});

test("isBackdrop exempts anything covering most of the frame", () => {
  const frame = { width: 1920, height: 1080 };
  assert.equal(isBackdrop({ left: 0, right: 1920, top: 0, bottom: 1080 }, frame), true);
  assert.equal(isBackdrop({ left: 100, right: 600, top: 800, bottom: 1000 }, frame), false);
});

test("compositionSize reads the root's data-width and data-height, so a square piece is measured as square", () => {
  const html = `<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1080" data-duration="11"></div>`;
  assert.deepEqual(compositionSize(html), { width: 1080, height: 1080 });
});

test("compositionSize returns null when the root declares no size, so the caller keeps its default", () => {
  assert.equal(compositionSize(`<div id="root" data-composition-id="main"></div>`), null);
  assert.equal(compositionSize(`<section class="clip" data-width="500" data-height="500"></section>`), null);
});
