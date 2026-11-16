---
lang: en
---

::: strings
back: ← Knowledge Index
category: Computing & AI
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: CNN Feature Maps · How a Small Window “Sees” an Image
tagline: A 3×3 window slides across an image; edges, blur and sharpening are just different sets of nine numbers. Stack them, then let the machine learn the numbers itself.
docTitle: CNN Feature Maps · How a Small Window “Sees” an Image
:::

## At one position of the window, how is a single output pixel computed? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Sliding window
:::

::: html step0-1
s0step: "Step 0 · "
s0k: The sliding window
:::

<b>This step answers: how does a kernel turn a small patch of pixels into one number?</b> Lay the 3×3 kernel on the image, multiply matching cells and add the nine products to get one pixel of the output map at that position. The orange box is the current window and the right map shows what has been computed so far. Following the CNN convention, “convolution” here does not flip the kernel (strictly it is cross-correlation). Drag the position or press Scan to let the window sweep by itself. {#s0e .explain}

::: html step0-2
s0cv: Left: a 12×12 toy image with the window box; middle: kernel and the nine products; right: the output map computed so far
lblRow: Window row i
lblCol: Window column j
kn_edgeV: Vertical edge
kn_edgeH: Horizontal edge
kn_blur: Blur
kn_sharpen: Sharpen
scan: Scan
:::

::: strings
pause: Pause
:::

## Same image, different kernel: why is the output map so different? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Different kernels
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Different kernels see different things
:::

<b>This step answers: how do a kernel’s nine numbers decide what it “cares about”?</b> The vertical-edge kernel (negative left, positive right) responds only where brightness differs left to right; the horizontal-edge kernel looks at top-versus-bottom; the blur kernel averages neighbours; the sharpen kernel emphasises the centre. In the output maps orange is positive response and cyan is negative. Change the picture and count where each edge kernel responds strongly: the stripes image has only vertical edges. {#s1e .explain}

::: html step1-2
s1cv: The input image and the four kernels’ output feature maps
im_square: Square
im_circle: Circle
im_stripes: Stripes
im_diag: Diagonal
im_scene: Scene
:::

## Change the nine numbers and how does the output change? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Edit a kernel
:::

::: html step2-1
s2step: "Step 2 · "
s2k: Edit the kernel
:::

<b>This step answers: how are the kernel numbers tied to the output?</b> Type weights (−5 to 5) straight into the grid and the output map changes at once. When the weights sum to 1 overall brightness is preserved (blur, sharpen); when they sum to 0 flat regions give 0 and only changes remain (edge detection). Load a preset kernel and then tweak it. {#s2e .explain}

::: html step2-2
s2cv: Left: the input image; right: the output map from your kernel
lblCell: One kernel weight
kn_id: Identity
:::

## How big is the output map, and what do ReLU and pooling do? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 ReLU and pooling
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Padding, stride, ReLU and pooling
:::

<b>This step answers: how do size and content change after a convolution layer?</b> Output side = ⌊(n + 2·padding − 3)/stride⌋ + 1: padding 1 keeps the size, stride 2 roughly halves it. ReLU turns negative responses into 0, keeping only where this kind of edge is present. Max pooling takes the largest value in each 2×2 block, halves the map, keeps the strongest response and is less sensitive to small shifts. Toggle each option. {#s3e .explain}

::: html step3-2
s3cv: Left: the input; right: the output after convolution (and optionally ReLU and pooling)
lblPad: Padding (0 or 1)
lblStride: Stride (1 or 2)
btnRelu: ReLU (negatives to 0)
btnPool: 2×2 max pooling
:::

::: strings
on: on
off: off
:::

## Can combining edges find a “corner”? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Stacking
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Stacking layers
:::

<b>This step answers: how does a second layer build more complex features from the first?</b> Layer 1 gives a vertical-edge map |Gx| and a horizontal-edge map |Gy|. A layer-2 neuron averages each over 3×3, takes a weighted sum and subtracts a threshold: out = ReLU(a·V + b·H − c). When a and b are large enough and the threshold c is set just right, only places where vertical and horizontal edges both appear light up: the four corners of the square. Lower c and whole edges light up; raise it and nothing does. {#s4e .explain}

::: html step4-2
s4cv: Vertical-edge map, horizontal-edge map and layer-2 output for a square
lblA: Vertical weight a
lblB: Horizontal weight b
lblC: Threshold c
:::

## Without being told the answer, can a machine learn the edge kernel itself? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Learn the kernel
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · learning the kernel
:::

<b>This step answers: where do the kernels in a CNN come from?</b> Instead of hand-writing a kernel we start from the “do nothing” kernel, give the machine an image and a target feature map, and use gradient descent to adjust the nine weights so the mean squared error between output and target keeps shrinking. The result ends up almost identical to the hand-made vertical-edge kernel: compare the learned kernel with the target cell by cell. Press Train, change the learning rate and watch the error curve (log scale). A learning rate that is too large diverges. {#s5e .explain}

::: html step5-2
s5cv: Learned kernel versus target kernel and the training error falling with steps
lblLr: Learning rate
train1: Train 1 step
train10: Train 10 steps
train100: Train 100 steps
reset: Reset
recapTitle: Recap
recap1: A kernel is nine numbers: wherever it slides it takes a weighted sum of nearby pixels to make one pixel of the feature map.
recap2: Different kernels look for different things; ReLU and pooling keep strong responses and shrink the map; a second layer can assemble edges into corners.
recap3: Kernels can be learned by gradient descent instead of being hand-written.
modelTitle: Scope and limits of the model
modelText: Model: synthetic 12×12 grayscale images, 3×3 kernels, no bias, one channel; the layer-2 neuron in step 4 is a hand-set toy. Real CNNs have hundreds of channels and many layers, and their kernels are learned on huge sets of real pictures and are not simply “edges” and “corners”.
link0: → Convolution: the one-dimensional “flip, slide, multiply, sum”
link1: → Gradient Descent: how to adjust parameters step by step
link2: → Backpropagation: how the error flows back to each weight
:::

Page complete. {#done .readout .success i18n=text}

::: strings
lblInput: input 12×12
lblOutput: output 10×10
lblKernel: kernel
lblProducts: products
s0ro: {name} kernel, window at ({i}, {j}): the nine products sum to {sum}; the whole output map is {n}×{n}.
s1ro: {img}: {v} positions respond above 0.5 in the vertical-edge map and {hh} in the horizontal-edge map (out of {n} positions).
kindZero: sum 0: flat areas give 0, only changes remain
kindOne: sum 1: overall brightness preserved
kindOther: sum is neither 0 nor 1: overall brightness is scaled
s2ro: Weights sum to {sum} ({kind}); output maximum {mx}, minimum {mn}.
lblInputSize: input {n}×{n}
lblOutSize: output {n}×{n}
s3ro: Padding {pad}, stride {st}: convolution output {n1}×{n1} ({formula}); ReLU {relu}, pooling {pool}; final {n2}×{n2}.
lblV: vertical |Gx|
lblH: horizontal |Gy|
lblL2: layer-2 output
s4roNone: a = {a}, b = {b}, c = {c}: nothing exceeds the threshold, so the output is all 0.
s4ro: a = {a}, b = {b}, c = {c}: maximum output {mx}; {act} positions exceed half of the maximum.
lblLearned: learned kernel
lblTarget: target (vertical edge)
axLoss: mean squared error (log)
axTrain: training steps
s5ro: After {n} steps at learning rate {lr}: error {loss}; the largest difference between learned and target kernel is {gap}.
:::
