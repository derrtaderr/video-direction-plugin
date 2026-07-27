# Video Direction

A studio process for AI-built brand videos — stops every video looking the same.

You can one-shot-prompt a brand video in a minute, and it will look like every other
one-shot-prompted video, because nothing forced a look decision. This plugin is the
director's seat you skipped. It runs a staged studio process — treatment, style, boards,
styleframes, build, QC — with a gate at each stage, so the look, timing, and sound are
decisions on the record instead of the model's statistical average. It directs;
[HyperFrames](#prerequisites) renders.

## Proof

<!-- PROOF VIDEO GOES HERE: three brands, one system, side by side. -->
<!-- Replace this block with the embedded proof render once it exists. -->

> _Proof video coming — three different brands run through the same process, each
> looking unmistakably its own._

## Install

Two commands inside Claude Code:

```
/plugin marketplace add ./video-direction
/plugin install video-direction@video-direction
```

<!-- Once published to GitHub, install straight from the repo instead:
/plugin marketplace add derrtaderr/video-direction-plugin
/plugin install video-direction@video-direction
-->

The install copies everything into your own Claude Code config, so it keeps working even
if you delete the downloaded folder. It runs entirely on your machine and your Claude
subscription.

## Your first video in 3 steps

1. **Run `/brand-init`.** A short taste-by-comparison interview — mostly A/B picks (world,
   type, accent, audio, delivery), about 15 minutes — writes your `motion-brand.md` and
   renders one proof styleframe in your new brand so you see "that's MY brand" before you
   make a real video. (Prefer to do it by hand? Copy `templates/motion-brand-template.md`
   to `motion-brand.md` and fill it in.) It is the source of truth for every video.
2. **Ask for a video** in plain language — "make a launch film for X," pointing at real
   content (a page, a README, a post). The `video-direction` skill runs treatment →
   style → boards → styleframes and presents a styleframe A/B pair.
3. **Pick A or B.** It builds, runs the critics, renders, and hands you the MP4 path
   plus a QC summary.

## Prerequisites

- **Claude Code** (this is a Claude Code plugin).
- **Node 22+**.
- **ffmpeg** (renders composite audio and video).
- **HyperFrames** — the rendering framework. Nothing to install ahead of time; it is
  fetched on demand via `npx hyperframes …`.

**Preflight:** run `npx hyperframes doctor` once before your first render. It checks
Chrome, ffmpeg, and Node and names the exact fix for anything missing. The first `npx`
call may pause ~30s while it fetches — that is normal, not a hang.

## Status

Early, but the core loop works. The `video-direction` skill (the studio process) and
`/brand-init` (the taste-by-comparison brand interview, ending in a proof styleframe) both
run today. The proof video for the top of this README is what's coming next.
