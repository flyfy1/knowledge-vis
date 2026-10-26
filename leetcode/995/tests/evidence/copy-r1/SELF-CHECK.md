# 995-COPY-R1 — author self-check

Status: candidate ready for separate independent re-review. No independent
acceptance, publication, LeetCode submission or learner outcome is claimed.
Historical review and advisory classifications remain unchanged.

| Stable ID | Change | Observed evidence | Status |
| --- | --- | --- | --- |
| 995-A01 | link2 now says “#330: trace how the covered range grows” / “#330：逐步观察覆盖范围如何扩展”; retains ../330/#step2 | focused.json: both locales, actual keyboard Enter navigation, destination heading, [0,0]→[0,1]→[0,3] coverage and growing one-/two-row ledger; screenshots *-destination.png | Fixed awaiting independent review |
| 995-A02 | Replaces “commute” with “Changing the order of these window flips does not change the result.” | focused.json: exact rendered English proof equals prescribed opening plus unchanged induction/minimality suffix; Chinese proof unchanged; proof screenshots in both locales, 320/390/1440 at 100/200% CSS zoom | Fixed awaiting independent review |

The unchanged cancellation sentence explains why repeated starts can be reduced
to one or zero uses. Earlier starts are then fixed inductively, and later starts
cannot reach the current position. Its bit forces or forbids the current start;
when a required window cannot fit, all possible solutions fail. Otherwise these
forced choices produce all ones and a minimum count. This argument remains
causally identical in both languages. The hand example, baseline, tempting
zero-count shortcut, expiry bridge, and fresh 0110 transfer remain intact.

Only copy.js's two entries and index.html's copy.js cache token changed at
runtime. baseline.json preserves original text and source hashes; the focused
check asserts unchanged Chinese proof, all other entries, English suffix, core,
renderer, CSS, Python, mirror and metadata. No metadata fix was needed. The new
candidate-manifest.json freezes runtime, metadata, test and evidence identities.
No earlier acceptance or report was changed. No commit or publication occurred.

## Commands and results

Run from repository root. New output goes to this directory, preserving original
author artifacts. Environment supplied NODE_PATH and the Chromium executable.

- `node leetcode/995/tests/copy_repair.cjs`: original candidate failed the new
  plain-English assertion (exit 1, red.txt). After the fix, exit 0
  (focused-run.txt, focused.json). This is a copy regression, not an algorithm bug.
  Acorn parses actual dictionary properties to catch duplicate keys; every pair
  and placeholder shape is checked. Served proof/link text is exact. Locale
  roundtrips preserve the two-position trace and revealed correct prediction.
- `EVIDENCE_DIR="$PWD/leetcode/995/tests/evidence/copy-r1" python3 -B leetcode/995/tests/test_solution.py`:
  exit 0; numerical.json records 18,434 exhaustive BFS-oracle cases, 1,000 seeded
  cases, 9 official/fresh/maximum cases, immutability and exact embedded source.
  Executes the actual canonical Python callable. Python3 interface is recorded
  in ../official.json and ../official-verification.md. Python is already selected;
  no non-Python language contract or supportedLanguages exclusion applies.
  Read registration's exact Python pair: solution.py / python-code.js /
  PYTHON_SOURCE. All remain byte-identical; no regeneration was needed.
- `EVIDENCE_DIR="$PWD/leetcode/995/tests/evidence/copy-r1" node leetcode/995/tests/test_core.cjs`:
  exit 0; core.json records 8,194 cases / 58,416 frames, parity, expiry, effective
  cells, fixed prefix, accumulated starts and deep snapshot checks.
- `PREVIEW_URL=http://127.0.0.1:18770/leetcode/995/ EVIDENCE_DIR="$PWD/leetcode/995/tests/evidence/copy-r1" node leetcode/995/tests/browser.cjs`:
  exit 0; browser-run.txt / browser.json: 16 locale/preset endpoint runs,
  16 viewport/zoom combinations, no console/network/external-asset errors.
  Includes actual clipboard, per-attempt sentinel reset, host Linux Control+C
  fallback transfer and exact download/display parity including final newline;
  downloads are download-en.py and download-zh.py. Also covers formula operands,
  checked/current distinction, expiry, failure return versus cumulative flips,
  prediction feedback clearing, locale retention, keyboard and offline source.
- `PREVIEW_URL=http://127.0.0.1:18770/leetcode/995/ EVIDENCE_DIR="$PWD/leetcode/995/tests/evidence/copy-r1" node leetcode/995/tests/visual.cjs`:
  exit 0; visual-run.txt / visual.json, 12 focused states.
- `python3 -B scripts/register_leetcode_lesson.py 995 --validate-only`:
  **exit 0, empty stdout and stderr**, from repository root. preflight.json
  records the command/result. This was validation only; no registration.
- `git diff --check`: exit 0.

## Visual inspection and limits

Inspected the English/Chinese 320px 200% proof-opening screenshots: complete
words wrap, ordinary page scrolling provides the longer paragraph, and the
opening stays below the sticky navigation. Also inspected 390px link screenshots
and both destination screenshots in copy-contact.jpg, plus the focused English
current/fixed overlap. The initial centered proof capture omitted the opening
from its viewport; the test was adjusted to scroll the paragraph's start below
the existing navigation and recaptured. This was a capture correction, with no
runtime layout change or weakened assertion. Exact full proof text and no
component clipping are asserted independently at all 12 focused locale/layout
combinations. CSS remains 11,431 combined bytes, minimum measured text contrast
6.4494:1 (AA, below preferred 7:1 on some unchanged shared muted pairs).

This is Linux headless Chromium and CSS zoom evidence, not native macOS,
physical mobile devices, public production delivery or novice teach-back.
The new candidate still requires a separate reviewer to evaluate 995-COPY-R1
and decide closure of 995-A01/995-A02. No author score replaces that step.
