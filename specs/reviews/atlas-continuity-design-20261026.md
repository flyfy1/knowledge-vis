# Round5: first-visit learning continuity — audit and minimal repair

## Goal and priority (2026-10-26 local iteration)

Improve the ability to choose a mathematics–motion connection, inspect its explanation/course and return to the same experiment. Do not add concepts, mastery states, profiles, another controller or work–energy charts. Existing workflow, bilingual UI and website-design contracts apply; same confirmed knowledge-vis repo. Read current status/HEAD fdfb7a50 and prior four-round handoff. No new target AGENTS/.agents skills. Staged six potential files;7178 protected file hashes, including all LeetCode and four-round model/adapter/legacy lesson files.

### Reproducible findings

P1. Four equivalent inline-route entry buttons behave differently. Fresh390×844 visit, select motion or response: host remains roughly815–1220px below viewport top, focus outside it. Kinematics/travel instead reveal host at16px and focus an experiment heading. User cannot rely on the same route affordance. Independent reviewer reproduced this; own red test entry-red.cjs fails and records entry-red.json. Acceptance: all four inline route entries reveal and focus their own experiment, no hidden host or automatic play, existing non-experiment routes unchanged.

P1/P2 continuity seam. Switching projection→rates/travel retains unit-circle selection, so all current route stops can be unpressed with no explanation. This preserves legitimate context but is unexplained. Inspecting a concept from the long inline lab scrolls/focuses detail; after reading a course and browser Back, the experiment is far above. Some nodes have a relevant contextual opener, while travel→oscillation has no travel opener. Need one clear return-to-current-experiment action with no state/history mutation, plus an explicit outside-route context note. Do not silently reselect a node or pretend route stops are completed.

P2. Seven question cards show names/counts but no suggested background or explicit beginner progression; response's complex steady-state mathematics is harder than the projection task. Existing local node/course links and term explanations exist. Independently rank teaching gaps before deciding another guide; this round prioritizes the measured navigation failures over a new curriculum system. A new visitor is not a real learner study; do not claim learning outcomes.

## Minimal repair contract

1. One local focusExperiment dispatcher maps active motion/kinematics/travel/response to existing focus APIs. Reuse it for all four route cards. Closed routes and other editorial trails retain existing behavior.
2. Active experiment gets one detail return button with an explicit short view label. It only scrolls/focuses the current host. Replace that view's duplicate open CTA; other available experiment CTAs retain their behavior. Preserve URL,node,filters,phase,a/b,m/k/A,zeta/r and paused/running state; do not add history on return. Source lesson→Back then return is a core test.
3. If selected node is outside active trail nodes, show a bilingual context note next to stops explaining why none is selected and offering explicit stop selection. Do not auto-move it, infer prerequisites, mark completion or write learning progress.
4. Update first-visit intro's outdated waves-only scope to include motion/rates/accumulation; counts34/43/7 unchanged. No new runtime model/store, no root/shared registration or LeetCode edits.

Exact existing tokens, typography and48px/focus patterns; scoped class only if necessary. Current index is the sole URL/locale owner. Render-only button/note extend existing detail/trail; no parallel navigation framework.

## Evidence / acceptance

Red→green entry and return/mismatch fixtures; fresh session/locale both languages and320/390/768/1280,200% text,keyboard/forced-colors, storage denial. Four-round model suites and actual browser regressions, source anchors/Back and homepage integration. Independent reviewer first cold-walks without this brief, ranks findings, then reviews repair and repeats affected paths. No deployment, push, new permissions/credentials or user messaging.

## Work–energy inventory (audit only this round)

Existing MotionModel already computes K=.5mv²,U=.5kx²,E=.5kA²; no work API or atlas work/energy node. Existing lever-pulley lesson covers ideal constant-force/distance tradeoff, not a variable spring-force signed-work task. Power-converters covers circuit storage; particle-state energy is qualitative. These are different teaching questions, not ready-made replacements.

A candidate next task is signed spring work across a quarter-cycle vs a full return, using the same a/b and motion: Wspring=.5k[x(a)²−x(b)²]=ΔK=−ΔU, unitsN·m=J. For defaultm1,k4,A.6, first quarter transfers+.72J to K; next quarter−.72J; full return net0 despite nonzero travel. Must state system boundary: spring force is external to the block, so its work is the block's net work here; for block+spring the ideal system has no driving/friction work and K+U stays fixed. A general external force need not do zero work. Work follows signed displacement/dot product, not unsigned path length. Existing phase bounds/parameters represent hypothetical comparisons; parameter changes are not physical work protocols.

Primary basis inspected: [OpenStax7.2](https://openstax.org/books/university-physics-volume-1/pages/7-2-kinetic-energy),[7.3](https://openstax.org/books/university-physics-volume-1/pages/7-3-work-energy-theorem),[8.1](https://openstax.org/books/university-physics-volume-1/pages/8-1-potential-energy-of-a-system),[8.3](https://openstax.org/books/university-physics-volume-1/pages/8-3-conservation-of-energy). No new energy feature this round: measured entry/return problems take priority, and a force/energy task needs its own learner question and design acceptance. Avoid adding merely an energy bar chart.

## Independent design adjudication

Independent cold-walk confirms both entry and travel→oscillation return as P1, with screenshots and URL/viewport evidence. Repair design accepted before runtime edit: keep selected node and state, pure focus return, neutral “also select” outside-route note, bilingual labels/wrapping, no new guide/framework. All constraints adopted. Context note appears both next to trail stops and under the active experiment intro so view-switch users can see it; both are app-owned text nodes. Full independent audit archived with final report.

## Independent narrow recheck: visible keyboard focus

A final320px/200% check found the inherited rates/travel focus APIs focus a lower subheading, then scroll the host top; after the long enlarged intro, the focused subheading is offscreen. The first acceptance checked containment only, insufficient. Own focus-zoom-red.cjs reproduced it. Repair stays in app: dispatcher focuses shared view's dynamic motion-title H2 for all three views, response unchanged; all original contextual openers also use the dispatcher. New assertions check the active heading rectangle intersects the viewport, not only activeID/DOM containment. No protected bridge/model edit or state change. Independent reviewer requested this as a must-fix, accepted the minimal approach, and will narrow-recheck.
