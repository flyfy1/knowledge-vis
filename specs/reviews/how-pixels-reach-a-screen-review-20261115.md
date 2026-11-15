# Review: computing/systems/how-pixels-reach-a-screen (2026-11-15)

Reviewer: Claude Code (claude-opus-5-5), a separate session from the builder (same model; cross-model review pending).
Scope: copy.zh.js and copy.en.js in full, models.js, app.js (diagrams, link chart), index.html, tests; technical claims
against Linux v6.12 sources and VESA material; English; diagrams and models at 1280/390/320 in both languages.
Built-By of the page: Claude Code (claude-opus-5-5); English drafted by Claude Code (claude-haiku-5-5).

## Findings and fixes

Model errors (models.js, pinned in tests/models.cjs):

1. **Immediate mode over-counted tears (42/s, should be 36/s).** Frames that finish exactly on a refresh were
   counted as tears at line fraction ~1e-14 (floating-point). Closed form: 48 flips/s on 60 Hz, every flip whose time
   is a multiple of 1/60 s lands in blanking, so 48 − gcd(48, 60) = 36. Added an epsilon; test pins 36 and the
   closed form, plus 30 fps on 60 Hz → 0 tears.
2. **FIFO rounding at refresh instants.** The same coincidence in the FIFO branch made one frame miss its refresh
   now and then, so FIFO 3 at 48 fps on 60 Hz broke its 3:1 hold pattern once per second. Epsilon added; the test now
   checks that every four consecutive holds contain exactly one 33.3 ms hold. Pacing stays 6.3 ms (closed form 6.25).
3. **DSC on 8b/10b DisplayPort ignored mandatory FEC.** Linux i915 `intel_dp_supports_dsc()` refuses DSC on external DP
   without FEC; `drm_dp_bw_overhead()` charges (256·6+1)/(256·250) = 2.4016 %. HBR3 with DSC is 25.31 Gb/s, so 4K240
   10-bit needs ≤ **11.06** bpp (not 11.31); 8K60 ≤ **10.63** (not 10.88). linkFit applies FEC to HBR2/HBR3 rows when
   DSC is on; UHBR rows are untouched because the kernel's 96.71 % already includes FEC. ch7.p4 now explains it and
   quotes 11.31 as the figure one gets without FEC.
4. **UHBR payloads came from TFTCentral.** Now derived: 4 × lane rate × 0.9671 (Linux
   `drm_dp_bw_channel_coding_efficiency`, citing DP 2.1 §3.5.2.18). 80 × 0.9671 = 77.37 reproduces VESA's number;
   UHBR10 becomes 38.68 (was 38.69), UHBR13.5 52.22.
5. **"Smallest link that fits" was not the smallest.** LINK.order put FRL (42.67) before UHBR10 (38.68), so 4K120
   10-bit reported HDMI 2.1 FRL. Order is now by capacity (tested); the answer is UHBR10.

Prose errors (both languages):

6. ch6.p4 said 4K60 10-bit on HDMI 2.0 "can only drop to 4:2:0"; 4:2:2 at 10/12 bit rides the 594 MHz character
   rate and fits (the model's own rule). Fixed.
7. ch6.p5 said 4K120 10-bit "needs HDMI 2.1 or UHBR13.5" (UHBR10 fits) and "only UHBR20" carries 4K240/8K60 (the
   claimed HDMI 2.2 bar also does). Fixed with conditions.
8. ch3.p4 said FIFO 3 holds "alternate" 16.7/33.3 ms; the pattern is three short, one long. Fixed.
9. hero.note cited "the HDMI Forum's specification page" as a primary source; BRIEF says it was not usable. Now says
   the HDMI 2.2 figures come via trade press.
10. ch6.p2 now says how UHBR payloads are derived; ch6.limit says FEC is modelled for DSC and RS-FEC is not for FRL.
11. FRL 42.67 Gb/s: 16b/18b is correct for FRL; the figure is now labelled in ch6.p4 as before FRL's own error
    correction.

English: hero.sub/hero.lead ("hundred million" left from 亿 → "× 10⁸, just short of a billion"); ch1.p3, ch3.law,
ch3.say.stutter, ch10.law ("the brightest few percent" was a mistranslation of 最亮的百分之几 → "this fraction of the
screen's maximum"), ch8 model title, two opening analogies. Diagram labels: "Gate · source" → "Row & column drivers";
"Flip: swap" → "Flip = swap" (the longer "swap pointers" overflowed at 390/320); the overview showed "TCON / TCON" →
"Timing controller / TCON". Cross-page titles match pages.config.js exactly; all mentions are already hand links.

Layout: latency diagram (narrow) "In the computer" ran over its bracket → wrapped; raster diagram (narrow) "Reading
direction" sat on the blanking stripes → moved up inside the visible area.

Diagram caption: dg.fmt said RGB10A2 "moves alpha's 8 bits to the colours"; it takes 6 of them (2 more per colour).
Fixed in both languages. All 12 diagrams were looked at (screenshots at 1280 and 320, both languages for several).

Design note for the owner: with DSC on, the HBR2/HBR3 bars in model 6 shrink by the 2.4 % FEC (25.92 → 25.31 Gb/s).
That is correct and ch6.limit/ch7.p4 explain it, but a reader toggling DSC sees a link's capacity change.

Site navigation: index.html had no site-nav include; added `site-nav.css` / `site-nav.js` (sn-20261115) and bumped
the page's own cache keys to 20261115b. Registrar: after adding the page to pages.config.js run
`node scripts/build-site-nav.cjs --check` and `node tests/site-nav.cjs` to confirm the hand-added lines are accepted.

Aliases (REGISTRY.json): removed 显示流压缩 and Display Stream Compression (definitions of DSC belong to
how-thunderbolt-works); kept DSC 有损吗 / is DSC lossy / 视觉无损 / visually lossless as questions this page answers.

## Checked and correct

- CTA VIC 16/97/117/118/199 rows against Linux v6.12 drm_edid.c (fetched): 594 MHz, 4400 × 2250, 16.2 % blanking.
- 522.614 MHz is CVT-RB2 **4K60** (3920 × 2222), labelled so; recomputed by hand.
- 4K120 10-bit 35.64 Gb/s (VIC 118 × 30), 4K240 CVT-RB2 2285.203 MHz → 68.56, 8K60 71.28.
- PQ constants m1 = 2610/16384, m2 = 2523/4096 × 128, c1 = 3424/4096, c2 = 2413/4096 × 32, c3 = 2392/4096 × 32;
  codes 153/520/769 for 1/100/1000 nits.
- BT.2087 709→2020 first row 0.6274/0.3293/0.0433 (derived matrix agrees to 1e-4).
- FIFO 2 at 48 fps on 60 Hz → 30 fps, 33.3 ms; VRR in range pacing 0; LFC needs max/min ≥ 2 (model), 31 ms on 35–60
  still stutters; tuned constants (τ, panel response, compositor frame, SDR white) are labelled where they appear.
- eDP 1.5 published 2021-10-27 (VESA release, vesa.org/?p=42700); Adaptive-Sync Display CTS r1.1 dated 19 May 2023
  (vesa.org/wp-content/uploads/2023/05/Adaptive-Sync-Display-CTS-r1.1.pdf), via search listings.

## Still unverified

HDMI 2.1 FRL RS-FEC overhead (not deducted, labelled); HDMI 2.2 line coding (bar labelled claimed); AMD's "2.5×" LFC
range (labelled); BT.2100/BT.2087 PDFs not opened (values match derivations and reproductions); AdaptiveSync CTS
launch date 2022-05-02 (search only); LG Display 720 Hz OLED (vendor claim, labelled); Miller 2013.

## Tests

- `node tests/models.cjs`: PASS 10207 checks.
- `tests/browser.cjs` (zh + en, 1280/390/320, reduced motion, 12 diagrams, all models): PASS.
- `tests/canvas-text-overlap.cjs --sweep`: PASS, 1163 canvas states, zh+en × 1280/390/320 (scroll-aware mode on all six runs).

## Verdict

Publishable after these fixes. The model errors were small in effect but real (a wrong tear count, a DSC
threshold 2 % too generous, a mislabelled "smallest link"); all are now derived and pinned.
