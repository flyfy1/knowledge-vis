# #753 author self-check — candidate 753-author-1

Status: complete author candidate, ready for a **separate independent review**. No reviewer score, independent acceptance, deployment, real learner result or LeetCode submission result is claimed.

Official contract: `provenance/official.json` retains the successful public GraphQL response, query, exact problem URL, access timestamp, statement, examples, constraints and all observed selector snippets. Python3 is supported with `Solution.crackSafe(self, n: int, k: int) -> str`. The internal GraphQL ID is 754; the verified frontend ID is 753. The direct HTTP webpage returned 403; public GraphQL returned 200 without authentication or bypass. The statement also rendered through the web tool. Canonical language is Python; no non-Python exception is invoked.

## Reproducible checks actually run

- `python3 -B leetcode/753/tests/test_solution.py`: PASS. Executed canonical source for all **38** officially valid `(n,k)` pairs, including `(4,8)` with 4096 windows / 4099 characters. Independently enumerated expected password sets, checked alphabet/coverage/minimum length, and repeated 150 seeded cases (seed753). An independently derived suffix+coverage BFS found shortest strings for 12 tiny cases, without using Euler traversal. The rendered concatenation baseline was extracted and executed for all38 pairs; coverage and its n*k^n length were checked. Exact mirror parity and 93 unique bilingual copy keys passed.
- `node leetcode/753/tests/test_core.cjs`: PASS. **1,020** full snapshots over16 small parameter pairs. Checks cursor/edge equivalence, uniqueness, edge/stack/finished conservation, exhausted-pop guards, transition changes, independent final window enumeration and snapshot isolation.
- `node leetcode/753/tests/browser.cjs`: PASS, **272** assertions,27 captures, no console/asset errors. Real installed Chromium on Linux ARM64, using the configured executable. Both locales and all5 presets: full forward walks and reverse snapshot checks, reset/endpoints, first-pop causal copy, fresh choices→reveal→change, locale roundtrip with preserved trace/selection/feedback, offline local-file source/trace, blocked storage, exact displayed/downloaded/copied source and manual fallback. Fallback was seeded with a distinct clipboard sentinel, selected fully, copied by actual Linux Control+C, and read back byte-for-character against canonical source (including final newline).
- `node leetcode/753/tests/layout.cjs`: PASS. All10 closed localized preset labels fit the320px control under measured installed font metrics with an explicit24px native-arrow allowance. All tested buttons/selects/actions ≥48×48 CSSpx. Both320px headings and hand-state locale roundtrips pass; forced colors retain3px focus outline. Six additional captures.
- `python3 -B leetcode/753/tests/contact_sheet.py`: produced6 final inspection sheets for all33 captures. **Visually inspected by the author** through image viewing, plus the full-size English320px trace. Header, formula/derivation, tables, suffix/arrival pairing, wrapping stack, finished ledger, prediction feedback, fallback and code views are readable. Focused captures hide the sticky nav only while taking the image, avoiding the element-screenshot overlay artifact; navigation and target-placement checks use its real unmodified state.
- `python3 -B scripts/register_leetcode_lesson.py 753 --validate-only`, from repository root: PASS, exit0, empty stderr/stdout. Recorded in `tests/evidence/preflight.json`. This was validation only; no registration or shared-file mutation.

## State/locale observations

|Branch/action|English observed|Chinese observed|
|---|---|---|
|Hand endpoint|00110, window10,4/4 passwords; ledger00/01/11/10|相同数字、完整窗口10、已覆盖4/4|
|Default action4|3/4 explored edges, finished digit0, suffix0 exhausted|已探索3/4条边、已收尾1位；后缀0无未用出边|
|n=1,k=2 end|ε suffix,01 answer,length2|空后缀与相同最短答案|
|n=4,k=1 end|0000 answer,length4|唯一密码0000，长度4|
|Wrong prediction then reveal|Explains missing011 or repeated010|解释漏掉011或重复010，区分边和顶点|
|Correct prediction then reveal|Use011→11; only finish after both departures used|使用011→11，两条出边都用完才收尾|
|Choice change|Derived explanation disappears|旧反馈清除，等待重新检验|
|Locale roundtrip|Trace/radio/reveal/hand state retained|相同状态保留、反馈含义保持|
|Clipboard rejection|Manual copy explanation, full selected source|剪贴板不可用提示、完整源码被选中|

The fresh exercise specifies a local edge-availability state, not a claimed reachable full traversal prefix. It tests the edge-use invariant without depending on omitted history.

## Layout and contrast

Tested widths320,390,736,1440, both locales. Zoom captures use Chromium CSS `zoom:2` at780px, yielding390px effective layout with doubled glyphs; this is explicitly a browser-rendering check, not a physical-device or toolbar-zoom claim. No page-wide overflow. Native select measurements record actual CSS font strings, not a claim about another platform's resolved fonts.

The exact calibrated contrast helper checks black/white=21, all RGB luminance coefficients, and #747474/black≈4.492948, correctly below4.5. Actual computed solid-color samples are in `browser-results.json`: core text16.087; stage hints7.079; readouts13.397; correct feedback10.005; highlighted digits8.937; disabled text6.449. All tested normal-text pairs exceed4.5; main reading text exceeds7. Focus outline is3px orange with4px separation and >3 contrast against its adjacent dark surface. Shared+local CSS: **11,259 bytes** (<25,000). No fonts/images/CDNs/runtime services are shipped.

Related link: actual href `../332/#step2` resolves in the existing preview collection, both localized headings and section content checked. Target teaches consuming ticket edges, appending exhausted airports to finished, then reversing. Its extra lexical requirement is separate from this lesson's any-shortest-answer contract. Two local related anchors point back to the password graph and exhausted-vertex invariant. Publication availability remains a dispatcher release check.

## Harness history and boundaries

The initial contrast probe selected a disabled button in a state with none; fixed by explicitly going to the endpoint. A later harness used `new URL` while URL was the preview string, corrected to `new globalThis.URL`; retained `browser-harness-url-failure.json`. One interrupted browser run closed during screenshot capture, retained `browser-interrupted-run.json`; no lesson assertion identified a product defect there. The final full rerun passes. Disabled-primary specificity was improved locally and the complete browser check rerun against that final CSS. No independent review existed before these changes, and no historical review result was altered.

Teaching snapshots copy state and cost more than the canonical iterative submission. Runtime simulations do not execute Python. Physical phones, other native font platforms, production deployment, novice teach-back and a LeetCode submission are unverified. Candidate files and relevant shared policy/assets are identified by `tests/evidence/candidate-sha256.json`; the frozen source is review material, not an acceptance certificate.
