# Review: static diagrams for storage essays S1–S3 (2026-11-16)

Reviewer: Claude Code (claude-opus-5-5), independent session; did not build the diagrams.
Scope: the uncommitted diagram retrofit (STANDARD.md §4a) in
`computing/systems/what-a-drive-is-made-of/` (S1, 8 diagrams), `computing/systems/how-sata-works/` (S2, 8),
`computing/systems/how-sas-works/` (S3, 10). S4/S5 were reviewed separately and not touched.

## Verdict

**Ready to register** after the fixes below. Every diagram is technically correct, and the numbers drawn on it come
from models.js and are pinned in tests/models.cjs, or the caption says it is schematic. zh/en have the same keys and
placeholders, English mode shows no CJK, and every label renders at 11 px or more at 320 px wide. Two things blocked
registration and are now fixed: a lost test check, and a label drawn on an arrow (S3 Figure 4).

## Test changes (scrutinised as asked)

1. **Outside-viewport check (all three `tests/browser.cjs`): coverage was lost; restored.** The builder added
   `if (e.closest('svg')) return false;`. `closest()` matches the element itself, so the `<svg>` root was excluded
   too, and `diagramCheck` only compares label bboxes with the viewBox, never the rendered SVG with `innerWidth`.
   Mutation test: at 320 px, an SVG forced to 420 px wide produced 0 failures with the builder's filter and 24 with
   the restored one. Now only `<defs>` (marker shapes) is skipped, so the `<svg>` and everything it draws are checked.
   All three pages pass with the restored check.
2. **Clipped-text check: exclusion removed.** The exclusion never fired, because SVG elements have
   scrollWidth/clientWidth 0. Removing it changes nothing, and the check is back in its original form.
3. **`how-sas-works/tests/models.cjs` `^dg\.` placeholder skip: acceptable but too broad; narrowed.** Diagram labels
   take placeholders from app.js, not from `prose()`. Leftover `{x}` in rendered SVG text is caught by the browser
   check, and the zh/en placeholder-parity check (line 279) still covers dg keys. Captions and aria-labels are never
   filled with variables, so the skip is now `^dg\.\w+\.(?!cap$|aria$)`, which keeps them under the original check.
4. **Systemic issue outside my scope:** about 20 sibling essays in `computing/systems/*/tests/browser.cjs` have the
   same `e.closest('svg')` skip in their outside-viewport check (e.g. how-memory-talks, how-pcie-works,
   coherent-interconnects, storage-over-a-network, how-usb-drives-talk). In all of them, an SVG wider than the
   viewport goes unchecked. I did not change them. They should get the same one-line fix (`closest('defs')`).

## Facts checked (against the standards / my own derivation)

- S1: 512e. A 4 KiB write at LBA 63 covers 63–70 and straddles physical sectors 56–63 and 64–71, so both need
  read-modify-write; at LBA 2048 it fills exactly one. HDD rotation latency: half a turn on average. SMR: rewriting
  track 2 rewrites 2–6 of the band. Flash cell layer order: gate / blocking oxide / charge layer / tunnel oxide /
  channel. Threshold voltage rises with trapped charge. BCH: 8,192 + 14×40 = 8,752 bits at a code rate of 93.6%. FTL:
  out-of-place update 0.1 → 1.1. The M.2 layer table matches the model.
- S2: The data connector reads G A+ A− G B− B+ G; pair A is the host's transmit pair. 8b/10b: D0.0 is 100111 0100 at
  RD− and 011000 1011 at RD+, both balanced. K28.5 at RD− is 001111 1010, comma 0011111. H2D Register FIS Dword 0 is
  27h, 80h (C bit), 60h (READ FPDMA QUEUED), 08h (FEATURES 7:0 = sector count). The NCQ tag sits in Count bits 7:3 of
  Dword 3. FIS types and lengths: 27h/5, 34h/5, 41h/7, 46h/1+1,024, A1h/2. Partial ≤10 µs, Slumber ≤10 ms,
  DevSleep ≤20 ms, MDAT 10 ms. A port multiplier serves up to 15 devices. NCQ turns: 400° FIFO vs 260° nearest-first
  (recomputed). PATA has 16 data lines.
- S3: READ(6) is 08h, 21-bit LBA (byte 1 bits 4–0 plus bytes 2–3), length in byte 4. READ(10) is 28h, LBA in bytes 2–5,
  length in bytes 7–8. READ(16) is 88h, LBA in bytes 2–9, length in bytes 10–13. SSP frame: 24-byte header + up to
  1,024 bytes + 4-byte CRC. COMMAND IU is 28 bytes; RESPONSE IU is 24 bytes minimum. 4 KiB takes 4 DATA frames. PI:
  guard 2 + app 2 + ref 4, CRC-16 0x8BB7, Type 1 ref = low 32 bits of the LBA. SAS-4: 150 = 2 + 128 + 20 bits,
  RS(30,26) over 5-bit symbols, t = 2. A 7-bit burst starting on a symbol's last bit touches 3 symbols. 22.5 Gbaud ×
  128/150 = 19.2 Gb/s. The SAS plug geometry (S8–S14 in the SATA gap) is drawn schematic, and the caption already says
  SFF-8482 was not read.
- Consistency with sibling essays: host cyan / drive violet in S2 and S3; the "Dword" terminology and the 8b/10b codes
  match the SATA chapter that S3 refers to.

## Defects fixed

- S3 Figure 4 (`DG.conn`, wide): the wrapped OPEN label's second line ("a lane)") was drawn on the OPEN arrow. Labels
  are now vertically centred 21 units above their arrow. The expander lifeline also ran through every label at all
  widths, so these labels get a background-coloured halo (`svg text.h`, paint-order stroke; same technique as
  how-thunderbolt-works).
- S3 Figure 5 (`DG.dual`, wide): path A and path B ran on the same vertical wire at x = 372, which hid the point of the
  figure (two independent paths). Path B now runs at x = 382.
- S3 `dg.ssp.note`: the RESPONSE IU "is 24" bytes → "at least 24" (sense data extends it), in zh and en.
- S3 `dg.plug.ok`: "speaks SATA over STP" → "speaks SATA (over STP via an expander)"; direct attach is native SATA.
  Changed in zh and en. My first, longer wording wrapped at 1280 and the diagram check flagged the overlap, so I
  shortened it and reran the test.
- S2 Figure 7 (`DG.pwr`, narrow): the Awake description ran onto the vertical axis arrow; its wrap width is now 16
  units narrower.
- S1 Figure 7 (`DG.ftl`, narrow): the before panel's two-line English note touched the "After…" heading; the after
  panel moved down 12 units (viewBox height 580 → 592).

BRIEF.md of each page has a short note on this review.

## Residual (not blocking)

- S1 ECC caption: "one more [error] and the chunk is lost" leaves out read-retry and soft decoding. This matches the
  prose and the model's definition of failure.
- S2 Figure 5 at 320: "4 KiB" wraps between "4" and "KiB". The wrapper splits on `\s`, which includes NBSP.
- S2 Figure 8 at 320 (zh): a large gap between the timeline titles and their bars (layout sized for two-line English).
- S2 Figure 6 draws K28.5 only at RD− (labelled as such). The RD+ form 110000 0101 is not drawn.
- S2 power-state caption says "three sleep states" while the aria-label lists four states. Awake is counted in the
  aria only; this is consistent.
- Labels crossing dotted lifelines in S2 Figure 5 at 320 (no halo there). They are readable.
- Cache-busting `?v=20261116a` was not bumped, because the pages are not yet deployed.

## Test results (final run)

- `node computing/systems/what-a-drive-is-made-of/tests/models.cjs`: PASS 1116/1116
- `node computing/systems/how-sata-works/tests/models.cjs`: PASS 1774 checks
- `node computing/systems/how-sas-works/tests/models.cjs`: PASS 2131 checks
- browser tests (serial, port 18963, zh+en at 1280/390/320 + reduced motion): PASS on all three
- `tests/canvas-text-overlap.cjs --sweep`: PASS. 936 (S1), 818 (S2) and 948 (S3) canvas states, scroll-aware mode, 1280/390/320 × zh/en
- `node tests/site-nav.cjs`: PASS (2267 checks)
