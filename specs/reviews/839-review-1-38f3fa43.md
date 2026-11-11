# Independent review: 839 — Similar String Groups

Candidate: `c55fd55af1e63d663440acf4c56bf4d233c6304d`; URL: http://127.0.0.1:18770/leetcode/839/. Target: basic Python reader. Frozen rubric: six weights 15/20/20/20/15/10; Python canonical interpretation. Reviewer/model identity unavailable; this report claims only checks performed in this run.

## Cold browser walkthrough (saved before source audit)

Read only the frozen rubric before opening the candidate in Chromium via Playwright at 1280×900. No brief, source files, tests, prior review, or author evidence read. Browser-displayed Python was opened as lesson content at the end of this walkthrough.

| Teaching step/question | Action | Visible result | My causal paraphrase |
|---|---|---|---|
| 1. Can one swap and a path mean different things? | Read tiny tars example; click Swap 0↔2, then 0↔1; undo; reset. | tars (mismatches 0,1,2) becomes rats (0,1), then arts (none); undo restores rats and one-entry history; reset restores tars and empty history. | Each swap changes two positions; two legal edges can connect endpoints that are not themselves one edge apart. The fixed target makes this visible before graph terminology. |
| 2. What is a group and why not compare only a representative? | Read graph definition and both official examples, inspect expandable baseline control and cost paragraph. | IDs identify occurrences; tars—rats—arts plus isolated star gives 2. Representative-only counterexample is spelled out. Baseline stores neighbors and traverses paths; 44,850 pairs at n=300. | Connectivity asks for paths, not pairwise similarity. Testing all pairs remains necessary in this presented method; retaining all adjacency entries is the work DSU avoids. |
| 3. What state survives a pair test? | Advance official preset through four pairs, then back once. | First 4→3, parent 1→0 and root size 2; three mismatches 3→3; four mismatches 3→3; rats—arts 3→2, parent 2→0 and size 3. Back restores count 3, singleton arts, and exactly the prior three ledger rows. | Processed edges define current components. A new edge between different roots joins two components; a failed pair cannot change membership. Ledger is historical data; orange underlines identify mismatch positions in the currently compared words. |
| 4. Does a duplicate add a group? | Choose “1 group” and reveal for [abc,bac,bca,bca]. | Correct prediction; explanation gives abc—bac—bca, equality of final two entries, and why an already-connected edge does not reduce the count. | Four vertices can become one component with three merges; counting every similar edge would over-decrement. This transfers the rule to a different chain with duplicates. |
| 5. How does the transition become Python and what does it cost? | Read explanation, expand complete displayed Python. | `similar`, `find`, root comparison, union by size, and decrement are visible. Conservative O(n²(L+log n)) time/O(n) auxiliary space; simulation explicitly differs in collecting all mismatches and retaining frames. | The 3→2 rats—arts change maps to distinct `find` results, `parent[b]=a`, root size addition, and `groups -= 1`. Root sizes plus path shortening preserve membership while changing routing. Input words are only read. |

Cold observations: terms (anagram, vertex, path, component, root, invariant) are explained; hand manipulation precedes abstractions. The interface accepts presets only. A desktop screenshot was captured at the restored third-pair state: `839-evidence/839-review-1-38f3fa43/cold-desktop.png`.

### Independent predictions recorded before checking custom cases

These will be **code checks**, not custom-input browser experiments. Fresh input `["abcd", "bacd", "badc", "dcba"]`: predict 2 groups. abcd—bacd—badc is a chain; dcba differs by four positions from each of those three. Counterexample `["abcd", "badc"]`: predict 2 despite shared letters; four mismatches require at least two swaps, so “all anagrams are directly similar” fails. For `["abcd", "bacd", "badc"]`, predict 1 despite abcd/badc having four mismatches, refuting representative-only grouping. An independent explicit-swap graph oracle will check these predictions after this cold record is saved.

No claims of actual human comprehension or LeetCode submission are made.

## Post-cold source, official contract, and computational audit

HEAD equals the requested revision. Working-tree status initially contained only this run's report/evidence. No earlier 839 review report was found by file search; no inherited finding is being silently closed. The rendered-state supplement was read only after the above cold record was saved. No implementation or author evidence was regenerated.

Read canonical `solution.py`, mirror, `core.js`, `app.js`, `copy.js`, HTML, local/shared CSS and locale consumer. Read both test runners **before** execution. The baseline file agrees with the displayed baseline. `LANGUAGE_FILES` in `scripts/register_leetcode_lesson.py` specifies Python → `solution.py` / `python-code.js` / `PYTHON_SOURCE`, which this lesson follows. This is actual executable Python3, not an analogy; a non-Python language contract is inapplicable.

Read the [official statement](https://leetcode.com/problems/similar-string-groups/) normally through web access: both examples, identical-or-one-swap rule, lowercase anagrams, 1–300 words and length 1–300 match the lesson. Separately inspected lesson-local `tests/evidence/official.json`: its saved Python3 snippet is `class Solution: def numSimilarGroups(self, strs: list[str]) -> int`, matching the candidate. The independent live statement read did not expose the editor selector; interface corroboration uses that explicitly identified saved official response, not a claimed live selector operation. No access bypass or submission was attempted.

Served bytes equal checkout bytes for HTML, app, core, copy, mirror, Python and local CSS. SHA-256 identities include:

- `solution.py`: `3a3fc21fa1d2cb75af0106ad222067fdf15cb35a6505bbd64cc40d4c222b2218`
- `index.html`: `3e1b4020aa8af85f4add1a61b64bf4bee0616eb634d5f90a97e3ee3703a82551`
- `app.js`: `43adbdfd0cc214a071ccb41ca8101d2a764f6bc7d6a7b36e4d3e3c51fd2fb0d5`
- `core.js`: `0055afb36f5a29c4fbcfef3726ae1e0151a5c3a597c7829972deebbe366238cd`
- `copy.js`: `07eb984ee35bdebb003f738cad53530d2798aebb1c3858f754579375e00c90da`

### Independent custom checks and invariant reasoning

Executed the actual canonical file via `importlib.util.spec_from_file_location`. Independently implemented an oracle that generates every legal position-swap of each word plus itself, constructs occurrence adjacency, then counts components by traversal. It uses neither mismatch counting nor DSU.

| Input (code check) | Prediction | Canonical result | Independent oracle |
|---|---:|---:|---:|
| abcd, bacd, badc, dcba | 2 | 2 | 2 |
| abcd, badc | 2 | 2 | 2 |
| abcd, bacd, badc | 1 | 1 | 1 |

Also passed 250 independently generated valid cases using seed 38143, 1–15 words and length 1–9 drawn from abcde and permuted from the same multiset. Checked input list equality before/after every call. These are additional reviewer checks, separate from the inspected author harness.

The causal proof checks out: zero differences accepts equality; two differing positions must cross-match because all other character counts cancel; one differing position is impossible; three or more cannot be fixed by changing only two positions. Every unordered pair appears once. Each accepted edge either joins two existing components or leaves an already-connected component unchanged. A union cannot split a component; parent pointers stay within membership, roots self-point, root size is membership count, and the number of roots equals groups. Thus the processed-prefix invariant reaches the complete similarity graph at termination.

Concrete mapping: after tars—rats, parent=[0,0,2,3], root-0 size=2, count=3. At rats—arts, find(1)=0 and find(2)=2, so `parent[2]=0`, `size[0]=3`, `groups=2`. This agrees with the visible fourth-pair state; rewind restores the preceding snapshot, rather than attempting to reverse an irreversible compression operation. Equal-root duplicate comparisons keep count=1. The simulation intentionally collects all mismatches and stores snapshots; those costs are explicitly excluded from the Python submission claim.

The baseline is O(n²L) time and O(n²) worst-case adjacency storage. The canonical code stores only two n-element arrays and scalar locals, does not mutate strings/list, and has no recursive stack. Attaching the smaller tree bounds height by log₂n; path halving cannot increase it. Hence the stated conservative O(n²(L+log n)) time/O(n) auxiliary space is valid. At n=1, zero pair tests still leave initialization and answer 1; L≥1 keeps the stated total bound valid. At n=L=300, the displayed 44,850 pairs × 300 = 13,455,000 comparison-position upper bound is correct. Empty/non-anagram inputs are explicitly outside the contract.

### Safely rerun inspected tests

Commands from repository root (all result/screenshot output redirected into this run's exclusive directory):

```
OUTPUT_DIR="$PWD/specs/reviews/839-evidence/839-review-1-38f3fa43" python3 -B leetcode/839/tests/test_core.py
OUTPUT_DIR="$PWD/specs/reviews/839-evidence/839-review-1-38f3fa43" node leetcode/839/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 839 --validate-only
```

All exit 0. Core result: 2,184 executable Python cases, 314 trace inputs and 3,296 prefix frames; root sizes, acyclic root routing, membership, history length, event before/after counts and input preservation passed against a legal-swap graph oracle. Includes length-one lists, repeated letters, duplicates, n=L=300 moving-b cases, and 300 identical length-300 words. Mirror exactness and duplicate detection for all 90 localization keys passed. Retained JSON uses the harness's original `type: author self-check` label: these are reviewer reruns of inspected author tests, not invented additional reviewer identities.

Browser result: 14 full preset/locale traversals, zero console/page/resource errors; exact source and clipboard/download checks passed. Metadata preflight produced no stdout and exited 0. `lesson-entry.json` complexity is exactly one nonempty string containing both time and space, not an object. No registration or repair was run.

## Interaction, bilingual, device, and source-transfer observations

- Independently checked preset terminal results: official 1→2, official 2→1, singleton→1, duplicates→1, three mismatches→2, bridge→1, repeated letters→1. The full browser runner traverses every pair, checks rewind/replay, resets, and End. Singleton has 0/0 pairs and disabled Next/End immediately; this is correct termination.
- EN and Chinese semantic bindings agree for rejection (3→3), merge (3→2), identical already-connected pair (1→1), group sizes, root pointers, and quiz explanations. Parsed copy has unique keys and two-string values; the common consumer indexes those exact locale pairs. Clipboard-fallback copy is a separate key/path from mismatch explanations.
- Independently exercised a zh→en→zh roundtrip at 320px after a hand swap, first trace pair, and revealed wrong quiz prediction. The word stayed rats, ledger stayed one row, selected answer stayed 0, and feedback retained the correct answer/path explanation in the selected language. H1 and document title use `#839 · 相似字符串组` / `#839 · Similar String Groups`. Official link remains the exact metadata URL.
- Changing a quiz choice invalidates revealed feedback until Reveal; reset clears selection and disables Reveal. All three options yield the appropriate explanatory feedback. Changing the trace preset resets only the trace; the independent exercise retains its own input and answer as promised.
- Keyboard Enter advances Next; Tab reaches Reset with a visible 3px focus outline. Locale buttons retain keyboard focus. Section links land below the sticky bar in both languages; the horizontally scrollable step navigation remains reachable. Forced-colors focus, storage-denied initialization and file:// source rendering also passed the inspected runner.
- Linux Chromium headless captures cover 320, 390, 736 and 1440 widths, plus the 1280 cold capture. CSS zoom=2 at desktop checks reflow at 200%; this is synthetic CSS zoom, not native browser-zoom or physical-phone certification. No document horizontal overflow observed. At 320, word ID/content, mismatch letters, parent IDs, ledger entries and answer options retain their association through wrapping. Longest preset labels were independently selected and captured in EN/Chinese at 320; both closed controls display the full selected phrase. Font stack is PingFang SC / Microsoft YaHei / system-ui / sans-serif; no claim about an exact resolved font or other OS rendering.
- Visually inspected this run's cold desktop, EN/Chinese 320 trace, EN 320 controls, Chinese 320 groups, EN 320 ledger, EN/Chinese 390 quiz, both zoom captures, EN fallback, and both longest-selected-label captures. The screenshot starts of some long stages lie under the sticky bar due to scroll positioning; separate control/group captures expose those surfaces. No actual glyph intersection or essential clipping observed in inspected views.
- Disabled Previous uses rgb(154,167,184) on rgb(28,35,48), opacity=1: visibly readable rather than faded. The browser contrast helper was inspected and its **actual extracted functions executed** against red/green/blue luminances .2126/.7152/.0722, black/white=21, and #747474/black=4.492948073111701 (<4.5). Actual tested solid palette pairs have minimum contrast 6.449407898769069; primary button dark-on-cyan exceeds 7. This does not certify every system selection color or gradient; the lesson's relevant surfaces are solid.
- Canonical file, decoded offline mirror, rendered code via `textContent`, successful automatic copy, manual fallback and download match exactly including final newline. Each locale's fallback starts with a fresh distinct non-source clipboard sentinel, written and read back before automatic writes are rejected. Focus and full selection are checked, then Linux **Control+C** performs the real transfer; clipboard readback equals canonical source. No trimming or test-written source clipboard value substitutes for this operation.
- Related links were keyboard-activated in both languages and destination prose read: #815/#step2 actually explains stop frontiers and route expansion by BFS; #765/#step3 derives the n−c swap bound from cycles. These served preview sections support the labels. Public release inclusion is outside this local review.

Evidence retained in `specs/reviews/839-evidence/839-review-1-38f3fa43/`: `core.json`, `browser.json`, cold screenshot, runner screenshots, and two independently captured longest-select screenshots. Earlier evidence is unchanged.

## Findings and scores

Required open IDs: **none**. No earlier required 839 finding was located to close.

Optional observation **839-R1-N1** (minor teaching friction, open advisory, owner: lesson author): section 5, either locale, read `find` and union-by-size explanation after the official trace. The prose explains grandparent redirection and doubling, but the small presets mainly produce shallow stars, so a beginner has to mentally instantiate a nontrivial path-shortening operation. An optional tiny parent-chain before/after example would make that secondary optimization more concrete. The grouping transition and correctness bridge remain reconstructable; this is not a required fix and no candidate repair was made.

| Dimension | Score | Weighted points | Evidence/rationale |
|---|---:|---:|---|
| Problem/terms/hand calculation | 4 | 15 | Small manual swaps precede graph terminology; indices, occurrences, constraints, isolation and duplicates are explicit. |
| Causal derivation/saved work | 4 | 20 | Representative shortcut is refuted by a concrete chain; baseline and DSU differ in retained edges, with numeric pair cost and anagram-dependent direct test. |
| Maintained state/correctness | 4 | 20 | Processed-edge invariant, root sizes/pointers, distinct-root decrement, no-op, boundaries and termination agree with complete-prefix checks. |
| Interaction/visual meaning | 4 | 20 | Reversible hand work, post-pair frames, retained ledger, mismatch underlines, before/after values and prediction-change semantics are consistent. |
| Python/cost | 3 | 11.25 | Faithful canonical executable and exact source transfer pass; conservative cost is justified. Path-halving's concrete multi-level effect introduces the minor friction described above. |
| Bilingual/device access | 4 | 10 | Reasoning and state meanings agree across locales; narrow text, selected labels, keyboard focus, readable disabled state and synthetic 200% reflow checked. |
| **Total** | | **96.25 / 100** | Every dimension ≥3; zero required open findings. |

## Conclusion and limitations

**Accepted for the identified local candidate**, separate from publication. Acceptance rests on the source-blind walkthrough, calculations, execution, state semantics and inspected rendering, not test counts or screenshots alone. No measured novice teach-back, real human comprehension, successful LeetCode submission, production delivery, physical device, native browser zoom or other-platform font certification is claimed. No agents were spawned and no services, shared files, implementation, workflow, tests, Git configuration or earlier evidence were changed.
