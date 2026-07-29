# Launch film — brand-file rationale + dogfood findings

## Brand-file choices (one-line rationales)

Derived in solo-user mode as the plugin's EXISTING identity, from repo evidence (README
voice, the canon it teaches) — not invented. The house is a gallery wall: its job is to
frame three other brands, never compete.

- **World — warm charcoal `#17130E`, one room, no second world.** The canon Launch Film
  hangs floating windows on a warm textured DARK field; a neutral-dark room lets the framed
  exhibits (white / cream / paper) sit as lit works. Color enters only through the exhibits.
- **Accent — bone `#F4EFE6`, value not hue, one per frame.** The house deliberately owns NO
  saturated color so the brands it frames own ALL of it (their green / amber / green never
  collide with a house hue). Accent scarcity taken to its logical end — the plugin practicing
  what it teaches.
- **Type — editorial serif headings + mono labels.** The serif/sans discipline the canon
  deck teaches; mono for placards and the install line reads as "brand-as-code" (the gtm
  category line) without shouting.
- **Texture — faint warm grain.** The canon's "warm textured field," a lit surface not a
  pattern.
- **Wordmark — `video-direction` lowercase mono, bone, no accent letter, no mascot.** Matches
  the plugin id and the mascot policy (none); no logo-exemption path needed.
- **Register — quiet, exact, deferential (the frame, not the picture).** README voice: an
  honest tool that "stops every video looking the same," stated plainly, handing the floor
  to the work.
- **Audio — silent permitted, type-led.** Matches the README's "silent by default" honest-
  tool stance and the muted-autoplay feed reality; the hook still lands in 2s.
- **Delivery — 16:9 master, 1:1 feed cut.** README/lab hero + LinkedIn/X native, per the
  gtm launch channels; master authored once, cut down.

## Dogfood findings (this run, feeding the Deep Dive)

Things in the plugin's own process that fought me while producing its own launch film:

1. **`init --yes` is rejected** ("Unknown flag: --yes"); the real flag is `--non-interactive`.
   The skill/README never name it, so an agent's first reflex fails. Speed-bump.
2. **`init` nests a subfolder** named after the project even when run inside an already-made
   `composition/` dir, forcing a manual flatten. The SKILL already warns about this and says
   to flatten — good — but the flatten itself is fiddly (`shopt` is bash-only; zsh needs a
   different glob). Documented-but-annoying.
3. **`init` reaches the network for skills at scaffold time.** It only stays offline with
   `HYPERFRAMES_SKIP_SKILLS=1`; the documented `--skip-skills` flag is "temporarily ignored."
   On a locked-down machine this could hang the very first scaffold. Papercut.
4. **`doctor` (non-JSON) ends with "Some checks failed"** purely because optional deps
   (whisper / TTS / MusicGen / Docker) are absent, though every render-required check passes.
   brand-init's JSON path documents "read individual checks, not top-level ok," but the human
   `doctor` footer has no such guard and could false-stop a first-timer. Matches the arena
   friction-log entry 3 — recurring, worth a fix in `doctor`'s summary line.
5. **The starter `warm-grain` example index.html references remote assets** (CDN GSAP, a
   transparenttextures.com grain URL) — a determinism/offline-render smell. I sidestepped it
   by writing self-contained styleframes with an inline SVG grain, but the shipped starter
   isn't offline-clean out of the box.
6. **Stage-4 two-frame ergonomics.** The skill says "scaffold ONE composition project, build
   TWO still frames," but `snapshot` only renders the project's `index.html`, so producing
   two directions meant swapping `index.html` between snapshots. A documented path (snapshot a
   named file, or two `compositions/*.html` entries) would make the A/B render cleaner.

What worked cleanly: `snapshot --at 0 --no-end --frames 1` on a deliberate still (skipping
`check` per the skill held — no `sweep_static` false error because I never ran `check`);
`doctor`'s individual render checks; the whole direction-doc → styleframe flow resumed
entirely from disk.

## Dogfood findings — stages 5-6 (build + QC)

7. **`check` caught two real build errors before any render** — videos nested inside a
   timed wrapper div ("video will be FROZEN in renders") and videos missing `id`. Neither
   rule is in the skill's build contract; the checker is the only place they live. The
   gate worked, but a build-contract line ("timed media must be a direct child of a
   non-timed container, with an id") would save the round trip.
8. **`system_font_will_alias` confirmed the skill's font warning live** — Georgia would
   have been silently substituted with EB Garamond at render. Naming the target family
   directly ("Playfair Display", "JetBrains Mono") is the reliable path; the check info
   names the mapping, which is how you find out what the render set actually is.
9. **`tl.set(..., 0)` inside a paused timeline does not render at playhead 0** — the
   checker flags it (`gsap_timeline_set_initial_hide`); initial hidden states belong in
   CSS. Subtle seek-safety trap worth a skill line.
10. **One project = one root composition.** Keeping the 16:9 and 1:1 variants as HTML
    files in the project root trips `multiple_root_compositions`; the delivery-matrix's
    "compose the 1:1 as its own variant" path has no tooling support, so producing the
    feed cut meant swapping `index.html` (same dance as the A/B styleframes, finding 6).
    A `render --entry <file>` flag would fix both.
11. **The QC stills loop earned its keep.** Boards and check both passed, but the beat
    stills showed the evidence-3 line rendering over the still-playing light Steepwell
    exhibit (illegible). Fix was design-level (spotlight logic: each exhibit lit only
    during its beat, all three relit at the thesis), invisible to every automated gate.
    "A frame you never looked at is a frame you never directed" held literally.
12. **Renders were fast and honest** — 42s 1080p master in ~27-37s wall, the 1:1 in
    ~23s. The `composition/renders/` → piece `renders/` copy step the skill documents is
    real (HyperFrames writes timestamped files down there).
13. **Consent gate verified live at QC close.** No `.video-direction/anon-id` exists in
    this repo (consent was never asked or given during this dogfood), so per telemetry.md
    `render_complete` was a silent no-op — zero network calls. The no-consent path behaves
    exactly as specced.

## Dogfood findings — revision round (exhibit swap + maker's mark)

14. **The returning-brand path worked end to end on a second brand.** Steepwell's ledger
    row (winter-oolong) drove the new piece's stage-2 axis rotation exactly as designed —
    the compounding story is real, not aspirational. The brand file's constants contained
    "recipe book" without any off-file freelancing (the card is a prop ON the world, so
    the World constant holds).
15. **Two more real catches by `check` before render:** `content_overlap` (recipe title
    ascenders into the eyebrow at 69 samples) and `gsap_css_transform_conflict` (CSS
    `transform: scaleX(0)` + GSAP scaleX tween would discard the CSS transform — initial
    state must be `gsap.set` outside the timeline). Both fixed pre-render; zero wasted
    renders this round.
16. **Character-sheet reuse was frictionless.** `hacker-sprites.js` dropped into the
    composition as a local script and `buildHackerSprite` + stepped `tl.set` pose swaps
    satisfied both the sheet's own laws (pixels never tween) and HyperFrames determinism
    with no adaptation.
