# 685 R1 repair self-check

Candidate: `685-r1-label-fix`, frozen in `../../../candidate-sha256.json`.
Author self-check only; ready for separate focused re-review. Prior independent
report: `specs/reviews/685-review-1-6f12f2a6.md`, candidate
`cfba14ba99348ea5d37d88f770b9ae595e3b7c4c`; its changes-required result is historical
and unchanged. Previous author manifest is preserved as
`previous-candidate-sha256.json`. No independent acceptance or finding closure.

## Stable finding mapping

**685-R1-001: fixed awaiting review.** Preset 3 English closed selection changed
from “Answer precedes the last row” to “Answer before last row”. Both identify
an answer earlier than the final input row; the preset, row order, graph, final
answer [3,1], and Chinese label retain their meaning. The lesson-local copy asset
query is bumped. No algorithm or interaction defect was reported; no changes to
those working paths were needed.

Unchanged `tests/selected-label.cjs` failed before repair (exit 1) and passed
afterward (exit 0). `red-final/selected-label-results.json` records two failures
at 320px (initial EN and return to EN), with selected value 3, frame 0/8. The
ordinary screenshots visibly omit “row”. `green/selected-label-results.json`
records six passing cases at 320/390px, EN→ZH→EN with identical preset/frame.
Selected text falls from 220.4644px to 172.5923px. At 320px the fixed control is
259px wide, client 257px, padding 15px each side; after a diagnostic 16px native
arrow reserve, available width is 211px. The previous available width was 214px.

Browser is Chromium 156.0.8078.4 on Linux, supplied executable environment path.
Computed font: `16px "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`.
Exact resolved font is unverified. The arrow reserve describes this environment,
not a universal native-select dimension. The actual screenshots, not only the
numerical margin, show complete fixed text. Visually inspected red/green EN at
320, green Chinese at 320 and EN at 390; all six green selected screenshots
are retained. `green/longest-*-*.png` separately capture preset 0, now the longest
English label (“Official 1 · Two parents only”), and its Chinese equivalent at
320/390; inspected 320 EN and 390 Chinese. All option widths are in the focused
report; the longest English option measures 206.9284px and fits the 211px area.

## Commands and results

Run from the repository root, with the existing preview and NODE_PATH:

```sh
OUTPUT_DIR="$PWD/leetcode/685/tests/evidence/r1-fix/red-final" node leetcode/685/tests/selected-label.cjs
# Before repair: exit 1, two English 320px failures retained.
OUTPUT_DIR="$PWD/leetcode/685/tests/evidence/r1-fix/green" node leetcode/685/tests/selected-label.cjs
# After repair: exit 0, six cases. Rerun after copy query bump: exit 0.
OUTPUT_DIR="$PWD/leetcode/685/tests/evidence/r1-fix/regression" python3 -B leetcode/685/tests/test_solution.py
OUTPUT_DIR="$PWD/leetcode/685/tests/evidence/r1-fix/regression" node leetcode/685/tests/test_core.cjs
OUTPUT_DIR="$PWD/leetcode/685/tests/evidence/r1-fix/regression" node leetcode/685/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 685 --validate-only
```

All three full suites exit 0: actual canonical Python 9,049 cases including
n=1000 boundaries; core 9,046 fixtures / 127,788 frames with independent BFS
partitions, prefix counts, snapshots and deletion-oracle outputs; browser 26
semantic records / 10 layouts. See their JSON reports in `regression/`.
Preflight exits 0 with empty stdout/stderr; `metadata-preflight.json` records
command, root, timestamp, unchanged before/after metadata and shared-file hashes.
Complexity is exactly the existing nonempty string:
`O(n α(n)) amortized time; O(n) auxiliary space`. No metadata repair necessary.

## Applicable rendered-state/source contract

Both locales: every preset frame, progress completed-operation count and full
history count agree; groups-before/groups-after and detection status agree;
Back/forward/reset preserve complete snapshots. Preset 3 is the adversarial
answer-before-final-row case, with answer [3,1]. Preset 2 distinguishes rejected
closure from final removal. Independent oracle expectations are separate from
the browser formatter. Both graph endpoint screenshots and both 320px dense
stage screenshots were visually inspected: node labels, arrows, table states,
candidate rows and groups remain legible and associated.

Every quiz choice/reveal/change and locale preservation passed. Prediction uses
the independent fixed input [[3,2],[4,2],[2,3],[1,4]]; feedback names [3,2], its
remaining path 1→4→2→3 and the wrong surviving cycle 3→2→3. The preset selector
does not alter the fixed exercise. No optimization recurrence or recursive
branch is introduced here; those contract sections are inapplicable.

`solution.py` remains canonical. The captured official codeSnippets include
faithful Python3 and TypeScript interfaces. Python is preferred and selected;
there is no non-Python language contract or incomplete supportedLanguages list.
Read the exact source/mirror table and validation in
`scripts/register_leetcode_lesson.py`: Python pair is solution.py / python-code.js,
export PYTHON_SOURCE. Python source and mirror are unchanged, exact including
final newline. Python duplicate-key detection checks all 100 bilingual pairs.
Browser textContent, successful copy, manual fallback copy with distinct sentinel,
Linux Control+C and actual clipboard readback, downloaded bytes, and offline
mirror all match canonical source without normalization. Regeneration unnecessary.

Full browser regression includes both locales at 320/390/736/1440, CSS zoom 200%,
keyboard, focus, reduced motion, forced colors, storage denial, offline source,
related/deep links and local assets. No console/page or local asset failures.
Measured minimum text contrast 7.07885:1; combined CSS 11,778 bytes.

Limits: Chromium/Linux viewport emulation and CSS zoom; no physical-device audit,
other-platform native-font proof, novice teach-back, LeetCode submission or public
deployment claimed. No shared files, reports, rubric, campaign, services, Git
configuration or other lessons changed. Next action: independent reviewer checks
685-R1-001 against this frozen repair and decides closure.
