# #115 author self-check — 2026-10-18

Status: complete author candidate, ready for a separate independent review. This is not an acceptance report. No agents were spawned; no registry/shared assets, commits, services, credentials or deployment were changed.

Official source/interface: public GraphQL capture and dated notes in evidence/OFFICIAL.md. Python3 `Solution.numDistinct(self, s: str, t: str) -> int` is supported. The canonical solution is executed in Python 3; the browser diagram is explicitly a simulation. No accepted-submission claim.

Computational evidence:

- 16,129 exhaustive binary-string pairs (lengths 0…6) against increasing-position enumeration.
- 500 deterministic seeded cases against recursive counting.
- Both official examples; transfer exercise; empty extensions; all-match, no-match, repeated-letter binomial count and length-1000 cases. A zero final answer with very large intermediate counts is included.
- 3,969 UI-core pairs; 74,760 snapshots, with every stored mixed-row array entry and every computed table cell checked against position enumeration. Deep-copy snapshot isolation, input bounds and case sensitivity pass.
- Exact solution.py ↔ python-code.js parity. Browser displayed, actual clipboard, mocked clipboard success/denial, manual-copy field, downloaded bytes and file:// offline source match solution.py.

Browser evidence: Playwright Chromium at the existing preview origin. All eight presets, both locales, forward/back/forward/reset/end, slider and keyboard Home/End, prediction choices/reveal/change, locale preservation, custom maximum/empty/invalid inputs, disclosure state, denied local storage, real keyboard Enter/Tab/focus, forced colors and reduced motion pass. Local related targets resolve. No page errors or failing HTTP assets; the additional rendered-style audit records console and failed-request errors (none).

Screenshots at 320, 390, 736, 1440 CSS pixels in both locales, with 200% CSS zoom at 320, 390 and 1440; manual author inspection covers the screenshots, plus focused hand calculation, mixed-array transition and pending-table close-ups. Wrapped array cells remain readable; only the wide 2D table and step-navigation strip scroll horizontally. At the extreme 320px + 200% CSS zoom, text wraps into very short lines and remains available vertically. The headless capture reloads after repeated zoom changes before focused detail shots to avoid stale native-control paints. These screenshots are not physical-device or browser-menu zoom evidence.

The causal close-up shows i=2,j=2: old skip 0 plus old-left 1 gives 1. dp[1] still names D(1,1), while the current dp[2] names D(2,2). The table retains previous rows and marks D(2,1) pending. This makes the distinction between mixed array storage and a partially computed teaching row visible.

Accessibility: controls have 48px minimum targets; radio labels provide full-width 48px click areas. Focus is 3px with 4px separation. Disabled primary-button specificity was corrected locally after screenshot inspection, and a computed-style regression assertion verifies the muted endpoint. Shared+local shipped CSS totals 12,108 bytes. Rendered text/background pairs, including inherited literal colors and composited backgrounds, have minimum measured contrast 6.45:1 in the audited states; ordinary primary body text exceeds 7:1. Full values are in browser-results.json and rendered-contrast.json.

Reproduction commands and OUTPUT_DIR redirection: README.md. Exact candidate file hashes, including shared dependencies read by the page, are recorded in evidence/candidate-manifest.json.

Limits: independent reviewer/run and novice teach-back pending; no physical phone, assistive-technology user session, public delivery, performance benchmark or LeetCode submission was performed. CSS zoom is a browser layout test, not a claim about OS zoom controls. Acceptance and publication remain dispatcher/reviewer responsibilities.

## 2026-10-18 registration repair self-check (115-REG-01)

Status: **fixed awaiting separate independent re-review**. This appended author evidence does not close the dispatcher finding or grant acceptance to the revised candidate. The existing independent teaching review and its optional suggestions are unchanged.

| Finding | Cause and fix | Reproduction and regression evidence |
| --- | --- | --- |
| 115-REG-01 | `lesson-entry.json` supplied an object where the registrar and collection require a nonempty string. Changed only `complexity` to `O(mn) arithmetic operations; O(n) integer cells`, preserving Python's arithmetic-operation/integer-cell qualifications. | [registration-results.json](evidence/115-REG-01/registration-results.json): actual `register()` raises `AttributeError: 'dict' object has no attribute 'strip'` with the original field in a disposable exact-input fixture. Changing only that field makes actual registration pass; entry equality, unrelated entry preservation, concept targets, index cache version, and repeat registration pass. Hashes prove the real registry, index, concept map, catalog and registration scripts stayed unchanged. |

Changed files: `leetcode/115/lesson-entry.json`; new `leetcode/115/tests/registration.py`; appended reproduction instructions in `tests/README.md`; this appended self-check; new output files exclusively in `tests/evidence/115-REG-01/`. No canonical solution, embedded source, teaching text, UI assets, prior reports, rubric, acceptance records or shared files were changed. No source regeneration is needed because source bytes are unchanged. No child agents, commits, deployment, service changes or production registration were performed.

All five commands in README passed with `OUTPUT_DIR=leetcode/115/tests/evidence/115-REG-01`. Python execution: 16,129 exhaustive pairs, 500 seeded cases, 11 official/boundary fixtures, exact offline mirror. Core regression: 3,969 pairs, 74,760 mixed-array/table frames. Browser: English and Chinese, all eight presets, rewind/replay/reset/endpoints, predictions, custom/empty/invalid inputs, state-preserving locale changes, keyboard, clipboard success/denial/manual fallback, actual download and offline parity, denied storage, forced colors and reduced motion. Widths 320/390/736/1440 and 200% CSS zoom at 320/390/1440 passed. Rendered contrast and console/network audits passed in both locales. The full result JSON files and screenshots are under the finding-specific evidence directory; previous evidence is preserved.

Personally inspected the new `en-320.png`, `zh-320.png`, `en-causal.png`, and `zh-causal.png`: narrow controls and array cards wrap legibly; the mixed-row transition still shows old 0 + old-left 1 = 1 and the retained pending table. This is focused screenshot inspection, not a new independent design or teaching review. Other viewport screenshots were captured by the existing automated suite; no claim of manual inspection of every new screenshot is made.

[candidate-manifest.json](evidence/115-REG-01/candidate-manifest.json) records SHA-256 and exact local-preview/disk parity for metadata, lesson runtime, canonical/mirrored Python and shared runtime dependencies. The saved official GraphQL evidence still offers the faithful Python3 `Solution.numDistinct(self, s: str, t: str) -> int` interface, which is selected ahead of TypeScript. The exact registration policy pair is `solution.py` / `python-code.js` / `PYTHON_SOURCE`. This Python lesson needs no non-Python language contract; no supported-language list has been narrowed.

Next action: a separate reviewer freezes the revised candidate and rechecks `115-REG-01` before registration is retried. This run verifies only the existing local preview with desktop Chromium emulation; independent acceptance, public delivery, real devices and novice comprehension are not established by these checks.
