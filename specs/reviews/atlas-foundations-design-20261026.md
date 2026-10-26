# Round6: optional starting ideas and one bounded self-check

## Scope / audit (2026-10-26 local,2026-10-25UTC)

Confirmed same knowledge-vis; current baselineHEAD3116c717 after concurrent LeetCode workflow commits. Read current structure/handoff and changed-commit scope; no new atlas AGENTS/.agents skills. Existing workflow/UI-i18n/website-design/MVP-first contracts continue. No push/deploy/fees/new permissions, no repeat of denied process inspection. Browser suites serially against18775.7180 excluded file hashes captured; all models, bridges, courses, root homepage/config/registration and LeetCode protected.

Independent actual single-page Chrome reading: seven routes×two languages, pageerrors[]. Findings and cold-read evidence in reviewer-foundations.

| Route | Actual first-use gap | Smallest choice |
|---|---|---|
| motion | x′/x″,phase,radian andω are used before a beginner can decode them | canonical sine/oscillation definitions plus short symbol notes |
| kinematics | direction,speed/net force and units already explained; x-derivative notation can benefit from an optional reminder | derivative/net-force references; free-spring prediction check |
| travel | signed displacement/distance and units already explicit | reuse integral definition; no copied travel exposition |
| response | x″/angular units plus circular explanation of transient/steady | reuse sine/oscillation notes; one plain definition of transient/steady/viscous damping/relative phase |
| waves | optional phase/frequency reminder; discrete n/k decoding is a separate later need | sine/superposition references; defer n/k |
| power | buck can appear before PWM; CCM and periodic steady-state/average voltage not decoded | reuse PWM/buck; narrow canonical buck/boost conditions and averaging |
| estimate | prior/likelihood/posterior currently combine unexplained nouns | short plain definitions in canonical Bayes description, reused by hint |

Priority is a route-local way to understand a first formula, not an encyclopedia.34 nodes/43 edges/7 trails remain; no new model/controller or inferred curriculum/mastery.

## Content / source ownership

One optional native details component, not a new navigation system. Each route references1–2 existing node IDs; render their canonical title,description,formula,source with existing helpers. Author missing symbol explanations only once in optional node help fields: sine owns θ/rad/ω/f/T; oscillation owns x′/x″ and units. Response gets one route-specific plain-language note because its positive-damping,driven steady-state boundary differs from free motion. Rates/travel paragraphs remain untouched.

Canonical precision repairs: Chinese “without external force” for free oscillation becomes “without sustained driving” (the restoring force remains). Ideal CCM buck/boost formulas describe average output in periodic steady state; current never reaches zero over a cycle, and periodic waveforms may still ripple. Bayes prior=before observation,likelihood=probability of the observation under each possibility,posterior=updated probability. No runtime numerical behavior changes.

Primary sources inspected: [OpenStax15.1](https://openstax.org/books/university-physics-volume-1/pages/15-1-simple-harmonic-motion),[Angles7.1](https://openstax.org/books/algebra-and-trigonometry-2e/pages/7-1-angles),[Acceleration3.3](https://openstax.org/books/university-physics-volume-1/pages/3-3-average-and-instantaneous-acceleration),[Forced15.6](https://openstax.org/books/university-physics-volume-1/pages/15-6-forced-oscillations), and original damped/driven MIT8.03 reference already in response. [TI SLVA057](https://www.ti.com/lit/pdf/slva057) and [SLVA061](https://www.ti.com/lit/pdf/slva061) support CCM periodic-state conditions. Existing Bayes course is the canonical local model; primary probability source is linked in verification if supplemented. No copied long excerpts.

## Presentation/state contract

Stable details/summary uses existing native disclosure pattern/tokens. Inline routes place it immediately after the intro; ordinary trails place it by stops. Same outer disclosure and self-check nodes survive node/lang/view rendering and movement. Source/inspect links reuse node source/selection and round5 return-to-current-experiment. Opening/revealing never modifies URL selection,phase,a/b,m/k/A,zeta/r or playback.

For actual course Back (including reload instead of bfcache), use existing history.state for UI presentation only: hint-open boolean,answer-reveal boolean,fixed question ID. Preserve other history fields and existing URL state. No local/session key,answer entry,score,read count,timestamp,profile or mastery inference. Restore reveal only when the same question applies; hiding/changing a question clears its old reveal. Native toggles replace current history state without adding entries. Denied history access falls back to current in-memory UI.

## Self-check / learning question

Only motion/kinematics show the free-spring check. Conditions: ideal A>0,m>0,k>0,no damping or sustained drive. Predict: at equilibrium x=0,must velocity also be0? Native reveal explains no: ΣF=a=0 at that instant but |v|=Aω>0; zero-amplitude rest is outside this question. Connect x′ to velocity and x″ to acceleration. This is not a claim of uniform motion afterward.

An explicitly labelled button can switch to the existing slopes view while preserving phase; user then chooses the existing equilibrium-crossing snapshot to verify. It does not silently seek/reset/play. No answer judgment or learner status is recorded. This is an opportunity to check a prediction, not evidence of measured understanding.

## Acceptance / independent adjudication

Independent design accepted single details,1–2 canonical refs and this bounded self-check. Mandatory conditions adopted: question scoped to free spring only; response defines transient/steady in plain words; preserve disclosure/focus/state; clear inapplicable answer. History presentation-only restoration independently approved before runtime edits, with schema validation, merged fields, no extra history entries and inapplicable-answer clearing. Bayesian likelihood is explicitly the discrete lesson example; converter formulas state constant DC input, ideal CCM, periodic average and boost0<D<1. All gates adopted.

Tests: actual canonical rendered content/source anchors in both languages; no model changes on open/reveal/lang/inspect/course Back; explicit slopes switch preserves phase until learner selects crossing snapshot; answer disappears/clears on unrelated routes; seven-route disclosure placement; native keyboard focus visible at320px/200%; source Back restored UI without new history entries; denied storage/history fallback; existing six browser suites and numerical regressions serially; independent science/teaching cold walk with must-fix repair before acceptance. No physical device/screenreader speech/learner-outcome claim.

## Independent implementation recheck / red→green repair

Native details identity/open survived initially, but unconditionally inserting the same node blurred a focused summary during a synthetic locale rerender. Own focus-before.cjs reproduced the exact failure. Fix: move only when anchor/parent differs; ordinary routes use a stable sibling of the rebuilt trail. Capture helper-owned focus before host changes, restore equivalent existing control after card rerender, and keep its rectangle visible. Real language clicks keep their intended language-button focus. Also synchronize the existing pwm→boost edge with the canonical small-ripple average approximation; no course/model edit.
