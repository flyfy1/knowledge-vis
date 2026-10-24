# BRIEF — LeetCode 273 Integer to English Words

- **Product fit / verdict:** Build one problem-local bilingual lesson in the approved LeetCode explainer pattern. The reader is an algorithms learner who needs to turn a non-negative integer into correctly spaced English words and implement the official Python callable. The smallest useful outcome is explaining why three-digit chunks plus scale words preserve place value.
- **Category / stage:** algorithms / university.
- **Target reader:** knows integer division, remainder, lists and functions; does not yet have a reliable chunking invariant.
- **Learning loop:** calculate `12,345` by hand, predict the chunk boundaries for `1,234,567`, reveal the invariant, then map it to the canonical `numberToWords(num)` solution and verify boundary cases.
- **Expected outputs:** exact English string, including `Zero` for 0 and no extra spaces.

## Step fields

| Step | Known | Unique question | Input / desired quantity | Action and visible observation | Conditions |
|---|---|---|---|---|---|
| 0 | Place value and small number names | What does each three-digit group contribute? | 12,345 | Select a chunk; its local words and scale are highlighted | Base-1000 grouping and official English names |
| 1 | Three-digit groups | Why can groups be rendered independently? | 1,234,567 | Advance through groups; ledger accumulates non-empty groups | Groups are rendered from most significant to least |
| 2 | Group renderer | What invariant prevents bad zeros/spaces? | 0, 5, 105, 1,000,000 | Predict then reveal an output; inspect helper cases | `under1000(0)` is empty inside a larger number; top-level 0 is `Zero` |
| 3 | Invariant and baseline | How does the official scan follow the proof? | up to 2³¹−1 | Compare repeated decimal division with one pass over at most four groups | Fixed four scale names cover the constraint |
| 4 | Canonical Python | Can a fresh number be checked independently? | user-selected value | Run Python-equivalent oracle and compare; copy/download source | Oracle is a separate direct chunk renderer, not the lesson implementation |

## New terms first-use table

| Term | First location | Plain definition |
|---|---|---|
| chunk / 三位组 | step0 | A block of at most three decimal digits. |
| scale / 位阶词 | step0 | Word attached to a non-empty group: Thousand, Million, Billion. |
| invariant / 不变式 | step2 | A statement true after every helper call or loop iteration. |
| sentinel / 哨兵 | step2 | The empty string used for an absent group so spaces are not fabricated. |
| base-1000 | step3 | Dividing by 1000 peels one three-digit group at a time. |

## Simulation boundary
The visual trace simulates the arithmetic and is explicitly separate from executing the official submission. The browser comparison oracle independently renders chunks using a direct digit decomposition. No external assets or runtime services are needed.
