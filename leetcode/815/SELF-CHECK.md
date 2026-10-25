# #815 author self-check — frozen candidate

Status: complete author candidate, ready for a separate independent review. This document does not grant independent acceptance. Author: Codex, current author run; exact model identifier unavailable. No learner study, actual LeetCode submission, registration or deployment was performed.

## Source and lesson
Official statement and Python3 interface verified on 2026-10-26 via the official problem URL and public GraphQL. `tests/evidence/official.json` retains the timestamped full response and code snippets. The page links separately to the exact official URL. Canonical `solution.py` preserves the observed Solution method and does not mutate routes. `python-code.js` contains only its exact JSON string assignment, including final newline.

The lesson derives counting boardings from [1,7] then [7,6], contrasts an incorrect hop-based route choice, gives a complete runnable pairwise-route BFS baseline, derives stop indexing and once-only route expansion, retains stop distances plus route causes and cumulative scan counts, uses a fresh predict-before-reveal map, then maps the visible transition to Python. A full-layer browser simulation is explicitly distinguished from Python's early return. Canonical expected costs and tutorial snapshot costs are separate.

## Commands actually executed
From `/home/songyy/projects/leetcode-hard-campaign-20261018`:

- `python3 -B leetcode/815/tests/test_solution.py` — pass: 7,592 canonical calls, official examples, exhaustive tiny families, seed815 random cases, maximum total length100000 / route count500, a500-bus chain, absent endpoints, equal endpoints, cyclic wraparound, input immutability, exact mirror, duplicate bilingual-copy-key detection. Independent small-input oracle: Floyd-Warshall over route intersections. Displayed graph-BFS baseline also agrees.
- `node leetcode/815/tests/test_core.cjs` — pass: 6,295 cases and12,851 frames, independently checked minimum distances, frontier membership, route activation layers and causes, scan accounting, deep history and deterministic reconstruction.
- `node leetcode/815/tests/browser.cjs` — pass on the supplied already-running preview. Both locales; seven presets; every frame with rewind/replay; start/end/reset; manual boarding/undo; all prediction choices, reveal/change and locale preservation; exact localized H1/document identity; full source display/embedded/success-copy/download parity; per-locale fresh verified sentinel then actual Linux Control+C fallback readback; storage denial; offline file source; keyboard/focus/forced colors; no local asset errors, console errors or external runtime requests.
- `node leetcode/815/tests/focused.cjs` — pass: active route/frontier/target/correct feedback/disabled-primary colors, manual-complete and reveal screenshots, wrong-answer feedback after change, zh→en→zh heading roundtrip at320px preserving meaningful state.
- `python3 -B scripts/register_leetcode_lesson.py 815 --validate-only` — exit0, no output, pass. Command reads metadata without registering or mutating shared files. Receipt: `tests/evidence/preflight.txt`.

All result/screenshot runners support `EVIDENCE_DIR`; rerun instructions are in `tests/README.md`. No browser service was started. All authored changes are inside `leetcode/815/`.

## Browser and visual evidence
Actual Chromium version, Linux platform, inherited system font stack, selected-label width budget and every measured layout are in `browser-results.json`. Both languages were exercised at320,390,736,1440px and CSS layout zoom2 at320,390,1440px. Native select labels are intentionally short; the complete input is directly below the select. Interactive targets checked are at least48×48 CSS px. Native focus has a3px orange outline; Tab/Enter and forced colors were exercised. Browser-chrome zoom and real devices remain unverified; CSS zoom2 is the recorded200% method.

Visually inspected headless captures, not just geometry: desktop English opening, Chinese desktop populated route state,736px English route state,320px English and390px Chinese controls/rows; both320px zoom2 route states and stop-distance states;390px zoom2 English route state; both390px manual-complete states, English found-target state, Chinese revealed prediction, and Chinese source fallback. Labels remain associated with values, previously discovered stops persist, target has a dashed outline and text, new route causes identify the actual shared stop, and histories agree with the main readout. Some captures begin mid-section because of scroll positioning beneath the sticky nav; this is not element clipping. Users can scroll to the full rows; anchor geometry was separately checked.

First author run failed a related-link test that expected the words frontier/BFS in #126 step2. The actual destination uses layer/parent and is the intended expansion experiment. The harness now requires both of those terms, follows both related links by keyboard, and records destination text. A separate source reading verified #126 step2 exposes BFS layers and parent lists; #773 step2 teaches shortest moves over complete board states. This was a harness mismatch, not a changed destination.

Initial visual inspection found inherited padding caused English words to break at320px with zoom2 although overflow checks passed. Local narrow padding now uses8px at each nested level; rerun captures show complete English words and readable CJK line wrapping. A later styling inspection found `.btn.primary` could override generic disabled styling; explicit `.btn.primary:disabled` now uses the muted panel state. Both are author fixes, not independently closed review findings. The first-run record is retained in `author-first-run-findings.json`.

## Measured accessibility and cost
Shared CSS9425 bytes + local CSS1947 bytes =11372 bytes, below25000. Exact shared palette is reused. Local nav is solid --bg to make its contrast measurement unambiguous. Actual calibrated sRGB contrast: body16.087, explanation12.616, muted hint7.744, disabled text6.449, primary action13.101, active route/frontier10.910, goal/focus8.937, correct feedback10.005. All measured normal text passes4.5; core text exceeds7. Focus and stop borders exceed3. Calibration tests the same helpers against black/white, RGB primaries,21:1 contrast and unrounded #747474-on-black≈4.492948 (fails4.5). Measurements cover the recorded solid states, not arbitrary future styles.

## Freeze and remaining boundary
`candidate.json` hashes the authored runtime, tests, brief, metadata, self-check and saved evidence, with shared runtime/policy hashes. No prior review outcome was rewritten. Independent cold walkthrough, fresh reviewer examples, six-dimension scoring and acceptance are pending in a separate run. Actual novice comprehension, real devices, browser-chrome zoom, public delivery and LeetCode acceptance are not claimed.

## 2026-10-26 repair candidate — 815-COPY-R1 (fixed awaiting separate review)

This appended author self-check supersedes the old candidate's readiness statement only for this new repair. Historical candidate.json and prior reviews remain historical evidence. New freeze: `candidate-copy-r1.json`, candidate `815-copy-r1-20261026`. No independent closure, revised score, acceptance, registration or publication is claimed.

Fix mapping: **815-COPY-R1 → footer element and unused foot pair removed**; the builder declaration was removed and the changed copy.js cache reference bumped. Exact bilingual deletion:

- zh: `作者自检候选；独立评审待进行。教学模拟不等于提交执行；未声称 LeetCode 已接受或真实学习者已掌握。`
- en: `Author self-checked candidate; independent review pending. Simulation is separate from submission execution; no LeetCode acceptance or learner outcome is claimed.`

There is no replacement prose. Before/after SHA-256 assertions confirm app.js, core.js, solution.py, python-code.js, style.css and lesson-entry.json are byte-identical. All 92 remaining localization pairs are exactly unchanged, including `sim`, `s4e` and `pending`. Python remains the faithful preferred official interface, backed by the retained official Python3 snippet in tests/evidence/official.json; no non-Python language contract is needed. Read scripts/register_leetcode_lesson.py's exact `solution.py` / `python-code.js` / `PYTHON_SOURCE` pair; exact mirror and runtime transfer checks pass without normalization or regeneration of the unchanged source mirror.

Commands from repository root, all exit0 unless explicitly marked red:

- `node leetcode/815/tests/copy-repair.cjs` before repair — **expected exit1**, retained `tests/evidence/copy-r1/red.txt`: actual footer count1 versus expected0. Same assertion passes after repair; `green.txt` and `results.json` preserve the result. No assertion weakened.
- `python3 -B leetcode/815/tests/build_copy.py` — regenerated copy.js with92 unique bilingual keys, only the requested pair removed.
- `EVIDENCE_DIR=leetcode/815/tests/evidence/copy-r1 python3 -B leetcode/815/tests/test_solution.py` — 7,592 actual canonical Python calls pass independent route-graph oracle, baseline, boundaries, immutability and exact source mirror checks.
- `EVIDENCE_DIR=leetcode/815/tests/evidence/copy-r1 node leetcode/815/tests/test_core.cjs` — 6,295 cases /12,851 frames pass independently checked distances, route causes, frontier, retained histories and per-layer scan accounting.
- `EVIDENCE_DIR=leetcode/815/tests/evidence/copy-r1/browser node leetcode/815/tests/browser.cjs` — full existing bilingual browser suite passes all presets/frames, rewind/replay, prediction change/reveal/locale retention, exact H1/title, central invariant/causal text, copied/displayed/downloaded/offline source equality. Both fallback attempts use fresh verified non-source sentinels and actual Linux Control+C readback. No runtime, asset or external-request errors. Layout at320/390/736/1440 and CSS zoom2; original calibrated contrast checks pass.
- `EVIDENCE_DIR=leetcode/815/tests/evidence/copy-r1/focused node leetcode/815/tests/focused.cjs` — existing focused interaction/contrast suite passes.
- `node leetcode/815/tests/copy-repair.cjs` after repair — focused regression passes unchanged body/runtime assertions, every bound localization key, exact `sim`/`s4e`, and visible `pending` at official-example frame1/2 (three discovered stops, one route). It preserves the selected/revealed wrong prediction and trace through zh→en→zh at320px, zoom1 and CSS zoom2; checks Copy→Download→source disclosure keyboard order/activation, final-link focus, absent footer and page-end geometry. Chromium156.0.8078.4, Linux, existing system font stack; no new browser service.
- **Required metadata preflight:** `python3 -B scripts/register_leetcode_lesson.py 815 --validate-only` — **exit0, empty stdout/stderr**, retained preflight.txt plus preflight-receipt.json. Complexity was already exactly one nonempty string covering time/space; metadata unchanged. This command did not register the lesson or change shared state.

Visually inspected the focused captures `en-320-zoom1-1-end.png`, `zh-320-zoom1-2-end.png`, `zh-320-zoom2-3-end.png`, and `en-320-zoom2-4-end.png` under tests/evidence/copy-r1/. The page ends after the existing related links with ordinary section padding, no footer gap/status badge. Link text wraps fully, source disclosure remains readable, and the last keyboard target has its visible orange outline. Sticky nav may overlay content at the screenshot top according to scroll position; the affected page end remains visible. CSS zoom2 is the measured200% method; native browser zoom/physical devices/public delivery remain unverified.

The report's scope contains no algorithm defect requiring an implementation change. Numerical, intermediate count/frame, prediction-scope and exact-source regressions were nevertheless rerun. Optional 815-A1/A2 remain untouched. Next action: a separate fresh reviewer checks this frozen candidate and explicitly closes 815-COPY-R1; no author independent acceptance is asserted.

Final local preview identity check fetched all seven runtime files and compared exact bytes with disk; `tests/evidence/copy-r1/served-identity.json` records matching SHA-256 values. `git diff --check` passed; all modified/new paths remain within leetcode/815/. This establishes local preview identity only.
