# Population ecology · teaching spec

## Causal teaching chain

1. **Rate creates change** — `dN/dt = rN` gives unbounded exponential intuition.
2. **Resources feed back** — multiply by `(1 − N/K)` so growth slows as N approaches K.
3. **Equilibrium has a sign** — `dN/dt > 0` below K, `= 0` at K, `< 0` above K.
4. **Predators couple variables** — prey loss scales with `aNP/K`; predator growth follows captured prey and is reduced by mortality `mP`.
5. **Delay makes waves** — prey and predator peaks are offset, so a snapshot is not the same as a causal explanation.
6. **A phase plane exposes the loop** — plotting predator P against prey N turns the same time trace into a path; its orientation makes the lag visible as a loop instead of a pair of lines.

## Interaction contract

| Control | State | Derived readout |
| --- | --- | --- |
| `N₀`, `r`, `K`, `t` | logistic parameters | `N(t)`, `dN/dt`, distance to K |
| `a`, `m` | predator–prey feedback | final prey/predator values, time traces, and a phase-plane path |
| quiz choice | misconception check | feedback that points back to the formula |

## Accessibility and language

- Every canvas has an aria label and every important value has a text readout.
- Sliders are native range inputs and work by keyboard.
- All visible instructional copy is available in Chinese and English.
- The phase-plane card labels the axes, marks the initial and final state, and reports the current orientation so the visual claim remains inspectable in text.

## Revision note (2026-10-29)

- Added a phase-plane canvas derived from the existing predator–prey simulation, including a pure `phaseSummary` contract for range and loop orientation.
- Regression guard: the focused model test checks bounded ranges and the degenerate nearly-flat path.

## Provenance label brought to contract — 2026-11-09 Claude Code

The phase-plane label (added by 07fec169, `Built-By: Codex (gpt-6.1-sol)`) used a non-contract summary
and named c21cdb49 — a commit that never touched this page — as its source. It now reads
"Codex 开发 · 改进版本 / Developed with Codex · Revised edition", points to 07fec169 in full, and is
registered in `page-provenance.json`; the lesson's original author (3820f26b, undeclared) is not asserted.
Recurrence check: `node tests/page-provenance-core.cjs` verifies the label against the inventory and the
source commit's trailer. See [review](reviews/claude-pages-review-20261109.md#6-任务-2署名清单缺口).
