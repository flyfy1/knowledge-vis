# Knowledge index pagination

The index is a static registry, so filtering and paging stay in the browser. The
index renders at most twelve knowledge cards at a time (`pageSize = 12`).

## URL contract

- `category` selects a registered category.
- `stage` selects a registered education stage.
- `topic` selects a tag key (the English tag is the stable key, with the Chinese
  tag as the fallback for legacy entries).
- `page` is a one-based page number; page one is omitted from the URL.

Changing a filter resets the page to one. Paging uses `history.pushState`, so a
filtered page can be copied, bookmarked, or restored with browser Back/Forward.
The LeetCode category keeps its dedicated search flow and does not share the
general card pager.

## Interaction contract

Filter and paging controls are native buttons with `aria-pressed` or live status
text. They keep a 48px touch target, wrap on narrow screens, and return focus to
the control after a page change. The page status reports the current page and
visible/total card counts in both supported languages.
