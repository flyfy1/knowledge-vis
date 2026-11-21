---
lang: en
title: How Chromium Renders a Web Page · A Hands-on Essay
desc: Run one line of code—el.style.transform = 'translateX(120px)'—and it glides cleanly at 120 Hz even when main-thread JavaScript stalls for 200 ms. Animate el.style.left instead, or tuck a moving badge behind overlapping cards, and frames drop or VRAM spikes. Tracing Chromium's RenderingNG pipeline (Blink + cc + Viz, 2026 architecture), this essay follows a byte stream all the way to display swap: multi-process isolation, HTML tokenization and preload scanning, right-to-left selector matching and InvalidationSets, LayoutNG immutable fragments and forced synchronous layout, the four Property Trees, PaintRecords and layer explosion, TileManager tiling and checkerboarding, Viz SurfaceAggregator across OOPIFs, compositor animation isolation, and the November 2026 frontier across Skia Graphite and Speculation Rules.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.ms: {v} ms
u.pct: {v}%
u.px: {v} px
u.fps: {v} fps
u.layers: {v} layers
u.nodes: {v} nodes
u.tiles: {v} tiles
u.none: none
u.cmds: {v} cmds
u.pxs: {v} px/s
:::

# How Chromium Renders a Web Page {#hero}

::: strings
kicker: Computing · Software principles · A hands-on long essay
:::

Change one property—<code>el.style.transform = 'translateX(120px)'</code>—and it glides across a 120 Hz screen every {=budget.120} ms;<br>switch that line to <code>el.style.left</code>, and a 50 ms JavaScript task freezes the motion in place. Why does the same browser behave so differently? {.sub}

When you load a modern page, the browser has {=budget.60} ms at 60 Hz—or just {=budget.120} ms at 120 Hz—to turn thousands of HTML tags, CSS rules, and scripts into millions of lit pixels. This essay asks one question: **what actually happens inside Blink, the compositor thread (<code>cc</code>), and the GPU process (<code>Viz</code>) from the moment HTML bytes arrive until a finished frame hits the display?** We trace Chromium's RenderingNG pipeline in execution order: how bytes become DOM and CSSOM across render-blocking rules, how style matching prunes work with Bloom filters and invalidation sets, why reading layout right after writing it forces synchronous reflow, how four property trees let transforms and scrolls bypass layout and paint, how one overlapping animated badge triggers layer explosion, how tile rasterization falls back to checkerboards, how <code>Viz</code> stitches cross-origin <code>&lt;iframe&gt;</code> surfaces together, and why compositor animations survive main-thread jank. {.lead}

Every architectural boundary, stage name, and file path described here reflects Chromium's 2026 **RenderingNG** pipeline (Blink under <code>third_party/blink/renderer/core/</code>, the compositor under <code>cc/</code>, and the display service under <code>components/viz/</code>; local verification targets Playwright Chromium <code>151.0.7922.34</code>). The page loads no external rendering engine: nine hands-on models in <code>models.js</code> implement the underlying algorithms at small scale, while <code>tools/crosscheck.cjs</code> verifies forced synchronous layout, property-tree isolation, and computed transform matrices against live Chromium. For how a 3D canvas issues WebGL or WebGPU draw calls inside the browser, see [[how-threejs-draws-a-scene]]; for what happens after the framebuffer is filled, see [[how-pixels-reach-a-screen#ch1]] and [[how-pixels-reach-a-screen#ch3]]. This essay was written by an AI; the final paragraph of each chapter states what the model leaves out. {.note}

## The multi-process map and RenderingNG {#ch1}

::: strings
toc: Multi-process map & RenderingNG
:::

Chromium never runs JavaScript, layout, and pixel rasterization on the same thread or inside the same process. Untrusted markup and scripts stay inside a sandboxed Renderer Main Thread that produces vector paint records and property trees; the Compositor Thread (<code>cc</code>) tiles and transforms them; and a separate GPU Process (<code>Viz</code>) aggregates surfaces and drives the hardware. {.law}

Picture a three-room newspaper press. Reporters and typesetters edit copy and measure columns inside a soundproof newsroom (the Renderer Main Thread). A layout dispatcher slices approved pages into movable tiles and slides plates along tracks (the Compositor Thread, <code>cc</code>). Downstairs, the bindery merges the main pages with outside inserts before feeding paper to the press (the GPU Process, <code>Viz</code>). Even if the newsroom stalls for half a second arguing over a headline, the dispatcher keeps sliding existing plates smoothly across every beat.

The snippet below triggers both sides of that split. Path A edits one translation node on a property tree; Path B mutates box geometry and immediately queries <code>offsetHeight</code>, pulling Blink into an emergency synchronous layout mid-script.

::: html ch1-code
code.aria: Two DOM updates that take completely different Chromium rendering paths
code: "const card = document.querySelector('.card');\n\n// Path A: Compositor path (skips Layout and Paint)\ncard.style.transform = 'translateX(120px)';\n\n// Path B: Geometry mutation + immediate read triggers Forced Synchronous Layout\ncard.style.width = '360px';\nconst h = card.offsetHeight;"
:::

Beneath your JavaScript, every frame crosses two thread boundaries and one process boundary. Inside the **Renderer Process**, the **Blink Main Thread** steps cleanly through five lifecycle stages: <code>Parse → Style → LayoutNG → Pre-Paint → Paint</code>. Even when Paint finishes, zero pixels exist yet: Blink emits vector drawing opcodes (<code>PaintRecord</code>) plus four **Property Trees**, and <code>PaintArtifactCompositor</code> commits them to the **Compositor Thread (<code>cc</code>)** in the same process. From there, <code>cc</code> slices large layers into raster tiles, packages a <code>viz::CompositorFrame</code>, and ships it over Mojo IPC to **<code>Viz</code>** in the **GPU Process**. Finally, Viz's <code>SurfaceAggregator</code> stitches together the browser chrome, the main page, and any cross-origin <code>&lt;iframe&gt;</code> (OOPIF) processes into one frame for Skia (Ganesh or Graphite) to emit Metal, Vulkan, or Direct3D 12 GPU commands.

::: diagram dg-pipeline keys=dg.pipeline
cap: Figure 1. Chromium's four-tier RenderingNG architecture across threads and processes. Blink produces paint commands and property trees; Viz aggregates and submits GPU work.
aria: Diagram: Browser process, Blink Main Thread, cc Compositor Thread, and Viz GPU Process with IPC and commit data passing between tiers
l1: 1. Browser Process
l1s: Tab lifecycle, network, browser toolbar UI
l2: 2. Renderer Main (Blink)
l2s: Parse → Style → LayoutNG → Paint
l3: 3. Compositor Thread (cc)
l3s: Property matrices, 256×256 tiles, 2 trees
l4: 4. GPU Process (Viz)
l4s: SurfaceAggregator → Skia → Driver
x1: Byte stream / BeginMainFrame
x2: Commit: PaintArtifact + Props
x3: Mojo IPC: CompositorFrame
:::

So when someone complains that a web page is "slow", the first step is separating which tier missed its budget. Spending over {=budget.60} ms in Style or LayoutNG is a main-thread CPU bill; blowing VRAM across dozens of overlapping layers is a <code>cc</code> compositing bill; and scrolling faster than tiles can rasterize is a tile-throughput bill. The next eight chapters walk straight down that pipeline.

This chapter is only the map. Exact millisecond costs depend heavily on CPU speed, GPU architecture, display refresh rate (120 Hz halves the time budget of 60 Hz), and DOM complexity. {.take}

## Byte stream to DOM & CSSOM: why scripts and styles block {#ch2}

::: strings
toc: HTML parsing, CSSOM & blocking
:::

Blink's HTML tokenizer builds DOM nodes incrementally as network bytes arrive, yet a synchronous <code>&lt;script&gt;</code> halts the parser until the script finishes fetching and running—and if an earlier render-blocking stylesheet has not arrived, the script must wait for CSSOM first. {.law}

Suppose you are assembling a numbered instruction manual page by page, and line 4 says: "Stop here until Bulletin #5 arrives, apply every edit inside it to pages 1 and 2, and only then read page 3." No matter how fast your hands move, reading stops dead at line 4 until the courier delivers Bulletin #5.

In Blink, <code>HTMLDocumentParser</code> turns incoming UTF-8 bytes into tokens and attaches nodes incrementally. External stylesheets and scripts obey asymmetric rules: **CSS blocks rendering, not HTML tokenization**, yet if a synchronous <code>&lt;script&gt;</code> appears after a <code>&lt;link rel="stylesheet"&gt;</code>, JavaScript could inspect computed layout or colors via <code>getComputedStyle()</code>. To avoid exposing unstyled garbage, the HTML specification forces Blink to delay executing that parser-blocking script until all preceding render-blocking CSS becomes CSSOM. Placing synchronous scripts right after bulky CSS stalls the whole document.

::: diagram dg-parse keys=dg.parse
cap: Figure 2. Four cooperating tracks once HTML bytes enter Blink. While the main parser pauses on a blocking resource, HTMLPreloadScanner scans ahead to queue downstream fetches early.
aria: Diagram: HTMLDocumentParser, HTMLPreloadScanner, CSSOM-plus-script blocking, and async vs defer execution timing
r1: 1. HTMLDocumentParser (Main)
r1s: Byte stream → tokens → incremental DOM tree
r2: 2. HTMLPreloadScanner (Lookahead)
r2s: Scans ahead to prefetch scripts & CSS early
r3: 3. Sync script + link CSS
r3s: Waits for CSSOM + JS before resuming
r4: 4. defer / async / type="module"
r4s: Parallel fetch; defer runs ordered at DOM end
:::

Chromium softens this stall with a lightweight background lookahead pass: **<code>HTMLPreloadScanner</code>**. Even while the main parser is frozen on inline work or an earlier script, the preload scanner scans raw bytes further down the buffer and starts fetching downstream scripts, stylesheets, and images in parallel. Adding <code>defer</code> (or <code>type="module"</code>) keeps HTML parsing unblocked during download and runs scripts in order right before <code>DOMContentLoaded</code>; <code>async</code> runs as soon as it lands, pausing HTML parsing only for execution if the HTML has not finished yet.

::: lab ch2-model
model.title: Model 1 · HTML parser blocking & PreloadScanner timeline
model.how: Switch the script loading attribute (blocking / defer / async / module), drag CSS and JS durations, and toggle the preload scanner to watch where red parser stalls interrupt HTML tokenization.
ctl.mode: Script mode
mode.blocking: Sync blocking
mode.defer: defer
mode.async: async
mode.module: module
ctl.css: CSS fetch + CSSOM
ctl.js: JS fetch + exec
ctl.preload: Enable HTMLPreloadScanner
cv.aria: Four horizontal timeline tracks showing HTML parsing, CSSOM build, JS download/execution, First Paint, and DOMContentLoaded
leg.parse: HTML parse
leg.css: CSS / CSSOM
leg.js: JS fetch & exec
leg.block: Parser stalled
cv.tHtml: HTML Parse
cv.tCss: CSS / CSSOM
cv.tJs: JS Fetch/Exec
cv.tDcl: DCL
cv.tFp: First Paint
cv.x: Time (ms)
read.fp: First Paint (FP)
read.dcl: DOMContentLoaded
read.blk: Parser blocked
read.pre: Preload saved
say.blockingCssWait: JS finished downloading at {jsf} ms, yet the blocking <code>&lt;script&gt;</code> had to wait until purple CSSOM completed ({cssEnd} ms) before executing; HTML paused <em>{blk} ms</em> (DCL: {dcl} ms).
say.blockingJsWait: Synchronous <code>&lt;script&gt;</code> froze the HTML parser for <em>{blk} ms</em> until fetch and execution ended at {jsEnd} ms; preload scanner saved {pre} ms (DCL: {dcl} ms).
say.deferReady: With <code>defer</code> / <code>type="module"</code>, HTML parsing never paused ({blk} ms blocked); First Paint fired early at <em>{fp} ms</em> while the script ran after DOM + CSSOM at {dcl} ms.
say.asyncEarly: The <code>async</code> script arrived early at {jsf} ms and preempted HTML tokenization only while executing for <em>{blk} ms</em> (DCL: {dcl} ms).
say.asyncAfter: The <code>async</code> script finished downloading after HTML completed ({htmlEnd} ms), causing <em>{blk} ms</em> parser blocking (First Paint: {fp} ms).
:::

At the defaults (30 ms external CSS, 70 ms JS split between fetch and execution), turning <code>HTMLPreloadScanner</code> on lets <code>app.js</code> start downloading at 2 ms alongside the stylesheet, finishing <code>DOMContentLoaded</code> at {=ch2.blockDcl} ms. Uncheck the preload scanner and the parser does not even discover <code>app.js</code> until 16 ms, pushing completion out to {=ch2.noPreDcl} ms—costing {=ch2.saved} ms of idle wait. Switch the mode to <code>defer</code> and HTML tokenization races straight past without pausing, pulling First Paint down to {=ch2.deferFp} ms even though the script finishes running at {=ch2.deferDcl} ms. Drag CSS time above 50 ms to watch even an already-downloaded blocking script wait idly until purple CSSOM completes.

The model omits: TCP/TLS connection setup, incremental UTF-8 decoder chunking, legacy <code>document.write()</code> parser re-entry, and non-blocking conditional stylesheets such as <code>media="print"</code>. {.take}

## Style calculation: right-to-left matching & InvalidationSets {#ch3}

::: strings
toc: Style matching & invalidation
:::

Blink evaluates CSS selectors **from right to left**, starting with the rightmost key selector; an ancestor Bloom filter (<code>SelectorFilter</code>) rejects impossible ancestor chains in O(1), and precompiled <code>InvalidationSet</code> bitmasks restrict DOM class toggles to the affected subtree. {.law}

If you need to find everyone in a city directory whose last name is "Chen", who lives in District 4, and whose grandfather taught at East High, you do not pull every graduate roster of East High first. You jump straight to the "Chen" section (the rightmost constraint), filter District 4, and only then check family history.

That is why Blink's <code>SelectorChecker</code> reads <code>body div.app main ul li a.btn</code> **right to left**. Starting at <code>body</code> would fan out across thousands of irrelevant branches. Instead, Blink hashes every rule into <code>RuleHash</code> buckets keyed by its rightmost key selector (<code>.btn</code>, <code>span</code>, or the fallback universal bucket <code>*</code>). A node only inspects buckets matching its own tag, ID, and classes.

::: diagram dg-style keys=dg.style
cap: Figure 3. Blink style matching and invalidation narrowing. Rules are bucketed by rightmost key selector, pruned in O(1) via SelectorFilter, and targeted via InvalidationSet on class toggles.
aria: Diagram: four-stage funnel for right-to-left CSS matching using RuleHash buckets, Bloom filter rejection, ancestor walk, and InvalidationSet targeting
sel: body div.app main ul li a.btn
sels: ← Match starts at rightmost key a.btn
s1: 1. RuleHash Key Buckets
s1s: Inspect only matching tag, id, or class
s2: 2. SelectorFilter (Bloom Filter)
s2s: One bitmask skips 90%+ dead ancestors
s3: 3. Parent Walk & InvalidationSet
s3s: Walk up on pass; toggle dirties subtree
:::

Even after a key selector hits, walking up every element's parent chain would still be expensive. Blink keeps a compact bitmask Bloom filter of every element's ancestor tags, IDs, and classes inside <code>SelectorFilter</code>. Before walking upward, Blink checks the ancestor bitmask: if the Bloom filter says an ancestor class is absent, it **cannot exist** (zero false negatives), so Blink drops the rule immediately. And when JavaScript calls <code>card.classList.toggle('is-open')</code>, <code>StyleEngine</code> consults stylesheet-compiled <code>InvalidationSet</code> masks so only <code>NeedsStyleRecalc</code> nodes inside the impacted subtree recompute styles.

::: lab ch3-model
model.title: Model 2 · Selector matching, Bloom filter & InvalidationSet cost
model.how: Pick a selector pattern (simple class / deep descendant / universal tail), drag DOM size and rule count, and uncheck optimizations to see full-tree style recalculation blow up.
ctl.sel: Selector shape
sel.simple: .btn simple
sel.deep: body ... a.btn deep
sel.univ: .card * universal
ctl.nodes: DOM nodes
ctl.rules: CSS rules
ctl.smart: Enable SelectorFilter + InvalidationSet
cv.aria: Left shows the dirty DOM subtree after a class toggle; right bars compare invalidated nodes, key checks, Bloom rejections, and ancestor hops
cv.inv: Dirty nodes
cv.chk: Key checks
cv.blm: Bloom rejects
cv.walk: Parent walks
cv.treeHdr: Impacted subtree (gold = dirty, cyan = hit)
cv.costHdr: Selector matching work
read.inv: Nodes recalculated
read.chk: Key selector checks
read.blm: Bloom rejects
read.ms: Est. style time
say.smartSimple: Simple class <code>.btn</code> hashes straight into one RuleHash bucket: only <em>{inv}</em> dirty nodes, {chk} key checks, and 0 ancestor walks ({ms} ms).
say.smartDeep: Even for a long descendant selector, right-to-left matching plus the Bloom filter rejected <em>{blm}</em> dead paths in O(1), recalculating {inv} nodes across {chk} key checks ({ms} ms).
say.smartUniversal: Trap: <code>.card *</code> falls into the universal bucket! Even with only {inv} dirty nodes, key checks jump to <em>{chk}</em> and parent hops climb to {walk} ({ms} ms).
say.naiveFull: Without InvalidationSet and the Bloom filter, toggling one card class dirties all <em>{inv}</em> DOM nodes, driving {chk} key checks and {walk} ancestor walks ({ms} ms).
:::

In the default 180-node DOM tree with 250 rules, toggling <code>.is-open</code> on one card with Blink's smart engine dirties only {=ch3.inv} nodes; with deep descendant rules (<code>body div.app ... a.btn</code>), it executes {=ch3.deepChecks} key checks and rejects {=ch3.bloomRej} ancestor queries in O(1) via the Bloom filter. Switch to a universal-tail rule like <code>.card *</code>: because <code>*</code> lands in the universal bucket, even {=ch3.inv} dirty nodes trigger {=ch3.univChecks} rule checks and {=ch3.univWalks} parent hops! Uncheck the optimization toggle to watch a naive engine re-evaluate all {=ch3.naiveNodes} nodes across {=ch3.naiveChecks} checks.

The model omits: CSS cascade specificity ordering, inherited custom property <code>var(--x)</code> propagation, upward invalidation via <code>:has()</code>, and Shadow DOM style scoping boundaries. {.take}

## LayoutNG & forced synchronous layout thrashing {#ch4}

::: strings
toc: LayoutNG & layout thrashing
:::

LayoutNG turns box geometry into a pure function from an immutable <code>ConstraintSpace</code> input to an immutable <code>PhysicalBoxFragment</code> output so clean subtrees hit cache; reading <code>offsetHeight</code> immediately after mutating <code>style.width</code> forces Blink to run Style and Layout synchronously mid-script, turning one end-of-frame pass into N forced reflows. {.law}

Suppose a carpentry crew plans to measure every room once at 5 PM and cut all trim boards in one batch. Instead, after nailing a single piece of molding in the living room, you shout "Stop everything and re-measure the hallway!"—fifty times in a loop. One walk through the house becomes fifty full-house interruptions.

Chromium's legacy layout engine mutated shared fields in place across floating and inline trees, making caching brittle. **LayoutNG** rebuilt layout around immutable data boundaries: a parent passes down a **<code>ConstraintSpace</code>** (available inline/block size, BFC formatting flags, writing mode), and <code>BlockLayoutAlgorithm</code> or <code>FlexLayoutAlgorithm</code> returns a <code>LayoutResult</code> holding physical coordinates inside an immutable **<code>PhysicalBoxFragment</code>** tree. Any clean subtree seeing the same <code>ConstraintSpace</code> reuses its cached fragment outright.

::: diagram dg-layoutng keys=dg.layoutng
cap: Figure 4. LayoutNG's immutable input/output contract, contrasted with batched end-of-frame layout versus interleaved read-write Layout Thrashing.
aria: Diagram: ConstraintSpace feeding PhysicalBoxFragment, followed by Batched 1-pass layout vs Forced Synchronous Layout Thrashing
cs: ConstraintSpace (Immutable Input)
css: Available width/height, BFC, writing mode
frag: PhysicalBoxFragment (Immutable Output)
frags: Fixed offsets; clean subtrees reuse cache
bat: Batched: read all offsets, then write widths
bats: Single Style + LayoutNG pass at frame end
thr: Layout Thrashing (Forced Reflow)
thrs: Write width + read offsetHeight → N reflows
:::

Normally, writing <code>el.style.width = '360px'</code> merely sets a dirty bit—Blink defers layout until the end of the frame. Yet if the very next statement reads a layout-dependent metric such as <code>offsetHeight</code> or <code>getBoundingClientRect()</code>, Blink has no choice but to flush pending Style and LayoutNG synchronously on the main thread before returning the number. Repeating write-then-read inside a loop creates **Forced Synchronous Layout**—better known as **Layout Thrashing**.

::: lab ch4-model
model.title: Model 3 · LayoutNG batching vs. Forced Synchronous Layout thrashing
model.how: Compare three loop patterns (interleaved write-then-read / batched read-then-write / CSS contain: layout isolation), drag card and tree counts, and watch layout work cross 60 Hz and 120 Hz limits.
ctl.pat: Loop pattern
pat.thrash: Interleaved (Thrash)
pat.batched: Batched (Read → Write)
pat.contained: contain: layout
ctl.items: Loop items
ctl.tree: Total tree nodes
cv.aria: Timeline of forced synchronous reflow spikes vs. 60 Hz and 120 Hz frame budgets
cv.js: JS write
cv.reflow: Forced reflow
cv.layout: End-of-frame layout
cv.b60: 60 Hz budget (16.67 ms)
cv.b120: 120 Hz budget (8.33 ms)
cv.x: Time (ms)
read.ref: Forced reflows
read.ms: Total layout work
read.b60: 60 Hz budget share
read.b120: 120 Hz budget share
say.thrashOver60: Interleaved writes and reads forced <em>{ref} synchronous reflows</em> totaling <em>{ms} ms</em>—layout alone consumes {b60}% of a 60 Hz frame budget and drops frames!
say.thrashOver120: Write-then-read thrashing fired {ref} reflows (<em>{ms} ms</em>), fitting inside 60 Hz yet swallowing {b120}% of a 120 Hz frame budget.
say.thrashFits: At this small scale {ref} forced reflows take {ms} ms within budget, though cost scales quadratically as items or DOM depth grow.
say.batchedClean: Batching reads before writes eliminates forced reflows (<em>0</em>); one deferred LayoutNG pass takes just {ms} ms ({b60}% of 60 Hz).
say.containedFast: CSS <code>contain: layout</code> isolates each reflow to one card subtree: even with {ref} forced reads, total layout drops to <em>{ms} ms</em> ({b60}% of 60 Hz).
:::

Across 50 cards inside an uncontained 300-node tree, alternating write-then-read fires 50 forced reflows totaling {=ch4.thrashMs} ms—layout alone consumes {=ch4.thrash60}% of a 60 Hz frame budget (and more than double a 120 Hz frame!). Flip to the batched pattern ("read all <code>offsetHeight</code> values first, write all widths second"): forced reflows drop to zero, and the single end-of-frame LayoutNG pass takes just {=ch4.batchMs} ms—{=ch4.ratio}× faster. Even if legacy scripts cannot reorder the loop, adding CSS <code>contain: layout</code> locks each reflow to one isolated card subtree, bringing work down to {=ch4.contMs} ms.

The model omits: HarfBuzz inline text shaping inside <code>InlineLayoutAlgorithm</code>, multi-pass flex/grid sizing fallbacks, and device-specific microsecond timings (parameterized here at 1.8 µs per visited node). {.take}

## Pre-Paint & the four Property Trees {#ch5}

::: strings
toc: Pre-Paint & Property Trees
:::

In Pre-Paint, Blink extracts transforms, clips, visual effects, and scroll state out of the box hierarchy into four separate **Property Trees**; updating a <code>transform</code> or scrolling a list edits one node on those trees in <code>cc</code>, letting Chromium skip Layout and Paint completely. {.law}

Think of a slide projector. If the artwork on the glass slide hasn't changed and you only want to shift the picture three centimeters right, dim its brightness, or pan across a window mask, you do not send the slide back to an illustrator to redraw (Paint) or re-typeset the text (Layout)—you just turn one knob on the lens barrel.

Older browsers coupled geometry, overflow clipping, and opacity onto one monolithic layer hierarchy, forcing layer splits whenever nested boxes diverged. In RenderingNG's **Pre-Paint** pass, <code>PaintPropertyTreeBuilder</code> constructs four lightweight, orthogonal trees:
1. **Transform Tree**: CSS transforms (<code>translate</code>, <code>scale</code>, <code>rotate</code>) and scroll offsets; {#pt1}
2. **Clip Tree**: <code>overflow: hidden</code> boxes, <code>clip-path</code> bounds, and viewport rects; {#pt2}
3. **Effect Tree**: <code>opacity</code>, <code>filter</code>, <code>backdrop-filter</code>, and blend modes; {#pt3}
4. **Scroll Tree**: scroll container bounds, <code>scrollTop / scrollLeft</code> offsets, and scroll chaining. {#pt4}

::: diagram dg-proptrees keys=dg.proptrees
cap: Figure 5. The four RenderingNG Property Trees built during Pre-Paint. Each PaintChunk carries just four node pointers rather than duplicating ancestor state.
aria: Diagram: Transform, Clip, Effect, and Scroll property trees feeding a PaintChunk holding four state pointers
tr: Transform Tree
trs: Local matrix × scroll translation
cl: Clip Tree
cls: overflow & viewport clip rects
ef: Effect Tree
efs: opacity / filter / blend modes
sc: Scroll Tree
scs: Scroll offsets & nesting chain
chunk: PaintChunk
chunks: 4 pointers: (t_node, c_node, e_node, s_node)
:::

Every vector chunk emitted later in Paint simply stores a compact 4-tuple pointing to one node in each tree: <code>(t_node, c_node, e_node, s_node)</code>. Once committed to <code>cc</code>, compositor scrolls mutate the Scroll/Transform node directly, and compositor animations update Transform or Effect nodes in place—Blink's main-thread Style, Layout, and Paint stay completely idle.

::: lab ch5-model
model.title: Model 4 · Four Property Trees mutator
model.how: Choose which property updates (transform / scroll / opacity / left), drag translation, scroll, and alpha sliders, and watch which single Property Tree turns dirty on the left while the clipped viewport updates on the right.
ctl.prop: Mutated property
prop.transform: transform
prop.scroll: scrollTop
prop.opacity: opacity
prop.left: style.left
ctl.tx: Translate X
ctl.sy: Scroll Y
ctl.op: Opacity
ctl.clip: Enable overflow: hidden clip
cv.aria: Left shows the four Property Trees (Transform, Clip, Effect, Scroll) and dirty highlights; right shows the target box inside the clip viewport
cv.tTransform: Transform Tree
cv.tClip: Clip Tree
cv.tEffect: Effect Tree
cv.tScroll: Scroll Tree
cv.dirty: Dirty
cv.clean: Clean
cv.clipBox: Clip viewport
cv.elBox: Target card
read.pos: Screen pos (x, y)
read.alpha: Effective alpha
read.vis: Visible clipped area
read.stg: Blink stages rerun
stg.comp: 0 stages (cc only)
stg.blink: 5 stages (Style→Commit)
say.clippedOut: The box slid completely outside the clip rect (<em>0% visible</em> at ({x}, {y})); <code>cc</code> keeps its property node up to date with no visible pixels to shade.
say.leftSlow: Trap: mutating <code>style.left</code> alters LayoutNG geometry, forcing Blink to rerun <em>{stg}</em> on the main thread (pos ({x}, {y}), {vis}% visible).
say.transformFast: Only the <strong>Transform Tree</strong> node mutated: screen position moved to ({x}, {y}) with <em>0 Blink stages</em> rerun—handled directly in <code>cc</code>.
say.scrollFast: Only the <strong>Scroll Tree</strong> offset node changed (scrollY = {sy} px): card moved to ({x}, {y}), {vis}% visible, skipping Layout and Paint entirely.
say.effectFast: Only the <strong>Effect Tree</strong> alpha node changed: effective opacity became <em>{alpha}</em> with zero layout or paint invalidation.
:::

Test all four property paths in the lab above: at default <code>transform: translateX(60px)</code> and <code>scrollTop = 40px</code>, the box lands at ({=ch5.sx}, {=ch5.sy}) px with {=ch5.visPct}% visible inside the container clip, dirtying only the **Transform** node while Blink reruns 0 stages. Switching to scroll or <code>opacity</code> moves the golden highlight cleanly onto the **Scroll** or **Effect** node, still at 0 Blink stages. Pick <code>style.left</code>, however, and even a simple pixel shift dirties layout geometry—forcing all 5 main-thread stages from Style through Commit to rerun.

The model omits: 4×4 perspective projection under <code>transform-style: preserve-3d</code>, rounded-rect (RRect) clip masks, and automatic Effect nodes inserted by <code>isolation: isolate</code> or <code>mix-blend-mode</code>. {.take}

## Paint records & layerization: the layer explosion trap {#ch6}

::: strings
toc: Paint records & layer explosion
:::

Blink's Paint stage does not rasterize pixels—it records vector opcodes (<code>PaintRecord</code>) into chunks; <code>PaintArtifactCompositor</code> merges adjacent chunks into one shared GPU texture whenever possible, unless a composited element painting underneath overlaps them and forces every overlapping card above it into its own texture. {.law}

When painting a stage backdrop, twenty printed posters can be glued onto one flat wooden panel to save material. Yet if the lighting director hides a moving spotlight directly *behind* the posters—in front of the back wall—you can no longer glue those twenty posters onto the wall behind the light; each overlapping poster has to be mounted on its own separate sheet of glass.

In Paint, <code>PaintController</code> converts fragments into vector opcodes (<code>drawRRect</code>, <code>drawTextBlob</code>, <code>saveLayer</code>) grouped into <code>PaintChunk</code>s. Next, **<code>PaintArtifactCompositor</code>** walks the list in paint order: chunks sharing compatible property-tree state get **squashed** into one backing <code>cc::Layer</code> so Chromium allocates as few GPU textures as possible.

::: diagram dg-layers keys=dg.layers
cap: Figure 6. Layer squashing vs. Layer Explosion. When no promoted element sits beneath overlapping cards, chunks merge into one backing texture; a promoted element at z-index 1 forces overlapping z-index 2 cards to split individually.
aria: Diagram: top shows 20 cards squashed into one layer; bottom shows an animated badge underneath overlapping cards triggering 20 separate GPU layers
topTitle: Safe path: Layer Squashing
sq: 20 cards merged into 1 shared texture
sqs: No lower blocker → 1–2 cc::Layers
botTitle: Trap: Layer Explosion
bg: Lower animated badge (z: 1, will-change)
bgs: Promoted first → blocks squashing above it
exp: Overlapping cards split apart (z: 2)
exps: MightOverlap forces separate GPU layers
:::

The trap springs on **paint order plus bounding-box overlap (<code>MightOverlap</code>)**. Suppose an innocent loading spinner or badge at <code>z-index: 1</code> uses <code>will-change: transform</code> so it gets its own GPU layer early. Any card at <code>z-index: 2</code> painted afterward with its own clip/stacking boundary whose bounding box overlaps that badge cannot merge back behind the badge—Blink promotes it into its own **overlap-composited layer**. Across dozens of big cards, texture memory explodes overnight.

::: lab ch6-model
model.title: Model 5 · Layer squashing vs. Layer Explosion
model.how: Move the animated badge (static / z-index below cards / z-index above cards), toggle bounding-box overlap, and drag card count and size to see VRAM explode or collapse.
ctl.badge: Badge placement
badge.static: Static (none promoted)
badge.below: Below cards (z-index: 1)
badge.above: Above cards (z-index: 99)
ctl.cards: Card count
ctl.size: Card size
ctl.overlap: Cards overlap badge rect
cv.aria: Left shows the composited cc::Layer stack; right compares layer count and RGBA8 VRAM usage in MiB
cv.root: Root backing layer
cv.badge: Animated badge layer
cv.cards: Squashed cards layer
cv.cardEach: Exploded layers ×{n}
cv.vramHdr: Texture VRAM (RGBA8)
read.chk: PaintChunks
read.lay: Composited layers
read.vram: Backing VRAM
read.sav: Squashed savings
say.exploded: <strong>Layer Explosion</strong> triggered! A lower promoted badge (z: 1) blocks squashing, forcing all {cards} overlapping cards into separate GPU textures—<em>{lay} layers</em> consuming <em>{vram} MiB</em>.
say.aboveSafe: With the badge above (z: 99), every card merges cleanly into 1 backing texture, keeping total output at <em>{lay} layers</em> ({vram} MiB) and saving {sav} layers.
say.noOverlapSafe: Even below the cards, non-overlapping bounds allow <code>PaintArtifactCompositor</code> to squash all cards together (<em>{lay} layers</em>, {vram} MiB).
say.allMerged: With no lower promoted element, all {chk} paint chunks merge into <em>1 root scrolling layer</em> using {vram} MiB.
:::

The default lab state demonstrates that exact trap: 20 overlapping 280×280 px cards sitting above a promoted badge explode into {=ch6.expLayers} composited layers consuming {=ch6.expVram} MiB of RGBA8 VRAM—compared with {=ch6.safeLayers} layers and {=ch6.safeVram} MiB when the badge sits on top! Raise card count to 36 at 480×480 px and that single widget burns {=ch6.bigVram} MiB of GPU memory. Flip the badge above the cards or uncheck overlap, and <code>PaintArtifactCompositor</code> immediately squashes all cards back down into one backing layer.

The model omits: Blink's <code>DecompositeClip</code> / <code>DecompositeEffect</code> optimizations when property nodes can safely hoist, <code>devicePixelRatio</code> scaling (which multiplies texture bytes by 4× on 2× Retina screens or 9× on 3× mobile displays), and solid-color quads that skip texture allocation altogether. {.take}

## Tiling, OOP-R rasterization, Pending/Active trees & checkerboarding {#ch7}

::: strings
toc: Tiling, raster & checkerboarding
:::

Because a composited layer can be tens of thousands of pixels tall, <code>cc::TileManager</code> slices it into <code>256×256</code> or <code>512×512</code> tiles, rasterizes visible and lookahead tiles onto a background <code>PendingTree</code>, and swaps it atomically into the <code>ActiveTree</code>—unless fast scrolling outruns raster throughput and exposes unrasterized checkerboards. {.law}

Digital maps work the exact same way: nobody decodes an entire city into one giant bitmap at launch. The map slices the city into grid squares, draws what is inside your phone screen first (<code>NOW</code>) plus one or two rows ahead of your finger (<code>SOON</code>), and only shows blank grey grid squares when your swipe outpaces the renderer.

Turning vector <code>PaintRecord</code> commands into pixel textures is **rasterization**. Modern Chromium uses **Out-of-Process Rasterization (OOP-R)**: instead of rasterizing in software on renderer CPU threads, Blink sends paint records over Mojo IPC to the GPU process so Skia executes rasterization directly on GPU hardware (for how the GPU itself turns triangles into 2×2 pixel quads, see [[how-a-gpu-computes#ch9]]).

::: diagram dg-trees keys=dg.trees
cap: Figure 7. cc::TileManager's double-buffered tree swap and priority bins. ActiveTree keeps user scrolling responsive while PendingTree finishes rasterizing newly committed NOW and Skewport tiles.
aria: Diagram: PendingTree activating into ActiveTree above a 4x2 tile grid labeled NOW, SOON skewport, and unrasterized checkerboard tiles
pend: PendingTree (Staging)
pends: Receives Blink commit & rasterizes tiles
act: ActiveTree (Live Screen)
acts: Presented every VSync for smooth scroll
prio: TileManager Priority Queue (Skewport)
prios: NOW (visible) → SOON (ahead) → EVENTUALLY
:::

Inside the compositor, <code>cc::LayerTreeHostImpl</code> double-buffers two trees: the live **<code>ActiveTree</code>** currently scrolling on screen, and the staging **<code>PendingTree</code>** where fresh commits wait until critical tiles finish rasterizing before activating. Each <code>256×256</code> RGBA8 tile takes {=ch7.tile256KiB} KiB (versus {=ch7.tile512MiB} MiB for a <code>512×512</code> tile, 4× the pixels). When scroll velocity exceeds per-frame raster capacity, newly uncovered tiles appear briefly as blank **checkerboards**—which Chromium fights with OOP-R GPU speed and **Skewport** pre-painting rows ahead of scroll direction.

::: lab ch7-model
model.title: Model 6 · cc::TileManager tiling & checkerboarding
model.how: Push scroll velocity upward, switch between 256×256 and 512×512 tiles, and toggle OOP-R GPU rasterization or Skewport pre-paint rows to see red checkerboards appear and vanish.
ctl.tile: Tile size
tile.t256: 256×256 px
tile.t512: 512×512 px
ctl.spd: Scroll speed
ctl.skew: Skewport lookahead
ctl.oop: Enable OOP-R GPU raster
cv.aria: Tall composited layer grid: green tiles are ready, gold tiles are Skewport pre-paint, and red tiles indicate visible checkerboarding
leg.ready: Ready (Active)
leg.pend: Pre-paint (SOON)
leg.chk: Checkerboard (NOW)
cv.view: Viewport
cv.skew: Skewport lookahead
read.vis: Visible tiles
read.cap: Tiles/frame cap
read.cb: Checkerboard area
read.pk: Pending queue
say.idleClean: Idle scroll (0 px/s): all {vis} viewport tiles sit rasterized in <code>ActiveTree</code> with <em>0%</em> checkerboarding.
say.skewportClean: Skewport lookahead pre-painted rows ahead of the scroll: even on CPU raster at {spd} px/s, visible checkerboarding holds at <em>{cb}%</em>.
say.ooprClean: With OOP-R GPU rasterization enabled, throughput jumps to {cap} tiles/frame—easily outpacing {spd} px/s scrolling (<em>{cb}%</em> checkerboards).
say.checkerboard: Warning: scrolling at {spd} px/s outruns the {cap}-tile/frame CPU budget! <em>{cb}%</em> of visible tiles show red checkerboards—raise Skewport or enable OOP-R GPU raster.
:::

The defaults stage a worst-case mobile/CPU bottleneck: OOP-R GPU raster is off and Skewport lookahead is 0 while scrolling <code>256×256</code> tiles at 3,600 px/s, leaving {=ch7.cpuCb}% of the visible viewport checkerboarded in red. Now test either fix: increase Skewport pre-paint rows to 2 and checkerboarding drops to {=ch7.skewCb}%; or keep Skewport at 0 and enable **OOP-R GPU Raster**, cutting per-tile raster time over 8× so checkerboards vanish to {=ch7.gpuCb}% immediately.

The model omits: low-resolution fallback tile tiers used during pinch-zoom, eviction under tight GPU tile memory caps, and idle first-frame raster bursts before scrolling begins. {.take}

## Viz CompositorFrame, SurfaceAggregator & scanout {#ch8}

::: strings
toc: Viz CompositorFrame & SurfaceAggregator
:::

No renderer process—neither the main document nor a cross-origin <code>&lt;iframe&gt;</code>—ever draws straight to the display. Each process submits a <code>viz::CompositorFrame</code> made of render passes and draw quads to the GPU process, where <code>Viz</code>'s <code>SurfaceAggregator</code> flattens every surface into one unified frame before swap. {.law}

Because Chromium enforces Site Isolation, a bank checkout widget embedded inside an <code>&lt;iframe&gt;</code> runs in a completely separate OS process from the shopping page around it. Think of two locked workshops mailing numbered puzzle tiles to a central assembly hall (<code>Viz</code>), which replaces each placeholder frame with the real tiles and hands one finished canvas to the display card.

Every VSync beat triggers **<code>BeginImplFrame</code>** inside <code>Viz</code>. Crucially, compositor ticks and main-thread ticks are decoupled: if a scroll or compositor-driven animation needs only property-tree updates on the active tree, <code>cc</code> submits a fresh <code>viz::CompositorFrame</code> directly at VSync without waiting for Blink. Only script/layout updates wait on **<code>BeginMainFrame</code>**.

::: diagram dg-viz keys=dg.viz
cap: Figure 8. Viz::SurfaceAggregator merging Browser UI, Main Frame, and isolated OOPIF CompositorFrames into a single unified RenderPass for GPU scanout.
aria: Diagram: Browser UI, Main Frame, and Cross-origin OOPIF submitting CompositorFrames into Viz SurfaceAggregator, then SkiaRenderer and GPU swap
ui: Browser UI
uis: Chrome tabs
main: Main Frame
mains: Root frame
oop: OOPIF
oops: Cross-origin
agg: Viz::SurfaceAggregator
aggs: Resolves SurfaceDrawQuads into 1 pass
gpu: SkiaRenderer → GPU Framebuffer
gpus: Submits Metal / Vulkan / D3D12 display swap
:::

Inside each <code>viz::CompositorFrame</code> sits a hierarchy of <code>CompositorRenderPass</code> objects populated by lightweight rectangles called **draw quads**: <code>TileDrawQuad</code> for rasterized content, <code>SolidColorDrawQuad</code> for flat fills, and **<code>SurfaceDrawQuad</code>** placeholders pointing to child processes. <code>SurfaceAggregator</code> recursively resolves every <code>SurfaceDrawQuad</code> across process boundaries, clips obscured rects, and hands the merged frame to <code>SkiaRenderer</code>—whose output enters the framebuffer and display swap chain covered in [[how-pixels-reach-a-screen#ch3]].

::: lab ch8-model
model.title: Model 7 · Viz SurfaceAggregator & decoupled VSync beats
model.how: Switch between 60 Hz and 120 Hz, drag Blink main-thread time, raster time, and cross-origin OOPIF count, and watch the compositor stay locked on VSync even when main misses frames.
ctl.hz: Display refresh
hz.60: 60 Hz (16.67 ms)
hz.120: 120 Hz (8.33 ms)
ctl.main: Blink main time
ctl.ras: Raster time
ctl.oop: Cross-origin OOPIFs
cv.aria: Multi-process timeline comparing VSync ticks, Blink main-thread frames, and cc + Viz frame aggregation
cv.vsync: VSync
cv.main: Blink Main
cv.impl: cc Impl + Viz
cv.viz: Aggregate + Swap
cv.x: Time (ms)
read.bud: Frame budget
read.impl: Effective impl FPS
read.main: Main thread FPS
read.quads: Merged DrawQuads
say.allLocked: Both Blink ({mTot} ms) and Viz aggregation ({agg} ms) fit inside {bud} ms—both tracks stay locked at <em>{impl} fps</em> across {quads} quads.
say.mainBehindImplLocked: Decoupled beats! Blink spends {mTot} ms past the {bud} ms budget so main updates fall to <em>{main} fps</em>, yet <code>cc + Viz</code> merges {quads} quads in {agg} ms and holds <em>{impl} fps</em>.
say.implOverload: Surface aggregation alone ({agg} ms) exceeded the {bud} ms budget, slowing compositor presentation to {impl} fps.
:::

At the default 120 Hz display rate ({=budget.120} ms per frame), the main thread spends 14 ms plus 3 ms of rasterization (17 ms total), missing two VSync beats and updating main-thread content at only {=ch8.mainFps} fps. Yet look at the compositor and Viz lanes: even while aggregating 2 cross-origin OOPIFs ({=ch8.quads} draw quads merged in {=ch8.implMs} ms), <code>cc + Viz</code> hits every single {=budget.120} ms VSync and locks scrolling output at a rock-solid {=ch8.implFps} fps.

The model omits: cross-process <code>SynchronizationToken</code> deadline fallbacks when a slow OOPIF misses synchronization, hardware multi-plane overlays (MPO) that bypass GPU composition for fullscreen video, and off-screen <code>RenderPass</code> copies triggered by <code>backdrop-filter</code> or heavy blurs. {.take}

## Main-thread jank vs. compositor isolation: `top/left` vs. `transform/opacity` {#ch9}

::: strings
toc: Main-thread jank vs. compositor
:::

Smooth animation depends entirely on which pipeline stages an animated property invalidates: mutating <code>left</code> or <code>top</code> drags every frame back through Style, Layout, Paint, Raster, and Commit on the main thread, whereas animating <code>transform</code> or <code>opacity</code> on the compositor updates a single Property Tree node and stays untouched by 100 ms JavaScript pauses. {.law}

Combining Chapter 4's layout cost, Chapter 5's property trees, and Chapter 8's VSync budget turns web performance folklore into exact arithmetic. Why does sliding a card 120 pixels with <code>transform</code> feel effortless on a 120 Hz screen while sliding it with <code>left</code> stutters whenever background JavaScript runs?

The difference is **where each frame's work executes**:
- **<code>style.left</code> / <code>top</code> / <code>width</code>**: Modifies box geometry, invalidating **5 full stages** (<code>Style → LayoutNG → Pre-Paint → Paint → Commit</code>) on the Blink Main Thread. Whenever JSON parsing, React rendering, or GC triggers a JS **Long Task**, the animation misses consecutive VSync deadlines completely. {#iso1}
- **<code>style.boxShadow</code> / <code>background-color</code>**: Leaves geometry intact (skipping LayoutNG) but invalidates pixels across **3 stages** (<code>Paint → Raster → Composite</code>), so main-thread JS spikes still stall every painted update. {#iso2}
- **CSS / WAAPI <code>transform</code> or <code>opacity</code>**: Blink hands keyframes to <code>cc</code> up front. On every <code>BeginImplFrame</code>, the compositor interpolates 1 node in the Transform or Effect tree (**1 stage**) and submits straight to Viz—never touching the Blink Main Thread. {#iso3}

::: lab ch9-model
model.title: Model 8 · 120 Hz animation showdown: transform vs. box-shadow vs. left
model.how: Switch the animated property and display Hz, drag the JS long-task spike (ms) and DOM complexity, and compare per-frame timings above with visual smoothness below.
ctl.prop: Animated property
prop.transform: transform (Compositor)
prop.shadow: box-shadow (Paint)
prop.left: left (Layout+Paint)
ctl.hz: Display refresh
hz.60: 60 Hz
hz.120: 120 Hz
ctl.js: JS long-task spike
ctl.dom: DOM complexity
cv.aria: Top plot shows per-frame cost against the VSync budget line; bottom compares smooth motion against dropped-frame stalls
cv.thresh: Budget {v} ms
cv.ms: Frame time (ms)
cv.drop: Long-task stall
cv.box: Motion track
cv.x: Window (seconds)
read.cost: Base frame cost
read.drop: Dropped frames (1.6 s)
read.max: Longest freeze
read.fps: Effective FPS
say.compositorImmune: Compositor-driven <code>transform</code> runs just 1 stage on <code>cc</code> ({cost} ms): despite {js} ms JS spikes on Main, it drops <em>0 frames</em> and holds {fps} fps!
say.paintStalled: <code>box-shadow</code> skips LayoutNG but still runs 3 main-thread stages (base {cost} ms), hitting {js} ms JS stalls to drop <em>{drop} frames</em> (max freeze {max} ms).
say.layoutStalled: Mutating <code>left</code> reruns all 5 stages every frame (base {cost} ms) plus {js} ms JS spikes, dropping <em>{drop} frames</em> and collapsing output to {fps} fps (max pause {max} ms)!
say.cleanMain: With {js} ms JS spikes and light DOM ({cost} ms base), main-thread animation fits inside {bud} ms ({drop} dropped). Push the JS spike or DOM slider right!
:::

Under a 120 Hz screen with 250 boxes and periodic 50 ms main-thread JS spikes: compositor-driven <code>transform</code> drops {=ch9.tfDrop} frames across the entire 1.6-second run, locked at 120 fps. Animating <code>box-shadow</code> loses {=ch9.bsDrop} frames behind paint + JS stalls, while animating <code>left</code> drops {=ch9.lfDrop} frames with a {=ch9.lfMax} ms freeze—collapsing effective output down to {=ch9.lfFps} fps.

The model omits a crucial pitfall: updating <code>el.style.transform</code> manually inside a JavaScript <code>requestAnimationFrame</code> loop. Even though <code>transform</code> still skips Layout and Paint, the <code>rAF</code> callback itself runs on the main thread, so a 50 ms JS stall still freezes it—only declarative CSS animations, transitions, or Web Animations API animations offloaded to <code>cc</code> gain true main-thread immunity. {.take}

## Where the frontier is (November 2026) {#ch10}

::: strings
toc: Where the frontier is (Nov 2026)
:::

Chromium's 2026 rendering frontier pushes three shifts in parallel: replacing single-threaded OpenGL-era Ganesh with multi-threaded WebGPU/Dawn-backed <strong>Skia Graphite</strong>, moving scroll-linked and page-transition animations onto the compositor thread, and running the entire Blink pipeline ahead of navigation via <strong>Speculation Rules</strong>. {.law}

Below, facts as of November 2026 are separated into established pipeline invariants, shipped engineering capabilities with release dates, and active boundaries or trials.

### Established {#h.est .sub3}

- **RenderingNG multi-process & multi-thread split**: Immutable LayoutNG fragments, the four Pre-Paint Property Trees, <code>PaintArtifactCompositor</code>, and <code>Viz::SurfaceAggregator</code> remain Chromium's unified architecture across desktop and mobile within strict {=budget.60} ms (60 Hz) and {=budget.120} ms (120 Hz) display budgets. {#e1}
- **Main-thread vs. compositor boundary**: Any property or callback executing on Blink's main event loop remains vulnerable to JavaScript long tasks; true jank isolation requires keeping per-frame mutations inside compositor property trees. {#e2}

### Already built {#h.demo .sub3}

- **Skia Graphite on Dawn (WebGPU abstraction)**: Chromium's next-generation Skia backend replaces the OpenGL-centric single-threaded Ganesh backend with **Graphite** layered on **Dawn** (mapping natively to **Metal** on macOS, **Direct3D 12** on Windows, and **Vulkan** on Android/Linux). Graphite splits command recording across multiple parallel <code>Recorder</code> threads and performs 2D depth testing to drop hidden overdraw early. Google began shipping Graphite in production on Apple Silicon Macs around **Chrome 135 (April 2025)**—reporting roughly **~15% MotionMark 1.3** gains alongside lower GPU process memory (Chrome blog, 2025–2026)—before expanding rollout across desktop milestones 136–140+. {#d1}
- **Compositor-thread Scroll-Driven Animations**: Shipped in **Chrome 115+** and broadly supported across modern browsers by 2025–2026 (including <code>Animation.overallProgress</code> in Chrome 133), CSS <code>animation-timeline: scroll()</code> and <code>view()</code> bind progress straight to <code>cc::ScrollTree</code> offsets, eliminating main-thread JS scroll listeners for parallax and reading indicators. {#d2}
- **Same-document & Cross-document View Transitions**: Same-origin MPA transitions (<code>@view-transition &#123; navigation: auto; &#125;</code>, shipped in **Chrome 126**) capture compositor surface snapshots across page navigations inside Viz, advancing under Interop 2026 alongside <code>document.activeViewTransition</code> and <code>waitUntil</code> controls. {#d3}
- **Speculation Rules prerendering**: Using <code>&lt;script type="speculationrules"&gt;</code> or HTTP headers, pages can ask Chromium to prefetch or fully prerender likely next links in a hidden pipeline—running Parse, Style, LayoutNG, Paint, and initial raster before the user clicks. {#d4}

### Open frontiers, trials & limits {#h.claim .sub3}

- **Prerender budgets & origin trials**: Chromium caps simultaneous background prerenders to protect memory and battery, and continues testing finer activation controls such as the <code>prerender until script</code> origin trial. {#c1}
- **Remaining physical ceilings**: Two-phase cross-document view transitions continue refining startup latency, while large image decoding and tile memory pressure on constrained mobile GPUs remain real hardware limits that Graphite's recorder parallelism alone cannot erase. {#c2}

::: lab ch10-model
model.title: Model 9 · Ganesh vs. Skia Graphite recorders & Speculation Rules
model.how: Switch raster backends (Ganesh vs. Graphite), drag draw-command complexity and parallel Recorder threads, and toggle Speculation Rules prerender hits.
ctl.be: Raster backend
be.ganesh: Skia Ganesh (single-thread GL)
be.graphite: Skia Graphite (Dawn parallel)
ctl.cmds: Draw commands
ctl.wrk: Recorder threads
ctl.pre: Speculation Rules prerender hit
cv.aria: Bar charts comparing CPU recording time, overdraw rejection, and cold vs. prerender navigation-to-paint latency
cv.cpu: CPU record time
cv.ovr: Wasted overdraw
cv.nav: Click-to-paint
cv.x: Comparison metrics
read.rec: CPU record time
read.ovr: Overdraw rejected (2D Z)
read.nav: Click-to-paint latency
read.thr: Active recorders
say.graphitePrerender: <strong>Graphite</strong> splits recording across {thr} threads ({rec} ms) and drops <em>{rej}%</em> hidden overdraw via 2D depth testing; with a prerender hit, click-to-paint drops to <em>{nav} ms</em>!
say.graphiteCold: <strong>Graphite</strong> cuts recording to {rec} ms and rejects {rej}% overdraw, yet missing prerender still runs the cold pipeline ({nav} ms click-to-paint).
say.ganeshPrerender: Even when prerendering trims navigation to {nav} ms, single-threaded <strong>Ganesh</strong> still pays {rec} ms CPU recording plus {ovr}% wasted overdraw.
say.ganeshCold: Single-threaded <strong>Ganesh</strong> spends {rec} ms recording with {ovr}% overdraw on top of cold page setup—taking <em>{nav} ms</em> from click to first lit pixel.
:::

Switch the backend from legacy single-threaded <code>Ganesh</code> (cold navigation, no 2D depth culling) to <code>Skia Graphite</code> with 3 parallel <code>Recorder</code> threads and a <code>Speculation Rules</code> prerender hit: CPU command-recording work drops from {=ch10.gnCpu} ms to {=ch10.grCpu} ms, 2D depth testing rejects {=ch10.overRej}% of occluded overdraw before fragment shading, and navigation-to-paint latency plunges from {=ch10.gnNav} ms down to {=ch10.grNav} ms.

Every milestone, date, and rollout claim in this chapter reflects **November 2026** public status (Chrome Platform Status, Chromium official blog, and Skia Graphite rollout reports); the model's millisecond and overdraw percentages are parameterized architectural comparisons rather than cross-device hardware benchmarks. {.take}

## Wrap-up: when a web page janks, ask three questions first {#ch11}

::: strings
toc: Wrap-up: ask three questions
:::

You do not need to memorize hundreds of Blink classes. Whenever a page scrolls sluggishly, freezes mid-animation, or spikes GPU memory, open DevTools Performance and ask three questions in order. {.law}

{.qs}
- **Did the frame stall on the Main Thread or in Compositor / GPU?** Look for red-flagged Long Tasks (&gt; 50 ms) or tall yellow/purple Style and Layout bars on Main (chapters 1, 8, 9). If Main sits completely idle while scrolling stutters or flashes grey blocks, check tile rasterization and GPU throughput (chapter 7). {#q1}
- **Did a cheap change force Layout, Paint, or Forced Reflow?** Verify animations use compositor-friendly <code>transform</code> or <code>opacity</code> rather than <code>top / left / width / box-shadow</code> (chapters 5, 9), check loops for read-after-write layout thrashing (chapter 4), and inspect heavy stylesheets for universal-bucket tails like <code>.card *</code> (chapter 3). {#q2}
- **Did overlapping layers explode VRAM or outrun tiling?** Open the Layers panel: if dozens of cards split into separate textures because an animated badge sits behind them, fix paint order or remove overlap (chapter 6); if fast flings expose checkerboards, keep main-thread commits small so OOP-R and Skewport stay ahead of scroll velocity (chapter 7). {#q3}

In one sentence: Chromium keeps a web page fast by splitting **complex document understanding** (Blink's Main Thread) from **high-frequency frame assembly** (<code>cc</code> and <code>Viz</code>)—your job is simply not to force the wrong half to run at 120 Hz. {#sum .sum}

Further reading: [[how-threejs-draws-a-scene]] (how a 3D scene turns objects into WebGL/WebGPU draw calls inside a canvas), [[how-a-gpu-computes#ch9]] (how GPU SMs shade rasterized triangles in 2×2 pixel quads), [[how-pixels-reach-a-screen#ch1]] (how the display engine scans out the finished framebuffer), and [[how-pixels-reach-a-screen#ch3]] (why mismatched clocks tear or stutter across double and triple buffering). {#links}

::: footer
**Sources and internals.** Chromium RenderingNG architecture and source modules (<code>third_party/blink/renderer/core/html/parser/html_document_parser.cc</code>, <code>html_preload_scanner.cc</code>; <code>core/css/selector_checker.cc</code>, <code>selector_filter.h</code>, <code>invalidation/invalidation_set.h</code>; <code>core/layout/block_layout_algorithm.cc</code>, <code>constraint_space.h</code>, <code>physical_fragment.h</code>; <code>core/paint/paint_property_tree_builder.cc</code>; <code>platform/graphics/compositing/paint_artifact_compositor.cc</code>; <code>cc/tiles/tile_manager.cc</code>, <code>cc/trees/layer_tree_host_impl.cc</code>; <code>components/viz/service/display/surface_aggregator.cc</code>). File notes and live browser verification live in <code>BRIEF.md</code> and <code>tools/crosscheck.cjs</code> (targeting host Playwright Chromium <code>151.0.7922.34</code>). {#sources}

**References and November 2026 frontier sources.** Chromium RenderingNG documentation and Life of a Frame series; Chrome Platform Status (<code>chromestatus.com</code>): Scroll-Driven Animations (Chrome 115+ / 133), Cross-Document View Transitions (Chrome 126+), Speculation Rules API; Google Chrome blog "Introducing Skia Graphite: Chrome's rasterization backend for the future" (shipped on Apple Silicon starting Chrome 135 in April 2025 and expanded across desktop channels through 2025–2026). {#models}

**About the models.** All nine models in <code>models.js</code> reimplement the core mechanics in pure JavaScript (preload scheduling, Bloom-filtered style invalidation, LayoutNG forced-reflow counting, four-tree matrix and clip evaluation, <code>PaintArtifactCompositor</code> overlap splitting, <code>cc::TileManager</code> skewport tiling, <code>SurfaceAggregator</code> pacing, 120 Hz long-task isolation, and parallel Skia Graphite command recording). Microsecond per-node layout and per-tile raster rates are parameterized to make frame-budget cliffs visible rather than claiming fixed cross-device hardware timings. Written by an AI. {#ai}
:::
