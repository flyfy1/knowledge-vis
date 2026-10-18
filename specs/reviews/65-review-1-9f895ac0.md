# Independent review: 65 — Valid Number

Candidate: `619fbe8a4043ff1442a4c0108e02b58d5165b95d`; URL: http://127.0.0.1:18770/leetcode/65/. Review date: 2026-10-18. Reviewer: this independent agent run; exact model identifier unavailable. Target: basic Python reader. Frozen rubric: `specs/leetcode-review-gates.md`, weights 15/20/20/20/15/10. Interpretation frozen before browser: original Python boolean validator; assess syntax, state transitions, actual executable source/cost, both locales and device access. No submission or human-learning claim.

## Cold walkthrough (recorded before source inspection)

Only the frozen rubric was read before opening the actual candidate in Chromium through Playwright. No brief, source, tests, earlier report or author evidence was opened. The visible page was read in section order; page claims below are observations, pending audit.

| Step | Question | Action | Observable result | My causal paraphrase |
|---|---|---|---|---|
| 01 | What is a number spelling, and why is `4.` valid? | Read definition and hand-built `4`, `4.`, `4.e`, `4.e+`, `4.e+2`; inspect baseline disclosure next. | Integer/decimal/exponent and optional signs are defined; decimal requires a digit across either side; exponent requires its own integer digits. Length 1–20/no spaces are explicit. | A dot does not remove the existing digit, but e starts a new digit obligation. `4.e+2` is valid even without a digit after its dot. |
| 02 | Which past facts affect the next character? | Read each guard and invariant, including `1e+` and `99e2.5`. | Three flags and a simulation-only fatal flag are explained; e resets digit; dot is prohibited after e. Baseline copies pieces in O(n) space, scan avoids copies with unchanged O(n) time. | `digit` refers to the current part, not all prior input. A forbidden punctuation position is irreparable, while a missing digit may still be supplied. |
| 03 | What exactly changes per character? | Inspect initial `4.e+2` trace and controls. | Empty consumed prefix, full unprocessed suffix, all flags false, endpoint not yet allowed; ledger initially empty. | Trace position counts consumed characters, not highlighted tokens; retained ledger should show the causal changes. |
| 04 | Which fresh option can end? | Read exercise before selecting/revealing. | Options `-.E2`, `-.7E-2`, `-.7E-` ask for the only valid spelling. | My prediction before reveal: B, because mantissa .7 has a digit and exponent -2 has a digit; A lacks mantissa digits, C lacks exponent digits. |
| 05 | How do flags correspond to Python and cost? | Read mapping text and cost/boundaries; source disclosure remains closed. | e transition is explicitly mapped to guard then exp=True/digit=False; Python returns immediately on violations. Input unchanged; O(n) time/O(1) space; simulation history has separate O(n²) cost. | Immediate return replaces dead; current-part digit at termination is sufficient only because preceding guards preserve legal grammar. |

Fresh independently chosen browser inputs, predictions recorded BEFORE running them: `+.6e-0` should accept. States after +: F/F/F; dot: F/T/F; 6: T/T/F; e: F/T/T; -: F/T/T; 0: T/T/T. Counterexample `+.6e-.0` should reject on the exponent dot with prior flags F/T/T preserved and final 0 unprocessed. This tests the tempting rule that any decimal after a sign is allowed, even in the exponent. Screenshot `cold-desktop.png` captures the initial lesson.

Cold operation results (still before source): Expanded the baseline: split at e, strip a leading sign, require exponent digits, and split mantissa at a single dot; this concretely explains the copied pieces. Consumed all five characters of `4.e+2`: states were T/F/F → T/T/F → F/T/T → F/T/T → T/T/T; endpoint true. Ledger retained each old→new value and differentiated a prefix that may end from a completed scan.

Both fresh browser predictions matched every intermediate flag. `+.6e-0` ended true; `+.6e-.0` stopped at character 6/7, dead=true, prior F/T/T unchanged, suffix `0` unprocessed, next disabled. The dot is an examined/rejected character in the consumed prefix, not a legal state update. This is stronger evidence than merely checking the final boolean. Screenshots: `cold-preset.png`, `cold-fresh.png`, `cold-counterexample.png`.

Selected B, revealed: feedback said correct and explained the two separate digit obligations. Changed selection to C: old feedback disappeared; revealed again: missing exponent digit explained. Causal conclusion: signs never discharge the digit obligation, and changing a prediction invalidates its feedback. This exercise combines sign, leading dot and exponent rules rather than repeating the initial spelling. Cold walkthrough complete and saved before opening repository source or prior reviews.

## Candidate identity and audit method

`git rev-parse HEAD` matched the requested revision. Checkout status before and after review showed only this new report and its evidence directory. No candidate file, test, shared asset, author evidence, service or Git configuration was changed. No agents were spawned. There were no earlier per-65 independent review reports to close; general design documents are not per-candidate acceptance.

After saving the cold walkthrough, inspected `solution.py`, `python-code.js`, `core.js`, `app.js`, `copy.js`, `index.html`, local/shared styles and locale implementation; inspected tests, README, baseline and saved official response before running tests. BRIEF and SELF-CHECK were unnecessary and were not used to fill explanatory gaps.

Fetched the served lesson assets and compared their bytes to this checkout. All matched. SHA-256 identifiers:

| Asset | SHA-256 |
|---|---|
| index.html | 1a93f07e837afcdc8b188b194a1ca22d182577eb48347108bfa1a6ede896c29b |
| app.js | b3ac0953f6d2b623a3aa9ab00be7befc7ee7e98f1917f89092dee0d7b399139c |
| copy.js | 6001229be2e145cc63a878a7bfcf126dd7f8e4e8df12b9278db1341dba67488b |
| core.js | 1afe1d6aaba2b36520b3ea4b81cb2342f420cc1c65e08bd0384b2cdac6f2764f |
| style.css | 5f6b0f7dd6f7274c7d3b0a16ba07a1c590b79e472251aa3c8dceacbbbc8a25eb |
| python-code.js | 8dbe8f0815789607d3d090f1a395b32e67d604752ac1757c56326f207cd7ba01 |
| solution.py | 5c6c2f635b6fdbebfd2de0b7d462ba0e1ed13df7fbeb48af83b7b6ca789170db |
| ../common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |
| ../style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |

## Official semantics, executable code and invariant

Read the normally accessible [official statement](https://leetcode.com/problems/valid-number/) after the cold walk. Its grammar, allowed characters, length bound and examples agree with the lesson. It requires syntax recognition, without numeric conversion or a magnitude bound. Public statement access succeeded; no access restriction was bypassed. The local official response includes the Python3 signature `class Solution: def isNumber(self, s: str) -> bool`, which matches the canonical solution. This is the actual callable, not a conceptual analogy. There is no non-Python language exception or contract to audit. `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py` specifies `solution.py` / `python-code.js` / `PYTHON_SOURCE`, exactly the pair used here. Python is the preferred faithful option; the non-Python supportedLanguages completeness requirement is inapplicable.

Independently executed the actual canonical Python using importlib, not the visual simulation. A separately written grammar recognizer checked all 55,987 strings of lengths 0–6 over `2.E+-x`. All matched with a strict bool result. Explicit fresh cases: `+.6e-0` true, `+.6e-.0` false, `6E+` false, `6E+0` true, `2E2E2` false, `2e-+2` false, `+.` false, twenty zeroes true, `1E` plus eighteen nines true, nineteen ones followed by e false, `-.` plus eighteen zeroes true. Defensive outside-contract checks `1 2`, `NaN`, full-width `１`, and newline followed by 2 returned false. No input change occurred; Python strings are immutable and the code only reads s.

Used Python `sys.settrace` on the actual function for `+.6e-0`: at index 3, before the e guard, locals were digit=true/dot=true/exp=false; line 17 set exp=True, line 18 set digit=False; at the next loop boundary flags were false/true/true. This independently reproduces the visible e transition. At the invalid dot the code tests `dot or exp` before assignment, so false/true/true remains intact at return; the browser's dead flag is clearly labeled simulation-only.

The invariant is sufficient when read together with position i and the preceding input character: all consumed legal characters obey position rules; dot/exp record accepted punctuation; digit records the current part's digits. Three flags alone do not determine sign legality, and the lesson explicitly maps the sign guard to index and previous character. Initially all false. A legal sign does not supply a digit; a legal dot preserves digit; e requires an existing mantissa digit and starts a new obligation; all other letters fail. Rejection cannot be repaired by a suffix, and the loop stops there. Otherwise termination accepts exactly when the current part has a digit. This handles missing digits, repeated separators/signs, and uppercase E without special patches.

Cost claims checked against source: one pass, constant-size flags/index/character, O(n) time and O(1) auxiliary space; no slicing or numeric parsing. The baseline lowercases/splits/copies O(n) text and remains O(n) time/O(n) space. The lesson honestly claims saved storage, not a faster time order. Browser frames are O(n); the cumulative ledger's copied prefixes total O(n²), appropriately separated from submission cost.

## Test-claim audit and observed browser behavior

Inspected test writers first: all three support `OUTPUT_DIR`; Python disables bytecode writes. Ran them with output redirected exclusively to this run's evidence directory. Did not regenerate `leetcode/65/tests/evidence/` or the manifest. Results:

- `test_solution.py`: 46,484 cases passed, including official examples, exhaustive small alphabet, seeded random/generated grammar cases, bounds and exact mirror equality.
- `test_core.cjs`: 44,460 inputs / 142,951 states passed. It checks prefix-completability, digit/current-part and dot/exp invariants, early fatal stop and immutable snapshots against a grammar oracle.
- `browser.cjs`: passed in real Chromium with no console/page/request errors. Results saved as `browser-results.json`; counts are supplemental computational evidence, not a teaching score.

Observed browser checks in both EN and ZH include every frame of all ten presets, forward/back/forward restoration with exact ledger equality, reset to empty ledger, disabled endpoints, slider Home/End/arrows, button Enter/Space, custom inputs and validation retaining the prior trace. All three exercise choices were revealed; changing choice hid feedback; locale changes preserved and translated feedback. Invalid custom inputs included empty, whitespace, 21 characters, underscore, slash and a non-ASCII digit. Missing-digit final states and irreparable violations are visibly distinct.

An additional independent preservation experiment used `+.6e-0` at frame 4, a draft input `2E-3`, B selected/revealed and source disclosure open. Resized through 320, 390 and 1280 pixels, switching both locales at each width. Frame/flags, four ledger rows, draft input, selection, feedback visibility and disclosure remained intact. Switching back to English restored identical ledger text; undo/redo restored exact ledger contents. No author expectation was used as the oracle for this check.

Verified exact canonical/mirror/displayed/copied/downloaded text parity, including final newline. Browser tests read the real permitted clipboard, forced clipboard denial, verified the full manual textarea was focused and selected, downloaded the actual source and compared bytes, and tested recovery after denial. Offline file opening preserved source and interaction; denied localStorage did not break language switching or tracing.

Keyboard focus was visible (3px outline). The ledger is focusable and ArrowRight scrolls it; navigation targets clear the sticky header; related links resolve to existing anchors. Computed text contrast was at least 6.34:1 for inspected body, explanations, hints, readouts, controls and success/error feedback. Disabled text against its panel measured 6.45:1 with opacity 1; focus against panel measured 8.94:1. Disabled next remains readable and its state is not encoded by color alone. Forced colors and reduced motion paths passed.

## Visual and bilingual inspection

Captured evidence only under `specs/reviews/65-evidence/65-review-1-9f895ac0/`. Personally inspected through image viewing: `cold-fresh.png`, `en-320.png`, `zh-320.png`, `en-390.png`, `zh-390.png`, `en-1440.png`, `en-zoom200.png`, `zh-zoom200.png`, `zh-exponent-ledger.png`, `en-rejected.png`, and `zh-revealed.png`. Other saved captures are supplemental, not a claim of individual visual inspection of every image.

At 320 the controls stack, text/state wrap readably, and the complete four-flag readout stays visible. At 390 buttons can share a row without cutting labels. Desktop ledger clearly separates characters, prefixes, old/new flags and prefix verdicts; its cyan current-row border is a highlight, not stored data. Rejection screenshot preserves the unprocessed suffix and explains unchanged flags. The Chinese reveal explains the same mantissa/exponent obligations as English. Reviewed all bilingual copy pairs: definitions, baseline, invariant, proof, rule rejection, mapping, exercise and cost are materially equivalent; no English-only causal bridge supplies a missing Chinese explanation.

At 200% CSS zoom (640px viewport, 320px equivalent content width), flags and verdicts remain readable without page overflow. Both languages require vertical scrolling and horizontal navigation/ledger scrolling; these are available by keyboard with a localized ledger hint. This is minor access friction rather than missing essential content. Browser suite also covered 736px/landscape; no page-level overflow occurred across checked widths.

## Findings and score

Required open finding IDs: **none**. No earlier per-65 required finding was found, so no closure is inferred from this review. No mathematical error, missing essential causal bridge, contradictory state, broken core operation or material translation mismatch was reproduced. The optional usability observation is the extra scrolling needed for the wide ledger and five long navigation labels on small screens; the existing instructions and keyboard access make all content reachable, so this is not a required fix.

| Dimension (weight) | Score / 4 | Observation and rationale |
|---|---:|---|
| Problem/terms/hand calculation (15) | 4 | Input, bool output, character bounds and terms are defined; incremental `4.e+2` calculation precedes flags and independently predicts the endpoint. |
| Derivation/saved work (20) | 4 | Concrete split baseline exposes copying; specific 4.→4.e comparison derives digit reset; wrong rules and integer-only exponent expose excluded cases; no invented time improvement. |
| Maintained state/correctness (20) | 4 | Initialization, all guards, current-part invariant, rejection and termination are reconstructable; actual Python locals agree with visible intermediate values. |
| Interaction/visual meaning (20) | 4 | Fresh pre-reveal predictions matched browser transitions; cumulative old/new ledger, rejected suffix and restored history are explicit; custom input and prediction changes work. |
| Python/cost (15) | 4 | Faithful executable interface, exact source parity and independent canonical execution; direct transition mapping, immutability, real submission and tutorial costs are explained. |
| Bilingual/device (10) | 3 | Equivalent reasoning, preserved state, readable controls/disabled states, contrast and keyboard access passed; narrow/zoomed views involve extra horizontal scrolling to inspect the full ledger/navigation. |

Weighted total: **97.5/100** = 15 + 20 + 20 + 20 + 15 + 7.5. Every dimension is at least 3, no required fix is open, and browser/source/executable evidence is complete for this review scope.

## Limitations and conclusion

This is an independent agent reconstruction, not measured human comprehension. Testing used Chromium automation and emulated viewport sizes; no physical phone or screen-reader speech test was performed. The 200% check uses CSS zoom/reflow, not a browser-toolbar zoom experiment. Official statement access was verified normally; the Python starter signature was cross-checked against saved lesson-local official evidence. No online LeetCode submission or public production delivery was attempted or claimed.

**Accepted for the identified candidate revision under the frozen rubric.** This conclusion is separate from publication. No implementation or release action is authorized or performed by this report.
