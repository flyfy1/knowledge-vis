# Review · economics/money/why-one-rate-moves-everything · 2026-11-18

Reviewer: Claude Code (claude-fable-5-2), independent of the builder and of the finishing pass.
**Status: review interrupted by the team lead (token budget) after steps 1–2 of REVIEW-COMMON. No file of
the essay was changed by this review.** Verdict so far: **not ready to register** — the ch4 text change
below is required, and steps 3–7 (English, layout, test extension, diagrams) were not done.

Scratch: `/tmp/agent-tasks/essays/review-why-one-rate-moves-everything/` (`inversion.py`, `inversion.out`,
`text-zh.txt`, `fred/`, `web/`, `pdf/`, `shots/zh-1280/` — screenshots taken but not looked at).

## 1. First read (Chinese, 1280, browser text dump; before BRIEF or code)

1. Ch4 inversion model: the rule in the "how" line is hard to parse, and the page gives one tally (8/8,
   3 false alarms) without saying that a stricter, equally natural rule gives 7. See §2.
2. Ch4 says "no recession followed" the 2022–25 inversion as a settled fact. NBER dates peaks 4–12 months
   late, so this needs "as dated so far". The 2020 hit was a pandemic recession; the page does not say so.
3. Ch12 "按这些估计，美国的政策利率并不紧，甚至略偏宽松": conditioned in the next clause, but it uses
   backward-looking core PCE as the inflation term; reads close to a judgement on a money topic. Soften.
4. Ch5 ladder diagram label "2026 年 10月的月均值" has a spacing glitch (date formatter output inside a
   label). Ch9 default path shows −1.31 %/yr while the sentence says the differential "mostly stays with
   you" (200-path mean +3.58 %): confusing default seed.
5. Recession "start" months are FRED USREC first months (NBER peak + 1 month: 1990-08, 2008-01); the page
   does not say so. Footer says r* data "2026 年 8 月 26 日"; the NY Fed page lists releases on 27/28 Aug.

The argument holds its thread; ch1→2→4→5 ladder is clear; each model's tuned parameters are named.

## 2. The inversion record (decided first)

Data: fresh FRED GS10, TB3MS, USREC (downloaded by me 2026-11-18). `data.js` `spread.s` equals
round(GS10 − BEY(TB3MS), 2) for all 802 months 1960-01…2026-10 and `rec` equals USREC: **0 differences**.

**Bond-equivalent conversion: confirmed at the primary source.** Estrella & Trubin (2006), "The Yield Curve
as a Leading Indicator: Some Practical Issues", FRBNY Current Issues 12(5), PDF opened and text extracted:
footnote 4 gives `bond-equivalent = 100*(365*discount/100)/(360 − 91*discount/100)`, identical to `M.bey`;
the preferred spread is the monthly average 10-year constant maturity minus 3-month secondary-market bill on
a bond-equivalent basis.

**Published convention for a signal.** Same paper: a signal is a negative *monthly average*; "all six NBER
recessions since 1968 have been preceded by at least three negative monthly average observations in the
twelve months before the start of the recession"; "there have been no false signals over this period"
(1968–2005). No minimum duration or depth ("an inversion—even a slight one"). No explicit horizon for a
false signal; the sample starts in January 1968 and so leaves out 1966. The NY Fed model itself is a probit
for recession 12 months ahead, not a binary rule.

**Exact rules and tallies at 12 months** (8 scored recessions: first months 1970-01, 1973-12, 1980-02,
1981-08, 1990-08, 2001-04, 2008-01, 2020-03; 1960-05 has no full look-back):

| Rule | Called | False alarms |
|---|---|---|
| Old page rule: raw discount quote; false alarm if no recession starts within 12 months of the episode's *first* month; merge < 6 months | 7/8 (misses 1990-08) | 4: 1966-09, 1978-12, 2006-08, 2022-11 |
| New page rule (shipped): BEY; false alarm if no recession starts from first inverted month to 12 months after the *last*; merge ≤ 6 months | 8/8 | 3: 1966-01 (one month, −0.10), 1966-09…1967-02, 2022-11…2025-04 |
| BEY with the old start-based rule (strictest) | 8/8 | 7: the three above plus 1968-12, 1978-11, 1989-06, 2006-08 (recessions came 13–17 months after the first inverted month) |
| Published convention (Estrella–Trubin: BEY, monthly average, any negative month, no merge, inversions wholly inside a recession not counted), from 1968 | 8/8, each with ≥ 3 negative months in the look-back (10, 6, 12, 10, 3, 7, 5, 5) | 2 episodes, both the recent one: 2022-11…2024-11 and 2025-03…04; **0 in 1968–2005, as the paper states**; from 1960 add the two 1966 episodes |

Lead 6: 6/8 (misses 1990-08, 2008-01), 5 false alarms under the shipped rule. Lead 24: 8/8, 2 (both 1966),
2022–25 still open. These match BRIEF.md and the page.

**Finding.** The BEY change is standard and correct, and it alone moves 7/8 → 8/8 (the 1989 inversion, min
−0.16, vanishes on the discount quote). The end-of-episode rule is not a published definition, but it is the
only reading under which the published statement "no false signals 1968–2005" is reproduced; the start-based
rule contradicts it four times. Keeping the shipped rule is therefore defensible, **but the page must give
the stricter count beside it**. Required edit, NOT yet made (zh + en `ch4.p4`, `ch4.limit`, `ch12.k2`,
optionally the live sentence):
- state both: 3 false alarms under the end-of-episode rule, 7 if the 12 months are counted from the first
  inverted month; say the tally depends on the rule;
- cite Estrella & Trubin (2006) for the convention and note their sample starts in 1968, after 1966;
- 2022–25: negative Nov 2022–Nov 2024 (min −1.71) and again Mar–Apr 2025; no recession dated by NBER as of
  Nov 2026 (last peak Feb 2020, NBER page opened), and NBER dates peaks months later, so "so far";
- the 2020 recession followed a 2019 inversion but was caused by the pandemic;
- eight events; an empirical regularity, not a law (the page already says small sample);
- pin in `tests/models.cjs`: the 7 (start-based), the ≥ 3-negative-month counts, 0 false alarms 1968–2005.

## 3. Re-derivations (independent Python, not using models.js) — all agree with the page

PV 55.2 / 23.1; 1,960.0; 13.3 / 17.6 yr; −11.8 / −15.4 %; −0.96 / −25.2 %. Bonds −1.92 / −8.59 / −20.06;
D_mac 23.31, D_mod 22.96 and C 638.6 (also by numerical derivative); −19.77; diagram 1.97→1.30, 65.3.
Bootstrap 2023-06-30: spot 5.40 / 4.86 / 4.46 / 3.76, forwards 4.32 / 3.68 / 3.24, DF10 0.6915; forwards
compound to spot. EH 3.96 / 4.01 / +0.05, expectations part 3.21 (closed form = numerical integral). Taylor
(Taylor 1993 coefficients, core PCE y/y, CBO gap): 6.42 / 5.42 / 6.07 vs 3.67; MAE 1.19; min −1.93 2020Q2;
max +9.73 2022Q1. NK (solved by hand as a 2×2 system): 0.38 / 0.73 / 1.28 / 0.70; 0.11 / 0.21; 0 / 0;
−1.27 / 2.36; −2.15 / 0.67; 0.17 / 0.52 / 1.73. DDM 21.4 / 25.5 (6000-year explicit sum), −16.7 / −19.8;
30y par bond 20.19. Loan 237,189 / 150,308 / −36.6 %; −44.0 %. CIP 6.80, −2.86 %. FG/QE 3.36 / 2.77 / 2.24.
Debt 190.0 / 279.2 / 131.3. Debt equation against CBO: starting at 100.6, r = net interest ÷ debt
(3.3 → 3.8 %), g 3.9 %, primary deficit 2.6 → 2.1 gives 120.5 in 2036 (CBO 120.2): consistent.
Not re-derived: Poole 60-day statistics, carry-trade paths, the floor-system prose.

## 4. Facts opened by me (2026-11-18)

- Fed implementation note 2026-09-16 (federalreserve.gov): 3¾–4, IORB 3.90, ON RRP 3.75, SRF 4.0, primary
  credit 4.0, effective 17 Sep, bill purchases. Statement 2026-10-28: hold, 10–2, Cook and Hammack. OK.
- CBO 62105 and 62809: cbo.gov still 403; read via Wayback (snapshots 20261115172746, 20261011210551):
  101 → 120 %, primary deficit 2.6 %, 2031 110 % with 101–118 %, 100.6 → 120.2, 124.4 (+50 bp), 133.1
  (+150 bp). OK. Not checked: that the October report was "at the request of Congress".
- ECB 2026-09-10 decision: DFR 2.50 % from 16 Sep; 3.0 / 2.5 / 2.1; no reinvestment. OK.
- BoE Nov 2026: 4 %, 8–1, published 5 Nov, CPI 3.5 % Sep. OK.
- Eurostat API `prc_hicp_minr`: EA Oct 2026 = 4.0 flagged "e" (updated 4 Nov); final not yet published.
  The zh page labels it 初值; the English label was not checked.
- FDIC speech: $620 bn, AFS + HTM, Q4 2022. OK. NBER: last peak Feb 2020. OK.
- Secondary only: BoJ 1.25 % (statement URL not found); EP 416–169–22 (reprints of the EP release);
  Treasury 70.67 months (CME). r* values and PBoC, EO 14178, QT status: not re-opened by me.
- Papers (Glaeser; Fonseca–Liu; Laubach; Schorfheide; Hazell et al.; Benigno–Eggertsson;
  Bernanke–Blanchard): not opened; the page's wording matches what I recall of their abstracts only.

## 5. Tests run

`node tests/models.cjs` → `PASS: 711 model, data and prose checks`. copy.zh.js / copy.en.js: 579 keys each,
identical sets. Browser test and canvas sweep: **not run**.

## 6. NOT done (everything below is still open)

- The ch4 edit in §2 and its test pins; softening ch12 "略偏宽松"; the smaller first-read items.
- `tools/` generator for data.js (only the spread was reproduced, by `inversion.py` in scratch).
- English read-through; date formatter (`ch12.date.ymd/ym`, `ch4.unit.ym` still give "2026-9-16",
  "1966-1"); `ch4.unit.count`; 元/人民币; number formats.
- Any screenshot at any width in either language; all eight diagrams; layout at 390/320; keyboard, focus,
  reduced motion.
- The Playwright click race in tests/browser.cjs; the English extension of that test; the canvas sweep.
- BRIEF.md reviewer line beyond the short note added today.
