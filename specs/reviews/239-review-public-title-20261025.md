# Required publication finding 239-PUB-R1: heading omits the problem number

The original publication browser gate failed on #239 at release `b1aeec15655d493c88b66eced787cb9f`, source `7e35e4d6040aa295d1de0269996d8b91ba5d20a3`. Its unchanged gate restricted to this lesson fails in 2.864 seconds with `Missing lesson ID 239`. Existing accepted candidate `7d818876f54bd37ec891fda55f24e9cd0281cd29` and its prior independent result remain historical; this new required finding reopens the lesson.

Actual H1 after choosing zh is `滑动窗口最大值`; after en it is `Sliding Window Maximum`. Both remain identical after a 250ms settled read. Expected: `#239 · <localized title>` in the actual H1, not only the document title, eyebrow or collection card. This follows the explicit owner requirement and explainer contract § metadata/links. The official link is already correct and must remain so.

Ranked hypotheses were recorded before testing: (1) missing ID in localized title copy; (2) stale public cache; (3) check precedes locale render. Ordinary and digest-versioned public HTML/copy/app all match the accepted local bytes; the settled readings do not change. The `title` pair in `copy.js` omits the ID and the consumer renders it directly. Thus hypothesis 1 is confirmed; neither cache nor render delay explains the failure.

Repair both localized headings and add a regression on actual rendered H1 and exact official link after a language roundtrip, including narrow width. Preserve state, algorithm and canonical source parity. Avoid changing unrelated lesson behavior or shared assets. Keep old failed evidence, run relevant checks and metadata preflight, and freeze a new candidate for a separate complete review. The original older browser check has hard-coded port 18796; explicitly use the actual current preview when rerunning, without weakening assertions.

Evidence: [public-title-20261025](239-evidence/public-title-20261025/). This is a confirmed product-title defect, not a request to loosen the publication gate. Publication remains unverified; no successful release counters advanced.
