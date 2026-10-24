# Author self-check — candidate 363-author-v1

Status: complete author candidate, ready for separate independent review.
No independent acceptance, LeetCode submission result, novice learner result,
registration or deployment is claimed. All writes are lesson-local.
Official statement and Python selector evidence: provenance/official-graphql.json.
Approved reused design: specs/reviews/leetcode-all-hard-design-review.md;
implementation brief written before source implementation: BRIEF.md.

## Actual checks

- `python3 -B leetcode/363/tests/test_solution.py`: passed 1,528 feasible
  exhaustive/seeded small cases against direct rectangle-cell enumeration.
  Input nonmutation and exact mirror parity passed. Five maximum/long-boundary
  cases passed, including 100×100 with no equality shortcut, zeros, negatives,
  tall input and k=-100000. See tests/evidence/solution-results.json.
- `node leetcode/363/tests/test_core.cjs`: 14,866 intermediate checks passed.
  Independently sum matrix cells for each ending interval; compare every band's
  candidate and running best, prefix history and final global result.
- `node leetcode/363/tests/browser.cjs`: real Chromium, existing preview
  http://127.0.0.1:18770/leetcode/363/. Passed every preset and every row band in
  both languages, initial/end disabled states, full forward/back replay,
  reset, explicit reveal and changed-choice clearing, and locale preservation.
  Hand calculation disclosure, every prediction option, clipboard readback,
  forced clipboard denial/manual selected text, displayed/embedded/downloaded
  exact Python parity, keyboard/focus, working deep links, blocked storage,
  no-network file:// opening and local asset responses passed.
- Widths 320/390/736/1440 and CSS zoom 200% at 1440 were exercised in both
  languages. This is browser layout zoom, not a physical-device or OS zoom test.
  Primary button/select geometry is at least 48×48. Focus outline is solid 3px.
  Forced-color focus and reduced-motion media were exercised.
- Shared + local shipped CSS: 11,486 bytes. Palette contrast over all three
  dark surfaces: minimum tested text role contrast 6.34:1 (bad/panel2;
  this role is unused here), muted/panel2 6.45:1, body text/panel2 13.40:1.
  Orange focus/panel2 is 8.94:1. See browser-results.json for full measurements.
- Copy keys are emitted through tests/build_copy.py, which rejects duplicate
  key definitions before serialization. Each entry has both languages.
  Semantic browser checks explicitly compare threshold/choice feedback in both
  locales and distinguish it from manual-clipboard recovery text.

## Visual inspection

Opened and inspected screenshots en-320-trace.png, zh-390-trace.png,
zh-320-trace.png, en-zoom200.png, zh-zoom200.png, en-desktop.png,
and zh-prediction.png using the image-view tool. Matrix columns retain equal
width; input cells, column labels, prefix values and history remain readable.
Controls wrap without label clipping. The prediction retains the learner's
selected wrong answer while showing why the eligible minimum is correct.
No actual learner comprehension is inferred from these author observations.

## Metadata gate

From repository root:
`python3 -B scripts/register_leetcode_lesson.py 363 --validate-only`
Result: exit 0, no output. No registration performed. Complexity is a single
nonempty string with actual time and auxiliary space. Related targets exist.
Metadata is frozen with the rest of this new candidate in candidate.json;
independent review remains pending for this exact candidate.

## Verification limits

No physical phone, screen reader session, production delivery, or independent
cold walkthrough was performed. Browser diagram snapshots simulate a selected
row band; only the Python tests execute the canonical submission interface.
The sorted-list implementation's linear insertion cost is taught explicitly;
it does not claim balanced-tree complexity or asymptotic superiority to the
2D-prefix enumeration baseline. Shared assets and registries remain unmodified.
