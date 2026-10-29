# Index pagination · 2026-10-29

Implemented a shared browser-side pager for the knowledge index. The index now
derives topic chips from the active category/stage, renders twelve cards per
page, and stores category, stage, topic, and page in the URL query string.

Checks completed:

- `node scripts/test_index_pagination.cjs`
- `node --check pages.config.js`
- extracted inline index script and ran `node --check`

The browser smoke pass is queued for the deployed revision because this managed
checkout cannot bind a local HTTP port; deployment QA must verify the same
filter, paging, Back/Forward, language, and mobile-width paths against the live
HTTPS site.

The deployed smoke pass also covered next-page navigation and category/topic
filters. It exposed stale page-status text after a filter reduced the result to
one page; the renderer now clears that live status whenever pagination hides.
