# #847 author self-check — 2026-10-26

Status: author self-checked; separate independent lesson review pending. Candidate `847-r1` is identified by `candidate.json`. Author: Codex; exact model ID unavailable. No independent score, actual novice comprehension, LeetCode submission acceptance, registration, deployment or public-delivery claim. Only `leetcode/847/` was authored.

## Official source and interface
Public official page and GraphQL verified; `tests/evidence/official.json` contains the complete response, statement, examples, constraints and language snippets. Access URL/query/date and Python3 selection are in `official-access.json`. Python3’s actual interface is `Solution.shortestPathLength(self, graph: list[list[int]]) -> int`. Python selected under the preference policy; a non-Python language contract is not applicable.

## Reproduce
From the repository root, with installed browser dependencies available through NODE_PATH:

```sh
python3 -B leetcode/847/tests/check.py
node leetcode/847/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 847 --validate-only
```

Both test runners accept `EVIDENCE_DIR=/absolute/output/directory`; results and screenshots then go there without modifying the candidate. Browser runner uses `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set and the already-running http://127.0.0.1:18770 preview. No server is started. Python uses `-B` to avoid bytecode writes.

Actual checks and outcomes:

- Numerical runner passed: 962 canonical Python cases; exhaustive all 772 connected labeled graphs n=1..5; 180 seeded graphs n=2..8; both official examples; path/star/clique/cycle at n=2 and n=12. Inputs unchanged. Independent oracle uses Floyd-Warshall distances and subset dynamic programming over metric-closure visit orders, rather than the canonical state BFS. Concatenating metric paths constructs a legal covering walk; ordering a walk’s first visits bounds the oracle in the other direction. Baseline walk enumeration agrees on 44 exhaustive n≤4 graphs; the actual displayed baseline is executed too.
- Browser numerical core passed 890 cases, 4,342 frames and 43,039 states. Checks cover legal predecessor edges, mask OR, exact-length witnesses, globally unique state pairs, earliest pair distances against an independent exact-length walk-set enumeration, layer completeness, result and cumulative accounting. Single-node terminal frame included.
- Source parity passed: canonical bytes = JSON mirror = rendered textContent = automatic copied string = all downloaded bytes. Four native fallback transfers (two per locale) each seeded and read a fresh non-source clipboard sentinel, denied only automatic write, verified full focus/selection, dispatched Linux Control+C, and read back the exact source including final newline.
- Real Chromium 156.0.8078.4 on Linux: both locales and all five presets; every forward/back/replay state; reset/jump/endpoints; manual walk/undo/reset; all three predictions with explicit reveal then change; locale roundtrip preserves graph, layer, prediction, reveal and source disclosure. Rendered H1/document title exactly match metadata and ID. Visible formula and a known state identity/mask/set pair checked. Locale key uniqueness uses Acorn syntax-tree inspection before evaluation, plus two-string shape and placeholder agreement.
- Widths 320, 390, 736, 1440 in both languages; desktop CSS zoom2 in both. No document overflow; dense state text geometry checked and screenshots inspected. Closed selected preset text measured using actual computed font, padding and a conservative 24px arrow allowance; smallest measured reserve 54px. All tested buttons/select/choice labels/download targets ≥48px tall. Keyboard native radio arrows, Enter activation, navigation landing below sticky bar, and 3px focus ring tested. Forced-colors and reduced-motion paths exercised.
- Offline `file://` source rendering and locale/search operation passed with both localStorage methods throwing. Runtime requests stayed local. No console/page/HTTP asset errors. Source code intentionally scrolls horizontally in its keyboard-focusable panel on phones.
- Actual solid rendered text/background contrast measured with calibrated sRGB helper: primary text ≥13.39:1 across observed surfaces; muted disabled/state text minimum 6.449:1 (above AA, below preferred 7:1 target); other muted text 7.079:1 and above; correct feedback 10.005:1. Focus orange against panel2 exceeds3:1. Calibration includes black/white21, primary color luminances and #747474-on-black4.492948 (must fail4.5). Measurements are scoped to solid text pairs; SVG visual meaning was inspected and has textual equivalents.
- Shipped CSS = 9,425 shared + 2,514 local = 11,939 bytes (<25,000). Exact shared palette reused. No fonts, images or runtime dependencies fetched externally.
- Related links were followed in both locales in the preview: #773 step2 teaches unit-cost BFS layers; #815 step2 teaches layers counted in bus boardings and one-time route expansion. Rendered destination titles/excerpts are in browser.json. Preview availability is verified; future production release must verify those routes in its actual release set.
- Root metadata command `python3 -B scripts/register_leetcode_lesson.py 847 --validate-only` exited0, stdout/stderr empty; `tests/evidence/preflight.json` records command, cwd, date and result. No registration run.

## Screenshot inspection
Author visually opened all 18 final PNGs listed in browser.json: hand walk and prediction in each language; five-node layer2 graph at320/390/1440 in both; dense state cards and source at320 in both; CSS zoom200 in both; keyboard focus and forced colors. Graph node numerals and edges remain distinct, state labels wrap without colliding with their causal rows, source uses deliberate horizontal scrolling, and set braces now render once. Sticky navigation can cover content above the settled capture region; it does not intersect the inspected essential diagram or state card. Zoom images show enlarged type and intact graph geometry.

## Author iteration and limitations
`browser-initial-harness.txt` preserves the initial harness failures: clicking the legitimately disabled one-node End button, racing asynchronous clipboard completion, and a multi-element screenshot locator. These were harness issues; final full rerun passed unchanged runtime behavior for those cases. Initial visual inspection also found duplicated literal set braces; copy was fixed before final freeze and rendered state assertions now require single braces. Frame timing was clarified before freeze to mean complete layer discovery, before that layer’s expansion.

Headless Linux desktop emulation and CSS zoom2 do not establish physical phone behavior, native OS browser zoom, screen-reader usability, learner comprehension, independent teaching acceptance or production delivery. No runtime workflow status copy is shipped. Next step: separate reviewer cold-walks frozen candidate using the six-dimension rubric, then audits BRIEF/source/evidence; any required fix becomes a new candidate.
