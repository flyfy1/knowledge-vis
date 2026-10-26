# Tangent reading recovery: finite commit save gate

**Recommendation: adopt synchronous saves at finite native commit events.** This remains within the existing reading-context repair and needs no new lifecycle hook, model, schema, storage key or framework.

The parent/cold real-browser evidence showed that a late `pagehide` history write did not reliably repair reload recovery. A trailing 180ms preview debounce alone therefore gives a delay-dependent contract: the visible final state can differ from the history entry when a user reloads immediately after finishing an edit. A successful test that waits one second proves settled recovery, not commit recovery. The earlier independent callback test also explicitly flushed the fake timer, so it did not prove immediate commit persistence.

## Minimal locations

- S1/S4/S6 canvas pointerup, pointercancel and lostpointercapture: terminate dragging, then call existing `saveTangentReading()` synchronously. S1/S4 should clear their own dragging flag on lost capture as well.
- Canvas and S4 range keyup: save only recognized edit keys (arrows, Home, End), after the existing keydown mutation. Do not save every unrelated key.
- S4 range change: save the native committed value. Retain input's debounced preview path.
- S1/S4 preset clicks, S1 unit clicks and S6 chain click: save after their existing state mutation. Registering additional listeners after init in the current DOMContentLoaded routine preserves this order without altering the setters.
- S6 explicit pause: synchronously save the current angle when playback is stopped. Restore remains paused, with no autoplay/trace serialization.

Keep pointermove, range input and repeated keydown as 180ms trailing previews. The existing save already clears its timer, merges foreign fields and catches denied access. A possible duplicate pointerup/lostcapture pair is bounded and harmless; no new persistence abstraction is needed. Avoid beforeunload. Programmatic debug `TRIG.set` can retain the existing debounced setter contract; do not turn every animation frame into a synchronous history write.

## Acceptance boundary

Use the existing long-drag real-browser fixture, preserving the initial settled save, then move to the final angle, release, inspect the history record **without a post-release delay**, and immediately reload. Assert visible/exported/current/saved/reloaded angle agree. Run a separate cancel and lost-capture callback check where feasible. Add immediate commit checks for the native slider change, supported keyup, preset and unit click, preserving foreign fields and denied-access fallback. Unit tests with fake timers should inspect saved state before flushing any trailing timer. Do not rely on arbitrary waits or pagehide to make these tests green.

This is a design/source assessment only, not a claim that the commit patch or browser retest has run. It follows directly from the already-authorized reading-context target and the parent's observed lifecycle behavior.
