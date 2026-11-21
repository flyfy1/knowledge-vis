# BRIEF — how-chromium-renders-a-web-page

Author: Antigravity (gemini-flash-worker-agy, thinking: on, effort unavailable; planner: gemini-pro-orchestrator-neon, thinking: effort=1.00), 2026-11-21. Task: W8 of the Software Core Principles series (`computing/software/how-chromium-renders-a-web-page/`).
Status: unregistered draft (`page.json` omits `"status"` and `"order"`, expecting the draft build warning). Complete bilingual essay (`content.zh.md` and `content.en.md` authored together; no `"languages": {"en": "stub"}`).

## Essay question

When a browser runs `el.style.transform = 'translateX(120px)'` or renders a page at 60 Hz (`16.67 ms`) or 120 Hz (`8.33 ms`), what actually happens across **Blink** (Renderer Main Thread), **`cc`** (Compositor Thread), and **`Viz`** (GPU Process)? Why does `transform`/`opacity` stay smooth even when main-thread JavaScript stalls for 200 ms, why can an overlapping shadow or badge trigger layer explosion, and how does Chromium's 2026 **RenderingNG** pipeline turn HTML+CSS bytes into a display swap frame?

## Pinned release & browser verification target

- **Architecture target**: Chromium **RenderingNG** (`Blink` under `third_party/blink/renderer/core/`, `cc/` compositor, and `components/viz/` display service, 2026 architecture).
- **Provisional host Chromium milestone**: `151.0.7922.34` (Playwright `chromium` r1234 declared in `~/fast/integ-life/integ-games/node_modules/playwright-core/browsers.json`). Note: `tools/crosscheck.cjs` and `tests/browser.cjs` were authored and syntax-checked (`node -c`), and are intentionally left for the coordinator to run serially with Playwright to confirm exact live `chromium.launch().version()` and execute live DOM/reflow/transform/feature checks.

## Chapter ladder & models

11 chapters (`#ch1`..`#ch11`), 9 interactive canvas models (`ch2-model`..`ch10-model`), 8 static inline-SVG diagrams (`dg-*`), 1 minimal code block (`ch1-code`), and 3 closing diagnostic questions (`.qs`):

1. **The multi-process map and RenderingNG (`#ch1`)** — Law: Chromium isolates markup/scripts on the Renderer Main Thread (`Parse → Style → LayoutNG → Pre-Paint → Paint`), moves tiling and property-tree matrix updates onto `cc`, and aggregates surfaces inside the separate `Viz` GPU process. Diagram: `dg-pipeline`. Code: `ch1-code`.
2. **Byte stream to DOM & CSSOM: why scripts and styles block (`#ch2`)** — Law: `HTMLDocumentParser` builds DOM incrementally, yet synchronous `<script>` stalls tokenization until download, preceding render-blocking CSSOM, and execution complete—mitigated by `HTMLPreloadScanner`, `defer`, `async`, and ES modules. Diagram: `dg-parse`. Model (`ch2-model`): `simulateParseTimeline`. Limits: omits TCP/TLS handshakes, UTF-8 chunk boundaries, `document.write()` re-entry, and non-blocking `media` attributes.
3. **Style calculation: right-to-left matching & `InvalidationSet` (`#ch3`)** — Law: `SelectorChecker` evaluates rules from rightmost key selector using `RuleHash` buckets and an O(1) ancestor Bloom filter (`SelectorFilter`), while class toggles narrow recalculation via `InvalidationSet`. Diagram: `dg-style`. Model (`ch3-model`): `simulateStyleCalc` (builds synthetic DOM + rules + 24-bit ancestor Bloom filter and executes real matching counts). Limits: omits specificity resolution, `var(--x)` inheritance, upward `:has()` invalidation, and Shadow DOM boundaries.
4. **LayoutNG & forced synchronous layout thrashing (`#ch4`)** — Law: LayoutNG computes immutable `PhysicalBoxFragment` outputs from `ConstraintSpace` inputs for clean-subtree caching; interleaving `style.width` writes with `offsetHeight` reads forces synchronous reflows mid-JS. Diagram: `dg-layoutng`. Model (`ch4-model`): `simulateLayoutThrashing`. Limits: omits HarfBuzz text shaping (`InlineLayoutAlgorithm`), multi-pass flex/grid sizing fallbacks, and hardware-specific microsecond timings (`1.8 µs/node` parameterized).
5. **Pre-Paint & the four Property Trees (`#ch5`)** — Law: `PaintPropertyTreeBuilder` separates `Transform`, `Clip`, `Effect`, and `Scroll` state so `transform`, scroll, and `opacity` edits mutate 1 node in `cc` without rerunning Layout or Paint. Diagram: `dg-proptrees`. Model (`ch5-model`): `evaluatePropertyTrees`. Limits: omits 3D `preserve-3d` perspective divide, rounded-rect RRect clips, and `isolation: isolate` nodes.
6. **Paint records & layerization: the layer explosion trap (`#ch6`)** — Law: Blink records vector `PaintRecord` chunks squashed by `PaintArtifactCompositor`, unless a composited element underneath (`z-index: 1`) overlaps clipped cards above (`z-index: 2`), blocking squashing via `MightOverlap` and exploding VRAM. Diagram: `dg-layers`. Model (`ch6-model`): `simulateLayerization`. Limits: omits `DecompositeClip`/`DecompositeEffect` hoisting, `devicePixelRatio` texture scaling (4×/9×), and `SolidColorDrawQuad` fast paths.
7. **Tiling, OOP-R rasterization, Pending/Active trees & checkerboarding (`#ch7`)** — Law: `cc::TileManager` slices layers into `256×256` (`256 KiB`) or `512×512` (`1 MiB`) tiles rasterized onto `PendingTree` before swapping to `ActiveTree`; fast scrolls outpacing raster throughput expose checkerboards unless covered by OOP-R GPU raster or Skewport lookahead. Diagram: `dg-trees`. Model (`ch7-model`): `simulateTileRaster`. Limits: omits low-resolution fallback tile tiers, tile memory eviction limits, and cold-start idle raster.
8. **Viz `CompositorFrame`, `SurfaceAggregator` & scanout (`#ch8`)** — Law: Browser chrome, main frame, and cross-origin `<iframe>` (OOPIF) renderers submit `viz::CompositorFrame`s of `DrawQuad`s; `Viz`'s `SurfaceAggregator` resolves `SurfaceDrawQuad`s and occlusions into one screen pass while decoupling `BeginImplFrame` from `BeginMainFrame`. Diagram: `dg-viz`. Model (`ch8-model`): `simulateVizFrame`. Limits: omits `SynchronizationToken` deadline fallbacks, hardware MPO overlays, and off-screen blur passes.
9. **Main-thread jank vs. compositor isolation (`#ch9`)** — Explicitly reuses Chapter 4 layout cost, Chapter 5 property trees, and Chapter 8 `8.33 ms`/`16.67 ms` VSync deadlines. Model (`ch9-model`): `simulateAnimationIsolation` comparing `transform` (1 stage, immune to JS spikes) vs `box-shadow` (3 stages) vs `left` (5 stages). Limits: explicitly warns that JS `requestAnimationFrame` loops mutating `style.transform` still block on main-thread JS stalls unlike declarative CSS / WAAPI animations.
10. **Where the frontier is (November 2026) (`#ch10`)** — Separates Established (RenderingNG architecture, main/impl isolation), Already Built (Skia Graphite on Dawn/WebGPU shipped starting Chrome 135 Apple Silicon April 2025 with ~15% MotionMark 1.3 uplift, extending desktop trials in Chrome 136–140+; compositor-thread Scroll-Driven Animations Chrome 115+ / 133; Cross-Document View Transitions Chrome 126+ & Interop 2026; Speculation Rules prerendering), and Open Frontiers (`prerender until script` origin trials, two-phase MPA transitions, mobile tile memory ceilings). Model (`ch10-model`): `simulateFrontierPipeline`.
11. **Wrap-up: ask three questions first (`#ch11`)** — 3 DevTools triage questions (`.qs`), `.sum`, and live cross-links to `[[how-threejs-draws-a-scene]]`, `[[how-a-gpu-computes#ch9]]`, `[[how-pixels-reach-a-screen#ch1]]`, and `[[how-pixels-reach-a-screen#ch3]]`.

## Tuned parameters

- `ch2`: `headChunk1End = 2 ms`, `headChunk2End = 16 ms`, `bodyParseMs = 12 ms`, JS split `60%` fetch / `40%` exec; defaults `cssMs = 30`, `jsMs = 70`, `preload = true`.
- `ch3`: `BITMASK_MOD = 24` Bloom bits, synthetic 5-level DOM (`180` default nodes, `250` rules), parameterized `0.002 ms/node + 0.00018 ms/keyCheck + 0.00045 ms/ancestorWalk`.
- `ch4`: `NODE_LAYOUT_US = 1.8 µs/node`, `BLINK_WALK_MS = 0.015 ms`, uncontained dirty fraction `0.65`; defaults `itemCount = 50`, `treeNodes = 300`.
- `ch5`: base element `(70, 60, 110, 64)`, clip `(36, 32, 248, 148)`; defaults `tx = 60`, `scrollY = 40`, `opacity = 0.85`.
- `ch6`: viewport width `960`, badge `220×120` RGBA8; defaults `cardCount = 20`, `cardSizePx = 280`, `badgeMode = 'promotedBelow'`, `overlap = true`.
- `ch7`: layer `1024×3072`, viewport `1024×768`, raster budget `4.0 ms/frame`, `256` tile `0.25 ms` OOP-R vs `1.8 ms` CPU, `512` tile `0.75 ms` OOP-R vs `4.0 ms` CPU; defaults `scrollSpeed = 3600`, `tileSize = 256`, `oopRaster = false`, `skewportRows = 0`.
- `ch8`: `implAggMs = 1.2 + 0.4 * oopifCount`; defaults `120 Hz`, `mainThreadMs = 14`, `rasterMs = 3`, `oopifCount = 2`.
- `ch9`: two deterministic JS long-task spikes (`t = 400 ms`, `1100 ms`) over `1.6 s`; defaults `transform`, `120 Hz`, `jsSpikeMs = 50`, `domBoxes = 250`.
- `ch10`: Ganesh `0.014 ms/cmd` (`38%` overdraw) vs Graphite `(cmds/workers)*0.009 + 0.4 ms` (`4%` overdraw, `34%` rejected by 2D depth test), cold nav `95 ms` vs prerender `12 ms`.

## Frontier sources & dates (Facts that will go stale)

- **Skia Graphite + Dawn**: Google Chromium / Chrome blog ("Introducing Skia Graphite: Chrome's rasterization backend for the future") and Chrome 135 Apple Silicon rollout (`April 2025`, ~15% MotionMark 1.3 improvement), followed by Chrome 136–140+ desktop field trials (accessed via web search `2026-11-21`).
- **Scroll-Driven Animations**: Chrome Platform Status (`chromestatus.com`) — shipped `Chrome 115+`, `Animation.overallProgress` in `Chrome 133`, cross-browser Baseline 2025–2026 (accessed `2026-11-21`).
- **Cross-Document View Transitions**: Chrome Platform Status — shipped same-origin MPA `@view-transition { navigation: auto; }` in `Chrome 126`, Interop 2026 focus with `activeViewTransition` and `waitUntil` (accessed `2026-11-21`).
- **Speculation Rules API**: Chrome Platform Status & `developer.chrome.com` — shipped prefetch/prerender, origin trials including `prerender until script` (accessed `2026-11-21`).

## Checked / not checked

- **Checked (Node)**:
  - `node computing/software/how-chromium-renders-a-web-page/tools/diagrams.cjs` (8 SVGs generated).
  - `node scripts/build-pages.cjs computing/software/how-chromium-renders-a-web-page` & `--check` (443 keys/lang, 11 chapters, 9 refs, 46 bound numbers, 0 errors, draft warning only).
  - `node scripts/build-pages.cjs --print-budgets computing/software/how-chromium-renders-a-web-page` (all SVG labels <= 90%, 0 overlap/clip errors).
  - `node computing/software/how-chromium-renders-a-web-page/tests/models.cjs` (all model math, branch coverage, zero `undefined`, `unprefill`, CJK hygiene, Guardrails 1 & 2, and alias/ID collision checks).
  - `node -c` syntax checks on `models.js`, `bindings.cjs`, `app.js`, `tools/diagrams.cjs`, `tools/crosscheck.cjs`, `tests/models.cjs`, `tests/browser.cjs`.
- **Not checked in this builder run (deferred to serial coordinator Playwright pass)**:
  - `tools/crosscheck.cjs` (Playwright live Chromium reflow/transform/feature checks and `browser.version()` confirmation).
  - `tests/browser.cjs` and `tests/canvas-text-overlap.cjs --sweep` (live rendering, visual screenshots, and 1280/390/320 canvas sweeps).
