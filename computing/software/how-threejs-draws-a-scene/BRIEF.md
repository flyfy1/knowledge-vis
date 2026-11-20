# BRIEF — how-threejs-draws-a-scene

Author: Claude Code (claude-opus-5-5), 2026-11-20. Task: specs/essay-briefs/TASK-software-series.md, W1.
Status: unregistered draft (page.json has no registry fields; the build's draft warning is expected). English is a
full translation (no stub marker). Independently reviewed 2026-11-20; see "Review" at the end.

## Pinned release

three.js r187 = npm `three@0.187.0`, commit `7e89746a687bb88271253698fa108b1dd59825d0`, released 2026-10-30.
Installed for reading and the crosscheck at `/tmp/agent-tasks/software/how-threejs-draws-a-scene/three-install`
(scratch, not in the repo). Every "file:line" below is in that package's `src/` unless it says otherwise.

## What the page is

14 chapters, 13 models (labs), 11 static SVG diagrams and 1 static code block. The page loads no library: models.js
reimplements the algorithms; app.js draws on 2D canvases. Nothing animates on its own.

1. One line of code, the layers below it (Fig 1: dg-stack).
2. Scene graph and world matrices (lab: orrery; Fig 2: dg-tree).
3. BufferGeometry (lab: box / sphere counts and bytes; Fig 3: dg-quad).
4. Camera, projection, depth (labs: a point through the chain; depth precision; Fig 4: dg-frustum).
5. Inside render(): cull and sort (lab: top view; Fig 5: dg-render).
6. Material → shader program (lab: six materials, live cache keys; Fig 6: dg-program).
7. One pixel's colour, the BRDF (lab: shaded sphere, energy lost; Fig 7: dg-brdf).
8. Rasterisation and the depth test (lab: 64 × 40 software rasteriser; Fig 8: dg-edge).
9. Textures, mipmaps, filtering (lab: oblique floor; Fig 9: dg-mip).
10. Shadow maps (lab: side view, acne and leaks; Fig 10: dg-shadow).
11. Draw calls, instancing, batching, demos/fable-flight (lab: four strategies; Fig 11: dg-calls).
12. Picking and rotations (labs: Raycaster on an ellipsoid; Euler vs slerp).
13. Frontier: WebGPU and the TSL path (dated facts below).
14. Closing.

## Changes from the brief, and where r187's source contradicted the usual telling

- Matrices: `Object3D.DEFAULT_MATRIX_AUTO_UPDATE = true` (core/Object3D.js 1707); `updateMatrixWorld` (1186) calls
  `updateMatrix` (1154) for every node every frame. There is no dirty flag on local matrices; only
  `matrixWorldNeedsUpdate` gates the parent product, and it is set by updateMatrix. The root Scene copies its
  matrix instead of multiplying, so a 6-node tree does 6 composes and 5 world products. Setting
  `matrixAutoUpdate = false` saves only the compose; the world product still runs because the root forces it. The text says this instead of "only changed nodes are recomputed".
- Opaque sort: `painterSortStable` in renderers/webgl/WebGLRenderLists.js orders by groupOrder, renderOrder,
  material.id, then z, then id. Material grouping comes before depth. The transparent sort has no material key. The
  WebGPU common RenderList.js `painterSortStable` (14–35) has no material.id key; stated in ch13.
- Program keys include the light counts (renderers/webgl/WebGLPrograms.js 351, 358) for every lit material and, through
  `numDirLights` etc., also for MeshBasicMaterial. But WebGLRenderer.setProgram only re-fetches a program on a
  light-state change for lit materials (`materialNeedsLights`), and on a fog change only if `material.fog`; so the sky
  (Basic, fog: false) keeps its program (review 2026-11-20, measured in Chromium). Fog enters as
  `!!scene.fog` (324) and `material.fog` (325); toneMapping only when material.toneMapped and the target is null
  (179–185).
- Ray–triangle: `Ray.intersectTriangle` is the Woop–Benthin–Wald watertight test since r186 (PR #33661, merged
  2026-06-25), not Möller–Trumbore.
- Shadows: `PCFSoftShadowMap` is removed in r187: renderers/webgl/WebGLShadowMap.js 99–102 warns and falls back to
  PCF. Defaults (86–89): autoUpdate true, needsUpdate false, type PCFShadowMap. fable-flight (three r170) still sets
  PCFSoftShadowMap (demos/fable-flight/index.html 103); the text says it would now fall back.
- BRDF: the visibility term is the height-correlated Smith form from the Frostbite course notes (Lagarde & de
  Rousiers 2014), cited in shaders/ShaderChunk/lights_physical_pars_fragment.glsl.js 144. D_GGX cites Walter 2007 eq. 33.
  Multi-scatter compensation (Turquin link at lights_fragment_begin.glsl.js 67) is on by default; the lab can turn it
  off.
- Reversed depth: a renderer option `reversedDepthBuffer` (renderers/WebGLRenderer.js 84; enabled at 455 only with
  EXT_clip_control). Textures get DEPTH_COMPONENT24 unless the depth texture is FloatType, then DEPTH_COMPONENT32F
  (renderers/webgl/WebGLTextures.js 257–292). With the canvas's own 24-bit depth, reversed Z gains almost nothing (Reed
  2015, "Depth Precision Visualized"). The lab models the reversed case with a 32-bit float buffer and says so.

## Other claims and where they come from

- render() order: renderers/WebGLRenderer.js updateMatrixWorld 1667, frustum from projection × view 1698,
  projectObject 1873 (definition), sort 1731, shadowMap.render 1750, renderScene 1799 (definition 1991).
- Frustum.intersectsObject (math/Frustum.js 146) computes a missing bounding sphere on first use; InstancedMesh
  computeBoundingSphere (objects/InstancedMesh.js 156/270) covers all instances; BatchedMesh has perObjectFrustumCulled
  (216) and sortObjects (226).
- getProgramCacheKey: WebGLPrograms.js; the lab's key builder is a copy and is crosschecked string for string.
- DFG table: the lab integrates the split-sum table itself and matches three's half-float table bit for bit.
- Geometry counts: BoxGeometry 24 vertices / 12 triangles; SphereGeometry(32,16) 561 / 960 (crosschecked).
- sRGB: ColorManagement conversion (crosschecked at 0.5).
- fable-flight: three 0.170.0 (index.html 49); 24,000 pages (81); PlaneGeometry(1, 1, 3, 5) instanced (420);
  frustumCulled false (515); shadow map 4096², bias −0.0006, normalBias 0.06 (332–334); autoUpdate false (104).
- Frontier (ch13), from the gpuweb wiki "Implementation Status" (page updated 2026-10-02), opened 2026-11-20: Chrome
  113 on Windows/macOS/ChromeOS, Android 121, Linux 144 (Intel Gen12+) and 147 (NVIDIA on Wayland); Firefox 141 on
  Windows (July 2025), 145/147 on macOS, Linux expected 2026; Safari 26. W3C Candidate Recommendation Draft dated
  16 Nov 2026. three's WebGPU drawing-pipeline change cited as PR #35191 (merge date not verified, see below).

## Crosscheck (tools/crosscheck.cjs, run 2026-11-20 against the pinned install): 54/54 agree

`node tools/crosscheck.cjs /tmp/agent-tasks/software/how-threejs-draws-a-scene/three-install`

| Compared | Inputs | Tolerance | Result |
|---|---|---|---|
| Matrix4.compose, invert | 200 random TRS | 1e-12 | max 0 |
| Quaternion.setFromEuler | XYZ | 1e-15 | 0 |
| orrery moon matrixWorld | days 0, 0.7, 2.3 | 1e-12 | 0 |
| stale vs fresh matrixWorld | before/after update | 1e-12 | 0 |
| BoxGeometry position / index / counts | 3 sizes | 1e-7 / exact | max 1.19e-8 |
| SphereGeometry position / index / index type | (8,6), (32,16), (256,255) | 1e-6 / exact | max 2.98e-8 |
| projectionMatrix, normal and reversed | default camera | 1e-12 | 0 |
| lookAt, Vector3.project | — | 1e-12 | 1.25e-16 |
| Frustum planes | 4 camera yaws | 1e-12 | 1.78e-15 |
| Frustum.intersectsSphere decisions | 72 | exact | 72/72 |
| WebGLRenderList opaque and transparent order | 2 cameras | exact | same |
| sort key z = clip z of the centre | — | 1e-12 | 0 |
| getProgramCacheKey strings | 18 material × state | exact | 18/18 |
| DFG table half-float bits | 512 values | exact bits | 512/512 (max 2.44e-4 vs decoded) |
| Raycaster first hit face / distance | 400 rays | exact / 1e-6 | 400/400, 5.47e-7 |
| Quaternion.slerp incl. the lerp branch | 6 cases | 1e-12 | 0 |
| linear → sRGB | 0.5 | 1e-12 | 0 |

The crosscheck imports build/three.module.js plus WebGLRenderList and WebGLPrograms from src/ (with stubbed
dependencies). Not crosschecked: `getParameters` itself. The lab's parameter object is a simplified model of it (only
the fields that change between the six materials); only the key builder is compared.

## Measured timings (tools/measure-calls.cjs)

Apple M6, macOS 27.2.1, Chromium 151.0.7922.34 headless, ANGLE Metal, three r187, 2026-11-20. Main-thread ms per
`render()`, averaged over 60 frames. Four runs agree within about ±30%; the last is stored as `MEASURED` in models.js.

| N | separate | own geometry + material | instanced | instanced, all moving | BatchedMesh |
|---|---|---|---|---|---|
| 100 | 0.047 | 0.063 | 0.002 | 0.012 | 0.013 |
| 1000 | 0.320 | 0.610 | 0.002 | 0.022 | 0.047 |
| 4000 | 1.198 (3648 calls, rest culled) | 3.810 | ≈0 | 0.060 | 0.140 |

Per call: 0.32–0.45 µs shared material (0.44–0.49 µs including gl.finish); 0.61–1.04 µs with its own geometry and
material (up to 1.58 µs including finish). Compile: first frame with 1 new MeshStandardMaterial program 96.1 ms; 10 new
programs 35.6 ms (3.6 ms each). These are one machine's numbers; the text says so wherever they appear.

## Tuned parameters (chosen to show the effect, not from three.js)

- ORRERY: earth orbit 5, moon orbit 2, moon rate 12× the earth's.
- CULL_SCENE (12 + 6 objects, 4 materials, 1 transparent) and the ch5 defaults: yaw −0.3, fov 50, far 18 (gives one
  sphere-pass-but-invisible case, 3 material switches sorted vs 10 unsorted).
- DEFAULT_CAM aspect 16/9, 1280 × 720 viewport; the ch4 point (1, 0.5, −10). fov 50, near 0.1, far 2000 are three's
  PerspectiveCamera defaults.
- LAB_MATERIALS: six materials (floor, wood, brass, glass, sky, leaves).
- ch7: colour, light direction and intensity of the shaded sphere.
- RASTER: 64 × 40, the three scenes (pair, checker, glass) and their geometry.
- ch9 floor: 96 × 56, checker repeat 0.25, maxAniso 8.
- SHADOW_SCENE: ground, post (x −2.6…−2.4, height 2), box (0.5…2, height 1.2), ramp; resolution and bias ranges.
- CALL_DEFAULTS: 1 µs per call (round figure at the top of the measured range), 0.015 µs per moving instance, 0.035 µs
  per batch item, budget 1000/60 ms. The ch11 slider lets the reader change the per-call cost.
- ch12: the ellipsoid mesh (352 triangles), the two slerp orientations (148.4° apart).

## Checked / not checked

- Checked: every number above by the crosscheck or by measurement; tests/models.cjs (191 checks) pins the bound numbers
  and re-derives key ones independently (brute-force hemisphere integral for E(μ=1) at roughness 1 = 0.307, i.e. 69%
  lost; 8% at roughness 0.5). tests/browser.cjs drives every live-sentence branch and checks layout at 1280/390/320.
  Screenshots of every diagram and model viewed at 1280, 390 and 320.
- Not checked: the merge date of three.js PR #35191 (WebGPU drawing pipelines) and whether it is in r187; the gpuweb
  wiki is a community page, not a vendor statement. Timings on other GPUs or browsers. The English text (stub).
- Aliases: scratch script checked 192 terms against 11,237 existing ones; "sRGB 和线性" / "sRGB vs linear" removed
  because how-pixels-reach-a-screen#framebuffer owns them.

## Test runs (2026-11-20, final state)

- `node scripts/build-pages.cjs <dir> --check`: outputs match; two expected warnings (unregistered draft, en stub).
- `node tests/models.cjs`: 191/191.
- `node tools/crosscheck.cjs <install>`: 54/54.
- `tests/browser.cjs` on port 18961: 132/132 (zh at 1280/390/320; English sweep skipped because it is a stub).
- `tests/canvas-text-overlap.cjs --sweep`: PASS, 1800 canvas states. The first run found the ch2 "月亮" label
  colliding with "太阳" when the earth scale is at least 1.475; the sun label now goes on the side away from the moon.
- Screenshots of all 11 diagrams and 13 models at 1280, 390 and 320 viewed (scratch, not in the repo).

## Registrar notes

- zh title: Three.js 是怎么把一个场景画出来的. en title: How Three.js Draws a Scene.
- Needs a new subtopic `computing/software` (软件原理 / How Software Works) in pages.config.js before registering.
- REGISTRY.json has 14 concepts, anchors #ch1–#ch13.

## Review

Independent review 2026-11-20 (Claude Code, claude-opus-5-5):
[specs/reviews/how-threejs-draws-a-scene-review-20261120.md](../../../specs/reviews/how-threejs-draws-a-scene-review-20261120.md).
It corrected the ch6 recompile claims and model, the ch2 world-product count and matrixAutoUpdate saving, the DFG
attribution (65% read from the table, 69% from the integral), the ch11 fable-flight arithmetic, the WebGPU and
PR #35191 facts (PR #35191 is merged and in r187), and the English text and diagram labels. The test counts and
statements above that the review contradicts are superseded by the review file. page.json version is now 20261120b.
