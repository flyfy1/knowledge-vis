# Frozen bubble teaching continuity — Codex, 2026-10-26

## Delivery boundary

Base: `1d90150cf9c1db194769dff92dc4178ce7779fb0`, verified as the latest commit of the delivered Codex integration branch when this work began. Main checkout was on `6ebbb756` with extensive unrelated tracked/untracked work. It was not checked out, reset, stashed, or copied into this change.

Isolated branch: `codex/frozen-bubble-learning-20261026`.
Worktree: `/tmp/knowledge-vis-frozen-learning-20261026`.

Repository-level `AGENTS.md` and `.agents/skills` were absent in the shared checkout and delivery base; applicable `/Users/songyy/AGENTS.md` was read. The app managed-worktree API reported unsupported execution context; an explicitly authorized Git worktree was created successfully instead. Loopback serving and temporary Chrome required successful sandbox escalation. No approval was denied and no uncertain write remains.

Owned changes: `frozen-bubble/{index.html,i18n.js,app.js,style.css,BRIEF.md,README.md,tests/browser.cjs,tests/teaching.cjs}` and this page-specific review/evidence folder. `model.js`, global registry, shell, shared attribution, and unrelated lessons are untouched. Integration task owns shared attribution/deployment; this task supplies a local commit only.

## Before / after teaching flow

| Moment | Before | After |
| --- | --- | --- |
| Entry | Topic title followed by nucleation and directional-growth terminology | Observable white patterns on a transparent bubble; distinguish film water from contained air |
| First action | Undercooling parameter before seed/play | Place a small piece of ice, play, watch branches grow; interpret the orange origin and pale ice |
| First comparison | Formula with a hypothetical setting | Ask what a colder film does, define undercooling, then change it at fixed time; define nucleation after observing growth |
| Research | “Under the paper's conditions”; citation only in last section | Named authors, title, year, journal, DOI and experimental conditions before A/B; explicit reference to original setup/figures/methods |
| Flow explanation | Latent heat, tension gradient and Marangoni flow before observation | Early/grow/later paused moments with scene-specific observations, then explain heat → temperature difference → unequal surface pull → liquid carries ice |
| Warm case | General front caption | Define the freezing front and connect the orange line to warm-air heat input and limited conduction along the shell |
| Phone use | Two stacked scenes, controls below both | Same-clock A/B selector; sticky moment buttons with active scene, growth picture retained while adjusting undercooling |
| Attribution | No local developer credit | Bilingual visible “Developed by Codex” page credit, without shared-file edits |

The original two experiments, same-time growth recomputation, branch/path/front curves, optics section, links and state/reset behavior remain integrated. Technical limitations remain next to the corresponding experiments, including prescribed stop height and missing interlocking/full ice coverage.

## Primary-source validation

Ahmadi, S. F., Nath, S., Kingett, C. M., Yue, P. & Boreyko, J. B., *How soap bubbles freeze*, Nature Communications **10**, 2531 (2019), [DOI / original publication](https://www.nature.com/articles/s41467-019-10021-6).

Original article text checked on 2026-10-26 through the [author-uploaded full-text record](https://www.researchgate.net/publication/333866321_How_soap_bubbles_freeze). Direct Nature retrieval redirected to an unavailable identity endpoint; PMC returned a bot check. These access failures are not represented as a successful direct Nature/PMC read.

- Experimental setup / Figs. 1–4: air and base near −18 ± 2°C for the cold-room experiments; ambient near +25°C and base temperatures −10 to −40°C for the warm-room experiments. Both begin on icy substrates. The page's B = −20°C is one illustrative selected condition.
- Methods: solution approximately 79% distilled water, 20% glycerol and 1% dish soap by volume. The paper uses about −6.5°C as the formulation reference, adopting a water/glycerol literature value while neglecting soap's contribution. Not a universal soap-water melting point.
- Results: thermal Marangoni transport driven by freezing-induced heating accounts for the cold “snow globe” regime; poor conduction along the shell allows warm-air fronts to halt. Brief warm-case flow is acknowledged (Fig. 3), not erased.
- No paper-derived crystal trajectories, speeds, counts, stop heights or real freezing times were fabricated. Existing prescribed model remains unchanged. Optical principles are explicitly a conceptual extension, not a finding about the inspiration video's processing.

## Verification

All checks below passed against the final files, served locally on `127.0.0.1:18863`:

- Syntax: `node --check` app/i18n/test runner; existing model assertions and bilingual dictionary key parity via `tests/core.cjs`; `git diff --check`.
- Full existing `tests/browser.cjs`: zh/en at 320/390/640/1280 CSS px; seed/play/pause/resume/seek, same-time undercooling, independent clocks, trails, repeated reset, endpoint recovery, replay, DPR 1/2/3 resize, blocked storage fallback, keyboard seed/seek, 844×390 landscape, reduced motion, forced-color focus, index/Back/deep links. Zero page errors and zero external runtime requests.
- New `tests/teaching.cjs`: zh/en at 320×844, 390×844 (touch emulation) and 1280×844; actual touch taps on moment and A/B controls; keyboard adjustment changes canvas pixels while preserving time; active scene and sticky controls visible together; source precedes comparison; both language credits and copy resolve; dynamic observations follow moments/reset. Zero page errors.
- Existing target checks still require ≥48px controls but ignore elements intentionally hidden by the mobile scene picker.

### Visual review, not DOM-only validation

Opened representative screenshots and inspected the rendered pixels. Initial inspection caught narrow English base/flow text overlap; removed the redundant canvas annotation, retaining the arrow and adjacent key. “Growing” wrapped awkwardly at 320px; shortened the button to “Grow.” Removed an unexplained decorative orange arc so the orange marks correspond to the stated keys. Inspected the final narrow English early-flow view, Chinese late warm-front view, mobile growth/slider view and desktop comparison. Text, selected buttons, trails/front and explanatory captions are readable; no clipping or label collision remains in those views.

[Baseline first experiment](frozen-bubble-learning-evidence-20261026/before-zh-growth.png) · [Phone: adjust growth and see result](frozen-bubble-learning-evidence-20261026/zh-390-growth-control.png) · [320px English: early flow and controls](frozen-bubble-learning-evidence-20261026/en-320-cold-4.png) · [390px Chinese: late warm front](frozen-bubble-learning-evidence-20261026/zh-390-warm-24.png) · [Desktop comparison](frozen-bubble-learning-evidence-20261026/en-desktop-compare.png).

[Mobile entry and Codex credit](frozen-bubble-learning-evidence-20261026/zh-390-entry.png) · [Research card before controls](frozen-bubble-learning-evidence-20261026/zh-desktop-source.png). These additional screenshots were also visually inspected.

Machine-readable results: [teaching checks](frozen-bubble-learning-evidence-20261026/teaching.json), [full regression](frozen-bubble-learning-evidence-20261026/regression.json).

## Limits

Headless installed Chrome 156.0.8078.47 with mobile viewport/touch emulation; no physical phone/Safari or independent learner study. The prescribed educational model is not a physical solver and does not predict real freeze timing, crystal geometry or ice coverage. No push, deployment, external messages, credentials or security settings were changed. No local AI model or inference runtime was started. Acceptance criteria for future comparable variants are recorded in `frozen-bubble/BRIEF.md`.
