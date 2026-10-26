# Knowledge galaxy · Codex

Route: `/atlas/galaxy.html` (same static Visual website).
[Feature spec](../../specs/atlas-galaxy.md) is the behavior and regression contract.

The feature consumes `window.ATLAS` from existing `atlas/data.js` and imports the existing
vendored Three.js/OrbitControls. No graph, shared controller, build system or dependency changes.
`layout.mjs` is pure; `renderer.mjs` owns/disposes only the 3D scene; `app.mjs` owns this route's UI.
The existing 2D/list atlas and real lessons are linked, not copied.

## Integration

1. Cherry-pick the final worker commit chain onto the integration branch (SHA in handoff).
2. `git apply --check atlas/galaxy/integration.patch`, then apply it (or preserve these exact
   insertion points if the concurrent atlas header changed). It adds a prominent entry immediately
   below the atlas header and a 3D entry beside Map/List. No hidden-demo-only acceptance.
3. Add `provenance-inventory-entry.json` as `pages["atlas/galaxy"]` in `page-provenance.json`.
   Keep the feature's exact source SHA. Do not overwrite the atlas's independent source record.
4. Run the feature checks and existing atlas smoke, review rendered entry in both languages.
5. Parent handles independent review, main merge and verified publication. Worker does not push/deploy.

## Reproduce self-checks

From repository root:

```sh
node atlas/galaxy/tests/core.cjs
python3 -m http.server 18783 --bind 127.0.0.1
NODE_PATH=/Users/songyy/Documents/integ-life/integ-games/node_modules \
  ATLAS_BASE_URL=http://127.0.0.1:18783 \
  GALAXY_EVIDENCE=/tmp/atlas-galaxy-evidence \
  node atlas/galaxy/tests/browser.cjs
```

Playwright is reused read-only from the already installed local workspace; point `NODE_PATH`
at your existing installation on another machine. Chrome is required by the browser suite.
Run browser suites serially against this lightweight static server.

Tests cover graph determinism and shortest paths, exact real graph counts, label/UI screenshots,
selection/neighbor/path navigation, Back and real lesson anchors, keyboard camera controls,
ordinary scrolling, reset while rotating, offscreen loop suspension, repeated mount/dispose,
language, reduced-motion/forced-colors, mobile touch gestures and DPR, context-loss, blocked
WebGL, low-power, storage denial, empty and isolated graphs, and JS-disabled links.
Screenshots must be inspected. No physical-phone/Safari/screen-reader speech or learning-gain claim.

Integration note: the entry patch is applied once in the current integrated source. Do not reapply it to an already-wired index. `tests/integration.cjs` now verifies the existing entries read-only; it does not patch or restore product files. The primary implementation provenance remains d8b1b2d7 and the shared inventory records the additional integration-fix revision.

## Contextual signal-route entry

Related concept cards derive a matching station from the existing Atlas signal
trail, retaining direct lessons. Read [connector contract](../../specs/galaxy-signal-connector.md)
before changing links/locale/Back behavior. No new graph or renderer is introduced.
The old integration.patch is historical handover material; do not reapply it over
the integrated Atlas. Current production status comes from visual-release.json.
