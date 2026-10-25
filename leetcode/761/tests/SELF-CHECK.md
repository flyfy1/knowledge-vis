# #761 author self-check — ready for independent review

Date: 2026-10-25 (Asia/Singapore). This is the author run only. No independent
lesson acceptance, actual learner result, LeetCode submission or deployment is
claimed. The design approval is the reused pattern's existing adjudication.
All authored files are inside `leetcode/761/`; no registry/shared/campaign edits.

Official evidence: `evidence/official.json` retains the full public GraphQL
response, access timestamp, exact official URL, statement, constraints, both
examples, all observed language selectors and callable snippets. Python3 is
available as `Solution.makeLargestSpecial(self, s: str) -> str`; canonical Python
was selected. No non-Python language exception applies.

Executed from repository root:

- `python3 -B leetcode/761/tests/check.py` — PASS: 302 canonical cases; exhaustive
  special strings through length 12, 100 seeded length-14 cases, official and
  fresh transfer examples, length-50 boundaries. Independent legal-move BFS,
  18,238 trace frames, 303 distinct return-invariant oracle inputs, specialness,
  prefix balances, block construction, ordering, idempotence and exact mirror.
- `node leetcode/761/tests/browser.cjs` — PASS on Chromium 156.0.8078.4, Linux.
  All events of all five presets in both locales; every forward/back/forward
  state; reset/end disabled endpoints; all three prediction choices with reveal,
  changed-answer clearing and language/preset preservation; static copy binding
  and AST duplicate-key detection. Both locale source displays, clipboard success,
  forced fallback, real Control+C replacing a non-source sentinel, and downloaded
  bytes match solution.py exactly, including its final newline.
- `python3 -B scripts/register_leetcode_lesson.py 761 --validate-only` — PASS,
  exit 0, empty stdout/stderr. Safe metadata preflight; no registration performed.
  Receipt in `evidence/preflight.json`.

Browser evidence: `evidence/browser.json` and focused/full screenshots. Tests
covered 320/390/736/1440px in both languages, 200% CSS layout zoom at 390/1440px,
native select text fitting, balanced-cell dimensions, keyboard Enter/Tab and
3px visible focus, forced colors/reduced motion, deep-link targets, local-file
source/trace and blocked storage. No page errors, HTTP asset errors or external
asset requests. Total shipped CSS 10,779 bytes. Measured text contrast
13.40–16.09:1; muted text minimum 6.45:1; accent minimum 10.91:1; orange focus
against panel2 8.94:1. Disabled controls use readable muted text on panel.

Visual inspection: opened full EN/zh layouts, narrow trace/ledger captures and
both-language 200% zoom ledger captures, plus desktop trace/zoom. Prefix bits
and corresponding balances remain paired as the ledger wraps (4+2 cells at
320px; 2+2+2 at 390px/200%). Zero boundaries have a visible numeric zero and
orange underline. Call input, returned child, rebuilt parts and scoped counters
remain associated. Full-page capture scaling is supplemented by focused captures.
Sticky navigation scrolls horizontally on narrow screens; surrounding text
partly above it in a scrolled screenshot is normal viewport clipping. Deep-link
landing geometry was checked separately. The explanatory diagram has no omitted
branches or transitions. Manual-copy textarea is scrollable and preserves source.

Author-discovered repairs are retained in `evidence/browser-first-run.txt`:
shared .btn specificity left 46px controls; descriptive select labels clipped at
390px/200%. Local 48px class override and bounded numeric select fixed these;
the complete final browser run passed. This is not reviewer finding closure.

Limits: browser viewport emulation and CSS zoom, not physical phones or native
browser zoom; no screen-reader audio session, novice teach-back, public delivery,
or independent teaching review. Next action is a fresh reviewer cold walkthrough
of the frozen candidate, followed by the repository's separate review gates.
Reproduction commands and configurable output directory: `tests/README.md`.
Candidate hashes: `evidence/candidate.json`. The complete browser run is bound
to `evidence/candidate-browser.json`. After that run, only the step-2 prose
reference changed from “official preset” to its exact displayed value “11011000”;
`node leetcode/761/tests/prose-check.cjs` passed both locales, selector binding,
result 11100100 and focused screenshots. Numerical code, UI state and metadata
are unchanged. This final prose correction is included in the new frozen candidate.
