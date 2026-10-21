# Example — Fern & Field

A worked example that ships with the plugin. **Fern & Field** is a fictional native-plant
garden-supply company. It shows a complete `motion-brand.md` and three videos made from it
by following the `video-direction` skill end to end, each one varied against the last by the
style ledger.

| Video | Style | Sound | Folder |
|---|---|---|---|
| The Seedling Subscription, 31s | Launch Film (flagship) | voiceover over a scored folk bed, captions | [`video-work/seedling-subscription-film/`](video-work/seedling-subscription-film/) |
| From seed to your porch, 28s | Mechanism Explainer | folk bed, captions as narrator | [`video-work/plug-to-porch/`](video-work/plug-to-porch/) |
| Seedling Subscription card, 11s | Announcement Card | silent, per the brand's audio line | [`video-work/seedling-subscription-launch/`](video-work/seedling-subscription-launch/) |

Each folder holds the whole run, not just the result: `treatment.md`, `style.md`,
`boards.md` (the beat table with its choreography columns), `styleframes/`, the HyperFrames
`composition/`, and `renders/` with the final MP4 and its poster. The launch film's
`styleframes/PICK.md` records the A/B hero pick and why.

- **`motion-brand.md`** — the brand file: five sections, all five style archetypes tuned to
  the brand, the audio line, and the logo/wordmark accent exemption resolved.
- **`style-ledger.md`** — one row per shipped video. The skill reads it at stage 2 to vary
  the look and appends to it at QC. Its observations name what the next video should do
  differently.
- **`sample-video.mp4`** — the first card, kept at the top level as the original sample.

**Try it:** copy `motion-brand.md` into your own project root and ask for a video ("make a
launch film for X"). The `video-direction` skill reads the brand file and runs the stages.

**Audio.** The two narrated pieces were scored with the ElevenLabs tier
(`references/audio-elevenlabs.md`), using the author's own key. Without a key the skill
falls back to local keyless models or silence, per the brand's audio line.
