# #995 teaching-copy refinement request

**Request ID: `995-COPY-R1`. Status: prospective, not adopted or implemented.**
Root selected two optional advisories from the independent accepted review for a
later narrow revision before eventual publication. This request preserves the
historical95/100 acceptance and the original open-advisory classification; it does
not retrospectively declare required findings, close advisories, reopen a lesson,
or change the current import-only operation. A separate guarded revision and fresh
independent review are required later.

## Scope and evidence

The learner knows basic Python and needs plain language for the forced-start proof
and a continuation link that describes what its destination actually presents.
The smallest useful change is to two existing localization entries, with the
current layout, tokens, interactions and route retained. No feature or layout is
added; the existing independent advisories supply the design feedback and root
selected the relabel/simplify approach. Website-design guidance was read for this
brief; the existing page contract remains authoritative.

Evidence: [accepted outcome](995-acceptance-20261026.md) and the unchanged
[independent report](995-acceptance-20261026/995-review-1-c18c137a.md), specifically
`995-A01`/`995-A02`. Report SHA256:
`b21c0af543f3f9379fdd99ba319e7177d027509070883ba878b2be09c066c97d`.
Candidate `d84cfb5265103d6d321fdc3f0d5dd4b3e17ac13c`, lesson tree
`9fb98cd2eb0d740e233c2e52a1fe2eb318b4de87`; review commit
`5a5cd3c329aec4854ea61f0ae5d15b1826f94a21`.
The exact candidate blobs were independently inspected read-only in the completed
#995 lane. These are source identity anchors, not deployment receipts:

| Candidate path | SHA256 |
| --- | --- |
| `leetcode/995/copy.js` | `b90154c25fc04a318545d1d497b85c0d7aca96845f53a0cf9ce309fe2f014aee` |
| `leetcode/995/index.html` | `144e8ea92fcb7ad7cccf05d106943d7c8182c9ba53a91d9bbe1954fe2ba97f00` |
| `leetcode/995/core.js` | `bdf1528e1d12cc3a3aaf24fd656ca7a6f0d5d20d402f01958984e9b2f3d54fe6` |
| `leetcode/995/solution.py` | `31cc55e456b9d13a0350ec26272a1601f19a9832c3dde85f5f123c54d7c848b9` |
| `leetcode/995/python-code.js` | `27e528d8b5be9e493b59947a5351b577caed2ebecef6d9c515a768c4ac218466` |
| `leetcode/330/index.html` | `12a249d2eb467580ee8566664d3f0752941c1d6a9537ffe462a03b6c1bb04016` |
| `leetcode/330/copy.js` | `049ee33238f60cfeed9e48ccefcd590dc88f4e0c50ede030e7927a90439cb1e1` |

At this candidate, #995's `data-i18n="link2"` anchor is exactly
`href="../330/#step2"`. The #330 section binds `s2t` and `traceTask`, then displays
preset controls, before/after coverage, operation text and a retained ledger.
Its heading is “What changes after each consume or patch?” / “每次消费或补数后，边界如何改变？”.
`traceTask` explains miss, consumed elements, patch count and complete operation
states. The [review browser receipt](995-acceptance-20261026/browser.json) records
that actual destination and Chinese heading; the independent report records both
locales and explains the mismatch. The proof exists elsewhere in #330, but this
request deliberately retains the verified state-experiment anchor.

## Adopted wording intent

**P0 / highest-return change — `995-A01`: truthful related label.** Replace only
`copy.js` key `link2`'s pair (line48 at the pinned candidate):

| Locale | Existing | Proposed |
| --- | --- | --- |
| ZH | `#330：用前缀不变条件证明贪心` | `#330：逐步观察覆盖范围如何扩展` |
| EN | `#330: prove greedy with a prefix invariant` | `#330: trace how the covered range grows` |

Retain `../330/#step2`. This label describes the actual before/after coverage
experiment without promising a proof at that anchor. Preserve the neighboring
local forced-start link and #2916 continuation.

**P0 — `995-A02`: plain English within the existing proof.** `copy.js` key
`proof` (line18) currently starts its English member:

> Could another order use fewer flips? Window flips commute, and using one start twice cancels, so a minimum solution uses each start at most once.

Replace that opening with:

> Could another order use fewer flips? Changing the order of these window flips does not change the result. Using one start twice cancels, so a minimum solution uses each start at most once.

Preserve the remaining English induction, forced decision, impossible-tail and
minimality sentences verbatim. Preserve the Chinese member, which already says
“窗口翻转的先后不影响结果，同一起点翻两次会抵消”. The replacement explains the term;
it does not introduce a different ordering assumption or delete the cancellation
reason. Retain worked overlap, parity and forced-start explanations elsewhere.

P1: none needed. P2: none. Deferred: new proof diagrams, changing #330, moving the
anchor, syntax lessons, layout/style or shared renderer work. They do not improve
this two-entry correction enough to justify a broader change. Existing colors,
typography, spacing, focus and disabled-state contracts are reused unchanged.

## Future implementation and validation boundary

1. First verify the actual adopted candidate and metadata after the import-only
   operation completes. Do not treat this document as authorization to mutate an
   active lane, reopen now, or edit state/policy. Preserve prior reviews, runs,
   acceptance and ledger history through the separately reviewed revision seam.
2. Limit runtime edits to `copy.js`'s `link2` pair and the opening of `proof[1]`.
   If normal cache invalidation requires an index reference version update, make
   only that established version-token change and record why. Canonical Python,
   mirror, core, renderer, CSS, metadata and other text remain byte-identical;
   ordinary candidate receipts and focused evidence may be regenerated honestly.
3. Validate actual rendered proof and labels in EN/ZH at320/390 and desktop, plus
   200% CSS zoom. Verify complete text, wrapping and focus; switch locales after a
   trace step and a revealed prediction, confirming state/feedback retention.
   Keyboard-follow link2 in both locales and inspect the actual #330 step2 heading,
   coverage states and ledger. A heading-existence test alone is insufficient.
4. Read the changed proof in context: reorderings leave final bits unchanged,
   duplicate starts cancel, and forced leftmost decisions still establish
   minimality/impossibility. Check the translation pair and duplicate-key/placeholder
   contract. Confirm immutable canonical/mirror/core hashes and retain exact source
   export parity; run the normal non-mutating metadata gate. Do not repeat a large
   algorithm sweep solely for a two-string edit unless changed bytes reveal need.
5. A fresh reviewer must explicitly evaluate `995-COPY-R1`, closing original
   `995-A01` and `995-A02` only against the new frozen candidate with observed
   evidence. Historical acceptance/report remain unchanged. Record any residual
   advisory honestly; no new score or acceptance is presumed here.

No new loading/error/reconnect state exists in this copy-only change. Existing
simulation, prediction, locale, disabled controls and source-transfer states remain
within the established contract. Future browser/source review proves local behavior;
production publication needs its separate normal release verification. This
preparation performed source/report inspection only, with no runtime edit, state
transition, import, policy change, commit or publication.
