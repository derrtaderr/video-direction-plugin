# Delivery matrix

Destination specs for every rendered video — the per-destination detail behind the
`## Delivery` line in your `motion-brand.md`. Use this when you ship one master to more
than one place (a site hero, a feed, a vertical reframe) and each destination needs its
own aspect, length, and finish. Declare a piece's destinations at treatment (stage 1); QC
every declared variant at QC (stage 6). Author the master once — always the widest aspect,
16:9 1920×1080 — and cut variants from it, never author them separately.

Copy this file to your project (e.g. `video-work/delivery-matrix.md`) and edit the rows to
your real destinations. The rows below are a common starting set; keep the ones you ship
to, drop the rest. Delete this guidance block once you've read it.

| Destination | Aspect | Length ceiling | Audio reality | Captions | Size budget | Texture (grain/grade) |
|---|---|---|---|---|---|---|
| your site — blog hero | 16:9 | 60–90s | click-to-play, sound available | baked in (works muted) | ~2.5 MB target | grade OK, NO grain (h.264 killer) |
| your site — product page | 16:9 | 30s | autoplay muted | on-screen text is the copy | ≤2.5 MB hard | none (locked template) |
| your site — ambient loop | 16:9 or square | ≤15s loop | none | none | as small as possible | none |
| LinkedIn native | 1:1 preferred, 16:9 OK | ≤60s (teases 10–20s) | autoplay MUTED — assume never heard | mandatory when words carry; hook readable in 2s | generous — grain and grade OK | full treatment OK |
| YouTube Shorts / vertical | 9:16 reframe | ≤60s | usually heard | recommended | generous | full treatment OK |

Rules:

- A video that words can't survive muted does not ship to a muted-autoplay feed
  (LinkedIn, Shorts) without captions.
- The 2-second hook rule applies to feed destinations (LinkedIn, Shorts): the first
  punch-in or type-slam lands inside 2 seconds, no logo intros.
- The grain/grade conflict is decided per destination, not globally: size-budgeted site
  surfaces stay clean; feed surfaces may carry the full finish.
- Reframes (16:9 → 1:1 / 9:16) go through your reframe pipeline; re-check text safe areas
  after every reframe — the look critic's frame checks apply to variants too.
- QC checklist per variant: correct aspect, within length ceiling, within size budget,
  captions present where mandatory, hook inside 2s, loudness -14 LUFS for social when
  audio exists.
