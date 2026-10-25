# Workflow-copy cleanup inventory

Date: 2026-10-26. **Backlog evidence only; no runtime edits, new acceptance decisions or publication.** The frozen central registry contains 126 lessons. Source inspection confirms transient author-candidate/review-pending language in **106 registered lessons plus #940/#956**, across 113 bound localization keys: 108 footers and five additional body keys. This does not mean all 108 lessons are currently published or invalidate their historical acceptances.

## Frozen scope and evidence

Central source: `6568fbe9ebb0ab01bcf2736a8f9331c34b9c8c33`. Registry `leetcode/problems.config.js` SHA-256: `2ff8328b5b9a29a2e85ac64b1c246a3beb7dd7de9664f9e3693e93e39ea124eb`. The registry defines the numeric Codex source-tree scope; no unregistered variants, future lessons or Claude paths were scanned. A contemporaneous read-only progress snapshot showed 125 registered entries `accepted_local` and one absent; registry membership alone was not treated as new acceptance proof.

Completed lane snapshots, outside that registry:

- #940: `1f4226439bfd723e37bbba2f573d961cc200bfb5`; `940-review-1-e4da4b0e.md` accepts candidate `4d65eab80efc4cff1f122918d021f0c9e308e686`.
- #956: `9e1fe1d5c3bcc7d310eb3fa13a115a18787da87e`; `956-review-1-9f531ca4.md` accepts candidate `61c1660d36c3e2b77aa2249c0daeeb60133cb0ae`.

[Exact bilingual inventory](leetcode-workflow-copy-inventory-evidence-20261026.json) records every confirmed key's complete wording, immutable revision/permalink, source line/hash, HTML `data-i18n` binding, copy-script inclusion and locale initialization. The 113 transient keys were separated from 67 contextual evidence statements; the latter are **not automatically stale-status cleanup findings**. Only top-level runtime HTML/JS was inspected. BRIEFs, tests, comments and algorithm/domain states are not findings. #327's `Object.fromEntries` dictionary was inspected separately instead of omitted by the ordinary object-property extractor.

This is **unrendered source and binding evidence**, not a new browser acceptance or public crawl. The only public-rendering proof reused is #780's HTTP-200 bilingual footer observation at `2026-10-25T16:50:48Z`, recorded in [the workflow-copy proposal](leetcode-workflow-copy-spec-review-20261026.md). No broad suites were rerun.
Source permalinks identify immutable revisions; their network availability was not checked. The two lane snapshots are still awaiting guarded central import and push, so their source coordinates are retained in the local evidence even if those links do not yet resolve.

## Priority queue

Publication priority was supplied by the dispatcher, not independently reconciled against a changing release ledger. All rows below use `copy.js` key `foot`, bound by `index.html` via `data-i18n="foot"`; full English and Chinese strings and binding line numbers are in the evidence file. Central rows use the frozen central revision above; lane rows use their respective snapshots.

| ID | Exact Chinese footer | Source line | Assessment |
| --- | --- | --- | --- |
| #793 | 作者自查候选；独立教学评审待进行。没有声称 LeetCode 已接受或真实学习者已掌握。 | [`copy.js:342`](https://github.com/flyfy1/knowledge-vis/blob/6568fbe9ebb0ab01bcf2736a8f9331c34b9c8c33/leetcode/793/copy.js#L342) | Transient workflow wording; prepare separate focused revision. |
| #798 | 作者自查候选；独立教学评审待完成。模拟不等于执行；未声称 LeetCode 提交通过。 | [`copy.js:334`](https://github.com/flyfy1/knowledge-vis/blob/6568fbe9ebb0ab01bcf2736a8f9331c34b9c8c33/leetcode/798/copy.js#L334) | Transient workflow wording; prepare separate focused revision. |
| #801 | 作者自查候选；尚待独立评审。没有宣称 LeetCode 提交通过或真实学习者效果。 | [`copy.js:52`](https://github.com/flyfy1/knowledge-vis/blob/6568fbe9ebb0ab01bcf2736a8f9331c34b9c8c33/leetcode/801/copy.js#L52) | Transient workflow wording; prepare separate focused revision. |
| #810 | 本页是交互规则模拟与 Python 题解。作者自查不等于独立评审、真实学习者验证或 LeetCode 提交通过。 | [`copy.js:53`](https://github.com/flyfy1/knowledge-vis/blob/6568fbe9ebb0ab01bcf2736a8f9331c34b9c8c33/leetcode/810/copy.js#L53) | General evidence distinction; **no pending-review claim**. Keep outside stale-status repairs. |
| #903 | 作者候选 · 双语交互与小规模完整模拟 · 独立评审待完成 | [`copy.js:46`](https://github.com/flyfy1/knowledge-vis/blob/6568fbe9ebb0ab01bcf2736a8f9331c34b9c8c33/leetcode/903/copy.js#L46) | Transient workflow wording; prepare separate focused revision. |
| #920 | 作者自检候选 · 独立评审待进行 · 未提交 LeetCode，不代表实际学习者成效。 | [`copy.js:286`](https://github.com/flyfy1/knowledge-vis/blob/6568fbe9ebb0ab01bcf2736a8f9331c34b9c8c33/leetcode/920/copy.js#L286) | Transient workflow wording; prepare separate focused revision. |
| #780 | 作者自查候选 · 尚待独立评审。未声称 LeetCode 提交通过或实际学习效果。 | [`copy.js:351`](https://github.com/flyfy1/knowledge-vis/blob/6568fbe9ebb0ab01bcf2736a8f9331c34b9c8c33/leetcode/780/copy.js#L351) | Known public wording; separate reviewed repair. |
| #940 | 作者自查候选；独立评审待进行。模拟、测试通过与 LeetCode 接受提交是不同证据。 | [`copy.js:41`](https://github.com/flyfy1/knowledge-vis/blob/1f4226439bfd723e37bbba2f573d961cc200bfb5/leetcode/940/copy.js#L41) | Transient workflow wording; prepare separate focused revision. |
| #956 | 作者自查候选 · 独立评审待进行 · 本地模拟，无上传、无在线提交。 | [`copy.js:46`](https://github.com/flyfy1/knowledge-vis/blob/9e1fe1d5c3bcc7d310eb3fa13a115a18787da87e/leetcode/956/copy.js#L46) | Transient workflow wording; prepare separate focused revision. |

#903 also has a bound `verification` paragraph describing test files/self-checks; it is contextual reporting, not another explicit pending-status claim. In any narrow footer revision, preserve or separately assess meaningful algorithm verification and simulation limitations rather than deleting everything mentioning evidence.

## Other confirmed matches

Registered lessons with transient copy (including priority rows):

#60, #65, #68, #76, #84, #85, #87, #115, #123, #124, #126, #127, #132, #135, #140, #149, #154, #174, #185, #188, #212, #214, #218, #220, #224, #239, #282, #295, #301, #312, #321, #327, #329, #330, #332, #335, #336, #352, #354, #363, #381, #391, #403, #407, #410, #420, #432, #440, #446, #458, #460, #466, #472, #479, #480, #483, #488, #493, #502, #514, #517, #546, #552, #564, #587, #591, #600, #601, #629, #630, #632, #639, #664, #668, #675, #679, #685, #689, #691, #699, #710, #715, #719, #726, #730, #732, #736, #741, #745, #749, #753, #761, #765, #768, #770, #773, #778, #780, #782, #793, #798, #801, #803, #805, #903, #920.

Each has a bound `foot` key. Five additional bound body keys need attention when those lessons are revised: #76 `verify`, #185 `verify`, #220 `verify`, #312 `verify`, and #749 `verification`. Their complete wording and source locations are in the evidence file. #135's body phrase “enumerate candidate allocations” is an algorithm statement and was excluded from transient classification; its separate author-candidate footer is included. General statements that self-checks differ from independent review, including #810, are not claims that review remains pending. This is semantic triage, not a keyword gate or blanket deletion list.

## Reuse the existing revision path

Use review-gates “Review scope follows the change” and follow-up revision rules: record the accepted base and exact bilingual diff, freeze a new candidate, and obtain a separate focused review of affected copy, locale binding and relevant layout. Preserve stable learner-relevant limitations and any instructional content adjacent to the removed workflow phrase. If the edit changes teaching or verification meaning, broaden that candidate's review accordingly. Do not replace “pending” with an unearned “accepted” claim, mutate already accepted runtime bytes, strip text during publication, or rewrite old review/ledger history.

For pending-publication lessons, dispatch the small revision before their next authorized release rather than silently editing the release payload. For already public lessons, use a new reviewed candidate and normal publication/served-byte checks. This inventory itself neither blocks nor authorizes release and does not change historical scores. Current lanes and state remain untouched; use the operator's authorized safe boundary for imports and policy adoption.

Existing #239 precedent files located, without executing their helpers:

- `specs/reviews/239-review-navigation-repair-request-20261025.md`
- `specs/reviews/239-review-4-bd768111.md`
- `specs/reviews/239-review-mac-navigation-20261025.md`
- `specs/reviews/239-evidence/navigation-maintenance-20261025/reopen.py`
- `specs/reviews/239-evidence/navigation-maintenance-20261025/reopen-receipt.json`

These are historical navigation-revision examples, not reusable live-state instructions; no new maintenance machinery is proposed. Source scanning is bounded and does not prove absence of every possible differently phrased workflow statement. Any cleanup candidate still needs its own human-readable diff and focused independent conclusion.
