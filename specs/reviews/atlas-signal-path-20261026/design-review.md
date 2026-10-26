# Signal learning path — independent bounded design gate

**Proceed with the bounded design. P0: none. P1: the task/model distinctions below are required.** Source-first static review of actual atlas data/route renderer and relevant LTI2/3, convolution2 and freqresp3 source; no browser, implementation, or product edits. This gate does not assert a learning outcome.

## Value and scope

There is a concrete existing-content gap: the atlas has lti→impulse and impulse→convolution, and a separate impulse→freqresp transform relation, but no direct convolution→freqresp bridge or route explaining the sequence as one task. One sourced representation edge and one four-station editorial route are sufficient. Reuse existing nodes, controls, audio, source sections, URL/history/filter/language handling and Galaxy graph; add no DSP, clock, storage, course parameters, node, hidden completion state or required-prerequisite declaration. The expected editorial increment is38nodes/48edges/11routes, not a new subject area.

An optional stationTasks field is an appropriate minimal extension. Validate bilingual fields, station IDs belonging to route.nodes and supported local source anchors. Prefer one compact selected-station task next to existing route stops over four expanded essays. Existing routes without the field must retain their current rendering. Keep the existing node-selection buttons as buttons; give the task a separate explicit “Open this station” deep link. A task-specific freqresp3 link must not silently rewrite the general frequency-response node's canonical source or open an unrelated introductory step.

## Four stations grounded in the actual UI

1. **LTI / lti#step3.** Ask whether weighted combinations and delayed inputs produce corresponding output changes. Use the existing accumulator/counterexample controls and actual deviation readouts. A finite example illustrates/tests the property here; do not label one successful finite fixture a proof for every possible system/input. Why next: if the two properties hold and the system starts at rest, one impulse response can characterize it.
2. **Impulse / lti#step2.** Select the3-point moving average, inspect three equal h coefficients, and compare input/output using the existing optional audition and the summed shifted copies of h. The synthetic28-point sound is not a pure sine, and no particular response zero implies this entire clip becomes silent. Why next: explicitly calculate how sample contributions add to an output point.
3. **Convolution / convolution#step2.** Actual defaults are f=[1,2,3,2,1], g=[1,0,−1]. The UI flips/slides g, multiplies f[k]g[n−k], and sums with “单步 / Step”. It is a different numerical example from the3-point average; say so. Do not promise this section already displays the same28-point input or a3-tap-average kernel. Call g a kernel; identify it with h only when describing a chosen system. The shifted-weighted-h display itself is LTI2. No automatic cross-course parameter transfer or new presets are needed.
4. **Frequency response / freqresp#step3.** First set M=3, then press the existing exact “first zero2π/M” button. Predict that sufficiently established cosine output cancels while the input remains; compare the visible output and analytic/measured values. Do not ask the learner to type rounded2.094 or claim it is exactly2π/3. For zero-initial MA3, n=0 gives1/3 and n=1 gives1/6 for x[n]=cos(2πn/3) starting at n=0; cancellation begins once all3terms exist (n≥2). The displayed late window is steady behavior, not an absence of startup transient. A zero output has no measurable phase/delay. No Hz value is assigned without a sample rate.

The final prediction can remain a simple “predict before opening the existing experiment” prompt; a score, new quiz framework or inferred mastery is unnecessary. Existing controls already supply the check.

## New relation: exact scientific wording

Use discrete notation consistently: y[n]=(x*h)[n], H(e^{iΩ})=Σh[n]e^{−iΩn}, and Y(e^{iΩ})=X(e^{iΩ})H(e^{iΩ}) where the relevant transforms exist; Ω is rad/sample. Initial rest is needed for output to be solely this input convolution. Absolute summability of h supplies a standard stability/DTFT sufficient condition. This route uses stable causal MA/FIR and |a|<1 accumulator examples, not continuous RC response H(iω) or an unconditional claim about every LTI system.

Distinguish the ordinary convolution theorem (for transformable sequences) from the steady complex-exponential/sinusoidal response: an infinite sine is not an absolutely summable sequence with an ordinary pointwise DTFT. It is enough to explain that its sinusoidal components are multiplied by H, and that the stable-system transient decays (or finishes for a finite FIR). No distribution theory is needed in the learner text. At Ω=2π/3, MA3 has H=(1+e^{−i2π/3}+e^{−i4π/3})/3=0; this does not mean all frequencies, the existing finite/repeated sound, or arbitrary inputs are removed.

The arrow is a documented representation relation and the route an editorial learning suggestion, not a mathematical proof direction or mandatory learning order. Root will verify the primary source used by the new edge; this reviewer has not newly fetched/certified it at this gate.

## State and acceptance gate

- Route selection/Back must preserve route, selected node, language and existing filters under the current contract. Off-route selection retains its explanatory context. Avoid defaulting to station1 or automatically marking the route completed.
- Course links return to the same atlas context; existing course control reset/recovery policies remain local. In particular LTI audio stops on leaving and must not autoplay on Back. Do not promise cross-course knob synchronization or universal lesson-state persistence.
- Static validation: new edge unique ID/type/bilingual/source, existing neighboring route relations, four exact task targets and optional-field negatives. General graph cycles remain allowed; no new strict prerequisite edge.
- Actual independent learner walk before final acceptance: follow all4station links, find the named native controls, predict the MA3 zero, distinguish changed numerical examples, return with context; check EN/ZH320/390, keyboard/focus/200% and no clipping. Existing routes and actual Galaxy graph must keep working. Keep real hearing unavailable explicitly unknown rather than borrowing the previous digital-audio result as audible evidence.

No further topic or course refactor is required by this gate.

### Accepted final bounded refinement

The proposed single-current-station view, native optional expected-observation disclosure and Prev/Next controls can reuse the existing selected-node/URL owner without new persistent state. Prev/Next should focus the newly displayed task heading without resetting filters or silently changing a course. Returning to an entry must not infer a completed answer.

The final contrast “M3 at its exact first zero, then keep Ω=2π/3 and change M to2” is valid: |(1+e^{−iΩ})/2|=|cos(Ω/2)|=1/2. The sinusoidal output reappears with half amplitude after the short FIR startup, while the frequency remains fixed. This sharpens the prediction/check without adding a new model, arbitrary-input audio claim or cross-course state transfer. Use the existing frequency/preset state directly, not rounded text.
