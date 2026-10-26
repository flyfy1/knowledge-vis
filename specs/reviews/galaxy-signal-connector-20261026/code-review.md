# Galaxy signal connector — independent final source review

**Bounded PASS; zero code/state must-fix findings in the reviewed slice.** No Chrome, product edits, endpoint request, deployment or broader course audit. Reviewed the actual additive Galaxy detail/native-click/save/read changes, Atlas explicit-language/hash-focus changes, scoped CSS and connector spec.

## Source of truth and navigation

The CTA derives the signal route from actual D.trails, requires node membership plus a matching stationTasks record, and creates exactly four current entries (lti/impulse/convolution/freqresp). It does not duplicate a four-node product whitelist, add graph data or claim recommendation/mastery state. The original lesson href/label assignment is unchanged and remains separate. New text is inserted with textContent; target URLSearchParams encode the validated route/node/current locale. The native click listener only calls save(false,true), with no preventDefault, manual navigation, extra history push, model update or renderer remount.

The existing Galaxy save captures the current camera and preserves its normalized node/from/q/group/low state, merges foreign history fields and replaces the origin entry. Its existing API-denial catch remains best effort; camera persistence cannot be guaranteed when browser history writes fail. Camera rendering, bfcache and native browser navigation were not simulated as pixels by this reviewer.

## Locale and arrival behavior

Both read/readState now consume only valid zh/en hints on initial state creation and popstate. This fixes the closure-language pitfall without writing arbitrary query text into a locale. Save retains a valid explicit hint and drops invalid values. Galaxy connector activation explicitly stores its current locale on the origin entry; Galaxy locale clicks are also explicit intent. Atlas locale clicks only update an already hinted URL. Ordinary no-hint Atlas URLs keep the original storage/browser preference policy and are not rewritten just to add a hint. Existing guarded storage reads/writes remain guarded.

Atlas initialization focuses the existing current-task heading only for the exact #route-task-title hash when that heading actually exists. This does not switch nodes, clear filters or trigger an experiment, and leaves legacy/unknown hashes alone. The existing task focus seam performs the scroll. Whether the browser shows the right focus box at320/200% is developer/independent UI evidence, not a conclusion obtainable from this source review alone.

The locale guarantee is specifically this connector's Galaxy→Atlas→browser-Back/refresh path. Other pre-existing Galaxy navigation links and other lesson language/control policies were not modified/certified. Keep that bound explicit when summarizing the spec; do not generalize it to every Galaxy↔Atlas link or course.

## Actual independent evidence

Executed independent-state-probe.cjs against the actual extracted read/save function bodies: **20checks PASS**. The VM checks explicit hints on initial/restored entries, invalid hints, no-hint save behavior, foreign history preservation, includeLang camera snapshot/replace-not-push semantics, and the four data-derived members. It supplies a mock history/location/current camera; it is not a browser/localStorage-denial or WebGL test. The source retains storage-denial guards and contains no new storage calls outside them.

`git diff --check` passed. Final reviewed hashes are in code-review-source.json; graph/model/course source files were not changed by this slice. Parent's browser tests and UI-first reviewer results must remain credited to their actual operators. No audible, physical-device, learning-outcome or full accessibility claim follows from this code review.

Scoped CSS uses existing palette tokens, a48px wrapping native link and the existing3px focus style, with a forced-colors border. Actual320/200% layout/focus, four native destinations, original links, WebGL/low-power camera/filter/path Back and blocked-storage reload remain the browser acceptance scope owned by the parent, rather than a new review loop here.
