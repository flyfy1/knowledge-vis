# BRIEF · how-vaccines-work 疫苗是怎么保护人的

- Built-By: Claude Code (claude-opus-5-5), essay batch 2026-11-11
- Verified-By: self-check by the builder (node model test, browser test, canvas text sweep, screenshots at 1280/390/320 and reduced motion, read-through in the browser); independent review by Claude Code (claude-opus-5-5), 2026-11-11: science and statistics of every chapter, sources spot-checked, English copy and English layout, tests extended (see "Review 2026-11-11" below)
- category `biology`, subtopic `body` (身体与药 / Body & Medicine), stage `senior`
- Format: one long interactive essay modelled on `biology/body/body-in-balance/` (see `/tmp/agent-tasks/standard/STANDARD.md`). Not registered and not labelled yet; registration and the provenance label are a later step.
- Files: `index.html` (markup + styles), `copy.zh.js` (all visible text, canvas labels and aria-labels), `models.js` (pure models, UMD, `window.VaxModels`), `app.js` (wiring, drawing, i18n, IntersectionObserver gating), `tests/models.cjs`, `tests/browser.cjs`, `REGISTRY.json`. There is no `copy.en.js` yet: it is loaded with `onerror`, every key falls back to zh, and the code is language-aware (numbers via `toLocaleString`, large numbers as `m × 10ⁿ` through the copy key `fmt.sci`, no Chinese or 万/亿/成 in code). The model test checks en key parity as soon as `copy.en.js` exists; the browser test then also runs en at all three widths and checks no Chinese is visible.

## The one question

A vaccine contains nothing that kills the virus and does not stay in the body. How does it protect you, and how does it protect people around you who cannot be vaccinated?

Answer the essay builds: in one body, a vaccine is a safe first fight that leaves memory cells, so the next response starts high (ch1–2); antibodies block at the door and fade, memory chases from inside and lasts (ch3). In a population, efficacy is a ratio of two risks (ch4); a high coverage makes most cases vaccinated without the vaccine failing (ch5); coverage above (1 − 1/R₀) ÷ E stops spread and protects the unvaccinated (ch6); waning means the threshold must be held, not crossed once (ch7). Ch8 turns this into three questions to ask of any vaccine number.

## Chapters

Each: law · case · model · limits. All immune numbers are relative and illustrative; nothing is fitted to a specific disease or vaccine.

1. **和病毒赛跑 / The race** (`#ch1`). Law: exponential virus vs late, low-start exponential B-cell expansion. Model: ODE (Euler h = 0.01 d), stimulation `s = min(1, A/(A+K) + V/(V+Kv))`; effector `E' = α s (N0+M) + ρ s E (1 − E/Ecap) − δ(1 − s)E`; memory `M' = φ s E`; long-lived plasma `L' = λ s E − ln2/365 L`; antibody `Ab' = κE + κL L − ln2/21 Ab`; antigen `A' = −ln2/3 A − kA Ab A`; virus `V' = rV(1 − V/Vmax) − kN Ab V − kE E V`. Thresholds: detect 100, symptomatic 10⁵, severe 10⁷. Reader: virus doubling time (9 rates). Limits: no T cells, innate immunity or isotypes.
2. **第二次为什么又快又多 / Why the second time is faster** (`#ch2`). Same ODE, doses as antigen pulses. Reader: one/two doses, gap 4–26 weeks. Discover: memory raises the start; antibody can be undetectable while memory remains. The prose makes no claim about an optimal interval (the model's boost is not monotone in the gap below 8 weeks).
3. **打过疫苗，再碰到病毒 / Meeting the virus again** (`#ch3`). Same ODE after two doses, infection at month 1–24. "Door level" `r/kN`: antibody above it stops growth at once. Reader: months since dose 2, virus speed. Limits: hard threshold, memory does not decay, no age or immunosuppression.
4. **“95% 有效” / What 95% means** (`#ch4`). `VE = 1 − RR`; Katz log-RR 95% interval, Haldane +0.5 correction if a cell is 0; ARR and NNV. Reader: arm size (8 sizes), cases per arm 0–300, "restore the real trial". Limits: log-RR approximation poor with few cases.
5. **病例里多数打过疫苗 / Most cases vaccinated** (`#ch5`). `share = c(1−e)/(c(1−e) + 1 − c)`; crossing `c* = 1/(2 − e)`; attack rate among unvaccinated 10%, N = 100,000. Limits: groups identical except vaccination.
6. **保护身边的人 / Protecting others** (`#ch6`). SIR (RK4, D = 7 d, I₀ = 10⁻⁴) with an all-or-nothing vaccine; final size `π = 1 − exp(−R₀(1 − cE)π)`; `Vc = (1 − 1/R₀)/E`; unreachable when `R₀ > 1/(1 − E)`. Reader: R₀ 1–20, E 50–100%, coverage. Limits: homogeneous mixing, no waning, leaky vs all-or-nothing not shown.
7. **保护会消退 / Waning** (`#ch7`). `p(t) = cE·2^(−(t mod B)/H)`, `Re = R₀(1 − p)`, time back above 1 `= H log₂(cE/(1 − 1/R₀))`; R₀ = 3, E = 95%. Reader: half-life 6–60 months, coverage 50–100%, booster none/6/12/24 months. Limits: one cohort, exponential waning, no births or infection-acquired immunity.
8. **三个问题 / Three questions** (`#ch8`). No model.

## Numbers in the prose (all derived from the models and pinned by `tests/models.cjs`)

ch1: doubling 5.5 h, peak 9.7 × 10⁷ on day 7.8, ~27 doublings, antibody detectable day 8.3, ill 9.2 d, severe 6.7 d; at 16.6 h peak 1.1 × 10⁶ day 15.0, ill 5.1 d. ch2: dose 1 detectable day 7.3, peak 3,804 day 22.7; to 100 cells 8.0 vs 1.2 d; second peak 2.6 × 10⁴ = 6.9×; memory 49 (dose 2 → 416); 26-week gap antibody 79, peak 2.7 × 10⁴; one dose undetectable after 5.4 months. ch3: month 12 antibody 338 vs door 3,000, peak 3.6 × 10⁵ = 1/267, ill 2.0 d, severe 0 vs 6.7 d; month 3 antibody 2,955; at 3.3 h severe 1.9 vs 8.2 d. ch4: 4.4 vs 88.4 per 10,000, RR 5.0%, VE 95.0%, CI 89.9–97.6%, 0.04% / 0.88%, 84 fewer per 10,000, NNV 119; 500 per arm 1 vs 10: 90.0%, CI 22.2–98.7%, 170 vs 11 cases. ch5: 95,000 / 950, 5,000 / 500, 66%, 1.0% vs 10.0%, 10×, crossing 90.9%. ch6: Re 1.48, unvaccinated risk 57%, at 80% 21%, need 83.3%; measles two doses 94.5–97.4%, one dose 98.6% at R₀ 12, unreachable above R₀ 14.3. ch7: Re 0.44, back above 1 at 8.6 months, 82% of four years, 12-monthly booster 3.4 months/yr (28%), 6-monthly kept below 1, 100% coverage 12.3 months.

## Real-world figures and sources (checked 2026-11-11)

| Figure in the page | Source actually checked |
| --- | --- |
| Primary response: ~10 days lag before antibody is detectable, IgM peak ~14 d, IgG peak ~3 weeks; secondary response faster and higher, driven by memory B cells | OpenStax *Microbiology*, §18.4 "B Lymphocytes and Humoral Immunity" (page read). |
| IgG half-life ~21 days (IgG1, IgG2, IgG4; IgG3 shorter) | Vidarsson G, Dekkers G, Rispens T. IgG subclasses and allotypes. *Front Immunol* 2014;5:520, Table 1 (PMC4202688, full text read). |
| Pfizer–BioNTech trial: 8 vs 162 cases, 18,198 vs 18,325 evaluable without prior infection, from 7 days after dose 2; efficacy 95.0% (95% credible interval 90.3–97.6); median ~2 months follow-up; surveillance 2.214 / 2.222 thousand person-years | Polack FP et al. Safety and efficacy of the BNT162b2 mRNA Covid-19 vaccine. *N Engl J Med* 2020;383:2603–15, doi:10.1056/NEJMoa2034577 (full text via Europe PMC, PMC7745181). The page's interval 89.9–97.6 is its own Katz approximation and is labelled as different from the paper's Bayesian interval. |
| Waning: from 1 to 6 months after full vaccination, protection against infection fell 21.0 percentage points (95% CI 13.9–29.8), symptomatic disease 24.9, severe disease 10.0 (6.1–15.4); 81% of severe-disease estimates stayed above 70%; 18 studies, all before Omicron, bias possible | Feikin DR et al. Duration of effectiveness of vaccines against SARS-CoV-2 infection and COVID-19 disease. *Lancet* 2022;399:924–44, doi:10.1016/s0140-6736(22)00152-0 (abstract read). |
| Measles vaccine: one dose ~93%, two doses ~97% effective | CDC, "Measles Vaccination" / "About Measles Vaccine" (cdc.gov, page read). The page says "effective against measles" (illness); the essay now says that using it as efficacy against infection/transmission is an approximation. |
| Measles R₀ commonly cited 12–18; reliable estimates range wider | Guerra FM et al. The basic reproduction number (R₀) of measles: a systematic review. *Lancet Infect Dis* 2017;17:e420–8, doi:10.1016/s1473-3099(17)30307-9 (abstract). Coverage numbers are the page's arithmetic from these ranges. |
| Critical coverage `Vc = (1 − 1/R₀)/E` under homogeneous mixing | Plans-Rubió P. Percentages of vaccination coverage required to establish herd immunity against SARS-CoV-2. *Vaccines* 2022;10(5):736 (PMC9144560; title corrected by the reviewer — the abstract does not print the formula; it is the standard Anderson–May result). |
| Herd immunity and indirect protection: meanings and caveats (heterogeneous mixing) | Fine P, Eames K, Heymann DL. "Herd immunity": a rough guide. *Clin Infect Dis* 2011;52:911–6, doi:10.1093/cid/cir007 (abstract). |

Contested or conditional statements are worded as such in the page: the Feikin result is labelled pre-Omicron with possible bias; the measles R₀ is a range with a note that estimates vary more; the threshold formula is labelled as an order of magnitude under homogeneous mixing; the page says it is not medical advice (hero and ch8).

## First appearance of terms

初次免疫应答 (ch1), B 细胞 (ch1), 抗体 (ch1), IgG (ch1), 记忆细胞 (ch2), 二次免疫应答 (ch2), 亲和力成熟 (ch2 limits), 门槛 (ch3), 随机对照试验 / 安慰剂 (ch4), 效力 / 有效性 (ch4), 绝对风险 (ch4), 接种率 (ch5), 基础比率 (ch5), R₀ / 群体免疫阈值 (ch6), 半衰期 (ch2 for IgG, ch7 for protection).

## Checked / not checked

Checked (2026-11-11):
- `node tests/models.cjs` — PASS: 736 checks. Every number in the prose is recomputed from `models.js` and formatted as the page formats it; placeholders filled, no missing/unused keys, no Chinese and no 万/亿/成 in code.
- `tests/browser.cjs` — PASS in zh at 1280/390/320: no console errors (the copy.en.js 404 is expected), no horizontal overflow, no clipped text, all targets ≥ 48 px, all controls named, live sentences `aria-live=polite`, toggle reads 中 | EN and works without copy.en.js (falls back to zh, stores `en`, no raw keys), keyboard on a slider and a radio group, each model driven once, 42 live-sentence states at control extremes asserted by state key with no `{}`/NaN, reduced motion.
- `tests/canvas-text-overlap.cjs --sweep` — PASS: 1630 canvas states (scroll-aware mode) with no colliding or clipped text.
- Screenshots of every figure at 1280, 390 and 320 (and reduced motion) looked at; every control driven to its extremes and awkward middle values and each live sentence read; whole essay re-read in the browser.
- Cross-links checked to exist: numbers-lie `#c5/#c6/#c7`, body-in-balance `#ch9`, public-health `#step0`, bayes-diagnostics.

Fixed after looking at the page: duplicated `<style>` tag (no CSS); moiré in ch7 shading (now one polygon); ch4 grid canvas too tall at 320 px and day pairs wrapping; one-dose peak day shown as 23 instead of 22.7; ch4 at 300 vs 300 cases said "too few cases" (now "cannot rule out no effect"); ch4 zero vaccine cases with a wide interval claimed certainty (new state); ch5 at 50.3% read "50%" yet called a majority (one decimal near 50%); ch6 with R₀ ≤ 1 credited vaccinated neighbours (new state); ASCII hyphen as minus sign; "流行会烧起来" for a 2% outbreak toned down in the live sentence.

Not checked:
- (Superseded by the review below: English copy now exists and was checked; independent review done.) The immune model's parameters remain hand-tuned for shape, not fitted.
- Polack's person-year figures and the CDC measles page were read on 2026-11-11; sources may since have been updated.
- Not tested on a real phone or with a screen reader.

## Review 2026-11-11 (Claude Code, claude-opus-5-5)

Scope: read in zh at 1280 before the code; every model re-derived independently; five sources opened; English copy read in full and rendered at 1280/390/320; all tests re-run and extended.

Re-derived independently (Python/scipy, `/tmp/agent-tasks/essays/review-how-vaccines-work/py/check.py`): ch4 VE 95.03%, Katz 89.9–97.6, exact conditional 90.0–97.9; Polack's beta(0.700102, 1) prior with posterior beta(8.70, 163) and the surveillance-time ratio 2.214/2.222 gives 90.3–97.6, i.e. exactly the published interval, so the gap is method (Bayesian, person-time) vs Katz on counts. ARR 84.0/10,000, NNV 119.0; mean efficacy follow-up 2,214 person-years / 17,411 at risk = 1.5 months. 500/arm 1 vs 10: 22.2–98.7. ch5 crossing 1/(2−e) gives a share of exactly 0.5 for e = 0.5, 0.9, 0.99. ch6 final size by root-finding: 56.96% (c 70%), 20.6% (c 80%); a separate stiff ODE solve of the SIR gives 56.97%; measles 94.5/97.4/98.6%, max R₀ 14.29. ch7 T = H·log₂(cE/(1 − 1/R₀)): 8.62 and 12.26 months, 82%, 3.38 months (28%). Immune ODE: explicit Euler at h = 0.01 vs h = 0.001 agrees within 2% (dose-1 peak 3,804 vs 3,882; boost ratio 6.93 vs 6.83; memory 49.3 vs 50.3); day counts and the ch1/ch3 figures agree to the displayed digit; the virus never needs the max(0) clamp (smallest one-step ratio 0.86).

Sources opened: OpenStax Microbiology §18.4 (lag ≈10 days, IgM peak ≈14 days, IgG peak ≈3 weeks, secondary lag "a few days", no fold-change given); Feikin 2022 abstract via Europe PMC (18 studies, pre-Omicron, −21.0 / −24.9 / −10.0 points, most severe-disease estimates > 70%); Polack 2020 full text (Table 2 counts, surveillance time, beta-binomial prior, credible interval 90.3–97.6; median 2 months is the safety follow-up); CDC measles vaccine page (93% / 97% "against measles"); Plans-Rubió 2022 metadata (title corrected above).

Changed (prose follows the models; no model output changed): ch2 said a vaccine "does not multiply in your body" — false for live attenuated vaccines; now says so. Hand-tuned parameters now stated in the "how" lines of ch1–3 and the 6.9× / 1.2-day figures labelled as model output; ch2 law no longer says "dozens of times". ch4 names its method (Katz), gives the published 90.3–97.6 and why it differs, says the NNV belongs to the ~1.5-month follow-up and is not a property of the vaccine; zero-cell sentences now report the Haldane-corrected estimate (new `veC` in `trial.analyze`) so the stated estimate lies inside the stated interval. ch6: E must be efficacy against infection/transmission; CDC figures are against illness (approximation flagged); the unreachable case now says the vaccine still lowers both groups' risk (pinned by a test); leaky vs all-or-nothing noted in the limits; "drops to 0" is "in the model". ch7: half-life labelled an assumption; notes that Feikin's severe-disease protection waned much more slowly. ch8: "near the threshold", "partly because". Static zh `<title>`/meta description added (test checks they equal the copy).

English: singular "1 person"/"1 month" (code helpers + new keys `unit.person`, `unit.month`); ch3/ch7 sentences reworded to avoid "1 months"/"in month 8.6"; "1 cases" in the zero-case sentence; no-break spaces inside `m × 10ⁿ` and before day units so tiles don't break mid-number; shortened labels that clipped at 320 (ch4 axis title, ch5 bar label and y title) and that overflowed at 1280 (ch3 speed output, ch7 half-life label); ch5 bar-label width is measured; "first and sixth month" → "month 1 and month 6"; ch7 "logarithmic" sentence clarified. The model test's en number-parity check now compares values (万 and digit grouping normalised) — previously it failed on 12 legitimate translations.

Not checked by the reviewer: real phone or screen reader; the IgG half-life source (Vidarsson) and Guerra measles R₀ beyond the builder's reading. Cross-link anchors re-checked: public-health #step0, body-in-balance #ch9, numbers-lie #c5/#c6/#c7 exist.

