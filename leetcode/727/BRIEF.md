# #727 · Minimum Window Subsequence — author brief (rebuilt 2026-11-11)

Status: author build and self-check complete; independent review pending. No LeetCode
submission, independent acceptance, registration or deployment is claimed.

## History of this brief

The 2026-10-25 preparation pass stopped at the source gate: the problem is subscriber-only
and the public GraphQL endpoint returns `content: null`, `codeSnippets: null` (evidence kept in
`tests/evidence/`, probe `tests/check_official_access.py`). The probe was re-run on 2026-11-11
into scratch and is still `blocked`. On 2026-11-11 the owner asked for the remaining problems to
be finished, so this lesson is built on the publicly circulated statement below, labelled as such
on the page. The probe is kept as access evidence; it is not a lesson test and still exits
"blocked" by design.

## Contract taught (not verified against the official page)

- Input: lowercase strings `s1`, `s2`; `1 ≤ |s1| ≤ 2·10^4`, `1 ≤ |s2| ≤ 100`.
- Output: the shortest contiguous substring W of s1 such that s2 is a subsequence of W;
  `""` if none. **Tie: the window with the leftmost start.**
- Python interface assumed: `Solution.minWindow(self, s1: str, s2: str) -> str`. Older versions
  of the problem named the parameters `S`, `T`; positional calls are unaffected.
- Uncertainties: the exact tie wording and parameter names could not be checked; the public
  `exampleTestcases` inputs (`"abcdebdde"/"bde"`, and a no-answer case) are consistent with this
  reading (expected `"bcde"` and `""`) but outputs are not public.

## Learning path (one idea per step)

| Step | Question it answers | Example / action | Holds when |
|---|---|---|---|
| 1 Task | What is a subsequence window; which one wins? | `xcaxctat`/`cat` → `ctat`, not the first valid `caxct`; tie `axbcayb`/`ab` → `axb`; `ta`/`at` → `""` | Order matters, gaps allowed |
| 2 Brute force | How much work is trying every start? | Per-start table computed live: 32 letters read for 8 letters; t(5) read 6 times; worst case ~n²/2 = 2·10^8 | Greedy earliest match is optimal for a fixed start (exchange argument given) |
| 3 Key observation | Which starts must we remember? | Wrong turn first (#76 counts ignore order: `ta`/`at`). Then the reader is asked to compare c(1) and c(4) at equal progress; answer in a "think first" disclosure, technique named only inside it | Same progress ⇒ later start dominates forever |
| 4 Update rule + trace | How does reading one letter change the m slots? | Recap of `latest[k]`; promotion rule; why k goes downward (`a`/`aa` counterexample); why assignment is safe; reversible trace with presets, custom input (≤20/≤6 letters), slider, slot table with old→new, strip with per-start progress tags, candidate history | `latest[k-1] ≥ latest[k]` |
| 5 Proof + predict | Why is this shortest and leftmost? | Invariant and two-case proof tied to index 4 of the main example; tie argument; boundary list; fresh prediction `babcb`/`bb` (distractors: letter reuse `b`, rightmost tie `bcb`, substring confusion `""`) | — |
| 6 Python | Which line comes from which step; cost | Source shown first, then line-to-step mapping; O(n·m)=2·10^6 vs 2·10^8; O(m) space; trace snapshots are teaching memory only; forward/backward two-pointer mentioned as alternative | — |

## Verification (author)

- `tests/test_solution.py`: independent oracle (enumerate windows by length then start, iterator
  subsequence test) vs `solution.py` — 127,881 exhaustive cases (s1 over {a,b,c} up to length 7,
  s2 up to length 3), 6,000 seeded random cases, 300 large seeded cases against a structurally
  different forward/backward scan (itself cross-checked against the oracle), named lesson cases,
  max-size timing, mirror equality, copy key uniqueness. Emits fixtures for `test_core.cjs`, which
  checks every frame's slot values against the definition of `latest[k]`, monotone slots, change
  lists, best-so-far against brute force on each prefix, history and deep snapshots.
- `tests/browser.cjs`: both locales; every preset forward/rewind/replay/end/reset; main-example
  frame semantics; custom valid/invalid input; every prediction option; locale switch keeps state;
  source/download/copy/fallback parity; keyboard; 1280/390/320 overflow and 48px controls;
  reduced motion; blocked storage; offline source; screenshots.
- `python3 -B scripts/register_leetcode_lesson.py 727 --validate-only` exit 0.

## Cross-review 2026-11-11

Reviewer: Claude Code (claude-opus-5-5), first reader who did not build the lesson. Independent of the
author; no LeetCode submission.

- **Statement.** Checked against two public mirrors: the doocs/leetcode README (current wording, `s1`/`s2`)
  and grandyang's write-up (older wording, `S`/`T`). Both give: shortest contiguous window of s1 containing
  s2 as a subsequence, `""` if none, **leftmost start on ties**, 1 ≤ |s1| ≤ 2·10⁴, 1 ≤ |s2| ≤ 100, lowercase,
  Python `minWindow(self, s1, s2)`. The lesson's contract matches on every point; the tie doubt is resolved.
- **Brute force.** My own oracle (every window, shortest then leftmost), written before reading
  `tests/oracle.py`, agreed with `solution.py` on 135,881 cases (all s1 over {a,b,c} up to length 7 × all s2
  up to length 3, plus 8,000 seeded random). Max-size inputs run in < 0.1 s.
- **Text.** Recomputed by running `core.js`: brute-force table (32 letters read, t(5) read 6 times), every
  preset answer and description, the `latest` slots at index 4 and for `abcabdbe/abe`, the prediction
  `babcb/bb` and its distractors, n²/2 ≈ 2·10⁸ vs n·m = 2·10⁶. Proof steps (two-case invariant, top-down
  order, assignment vs max, tie argument) hold. zh/en say the same. No errors found.
- **Browser.** zh/en at 1280/390/320, stepping the main, tie and swap presets: no overflow, no console
  errors, all controls ≥ 48 px; author `browser.cjs` passes against my server.
- **Rubric.** A3 B3 C3 D3 E3 F3 G3. The dominance question (c(1) vs c(4) at equal progress) is asked
  before the technique is named.
- **`sep` exemption.** Legitimate: it is the sentence joiner (empty in Chinese, one space in English),
  pinned to exactly `['', ' ']`, and no collection rule requires a non-empty zh string.
- **Changed.** Nothing in the lesson. Note: my first test run omitted `OUTPUT_DIR`, so
  `tests/evidence/numerical.json` and `oracle-fixtures.json` were regenerated in place (same seeds; only
  timing values can differ).
- **Not verified.** The official page itself (still subscriber-only); a learner study.
