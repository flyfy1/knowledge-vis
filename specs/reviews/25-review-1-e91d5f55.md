# Independent review: 25 — Reverse Nodes in k-Group

Candidate: `d0550319ff0380d29aad9f323a80b119c6e9cd98`. URL: http://127.0.0.1:18770/leetcode/25/. Review date: 2026-10-18. Target: basic Python, lists, loops, functions and elementary recursion. Reviewer: this independent review run; exact model identity unavailable. Frozen rubric: `specs/leetcode-review-gates.md`; weights 15/20/20/20/15/10. Applicable code dimension: faithful Python submission.

## Cold browser walkthrough (saved before source, tests, briefs or earlier reviews)

Used real Chromium through Playwright, desktop 1280×900. Read only frozen rubric before visiting. Inspected the initial full-page screenshot `01-cold-desktop.png`. Page has five teaching steps; this record uses rendered explanations, not author notes.

| Step / question | Action | Observable result | My causal conclusion |
|---|---|---|---|
| 01: What is the transformation? | Read statement, constraints and hand example; manually group five values. | `[1,2,3,4,5],2` gives `[2,1,4,3,5]`; k=3 gives `[3,2,1,4,5]`. Baseline collects node objects and relinks them. | Only full groups reverse; values stay on their original objects. Array storage costs O(n), so the optimization saves storage rather than improving asymptotic time. |
| 02: How can pointers replace the array? | Read explanation of dummy, kth, suffix and saved nxt. | Dummy supplies a predecessor; kth is checked before mutation; group_next saves the suffix; nxt is saved before overwriting next. | Losing the old next would lose access to remaining work. Starting prev at the suffix attaches the eventual group tail immediately. The prose gives this mechanism abstractly, without concrete pointer values before the interactive step. |
| 03: What does a rewire do? | Open previous-state, focused-code and history disclosures; advance all nine events on Pairs. | Event 1: group_prev=-1, kth=1, group_next=2, prev=2,curr=0. Event 2 changes #0.next from #1 to #2; prev=0,curr=nxt=1. Event 3 changes #1.next to #0; prev=1,curr=2. Event 4 changes entry from #0 to #1, group_prev=0. Events 5–8 similarly reverse #2/#3 and change #0.next to #3. Event 9 leaves #4 unchanged; result `[2,1,4,3,5]`. | Every object stays displayed even when disconnected from entry. Stable IDs distinguish data from edge changes. Python `nxt=curr.next; curr.next=prev; prev,curr=curr,nxt` explains events 2/3. The reversed fragment ends at saved suffix; curr retains the unprocessed fragment. Reconnecting predecessor makes the completed prefix reachable. |
| 03: Can I recover prior states? | Rewind from event 9, then restart. | Rewind restores event 8 and its previous frame; history retains six events. Restart gives position 0. | Frames are reversible teaching snapshots, not an irreversible execution debugger. |
| 04: Can equal values conceal wrong behavior? | Before reveal predicted `#1 → #0 → #2`; selected it, checked; changed to first answer and checked again. | Correct feedback explains equal-valued objects swap. Changing selection clears feedback. Wrong feedback says unchanged values do not establish object reversal. | The exercise tests identity rather than merely recalling output values. |
| 05: How does this map to executable Python? | Read mapping/cost/boundaries; expand complete Python solution. | Table maps IDs to objects and names to pointer roles. Code uses kth preflight, saved nxt, local rewiring and predecessor reconnection; claims O(n) time/O(1) space. | Each node in a full group is scanned and rewired once; constant pointers suffice. kth failure before mutation preserves any incomplete suffix. |

Cold predictions recorded before reveal/source: independently chosen `[6,2,7,1,9], k=3` should yield `[7,2,6,1,9]`. Tempting wrong rule “reverse the last partial group too” would yield `[7,2,6,9,1]` and violate the unchanged-suffix condition. The UI is preset-only: this fresh input and counterexample are pending **code checks**, not custom UI experiments. Visible exercise prediction/reveal was checked as described above. No source has yet been opened. Initial impression: reconstructable mechanism with some linked-list vocabulary friction; the pointer-level worked example follows abstraction, while the introductory hand example covers only final grouping.

## Source and verification audit

### Build and official contract

`git rev-parse HEAD` equals the requested revision. Browser-fetched bytes matched the working-tree bytes for index.html, app.js, copy.js, solution.py, python-code.js, common.js, style.css and all three shared hard-first-ten runtime/style files. No candidate files were edited. Important SHA-256 fingerprints:

| Asset | SHA-256 |
|---|---|
| 25/index.html | b03f7179007e9bfa3692db8bcbb513f241b57561016945cf14195f1ce29a32ed |
| 25/copy.js | 3bf1cf8fac60470624a5fd4b3b6a8028da68c59897880dbe45dd2d85708be78c |
| 25/solution.py | f66bea0ffd8a6d0951fbee5abe59b13c9e363f0fa8e940ab9f3bfff7064fb999 |
| 25/python-code.js | 96ad37b0b4d31a40be5b82319b3615e010b41e590b1694bc080fc819c9f7415c |
| hard-first-ten/core.js | 342d7cbdf8c1e6f8527e6804ec286157e8fc63513a3c36c61d67c496bd08eeed |
| hard-first-ten/lesson.js | 18365da600d3a774aec9afb96deb377fa269fe894424ed6cef41ad9f929c9731 |
| hard-first-ten/style.css | 09ebfd4c560ceee4b5c4e15442f37e21e8a9115525f20c74c1a34491af6a48b1 |

Opened the [official statement](https://leetcode.com/problems/reverse-nodes-in-k-group/) normally using the web tool, without access circumvention. It confirms grouped node reversal, unchanged partial suffix, no value changes, n/k/value limits, and the constant-extra-space follow-up. The lesson matches these requirements. Canonical code is Python `Solution.reverseKGroup(self, head, k)`, returning the new head and using judge-provided ListNode; this is a faithful linked-node interface, not an array-returning conceptual analogy. There is no non-Python solution or language-contract.json here, so non-Python language-selector/evidence requirements do not apply. Read `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py: Python canonical/mirror/export are solution.py / python-code.js / PYTHON_SOURCE.

Exact parity passed for canonical file, decoded offline mirror, browser embedded PYTHON_SOURCE, displayed code text, successful clipboard contents, actual downloaded solution.py bytes, and denied-clipboard fallback textarea. Download filename was solution.py. The signature's quoted ListNode annotation is compatible with judge-supplied nodes; the test harness supplied only that class, then imported and executed the actual canonical file.

### Independent computational checks

Inspected leetcode/tests/test_hard_solutions.py, test_hard_core.cjs and the relevant browser suite paths before executing any checks. Python author tests cover every legal k for sizes 1–34 with seeded duplicate values, object-order/unchanged-value/cycle checks, and n=5000 full reversal. Shared core tests check final identity order and post-operation prev/curr timing; browser tests exercise presets, locales, endpoints, copy, widths and fallback. Their aggregate counts cover ten problems and are not adopted as this lesson's independent evidence. They were not rerun or regenerated; independent inline checks below avoid all author evidence destinations.

Executed actual solution.py with Python 3 (the `python` alias was absent; retried successfully with python3 -B). **3,598 independent cases passed**: every binary-valued list of lengths 1–8 and every legal k; the fresh predicted input; equal-valued objects; single node; values 0 and 1000; n=5000 at k=1,2,3,2499,2500,4999,5000; plus empty input as robustness outside official constraints. Every check compared the returned object sequence to independent chunk reversal, checked unchanged values on original objects, and rejected cycles or lost/new output nodes. The fresh case returned `[7,2,6,1,9]`, with the last two original objects and their link order retained. Thus the predicted counterexample to reversing a partial group is confirmed as a **code check**, not a custom UI input.

Independently exercised the actual JavaScript core on **171 inputs** (all k for n=1–18), examining **2,910 transitions**. Checked final ID order against an independent chunk oracle, unchanged values/input, each saved nxt against the preceding frame's old link, exactly one changed next during a rewire, prev=changed and curr=nxt after advancement, unchanged entry during internal reversal, unchanged links on the short-group stop, and independence of the initial snapshot after modifying the final snapshot in memory. No failures.

Correctness reconstruction: before a group, the completed prefix is correctly ordered and group_prev is its final node (dummy initially). Preflight reaches kth without altering links; failure preserves the whole suffix. Inside reversal, prev heads the already reversed portion ending at group_next, while curr and saved nxt retain access to unfinished nodes. Saving nxt before the overwrite avoids losing them. When curr reaches group_next, kth is new group head and old_head is its tail; predecessor reconnection restores reachability and advances the prefix by exactly k nodes. Positive k guarantees progress, including k=1. The next preflight eventually fails. Two passes per full group plus at most one partial scan give O(n) time. Constant references and one dummy give O(1) auxiliary space. Values are never assigned; node identities are reused. Trace snapshots intentionally use extra storage and are explicitly described as a JavaScript model, not the Python algorithm's memory use.

### Browser, translation and device checks

Real Chromium used Playwright from NODE_PATH and the executable from PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Both languages and all four presets were operated: endpoints were `[2,1,4,3,5]`, `[3,2,1,4,5]`, `[2,2,3,3]` (distinct IDs reversed), and `[1,2]`. Initial rewind and terminal next were disabled. Next/rewind/next reproduced exact frames, reset restored initial frames, changing preset restarted the trace. All three quiz choices gave causal feedback in both languages; changing choice removed stale feedback. Trace index, preset, frame, quiz choice and revealed state survived language changes and resizing, as did opened disclosures. Language-switch focus stayed on the toggle.

Operated range Home, ArrowRight and End; Next with Enter; Previous with Space; Tab reached Reset with a visible 3px orange outline. At 320px, navigation to the experiment left its heading about 97px below the sticky navigation in both languages. Controls wrapped and stayed readable. Both locales were examined at 320/390/1280px with no document overflow. Node cards wrap without hiding IDs or links; actual order is encoded by entry/next labels rather than card position. Expanded source is horizontally scrollable (286px container, 717px content at 320px), preserving exact code. At 200% **CSS zoom**, both languages reflowed without page overflow; English trace position remained 3. This checks enlarged layout, not OS magnification or a browser-chrome zoom shortcut.

Read the Chinese statement, hand example, derivation, invariant, event captions, boundaries, mapping, costs and all feedback against English; no material reasoning mismatch found. IDs and variable names remain shared. Clipboard/storage denial still loaded the Chinese lesson, exposed exact source in a selected readonly textarea, and localized the failure message when switched to English. No page errors in the principal browser run.

Captured and visually inspected every screenshot created in this run: initial page, cold rewire, six locale/width trace views, disabled start, both 200% views, copy fallback, both 320px controls and both 320px source views. Initial/full-page captures are context evidence; focused viewport captures support readability judgments. Sticky navigation can appear across a full-page stitched image; this is not treated as live content occlusion.

Contrast calculated from actual style colors: body text/background about 16.09:1; muted text/panel about 7.08:1. Disabled Rewind at opacity 0.4 composites to about 3.30:1 against its button background: legible in the inspected screenshot but visibly faint. This is an optional readability improvement, not asserted to violate an enabled-control WCAG requirement.

### Earlier review evidence

Only after saving the cold walkthrough, read specs/reviews/leetcode-first-ten-review.md. It explicitly identifies itself as implementation self-review, with no prior independent acceptance or stable required IDs for this lesson. Its historical reverse-list issue (rewired links paired with pre-advancement prev/curr) is absent in this candidate: cold Pairs events 2/3 and all independent rewire-transition checks show post-operation prev=changed, curr=nxt. Its dummy/identity concern is also rechecked against visible −1/∅ definitions and fixed IDs. These are explicit current-candidate regression observations, not a retroactive independent approval of the historical report. No earlier independent required finding is being closed.

## Findings

### 25-R1 — required, high: missing linked-node prerequisite and concrete introduction before pointer abstraction

Status: **open**. Candidate: d0550319ff0380d29aad9f323a80b119c6e9cd98. Sections 01–02; both English and Chinese; reproduced at desktop 1280×900, independent of preset (initial Pairs).

Reproduction: open the lesson fresh, read section 01 and continue into section 02 before entering the experiment. Section 01 immediately says to change next pointers, then presents `head.next`, node objects and `a.next=b` in baseline code. Its hand-worked example only groups/reorders number arrays. Section 02 immediately introduces dummy, predecessor, kth, group_next, prev, curr and nxt. No preceding tiny object diagram or value-by-value pointer calculation explains a linked node as a value plus a next reference, head as the first reference, None as the terminator, or why assigning `a.next=b` differs from changing a Python list slot. The first concrete before/after next values arrive in section 03, after the abstraction. Screenshot 01-cold-desktop.png and the saved cold observations establish the original sequence; source copy.js/index.html confirm it is the same in both locales. The cross-link to a merging lesson is neither an inline prerequisite explanation nor a substitute for this lesson's cold walk.

Expected: for the stated audience, introduce a two- or three-node list with concrete IDs, values, head and None, manually change one next reference while retaining the saved successor, then derive the generalized variable roles. Show the short-suffix exception in that model before abstracting the group algorithm. Actual: the reader must supply linked-list/reference knowledge beyond basic Python lists, loops and functions to interpret the otherwise correct causal prose.

Violated requirements: frozen dimension 1 (terms and hand calculation), and detailed-teaching requirement for explained new terms, gradual complexity, and a vivid hand-worked tiny example before abstraction. This is an essential prerequisite bridge, not a request for additional section headings or more tests. Owner/next action: lesson author; add the bilingual inline prerequisite and concrete pointer walkthrough, then request a fresh walkthrough of the affected sequence. Fix revision: none. Regression evidence/reviewer closure: pending.

### 25-N1 — optional, low: faint disabled text

Status: open, non-required. Both locales, initial rewind button; desktop and 320px. Opacity 0.4 produces approximately 3.30:1 text/button contrast. `04-disabled-start.png` and `07-controls-en-320.png` show the result. Keep disabled behavior but consider clearer text with another disabled-state cue. It remained readable during this inspection and does not independently block acceptance.

## Scores and conclusion

| Dimension | Weight | Score / 4 | Observation and rationale |
|---|---:|---:|---|
| Problem / terms / hand calculation | 15 | 2 | Correct grouping examples, limits and identity rule; missing linked-node/reference prerequisite for the target reader (25-R1). |
| Derivation / saved work | 20 | 3 | Correct O(n)-storage baseline and constant-pointer replacement; saving nxt and reconnecting are causally explained. Concrete pointer work arrives after dense abstraction. |
| State / correctness | 20 | 4 | Reconstructed invariants, termination, short suffix and reconnection; independent actual-source and transition checks support them. |
| Interaction / visual meaning | 20 | 4 | Predict/reveal/change, exact rewind/reset/endpoints, stable IDs, all next links, previous states and retained history operated successfully. |
| Python / cost | 15 | 4 | Actual canonical code executed on fresh and boundary cases; exact source/copy/download parity; mutation, identity and O(n)/O(1) justified. |
| Bilingual / device | 10 | 3 | Equivalent reasoning and working narrow layouts, keyboard and enlarged views; faint disabled text is minor friction. |

Weighted total: **85/100** (7.5 + 15 + 20 + 20 + 15 + 7.5). Outcome: **changes_required**. Despite reaching the numeric total threshold, dimension 1 is below 3 and required finding **25-R1** remains open. Required-open list: `[25-R1]`. This is a teaching review of this candidate, separate from publication.

Limitations: no human novice comprehension was measured; no LeetCode submission was made or claimed; official language selector was not audited because this is a faithful Python lesson, not a non-Python fallback. Only this lesson was independently exercised, not all ten shared-runtime consumers. CSS zoom supplies enlarged-layout evidence, not platform/browser zoom coverage. Author test counts and past publication evidence are not independent acceptance. No implementation, tests, shared files, services, prior reports or prior screenshots were changed. New files are limited to this exact report and this run's exclusive screenshot directory.

