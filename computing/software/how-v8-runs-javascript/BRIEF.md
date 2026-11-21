# BRIEF — how-v8-runs-javascript

Author: Antigravity, 2026-11-21.
Status: unregistered draft (`page.json` omits `"status"`, `"languages": {"en": "stub"}` is omitted; both Chinese and English are full native prose).

## Pinned release & host binary inspected

- **Engine**: **V8 `14.6.202.34-node.40`** bundled in `/opt/homebrew/bin/node` (**Node.js `v26.12.1`**, `arm64`, macOS).
- Host build compile flags verified via `process.config.variables`:
  - `v8_enable_pointer_compression = 0` (64-bit tagged pointers, 32-bit signed Smi `[-2^31, 2^31-1]`, 16-byte `HeapNumber`)
  - `v8_enable_sandbox = 0`
  - `v8_enable_31bit_smis_on_64bit_arch = 0`
  - `v8_enable_maglev = 1`
- Where Chrome desktop builds differ (`v8_enable_pointer_compression = 1`, 31-bit Smi `[-2^30, 2^30-1]`, 4 GiB cage, V8 Heap Sandbox on), both modes are explicitly compared and modeled in Chapter 2.

## One question & 11-chapter ladder

Question: *What happens between handing a `.js` file to V8 and hot loops hitting native machine speed — why do dynamic objects still compile to fixed memory offsets, how do tiers warm up, what triggers a bailout deoptimization, and why do GC pauses stay sub-millisecond or spike?*

1. `#ch1` 4-tier execution pipeline + lazy PreParser (lab: `ch1-model`, diagram: `dg-pipeline`).
2. `#ch2` Pointer tagging, Smi vs HeapNumber boxing, 32-bit pointer compression vs 64-bit full pointers (lab: `ch2-model`, diagram: `dg-tagging`).
3. `#ch3` Hidden classes (`Map` transition tree), in-object slack tracking, and `delete` -> dictionary fallback (lab: `ch3-model`, diagram: `dg-map-tree`).
4. `#ch4` Inline caches (`LoadIC`: uninitialized -> monomorphic -> polymorphic 2..4 -> megamorphic global stub) (lab: `ch4-model`, diagram: `dg-ic`).
5. `#ch5` Ignition accumulator bytecode VM & `FeedbackVector` slots (lab: `ch5-model`, diagram: `dg-ignition`).
6. `#ch6` Speculative optimization, OSR, `CheckMaps` / `CheckSmi` guards, and eager deoptimization bailout (lab: `ch6-model`, diagram: `dg-deopt`).
7. `#ch7` Arrays & the strictly one-way `ElementsKind` lattice (lab: `ch7-model`, diagram: `dg-elements`).
8. `#ch8` Orinoco generational & concurrent GC (`Scavenger` vs `MinorMS`, tri-color marking, write barriers, `Major Mark-Compact`) (lab: `ch8-model`, diagram: `dg-gc`).
9. `#ch9` Event loop & microtask checkpoint seam (`V8 MicrotaskCheckpoint` vs `libuv` macrotask phases, starvation) (lab: `ch9-model`, diagram: `dg-eventloop`).
10. `#ch10` Frontier (November 2026): Established / Demonstrated / Experimental & Specs (`Maglev`, `Turboshaft`, `V8 Heap Sandbox`, `WebAssembly JSPI`, `--turbolev`, `--minor-ms`).
11. `#ch11` Wrap-up: 3 diagnostic questions (`.qs`), `.sum`, and cross-links strictly to `how-a-cpu-runs-a-program`, `how-cpu-caches-work`, `how-a-cpu-guesses-ahead`, `how-a-cpu-does-math`.

## Live crosscheck (`tools/crosscheck.cjs`, run 2026-11-21): 47/47 agree

Executed directly against `/opt/homebrew/bin/node` (V8 `14.6.202.34-node.40`) inside `/tmp/agent-tasks/software/how-v8-runs-javascript/`:
- Version & `process.config.variables` (`v8 = 14.6.202.34-node.40`, `node = 26.12.1`, `v8_enable_pointer_compression = 0`, `v8_enable_maglev = 1`).
- `--help --v8-options` default thresholds: `--invocation-count-for-feedback-allocation=8`, `--invocation-count-for-maglev-osr=100`, `--invocation-count-for-maglev=400`, `--invocation-count-for-osr=500`, `--invocation-count-for-turbofan=3000`, `--turboshaft` default ON, `WebAssembly.Suspending` live `'function'`.
- `%IsSmi(...)` & `%DebugPrint(0.5)`: verified 32-bit signed Smi range `[-2147483648, 2147483647]` and 16-byte `HeapNumber` instance size on host Node.
- `%HaveSameMap`, `%HasFastProperties`, `%DebugPrint(new Point)`: verified `{x, y}` vs `{y, x}` Map fork, `delete` dictionary fallback, and slack tracking shrinking from `104 B / 10 slots` (call 1) to `40 B / 2 slots` (call 7).
- `%DebugPrint(getX)` LoadIC state progression: 1 shape `MONOMORPHIC`, 2–4 shapes `POLYMORPHIC`, 5+ shapes `MEGAMORPHIC`.
- `--print-bytecode --print-bytecode-filter=addXY`: verified 13-byte bytecode with exact opcodes (`GetNamedProperty`, `Star0`, `Add`, `Return`).
- `--trace-opt --trace-deopt`: verified `MAGLEV` background compilation and `[bailout (kind: deopt-eager, reason: wrong map)]`.
- `%HasSmiElements`, `%HasDoubleElements`, `%HasHoleyElements`, `%HasFastPackedElements`: verified all transitions on `[1, 2, 3]` -> `.push(1.5)` -> `[5]=2.5` -> `.push('hi')` -> `.length=3` (no upward revert).
- `v8.getHeapStatistics()` & `v8.getHeapSpaceStatistics()` + microtask vs macrotask order (`main.js (sync) > nextTick > Promise.then > queueMicrotask > setImmediate > setTimeout(0)`).

## Measured host timings (Apple arm64, macOS, Node v26.12.1 / V8 14.6.202.34-node.40, 2026-11-21)

- `sumLoop(100)` across 50,000 calls (`--max-opt=0..3`): Ignition `700.0 ns/call`, Sparkplug `286.3 ns/call`, Maglev `37.9 ns/call` (`0.062 ms` compile), TurboFan `34.5 ns/call` (`0.456 ms` compile).
- `getX(o)` IC benchmark across 1,000,000 calls: 1 shape `1.38 ns`, 2 shapes `1.87 ns`, 4 shapes `1.88 ns`, 5 shapes `3.00 ns`.
- Array sum benchmark (1,000 elements × 5,000 runs): `packed_smi` `0.25 ns/elem`, `packed_double` `0.55 ns/elem`, `holey_double` `1.59 ns/elem`, `dict` `9.88 ns/elem`.
- `--trace-gc` Scavenge pauses: `0.03–0.21 ms`; fresh isolate `new_space` `524,288 B`, `old_space` used `3,121,952 B`, `heap_size_limit` `4,395,630,592 B` (~4.09 GiB).

## Frontier sources & dates (will go stale)

- V8 `14.6.202.34-node.40` flags (`--maglev`, `--turboshaft`, `--no-turbolev`, `--no-minor-ms`) and `WebAssembly.Suspending`: checked 2026-11-21 on host `/opt/homebrew/bin/node`.
- *The V8 Sandbox* (`v8.dev/blog/sandbox`), published 2024-04-04 (Chrome 123).
- *Land ahoy: leaving the Sea of Nodes* (`v8.dev`), early 2025.
- *Maglev — V8's Fastest Optimizing JIT* (`v8.dev`), 2023 (Chrome 117+).
- *JavaScript Promise Integration (JSPI)* (`v8.dev` / W3C WebAssembly), Chrome 137+ & Node v26.12.1.

## Checked / not checked

- Checked: `tools/diagrams.cjs`, `scripts/build-pages.cjs`, `--print-budgets` (all SVG labels <= 89%), `tools/crosscheck.cjs` (47/47), `tests/models.cjs` (all bindings, copy parity, dynamicKeys, zero CJK in en, unprefill CJK check, REGISTRY alias & anchor checks).
- Not checked by this subagent (run serially by coordinator): Playwright `tests/browser.cjs` and `tests/canvas-text-overlap.cjs --sweep`.
- Note on Chrome pointer compression: since host Node builds with `v8_enable_pointer_compression=0`, Chrome 32-bit compressed object sizes (`12 + 4n` B) and 31-bit Smi bounds (`±2^30`) are verified from V8's published Pointer Compression specification (`v8.dev/blog/pointer-compression`) rather than a separate Chromium binary probe.
