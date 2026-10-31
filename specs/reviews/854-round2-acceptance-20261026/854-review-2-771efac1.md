# Independent review: 854 — K-Similar Strings

Candidate: b3336f7dc7243e7d15f336ab490eb6c3a0824304. URL: http://127.0.0.1:18770/leetcode/854/. Target: basic Python, loops, functions, elementary recursion. Review run: 854-review-2-771efac1; no claimed human comprehension or LeetCode submission. Frozen six dimensions and weights: 15,20,20,20,15,10. Python interpretation applies.

## Cold browser walkthrough (saved before source inspection)

Read only the frozen rubric before opening the candidate using Playwright Chromium at 1440×1000. No brief, implementation, author tests, or prior review was opened. Screenshots: cold-desktop.png, cold-proof-2.png through cold-proof-4.png, cold-reveal.png in this run's evidence directory.

| Teaching step / question | Action | Observable result | Independently paraphrased causal conclusion |
|---|---|---|---|
| 1: What operation is allowed, and why two swaps? | Read the tiny abc→bca calculation; press Swap (0,1), Swap (1,2), Undo. | abc→bac→bca; count 0→1→2; history contains these strings. Undo returns bac/count 1. | Any two indices may exchange, not just neighbors. Three initially wrong positions cannot all be repaired in one two-position swap. The exhibited two swaps attain the lower bound. Inputs are anagrams of length 1–20 over a–f; output counts swaps, indices start at zero. |
| 2: Why preserve alternatives? | Read the competing aabbcc→abcabc routes and baseline explanation. | Leftmost-only route takes three swaps; alternative aabbcc→abbacc→abcabc takes two. Four mismatches give lower bound two. | Identical letters at different indices leave different suffixes. A single greedy branch loses a shortest route. BFS groups equal-cost paths by number of swaps; seen removes repeated strings, not distinct alternatives. Baseline tries every pair and pays for string copying. |
| 3a: What is safely pruned? | Read first-mismatch rule and abc example. | Only misplaced suffix copies of the needed character are eligible; prefix stays correct. | Fixing the earliest wrong position can shorten an optimal tagged cycle while leaving the matching prefix alone. Keeping all eligible partners preserves an optimal completion without knowing which partner is best. |
| 3b: Does reassignment cost a swap? | Before Next, predict: exchanging two a destinations leaves aabc unchanged and costs zero actual swaps. Advance all three snapshots. | Snapshot 1 has cycle (0 3 2 1), cost 3 for that assignment. Snapshot 2 still aabc, destinations 0→0,1→3, cycles (0)(1 3 2), remaining cost 2, actual swaps 0. Snapshot 3 is abac, one actual swap and one remaining. Snapshot 4 is abca, two actual swaps and zero remaining. | The tags distinguish equal occurrences solely for proof. Choosing a better assignment splits a cycle without changing the original problem. Actual swaps subsequently split off fixed positions, each paying one and reducing remaining cost by one. |
| 3c: What changes after a layer expansion? | Predict abc depth 0 yields bac depth 1, then bca depth 2. Press Expand twice. | First mismatch 0 needs b, j=[1], child bac; next mismatch 1 needs c, j=[2], child bca. Counts enqueued 1→2→3; old layers retained. Target depth 2 reports minimum two. | Each snapshot is after a complete expansion. Frontier depth is the cost already spent; target detection ends before expanding the target frontier. Highlighted target is data in that frontier, not a second mutation. |
| 4: Which b may fix abcb→bbca? | Predict {3}, because index 1 is already correct. Select it and check. | Correct feedback shows (0,3) reaches bbca in one; borrowing index 1 gives bacb and requires a second swap. | The second guard excludes a currently correct source; merely matching the needed letter is insufficient. This transfers the guard to a new input, although the exercise has only three predefined choices. |
| 5: How does the trace become executable Python? | Read mapping and cost explanation (source disclosure not yet opened). | Queue entries are (state,depth); target checked before mismatch scan; copy/swap/join leaves parent unchanged; seen is marked when enqueuing. | One whole visual layer corresponds to several queue pops at the same depth. With V visited strings and n possible partners, O(n) construction/hash per partner gives O(Vn²) time and O(Vn) storage; factorial state growth remains possible. |

Independent fresh input prediction, recorded before source/runtime checking: `abac→baca` needs 2: swap (0,1) gives baac, then (2,3) gives baca. Four mismatches rule out one. Independent counterexample to “a swap must repair two positions”: `abcd→bcda` needs 3, since a four-cycle needs three swaps; fixing just the first mismatch is still useful. These are custom-input **code checks**, because this browser exposes only presets. The preset counterexample independently checked by hand: aabbcc→ababcc→abcbac→abcabc takes 3; aabbcc→abbacc→abcabc takes 2.

Cold-read limitation: the general maximum-cycle argument is denser than the tiny worked example, but its terms and the reassignment/real-swap distinction are explained on the page. No missing explanation has been supplied by author notes.

## Post-cold audit

### Identity and official executable contract

HEAD is exactly `b3336f7dc7243e7d15f336ab490eb6c3a0824304`. Independently fetched preview assets and compared their bytes to the checkout: index.html, app.js, core.js, copy.js, style.css, solution.py, python-code.js and both shared common.js/style.css match. SHA-256 receipts are in `independent-checks.json`; representative candidate hashes:

- index.html: `0441b7ffb565f14c50226b0f7dec5649dd96a53f309e190186ea347e33802010`
- app.js: `092d5296027fcc349572608ea70d7efcc33eca116210999cec37e779a2094f44`
- solution.py: `7a53ef8ea9d60d8282785d804b24c53bd0005f9b8881779ad7fa63606c514068`
- core.js: `d33efab4b0e02bc1c47d060cc27c59ba054767da502c4f2955ce9dff2ce47dc0`

Read the [official statement](https://leetcode.com/problems/k-similar-strings/) normally after saving the cold walk. It confirms minimum arbitrary-position swaps, equal-length anagrams, length 1–20, alphabet a–f, and examples ab→ba=1 and abc→bca=2. The lesson matches these constraints. Canonical Python is `Solution.kSimilarity(self, s1: str, s2: str) -> int`; the saved lesson-local official codeSnippets evidence contains this Python3 template. The callable returns an integer and is a faithful submission interface, not an analogy. No non-Python exception or language-contract.json is involved. Read `LANGUAGE_FILES` in scripts/register_leetcode_lesson.py: Python requires solution.py, python-code.js, exported PYTHON_SOURCE; these are the files audited.

Compared the prior accepted anchor `1be3c657ef0c1ef3152f8abced78df2e278f09da` with this candidate: canonical solution, offline mirror, BFS core and lesson-entry.json have no diff. The relevant implementation change adds an independent bridge row, bilingual snapshot explanation, token/counter rendering and responsive styles. This review nevertheless independently walked the whole lesson and reran its current interactions; it does not inherit scores from the earlier review.

### Correctness, actual code and cost

Executed actual solution.py, loaded with runpy, against an independently written unrestricted-all-pairs-swap BFS. Enumerated all **4,653 ordered ternary length-five anagram pairs**; every answer matched. Both cold predictions were confirmed: abac→baca=2 and abcd→bcda=3. The latter is a four-cycle: fixing one position per swap is necessary here and still optimal. Additional independent code fixtures returned a→a=0, abcdef→fbcdea=1 (nonadjacent ends), length-20 all-a equality=0, and a×10+b×10→b×10+a×10=10. Twenty mismatches give a lower bound ten and ten cross-pair swaps attain it. These custom examples are code checks, not custom browser inputs.

Mapping the observed abc→bac transition to Python: popleft returns (abc,0); equality fails; the mismatch scan leaves i=0; j=1 satisfies both guards; copying, swapping indices 0/1 and joining creates bac. seen gains bac when it is enqueued at depth 1. The parent string remains abc. The code does not mutate s1/s2 or share a candidate list between branches.

Correctness argument independently reconstructed: tag identical occurrences with valid target destinations. A tagged permutation needs n minus its number of cycles swaps, because each swap increases cycle count by at most one and splitting off positions attains that bound. An optimal tag assignment can make every already-correct position a singleton: exchange its destination with the identical letter assigned to it, splitting the same cycle. In the cycle containing first mismatch i, the predecessor j therefore lies beyond the fixed prefix and is misplaced. Its swap into i removes one position from that cycle, consuming exactly one optimal swap. Enumerating every eligible j keeps this predecessor. BFS preserves shortest arrival by FIFO and seen-on-enqueue. Every child fixes i without altering the earlier prefix; the matching prefix strictly grows. Equality is checked before scanning, so n=1 and all-equal inputs cannot scan out of bounds. Valid anagrams have an eligible predecessor, ensuring completion; −1 is unreachable within the contract.

Independently recounted cycles from all 71 rendered bridge records rather than trusting their cost fields. Destination letters match fixed target abca in all rows. Row mappings [3,0,1,2], [0,3,1,2], [0,1,3,2], [0,1,2,3] have 1,2,3,4 cycles, hence remaining costs 3,2,1,0. Actual spent counts are separately 0,0,1,2. Moving tokens in rows 3/4 carries their assigned destinations correctly. The first cost 3 restricts the tag assignment; it never claims original optimum 3.

Baseline source enumerates O(n²) pairs per visited string, each with O(n) copying/join/hash: conservative O(Sn³) time/O(Sn) space. Canonical code scans the mismatch and at most n partner indices, with O(n) copying/hash per candidate: O(Vn²) time/O(Vn) space, V≤S, S=n!/∏c!. Replacing V with S gives the metadata bound. Initialization and equality work remain covered when V=S=1; this is an upper bound, not a tight claim for equal strings. The text correctly warns that the search can still be factorial and distinguishes browser rewind history from submission memory. Factorial notation remains a small conceptual jump for the target reader, but the counted objects and source of each n factor are explained.

### Safe inspected-test reruns and preflight

Read test_solution.py, baseline.py, test_core.cjs, browser.cjs and test_bridge_browser.cjs before executing them. All evidence-producing tests honor EVIDENCE_DIR. Set it to this run's absolute exclusive evidence path for each command. No build_page.py, generator, registration, test_revision.py or service command was executed. In particular, test_revision.py's generator branch was inspected but not needed for this independent review.

| Command from repository root | Observed result |
|---|---|
| `EVIDENCE_DIR=... python3 -B leetcode/854/tests/test_solution.py` | Exit 0; actual canonical Python matched the all-swap oracle on 4,926 exhaustive/seeded cases and eight boundary fixtures. |
| `EVIDENCE_DIR=... node leetcode/854/tests/test_core.cjs` | Exit 0; seven presets and 180 seeded full traces checked candidates, prefix, children, seen totals, depth and complete history; mirror parity and translation-pair structure passed. |
| `EVIDENCE_DIR=... node leetcode/854/tests/browser.cjs` | Exit 0; both locales, all preset frames, prediction changes, rewind/reset/endpoints, source transfer, 16 width/zoom layouts, keyboard and local/offline paths passed. |
| `EVIDENCE_DIR=... node leetcode/854/tests/test_bridge_browser.cjs` | Exit 0; four bridge rows, locale roundtrips, independent existing state, rewind/replay/reset, keyboard, 32 row/layout combinations, forced colors, readable disabled controls and source transfer passed. |
| `python3 -B scripts/register_leetcode_lesson.py 854 --validate-only` | Exit 0, no stdout/stderr; independently repeated with the same result. No registration performed. |

Metadata complexity is exactly one nonempty string covering time and space: `O(S n²) time; O(S n) space, S = n! / product of letter-count factorials`. Preflight therefore satisfies the required shape gate. Test outputs preserve their original harness labels such as “author self-check”; these are rerun results, not reviewer identities or acceptance claims. Independent inline checks produced independent-checks.json and the extra screenshots, and wrote no source/test files.

### Rendered state, interactions, localization and access

The seven completed browser presets, also checked by the unrestricted-swap oracle, give A abc→bca=2; B ab→ba=1; C aabbcc→abcabc=2; D aa→aa=0; E abcdef→fabcde=5; F aabc→abca=2; G aaccbbdd→aabbccdd=2. D starts and ends at depth zero with expansion disabled. Each trace stops before expanding the target frontier. Previous/Next reproduces the same frontier/events/history; Reset restores snapshot zero; Jump agrees with advancing to the endpoint. Native disabled states prevent stepping past either endpoint.

Independent dense middle check at 320px, both locales: G starts aaccbbdd, target aabbccdd. At depth 1, i=2 needs b and j=[4,5] generates aabccbdd and aabcbcdd. Both retain prefix aa and fix index 2, with cumulative enqueued count 3 (one initial plus two children). Children remain associated with their actual parent and swap indices. C at depth 2 has frontier abcbac and abcabc, cumulative seen 5; the target alone has a checkmark and double border. Events describe the previous frontier's expansion, while history lists the processed depths. These are consistent completed-layer semantics, not mixed before/after values.

The bridge's destination-changed markers differ in text from token-swapped markers and do not claim a string mutation in snapshot 2. The two counters retain explicit accounting scopes. Native focus identifies the button receiving Enter/Space; it does not alter algorithm-state markings. At forced colors the double borders, text markers and focus outline remain distinguishable.

Prediction options and feedback consistently use abcb→bbca and source indices. The correct {3} answer and both wrong choices have concrete feedback; choosing a different option clears the old reveal, and Reset clears selection and disables Check. Locale switching preserves the chosen option and its revealed meaning. Changing a BFS preset resets that search alone; it does not invalidate the separate fixed-input prediction exercise.

Independently seeded hand abc→bac, G at depth 1, bridge snapshot 2, and selected/revealed {3}; resizing through 320/390/1440 and switching zh/en preserved all these values. Exact H1 checks observed `#854 · 相似度为 K 的字符串` and `#854 · K-Similar Strings`; document titles are `#854 相似度为 K 的字符串` and `#854 K-Similar Strings`. The official anchor retains the exact problem URL.

Parsed copy.js with duplicate rejection before building a dictionary: all **109 keys are unique**, each has two nonempty strings. Inspected shared locale consumer: it uses [zh,en] pairs and named parameter replacement. Rendered Chinese rule contains `j > i`, `state[j] = s2[i]`, `state[j] ≠ s2[j]`; G's Chinese event binds i=2, required b, j=[4,5] to the same two children as English. All four bridge actions, tokens, destination labels, costs, spent counts and reassignment explanation agree in both locales, including “没有字母移动，实际花费 0 次交换” and the distinction between worse assignment cost and original optimum. Incorrect-answer feedback remains distinct from clipboard-fallback copy. No materially different translation found.

Exact source parity passed without trim/normalization for canonical solution.py, decoded PYTHON_SOURCE, DOM textContent, successful automatic clipboard, download bytes and fallback textarea, including the final newline. In **each locale's** manual-copy attempt the inspected browser suite wrote and read a fresh distinct non-source clipboard sentinel, forced automatic write failure, checked focus and full selection, then used native **Control+C on Linux** and read back the exact source. This establishes actual transfer, not just a selected textarea. The focused bridge suite additionally preserved fallback visibility/status during a bridge transition.

Real keyboard Enter/Space/Tab/Shift+Tab operated trace and bridge controls and retained visible 3px focus. Controls were measured at ≥48px. Native select closed labels Case/预设 A–G fit with the test's unchanged 24px arrow reserve; meaningful input strings appear immediately below. Body font stack is PingFang SC, Microsoft YaHei, system-ui, sans-serif; exact resolved fonts were not inferred. Storage-denied and offline file views worked, with no observed browser errors, failed assets or external runtime requests.

Inspected actual screenshots from this run, including English/Chinese 320px reassignment, desktop reassignment, English desktop 200% reassignment, Chinese 390px controls, English 320px C trace, Chinese 390px 200% trace, forced colors and independent G middle in both locales at 320px. Labels/values stay associated, text wraps, and no reproducible clipping or text collision was observed. Some viewport captures begin mid-control or end mid-event due to scroll position; scrolling exposes the remainder. At 200% CSS zoom the narrow trace is very tall and step navigation scrolls horizontally, which adds reading friction without hiding essential state. This is real Chromium rendering with CSS zoom=2, not browser-chrome zoom or a physical-device test.

The browser contrast helper was inspected: correct sRGB linearization and weights .2126/.7152/.0722, calibrated against black/white (21), primary luminances and #747474-on-black (4.492948, correctly failing 4.5). Rendered sampled ratios include body 16.087, hints 7.744, event/token text 13.397, changed-destination marker 8.937 and disabled text 6.449. Bridge focus against its panel is 9.809. Disabled text remains readable; sampled solid-color backgrounds are the measurement scope, not an exhaustive accessibility certification.

Related links were actually keyboard-followed by the rerun in both locales at narrow width. Read their destination excerpts in browser-results.json: ../126/#step2 discusses shortest BFS layers and multiple predecessor paths, matching the Word Ladder II comparison; ../773/#step2 describes swap-generated states and unit-cost BFS/seen, matching the Sliding Puzzle comparison. These destinations are available in the local preview. Their recorded HTML hashes are 3a3d8359c162740f4eb79c23c1a25f86a8b40e47ffbbb95837cc3eb6cc33238f and 8cc3be30e0bb5251cc797cb3c753f14d1e4ccd4595126dd46aa5872a403f8bb5 respectively. This does not establish public release availability.

### Earlier finding closure

Opened the prior report and revision request only after saving the cold walkthrough. The earlier review had no required finding; its optional low-severity `854-A01` asked for a concrete repeated-letter tag assignment and split. The revision request `854-BRIDGE-R1` selected that improvement without retroactively changing its severity.

| Stable ID | Reproduction, expectation and actual evidence | Status |
|---|---|---|
| 854-A01 | On this candidate, EN/ZH, 320/390/1440px and desktop 200% CSS zoom, Step 3: Reset assignment example, Next through all four rows, rewind/replay and locale-roundtrip. Expected: concrete same-letter destination reassignment before the general singleton proof, with unchanged letters/zero actual swaps distinguishable from real swaps. Actual: aabc stays aabc as 0→3/1→0 becomes 0→0/1→3; cost/spent become 2/0; subsequent real swaps produce abac and abca with spent 1 then 2. Text explicitly keeps all eligible j. Cold reconstruction, bridge-browser.json and inspected bilingual reassignment screenshots corroborate closure. Owner/next action: lesson author; no further fix needed. Fix revision and reviewer recheck: b3336f7dc7243e7d15f336ab490eb6c3a0824304, this run. | **Closed (optional advisory)** |

No required open findings. No earlier failure or report was overwritten.

### Six scores and conclusion

| Dimension | Score | Weighted points | Observation-based rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 4 | 15 | Tiny hand-operated sequence precedes abstraction; arbitrary swaps, anagrams, zero-based indices and lower bound are explicit. |
| Derivation/saved work | 4 | 20 | Baseline pair enumeration/copying cost, two-versus-three-swap counterexample, concrete reassignment and general optimal-route bridge are independently reconstructable. |
| Maintained state/correctness | 4 | 20 | Fixed-prefix/optimal-completion invariant, candidate dependencies, cycle costs, layer histories, seen counts, boundaries and termination verified. |
| Interaction/visual meaning | 4 | 20 | Predictions, real before/after data, distinct reassignment/swap markers, retained history, endpoints and independent interaction state all match their stated meanings. |
| Python/cost | 4 | 15 | Actual faithful callable executed against independent fresh/boundary cases and oracle; visual transition, mutation behavior, all-channel exact parity and conservative costs verified. |
| Bilingual/device | 3 | 7.5 | Equivalent localized causal reasoning, titles, keyboard and readable narrow layouts pass; magnified narrow views require substantial scrolling and fragmented navigation. |

**97.5/100 — accepted for this exact candidate and review scope.** Every dimension is at least 3; required open IDs: none. This independent lesson acceptance is separate from publication.

### Evidence scope and limitations

All screenshots and rerun receipts are in `specs/reviews/854-evidence/854-review-2-771efac1/`. Concrete receipts: independent-checks.json, solution-results.json, core-results.json, browser-results.json and bridge-browser.json. Browser version is recorded in the browser receipts; tests used installed Playwright via NODE_PATH and `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

No physical touch device, browser-chrome magnification, screen-reader session, other operating-system font environment, human teach-back, successful LeetCode submission or public deployment was tested or claimed. Correctness checks cover finite tested examples plus the independently assessed argument; they do not measure novice learning. Git status at review end contains only this report and its exclusive evidence directory. No implementation, shared files, tests, earlier evidence, Git configuration, workflow or services were changed; no agent was spawned.

