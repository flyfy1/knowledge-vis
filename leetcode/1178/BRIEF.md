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
