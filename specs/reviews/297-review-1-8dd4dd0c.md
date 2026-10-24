# Independent review: LeetCode 297

- Candidate revision: `c8f09729bb097d6c34e4fa1febbdc1e8bd7a8f07`
- Candidate URL: http://127.0.0.1:18770/leetcode/297/
- Reader: basic Python, lists, loops, functions, elementary recursion
- Rubric: `specs/leetcode-review-gates.md` (weights 15/20/20/20/15/10)
- Reviewer identity/model: unavailable (not fabricated)

## Cold walkthrough (completed before opening source, tests, briefs, or prior reviews)

I opened the candidate in a real Playwright Chromium browser at 1280x900 and read the page as a fresh reader. Screenshot: `297-evidence/297-review-1-8dd4dd0c/cold-desktop.png`.

### Step 01 — See the shape
- **Question:** What must serialization preserve, and what does preorder write?
- **Action:** Read the opening problem framing and clicked/inspected “Calculate a tiny case”; read the worked tree `[1,2,3,null,null,4,5]` and its string.
- **Observable result:** The page states that missing-child positions are the hard part; it visibly gives `1,2,#,#,3,4,#,#,5,#,#` and says each `#` occupies a child position. It also gives the tempting wrong string `1,2,3,4,5` and says two shapes collide.
- **Paraphrased causal conclusion:** Values alone cannot identify a tree shape; explicit empty-child markers make preorder reversible.

### Step 02 — Decode one token
- **Question:** What does the next token do, and where does the cursor move?
- **Action:** With the default token preset, pressed **Next token** four times, observing the ledger after each press.
- **Observable result:** The ledger changed in order: `Read 1 → Create TreeNode(1) · after cursor=1`; `Read 2 → Create TreeNode(2) · after cursor=2`; `Read # → Return None (empty subtree) · after cursor=3`; second `#` likewise to cursor 4. The status changed from `Consumed 0/11` to 1, 2, 3, then 4 of 11. The current recursive result changed from `∅` to `1` after the first token.
- **Paraphrased causal conclusion:** Every call consumes exactly one token; a number creates a node and a marker returns an empty subtree, while the cursor always advances to the next unread token.

### Step 03 — The invariant
- **Question:** What guarantee lets recursive calls compose without ambiguity?
- **Action:** Read the invariant panel and its bilingual duplicate while the ledger showed the partial trace.
- **Observable result:** It says `build()` returns one complete subtree encoding and leaves the cursor at the next sibling; a number is followed by complete left and right encodings, and `#` is itself a complete empty encoding. It explicitly derives uniqueness from root + two complete substrings and explains that removing `#` causes collisions.
- **Paraphrased causal conclusion:** Recursive boundaries are defined by consumption, so the parent can safely call left then right and know exactly where the sibling begins.

### Step 04 — Predict first
- **Question:** When the next token is `#`, what will recursion do?
- **Action:** Read the three radio answers before revealing; predicted “Return an empty subtree and consume this position” because the preceding rule says `#` is a complete empty encoding. The page exposes a **Reveal** control (the answer choice itself was visible before reveal).
- **Observable result:** The visible choices were: create a node whose value is `#`; return an empty subtree and consume this position; skip it without moving the cursor. The selected/revealed state was not reliably observable in the headless run, so this is recorded as a prediction and control check rather than a claimed reveal result.
- **Paraphrased causal conclusion:** The intended transition is a consuming empty return; skipping would violate the cursor invariant.

### Step 05 — Map to code
- **Question:** How do the visual transitions become executable Python and what are the costs/boundaries?
- **Action:** Read the code mapping and cost text; inspected the **Copy Python**, **Download solution.py**, and **Show full canonical source** controls. Independently entered custom tokens `-1,0,#,#,2,#,#` through the token input and **Apply tokens**, then pressed **Next token** once.
- **Observable result:** The page maps `visit(None)` to `#`, non-empty nodes to value then left/right recursion, and `next(tokens)` to cursor advancement; it states empty tree `#`, negative values preserved by `int(token)`, `2n+1` tokens, and `O(n)` time with `O(h)` recursion stack plus `O(n)` input/output storage. The custom check displayed seven tokens and after one step showed `Consumed 1/7` and current recursive result `-1`.
- **Paraphrased causal conclusion:** The trace is a simulation of the same preorder/cursor contract used by the canonical Python implementation; the fresh negative-root case follows the stated token and integer rules.

### Fresh prediction and counterexample (before source audit)
- **Fresh small input:** I chose `-1,0,#,#,2,#,#` (a root with a left child and right child) rather than the default preset. **Prediction:** first step creates `TreeNode(-1)` and advances cursor to 1; the next `0` creates its left child; each `#` returns `None`; the final `2,#,#` builds the right subtree, yielding the original shape.
- **Independent check:** Applying the custom tokens and pressing **Next token** produced `Consumed 1/7`, current result `-1`, matching the prediction. The full final round-trip was not exposed by the step control in this cold pass, so I do not claim a UI proof of all seven steps.
- **Counterexample prediction:** If the two `#` markers for node 2 are removed, `1,2,3,4,5` cannot distinguish `[1,2,3,null,null,4,5]` from another shape with the same values. The page states this collision; the causal reason is that no token identifies which child positions are empty.

### Cold walkthrough limits recorded before source
The step trace and explanations were readable on the desktop capture. The headless run did not yield a reliable post-**Reveal** text change, and I had not yet audited keyboard, language parity, narrow widths, zoom, source, tests, or metadata at the time this cold walkthrough was saved.

## Independent source, contract, and browser audit

- Official statement was read at the public LeetCode URL. It requires a reversible tree/string round trip, permits any encoding, allows 0–10^4 nodes, and allows values -1000..1000. The lesson's framing and examples match that contract.
- `lesson-entry.json` has the required single nonempty complexity string: `O(n) time; O(h) recursion stack plus O(n) input/output storage`.
- Required preflight run from repository root: `python3 -B scripts/register_leetcode_lesson.py 297 --validate-only` — **passed** (no output/error).
- `language-contract.json` names Python as canonical, cites the exact official URL, gives the `Codec.serialize`/`deserialize` and `TreeNode` interface, lists Python/TypeScript/JavaScript, and points to nonempty lesson-local official evidence. The registration validator independently passed exact `solution.py` ↔ `python-code.js` parity. Displayed `#source` and `sourceText` also matched exactly in the browser; the Python source downloaded as `solution.py` is the same canonical file.
- Executed the actual canonical Python on a fresh tree `(-1, left=0, right=2)`: `-1,0,#,#,2,#,#`, then deserialized to the identical nested shape. Empty boundary serialized as `#` and decoded to `None`. `python3 -B leetcode/297/tests/test_solution.py` passed its round-trip oracle cases.
- The lesson-local browser check was run with `OUTPUT_DIR=specs/reviews/297-evidence/297-review-1-8dd4dd0c node leetcode/297/tests/browser-check.js`; it reported no page/console errors and completed five presets, zh switch, prediction/reveal, and 390/320/1280 captures. Those generated captures are retained only in the exclusive evidence directory.
- Independent browser checks: Next token changed progress to `Consumed 1/11 tokens`; Previous returned to `Consumed 0/11`; Reset returned to `Consumed 0/11`. Selecting the correct quiz answer and revealing showed the stated causal explanation; changing the answer hid the old feedback and re-enabled Reveal. Enter on a focused Next token button advanced the trace. The zh toggle changed the title and step labels consistently.
- Screenshots in the evidence directory include independent desktop, 320px at 100% zoom, and 320px with `body.style.zoom=200%`. The 320px normal view remained readable and controls wrapped. At 200% zoom the document's layout width was 620 CSS px against a 320px viewport (horizontal scrolling is required), but no essential control was clipped in the capture. Focus styling was a solid outline; disabled Previous/Reset were visibly dimmed.

## Findings

### 297-C1 — canonical recursion fails a legal maximum-height input (required, open)

- **Revision/locale/viewport:** `c8f09729bb097d6c34e4fa1febbdc1e8bd7a8f07`, English, source/runtime check (not a UI preset).
- **Reproduction:** Execute the actual `leetcode/297/solution.py` with a legal 10,000-node one-sided chain (values 0..9999) and call `Codec.serialize(root)`.
- **Expected:** The stated official constraint permits this tree and the canonical solution should serialize it, or the lesson should explicitly qualify the Python recursion-limit boundary and provide a safe implementation/teaching caveat.
- **Actual:** Python raises `RecursionError: maximum recursion depth exceeded` before producing a string. The same recursive call pattern is used by `deserialize`.
- **Violated requirement:** Frozen rubric correctness and transfer-to-Python/cost dimensions require boundary correctness and an accurate cost/limitations explanation; the page presents `0–10^4` constraints and a canonical solution without disclosing this legal-runtime failure. The BRIEF mentions recursion limits internally, but that explanation is absent from the reader-facing lesson.
- **Severity/owner/next action:** Required high severity; owner should revise the canonical implementation or state the supported recursion-depth limitation in the lesson and validate the revised boundary. This candidate remains open.

No earlier report for problem 297 was present, so no prior finding could be closed.

## Scores (0–4 observations)

| Dimension | Score | Rationale |
|---|---:|---|
| Problem, terms, hand calculation (15) | 4 | Inputs/outputs, preorder, null markers, constraints, and a concrete hand-built 11-token result are visible before abstraction. |
| Causal derivation and saved work (20) | 3 | The collision counterexample and cursor invariant explain why markers are needed; the page does not develop a baseline cost/repeated-work comparison or an explicit bridge for the recursion-limit boundary. |
| Maintained state and correctness (20) | 2 | The cursor/subtree invariant and normal termination are clear, but a legal height-10,000 input fails in the canonical Python source (297-C1). |
| Interaction and visual meaning (20) | 3 | Predict/reveal, token highlighting, ledger history, presets, custom input, rewind/reset, and feedback worked; the tree text is a compact node list rather than a fully drawn structure, so causal child links require reconstruction. |
| Python and cost (15) | 2 | The interface and fresh negative case map faithfully and source parity is exact, but actual canonical execution fails the stated maximum-height boundary and the UI omits that limitation (297-C1). |
| Bilingual and device access (10) | 3 | English/Chinese explanation and controls are semantically paired; keyboard focus and 320/390/desktop checks worked. At 200% zoom the page requires horizontal scrolling (620px layout width at 320px viewport), and disabled controls are dim, so access has minor friction. |

Weighted total: **70/100** (`15 + 15 + 10 + 15 + 7.5 + 7.5`).

## Limitations and conclusion

This is an independent review of the frozen candidate revision, not a claim of measured novice comprehension or a successful LeetCode submission. Browser automation used headless Playwright Chromium; screenshots and JSON traces are in `specs/reviews/297-evidence/297-review-1-8dd4dd0c/`. The page's trace is intentionally a simulation, while the fresh Python check above executed the canonical source. Because required finding **297-C1** is open and the score is below the acceptance threshold, the candidate is **changes required**.
