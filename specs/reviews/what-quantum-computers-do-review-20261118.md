# Review: computing/quantum/what-quantum-computers-do (2026-11-18)

Reviewer: Claude Code (claude-fable-5-2), independent of the builders. **The review was interrupted by the team lead (token budget) before steps 4, 6 and 7 of REVIEW-COMMON.md were finished.** Verdict so far: **not ready to register**. The content fixes are in; the English layout is unverified and the browser test fails.

## State at stop

- `tests/models.cjs`: `PASS: 462 checks` (was 409).
- `copy.zh.js` / `copy.en.js`: 554 keys each, same order.
- `tests/browser.cjs`: last run (before the final pin edit) printed four failure lines:
  - `FAIL en 1280: diagrams: mz: "Beam splitte" overlaps "Lower" | shor: "Read period " overlaps "Then compute"`
  - `FAIL en 390: diagrams: mz … | chsh: "a" overlaps "No communica" | chsh: "b" overlaps "No communica" | shor … | noise: "3 qubits × (1 " outside the drawing | gap: "2026 estimat" overlaps "2025 estimat"`
  - `FAIL en 320:` the same six.
  - `FAIL ch10 surface d=23, 1057: 21 881`: a stale pin, since changed to 21 / 881, not re-run.
  All Chinese passes and every other English check (no CJK, overflow, targets, dates, errors) produced no failure line in that run.
- Server on 19024 stopped. Nothing committed.

## First-read notes (Chinese, rendered at 1280, before BRIEF or code)

1. ch5's law said the algorithm "让所有输入同时走过同一个函数". On a page whose point is that nothing "tries all answers at once", that wording leans the wrong way. Reworded to one call on a superposition.
2. ch10: "reaching 10⁻¹² needs d = 23" with a readout of "achieved 10⁻¹³" looked off by a step. It was (see errors).
3. ch7's record paragraph was stale and vague ("a team announced … only a company blog").
4. ch9 quotes 47 / 88 / 18% from 200 random runs without saying how noisy such an average is.
5. ch12 "mainstream browsers since 2024" is broader than what can be supported.
Smaller: ch6 law gave N/2 without "on average"; ch11 argument and card structure read well; defaults of every model show the effect.

## Errors found and fixed

| Where | Problem | Fix |
|---|---|---|
| `models.js` `surface.distanceFor` | Floating-point tie: at p = 0.1%, p_L = 10^−(d+3)/2 exactly; 0.1·0.1^11 evaluates to 1.0000000000000006e-12, so d = 21 was rejected. Every power-of-ten target at p = 0.1% was one step too high. | Compare in log10 with 1e-9 margin (`log10pL`). d = 21, 881 qubits. ch10.p3, ch10.p4 (the "a thousand physical qubits cannot make one logical qubit" sentence was false: 881 < 1000), both languages, node and browser pins. |
| ch9 numbers | 88% at p = 0.1% is a +1.2σ sample; exact channel average is 84.4%. | ch9.limit states the sampling error and the exact 48 / 84 / 18%; exact density-matrix calculation added to the node test. |
| ch7.p4 | Records out of date; RSA-896 omitted. | Decision (a) applied, see below. |
| `fr.echoes` | Labelled vendor claim. | Decision (b) applied. |
| `fr.ecc2026` | "Bonneau". | Dan Boneh (arXiv:2603.28846 author list). Added: circuits unpublished, zero-knowledge proof. |
| `fr.majorana` | "editor's note attached to the paper". | Statement is in the public peer-review file; comment is by Henry Legg (news reports). |
| `fr.qlogical` | "no paper". | Press coverage names a company preprint; not opened, said so. |
| ch12.p2 | "mainstream browsers". | Desktop Chrome 124 (Chromium blog 2024-05-23, opened) and Firefox 132 (search result only). |
| ch5.law, ch6.law | See notes 1 and smaller. | Reworded in both languages. |

## Re-derivations (independent scripts in the scratch directory)

Matched the page: Grover 0.99659 / 0.99946 / 0.00023, θ = 7.18°, 93.35°; CHSH 0.853553, S = 2√2, classical 0.75; Shor 0.5 and 0.2295 by direct amplitude sums; GNFS 2.33×10¹¹, 6.3×10¹⁴ core-years, RSA-260 2.57×, RSA-896 6.67×, 2048 vs 896 3.5×10¹⁰; 3p² − 2p³ = 0.028; Λ extrapolation 27 / 63 / 39; crossover 6.17×10¹³, 17.1 h; memory 17.18 GB, 0.563 PB, 18.0 PB, 2.25 PB, 18.4 EB. Mach–Zehnder and Bloch formulas checked by hand against the gate definitions. Noisy Grover, exact: n = 6, 0.5%: 0.4815 at k = 5; 0.1%: 0.8440 at k = 6; dephasing 0.5211; n = 8: 0.1800 at k = 7.

## Facts checked against sources opened today

RSA-896 (saweis.net), RSA-260 (cognition.com, post dated 2026-09-09, 4,900 GPU-days), RSA-250/260/270/896 bits and dates (Wikipedia "RSA numbers"); arXiv:2603.28846; arXiv:2511.03359 (HTML: 2 bytes per amplitude, 16 PiB uncompressed, 48-qubit predecessor); ePrint 2026/2665; arXiv:2011.03494; 1905.09749; 2505.15917; 2602.11457; 2408.13687; 2511.05465 plus Nature publication (search); 2506.20661; 2510.17286; 1704.01127; 2308.07915 and IBM's 2025-06-10 blog; 2503.05693 and D-Wave's reply (search); 2604.15427; Fowler–Gidney Sec. XV, p_L = 0.1(100p)^((d+1)/2) (ar5iv); csrc.nist.gov IR 8547 final (2026-10-27).

## Decisions applied

- (a) ch7.p4 and footer: the three 2026 factorisations with dates, bit lengths, people, tools (Devin, Claude), self-reported compute, no paper or third-party recomputation, RSA-896 as the current largest, RSA-270 not a record, and the sibling page's disclosure sentence. Data in `FRONTIER.rsa260/rsa896/rsa270`.
- (b) Echoes is `demo`: Google's published experiment, no independent replication, classical reproduction or published rebuttal found as of November 2026. One critical preprint (arXiv:2607.07530) surfaced in search; its abstract does not name the experiment, so it is not cited.

## English

Read in full in the copy file. Fixed: `fr.asOf` now "As of {mon} {y}" with month names; "no exponential speedup has been proved" (was "an exponential speedup without proof"); broken sentence in `fr.willow`; "bits" for qubits in diagram labels and live sentences; "phase damping" → "dephasing"; "0.10 times of the threshold"; "5 times" query readouts; smaller wording. Linked page titles match `pages.config.js`.

## Not done / not checked

- English diagram overlaps listed above (mz, chsh, shor, noise, gap) are **unfixed**.
- No browser run after the last edits; screenshots were written to the scratch `shots/` directory but **not looked at**. Layout at 390/320, keyboard, focus, reduced motion, live sentences at extremes in English: not checked.
- `tests/canvas-text-overlap.cjs --sweep`: not run.
- Not confirmed from a primary source: IBM's "2.5 days" (not in the arXiv abstract), Willow spec sheet 68 µs / 0.33% (PDF unreadable), IR 8547's 2030 / 2035 wording and whether "deprecated after 2030" applies only to 112-bit strength, Lloyd 1996, Tang 2018, Firefox 132, Chinese Academy of Sciences attribution, the Nature peer-review file itself.
- `page-provenance.json`, registration: not touched.
