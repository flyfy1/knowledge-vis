# Independent review: bilingual publisher heading check

Date: 2026-10-25. Scope: the narrow `BROWSER_CHECK` change in
`scripts/leetcode_publish.py` and new `scripts/test_leetcode_publish_browser.py`.

Reviewed SHA-256 values:

- Publisher: `f5937fc02c2603dfbba395c511578fa6f2a60ad0539e76e696e68ef04fa80494`.
- Browser test: `3ed38e3bf9e07ebe3cbfe93ef7b9ceaad6a59090f480eeec05acce7a506bb37c`.

## Verdict

**Approve this narrow correction. No actionable required findings found.** The
old gate assumes every valid translated title must differ textually. The change
allows identical rendered headings only when the independently reviewed registry
also specifies identical Chinese and English titles, and separately requires
the visible main content to change between locales.

## Evidence and reasoning

The retained red log at `/tmp/leetcode-publisher-ipo-red-20261025.log` shows the
actual browser gate rejecting the fixture with `Heading did not translate 502`.
The fixture has `#502 · IPO` in both headings but different substantive Chinese
and English bodies. This is a faithful reproduction of the relevant title
contract: current `leetcode/502/lesson-entry.json` gives `IPO` for both titles,
and `leetcode/502/copy.js` gives `#502 · IPO` for both localized heading strings.
That fixture is not claimed to be a full rendering of the real lesson.

The source diff only changes the browser gate's locale-content inspection. It
retains visible H1, problem ID, official link, language-control, minimum-content,
resource and error checks. It keeps rejecting identical headings when the
reviewed titles differ. The additional `mainTexts` comparison rejects a page
whose identical approved title accompanies completely unchanged main content.
There is no problem-number exception, special-case `IPO` allowlist, bypass of
independent lesson acceptance, or change to publication ledger accounting.

The registry title condition is supported by the existing `_reviewed` path,
which validates bilingual registry fields and matches registration metadata to
the accepted candidate. Pending release entries originate from that validated
metadata. The corrected check remains a bounded publication smoke test; changed
main text alone does not prove every sentence is correctly translated. That
semantic coverage remains the independent lesson review's responsibility.

The six new tests serve disposable local pages and execute the actual exported
`BROWSER_CHECK` through Chromium. They cover the valid identical-title case,
different localized titles, an untranslated heading against different reviewed
titles, identical title plus unchanged body, missing problem IDs, and empty
content. The retained green log at
`/tmp/leetcode-publisher-title-green-20261025.log` reports all six passing. The
completed existing publisher regression log at
`/tmp/leetcode-publisher-regression-20261025.log` reports 20 tests passing. This
review inspected those logs and test/source code; it did not rerun the suites.

## Boundary

#239's missing H1 IDs still fail the unchanged ID requirement. #262's identical
heading with distinct reviewed localized titles still fails the title condition.
They require real lesson repairs and fresh independent reviews. This publisher
correction does not close either lesson finding and does not establish public
delivery. The later release must run public hash checks and the corrected
browser gate against the actual served batch.

No source, recovery helper, campaign state, rubric, acceptance, Git history, or
production content was changed by this review. Only this report and the recovery
review's explicit closure section were written.
