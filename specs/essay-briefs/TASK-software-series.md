# Task: software series (软件核心原理)

Requested by Yangyu on 2026-11-20: "我希望做一个 软件核心原理 介绍系列。我们可以首先以 ThreeJS 开始。"

Each essay takes one widely used piece of software and explains the handful of ideas that make it work, at the level
of its real data structures and algorithms. The reader has used the software (or something built on it) and wants to
know what happens inside one call. It is not a tutorial and not an API tour.

## Status (2026-11-20, updated at W1 registration)

| | Page | State |
|---|---|---|
| W1 | `how-threejs-draws-a-scene` Three.js 是怎么把一个场景画出来的 | built, reviewed (specs/reviews/how-threejs-draws-a-scene-review-20261120.md) and registered on `main` 2026-11-20 (f75ec123 essay, f118add3 registration, 168d2ce0 atlas and aliases); awaiting push and deploy |
| W2… | see "Candidates" | not started |

## Where it lives

New subtopic `computing/software` (软件原理 / How Software Works); the registrar adds it to `KNOWLEDGE_SUBTOPICS`.
Stage: university. Atlas region `computing`. Series ids W1, W2, …

## What every essay in the series does

- **One call, followed all the way down.** The hero picks one line the reader has typed (`renderer.render(scene,
  camera)`, `git commit`, `SELECT … WHERE`, `setState`) and every chapter is one stage of what that line sets off.
- **The software's own structures, by name.** Chapters name the real classes, files and functions and say which
  release they were read from. The builder reads the source at one pinned release tag and records the tag, the files
  and the lines in BRIEF.md. Nothing about internals is written from memory or from blog posts.
- **Models are the real algorithm at small scale.** `models.js` reimplements the core (the actual matrix chain, the
  actual sort key, the actual B-tree split) in a few hundred lines, and the page runs it. The page does not load the
  software itself: no libraries, as in STANDARD.md §4.
- **Checked against the real thing.** A script in `tools/` installs the pinned release under
  `/tmp/agent-tasks/software/<slug>/` and compares the page's models with the software's own output on the same
  inputs (matrices, sort order, culling decisions, hashes, …). BRIEF.md records what agreed, to what tolerance, and
  what could not be compared. `tests/models.cjs` itself stays dependency-free and pins the numbers the comparison
  confirmed.
- **Version-dependent facts carry the version.** "As of r1xx" beside anything a release could change; a frontier
  chapter with dated facts, established / demonstrated / claimed kept apart (HANDOFF.md §4).
- **No advice on which library to pick**, no comparison shopping between competitors. Where a design choice has a
  cost, the model shows the cost.

## Briefs to follow (all essays)

- `specs/essay-briefs/STANDARD.md` (incl. §4a diagrams: at least six static SVG diagrams), `BRIEF-COMMON.md`,
  `BRIEF-DEEP.md`, `BRIEF-BATCH3.md`, `specs/essays.md`, and `specs/site-template.md` §4–§9a. Write the essay
  directly in the Markdown template (`content.zh.md`, `page.json` with `"layout": "essay"`, `figures/`, `page.css`,
  `bindings.cjs` for prose numbers). Structural model: `computing/systems/how-a-cpu-does-math/`, every file.
- Chinese first; `content.en.md` is a structural stub with `"languages": {"en": "stub"}` until the Haiku
  translation. Hand the translator the `--print-budgets` listing.
- Work only in your directory. No commits, no `git add/stash/reset/clean`, no `rm` or any delete command. Scratch in
  `/tmp/agent-tasks/software/<slug>/`. Stop your server; browser tests serially. Playwright:
  `NODE_PATH=~/fast/integ-life/integ-games/node_modules`. The report goes in your reply (not `REPORT.md`).
- Check every sibling's `REGISTRY.json` before choosing aliases (one word, one owner). `[[slug]]` resolves only to
  live pages.

## W1 · `computing/software/how-threejs-draws-a-scene/` (port 18961)

Three.js 是怎么把一个场景画出来的 — one question: 二十行代码就能让一个立方体在网页里转起来。最后那一行
`renderer.render(scene, camera)` 每秒跑六十次，它每一次到底做了什么？

Source of truth: the three.js repository at the latest release tag as of November 2026 (find it, pin it, write the
tag in BRIEF.md and on the page). Files to read at least: `src/core/Object3D.js`, `BufferGeometry.js`,
`BufferAttribute.js`, `Raycaster.js`; `src/math/Matrix4.js`, `Quaternion.js`, `Frustum.js`, `Sphere.js`;
`src/cameras/PerspectiveCamera.js`; `src/renderers/WebGLRenderer.js` and `webgl/WebGLRenderLists.js`,
`WebGLPrograms.js`, `WebGLProgram.js`, `WebGLState.js`, `WebGLShadowMap.js`, `WebGLTextures.js`;
`src/renderers/shaders/ShaderChunk/` (lights and BSDFs); `src/objects/Mesh.js`, `InstancedMesh.js`,
`BatchedMesh.js`; `src/animation/`; and the WebGPU side (`src/renderers/common/`, `src/nodes/`) for the frontier.
Outside three.js: the WebGL 2 / OpenGL ES 3.0 specs for clip space, depth and rasterisation rules; Walter et al.
2007 (GGX), Schlick 1994, Karis 2013 for the BRDF as three.js uses it; Williams 1978 for shadow maps;
Möller & Trumbore 1997 for the ray–triangle test.

Starting chapter list (reorder, merge, drop; report what changed):

1. 在地图上的位置：your code → three.js → WebGL (or WebGPU) → driver → GPU. Three.js draws no pixels; it decides
   *which* draw calls to issue, in what order, with what state. Diagram: the layer stack and what crosses each line.
2. 场景图：`Object3D` as a tree; local matrix composed from position, quaternion, scale; `matrixWorld = parent ×
   local`; `updateMatrixWorld` and its dirty flags. Model: a small tree (sun–earth–moon or an arm) with the real
   4×4 numbers, and what breaks when you read `matrixWorld` before it is updated.
3. 几何体：`BufferGeometry` is typed arrays, attributes and an index. Why a cube has 24 vertices and not 8; bytes per
   vertex; what goes to the GPU once and what goes every frame. Model: vertices, triangles and bytes of a box and a
   sphere against their segment counts.
4. 相机：view matrix as the inverse of the camera's world matrix, the perspective matrix from fov / aspect / near /
   far, clip space, the divide by w, NDC, viewport. Model: one point carried through the whole chain with numbers;
   then depth precision against near and far (why z-fighting starts far away, what a logarithmic or reversed depth
   buffer changes).
5. 一次 render 的内部：the order of work in `WebGLRenderer.render`: matrices, `projectObject`, frustum culling
   with bounding spheres, the render lists, the actual sort functions (opaque and transparent), then drawing.
   Model: a top-down scene the reader flies a camera through, showing what is culled and the draw order.
6. 材质变成着色器：a material is parameters; the program is assembled from shader chunks and `#define`s, keyed and
   cached; compiling is the first-frame hitch. Model: toggle material features and lights, watch the cache key and
   the number of distinct programs.
7. 一个像素的颜色：Lambert, Phong, then the standard material's BRDF (GGX distribution, Smith visibility, Schlick
   Fresnel) with the same constants as the shader chunks. Model: a software-shaded sphere on a 2D canvas, roughness
   and metalness sliders, energy check.
8. 三角形变成像素：what the GPU does with what three.js sent: edge functions, barycentric and perspective-correct
   interpolation, the depth test. Why transparent objects are sorted, and the case sorting cannot fix. Model: a
   small software rasteriser with a visible z-buffer.
9. 纹理：UVs, filtering, mipmaps and how the level is chosen, anisotropy, GPU memory (×4/3), sRGB against linear and
   what the output colour space setting does to the numbers.
10. 阴影：a shadow map is a second render from the light; depth comparison, bias, acne against peter-panning,
    texel size against the light's frustum, PCF. Model: a 1D/2D shadow map the reader can under-resolve.
11. draw call 为什么贵：`WebGLState` caching, what one call costs on the CPU side, merging, `InstancedMesh`,
    `BatchedMesh`. Model: N objects as N calls, as one merged buffer, as one instanced call (per-call cost is a
    labelled parameter, with measured values and their source if found).
12. 拾取与动画：`Raycaster` (unproject the mouse, bounding sphere first, then triangles); the animation loop, the
    mixer's keyframe interpolation, slerp, and why rotations are stored as quaternions.
13. 前沿在哪（2026 年 11 月）：`WebGPURenderer`, TSL / node materials, compute, where WebGPU ships; dated, sourced.
14. Short closing: three questions to ask when a scene is slow or looks wrong.

Diagrams (at least six; natural ones): the layer stack; a scene-graph tree with its matrices; the attribute and
index buffers of a quad; the view frustum and the clip-space cube; the render loop as a sequence; program assembly
from chunks; the vectors of a BRDF (N, L, V, H); a triangle with its edge functions and sample points; a mip chain;
the light's view against the camera's view for a shadow map; N draw calls against one instanced call.

Relation to existing pages (link, don't redo):

- `computing/graphics/computer-graphics` (lesson): 2D transforms, rasterisation, diffuse shading. W1 links it as the
  gentler start and does the 3D, homogeneous and library-internal parts.
- `computing/systems/how-a-gpu-computes` #ch9 (2×2 quad shading, why small triangles cost) and
  `how-pixels-reach-a-screen` #ch1, #ch3 (framebuffer, vsync) for everything after the draw call.
- `math/…/linear-transform`, `computing/graphics/robot-kinematics` for matrices and chains, if they fit.
- `demos/fable-flight/` is a real three.js short film on this site (24,000 pages in the air). Read how it draws
  them and use it as the worked example where it is true (most likely chapter 11).

Things to get right:

- The cross-check tool compares at least: `Matrix4.compose`, world-matrix propagation, `makePerspective`, the
  point-through-the-chain numbers, `Frustum.intersectsSphere` decisions, the opaque and transparent sort order on a
  fixed scene, `Raycaster` hits on a mesh, quaternion slerp, and geometry vertex / index counts.
- The BRDF model uses the formulas as written in the pinned shader chunks, not a textbook variant; say where
  three.js differs from the paper.
- Timing claims (compile hitch, per-call cost) are machine-dependent: give the source, the machine and the date, or
  present them as a parameter.
- Aliases are what a confused person types: three.js 是什么, three.js 为什么卡, draw call 是什么, 模型为什么闪 (z-fighting),
  透明物体显示不对, 阴影有条纹, 什么是着色器, WebGL 和 WebGPU 区别, 四元数是干什么的, and so on.

## Candidates for W2 onward (team lead picks; one essay each)

Chosen for how much of everyday software rests on them and how well the core fits a small real model:

- **Git** — content-addressed objects, trees and commits, refs, the three-way merge, packfiles and deltas.
- **SQLite** — pages and the B-tree, the pager and WAL, the query planner, the bytecode VM.
- **React** — elements, fibers, reconciliation and keys, the scheduler, hooks as a linked list.
- **V8** — hidden classes, inline caches, the interpreter and JIT tiers, deoptimisation, the generational GC.
- **Redis** — the event loop, its data structures (SDS, skiplist, listpack), persistence, replication.
- **Docker / containers** — namespaces, cgroups, overlay filesystems, images as layers.
- **PostgreSQL** — MVCC and tuples, WAL, vacuum, the planner's cost model.
- **Nginx** — one event loop per worker, epoll, the request state machine.
- **Chromium's rendering pipeline** — style, layout, paint, compositing (it connects W1 to how-pixels-reach-a-screen).
- **LLVM** — SSA, a few optimisation passes run by hand, instruction selection.
- **Kafka**, **Kubernetes' reconcile loop**, **etcd / Raft** — link `computing/systems/distributed-systems`.

## Report (reply, under 450 words)

Chapter ladder one line each, what changed from the list above, the pinned release, what the cross-check tool
compared and its result, tuned parameters, frontier facts with dates and sources, tests run and their output
summary, missing prerequisites, anything not verified from a primary source, and notes for the registrar (titles,
aliases handed to siblings).
