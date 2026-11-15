# Site navigation sweep (2026-11-15): Codex, Antigravity and Alberto Muse editions, include added by Claude Code (mechanical)

Evidence note for the provenance repoint of every labelled live page whose `index.html` received the site
navigation include (specs/site-navigation.md). It covers the editions whose developer is not Claude Code:

- **Codex** (revised editions): complex-numbers, derivative, frequency-response, integral, laplace, lens,
  linear-functions, pinhole-camera, reflection-refraction, sampling, trigonometry, velocity-vt, z-transform,
  photosynthesis, frozen-bubble, power-converters, eigenvectors, lti-systems, monte-carlo, bayes-updating,
  interference, standing-wave, convolution, population-ecology.
- **Antigravity** (original editions): how-hybrid-attention-remembers, why-compute-waits-for-memory,
  how-an-economy-is-measured, why-nvme-is-fast.
- **Alberto (Muse)** (original edition): linear-transform (authorship confirmed by Yangyu in
  `authorship/overrides.json` against a0ef4c6954ea5d55a2b22db6dc575e99a7fd4283).

## What the repointing commit changed in these pages

Only two lines in each `index.html`: `<link rel="stylesheet" href="…/site-nav.css?v=sn-20261115">` before
`</head>` and `<script defer src="…/site-nav.js?v=sn-20261115"></script>` before `</body>`, inserted by
`scripts/build-site-nav.cjs`. At run time the shared script adds a breadcrumb above the page title and turns
exact mentions of other pages' titles into links (none of these pages has such a mention; the script adds no
link to them on 2026-11-15). No copy, model, test, style or behaviour of the lesson itself changed.

The commit is `Built-By: Claude Code (claude-opus-5-5)`, `Authorship-Impact: mechanical`. It does not make
Claude Code an author of these lessons. The labels keep their developer, kind, edition and scope; only
`sourceRevision` moves to the include commit, the replaced value goes to `previousSourceRevision`, and, for
original editions that had none, `originalSourceRevision` is set to the value the label held before (its
creation commit). This note is the `provenanceEvidence`, as for why-nvme-is-fast on 2026-11-14
(specs/visual-page-provenance.md, "Cross-developer repoint").

linear-transform previously used `authorship/overrides.json` as evidence for a0ef4c69; that override still
records the authorship fact and is unchanged. frozen-bubble previously pointed at
specs/reviews/frozen-bubble-learning-20261026.md, which remains the record of its Codex revision.

Note: specs/claude-code-editions.md did not repoint Codex labels when it added the navigation-only
"compare with the Claude Code edition" link. This sweep follows AGENTS.md (every edit of a page directory
repoints its label) as instructed; whether navigation-only sweeps should repoint is a question for Yangyu.

Checked by: `node tests/page-provenance-core.cjs`, `node tests/site-nav.cjs`, `tests/site-nav-browser.cjs`
(self-check, Claude Code).
