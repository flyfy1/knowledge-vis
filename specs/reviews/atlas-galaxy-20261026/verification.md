# Galaxy v1 — local verification and integration handoff

Date: 2026-10-26. Base: `93346e21`. Worktree:
`/tmp/knowledge-vis-galaxy-20261026`, branch `codex/atlas-galaxy-20261026`.
Status: implementation and self-check complete; independent integration review and publication pending.
No push/deploy performed. The original dirty checkout was not modified.

## What shipped in this feature

- `/atlas/galaxy.html`: dedicated overview within the existing static website.
- `atlas/galaxy/{app,renderer,layout}.mjs`: bilingual UI and URL/history, owned WebGL lifecycle,
  deterministic graph-distance embedding. All 38 actual concepts / 47 actual edges retained.
- Existing vendored Three.js/OrbitControls reused read-only; no external runtime requests.
- Equal-radius shaded planets, colored topic groups, visible neighbor links, selected ring,
  cullable labels, decorative star backdrop; optional slow camera rotation is off by default.
- Direct-neighbor explanations and source links, exact shortest-path counts and dashed traces,
  real existing lesson navigation. List/search/2D access remains available.
- Scoped CSS, provenance, integration patch, feature spec and reproducible tests.

## Evidence

Commands from repository root, serial browser runs:

```
node atlas/galaxy/tests/core.cjs
NODE_PATH=/Users/songyy/Documents/integ-life/integ-games/node_modules node atlas/galaxy/tests/browser.cjs
NODE_PATH=/Users/songyy/Documents/integ-life/integ-games/node_modules node atlas/galaxy/tests/integration.cjs
```

Server: `python3 -m http.server 18783 --bind 127.0.0.1`.

- Core: **3,236 assertions**, deterministic under node/edge reordering, finite positions,
  real-edge shortest paths, disconnected/isolated/singleton/empty inputs. [Machine report](core.json).
- Browser: **77 assertions**, **zero page errors**, no remote runtime requests. [Machine report](browser.json).
- Desktop selection, direct relation, path tracing, real convolution `#step2`, Back and restored
  origin; English/Chinese, cross-language search and empty search; keyboard list/camera/reset;
  real sphere raycast; mouse rotation and right-drag pan; normal scroll propagation.
- Four mount/dispose cycles: one canvas on mount, no canvas/RAF after unmount, stable GPU resource
  counts. Idle: no RAF; offscreen rotation stops advancing frames. Context-loss fallback/retry works.
- Measured desktop scene: 125 draw calls, 51 geometries, one glow texture; default is on-demand.
  Mobile DPR capped at1.25. These are browser observations, not real-phone FPS/battery claims.
- Mobile390×844, DPR3 emulation: one-finger rotation and two-finger pinch/pan via Chrome touch
  events change camera, Done restores pan-y, real complex-number `#step4` navigation and Back.
- 320/390/768 widths without page overflow; 200% root font-size no overflow (not a screen-reader
  or browser-zoom certification); forced-colors focus, live reduced-motion disabling.
- Blocked WebGL, explicit low-power, two-core device default and opt-in persistence, blocked
  localStorage, invalid URL selection, empty/isolated graph and JS-disabled static links.
- Synthetic persisted pagehide/pageshow verifies disposal/remount; ordinary lesson Back was also
  exercised. This does not claim every real browser's BFCache lifecycle was tested.
- Integration patch: applied to this worktree temporarily, both overview entries clicked, atlas
  return and bilingual mobile fit checked; shared files restored byte-for-byte afterward.

## Visual inspection

Actual screenshots were opened and inspected by the implementing agent:

- [Desktop constellation and source panel](desktop-scene.png): readable selected concept,
  distinguishable topic colors, luminous neighbor edges, restrained background, no text overlaps.
- [Shortest-path state](path-scene.png): amber trace connects actual Fourier/convolution endpoints;
  source panel exposes the exact path and directed relationship meaning.
- [Mobile constellation](mobile-scene.png): revised portrait camera frames all planet centers;
  buttons wrap, scene preserves a scroll-exit control, explanation and legend remain readable.
- [Desktop overview discovery](atlas-entry-desktop.png) and [mobile discovery](atlas-entry-mobile.png):
  prominent bilingual entry appears directly after the existing atlas header and before route cards.
  A second 3D link is beside Map/List. Existing atlas remains functional.
- Full captures, reduced-motion Chinese view, touch-transformed camera and WebGL fallback were
  generated under `/tmp/atlas-galaxy-evidence`; selected durable captures are committed here.

The layout's mean Euclidean distances for1–5 hops are12.348,19.931,27.764,34.907,42.858 arbitrary
units. Individual pairs need not follow this order; the layout caps target distances at6 hops and
weakly groups topics. The visible explanation explicitly disclaims exact/scientific distance.

## Integration instructions / remaining gates

1. Cherry-pick both implementation and provenance commits listed in final worker handoff.
2. Apply `atlas/galaxy/integration.patch` after `git apply --check`; it touches only atlas entry HTML
   and the spec index. No graph data, atlas app.js, lesson or shared runtime changes.
3. Merge the scoped `provenance-inventory-entry.json` under `pages["atlas/galaxy"]` in the existing
   `page-provenance.json`. Keep its implementation source revision; do not relabel prior work.
4. Perform independent learner/visual review and integrate with concurrent work, then parent merges
   to main and publishes. Verify the overview entry, actual galaxy assets, source revision, both
   languages and a lesson/Back round trip on the final public website.

Limits: no physical-phone, Safari, screen-reader speech, learning-gain or production acceptance.
No blocker or denied/pending approval remains. Initial filesystem/browser sandbox restrictions were
resolved through approved isolated worktree, local-only server and headless browser execution.
Managed-worktree tool was unavailable for this task type; git created the explicit isolated worktree.
No local AI inference runtime was started. Test browsers closed; local test server stopped at handoff.
