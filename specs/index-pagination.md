# Knowledge index (root homepage)

The file name is historical. This spec now describes the whole root homepage,
`index.html`. Its source contract is pinned by `scripts/test_index_pagination.cjs`;
browser behaviour by `tests/leetcode-home-section.cjs`.

## Change note (2026-11-11): pagination and topic chips removed

The homepage used to render a topic chip row (one chip per tag, about 293 chips)
above the cards, a 12-per-page pager (18 pages, in registration order), a
"已上线 / Live" badge on every card (all 210 pages are live), tag chips and an
"打开 →" line on every card, and a footer written for maintainers.

An audit measured the effect: at every width and in both languages no card was
visible on first load. The first card started at 2,128 px on desktop and at
10,339 px on a 320 px phone in English. The owner asked for a page that is simple,
clear and leads with the best content. The pager, the topic chips, the live badge,
the card tags and the open line were removed. The redesigned page puts the first
featured card at 538 px (zh) / 621 px (en) on a 1280×800 screen and at about
470–525 px on 390 px and 320 px phones.

## Views

Views come from URL state; nothing is stored besides the language.

| URL | View |
| --- | --- |
| `/` | Home: **Featured** section, then **More entrances** |
| `?category=<id>` | All pages of the category on one page, grouped by subtopic |
| `?stage=<id>` | All pages of the stage, grouped by category (registry order) |
| `?category=<id>&stage=<id>` | Category view filtered by stage (AND); empty groups disappear |
| `?s=<words>` | Search results; combines with `category` / `stage` as a scope (AND) |
| `?category=leetcode[&q=]` | Dedicated LeetCode lesson search, unchanged |

### Home

1. **Featured**: the pages listed in `window.KNOWLEDGE_FEATURED` (in
   `pages.config.js`), in that order. It is an array of slugs; a slug that is not
   registered is skipped silently. The subtitle states how many were picked out of
   how many live pages. To change the selection, edit only that array.
2. **More entrances**: four link tiles: Knowledge Atlas (`atlas/`), LeetCode
   (`?category=leetcode`), Demos (`?category=demos`) and Claude Code Parallel
   Editions (`variants/claude-code/`). This is the homepage's link to the editions
   list required by `specs/claude-code-editions.md`. The LeetCode and Demos tiles
   switch the view in place on a plain click and move focus to the matching chip;
   modified clicks open the URL normally.

The first category chip ("精选 / Featured") is the home view. It keeps
`data-cat="all"`.

### Category view

All pages of the category, no paging. Groups follow the order of
`window.KNOWLEDGE_SUBTOPICS[category]`; each group heading shows the subtopic name
and a page count. Pages whose `subtopic` is missing or not registered go into a
trailing "其他 / Other" group. If the category as a whole has only one group (for
example Demos, Language, Engineering) the heading is omitted; a stage filter does
not change whether headings are shown.

### Cards

A card shows a category badge, a stage badge, the title and the description.
A badge is left out when the current view already says it: no category badge in a
category view or under a category heading, no stage badge when a stage is
selected. A `status: "planned"` entry renders as a dimmed non-link card with the
"筹备中 / Planned" badge. Cards of the `leetcode` category link to the LeetCode
view and switch in place like the entrance tile.

### Search

The site search (`#siteSearch`) matches title, description and tags in both
languages. Input is NFKC-normalised and lowercased; space-separated words must all
match. While an IME composition is in progress the results and URL do not change.
Results replace the featured or grouped content and show a count. The query is
kept in `?s=` with `history.replaceState`. The site search is hidden in the
LeetCode view, which has its own search with `?q=`. A bare `q` outside the LeetCode
view is ignored.

## URL contract

- `category`, `stage`: registered ids; unknown values fall back to the home view.
  Changing a chip uses `history.pushState`, so Back/Forward and reload restore it.
- `s`: site search, written with `replaceState`; dropped in the LeetCode view.
- `q`: LeetCode search only.
- `topic` and `page` (old design) are ignored when read and removed on the next
  URL write. They never cause an error or an empty state.
- Unrelated parameters and the `#hash` are preserved.

## Interaction contract

- Chip buttons are created once and only their text and `aria-pressed` change, so
  keyboard focus stays on the chip that was pressed.
- Every control is at least 48 px tall at 320/390/640/1280 in both languages, with
  a 3 px focus outline. There is no horizontal page overflow.
- Below 560 px each chip row is one horizontally scrolling line (bleeding to the
  screen edges), so the chips do not push the content down; the pressed chip is
  scrolled into view after load, language change and Back/Forward.
- Strings come from the dictionary in `index.html` (UI-I18N-SPEC.md); the language
  is shared through `knowledge-lang` with an in-memory fallback when storage is
  denied.
- The footer is a visitor-facing line with the number of live pages.
- The root page has no `page-provenance.json` entry and no provenance label.
