# Problem-local BRIEF — #297 Serialize and Deserialize Binary Tree

Product fit: a university-stage bilingual LeetCode lesson. The reader needs to reconstruct a tree from a string and recover the exact shape, then map the invariant to the official Python `Codec` interface. Reuse the approved dark lesson shell and shared tokens; no universal visual framework.

Category: algorithms / stage: university. Source: [official problem](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/). Canonical language: Python (faithful `Codec.serialize(root)` / `Codec.deserialize(data)` interface observed in the official Python selector).

Learning loop: calculate a tiny tree by hand → watch preorder tokens and cursor move → predict the first decode branch → prove the null-marker invariant → map each visual action to the canonical code.

## Step fields

| Step | Known | One question | Input / desired quantity | Action and visible observation | Conditions |
|---|---|---|---|---|---|
| 0 | A binary tree has values and left/right positions. | Why can values alone lose shape? | `[1,2,3,null,null,4,5]`; want a reversible string. | Toggle a tree preset; step through preorder tokens. See `#` markers for missing children. | Any finite binary tree; `#` must be reserved and values must be unambiguous tokens. |
| 1 | Preorder visits node, left subtree, right subtree. | What does each token mean at decode time? | Token list and cursor; want the next subtree. | Next/previous/reset moves one recursive frame; the call ledger shows cursor before/after and returned subtree. | Recursive order is fixed and every missing child emits one marker. |
| 2 | A marker can represent an empty subtree. | What invariant makes the string uniquely decodable? | Current token; want exact subtree and cursor position. | Try presets and custom values; the tree and token history accumulate, making consumed-prefix ownership visible. | Input string was produced by the same preorder grammar; invalid tokens are outside the contract. |
| 3 | The invariant predicts the next branch. | Will the next token create a node or return empty? | A fresh token sequence; choose before reveal. | Predict, reveal, then change answer; feedback names the token and reason. | Prediction is about the displayed sequence only; it is a simulation, not execution of the submission. |
| 4 | The recursive rule is established. | How does the official Python `Codec` implement it and what does it cost? | `TreeNode` input / string output and reverse; want code mapping and boundaries. | Copy/download source; inspect mapping, proof, edge cases, complexity. | `n<=10^4`, values `[-1000,1000]`; recursion depth follows tree height and Python recursion limits may matter for a pathological chain. |

## New terms first-use table

| Term | First use | Plain definition |
|---|---|---|
| serialization | Step 0 | Turning a tree into a string of tokens. |
| preorder | Step 0 | Visit node, then left subtree, then right subtree. |
| null marker (`#`) | Step 0 | A token saying this child subtree is empty. |
| cursor | Step 1 | The index of the next unread token. |
| invariant | Step 2 | A statement that stays true after every recursive call. |
| grammar | Step 2 | The rule describing which token sequence represents a subtree. |

Simulation note: the moving tree/token ledger is a deterministic simulation for teaching. It does not execute the embedded Python source. Independent Python tests execute the canonical source.

Design tokens: shared dark canvas/surface, cyan accent, orange action, 48px controls, system fonts, no external assets. P0 = readable bilingual flow, visible accumulated token history, prediction/reveal, source parity; P1 = responsive tree layout and focus states; P2/deferred = animation beyond stepwise transitions.
