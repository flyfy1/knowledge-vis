# Mathematics & Physics Atlas

Design contract: ../specs/reviews/math-physics-atlas-design-review.md.
Category: math. Stage: university (collection audience, not a per-node prerequisite).

## MVP card

Target user: a learner exploring the existing interactive mathematics/physics pages.
Job: understand how two concepts connect and reach the supporting explanation.
Riskiest assumption: explicit local relations help navigation more than category cards.
Loop: search Fourier -> select convolution relation -> read its conditions -> open
the convolution theorem lesson section -> return to the same atlas state.
Input: 24 editorial concepts in foundations, waves, systems, and measurement.
Output: concise bilingual definitions, directed relation statements, and source links.
Proof: browser exercises that loop and verifies the destination section, history,
language, mobile list, graph, filters, and no-result recovery. User learning needs
subsequent task-based comparison; browser success does not establish learning gains.
No-gos: changes to existing lesson logic, user data uploads, AI-generated relations,
new services, new runtime libraries, unrelated pythagoras work.
Appetite: one static navigation slice.

## Scope

P0 (the highest-return slice): all functionality in the loop, accessible list and
stable graph, three editorial routes using the same concepts, homepage entry,
English/Chinese parity, evidence and public delivery.
P1: more physics topics after observing use. P2: optional visual refinement.
Deferred: 3D/force simulation (no task benefit), semantic zoom (small graph), automatic
extraction (quality unproved), progress tracking (no learning signal), large-scale
optimization (no measured bottleneck).

## Content and relation contract

Every node has a stable ID, region, bilingual title/definition, optional formula,
and a source URL. Internal sources are labelled interactive lessons; external
textbook sources are labelled reading. Region position is editorial, not similarity.
All edges are directed statements with one of four types: foundation (helps explain),
representation (expresses another view), application (used in), connection (a stated
mathematical connection with conditions). Each has a bilingual reason and source.
Arrows encode the statement direction, never a universal learning order or causation.
Fourier/convolution statements name transform existence; frequency response names LTI;
Laplace restriction names the region of convergence; CLT names iid finite variance;
Gaussian/Kalman optimality names linear Gaussian assumptions. No physical experiment
is being claimed. Source content is editorial evidence, not an automatic proof.

## UI contract

Dark site palette; no gradients, images, remote fonts or animation. Root 16px;
system font stack; body 1rem/1.65, metadata .875rem/1.5, title clamp(2rem,4vw,3.5rem).
Colors: canvas #0a0e14, surface #111826, secondary #0d1420, border #596d85,
ink #e6edf6, muted #b1c0d2, cyan #67d7f9, amber #f5b04c, green #7ee2a8,
violet #d6baff, on-accent #08131a. Selection uses text and a border as well as color.
Focus: 3px cyan with 3px offset. Controls minimum 48px. Spacing: 4/8/12/16/24/32/48px.
Radii: 8/12/24px. No shadows; motion duration 0. Width cap 1600px, gutters 24px
(16px narrow). Map internal width 864px; vertical positions stay stable across
selection. Text wraps and nodes grow for long titles. Map scroll is contained.
At <=1000px detail stacks; <=700px defaults to a fully functional list.

Search is bilingual across titles/definitions. Search/group filters switch to List and constrain results,
not the selected detail. A manual return to Map keeps context with explicit nonmatch labels. Excluded selection receives a visible reset notice. Selecting
a relation or route clears discovery filters. Language never clears selection/query.
URL parameters preserve selection/query/group/trail/view; popstate restores all.
Node buttons are stable DOM; detail heading receives focus only when navigating from
buttons replaced in the detail/route panels. Graph/list switches retain selection. On stacked layouts, selection focuses and scrolls to the explanation. Native relation disclosures preserve expanded state across language changes.

## State coverage

Both locales: initial Fourier selection; each node/relation; matching search; no
matches/reset; group filtering; selected outside results; active suggested route;
invalid URL recovery; no JS; blocked localStorage (memory fallback). Data/network
loading/reconnect/expiry are inapplicable: data is bundled synchronously. External
source availability is separate from the self-contained atlas. No disabled controls.
