# Independent implementation review: inline LeetCode homepage

Date: 2026-10-25. Reviewer: separate `clipboard_policy_review` agent.
Final reviewed `index.html` SHA-256:
`5c2fd1c30fee38137595f1599465970696c30fdf58ea687894741be508a49053`.

**Verdict: pass for the reviewed implementation after two required findings were
repaired and independently rechecked. Required findings remaining: none.** This
is local implementation evidence, not deployment authorization, release accounting,
or proof of the production catalog's current contents.

## Contract and independent method

Read the website-design skill, archived
[design review](leetcode-home-section-design-review-20261025.md), and
[implementation brief](../leetcode-home-section-brief.md), then inspected the
actual `index.html` diff. The feature reuses the homepage category and served
registry, removes the intermediate collection-card hop in LeetCode mode, and
leaves the separate collection route intact. No new layout or product boundary
was proposed during this implementation review.

Ran independently written probes with installed Playwright and native Mac
Chromium through an ephemeral localhost server, plus real `file:` navigation.
Did not rely on the implementer's tests to establish the findings or closures.
The [evidence directory](leetcode-home-section-evidence/independent-20261025/)
contains initial results, final results, probe sources, inspected screenshots,
and a receipt. The final probe hashes `index.html` before and after execution
and requires equality, binding its results to the SHA above. Initial red findings
precede the repairs; they are retained rather than relabeled as passing.

## Required findings and closure

| ID | Reproduction and consequence | Closure at the final SHA |
| --- | --- | --- |
| HOME-LC-01 — P2 | Supply a structurally valid row with blank bilingual title/description and empty metadata. The initial validator accepted it, rendered `#51 · `, and announced `1 of 1 available lessons`. That is a malformed registry presented as valid discovery content. | `validateLessons` now requires trimmed nonempty bilingual strings, language, and complexity. Independent fixtures separately blank title, description, topic, language, and complexity; each now shows the load error and renders no lesson cards. The original failing fixture/result remains in evidence. |
| HOME-LC-02 — P2 | Open the homepage as a local file and activate #51. Both generated lesson links originally pointed to `file:///…/leetcode/51/`; actual Chromium navigation produced an empty document with no lesson H1. Direct navigation to the explicit `index.html` opened the lesson. Merely inspecting the directory-shaped href did not verify offline navigation. | The shared lesson URL appends `index.html` on `file:` only. Independently activated both the heading link and Explore link; each reaches `leetcode/51/index.html` and displays `#51 · N-Queens`. HTTP lesson directory URLs remain unchanged. |

The implementer also preserved a committed `compositionQuery` while IME input is
pending. Independent final reproduction starts with query `51`, begins composition
with a different temporary value, then switches locale: #51 remains the sole
visible lesson and the URL retains committed `51`. After `compositionend`, the
new value applies and correctly produces no matches. This check covers a render
crossing rather than only ordinary consecutive input events.

## Other inspected behavior

- **Discovery and metadata:** the actual local registry produced 105 numerically
  ordered lesson cards and a registry-derived count. Full-width `＃５１` matches
  #51 exactly. Cards use text nodes for metadata, noninteractive article containers,
  sibling lesson/official links, numbered headings, and exact validated HTTPS
  official URLs. Duplicate IDs and a malicious-scheme official URL reject the
  entire fixture. The HTTP parser extracts JSON from the known assignment rather
  than evaluating downloaded code.
- **Navigation and state:** selecting LeetCode shows lessons directly and hides
  stages. Locale changes retain the search node and query. Category Back and Back
  from an actually opened lesson restore LeetCode/search. Unrelated query parameters
  and the hash survive the category change. Clear empties the query and focuses
  the stable search input. Returning to All restores its previous stage selection.
  Source inspection confirms typing replaces history while category changes push
  it, and bare root `q` is ignored outside LeetCode.
- **Loading and recovery:** a held registry response remains one request through
  category/locale changes. Completing it while All is selected does not repaint
  All; returning to LeetCode uses the current locale and retained query. A real
  HTTP 503 fixture shows error; Retry succeeds with the query retained and focus
  on search. A valid empty array yields a distinct empty collection, whereas bad
  URLs/duplicates/blank metadata yield error. Source inspection confirms one load
  at a time, terminal retry, request timeout/abort, token checks, and no HTTP
  fallback to a stale global registry.
- **Locality and scale:** no new external runtime assets are introduced. Actual
  local-file registry loading and both lesson actions work after the fix. A
  bounded synthetic 984-row catalog renders and exact-ID filters correctly;
  observed load-plus-filter time was approximately 86ms on this Mac. This is a
  synthetic local measurement, not a Pi throughput guarantee or an assertion
  that 984 lessons are published.
- **Accessibility and layout:** inspected the real English #51 card at 320px and
  long-content screenshots. Both locales fit 320px without page overflow; 120-character
  unbroken title/topic/complexity and long body text wrap. CSS zoom 200% at a 640px
  viewport gives an effective 320px layout and also fits. Lesson links are 48px
  tall; number, title, descriptions, and actions remain visible. Real keyboard
  navigation under forced colors retains a 3px solid focus outline. Selected
  category/stage/language controls expose `aria-pressed`; results use a concise
  status while the card grid's live region is disabled in LeetCode mode. Denied
  localStorage does not break locale switching. Reduced-motion handling is present
  in source for the preexisting moving root cards; new lesson cards have no motion.

Independently calculated solid-color contrast at the lighter card surface:
text 15.061:1, muted text 7.068:1, and cyan 10.710:1; selected ink on cyan
11.324:1. These support the brief's stated roles. The inline stylesheet is
5,757 bytes. The preexisting decorative card backgrounds/tags were not redesigned.

## Limits and publication boundary

Local 105-card evidence must not be reported as the public catalog count. The
dispatcher reports a separate production-registry preview with 104 entries;
that result was not substituted for this review's independent observations.
Only the homepage implementation is eligible for the stated root-only deployment;
do not copy the local registry, collection runtime, or lesson trees as part of it.

This reviewer did not independently wait out the complete 15-second timeout,
exercise every browser/history variant, use a physical phone or screen reader,
or access the public page. Timeout and stale-response handling were source-audited;
the dispatcher reports separate real-time timeout coverage. An extra 320px viewport
with CSS zoom 200% represents only 160px effective width and overflows the existing
header; that below-contract stress is not described as a passing 320px layout.
The actual contract's effective-320px zoom case passed.

Verify served homepage behavior and production registry/collection hashes after
any deployment. This review changes no campaign, release ledger, acceptance score,
implementation, or production file. Only this report and its independent evidence
were written; no commit or deployment was performed.
