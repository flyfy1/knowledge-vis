# Independent review: 239 Sliding Window Maximum

Candidate: `190b9729fa2671ee7e1378719680d9b4ea667558`. URL: http://127.0.0.1:18770/leetcode/239/. Review run: `239-review-2-99bc6fb4`; reviewer is the current independent agent run (specific model identity unavailable). Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10. Python canonical interpretation applies. No submission or measured human comprehension is claimed.

## Cold browser walkthrough — saved before source, tests, author notes or previous reviews

Read only the frozen rubric first. Opened the actual candidate using Playwright Chromium at 1280×900. The following observations came from rendered content and controls, not implementation.

| Teaching step | Question and action | Observable result | Causal conclusion in my words |
|---|---|---|---|
| 01 See the window | What is requested? Read the small worked windows and press Next step. | `[1,3,-1] → 3` changes to `[3,-1,-3] → 3`; array shows indices above values. | Move the fixed-width interval one index; the maximum need not change when membership changes. Output order follows window starts. |
| 02 Baseline | Why avoid scanning, and why not retain just the old maximum? Read repeated scans and advance the `[9,1,2,3], k=2` demonstration. | Three overlapping scans are shown; counterexample changes `window [9,1] → 9` to `previous max 9 → expired; correct max 2`. | Rescanning repeats comparisons; one cached winner loses the alternatives needed when it leaves. |
| 03 Deque | Which candidates survive? Advance each of eight indices. | Initial empty state; i=0 gives `0:1`; i=1 removes 0 as dominated, yielding `1:3`; i=2 gives `1:3 → 2:-1`, output `[3]`; i=3 adds `3:-3`, output `[3,3]`; i=4 removes 1 expired, 3 and 2 dominated, gives `4:5`, output `[3,3,5]`; i=5 gives `4:5 → 5:3`; i=6 removes 5 and 4, gives `6:6`; i=7 gives `7:7`, final `[3,3,5,5,6,7]`. Next is disabled at end. | Store positions to detect expiry; retain smaller older values only while they may win after the front expires. A newer larger value outlasts an older smaller value, so discarding the latter is permanent. Existing outputs remain while candidate history is pruned. |
| 04 Prediction | For `[2,1,3,0], k=2`, predict deque after i=2. I selected `[2]` before clicking Reveal. | Correct feedback explains index 1 has value 1 and index 2 is newer with value 3. | Both a larger value and a later expiry justify removing index 1. This tests transfer beyond the main preset. |
| 05 Proof/Python | Why is pruning safe and cheap? Read proof, code map, and boundaries. | Text connects expired/dominated removal, append, and delayed emission to four Python operations; says each index enters/leaves once. | Increasing positions and decreasing candidate values make the front maximal; total removals cannot exceed insertions. |

Cold-read friction: trace uses `index:value` without an explicit legend; no separate before/after suboperations are selectable, but Previous plus the removal list permits reconstructing them. The initial invariant says the front is always the current window maximum even before a full window exists; interpret this as the processed partial interval. The baseline's exact scan count is `(n-k+1)k`, with O(nk) a loose bound.

Independent predictions, written before source execution: fresh `[4,1,3,2,5], k=3` should output `[4,3,5]`; after i=2 candidates are indices `[0,2]`, after i=3 index 0 expires and candidates become `[2,3]`, after i=4 both are dominated and only `[4]` remains. Counterexample to discarding all nonmaximal values: `[5,4,1], k=2` must output `[5,4]`; index 1 must survive behind index 0 to become the next maximum. UI accepts presets only, so these will be **code checks**, not custom-input UI experiments. These predictions distinguish expiry from domination and establish why an older larger candidate must be retained.

Cold capture: `239-evidence/239-review-2-99bc6fb4/cold-desktop.png` (inspection follows). Cold walkthrough saved before opening source.

## Post-cold source and computational audit

The rendered-state contract was read only after saving the cold walkthrough. `git rev-parse HEAD` returned the requested revision. `git diff --exit-code HEAD -- leetcode/239 leetcode/common.js leetcode/style.css scripts/register_leetcode_lesson.py` exited 0. Served HTML, app, core, localized copy, Python mirror, Python source, and shared CSS/common JS matched checkout bytes. Lesson asset SHA-256 receipts are in `239-evidence/239-review-2-99bc6fb4/independent-browser.json`.

Read the [official statement](https://leetcode.com/problems/sliding-window-maximum/) normally using the web reader: contiguous width-k windows moving one position right, the two official examples, and all three constraints agree with the lesson. No access bypass was used. The official selector was not independently exposed by that reader; canonical Python is used, so the additional non-Python selector/rationale gate does not apply. The local language contract and its saved `tests/evidence/official-source.txt` describe the standard `Solution.maxSlidingWindow(self, nums, k)` callable; the actual file implements that interface faithfully, rather than an analogy. No Python/TypeScript preference fallback is involved.

Read `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py`: Python's exact names are `solution.py`, `python-code.js`, and `PYTHON_SOURCE`. Inspected every test before running it. Commands run from the repository root:

- `python3 -B scripts/register_leetcode_lesson.py 239 --validate-only`: **exit 0**, no diagnostic output (also rechecked at completion). Complexity is exactly the nonempty string `O(n) time; O(k) auxiliary space`.
- `python3 -B leetcode/239/tests/test_solution.py`: passed its direct-scan fixtures and seeded random checks.
- `node leetcode/239/tests/test_core.js`: passed preset outputs and its limited monotonic-value checks. This test alone does not check highlighting or complete frame semantics.
- `OUTPUT_DIR=specs/reviews/239-evidence/239-review-2-99bc6fb4 node leetcode/239/tests/title-regression.js`: passed unchanged assertions at 320/390/736/1440, including both headings, official link, locale-preserved state, rewind/replay, prediction change, exact source transfer and offline mirror. Its JSON receipt is `results.json` in this run's evidence directory.
- `OUTPUT_DIR=specs/reviews/239-evidence/239-review-2-99bc6fb4 node leetcode/239/tests/browser-check.js`: passed; generated captures stayed in this run's directory. It checks absence of page overflow/errors, not semantic accuracy of the array highlighting.

Independent execution used the actual imported canonical Python with `python3 -B`, not a replacement implementation. Both advance predictions were confirmed: `[4,1,3,2,5],3 → [4,3,5]` and `[5,4,1],2 → [5,4]`. Additional fixtures: `[1],1 → [1]`; `[-10000,10000],1 → [-10000,10000]`; the same input with k=2 gives `[10000]`; duplicate preset gives `[4,4,4]`; negative preset gives `[-2,-2]`. Exhaustively checked **6,015** legal (array,k) pairs for lengths 1–6 over {-1,0,1}, comparing with independent slice maxima and verifying input preservation. A 100,000-element increasing input with k=50,000 returned precisely 49,999 through 99,999. These checks establish tested behavior, not submission acceptance.

Separately recomputed every core frame for all four presets and the two independent inputs: indices strictly increase and remain in `[max(0,i-k+1),i]`; values strictly decrease (ties keep the newest); front equals the independently scanned processed-window maximum; output contains precisely the full windows completed so far. The fresh input's candidate sequence after i=2/3/4 was `[0,2]`, `[2,3]`, `[4]`, as predicted. Preset final outputs were `[3,3,5,5,6,7]`, `[9,2,3]`, `[4,4,4]`, and `[-2,-2]`.

Concrete visual-to-Python mapping for the main example: before i=4, q=`[1,2,3]`, output=`[3,3]`. `i-k=1`, so `popleft()` deletes index 1. Tail comparisons remove index 3/value -3 and index 2/value -1 because each is ≤5. `q.append(4)` gives `[4]`; `i>=k-1` appends `nums[4]=5`. The rendered removal list and output match those operations; the array interval does not (finding below).

The solution does not modify `nums`. Expiration before insertion keeps at most k deque indices; an older equal value can safely be removed because the newer equal value expires later. Each index enters once and exits at most once, bounding total deque operations by O(n); Python deque endpoint operations support that bound. O(k) is auxiliary deque space, excluding the returned O(n-k+1) list. The exact baseline count is `(n-k+1)k`; O(nk) is a valid upper bound but its boundary explanation could be more precise.

Exact source parity includes the final newline: decoded mirror, rendered `textContent`, successful browser clipboard copy, downloaded bytes, offline file rendering, and manual fallback all matched canonical `solution.py`. The unchanged title regression seeded `239-fallback-sentinel`, forced clipboard-write rejection, checked focus and full selection, issued **Control+C on the actual Linux host**, and read the real clipboard back. It did not write the expected source to the clipboard as a substitute. Browser version/host and the exact transfer checks are recorded in `results.json`.

## Interaction, localization, and visual inspection

Inspected screenshots of the cold full page, middle trace at desktop/390/320, both locales, 200% CSS zoom, initial disabled controls, Chinese removals, and the repaired 320px heading. At i=3, the same deque/output survive locale switches and resizing. Values and indices remain individually readable in the inspected dense mobile frames; line wrapping of `[3,3]` at 320px does not lose values. The closed preset label fits in this browser at 210 CSS px with CSS font stack `"PingFang SC", "Microsoft YaHei", system-ui, sans-serif`; no resolved font or other-platform fit is claimed. Native control layout is allowed to wrap, while the navigation scrolls horizontally. Screenshots at 200% used `document.documentElement.style.zoom='2'` at 1280px: a **CSS layout-zoom check**, not a claimed browser-toolbar zoom test. State remained intact; sticky navigation can cover content at a particular scroll position but ordinary scrolling exposes it.

Keyboard Tab traversed links, language controls, section navigation, window/counterexample buttons, preset, trace controls, prediction, reveal, copy, download and source disclosure. Disabled initial Previous/Reset were skipped appropriately. Enter/Space advanced the trace; ArrowRight changed a radio choice and Enter revealed the correct explanation. The title regression additionally confirmed feedback is hidden when a choice changes, and that switching the independent trace preset preserves the fixed-input quiz choice. Rewind/replay recovers exact prior deque/output, reset restores empty state, and end disables further advance. These controls work even though their visual interval is wrong.

The static Chinese explanation conveys the same expiration, domination, invariant and amortized-cost reasoning as English. Acorn AST inspection found **no duplicate object keys**, and every lesson lookup entry is a two-string pair. At i=4 Chinese progress is `处理到索引 4；输出 [3, 3, 5]`, with deque `4:5`; feedback correctly explains why newer index 2/value 3 defeats index 1/value 1. However, removal reasons and counterexample readouts remain hardcoded English (minor localization friction, below).

Independent sRGB contrast calculation used weights 0.2126/0.7152/0.0722 and was calibrated on black/white=21, primary luminances, and #747474/black=4.4929480731 (below 4.5). Observed muted #9aa7b8 on stage #161b22 gives 7.07885; normal #e8edf4 on #1c2330 gives 13.39707; normal text on selected #164b59 gives 8.17062. Solid-color samples pass ordinary text contrast; this is not an exhaustive composited-pixel audit. Initial Previous/Reset use opacity .4 and are visibly faded but their labels can be read in `disabled-initial.png`; disabled controls are not assigned the active-text threshold. Focus-visible outline styling is present and keyboard traversal works.

## Findings and earlier-finding closure

### 239-R2-01 — required, high severity, open: deque trace highlights a future window

- **Candidate/context:** revision above, step 03, default `[1,3,-1,-3,5,3,6,7], k=3`; both en and zh-CN; reproduced at 1280/390/320px and 200% CSS zoom.
- **Reproduction:** reload; press the deque's Next step four times, reaching `Processed index 3; output [3,3]`. Rewind then replay, or switch locale: the contradiction remains.
- **Expected:** a completed-i=3 frame has active indices **1,2,3**, values `[3,-1,-3]`, maximum 3. Index 0 has expired; indices 4 onward have not been processed. The same highlighted-window convention is already established in step 01.
- **Actual:** cyan highlights **3,4,5**, values `[-3,5,3]`, whose maximum is 5, while deque is `1:3 → 2:-1 → 3:-3` and output ends in 3. Indices 1 and 2 get the previous/orange style although they are still candidates. At final i=7 only index 7 is highlighted rather than the full final window 5–7. Initial empty state also highlights a full window without saying it is a preview.
- **Evidence:** `state-en-1280.png`, `state-en-390.png`, `state-en-320.png`, `state-zh-320.png`, `zoom200.png`, plus DOM current/previous index receipts in `independent-browser.json`. These are settled visible state mismatches, not container-overlap or scroll artifacts.
- **Source cause:** `renderTrace()` calls `cells(..., Math.max(0,f.i), p.k)`; `cells()` interprets that position as the **left** edge. Core frame i is the processed **right** edge. Numerical trace tests therefore pass while rendering the wrong membership interval.
- **Violated requirement:** frozen correctness/interaction gates prohibit contradictory visuals; rendered-state contract §2/§5 requires one consistent frame instant and input/index mapping.
- **Owner/next action:** lesson owner must align highlighted membership with the completed frame and define initial/partial-window semantics; add a rendered membership regression covering middle, endpoint, rewind and both locales. **Fix revision: pending. Reviewer regression recheck: pending. Status: open.** No candidate repair was made during review.

### 239-R2-N1 — optional, low severity: partial English in Chinese dynamic readouts

At i=4 after switching to Chinese, the visible text is `本步移除：1 (expired), 3 (dominated), 2 (dominated)` (`zh-removals.png`). Step 02 likewise retains `previous max ... expired; correct max ...`. The surrounding Chinese prose supplies the relevant causal explanation, so this is minor friction rather than a separate missing causal bridge. Translate these dynamic strings and pair index/value notation with a short legend. Status: open recommendation.

### 239-R2-N2 — optional, low severity: qualify the baseline boundary example

Both locales say k near n makes repeated work dominate. With k=n there is only one O(n) scan; k≈n/2 is a clearer quadratic example. The O(nk) upper bound itself is valid. Recommend naming n as `len(nums)`, giving `(n-k+1)k`, and using the latter example. Status: open recommendation.

### Earlier finding 239-PUB-R1 — closed for this candidate

Read earlier reports only after the cold record was saved. The first review accepted its older revision; that is historical evidence, not this candidate's score. The later publication report required the ID in the actual localized H1. This candidate renders `#239 · Sliding Window Maximum` and `#239 · 滑动窗口最大值`, with the exact official link. The unchanged `title-regression.js` passed heading/link checks after zh→en→zh roundtrips at 320/390/736/1440 while retaining state and exact source. Inspected `en-320.png`; the title wraps completely without clipping. Thus **239-PUB-R1 is closed against 190b9729fa2671ee7e1378719680d9b4ea667558**. This does not close the newly reproduced trace finding or establish publication success.

## Scores and conclusion

| Dimension | Weight | Score | Observation-based rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 15 | 4 | Concrete sliding windows precede abstraction; indices, membership, maxima and output order are reconstructable. |
| Causal derivation/saved work | 20 | 4 | Repeated scanning, stale-winner counterexample, later-larger domination and once-in/once-out accounting explain the optimization. |
| Maintained state/correctness | 20 | 3 | Canonical code and all independently checked deque frames preserve the invariant; simultaneous array membership contradicts that correct state. |
| Interaction/visual meaning | 20 | 2 | Prediction, history, replay and endpoints work, but the central highlight describes another interval, so essential state meaning is unreliable. |
| Python/cost | 15 | 4 | Faithful executable Python, independently predicted inputs, exhaustive/boundary checks, nonmutation, exact transfer and O(n)/O(k) auxiliary accounting verified. |
| Bilingual/device | 10 | 3 | Equivalent main reasoning and retained state across layouts/locales; readable narrow states and keyboard interaction, with partially untranslated dynamic reasons. |

Weighted total: **82.5/100**. Required open IDs: **239-R2-01**. Outcome: **changes_required**. The total is below 85, interaction is below 3, and a required visual correctness finding remains open; passing computational and transfer checks cannot override it.

Limitations: local Chromium/Linux only; 200% checked via CSS layout zoom rather than browser toolbar; official statement reader did not expose the language selector; no human learner study, LeetCode submission, or public deployment verification. No implementation, shared file, test, prior evidence, registration, service, Git configuration, or earlier report was changed. All newly written evidence is confined to this run's exclusive evidence directory and this exact report.
