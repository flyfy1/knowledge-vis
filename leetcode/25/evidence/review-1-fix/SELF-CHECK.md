# #25 review-1 repair — author self-check

Date: 2026-10-18. Author: Codex implementation run; exact model identifier unavailable.
Scope: `leetcode/25/` only. Base commit: `92bc3bf8fe38837356577a8baeab8ff536692bac`.
Candidate: uncommitted working-tree files identified in [candidate-hashes.json](candidate-hashes.json).
Preview: http://127.0.0.1:18770/leetcode/25/.
This evidence is a self-check, **not independent acceptance**. No review report,
rubric, shared asset, registry, service, Git configuration or other lesson was edited.
No commit, push, deployment, credentials, schedule or child agent was used.

## Finding mapping

| Stable ID | Repair and causal check | Evidence | Author status / next action |
| --- | --- | --- | --- |
| **25-R1** | Before the first `next` operation and baseline, define node objects, `val`, `next`, references, `head`, `None`, permanent IDs and arrow notation. Contrast changing a Python list slot with changing an object's link. Start from concrete IDs #0/#1/#2 with values 1/2/3, save #1 before overwriting #0.next, change the two links, and explain why the entry must move. Check the insufficient suffix before naming the general variables. Carry the same nodes into dummy, group_prev, kth, group_next, prev/curr/nxt and old_head. | `en/zh-rendered-bridge.txt`; `*-prerequisite.png`, `*-rewire.png`, `*-derive.png`; model check verifies every hand-calculated state. | **Fixed awaiting review**. Separate reviewer must cold-walk sections 01–02 and their transition to the experiment; no reviewer closure asserted. |
| **25-N1** (optional) | Existing faint disabled text retained. No CSS change is needed for the prerequisite repair. | Original independent report; local browser still verifies disabled endpoints. | Deferred, non-required. A separate lesson-local style repair can revisit this. |

The report's original sequence is retained in `before-en-step0.png`: no inline
node prerequisite preceded the baseline. New text is rendered through the existing
locale mechanism, using existing paragraph/preformatted styles. `copy.js` cache
version is updated in `index.html`. No algorithm or interaction implementation
changed. Existing equal-valued-node prediction remains a separate transfer check
with hidden feedback until explicit reveal.

## Concrete reasoning rechecked

For [1,2,3], k=2, the model confirms:

1. Preflight: kth=#1, group_next=#2, prev=#2, curr=#0.
2. Save nxt=#1; #0.next changes #1 → #2; entry stays #0; advance prev=#0, curr=#1.
3. Save nxt=#2; #1.next changes #2 → #0; entry stays #0; advance prev=#1, curr=#2.
4. Reconnect entry to #1; group_prev becomes #0; traversal is #1 → #0 → #2 → None.
5. Next preflight fails with only #2 remaining; every link remains unchanged.

The omitted-save counterexample explains that following the overwritten #0.next
would skip #1. The second boundary changes k to 3 on [1,2,3,4,5]: preserving #3 → #4
produces [3,2,1,4,5], whereas reversing the partial group wrongly gives [3,2,1,5,4].
A fresh code-only input [6,2,7,1,9], k=3 returns [7,2,6,1,9] with the original
last two objects retained. This is not claimed as a custom UI input.

## Executable checks

Commands from repository root (outputs stored alongside this file):

- `python3 -B leetcode/25/tests/check_solution.py`: **3,597 cases passed**. Exhaustive binary-valued inputs n=1…8 with every legal k, the concrete and partial-suffix examples, the fresh case, n=5000 for k=1/2/3/2499/2500/4999/5000, and empty-input robustness beyond official constraints. Executes the actual canonical Python with a judge-shaped ListNode. Compares returned object order to chunk reversal and checks unchanged values, cycles, lost/replacement output nodes. See [python-results.json](python-results.json).
- `node leetcode/25/tests/check_model.cjs`: **300 inputs, 6,235 transitions passed**. All legal k for n=1…24; final identity order, saved old successor, exactly the targeted link assignment, post-advance prev/curr, unchanged entry during internal reversal, and no mutation on final incomplete-group stop. Also checks the exact new three-node walkthrough. See [model-results.json](model-results.json).
- `node leetcode/25/tests/check_browser.cjs`: real Chromium from `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, Playwright from `NODE_PATH`; results below. See [browser-results.json](browser-results.json).
- `git diff --check`: passed.

Canonical Python remains `Solution.reverseKGroup(self, head, k)` with
judge-provided ListNode and a node-reference return value. The existing source
and mirror hashes match those in the independent report. Read the exact
`LANGUAGE_FILES` pair in `scripts/register_leetcode_lesson.py`:
`solution.py` / `python-code.js` / `PYTHON_SOURCE`. The mirror is byte-for-byte
identical after JSON decoding; no regeneration was needed. There is no
`language-contract.json` or `supportedLanguages` field to repair: faithful Python
is already selected, so no preferred Python/TypeScript interface is being omitted
by a native-language fallback.

The [official statement](https://leetcode.com/problems/reverse-nodes-in-k-group/)
was reopened normally in this run. Its grouping, unchanged partial suffix,
unchanged node values and constraints agree with the repair. No official language
selector audit or LeetCode submission is claimed; the faithful Python interface
was already audited in the supplied review and remains unchanged.

## Browser and bilingual observations

Both English and Chinese:

- Definitions, concrete walkthrough, baseline bridge and generalized roles appear
  in the intended DOM order. No empty translation keys. Read the complete saved
  rendered text in both languages and compared meaning, including the wrong-rule
  examples and the reference/list-slot distinction.
- All four presets reach the expected result. Next → rewind → next reproduces the
  same snapshot; restart restores initial state. Initial rewind and final next
  are disabled. The existing quiz's three choices reveal exact localized causal
  feedback; changing choice clears reveal. Preset/frame/quiz state and open
  disclosures survive locale changes; trace state survives resizing.
- At 320/390/736/1280 × 900 CSS pixels, no document overflow and no clipped bridge
  paragraphs or diagram boxes. Visually inspected prerequisite and rewire captures
  at 320 and 1280, derivation and populated trace at 1280, and rewire captures at
  200% CSS zoom. The object diagram stays readable; paragraphs wrap in both locales.
  CSS zoom tests enlarged layout, not browser-chrome zoom or real phone hardware.
- Range Home/ArrowRight, Previous with Space, Next with Enter, and a 3px keyboard
  focus outline operate. Actual experiment navigation leaves the target heading
  below the sticky navigation.
- Displayed code, embedded source, successful clipboard text, actual downloaded
  `solution.py` and denied-clipboard fallback contents match canonical source
  exactly in both languages. Storage denial still permits operation. A file://
  lesson loads the exact source and advances the experiment offline.
- Preview response bytes match local index.html, copy.js, app.js, solution.py and
  python-code.js. No lesson runtime, console or asset errors. The separate existing
  root `/favicon.ico` request returns 404; it is recorded explicitly in the browser
  JSON and excluded from lesson-error assertions. It is outside lesson ownership.

The new text reuses `--text: #e8edf4` on `--bg: #0d1117`, contrast **16.09:1**.
No CSS was added. Existing stylesheet sizes are 9,425 + 3,909 = **13,334 bytes**.
Screenshots are verification artifacts, not shipped illustration assets.

## Verification limits and handoff

These are author computational, visual and interaction checks. They do not
establish independent teaching acceptance, measured novice comprehension, a
successful LeetCode submission, real-device behavior or public deployment.
Required next step: a separate review run of the hashed candidate, cold-walking
the repaired prerequisite sequence and rechecking **25-R1** against the frozen
rubric. Preserve the original finding and let that reviewer append closure.
