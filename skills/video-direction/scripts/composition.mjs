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
    const id = attr(attrs, "id");
    const rule = attr(attrs, "data-rule");
    if (/\bclip\b/.test(cls) && attr(attrs, "data-start") !== null) {
      const start = Number(attr(attrs, "data-start"));
      const dur = Number(attr(attrs, "data-duration") ?? 0);
      const n = id?.match(/^beat-(\d+)$/);
      current = { id: id ?? `(clip at ${m.index})`, n: n ? Number(n[1]) : null, start, end: +(start + dur).toFixed(3), transition: attr(attrs, "data-transition"), cameraId: null, stamps: [] };
      clips.push(current);
      continue;
    }
    if (!current) continue;
    if (/\bcamera\b|\bworld\b/.test(cls) && id && !current.cameraId) current.cameraId = id;
    if (rule) {
      if (!id) problems.push(`element with data-rule="${rule}" has no id inside ${current.id}; the map cannot find it`);
      else current.stamps.push({ id, rule });
    }
  }
  return { clips, problems };
}
