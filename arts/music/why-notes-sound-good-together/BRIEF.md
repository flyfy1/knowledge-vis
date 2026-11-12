# BRIEF · why-notes-sound-good-together 为什么有些音放在一起好听

- Built-By: Claude Code (claude-opus-5-5), essay batch 3, 2026-11-11
- Verified-By: self-check (node model test, browser test incl. sound, canvas sweep, screenshots at 1280/390/320 and reduced motion); independent review pending
- Proposed category `arts` (艺术 / Arts), subtopic `music` (音乐 / Music), stage `senior`. This is a deliberate widening: the site had no arts/music category; the nearest homes were `physics/waves` (acoustics) and `math/applied/music-theory` (a short step page on interval names, scale degrees and cadences, which does not touch consonance, tuning or the number twelve). Registration needs the new category, subtopic and an `arts/index.html` redirect.
- Format: long interactive essay in the style of `demos/scarcity-moves` (see `/tmp/agent-tasks/standard/STANDARD.md`, `specs/essays.md`). No provenance label yet, no `lesson-shell.js`.
- Files: `index.html`, `copy.zh.js` (all visible text; English to be translated), `models.js` (pure models + the live-sentence branch choosers, UMD), `app.js` (wiring, drawing, Web Audio, i18n, on-screen gating), `REGISTRY.json`, `tests/models.cjs`, `tests/browser.cjs` (env `ESSAY_BASE_URL`, optional `SHOT_DIR`).

## The one question

Why do some notes sound good together, and why does a piano have twelve keys to the octave?

Answer built by the essay: a note is a comb of harmonics (ch1); simple ratios make combs coincide (ch2); near-misses beat and turn rough (ch3); summing roughness over all partial pairs makes the simple ratios appear as dips (ch4), and the dips move when the spectrum changes (ch5), so "consonance" in this sense belongs to the spectrum. Building a scale from that smoothest interval, the fifth, does not close (ch6); twelve equal steps is the smallest division that gets the fifth nearly right (ch7); the price is audible in the thirds (ch8). Ch9 states what the physical account does not explain (preference, culture, other tuning systems); ch10 gives three questions and three ear experiments.

## Changes from the planning list

- Kept the planned order. The planned "beats and roughness" chapter was split into ch3 (two pure tones) and ch4 (the summed dissonance curve) so that the reader first owns the Plomp–Levelt curve and then sees it summed; the inharmonic-timbre experiment became its own ch5 because it is the evidence for the chapter's claim and needed its own controls.
- Ch6 added the three-gap observation (two step sizes exactly at 2, 3, 5, 7, 12 notes) because it ties the pentatonic/diatonic/chromatic sizes to ch7's record list without being told.
- Ch7 shows that 12 × (12-TET fifth error) = −comma, tying ch6 and ch7.
- Ch8 compares three systems (12-TET, 5-limit just in C, Pythagorean in C) across all twelve keys, since "every key equally out of tune" is only visible against a system where it is not true.
- The ending (ch10) is three questions and three ear experiments, not a recap.

## Chapters

Each: law · everyday case · model · what the reader discovers · limits.

1. **一个音，其实是一叠音** (`#ch1`). Case: a plucked guitar string. Model: ideal plucked string, harmonic n ∝ sin(nπβ)/n² (Fourier series of the triangular initial shape); f0 = C3 = 130.81 Hz; reader controls harmonic count 1–16, pluck point p/24 (p = 1..12), drop the fundamental. Repetition rate = f0 · gcd(sounding harmonic numbers). Discover: pitch (period 7.64 ms) unchanged as harmonics are added or the fundamental removed; pluck at 1/6 silences 6, 12; at 1/2 all even; only when every remaining harmonic shares a factor (e.g. only the 2nd left) does the period change. Links: standing-wave step 3, Fourier step 5. Limits: stiffness, body resonance.
2. **简单的比，共用的泛音** (`#ch2`). Case: octave singing. Model: two combs of 10 harmonics (amplitude 0.88ⁿ⁻¹) at C4 and C4·p/q·2^(detune/1200); exact coincidences = ⌊10/max(p,q)⌋ (also brute-forced). "Interfering pair" (red) = a non-coinciding pair whose Plomp–Levelt roughness exceeds 25 % of the pure-tone maximum (a display threshold I chose). Discover: 5/3/2/2/1/0/0 shared pairs for 2:1, 3:2, 4:3, 5:4, 6:5, 16:15, 45:32; detuning splits each coincidence into a beating pair at |q·f2 − p·f1|.
3. **拍和粗糙** (`#ch3`). Model: beats (envelope |2cos(πΔt)|) and Plomp–Levelt roughness in Sethares' parameterisation d = min(a1,a2)·5·(e^(−3.51·s·Δ) − e^(−5.75·s·Δ)), s = 0.24/(0.0207·f + 18.96); closed-form peak Δ* = ln(5.75/3.51)/(5.75 − 3.51) · (0.0207 f + 18.96)/0.24. Reader: base 110–880 Hz (semitone steps), Δ 0–100 Hz. Discover: peak at 25.8 Hz (99 cents) at 440, 19.5 Hz (283 cents) at 110, 34.1 Hz (66 cents) at 880: the same interval is rougher low. Limits: averaged ratings; constants fitted by Sethares, not physiological.
4. **把粗糙加起来** (`#ch4`). Model: Sethares' dissonance measure: sum over all pairs of partials of two tones with N harmonics (amplitude 0.88ⁿ⁻¹), lower tone C4; dips found as local minima with ≥ 0.4 % prominence (relative to the curve's range) and refined by golden-section search; a dip is labelled p/q when within 1 cent of a ratio with q ≤ 9. Reader: N 1–10, interval 0–1250 cents, prev/next-dip buttons. Discover: N = 6 → dips at 6/5, 5/4, 4/3, 3/2, 5/3, 2/1 plus a shallow one at 967 cents (1.4 cents from 7/4); deepest at 2/1 and 3/2; N = 1 → no dips, < 5 % of peak from 720 cents; N = 2 → a shallow dip at 688 cents and the octave; 9:8 first appears at N = 9; 16:15 never within N ≤ 10; 702 → 690 cents raises roughness 0.60 → 1.11.
5. **换一种音色，低谷就搬家** (`#ch5`). Same model and formula as ch4 with other spectra: stretched partials f_n = f·A^(log₂ n) (Sethares' stretched spectra), and an ideal free–free uniform bar (roots of cos x·cosh x = 1, ratios 1 : 2.76 : 5.40 : 8.93 : 13.34 : 18.64). Reader: timbre, stretch A 1.85–2.15. Discover: the octave dip sits exactly at cents(A) over the whole slider (pinned per step); at A = 2.1 the dip is at 1284 cents and pure 2:1 is 36.6 × as rough as the new dip; the bar has no dip at 2:1.
6. **一个五度接一个五度** (`#ch6`). Model: Pythagorean chain k·log₂(3/2) mod 1, k = 1..12; comma = 1200·log₂(3¹²/2¹⁹) = 23.46 cents. Discover: two step sizes only at 2, 3, 5, 7, 12 notes (294.13/203.91; 203.91/90.22; 113.69/90.22), never more than three (three-gap theorem); the 13th note lands 23.46 cents past C.
7. **为什么偏偏是十二** (`#ch7`). Model: continued fraction of log₂(3/2) = [0; 1, 1, 2, 2, 3, 1, 5, 2, 23, …], convergents 1/2, 3/5, 7/12, 24/41, 31/53; best k/N for 3/2 and 5/4 with errors in cents; record holders 1, 2, 3, 5, 7, 12, 29, 41, 53. Reader: N 5–60; A/B playback N-ET then just. Discover: 12 → −1.96 / +13.69; 12 × −1.955 = −23.46 (the comma); 19 → −7.22 / −7.37; 31 → −5.18 / +0.78; 53 → −0.07 / −1.41; no N ≤ 30 gets both within 5 cents.
8. **平均律** (`#ch8`). Model: 12-TET, 5-limit just in C (1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 9/5, 15/8), Pythagorean in C (chain A♭…C♯); major-triad errors per key; beat rates |4·f3 − 5·f1| and |2·f5 − 3·f1| for ideal harmonic tones. Discover: ET every key +13.69 / −1.96; C4 third beats 10.4/s, C3 5.2/s, C4 fifth 0.89/s (C3 0.44/s); just D and B♭ wolf (−21.51), E/A/B thirds +41.06; Pythagorean C♯ wolf (−23.46), E/F♯/B thirds −1.95. A DOM table lists ET − just for all twelve intervals.
9. **这套解释能走多远** (`#ch9`). No model. Confidence-tagged claims (see sources).
10. **自己去听** (`#ch10`). Three questions, three ear experiments (beats on a guitar, counting beats on a piano with the model's 5.2/s and 0.44/s marked as model values, low-register muddiness), summary, related pages.

Model reuse by name: ch4 uses ch3's curve; ch5 is ch4's model with another spectrum; ch7 reuses ch6's comma; ch8 reuses ch3's beats and ch2's coinciding partials.

## Sound

- Web Audio, sine oscillators only (additive synthesis), one shared `AudioContext` created inside the first play-button click handler (never on load, scroll or slider moves, never while muted). One demo plays at a time. A fixed control (bottom right) has a mute toggle and, above 480 px wide, a volume slider; on phones the volume slider is hidden (hardware volume) and only the mute button shows.
- Every audio demo has a visual twin that runs with sound off: spectra and waveforms (ch1), combs (ch2), the beating envelope with a moving playhead (ch3), the curve and cursor (ch4–5), the circle lighting the sounding note (ch6, `data-now`), the "now playing: N-ET / just" readout (ch7), the beat-envelope plot with playhead (ch8). Under reduced motion the playheads do not move.
- `window.__audioState()` is a read-only test hook.

## Real-world facts and sources (each opened 2026-11-11)

| Claim on the page | Source opened |
| --- | --- |
| Roughness formula and constants (d* 0.24, s1 0.0207, s2 18.96, b1 3.51, b2 5.75, C 5, min amplitude) | W. A. Sethares, "dissmeasure" code page, sethares.engr.wisc.edu/comprog.html |
| Plomp & Levelt 1965: consonance of simple-tone intervals tracks critical bandwidth; Helmholtz's beating account | Plomp R, Levelt WJM, *J Acoust Soc Am* 1965;38:548–560, abstract on mpi.nl publication page |
| "almost any interval can be made consonant or dissonant by proper choice of timbre"; gamelan spectra related to gamelan scales (presented on the page as Sethares' argument, not settled) | Sethares, *Tuning, Timbre, Spectrum, Scale* book page, sethares.engr.wisc.edu/ttss.html |
| Missing fundamental: pitch unchanged when F0 energy removed; pitch = correlate of periodicity | Oxenham AJ, Pitch perception, *J Neurosci* 2012;32:13335 (PMC3481156, full text) |
| Consonance preference correlates with harmonicity preference, not beat aversion; musical experience | McDermott, Lehr, Oxenham, *Curr Biol* 2010;20:1035 (PMC2885564) |
| Tsimane' rate consonant and dissonant chords equally pleasant; Western-like responses to roughness and discrimination; Bolivian towns weaker preference than US; authors attribute preference to exposure | McDermott, Schultz, Undurraga, Godoy, *Nature* 2016;535:547, abstract (carta.anthropogeny.org and RePEc records) |
| Fusion of simple-ratio intervals in Tsimane' and US listeners (octave > fifth, fourth > third); fusion does not predict pleasantness | McPherson et al., *Nat Commun* 2020;11:2786 (PMC7270137) |
| Zhu Zaiyu: numerical specification of 12-TET 1584; Stevin c. 1605; priority disputed | Wikipedia "Equal temperament" (and search summary of "Twelfth root of two") |
| 三分损益法 first in 《管子·地员》, ×2/3 and ×4/3; same family as Pythagorean "五度相生律" | zh.wikipedia "三分损益法" |
| Slendro: five roughly equal pitches; tuning varies between gamelan sets | Wikipedia "Slendro" |
| Arabic maqam: neutral seconds; 24-tone system a notational convention | Wikipedia "Arabic maqam" |
| A4 = 440 Hz (ISO 16, 1975) | Wikipedia "A440 (pitch standard)" (ISO page itself returned 403) |

Everything else with a number is the page's own model output (cents, ratios, beat rates, counts), recomputed by `tests/models.cjs`.

## Tuned rather than sourced

- Harmonic amplitudes 0.88ⁿ⁻¹; 6 partials by default; lower tone C4 for ch2/4/5/7/8, C3 for ch1.
- The 25 % threshold for "interfering pair" in ch2; dip prominence threshold 0.4 % and the 1-cent labelling tolerance in ch4–5.
- Synthesis gains, envelopes and durations.

## Checked / not checked

Checked: `node tests/models.cjs` (11,700 checks: every prose number recomputed, every live-sentence branch walked over each control's full range, an allow-list of every number in the chapter prose); `tests/browser.cjs` (zh at 1280/390/320, sound gating/mute/volume, muted visual twins, keyboard, toggle without `copy.en.js`, all eight models at extremes, reduced motion); canvas sweep; screenshots at 1280/390/320.

Not checked: how the synthesised sounds actually sound on real speakers (headless runs only; no human listening test); the English copy (not written); the beat rates on a real piano (stated on the page as model values); the full text of Plomp & Levelt 1965 and of McDermott 2016 (abstracts only).
