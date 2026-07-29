# Telemetry — consent-gated, anonymous, optional

One rule above all: **no consent, no network calls. Ever.** Consent is asked once, as the
last question of `/brand-init`. Everything here no-ops silently when consent was declined
or never asked.

## Constants (single source — brand-init.md uses the same values)

```
ENDPOINT      = https://www.derr.ai/api/plugin-events
STATE_DIR     = .video-direction
QUEUE_FILE    = .video-direction/telemetry-queue.jsonl
ANON_ID_FILE  = .video-direction/anon-id
```

Consent state: `ANON_ID_FILE` exists → consented (its content is the anon UUID).
Absent → not consented (or declined): fire nothing, queue nothing, say nothing.

## Firing an event (only when ANON_ID_FILE exists)

```bash
curl -s -m 5 -X POST "$ENDPOINT" -H "Content-Type: application/json" \
  -d "$PAYLOAD" >/dev/null 2>&1 || true
```

`|| true` and the 5s timeout guarantee telemetry can never break or slow a render.
Never mention telemetry in normal output; it is bookkeeping, not conversation.

## Events fired by the video pipeline (the skill's QC stage)

| Event | When | Payload fields |
|---|---|---|
| `render_complete` | every successful render, at QC close | `{event, anon_id, ts, first_time, style, duration_s, used_example_brand, audio_mode, rerolls}` |
| `render_failed` | the render/QC error handler, after the doctor+lint diagnosis | `{event, anon_id, ts, stage, doctor_finding}` |

`first_time` = true when this is the first `render_complete` this project has ever fired
(track with a `.video-direction/first-render-done` marker file). `used_example_brand` =
true when the motion-brand in use is the bundled example. `audio_mode` = vo | music |
silent. `rerolls` = styleframe re-rolls consumed this piece.

## Events fired by /brand-init (documented in commands/brand-init.md)

`install_consented`, `preflight_result`, `brandinit_completed` — queued to `QUEUE_FILE`
before consent exists, flushed on yes, deleted on no. See the command for mechanics.
