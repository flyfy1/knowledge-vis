# Author self-check — candidate 140-1

Scope: only leetcode/140/. Author implementation and self-check; separate reviewer pending. The reused design approval is recorded in specs/reviews/leetcode-all-hard-design-review.md; it does not accept this lesson.

Official evidence: tests/evidence/official-graphql.json and official-access.md, captured from the unauthenticated official public endpoint on 2026-10-18. Python3 selector and exact callable verified. No paywall bypass, LeetCode submission, independent acceptance, registration or deployment.

Commands run from repository root:

- `python3 -B leetcode/140/tests/test_solution.py` — PASS, 8,424 checks; 8,414 exhaustive/seeded oracle fixtures plus explicit official, boundary, transfer and constraint cases. Canonical Python executed directly; dictionary input unchanged; no duplicate outputs; exact mirror equality.
- `node leetcode/140/tests/test_core.cjs` — PASS, 8,414 cases; every completed suffix equals a separately enumerated cut-mask oracle, legal rightward dependencies, before/added/after consistency, candidate count, independent snapshot arrays.
- `node leetcode/140/tests/browser.cjs` — PASS, 266 trace transitions across both locales and all seven presets; endpoint/reset/range/back checks; prediction/reveal/change; locale preservation; real clipboard read/write and intentional denial fallback; displayed/downloaded source parity; keyboard focus/activation; sticky-anchor geometry and related-link targets; denied storage and offline local-file operation; 320/390/736/1440 viewports, 200% CSS layout zoom; forced-colors focus retained; visible action controls measured at least 48px; no external requests, asset failures or runtime errors. Result and screenshots in tests/evidence/.
- `python3 -B scripts/register_leetcode_lesson.py 140 --validate-only` — PASS, exit 0, no output. This was the safe preflight, not registration. Complexity is one string; all local concept anchors exist.

Shipped CSS is shared 9,425 bytes plus the local file (exact total recorded in frozen-candidate.json), below 25,000 bytes. No fonts or other external runtime assets. Exact inherited palette retained. Measured normal/disabled text minimum 6.449:1 (secondary labels/disabled content), explanatory text 12.616:1, primary text 16.087:1, focus against panel2 8.937:1. See contrast.json. Normal essential text exceeds AA; secondary text does not reach the optional 7:1 target.

Visual inspection: opened desktop EN/zh, 736 EN/zh, 390 EN/zh, 320 EN/zh and 200% screenshots. Confirmed suffix labels and strings remain readable, lists wrap/reflow, before/new/after align with completed candidate, and disabled controls visibly differ. Narrow navigation intentionally scrolls horizontally; core content does not overflow. Zoom ledger captures specifically expose the populated diagram. During author iteration, visual inspection found the primary disabled button inherited active colors; local specificity fixed. A test attempted Finish at an already finished endpoint; the harness now guards that action. Final reports refer to the corrected run.

Author teaching-path reconstruction (not learner evidence):

1. aaa has four cut masks, exactly three legal sentences. Longest-first loses two answers.
2. F[3]=[""] is one completion, so the last word can be produced; F[1] has two sentences and both must survive into F[0].
3. A candidate absent from the dictionary adds nothing; a word with an impossible tail also adds nothing. A partial F[i] is only complete after all candidate ends are tested. Back/forward restores the retained ledger.
4. In abab, first a contributes three tails and first ab contributes two. Both families are required by the invariant.
5. Right-to-left loops ensure all tail lists are complete. Membership excludes illegal first words; the tail loop preserves all completions. Building output strings can dominate time and storage, even for suffixes unreachable from index 0.

Limits: no physical-device, native browser-menu zoom, screen-reader user session, novice teach-back, independent teaching review, public release or LeetCode acceptance is claimed. CSS layout zoom was exercised in real Chromium. Browser history storage is teaching overhead, explicitly separate from canonical Python cost. Review next: a separate cold walkthrough of the frozen candidate under the six-dimension rubric.
