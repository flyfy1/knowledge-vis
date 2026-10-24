# Self-check evidence for review findings

Candidate-local changes address the stable findings without changing the review report.

## Feedback loop and hypotheses

The historical candidate reproduces R1-001 and R1-003 through source assertions:

```text
git show HEAD:leetcode/273/app.js | grep -Fq 'const fast=oracle(n),slow=oracle(n);' && echo 'R1-001 repro RED (historical candidate)'
R1-001 repro RED (historical candidate)
git show HEAD:leetcode/273/copy.js | grep -Fq 'Baseline: repeatedly reasoning digit by digit repeats place-value work' && echo 'R1-003 repro RED (historical candidate)'
R1-003 repro RED (historical candidate)
```

Ranked hypotheses were: (1) the verifier's two values share one function; (2) group labels use incompatible index conventions; (3) the baseline lacks a worked repeated-cost example. Each prediction was falsified by the corresponding source change and browser assertion below.

## Fix mapping

- **273-R1-001:** `app.js` now runs `pythonEquivalent` (the displayed Python control flow) and a separate decimal-slice `oracle` with its own renderer; the UI names both paths truthfully and no longer calls one oracle twice. The scan completion also uses the faithful implementation path rather than the oracle.
- **273-R1-002:** `visualGroupLabel` labels Step 0's left-to-right view; `scanGroupLabel` explicitly says low-to-high for Step 1. The bilingual Step 1 explanation maps scan group 0 to rightmost 567 and explains the final reversal.
- **273-R1-003:** the bilingual baseline now hand-walks 12,345's repeated digit-by-digit rebuilding, then accounts for one remainder/division/local-render per base-1000 round and the maximum four rounds.

## Executed checks

```text
python3 -B scripts/register_leetcode_lesson.py 273 --validate-only
exit 0 (no output)

python3 leetcode/273/tests/test_core.py
500 seeded/random + boundaries + source parity: PASS

NODE_PATH=/tmp/leetcode273-tools/node_modules PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=$HOME/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome node leetcode/273/tests/browser-check.js
{"status":"3/3 groups joined: One Billion Two Hundred Thirty Four Million Five Hundred Sixty Seven","errors":[],"ok":true}
```

A second Playwright run checked both locales at 1280×900: EN verification for `1001` showed `Python-control-flow implementation`, `independent decimal-slice oracle`, and `match`; ZH showed `Python 控制流实现`, `独立十进制切片 oracle`, and `一致`. It also asserted the ZH index bridge (`扫描组 0 是最右的 567`) and the worked baseline text in both locales; result: `{"ok":true,"mappingHasBridge":true,"baselineHasDerivation":true}`.

## Revision self-check for independent findings 273-R2-001 and 273-R2-002

### Feedback loop and ranked hypotheses

The required red loop was run against the served candidate before editing:

```text
RED Step1 wrong rendered state: 3/3 groups joined: One Billion Two Hundred Thirty Four Million Five Hundred Sixty Seven
RED Step2 missing prediction control; count=0
```

Ranked, falsifiable hypotheses were: (1) the Step 1 low-to-high group array has scale labels shifted by one position; changing only its scale data should produce the exact 1,234,567 phrase; (2) Step 2 lacks a stateful prediction seam; adding an input and comparing its normalized value should expose distinct match and mismatch results; (3) locale rerender might discard the new prediction state; switching language after reveal should preserve the input and translate the verdict. The first two were confirmed as causes and fixed; the third was tested and falsified.

### Fix mapping

- **273-R2-001:** `app.js` now maps the low-to-high Step 1 ledger as 567 → no scale, 234 → Thousand, 1 → Million. The exact joined output is asserted in `tests/browser-check.js` and in EN/ZH browser checks.
- **273-R2-002:** `index.html` adds a labeled prediction input. `app.js` records the entered text, clears stale feedback when it changes, and on Reveal shows the entered value, expected value, and localized match/mismatch verdict. Locale changes retain the input and update the feedback language. Browser checks exercise both a wrong and correct guess in both locales.

### Executed checks

```text
python3 leetcode/273/tests/test_core.py
500 seeded/random + boundaries + source parity: PASS

python3 -B scripts/register_leetcode_lesson.py 273 --validate-only
exit 0 (no output)

NODE_PATH=/tmp/leetcode273-tools/node_modules PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=$HOME/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome node leetcode/273/tests/browser-check.js
{"status":"3/3 groups joined: One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven","errors":[],"ok":true}

Focused Playwright EN/ZH + widths check
{"ok":true,"errors":[],"states":"EN/ZH exact scales + prediction mismatch/match","widths":[320,390,1280]}
```

The canonical Python source and embedded `python-code.js` remain byte-for-byte identical; no language-contract file is needed because faithful Python remains the official interface. No `[DEBUG-...]` instrumentation was added.
