# Collection search implementation brief

Contract: `specs/reviews/leetcode-collection-search-design.md`, independently
reviewed and adjudicated before this brief. Build within the existing collection.

## User, outcome and scope

A learner can find an available visualization by exact ID, either language's title,
or topic. Search only the current registry. Keep IDs and separate official links
prominent. Preserve the owner-approved language footer and all existing entries.
Use one local script and one local stylesheet; no dependencies or backend.

P0 is search, accurate available-result count, clear recovery and accessible
bilingual states. This is the highest-return 20%. P1/P2 have no additions.
Defer full-catalog status, sorting, pagination, fuzzy search and prerequisite routes
until observed use requires them. No new card or shared-module architecture.

## Token contract

Reuse inherited palette: canvas `--bg:#0d1117`, surface `--panel:#161b22`,
secondary `--panel2:#1c2330`, ink `--text:#e8edf4`, muted/boundary
`--muted:#9aa7b8`, link `--accent:#6ee7ff`, focus `--accent2:#ffb454`.
Text/canvas 16.09:1; muted/canvas 7.74:1; muted/panel 7.08:1;
link/canvas 13.10:1; focus/canvas 10.73:1. Search uses panel, text and muted border.
Collection muted text remains on canvas/panel; existing badges on panel2 retain AA.
System font inherits `PingFang SC, Microsoft YaHei, system-ui, sans-serif`.
Root assumption 16px; body/control 1rem/1.75, help/count .875rem/1.75;
label weight 600; existing title scales unchanged. Spacing .5/.75/1/1.5rem,
control radius .5rem, no shadow. Existing 1000px maximum and 16/24px gutters.
Controls min 48x48 CSS pixels; input min-width 0; wrapping flex rows; no fixed
text heights. Focus 3px accent2 with 4px offset; no clipping. No new animation.

## Behavior and state matrix (EN and zh-CN)

- Normal: visible label/help, input, clear, matching/total available count, cards.
- Filtered: exact optional-# numeric ID; otherwise case-insensitive token AND
  across both titles/topics, independent of current locale. Stable input DOM.
- Zero matches: count 0/total, localized explanation and clear recovery.
- Empty valid registry: honest empty collection, no fabricated entries.
- Invalid/missing registry: localized load error plus reload; no false zero count.
- Storage unavailable: locale switch and search work in memory.
- Loading/sending/reconnect/expired: inapplicable to synchronous static local data.
- Clear is always enabled and returns focus to input; no disabled state needed.

Read URL q on initial load and popstate. Replace q during input, preserving other
parameters/hash; remove it on clear. Do not create keystroke history entries.
Composition updates wait for compositionend. Locale changes preserve query and
selection, while relabeling count/cards. All card/query-derived text uses textContent.

## Verification boundary

Test actual published-registry-size preview and synthetic 100/984 fixtures,
ID/title/topic bilingual matching, whitespace, no match, clear/focus, URL reload
and back/forward, composition, storage denial, missing/malformed/empty data,
320px, landscape, 200% zoom including 320 CSS px, 120-character/CJK text,
keyboard, focus/forced colors/reduced motion, local resources and CSS size.
Inspect screenshots and obtain independent implementation review. Tests do not
claim real-device, production, reader-learning or official submission evidence.
