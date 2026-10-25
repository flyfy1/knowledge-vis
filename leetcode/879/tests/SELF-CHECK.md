# Author self-check — #879

Author: Codex; exact model identifier unavailable. This is one author run, not an independent review. Independent reviewer/run/result: pending. No deployment, registration, or LeetCode submission performed.

Official evidence: ../provenance/official.json captures the public GraphQL statement and actual Python3 code template, examples 2/7, constraints, metadata and complete observed snippets. The direct requests HTML endpoint returned Cloudflare 403; public GraphQL returned 200 normally without credentials or bypass. The official URL was also readable via web browsing. Python is the preferred supported interface; no non-Python language contract is needed.

## Observed teaching checks

- Step 0: four indexed choices total (0,0), (2,2), (2,3), (4,5); last two qualify. Exact versus at-most membership and at-least profit are explicit.
- Step 1: full skip/take tree is an independent baseline. Counts, rather than maximum profit, are the necessary output. Nonnegative future profit proves saturation safe; accurate member total must remain separate.
- Step 2: default first frame has only empty subset; after crime 0 it has (0,0)=1 and (2,2)=1; crime 1 adds (2,3)=1 and (4,3)=1. Tighter-capacity preset rejects (4,3). Same-item reuse trap has answer 0. Old/new tables, complete nonzero transition ledger and prefix history agree at each completed-crime instant. All teaching transitions are retained. Snapshot storage is distinguished from solution memory.
- Step 3: fresh case absent from presets: n=3, P=2, group=[1,1,2], profit=[2,2,0]. Valid subsets {0},{1},{0,1},{0,2},{1,2}; count 5. The triple exceeds capacity, and the empty subset/{2} fail profit. Every option then reveal then changed choice checked in both languages. Changing choice hides feedback; unrelated presets and locale preserve the chosen/revealed state.
- Step 4: copying rows implements skip, old-table reads implement one take, sum of threshold column handles at-most members. P=0 keeps a nonzero work bound. Source display, clipboard, manual-copy transfer and download preserve exact canonical source including final newline. Source disclosure state survives locale changes.

Numerical records: 10,235 executed Python cases (exhaustive/seeded/official/maxima and fresh exercise), 9,834 JS cases and 38,141 intermediate prefix frames against independent subset enumeration. Baseline checks and source/copy dictionary shape checks also pass. See python-results.json and core-results.json in evidence/.

## Browser and visual inspection

See evidence/browser-result.json for Chromium version, Linux host, exact localized operation/formula/feedback strings, preset endpoints, selected-label font budgets, destination excerpts and contrast ratios. Actual UI tables are compared with independently enumerated expected cells for all presets and prefixes. Both locales, forward/back/reset/end/range, prediction, repeat native fallback transfers, blocked storage, offline file opening, focus, forced colors and reduced motion pass.

Visually inspected populated state screenshots at 320/390/736/1440 in EN and zh; 200% CSS page magnification in both languages; narrow control, localized H1 and prediction screenshots. Counts remain aligned with (members, capped profit), changed counts remain bold/cyan, and labels/feedback wrap. One author iteration removed an unnecessary table minimum width after seeing a cramped narrow header; the final table fits without horizontal scrolling. Dense desktop tables stay side-by-side; narrow ones stack. Screenshot scroll positioning may put a caption behind sticky navigation; this is a capture position, not inaccessible content (ordinary scroll exposes it). Step-navigation keyboard activation verifies target geometry below the sticky bar.

Contrast helper is calibrated using WCAG sRGB weights 0.2126/0.7152/0.0722; black:white=21, and #747474:black≈4.492948 correctly fails 4.5. All tested text pairs pass 4.5; text/accent/disabled/focus roles are recorded in browser-result.json and computed colors in rendered-styles.json. Measurements cover solid token surfaces; no arbitrary gradients or images are used. CSS total = 11,061 bytes (shared plus local; final measured value recorded in receipt). Core text exceeds AA; muted small text uses shared tokens and exceeds 4.5. Controls ≥48px; focus is 3px orange with offset and tested against adjacent surfaces.

No #879 page errors or failed runtime assets. Related-link navigation to #10 logs one inherited /favicon.ico 404 (outside authored scope), explicitly preserved in asset-diagnostics.json; no lesson script or asset is missing. Related links were followed in both locales with keyboard: #10 step2 teaches text/pattern prefix DP definitions and guards; #44 step2 teaches wildcard DP's left/above dependencies. This is preview availability/meaning evidence, not production release verification.

Remaining boundaries: independent cold review, actual learner results, native browser chrome zoom, physical devices, screen-reader speech and production/public release are unverified. This self-check does not claim any of them.

## Metadata preflight

Command from repository root: `python3 -B scripts/register_leetcode_lesson.py 879 --validate-only`.
Result: exit 0, no stdout/stderr; no registration performed. Candidate includes complexity as one nonempty time/space string, localized titles without ID, exact official URL, and existing concept anchors. Final source/test hashes are frozen in candidate-manifest.json. Any subsequent fixes require a new candidate and separate review; no previous acceptance records were changed.
