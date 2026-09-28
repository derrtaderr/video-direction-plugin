// skills/video-direction/scripts/stills-check-core.mjs
// Pure parsing and judging for the blank-still QC gate. Kept apart from stills-check.mjs
// so both are unit-testable without spawning ffmpeg.

// ffmpeg's signalstats + metadata=print filter chain prints one `lavfi.signalstats.<KEY>=<value>`
// line per stat. We only need YMIN and YMAX (the luma floor and ceiling of the frame); a
// still whose luma never varies past a few counts is a still that rendered nothing.
export function parseSignalStats(text) {
  if (!text) return null;
  const yminMatch = text.match(/lavfi\.signalstats\.YMIN=([-\d.]+)/);
  const ymaxMatch = text.match(/lavfi\.signalstats\.YMAX=([-\d.]+)/);
  if (!yminMatch || !ymaxMatch) return null;
  return { ymin: Number(yminMatch[1]), ymax: Number(ymaxMatch[1]) };
}

// A minimal glob: `*` matches any run of characters, everything else is literal. That is
// enough to name a single still ("beat3-out.png") or a family ("beat3-*.png") as allowed.
function globToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`);
}

export function isAllowed(name, allow) {
  if (!allow || allow.length === 0) return false;
  return allow.some((pattern) => pattern === name || globToRegExp(pattern).test(name));
}

// stills: [{ name, range }] where range = YMAX - YMIN, already measured.
export function judge(stills, { minRange = 8, allow = [] } = {}) {
  const results = stills.map((s) => {
    const blank = s.range < minRange;
    const allowed = blank && isAllowed(s.name, allow);
    const status = allowed ? "allowed" : blank ? "BLANK" : "ok";
    return { name: s.name, range: s.range, status };
  });
  const blankCount = results.filter((r) => r.status === "BLANK").length;
  return { pass: blankCount === 0, results, blankCount };
}
