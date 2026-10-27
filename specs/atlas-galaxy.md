# Atlas galaxy — Codex edition contract

Feature route: `/atlas/galaxy.html`. Edition `codex-galaxy-20261026-v1`.
Base: `93346e21`. This is a presentation of the existing Mathematics & Physics atlas,
not a replacement curriculum, whole-site graph, separate service or new knowledge source.
Implementation lives in `atlas/galaxy/`; `atlas/data.js` remains authoritative.

## Learning / discovery brief

- Known: the learner recognizes a topic, or can search for one in either language.
- Question: how does this concept connect to other concepts, and where can I learn why?
- Input: actual editorial nodes, directed relation statements, explanations and source URLs.
- Action: rotate to inspect the constellation, select a planet or list button; bright edges
  expose direct neighbors. Open a relation explanation, or open the real linked lesson.
- Path action: “Trace connections from here”, then select another concept. The amber dashed
  path and exact connection count show the shortest recorded connection chain.
- Conclusion: graph relationships provide ways to explore, not a mandatory learning order
  or an estimate of conceptual difficulty. The links remain the evidence for each claim.

Terminology is defined beside the scene: planet = concept, constellation color = editorial
region, line = documented relation, hop = one graph connection. Decorative background specks
are explicitly distinguished from concepts. No orbit, mass, size, speed or glow measures
importance, mastery, scientific similarity or physical motion.

## Layout semantics and determinism

`layout.mjs` sorts IDs, initializes positions from stable ID hashes around topic anchors,
and runs exactly 360 bounded stress-relaxation iterations. All real relation types have
unit length and are treated as **undirected for layout and path finding only**. The detail
panel preserves each original relation's directed statement, type, reason and source.
No `foundation` relation is reclassified as a prerequisite.

For a connected pair with shortest path h, the target Euclidean distance is
`11 + 9 × (min(h, 6) − 1)` in arbitrary view units; pair stress weight is
`1 / min(h, 6)^2`. Disconnected pairs target 65 units with weight .009. Topic anchors apply
weak .012 attraction and do not invent graph edges. Targets are approximate and constrained
by 3D embedding, grouping and finite iterations; individual pairs need not respect hop order.
The six-hop cap deliberately limits map extent. Exact shortest paths in the panel are not
capped. No universal distance units or literal prerequisites are claimed.

Node ordering, input edge ordering, reload and language changes must preserve the layout.
Camera operations never rerun the layout. All spheres have equal world radius 1.25; perspective
changes apparent size. Topic colors repeat only if the source supplies more than five regions.
Unknown-endpoint edges are ignored defensively; no ghost node is invented.

## Interaction and state

- Mouse drag rotates; right drag pans. Buttons and Ctrl/Meta+wheel zoom with bounded distance
  20–210. Normal wheel scroll propagates to the page.
- Keyboard on focused canvas: arrows rotate, +/− zoom, 0 resets. Every actual concept is also
  a native list button, with search and topic filtering; Enter selects and focuses details.
- On touch devices, default canvas behavior permits page scrolling. “Interact with 3D” explicitly
  enables one-finger rotation / two-finger zoom-pan; an always visible Done control restores scroll.
- Selected planet gets a ring; its neighbors and incident lines are emphasized. Amber dashed
  route lines are separately identified. Labels use projected overlap rejection, with selection
  and neighbors prioritized; source details and list remain complete when labels are culled.
- Focus selected keeps orientation while moving camera target. “Reset view” resets only the
  camera, ends rotation and exits touch interaction; it does not pretend to reset graph/filter data.
- Optional slow rotation is camera motion, off initially. Reduced motion disables it, including
  live preference changes. Language changes preserve node, path origin, query and view.
- Selection/path origin use history entries; filters use replaceState. Node, query, topic, path
  origin and low-power mode round-trip through URL. Camera persists in history state for Back.
  Linked sources retain their actual original URLs and section anchors. No replacement lessons.
- Details and URLs must handle empty graphs, singleton/isolated nodes, invalid node IDs and no
  search matches without a renderer failure or fabricated connection.

## Performance, lifecycle and fallback acceptance

Reuse the repository's vendored Three.js/OrbitControls from `day-night-rotation/vendor/three`.
No CDN, dependency installation, external API, key, remote request or runtime graph service.
The data remains 38 nodes / 47 edges at this source base; this is intentionally a small graph
renderer, not a benchmark claim for thousands of concepts.

- Render on demand; no perpetual frame loop while idle. Optional rotation stops rendering when
  document hidden or scene offscreen. Intersection/resize observers and event listeners are disposed.
- Mobile DPR ≤1.25; desktop DPR ≤1.7; 280/620 decorative points, shared sphere geometry,
  no postprocessing, no shadows, no texture downloads. Acceptance target: ≤160 draw calls and
  ≤60 geometries for this source graph, one shared glow texture, stable across four remounts.
  Real hardware frame rate/battery behavior must not be inferred from emulated browser tests.
- Manual low-power mode fully unmounts WebGL, retains all list/detail/navigation functionality.
  Save-Data or ≤2 logical processors default to list; users can opt into 3D. No forced GPU loop.
- Renderer initialization/import failure and context loss show an explicit fallback with the list
  and existing 2D atlas still reachable. No endless automatic context-recovery loop.
- Pagehide tears down GPU geometries/materials/texture, controls, events, observers and RAF.
  Persisted pageshow remounts exactly once. Generation token invalidates late asynchronous imports.
- Native list, high contrast text, focus outlines, normal page scroll, two languages, ≤320px fit,
  reduced motion and forced colors are required. JS-disabled page retains static attribution and
  links to the existing atlas and a real lesson. Screen-reader speech remains a manual review item.

## Discoverability and provenance

The integrator must apply `atlas/galaxy/integration.patch`: a prominent bilingual entry directly
below the atlas header and a third entry beside Map/List, plus this spec in the spec index.
The feature is not complete as a published experience until this overview entry is reachable.
The patch only adds a scoped stylesheet and links; it does not change `app.js`, graph data,
existing routes, lesson controllers, or the shared page registry.

Header uses the existing static provenance disclosure contract. It identifies Codex, retains
prior graph contributors, states the edition and links the exact implementation revision.
`atlas/galaxy/provenance.json` records the feature source and limits. The integrator adds the
provided feature provenance record to the shared inventory; do not rewrite other pages' records.
A GitHub source link is not a runnable historical alternative. No Claude comparison URL is
invented. Future alternatives must keep this route and source intact.

## Regression findings / prevention (2026-10-26)

- Projected topic labels can overlap planet labels if only nodes participate in collision checks.
  Both label classes must share a collision list, actual text dimensions and viewport clipping.
  Inspect desktop/mobile scene screenshots, not only DOM counts.
- Narrow portrait framing must back the initial/reset camera out (155 vs 125 units) so the
  constellation overview is not clipped at the side. Camera orientation remains stable during
  normal interactions; every concept is also reachable from the list. Inspect 390px capture.
- Device-default low-power must encode an explicit `low=0` opt-in, so a reload does not silently
  override the user’s enabled 3D view. Test with two logical processors.
- Canvas keyboard `0` must reset both renderer rotation and the visible pause/rotation state,
  and leave touch control in page-scroll mode. A test exercises rotation → keyboard reset.
- Test lesson destinations must match actual source sections (convolution is `#step2`), not guessed
  chapter numbers. Browser navigation plus the target DOM anchor is checked before Back.
- Reduced-motion media events are asynchronous in browsers. Acceptance waits for the event's
  disabled control state, then checks the scene; a zero-delay assertion is not evidence of failure.

## Verification and handoff

Commands: see `atlas/galaxy/README.md`. Automated evidence and screenshot inspection:
`specs/reviews/atlas-galaxy-20261026/verification.md`. Code self-check is not independent acceptance.
Parent owns independent review, integration, main merge, publication and production verification.
No worker push/deploy. Original dirty checkout remains untouched.

## Integrated test safety

Current concept-to-task navigation follows [Galaxy signal connector](galaxy-signal-connector.md).
It adds a contextual route entry over the real graph and preserves the direct lesson
link; it is not a new physics engine, prerequisite ranking or mastery signal.

Apply the supplied integration patch deliberately in an isolated integration checkout. Browser acceptance tests must only inspect the already-integrated runtime; they must not apply/revert patches or rewrite shared atlas/index/spec files. Preserve concurrent Eigen source corrections and spec-index additions when wiring entries.

Integration keyboard guard: Alt/Ctrl/Meta keyboard combinations retain browser shortcuts; only unmodified camera keys are handled. The explicitly documented Ctrl/Meta+wheel gesture remains a camera zoom action.

## Codex iteration — list orientation (2026-10-28)

The concept list exposes each node's **direct connection count** beside its editorial topic
and includes the same count in the button's accessible name. This is a graph-degree cue for
choosing a next concept when the 3D scene is unavailable, filtered, or still loading. It is
not a ranking, importance score, mastery signal, prerequisite count, or distance estimate.
Counts derive from the authoritative `data.js` edges after invalid endpoints have been
discarded by `graphModel`; each undirected edge contributes one to both endpoint counts.

Acceptance: both locales show the localized count for every real node, isolated nodes show
zero, search and topic filtering retain the count, and the low-power/WebGL fallback list
remains complete. The 3D renderer and graph layout remain unchanged. Verify the count from
the same data used for the rendered graph and keep the existing list, keyboard, focus,
source-link and no-JavaScript contracts intact.
