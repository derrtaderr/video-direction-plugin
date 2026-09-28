import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseComposition } from "./composition.mjs";

const HTML = `
<div id="root" data-width="1920" data-height="1080">
  <section id="beat-1" class="clip" data-start="0" data-duration="4" data-transition="push-left">
    <div id="cam-beat-1" class="camera">
      <h1 id="h1" data-rule="press-release-spring">Every top model.</h1>
    </div>
  </section>
  <section id="beat-2" class="clip" data-start="3.5" data-duration="4.5">
    <div id="cam-beat-2" class="camera">
      <div id="picker" data-rule="cursor-ui-demo"></div>
      <div id="ripple" data-rule="cursor-click-ripple"></div>
    </div>
  </section>
  <section id="beat-3" class="clip" data-start="8" data-duration="3">
    <div id="wordmark" data-rule="press-release-spring"></div>
  </section>
</div>`;

test("parses clips, cameras, stamps and transitions in order", () => {
  const { clips } = parseComposition(HTML);
  assert.equal(clips.length, 3);
  assert.deepEqual(clips[0], { id: "beat-1", n: 1, start: 0, end: 4, transition: "push-left", cameraId: "cam-beat-1", stamps: [{ id: "h1", rule: "press-release-spring" }] });
  assert.equal(clips[1].transition, null);
  assert.deepEqual(clips[1].stamps.map((s) => s.rule), ["cursor-ui-demo", "cursor-click-ripple"]);
  assert.equal(clips[2].cameraId, null);
  assert.equal(clips[2].n, 3);
});

test("a stamp without an id is reported, not silently dropped", () => {
  const html = `<section id="beat-1" class="clip" data-start="0" data-duration="2"><div data-rule="press-release-spring"></div></section>`;
  const { clips, problems } = parseComposition(html);
  assert.equal(clips[0].stamps.length, 0);
  assert.match(problems[0], /data-rule="press-release-spring" has no id/);
});

test("hyphenated class names are not clips or cameras", () => {
  const html = `<section id="beat-1" class="clip" data-start="0" data-duration="2"><div id="cam-beat-1" class="world-map"></div><div id="x" class="clip-path" data-start="9" data-duration="1"></div></section>`;
  const { clips } = parseComposition(html);
  assert.equal(clips.length, 1);
  assert.equal(clips[0].cameraId, null);
});

test("camera is the element whose id is cam-<clip id>, not the first camera-class element", () => {
  const html = `<section id="beat-1" class="clip" data-start="0" data-duration="2"><div id="other" class="camera"></div><div id="cam-beat-1" class="camera"></div></section>`;
  assert.equal(parseComposition(html).clips[0].cameraId, "cam-beat-1");
});

test("a stray camera between clips is not attributed to the previous clip", () => {
  const html = `<section id="beat-1" class="clip" data-start="0" data-duration="2"></section><div id="stray-camera" class="camera"></div><section id="beat-2" class="clip" data-start="2" data-duration="2"></section>`;
  const { clips } = parseComposition(html);
  assert.equal(clips[0].cameraId, null);
  assert.equal(clips[1].cameraId, null);
});

test("the feature-beat template is a stamped [ui] beat with a camera", () => {
  const html = readFileSync(new URL("../../../templates/feature-beat/index.html", import.meta.url), "utf8");
  const { clips, problems } = parseComposition(html);
  assert.equal(problems.length, 0);
  assert.equal(clips.length, 1);
  assert.equal(clips[0].id, "beat-1");
  assert.equal(clips[0].cameraId, "cam-beat-1");
  const rules = clips[0].stamps.map((s) => s.rule);
  assert.ok(rules.includes("press-release-spring"));
  assert.ok(rules.includes("cursor-ui-demo"));
  assert.ok(rules.includes("cursor-click-ripple"));
});
