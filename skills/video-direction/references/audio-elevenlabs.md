# ElevenLabs premium audio — bring-your-own-key VO and music

The premium audio tier. When the user has an ElevenLabs key in their environment, the
skill can generate studio voiceover and scored music itself, master it, and place the
track into the piece before the final render. This is what turns a silent slideshow into
a scored film.

This tier is **the skill running a documented recipe**, exactly like
`references/telemetry.md`. There is no SDK and no HyperFrames key slot. HyperFrames has
no ElevenLabs integration and never will read a key. The recipe is direct ElevenLabs API
calls plus ffmpeg mastering, self-contained, run by the agent in the user's own session
against the user's own key.

## One rule above all — the key is the user's, never ours

Read `ELEVENLABS_API_KEY` from the user's environment and nowhere else. It is **never**
bundled with this plugin, **never** hardcoded, **never** read from any config file, and
**never** written into any file the plugin produces. If the variable is absent, this
whole tier is a no-op. The skill falls back to keyless-local or silent per the Audio
precedence in SKILL.md, and says one plain line about it. No key, no ElevenLabs call,
ever.

**Key handling (read before running any call).** This is a public plugin handling
strangers' keys, so the key gets one handling path with no exceptions. It is read from
the environment only, passed to curl through **stdin** (never as a command argument),
never written to disk, and never sent anywhere but `api.elevenlabs.io`. The stdin rule
closes a real exposure. A key passed as `-H "xi-api-key: $KEY"` expands into curl's
argument list, and argv is visible in `ps` to every other user on the machine while the
call runs. Feeding the auth header on stdin with `-H @-` keeps the key out of argv, so
`ps` never shows it. Every call below follows this form. The request body (`-d …`) stays
on argv because the VO script and music prompt are not secret. Only the key moves off.

## Constants (single source)

```
API_BASE      = https://api.elevenlabs.io/v1
KEY           = $ELEVENLABS_API_KEY          # from the user's environment; absent → tier off
AUTH_ON_STDIN = printf 'xi-api-key: %s\r\n' "$ELEVENLABS_API_KEY" | curl … -H @-   # key on stdin, never argv
DEFAULT_VOICE = 21m00Tcm4TlvDq8ikWAM         # ElevenLabs public default (Rachel); override per brand/treatment
DEFAULT_TTS_MODEL = eleven_multilingual_v2
TARGET_LUFS   = -14                          # integrated loudness after master
MUX_CODEC     = aac 96k                      # audio stream muxed into the composition
AUDIO_DIR     = <piece>/composition/audio    # where the mastered track lands
CURL_TIMEOUT  = 120                          # -m seconds on every call; network error → fall back
```

Gate the whole tier on one check, run first:

```bash
[ -n "$ELEVENLABS_API_KEY" ] || echo "no key → ElevenLabs tier off, fall back per precedence"
```

## When this tier runs

Only when ALL of these hold:

1. `ELEVENLABS_API_KEY` is set.
2. The treatment's audio mode is **vo** or **music** (never on a silent-by-brand piece).
3. The brand file's Audio section does not forbid it (a drop-in track already in
   `AUDIO_DIR` always wins, so check that folder first and skip generation if a track is
   there).

Otherwise fall back to keyless-local (`npx hyperframes tts` / MusicGen) or silent, per
the Audio precedence section of SKILL.md.

## VO recipe (audio mode = vo)

**1. Pick the script.** The VO line comes from the locked artifacts, in this order of
preference: the boardomatic's VO column (the per-beat narration you already timed), then
the treatment's narration line. Never invent copy at this stage. The words were decided
upstream. Keep total length within the runtime budget (roughly 15 words per 6 seconds of
read).

**2. Generate the read.** POST the script to the text-to-speech endpoint. Voice id comes
from the brand file if it names one, else `DEFAULT_VOICE`.

```bash
# Key on stdin via -H @- so it never enters curl's argv (invisible to `ps`).
printf 'xi-api-key: %s\r\n' "$ELEVENLABS_API_KEY" | curl -s -m "$CURL_TIMEOUT" -X POST \
  "https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID:-21m00Tcm4TlvDq8ikWAM}" \
  -H @- \
  -H "Content-Type: application/json" \
  -o /tmp/vo-raw.mp3 \
  -d '{
    "text": "'"$VO_SCRIPT"'",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": { "stability": 0.5, "similarity_boost": 0.75 }
  }' || { echo "VO call failed → fall back"; exit 0; }
```

Confirm the file is real audio, not a JSON error body:

```bash
ffprobe -v error -show_entries stream=codec_type -of csv=p=0 /tmp/vo-raw.mp3 | grep -q audio \
  || { echo "VO response was not audio (likely a key/quota error) → fall back"; exit 0; }
```

**3. Master and mux.** Loudnorm to the target, short fades so it does not clip in or out,
then encode the composition audio stream:

```bash
ffmpeg -y -i /tmp/vo-raw.mp3 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.15,areverse,afade=t=in:st=0:d=0.25,areverse" \
  -c:a aac -b:a 96k \
  "$AUDIO_DIR/vo.m4a"
```

Place `vo.m4a` in `AUDIO_DIR`. HyperFrames scores the render from whatever sits there.

## Music recipe (audio mode = music)

**1. Build the prompt.** Compose it from three inputs that are already decided:

- the treatment's **mood / register** (the feel the piece is going for),
- the brand file's **Audio defaults** (default bed description, any genre the brand
  leans on),
- the **target duration** from the runtime budget.

Keep it one or two concrete sentences. Example shape: `"instrumental lofi boom-bap,
~85 BPM, warm and unhurried, no vocals, loops cleanly, 35 seconds"`. Name BPM when the
piece cuts to the beat.

**2. Generate the bed.**

```bash
# Key on stdin via -H @- so it never enters curl's argv (invisible to `ps`).
printf 'xi-api-key: %s\r\n' "$ELEVENLABS_API_KEY" | curl -s -m "$CURL_TIMEOUT" -X POST \
  "https://api.elevenlabs.io/v1/music" \
  -H @- \
  -H "Content-Type: application/json" \
  -o /tmp/music-raw.mp3 \
  -d '{
    "prompt": "'"$MUSIC_PROMPT"'",
    "music_length_ms": '"$DURATION_MS"'
  }' || { echo "music call failed → fall back"; exit 0; }

ffprobe -v error -show_entries stream=codec_type -of csv=p=0 /tmp/music-raw.mp3 | grep -q audio \
  || { echo "music response was not audio (likely a key/quota/scope error) → fall back"; exit 0; }
```

If the account lacks the music scope, the endpoint returns a JSON error, the ffprobe
guard catches it, and the piece falls back. Do not treat that as a hard stop.

**3. Master.** Same chain as VO — loudnorm to the target with short fades:

```bash
ffmpeg -y -i /tmp/music-raw.mp3 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.3,areverse,afade=t=in:st=0:d=0.5,areverse" \
  -c:a aac -b:a 96k \
  "$AUDIO_DIR/bed.m4a"
```

**4. First-beat padding (music-cut pieces only).** When the boardomatic cuts land on the
beat grid, the first kick must sit on the first cut, not wherever the generation happened
to start. Pad the head of the track with silence so beat one lands on the grid time the
boards specify (the proven value is a first kick at 0.5s). Insert the pad BEFORE the
loudnorm master so the whole delivered track is measured:

```bash
# PAD_S = the grid time of the first cut (e.g. 0.5). Prepend that much silence, then master.
ffmpeg -y -i /tmp/music-raw.mp3 \
  -af "adelay=$(python3 -c "print(int(${PAD_S}*1000))")|$(python3 -c "print(int(${PAD_S}*1000))"),loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.3,areverse,afade=t=in:st=0:d=0.5,areverse" \
  -c:a aac -b:a 96k \
  "$AUDIO_DIR/bed.m4a"
```

For non-cut pieces (a bed under narration, ambient scoring) skip the pad entirely.

## Failure handling — never block the render

Every call carries `-m $CURL_TIMEOUT` and the `|| { echo …; exit 0; }` guard. Any API
error, network drop, quota exhaustion, or missing scope reports the finding in one plain
line and falls back to keyless-local or silent per precedence. Generating audio is an
upgrade on top of a render that already works. A failed generation never fails the piece.
Report what happened and what it fell back to, then keep going.

The mode that actually shipped is what QC's `audio_mode` telemetry reports (vo / music /
silent). If generation fell back to silent, the real mode is silent. Report the truth,
not the intent.

## One-line key test (for the coordinator)

Verify a key works before trusting a run. This lists the account's voices and prints
`HTTP 200` on a good key:

```bash
# Same stdin discipline as the real calls; the key never touches argv.
printf 'xi-api-key: %s\r\n' "$ELEVENLABS_API_KEY" | curl -s -m 20 -o /dev/null \
  -w "HTTP %{http_code}\n" "https://api.elevenlabs.io/v1/voices" -H @-
```

`HTTP 200` means the key is live. `401` means it is bad or unset. Anything else is a
transient network or service issue, and the pipeline would fall back on it.
