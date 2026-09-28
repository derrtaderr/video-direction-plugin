# Feature beat

One reusable beat for "here is what it does" sequences: a small-caps eyebrow, a two-line
headline with the second line in the accent, a grey sub line, one interface card that
performs exactly one state change under a visible cursor, and one camera drift. Copy the
`<section id="beat-1">` block into a piece, renumber it to its beat, and swap the copy and
the card. It arrives stamped (`data-rule`) so the motion critic can see it. Two seconds of
this template, repeated with different cards, is how a feature sequence reads as designed.

The boards row this template satisfies:

| # | Start | Role | Content | Camera | Entrance | State change | Transition out |
|---|---|---|---|---|---|---|---|
| n | <start> | <role> | [ui] <what the card does> | coordinate-target-zoom | press-release-spring | cursor-ui-demo | cut |

The camera drift toward the card is a `coordinate-target-zoom` (punch in on something not
centred, dwell at least a second), not a generic hold.
