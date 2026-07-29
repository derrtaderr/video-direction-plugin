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
/plugin marketplace add /path/to/video-direction-plugin
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

## Audio (optional)

Videos render **silent by default**, with a one-line note on the render telling you how to
score it. The plugin never blocks a render to go source a track, and never ships silence
by accident without saying so. Two ways to add sound:

- **Drop a track into the piece.** Put any audio file in the piece's
  `video-work/<slug>/composition/audio/` and it scores the render. No key, no account.
- **Bring your own voice/music key.** Narrated or generated-music pieces run through
  HyperFrames' TTS/music layer using **your own provider key** (e.g. ElevenLabs), never a
  key bundled with this plugin. `npx hyperframes doctor` lists TTS and music as optional
  capabilities; they light up only when you supply the key.

The house rule — *no video ships silent by accident* — is taught, not enforced: your
`motion-brand.md` Audio section wins. If it permits silent, a silent render is correct.

Next: set your audio default in `/brand-init` (the Audio question), then ask for a video.

## Coming back / editing your brand

Once your `motion-brand.md` exists you don't re-run setup to make more videos — just ask
for one in plain language. The `video-direction` skill detects the brand file, skips
straight to the treatment, and (if you keep a style ledger) reads it so the new piece
doesn't repeat the last one's look.

To change the brand itself, re-run `/brand-init`. With a brand file already present it
never silently overwrites: it offers a **targeted edit** (re-ask just one section —
constants, roster, selection, audio, or delivery) or a full **regenerate**, and regenerate
only proceeds after you type the word `regenerate` to confirm.

Next: ask for your next video, or run `/brand-init` and pick **edit** to adjust one section.

## Prerequisites

- **Claude Code** (this is a Claude Code plugin).
- **Node 22+**.
- **ffmpeg** (renders composite audio and video).
- **HyperFrames** — the rendering framework. Nothing to install ahead of time; it is
  fetched on demand via `npx hyperframes …`.

**Preflight:** run `npx hyperframes doctor` once before your first render. It checks
Chrome, ffmpeg, and Node and names the exact fix for anything missing. The first `npx`
call may pause ~30s while it fetches — that is normal, not a hang.

With that green, run `/brand-init` to build your brand and make your first video.

## Status

Early, but the core loop works. The `video-direction` skill (the studio process) and
`/brand-init` (the taste-by-comparison brand interview, ending in a proof styleframe) both
run today. The proof video for the top of this README is what's coming next.

To start now, run `/brand-init`.
