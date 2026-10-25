# #699 Falling Squares — author candidate v1

2026-10-25. Author self-check only; separate lesson review pending.
Product verdict: reuse /leetcode/<id>/, shared style.css/common.js and approved
five-part lesson shell. Design authority: specs/reviews/leetcode-all-hard-design-review.md
and dispatcher D1–D10. No new product or universal renderer. Category computing;
stage university. Reader knows Python loops/lists and wants to derive a faithful
solution. Smallest useful outcome: compute support heights, reject edge contact,
state the invariant, predict a fresh bridge, implement the official callable.

Official source: https://leetcode.com/problems/falling-squares/ . Public GraphQL
capture with access timestamp, full statement, examples and all starter interfaces:
provenance/official.json. Python3 observed: Solution.fallingSquares(self,
positions: list[list[int]]) -> list[int]. Python chosen by preference. Also observed
Python, JavaScript, TypeScript and other native interfaces retained in capture.
1 <= n <= 1000; 1 <= left <= 10^8; 1 <= side <= 10^6. Squares drop in input order,
freeze when supported from below; side brushing does not count. Output is running
global height after each drop, not each square's top. Empty input outside contract;
no required input mutation. Official examples [[1,2],[2,3],[6,1]] -> [2,5,5] and
[[100,100],[200,100]] -> [100,100]. No modulus, rotations or removal operations.

## Five-field sequence

|Step|Already known|Single question|Input → sought quantity|Action → expected observation|Conditions|
|---|---|---|---|---|---|
|0|Two coordinates and square side|Where does the next square stop?|[[1,2],[2,2]] → base 2, top 4|Change second left between 2/3/4, keep side 2; base changes from 2 to 0 at edge contact|Rigid square; positive-width support only|
|1|Hand support and running maximum|Which past information suffices?|Same input → interval plus top per square|Read unit-column baseline and interval counterexamples; compare top vs global height|Integer endpoints permit unit columns; use strict interval overlap|
|2|Intervals and stored tops|Why is the maximum overlapping top the exact base?|Small preset → each test, base-so-far, frozen geometry and running output|Prepare/test/land, back/reset/end, change preset explicitly resets; see each candidate's before/after base and retained landed squares|All earlier tops correct; no square moves; no omitted preset operations|
|3|Invariant: exact earlier top heights|Can the rule transfer across a gap?|Fresh [[1,3],[6,2],[3,4],[7,1]] → fourth base/top/global|Choose then reveal; changing choice hides stale feedback; locale keeps choice/reveal|Positive overlap over a portion supports whole rigid square|
|4|Exact base and top recurrence|How does the proof map to Python and costs?|Official positions → running heights|Read/copy/fallback/download exact source|Valid inputs; 499500 pair tests max; O(n²) time O(n) auxiliary space|

## First-use terms and dependency order
Step0: footprint = horizontal occupied interval; base = bottom height; top = base+side;
global height = tallest top so far. Half-open [L,R) excludes the endpoint solely
for overlap tests, not removing the physical edge. Step1: overlap = common width
strictly >0; skyline = tallest occupied height above each x; unit column [x,x+1).
Step2 repeats intervals/base/top and defines invariant = assertion preserved after
every drop, base-so-far = max only among candidates already tested. Step4 repeats
landed=(left,right,top), base, top, highest and n. All local readouts use same units.

## Causal chain and alternative
Unit-column skyline baseline explicitly executable: scan each column for maximum,
then assign top across footprint, record global max. O(sum of side lengths) work
and at most that many stored columns; up to 10^9 column visits per pass. Replace
width-dependent work with one test per prior square, never recompute a frozen top.
At n=1000, pair scan uses 499500 tests; no claim of asymptotic optimality. A segment
tree would reduce asymptotic time but is unnecessary here and deferred to avoid
unmotivated machinery. Wrong global-base rule: disjoint [[1,2],[4,1]] has [2,2],
not [2,3]. Wrong non-strict overlap: [[1,2],[3,2]] gives [2,2], not [2,4].
Proof: at any higher base no intersecting square touches; at maximum overlapping
top one supports it; any lower base intersects that square. Hidden old tops cannot
inflate the result because something covering them has at least as high a top.
Induct over drops starting with ground 0; highest=max(previous highest,new top).

## State/render contract
Small complete presets only, no arbitrary input or autoplay. Each snapshot is
before tests (ready), after one overlap test, or after landing. Tests retain
candidate identity and its own top, overlap bounds, base before/after. Diagram
contains only frozen squares, with immutable 1-based IDs; active footprint is
textual, no provisional square falsely shown as landed. X and Y are equal-scale
geometric coordinates; viewBox fits preset, graphical labels may be followed via
keyboard-scrollable region on phones; full coordinates and numbers in text/table.
Global output ledger accumulates. Deep snapshots; rewind selects complete state.
Trace simulation is explicitly separate from actual Python execution. Tutorial
history uses O(n²) snapshots of O(n) state for tiny presets, not solution memory.
Quiz is separate, fixed option order; preset/reset never changes it. Locale changes
preserve all inputs, indices, reveal, disclosure, fallback selection and focus.
Clipboard denial shows readonly full selectable source; blocked storage uses common
locale memory fallback. No runtime fetch: loading/reconnect states inapplicable.

## Exact token/layout contract
Reuse shared --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547,
--text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454,
--good #7ee2a8, --bad #ff7a93; no added palette values or shadows. Existing
system font stack, 1.75 line-height, 952px content, 24/16px gutters, 8px controls,
14px stages. Local override 48px controls, disabled opacity 1, explicit muted
text; 3px accent2 focus / 4px offset. SVG labels 16px at fixed min-width 500px;
contained scroll justified by physical coordinates and paired textual data.
No motion. CSS total <25000 bytes. Shared source-code pre color inherited.

## Priorities and evidence plan
P0 / highest-return 20%: hand support boundary, candidate-by-candidate causality,
proof, bilingual truth, executable Python and exact transfer. P1: deep related
anchors, convenient source. P2: none. Deferred: segment-tree implementation (not
needed at verified n), general editor (validation distracts), motion (no benefit),
shared registry/concept map (outside authorized ownership).
Independent oracle is coordinate-compressed skyline assignment, separate from
pair-overlap recurrence. Exhaustive small sequences, seeded larger cases, maximum
n and closed forms; compare every prefix, no mutation, intermediate JS snapshots
and base accounting. Browser both locales, all presets, endpoints/rewind/replay,
every prediction option and changes, storage denied, native/fallback clipboard,
source/download bytes, keyboard/focus, internal anchors, local asset failures,
320/390/736/1440px, 200% zoom, contrast, visually inspected screenshots. All output
runners accept LESSON_OUTPUT_DIR. Run safe metadata preflight from root. Freeze
candidate hashes for separate reviewer. No actual novice results, LeetCode
submission acceptance, independent acceptance, production or real-device claims.

## Candidate v2 — author self-check repair

The supplemental hit-target measurement found shared `.btn` specificity left
buttons at 46px despite a local element rule asking for 48px. Local `.btn` and
`.site-head .official-link` now explicitly set min-height:48px; CSS query is v2.
This is an author repair before independent review. Canonical source, algorithm,
metadata and teaching claims unchanged. All affected browser checks rerun.
