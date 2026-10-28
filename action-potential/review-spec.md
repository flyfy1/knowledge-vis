# Review spec

- The page loads with all four lesson sections, three canvases, controls, and a final misconception quiz.
- Stimulus below threshold reports a graded potential; moving it above threshold reports an all-or-none spike near +30 mV.
- Phase scrubber updates Na⁺ and K⁺ states and the phase explanation; leak current changes the displayed voltage.
- Frequency and refractory controls obey `output ≤ min(input, floor(1000 / refractory_ms))`.
- Chinese/English toggles update all lesson copy, labels, channel states, feedback, and document language.
- Layout remains usable at 390 px; canvases resize without throwing.
