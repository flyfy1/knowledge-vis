# Review record: physics/modern/why-fusion-is-hard — 2026-11-18

Reviewer: Claude Code review agent (claude-fable-5-2), independent of the builders. Review and fix in place, both languages.
**Status: interrupted.** The team lead stopped the work for budget reasons after steps 1–3, 5 and 6 of REVIEW-COMMON and part of
step 2's fact checks. Steps 4 (layout at 390/320) and 7 (diagram screenshots) and the canvas sweep were not done.

Verdict so far: **not ready to register until someone looks at the page after these edits** (diagrams and English layout at
1280/390/320, canvas sweep). No factual or model error is known to remain.

## First read (Chinese, 1280, before code or BRIEF)
1. Ch6 is the hardest passage on the page: the SPARC paragraph explained a Q gap by "stored energy differs by a tenth" without
   showing either stored energy, so the reader had to take it on trust. Rewritten with both numbers.
2. Ch11 said the US "followed a path lower than 'may never be built'", but the chart in front of the reader shows the bars above
   the Logic I line until 1987. The live sentence for Logic I said it correctly; the prose did not.
3. Ch11 readouts "30,038 百万美元" are not how a Chinese reader counts money.
4. Ch6 live sentence called Q = 5–10 "the regime ITER is aiming for"; ITER's goal is Q ≥ 10.
5. Ch2 asks the reader to read the Sun's protons off a chart that offers D–T, D–D and p–¹¹B only (left as is; the sentence is true
   a fortiori). Ch7's laser arrowheads were hidden under the X-ray arrows. Otherwise the ladder holds: each chapter is used by the next,
   defaults show the effect, limits are stated.

## The SPARC Q question (re-derived from Creely et al. 2020, J. Plasma Phys. 86, 865860502, §4 and table 2)
Source text extracted from the White Rose PDF and read directly.
- Scaling: eq. 4.1 is ITER98(y,2) with the page's coefficients; P_loss "does not include radiated power"; κ_a is the areal elongation. Correct on the page.
- Q: table 2 gives P_RF 11.1 MW, P_ohmic 1.7 MW, P_fus 140 MW; Q = 140/12.8 = 10.9. Same definition as the page (P_fus / external heating).
- Paper's own balance: P_sep·B0/R0 = 191 → P_sep = 29.0 MW; P_α = 28.2 MW; so radiated power = 11.1 + 1.7 + 28.2 − 29.0 = 12.0 MW,
  and W = τ_E·P_sep = 0.77 × 29.0 = 22.3 MJ. Putting 29.0 MW into eq. 4.1 by hand returns τ_E = 0.77 s, so P_sep is the power the scaling uses.
- **Error found.** The page took radiation as 2.25 × hydrogen bremsstrahlung (7.8 MW). The paper's 2.25 multiplies the bremsstrahlung
  of its Z_eff = 1.5 plasma: 3.375 × hydrogen = 11.7 MW, matching the 12.0 MW above. Fixed in `PROFILE` (zeff 1.5, radX 2.25).
  This moves the model away from the paper's Q: SPARC 152 MW / **Q 6.8** (was 8.2), ITER with the same assumptions 928 MW / **Q 18** (was 27).
- Remaining gap is the stored energy: model 25.0 MJ (profile factor ν_nν_T/(ν_n+ν_T−1) = 1.18 for (1−ρ²)^(ν−1) shapes, which the paper
  does not specify), paper 22.3 MJ. With loss ∝ W^(1/0.31): 41.5 MW against 29.0 MW. Setting W to 22.3 MJ in an independent script gives Q ≈ 15.6
  (at 152 MW rather than 140), so "a tenth in stored energy more than doubles Q" is correct, and the test pins it.
- Flat-profile ITER (521 MW, Q 10.4) is reproduced independently; "partly coincidence" is fair and stays.
- Nothing was tuned. The parameter change is the paper's stated Z_eff, and it makes the match to Q ≈ 11 worse.

## Errors found and fixes
| Where | Problem | Fix |
|---|---|---|
| models.js `PROFILE`, ch6.p5/p6, tests | radiation multiplier misread (above) | zeff × radX; prose rewritten with radiated power, stored energy and loss for model and paper; tests pin 6.8 / 18 and the paper's balance |
| models.js `V.tokamak` | "ITER's regime" sentence from Q ≥ 5 | threshold is ITER's goal, Q ≥ 10 |
| ch11.p2 | "lower than 'may never be built'" false before FY1988 | above Logic I to 1987, below from 1988, cumulative 103% of Logic I and 39% of Logic II (pinned) |
| ch11 readouts, sentences, axis | "30,038 百万美元" | `{usd}` formatter: "300 亿美元" / "$30.0 billion"; axis in 亿美元 / $ billion |
| ch11.model.how | Logic I level is a figure read-off | said so |
| ch9.p3 | "10 dpa per MW·yr/m²" | "10–20, depending on steel and spectrum" |
| models.js comment | H_B cited to Atzeni, unconfirmed | Lindl, McCrory & Campbell 1992 |
| index.html ch7 diagram | laser arrowheads hidden | beams redrawn through the end openings onto the wall, larger heads, drawn over the X-rays (**not yet looked at**) |

## Facts spot-checked (opened 2026-11-18)
CRS RL30417 table 1 (all 25 years match); ERDA-76/110/2 (DEMO years, totals, β, wall fluence, Logic I wording); Nature 13 Dec 2022
via the Scientific American reprint (322 MJ, 2.05 → 3.15 MJ); Physics Today and Optica (about 300 MJ, LLNL staff); Physics World and
Science|Business (ITER €5 bn, D–T 2039); SCMP/Xinhua and NEI Magazine (BEST 2027); World Nuclear News and trade press (FIA: $4.48 bn,
$14.24 bn, 56 companies — FIA's own report not reached); ITER fuel-cycle page ("around twenty kilos"); Physics Today 1992 (H_B = 6 g/cm²).

## English
- Dates: `fmt.months` added to both copy files; English reads "5 December 2022", "November 2026". Prepositions fixed where a date is a month.
- Money: "€5 billion", "$4.48 billion", "$30.0 billion".
- Mistranslation: ch10.o1 asked "Has a magnetically confined plasma ever ignited?"; the Chinese states that none has.
- "N times short of" → "a factor of N below"; ch1.p3 "a plant undergoes reactions"; "current to" → "as of".
- Link texts are now the full registered English titles (Chinese: the registered title before " · "); the related-pages list uses
  semicolons in English because titles contain " · ". The node test checks every link against pages.config.js.
- Not reviewed in the browser: wrapping of the longer link texts, diagram labels ("Heat", "Hohlraum", "Blanket").

## Tests
- `tests/models.cjs`: English copy loaded; key parity, order, types and placeholders; no CJK in English; English live sentences;
  dates and money in both languages; SPARC paper balance; funding against Logic I; link titles.
  Final run: `PASS: 6614 checks (models pinned, 45 live-sentence templates driven through their branches, copy resolves)`
- `tests/browser.cjs`: runs zh and en at 1280/390/320; English: no visible CJK, no ISO dates, money; toggle both ways with canvas
  redraw; readout tiles; laser arrowheads. `show()` now scrolls instantly (smooth scrolling took over a second, so canvases were read back blank).
  Last run (before the server was stopped): `PASS: browser smoke test (zh and en at 1280/390/320: overflow, clipped text, 48px targets, unresolved text, nine diagrams, readout tiles; en: no CJK, dates, money; toggle both ways with canvas redraw, keyboard, all eleven chapters' models, reduced motion)`
- `tests/canvas-text-overlap.cjs --sweep`: **not run.**

## Left to do
1. Look at every diagram in both languages at 1280/390/320 (ch7 first), and at model screenshots at 390/320 for ch1–3, 7, 8, 11.
2. Run the canvas sweep on port 19026 and re-run `tests/browser.cjs` once more.
3. FIA 2026 report from the FIA itself; Kovari 2018 and the frontier items not re-opened here.
4. Scratch files remain in `/tmp/agent-tasks/essays/review-why-fusion-is-hard/` (no delete commands issued). Server on 19026 stopped.

## Completion pass (2026-11-18, later the same day)

Reviewer: Claude Code (claude-fable-5-2), a second review agent, independent of the builders. Scope: the remainder listed under
"Left to do" — screenshots, canvas sweep, final test runs, the FIA report. Nothing recorded above as verified was redone.

Verdict: **ready to register.** No factual, model or layout error is known to remain.

### Looked at
Element screenshots of all nine diagrams and all fourteen canvases with their controls, readout tiles and live sentences, in zh and
en at 1280 / 390 / 320 (138 images, taken twice: before and after the fixes below), default state of each model; plus the ch8
shortfall state and the related-links list and footer in English at 320. No horizontal overflow at any width in either language.
- Diagrams: nothing to fix. ch7: the laser beams pass through the end openings and end with visible arrowheads on the inner wall,
  over the X-ray arrows. English labels ("Heat", "Hohlraum", "Blanket (Li)", "Recirc.", "Brems.") fit at 320.
- Longer English link texts wrap cleanly at 320.

### Fixed
| Where | Problem | Fix |
|---|---|---|
| ch8 canvas, en (`ch8.cv.r3`, `r4`, `r4neg`) | row titles wider than the canvas at 320; the clamp cut off their beginning | "Electricity {v} MW (rest: waste heat)", "Net to grid {v} MW (rest: recirculated)", "All recirculated, still {v} MW short" |
| ch8 canvas, both languages | "Waste heat" / "Heating loss" dark text on the dim fill, barely readable | light text on the dim segments (app.js) |
| ch5 canvas, en | "Inboard (strong field)" and "Outboard (weak field)" touched at 320 | "Inboard: strong field" / "Outboard: weak" |
| ch6, ch9, ch11 canvases, both languages | "Ignition", "Global civilian stock, about 20 kg" and "DEMO 2005" drawn before the curves, so a curve ran through the text | labels drawn after the curves (app.js) |
| `ch9.m1.how`, en | "a further 1 days of reserve" | "a 1-day reserve on top" |

No number, model or Chinese string changed; copy.zh.js and copy.en.js keep the same keys and placeholders (the node test checks this).

### FIA 2026
One targeted look. The FIA's own press release (fusionindustryassociation.org, "Fusion Industry Attracts Record Annual Funding of
$4.48bn, Raising Total to $14.24bn") states: "$4.48bn raised in the 12 months leading to July 2026", "a total of $14.24bn since the
annual survey began in 2021", "This year, the FIA surveyed 56 fusion companies". All three figures on the page are confirmed from the
FIA; `ch10.cl5` already attributes them to the report and is unchanged. The PDF report itself exceeds the fetch size limit and was not
opened. The comment `(secondary)` on `FRONTIER.fia` in models.js is out of date (left alone so that no code changed after the final test runs).

### Final test runs (after the last edit to the page's files)
- `node tests/models.cjs`: `PASS: 6614 checks (models pinned, 45 live-sentence templates driven through their branches, copy resolves)`
- `tests/browser.cjs` on port 19042: `PASS: browser smoke test (zh and en at 1280/390/320: overflow, clipped text, 48px targets, unresolved text, nine diagrams, readout tiles; en: no CJK, dates, money; toggle both ways with canvas redraw, keyboard, all eleven chapters' models, reduced motion)`
- `tests/canvas-text-overlap.cjs --sweep physics/modern/why-fusion-is-hard/`: scroll-aware mode in all six runs;
  `PASS: 1718 canvas states across 1 pages × 1280/390/320 × zh/en (with slider/button sweep) have no colliding or clipped text`

### Still open
- Screenshots were looked at in each model's default state; other states rest on the sweep, which does not see text lying on a line.
- From secondary sources only, worded as reported on the page: NIF "about 300 MJ" per shot (LLNL staff via Physics Today / Optica),
  ITER's roughly €5 bn extra cost (Physics World), BEST completion in 2027 (trade press).
- Not re-opened by either reviewer (covered by the builder's finishing pass): Kovari et al. 2018, Abdou et al. 2021, Eich et al. 2013,
  Wurzel & Hsu data points, the NIF shot list, JET / WEST / EAST / W7-X, CFS and Helion statements.
- Contrast and focus rings were not measured beyond what `tests/browser.cjs` covers.
- Not registered: no `page.json`, no provenance label. Scratch files remain in `/tmp/agent-tasks/essays/review2-why-fusion-is-hard/`
  (no delete commands issued). Server on 19042 stopped.
