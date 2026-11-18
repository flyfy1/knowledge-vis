# BRIEF · why-we-forget 背过的东西为什么会忘，怎样才记得住

- Built-By: Claude Code (claude-opus-5-5), essay batch 3, 2026-11-11
- Verified-By: self-check (node model/prose test, browser test, canvas text sweep, screenshots at 1280/390/320 and reduced motion); not independently reviewed (pending)
- category `psychology`, subtopic `cognition` (认知 / Cognition, existing), stage `senior`
- Format: one long interactive essay modelled on `biology/body/body-in-balance/`. No `lesson-shell.js`, no provenance label.
- Files: `index.html`, `copy.zh.js` (all visible text), `models.js` (UMD, `window.ForgetModels`), `app.js` (wiring, drawing, i18n, IntersectionObserver gating), `REGISTRY.json`, `tests/models.cjs`, `tests/browser.cjs`. `copy.en.js` is not written; the page loads it if present and falls back to zh key by key. No Chinese in app.js / models.js / index.html except `<title>`, meta description and the 中 button (checked by `tests/models.cjs`).

## The one question

Why does what you studied fade, and what actually makes it last? The essay answers in four parts: the shape of forgetting (ch1–2), spacing and how long the gap should be (ch3–4), what a spacing schedule costs (ch5–6), retrieval and the misleading feeling of fluency (ch7–8), followed by a robustness table (ch9) and three questions (ch10). It does not promise outcomes or recommend a product.

## Chapters (model · standard result · measured or modelled)

1. **遗忘的形状** — two-parameter exponential `A·e^{−kt}` vs power `μ·t^{−a}` (t in s) fitted by least squares to the four savings curves of Murre & Dros 2015 Table 3 (Ebbinghaus 1885, Mack 1991, Seitz 1991, Dros 2015). μ/A solved exactly, shape by log-grid + golden section. Our power fits reproduce Table 5 (Ebbinghaus μ 1.39, a 0.130). Power wins on all four; best-exp SSD / best-power SSD = 1.2 (Dros) to 24 (Ebbinghaus). Data measured; fits are ours.
2. **很多条指数的平均** — gamma mixture of exponentials, mean = `(1 + t/β)^{−α}` exactly (Laplace transform), CV = 1/√α. Illustrative: no fitted parameters; the reader sets mean half-life and CV. Links the FSRS decay 0.1542 to CV ≈ 2.5.
3. **分开比挤在一起好** — ACT-R activation with activation-dependent decay (Pavlik & Anderson 2003, Eq. 1–4; parameters a 0.167, c 0.232, s 0.252, τ −0.669, h 0.031 from their Table 1). Modelled. Default: 4 practices daily vs 30 s apart, test at 7 days → 0.31 vs 0.10; at 5 min 0.76 vs 0.82.
4. **隔多久最好** — Cepeda et al. 2008: tested best gaps 1/11/21/21 d, spline optima 3/8/12/27 d (43/23/17/8 % of RI), gains 10/59/111/77 % (text); fitted surface `A(bt+1)^{−R}`, `A = p + (1−p)e^{−ag}`, `R = 1 + c(ln(g+1) − d)²` (b .011, p .760, a .017, c .092, d 3.453) — the "1 + c" reading reproduces their 350-day optimum of 23.6 d ≈ 7 %. Fig. 3a points digitized by me (±0.02); they reproduce the published gains within 4 points and the tested best at every RI. ACT-R from ch3 run on the same design gives optima at 41–53 % of the RI (does not shrink like the data, as the paper also reports).
5. **越复习，间隔越长** — FSRS-6 with py-fsrs defaults (21 params, w20 = 0.1542): `R = (1 + F·t/S)^{−w20}`, interval `S/F·(r^{−1/w20} − 1)` rounded. Modelled. 90 % → reviews on days 2, 13, 59, 222; 97 % → nine reviews.
6. **记得越牢，复习越多** — FSRS-6 Monte Carlo (mulberry32, seed 7), 3 years. Modelled. 20/day, 90 %: ~150/day end of year 1, ~220 end of year 3, 95 % known; 97 %: ~310/day, year-1 total 2.3×, 99 % known.
7. **考自己** — Roediger & Karpicke 2006 Exp. 1 (81/75, 54/68, 42/56 %) and Exp. 2 (5 min 83/78/71, 1 week 40/56/61 %; 14.2 vs 3.4 reads; 52/28/14 % forgotten). Measured; shown as data only. Rowland 2014 g = 0.50 [0.42, 0.58], 61 studies, 159 effects, ≥1 d 0.69, <1 d 0.41.
8. **觉得会了 ≠ 记住了** — R&K Exp. 2 predictions 4.8/4.2/4.0 vs 40/56/61 %; Kornell & Bjork 2008 Exp. 1a .61 vs .35, 78 % better spaced, 78 % judged massed as good or better; combined 85 % / 83 %. Measured.
9. **可靠程度表** — eight findings with evidence, effect-size range and a confidence tag (很有把握 / 较有把握 / 一半一半 / 只当示意). Donoghue & Hattie 2021 Table 1: distributed practice d 0.85 (150 effects), practice testing 0.74, rereading 0.47.
10. **三个问题** — no model.

## Sources

| Source | Read | Used for |
|---|---|---|
| Murre & Dros 2015, PLoS ONE 10: e0120644 | full text (Europe PMC) | Table 3 data, Table 5 fits, AIC 1.5, the "boost" at 1–2 days, serial-position averaging |
| Ebbinghaus 1885; Heller, Mack & Seitz 1991 | via Murre & Dros only | data columns |
| Pavlik & Anderson 2003, ICCM 177–182 | full text | ACT-R equations and parameters |
| Pavlik & Anderson 2005, Cognitive Science 29 | **abstract only** | cited, no numbers taken |
| Cepeda et al. 2006, Psych. Bulletin 132 | **abstract only** | 184 articles / 317 experiments / 839 comparisons |
| Cepeda et al. 2008, Psych. Science 19 | full text | all ch4 numbers, surface, Fig. 3a points, "too short costs more" |
| FSRS-6: awesome-fsrs wiki "The Algorithm"; py-fsrs source | full text / code | ch5–6 model and defaults |
| Woźniak, Gorzelańczyk & Murakowski 1995 | **abstract only** | "two components of long-term memory" |
| Roediger & Karpicke 2006, Psych. Science 17 | full text | ch7–8 data |
| Kornell & Bjork 2008, Psych. Science 19 | full text | ch8 data |
| Rowland 2014, Psych. Bulletin 140 | full text | ch7 meta-analysis |
| Yang et al. 2021, Psych. Bulletin 147 | **abstract only** | 222 studies, 48,478 students, g ≈ 0.50 |
| Karpicke, Butler & Roediger 2009, Memory 17 | **abstract only** | 177 students, rereading common |
| Verkoeijen & Bouwmeester 2014, Front. Psychol. 5 | **abstract only** | replication of K&B Exp. 2 |
| Donoghue & Hattie 2021, Front. Educ. 6: 581216 | full text (Table 1) | d values and effect counts |
| Dunlosky et al. 2013, PSPI 14 | **abstract only** + Donoghue & Hattie's account | high/low utility ratings |

Removed during writing because I could not verify them: learning styles, "10 % of the brain", a Bjork storage/retrieval-strength claim, Adesope et al. 2017 g = 0.61.

## Tuned or assumed (not sourced) — labelled on the page

- ch2: half-life and CV are reader controls, not estimates.
- ch3: one practice = one encoding; "massed" = 30 s apart; the 5-minute test point; the h-scaling applied to every interval ≥ 1 hour (the model's session simplification).
- ch4 ACT-R overlay: Cepeda's design encoded as 3 encodings 20 s apart in session 1 and 2 in session 2 (my choice).
- ch5–6: Good/Again only, no same-day steps, no fuzz; first rating Good; cards never retire; seed 7; reviews of a lapse treated per FSRS forget-stability. The defaults' training data were not checked.
- Fig. 3a points are my digitization.

## Tests

- `node psychology/cognition/why-we-forget/tests/models.cjs` — every prose number recomputed from models.js or the transcribed data and found in copy.zh.js; power fits vs Table 5; digitized points vs published gains and tested best; surface optimum 23.6 d; "too short costs more" checked on the surface and the points; every live-sentence branch reached by sweeping the controls (27 templates) with placeholders filled and its claim checked; CJK check on code files.
- `ESSAY_BASE_URL=http://127.0.0.1:18967 NODE_PATH=~/Documents/integ-life/integ-games/node_modules node psychology/cognition/why-we-forget/tests/browser.cjs` — zh at 1280/390/320, a stand-in English copy (served as copy.en.js) to catch Chinese coming from code and test layout with other text, the real toggle without copy.en.js, on-screen drawing, keyboard and focus ring, every figure's key numbers, reduced motion.
- `CANVAS_BASE_URL=http://127.0.0.1:18967 node tests/canvas-text-overlap.cjs --sweep psychology/cognition/why-we-forget/`

## Not checked

English copy (not written). The papers marked abstract-only above. Whether FSRS defaults generalize to any one learner. No independent review yet.
