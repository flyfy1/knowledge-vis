# Author self-check — 829-r5

Status: complete candidate ready for independent review; independent review pending.
Author: Codex, exact model identifier unavailable. This is an author run only.
Official public statement and Python selector/interface verified; raw GraphQL
response, full observed snippet catalog and timezone-qualified access timestamp
are retained in official-graphql.json. UTC access date is October 25; local
Asia/Singapore date is October 26, 2026.

## Actual checks

| Check | Observed result | Evidence |
|---|---|---|
| Canonical Python | All n=1..1000 match independently grown positive sequences; 290 large/seeded/boundary cases match odd-divisor factorization | python-results.json |
| Displayed baseline | Exact code extracted from index.html executed for n=1..100, matches start-and-grow oracle | python-results.json |
| Intermediate invariant | Before each k, answer equals all valid shorter lengths; remaining≥k; unique starts and terminal guard independently checked | python-results.json, core-results.json |
| JS simulation | Every frame n=1..1000 matches separate start-and-grow oracle; deep snapshot isolation and cumulative count boundaries pass | core-results.json |
| Localization | AST detects duplicate object keys before evaluation; all 84 bilingual pairs have matching placeholders; rendered formulas, accepted/rejected candidates, quiz feedback and copy fallback carry their intended meaning in both locales | core-results.json, browser-results.json |
| UI behavior | All seven presets, every forward frame, reverse/replay, reset and final guard; every quiz option, reveal/change/reset, independent trace/quiz state; locale preserves frame and selected/revealed answer | browser-results.json |
| Canonical source | Embedded string, rendered textContent, direct download, successful clipboard write/read and four native fallback transfers equal solution.py exactly, including trailing newline | browser-results.json |
| Native fallback | Each of two attempts per locale starts with distinct verified non-source clipboard sentinel; automatic write is then rejected; textarea is focused and fully selected; Linux Control+C readback equals canonical source | browser-results.json |
| Access | Keyboard Enter/Tab and visible 3px focus, forced-colors focus, reduced-motion context, unavailable localStorage, file:// offline source and trace all work | browser-results.json |
| Links/assets | Local asset requests only; no page or HTTP errors; related #483/#233 anchors visited in both languages; local link targets exist | browser-results.json |
| Layout | 320/390/736/1440 in both locales; CSS zoom 2 at 320/390/1440; no document or essential component overflow, 48px controls and readable state association | browser-results.json |
| Contrast | Actual computed text/background pairs: minimum sampled text 6.45:1; disabled controls 7.08:1; correct feedback 10.00:1; selected controls 11.41:1; focus 8.94:1; control borders 6.45:1 | browser-results.json, state-audit.json |
| Navigation lifecycle | Every step active state checked in both languages; return to top restores step0; marker re-evaluates after locale and resize | state-audit.json |
| Metadata | root `python3 -B scripts/register_leetcode_lesson.py 829 --validate-only`: exit 0, no stdout/stderr | preflight.json, preflight.txt |

## Visual inspection (author, not a learner study)

Opened screenshots through the image viewer, rather than relying only on geometry:
English 320px trace (after nav fix); Chinese 320px hand diagram; English 390px
hand and final n=45 ledger (six representations); Chinese 390px correct quiz;
Chinese 1440px trace; English desktop section and final full header; Chinese source
panel; both final 320px/200% event screenshots. Inspected actual values, wrapping,
label association, option/result distinction and focus. At narrow 200% zoom content
uses more vertical space and retains all values; no shrink-to-fit text is used.

The tall element-only ledger capture includes a sticky-nav overlay at its top;
this is a screenshot framing artifact, not missing data. The live trace/row values,
ordinary navigation target geometry and rewind/replay were checked separately.
The header screenshot exposed a stale active marker after scroll-to-top; candidate
r5 replaces observer-only selection with one scroll/resize/locale-triggered update,
confirmed by the stable final header screenshot (step0 active).

Earlier author drafts: r1 had compressed nav labels and a heading overflow at
320px/200%; r2 then hit the inherited 44px official link target. Their failed test
logs are preserved. r4 improves nested spacing at extreme zoom; r5 fixes the
header marker. These are author iterations, not independent reviewer findings.
Final browser and supplementary audits pass against r5; candidate.json binds the
runtime, metadata, test and shared dependency bytes. Total served CSS is 11,881
bytes (shared + local; exact measured total is in browser-results.json).

## Scope and next step

Only leetcode/829 was written. No agents spawned, registry edits, registrations,
commits, services, deployments, credentials or campaign acceptance changes.
Tests and screenshots do not prove novice understanding or LeetCode acceptance.
Native browser chrome zoom, real devices and public delivery are unverified.
Next: a separate source-blind cold review of the frozen candidate under the
repository's six-dimension rubric, followed by source/evidence audit. No independent
score or acceptance is claimed here.
