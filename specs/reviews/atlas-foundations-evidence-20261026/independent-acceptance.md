# Round6 independent implementation acceptance

Verdict: PASS, zero remaining must-fix findings in the independently checked science, teaching and local UI scope. All tests below were independent, one Chrome page serially; no repo edits.

## Completed

- Seven routes × English/Chinese: canonical references1–2, persistent help/summary DOM identity, only motion/kinematics expose the scoped self-check. No page errors.
- Question/reveal toggles while paused preserve exact model datasets, URL and history length. Explicit rates entry preserves phase and does not select the equilibrium preset.
- Actual source-document navigation and Back retain URL,phase,open/reveal. Separate ready run verifies unrelated history.state fields survive too. Malformed question/booleans fall back closed without destroying unrelated fields.
- Scope/wording reviewed: x′/x″ are derivatives with correct units; f/T/ω/radian relationship; ideal free oscillator equilibrium counterexample; discrete-likelihood qualification; average CCM buck and small-ripple approximate boost0<D<1. Response updated note is first before free-background cards and explicitly distinguishes the driven/damped current lab.
-320px/200% English/Chinese motion,power,response,estimate no horizontal overflow, summary target≥48px. Actual keyboard Enter leaves summary visible (top387.6px,height68.8px) with3pxoutline; forced-colors outline retained. Screenshots of both response languages inspected for wrapping.
- Model/bridges were read for contextual consistency, not rerun or changed. No new science model was introduced by this drive.

## Findings discovered and cleared

1. Focused summary loses focus to body during a locale rerender that does not itself move focus (reproduced with dispatchEvent on language control). DOM identity and open state survive, but unconditional reinsertion blurs the focused node. Ordinary clicking a language button is different and should correctly retain focus on that button. Parent implemented the accepted minimal fix: avoid redundant move; ordinary-route stable sibling; capture helper focus before host changes and restore its logical equivalent after needed content recreation. Final independent recheck passed.
2. New boost canonical≈/small-ripple wording and existing pwm→boost relationship (=without average qualifier) are inconsistent on the same page. Parent aligned this edge in both languages to average voltage, small-ripple periodic-steady-state approximation and0<D<1. Final actual-source reading confirms consistency.

## Evidence / test boundary

`acceptance.cjs/json`:14 content branches, sourceBack/phase, paused toggles, explicit transition, off-route question clearing/Back,8 narrow layout cases,forced colors,pageerrors. Focus rerender recorded rather than asserted in this first evidence run; it is a real discovered contract gap, so the script exit0 is not treated as acceptance.

`acceptance-ready.cjs/json`:final response note order/bilingual scope, real sourceBack history merge, true keyboard focus, invalid schema. First run had a reviewer fixture error: expected history.length after sourceBack equal before departure. Browser correctly retains the added forward document entry; corrected expectation is +1. It was not an application defect. Corrected run passed.

Not tested: physical devices, screen-reader speech, production/load, learning effectiveness. No concurrency pressure or denied process inspection retried. No mastery inference, scoring or profile storage exists in inspected code. No independent runtime or science blockers remain. This is an explanation/access/navigation acceptance, not evidence of learning or a whole-site certification.


## Final narrow repair evidence

`acceptance-focus.cjs/json`:13 focused rerender paths at320px with32px root font (200%): English/Chinese summary, answer reveal, canonical inspect and source link across locale rerender; shared projection/rates/travel switches; ordinary power-route rerender. All preserve the intended logical focus and viewport intersection, open state where applicable, and320px page width. The stable help/summary DOM identities survive. Real language clicks retain the language button focus rather than being stolen. Travel clears the non-applicable answer reveal. Playing-help toggles preserve playing=true and do not rewind the model. No page errors. The final screenshot is `acceptance-focus-final-320200.png`.

Ready-run keyboard focus immediately after full document Back was measured at320px; full-document navigation may reset injected root-size CSS, so its rectangle alone is not used as200% evidence. The final focus suite sets32px root font and stays in the same document throughout; this provides the actual200% focused-rerender evidence. Earlier bilingual layout cases explicitly reset root font before each locale's route checks.

Final code reading confirms the response plain-language model-scope note precedes canonical free-spring background cards; canonical boost and pwm→boost edge both state approximate averaged small-ripple relation and0<D<1. Buck retains its ideal averaged CCM relation. Bayes explicitly qualifies observation-probability likelihood as discrete. Self-check is restricted to motion/kinematics and its explicit view switch preserves phase without silently selecting a snapshot.

P2 remains optional deeper n/k indexing/probability/covariance/derivations in their owning lessons. No additional quiz count, forced prerequisite or learning tracking is required for this bounded request. Handoff documentation and cumulative owner regression outcomes are owned by the parent and are not asserted as independently rerun here.
