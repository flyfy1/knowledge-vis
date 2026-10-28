# Atlas galaxy — Codex iteration log (2026-10-28)

## Repository and checkout evidence

- Mac mini host: `Yangyus-Mac-mini.local`.
- Existing checkout reused: `/Users/songyy/Documents/projects/knowledge-vis`.
- `~/Documents/knowledge-vis` did not exist at the start. A temporary shallow clone of
  `flyfy1/knowledge-vis` was created while resolving the user's initial repository hint,
  then removed after the user clarified that the owner/repository name was uncertain.
  The temporary directory was created by this task and contained no pre-existing user files.
- Read-only verification identified the real source: the existing checkout's `origin` is
  `git@github.com:flyfy1/knowledge-vis.git`; `OUTLINE.md` names the same repository as the
  source for `visual.integ.life`, and `WORKFLOW.md` names it as the GitHub synchronization
  target. The existing checkout was clean on `main` at `92c1705` before this iteration.
- No other `~/Documents` repository had a `visual.integ.life` remote. No credentials or
  access settings were changed.

## Scope

Codex adds a small orientation cue to the existing 3D knowledge-galaxy fallback/list view.
Each concept card now shows the number of valid direct graph connections in English or
Chinese, and its accessible name includes the same localized count. The count is derived
once from the authoritative `graphModel` edge list, so it remains consistent with the
renderer, filters, and low-power/WebGL fallback. The 3D layout, graph data, route links,
and source URLs are unchanged.

This is a Codex revision for comparison with future Claude work. It does not claim that a
larger degree means a more important concept or a required learning order.

## Verification

- `node --check atlas/galaxy/app.mjs` — pass.
- `node atlas/galaxy/tests/core.cjs` — pass: 2,756 assertions; 39 nodes, 51 valid edges;
  deterministic layout and real-edge shortest-path, empty, isolated, and singleton cases.
- `node atlas/galaxy/tests/list-core.cjs` — pass: 5 assertions; every valid edge contributes
  to both endpoint counts, no ghost endpoint is exposed, and an isolated concept reads zero.
- `git diff --check` — pass.
- Browser suite was not runnable in this checkout because the approved shared Playwright
  runtime is absent (`Cannot find module 'playwright'`); no dependency was installed and
  no external runtime was added. The existing browser test commands and this limitation
  are recorded here for the next Mac mini run with the configured test runtime.
- Production was not changed, pushed, or deployed. `visual.integ.life` remains the
  production verification target for a later explicitly approved release step.

## Follow-up

Before merge or publication, run `atlas/galaxy/tests/browser.cjs` and
`atlas/galaxy/tests/integration.cjs` with the repository's configured Playwright runtime,
checking both locales, 320px/390px fallback/list states, keyboard names, search/topic
filters, and the real 3D route. Review the updated list screenshots and record the final
commit SHA, independent review result, and deployment URL here.

## Local handoff

- Implementation commit: `9e13e1a4beab5b2ff00273108f1d1fdce02862bb` (`Clarify galaxy list connection counts`).
- Branch: `main`, one implementation commit ahead of `origin/main` before this handoff-only record.
- Push, merge review, and deployment: intentionally pending; no production files or
  remote state were changed in this iteration.

## Codex iteration 2 — fallback explanation and browser harness

This follow-up stays within Knowledge Galaxy / overview. The list fallback now explains two
different states: a deliberate low-power start keeps the 3D scene responsive and can be
overridden, while a renderer or context failure leaves the complete concept, relationship and
source list available. The note is localized in English and Chinese and is visually separated
from the generic fallback copy. No graph data, layout, renderer allocation policy or route
navigation changed.

The repository had no package manager metadata, dotenv convention or local Playwright package.
The Mac mini already contained Playwright 1.62.1 in the shared Codex runtime, so the new
loader reuses that installation and falls back to a caller-provided `PLAYWRIGHT_NODE_PATH` or
normal module resolution. `.env.example` records only non-sensitive browser defaults. The
official Playwright Chromium component was installed in the existing user cache; no
credentials, runtime network requests or security settings were added.

The browser harness now waits for the first rendered frame and allocated geometry before
checking remount resource stability. The former readiness check could sample a newly-created
renderer before its first render and falsely report a geometry/texture leak. The targeted
contract test covers both localized fallback messages and the HTML/CSS hook.

## Verification — iteration 2

- `node --check atlas/galaxy/app.mjs` — pass.
- `node atlas/galaxy/tests/core.cjs` — pass: 2,756 assertions; 39 nodes, 51 valid edges.
- `node atlas/galaxy/tests/list-core.cjs` — pass: 5 assertions.
- `node atlas/galaxy/tests/fallback-contract.cjs` — pass: 5 assertions.
- `git diff --check` — pass.
- Official Playwright Chromium smoke — pass after installing the missing browser component.
- `ATLAS_BASE_URL=http://127.0.0.1:18783 PLAYWRIGHT_BROWSER=chromium node atlas/galaxy/tests/browser.cjs` — pass: 80 checks, no page errors, 55 geometries / 1 texture / 131 draw calls, desktop/mobile/lifecycle/fallback coverage; screenshots written to `/tmp/atlas-galaxy-evidence`.
- `... node atlas/galaxy/tests/integration.cjs` — pass: bilingual Atlas entry, real 3D route, Atlas return and mobile fit.

## Local handoff — iteration 2

- Implementation commit: `a55f5635b30491ad9b6cca74ea2f4fd1498650ea` (`Explain galaxy fallback states`).
- Metadata handoff commit: pending; this follow-up records the implementation SHA and final clean-tree state.
- Branch remains `main`; push, merge review, deployment and production verification remain
  intentionally pending. The only browser network target was the local static server.
- Manual limits remain: no physical phone, Safari or screen-reader speech test; independent
  review and publication remain parent-owned.
