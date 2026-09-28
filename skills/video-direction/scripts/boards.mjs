const HEADER = ["#", "start", "role", "content", "camera", "entrance", "state change", "transition out"];

function cells(line) {
  return line.split("|").slice(1, -1).map((c) => c.trim());
}

export function parseBoards(markdown) {
  const lines = markdown.split("\n");
  const hi = lines.findIndex((l) => {
    const c = cells(l).map((x) => x.toLowerCase());
    return c.length >= 8 && HEADER.every((h, i) => c[i] === h);
  });
  if (hi < 0) return [];
  const beats = [];
  for (let i = hi + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("|")) break;
    const c = cells(line);
    const n = Number(c[0]);
    if (!Number.isInteger(n)) continue;
    const content = c[3] ?? "";
    const ui = /^\[ui\]\s*/i.test(content);
    const beat = {
      n,
      start: Number(String(c[1] ?? "").replace(/s$/, "")),
      role: c[2] ?? "",
      content: content.replace(/^\[ui\]\s*/i, ""),
      ui,
      camera: c[4] ?? "",
      entrance: c[5] ?? "",
      state: c[6] ?? "",
      transition: c[7] ?? "",
    };
    Object.defineProperty(beat, '_cells', { value: c.length, enumerable: false });
    beats.push(beat);
  }
  return beats;
}

export function lintChoreography(beats, vocabulary, signatureMoves = [], opts = {}) {
  const { requireTransition = true, requireMove = true } = opts;
  const problems = [];
  if (!beats.length) problems.push("no choreography table found (header must be # | Start | Role | Content | Camera | Entrance | State change | Transition out)");
  for (const b of beats) {
    if (b._cells < 8) { problems.push(`beat ${b.n} is missing motion cells (has ${b._cells} of 8)`); continue; }
    for (const [col, set] of [["camera", vocabulary.camera], ["entrance", vocabulary.entrance], ["state", vocabulary.state], ["transition", vocabulary.transition]]) {
      if (!set.has(b[col])) problems.push(`beat ${b.n} ${col} "${b[col]}" is not in the motion vocabulary`);
    }
    if (b.ui && b.state === "none") problems.push(`beat ${b.n} is [ui] but its state change is none`);
  }
  const full = beats.filter((b) => b._cells >= 8);
  if (requireMove && full.length && full.every((b) => b.camera === "hold")) problems.push("hold in every camera cell; at least one beat must move");
  if (requireTransition && full.length > 1 && full.every((b) => b.transition === "cut")) problems.push("cut at every boundary; at least one named transition");
  const used = new Set(full.flatMap((b) => [b.camera, b.entrance, b.state, b.transition]));
  for (const move of signatureMoves) if (!used.has(move)) problems.push(`signature move ${move} from style direction is never choreographed`);
  return { pass: problems.length === 0, problems };
}
