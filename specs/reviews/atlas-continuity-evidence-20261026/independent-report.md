# Round5 independent learner-continuity audit and design review

Scope: first-time actual local Chrome use of motion, kinematics, travel and response; route choice, concept/course handoff, and return context. Read-only repository work; evidence in this folder. These findings concern navigation/teaching continuity, not a new science feature or a claim about learner mastery.

## Starting-point observations

A fresh zh-CN context at390x844 shows seven equally styled suggested-question routes, beginning travel, kinematics and motion. Intro still names waves/circuits/systems/measurement; default knowledge card remains Fourier. The question wording gives plausible tasks, and each inline lab supplies explicit assumptions and relevant sources. There is no fake profile, completion state or assessment claim; preserve that boundary.

Physical state and browser Back work: a paused phase.375 survived inspecting derivative, visiting actual derivative#step2, and returning. Named contextual experiment actions already exist for some concepts. The gap is consistent reveal/return orientation, not lost model data.

## P1-1: the same kind of route entry gives inconsistent feedback

Reproduction: fresh atlas at390x844; click motion or response question card. URL changes and route highlights, but scrollY stays0, focus remains the card, inline experiment top is approximately1094px and its title1142px, below the844px viewport. The same flow for kinematics/travel reveals host top approximately16px and focuses an experiment heading. First-time users can reasonably think the former two actions only selected a route rather than opened an experiment.

Minimum fix: all four inline route entries reveal/focus their corresponding experiment using the existing bridge focus methods. Preserve non-experiment route behavior and model state. Do not add an onboarding framework.

Evidence: entry-positions.json and mobile-entry-*.png.

## P1-2: shared-view selection and knowledge-card selection diverge without explanation

Reproduction: start motion with node=unit-circle; switch to Slopes & net force. URL becomes trail=kinematics&node=unit-circle; route's three stops and the rates concept buttons are all unselected, while the detail card still says Unit circle. Switching to travel similarly leaves every relevant concept unselected. Phase is correctly preserved, but the UI does not explain that concept selection and experiment view are independent.

Initial possible repair was to normalize an out-of-route node on explicit view changes. Dispatcher instead chose to preserve the existing selected-node contract and add an explicit notice naming the selected concept when outside the active route, with available route concepts and confirmation that experimental state remains. This alternative was independently approved before implementation. Do not constrain arbitrary graph exploration or imply a mandatory learning order.

Evidence: node-course-flow.json and rates-node-mismatch.png.

## P1-3: concept inspection can strand the current experiment behind actions for other experiments

Reproduction: travel route -> its Simple harmonic motion concept button. URL still has trail=travel; at the mobile detail card, the active lab is approximately7309px above. Detail offers projection, rates and forced-response open actions but no return to the current travel experiment. Choosing a prominent open action changes view/model context rather than returning to the interval task.

Minimum fix (dispatcher proposal, independently approved): while any inline experiment is active, detail exposes one `Return to current experiment: [specific view name]` action. It only focuses/reveals the existing lab; it must not change trail, selected concept, filters, phase, interval bounds, parameters, or playback state. Replace only the duplicate open action for that active route; retain other explicitly named experiment choices and all original course/source links.

Evidence: travel-return-entry.json, travel-oscillation-detail.png; derivative course/Back evidence in node-course-flow.json confirms this is a discoverability gap rather than failed persistence.

## Accepted minimum implementation boundary

1. Consistent inline route reveal/focus.
2. Universal detail return-to-active-experiment action, using existing bridges.
3. Explicit out-of-route concept notice while preserving independent graph selection.

Use existing URL/state/DOM patterns, scoped bilingual text and safe text nodes. Return must never imply resume playback or verified understanding. Notice wording should offer route concepts, not demand completion. Long concept titles and both locales must wrap at320px/200%. No new clock, store, profile, mastery model, global navigation layer or topic expansion is warranted.

Implementation acceptance is still required: ordinary route clicks and keyboard entry for all four labs; return from a matching and an unrelated concept; source/course Back then return; active playback return; shared phase/parameters/start-bound/filter/URL invariance; route-external notice presence and clearing; locale changes; no extra history entries for focus-only return; narrow/zoom layouts. Re-run existing navigation suites proportionately.

## P2 observations, deliberately deferred

- Current intro omits the newly central basic-motion questions. A later one-sentence scope adjustment could name motion alongside waves/circuits without changing the default Fourier card or inventing a level-selection flow.
- The first projection derivation uses x-double-prime before locally saying it means acceleration. A short nearby definition or optional link to the rates explanation could help a basic reader. This does not justify duplicating the derivative course or adding a guide panel during this P1 repair.
- Suggested route buttons report concept counts but not whether they expose an inline experiment or an editorial route alone. After fixing reveal consistency, observe real use before adding more badges or instructions.

No work-energy feature is recommended from this audit. First repair the demonstrated learning-loop interruptions. Browser walkthroughs establish reproducible interface behavior, not real learner comprehension, retention, screen-reader speech, or physical-device acceptance.
