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

## Release handoff

- `a4735905` was pushed to `origin/main` without force-push.
- The only site resource changed by this repair, `page-provenance.json`, was copied to
  `songyy-pi:/home/songyy/projects/visual-site/` with an explicit no-`--delete` rsync. The
  active `visual-site.service` remained healthy, and the local/Pi SHA-256 matched:
  `a64d4ae125da023f7f914c9067dfa7a7dce2446a70e02ced45d7d8afad3893c9`.
- Production smoke passed at `https://visual.integ.life`: the site and inventory returned HTTP
  200, and the full Playwright provenance suite passed for all 26 registered pages with no
  browser errors or failed requests. The live inventory reports `schemaVersion: 1` and 26 pages.
- Physical devices, Safari and screen-reader speech remain outside this static provenance gate.
