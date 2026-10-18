# Independent review: 44 — Wildcard Matching

Candidate: `733be160f7903c5bc9289b40c5ac94c8e97bc53f`. URL: http://127.0.0.1:18770/leetcode/44/. Review run: 44-review-2-c284ea67; reviewer identity/model identifier unavailable. Target: basic Python, lists, loops, functions, elementary recursion. Frozen weights: 15/20/20/20/15/10; Python canonical interpretation. This review is separate from publication.

## Cold browser walkthrough (saved before source, tests, author notes or earlier reviews)

Read only specs/leetcode-review-gates.md first. Opened the candidate in real headless Chromium through Playwright at 1280×900. Read all five teaching sections in English and operated the rendered controls. No implementation was read to supply explanations.

1. **Question:** What does matching mean, and can I compute a result by hand? **Action:** Read section 01 and manually allocate the characters in adceb / *a*b. **Observed:** It explicitly assigns empty to the first star and dce to the second; ? consumes exactly one character, full coverage is required, lengths 0…2000 are stated. **Conclusion in my words:** Each pattern symbol covers its own portion of the text, so stars can vary their length but cannot erase required letters. The tiny cb / ?a false example makes the one-character limit concrete.
2. **Question:** What is repeated, and why save two coordinates? **Action:** Followed both written baseline branches for a / b** and read section 02. **Observed:** Both reach empty text / b*; the page contrasts empty / * with empty / b*, defines prefixes and DP, and names left/above/diagonal dependencies. **Conclusion:** Future matching choices depend on both remaining prefixes; cache one Boolean per pair. Removing a star uses left; consuming a character while retaining it uses above. A literal or ? consumes both final symbols and needs the diagonal. Only current-left and the previous row are needed, explaining two-row storage.
3. **Question:** Does one visible operation implement that rule, with meaningful history? **Prediction before reveal:** At default event 16, dp[2][3] should be true because ad / *a is false while a / *a* is true; the final star can take d. **Action:** Moved slider to 16, rewound to 15, stepped forward and moved to 29. **Observed:** Event 16 shows left F, above T outlined orange and current T cyan. Event 15 restores the current cell to uncomputed, with j=2; endpoint 29 reports true. The table retains earlier values. However Previous state, focused Python excerpt, recent operations and Complete Python solution appear empty. **Conclusion:** The computed table and highlighting distinguish stored data from dependencies correctly, but the promised explicit before-state/code/history panels do not provide content. Captured cold-event16.png and cold-code.png.
4. **Question:** Can I transfer the star rule? **Prediction before reveal:** For the quiz ba / ?*, left ba / ? is false and above b / ?* is true, hence true by consuming a. **Action:** Selected the second option and checked. **Observed:** Feedback gives exactly F or T and a character allocation; it contrasts ba / a* false. Changing the selection was also exercised. **Conclusion:** This tests application to another prefix pair rather than recognition of the default table.
5. **Question:** How does the table become Python, and what is retained? **Action:** Read section 05, the mapping table, costs and boundary warning; inspected the complete-code area. **Observed:** previous[j], current[j-1], previous[j-1] are mapped clearly; n+1 initialization and m rows justify O((m+1)(n+1)) time and O(n+1) live auxiliary space. Clearing each row is explicitly motivated. The complete solution and focused operation remain blank in the browser. **Conclusion:** I can reconstruct the conceptual recurrence from prose, but cannot read the advertised executable Python in this served lesson.

Additional cold boundary operation: changed preset to empty text / **, which restarted at event 0/2; predicted true, advanced to 2 and observed T,T,T and Final result true. Nonempty / empty must be false by full-coverage semantics.

**Independent fresh predictions committed before code checks:** s="aba", p="a?*a" should be true (? takes b, star empty); s="aba", p="a*b?" should be false (b must precede exactly one final character, but the only b is at index 1 and leaves a: actually this matches, so reject this proposed counterexample before execution). Use s="ab", p="a*b?" instead: false because after mandatory a and b there is no character for ?. A tempting rule that star makes all later characters optional would incorrectly return true. UI is preset-only; these will be labeled code checks. Another boundary prediction: empty / *?* is false because ? cannot disappear.

The cold walkthrough ends here. Subsequent sections are source/browser audit evidence.

## Audit correction to the initial disclosure observation

After saving the cold record, and before reading implementation files, I clicked all four native disclosure summaries in the browser. The apparently empty panels were **closed**, not missing. Expanded Complete Python solution displayed the entire callable; expanded focused operation, previous table and recent history displayed their content. `expanded-code.png` records the correction. The initial observation in steps 3/5 is preserved above as the fresh-reader observation, but its inference of missing content is withdrawn. No required finding is based on that mistake. The controls visibly use native disclosure arrows. The prediction change restored “Choose first; the answer has not been revealed,” as expected.

## Candidate, official contract and source audit

`git rev-parse HEAD` returned the requested `733be160f7903c5bc9289b40c5ac94c8e97bc53f`. No candidate source changes were present in the scoped working-tree diff. Ten served resources were independently byte-compared with checkout files: lesson index/copy/app/python-code/solution, shared core/lesson/common and both stylesheets; all matched. Representative SHA-256 values:

| Resource | SHA-256 |
|---|---|
| 44/index.html | `08040a7f7ec32284ee4ae35a11c98b71ea17e783a34078986d0db02c494375ed` |
| 44/copy.js | `6ef4827c3639487b7c6fd21bfdf9d2e8c556d66574840a4a027a42b1beadf85b` |
| 44/solution.py | `73d327600f142cfe01325305684d7f935e229848fc9015ffd37f9447b376692c` |
| 44/python-code.js | `7b7979481468d904d2145851690759d100b52db0489e93adcccaaf81da20bc7d` |
| hard-first-ten/core.js | `342d7cbdf8c1e6f8527e6804ec286157e8fc63513a3c36c61d67c496bd08eeed` |
| hard-first-ten/lesson.js | `18365da600d3a774aec9afb96deb377fa269fe894424ed6cef41ad9f929c9731` |

Opened the [official statement](https://leetcode.com/problems/wildcard-matching/) normally after saving the cold record. It confirms full-string matching, ? taking exactly one character, * taking any sequence including empty, lengths 0–2000, lowercase text and lowercase/?/* pattern. No access bypass. The faithful canonical callable is `Solution.isMatch(self, s: str, p: str) -> bool`; it takes the two original strings and returns Boolean, without changing their meaning. Python support is present, so the non-Python language-contract/selector/evidence exception is inapplicable; there is no advertised conceptual analogy or non-Python submission to audit.

Read `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py: canonical `solution.py`, offline mirror `python-code.js`, export `PYTHON_SOURCE`. Decoded mirror and canonical source match exactly, including final newline. Both locales' expanded displayed code, successful clipboard read-back, actual browser download and forced-copy-failure textarea matched canonical source exactly. Fallback was visible, focused and fully selected. Source audit confirms display and copy use the same mirror directly, while download points at solution.py.

## Executable checks and correctness reconstruction

Inspected all three lesson-local tests **before** executing them. regression.py and core.cjs normally write author evidence; browser.cjs normally writes author screenshots and browser.json. I executed their assertion bodies through in-memory wrappers: suppressed the two algorithm/core evidence writes and redirected the browser script's output folder to this run's exclusive evidence directory. The core wrapper used `createRequire` anchored at its original test path, preserving relative imports. No tests, author assets or earlier evidence were modified. Browser downloads used Playwright temporary paths.

Observed results:

- Actual canonical Python compiled and executed, together with the actual baseline extracted from rendered HTML: **21,483 exhaustive pairs**, **1,000 seeded random pairs**, and **11 transfer/boundary/maximum fixtures** passed against a first-star-length enumeration oracle. The baseline call sequence for a / b** was `(a,b**) → (a,b*) → (a,b) → (empty,b*) → (empty,b) → (empty,b**) → (empty,b*) → (empty,b)`; empty / b* occurred twice. This directly verifies the new repeated-work example rather than trusting its prose.
- The actual shared JavaScript trace model passed **1,275** small-input comparisons and **15,337** active-cell truth/dependency-availability checks. The fresh quiz matrix was `[[T,F,F],[F,T,T],[F,F,T]]`, with final dependencies `(2,1)` and `(1,2)`.
- Independent **code checks** executed canonical Python on the pre-recorded inputs: `aba / a?*a → true`, `ab / a*b? → false`, `empty / *?* → false`. The corrected-before-execution candidate `aba / a*b? → true` also passed; this confirms why the shorter ab case is the counterexample. `ab / a*b → true` distinguishes star taking zero characters from the mandatory final ? case.
- Independently translated each wildcard symbol into escaped regular-expression semantics and used `re.fullmatch` as a second oracle for **3,000** fresh random pairs (seed 44228467, lengths 0–15). All canonical results agreed. This oracle is review code, not a prerequisite introduced into the lesson.
- Maximum cases in the inspected/executed Python assertions included 2000 a's / 2000 question marks true; 2000 a's / 1999 stars followed by b false; empty / 2000 stars true; and 2000 a's / empty false. Empty/empty, repeated stars and empty/question boundaries passed.
- On five independently selected trace inputs, every event after the initial frame changed exactly one previously uncomputed cell into a Boolean, at its advertised active coordinates; all other cells retained their values. Inputs were unchanged. Replay additionally compared complete browser snapshots.

The invariant is reconstructable: before a text row, previous[j] answers the preceding text prefix against pattern prefix j. During the row, current entries to the left already answer the new text prefix. A star either takes zero characters (left), or takes the final text character while retaining the same star for the shorter text (above). Those cases exhaust zero versus positive consumption. A literal or ? requires both character compatibility and the shorter-prefix diagonal. Row zero is true exactly for all-star prefixes; nonempty text with empty pattern is false. Bounded loops terminate at the full-prefix answer. Fresh current lists prevent stale truth and previous/current aliasing across updates; strings are immutable and no inputs are mutated.

Concrete visual-to-Python mapping, rechecked with disclosures open: at default event 16, previous table `(2,3)` is `·`, current table `(2,3)` is T, current-left `(2,2)` is F and above `(1,3)` is T. Focused excerpt is exactly `current[j] = current[j - 1] or previous[j]`; history contains events 11–16. Thus `current[3] = False or True`. At final `(5,4)`, b matches b and diagonal `(4,3)` is T. The model initializes all first-column boundaries before row-zero traversal; Python creates each new current[0] when allocating its row. This is a full-table dependency demonstration, not a literal Python instruction timeline, and the lesson explicitly distinguishes the two storage models.

Actual complexity agrees with the revised cost text and metadata: initialize n+1 cells, allocate n+1 cells for each of m rows, and compute mn recurrence cells: O((m+1)(n+1)) time and O(n+1) auxiliary space, including empty inputs. At most two live row lists are needed. The view's complete table and retained snapshots have greater storage cost, explicitly separated from the submission. The baseline is exponential in the worst case, with additional slicing/recursion costs; its repeated prefix pair now supplies a concrete bridge to saved work.

After these independent checks, inspected SELF-CHECK.md and saved algorithm/core results. The numerical claims above reproduce their assertions. Their browser claims likewise match the re-executed assertions below. Author checks were treated as claims to audit, not as independent approval.

## Interaction, bilingual and device evidence

Real headless Chromium used Playwright resolved through NODE_PATH, with `executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. The inspected browser test completed with exit 0; this run's browser.json is in the exclusive evidence directory. Observed in **both English and Chinese**:

- All four presets start at event zero, give final results T/F/T/F, and have correctly disabled Rewind at the start and Next at the end. Next→Rewind→Next restores exact complete snapshots, as does Reset to the initial state; changing preset restarts the experiment.
- All three prediction choices reveal causal localized feedback. Changing choice clears old feedback before another reveal. Locale changes preserve the full snapshot, including event, answer and reveal flag; open disclosures remain open. Width changes preserve state.
- Keyboard range End/Home/ArrowRight reaches 29/0/1; Rewind with Space returns to 0; Next with Enter reaches 1. Native disclosures work when expanded and focus outlines are visible. Clipboard, download and fallback checks passed in both locales.
- Widths **320, 390, 736 and 1440 CSS px** show no page-wide horizontal overflow. Narrow screenshots show six-column tables with distinct labels, indices, dependency outlines and values. The i/j labels and 2/3 values remain separate; settled-zh-320-state.png specifically records the dense state/code/history area. Long source lines use horizontal code scrolling rather than truncating the underlying text. Sticky navigation requires horizontal scrolling to reach later long English labels; this is minor navigation friction.
- **200% CSS root zoom** at 1280×900 in both locales preserved readable table cells/dependencies and teaching text without page-wide overflow. Ordinary vertical scrolling is needed. This is explicitly CSS zoom coverage, not native browser-menu zoom or real-device verification.
- Read Chinese sections and quiz feedback in the browser and compared both dictionary versions after the cold walk. They preserve the repeated-call example, two-coordinate state, zero/positive star alternatives, guarded diagonal, row clearing and cost explanation. The optional regex link is outside the required exercise. Shared variable names and T/F remain defined; occasional line breaks inside bracketed indices at 320 are decipherable.
- With storage access denied, locale switching and Next still worked. Browser assertions recorded no page errors or failed requests; runtime requests stayed local to the preview.

Computed contrast from actual browser colors: normal stage text **14.70:1**, muted text **7.08:1**, current-cell cyan **6.65:1**. Naturally disabled secondary-button text after opacity compositing is approximately **3.30:1**. disabled-390.png was inspected: the disabled Rewind is subdued but identifiable, with its label retained. These are scoped contrast checks, not exhaustive accessibility certification.

Captured and inspected all screenshots in this run's directory, using inspection-0.png through inspection-7.png as contact sheets and full-size checks for desktop, zoom, disabled and settled states. A transient blank middle region appeared in zh-1440-trace.png during the rapid scripted layout/scroll sequence. It was not counted as passing readability evidence: after ordinary repositioning and a settled capture, settled-zh-1440-trace.png displays the complete table/message/controls normally; DOM rectangles and visibility were also checked. The original capture is retained, with this distinction between capture artifact and settled operation. Viewport cuts at the bottom and sticky navigation over already-scrolled content are capture/scroll-position effects, not label/value intersections.

Evidence directory: `specs/reviews/44-evidence/44-review-2-c284ea67/`. It contains cold screenshots, expanded-code.png, bilingual width/quiz/trace/teaching screenshots, disabled-390.png, settled rechecks, inspection contact sheets and browser.json. Earlier evidence was preserved.

## Metadata preflight and prior required findings

Ran from the repository root:

```
python3 -B scripts/register_leetcode_lesson.py 44 --validate-only
```

**Exit 0; no stdout/stderr.** No registration or repair was run. lesson-entry.json complexity is exactly one nonempty string, `O((m+1)(n+1)) time; O(n+1) auxiliary space`, consistent with the executed source.

Only after saving the cold walk, read [44-review-1-12447724.md](44-review-1-12447724.md). Its old candidate was `20fd69d0d3f8a0a847189b3462e474886ec3caa1`; that review was changes_required, with no accepted base. Compared its relevant source diff to this candidate: metadata is added; baseline now shortens from the end; concrete repeated-prefix paths and transition explanations are added; regex-dependent quiz is replaced; cost definitions/empty-pattern space are clarified. Canonical Python, mirror and shared runtime are unchanged. All affected teaching sections and prerequisites received the fresh walkthrough above, with executable and browser regression checks.

| Stable ID; original severity | Original reproduction / expected result | Current-candidate observation and explicit regression evidence | Closure |
|---|---|---|---|
| **44-META-01; high** | Root preflight failed because lesson-entry.json was absent. Expected valid metadata and one time/space string. Locale, viewport and input not applicable. | On `733be160f7903c5bc9289b40c5ac94c8e97bc53f`, file exists with string complexity; exact safe preflight exits 0. | **Closed by this review.** Fix revision: current candidate; author action complete, no next action. |
| **44-TEACH-01; high** | EN/ZH sections 01→02, any width: repeated work asserted without an actual repeated call. Expected tiny branch overlap before abstraction and a causal bridge to the saved state. | Cold step 2 followed a/b** to empty/b* by both paths and mapped it to dp[0][2]=F. Executed actual displayed baseline confirms eight calls and exactly two empty/b* calls. Both locale overlap/derive/transition screenshots inspected at 320, and rendered explanations read. | **Closed by this review.** Fix revision: current candidate; owner author, no further required action. |
| **44-TEACH-02; medium** | EN/ZH section 04, all widths: exercise required undefined regex grammar. Expected local wildcard transfer task with introduced prerequisites. | Cold prediction for ba/?* uses left F and above T without external grammar. Both locales' three choices/reveals/change clearing pass; actual model matrix and dependencies verified. Narrow/desktop quiz screenshots inspected. Regex comparison is optional. | **Closed by this review.** Fix revision: current candidate; owner author, no further required action. |

No new required finding was established. Required open IDs: **none**. Historical reports and original failure evidence were not rewritten.

## Scores and conclusion

| Dimension | Score / 4 | Weight | Observation and rationale |
|---|---:|---:|---|
| Problem / terms / hand calculation | 4 | 15 | Whole-string Boolean, wildcard meanings, empty inputs, indices/prefixes and a concrete character allocation are explicit before abstraction; negative examples constrain the rule. |
| Causal derivation / saved work | 4 | 20 | Cold reconstruction followed an actual duplicate call, why both coordinates matter, zero/positive consumption and two-row reuse. Executed baseline confirms the claimed overlap. |
| Maintained state / correctness | 4 | 20 | Prefix invariant, left/above/guarded diagonal, empty boundaries and termination reconstruct cleanly; visible intermediate states and canonical execution agree. |
| Interaction / visual meaning | 4 | 20 | Predicted F-or-T transition, rewind and endpoint operate coherently; data/dots/highlights differ visibly. Expanded before/history/code panels work; new quiz tests wildcard transfer with causal distractors. |
| Python / cost | 4 | 15 | Exact faithful callable is executable, all four source delivery paths agree, fresh cases pass, mapping to two live rows and empty-input-inclusive costs is explicit. |
| Bilingual / device | 3 | 10 | Equivalent reasoning, readable 320/390/desktop states, keyboard and 200% CSS zoom checks pass. Minor friction: long navigation labels need horizontal travel, bracketed indices wrap on narrow screens and disabled text is faint though identifiable. |

Weighted score: **97.5/100** (`15 + 20 + 20 + 20 + 15 + 7.5`). Every dimension is at least 3, metadata preflight passes and no required finding remains open. **Outcome: accepted for revision 733be160f7903c5bc9289b40c5ac94c8e97bc53f.** This is independent lesson acceptance, separate from publication.

Limitations: fresh custom inputs are code checks because the UI is preset-only. Initial closed-disclosure confusion and its correction are disclosed above. Browser coverage is headless Chromium with CSS root zoom, not native menu zoom, other browser engines, real devices or an exhaustive assistive-technology audit. No actual novice comprehension measurement, successful LeetCode submission or production/publication approval is claimed. No reviewer/model identity beyond this run is invented. Only the requested report and this run's exclusive evidence directory were written; no implementation, shared files, tests, services, Git configuration, prior reports or prior screenshots were changed.
