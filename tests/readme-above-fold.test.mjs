// Pins the README's above-the-fold contract. A stranger landing from the profile
// README should read the promise, see real output, and find the install in one block,
// all within the first FOLD lines.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FOLD = 20;
const PROMISE =
  'A Claude Code plugin that gives AI-made brand videos a director, so they stop looking generic.';

const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
const lines = readme.split('\n');
const fold = lines.slice(0, FOLD);

const indexOf = (pred) => fold.findIndex(pred);

test('the promise is the first prose line above the fold', () => {
  const first = indexOf((l) => l.trim() !== '' && !l.startsWith('#'));
  assert.notEqual(first, -1, 'no prose above the fold');
  assert.equal(fold[first].trim(), PROMISE);
});

const IMAGE = /!\[[^\]]+\]\(([^)\s]+)\)/;
const MAX_BYTES = 5 * 1024 * 1024;

test('a committed visual under 5 MB follows the promise', () => {
  const promiseAt = indexOf((l) => l.trim() === PROMISE);
  const imageAt = indexOf((l) => IMAGE.test(l));
  assert.notEqual(imageAt, -1, 'no image above the fold');
  assert.ok(imageAt > promiseAt, 'image must come after the promise');
  const src = fold[imageAt].match(IMAGE)[1];
  assert.ok(!/^https?:/.test(src), 'image must be committed in the repo, not hotlinked');
  const size = statSync(join(ROOT, src)).size;
  assert.ok(size > 0 && size < MAX_BYTES, `${src} is ${size} bytes, must be under 5 MB`);
});

const REPO_SLUG = 'derrtaderr/video-direction-plugin';
const manifest = JSON.parse(
  readFileSync(join(ROOT, '.claude-plugin', 'marketplace.json'), 'utf8'),
);

// The fenced code blocks in the README, with the line each one opens on.
function codeBlocks(text) {
  const out = [];
  let open = null;
  text.split('\n').forEach((line, i) => {
    if (/^```/.test(line)) {
      if (open) { out.push(open); open = null; } else { open = { at: i, body: [] }; }
    } else if (open) {
      open.body.push(line);
    }
  });
  return out;
}

test('one code block with the two install commands follows the visual', () => {
  const imageAt = indexOf((l) => IMAGE.test(l));
  const block = codeBlocks(readme).find((b) => b.at < FOLD);
  assert.ok(block, 'no code block above the fold');
  assert.ok(block.at > imageAt, 'install block must come after the visual');
  const plugin = manifest.plugins[0].name;
  assert.deepEqual(block.body.filter((l) => l.trim() !== ''), [
    `/plugin marketplace add ${REPO_SLUG}`,
    `/plugin install ${plugin}@${manifest.name}`,
  ]);
});
