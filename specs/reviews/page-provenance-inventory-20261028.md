# Page provenance inventory repair — Codex (2026-10-28)

## Cause

`tests/page-provenance-core.cjs` still asserted that the inventory contained 23 pages. The
authoritative `page-provenance.json` contained 26 entries, and a repository scan found exactly
26 static HTML files carrying the provenance disclosure. The stale assertion failed at
`26 !== 23` before it could validate any page records.

## Change

- Replaced the historical count with a check that derives all registered paths from the JSON
  inventory and rejects duplicate paths.
- Added a recursive static HTML scan. Every file with a `page-provenance` disclosure must be
  registered in the inventory, and every inventory path must have exactly one disclosure.
  Unregistered pages remain allowed and are still covered by the existing Fourier negative
  control and wildcard exception.
- Reconciled five inventory scope strings with the text already visible in their static headers:
  `sampling`, `bayes`, `interference`, `standing-wave`, and `convolution`. No page behavior,
  route, source revision, or unverified page was changed.

## Verification

- Before the repair: `node tests/page-provenance-core.cjs` reproduced the stale `26 !== 23`
  failure.
- After the repair: `node tests/page-provenance-core.cjs` passed with 26 dynamically matched
  static disclosures.
- `NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules
  PROVENANCE_BASE_URL=http://127.0.0.1:18789 node tests/page-provenance-browser.cjs` passed:
  all registered pages in English/Chinese at desktop and 320px widths, visible source links,
  keyboard/200% text, route and Back/reload state, no-JS disclosure, forced colors, and the
  unregistered Fourier negative control.
- No runtime deployment was performed. Physical devices, Safari and screen-reader speech remain
  outside this static provenance gate.
