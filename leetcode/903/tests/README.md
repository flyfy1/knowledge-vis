Run from the repository root using the existing preview at http://127.0.0.1:18785 (do not start another service):

```bash
python3 -B leetcode/903/tests/test_solution.py
node leetcode/903/tests/test_core.cjs
node leetcode/903/tests/browser.cjs
node leetcode/903/tests/capture-final.cjs
python3 -B leetcode/903/tests/contact-sheets.py
python3 -B scripts/register_leetcode_lesson.py 903 --validate-only
```

For reviewer reruns, set `OUTPUT_DIR` to an absolute writable directory for all three tests. Run Python first; it writes oracle-rows.json, consumed by the two Node tests. Node uses the installed Playwright via NODE_PATH and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. No runtime package is shipped to the lesson.

The Python oracle enumerates permutations once per length, groups independently by comparison pattern and final rank, and checks all 127 patterns through length 6. A second independent oracle places the maximum value at each permitted position and chooses labels for its left side; it checks 75 seeded/structured cases, including n=200. JavaScript tests use enumeration fixtures, audit every computed intermediate cell/source set, and verify snapshots do not alias. Acorn checks dictionary keys before evaluation so duplicate definitions cannot disappear silently. All canonical/displayed/embedded/copied/downloaded source comparisons preserve the trailing newline.

Browser test runs both locales, all seven presets, every forward and reverse transition, endpoints/reset, wrong and right predictions, feedback invalidation, language roundtrips, 320/390/736/1440 widths, 200% CSS zoom in the real browser, keyboard activation/focus, forced colors, source/download parity, clipboard success and real manual fallback copy, unavailable storage, internal and related deep links, local request errors, and measured rendered solid-color contrast. Each fallback attempt resets and verifies its own unique clipboard sentinel, disables only automatic writes, then performs the Linux host's Control+C and reads the actual clipboard. System font stack is recorded; no claim is made about native macOS font fitting. The conservative select budget uses measured text + actual padding + 24px arrow reserve. It is synthetic fit evidence, not a universal platform rule.

Screenshot review is a separate human/model visual inspection step after the script. Evidence describes author self-checks only. No actual novice-learning result, independent review, LeetCode submission, real-device result, publication, or production verification is implied.
