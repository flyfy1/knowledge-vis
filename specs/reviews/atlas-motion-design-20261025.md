# Atlas motion bridge — design and iteration scope (2026-10-25)

## Audit, ownership and priorities

Existing atlas: 31 nodes, 40 sourced relations, 4 trails; its previous acceptance covers navigation, not an in-map experiment. Atlas working tree clean; runtime last edited Oct18. Baseline HEAD 104f82ca (LeetCode route generation). Existing frozen-bubble/root registry changes and unrelated LeetCode/bicycle work are preserved and excluded. File hashes/HEAD recorded before implementation; compare before applying and after testing. No session-directory access, nested Codex CLI, commit, push or deployment.

P0/highest-return slice: verify one existing math→physics relation inside the atlas. Reuse `unit-circle → sine → oscillation` nodes and edges, add a fifth editorial trail and stable inline experiment with a small locale/navigation adapter. P1/next: review another math/physics connection against learner tasks and fill its strongest gap. P2/deferred: bulk node creation, automatic extraction, new graph framework, accounts/progress system and broad curriculum expansion; these require evidence beyond this slice.

MVP user/job: a learner moving from a geometric definition to a physical law needs to see what is shared and what sets physical frequency. Risk: a rotating picture can imply the block circles or geometry causes force. Loop: trail/node → shared phase → unit-circle projection, spring displacement and time curve agree → vary m/k at fixed phase → explain period → return to map/existing lesson. Observable proof: matching diagrams/readouts, correct force sign and period ratios, pause/reset/seek/end, bilingual mobile and existing atlas regressions. No claim of real hardware or retention gains.

## Integration/model contract

Only atlas runtime/brief, new atlas files/tests/README, dedicated review/evidence files, and an additive specs/README link. No root index/pages.config/CONCEPT-MAP, LeetCode, dependency or existing-lesson change.

Ideal horizontal massless Hookean spring, positive k and point mass m, without friction or forcing. x(0)=A,v(0)=0. Analytic x=Acos(ωt), ω=√(k/m), T=2π√(m/k), F=-kx, a=F/m. Unit-circle q=cosθ is multiplied by A; auxiliary circle is not the block's trajectory or force mechanism. Time axis is seconds; changing m/k at fixed phase pauses and recomputes t and whole curve as a hypothetical comparison, not a live change of material properties. Two-cycle playback stops. Reset restores all defaults and stops.

Sources checked: OpenStax University Physics Vol1 §15.1 (spring/SHM) and §15.3 (circle projection). Analytic ideal model, not measurements or real-hardware numerical solution.

## UI/state contract

Reuse exact atlas tokens, system fonts, 48px controls, shared knowledge-lang and native controls. Scoped new CSS. Stable lab host below routes, outside rebuilt sidebar; locale never replaces simulation DOM. Route exit pauses; return retains phase/parameters. Initial/reduced-motion state paused. One authoritative phase, no ambient loops or rapid live-region updates. Predicted full curve distinguished from elapsed segment. No-canvas fallback leaves explanation/readouts. Loading/reconnect/auth are inapplicable to this local synchronous model.

Independent design reviewer: separate design_review agent; read-only current atlas source/brief/tests. Product placement approved before implementation. Adopted: explicit unit radius1 vs amplitude scale A, physical initial conditions, seconds axis and recomputed history, existing graph/trail semantics. Full adjudication additions below as received.

Final adjudication: all independent recommendations adopted. Keep unit circle fixed radius1 and draw physical amplitude on a fixed ±1m axis so A edits remain visible. Derive every graphic from one phase. Keep experiment outside rebuilt detail/trail; use separate data-motion-* translation hooks. Open/close/Back use existing trail URL state. Correct external-source note only for the three linked concepts. Hidden/page-switch state pauses without catch-up; full reset restores defaults. User-started motion is a documented exception to the original atlas no-animation contract. Force-direction arrow included because it directly illustrates the defining law; damping/driving/arbitrary initial conditions deferred. No design blockers.
