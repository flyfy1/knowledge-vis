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

## Completion pass (2026-11-18, second reviewer)

Reviewer: Claude Code (claude-fable-5-2), a separate session from the first reviewer. Scope: the remainder listed under "Not done / not checked". The first reviewer's verified facts and re-derivations were not redone. Verdict: **ready to register**.

### Fixed

| Where | Problem | Fix |
|---|---|---|
| Diagram `mz` (en, all widths) | "Lower" ran into "Beam splitter"; "Detector 0" crowded the second splitter label | "Lower" moved above the lower path; "Detector 0" right-aligned under its detector; narrow drawing shifted 8 units left so "Detector 1" clears the edge |
| Diagram `chsh` (en, 390/320) | a / b under "No communication"; "Gets x, answers a" wider than its box | narrow layout puts a and b lower on their arrows; English "Gets x, sends a" / "Gets y, sends b" |
| Diagram `shor` (en) | third card: the two sentences overlapped | `wrapOne()` wraps the first while drawing and the second is placed under its last line (both layouts, both languages) |
| Diagram `noise` (en, 390/320) | count sentence ran out of the drawing; "Black box" touched the H labels | a diagram's `draw()` may return a taller height (viewBox grows with the sentence); narrow layout puts the oracle label on its own line |
| Diagram `gap` (en, 390/320) | 2025 and 2026 rows overlapped (two-line labels 0.3 decade apart) | English labels are "2025: RSA-2048, surface code" etc.; the caption already says purple = estimates |
| Slider rows, en 1280: `mzPk`, `coRc`, `fxLam` | label ran under the slider and the next label (not caught by any test) | label may wrap (`flex:0 1 auto`); English labels shortened ("Classical checks per second", "Quantum calls per second", value "10⁹/s", "Λ (suppression factor)"). New check in `tests/browser.cjs`: in every slider row the label, slider and value must not overlap, leave the row, or spill out of a squeezed box. It failed on these three before the fix |
| Slider rows ≤ 420 px | long label pushed the value to a line of its own on the left | label is capped at row width minus the value; a long value (ch5 step name) drops to its own line, right-aligned |
| ch8 canvas (en) | "1 second" clipped at the left edge to "second" | "1 sec" |
| ch2 canvas (en, 320) | "Amplitude to detector 0/1" overlapped each other and the edges; "Beam splitter H" ran into the lower path's end | "Sent to detector 0/1"; the splitter label goes under the path when the path is shorter than the label |
| ch10 repetition-code canvas (en, 390) | "Correction" ran under qubit 3 | below 520 px the word is drawn above the qubit's name |
| ch10 logical-error canvas (en, 320) | "Without encoding" crossed the dashed line it names | label height follows its width |
| ch4 tile | 1,073,741,824 broke mid-group at 320 | `<wbr>` after each comma (text unchanged) |
| `fr.rsa2025`, `fr.rsa2026` (en) | "1 microseconds per round" | "1-microsecond rounds" |
| `fr.sycamore` | "a team at the Chinese Academy of Sciences": affiliation not shown on the arXiv page | names the authors instead: Pan, Chen and Zhang (both languages) |
| ch8 list, quantum simulation | "general quantum systems (proved by Lloyd in 1996)" is wider than the paper's result | "quantum systems whose interactions are local (shown by Lloyd in 1996)" (both languages) |
| ch12.p2 | "Firefox ... by default" | Firefox 132 release notes say "Added support for a post-quantum key exchange mechanism for TLS 1.3 (mlkem768x25519)"; the sentence now says Chrome uses it by default since 124 and Firefox added support in 132 (both languages) |
| Footer sources | 2.5 days is not in arXiv:1910.09534's abstract ("a matter of days") | footer adds the IBM Research blog "On 'Quantum Supremacy'" (2019), where the figure is, and the Firefox 132 release notes |

### Facts given one targeted look

- IBM "2.5 days": **confirmed** on ibm.com/quantum/blog/on-quantum-supremacy ("can be performed on a classical system in 2.5 days").
- IR 8547, 2030 / 2035: **confirmed** from the final text saved by the first reviewer: "NIST will deprecate quantum-vulnerable public-key cryptography after 2030 and disallow its use under NIST standards and guidelines after 2035"; the table marks ECDSA, EdDSA and RSA "Deprecated after 2030, Disallowed after 2035". The card's wording stands.
- Tang 2018: **confirmed** (arXiv:1807.04271, Ewin Tang, v1 10 July 2018).
- Pan, Chen, Zhang: 512 GPUs, about 15 hours **confirmed** (arXiv:2111.03011 abstract); institution not shown there, so the sentence no longer names one.
- Lloyd 1996: Science returned 403; index listings (Scilit, CiNii) confirm title, volume 273, page 1073 and that the result concerns local quantum systems. Sentence narrowed accordingly.
- Firefox 132: release notes opened; sentence reworded as above.
- Willow spec sheet (T1 68 µs, CZ error 0.33%): PDF downloaded but its text could not be extracted. **Still unconfirmed by a reviewer**; the card attributes both numbers to "Google's spec sheet".
- Nature peer-review file for the Majorana paper: **not opened**; the statement rests on APS Physics and news reports, as BRIEF.md says.

### English read

The whole rendered English page was read once (text dumped from the browser at 1280 after scrolling every model on screen). Apart from the items above nothing was wrong. Left as is: thousands separators are mixed in prose ("1024 options", "2700 CPU core-years", "1457" against "4,900 GPU-days", "22,593").

### Screenshots looked at

All ten diagrams in English at 1280 / 390 / 320; the four redrawn diagrams (mz, chsh, shor, noise) and gap in Chinese at the three widths; all eleven model cards in English at 1280 / 390 / 320; the Chinese cards touched by the CSS change (ch2, ch5, ch8, ch10) at 320 or 390. Keyboard, focus and reduced motion were covered by `tests/browser.cjs` only, not by eye.

### Final test output (after the last edit to the page)

- `node tests/models.cjs`: `PASS: 462 checks (simulator identities, every number in the prose, frontier data placeholders)`
- `tests/browser.cjs`: `PASS: browser smoke test (zh and en at 1280/390/320: overflow, clipped text, 48px targets, no Chinese in English mode; ten static diagrams (role, aria, caption, labels inside, no overlap, ≥ 11 px, wide/narrow layouts); language toggle, all models driven to the numbers the prose quotes, reduced motion)`
- `tests/canvas-text-overlap.cjs --sweep`: `PASS: 2334 canvas states across 1 pages × 1280/390/320 × zh/en (with slider/button sweep) have no colliding or clipped text` (scroll-aware mode in all six runs)
- `copy.zh.js` / `copy.en.js`: 554 keys each, same order.

### Still open

- Willow spec-sheet numbers and the Nature peer-review file: see above.
- Items the first reviewer listed as search-result-only or not opened (Quantinuum October 2026 preprint, June 2026 Matters Arising, RSA-270 forum post) are unchanged and are worded as attributed on the page.
- `page-provenance.json`, `page.json`, registration: not touched (outside this pass).
