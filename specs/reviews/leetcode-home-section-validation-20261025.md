# Homepage LeetCode section validation

The root category now directly renders numbered lesson cards and bilingual search
from the published registry. The independent design gate and implementation review
are separate from this implementer's browser checks.

## Tested candidate

`index.html` SHA-256: `5c2fd1c30fee38137595f1599465970696c30fdf58ea687894741be508a49053`.
HTML 25,934 bytes; inline CSS 5,757 bytes. No added images/fonts/CDN/runtime dependency.
The only deployed asset is index.html. Tests, brief and evidence are repository artifacts.

[Browser workflow test](../../tests/leetcode-home-section.cjs) passed against local
105 lessons and the captured production registry of104 lessons (SHA-256
`b6053ffefb6704b9aefdf234b127be4b9287dc92afcf834931619b9633244311`).
[Final production-registry preview results](leetcode-home-section-evidence-20261025/production-registry-preview/results.json)
and bilingual390/1280 screenshots are retained. Local screenshots are previews,
not public delivery proof. The final suite additionally exercises a real15-second
load timeout, late response and Retry against the production metadata fixture.

Coverage includes direct category/All-entry navigation; all lesson and exact official
URLs; exact/fullwidth ID and bilingual token-AND search; no-match and valid-empty
states; locale/IME crossovers; Clear focus; category history/reload/lesson Back;
remembered stages and unchanged other cards; loading/category/locale race; error,
retry, invalid/duplicate/blank/unsafe metadata; storage denial; actual offline
lesson activation; 320/390/640/1280 layouts, 48px targets, forced-color focus and
reduced-motion mode. A synthetic984-row120-character title fixture loaded and
filtered in146ms on this Mac (includes local navigation; not a Pi capacity claim).

Text contrast measured on #111826: #e6edf6 15.06:1, #93a5bd 7.07:1,
#67d7f9 10.71:1; selected #08131a on cyan11.32:1. Field boundary on
#0d1420 is7.34:1. Core text uses the same approved colors on the gradient whose
lighter endpoint is #111826. Focus is3px, with inset contrast for selected language.

Two initial harness failures were corrected: it selected nonexistent stage `high`
instead of `senior`, and used Playwright's navigation-event URL before the fill
history update reached that cache. The final assertion reads live location.href.
Neither was treated as a product failure or a suppressed check.

Independent review found blank metadata acceptance and file-directory links that
failed actual offline navigation; both were fixed. A proactive locale-during-IME
render issue was also fixed with a committed-query snapshot. These failure modes
were added to the [brief](../leetcode-home-section-brief.md) for subsequent work.

Real phone hardware, virtual keyboard, native screen-reader behavior and browser
menu zoom are not verified. Viewport/CSS zoom checks establish responsive layout,
not those hardware/assistive-technology claims. Public delivery requires the separate
root-only deployment receipt and ordinary public UI/hash checks recorded below.

## Public delivery

Source commit24e4119 was pushed, then only index.html was atomically replaced on
the established Pi site at2026-10-25T09:40:00Z. The
[deployment receipt](leetcode-home-section-evidence-20261025/deployment.json) records
identical pre/post hashes for pages.config.js, the production lesson registry and
collection JS/CSS. Unreleased #736 remained absent. No old served-content backup
was created and no campaign ledger was mutated.

The ordinary public homepage returned HTTP200 and the exact candidate SHA, with
Cloudflare DYNAMIC status: [HTTP receipt](leetcode-home-section-evidence-20261025/public-http.json).
The in-app browser independently reloaded that ordinary homepage, selected LeetCode
and immediately displayed104/104 cards. Chinese #51 and English #239 searches each
returned1/104 with correct numbered heading, lesson and official destination.
[UI observation record](leetcode-home-section-evidence-20261025/public-ui.json) and
[public screenshot](leetcode-home-section-evidence-20261025/public-zh-search.png).
The browser is left on the full Chinese inline category.
