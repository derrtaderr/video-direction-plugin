#!/usr/bin/env node
// skills/video-direction/scripts/caption-check.mjs
// The caption gate: a caption must never sit on the set. Seeks the composition every --step
// seconds (default 0.25) and, whenever a caption is visible, measures every visible element
// that draws something in the clips playing at that moment. Any of them under a caption's
// box fails the gate. Added after a film's caption landed on a prop at one push-in; the motion
// critic counts motion, the stills pass samples three moments per beat, and neither saw it.
//
// What counts:
//   captions   elements matching --caption (default `[data-caption], .caption, .cap`), opacity
//              over 0.5. Its box is the drawn text plus any filled pill inside it, not the band.
//   the set    every element inside a playing clip that draws itself (media, svg shapes, its own
//              text, a fill or a border). Wrappers, the caption's own tree, its ancestors and
//              full-frame backdrops are left out. Mark a deliberate underlay (a floor rule the
//              caption pill sits over) with `data-caption-ok`; it and its children are skipped.
//
// Usage: node caption-check.mjs <composition dir> [--caption <selector>] [--step 0.25]
//        [--width 1920] [--height 1080] [--animation-map <path to animation-map.mjs>]
// Exit 0 PASS, 1 FAIL, 2 not measured (a gate that cannot measure is a fail, never a warning).
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { sampleTimes, judgeSamples, intersects, paintsItself, isBackdrop } from "./caption-check-core.mjs";

const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : dflt; };
const compArg = argv.find((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--")));
if (!compArg) { console.error("usage: caption-check.mjs <composition dir> [--caption <selector>] [--step 0.25]"); process.exit(2); }
const COMP = resolve(compArg);
const CAPTION = opt("--caption", "[data-caption], .caption, .cap");
const STEP = Number(opt("--step", 0.25));
const W = Number(opt("--width", 1920));
const H = Number(opt("--height", 1080));

const notMeasured = (why) => { console.log(`CAPTION CHECK: not measured  ${why}`); process.exit(2); };
if (!existsSync(join(COMP, "index.html"))) notMeasured(`no index.html in ${COMP}`);

// The browser comes from the animation skill's HyperFrames loader, the same one the motion
// critic's animation map uses, so there is nothing new to install.
const FIX = "install or refresh the animation skill with `npx hyperframes skills update`, or point --animation-map at its scripts/animation-map.mjs";
const explicit = opt("--animation-map") || process.env.HF_ANIMATION_MAP || null;
const mapScript = explicit
  ? (existsSync(explicit) ? explicit : notMeasured(`animation-map script not found at ${explicit} (${FIX})`))
  : [join(homedir(), ".claude", "skills", "hyperframes-animation", "scripts", "animation-map.mjs"),
     join(homedir(), ".agents", "skills", "hyperframes-animation", "scripts", "animation-map.mjs")].find((p) => existsSync(p));
if (!mapScript) notMeasured(`no animation skill found (${FIX})`);
const loader = await import(pathToFileURL(join(dirname(mapScript), "package-loader.mjs")).href);

let packages;
try {
  packages = await loader.importPackagesOrBootstrap(
    ["@hyperframes/producer", "@hyperframes/core/compiler"],
    { npmPackages: [loader.hyperframesPackageSpec("@hyperframes/producer"), loader.hyperframesPackageSpec("@hyperframes/core")] },
  );
} catch (e) {
  notMeasured(`${e.message}${String(e.message).includes("BOOTSTRAP") ? "" : "; if the packages are missing, re-run with HYPERFRAMES_SKILL_BOOTSTRAP_DEPS=1"}`);
}
const producer = packages["@hyperframes/producer"];
const bundle = await loader.bundleCompositionForCapture(packages["@hyperframes/core/compiler"], COMP);
let server, session;
const samples = [];
try {
  server = await producer.createFileServer({ projectDir: COMP, compiledDir: bundle.compiledDir, port: 0 });
  const out = join(COMP, ".hyperframes", "caption-check");
  session = await loader.initializeSessionWithRetry(producer,
    () => producer.createCaptureSession(server.url, out, { width: W, height: H, fps: 30, format: "png" }, null),
    { log: (m) => console.error(`caption-check: ${m}`) });
  const duration = await producer.getCompositionDuration(session);
  if (!(duration > 0)) notMeasured("the composition reports no duration");

  // The pure helpers run inside the page too, so the page and the tests judge with one copy.
  const helpers = [intersects, paintsItself, isBackdrop].map((f) => `const ${f.name} = ${f.toString().replace(/^export /, "")};`).join("\n");
  await session.page.evaluate(`window.__capHelpers = (() => { ${helpers}; return { paintsItself, isBackdrop }; })();`);

  for (const t of sampleTimes(duration, STEP)) {
    await session.page.evaluate((time) => {
      if (window.__hf && typeof window.__hf.seek === "function") return window.__hf.seek(time);
      for (const tl of Object.values(window.__timelines || {})) if (typeof tl.seek === "function") tl.seek(time, false);
    }, t);
    const s = await session.page.evaluate(({ t, CAPTION, W, H }) => {
      const { paintsItself, isBackdrop } = window.__capHelpers;
      const opacityOf = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return 0; o *= +cs.opacity; } return o; };
      const box = (r) => ({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
      const onFrame = (b) => b.right > 0 && b.left < W && b.bottom > 0 && b.top < H && b.right - b.left >= 1 && b.bottom - b.top >= 1;
      const capEls = [...document.querySelectorAll(CAPTION)].filter((c) => opacityOf(c) > 0.5);
      const captions = [];
      for (const c of capEls) {
        // The drawn text, plus any filled pill inside the caption, never the empty band around it.
        const range = document.createRange(); range.selectNodeContents(c);
        let b = box(range.getBoundingClientRect());
        for (const e of [c, ...c.querySelectorAll("*")]) {
          const cs = getComputedStyle(e);
          if (paintsItself({ tag: "DIV", background: cs.backgroundColor, backgroundImage: cs.backgroundImage }) && !isBackdrop(box(e.getBoundingClientRect()), { width: W, height: H })) {
            const r = e.getBoundingClientRect();
            b = { left: Math.min(b.left, r.left), right: Math.max(b.right, r.right), top: Math.min(b.top, r.top), bottom: Math.max(b.bottom, r.bottom) };
          }
        }
        if (onFrame(b)) captions.push(b);
      }
      if (!captions.length) return { t, captions: [], set: [] };
      const playing = (el) => { const clip = el.closest("[data-start][data-duration]"); return !clip || (t >= +clip.dataset.start && t < +clip.dataset.start + +clip.dataset.duration); };
      const set = [];
      for (const e of document.body.querySelectorAll("*")) {
        if (e.closest(CAPTION) || e.querySelector(CAPTION) || e.closest("[data-caption-ok]")) continue;
        if (["SCRIPT", "STYLE", "AUDIO", "svg", "defs", "clipPath", "mask", "linearGradient", "radialGradient", "stop", "filter", "g"].includes(e.tagName)) continue;
        if (!playing(e) || opacityOf(e) < 0.05) continue;
        const cs = getComputedStyle(e);
        const ownText = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!paintsItself({ tag: e.tagName, ownText, background: cs.backgroundColor, backgroundImage: cs.backgroundImage, borderWidth: parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth) })) continue;
        const b = box(e.getBoundingClientRect());
        if (!onFrame(b) || isBackdrop(b, { width: W, height: H })) continue;
        const name = (e.closest("[data-start][id]")?.id ? e.closest("[data-start][id]").id + " " : "") + (e.id ? "#" + e.id : e.tagName.toLowerCase() + (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\s+/).join(".") : ""));
        set.push({ name: name.slice(0, 60), box: b });
      }
      return { t, captions, set };
    }, { t, CAPTION, W, H });
    samples.push(s);
  }
} catch (e) {
  notMeasured(e.message);
} finally {
  if (session) await producer.closeCaptureSession(session).catch(() => {});
  server?.close();
  bundle.cleanup();
}

const r = judgeSamples(samples);
console.log(`CAPTION CHECK: ${r.pass ? "PASS" : "FAIL"}  ${samples.length} samples, ${r.captioned} captioned, ${r.fails.length} with set under a caption${r.note ? `  (${r.note})` : ""}`);
for (const f of r.fails.slice(0, 40)) console.log(`  t=${f.t.toFixed(2)}s caption over: ${f.hits.join(" | ")}`);
if (r.fails.length > 40) console.log(`  ...and ${r.fails.length - 40} more`);
process.exit(r.pass ? 0 : 1);
