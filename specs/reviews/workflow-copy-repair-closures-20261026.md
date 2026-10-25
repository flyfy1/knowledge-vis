# Focused workflow-copy revision closures

This dispatcher record tracks new independently accepted revisions from the
[nine-request dispatch](workflow-copy-repair-transition-execution-20261026.md).
It does not rewrite historical acceptance or establish public delivery.

| Request | New frozen candidate | Fresh review | Outcome |
| --- | --- | --- | --- |
| 780-COPY-R1 | `8063cd1919c3816eb74f2096c0afe51e05bf75b6` | [780-review-2-8e1e7b4e](https://github.com/flyfy1/knowledge-vis/blob/d2d9596ae88bdf346a9d5275406baabc19e3f151/specs/reviews/780-review-2-8e1e7b4e.md) | Explicit closure; 100/100; no required open findings |
| 793-COPY-R1 | `37a0404f4a9e796d8df3c2cfa9a188957fe835fe` | [793-review-2-6ee3ec7c](https://github.com/flyfy1/knowledge-vis/blob/6b1364e3d5960d3ae74e97b9b50e599f5628c5ba/specs/reviews/793-review-2-6ee3ec7c.md) | Explicit closure; 95/100; no required open findings |
| 798-COPY-R1 | `f1f2ef5f4dea85495b1f343e529e87e69b00685a` | [798-review-2-9bfc817e](https://github.com/flyfy1/knowledge-vis/blob/ef907807c5e04902df41b2d48c5a5fb858efd79e/specs/reviews/798-review-2-9bfc817e.md) | Explicit closure; 95/100; no required open findings |

Root read the actual #780 report and state after its fresh review
`780-review-69d63636d18d`. The report identifies the original reproduction,
exact candidate, removed bilingual footer/key, preserved meaningful limitations,
unchanged algorithm/source/style files and actual locale/state/layout checks.
The canonical source and native clipboard fallback also remain exact. This is
independent candidate review, not proof of learner outcomes or official submission.

Review/accepted checkpoint `d2d9596ae88bdf346a9d5275406baabc19e3f151` was pushed
and the exact central remote branch head verified. The live main worker had
advanced to `793-fix-6babf5aace6a`; no active checkout or queue mutation was needed
for that immutable push.

Root subsequently read #793's actual new report and accepted state. Fresh run
`793-review-4e2b25052f03` explicitly closed the request against its new candidate:
only footer/key removal and the copy query changed; all algorithm, source, style,
metadata and remaining bilingual text stayed identical. Actual zh→en→zh trace
and quiz preservation, page-end layout, keyboard links and exact source transfers
passed. Reviewer adaptation redirected a hardcoded test output path in memory
without changing the assertions or overwriting earlier author evidence.
Checkpoint `6b1364e3d5960d3ae74e97b9b50e599f5628c5ba` was pushed and its exact
remote head verified while the worker continued `798-fix-31669d4caff7`.
Root subsequently read #798's actual report and accepted checkpoint. Its explicit
closure preserves the meaningful simulation limitation and all remaining copy,
algorithm/source/style bytes; only footer/key removal and the copy query changed.
The fresh reviewer checked actual bilingual trace/quiz preservation, page-end
layout, keyboard links and exact source transfers. Optional 798-A1 remains open;
this record does not imply closure of that separate presentation suggestion.
Checkpoint `ef907807c5e04902df41b2d48c5a5fb858efd79e` was pushed while the live
worker continued #801.

Root then read the actual #801 closure and accepted state. Fresh review
`801-review-2a988e03292d` accepted candidate
`84fc897f098887350f64045e36cc45cf7cdb5e88` at96.25/100, explicitly closing
801-COPY-R1 in [801-review-2-91de8989](https://github.com/flyfy1/knowledge-vis/blob/44b14a9a1bacfe998b5c2d25d7cfb03daaeb00ea/specs/reviews/801-review-2-91de8989.md).
The reviewer checked restricted runtime changes, protected source bytes, preserved
original-input/simulation text, locale trace/quiz state, keyboard links and native
200% zoom. Optional baseline-syntax advisory801-A1 remains open. Its accepted
checkpoint `44b14a9a1bacfe998b5c2d25d7cfb03daaeb00ea` was pushed while815 fix
continued. The remaining five requests are not closed by this record.

The old public #780 remains until the normal every-20 publication batch verifies
the new revision. Release eligibility uses changed runtime digests, so this
revision can occupy one batch slot without increasing the unique released-ID
count. No early flush or direct public-file edit was performed.
