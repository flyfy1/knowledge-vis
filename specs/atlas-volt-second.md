# Signed voltage area → inductor current → periodic balance

Read WORKFLOW, power-converters/BRIEF.md, Atlas and provenance specs. [Design gate](reviews/atlas-volt-second-20261026/design-review.md) is independent; all recommendations adopted.

## Gap / smallest useful experiment

Baseede2ef1d has38nodes/49edges/12routes. Buck already explains volt-second balance in text and plots iL; do not claim those are missing. Missing is an actual signed vL–time area linked to Δi and a graph bridge from integral to inductor. Build one application edge and `volt-second` route integral→inductor→buck, over three existing experiments. No mandatory dependency, new concept/model/clock/store.

Known: signed integrals add contributions. Question: if average inductor voltage is zero, why can current flow? Inputs: original BuckVin5..12V,D.2...75,play/seek0..100µs. Outputs: same inspected time, fixed-axis voltage rectangles filled only until that time, positive/negative/netVµs, area/L, initial/currentiL. Presets ONend andoneperiod only dispatch existingseek handler, pause, keep button focus. Model is the existing ideal periodic CCM/small-ripple case, not startup or adjustment transient.

## Claim → evidence → concepts

For constant idealL>0, passive terminal voltage vL=left−right with iLleft→right: vL=L diL/dt, so ∫0ᵗ vL dτ=L[iL(t)−iL(0)]. The integral determines a change, not absolute current. A complete repeating current period gives netvoltagearea0 and averagevL0; it does not imply iL0 or no instantaneous ripple. Arbitrary transient intervals need not balance. Areas are voltseconds, not joules; energy would integrate powervLiL. Negative OFFarea lowers current but total0→t net may still be positive.

Primary source [AnalogDevices Buck basics](https://wiki.analog.com/university/courses/electronics/buck_converter_basics), ideal simulation/current-ramp and volt-second sections: current slopes(Vin−Vout)/L and−Vout/L and periodbalance. We read this actual source. [OpenStax14.2](https://openstax.org/books/university-physics-volume-2/pages/14-2-self-inductance-and-inductors) gives inducedemfε=−Ldi/dt; ε uses a different reference from our terminaldropvL. Do not silently substituteε withvL and keep its minus sign. TI SLVA477 supports CCM/ripple but its current redirectedrevisionC includes nonideal efficiency: do not import that formula into the ideal numerical model.

BuckON vL=Vin−Vout,OFF vL=−Vout,Vout=D Vin,T50µs,L1mH. AtVin12/D.5 ONends25µs:P150Vµs,N0,Δi.15A,i.925→1.075A; atT:P150,N−150,net0,i.925A. AtD.75 fullperiod:P112.5,N−112.5Vµs andi.94375A. These are rounded displays over analytic values. Initiali is the existing steadyvalley, not zero/startup; area does not independently determine its DC offset. ChangingD/Vin recomputes a new steady case at same time. Steady zero area is an assumption consequence checked by the visualization, not a simulated control convergence proof.

## Data, visual and lifecycle contract

38nodes/50relations/13routes. Only integral→inductor new; existing inductor→buck stays. Route integral#step2 uses velocity v=t, not voltagevL; units change fromm/s×s=m toV×s=V·s. Standalone inductor#step1 uses10mH/.5ms/±2V; Buck uses1mH/50µs and different inputexample. Explicitly distinguish parameters/no transfer.

Pure local voltage-area.js consumes existingBuckmodel fields and returns at mostfour clippedconstantvoltage segments, signed sumsVs andΔi. It does not solve a new physical state. model.js,flow.js,sharedplot(),capacitor rate andBoost remain unchanged. Both rectanglegeometry and sums come from the returnedsegments. Finitevalidt0..2T only, malformed/non-Buck inputs reject. Independent reference checks use mid-segment quadrature and existingm.sample(t).il−m.sample(0).il, not a tautological assignment.

Reuse palette green/amber/border/ink, static dashednegative edges plus signlabels; fixed0..100µs and−12..+12V axes across allowedBuckdomain, cursor onexistingseek. Fullperiod reference outline is unfilled future, not computed elapsedarea. AccessibleSVG summary and plainDOMunits/readouts. No extraCSSanimation/RAF. Readoutsaria-liveoff while playing andpolite paused; presets/buttons stableDOM except existinglocale rerender. Controls48px/focus3px,320/200%text,EN/ZH/forcedcolors/reduced motion. Scope suffixCSS only. Newdocument course reload resets existingseek; Atlas Back retains route station, not cross-courseparameters.

## Recurrence acceptance

- Realgraph/source links and bilingual3stationcoverage; no inventedprerequisite. Corecap/signal/math regressions count-onlyupdates where necessary.
- Analyticsegmentintegral equals independentquadrature andLΔi over allallowedparameter-grid cases and severalpartialtimes,DT/T/2T exact andneighbor boundaries; positive/negative signs,zero/invalid/nonfinite/outofrange input.
- Actualcontrols ONend/oneperiod,D50→75 atsameT show height/width/fill difference andsamezero net; i remainsnonzero, switchOFF boundaries/areas/current coherent.
- Play/pause/seek/reset/locale/repeatedpresets focus, Back/refresh, EN/ZH390,320true200%text, keyboard/forcedcolors/reducedmotion, runtime errors and actual screenshots. Independent cold science/teaching review must have0mustfix.
- Focused oldAtlas/capacitor/flow lifecycle tests; no claim whole-site,physicalphone/Safari/speech/hardware/learningeffect verified.
- Safe main and exact-scope backed-up production installation separate from publicverification. Respect priorCloudflare403/1010; no repeatedpublicrequest/bypass/securitychange. Record actualorigin evidence and publiclimit.

Floating-point display guard: signed sum can have a tiny residual (e.g.Vin5,D35%,oneperiod≈−1.36e−20Vs). Preserve raw analytic values; normalize only already-rounded displayzero to avoid “−0.00”/“−0.000”. Units and ≈ remain explicit. Recurrence test covers that actual case.

Disclosure sizing guard: initialrender occurs with Buckderivation closed (host.clientWidth0). Derive the initial plotting width from the existing visible Bucktrace container when the area host is hidden; opening the fold must not create a180px-based enlargedSVG until the first preset. No newtoggleclock/state. Compare first-open andafterseek viewBox dimensions.

Decimal-display guard: equivalent±46.875Vµs atVin5/D75 can straddle a binary tie and print46.88/−46.87. Round absolute magnitude symmetrically with a1e−9scaled-unit tie tolerance, restore the sign and suppress signedzero; rawarea remains unchanged. All readouts are approximate and net uses unrounded values. Test this alongsideVin5/D35 nearzero; do not change the physical solver or force all partialareas tobalance.
