# Production doc skeleton — one piece's direction docs

The direction docs for a single video, matching the pipeline in the `video-direction`
skill. State everything to disk as you go: these `.md` files and the composition ARE the
memory, so a run that dies mid-way resumes from the last stage on disk, not from chat.

## Folder contract — `video-work/<slug>/`

One folder per piece. Inside it:

```
video-work/<slug>/
├── treatment.md      the ONE idea through the boardomatic — see below
├── boards.md         the beat table — see below
├── styleframes/      still-frame explorations (A/B pairs for flagship pieces)
├── composition/      the HyperFrames project (index.html, assets)
└── renders/          the final MP4 and poster
```

HyperFrames may write renders into `composition/renders/`; copy the FINAL file up to the
piece's `renders/` so deliverables live in one place.

---

## `treatment.md` (stage 1)

One paragraph plus the fixed fields. Nail these before boarding:

```
# Treatment — <slug>

**The ONE idea.** <the single thing this video is about, in one sentence>

**Arc.** <the shape in one or two sentences: how it opens, turns, and lands>

**Runtime budget.** <target seconds, per the chosen style's length>

**Audio mode.** <silent / bed / VO / music — follows the brand file's Audio section;
the brand file wins over any general audio floor>

**Destinations.** <the delivery-matrix rows this piece ships to — declared now, QC'd at
the end>

**Style pick.** <the archetype from the roster + its kind (narrative or static), so the
right structure check runs at boards>
```

If the message type is ambiguous, pick per the brand's selection rules; if there are
none, pick the closest style and say why. Do not stall asking.

---

## `boards.md` (stage 3)

The beat table drives the composition's timeline (cuts on beat / VO boundaries). One row
per beat:

| Start time | Role | Content |
|---|---|---|
| 0.0s | | |
| | | |

- **Start time** — when the beat begins.
- **Role** — for **narrative** styles, the beat's named role in the story spine (setup /
  turn / transfer / bridge / evidence / thesis / resolve). For **static** styles, the zone
  or reading-order position it occupies.
- **Content** — what is on screen and what moves.

**Structure check — run the one that fits the style's kind before you time anything:**

- **Narrative styles** (product story, explainer, launch film — anything that makes a case
  over time): the **story-spine check**. Every beat carries a named role, and consecutive
  beats connect with "but" or "therefore," never "and then." Compress the ARGUMENT, not
  just the best lines — an evidence beat without its bridge floats.
- **Static / stacked-info styles** (a launch card, a price card, a held frame): the
  lighter **hierarchy check**. One idea per zone, a clear reading order (the eye lands
  where it should first), and the punchline (price, CTA, date) lands LAST in the reading
  order. Do not force "but/therefore" onto a card that is not making an argument.

Music-driven pieces choose the actual track NOW (cuts land on beats); VO pieces lock the
script now.

---

Styleframes, build, and QC follow from here — see the skill's pipeline. The styleframes
live in `styleframes/`, the composition in `composition/`, the final render in `renders/`.
