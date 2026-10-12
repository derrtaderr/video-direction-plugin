# Spec, README above the fold (queue row 122)

## Goal

The profile README at github.com/derrtaderr sends visitors here. A stranger should
understand what this plugin does and be able to install it within ten seconds of landing.
Before this change the README carried no visual, and the first install line sat at line 31.

## Scope

1. Above the fold, in this order. The one-line promise, then a visual of 15 seconds or
   less showing real output, then the shortest working install as one code block (the two
   `/plugin` commands).
2. Everything after stays where it is. The `## Install` section keeps its local-clone note
   and the "copies into your own config" paragraph. Its two-command block is not
   duplicated; the section points up to the top block instead. The old `## Proof`
   placeholder ("proof video coming") is replaced by the visual, since a shipped film now
   exists.
3. The visual is a GIF made from the shipped Fern and Field sample render
   (`examples/fern-and-field/sample-video.mp4`, 11s, 1080x1080, produced by the plugin end
   to end per that example's style ledger). Fern and Field is a fictional demo brand. No
   client content. Committed at `docs/media/`, under 5 MB.
4. Repo topics and homepage are untouched.

## Out of scope

- The Install and Prerequisites wording. The owner's main checkout carries an uncommitted
  edit there ("Claude Cowork" wording), so those sections change only where content moves.
- The three-brand proof video the old placeholder promised. The single shipped film stands
  in until that exists.

## Design decisions

- Visual source. The repo's own sample render, because it is a film the plugin actually
  produced and is already public in this repo. The derr.ai lab page was the alternative
  candidate; it is a page about the tool, not raw tool output, so the repo render wins.
- Format. Animated GIF, downscaled to 480px and a reduced frame rate with a generated
  palette, so GitHub renders it inline and the README stays light. The full MP4 stays in
  `examples/` and the GIF links to it.
- Promise line. "A Claude Code plugin that gives AI-made brand videos a director, so they
  stop looking generic." Used as given.
- Contract test. `tests/readme-above-fold.test.mjs`, a `node:test` file with no
  dependencies. It pins that within the first 20 lines of the README the promise comes
  first, then an image whose file exists and is under 5 MB, then one code block holding
  exactly the two `/plugin` commands, and that the names in those commands match
  `.claude-plugin/marketplace.json`.

## Gate commands, run per commit

```
node --test skills/video-direction/scripts/*.test.mjs
node --test tests/*.test.mjs
```

Baseline on origin/main abe56c9 is 55 tests, 55 pass.

## Prior art

The orchestrator ran the prior-art gate. No existing above-the-fold or GIF work in the
ledger. `~/Projects/demo-agent` exists for terminal captures, but this repo's visual is
film output, so it does not apply.

## Divergences from the row

- The spec ships as the first commit and is removed in the last commit of the branch,
  because the marketplace entry uses `"source": "./"` and copies the whole repo into a
  user's install. That matches commit abe56c9, which took the maker's plan and spec out of
  the public install. The spec stays readable in history and in the PR body.
- The contract test lives in `tests/` at the repo root, outside the skill folder, so it
  is not part of the skill's own suite. It still ships with the install (whole repo
  copies), which is a few hundred bytes.
