# Author self-check — #212

Candidate: source hashes in tests/evidence/candidate-manifest.json. Author run only. Independent lesson review pending; no deployment, registration, submission, independent score, or learner-result claim.

Official source: normal public GraphQL GET returned 200, saved with UTC access timestamp in tests/evidence/official-graphql.json. This includes statement, constraints, both examples, metadata and observed language snippets. Python3 offers exactly the callable implemented here. The direct page GET capture is a challenge response and is retained as access evidence, not used to infer the interface. The public official page was also readable through browsing. No paywall or credentials used.

## Author reading pass

- Step 0: on ab/cd, manually trace ab, abd, ac; reject aba for reuse and ad for diagonal. Inputs and requested set are explicit. The same board motivates repeated a→b work in the per-word baseline.
- Step 1: a tree edge consumes exactly one letter. The ab ending and abd continuation coexist; removing only a terminal marker avoids duplicate output without losing abd. Temporary path marks explain why ac remains discoverable after ab.
- Step 2: step from empty to a, ab, rejected aba, abd, word emission and exit. The board keeps original data while numbers represent path order. The trie ledger and cumulative history retain the evidence. Rewind restores terminal flags and outputs, not just highlights. The official preset at operation 6 shows the four-cell oath path before its separate emission event; the zero found count and pending terminal are consistent with that instant.
- Step 3: independently follow at/xo: at and ato succeed; ata reuses a, ao is diagonal. Reveal follows an explicit selection; changing it hides old feedback. Locale changes preserve the selected/revealed state.
- Step 4: map node lookup, terminal pop and paired #/restore to the simulation. Path/prefix invariant establishes soundness, coverage and termination. Costs include trie construction, exponential worst-case search, recursion, output references and the browser-only snapshot distinction.

## Computation

`python3 -B leetcode/212/tests/test_solution.py` passed: 293 baseline comparisons, 3 maximum/boundary fixtures, 45 trace cases, 5133 audited frames. The actual canonical Python executes in these checks. The oracle searches each word independently using immutable used-cell sets. Both input arguments are checked for restoration/nonmutation, outputs for uniqueness, and the mirror for exact assignment/source parity. Details in tests/evidence/algorithm-results.json.

## Browser and visual evidence

`node leetcode/212/tests/browser.cjs` passed against the existing preview URL. Details and measured pairs in tests/evidence/browser-results.json. All six presets exercised to both endpoints in both languages. No console errors, failed local asset requests or external asset requests. Real Chromium checks source, successful copy, denied-clipboard manual recovery, actual downloaded bytes, native keyboard actions, deep links, locale preservation and storage denial/file:// operation.

Visual inspection performed with the image-viewing tool on all lab-320/390/736/1440-{en,zh}.png and zoom200-{en,zh}.png plus css-zoom200-{en,zh}.png. The focused populated state has four equal-width board columns, distinct path numbers and coordinates, readable prefix/ending labels and separated history. At 320px labels wrap within cards; at larger widths the ledger sits beside the board. Enlarged views keep cell coordinates and word-ending states readable. Stage captures hide the sticky navigation for capture only; normal sticky-anchor positioning is tested in the browser. Scrollable history intentionally shows only part of its retained entries at once.

Minimum measured rendered text contrast: 6.449:1. Focus is 3px #ffb454 with 4px offset; controls are at least 48px high. Shared and local CSS combined are below 25000 bytes (exact counts in manifest). All imagery here is test evidence, not shipped runtime assets.

## Metadata and review boundary

From repository root: `python3 -B scripts/register_leetcode_lesson.py 212 --validate-only` exited 0 with empty stdout/stderr. Recorded in tests/evidence/preflight.json. Metadata complexity is one nonempty string. No shared registry, concept map, scripts or workflow were changed. Concept anchors are lesson-local metadata for the separate registration workflow.

Physical devices, browser toolbar zoom, assistive-technology users, novice teach-back, independent review and public production delivery have not been observed. Zoom evidence uses actual Chromium rendering with CSS zoom=2 plus DPR2/640 CSS-pixel reflow; it does not claim a physical browser-toolbar test. A separate reviewer must assess this frozen candidate and issue their own findings before acceptance.
