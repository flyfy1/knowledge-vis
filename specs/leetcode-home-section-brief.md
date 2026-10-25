# Inline LeetCode discovery on the knowledge homepage

Date: 2026-10-25. Boundary: homepage only. Owner request: selecting the
LeetCode category should show its lessons without another collection-entry click.

## Review and dispatcher adjudication

Independent review: [design review](reviews/leetcode-home-section-design-review-20261025.md),
archived before this brief. Adopt all seven contract items and the root-only
publication boundary. Adopt a narrowly scoped access correction for category,
stage and language controls: 48px minimum targets, selected semantics and focus.
Fix the existing grid minimum globally because it also affects returning to All
at 320px; preserve other card content and ordering. No substantive override.

Product verdict: reuse the homepage and existing served registry. The reader's
job is to find one lesson. Keep the legacy collection route and compact All entry;
that entry now opens the inline category. No new catalog service. The small
homepage adapter owns rendering/navigation at the registry seam; no shared runtime
refactor is needed. Deleting it leaves the existing collection independently usable.

## Exact presentation contract

Reuse canvas `--bg:#0a0e14`, card `--panel:#111826` to `--panel2:#0d1420`,
border `--line:#1f2c42`, ink `--text:#e6edf6`, muted `--dim:#93a5bd`,
link/focus `--cyan:#67d7f9`, tag border `--cyan-d:#164e63`, selected ink
`--on-cyan:#08131a`. Field boundary uses `--dim` (visible, not decorative line).
Measured contrast on darkest-to-lightest card surfaces: text >=15:1, muted
>=7:1, cyan >=10:1; selected ink on cyan >=11:1. Focus 3px cyan outline,
3px offset; inset language focus uses selected ink on cyan and cyan otherwise.
Forced colors use system Highlight. No opacity on essential content.

System font stack remains unchanged; root size 16px. New input/body 1rem/1.65,
card headings 1.25rem/1.35 weight700, metadata .875rem/1.65, result/help
.875rem/1.65. Reuse 8,12,16,18,22,26,38px spacing roles. Search padding12px,
radius12px; card radius16px; chips radius999px. No shadows. Card grid minimum
min(100%,300px), maximum1fr; existing max1020 and 560px breakpoint unchanged.
Cards wrap anywhere for long IDs/titles/complexity. New controls minimum48px;
lesson title links minimum48px tall. No new animation; LeetCode cards remain still.
Existing card displacement disabled for reduced motion.

## State and navigation contract (both zh-CN and EN)

- Normal other categories: existing cards/stages. Remember stage in page memory.
- LeetCode: hide stages; show stable labeled search, help, Clear, concise polite
  status, numbered lesson articles and two sibling destinations (lesson, official).
- Loading: say loading, never zero. Search stays usable; pending query applies on
  completion. Leaving the category cannot repaint another view; locale is current.
- Success: numeric ID order, shown/available counts from served registry only.
- No matches / genuinely empty registry: distinct messages; Clear available.
- Network, malformed or timeout: localized error and Retry. Retry returns focus to
  stable search before removing its control. No HTTP fallback to stale global data.
- Offline folder: script loader only on file protocol; same validation and timeout.
- Reconnect: user Retry; no polling. Sending, expiry and privileged states do not apply.

URL: `?category=leetcode&q=...`; category pushState, typing replaceState,
popstate reloads category/query. Preserve unrelated parameters/hash. Bare q is
ignored outside LeetCode; remembered query survives same-page category switches.
Locale uses existing storage/fallback. IME delays filtering/URL until compositionend.
Clear resets query and focuses search. Controls survive render. Category changes
through the compact All entry focus the surviving category button.

Load `leetcode/problems.config.js` lazily once per page session. HTTP fetch uses
no-store plus unique query to avoid a fixed cached catalog across future batches;
parse only the known assignment containing JSON, never evaluate HTTP text.
Timeout after15s with AbortController; one in-flight load; Retry starts after
terminal failure. Validate unique positive IDs, bilingual fields, Hard metadata,
exact numeric relative lesson paths, and official HTTPS leetcode.com/problems URLs.
Reject whole malformed catalogs. File fallback removes script on completion/error.

## Scope and evidence

P0 / highest-return 20%: direct cards, search, clear numbers/links, truthful bilingual
states and safe publication; done when browser workflows and independent review pass.
P1: URL restoration and scoped access corrections included because they support
the same flow. P2: none. Deferred: pagination/virtualization until measured scale
requires it; shared renderer until a second consumer demonstrates maintenance cost;
new sorting/global search/decoration until requested.

Verify both languages, exact IDs/NFKC/bilingual token-AND, IME, clear, history,
stage restoration, failure/retry/delay/malformed/empty/file fallback, storage denial,
320/390/desktop, 200% equivalent layout zoom, long content, keyboard/focus,
forced colors, reduced motion, local-only network, CSS bytes and bounded984 fixture.
Independent implementation reviewer must examine the actual source and behavior.

Deploy only index.html (all new behavior inline). Baseline root SHA
f8a48d19966c0cb02905820513e3926b8076e9002da966bbb4012efebb4f39d6.
Record pre/post production registry and collection runtime hashes and #736 state;
do not publish local registry or advance campaign counters. Verify ordinary public
homepage with currently served metadata. Real phone hardware remains unverified.

## Review-derived failure prevention

- Required bilingual content and language/complexity must be nonblank after trim;
  malformed metadata must not produce a successful count of blank cards.
- File-protocol lesson destinations include index.html explicitly. Test actual
  activation of both title and action; validating href shape alone missed this.
- IME retains the last committed query across a locale-driven card rebuild or an
  asynchronous load. Test the intersection, not only ordinary compositionend.
