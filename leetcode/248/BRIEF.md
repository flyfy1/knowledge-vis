# Problem 248 — blocked implementation brief

- **Status:** Blocked pending authorized official access.
- **Category / stage:** algorithms / university.
- **Target reader:** A bilingual learner reconstructing the official submission contract and a correct counting algorithm.
- **Learning loop:** hand-count a tiny range → derive rotational digit-pair invariant → generate and filter candidates → map to the verified official callable interface.
- **Expected outputs:** `index.html`, `app.js`, `copy.js`, canonical source mirror, lesson metadata, and reproducible tests after the official contract is available.

## Evidence boundary

The official URL is reachable, but the page shows “Subscribe to unlock”. The public GraphQL query returns the title and example testcases while returning `content: null` and `codeSnippets: null`. See [`tests/evidence/official-access-2026-10-24.json`](tests/evidence/official-access-2026-10-24.json). Because the request forbids inventing a paid statement or submission interface, implementation is paused until authorized access or an owner-provided official capture is supplied.

## Planned concept dependency table

| Term | First use | Local definition |
|---|---|---|
| strobogrammatic number | Step 1 | A numeral unchanged after a 180° rotation. |
| rotational pair | Step 2 | The two digits that face each other after rotation, such as 6↔9. |
| inner construction | Step 3 | Building a longer valid numeral by wrapping a valid shorter one. |
| range filter | Step 4 | Inclusive comparison against string bounds of equal length. |

## Step fields (planned, not implemented)

1. **Concrete quantity:** known: two string bounds; question: which numerals in the inclusive range qualify; input/output: `low`, `high` → count; action: inspect a tiny hand-count; condition: official examples and constraints verified.
2. **Invariant:** known: valid digit rotations; question: why wrapping preserves validity; input/output: inner string and pair; action: toggle pairs and observe; condition: only officially permitted digits.
3. **Generation:** known: the pair invariant; question: how to enumerate each length once; input/output: target length; action: step recursion; condition: leading-zero and center rules confirmed.
4. **Verification:** known: generated candidates; question: which candidates lie in `[low, high]`; input/output: bounds; action: predict then reveal filters; condition: official callable signature and limits confirmed.
