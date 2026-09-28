# Motion vocabulary

The names the choreography stage (3b) may write into the four motion columns of `boards.md`.
Each name is a recipe in the `hyperframes-animation` skill (rules at `rules/<name>.md`,
blueprints at `blueprints/<id>.md`) or a transition in its `transitions/` folder. The pointer
column says which. `hold`, `none` and `cut` are the deliberate absences; a piece may use each,
never everywhere.

## Camera

| Name | When it earns its place | Pointer |
|---|---|---|
| `hold` | The camera has a reason to stay put for this one beat (a held card, a reading beat). Never every beat | (none) |
| `multi-phase-camera` | One scene needs a pull-back, a focus and a push in sequence, with a live micro-drift | rule |
| `coordinate-target-zoom` | Punch in on something that is not centred, dwell at least a second | rule |
| `camera-cursor-tracking` | The focal point grows (typing, a list filling) and the camera should follow without jumps | rule |
| `3d-camera-flight` | Fly through a Z-space of cards or panels | rule |
| `orbit-3d-entry` | Objects arrive on an orbit around a centre | rule |
| `camera-journey` | A multi-leg motivated journey across one world: dive in, a beat fires, travel to the consequence | blueprint |
| `zoom-out-workspace-reveal` | Open tight on a detail and one decelerating pull-back reveals the whole | blueprint |
| `spatial-pan-stations` | Labelled stations on one oversized canvas, panned between | blueprint |

## Entrance

| Name | When it earns its place | Pointer |
|---|---|---|
| `press-release-spring` | The default spring entrance for any card or line | rule |
| `depth-scatter-assemble` | Many pieces arrive from scattered depth and assemble | rule |
| `grid-card-assemble` | A grid of cards assembles in a stagger | blueprint |
| `logo-assemble-lockup` | A mark assembles from parts into its lockup | blueprint |
| `kinetic-beat-slam` | Short phrases slam in on beats with distinct entrances | rule |
| `typewriter-reveal` | A live caret types and edits a line | blueprint |
| `hacker-flip-3d` | Character-level 3D flip with glyph substitution | rule |
| `gradient-text-sweep` | A gradient sweeps through letterforms | rule |
| `3d-text-depth-layers` | Large type gets a stacked extrusion | rule |
| `particle-burst` | A burst marks an arrival or a payoff | rule |
| `motion-blur-streak` | Anything that travels fast leaves a streak | rule |
| `ambient-glow-bloom` | The focused element glows | rule |
| `depth-of-field-blur` | Background objects defocus to sell depth | rule |
| `titlecard-reveal` | A title card reveals with one signature move | blueprint |

## State change

| Name | When it earns its place | Pointer |
|---|---|---|
| `none` | The beat shows no interface and nothing on it changes state | (none) |
| `cursor-ui-demo` | An interface beat: a cursor performs one action on a real card | blueprint |
| `cursor-click-ripple` | A click lands with a visible ripple | rule |
| `cursor-drag` | Something is dragged from here to there | rule |
| `multi-cursor-choreography` | Several cursors act in sequence | rule |
| `context-sensitive-cursor` | A typing cursor changes with its segment | rule |
| `control-target-sync` | A control changes and its target answers | rule |
| `panel-edit-live-sync` | An edit in one panel updates another live | blueprint |
| `card-morph-anchor` | A card morphs into its expanded state around an anchor | rule |
| `anchored-layout-expand` | A layout expands from an anchor without width/height tweens | rule |
| `counting-dynamic-scale` | A number counts up and grows with its value | rule |
| `dataviz-countup` | A stat or chart counts into place | blueprint |
| `chart-scrub-readout` | A chart scrubs and a readout follows | rule |
| `discrete-text-sequence` | Text states replace each other at thresholds | rule |
| `cta-morph-press` | A CTA is pressed and morphs into its result | blueprint |

## Transition out

| Name | When it earns its place | Pointer |
|---|---|---|
| `cut` | The idea changes and nothing should soften it. Never every boundary | (none) |
| `crossfade` | Simple opacity swap between scenes | transition |
| `blur-crossfade` | Default when two scenes' backgrounds differ significantly; blur masks any color clash | transition |
| `push-slide` | The next scene pushes this one out; directional with horizontal or vertical motion; slide the outgoing clip a fraction of its width and fade the rest; a full-width slide trips the map's offscreen flag | transition |
| `zoom-through` | High-energy transition; old scene scales away with blur while new scales in | transition |
| `squeeze` | Old scene compresses to a line on one edge; new expands from the opposite edge | transition |

Two bindings are mandatory: a `[ui]` beat names `cursor-ui-demo` or another state-change rule,
never `none`; a hero reveal names `zoom-out-workspace-reveal` or `camera-journey`.
