# Reproduce author checks

Run from the repository root. No service is started. The existing preview defaults to http://127.0.0.1:18770; override PREVIEW_ROOT if needed. Browser scripts use the installed Playwright through NODE_PATH and honor PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.

Set OUTPUT_DIR to an absolute reviewer-owned directory to preserve frozen evidence:

```bash
OUTPUT_DIR=/tmp/poor-pigs-review python3 -B leetcode/458/tests/check_algorithm.py
OUTPUT_DIR=/tmp/poor-pigs-review node leetcode/458/tests/check_core.cjs
OUTPUT_DIR=/tmp/poor-pigs-review node leetcode/458/tests/check_browser.cjs
OUTPUT_DIR=/tmp/poor-pigs-review node leetcode/458/tests/check_navigation.cjs
OUTPUT_DIR=/tmp/poor-pigs-review node leetcode/458/tests/check_large_view.cjs
python3 -B scripts/register_leetcode_lesson.py 458 --validate-only
```

The Python test executes the original official callable for every valid input triple (5,050,000 cases). Its independent oracle chooses the subset of pigs that die, then assigns their death rounds. It also enumerates complete observation vectors, physically simulates their feeding rule, checks intermediate loop capacities, mirror parity and duplicate localization keys before dictionary overwrite.

The core test uses independently enumerated outcome vectors for counts and actual live-pig feeding simulation for intermediate observations, candidate sets and histories: 5,175 scenarios and 20,700 frames, plus all presets and maxima.

The main browser test checks every poison in every preset in both languages, full forward/back/reset/end sequences, range and button keyboard use, locale state, all prediction options and feedback clearing, source display/copy/download, clipboard denial, denied storage, local-only requests, contrast, 48px controls, forced colors/reduced motion, 120-character wrapping, widths 320/390/736/1440 and 200% CSS layout zoom. Its main context requests reduced motion for deterministic scroll geometry. check_navigation.cjs separately verifies every step anchor with normal smooth scrolling in both languages.

check_large_view.cjs records six settled viewport captures of the 27-bucket case. Full-element captures of a very tall list can contain a sticky-navigation overlay at the capture scroll position; these additional unmodified viewport captures distinguish that artifact from content overlap. Inspect screenshots after rerunning; automated geometry alone does not prove readability.

Evidence is author self-check material, not independent acceptance, an official submitted result, real-device evidence, or novice learning evidence. Default evidence is under evidence/. The candidate manifest hashes the reviewable source, metadata, provenance and test scripts; it intentionally excludes generated screenshots and this self-check report.
