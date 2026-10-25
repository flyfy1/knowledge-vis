# Author self-check — #770

Status: complete author candidate, independent review pending. No submission to LeetCode, publication, learner study, commit or registry mutation. Scope owned: leetcode/770 only. Design shell reused under the existing design review/adjudication; this is not a new design approval.

Official source: provenance/README.md, public GraphQL response and request receipt. Python3 method signature actually observed. The ordinary HTML HTTP403 capture is retained separately and is not treated as statement content.

## Executed evidence

- `python3 -B leetcode/770/tests/check.py` — PASS: 1,569 canonical Python cases; 3,138 independently evaluated numeric assignments; 1,569 JS traces; 13,708 intermediate invariant frames. Three official examples, all ordered depth-two small expressions over 0/1/a/b and +/−/*, seed770 generated nested expressions, both associativity shapes, negative and zero substitutions, multiletter and repeated variable names, degree/lex order, 100 substitutions and length250 boundaries. Both canonical and baseline mirrors decode to exact source bytes.
- `node leetcode/770/tests/browser.cjs` — PASS: real headless Chromium156.0.8078.4/Linux, both locales, eight presets, three prediction choices, endpoints/reversal/reset, all generated core outputs independently checked in browser. Real successful clipboard copy and forced API denial with selected textarea, Control+C and actual clipboard readback match solution.py including final newline. Display/embedded/download source bytes match too.
- `node leetcode/770/tests/inspect.cjs` — PASS: 320px zh→en→zh H1/document title exact; preset/event/disclosure/focus preserved; keyboard-followed related links match their advertised concepts in both languages; zero/negative-substitution states; file:// source and trace work without code fetching.
- `node --check leetcode/770/app.js` and `node --check leetcode/770/core.js` — PASS.
- `python3 -B scripts/register_leetcode_lesson.py 770 --validate-only` — PASS, exit0, no output, run from repository root. Complexity is one nonempty string covering time and space. No registration command was run. `metadata-preflight.json` records the final command and result.

## Branch × locale record

All rows below were exercised in EN and zh-CN, except forced-colors is an additional system rendering check. No runtime fetching, loading, sending, reconnect or expiration branch exists; there is no server dependency in the lesson. Offline source comes from an exact local mirror.

| State/action | Expected meaning | Observed evidence |
|---|---|---|
|Initial|No completed expression; Back/Reset disabled; final output pending|Preset resets checked; initial result says no subexpression completed, rather than asserting the input is zero|
|Atom/group|Result belongs to exactly [start,end), not entire expression|All intermediate frames compared with independent AST expansion; recursive parent/child/sibling sequence explained next to trace|
|Default multiplication event9|Four contributions a²:1, a:-1, a:2, constant:-2; combined a²:1,a:1,constant:-2|en/zh desktop,320/390/736 products and result screenshots; event formula contains the entire correct expression; operand/result cell assertions pass|
|Terminal/default|Sorted ["1*a*a","1*a","-2"]; Next/End disabled|All preset final outputs independently checked, then rewind/replay identical|
|Terminal/zero|Empty map means zero; output [], not a missing result|en-zero.png/zh-zero.png; long-name preset with values -2 and0 also returns []|
|Fresh prediction|B preserves extra xy term; A drops it; C leaves y*x unsorted|Every option revealed in both locales; answer switches clear feedback; language switch retains selected answer and revealed explanation|
|Copy success|Full Python transferred|Actual clipboard equals canonical source|
|Copy fallback|Manual-copy instructions, not algorithm feedback|Selected full source; native Control+C changes sentinel clipboard to canonical bytes; both locales|
|Locale/denied storage|In-memory language remains usable without exception|New storage-denied context can switch language after a trace event|
|Related navigation|#224 nested context/sign; #726 name→count merging|Keyboard activation in both locales; destination text and hashes stored in additional-browser-results.json|

Localization properties were parsed with Acorn before execution to reject duplicate keys. Every copy entry is exactly a nonempty two-string pair. Rendered default operation, operand/result values, hand formula and prediction explanation were visually inspected in both locales, separately from clipboard denial copy. Formula uses full operands; no single-character or wrong-key localization fallback was observed.

## Visual and accessibility observations

Inspected images using the image-view tool: en-header.png, zh-320-heading.png; en-1440-products.png; zh-320-products.png; en-390-result.png; zh-320-controls.png; en/zh-zoom200.png; en-zero.png; zh-substitution.png; en-manual-copy.png; en-prediction.png. Reinspected changed contribution heading after its wording clarification. At320px operand tables stack; tuple labels and coefficients remain separate columns; contribution rows wrap while retaining coefficient, key and signed result. Default four contributions and merged table are readable. Long substitution text wraps rather than overflowing. At200% CSS zoom, contribution rows expand vertically with legible type. The horizontal sticky nav deliberately scrolls; deep-link clicks land below it. Screenshots with ordinary scrolled content behind the sticky strip are not evidence of clipped content.

Native select labels are short and measured with the actual browser font at every target width and preset. Font stack is the unchanged shared system stack; no claim about an exact resolved CJK font or another operating system. Controls have48px minimum height, focus3px accent2 with4px offset. Keyboard Enter advances the trace and activates related links. Native radio groups and disabled buttons retain semantics; source disclosures remain open through locale changes. Forced-colors focus is retained.

`contrast.json`: actual rendered text/ancestor-background pairs measured with sRGB weights .2126/.7152/.0722; black/white/primaries and #747474-on-black (~4.492948, fails4.5) calibrate the same helper. Minimum measured text contrast6.449407898769069:1 (muted text on panel2); core text is brighter. Focus on canvas/panel2 exceeds3:1. Solid backgrounds and transparent ancestors are composited; no lesson gradients are used. Shared+local CSS10,870 bytes, under25,000. No local asset failures, page errors or external runtime requests.

## Cost and validity audit

P and D can be0. For input0, tokens/atom/format still run; +1 and log(D+2) retain that base work. A single long variable has degree1, and lexicographic name comparisons have character cost explicitly distinguished from unit key operations. With no substitutions E=0, n>=1 still accounts for parsing. The bound includes map copies and recursive retained parent maps, not merely one final polynomial. Raw-list baseline correctly retains four contributions for (a-a)*(b+c) while sparse-map left operand becomes empty. Both algorithms can still expand exponentially when terms are distinct. Educational snapshots are separately excluded from submission space.

Limits: headless Chromium on Linux;200% zoom is CSS zoom for reflow, not physical-device/browser-chrome measurement. No macOS, physical phone, assistive-technology session, novice teach-back, public deployment, independent acceptance or accepted LeetCode submission is claimed. Ready means ready for the separately assigned independent review.
