# Round8 minimal repair design and runtime-baseline evidence review

## Design gate

**ADOPT.** Two data-only changes are the appropriate smallest repair: link the existing complex node to the existing local rotation/multiplication lesson, and clarify the Chinese free-oscillator force wording. English `unforced` was already scientifically correct; expanding it is clarity/parity, not correction of a separate English error. No graph/model/view expansion.

Adding derived edge IDs `from:to` makes the already-used relation identity explicit. Current UI disclosure keys remain unchanged. A small CLI quality check is useful for references, bilingual data, unique IDs and editorial route adjacency; it must not become a new curriculum engine.

Required checking semantics:

- `foundation` remains an explanatory relation, not an automatic strict prerequisite. Route adjacency may use either orientation of an explanatory edge; work-energy → net-force reading order is valid despite the opposite edge direction.
- Only edges explicitly marked `prerequisite === true` enter prerequisite-cycle review. A cycle there should fail with a clear review-required message, not be silently treated as safe. This does not require deleting such edges automatically: an author may have meant co-requisites or used the wrong label.
- If `prerequisite` is present, validate its boolean type. A string such as "true" must not silently bypass the check. Current data has no explicit prerequisite edges.
- A valid general relationship cycle must pass a fixture. A declared strict-prerequisite cycle must fail a fixture. Add no exemption registry, ontology or legacy migration mechanism.
- Uniqueness is a data contract for today's relation IDs. It does not establish that future multiple distinct claims between the same node pair are impossible; a later concrete need could justify a more specific ID. No such abstraction is required now.
- Keep actual generated-DOM local-anchor verification separate from CLI integrity. Power-converters builds sections dynamically, and static initial markup alone is insufficient proof of a missing target.

The design can proceed to implementation without another design gate. Final fix acceptance still needs actual source/CLI checks and the new local complex entry/Back path in both languages.

## Review of the implementer's runtime baseline

Read the actual `atlas-audit/course-runtime.json` and the probe source. This is **review of parent-produced browser evidence**, not independently rerun Chrome evidence. The reviewer did not start a browser.

The48 rows cover45 core registry entries plus gradient-descent, particles-states and day-night-rotation. All48 report HTTP200, no page errors, no failed requests, no duplicate IDs, no390px overflow in English or Chinese, and no potential unnamed visible form controls under the probe's naming heuristic. Every sampled first keyboard focus is visible with at least3px outline. These are useful local baseline signals.

Limits matter:

- The script loads each page at390×844, toggles Chinese/English, and presses one Tab after resetting scroll. It does not exhaust keyboard order, execute each lesson task, validate answers, measure all contrast pairs, or prove320px/200% behavior.
- The probe finds33 pages with at least one unnamed canvas and36 pages with a raw control box below48px height. Those are review queues, not final accessibility violation counts. Checkbox/radio labels can enlarge the clickable target; canvas figures may have textual equivalents but still need meaningful task access. Names alone are insufficient.
- Boundary keyword snippets and links are an inventory of visible text, not scientific validation of a model or source. Finding the word "ideal" does not establish that assumptions are complete or correct.
- English and Chinese layout baselines do not establish that state survives language switching after user interaction. Existing deeper per-feature suites establish only their own cases.
- Public delivery, network/load capacity, physical devices, screen-reader speech and learning outcomes remain outside this evidence.

`runtime-evidence-review.json` records the independently computed summary of those rows.

## Highest-value next baseline task

After these two repairs, choose **one actual pointer-dependent task** and verify a complete keyboard/text alternative instead of mass-adding ARIA names or changing every short checkbox box. The newly linked complex step4 is a natural candidate: its rotate-only preset is a native button and can demonstrate the specific atlas relation, while arbitrary z1/z2 editing currently uses pointer drag in source. Check what a keyboard-only learner can actually vary and read, then decide whether a tiny numeric alternative is needed in a separately scoped repair. Do not claim the current probe has already proved this.

A future focused accessibility round should pair one core learner action with observable completion through keyboard and numerical text, then expand the pattern only after it works. This is higher value than adding more spring routes or graph nodes. The33/36 queues remain recorded, not disguised as whole-site acceptance or automatically converted into an unbounded refactor this round.

## Final actual-repository static recheck

Actual data and validator, not just the stage copy, pass the CLI check:35 nodes,45 edges,eight routes,five groups,85 references,zero explicit prerequisites,zero errors. Actual core fixture suite passes19 checks. `final-static.json` records selected final values and file hashes. Independent adversarial fixtures also verified foundation cycles, explicit cycles in disconnected components/self-loops, and empty optional bilingual objects. The first reviewed validator rejected null records via TypeError. The implementer subsequently added structured object-record rejection; the final actual suite now has21 checks. This did not alter runtime data or models.

The newly exercised complex source exposed a real English320px overflow in the parent's browser run. Actual CSS diff is confined to three existing rules: wrap `.site-head`, allow `.head-main` to shrink/wrap, and allow `.step-inner` to shrink/wrap. It adds no animation or state/model changes and fits the existing layout. Static CSS review passes; repaired rendered behavior remains pending the final browser run.

For this legacy course, many text sizes usepx. Doubling only the root font would therefore be weak evidence. The parent's revised method snapshots all original computed font sizes before applying2× values to each element, so it tests enlarged text without compounding inheritance. The pre-existing button `transition:all` can make geometry evolve while focus testing starts. Waiting for the target's actual animations/transitions to finish is a better timing condition than merely observing height>80px. This is test synchronization, not permission to disable animation or hide a real layout defect. Browser evidence and the original overflow should remain documented separately from this static pass.
