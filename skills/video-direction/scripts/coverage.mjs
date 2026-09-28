// skills/video-direction/scripts/coverage.mjs
// The coverage rule: a piece must reach for names the ledger's recent rows have not
// already used, so a brand works its way through the motion library instead of
// repeating four moves. `hold`, `none` and `cut` are placeholders, never names.
const PLACEHOLDERS = new Set(["hold", "none", "cut"]);

export function checkCoverage(ledgerMarkdown, beats, { window = 2, required = 2 } = {}) {
  const lines = ledgerMarkdown.split("\n").filter((l) => l.startsWith("|"));
  const header = lines[0]?.split("|").slice(1, -1).map((c) => c.trim().toLowerCase()) ?? [];
  const col = header.indexOf("rules used");
  const rows = lines.slice(2).map((l) => l.split("|").slice(1, -1).map((c) => c.trim())).filter((r) => r.some(Boolean));
  const mine = new Set(beats.flatMap((b) => [b.camera, b.entrance, b.state, b.transition]).filter((x) => x && !PLACEHOLDERS.has(x)));

  // A ledger without a "Rules used" column, or with no shipped rows yet, has no history
  // to be stale against: everything reaches for something new.
  if (col < 0 || rows.length === 0) {
    return { pass: true, fresh: [...mine], evidence: `everything fresh: the ledger has no "Rules used" column or no shipped rows yet` };
  }

  const recent = rows.slice(-window);
  const used = new Set(recent.flatMap((r) => (r[col] ?? "").split(",").map((s) => s.trim()).filter(Boolean)));
  const fresh = [...mine].filter((x) => !used.has(x));
  const pass = fresh.length >= required;
  return { pass, fresh, evidence: `${fresh.length} fresh of ${required} required against the last ${recent.length} video(s)${fresh.length ? ": " + fresh.join(", ") : ""}` };
}
