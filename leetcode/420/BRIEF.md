# #420 Strong Password Checker — author brief

Reuse verdict: build one lesson in the existing LeetCode collection, category computing,
stage university. Reader knows loops and integer division; wants to reconstruct a
minimum-edit solution. Approved pattern and adjudication:
../../specs/reviews/leetcode-all-hard-design-review.md. This is author work only;
independent problem review is pending. No new product/layout review is claimed.

Official contract verified 2026-10-25 via public GraphQL (provenance/official.json):
1–50 ASCII letters/digits/dot/exclamation, target length 6–20, all three required
character classes, no equal triple. Insert/delete/replace each cost one; already
strong returns zero. Official examples a→5, aA1→3, 1337C0d3→0. Python3 selector
snippet explicitly supports Solution.strongPasswordChecker(self,password:str)->int.
Python preferred; no language exception needed. No actual submission is claimed.

Learning loop: calculate aaaB1 by hand → distinguish overlapping repairs → inspect
run lengths → allocate compulsory deletions → predict a new allocation → map code.

## Exact tokens and scope
Use ../style.css unchanged: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. Existing system font stack,
1.75 line height, 952px content, 8/14px radii; shared spacing and responsive
breakpoint 560px. Local CSS uses these exact tokens. 48px controls; 3px accent2
focus with 4px offset. No motion. Retain sticky numbered navigation.
P0: causal explanation, run ledger, source parity, both languages, complete tests.
P1: reversible run allocation presets and independent transfer. P2: none.
Highest return 20%: show floor(L/3) before/after each deletion, with its cost.
Deferred: free-form password entry (presets isolate the mechanism), playback and
animation (no learning gain), production and real-device verification (not authorized).

## Steps (five required fields each)
0. Known: strings/edits. Question: can one edit repair two faults? Input/output:
aaaB1 → minimum edits. Action: toggle insertion location; compare aaaB1x with
aa0aB1 and their remaining faults. Conditions: these exact strings; demonstrate
one valid insertion and length lower bound, not a general insertion heuristic.
1. Known: one edit can overlap faults. Question: how many repairs does a run need?
Input/output: run length L=3…8 → replacement demand floor(L/3). Action: change L,
see groups of three and explicit replacement construction. Conditions: length
already legal; replacements can introduce missing classes. Baseline: edit-distance
to accepted strings via finite-state DP; retained as test oracle, more work than scan.
2. Known: run demand. Question: where should compulsory deletions go? Input/output:
selected password → deletion budget, remaining run lengths, replacement lower bound.
Action: forward/back/reset/end; see all run cards old/current and retained ledger.
Conditions: n>20; spend cheapest first (L mod 3 =0, then1, then groups of3),
remaining deletions neutral. Short/legal presets expose the other formula branches.
3. Known: deletion exchange rule. Question: allocate a fresh four deletions?
Input/output: zzzzQQQQQQQQ + (bC7)×4 (length24) → minimal edits. Action:
choose before reveal, then change; reveal clears on choice change, locale preserves.
Conditions: fresh case, all classes present, four deletions cannot buy two savings (cost at least five).
4. Known: all branches. Question: how does the proof become code? Input/output:
canonical Python → integer minimum. Action: inspect/copy/download; source map and
boundaries. Conditions: official ASCII domain, code O(n) time/O(1) auxiliary space;
browser snapshots are a separate simulation with O(n²) teaching storage worst case.

## Terms at first use (redefined at each relevant step)
Edit (step0): insert/delete/replace one character, one operation.
Missing class M (step1/2/4): how many of lowercase/uppercase/digit are absent.
Run L (step1/2/4): maximal adjacent block of one equal character.
Replacement demand R (step1/2/4): sum floor(L/3) with fixed length.
Remainder (step2/3): leftover after division by three, governs next saving cost.
Invariant (step2/4): after each cheapest saving, no other spending of the same
number of deletions can leave smaller replacement demand.

## State/lifecycle and validation
Each preset restarts trace only; transfer independent. Deep immutable snapshots;
no timers/network loading. Initial/intermediate/final and disabled endpoints are
localized. Selection/reveal and copy success/manual fallback localized; locale
preserves all state and focus. No empty/error/reconnect branch in fixed offline
simulation. Clipboard denial shows exact readonly source. Official captures are
review material only, never runtime assets. Tests accept OUTPUT_DIR; canonical
Python checked against independently derived edit-DP oracle plus exhaustive
run-deletion allocations, boundaries and seeded cases. Real browser covers both
locales, controls, widths, 200% zoom, keyboard, contrast and local requests.

## Revision 2026-11-11

Review (review-range-2, B=2, G=2): `shortProof` said a length-5 run has "only one class present, so M=2", false for `.....`/`!!!!!` (M=3); after the aaaB1 opening, max(M,R) and the remainder priority were announced; the deletion lab had 3 frames.
Changes: `shortProof` rewritten in both languages (a length-5 run holds at most one class, so M≥2; both lower bounds and the construction aaaaa → aaBaaa → aaBaa1 stated). Step 02: new aaaaaa experiment (R=2, M=2; plan "break then add classes" = 4 edits vs aaBaa1 = 2) before max(M,R) is stated; `overlap` now gives the lower-bound argument and the aaaaaaaaa → aaBaa1aab check (3 edits). Step 03: new hand-allocation lab on aaa|BBBB|ccccc (D=4) where the learner spends deletions and sees R; the 1/2/3 remainder price is revealed after it (collapsible), then the priority rule. Related link Candy now points at 135#step2 (the two-direction lower bound). Learner-facing review-status footer/limits text removed.
Changed by Claude Code (claude-opus-5-5), 2026-11-11, in the working tree (uncommitted).
Verified: all corrected values recomputed with solution.py (aaaaaa 2, aaaaaaaaa 3, preset 24-char 5, ..... 3, aaaaa 2, quiz 6); test_solution.py (C++ edit-distance oracle), test_core.cjs, browser.cjs (now honours LESSON_BASE_URL and exercises the two new labs) pass; zh/en at 1280/390/320 inspected, no overflow or console errors.
