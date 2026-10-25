# #843 fixed-call-cap diagnosis — confirmed, not repaired

2026-10-26. Followed `~/Documents/agent-skills/diagnosing-bugs/SKILL.md`.
The red-capable loop was executed against the real archived callable before
diagnostic variants. No lesson, campaign state, STOP, prior review or acceptance
was changed. This archive is diagnostic evidence for a **new candidate** request,
not a replacement acceptance or a final implementation.

## Frozen source and official contract

Candidate `617cb7c7e49f533b46c66dc9a53e7c6cefd71cbf`; canonical source SHA-256
`dc0d1552f34cc429efa9f3ff12daf0c9c42f6ca5604d97ae64dc42aa2b7bff30`.
[canonical.py](canonical.py) is an exact copy of that source, also archived in the
earlier acceptance record. Review commit `3cf37ae3fabd1e6c1cc8da54015b3569d085df75`
and registration commit `ad547b9105dd0b1164cb2774de27c65a4898e5c9` remain historical.

The ordinary [official page](https://leetcode.com/problems/guess-the-word/) and one
unauthenticated public GraphQL request confirm unique lowercase six-letter words,
1–100 entries, secret membership, positional feedback, actual successful guessing,
and a per-case `allowedGuesses` range of 10–30. The generated-case qualification
requires a reasonable strategy rather than brute force; it cannot be omitted.
Exact response bytes and request identity are in [official-response.json](official-response.json)
and [official-access.json](official-access.json), HTTP 200, response SHA-256
`d8e324bb043388237b057944abddf296b3e449359798fa3619189dad1e9a6f85`.

**Interface distinction:** metadata describes manual judge inputs `secret`,
`words`, `allowedGuesses`. The Python3 submission snippet instead exposes
`findSecretWord(self, words: List[str], master: 'Master') -> None`, with only
`Master.guess(word)` documented. Budget/secret metadata is not an extra Python
parameter or a permission to inspect hidden judge fields. No live selector,
authenticated submission or hidden-test membership was verified.

## Reproducible red/green loop

```sh
# Expected exit 1: real archived canonical, all 22 secrets, case budget 11.
python3 -B specs/reviews/843-budget-evidence-20261026/reproduce.py --case family22 --budget 11 --all-secrets
# Expected exit 0: diagnostic ONLY, the single loop bound changed from 10 to 11.
python3 -B specs/reviews/843-budget-evidence-20261026/reproduce.py --case family22 --variant diagnostic11 --budget 11 --all-secrets
```

The fixture is `[group + c*5 for group in 'ab' for c in 'cdefghijklm']`.
All 22 secrets are tested. Canonical succeeds for 20; `ammmmm` and `bmmmmm`
return after ten calls with the secret as their sole survivor but **without ever
guessing it**. The judge success condition is therefore false, even though an
eleventh call is permitted. Only changing `range(10)` to `range(11)` makes all
22 succeed, with a maximum of 11 calls. The solution still receives exactly its
original two arguments. This is an ordinary successful-guess assertion, not a
test that merely checks that Python returned without an exception.

The loop is deterministic and unattended: about 0.05 seconds for all 22 secrets
on the recorded Mac Python environment. No network or browser is used by the
reproducer. [executions.json](executions.json) retains actual commands, exit codes,
timings and result paths; result JSONs retain every guess, feedback, survivor set
and terminal condition. Diagnostic variants are constructed in memory; their
only source change is shown in `diagnostic-range11.diff` / `diagnostic-range30.diff`.
Neither variant is a proposed final solution.

## Ranked falsifiable hypotheses and observations

Root's hypotheses were carried forward in order, with predictions stated before
variant execution:

1. **Artificial cap causes early return.** If so, changing only that bound should
   permit the still-correct strategy to make the missing successful call. Confirmed
   on the 22-word family (11 calls) and 24-word family (12 calls).
2. **The fixture falls outside the generated-case qualification.** A bare family
   of repeated-letter words gives no informative failed replies and is weak
   evidence alone. The structured two-group family instead has informative
   feedback, and the same non-brute-force minimax strategy succeeds for **every**
   secret within budget 11. This supplies a finite constructive strategy witness;
   it does not identify an actual hidden test or formalize the judge's undefined
   “reasonable” classifier for every possible input.
3. **Filtering or the mock judge is wrong.** The spy computes feedback independently
   by six positional comparisons, checks eight hand/official score fixtures, and
   reconstructs survivors from the entire feedback history. At every API call it
   observes actual algorithm-local candidate indices and asserts equality to those
   independent survivors; it separately recomputes the minimax/tie choice. All
   checks pass, and the true secret is always retained. The failure is premature
   termination, not a lost secret or an incorrect reply in this tested family.

The spy's frame inspection is diagnostic observation only: the submitted code
does not receive the secret, budget or internal oracle data through it.

## Bounded minimization and larger control

| Family / allowed calls | Canonical fixed 10 | One-variable diagnostic |
| --- | --- | --- |
| 20 words, groups a/b, suffix c..l; 10 | All 20 found, max 10 | Bounds 11 and 30: all 20, max 10; finite control only |
| 20 words, groups a/b, suffix c..l; 11 | All 20 found, max 10 | Bound 11: all 20, max 10 |
| 22 words, groups a/b, suffix c..m; 11 | 20/22 found; two missed final calls | Bound 11: all 22, max 11 |
| 24 words, groups a/b, suffix c..n; 30 | 20/24 found, stops at 10 | Bound 30: all 24, max 12 |
| 11 repeated-letter words, last secret; 30 | Fails after 10 | Bound 30: succeeds at 11; weak qualification evidence alone |

Removing the final suffix pair takes the failing 22-word family to passing 20
words. This is an adjacent-size minimization **within the specified paired family**,
not a claim of a globally smallest counterexample. On the 24-word `bnnnnn` case,
the first feedback is 0 and cuts 24 candidates to 11; ten calls still leave two
candidates, while the diagnostic finds the secret on call 12. This is feedback-based
minimax behavior, not plain sequential exhaustive guessing of all 24 words.

### Why eleven is both sufficient and unavoidable for this 22-word family

Every possible first legal probe has four nonempty reply buckets of sizes
**10/10/1/1**: success, the opposite-prefix same-suffix word, and the two groups
with a different suffix. In a worst first-reply branch, ten words remain with
the same prefix and distinct repeated suffixes. For any later legal probe,
all but at most one of those ten have the same score. The resulting partition
is either `[10]` or `[1,9]`; no balanced multiword split is available. The same
property persists as that bucket shrinks.

Consequently a worst-case secret needs ten further calls to actually guess it,
not merely to identify it: nine negative singleton probes can leave a known
last word, which still needs its successful call. One first call plus ten gives
an eleven-call worst-case lower bound. Probing remaining candidates attains it;
the unchanged minimax strategy with the diagnostic bound reaches every secret
within eleven. [family22-partition-structure.json](family22-partition-structure.json)
checks all 22 first probes and all 968 combinations of a ten-word first bucket
with a legal follow-up probe. This family-specific argument substantiates the
reasonable feedback-strategy qualification and does not rest on the weak repeat11
example. It is not a general minimax optimality or hidden-test-membership claim.

## Confirmed conclusion and repair boundary

**Confirmed hypothesis:** the hardcoded ten-iteration stop prevents an otherwise
correctly filtering strategy from completing reasonable-budget structured cases
that its unchanged probe strategy demonstrably solves within their allowed budget.
Honest disclosure of a heuristic limitation does not make that premature return
a faithful successful completion of the original API task.

This does not establish a universal minimax guarantee. Simply replacing ten by
thirty is not proven safe for cases whose actual budget is ten, and inventing a
budget argument/getter would change the documented Python interface. The new
candidate must reconcile stopping, strategy, supported budget range and interface
honestly, then receive fresh independent review. Phase 5 final repair and Phase 6
“fixed” closure are intentionally deferred: this task only diagnoses and requests
repair. No claim of an implemented fix or publication readiness is made.

[frozen-ui-budget-bindings.json](frozen-ui-budget-bindings.json) binds relevant
canonical/code/trace/copy constraints to the candidate. In particular, core.js
also caps at ten; bilingual `limit` and `map3` text justify that cap via the minimum
budget; cost copy/metadata uses `G≤10`. Their alignment must be reassessed in the
new candidate. No new rendering defect is inferred merely from those strings.

One local orchestration draft had a Python syntax error before any diagnostic
variant executed; the corrected commands and actual exit records above are the
evidence. It did not affect the source, first red result or runtime campaign.

The [separate independent adjudication](../843-budget-finding-review-20261026.md)
also reproduced 20/22 versus 22/22 using a plain Master without frame inspection,
confirmed the family-specific lower bound and approved the required request.
Its evidence remains separately owned under `843-budget-adjudication-evidence-20261026/`.
That adjudication confirms the finding, not a repaired candidate.
