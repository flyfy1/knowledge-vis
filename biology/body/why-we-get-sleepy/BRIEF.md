# BRIEF · why-we-get-sleepy 人为什么到点就困

- Built-By: Claude Code (claude-opus-5-5), essay batch 3, 2026-11-11
- Verified-By: self-check (node model test, browser test in zh at 1280/390/320, canvas sweep, screenshots at all three widths, read-through); independent review pending
- category `biology`, subtopic `body` (身体与药 / Body & Medicine), stage `senior`
- Files: `index.html`, `copy.zh.js` (all visible text; no `copy.en.js` yet, translation is a later step), `models.js` (pure, UMD), `app.js` (wiring, drawing, i18n, IntersectionObserver gating, replay clocks), `REGISTRY.json`, `tests/models.cjs`, `tests/browser.cjs`. No provenance label, no `lesson-shell.js`.

## The one question

Why do you get sleepy at the time you do, and why does jet lag take days? Answer: a sleep pressure S that rises while awake and falls while asleep, crossing thresholds that move with a body clock; the clock runs slightly longer than 24 h and is reset a little each day by light according to a phase-response curve. Everything in ch7–8 is the same closed loop on a different schedule; ch9 models caffeine concentration only.

## Chapters (model · standard result it implements)

1. **Sleep pressure** — Process S, DBB 1984: awake `S → 1` with τw = 18.2 h, asleep `S → 0` with τs = 4.2 h (closed-form exponentials, periodic solution). Reader sets nightly sleep from night 3.
2. **Two-process model** — thresholds H⁺ = 0.60 + aC, H⁻ = 0.17 + aC, a = 0.10, C a 24 h sinusoid (parameters as in Skeldon, Dijk & Derks 2014 Fig. 1). Reader moves the clock and the amplitude; a = 0 gives the non-24 h relaxation cycle.
3. **Late nights, naps, all-nighters** — same model with forced-wake / forced-sleep intervals.
4. **Free-running clock** — Forger, Jewett & Kronauer 1999 oscillator with the St Hilaire et al. 2007 light drive, parameters as tabulated by Papatsimpa et al. 2021 (Sci Rep 11:13709); CBTmin = polar angle −170.7° + 0.97 h. RK4, h = 0.05 h. Dark room vs ordinary day (bed 23–07).
5. **Phase-response curve** — same oscillator, single pulse vs dark reference after 6 days. Compared with Khalsa 2003 (6.7 h) and St Hilaire 2012 (1 h).
6. **Entrainment and chronotype** — closed loop: oscillator sets C(t) = −cos(2π(h since CBTmin − 1.5)/24), two-process thresholds decide sleep, eyes closed = 0 lux.
7. **Jet lag** — closed loop with a forced bed schedule 23–07 local before and after a shift of N zones; east and west drawn together; τ slider.
8. **Social jet lag and night shifts** — closed loop over 12 weeks; office (07:00 alarm Mon–Fri, 300 lux day) or five night shifts (work light, commute light, curtained bed 08–15, ordinary nights at weekends, 1000 lux day).
9. **Caffeine** — one-compartment oral Bateman function, ka = 4 /h, ke = ln2/t½.
10. **Ending** — three questions, four consequences, NSF consensus ranges.

## Numbers pinned by `tests/models.cjs` (all derived from models.js, then looked up in the prose)

12.6 h / 2.9 h half-times; S 0.09–0.62 at 8 h sleep, waking S 0.17 (6 h, settles in 2 nights), 0.30 (4 h); 22:36–6:59, 8.4 h; CBT 7:00 → 2:06–10:29; a = 0 → 18.6 h cycle, locks for a ≥ 0.065, not at 0.06; +4 h → 2:36–9:32, 6.9 h; +12 h → worst at 7:05; all-nighter → 9.3 h (+0.9); nap → onset 0:45; dark free run 0.20 h/day (12 min), 3:39 → 7:27, 3.8 h over 20 cycles; τ 24.6 → 0.60 h/day; PRC max advance 2.3 h at +3, max delay 2.5 h at −2.5, peak-to-trough 4.8 h (1 h pulse 2.2 h; 300 lux 3.0 h, 60–70 % of bright); chronotype 22:27–6:57, CBT 3:30; τ 24.0 → 21:36, 10 000 lux → 21:51, eve 50 → 21:33, eve 300 drifts 15 min/day; jet lag 8 zones E 4.6 / W 7.2 days at τ 24.2, E 7.5 / W 6.2 at τ 24.6; E6 first night 2.8 h asleep; W6 5.5 h over threshold; antidromic at 9 E with 300 lux; social jet lag 0.7 h, 7.5 / 8.7 h, Sunday 0:24, Monday 6.6 h, eve 50 → 0; night shift default day sleep 5.2 h, CBT 4 a.m.-ish, work 300 lux flips; caffeine 72 mg (36 %) at 22:36, 37 / 97 mg at t½ 3 / 7, 48 mg for a noon cup; Tmax 40–60 min. Also: every live-sentence branch is reached by sweeps over the control ranges; every placeholder is supplied; no Chinese outside copy.

## Sources (each opened; what was checked)

| Claim on page | Source | Checked against |
|---|---|---|
| S model, τw 18.2, τs 4.2, H⁺ 0.60, H⁻ 0.17, a 0.10 | Daan, Beersma & Borbély 1984 (Am J Physiol 246:R161, abstract); Skeldon, Dijk & Derks 2014 PLoS ONE 9:e103877 (full text, PMC4118955) | Skeldon Fig. 1 parameter list (equation images downloaded and read) |
| Model's S saturates while chronic restriction keeps degrading performance | Skeldon et al. 2014 discussion | full text |
| Adenosine candidate, not necessary | Blanco-Centurion et al. 2006 J Neurosci | abstract |
| FJK oscillator + St Hilaire light drive parameters, CBTmin relation | Papatsimpa et al. 2021 Sci Rep 11:13709 (PMC8249410) | full text table |
| τ 24.18 h | Czeisler et al. 1999 Science | abstract |
| τ 24.15 ± 0.2 h; women 24.09, men 24.19; <24 h in 35 % of women, 14 % of men | Duffy et al. 2011 PNAS | abstract |
| PRC 6.7 h ~10 000 lux, p-t 5.02 h, delays before / advances after CBTmin, no dead zone | Khalsa et al. 2003 J Physiol | abstract |
| 1 h ~8000 lux, p-t 2.20 h, ~40 % | St Hilaire et al. 2012 J Physiol | abstract |
| 92 min/day westward, 57 min/day eastward; antidromic common ≥ 8 zones east; CBTmin ~3–4.5 h before wake | Eastman & Burgess 2009 Sleep Med Clin (PMC2829880) | full text |
| East/west asymmetry depends on τ and daylength, not just τ > 24 | Diekman & Bose 2018 J Theor Biol 437:261 | abstract |
| Camping advances clock, later types advance more | Wright et al. 2013 Curr Biol | abstract |
| Social jetlag definition | Wittmann et al. 2006 Chronobiol Int | abstract |
| <3 % of permanent night workers fully adjust, <1 in 4 substantially | Folkard 2008 Chronobiol Int | abstract |
| 41 blind participants: 39 % non-entrained, 24 % abnormal phase, 37 % entrained | Flynn-Evans et al. 2014 Sleep | abstract |
| Caffeine Tmax 30–120 min; t½ mean 4–6 h, range 1.5–10 h | Guest et al. 2021 J Int Soc Sports Nutr 18:1 | full text |
| Adenosine-receptor target; oral contraceptives ~double t½; pregnancy longer | Temple et al. 2017 Front Psychiatry 8:80 | full text |
| Smoking speeds, oral contraceptives slow clearance | Grzegorzewski et al. 2022 Front Pharmacol | abstract |
| 400 mg 6 h before bed disrupted sleep | Drake et al. 2013 J Clin Sleep Med | abstract |
| 12 oz brewed coffee 113–247 mg; 400 mg/day for most healthy adults | US FDA "Spilling the Beans" | web page |
| Adults 18–64 7–9 h, 65+ 7–8 h, 14–17 8–10 h | Hirshkowitz et al. 2015 Sleep Health (NSF) | abstract |

## Tuned rather than sourced (disclosed on the page)

- DELTA = 1.5 h: where C's minimum sits relative to the oscillator's CBTmin, chosen so natural wake is 3.5 h after CBTmin (inside the measured 3–4.5 h). Disclosed in ch2.p2 and the footer.
- Caffeine absorption ka = 4 /h, chosen so Tmax falls inside 30–120 min. Disclosed in ch9.model.how.
- All schedules and light levels (1000/150 lux days, bed 23–07, office 300 lux, night-shift work/commute/day lux, 12-week runs). Disclosed in each model.how as "our chosen scenario".

## Deviation from the task brief (stated on the page)

The task asked for east-slower-than-west to come out of the model with τ > 24. With the published FJK parameters at τ = 24.2 and this schedule the model re-entrains **east faster** (8 zones: E 4.6 d, W 7.2 d); east becomes slower only for longer τ (24.6: E 7.5 d, W 6.2 d). The page says so, gives the measured 57/92 min/day as the reference, explains the τ > 24 argument, and cites Diekman & Bose 2018 that the asymmetry depends on τ and daylength. Similarly the model flips a night worker's clock under 300 lux workplace light, which real workers mostly do not; ch8.p4 and ch5.p4 flag the model's dim-light sensitivity.

## Not checked

- Full texts of Khalsa 2003, St Hilaire 2012, Duffy 2011, Czeisler 1999, Diekman & Bose 2018, Folkard 2008, Flynn-Evans 2014, Drake 2013 (abstracts only; publisher pages blocked).
- Model PRC was compared with the measured peak-to-trough and sign pattern, not fitted point by point.
- English layout (no copy.en.js yet); screen readers beyond aria-labels and aria-live.
