# Independent design review: LeetCode lessons in the knowledge homepage

Date: 2026-10-25. Reviewer: separate agent `font_metrics_spec_review`.
Reviewed before implementation brief or implementation. Applied
`~/Documents/agent-skills/website-design/SKILL.md`; inspected root `index.html`,
`pages.config.js`, `leetcode/collection.js`, `collection.css`, registry shape and
the existing collection-search design review. The dispatcher supplied the user's
screenshot interpretation; this review inspected source, not the live browser.

## Product-fit verdict

**Reuse and build within the existing homepage category.** The reader's immediate
job is to find and open a numbered lesson after choosing LeetCode. Showing only a
collection-entry card adds an unnecessary navigation step. Individual lessons,
search and an accurate count satisfy this job using the existing catalog. No new
product, generalized catalog service or collection redesign is warranted.

The existing `/leetcode/` collection already owns search semantics and lesson
metadata. Reuse that behavior and the served registry, while retaining the route
for bookmarks. Do not embed its whole page, introduce competing lesson data, or
modify campaign-owned collection assets merely to share a small renderer. The
homepage owns its category/view state; the campaign retains registry/publication
ownership. All other category content and stage-filter behavior stay intact.

## Required contract for the implementation brief

1. **Direct lesson discovery.** In LeetCode mode replace the single entry card with
   available lesson cards sorted by numeric ID. Show `#<id> · <localized title>`,
   localized description/topics, a primary lesson action and a separate exact
   official link. Registry paths such as `4/` are relative to `/leetcode/`, not
   the homepage: resolve against that collection base on HTTP and file URLs.
   Existing root cards are whole-card anchors; new lesson cards must use a
   noninteractive container with sibling links, never nested anchors. Do not
   label every entry Python or imply all Hard problems are available.

2. **One data authority.** Load the current served `leetcode/problems.config.js`
   only when needed. HTTP reads should revalidate rather than reuse a permanently
   pinned registry version. Do not serialize the working registry into root code,
   copy it into `pages.config.js`, or deploy it as part of this feature. Validate
   unique positive IDs, bilingual fields, topics, and same-site lesson paths;
   retain the exact valid official HTTPS problem URLs. Render metadata as text,
   not HTML. A malformed response is a load error, not an empty collection or a
   silently truncated successful count.

3. **Consistent search.** Match the existing collection: NFKC/case normalization,
   trimmed exact `#?digits` ID matching, otherwise whitespace-token AND across
   both titles and topic translations. Preserve the user's raw input; no regular
   expressions or fuzzy matching. Count shown/available lessons from the loaded
   registry, not accepted-local totals or the full Hard catalog. Defer filtering
   and URL writes until IME composition ends. Keep search and Clear nodes stable;
   Clear removes the query and returns focus to the input.

4. **Explicit navigation state.** Use a documented root URL representation such
   as `?category=leetcode&q=...`; validate category values and read it on load and
   `popstate`. Typing replaces the current history entry, preserving unrelated
   parameters/hash. Category changes should create navigable state without one
   entry per keystroke. Back from a lesson must restore LeetCode and the query.
   Define handling of bare root `q` explicitly; recommended: apply it only with
   LeetCode selected. Keep locale in the existing `knowledge-lang` mechanism,
   including storage-denial fallback. Hide stage controls in LeetCode mode without
   overwriting the remembered other-category stage. Preserve the query while
   leaving and returning within the page; do not add unrelated persistent filters.

5. **All-category compatibility.** Keep the existing compact collection entry in
   All rather than unexpectedly expanding All into hundreds of lesson cards.
   Its primary action should select the inline LeetCode category directly, with a
   usable category URL fallback, instead of forcing the obsolete extra hop. Do
   not change other All cards or their stage assignments. The legacy `/leetcode/`
   route remains directly usable; no redirect or compatibility-breaking rename.

6. **Loading and recovery.** Specify bilingual loading, success, no-match, valid
   empty-registry, malformed/network-error and retry states. Loading is not zero
   results. Retry reloads registry data while retaining query/category/locale;
   distinguish genuine empty results from failure. A file-protocol local-script
   fallback is appropriate for offline folder opening; do not quietly use it to
   turn an HTTP failure into unverified stale success. Use one bounded in-flight
   load and ignore superseded responses. Leaving LeetCode during load must not
   repaint another category; changing locale must render the eventual result in
   the current locale. Async completion never steals focus or auto-selects a card.

7. **Composition and access.** Reuse root palette/type/spacing/radii and adapt the
   existing collection search controls to those tokens. Keep number/title primary,
   supporting metadata secondary and both links readable. The current root grid's
   300px minimum exceeds the 288px content width at a 320px viewport; fix this
   locally for the new mode. Avoid the root title's 84px badge reservation where
   it squeezes long lesson titles. No truncated essential labels or decorative
   motion. Use stable category/language buttons with selected semantics, a labeled
   search input, a short polite result status outside the cards, and visible focus;
   avoid announcing an entire rebuilt grid on each keystroke. Hidden stage controls
   must leave tab order. When removing a focused recovery control, move focus to
   its logical surviving control rather than the document body.

Existing root chips/language buttons are below the skill's 48px target and have
no explicit focus contract. The dispatcher must adjudicate a narrowly scoped
accessibility correction for controls used by this flow, or document an override
and its residual risk; do not silently claim their current styling passes. Before
coding, the brief must name exact reused tokens and any justified new role values,
including measured text, field-boundary and focus contrast. No blanket root-card
redesign is implied by these corrections.

## Priority and validation

**P0 / highest-return slice:** selecting LeetCode immediately exposes numbered,
searchable lessons with correct links; truthful bilingual states; predictable
history, locale and keyboard behavior; root-only publication. Those conditions,
not additional catalog features, define completion.

**P1:** none required beyond P0. **P2:** no decoration. **Deferred:** pagination,
virtualization, sorting modes, shared renderer extraction, global search and an
expanded All view. Reconsider only after measured public-scale or reader evidence;
none is necessary to remove the extra navigation step.

Verify both locales at 320/390/desktop and 200% layout zoom, long Latin/CJK titles,
keyboard/forced colors/reduced motion, exact ID and bilingual topic search,
IME/selection retention, clear, URL reload/Back/Forward, and blocked storage.
Exercise delayed load with category/locale changes, failure then retry, malformed
and empty registry fixtures, and file-protocol loading. Check sibling categories'
card identities and remembered stage before/after LeetCode. Include a bounded large
fixture for responsiveness without claiming it represents published availability.
Keep registry failure fixtures and browser output outside production data.

## Safe publication boundary

Publish an explicit allowlist of root-owned HTML and any new root assets only;
never use whole-tree synchronization from the development checkout. Do not change
`leetcode/collection.js`, `common.js`, `problems.config.js`, lesson directories or
campaign/release state. The local registry may contain unreleased #736, so local
card counts are not public counts. Validate a root staging preview with a captured
current production registry, then verify the ordinary public homepage against the
actual served registry after root publication. Archive that registry identity and
confirm it is unchanged by this deployment; a concurrently authorized campaign
release must be distinguished from an accidental root overwrite.

Pre/post root asset hashes and actual public behavior must establish delivery.
Confirm #736's release/served status did not change through this root-only action;
do not assume either presence or absence from the local tree. No LeetCode release
counters should advance for this homepage change. Existing served collection and
lesson links remain usable. Deployment authorization, implementation checks and
public proof belong to subsequent work; this design review establishes none of
them by itself.

**Disposition:** approve the bounded direction subject to dispatcher adjudication
of the explicit contract above, then write the implementation brief. Only this
review document was created; no UI, configuration, campaign or production edits
were made.
