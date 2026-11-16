# Independent review: how-a-cpu-does-math (CPU 是怎么算小数的，又怎么一次算一排)

Date: 2026-11-16. Reviewer: Claude Code (claude-opus-5-5), independent of the builder (Opus, content.zh.md and models)
and the translator (Haiku, content.en.md). Procedure: specs/essay-briefs/REVIEW-COMMON.md. Page:
`computing/systems/how-a-cpu-does-math/`, the first essay written natively in the site template. Nothing committed.

**Verdict: ready to register** once the fixes below are committed with the rebuilt outputs. No model was wrong. The
errors were in attribution and framing (the M4 matrix unit, Intel's licences presented as current), in references that
readers cannot follow (BRIEF.md), in a wrong sibling title, and in English diagram and control layout.

## Errors found and fixed

All in the Markdown sources, `page.css`, `tools/diagrams-more.cjs` and the tests, then rebuilt with
`node scripts/build-pages.cjs computing/systems/how-a-cpu-does-math`.

1. **M4 SME attributed to "one core" (ch11, ch12, ch13 d3).** Remke & Breuer measured one thread on a P core, and from
   the scaling they infer that M4 has two shared SME units. Before: 「苹果 M4 的一个大核用 SME 矩阵单元，实测 …」,
   「一个 CPU 核心的矩阵单元每周期上千次运算」. After: one thread on a P core; the unit is shared by the P cores;
   「CPU 上的一个矩阵单元」. The BRIEF's open question is now closed: the abstract's ">2.3 TFLOPS" is 2338 GFLOPS
   summed over several threads, and 2009 GFLOPS is the single-thread figure.
2. **Intel AVX-512 licences read as current behaviour (ch11).** Before: 「一小段 AVX-512 代码，会拖慢它后面将近一毫秒的普通代码」.
   680 µs is about two-thirds of a millisecond, and the figure belongs to the 2017 chip. After: the claim is limited to
   that chip, plus one sourced sentence: on Ice Lake client (i5-1035G4, Downs 2020-08), 512-bit code drops from 3.7 to
   3.6 GHz on a single core and not at all on several cores. Source added to the footer.
3. **"See BRIEF.md" shown to readers (ch13 intro and take).** Replaced with "each item carries its date; sources are at
   the end" and "these facts describe November 2026; check the date".
4. **Unverifiable quote (ch13 c1).** The AVX10.2 spec "将被所有未来的处理器支持" / "will be supported by all future
   processors". I could not read the PDF to confirm the quotation, so it was removed. The item now says it is a
   specification, not a product.
5. **Wrong sibling title (ch14).** 《一个前沿大模型要花掉什么》 / "What a Frontier Model Takes" was changed to the
   registered titles in its REGISTRY.json: 《造出并运行一个最前沿的大语言模型，需要什么》 / *What It Takes to Build and
   Run a Frontier Language Model*.
6. **Misleading link gloss (ch14).** Before: how-a-cpu-guesses-ahead 「乱序执行，为什么它也离不开多个累加器」 /
   "out-of-order execution, which also depends on multiple accumulators". After: "branch prediction and out-of-order
   execution: hardware finding independent instructions on its own".
7. **Small precision fixes:**
   - **E4M3 NaN.** "Only one NaN encoding" became "the all-ones exponent and mantissa pattern, one per sign" (OFP8
     S.1111.111).
   - **NaN propagation.** "Any NaN operand gives NaN" now covers only arithmetic and square root, and notes that
     comparisons return false.
   - **FMA error term.** "Always fits" now adds "as long as nothing underflows".
   - **Subnormals.** 「到 2⁻¹⁴⁹ 只剩 2 位」 became "at k = 149": the stored value of 1.7·2⁻¹⁴⁹ is 2⁻¹⁴⁸.
   - **SME ZA.** "Side = vector length" became "each side as many bytes as a vector (64 × 64 bytes, 4 KB)".
   - **Footer.** "Not yet independently reviewed" became "reviewed 2026-11-16".
8. **English:**
   - **"Decimal operations".** The desc, sub and lead said "billions of decimal operations" for 几千亿次小数运算.
     These are binary floating-point operations, and the figure was off by two orders. The en desc is now the
     REGISTRY en desc, and the sub reads "hundreds of billions of floating-point operations".
   - **Wording.** "written by AI" became "by an AI". AVX2 "filled in integer operations" became "brought integer
     operations up to 256 bits".
   - **Grammar.** The ch11 live sentence said "1 accumulators". It is now "Accumulators: {k}." in all three branches.
9. **English diagram labels that overlapped or left the drawing** (browser test failures at 1280/390/320):
   - f32: "positive" became "+";
   - grs: "remaining bits OR-ed together" became "rest OR-ed together";
   - fma: "separate: two roundings", "fused multiply-add: one rounding" and "rounded product (24 bits)" became
     "separate: 2 roundings", "fused: 1 rounding" and "rounded to 24 bits";
   - pipe: "wait for previous result" became "wait 4 cycles";
   - grid: "spacing 1/8…" became "gap 1/8…", because a leader line crossed the longer label at 320.

   The wide pipe label sat on its own arrow in **both** languages. `tools/diagrams-more.cjs` now places it beside the
   arrowhead, and `node tools/diagrams.cjs` regenerated the figures; only dg-pipe.html changed.
10. **Layout bugs found in English:**
    - **320 px overflow (9 px).** The ch1 number field (`label.txt`) lacked `min-width:0`.
    - **ch11 licence lab at 1280.** The range label shrank until its value "20 µs" was drawn over the "Frequency rule"
      label. `label.rng` now has `min-width:min(100%,420px)` and the range has `min-width:96px`, so the radio group
      wraps instead. The existing checks missed this; see the tests below.

## Tests changed (all tightened)

- `tests/models.cjs`:
  - `meta.en` is now expected to be `native`, not `stub`;
  - new checks: no `[EN pending]` left in en, no CJK in any en string, REGISTRY `desc.en` equals en `doc.desc`, and
    REGISTRY `title.en` equals en `hero.title`.
- `tests/browser.cjs` already ran English once `meta.en` was no longer `stub`. New checks:
  - no CJK in English `aria-label`/`title`/`alt`, the document title or the meta description;
  - no part of a `.ctl label` (range, output, span) extends outside its label. This is the check that would have
    caught item 10.

## Final runs (after the last rebuild)

- `node computing/systems/how-a-cpu-does-math/tests/models.cjs`: 233/233 checks passed.
- `tests/browser.cjs` (zh + en × 1280/390/320, served on 18967): 174/174 checks passed.
- `tests/canvas-text-overlap.cjs --sweep`, re-run after the CSS change: "PASS: 1350 canvas states across 1 pages ×
  1280/390/320 × zh/en (with slider/button sweep) have no colliding or clipped text" (all six runs in scroll-aware mode).
- `build-pages.cjs <dir> --check`: "OK … outputs match the sources" (the expected draft warning).
- `tests/site-template.cjs`: "PASS site template: 89 checks".
- The new spill check passes on the fixed CSS. I did not re-run it against the old CSS to show that it fails there.
- Screenshots of all 13 diagrams and 14 labs, zh/en at 1280/320, looked at by eye. Contact sheets are in
  `/tmp/agent-tasks/review-simd/`.

## Claims spot-checked against sources opened 2026-11-16

- **OCP MX v1.0 PDF** (text extracted):
  - FP8 must support the SAT and OVF overflow modes; FP6, FP4 and INT8 must support clamping. This bears out the ch7
    "saturation the OCP specification requires to be supported".
  - §6.3 "should be clamped".
  - Contributors: AMD, Arm, Intel, Meta, Microsoft, NVIDIA, Qualcomm.
  - Block of 32 with an E8M0 scale. The E8M0 range is 2⁻¹²⁷ to 2¹²⁷, and one NaN.
- **arXiv 2310.10537v3**, Algorithm 1: the 1000 → 896 claim (scale 2¹, 500 clamps to 448) is the specified behaviour,
  and `models.js` uses emax_elem = 8 for E4M3.
- **Remke & Breuer**: 2009 and 502 GFLOPS; the four-cycle FMOPA latency; shared units.
- **Downs 2020-01 and 2020-08; Chips and Cheese Zen 5**: all the numbers on the page match.
- **AVX10.2 rev 7.0** (April 2026) exists as document 361050-007. Its body text was not machine-readable here.
- **Re-derived by hand or with a one-line script:**
  - 0x3DCCCCCD; the 2⁻²⁸ error ratio;
  - the 36.4 h / 15.625 ms and 72.8 h / 31.25 ms clock steps;
  - BF16 round-up 14,848; 0.1f × 10⁴ = 999.9029;
  - k = 140 → 10 bits; 150 and 127 halvings;
  - FP16 underflow 24.7% from 4096 samples, against a theoretical 23.4% (sampling noise, within the stated model);
  - E4M3 overflow 63.6%, against a theoretical 65.4%;
  - E4M3 span 17.8; AMX 16·16·32 = 8,192; FMOPA 256 against FMLA 16;
  - Zen 5 peak 5.7 × 2 × 16 × 2 = 364.8 GFLOPS.
- **Sibling consistency:**
  - how-a-gpu-computes ch8 lists the same FP8, FP4 and BF16 formats;
  - switches-that-compute ch5 covers overflow and ch10 covers 0.1 + 0.2;
  - how-cpu-caches-work ch2 covers address split and cache line; how-power-reaches-the-cpu ch2 covers voltage;
  - why-compute-waits-for-memory ch7 is the roofline and ch8 is LLM inference;
  - every deep-link target matches its gloss.
- **ch10 unaligned loads.** 100% and 50% are correct for a contiguous stream at a 4-byte offset. The wording
  「每一次都会跨两条缓存行」 is right for 64-byte loads, so it was left as is.

## Residual doubts (not fixed)

- AVX10.2 details (all three widths on E-cores, the bias conversion for stochastic rounding) rest on the builder's text
  extraction. Press reports disagree on whether 512-bit is mandatory on E-cores.
- P3109 (arXiv 2606.04028) and its status are past my knowledge and were not opened.
- Zen 5's 2 × 512-bit loads per cycle has one source (Chips and Cheese). Intel's AMX ops per cycle come via Wikipedia.
- ch3 says AVX10.2 gives "hardware support for stochastic rounding". Strictly, it is a bias operand that lets software
  implement it, which ch13 says correctly. The ch3 wording is acceptable but loose.
- The live-sentence branch tests in `browser.cjs` drive the Chinese strings only. English sentences were read in
  screenshots, not exercised branch by branch.
- In the wide pipe diagram, the arrow starts right next to the "1 accumulator" heading. It does not overlap, but it is
  tight.

## Template friction met as a reviewer of a Markdown page

1. **Diagram label budgets are invisible in the Markdown.** The translator had no way to know that `dg.fma.sep` must
   fit in about 23 characters around x = 92 of a 360-unit SVG. Every overflow surfaced only in a browser run. A
   per-key width budget (for example `sep: … <!-- ≤22 -->`, or a build-time estimate from the partial's x and anchor)
   would catch most of them at build time.
2. **Some diagram text is generated outside the Markdown.** Positions live in `tools/diagrams-more.cjs`. Fixing a label
   on a line meant editing a generator, re-running it, and then confirming by diff that only one partial changed. The
   template has no step that says partials are generated, or by what.
3. **`{=binding}` hides the number.** A reviewer reading content.*.md cannot see the values without running
   bindings.cjs by hand. A `--print-bindings` flag on build-pages would help.
4. **Parity is enforced on keys, not on meaning.** The build accepted an en desc that disagreed with REGISTRY.json and
   with the zh desc (an order of magnitude apart). The page test now pins this, but the build could check
   REGISTRY.desc against the front matter itself.
5. **The English check in `browser.cjs` turns on only when `meta.en` flips.** The stub mechanism worked, but the switch
   is page code, not template code (as the builder's BRIEF also notes).
6. **The overflow and clip checks missed overlap inside flex controls.** A squeezed range label spilled onto the next
   control without overflowing the page. A shared check ("children stay inside their control") belongs in the
   template's test kit.
