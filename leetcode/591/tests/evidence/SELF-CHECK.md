# #591 author self-check — candidate 1

Date: 2026-10-25. Status: ready for separate independent review, not accepted or published.
Scope: only leetcode/591/. Existing preview: http://127.0.0.1:18780/leetcode/591/.
Candidate identity: candidate.json hashes of source, metadata, provenance and tests.
No registry, shared assets, campaign/review records, services, credentials or Git configuration changed. No submission, commit, push, deployment or sub-agent run.

Official source: provenance/official.json is the dated successful public GraphQL
capture of all statement rules, three examples, constraints and complete observed
codeSnippets. Official URL also opened. Python3 interface explicitly observed:
Solution.isValid(self, code: str) -> bool. Python is the preferred faithful language;
no non-Python contract or conceptual comparison is needed.

Actual checks:

- `python3 -B leetcode/591/tests/check.py`: 26,177 unique inputs against an independently derived recursive grammar oracle; 3 official examples, 21 explicit boundary cases including the transfer exercise and 500-character inputs, exhaustive alphabet `<>/Aa` lengths 0–6, fixed seed 591 structured and perturbed strings. Canonical Python executed, not emulated. JS model agrees on all cases. 70,202 intermediate snapshots checked: token spans, cursor monotonicity, before/after stacks, legal names, matching pops, first CDATA terminator, and terminal states.
- `node leetcode/591/tests/browser.cjs`: real Chromium, 78 rendered frames across every preset in each locale, expected stack/cursor/history/verdicts, forward/back/replay/reset/end and keyboard range endpoints. Fresh prediction: every choice, reveal, change invalidation and language preservation. Native browser clipboard write/read matched source, forced denial selected the complete manual fallback, displayed textContent and downloaded file equal canonical source including final newline. Internal links and anchors, blocked storage, file:// offline source display, forced colors, reduced motion, local request/error audit, focus and 320/390/736/1440 layouts passed. No console or asset errors.
- `node leetcode/591/tests/accessibility.cjs`: 200% Chromium CSS zoom at 320/390/1440 in both languages, native keyboard scrolling of the operation table, visible controls at least 48px high, and both rendered invariant explanations passed. No document overflow. Zoom is CSS reflow testing; real hardware and OS browser zoom are not claimed.
- Exact dictionary pairs and duplicate keys checked before object parsing. One shared locale consumer; all dynamic explanations translate through it. Locale changes retain cursor, preset, selected answer, reveal and copy/fallback state.
- CSS shared + local = 11,498 bytes. Measured palette contrast report in browser.json: all checked text/background pairs >= 6.3469:1; actual muted text on panel2 = 6.4494:1, primary button text = 13.1007:1 (inverse of accent/bg). Focus accent2 against panel2 = 8.9371:1. Disabled controls have no opacity loss and use muted/panel2. See browser.json for every measured pair.
- Metadata preflight command (repository root): `python3 -B scripts/register_leetcode_lesson.py 591 --validate-only`. Exit 0, no stdout/stderr; full dated receipt in preflight.txt. No registration performed. Complexity is one string with both time and space. Candidate frozen after fixes; independent review still required.

Visual inspection: author opened screenshots for both languages, mobile/736/desktop
traces, mismatch stacks/ledger, prediction focus, zoomed traces and phone/desktop
zoomed headers. Text wraps; stack values and token spans remain readable. The
operation ledger intentionally scrolls horizontally rather than splitting English
words into narrow columns; a bilingual hint and keyboard focus support this.
The selected mismatch token is boxed, consumed prefix underlined; these encode
different quantities. After rejecting </A>, the stack remains [A,B] and cursor
remains 6, not 10. CDATA example consumes 26/26 and finishes true. Two-root input
consumes only the first 7/14 characters, then rejects trailing content.

During authoring, an overly strong intermediate invariant assertion was corrected:
a root-closing frame may have an empty stack with remaining input; the following
check rejects it. The rendered explanation now names this timing explicitly.
Recursive oracle matching uses a regex start-position argument, avoiding repeated
suffix copies in its stated linear baseline. Phone table and 320px/200% header
wrapping were improved after inspecting evidence. One browser rerun encountered
an unstable smooth-scroll/zoom test wait and closed before completion; the final
harness uses reduced motion and immediate positioning for deterministic capture,
and the final complete run passed. This was not an independent review finding.

Limits: no separate review, actual learner teach-back, LeetCode acceptance,
production delivery, real-device/assistive-reader testing or measured speedup is
claimed. Independent reviewer should use the frozen six-dimension rubric in the
repository and begin with a source-blind walkthrough. The author run stops here.
