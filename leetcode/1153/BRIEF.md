# #1153 · String Transforms Into Another String — lesson brief

Category computing / LeetCode collection; stage university. Reader knows Python strings, dicts and sets.
Outcome: the reader can explain why each letter needs one destination, why order matters (chains from the end),
why a cycle needs a spare letter, why "str2 uses all 26 letters" kills the spare (except when the strings are
already equal), and write the O(n) test.

## Revision of the preparation brief (2026-11-11)

The preparation pass (2026-10-27) stopped at the subscription gate (`content: null`, `codeSnippets: null`); its
access record stays in `tests/`. The public metadata gives `canConvert(str1: string, str2: string) -> boolean` and
two sample input pairs. This build uses the widely known statement, consistent with that metadata:

- `str1`, `str2` have equal length, 1 ≤ length ≤ 10⁴, lowercase English letters only.
- One conversion: choose a letter occurring in str1 and change all of its occurrences to any other lowercase
  letter. Zero or more conversions; return whether str1 can become str2.
- Python interface `Solution.canConvert(self, str1: str, str2: str) -> bool` (standard LeetCode Python3 form of
  the public metadata; the official Python snippet itself is not public).

The two subscriber-only points the dispatcher asked about:
- **Equal strings** → True (zero conversions), including when all 26 letters are used. The code tests this
  first; without it, `abc…z → abc…z` would wrongly return False.
- **The 26-letter limit** is what makes spares possible. If str2 uses all 26 letters (and the strings differ), a
  consistent map forces str1 to use 26 letters too; every conversion then targets a present letter, dropping the
  distinct count below 26 permanently → False. If str2 uses fewer than 26, merging letters with a common
  destination leaves str1 with exactly |set(str2)| < 26 letters, so a letter is absent: chains go end-first and
  each cycle borrows that spare → True.

Uncertain without a subscription: exact wording and whether "another character" excludes converting a letter to
itself (irrelevant: such a move changes nothing).

## Learning loop

| Step | Already known | Question | Input → output | Action → observation | Holds when |
|---|---|---|---|---|---|
| 1 Sandbox | problem | What does one conversion change? | abbc→bccd, abab→baba | apply a→b first: columns merge, "stuck" message; undo; c→d, b→c, a→b succeeds; swap needs a third letter | real alphabet |
| 2 Brute force | step 1 | Correct direct method, why slow? | BFS code | count 75 first-level strings, up to 26ᵏ states | — |
| 3 Invariant | moves | Which targets are impossible? | aab→xyz | question → reveal: positions sharing a letter never split → one destination per letter; merging allowed; wrong turn: order of applying the map | any input |
| 4 Cycles | chains | Where to start a cycle? | abab→baba | question → reveal: borrow spare c; toy alphabet {a,b} makes it impossible | a letter is absent |
| 5 Limit | spare | When is there no spare with 26 letters? | full / non-full str2 | proof both directions + equal-strings exception | — |
| 6 Walk | all | Does the test hold on my input? | presets / custom strings / toy alphabets | stage 1 builds the table (conflict highlighted); check; stage 2 performs legal conversions (merge/chain/spare) until str2 | ≤30 chars (page limit) |
| 7 Predict | all | rotate 26 letters by one? | choose, reveal; distractors: "cycle, use spare", "table conflict" | hidden until reveal |
| 8 Code | all | which idea → which line; cost | solution.py | mapping, O(n) time, O(1) space | — |

Trace frame = after one position is scanned, after a check, or after one conversion. Frame 0 does nothing. The
verdict is shown as pending until decided and unchanged afterwards. Toy alphabets are a labelled teaching
variant; the canonical code always uses 26.

## Verification (author self-check, not independent review)

- `tests/test_solution.py`: BFS over real strings (every legal conversion) for alphabets of size 2, 3, 4, 5 and
  all string pairs up to lengths 7, 6, 5, 4 — 2,145,094 pairs — against solution.py's exact source with the
  constant 26 replaced by the alphabet size; 26-letter boundary cases (identical 26-letter strings, rotation,
  reversal, 25 vs 26 distinct targets, length 10⁴); 4,000 seeded random 26-letter cases. Fixtures (521,610)
  go to `tests/test_core.cjs`, which checks the browser model's verdict and independently replays every
  conversion it performs (legal, spare absent, ends at str2).
- `tests/test_copy.py`, `tests/browser.cjs` (tests/README.md).
- Not verified: a LeetCode submission, the official statement text, real devices, independent teaching review.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5). First reader who did not build the lesson.

**Problem statement.** Checked against doocs/leetcode `1153.String Transforms Into Another String/README_EN.md`
(definition, constraints 1 ≤ length ≤ 10⁴, lowercase letters only, both examples) and walkccc.me/LeetCode/problems/1153
(signature `canConvert(str1, str2) -> bool`). Search results from several other mirrors quote the same bound. The
lesson's reading matches:
- a conversion rewrites every occurrence of one letter to another lowercase letter;
- zero conversions are allowed, so equal strings give True even when they use all 26 letters;
- if the strings differ, str2 using all 26 letters gives False.
The premium note now says the bound agrees with the public sites.

**Solution.** My own BFS (`tests/test_xreview_bfs.py`, written before reading the builder's) explores every legal
conversion. It compares that BFS with:
- the **unmodified** solution.py over the real 26-letter alphabet: every str1 shape of length ≤ 3 against 13,647 str2
  (all strings over {a,b,c,z} plus seeded random ones);
- an independently restated rule over alphabets of 2–4 letters: 141,793 exhaustive pairs.
In scratch I also ran 2,145,094 exhaustive pairs over alphabets of 2–5 letters, 96,000 sampled 26-letter pairs, and
20,000 random 26-letter pairs against solution.py. No mismatch.

**Text.** Recomputed: 3 × 25 = 75 first-level strings; 26³ = 17,576 reachable strings for abbc (exact, since every
consistent map with fewer than 26 targets is reachable); 26²⁶ ≈ 6.2 × 10³⁶; abab → cbcb → caca → baba; the predict
answer (rotation → False; replacing the final a with a used letter → True). I checked the step-5 proof in both
directions, including the safe merge and the aa+bcd…z example. The cost claims match the code, and zh and en agree.
No errors found.

**Teaching.** In step 1's sandbox, a→b gets stuck, which motivates "one destination per letter". Step 4 asks where to
start a cycle before revealing the spare letter, and the toy alphabets make the 26-letter limit visible. Traces
stepped on abab→baba, the toy {a,b} variant, the 26-letter rotation and aab→xyz in zh and en at 1280 and 390.

**Rubric** (0–3): A 3, B 3, C 3, D 3, E 3, F 3; G correct. The only change is the premium note.
Not verified: a LeetCode submission, the official wording.
