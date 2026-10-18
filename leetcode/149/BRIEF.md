# #149 Max Points on a Line — author brief

Product verdict: reuse the existing LeetCode collection lesson, for a reader who knows Python loops, integer arithmetic and dictionaries. Category computing / algorithms; stage university. Smallest outcome: hand-count a line, derive exact direction buckets, predict a new case and reconstruct `Solution.maxPoints`.

The approved pattern and dispatcher decisions are in ../../specs/reviews/leetcode-all-hard-design-review.md. Apply the website-design skill read from /home/songyy/Documents/agent-skills/website-design/SKILL.md; no new product/layout gate is opened. Author run only; separate review remains pending. Only this folder is owned. Related concepts are proposed in lesson-entry.json; shared registration is left to the dispatcher.

Official verified 2026-10-18 through public GraphQL and official page. Full response and exact Python3 selector template are in provenance/. n=1..300, integer coordinates -10000..10000, unique points, return integer maximum, no mutation. Empty/duplicate inputs excluded. Official examples return 3 and 4. Python is a faithful official interface.

## Teaching sequence (five fields per step)

| Step | Already known | Single question | Input → sought quantity | Action → observation | Conditions |
|---|---|---|---|---|---|
|0 Hand count|coordinates and straight lines|How many pins can one ruler cover?|[(0,0),(2,1),(4,2),(1,3)] → 3|Read rises/runs 1/2 and 2/4; compare the off-line point|Distinct integer points; all candidates considered by cubic pair-line baseline|
|1 Exact grouping|same line through an anchor|What summary replaces repeated third-point tests?|anchor and displacements → normalized (dy,dx)|Follow gcd division, opposite direction sign flip, vertical/horizontal cases|Same anchor; uniqueness means no zero vector; directions alone cannot group parallel lines across anchors|
|2 Reversible trace|direction key|How do counts accumulate without losing a valid line?|all later peers for each anchor → bucket counts and running maximum|Choose preset (restarts); advance; inspect new edge, before→after ledger and retained anchor results; rewind restores all|Small complete simulations, j>i; no omitted operations; browser does not execute Python|
|3 Transfer|bucket invariant, anchor counted once|Which peers share an undirected line through a fresh anchor?|A=(2,2), B=(0,0), C=(4,4), D=(3,2) → best count|Predict then reveal; change choice clears feedback; locale retains state|Separate fixed exercise; opposite rays must merge; other line excluded|
|4 Proof and code|counts for each fixed anchor|Why does scanning suffixes find the global maximum?|earliest index on an optimal line → included peers|Map one update to Python; open/copy/download exact source|Dictionary expected O(1); gcd logarithmic in coordinate bound; unique nonempty input|

## First-use terms and dependencies
- Step 0: coordinates (x horizontal, y vertical); collinear = on one straight line; determinant test = cross multiplication of displacements.
- Step 1: anchor = fixed input point; displacement dx,dy = coordinate difference; direction key = reduced (dy,dx); gcd = largest common divisor of absolute displacements; bucket = dictionary entry counting peers with a key. Define again locally in later sections.
- Step 2: i,j zero-based input indices; counts exclude anchor, local includes it; best is maximum found so far, not necessarily final; processed peers and completed anchor results retained.
- Step 3: opposite rays are both parts of one full line; key signs are normalized.
- Step 4: invariant = statement true after every peer update; earliest-index proof bridges suffix scan to every possible optimal line.

Wrong rules: raw pairs split (1,2) and (2,4); oriented signs split opposite rays; a global direction map merges parallel lines [(0,0),(1,1),(0,1),(1,2)] despite true maximum 2. Avoid floating slopes and division by zero by exact integer keys. Baseline tests pair-defined lines with cross products, independent of direction normalization.

## Visual/state contract
SVG coordinates are actual x/y, not array position; node labels are input indices, textual coordinate list is adjacent. Anchor A, newest peer T, processed peers and pending peers have text labels as well as stroke/fill. Cumulative current-anchor ledger and bucket memberships persist; completed-anchor ledger persists across anchor resets. Every frame is a deep snapshot after one anchor setup or peer insertion. Local count always includes the anchor. A start frame has an empty map and local=1. Single-point case is immediately final. No animations, timers, runtime fetches or editable data. Locale retains index/preset/answer/reveal/details/focus. Preset/reset do not touch the independent quiz. Reset resets current preset only.

Fresh exercise answer order is fixed; correct choice is option 1 (index 1), not preselected. Reveal disabled before selection; no derived answer in hidden markup. Copy success and clipboard denial/manual selection are bilingual. No loading/reconnect state for static data. Noscript has bilingual recovery plus canonical file.

## Exact token contract
Reuse ../style.css unchanged: bg #0d1117; panel #161b22; panel2 #1c2330; line #2b3547; text #e8edf4; muted #9aa7b8; accent #6ee7ff; accent2 #ffb454; good #7ee2a8; bad #ff7a93. Existing system font stack and 1.75 line-height; h1 clamp(28px,5vw,46px), h2 clamp(23px,3.5vw,32px), 13px metadata, 14px hints. Local sizing: 48px controls; 3px accent2 focus + 4px offset; inherited 8/14px radii; 8/12/16/20/24px spacing. No new color values. Plot uses 420×330 viewBox and contained horizontal scrolling on phones so labels stay readable. No ambient motion/shadows/assets. CSS budget counts shared + local <25000 bytes.

P0/highest-return: causal exact-key explanation, truthful geometry, complete reversible counts, two locales, source parity and real browser/oracle evidence. P1: related links and anchor history. P2: none. Deferred: arbitrary input editor (adds validation without need), live Python runtime (static simulation is sufficient), autoplay (no benefit), deployment and independent learner/reviewer claims (separate authority).

## Verification and scope
Use independently derived cross-product oracle for canonical Python and JS trace, exhaustive subsets of a small integer grid, seeded random sets, every intermediate bucket membership, official samples, singleton, vertical/horizontal, opposite directions, parallel lines, large coordinates, n=300. Browser: both locales, all presets, endpoints/rewind/reset/range, quiz choice/reveal/change, locale cross-paths, clipboard success/denial, blocked storage, keyboard/focus, deep links, offline source, source/download parity, widths 320/390/736/1440 and 200% zoom; inspect screenshots. Tests accept OUTPUT_DIR, default tests/evidence. Record contrast and asset/CSS checks. This is self-check evidence only; no independent acceptance, actual learner result, live-device or public-delivery claim.
