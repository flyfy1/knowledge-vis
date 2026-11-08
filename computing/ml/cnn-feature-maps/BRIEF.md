# BRIEF · cnn-feature-maps CNN 特征图

category `computing`, stage `university`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: convolution is the 1-D signal convolution (flip, slide, multiply, sum); this page is 2-D image kernels, feature maps, ReLU/pooling, layer stacking and kernel learning (<30% overlap); they cross-link.

## Steps
**0 Sliding window.** Knows: weighted sum. Question: how is one output pixel computed? Inputs window (i,j), kernel choice; seek nine products and their sum. Controls: sliders, kernel buttons, Scan animates the window (reduced motion jumps to the end). Holds: valid (no padding) cross-correlation, 12×12 → 10×10.
**1 Different kernels.** Knows: step 0. Question: why do kernels give different maps? Inputs image, highlighted kernel; seek counts of |response|>0.5 for vertical/horizontal edge. Controls: five image buttons.
**2 Edit a kernel.** Knows: step 1. Question: how do the nine numbers set the output? Inputs nine weights (−5..5), image, presets; seek weight sum (0 → edges, 1 → brightness kept), output max/min.
**3 ReLU and pooling.** Knows: feature map. Question: size and content after a layer? Inputs padding 0/1, stride 1/2, ReLU, pooling; seek ⌊(12+2p−3)/s⌋+1 and pooled size.
**4 Stacking.** Knows: edge maps. Question: can edges combine into corners? Inputs a, b (0–2), threshold c (0–12); seek maximum and count of positions above half the maximum. Holds: hand-set toy neuron on a square.
**5 Learn the kernel.** Knows: all. Question: can the kernel be learned? Inputs learning rate (0.02–0.25), Train 1/10/100, Reset; seek loss and max |learned − target|. Holds: target = vertical-edge map of the scene, identity start, full-batch gradient descent. Links: convolution#step0, gradient-descent#step0, backpropagation#step0.

## First-appearance terms
Kernel, feature map, cross-correlation (0); edge kernel, blur, sharpen (1); padding, stride, ReLU, max pooling (3); layer, threshold (4); gradient descent on kernel weights, learning rate (5).

## Simulation vs reality
Synthetic images and a single channel; no bias, no multi-channel kernels, no learned deep features; the corner detector is hand-set; training converges only for a stable learning rate (about <0.3 here).
