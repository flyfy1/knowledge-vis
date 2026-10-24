# Paint House II — author brief (blocked)

- **Category / stage:** algorithms / university
- **Target reader:** A bilingual learner who should derive and implement the official submission after verifying the statement and callable interface.
- **Learning loop:** hand-calculate a tiny cost matrix, compare a quadratic baseline with the minimum/second-minimum dynamic-programming transition, then predict and verify a transfer case.
- **Expected outputs:** `index.html`, `app.js`, `copy.js`, canonical source and mirror, reproducible checks, and metadata after official-contract verification.
- **Current gate:** blocked before implementation. The official statement content and code snippets are premium-only for this unauthenticated session; no source or constraints will be invented.

## Required step outline once authorized evidence is available

1. **Understand the quantity** — Known: rows are houses and columns are colors only if confirmed by the statement. Question: what assignment is legal and what minimum is requested? Input/output: exact dimensions, costs, and return type from official text. Interaction: hand-calculate the smallest official example. Condition: only the verified adjacency rule and bounds.
2. **Baseline** — Known: exact recurrence from step 1. Question: why checking every different previous color is too slow at the official bound? Input/output: verified matrix. Interaction: toggle a baseline trace and observe repeated scans. Condition: complexity claim follows verified limits.
3. **Invariant** — Known: previous-row best costs. Question: what summary preserves enough information to exclude the same color? Input/output: row DP values. Interaction: reveal each transition and the current smallest and second-smallest entries. Condition: tie handling matches the official recurrence.
4. **Transfer exercise** — Known: invariant. Question: predict a fresh row update before reveal. Input/output: explicit small matrix. Interaction: prediction, reveal, change/reset. Condition: explanation covers equal minima and single-color boundaries if allowed.
5. **Canonical implementation** — Known: derived rule. Question: how does the official callable interface map to code? Input/output: exact signature, language selector, return semantics. Interaction: copy/download parity and oracle checks. Condition: canonical language follows the repository policy.

## Concept dependencies

| Term | First use | Plain-language definition |
| --- | --- | --- |
| cost matrix | step 1 | a table whose entry is the cost of choosing one color for one house |
| dynamic programming | step 2 | storing the best result for each smaller prefix so it can be reused |
| minimum / second minimum | step 3 | the two smallest values in a previous row, retaining their colors for exclusion |
| invariant | step 3 | a statement that remains true after every processed row |

## Evidence status

The official URL and public GraphQL response are captured in `tests/evidence/official-access.json`. The page reports “Subscribe to unlock” and GraphQL returns `content: null` and `codeSnippets: null`; therefore the statement, constraints, examples beyond an opaque testcase field, supported language selector, and callable interface cannot be verified under normally available access.
