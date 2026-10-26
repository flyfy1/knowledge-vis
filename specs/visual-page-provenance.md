# Visible Visual edition provenance

Read this spec **before generating or repairing a Visual page**. User requirement: each Codex-developed edition visibly identifies itself as **Codex 开发**, so a later Claude Code edition can be compared. Source trailers alone and URL suffixes alone do not satisfy this page-level rule.

## Failure and prevention

The earlier implementation104f82ca covers LeetCode `-codex/` URLs and explicitly excludes badges. It is not a site-wide page attribution feature. Do not infer that a commit trailer is visible to readers, that publication guarantees attribution, or that missing attribution is a cache problem. Verify the rendered page and actual published resources.

## Contract

- Each verified Codex edition has one visible, non-sticky header disclosure labelled `Codex 开发 · 改进版本` / `Developed with Codex · Revised edition`. Identify the **edition**, not every historical contributor as Codex. A repair does not establish original authorship.
- Inside, show a stable edition ID, the exact **source revision** and its GitHub commit link, a concise scope of Codex changes, and retained original-contribution wording. A source link is not an executable historical version. Update metadata when worker commits are integrated; do not present the old SHA as encompassing new work.
- `page-provenance.json` is the explicit provenance inventory. Every registered page must match its static header attributes and source evidence. Unknown, mixed and awaiting-worker pages have explicit exceptions; never stamp a whole directory tree or infer identity from the current agent.
- Use native static `details/summary`, `page-provenance.css` and localized spans. No storage, polling, tracking, animation, script injection or new controller. CSS follows the existing `html[lang]`; the lesson owns language and state. The label remains visible if JavaScript is unavailable.
- Fit inside existing head-main; on atlas use the header. Do not alter lesson controls, routes, clocks or active-step ownership. Summary/source links have48px targets,3px visible focus, wrapping at320px and200% text, reduced-motion and forced-color support.
- Preserve existing LeetCode sources/campaign. Their shipped URL markers remain; adding page-level markers there needs coordination with its owner and truthful per-lesson provenance, not this batch's blanket write.

## Parallel editions without destructive routing

Keep current canonical routes unchanged. Before creating a Claude Code alternative, reserve an actual independent static directory such as `variants/claude-code/<slug>/`, preserve both source trees, identify its real developer/source revision and use this same disclosure contract with truthful text. Do not relabel the Codex edition as Claude or overwrite it. Register a comparison link only after both destinations exist, load independently and preserve relative resources/section links. No fake switch, empty page, SPA rewrite or automatic redirect is required now. The example path is a future convention, **not a currently available version**.

## Integration acceptance

1. Confirm source provenance and preserve uncommitted/concurrent changes. Read the page spec, this file and WORKFLOW before editing.
2. Update the corresponding page spec on **every repair** (create one if absent): cause, required behavior, model/teaching boundary, concrete recurrence checks. Update this index; a posthoc log alone is insufficient.
3. Confirm exactly one visible Codex label, truthful revised/original distinction and source revision; inspect an unregistered non-Codex page to ensure no automatic label.
4. Switch languages without changing selection/time/inputs, use keyboard to open/close and reach source link, and test320px,200% text, reduced motion, forced colors and JS-disabled visibility. View actual screenshots, not only DOM assertions.
5. Test affected navigation/Back/reload. For the three worker pages, remove duplicate local labels only after handover and preserve their accepted page behavior/specs.
6. Commit scoped files and record tested behavior/limits. Deploy only after worker integration, then verify the visible production identifier and actual version resources. A preparation commit is not a release.

## Current scope and exceptions

Initial evidence is1d90150cf9c1db194769dff92dc4178ce7779fb0 (`Built-By: Codex`, scope in commit). Its14 non-worker revised courses are enumerated in `page-provenance.json`. Atlas's initial ed48a98d has no tool attribution, so this edition is also labelled revised.

- photosynthesis: integrated worker source3e1c2f43, revised-edition header and explicit mixed Codex/Alberto/Claude history. [Page spec](../photosynthesis/SCROLL-SPEC.md). The initial14-page preparation remains historical; inventory now includes this accepted handover.
- frozen-bubble: sourcee4b8772c teaching handover integrated with a single shared revised-edition disclosure. Its [teaching contract](../frozen-bubble/BRIEF.md#teaching-continuity-revision--2026-10-26-codex) and original quantitative-model limits remain authoritative.
- power-converters: source24a3d727 flow handover integrated; revised-edition disclosure preserves earlier contributors and the unchanged quantitative model. Original generator is not asserted.
- Other Visual pages/homepage: origin not verified by this batch. Do not stamp them. Future Codex modifications must adopt the contract with their exact evidence.
- LeetCode: separate concurrent owner and existing shipped `-codex/` URL policy; no files changed here.

Design and acceptance: [attribution review](reviews/visual-attribution-20261026/design.md), [verification](reviews/visual-attribution-20261026/verification.md).

All three worker handovers are now integrated locally. Inventory17 has14 earlier Codex revisions plus the three exact worker source revisions. Initial preparation reports remain historical; final batch/release evidence is recorded separately.

Eigen direction revision adds the18th evidenced edition, source5cd64dc2193d8e3b26cc433ecd4d597887f0ed13. Atlas shared header is reserved for the concurrent galaxy worker: its combined source metadata must be refreshed together after handover, before publishing either new atlas change. Do not overwrite that worker index to update it early.

## Mixed static page forms and current integration

Records may explicitly provide a safe repository-relative HTML `path` (Galaxy is atlas/galaxy.html;42 source is leetcode/42/index.html). `publicPath` records generated destinations without rewriting canonical source. Preview/validation follows the explicit file rather than assuming every concept has an index directory. No runtime data fetch or route framework is introduced. Current inventory20 adds Eigen, Galaxy and42. Galaxy keeps its original implementation revision and adds a distinct integration-fix revision; Atlas/42 point to the integrated code while retaining worker provenance in the worktree map. Immutable original sources are pushed to scoped source refs so GitHub commit links are reachable even when main uses equivalent cherry-picks.
