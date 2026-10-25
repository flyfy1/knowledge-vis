# #719 author self-check — final candidate

Candidate: `01a641174b7ef7456ba4e458f15cff8f23f41c1864b06f4b8d6cb8d44dab5696`. Hashes of runtime, canonical source, metadata, BRIEF, provenance and reproducible tests are in candidate-sha256.json; unchanged shared dependencies are separately hashed. This is an author candidate, not independent acceptance.

Official public statement and language selector/interface were observed on 2026-10-25, with a full GraphQL capture in provenance/. Python3 supports the supplied Solution.smallestDistancePair signature. No language fallback or paywall bypass was needed.

Actual final commands, all successful:

- `python3 -B leetcode/719/tests/test_solution.py`: 86077 canonical Python invocations passed; exhaustive ordered arrays, every rank, 300 seeded arrays, official examples, maximum-size closed forms, input preservation, duplicate-key and exact source-mirror checks.
- `node leetcode/719/tests/test_core.cjs`: 19388 scans and 73424 traces passed independently enumerated pair counts, pointer boundaries, interval invariant and strict-shrink checks.
- `node leetcode/719/tests/browser.cjs`: 70 full trace states in two locales; all 7 presets, endpoint/back/replay/reset/end/scrub, all 30 threshold × scan-progress states in each locale, all prediction choices, change/reveal and locale-retention paths passed. Chromium 156.0.8078.4, Linux host. Exact display, clipboard success, actual Ctrl+C manual fallback replacing a distinct sentinel, and download all equal the canonical source including final newline. Storage denial and file-opening/offline source display passed. All local anchors exist. No console, failed request or HTTP asset errors. No external runtime dependencies.
- `python3 -B scripts/register_leetcode_lesson.py 719 --validate-only`: exit 0, no output, run from repository root; receipt in metadata-preflight.json. No registration performed.

Browser layout checks cover both locales at 320/390/736/1440 CSS px and native 200% tab zoom (1440px outer window, 720px inner width, DPR 2 verified via extension chrome.tabs.getZoom). All preset labels measured to fit. Native controls meet 48px dimensions. Forced-colors focus and reduced-motion checks passed. Combined shipped CSS: 11010 bytes.

All 43 final PNGs were opened and visually inspected by the author. Count cards wrap; partial count 3/4 remains distinct from complete C(d). Per-right contributions and cumulative totals remain aligned at 320px. Old interval [0,2], tested 1→1, updated [2,2] and final answer 2 agree in both languages. Search history deliberately scrolls horizontally in a focusable container on narrow screens, retaining its headers. The sticky navigation also uses horizontal scrolling. Header #719 and separate official link, prediction selection plus explanation, disabled dashed controls, selected fallback source, forced-color focus and native zoom screenshots were inspected. No essential state label/value collision observed.

Measured rendered contrast (full foreground/background values in browser-results.json): body explanation 12.62:1; muted hint 7.74:1; selected pair text 10.91:1; disabled text 6.45:1; primary action 13.10:1; column heading 7.08:1; focus against adjacent parent surface 9.81:1. These exceed AA text and focus requirements. Normal core body text exceeds 7:1.

Earlier failures are preserved and explained in tests/README.md. The final candidate includes local target-size and disabled-style fixes, compact preset labels, explicit sorting/self-pair boundary explanations, and the local favicon. Harness header-selector correction did not change runtime behavior.

Evidence limits: author checks only. No independent teaching review, actual learner outcomes, official submission acceptance, physical-device testing or public deployment claimed. Separate reviewer must cold-walk this frozen candidate; no registry, campaign state, historical review or shared file was edited.
