# #1092 reproducible author checks

These are author self-checks, not independent review or learner research. Run from repository root:

```sh
python3 -B leetcode/1092/tests/test_logic.py
node leetcode/1092/tests/test_core.cjs
node leetcode/1092/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1092 --validate-only
```

Every test that writes results or screenshots honors `OUTPUT_DIR` (absolute path recommended). Browser additionally honors `PREVIEW_URL`, defaulting to the existing `http://127.0.0.1:18770/leetcode/1092/`. It uses Playwright and Acorn from `NODE_PATH` and the launch executable from `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set. No service is started. Python uses only stdlib. A reviewer can redirect all outputs without editing this candidate.

`test_logic.py` executes the official Python callable: 900 exhaustive binary-string pairs compared to increasing-length enumeration of possible outputs, 168 official/seeded/boundary checks using an independent prefix LCS oracle, and the exact rendered recursive baseline. Maximum length cases cover identical and disjoint 1000-letter inputs. Empty inputs are tested only as implementation extensions/internal boundaries, outside the official input domain.

`test_core.cjs` checks every known table cell against enumeration of common subsequences, prefix feasibility and emitted-length + remaining-cost invariants for 129 cases / 3,096 frames. It verifies deep snapshot independence and AST-level localization key uniqueness and two-string shapes.

`browser.cjs` checks all presets and every event with rewind/replay in both locales, exact rendered formulas and H1 identity, semantic explanation branches, keyboard controls and scrollable table, every prediction selection/reveal/change and locale preservation, successful clipboard plus two sentinel-reset native manual transfers per locale, exact rendered/embedded/downloaded source, localStorage denial and file-opening offline. Layout checks cover 320/390/736/1440px at CSS zoom 1 and 2 (layout stress equivalent; not a claim about a physical device or a native browser zoom setting), selected-label width budget with unchanged 20px arrow reserve, retained row labels, and screenshots. It measures opaque rendered color pairs using a calibrated WCAG contrast function, checks focus and forced colors, and records local runtime network/console errors.

`evidence/browser-initial-failure.txt` preserves initial width-budget and zoom-overflow failures. Repairs retain the unchanged assertions. No independent reviewer closed a finding. `evidence/candidate.json` identifies final authored runtime and policy bytes; evidence hashes are separate to avoid recursive manifests. Screenshot interpretation is in `evidence/self-check.md`. No deployment, public-delivery verification or LeetCode acceptance is implied.
