# LeetCode collection search: independent design review

Date: 2026-10-18. Implementer: `/root/collection_search`. Independent reviewer:
`/root/collection_search/search_review`. Review preceded the brief and UI code.

## Product-fit verdict and review

Build a small feature within `/leetcode/`, reusing the current registry, cards,
locale service and visual tokens. The reader needs to locate an available lesson
by ID, English/Chinese title or topic before the first large published batch.
The highest-return slice is one search field, an accurate count and recoverable
empty state. The knowledge index's category filters serve a different job.
No separate catalog app, server or generalized search module is warranted.

The reviewer required:

1. Read `q` on load and popstate; replace history while typing; preserve other
   parameters/hash; remove `q` on clear. Back from a lesson restores the query.
2. A trimmed `#?digits` query means exact numeric ID. Otherwise use case-insensitive
   whitespace-token AND matching across both titles and every topic translation.
   Blank input shows all entries. Never interpret user text as a regular expression.
3. Keep input/controls stable; preserve text, selection and IME composition.
4. Distinguish no matches, a valid empty registry and an unavailable/malformed
   registry. A synchronous local registry needs no invented loading state.
5. Describe counts as available collection lessons, not accepted/completed/all Hard.
6. Keep a polite result count outside the cards; clear returns focus to the input.
7. Fix collection language/control target sizes and clipped focus outlines locally;
   measure field boundaries as well as text/focus colors; respect `[hidden]`.
8. Exercise both languages, 320px and 200% zoom together and separately, long text,
   CJK, keyboard, forced colors, reduced motion, storage denial and URL history.

All runtime assets remain local. Synthetic catalog fixtures prove a bounded
browser behavior only, never real lesson availability or production performance.

## Dispatcher adjudication before implementation

All eight recommendations adopted. Numeric matching is exact and permits `#`;
mixed queries such as `#51 queens` have no special syntax. Query text is preserved
verbatim in the input and URL; trimmed text is used only for matching. Results
update immediately; IME filtering/URL writes wait until composition ends. Cards
can rebuild for locale changes, while the input and its selection remain intact.

P0: the full discovery/recovery flow, exact token contract, bilingual states,
collection-scoped accessibility fixes and browser evidence. P1: none required.
P2: no decoration. Deferred: full-catalog status, prerequisites, pagination,
fuzzy matching, sorting and backend indexing until public scale or reader evidence
justifies them. The public registry remains the only availability source.

Residual verification limits: browser emulation is not physical-device or human
learning evidence. Production verification belongs to the batch publisher. The
implementation review and its findings will be appended after actual testing.

## Implementation verification and independent review

Implementation: `leetcode/collection.js`, `collection.css`, `index.html`.
Repeatable checks: `node scripts/test_leetcode_collection.cjs` against
`http://127.0.0.1:18771/leetcode/`; override `COLLECTION_URL` and
`COLLECTION_TEST_OUTPUT_DIR` when verifying another deployment.

Author run: 137 browser checks passed. Actual registry contained 13 entries.
Synthetic 100/984-entry fixtures exercise exact final-ID lookup and restoring all
cards; they never modify the repository registry. The last author run measured
18ms/27ms for the two filter interactions, including browser-driver overhead.
Combined `style.css` + `collection.css`: 10,909 uncompressed bytes.
Rendered core contrast in both languages: label 16.09:1, help/count 7.74:1,
search/clear 14.70:1, active-language button 13.10:1. Input boundary exceeds 3:1.

The independent reviewer reran all 137 checks and reported **no required findings**.
They additionally compared every one of the 13 official URLs with the authoritative
catalog and verified rendered target/rel attributes. They inspected focused search
at 640px/200% in both languages and 320px/200% in Chinese: input/clear remain
legible, focus is visible and document width remains within the viewport.
Their synthetic 984-entry interaction measured 30ms in that run.

Verification includes exact/nonnumeric/whitespace/no-match search, matching both
languages independent of locale, topic/title token AND, URL reload/Back/Forward,
return from a lesson, preserving unrelated URL parameters/hash, IME composition,
locale query/selection retention, clear/focus recovery, empty/missing/malformed
registry states, storage denial, target sizes, long CJK input/Latin titles,
keyboard order, forced-color focus, reduced motion and local asset requests.

Local author artifacts: `/tmp/leetcode-collection-evidence/results.json` and
`{en,zh}-{mobile,zoom}.png`. Independently generated artifacts:
`/tmp/leetcode-search-independent/results.json`,
`/tmp/search-independent-en-focus.png`, `/tmp/search-independent-zh-focus.png`,
and `/tmp/search-independent-320-double.png`. Artifacts are temporary runtime
files; this document archives the durable findings and repeatable command.

Dispatcher disposition: accept the implementation review with no unresolved
required findings. The batch publisher must include both new local runtime assets
and verify the served page. No commits, Pi changes or public deployment were made
by this implementation task.

Limits: desktop Chromium emulation only. Physical devices, actual mobile keyboards,
screen-reader announcements, public deployment and human learning were not tested.
Official destinations were compared to catalog values rather than opening every
external LeetCode page. Synthetic fixture timings are not production capacity claims.

## Final language-policy copy alignment

The owner goal prefers Python / TypeScript, followed by each problem's required
language when needed. Updated the collection meta description and bilingual footer
to that policy; no behavior or layout changes. Independent reviewer
`/root/collection_search/search_review` performed a narrow recheck and found no
required issues: the text expresses authoring preference without claiming every
lesson already has both languages. All 137 browser checks passed again.

Reviewed runtime SHA-256 after this copy update:

- `leetcode/index.html`: `104c0415ec213caab7067a7596b253c370489c677e966e4701fbf5bc26a31980`
- `leetcode/collection.js`: `28c46dc1494d29783550e5a21b50a976095a10b0ea2774a53276fb6e4e584699`
- `leetcode/collection.css`: `fadd84b62bb62d2b636fbca247adcda37dfeb24c10a4cede65c605ed2090ece7`

Dispatcher disposition: adopt the updated copy; no open required findings.
