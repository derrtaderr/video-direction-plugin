import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const VOCABULARY_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "references",
  "motion-vocabulary.md",
);

const SECTION_KEYS = { camera: "camera", entrance: "entrance", "state change": "state", "transition out": "transition" };

export function parseVocabulary(markdown) {
  const out = { camera: new Set(), entrance: new Set(), state: new Set(), transition: new Set(), all: new Set() };
  let current = null;
  for (const line of markdown.split("\n")) {
    const h = line.match(/^## (.+)$/);
    if (h) { current = SECTION_KEYS[h[1].trim().toLowerCase()] ?? null; continue; }
    const row = line.match(/^\| `([^`]+)` \|/);
    if (row && current) { out[current].add(row[1]); out.all.add(row[1]); }
  }
  return out;
}
