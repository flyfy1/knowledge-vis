---
lang: en
title: How Three.js Draws a Scene · A Hands-on Essay
desc: A spinning cube in a web page takes twenty lines, and the last one, renderer.render(scene, camera), runs sixty times a second. Following the three.js r187 source, this essay takes that line apart: the scene tree and its matrices, the bytes of a geometry, the camera and depth, culling and sorting, how a material becomes a shader, the colour of one pixel, rasterisation, textures, shadows, what a draw call costs, picking and quaternions, and WebGPU. A dozen hands-on models run the same algorithms, rewritten in the page and checked number by number against three.js itself.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.ms: {v} ms
u.us: {v} µs
u.px: {v} px
u.deg: {v}°
u.x: {v}×
u.calls: {v} calls
u.none: none
u.sep: ", "
:::

# How Three.js Draws a Scene {#hero}

::: strings
kicker: Computing · Software principles · A hands-on long essay
:::

A spinning cube takes twenty lines of code in a web page.<br>The last one, renderer.render(scene, camera), runs sixty times a second. What does it do each time? {.sub}

Three.js is the most widely used 3D library on the web. Product showcases, data visualisations, small games, and the [[fable-flight|3D short film]] on this site were drawn with it. A spinning cube takes twenty-odd lines, and only the last one actually draws. This essay asks one question: **what does the line `renderer.render(scene, camera)` do on every frame?** We follow the order in which it works. First each object's position is turned into a matrix. Then what cannot be seen is thrown away and the rest is put in order. Then materials are translated into programs the GPU can run, and finally the GPU turns triangles into pixels. Along the way we stop at a few common oddities: why a model flickers, why transparent objects overlap in the wrong order, why shadows have stripes, and why things get slow when there are many objects. {.lead}

The internal structure described here all comes from the source of three.js r187 (npm package three@0.187.0, released 30 October 2026). Class names, function names and constants are those of that version; later versions may change them. The page does not load three.js. Each model rewrites the matching algorithm in a few dozen to a few hundred lines, and a script checks these models against the real three.js on the same inputs (matrices, culling results, sort orders, shader cache keys, ray hits and so on). They all agree. For background, see [[computer-graphics]] (2D transforms, rasterisation, diffuse light) and [[linear-transform]] (how a matrix moves the plane). This essay was written by an AI. The last paragraph of each chapter says what the model leaves out. {.note}

## Where we are on the map {#ch1}

::: strings
toc: Where we are on the map
:::

Three.js does not draw a single pixel itself. It decides which draw calls the frame issues, in what order, and what state the GPU must be set to before each one. The GPU is what actually draws pixels. {.law}

Here is a minimal three.js program. The first dozen lines set up the scene: a scene (Scene), a camera (PerspectiveCamera), a cube mesh (Mesh, made of a BoxGeometry and a MeshStandardMaterial), and a light. The function handed to `setAnimationLoop` at the end runs once per frame: it turns the cube a little, then calls `renderer.render(scene, camera)`.

::: html ch1-code
code.aria: A minimal three.js program
code: "import * as THREE from 'three';\n\nconst scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 2000);\ncamera.position.z = 4;\n\nconst cube = new THREE.Mesh(\n  new THREE.BoxGeometry(1, 1, 1),\n  new THREE.MeshStandardMaterial()\n);\nscene.add(cube);\nscene.add(new THREE.DirectionalLight(0xffffff, 3));\n\nconst renderer = new THREE.WebGLRenderer();\nrenderer.setSize(innerWidth, innerHeight);\ndocument.body.appendChild(renderer.domElement);\n\nrenderer.setAnimationLoop(() => {\n  cube.rotation.y += 0.01;\n  renderer.render(scene, camera);\n});"
:::

Below that line there are several layers. Your code talks only to three.js. three.js translates the scene into WebGL 2 calls (or, with the newer WebGPURenderer, into WebGPU calls; chapter 13). The browser checks those calls and passes them on to the operating system's graphics interface (Metal on a Mac, usually Direct3D on Windows). The driver then compiles them into GPU commands. Each layer down is less clever and closer to the hardware, and so faster. WebGL does not know what a "cube" or a "light" is. It only knows buffers, textures, shader programs, and commands such as "draw 36 vertices with this program and these buffers".

::: diagram dg-stack keys=dg.stack
cap: Figure 1. The layers one frame passes through. Each horizontal line names what crosses it: from top to bottom, "objects" and "materials" turn into buffers, shaders and draw commands.
aria: Diagram: five layers, your code, three.js, WebGL or WebGPU, the browser and driver, and the GPU, with what passes between each pair of layers
l1: Your code
l1s: scene, camera, mesh, material, lights
l2: three.js
l2s: matrices, culling, sorting, shader assembly
l3: WebGL 2 / WebGPU
l3s: the browser checks each call
l4: Driver
l4s: Metal, Direct3D, Vulkan, OpenGL
l5: GPU
l5s: vertex shaders, rasteriser, pixel shaders
x1: render(scene, camera)
x2: buffers, uniforms, drawElements
x3: Metal, Direct3D and other calls
x4: command buffer
:::

So when someone says "three.js is slow" or "three.js is fast", first ask which layer is slow. Three.js's own work happens on the CPU, in JavaScript: multiplying matrices, deciding visibility, sorting, comparing state. The GPU's work is a separate account: how many vertices, how many pixels, and how heavy the shader is for each pixel. The next ten chapters roughly follow the order inside `render()`. First come the parts that run on the CPU in three.js (chapters 2–6), then what happens on the GPU (chapters 7–10), and then back to the seam between the two, the draw call (chapter 11).

This chapter is only a map. How much time each layer takes depends on the browser, the driver and the graphics card; there is no single general number here. {.take}

## The scene graph: each object's position is a chain of matrices {#ch2}

::: strings
toc: The scene graph: a chain of matrices
:::

A scene is a tree. Each node records its position, rotation and scale relative to its parent. Its position in the world is the matrix multiplied all the way down from the root: matrixWorld = parent's matrixWorld × its own matrix. {.law}

Everything you can put into a three.js scene (meshes, cameras, lights, groups) is an `Object3D`. Each `Object3D` has three properties you often change: `position` (a 3D vector), `quaternion` (rotation, stored as a quaternion; chapter 12 explains why; when you change the Euler angles in `rotation`, `quaternion` is updated to match) and `scale`. It also has two 4×4 matrices you usually do not touch directly: `matrix` is the transform relative to the parent, and `matrixWorld` is the transform relative to the whole world.

`matrix` is assembled in one go by `Matrix4.compose(position, quaternion, scale)`: scale first, then rotate, then translate. Written as a matrix, that is T × R × S. `matrixWorld` is the parent's `matrixWorld` multiplied by its own `matrix`. So a moon hanging off the Earth carries every layer of transform in its world position: the Sun's, the Earth's orbit, the Earth's own, and the moon's orbit.

::: diagram dg-tree keys=dg.tree
cap: Figure 2. A small scene tree: the Sun, the Earth's orbit, the Earth, the Moon's orbit, the Moon. Each node stores only its transform relative to its parent (matrix); the world matrix (matrixWorld) has to be multiplied down from the root.
aria: Diagram: the scene tree, from Scene to the Sun, the Earth's orbit, the Earth, the Moon's orbit and the Moon, with the relation between matrix and matrixWorld beside each node
n0: Scene
n1: Sun
n2: Earth orbit (rotation only)
n3: Earth (translate 5, scale 0.5)
n4: Moon orbit (rotation only)
n5: Moon (translate 2, scale 0.5)
m: matrix = T·R·S
w: matrixWorld = parent.matrixWorld·matrix
:::

**Who computes these matrices?** The first thing `renderer.render()` does is `scene.updateMatrixWorld()`. It recurses from the root. If a node's `matrixAutoUpdate` is true (the default), it first calls `updateMatrix()` to rebuild `matrix` with `compose`, and marks itself as needing a world-matrix update. Then it multiplies in the parent's world matrix. Child nodes are forced to update too, because their parent has changed.

There is an easily misread point here. The source has "dirty flags" such as `matrixWorldNeedsUpdate`, which look as if objects that have not moved are skipped. But with the default settings, `updateMatrix()` rebuilds the matrix unconditionally on every frame and sets the flag, and once a node's flag is set, all its descendants are forced to recompute their world matrices. The Scene itself is the root, and its `matrixAutoUpdate` is true as well. So **on every frame, both matrices of every node are recomputed, whether or not it moved**. Setting a static object's `matrixAutoUpdate` to `false` (and calling `updateMatrix()` yourself when it does change) saves only its own compose; its world matrix is still multiplied every frame unless every ancestor up to the Scene has it turned off too. In the model below, this tree of {=ch2.nodes} nodes needs {=ch2.compose} compose calls and {=ch2.world} matrix multiplications on every frame (the root only copies). A scene with ten thousand static objects does twenty thousand such operations per frame.

::: lab ch2-model
model.title: A scene tree that turns
model.how: Drag "time" to make the Earth orbit the Sun and the Moon orbit the Earth. Change the Earth's scale and watch the Moon's orbit shrink with it. Tick "read the position before render" to see the position you get if you read the Moon before this frame's update (the hollow circle), and how far it lags behind the position actually drawn.
ctl.day: Time
ctl.scale: Earth's scale
ctl.stale: Read the Moon's position before render
cv.aria: Top-down view of the Sun, the Earth and the Moon, and their orbits
cv.sun: Sun
cv.earth: Earth
cv.moon: Moon
read.pos: Moon's world coordinates
read.orbit: Radius of the Moon's orbit in the world
read.work: Per frame: compose / matrix multiplications
read.lag: How early the read is
say.fresh: The Moon's position in the world is ({x}, {z}). The orbit radius written in the Moon's orbit node is 2, but the Earth is scaled by {s}×, so in the world it is <em>{r}</em>: the child inherits its parent's scale.
say.stale: This frame you read <code>moon.matrixWorld</code> before render, so you get the Moon's position from the previous frame, ({x0}, {z0}). That is <em>{d}</em> units away from where it is actually drawn in this frame. To use world coordinates before render, first call <code>moon.updateWorldMatrix(true, false)</code>.
:::

The lag you see when you tick "read the position before render" is a real pitfall. In your per-frame loop you change the Earth's angle, then immediately read the Moon's `matrixWorld` (say, to make the camera follow the Moon). You get the value that the last `render()` computed, because this frame's `updateMatrixWorld()` has not run yet. There are three common symptoms: the camera jitters when following, the physics engine and the picture are one frame apart, and ray picking misses. The fix is to call `updateWorldMatrix(true, false)` yourself before reading. It updates all ancestors first, then the object itself.

Another effect visible in the model is inheritance of scale. The Earth is scaled by 0.5, and the Moon's orbit layer only says "2 units outward", but in the world it sits only {=ch2.orbit} units from the Earth, and the Moon itself shrinks too. That is why, in three.js, it is best to separate "the model you want to scale" from "the node you attach children to". Put a separate layer around the model and apply the scaling only to that layer.

The model leaves out: the camera's own world matrix (its inverse is the view matrix, chapter 4), `matrixWorldAutoUpdate`, the `pivot` property added in r187, and skeletal animation. The tree's size, distances and the 12:1 orbit ratio were chosen for the picture; they are not astronomical data. {.take}

## Geometry: why a cube has 24 vertices {#ch3}

::: strings
toc: Geometry: 24 vertices
:::

The GPU does not know what a "cube" is. It only knows rows of numbers: the position, normal and texture coordinates of each vertex, and an index that groups the vertices three at a time into triangles. These arrays are uploaded to video memory once; each frame then uses them without sending them again. {.law}

`BufferGeometry` is such a set of arrays. Each of its "attributes" (`BufferAttribute`) is a typed array. For example, `position` is a `Float32Array`, and each group of three numbers is the x, y and z of one vertex. `normal` is the normal direction of each vertex (used for lighting), and `uv` is the coordinate of each vertex on the texture (chapter 9). There is also an `index` array, three numbers at a time, saying which three vertices form one triangle.

::: diagram dg-quad keys=dg.quad
cap: Figure 3. A square face in a BufferGeometry: 4 vertices, each taking a slice of the position, normal and uv arrays. The index uses 6 numbers to join them into two triangles.
aria: Diagram: four vertices numbered 0 to 3, below them the grids for the position, normal and uv arrays and the index array
pos: position (Float32, 3 numbers per vertex)
nor: normal (Float32, 3 numbers per vertex)
uv: uv (Float32, 2 numbers per vertex)
idx: index (Uint16, 3 numbers per triangle)
t1: Triangle 0
t2: Triangle 1
b: 32 bytes per vertex
:::

A cube has only 8 corners, yet `BoxGeometry(1, 1, 1)` has {=ch3.boxV} vertices. The reason is that a "vertex" is more than a position. The same corner, on three faces, needs three different normals (pointing in three directions, so that lighting comes out flat on each face) and three different uvs. Same position but different other attributes make different vertices. three.js's `BoxGeometry` is built from six planes, each with 4 vertices and 2 triangles, so {=ch3.boxV} vertices and {=ch3.boxT} triangles in total. A sphere is different: the normals of neighbouring faces change continuously, so vertices can be shared. The default `SphereGeometry(1, 32, 16)` has {=ch3.sphV} vertices and {=ch3.sphT} triangles.

Each vertex has 3 numbers of position, 3 of normal and 2 of uv, all 4-byte floats: 32 bytes in total. Indices default to 2-byte integers (Uint16). As soon as any vertex index reaches 65,535, three.js switches automatically to 4-byte integers (Uint32). 65,535 itself is avoided because WebGL 2 reserves it as the "primitive restart" marker. So a default sphere takes {=ch3.sphBytes}.

::: lab ch3-model
model.title: Vertices, triangles and bytes of a geometry
model.how: Choose a cube or a sphere and drag "subdivisions" to see how the vertex count, the triangle count and the video memory grow. The wireframe on the page is the same array that three.js's two builder functions produce.
ctl.kind: Shape
kind.box: Cube
kind.sphere: Sphere
ctl.seg: Subdivisions
cv.aria: Wireframe and vertices of the geometry
read.v: Vertices
read.t: Triangles
read.vb: Vertex data
read.ib: Index
say.box: Each edge is split into {s} segment(s). Each face has {fv} vertices, and the six faces have <em>{v}</em> between them; a point on an edge is stored once for each face that meets there. {t} triangles, indexed with {it}.
say.sphere: There are {ws} segments around the longitude and {hs} down the latitude: <em>{v}</em> vertices and {t} triangles. The triangles in the ring at each pole count as half, so the triangle count is 2 × {ws} × ({hs} − 1). Indexed with {it}.
:::

When do these arrays reach the GPU? The first time the mesh is drawn, `WebGLAttributes` creates a WebGL buffer for each attribute and uploads the whole array once. After that, every frame, as long as you do not change the array, nothing is uploaded again and the GPU reads from video memory. If you change the vertices (for example, to animate water), set the attribute's `needsUpdate` to true, and three.js re-uploads the whole array on the next frame. So things that move every frame should be kept in matrices (16 numbers per object) or computed in the shader, as the [[fable-flight|3D short film]] in chapter 11 does, rather than rewriting tens of thousands of vertices each frame.

The model leaves out: tangents, vertex colours, skinning weights, interleaved storage (InterleavedBuffer) and `drawRange`. {.take}

## Camera: from a 3D point to a screen pixel {#ch4}

::: strings
toc: Camera: from a point to a pixel
:::

A point passes four steps before it becomes a pixel on the screen. The view matrix moves it into the camera's coordinates. The projection matrix turns it into four numbers (clip coordinates). Dividing by the fourth number, w, gives standard coordinates from −1 to 1. Finally these are converted to pixels and depth using the canvas size. {.law}

**The view matrix** is the inverse of the camera's world matrix. The camera is also an `Object3D`; its `matrixWorld` says where the camera is in the world and which way it faces. Invert this matrix and you get where the world is, seen from the camera. `Camera.updateMatrixWorld` stores the inverse in `matrixWorldInverse` each time it updates. Looking out of the camera, straight ahead is −z.

**The projection matrix** is computed by `PerspectiveCamera.updateProjectionMatrix`. The top edge of the field of view is near × tan(fov/2), the left and right edges expand according to the aspect ratio, and the result goes to `Matrix4.makePerspective`. It turns a point (x, y, z) in view coordinates into four numbers (x′, y′, z′, w), where w is the distance from the point to the camera, −z.

::: diagram dg-frustum keys=dg.frustum
cap: Figure 4. On the left, the frustum in front of the camera: a truncated pyramid from near to far. On the right, the standard cube, from −1 to 1 on each side, after dividing by w. The large far region is squeezed into a thin layer at the back of the cube.
aria: Diagram: the view frustum seen from the side, with its near and far planes, turned into a square after the transform
cam: Camera
near: near plane
far: far plane
fov: view angle fov
cube: Divided by w
ndc: NDC −1…1
p: Point
:::

Next come the two steps the GPU performs (OpenGL ES 3.0 specification section 2.13; WebGL 2 follows it). First, **divide by w**: all three coordinates are divided by w, giving standard device coordinates (NDC) between −1 and 1. Parts outside that range are clipped before the division (specification section 2.18: −w ≤ x, y, z ≤ w). The farther away a point is, the larger its w, and after dividing it lies nearer the centre. This is why near things look big and far things look small. Second, the **viewport transform**: x and y are expanded to the canvas's pixel size, and z maps from −1…1 to 0…1 and is written into the depth buffer.

Follow one concrete point. The default camera has a field of view of 50°, a near plane of 0.1 and a far plane of 2000. The canvas is 1280 × 720. The point lies 10 units in front of the camera, 1 unit to the right and 0.5 up, so its view coordinates are (1, 0.5, −10). Multiplying by the projection matrix gives clip coordinates ({=ch4.clip}). Dividing by w = 10 gives NDC ({=ch4.ndc}). After the viewport transform it lands at {=ch4.px} pixels, counted from the lower-left corner, with depth {=ch4.win}. The depth buffer is usually a 24-bit integer, which stores {=ch4.int} (the full value is 16,777,215).

::: lab ch4-model
model.title: One point through the whole chain
model.how: Drag this point's distance from the camera and the camera's field of view. The readings below show its numbers at each step. The bottom edge of the chart is the distance to the camera (logarithmic scale; gold is the near plane 0.1, purple the far plane 2000). The top edge is the depth written into the depth buffer, from 0 to 1, and each line joins a distance to its depth. Notice that the lines bunch up on the right: a point has barely left the near plane before its depth is already close to 1.
ctl.d: Distance to the camera
ctl.fov: Field of view
cv.aria: The view frustum and the point, seen from the side, and the depth position between 0 and 1
cv.dist: Distance to the camera (log scale)
cv.depth: Depth buffer value
read.clip: Clip coordinates (x, y, z, w)
read.ndc: After dividing by w
read.win: Pixel coordinates
read.depth: Depth (24-bit integer)
say.in: This point is inside the frustum. Its depth is <em>{z}</em>: from the near plane to it, {p} of the depth range is already used up.
say.out: This point is outside the frustum ({why}). The GPU clips it away, and no pixel is drawn.
why.near: nearer than the near plane
why.far: farther than the far plane
why.side: outside the field of view
:::

The depth bar along the top of the chart makes one important point: **depth is not evenly distributed**. By the formula above, the depth value is roughly 1 − near/distance. With the default near plane of 0.1, the first unit in front of the camera already uses up {=ch4.first1} of the depth range. The whole world from 1 to 2000 is squeezed into the last tenth. A 24-bit integer has only about 16.8 million slots, and out at a distance, neighbouring slots are a long way apart.

When two surfaces are very close together and far from the camera, their depths land in the same slot, and which one wins depends on floating-point rounding. As the camera moves, the surfaces flicker. This is **z-fighting**, the common reason a model "flickers". The model below works out that two surfaces 1 cm apart (0.01 units), with near 0.1 and far 2000, start to flicker at {=ch4.zf} units from the camera. Moving the near plane to 1 pushes this out to {=ch4.zf1}; at 0.01 it starts at {=ch4.zf001}. **The near plane matters far more than the far plane.**

::: lab ch4-depth keys=ch4.d
model.title: Depth precision: how far away the flicker starts
model.how: The curves show, at each distance, how far apart two surfaces must be for their depths to be told apart (lower is better). The horizontal line is the actual gap between your two surfaces. Where a curve crosses that line is the distance at which flicker starts. The three schemes are three.js's default depth, logarithmic depth (logarithmicDepthBuffer) and reversed depth (reversedDepthBuffer, paired with a 32-bit float depth buffer).
ctl.near: Near plane
ctl.far: Far plane
ctl.sep: Gap between the two surfaces
cv.aria: Three curves: the smallest gap that can be separated at each distance for standard, logarithmic and reversed depth, and a horizontal line for the actual gap
leg.std: Default (24-bit integer)
leg.log: Logarithmic depth (24-bit)
leg.rev: Reversed depth (32-bit float)
cv.x: Distance to the camera
cv.y: Smallest gap that can be separated
read.std: Default: flicker starts here
read.log: Logarithmic depth
read.rev: Reversed depth
never: none before far plane
from: flickers from {d} on
nofl: does not flicker before the far plane
say: Gap {sep}, near plane {n}, far plane {f}: default depth {a}, logarithmic depth {b}, reversed depth {c}.
:::

three.js offers two remedies. **Logarithmic depth** (`new WebGLRenderer({ logarithmicDepthBuffer: true })`) rewrites the depth in the fragment shader as log₂(1 + w) divided by log₂(far + 1), so that each order of magnitude gets roughly the same number of slots. The cost: every fragment has to write `gl_FragDepth`, so the GPU's early depth test is lost, and scenes with heavy overdraw get slower. **Reversed depth** (`reversedDepthBuffer: true`, which needs the EXT_clip_control extension) maps near things to 1 and far things to 0, and pairs this with a 32-bit float depth buffer. Floats are densest near 0, which cancels the squeezing of distant depths by the projection. A widely cited 2015 article by N. Reed worked this out: the trick only helps with floating-point depth. With a 24-bit integer depth, reversed and not reversed are the same. The canvas's built-in depth buffer is normally a 24-bit integer; to get 32-bit floats you must render into a render target whose depth texture is of type FloatType.

The model leaves out: the floating-point error in the projection arithmetic itself (which also degrades results a little far away), orthographic cameras, and the camera's zoom, filmOffset and view offsets. {.take}

## Inside one render: culling and queuing {#ch5}

::: strings
toc: Inside render: culling and queuing
:::

`render()` first walks the whole tree and compares each object's bounding sphere with the camera's six planes, skipping anything out of view. The rest go into three lists, opaque, transmissive and transparent, each sorted by its own rules, and only then does drawing start. {.law}

The r187 `WebGLRenderer.render` broadly does its work in this order (source lines 1641–1871):

::: diagram dg-render keys=dg.render
cap: Figure 5. The order of work in one frame of WebGLRenderer.render() (r187). The shadow map is drawn before the main picture because the main picture reads it (chapter 10).
aria: Diagram: the steps of render drawn in a column from top to bottom: update matrices, compute the frustum, traverse the scene and cull, sort, draw shadows, set up lights, draw the background, draw opaque, draw transmissive, draw transparent
s1: scene.updateMatrixWorld()
s1n: All matrices (chapter 2)
s2: Projection × view → 6 frustum planes
s3: projectObject: traverse, cull, queue
s4: Sort the three queues
s5: shadowMap.render, from the light
s5n: Chapter 10
s6: Set up lights, draw background
s7: Draw opaque
s8: Draw transmissive (glass and the like)
s9: Draw transparent
:::

**Frustum culling.** The space the camera sees is a truncated pyramid bounded by 6 planes: left, right, top, bottom, near and far. `Frustum.setFromProjectionMatrix` reads these 6 planes straight from the rows of the "projection × view" matrix. Then `projectObject` walks the whole tree recursively. Anything not visible (`visible` is false) is skipped along with its subtree. For meshes, lines and points, which are the things to draw, if `frustumCulled` is true (the default), it tests their **bounding sphere**: the geometry's bounding sphere is moved by the object's world matrix, its radius is multiplied by the largest scale, and then it checks whether the centre lies behind some plane by more than the radius. If that is true for any one plane, the whole object is thrown away.

The test is cheap but not exact: it only ever keeps too much, never throws away too much. A sphere sitting outside one corner of the frustum can be within the radius of every plane taken one at a time, so it is kept, sent to the GPU, and not a single pixel of it is drawn. The red one in the model is such a case.

**Queuing.** Objects that pass are sorted by material into three lists (`WebGLRenderLists.js`): opaque; transmissive (physical materials with `transmission > 0`); and transparent (`transparent: true`). Each item records a z: the sphere centre multiplied by the "projection × view" matrix, taking the third number (the z in clip space, without dividing by w). Larger means farther away. Then:

- The opaque list is sorted with `painterSortStable`: first by `groupOrder` and `renderOrder` (which you set by hand), then by the **material's id**, and only then by z from small to large (near to far). {#l1}
- The transparent list is sorted with `reversePainterSortStable`: after `groupOrder` and `renderOrder`, it sorts directly by z from large to small (far to near), without looking at the material. {#l2}

::: lab ch5-model
model.title: A top-down frame: what is culled, and the order of drawing
model.how: The camera is at the bottom middle, and the fan is its frustum seen from above. Turn the camera, change the field of view and the far plane, and watch which objects pass the bounding-sphere test (solid), which are discarded (hollow), and which pass but are actually out of view (red ring). The numbers are the drawing order. Colours are materials; the cyan ones are transparent glass. Turn sorting off to see how many material switches there are.
ctl.yaw: Camera direction
ctl.fov: Field of view
ctl.far: Far plane
ctl.sort: Sorting (three.js default)
cv.aria: The scene from above: the camera, its frustum and a dozen round objects, labelled with drawing order
read.vis: Sent to draw
read.cull: Culled
read.fp: Passes but not visible
read.sw: Material switches
say.sorted: Sent to draw: {n}; culled: {c}. Opaque objects are grouped by material and sorted near to far within each group, which keeps material switches down to <em>{sw}</em>. Transparent objects ({t}) go last, far to near. {fp}
say.unsorted: Without sorting, objects are drawn in scene order: there are <em>{sw}</em> material switches, and the transparent glass is interleaved with the rest. An opaque object drawn later covers glass that has already been blended, so the colour is wrong. {fp}
say.fp: The one in the red ring (number {ids} in the draw order) passes the bounding-sphere test but is actually outside the frustum. It is sent to draw, and not a single pixel appears.
say.nofp:
:::

Why are opaque objects grouped by material first? Because every change of material may mean switching the shader program and re-uploading a batch of parameters. These **state changes** are the largest part of draw call overhead (chapter 11). Sorting near to far within each group lets the GPU's depth test reject more: the near objects are drawn first, so distant pixels they hide are discarded before the fragment shader runs. When the two goals conflict, the r187 WebGL renderer chooses material first. Interestingly, the general sort of the new WebGPU renderer in the same version (`renderers/common/RenderList.js`) does not compare materials and simply sorts from near to far.

Why do transparent objects go from far to near? Because transparency is done by **blending**: the new colour is a weighted average of the colour already in the buffer, weighted by opacity. To get the right result, the ones behind must be drawn first. Chapter 8 shows that this per-object order sometimes cannot save you.

The model leaves out: the Group `groupOrder`, `renderOrder` and `layers`, instancing and the `materialVariant` of skinned and instanced meshes, the case of an object split across several groups, and the transmissive list. The scene is flat: all objects are at the same height as the camera, so they can be drawn on the ground plane alone. The page computes both the bounding-sphere test and an exact circle-polygon intersection test to find the "passes but not visible" ones. {.take}

## How a material becomes a shader {#ch6}

::: strings
toc: How a material becomes a shader
:::

A material is just a set of parameters. What runs on the GPU is a shader program. three.js assembles source code from the material and the scene, compiles it once, and caches it under a very long string that serves as a key. When the key changes, the program is compiled again. {.law}

Each program that runs on the GPU is made of two shaders: the vertex shader (run once per vertex, it works out where the vertex lands on the screen) and the fragment shader (run once per pixel, it works out the pixel's colour). Each three.js material type has a pair of written templates; for example, `MeshStandardMaterial` uses `meshphysical.glsl.js`. The templates are full of lines such as `#include <lights_fragment_begin>`, which `WebGLProgram` replaces with the same-named fragment from `ShaderChunk`. It then adds a block of `#define`s at the top, saying whether the material has textures, how many directional lights the scene has, whether fog is on, and whether shadows are needed. The same template with different `#define`s compiles to different programs.

::: diagram dg-program keys=dg.program
cap: Figure 6. How a program is assembled. The material and the scene determine a list of parameters, and the parameters form the cache key. If the key has not been seen, the #include lines in the template are expanded, #defines are added, and the result goes to WebGL to compile and link.
aria: Diagram: material parameters and scene state combine into a parameter table, which becomes the cache key; the key looks up the cache; on a miss, shader fragments are expanded and compiled
mat: Material: type, textures, transparent…
scn: Scene: lights, shadows, fog, tone mapping
par: getParameters → parameter table
key: getProgramCacheKey → key
hit: In cache: use it directly
miss: Not there: assemble, compile, link
chunks: ShaderChunk: #include expanded
defs: A list of #defines
:::

The cache key is produced by `WebGLPrograms.getProgramCacheKey`. It joins, with commas, the shader's name, all the `#define`s, more than fifty parameters in a fixed order, two integers that pack dozens of switches into bits, and the output colour space. If two materials match on all of these, they share one program, even if numeric values such as colour or roughness differ. Those values are uniforms, passed before each draw, and do not go into the source.

**The number of lights is in every material's key**, even for a `MeshBasicMaterial` that ignores lighting. But the renderer does not recompute every material's key on every frame. Only a few kinds of change make it fetch a new program for a material, and one of them is "this material is lit, and the lights have changed". So when you add a point light, on the next frame every lit material gets a new key and a newly compiled program (materials with identical parameters share one), while a `MeshBasicMaterial`, which is not lit, keeps its old program. This is why "adding a light makes things stutter". The opposite trap exists too: if you turn on `renderer.shadowMap.enabled` after the first frame, materials that are already compiled do not recompile by themselves; set their `needsUpdate` to true.

::: lab ch6-model
model.title: Six materials, how many programs
model.how: The scene has six materials and has already been drawn once with every switch off. Turn the switches on or off to see the cache key each material is now using (only the parts that can change are shown), how many programs there are in total, and how many must be compiled on the next frame. The keys come from a copy of getProgramCacheKey on the page, identical character for character to three.js's; which materials fetch a new program follows the rules of r187's WebGLRenderer, checked in a browser against the real three.js.
ctl.point: Add a point light
ctl.shadow: Turn on shadows
ctl.fog: Add fog to the scene
ctl.tone: Tone mapping (ACES)
cv.aria: Six materials, each linked to the program it uses; red marks programs that must be compiled anew
u.chars: {v} characters
col.mat: Material
col.prog: Program
col.key: Part of the key that changes
mat.floor: Floor (Standard, textured)
mat.wood: Wood (Standard, textured)
mat.brass: Brass (Standard)
mat.glass: Glass (Physical, transparent)
mat.sky: Sky (Basic, unaffected by fog)
mat.leaves: Leaves (Standard, instanced)
read.n: Distinct programs
read.new: To compile anew
read.len: Length of one key
say.base: The six materials need only <em>{n}</em> programs. The floor and the wood have exactly the same parameters (their colours differ, which does not matter), so they share one.
say.changed: Compared with the start, <em>{k}</em> programs have to be compiled anew ({n} in use now). {why}
why.light: The light count is written into every key, but three.js fetches a new program only for lit materials: the sky's Basic material keeps its old one.
why.fog: Only materials with fog switched on fetch a new program; the sky has fog: false and is untouched.
why.tone: When tone mapping changes, every tone-mapped material needs a new program, the sky's Basic material included.
:::

How slow is compiling? It depends on the browser, the driver and the graphics card, and the range is wide. I measured it on one machine (Apple M6 chip, Chromium 151 headless, WebGL through ANGLE to Metal, three.js r187, 20 November 2026). A new `MeshStandardMaterial` program took {=ch6.first} ms on the first frame it appeared. A batch of 10 different programs then took {=ch6.ten} ms on one frame, an average of {=ch6.each} ms each. A frame is only 16.7 ms, so a stutter the first time a material is seen is almost inevitable. three.js offers two remedies. `renderer.compile(scene, camera)` or `compileAsync` compiles the programs before the scene starts (the latter does not block the main thread when the browser supports KHR_parallel_shader_compile). And using fewer distinct "kinds" helps: the same material parameters with different colours cost nothing extra.

The model leaves out: most of the logic in `getParameters` (only the parameters the experiment can switch are simulated), `onBeforeCompile` and `customProgramCacheKey`, and the reference counting and release of programs. {.take}

## The colour of one pixel {#ch7}

::: strings
toc: The colour of one pixel
:::

The colour of a MeshStandardMaterial is computed by a physical formula. The surface is treated as countless tiny mirrors facing different directions, and roughness decides how disordered they are. The highlight is the product of the GGX distribution D, the occlusion term V and the Fresnel term F. The diffuse light is what is left. {.law}

The earliest lighting models were simple. **Lambert** (`MeshLambertMaterial`): a surface looks brighter the more directly it faces the light. Its brightness is proportional to the cosine of the angle between the normal N and the light direction L, and it looks the same from every viewing direction. **Phong** (`MeshPhongMaterial`) adds a highlight: the closer the viewing direction is to the mirror-reflection direction, the brighter it is, with an exponent controlling the size of the highlight. They are cheap, but they do not conserve energy: turn up the highlight and the object can become brighter than the light falling on it.

`MeshStandardMaterial` uses a "physically based" model. In the r187 shader fragments (`bsdfs.glsl.js`, `lights_physical_pars_fragment.glsl.js`), a directional light shining on a point gives this highlight:

::: diagram dg-brdf keys=dg.brdf
cap: Figure 7. Four directions at one point: the normal N, the direction to the light L, the direction to the eye V, and the half-way direction H between L and V. Only the tiny mirrors whose normals point exactly at H reflect light into the eye.
aria: Diagram: a point on a surface, with the normal N pointing up, L towards the light source, V towards the camera, and H the half-way vector between L and V
N: N normal
L: L light
V: V eye
H: H half-way
s: Surface
f1: Highlight = F · V · D
f2: Diffuse = colour·(1−metalness)/π·(1−F)
:::

- **D (GGX distribution, Walter et al. 2007)**: how many of the tiny mirrors point exactly at H. `D_GGX` is written (1/π)·α² / ((N·H)²(α² − 1) + 1)², where α = roughness². At low roughness, D is a tall, sharp peak (a small, bright highlight). At high roughness, D spreads out. {#d}
- **V (Smith occlusion, correlated form; three.js's comment cites Lagarde and de Rousiers's 2014 Frostbite course notes)**: the part of the tiny mirrors hidden by each other. `V_GGX_SmithCorrelated` = 0.5 / (g_v + g_l), where the two terms in the denominator depend on N·L and N·V. It already folds the textbook denominator 4(N·L)(N·V) into itself. {#v}
- **F (Schlick Fresnel, 1994)**: reflection gets stronger at grazing angles. three.js does not compute (1 − V·H)⁵ directly. It uses the approximation from Epic's Karis (2013): 2 to the power of (−5.55473·V·H − 6.98316)·V·H. F₀ is the reflectance when viewed head-on: a fixed 0.04 for non-metals, while metals use their own colour, with values in between interpolated by metalness. {#f}

Diffuse light is the base colour × (1 − metalness) / π, then multiplied by (1 − F): light that the highlight has taken no longer contributes to diffuse (here F uses the non-metal F₀ = 0.04). Metals have no diffuse light; their colour is entirely in the highlight.

::: lab ch7-model
model.title: A sphere, each pixel computed with three.js's formulas
model.how: Each pixel of the sphere is computed with a copy of D, V and F from the page, then output in sRGB. Drag roughness and metalness to see how the highlight changes. Turn off "multiple-scattering compensation" to see how rough metal darkens. The readings are the three terms at the brightest point of the highlight, and how much energy single scattering loses when viewed head-on, computed with the same integral three.js uses to build its DFG table.
ctl.r: Roughness
ctl.m: Metalness
ctl.ms: Multiple-scattering compensation (on by default in three.js)
cv.aria: A sphere lit by a directional light, and the energy lost to single scattering as a function of roughness
cv.x: Roughness
cv.y: Energy lost to single scattering
read.d: D (distribution)
read.v: V (occlusion)
read.f: F (Fresnel)
read.lost: Energy lost to single scattering
say: Roughness {r}, metalness {m}: at the highlight peak D = {d}. Counting only one bounce of reflection, viewed head-on, <em>{lost}</em> of the energy is lost. That is the part that comes out only after light has bounced several times between the tiny mirrors. {ms}
say.on: three.js puts it back by multiplying by {c}, read from its 16 × 16 table.
say.off: With compensation off, the sphere is darker than it should be.
:::

The "lost energy" above is a known weakness of the GGX model. The formula counts only one reflection off the surface, whereas on a real rough surface light bounces several times between the tiny mirrors before leaving. The rougher the surface, the more is lost. Computed head-on with the integral three.js uses to build its DFG table, roughness 0.5 loses {=ch7.lost05} and roughness 1 loses {=ch7.lost10} (the table has only 16 × 16 cells and its last cell is centred near roughness 0.97, so the shader reads about 65% at roughness 1). r187 compensates in `lights_fragment_begin` (Turquin's 2019 method). It first looks up a 16 × 16 table (`DFGLUTData.js`, integrated by `utils/generateDFGLUT.js` from 4,096 sample points), which gives E, the fraction of energy that single scattering keeps. It then multiplies the highlight by 1 + F₀(1/E − 1). For a white metal, F₀ = 1, this restores exactly the full 100%. The table in the page was integrated independently. After rounding to half-precision floats, its 512 numbers match the one three.js ships, bit for bit.

Two places where three.js differs from the paper. Roughness has a lower bound of 0.045, to stop the highlight becoming infinitely sharp. And the shader adds a little to roughness based on how fast the normal changes across the screen (`geometryRoughness`), which reduces the flicker of tiny highlights. There is also a common question. The light's colour times its intensity is directly the irradiance, with no factor of π, while the diffuse term divides by π. So a directional light of intensity 1 shining on a white diffuse surface looks only about 1/π as bright. This is why many examples write a light intensity of 3 rather than 1.

The model leaves out: ambient light, environment maps, clearcoat, sheen, iridescence, anisotropy, and the EON diffuse model in r187's physical material. The sphere is lit by one directional light, with no tone mapping. {.take}

## Triangles become pixels {#ch8}

::: strings
toc: Triangles become pixels
:::

The GPU takes the screen coordinates of three vertices and asks, for each pixel centre: is this point inside the triangle? If it is, depth and the other attributes are interpolated at that point using barycentric coordinates, and the depth is compared with what the depth buffer already holds. The pixel is written only if it is closer. {.law}

What happens after three.js issues a draw call is up to the GPU. It runs the vertex shader on each vertex, obtaining clip coordinates as in chapter 4. It then divides by w and applies the viewport transform, getting three points on the screen. Next is **rasterisation** (OpenGL ES 3.0 specification section 3.6.1): for each pixel covered by the triangle, it checks whether the pixel's **centre** lies inside the triangle.

The test uses **edge functions**. For each edge of the triangle, compute which side of the edge the pixel centre lies on (a 2×2 determinant, that is, a cross product). If all three have the same sign, the point is inside. Divide the three edge-function values by the triangle's area and you get exactly the **barycentric coordinates** of the point: how "close" it is to each of the three vertices. Interpolation relies entirely on them.

::: diagram dg-edge keys=dg.edge
cap: Figure 8. Which pixels a triangle covers. Only the pixel centres (dots) are considered. Pixels whose centres lie inside all three edges (filled) generate fragments. When two triangles share an edge, a centre lying exactly on that edge is credited to only one of them.
aria: Diagram: a triangle over a grid of pixels, with the centre of each pixel shown as a dot, and the dots inside the triangle filled in
e0: Edge 0
e1: Edge 1
e2: Edge 2
in: Centre inside: fragment generated
out: Centre outside
b: Barycentric = edges ÷ area
:::

The specification requires that, where two triangles share an edge, a pixel lying exactly on that edge is credited to only one of them: no double drawing, no gaps. The model uses the common "top-left rule". A square split into two triangles has {=ch8.sq} pixels, each drawn exactly once.

Interpolation has one subtle point. Interpolating with barycentric coordinates directly on the screen is correct for depth (specification equation 3.8), but wrong for texture coordinates, because perspective squeezes the far parts. Specification equation 3.7 first divides each attribute by w, interpolates, and then divides back. This is **perspective-correct interpolation**. In the experiment below, the chequerboard floor's squares bend when this is switched off.

**Depth testing** comes next. Each pixel holds in the depth buffer the nearest depth seen so far. A new fragment passes only if it is nearer (three.js's default comparison is "less than or equal", `LessEqualDepth`); it then writes its colour and writes its own depth into the buffer. This makes opaque results correct whatever order objects are drawn in. Where two triangles pass through each other, the intersection line comes out pixel by pixel.

::: lab ch8-model
model.title: A 64 × 40 software rasteriser
model.how: The left is the colour buffer; the right is the depth buffer (brighter means nearer). "Intersecting" is two triangles passing through each other. "Chequerboard" is a floor seen at a slant, whose perspective correction can be switched off. "Glass" is two semi-transparent panels, whose drawing order can be swapped, whose depth writing can be turned off, or which can be kept from crossing.
ctl.scene: Scene
scene.pair: Intersecting
scene.checker: Chequerboard
scene.glass: Glass
ctl.tilt: Tilt
ctl.persp: Perspective correction
ctl.order: Draw the gold one first
ctl.dw: Transparent objects also write depth (three.js default)
ctl.cross: The two panels cross
cv.aria: On the left, the low-resolution colour buffer; on the right, the matching depth buffer
cv.color: Colour buffer
cv.depth: Depth buffer
read.frag: Fragments
read.pass: Pass the depth test
read.fail: Hidden
read.wrong: Pixels that differ from the correct result
say.pair: The two triangles generate {f} fragments in all, and {x} of them are rejected by the depth test. Changing the drawing order leaves <em>every pixel unchanged</em>: for opaque objects the depth buffer is enough, and no sorting is needed.
say.checker.on: Perspective correction on: the chequerboard squares get smaller with distance, and the edges are straight.
say.checker.off: Perspective correction off: the texture coordinates are interpolated directly on screen. Each triangle is then "flat", and the squares <em>bend</em> along the diagonal. {d} pixels differ from the correct result.
say.glass: Compared with the correct result, where each pixel sorts all its fragments from far to near and then blends, <em>{w}</em> pixels are wrong. {why}
why.cross: The two panels pass through each other. Whichever is drawn first, half of the result is wrong; sorting by object cannot fix this.
why.front: The back panel is drawn after the front one has already written its depth, so the whole back panel is blocked. Or the blending order is reversed.
why.ok: Farther first, nearer later: exactly what three.js's sort by distance is meant to achieve.
:::

Now the question left from chapter 5 can be answered. Transparent objects rely on blending, and the result of blending depends on order. By default, transparent objects **also write depth** (`depthWrite` defaults to true, even when `transparent` is true). Three.js sorts objects by centre from far to near, which is correct for objects that do not intersect and are clearly one behind another. But two glass panels that pass through each other, a transparent bowl with a dent, or a sheet of water interleaved with other transparent objects have different answers at different pixels for "which is in front". No ordering of whole objects gets them right. This is the most common reason "transparent objects look wrong". The usual remedies: cut intersecting objects apart; for particles, grass and similar things, turn off `depthWrite` and accept a small error in blending order; use `alphaTest` or `alphaHash` to turn "semi-transparent" into "opaque with holes"; for a truly correct result, use an order-independent transparency algorithm, which takes several more render passes.

The model leaves out: clipping (in the experiment all vertices are in front of the near plane), multisample anti-aliasing, early depth testing, and the fact that the GPU actually runs fragment shaders on groups of 2 × 2 pixels ([[how-a-gpu-computes#ch9|How a GPU Computes, chapter 9]] explains why small triangles are therefore expensive). For how the colour in the buffer reaches the screen, see [[how-pixels-reach-a-screen#ch1|How Pixels Reach a Screen]]. {.take}

## Textures: laying a picture on a slanted floor {#ch9}

::: strings
toc: Textures: how an image goes on
:::

Each fragment uses its interpolated uv to fetch a colour from the texture. A distant pixel covers many texels, and fetching just one makes it flicker. So a chain of versions, each half the size of the last (the mipmap), is prepared in advance, and the level used depends on how many texels one pixel covers. {.law}

Texture coordinates uv run from 0 to 1 across the whole image. The fragment shader fetches a colour with the interpolated uv: this is called **sampling**. The simplest method takes the nearest texel (`NearestFilter`). A better one takes the four surrounding texels, weighted by distance (`LinearFilter`, bilinear). Both are fine up close. The trouble is far away. On a slanted floor, one screen pixel may cover dozens of texels. Sampling just one of them, a slight change of angle picks up a different one, and the picture "boils".

**Mipmaps** are the standard answer. When the texture is uploaded, a chain of versions each half the size of the last is generated (1024, 512, 256, down to 1 × 1), and each level is the average of four pixels of the level above. three.js defaults to `generateMipmaps: true`, with the filter defaulting to `LinearMipmapLinearFilter` (trilinear).

::: diagram dg-mip keys=dg.mip
cap: Figure 9. A chain of mipmaps: each level is the average of four pixels of the level above. All the levels together add up to exactly 4/3 of the original.
aria: Diagram: a chequerboard texture halved level by level, from 64 × 64 down to 1 × 1, with the size of each level labelled below
l0: Level 0
lk: Each side halved
sum: 1 + 1/4 + 1/16 + … = 4/3
:::

The GPU decides which level to use (specification section 3.8.10.1). It looks at how much uv changes between neighbouring pixels, converts that to texels, takes the larger of the x and y results, ρ, and computes the level λ = log₂ ρ. A pixel covering 8 texels uses level 3. The GPU can know about "neighbouring pixels" because it always runs fragment shaders on 2 × 2 blocks of pixels together, so they can subtract from one another.

On a slanted floor, a pixel covers many texels in one direction and few in the other. Choosing the level by the larger one keeps detail up close but makes far-away parts too blurry. **Anisotropic filtering** (`texture.anisotropy`, via the EXT_texture_filter_anisotropic extension) takes several samples along the long direction: N = long ÷ short samples (capped at the limit), each taken at the level for long ÷ N, so more detail is kept. three.js's default is 1, which means off. `renderer.capabilities.getMaxAnisotropy()` tells you the maximum you can use.

::: lab ch9-model
model.title: A slanted floor
model.how: The camera looks at a floor covered in chequerboard squares. The page computes λ for every pixel and samples in the chosen way. Distant squares are smaller than a pixel, so the correct colour there should be an even grey. The middle squares are still visible and should stay black and white. See which method does well at both ends.
ctl.filter: Filter
f.nearest: Nearest
f.linear: Bilinear
f.trilinear: Trilinear (default)
f.aniso: Anisotropic 8×
ctl.pitch: Viewing angle from above
ctl.lvl: Show mip level
cv.aria: A chequerboard floor in perspective, sampled with the chosen filter
read.far: Error in the distance
read.mid: Sharpness in the middle
read.lmax: Level λ at the farthest point
say: {f}: in the distance the average deviation from grey is <em>{e}</em>, and the middle keeps {c} of the contrast. {why}
why.nearest: Without mipmaps, a distant pixel picks up black or white at random, which gives the flickering "moiré".
why.linear: Bilinear also looks only at four points of level 0, so it flickers at a distance too.
why.trilinear: Mipmaps turn the distance into an even grey. The cost is that the middle gets a little blurry too, because the level is picked by the longer direction.
why.aniso: Several samples along the long direction keep the middle much sharper than trilinear. But at the farthest point, where a pixel's aspect ratio exceeds the limit of 8, a little flicker comes back.
:::

**Video memory.** A 1024 × 1024 RGBA texture, at 4 bytes per pixel, takes {=ch9.base}. With mipmaps it takes {=ch9.mip}, a third more. Textures in video memory are not compressed (unless you use a GPU compressed format such as KTX2). A 200 KB JPG on a web page occupies the same amount of video memory once decoded.

**Colour space.** Colours in image files are sRGB-encoded, not linear: an sRGB value of 0.5 actually represents a linear value of only {=ch9.lin}. Lighting has to be computed in linear space. three.js's rule: for colour maps, set `texture.colorSpace = SRGBColorSpace`. Textures default to `NoColorSpace`, and loaders set this for you. With it set, the GPU stores the texture in SRGB8_ALPHA8 format and converts it to linear when sampling. Do not set it for normal maps, roughness maps and other data. The renderer's `outputColorSpace` defaults to sRGB, and the last step encodes the linear result back: a linear 0.5 is output as {=ch9.srgb} (as {=ch9.srgb8} in 8 bits). Forget to set it, and colours look washed out or too dark.

The model leaves out: texture wrapping (here it repeats), non-power-of-two sizes, compressed formats, the way a real GPU implements anisotropy (the specification states the requirements, and each vendor does it differently), and cube maps. {.take}

## Shadows: looking again from the light {#ch10}

::: strings
toc: Shadows: looking again from the light
:::

A shadow map is a depth image drawn from the light's position. When drawing the main picture, each point asks: seen from the light, is there anything nearer in front of me? If so, I am in shadow. Stripes and floating both come from the limited resolution of this map. {.law}

This is Williams's 1978 method, and three.js still uses it. Before the main picture, `WebGLShadowMap.render` draws the scene from each light that casts shadows, writing only depth. A directional light (`DirectionalLight`) uses an orthographic camera, which by default covers a 10 × 10 unit area, with a 512 × 512 map (`shadow.mapSize`). When drawing the main picture, the fragment shader converts the point into the light's coordinates and compares its own depth with the depth stored in the map. If its own depth is greater, it is in shadow.

::: diagram dg-shadow keys=dg.shadow
cap: Figure 10. A directional light shines obliquely on the ground. One texel of the shadow map records only the depth along the ray through its centre (gold dot). Another point on the ground covered by the same texel (red dot) is a little further from the light, so comparing its own depth with the stored one makes it think something is blocking it. This is where the stripes come from.
aria: Diagram: a directional light shining on a sloped ground; one shadow-map texel covers a stretch of ground; the depth at the texel's centre and the depth of another point inside it
lv: Directional light
cv: Red dot is further from the light than gold
tx: One texel
near: Stored depth
me: My depth
sh: Comparison fails: counted as in shadow
:::

The trouble is that the map is made of cells. A cell stores the depth along the ray through its centre, yet the ground the cell covers has points at different distances from the light. Half of them are a little farther than the stored value, so they shadow themselves. This produces alternating light and dark bands across the ground, called **shadow acne**. "Stripes in the shadow" are usually this. The remedy is **bias** (`shadow.bias`): before the comparison, the point's depth is moved a little toward the light (in three.js, `shadowCoord.z += shadowBias`, so the value should be negative). Too much bias also moves away the part of the shadow that lies right on the ground, so the object appears to float above the ground. This is called **peter-panning**. Another parameter, `shadow.normalBias`, moves the sample point out along the surface normal, which works better on slopes.

::: lab ch10-model
model.title: A shadow map seen from the side
model.how: A two-dimensional scene: ground, a thin pillar, a box and a slope, with a light coming from the upper left. The row of small squares below is the shadow map (brighter means further away). Drag resolution, bias and normal bias to see the stripes on the ground (red dots: should be lit but computed as dark) and the missing shadow (cyan dots: should be dark but computed as lit).
ctl.th: Light angle
ctl.res: Map resolution
ctl.bias: bias
ctl.nb: normalBias
ctl.pcf: PCF softening
cv.aria: The scene seen from the side, with the light rays, the cells of the shadow map and the lit or dark verdict for each surface point
cv.map: Shadow map (brighter means further)
read.acne: Stripes (wrongly dark)
read.leak: Light leaks (wrongly lit)
read.tex: Width of one cell
read.gap: Gap at the foot of the pillar
say: One cell covers {tx} units. {acne} {leak}
say.acne: <em>{a}</em> of the surface that should be lit shadows itself: these are the stripes.
say.noacne: The stripes have gone.
say.leak: {l} of the places that should be in shadow are computed as lit. The pillar's shadow only starts {g} away from its foot.
say.noleak:
:::

Several things can be seen from this model. First, with bias at 0, about half the lit surfaces are judged to be in shadow. This is the alternating light-and-dark pattern of stripes. Second, raising the resolution reduces the bias needed and reduces both kinds of error. But video memory and the time to draw the shadow map grow with the number of cells. Third, too much bias separates the pillar's shadow from its foot. In real scenes, the wider the area the light's camera covers, the wider each cell's ground footprint. So tightening `shadow.camera` to just enclose the objects that cast shadows is more effective than simply enlarging the map.

The [[fable-flight|3D short film]] on this site (three.js r170) was tuned this way. Its moonlight shadow map is 4,096 × 4,096, with `bias` −0.0006 and `normalBias` 0.06. Because the buildings do not move, it turns off `shadowMap.autoUpdate`, drawing the shadow map just once at the start and saving a whole drawing pass from the light on every later frame. The `PCFSoftShadowMap` it used has been removed since r186: in r187, setting it prints a warning and falls back to `PCFShadowMap` (the default). That one uses hardware comparison and averages five samples taken on a small rotating disc, which softens the shadow edge somewhat.

The model leaves out: the third dimension, point lights (which need six directions) and spotlights, cascaded shadows, hardware comparison sampling, and VSM shadows. PCF uses 5 points in a line instead of a disc. The scene was chosen for the picture. {.take}

## Why a draw call is expensive {#ch11}

::: strings
toc: Why a draw call is expensive
:::

One mesh is at least one draw call. Before each call, three.js has to switch programs on the CPU, upload this object's matrix and material parameters, and bind buffers. The browser also checks every single call. With many objects, the CPU gives out first, while the GPU sits idle. {.law}

When `renderScene` draws each object, `renderBufferDirect` does a series of steps. It gets the object's program (chapter 6). `WebGLState` compares whether the blending, depth, face-culling and similar switches need changing (it caches the current state, and does not call WebGL if nothing changed). It uploads the object's own uniforms, at least its model-view matrix and normal matrix. It binds the vertex array, and finally issues a `drawElements`. Each step is small, but each one is in JavaScript, and each passes through the browser's checks.

I measured this on the same machine (Apple M6, Chromium 151, ANGLE to Metal, three.js r187, 20 November 2026; the script is `tools/measure-calls.cjs` in this page's directory). For a thousand cubes sharing one geometry and one material, `render()` takes {=ch11.k1} ms per frame on the main thread, an average of {=ch11.per} µs per mesh. When each cube has its own geometry and material, each takes {=ch11.perOwn} µs. Replace them with a single `InstancedMesh` of a thousand instances and the same picture takes just 1 draw call, and the main-thread time is almost unmeasurable. At 1 µs per call, a 16.7 ms frame leaves room for only {=ch11.cap} calls from the CPU side alone. The CPU time in a frame must also cover your own logic, physics and the browser's other work.

::: diagram dg-calls keys=dg.calls
cap: Figure 11. The same N objects, drawn three ways. Separate meshes: N draw calls, each object culled on its own. Instancing: one draw call, with each instance's matrix in a buffer, culled as a group. BatchedMesh: one multi-draw, with each object culled and sorted one at a time on the CPU.
aria: Diagram: on the left, N objects each with its own call; in the middle, one instanced call and a row of instance matrices; on the right, one batched call with a range for each object
sep: N Meshes
sepc: N calls
ins: InstancedMesh
insc: 1 call
insm: 16 floats per instance
bat: BatchedMesh
batc: 1 multi-draw
batm: A range per object
:::

three.js offers three ways to turn N calls into one:

- **Merging**: join all the geometries into one large geometry with `BufferGeometryUtils.mergeGeometries`. This is one call, but from then on they are one object. They cannot move individually, and can only be culled as a whole. Suitable for static scenery. {#m1}
- **InstancedMesh**: draw N copies of the same geometry and material, each copy's matrix kept in an `instanceMatrix` buffer (16 floats per instance, 64 bytes), all drawn at once by `drawElementsInstanced`. Instances can move individually, but when they do, the whole buffer must be re-uploaded. Culling uses one bounding sphere for the whole group, and that sphere, once computed, is not updated automatically. If instances move outside the original area, they may be wrongly culled as a group, so call `computeBoundingSphere()` yourself. {#m2}
- **BatchedMesh**: geometries can differ, but the material is the same. Everything is drawn in one `multiDrawElements`. It culls and sorts each object on the CPU (a little more JavaScript work per frame), so invisible parts are not drawn. {#m3}

::: lab ch11-model
model.title: N objects, four ways to draw
model.how: Drag the number of objects to see how many draw calls each of the four methods needs per frame, and how much CPU time they take (relative to a 16.7 ms frame). The cost per call is one parameter. The default is 1 µs, the top of the measurement above, rounded; on other machines it may be several times different, and you can change it. Tick "every object is moving" to see which methods still work.
ctl.n: Number of objects
ctl.us: CPU cost per call
ctl.mov: Every object is moving
cv.aria: Bars for the CPU time per frame of four methods, with a budget line for a 16.7 ms frame
cv.x: CPU time per frame (ms, log scale)
s.separate: Separate meshes
s.merged: Merged into one
s.instanced: InstancedMesh
s.batched: BatchedMesh
cv.budget: 16.7 ms frame
cv.na: Cannot move
read.calls: Calls drawn separately
read.sep: CPU time drawn separately
read.inst: CPU time instanced
read.up: Instanced re-upload per frame
say.fit: Drawing the objects separately ({n} calls) costs {ms} on the CPU alone, <em>{share}</em> of a frame. {mv}
say.over: Drawing the objects separately ({n} calls) costs {ms} on the CPU, <em>more than a whole frame</em>. Even before the GPU is counted, the frame rate can be at most {fps} per second. {mv}
mv.static: For things that do not move, merging into one is the cheapest.
mv.moving: Merging stops working when everything moves. Instancing must re-upload {up} per frame, and BatchedMesh still culls one object at a time on the CPU.
:::

[[fable-flight|The 3D short film on this site]] takes this as far as it goes. The picture has 24,000 sheets of paper flying in the air. Each sheet is a `PlaneGeometry(1, 1, 3, 5)`: {=ch11.fv} vertices and {=ch11.ft} triangles. If each sheet were a mesh, that would be {=ch11.fpages} draw calls. At the {=ch11.per} µs per call measured on that machine, the CPU alone would need {=ch11.flo} ms; at the model's default of 1 µs, {=ch11.fhi} ms. That is anywhere from nearly half of a 16.7 ms frame to more than all of it. It uses an `InstancedBufferGeometry`. All sheets share the one piece of board, and each sheet carries only 9 floats of instance attributes (4 random numbers, its place in the "bird" the pages finally form, and its index), {=ch11.fb} in total, uploaded once at the start. How each sheet flies, flips and curls is computed entirely in the vertex shader from the time `uTime` and a few control values. It also turns `frustumCulled` off, because the paper flies outside its original bounding sphere. The result is {=ch11.ftot} triangles, one draw call per frame for the pages, and only about ten uniforms (the time, the bird's position and the like) passed from the CPU each frame.

The model leaves out: the GPU side (more vertices and pixels make the GPU the bottleneck just as well), the differing costs of state changes, the overhead of the browser passing WebGL calls to another process, and the memory cost of merging geometry itself. The cost per call was measured on one machine and should be used only as a default. {.take}

## Picking and animation {#ch12}

::: strings
toc: Picking and animation
:::

Working out which object a click hit reverses the chain of chapter 4. A ray is cast from the camera through the mouse position, tested against bounding spheres first, then against every triangle. Smooth rotation relies on quaternions, which interpolate along the shortest arc between two orientations. {.law}

**Picking.** `Raycaster.setFromCamera(mouse, camera)` converts the mouse's screen position into coordinates from −1 to 1 and places it at depth 0.5. It uses the inverse of the projection matrix and the camera's world matrix to turn it back into a point in the world. The ray starts at the camera and points to this point. Then `intersectObject` calls `Mesh.raycast` on each mesh:

- First, test against the bounding sphere in world space. If the ray misses the sphere, this mesh is skipped. {#r1}
- If it hits, transform the ray into the object's own coordinates with the inverse of the world matrix. That way thousands of vertices need not be transformed, only one ray. If the geometry's bounding box has already been computed, it is used as a second filter. {#r2}
- Then test **triangle by triangle**, with no acceleration structure. r187's `Ray.intersectTriangle` uses the "watertight" test of Woop, Benthin and Wald (2013). It re-expresses the ray direction along its main axis, and counts a hit only when the three edge functions (the same ones as in chapter 8) have the same sign. This guarantees that a ray striking exactly on the common edge of two triangles does not slip through the crack. This test was adopted only in June 2026 (from r186 on). Earlier versions, and many tutorials, describe the other method, Möller–Trumbore (1997). {#r3}
- Finally, sort all hits by distance. {#r4}

::: lab ch12-model
model.title: One click, how many triangles were tested
model.how: Click on the sphere, or move the "mouse" with the two sliders. The ray is first tested against the bounding sphere (the dashed circle). If it hits, every triangle is tested one by one, and the one hit is highlighted.
ctl.x: Mouse horizontal
ctl.y: Mouse vertical
cv.aria: A wireframe sphere, its bounding sphere and the mouse position; the triangle hit is highlighted
read.sphere: Bounding sphere
read.tested: Triangles tested
read.hit: Triangle hit
read.dist: Distance
hit.yes: Hit
hit.no: Missed
say.hit: The ray hit the bounding sphere, so <em>all {n} triangles were tested</em>, and it struck number {f}, at distance {d}.
say.miss: The ray missed the bounding sphere, so no triangle needed testing.
say.near: The ray hit the bounding sphere, all {n} triangles were tested, and <em>none was hit</em>. The bounding sphere is a little larger than the sphere itself, so those tests were wasted.
:::

So for a model with hundreds of thousands of triangles, each mouse move over it means testing hundreds of thousands of triangles. The common remedies are to prepare a low-poly model just for picking, or to build a tree over the geometry (a BVH, bounding volume hierarchy) with a third-party library.

**Why rotation is stored as a quaternion.** `object.rotation` is an Euler angle: how many degrees to turn around x, y and z in turn. It is intuitive, but it has two flaws. One is **gimbal lock**: when the middle axis reaches 90°, the first and third axes coincide, and one degree of freedom is lost. The other is interpolation: going from one orientation to another by interpolating each of the three angles linearly does not follow the shortest path, and the speed is uneven. A quaternion expresses a rotation with four numbers, and **spherical linear interpolation** (slerp) between two quaternions follows exactly the shortest arc, at constant angular speed.

`Quaternion.slerp` handles two further details. q and −q represent the same rotation, so when the dot product is negative one of them is negated, ensuring the shorter side is taken. And when two orientations are almost the same (dot product ≥ 0.9995), it switches to ordinary linear interpolation followed by normalisation, to avoid dividing by a number close to 0. In the animation system, when `AnimationMixer` plays rotation keyframes (`QuaternionKeyframeTrack`), `QuaternionLinearInterpolant` calls `slerpFlat` between two keyframes.

::: lab ch12-slerp keys=ch12.s
model.title: Euler-angle interpolation and slerp take different paths
model.how: An arrow turns from one orientation to another. Drag t. The gold path is traced by the tip of the slerp arrow; the cyan path is traced by interpolating the three Euler angles separately. On the right is the angle turned, against t.
ctl.t: t
cv.aria: On the left, the paths of two arrow tips on the unit sphere; on the right, two curves of the angle turned against t
leg.slerp: slerp
leg.euler: Euler-angle interpolation
cv.x: t
cv.y: Angle turned so far
read.total: Angle between the two orientations
read.slerp: Covered by slerp
read.euler: Covered by Euler-angle interpolation
say: The two orientations differ by {a} in all. At t = {t}, slerp has turned {s}, at a steady pace, and covers {a} in total. Interpolating the three Euler angles separately, the path turned <em>{e}</em> in all, going the long way round, with the speed rising and falling.
:::

The model leaves out: `Raycaster`'s `near`, `far` and `layers`, and picking of lines, points and sprites; double-sided and back-face materials (the page tests only front faces); and `AnimationMixer`'s blending, weights and time scale. {.take}

## Where the frontier is (November 2026) {#ch13}

::: strings
toc: Where the frontier is
:::

WebGL 2 is a 2017 interface, underneath which lies the older OpenGL ES 3.0. WebGPU uses a new model that is closer to Metal, Vulkan and Direct3D 12: pipelines built ahead of time, bind groups, command buffers, and general computation directly on the GPU. three.js is moving its renderer onto it. {.law}

### Established {#h.est .sub3}

- WebGL 2's semantics are those of OpenGL ES 3.0. Clipping, division by w, the viewport, the pixel-centre rule of rasterisation, perspective-correct interpolation and mipmap level selection all come from that specification. The WebGL 1.0 specification only requires the depth buffer to have "at least 16 bits". {#e1}
- The lighting formulas used in this essay: the GGX distribution (Walter et al., 2007); the correlated form of Smith occlusion (Heitz, 2014; the implementation follows Lagarde and de Rousiers, 2014); Schlick's Fresnel (1994) and its exponential approximation (Karis, 2013); and multiple-scattering compensation (Turquin, 2019). Shadow maps: Williams, 1978. The watertight ray–triangle test: Woop, Benthin and Wald, 2013. {#e2}

### Already built {#h.demo .sub3}

- three.js r187 (30 October 2026) has two renderers side by side: the `WebGLRenderer` this essay describes, and `WebGPURenderer`. The latter falls back to the WebGL 2 backend when the browser does not support WebGPU (or can be forced with `forceWebGL`). Its materials are written in TSL (the three.js shading language): a node graph is assembled in JavaScript, which generates WGSL or GLSL, instead of relying on the string assembly and `#define`s of chapter 6. It also has `renderer.compute()`, which can move work such as particle simulation onto the GPU. {#d1}
- According to the implementation status page maintained by the W3C GPU for the Web working group (updated 2 October 2026, viewed 20 November 2026): Chrome has enabled WebGPU by default on Windows, macOS and ChromeOS since version 113, and on Android since version 121 (Android 12 and later). On Linux it is supported from version 144 for Intel 12th-generation and later GPUs, and from version 147 for NVIDIA under Wayland; elsewhere on Linux it still needs a flag. Firefox 141 enabled it on Windows (July 2025); from version 145 it is on in macOS 26 and later, and from version 147 on all macOS. Safari 26 has it on in macOS, iOS, iPadOS and visionOS 26. {#d2}
- The WebGPU specification is at the W3C as a "Candidate Recommendation Draft". The latest version is dated 16 November 2026. {#d3}

### Specifications, plans and claims {#h.claim .sub3}

- The implementation status page says that Firefox on Linux is still only in Nightly, and that Mozilla "expects to ship on Linux in 2026"; Firefox for Android is still behind a flag. This is a plan, not the current state. {#c1}
- The day before r187 was released (29 October 2026), a set of new features was merged into three.js (PR #35191, included in r187) that adds replaceable "drawing pipelines" to the WebGPU renderer: a standard one in the core, and a meshlet one and a visibility-buffer one among the examples. The code is marked experimental. It addresses precisely the "too many objects" problem of chapter 11, moving more culling and batching onto the GPU. I found no public measurements of its effect. {#c2}

Still unresolved: until WebGPU works on all platforms, most three.js users remain on WebGL, and the two renderers will coexist for some time. Materials written in TSL are not compatible with the older `ShaderMaterial` and `onBeforeCompile`, so migrating requires code changes. And the transparency-sorting problem (chapter 8) exists on WebGPU too.

Browser versions, dates and features go out of date. Every fact in this chapter reflects the situation as of November 2026, so check its date before relying on it. {.take}

## Wrap-up: when a scene is slow or wrong, ask three questions first {#ch14}

::: strings
toc: Wrap-up: ask three questions
:::

You need not remember every detail. When a scene is slow or drawn wrongly, ask three questions. Is it the CPU or the GPU that is slow? What makes it redo each frame something that could have been done once? Where are the numbers not precise enough, or the order wrong? {.law}

{.qs}
- **Is it the CPU or the GPU?** Look at `renderer.info.render.calls`. Several thousand draw calls usually means the CPU is overwhelmed by JavaScript and the browser's checks (chapter 11); use instancing, merging or BatchedMesh. If the call count is low and it is still slow, it is the GPU: too many vertices (chapter 3), too many pixels or too heavy a shader (chapter 7), or a shadow map that is too large (chapter 10). Halve the canvas: if it speeds up, it is a pixel problem. {#q1}
- **What is redone every frame?** Both matrices of every object are recomputed each frame (chapter 2; for static objects, turning off `matrixAutoUpdate` saves their compose). Adding a light or changing a material combination triggers recompilation (chapter 6; call `compile` before the scene starts). Static shadows are redrawn each frame (chapter 10; `shadowMap.autoUpdate = false`). Changing vertices re-uploads the whole array (chapter 3). {#q2}
- **Where are the numbers not precise enough?** Flickering: the depth slots are too few, so push the near plane outward (chapter 4). Transparent objects in the wrong order: sorting by object is not enough, so cut them apart or turn off depth writing (chapter 8). Shadows striped or floating: the shadow map cells are too coarse, so tighten the shadow camera and adjust bias (chapter 10). Distant textures flickering: no mipmaps, or the angle is too oblique, so turn on anisotropy (chapter 9). {#q3}

In one sentence: `renderer.render(scene, camera)` is a translator. It turns your scene tree into a stream of GPU commands. It does a lot each frame, but every piece can be counted: how many matrices, how many calls, how many programs, how many pixels. When something is slow or wrong, it can be traced to one of these numbers. {#sum .sum}

Related essays: [[computer-graphics]] (2D transforms, rasterisation and diffuse light, the introductory version), [[linear-transform]] (how a matrix moves the plane), [[robot-kinematics]] (a chain of joints is a chain of matrices, the same thing as a scene tree), [[how-a-gpu-computes]] (how a GPU organises thousands of threads, and the 2×2 fragment groups), [[how-pixels-reach-a-screen]] (what happens after the colour buffer: compositing, vertical sync), and [[fable-flight]], the 3D short film made with three.js. {#links}

::: footer
**Sources.** three.js r187 source (the r187 tag of mrdoob/three.js on GitHub, commit 7e89746a, 30 October 2026; identical to the `src/` directory of the npm package three@0.187.0): core/Object3D.js, BufferGeometry.js, BufferAttribute.js, Raycaster.js; math/Matrix4.js, Quaternion.js, Frustum.js, Sphere.js, Ray.js; cameras/PerspectiveCamera.js; renderers/WebGLRenderer.js and, under webgl/, WebGLRenderLists.js, WebGLPrograms.js, WebGLProgram.js, WebGLState.js, WebGLShadowMap.js, WebGLTextures.js; renderers/shaders/ShaderChunk/: bsdfs, lights_physical_pars_fragment, lights_fragment_begin, shadowmap_pars_fragment, logdepthbuf_fragment; objects/Mesh.js, InstancedMesh.js, BatchedMesh.js; animation/; renderers/common/. The file-by-file and line-by-line references are in BRIEF.md in this page's directory.

Khronos, OpenGL ES 3.0.6 specification (sections 2.13, 2.18, 3.6.1, 3.8.10); WebGL 1.0 and WebGL 2.0 specifications; the EXT_texture_filter_anisotropic and EXT_clip_control extensions. W3C, WebGPU (Candidate Recommendation Draft, 2026-11-16); gpuweb working group, Implementation Status (updated 2026-10-02). B. Walter et al., Microfacet Models for Refraction through Rough Surfaces, EGSR 2007. E. Heitz, Understanding the Masking-Shadowing Function in Microfacet-Based BRDFs, JCGT 3(2), 2014. S. Lagarde and C. de Rousiers, Moving Frostbite to Physically Based Rendering 3.0, SIGGRAPH 2014 course notes. C. Schlick, An Inexpensive BRDF Model for Physically-based Rendering, Computer Graphics Forum 13(3), 1994. B. Karis, Real Shading in Unreal Engine 4, SIGGRAPH 2013 course. E. Turquin, Practical multiple scattering compensation for microfacet models, 2019. L. Williams, Casting Curved Shadows on Curved Surfaces, SIGGRAPH 1978. S. Woop, C. Benthin and I. Wald, Watertight Ray/Triangle Intersection, JCGT 2(1), 2013. T. Möller and B. Trumbore, Fast, Minimum Storage Ray/Triangle Intersection, Journal of Graphics Tools 2(1), 1997. N. Reed, Depth Precision Visualized (NVIDIA Developer Blog, 2015-07-03). K. Shoemake, Animating Rotation with Quaternion Curves, SIGGRAPH 1985.

**The model.** The page does not load three.js. The matrices, quaternions, scene-tree update, geometry construction, projection, frustum planes and bounding-sphere test, the two sort functions, the shader cache keys, the BRDF terms, the integration of the DFG table and the watertight ray test are all rewritten from the r187 source. The `tools/crosscheck.cjs` in this page's directory compares them item by item with three@0.187.0 on the same inputs (54 items, all agree; the results are recorded in BRIEF.md). Rasterisation is done pixel by pixel on a 64 × 40 buffer following OpenGL ES 3.0's rules. Texture sampling follows the specification's level formula, and shadows are two-dimensional. The timing of draw calls and shader compilation was measured on one machine; the machine and dates are given in the text, and in the model these are only adjustable parameters. This essay was written by Claude (Anthropic's AI).
:::
