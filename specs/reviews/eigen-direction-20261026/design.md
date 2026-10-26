# Eigen-direction learning slice — design adjudication

Base main93346e21; isolated branch codex/eigen-direction-20261026. Independent design reviewer `/root/design_review` approved the bounded direction before implementation, with mathematical/control constraints adopted below. Full independent gate is archived alongside when returned.

Evidence: atlas eigen primary source goes to diagonalisation#step4, while its definition/edge task belongs to#step1. At44.8° default matrix, old readout gives angle0.133333° but says “v is an eigenvector” and λ=3.000. [Baseline](baseline.json). This is not a broken URL: it is a mismatched learning task and an inaccurate approximate-membership claim.

Build/reuse: keep existing v/A/matVec/arrow renderer and graph relationships. Correct one node destination, add one direction control to existing S1, render the part of Av off v's line, and distinguish projection coefficient from eigenvalue. No new page/route/node, physical simulation, clock, store or matrix editor. One small pure probe reuses existing vector primitives. Other six course steps stay out of scope.

Adopt independent constraints: p is a projection coefficient until residual is numerically zero; Av=0 has no line angle yet can have λ0 for nonzero v; relative floating tolerance must scale with matrix/vector magnitude. Slider uses step=any to preserve pointer precision, explicit0.1° keys (Shift1°), Home0/End360, one angle setter;180° wraps only the undirected curve. Negative λ remains valid. Three presets are real symmetric with distinct eigenvalues; do not generalize “two directions” to every2×2 matrix.

P0/high-return slice: truthful source→task, one authoritative angle, clear arrows/residual/legend, exact-versus-near feedback, bilingual native control/keyboard, mobile, sources/spec and source attribution. P1: one optional prediction/reveal without grading or tracking, existing PCA continuation. P2/deferred: no extra motion polish, normal-mode/PCA solver, arbitrary matrix reform, general eigen-course audit or LeetCode changes. Those would expand the learning problem or need separate evidence.

Tokens: reuse eigen --panel#161b22,--text#e8edf4,--muted#9aa7b8,--accent#6ee7ff,--accent2#ffb454,--accent3#ff7a93,--line#2b3547; shared48px controls/3px focus. No animation added. Legend uses labels/shape, not color alone. New details/related text wrap, remain optional, and preserve existing language/active-step ownership.
