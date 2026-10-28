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
