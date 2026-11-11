# #1178 Number of Valid Words for Each Puzzle — author brief

Status: author run; independent lesson review pending. No acceptance, publication, or learner outcome claimed. Reuse approved lesson pattern and exact shared tokens; own only this folder.

Product boundary: bilingual algorithms lesson for university-stage learners who know sets and loops. Category: algorithms / computing. Smallest useful outcome: hand-check a puzzle, derive a bitmask subset-count invariant, and map it to the official Python callable.

Official verification: public LeetCode page and GraphQL captured 2026-10-27 Asia/Singapore in tests/evidence/official-graphql.json; statement, examples, constraints, metadata and Python3 selector were observed. Canonical interface is Solution.findNumOfValidWords(self, words: list[str], puzzles: list[str]) -> list[int]. Python is preferred and faithful.

## Five steps

0. Known: letters and set membership. Question: which words fit puzzle aboveyz? Input tiny words/puzzle; output count. Action inspect masks; observe required first letter and no outside letters. Condition puzzle has seven distinct lowercase letters.
1. Known: validity rule. Question: why checking every word is expensive, and what wrong shortcut fails? Input official-sized bounds and a counterexample. Action compare baseline and repeated subset checks. Condition word letters may repeat; presence is set-based.
2. Known: a word's distinct-letter set. Question: how can one seven-letter puzzle enumerate all possibilities? Input aelpsxy; output subset contributions. Action move through submasks; observe only masks containing first bit contribute. Condition seven bits means at most 128 subsets.
3. Known: frequency table and submasks. Question: can you predict a fresh answer using the invariant? Input words [aax, abx, bxx, ay], puzzle abxq... seven letters; output after reveal. Action choose, reveal, then change choice; feedback clears on change. Condition a word is counted once after deduplicating its letters.
4. Known: submask sum. Question: how does the official Python code implement it and what are costs? Input official signature/source; output list. Action map each line to mask/frequency/submask loop, copy/download exact source. Condition lowercase English letters and seven unique puzzle letters.

## Terms and invariant

Step 0: valid word = contains puzzle's first letter and every distinct word letter is in puzzle; mask = 26-bit presence encoding.
Step 1: baseline = test each word against each puzzle; distinct mask = set of letters, ignoring repeats.
Step 2: frequency = number of words with one distinct-letter mask; submask = a mask made only from bits in another mask. Invariant: freq[m] counts exactly the input words whose distinct-letter mask equals m; answer for puzzle p is the sum of freq[s] over submasks s of p that contain first(p).
Step 4: bit = one letter position; m & -m isolates lowest set bit; complexity O(W*L + P*2^7), space O(W) for distinct word masks.

Simulation is a local deterministic trace, not execution of the displayed submission. The page uses bounded teaching data and a small explicit table; it does not claim runtime limits beyond the stated algorithm. Related anchors link to bitmask and subset concepts.

Design tokens: shared dark palette from ../style.css; local CSS only for layout, focus, mobile wrapping and 48px controls. P0 causal explanation, reversible trace, bilingual state, source parity and oracle tests. P1 related anchors. P2 none. Deferred: arbitrary huge input editor and browser execution of Python.

Author self-check record: implementation and self-check evidence are complete in tests/SELF-CHECK.md and tests/evidence/browser.txt. Separate review was performed by /root/review1178; its findings and the author fixes are recorded in tests/evidence/independent-review.md. This remains an author candidate, not acceptance or publication. No commits, registry edits, deployment or shared-file edits.

## Revision 2026-11-11

Review (review-range-4) found: hand example said actor's c, t, o, r were outside aboveyz (o is inside); the trap said puzzle abxyqrs had first letter b (it is a); related links #10/#44 pointed at regex/wildcard DP; 390 px horizontal overflow; the quiz answer equalled the visible trace total; the bitmask invariant was announced, not discovered (B=1).
Changes: corrected hand example (per-word list; actor → c, t, r) and trap (puzzle bxyqrsa, first letter b). Step 2 now derives the insight before naming it: validity depends only on the letter set → a 7-letter puzzle has only 2^6 = 64 candidate sets → count words per set once and ask 64 lookups (10^9 → 6.4×10^5). Step 3 then names bitmasks, explains the (sub−1)&rest walk and gives a three-part correctness argument. Solution now enumerates the 64 subsets of the six non-first letters (sub | first) instead of 127 submasks filtered by first bit, so trace and code are the same loop. Trace shows word groups (freq) and marks which are asked / never asked and why; only hits are listed. New fresh quiz (catsofy → 5) with per-option misconception feedback. Code mapping by line ranges with an aelpsxy frame; cost explained. Links → #982 step2, #1125 step3. Short nav labels. Removed hard-coded English callout and the html lang override (now zh-CN via common.js).
Overflow cause: not the step nav (it scrolls inside its own container) but #input readout holding an unbreakable word-list string; shared ../style.css .readout has no overflow-wrap. Fixed locally in style.css.
Changed by Claude Code (claude-opus-5-5) on 2026-11-11; not committed. Verified-By: self-check only; independent review pending.
Verified: tests/test_solution.py (official examples, quiz, trap, 300 random vs brute force); tests/browser.cjs (BASE_URL configurable) at 320/390/1280 × en/zh: no overflow, no console errors, preset totals 1/3/2, quiz feedback.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5); independent of the fixer, working tree only (not committed).
Checked: statement and limits from a public mirror (doocs: 1 ≤ words ≤ 10⁵, 4 ≤ |word| ≤ 50, 1 ≤ puzzles ≤ 10⁴, puzzles of 7 distinct letters). Own brute force (contains first letter and every word letter in the puzzle): exhaustive 780 words (all strings of length 1–4 over a–e) × 56 puzzles (every 7-of-8-letter set over a–h with each possible first letter); 400 seeded random rounds, 12,548 puzzles, each puzzle also re-asked with the same letters and a different first letter, plus words with 10 distinct letters and duplicated words; explicit first-letter cases; both official examples. All agree. Timing at the limits (10⁵ words of length 50, 10⁴ puzzles): 0.08 s; dense small masks 0.06 s. solution.py and python-code.js are the same text (the display adds one trailing newline); core.js runs the same 64-subset `(sub − 1) & rest` loop with `sub | first`; copy states O(ΣL + 64·P), lesson-entry says O(W·L + P·2^6). Fresh quiz (catsofy → 5) recomputed. tests/test_solution.py and tests/browser.cjs pass on port 18925.
Found: no errors. Minor: the quiz words cat/act/coy have length 3, below the official minimum of 4; the count is unaffected (left as is). The registry's O(W·L + P·2^7) is a valid but looser bound than the page's 2^6.
Changed: nothing besides this note.

## Integration 2026-11-11

Changed by Claude Code (claude-opus-5-5), the LeetCode integration step (see `specs/leetcode-review-2026-11-11.md`).

The step-4 transfer quiz used 3-letter words (cat, act, coy), but the problem requires 4 ≤ words[i].length. The words are now [cast, acts, casts, tact, cost, oats, catch] with puzzle catsofy: groups {a,c,s,t} cast/acts/casts (3), {a,c,t} tact (1), {c,o,s,t} cost (1), oats lacks c, catch has h; answer still 5 (option order unchanged), checked with `solution.py`. The distractor explanations now refer to casts (repeated s) instead of tact. `tests/test_solution.py` pins the new case. Registry complexity resynced from `lesson-entry.json` (P·2^6, not 2^7). Self-checked only.
