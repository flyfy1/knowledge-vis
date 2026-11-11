# #928 author checks

From repository root, with the provided NODE_PATH and Chromium environment:

```bash
python3 -B leetcode/928/tests/test_solution.py
node leetcode/928/tests/test_core.cjs
node leetcode/928/tests/browser.cjs
node leetcode/928/tests/focused.cjs
python3 -B scripts/register_leetcode_lesson.py 928 --validate-only
```

All artifact-producing tests accept `OUTPUT_DIR`; use the same directory for the
Python and core checks because Python writes the independent oracle fixtures.
The browser uses `PREVIEW_ROOT` (default http://127.0.0.1:18770), and honors
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` as executablePath. No service is started.
For independent reruns set OUTPUT_DIR to a fresh reviewer-owned destination;
do not overwrite this candidate's author evidence.

- Python: physically delete each candidate's row/column, then compute transitive
  closure as an independent oracle. Compare the canonical callable and the
  baseline extracted from the actual displayed HTML. All 31,668 undirected
  graph/proper-source-subset combinations through n=5, reversed source order;
  180 random cases (seed 928), fresh quiz, official examples and four n=300
  connected/isolated, one/299-source boundaries. Check input preservation.
- Core: independent oracle fixtures plus all eight UI presets; partition coverage,
  clean-path reachability, distinct boundary sets, every spread round, terminal
  closure excluding deletion, B−1−saved accounting and all prefix best pairs.
  Parse copy.js with Acorn before evaluation to reject duplicate keys; assert
  paired locale shape and identifier-placeholder parity (numeric sets are data).
- Browser: real Chromium, both locales, every preset/removal, spread/scan endpoint,
  reset/rewind/replay, all prediction choices/change/reveal, locale preservation,
  320/390/736/1440 widths, 200% CSS zoom at desktop and narrow widths, keyboard,
  forced colors, reduced motion, blocked storage, offline loading, local requests,
  related deep links, rendered contrast, source display/copy/download equality.
  Clipboard fallback: Linux Control+C, fresh verified non-source clipboard
  sentinel before EACH forced failure, focus/full-selection checks and exact
  readback. Newline/indentation must match; no trim or normalization.
- Focused: populated shared/repeated-contact/single-source/tie cases in both
  locales at 320/390; current candidate 1 has saved=1, final=3, while best candidate
  0 has saved=2, final=2. Nonterminal locale/focus preservation, native radio
  keyboard selection/reveal/change, keyboard graph scrolling. Diagram captures
  align below the sticky navigation to avoid screenshot overlap artifacts.

See evidence/harness-notes.txt for corrected test assumptions, not runtime bugs.
See evidence/SELF-CHECK.md for the author-only conclusion and limits. Review gates
remain those in specs/leetcode-review-gates.md. No LeetCode submission is made.
