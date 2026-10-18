# 44: Wildcard Matching

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: the reader can connect two concrete repeated recursive calls to one saved prefix-pair result, then independently predict a star transition.

## Official contract

Statement rechecked 2026-10-18 from https://leetcode.com/problems/wildcard-matching/.
Can a wildcard pattern cover the whole text? ? matches exactly one character; standalone * matches any string, including empty. Here * does not depend on the preceding character.
Text and pattern lengths 0…2000; lowercase letters, ?, and *. Empty strings are official inputs.

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read the end-shortening baseline; follow both a / b** paths to the repeated empty / b* call | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Map repeated empty / b* to dp[0][2]=false; derive left/above and diagonal dependencies | The view retains the full table to explain dependencies; Python stores two rows. Coordinates are prefix lengths, ε is empty, T/F mean true/false, and · means uncomputed. Empty text matches only all-star prefixes. |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | Keep the default input and inspect event 16: left F, above T, current T. Rewind restores the uncomputed cell; switching preset restarts. | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | ba / ?* → predict final cell from left F and above T with a reason | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | Time O((m+1)(n+1)); auxiliary space O(n+1), where m is text length and n is pattern length, including zero-length inputs. |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
| `previous[j]` | Steps 1–2; repeated in step 4 | Same column in the previous row: dp[i−1][j] | Arrays, indices, the stated input contract |
| `current[j - 1]` | Steps 1–2; repeated in step 4 | Left cell in the current row: dp[i][j−1] | Arrays, indices, the stated input contract |
| `previous[j - 1]` | Steps 1–2; repeated in step 4 | Diagonal dependency for literals or ? | Arrays, indices, the stated input contract |

## Representative inputs and expected hand calculation

- Variable-length star: `["adceb", "*a*b"]`.
- Question mark is not enough: `["cb", "?a"]`.
- Empty text and repeated stars: `["", "**"]`.
- Nonempty text, empty pattern: `["a", ""]`.

For s="adceb", p="*a*b", the first * is empty, a matches a, the second * takes dce, and b matches b: true. s="cb", p="?a" is false; ? handles only the first character.

## Demonstration boundaries

Worked calculation, trace presets, and prediction are separate experiments.
The trace runs JavaScript, not Python. Full retained trace snapshots are teaching
storage and are excluded from the submitted algorithm's complexity claim.
This wildcard view retains the full table even where Python uses rolling rows. Rewind restores a complete snapshot, not an inverse mutation.

## Verification

Run the lesson-scoped checks from repository root:
`python3 -B leetcode/44/tests/regression.py`,
`node leetcode/44/tests/core.cjs`,
`node leetcode/44/tests/browser.cjs` (using the configured NODE_PATH and Chromium path),
and `python3 -B scripts/register_leetcode_lesson.py 44 --validate-only`.
See `../../specs/reviews/leetcode-first-ten-review.md` for observed review evidence.
No actual LeetCode submission or human learning test is claimed.


## Review-1 revision contract (author self-check only)

Source findings: `../../specs/reviews/44-review-1-12447724.md`.
Adopt all three required findings; existing layout, palette, controls, canonical
Python interface and shared trace runtime remain the approved surface.
This is a content/metadata repair within that surface, with no new layout or feature.
Independent acceptance of this new candidate remains pending.

P0 / highest-return work: concrete repeated-call-to-table bridge (44-TEACH-01),
prerequisite-free wildcard prediction (44-TEACH-02), and validated metadata
(44-META-01). Done means the actual displayed baseline reproduces the described
calls, both locales teach the same dependency reasoning, prediction feedback resets
and translates correctly, and safe preflight passes. P1: clarify m/n and O(n+1)
space at empty pattern. P2: none. Deferred: custom input and decorative changes;
these require a separate product need and design review and are outside this fix.

New local terms: step 0 defines a prefix as a beginning of an original string;
step 1 defines DP as computing and saving smaller answers for reuse, with dp[i][j]
meaning the two named prefix lengths. A repeated call has both the same text and
pattern; saving only one length is insufficient. The baseline now removes final
characters so its calls are exactly the table's prefix pairs. It still returns
only a Boolean and is checked against a separate first-star-length oracle.

The fresh exercise uses ba / ?*: left ba / ? is false; above b / ?* is true;
* consumes the final a, so the final cell is true. Incorrect options isolate
“star only consumes nothing” and “star reads diagonal” misconceptions. The
contrasting ba / a* is false. No regex knowledge is needed to answer. The optional
regex deep link names its different repetition rule; ab / a* remains explicitly
true in the wildcard derivation.

EN/zh-CN state matrix: static reasoning, initial/disabled, intermediate event 16,
terminal, rewind/reset, every preset, every quiz choice/reveal/change, locale
switch after interaction, copy success/fallback, storage unavailable, and code
source disclosure are exercised in the lesson-local browser check. Loading,
sending, reconnect and expiry do not apply to this synchronous static page.
No CSS/token changes or motion additions; existing responsive layout is reused.
Evidence and fix mapping: `evidence/SELF-CHECK.md`; candidate identity:
`evidence/candidate-sha256.json`. These are author evidence, not reviewer closure.
