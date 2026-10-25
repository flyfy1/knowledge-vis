# Author self-check · #689

Candidate status: ready for a separate independent lesson review. No independent acceptance, LeetCode submission result, actual learner study or public release is claimed. Official public GraphQL evidence is ../../provenance/official.json (statement, constraints, examples and Python3 selector/template). See preflight.json for exact candidate hashes and command receipt.

## Actual checks

- `python3 -B leetcode/689/tests/test_solution.py`: PASS, 79,058 cases. Exhaustive ternary arrays of lengths3..9 and every valid k, 700 seeded cases, both official examples, n=20000 with maximal values, k=1 and k=6666. Independent oracle enumerates triples and sums original elements. Input preservation and exact Python mirror including final newline pass. All93 copy keys unique; values are nonempty bilingual pairs.
- `node leetcode/689/tests/test_core.cjs`: PASS, 2,793 cases /62,132 frames. Independent enumeration checks every fixed-middle candidate, both earliest-maximum summary invariants, legal boundaries, candidate/value association, best-so-far and final result. Includes exhaustive binary arrays and seeded cases.
- `node leetcode/689/tests/browser.cjs`: PASS in actual Chromium on the supplied preview. Both locales ×5 presets, every frame and full backward/forward equality; start/reset/end disabled controls; hand reveal; every prediction option, explicit reveal, answer-change clearing, locale/preset state preservation. Formula inspected as complete operands in both locales. Rendered suffix tie feedback checked against expected comparison; fresh exercise text checked for fixed-middle scope and overlap explanation. Results contain exercised visible text.
- Source transfer PASS: canonical file = decoded mirror = textContent = clipboard readback = downloaded bytes. Fallback seeded a distinct non-source sentinel, verified full selection and focus, dispatched Linux Control+C, and read back the exact source including final newline. No test wrote source into the clipboard for fallback. Offline file opening PASS.
- Layouts: both locales at320/390/736/1440px; both locales at320/390/1440 with CSS zoom2. No page overflow or window-card content overflow on the final candidate. Focusable summary region supports horizontal keyboard scrolling. Native control labels wrap, all actions and related links use ≥48px minimums. Keyboard Enter, Tab, 3px visible focus, forced colors and sticky step anchors checked. Denied localStorage still permits initial rendering and locale switching. No external requests, asset errors, console errors or page errors in browser run. CSS shared+local=11,803 bytes.
- `node leetcode/689/tests/focused.cjs`: PASS. Both-locale clipboard success/denial/manual copy, disclosure preservation across locale, keyboard horizontal scrolling, focused suffix tables, header and control captures at320px with zoom2.
- `python3 -B scripts/register_leetcode_lesson.py 689 --validate-only`: PASS (exit0, no stdout/stderr), run from repository root. No registration performed. Receipt in preflight.json.

## Visual inspection and correction

Actual screenshots opened and visually inspected in the author run: cold-desktop.png; en-390-trace.png; zh-320-trace.png; zh-1440-trace.png; en-320-zoom200.png; zh-390-zoom200.png; en-header-zoom200.png; en-controls-zoom200.png; zh-suffix-table-scrolled.png. The screenshots show readable starts, actual window values, candidate marks and controls with no intersecting labels. At extreme320px plus200% layout zoom, cards use one column, long English text wraps into multiple lines and the horizontal step navigation remains scrollable. The summary table deliberately scrolls rather than shrinking all four columns.

The first browser pass failed at320px CSS zoom2: an unbreakable English title extended the document to366px. Header wrapping and adaptive single-column cards repaired this before freeze; zoom-before-fix.png preserves the original observation. The full browser suite passed on the repaired candidate. This is an author correction, not reviewer closure.

Measured rendered text contrast: body16.09:1, explanatory copy12.62:1, hint7.74:1, cards13.40:1, primary actions13.10:1, disabled text6.45:1. Focus against panel2=8.94:1; card boundaries6.45:1. All measured text pairs exceed AA; disabled text is below the7:1 aspirational target while retaining exact shared tokens. Details in browser-results.json.

## Explanation self-walk (not actual learner evidence)

1. Tiny k=1 case asks for starts, not values; hand reveal shows2+4+3=9. Contract names exactly three windows and tie order.
2. Same case tests each middle start and exposes7,9,8. Legal side bounds explain independent choices; any legal triple is bounded and the chosen sides attain the bound. Official counterexample shows why individual-window greed fails22<23.
3. Retained summary rows show old and new choices; suffix equality replaces later starts with earlier ones. Ledger distinguishes the inspected triple from best-so-far; endpoint alone calls it final.
4. Fresh fixed-middle exercise needs R[4]=4 despite an equal sum at6; reveal also rejects the overlapping start1. Its global optimum is deliberately not the question.
5. Named source variables map to the diagram, with strict/non-strict tie rules and complete list comparison. Three linear scans plus window construction explain O(n) time, O(n) auxiliary storage; tutorial snapshots have separate quadratic storage.

Limitations: independent cold review remains pending. Browser-chrome zoom, physical mobile devices, other browser engines, actual novice transfer, production delivery and LeetCode acceptance are unverified. These author checks do not establish those outcomes. Only leetcode/689/ was authored; no shared assets, registry, campaign state, services or credentials were changed.
