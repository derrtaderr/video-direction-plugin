const TAG = /<([a-zA-Z][\w-]*)\b([^>]*)>/g;

function attr(attrs, name) {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`));
  return m ? m[1] : null;
}

export function parseComposition(html) {
  const clips = [];
  const problems = [];
  let current = null;
  for (const m of html.matchAll(TAG)) {
    const attrs = m[2];
    const cls = attr(attrs, "class") ?? "";
    const tokens = cls.split(/\s+/).filter(Boolean);
    const id = attr(attrs, "id");
    const rule = attr(attrs, "data-rule");
    if (tokens.includes("clip") && attr(attrs, "data-start") !== null) {
      const start = Number(attr(attrs, "data-start"));
      const dur = Number(attr(attrs, "data-duration") ?? 0);
      const n = id?.match(/^beat-(\d+)$/);
      current = { id: id ?? `(clip at ${m.index})`, n: n ? Number(n[1]) : null, start, end: +(start + dur).toFixed(3), transition: attr(attrs, "data-transition"), cameraId: null, stamps: [] };
      clips.push(current);
      continue;
    }
    if (!current) continue;
    // The build contract mandates id="cam-beat-<n>", so the id is the scope, not the nesting.
    if ((tokens.includes("camera") || tokens.includes("world")) && id === `cam-${current.id}`) current.cameraId = id;
    if (rule) {
      if (!id) problems.push(`element with data-rule="${rule}" has no id inside ${current.id}; the map cannot find it`);
      else current.stamps.push({ id, rule });
    }
  }
  return { clips, problems };
}

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const TOKEN = /<\/?([a-zA-Z][\w-]*)\b([^>]*)>|([^<]+)/g;

// The read-time check needs the words on screen, which parseComposition never kept. Each
// run of text belongs to its nearest ancestor with an id (the element the animation map can
// name), never to the clip or its camera wrapper. Ancestors are the id-bearing elements
// between that owner and the clip, outermost first, because a card fading in delays every
// line inside it. Anything carrying data-texture, or inside an element that does, is text
// the viewer is not meant to read.
export function parseReadables(html) {
  const clean = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  const stack = [];
  const byId = new Map();
  for (const m of clean.matchAll(TOKEN)) {
    if (m[3] !== undefined) {
      const clipAt = stack.findLastIndex((e) => e.clip);
      if (clipAt < 0) continue;
      const clip = stack[clipAt];
      const inside = stack.slice(clipAt + 1).filter((e) => e.id && e.id !== `cam-${clip.id}`);
      const owner = inside[inside.length - 1];
      if (!owner) continue;
      const words = m[3].replace(/&nbsp;/g, " ").replace(/&[#\w]+;/g, " ").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
      if (!words.length) continue;
      if (!byId.has(owner.id)) byId.set(owner.id, { id: owner.id, clip: clip.id, words: [], ancestors: inside.slice(0, -1).map((e) => e.id), texture: stack.slice(clipAt).some((e) => e.texture) });
      byId.get(owner.id).words.push(...words);
      continue;
    }
    const tag = m[1].toLowerCase();
    if (m[0].startsWith("</")) {
      const at = stack.findLastIndex((e) => e.tag === tag);
      if (at >= 0) stack.length = at;
      continue;
    }
    if (VOID.has(tag) || m[2].trim().endsWith("/")) continue;
    const attrs = m[2];
    const tokens = (attr(attrs, "class") ?? "").split(/\s+/).filter(Boolean);
    stack.push({ tag, id: attr(attrs, "id"), clip: tokens.includes("clip") && attr(attrs, "data-start") !== null, texture: /\bdata-texture\b/.test(attrs) });
  }
  return [...byId.values()];
}
