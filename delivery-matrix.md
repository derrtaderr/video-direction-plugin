# Delivery matrix

Destination specs for every rendered video — the per-destination detail behind the
`## Delivery` line in `motion-brand.md`. Author the master once, always the widest aspect
(16:9 1920×1080), and cut variants from it, never author them separately. Declare a piece's
destinations at treatment (stage 1); QC every declared variant at QC (stage 6).

| Destination | Aspect | Length ceiling | Audio reality | Captions | Size budget | Texture (grain/grade) |
|---|---|---|---|---|---|---|
| README / lab hero | 16:9 | 45–60s | click-to-play, sound available | on-screen type is the copy (works muted) | ~2.5 MB target | grade OK, grain light (h.264 killer) |
| LinkedIn native | 1:1 preferred, 16:9 OK | ≤60s (teases 10–20s) | autoplay MUTED — assume never heard | mandatory when words carry; hook readable in 2s | generous — grain and grade OK | full treatment OK |
| X native | 1:1 preferred, 16:9 OK | ≤60s | autoplay MUTED | mandatory when words carry; hook in 2s | generous | full treatment OK |

Rules:

- A video that words can't survive muted does not ship to a muted-autoplay feed (LinkedIn,
  X) without captions or on-screen type carrying the words.
- The 2-second hook rule applies to feed destinations: the first punch-in or type-slam
  lands inside 2 seconds, no logo intros.
- The grain/grade conflict is decided per destination: the size-budgeted site hero stays
  light on grain; feed cuts may carry the full finish.
- Reframes (16:9 → 1:1) go through the reframe pipeline; re-check text safe areas after
  every reframe — the look critic's frame checks apply to variants too.
- QC checklist per variant: correct aspect, within length ceiling, within size budget,
  captions/type present where mandatory, hook inside 2s, loudness -14 LUFS for social when
  audio exists.
