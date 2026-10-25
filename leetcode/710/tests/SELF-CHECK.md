# #710 author self-check — candidate v4

Scope: one authored bilingual lesson; separate review pending. No LeetCode
submission, learner study, registration, deployment or independent acceptance.
Candidate identity: candidate-sha256.json binds canonical source, runtime assets,
metadata, brief, provenance and tests, plus read-only shared dependency hashes.
Official statement and Python3 starter interface: ../provenance/official.json,
public official GraphQL response with exact query and timezone-qualified access
stamp. Only normal public access used.

## Executed checks

- `python3 -B leetcode/710/tests/test_solution.py`: PASS, 2528 enumeration-oracle
  cases, including all blacklists for n=1..9 in forward/reverse orders and 500
  seeded shuffled inputs. Actual Python constructor/pick interface executed;
  no input mutation; forced every ticket exactly once; exact allowed-value
  multiplicities, dictionary domains/targets and one random API call per pick.
  Maximum n=10^9 and b=100000; consecutive 99999 blocked high candidates;
  sole allowed value; 20000 forced calls; seeded official-output-set smoke test.
- `node leetcode/710/tests/test_core.cjs`: PASS, 2032 cases / 14771 intermediate
  states. Independent allowed-set/unique-output/range invariants, cursor changes,
  log prefixes, skip/assign transitions, immutable snapshots, all presets, exact
  Python mirror including final newline, AST duplicate-key detection and all 93
  bilingual copy-pair shapes.
- `node leetcode/710/tests/browser.cjs`: PASS, real Chromium on Linux. Both
  locales, all six presets, every operation and backward/replay identity, reset,
  finish and disabled endpoints, every completed ticket, hand tickets, all quiz
  options, explicit reveal, choice-change invalidation, locale roundtrips and
  independent-experiment isolation. Exact rendered, embedded, auto-copied,
  manually copied and downloaded canonical Python, including final newline.
  Manual copy uses a distinct non-source sentinel, actual Control+C and native
  clipboard readback, not DOM selection alone. Storage denial and file:// offline
  source/trace tested. All local links/fragments resolve. No page/console errors,
  missing assets or external runtime requests.
- `node leetcode/710/tests/accessibility.cjs`: PASS, all 24 closed selected
  labels (six presets × both locales × 320/390px), disabled primary/secondary
  colors and contrast, keyboard scrolling of accumulated ledger and source.
- Browser widths 320,390,736,1440; 200% Chromium CSS rendering zoom at desktop;
  keyboard focus/Tab/Enter/native select; native disabled states; 48px control
  geometry; actual sticky deep-target geometry; reduced-motion and forced-color
  states. CSS rendering zoom is not a claim about a physical device or OS zoom.
- Shared + local shipped CSS: 11496 bytes (see browser-results.json for exact
  measured final byte count); under 25000. Exact inherited colors, no new palette,
  fonts, remote assets or runtime dependencies. Text pairs and focus/field
  boundaries measured from actual computed styles. Main text contrasts exceed
  7:1, disabled text also exceeds 7:1. Detailed numbers in browser/accessibility
  JSON results; focus and field boundaries exceed 3:1.

Results are in evidence/{python,core,browser,accessibility}-results.json. Every
runner accepts LESSON_OUTPUT_DIR, so reviewers can rerun without changing the
frozen folder. Commands and environment requirements are in README.md.

## Visual inspection and meaning checks

Author visually inspected the screenshots in evidence/: all four widths in
both locales for a completed map and a skipped blocked candidate, both zoom
captures, forced colors, hand case, quiz explanation and source/fallback in both
languages, plus focused narrow domain captures. Checked readable association of
real values with low/high and allowed/blocked labels, pending outputs, retained
map/ledger and selected output 6. At high-skip event 2/8, remap[0]=3 is retained,
4 is visibly blocked and skipped, ticket1 stays pending, high=5; at completion
2/2 holes are repaired, 0→3,1→6,2→2. The fresh quiz correctly skips 6, uses 7
once, and assigns probability 1/5; the wrong 2/5 claim counts a high ticket that
is never drawn. Source and algorithm explanations stay distinct from manual-copy
feedback in both locales. Native selects use the shared system font stack;
font availability on other hosts has not been tested.

Tall stage element screenshots can capture the sticky navigation over the top
edge of a stage after automatic screenshot scrolling. This capture artifact does
not imply intersecting diagram labels; focused-domain captures contain the whole
populated diagram without the overlay. The actual navigation target is separately
checked against the sticky nav geometry. The operation ledger intentionally has
contained vertical scrolling; the source intentionally has horizontal scrolling.
Both are focusable and were scrolled with actual keyboard actions.

## Repairs and harness history (author run, no prior independent review)

1. Draft v1's English preset “Consecutive blocked high values” clipped at 320px:
   measured ink 243.76px + 30px padding + 24px native-arrow allowance > 256px
   control width. Historical screenshot v1-clipped-select-320-en.png retained.
   v2 label “High-value skips” fixes this; full input remains adjacent. Same
   measurement passes final candidate, plus every preset label in both locales.
2. v3 renames the canonical loop item to value to avoid confusing it with the
   mathematical blacklist length b. Mirror regenerated exactly. Numeric blocked
   values use --text with --bad strikethrough, improving contrast with no new color.
3. v4 gives .btn:disabled enough specificity to override .btn.primary: endpoint
   Next now visibly matches disabled End; both remain natively disabled. Initial
   copy permits empty low-hole sets. No numerical logic or metadata changed.
4. Test-harness corrections: the first Python oracle unnecessarily rebuilt its
   excluded set per item and was interrupted; it now builds that independent set
   once. Initial browser assertions assumed identical English/Chinese word order
   and equal numeric-literal counts where Chinese writes “1” and English “one”;
   checks now use expected localized meaning and exact same-locale roundtrips.
   The zoom loop tried to click an already disabled End button; it now resets
   before each locale. A keyboard-scroll assertion ran before the browser's
   scroll animation settled; it now waits for the actual scroll value. These
   were harness repairs, not weakened runtime or source-equality assertions.

## Metadata and review boundary

From repository root: `python3 -B scripts/register_leetcode_lesson.py 710
--validate-only` → PASS (exit 0, no stdout/stderr). Exact command, timestamp and
before/after non-mutation check in evidence/preflight.json. Complexity is one
nonempty time-and-space string. No registration command was run. Metadata has
not changed since its initial passing author candidate. Freeze v4 for a fresh
independent cold walkthrough and six-dimension review; no author self-check
claims acceptance, actual learner understanding or public delivery.
