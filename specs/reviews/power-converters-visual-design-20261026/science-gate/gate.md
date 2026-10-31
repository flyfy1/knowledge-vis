# Power-converter visual sample: independent science/model design gate

**APPROVE a bounded, user-started continuous teaching animation of the existing ideal CCM models. P0: none identified. P1 conditions below are required before acceptance.** This gate is source/model-first, read-only and independently calculated; I did not open Chrome. A separate reviewer owns the requested visual/UI-first experience. No test count establishes that the result looks refined or teaches well.

## Existing source and topology

The present converter model is a periodic analytic triangle, not an ODE startup solver: T50µs, L1mH, C470µF, fixed1A output load, Vin5..12V and D0.2..0.75. Buck Vo=D Vin; Boost Vo=Vin/(1−D). Output ripple is omitted; capacitor voltage is not a model state. Inductor current stays positive in the audited UI domain. Existing pulse demonstrations and the separate efficiency budget are different experiments and must not be repurposed as converter dynamics.

Actual SVG connectivity is usable: Buck's top series switch leads into L, with a freewheel diode from return to the switch/L node and parallel C/load on the right. Boost has L before the node, a low-side switch to return and a forward diode toward parallel C/load. In the original760×325 geometry the Buck junction is at x230 and C at530; Boost low-side junction is350, diode410..470 and C550; common load is660 and return y280. Reuse or refine these named nodes/segments together—do not add an animation path detached from the actual wires/components.

| Topology/state | Conducting routes that must be visible | Excluded route |
|---|---|---|
| Buck ON | Source+ → switch → L → output node → load → return → source−; C branch accepts/supplies the difference | Reverse-blocked diode |
| Buck OFF | Return → freewheel diode A→K → L → output node → load → return, with C difference branch | Open series switch and source-input branch |
| Boost ON | Source+ → L → closed low-side switch → return → source− **and separately** C+ → load → C− | Output diode blocks; no source-to-output path |
| Boost OFF | Source+ → L → diode A→K → output node → load/C → return → source− | Open low-side switch |

Boost OFF is source **plus** releasing inductor energy, not L alone. Buck/Boost inductor current remains in its positive reference direction during OFF; energy release does not reverse iL. Keep return paths complete, branch junctions connected and direction arrows unambiguous. Conventional-current markers on a capacitor are schematic terminal/displacement-current indications, not electrons traversing its dielectric.

## P1: one authoritative progress and phase boundary contract

- Every switch, diode, flow direction, inductor-energy cue, cursor and numeric readout must use the same current `m.sample(t)` and same Vin/D. A display animation can use one RAF scheduler; it must not create a second numerical physics solver or unrelated CSS pulse clock.
- Physical PWM is20kHz; the visual cycle must be explicitly slow motion. Set animation time by normalized cycle progress, map it to t=T·progress, and make ON duration D of that displayed cycle. Do not advance the old k points at equal wall-clock intervals: timeAt uses unequal subintervals. For D.2, first-cycle samples are0,5,10,30,50µs; for D.75 they are0,18.75,37.5,43.75,50µs.
- `sample(DT)` is the new OFF state; `sample(T)` and `sample(2T)` are new ON states. iL and magnetic energy are continuous. At the finite two-cycle endpoint the existing boundary convention displays the next ON state; stop movement and label completion honestly rather than claiming a different physical branch.
- Original voltage plotting adds left/right points at dT but not explicitly at T. New continuous voltage traces should draw both transition types as steps, using the exact old/new branch values at the same time coordinate, rather than an interpolation ramp. Current/energy should not jump at those boundaries.
- Pick one authoritative progress state that both play and the old manual advance/reset use. No unsynchronized k versus display-phase controller. Starting, pausing, seeking/manual step, repeated reset and end/replay must update that same state.

## P1: safe visual drivers and prohibited inventions

Safe immediate drivers are q.on, q.il, q.ic, q.vl, magnetic E=½L iL² and magnetic power pL=vL iL. Current direction/width/density can reflect signed current with an explicit diagram scale; magnetic-field strength can reflect E or iL. Label any per-case normalization. Flow particles/arrows are schematic conventional current, not actual electron positions/speeds or absolute ampere calibration. Do not reverse the inductor-current animation when pL becomes negative.

**Buck capacitor cannot be tied to ON/OFF.** iC=iL−Iout crosses zero at D/2 and (1+D)/2: each switching interval includes both charge/discharge behavior. At zero current the branch animation must become neutral/stop, not falsely keep charging. Boost ON has iC=−1A and C supplies its isolated output loop; in the present domain OFF iC>0 and the branch charges. These are signed current balances, not a newly solved capacitor voltage.

Do **not** invent capacitor filling voltage, instantaneous capacitor-energy history, load voltage/current transients, startup overshoot, feedback response or efficiency changes. The model treats Vo constant and does not integrate dVc/dt. Showing E_C(t) rise/fall while also claiming this same constant-Vo model would be inconsistent. Use charge/discharge direction/status from iC, keep Vo explicitly average/small-ripple and omit unsupported dynamics. Existing fixed1A load remains fixed; source/current/energy streams cannot imply free energy.

## Product-fit decision: sliders must cause visible change

While paused or playing, slider input must immediately redraw the same-state circuit/readouts; it cannot wait for a next-step button. A same-phase hypothetical comparison is particularly legible (e.g. holding phase.4 while D crosses.4 visibly changes the branch), but it is not a real transient after changing duty or supply. If retaining the old reset-to-new-steady-case policy, label it and make the resulting immediate visual change apparent; root must choose/document one consistent behavior before implementation. Never animate a settling process that was not solved.

Keep stable diagram DOM during playback and update its attributes rather than rebuilding the page each frame. Continuous visual values should not make a live region speak every frame: announce user changes, switching/state changes only as useful, or provide a quieter current-state description. Essential teaching animation is explicitly authorized by the user; amend the old BRIEF's motion0/no-async-loop clause narrowly rather than treating it as a blocker. Start paused, support keyboard/manual inspection and reduced-motion pause/seek. Existing palette/layout/navigation/locale/component/quiz contracts remain.

## Acceptance gates

1. Independent model checks: KCL branches, volt-second/charge balance, positive iL, continuity at D/T, E=½LiL² and dE/dt=vLiL away from switching instants. Preserve all original model tests; no startup/voltage-ripple inference.
2. At least default/min/max D examples inspect actual ON/OFF routes and complete returns. Boost ON's two disconnected loops must remain distinct. Negative/zero/positive Buck iC must each be visually correct in ON and OFF. No active marker crosses an open switch or reverse-blocked diode.
3. Compare a frame/seek position to numeric q, cursor, field state and branch sign; pause must freeze all motion. Check duty durations at.2/.75, period seams and two-cycle completion/replay; manual step and reset twice must not duplicate RAF loops. Slider changes, locale and viewport resize must retain the selected policy.
4. Numerically verify the actual SVG path/segment endpoints and intended node connectivity, then use actual visual inspection for occlusion, arrows, recognizable switching and perceptible slider cause. Pixel/debug assertions alone do not establish a refined visual experience. The independent UI reviewer must actually perform the prediction/action/observation task.
5. Both languages, desktop/narrow/2x/reduced-motion/keyboard/focus and pause/return behavior; continuous animation is neither a reason to lose accessible text nor an excuse for decorative flashing. No human comprehension/device/audio/deployment guarantee.

## Sources and independent probe

Read primary [TI Buck power stage](https://www.ti.com/lit/an/slva477b/slva477b.pdf), [TI Boost power stage](https://www.ti.com/lit/an/slva372d/slva372d.pdf), [ADI Buck basics](https://wiki.analog.com/university/courses/electronics/buck_converter_basics) and [ADI Boost operation](https://www.analog.com/en/resources/analog-dialogue/articles/applying-dc-to-dc-step-up-boost-regulators.html). These support topology and CCM assumptions, not every vendor real-world formula transplanted without its efficiency conditions.

`model-probe.json` independently samples actual model states/unequal intervals and compares a central energy derivative with vL iL. It shows Buck iC signs changing within both ON/OFF, positive inductor current, and the right-sided2T convention. No browser was used. No existing numeric-model replacement is justified by this audit.

## Deferred

DCM, load transients/resistive-load replacement, closed-loop regulation, switching losses/thermal behavior, ripple-voltage ODE, realistic electron motion, PCB parasitics, arbitrary hardware design, all-course restyling, new persistence/learner tracking, publication and deployment. The objective is a visibly causal, scientifically honest visual sample in the existing course.
