---
description: Build your motion-brand.md through a short taste-by-comparison interview (mostly A/B picks, about 15 minutes), then render one proof styleframe in your new brand so you see "that's MY brand" before you make a real video.
---

# /brand-init

You are running the brand-init interview: turn a stranger's taste into a complete
`motion-brand.md` in their project, then hand them a proof styleframe rendered in that
brand. This is the plugin's core mechanic. Follow this file top to bottom. It is written
so a first-time user with only this repo, Node 22+, and ffmpeg can reach a rendered proof
frame with zero outside help.

Everything you write must stay executable by a stranger: no absolute paths from any other
machine, no other brand's names or colors bleeding into the questions or the output. The
only brand in play is the user's.

## Constants (edit here, nowhere else)

```
PLUGIN_EVENTS_ENDPOINT = https://www.derr.ai/api/plugin-events
BRAND_FILE             = motion-brand.md        (in the user's current project root)
LEDGER_FILE            = style-ledger.md        (project root; scaffolded from templates/style-ledger-template.md)
MATRIX_FILE            = delivery-matrix.md     (project root; scaffolded from templates/delivery-matrix-template.md)
STATE_DIR              = .video-direction        (telemetry queue + anon id live here)
QUEUE_FILE             = .video-direction/telemetry-queue.jsonl
ANON_ID_FILE           = .video-direction/anon-id
PROOF_DIR              = video-work/brand-proof   (the finale styleframe project)
ARCHETYPES             = skills/video-direction/references/style-archetypes.md (the roster source)
```

Record a start timestamp the moment this command begins (used later for
`minutes_elapsed`).

---

## Step 0 — Preflight (ALWAYS first, before any question)

Never collect answers on a machine that cannot render. Run preflight before question 1,
on every invocation.

Announce it: "Checking your machine can render (Chrome, ffmpeg, Node) — about 30s on a
cold fetch, that pause is normal." Then run:

```
npx hyperframes doctor --json
```

**Read the payload's individual checks, NOT the top-level `ok` field.** Doctor reports
`ok: false` when OPTIONAL capabilities (whisper, TTS, music, Docker) are absent — that is
normal and fine. Gate ONLY on the render-required checks: **Node, Chrome, FFmpeg/FFprobe,
disk**. If those pass, preflight passes, whatever the top-level flag says.

Also confirm ffmpeg directly (doctor covers it, but check explicitly so the failure
message is precise):

```
ffmpeg -version
```

**Queue the preflight result now** (consent has not been asked yet, so you cannot send it
— append it to the local queue and it flushes later only if the user consents). Create
`STATE_DIR` if missing and append one line to `QUEUE_FILE`:

```
{"event":"preflight_result","ts":"<ISO8601>","os":"<darwin|linux|win32>","pass":<true|false>,"missing_dep":"<none|ffmpeg|chrome|node|...>"}
```

**On failure** — print the exact install command for the user's OS, then stop with
"Fix that, then re-run `/brand-init`." Do not start the interview. Per-OS fixes:

- **ffmpeg**
  - macOS: `brew install ffmpeg`
  - Debian/Ubuntu: `sudo apt-get update && sudo apt-get install -y ffmpeg`
  - Windows: `winget install Gyan.FFmpeg` (or `choco install ffmpeg`)
- **Node 22+** (doctor reports the version): install via nvm — `nvm install 22 && nvm use 22`, or from nodejs.org.
- **Chrome / Chromium** (doctor names it): `npx playwright install chromium`, or install Google Chrome.

Print only the lines for what doctor actually flagged. Then stop.

**On pass** — say "Machine's good to render." and continue to state detection.

---

## Step 1 — Detect state (empty / partial / returning)

Look for `BRAND_FILE` in the project root and branch. First-time vs returning is decided
by this file and nothing else.

- **No `motion-brand.md` (EMPTY):** fresh run. Go to Step 2 and start at the first
  section.
- **`motion-brand.md` exists with `status: incomplete` in its frontmatter (PARTIAL):** an
  interview was abandoned. Say "Picking up where we left off." Read the `next_section:`
  field (and which sections already have real content, not `[brackets]`), and resume Step
  2 at the first unanswered section. Keep every answer already on disk. Nothing is lost to
  a dead session.
- **`motion-brand.md` exists with `status: complete` (or no `status` line — a
  hand-written file counts as complete) (RETURNING):** do not silently overwrite. Offer
  two paths and wait for the choice:

  > You already have a brand file. Want to **edit** one part of it (I'll re-ask just that
  > section — constants, roster, selection, audio, or delivery), or **regenerate** it from
  > scratch (throws away the current one)?

  - **edit `<section>`** → re-ask only that section's questions (Step 2), rewrite only
    those lines, leave the rest untouched. Do not touch `status`.
  - **regenerate** → require an explicit second confirmation: "This replaces your current
    brand file. Type `regenerate` to confirm." Only on the exact word do you start a fresh
    run. Anything else → stop, change nothing.

---

## Step 2 — The interview

Ten questions across the five sections of the brand file, in order, plus one consent
question at the very end (Step 5). Rules that hold for every question:

- **Taste is A/B (or A/B/C), never "describe your brand."** Each option is a vivid,
  concrete picture, not a label. The four non-taste inputs (brand basics, accent color)
  are the only free-text ones, and they stay minimal.
- **"Not sure" is always allowed.** On "not sure" / "skip" / no strong opinion, take the
  safer default named in the question, and mark that value `(defaulted)` in the file so a
  later edit knows it was inherited, not chosen.
- **One question at a time.** Show the options, wait, move on. No batching, no
  questionnaire wall.
- **Write incrementally.** After each of the five sections is answered, write/update
  `BRAND_FILE` immediately (see **Incremental write format** below). A crash after
  section 3 leaves sections 1–3 on disk with `status: incomplete`.

Use the exact section headings and bold sub-labels shown here — the `video-direction`
skill and the template read these term for term.

### Section 1 → `## Constants (every video keeps these)`

**Q1 — The basics (input, not taste).** Ask together, they are all plain facts:
- Brand name.
- One line on who it is for.
- The URL or CTA line every video ends on (e.g. `yourbrand.com`, "Start free at …").
- Wordmark treatment (optional): how the name is set, and whether one letter or mark
  carries the accent color (e.g. a colored "&"). "Just my name in the heading font" is a
  fine answer; if skipped, default to the name set in the heading typeface.

**Q2 — World (A/B/C).** "Pick the room your videos live in:"
- **A — Warm paper & ink.** Cream field (`#F5F3EE`), near-black serif headlines, calm and
  editorial. Reads like a well-set page.
- **B — Midnight terminal.** Near-black field (`#0E1116`), mono type, one neon accent doing
  all the work. Reads like a sharp product in the dark.
- **C — Clean studio.** Pure white (`#FFFFFF`), lots of air, geometric sans, modern and
  neutral. Reads like a crisp startup deck.
- Not sure → **A** (most legible with sound off, safest default). We also add a dark
  closing frame for one emphasis moment by default; say if you'd rather stay in one world.

**Q3 — Type register (A/B/C).** "How should the words feel?"
- **A — Editorial.** Serif headlines, clean sans body. Considered, trustworthy.
- **B — Technical.** Mono throughout. Precise, engineered, developer-adjacent.
- **C — Modern sans.** Geometric sans headlines and body. Clean, current, brand-neutral.
- Not sure → follow the world (paper → **A**, terminal → **B**, studio → **C**).

**Q4 — Accent color (input).** "One color carries meaning in every video — the key word,
the number, the CTA. What's yours? Give me a hex (like `#2E6E6A`) or just describe it."
- If they give a hex, use it.
- If they describe it ("a deep teal", "warm orange"), offer three concrete hex candidates
  and let them pick or tweak: e.g. deep teal → `#2E6E6A` / `#1F5F5B` / `#3A7D7A`.
- Not sure → derive one accent that sits well on the chosen world and mark it
  `(defaulted)` (e.g. paper → a deep teal; terminal → a neon `#3DF5C0`; studio → a
  confident blue `#2F6BFF`).

**Contrast guard (run after the pick, before writing it).** Compute the WCAG contrast
ratio of the accent against the chosen World background. At 3:1 or better, say nothing
and move on. Below 3:1, one plain sentence — no lecture:

> Heads up — `<hex>` on your `<world>` background is `<ratio>`:1, under the 3:1 line
> where accent text stops reading. `<adjusted hex>` is the same hue, just
> `<darker/lighter>`, and clears it. Keep yours or take the adjusted one?

The adjusted candidate is the nearest darker/lighter shade of the SAME hue that clears
3:1. Their brand, their call — write whichever they choose; if they keep a failing pick,
append `(kept below 3:1 by choice)` to the value so the render check's warning is no
surprise later.

**Q5 — Accent scarcity (A/B).** "How strict is the one-color rule?"
- **A — Strict.** Exactly one accent element per frame. The eye always has one place to
  land. (Calm, editorial brands.)
- **B — Grouped.** The accent may repeat inside one meaning (a highlighted row, a traced
  path) but never two competing meanings on a frame.
- Not sure → **A**.

**Q6 — Texture (A/B).** "Surface finish?"
- **A — Flat.** No texture, clean fields. Nothing competes with the type.
- **B — Subtle grain.** A faint paper grain / scanline / noise matched to the world, never
  busy.
- Not sure → **A**.

**Q7 — Register / tone (A/B/C).** "How does the brand carry itself?" (Optional rider: any
banned words — "no 'revolutionary', no 'game-changing'".)
- **A — Calm & precise.** Unhurried, considered, trustworthy.
- **B — Bold & confident.** High-energy, direct, declarative.
- **C — Warm & human.** Friendly, plain-spoken, a little playful.
- Not sure → **A**.

→ **Write Section 1 now.** Frontmatter `status: incomplete`, `next_section: styles-roster`.

### Section 2 → `## Styles / roster (pick by message type)`

**Q8 — Mascot / performing element (A/B/C).** "Does anything in your brand *perform* on
screen?" (This is the `mascot_policy` value.)
- **A — None.** Type and motion only. Cleanest, most common.
- **B — An ident / charm mark.** A logo or simple shape that animates (a mark that draws
  itself, a charm that reacts). No character.
- **C — A character / mascot.** A recurring figure that acts out the message.
- Not sure → **A**.

Then **instantiate all five archetypes** from the answers so far (world + type + accent +
register + mascot). Read `ARCHETYPES` for the neutral skeletons; do not invent styles. For
each of **Launch Film, Mechanism Explainer, Kinetic Essay, Announcement Card, Content
Hero**, write one roster line in the brand's own terms — fill the world background, type,
accent role, and register into the skeleton, name the ONE signature move, and tag it
`[narrative]` or `[static]` (from the archetype's kind). The user inherits all five tuned;
they do not design any. If mascot is B/C, note where the performing element appears
(typically Launch Film's reveal and Announcement Card's charm).

→ **Write Section 2 now.** `next_section: selection-rules`.

### Section 3 → `## Selection rules (when the message type is ambiguous)`

No question — derive this from the roster and state it, then let the user override in one
line (not a counted question). Write the map:
- Announcement / date / price / one CTA → **Announcement Card**.
- How-it-works / steps → **Mechanism Explainer**.
- New product / launch / milestone → **Launch Film**.
- A take / argument / POV line → **Kinetic Essay**.
- A post / quote / stat repurposed for the feed → **Content Hero**.
- Default when still unclear → **Announcement Card** (safest static; short, legible,
  low-risk). Mark `(defaulted)` unless the user names a different default.

→ **Write Section 3 now.** `next_section: audio`.

### Section 4 → `## Audio`

**Q9 — Audio floor (A/B/C).** "How do your videos sound by default?"
- **A — Always scored.** Every video carries a bed or VO; silent never ships. (Sets
  `Silent permitted? no`.)
- **B — Bed preferred, silent OK.** A bed by default, but a silent render is fine with a
  note. (Sets `Silent permitted? yes`.)
- **C — Type-led, silent-friendly.** Motion carries it; sound is a bonus. (Sets
  `Silent permitted? yes`, VO `type-led, no VO`.)
- Not sure → **B**.

Write the section with `Default bed`, `VO` (derive: A/B → "bed, VO when narration serves";
C → "type-led, no VO"), and the `Silent permitted?` line. Include verbatim:
**"This line wins over any general audio floor."**

Then say one line so they know the premium path exists (no new question): scored audio can
come from a track you drop into the piece, the free local models (`npx hyperframes tts`),
or your own ElevenLabs key if you have one (set `ELEVENLABS_API_KEY` and the skill
generates studio VO or music for you).

→ **Write Section 4 now.** `next_section: delivery`.

### Section 5 → `## Delivery`

**Q10 — Delivery format (A/B/C).** "Where do these mostly play?"
- **A — Square 1080×1080.** The social feed. Safest, reads everywhere.
- **B — Vertical 1080×1920.** Stories, Reels, TikTok.
- **C — Widescreen 1920×1080.** Site hero, YouTube, decks.
- Not sure → **A**.

Write `Aspect / size` (chosen aspect, size budget default `≤ 10 MB`) and the legibility
line — default **"Must read with sound off; captions where words carry."** If the user
says they ship one master to several destinations, point them at the per-destination spec
template — `templates/delivery-matrix-template.md` — to copy into their project; do not
expand Section 5 into a full matrix here.

→ **Write Section 5 now**, then set `status: complete` and remove `next_section` (see
format below).

**Then scaffold the two companion files** next to `BRAND_FILE`, from the shipped
templates. Skip either file that already exists — never overwrite one:

- **`LEDGER_FILE`** from `templates/style-ledger-template.md` — the table header, the
  column definitions, and the empty **Observations** / **Capability watch** stubs, with
  the template's copy-me guidance block removed. No rows: the skill appends the first row
  when the first video ships (its QC stage).
- **`MATRIX_FILE`** from `templates/delivery-matrix-template.md` — the destination table
  and the Rules section verbatim, guidance block removed. Pre-fill from the Section 5
  answers where they map: the row(s) matching the chosen delivery format carry the chosen
  aspect, the size budget, and the sound-off legibility line; rows the answers do not
  touch keep the template defaults.

All ten questions are done; only consent remains, after the proof frame.

---

## Incremental write format

`BRAND_FILE` is markdown with a YAML frontmatter status header. While the interview is in
progress:

```
---
status: incomplete
next_section: <styles-roster | selection-rules | audio | delivery>
generated_by: brand-init
---

# <Brand Name> — Motion Brand System

> <one-line who-it-is-for>

## Constants (every video keeps these)
- **World.** ...
- **Accent.** ...  Scarcity rule: ...
- **Type.** ...
- **Texture.** ...
- **Logo / wordmark.** ...  <logo-exemption note when the wordmark carries the accent>
- **Register.** ...

## Styles / roster (pick by message type)
1. **Launch Film** — ... [narrative]
2. **Mechanism Explainer** — ... [narrative]
3. **Kinetic Essay** — ... [narrative]
4. **Announcement Card** — ... [static]
5. **Content Hero** — ... [static]

## Selection rules (when the message type is ambiguous)
- ...

## Audio
- Default bed: ...
- VO: ...
- **Silent permitted?** ...  This line wins over any general audio floor.

## Delivery
- Aspect / size: ...
- Must read with sound off; captions where words carry.
```

Write only the sections completed so far; sections not yet reached are simply absent (the
`next_section` field says where to resume). When the whole interview is done, set:

```
---
status: complete
generated_by: brand-init
---
```

**Logo-exemption line** (Constants → Logo / wordmark): whenever the wordmark carries the
accent color, include verbatim the rule the skill enforces — a persistent accent wordmark
is identity, exempt from the one-accent-per-frame count, EXCEPT on any frame where it would
sit beside a second accent use (then hold it neutral until the final resolve frame). If the
wordmark does not carry the accent, omit the exemption line.

Any value the user skipped is written with its default and a trailing `(defaulted)`.

---

## Step 3 — The proof styleframe (the finale)

The file is complete. Now show them their brand as a single frame — the "that's MY brand"
moment. Announce it: "Building one proof frame in your brand — about 30s, hold on."

Build a minimal one-frame HyperFrames composition in `PROOF_DIR`:

1. Invoke the `hyperframes` skill to author a single still title card. It uses ONLY the
   constants just captured:
   - Background = the chosen World hex.
   - A short headline set in the chosen Type register (use the brand name or its one-line
     description — real text from the interview, never lorem).
   - The wordmark treatment, set as decided.
   - The accent doing ONE semantic job on the frame (one word, or the CTA line) — obeying
     the scarcity rule.
   - Delivery aspect from Section 5.
   No animation is required — it is a still. One `class="clip"` frame is enough.
2. Snapshot it:
   ```
   npx hyperframes snapshot
   ```
   (or a one-frame render if snapshot is unavailable). This produces a PNG in the project.
3. **Read the PNG** and show the user the path. Say, in one line, what they are looking at:
   "Here's your brand as a frame — <world> field, <type> headline, <accent> on '<the
   accent word>'."

Do NOT run `npx hyperframes check` on the proof composition — it is a deliberate still,
and the checker flags motionless frames (`sweep_static`) as an error. `snapshot` is the
verification for this one frame. If the snapshot fails, run `npx hyperframes doctor`, report the
finding with its fix (not a stack trace), and still proceed to consent — the brand file is
already written and valuable on its own.

**Queue** the completion event now (still not sent — consent is next). Append to
`QUEUE_FILE`:

```
{"event":"brandinit_completed","ts":"<ISO8601>","minutes_elapsed":<int since start>,"mascot_policy":"<none|ident|character>"}
```

---

## Step 4 — Consent (the LAST question)

Ask exactly once, as the final question, in this shape:

> One last thing. May I count your install and renders anonymously? It's a single
> keyless ping — an anonymous ID and the event name, nothing about your brand, your
> content, or your files ever leaves your machine. Yes or no; either way everything works
> identically.

- Wait for a clear yes or no. Treat anything non-affirmative as **no**.

## Step 5 — Flush or delete the queue

**On YES:**
1. Generate an anonymous UUID and write it to `ANON_ID_FILE`:
   ```
   uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid 2>/dev/null || python3 -c "import uuid;print(uuid.uuid4())"
   ```
2. Fire `install_consented`, then flush every queued event with the anon id filled in. Each
   ping is one documented curl that no-ops gracefully if the endpoint is unreachable (the
   `|| true` guarantees brand-init never fails because of telemetry):
   ```
   curl -s -m 5 -X POST "$PLUGIN_EVENTS_ENDPOINT" \
     -H 'content-type: application/json' \
     -d '{"event":"install_consented","anon_id":"<uuid>","ts":"<ISO8601>","os":"<os>"}' \
     >/dev/null 2>&1 || true
   ```
   Then replay each line of `QUEUE_FILE` (`preflight_result`, `brandinit_completed`),
   injecting `"anon_id":"<uuid>"` into each, with the same curl-and-`|| true` pattern.
3. Delete `QUEUE_FILE` once flushed. Tell the user, one line: "Counted, anonymously.
   Thanks."

**On NO:**
1. Delete `QUEUE_FILE`. Do NOT write `ANON_ID_FILE`. Make ZERO network calls — no curl,
   ever. Nothing queued is sent.
2. One line: "No problem, nothing's sent."

The endpoint being down is never an error the user sees; the `|| true` swallows it. This is
the honest serverless path from `metrics.md`.

---

## Step 6 — Close

Point at the door, always naming the next command so the flow never dead-ends:

> Your brand system is at `motion-brand.md`, with `style-ledger.md` (one row per shipped
> video — it gains its first row when your first video ships) and `delivery-matrix.md`
> (your per-destination specs) beside it, and there's a proof frame in
> `video-work/brand-proof/`. When you're ready, just ask me for your first video in plain
> language — "make a launch film for <thing>", pointing at real content (a page, a README,
> a post) — and I'll build it in this brand.

---

## Quick reference — the shape of a run

1. Preflight (doctor + ffmpeg) → queue `preflight_result` → stop on failure with per-OS fix.
2. Detect state → empty (fresh) / partial (resume at `next_section`) / returning (edit vs
   regenerate, never silent overwrite).
3. Ten questions, five sections, A/B where it's taste, "not sure" → `(defaulted)`, write
   after each section with `status: incomplete`.
4. Set `status: complete` → scaffold `style-ledger.md` + `delivery-matrix.md` from the
   templates (never overwriting existing ones) → build + show the proof styleframe →
   queue `brandinit_completed`.
5. Consent question (last).
6. Yes → write anon id, flush queue via curl `|| true`. No → delete queue, zero network.
7. Close: "ask me for your first video."
