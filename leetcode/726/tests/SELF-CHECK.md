# Author self-check — #726 candidate r5

Date: 2026-10-25. Scope: author implementation and self-check only. Independent
review, novice teach-back, LeetCode submission acceptance and deployment are pending
or unperformed. SHA-256 identities are frozen in evidence/candidate-sha256.json.
Only leetcode/726/ was authored; shared assets, registries and campaign records were
not changed. Chinese title is an authored translation, not a claim of official localization.

## Reproduce

From the repository root, with the supplied NODE_PATH and Chromium executable:

```
python3 -B leetcode/726/tests/check.py
node leetcode/726/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 726 --validate-only
```

Both test scripts accept OUTPUT_DIR. For a reviewer, set it to a new evidence directory;
no candidate files need changing. The browser uses the already-running preview at
http://127.0.0.1:18784/leetcode/726/ and honors
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. No service is started.

## Observed results

- Official GraphQL statement, access timestamp and full language snippets are preserved
  in evidence/official.json. The observed Python3 signature matches solution.py.
- check.py: PASS, 1,294 canonical cases, 1,280 small expansion-oracle cases, 15,780
  intermediate frames. Exhaustive concatenations of five units through length four;
  500 seeded (726) nested cases; all official examples; maximum length 1,000;
  499 nested groups; multi-digit counts, repeated names, adjacent groups, omitted
  multipliers, maximum signed 32-bit count, and one 1,000-character name.
- The right-to-left oracle tracks suffix multipliers, independently of the canonical
  forward stack-of-maps algorithm. Small cases also use actual atom expansion. The
  exact expansion baseline displayed on the page is executed and checked. Each JS
  frame is checked by parsing the separate completed segment belonging to each open
  level. This checks the intermediate invariant, not only final output.
- browser.cjs: PASS in Chromium on Linux. All seven presets in both locales; every
  forward event, backward restoration, replay, reset and final endpoint. All terminal
  preset results are separately hard-coded expected values. Every prediction option,
  reveal, changed-answer feedback clearing and locale roundtrip were exercised.
- The rendered outer close of K4(ON(SO3)2)2 contains O: 0 + 7 × 2 = 14 in both
  locales; the localized explanation describes popping/merging the child. Prediction
  feedback describes the actual missed/extra multiplications, while clipboard fallback
  separately describes manual source copying. Copy pair shapes and duplicate object
  keys are checked before silent overwrite can conceal a defect.
- Source mirror, rendered textContent, automatic clipboard copy, downloaded bytes and
  manual fallback clipboard content equal solution.py exactly, including final newline.
  The fallback seeds a distinct sentinel, forces writeText rejection, verifies full
  focused selection and dispatches the Linux host's real Control+C before readback.
- 320/390/736/1440px layouts, EN/zh, populated nested merge states and native-select
  label measurements pass. 200% CSS layout zoom passes at 1440 and 390px, with
  screenshots. This is desktop Chromium layout-zoom evidence, not native-device testing.
- Enter/Tab controls, deep-link position, related target anchors, 3px focus outline,
  forced-colors/reduced-motion styling, control heights >=48px, storage denial and
  file:// offline trace/source were checked. No runtime console errors, HTTP errors
  or external asset requests were observed. Zero automatic animation is used.
- Shipped shared + local CSS: 11,066 bytes. Measured core text contrasts:
  text/panel2 13.40:1, text/panel 14.70:1, text/bg 16.09:1. Lowest checked muted
  pair: 6.45:1. Accent and focus pairs exceed 3:1. Exact ratios and native select
  widths/font stack are in evidence/browser.json. Resolved font identities are not inferred.
- Metadata preflight: `python3 -B scripts/register_leetcode_lesson.py 726 --validate-only`
  exited 0, empty stdout/stderr. Exact command, cwd and timestamp: evidence/preflight.json.
  This was validate-only, with no registration or shared-file mutation.

## Visual inspection and fixes

The author opened the actual headless screenshot files with the image-viewing tool.
Inspected desktop headers and prediction panels in both languages, 320/390px
before/after maps, the 736px Chinese trace, desktop merge state and 200% layout-zoom
maps. The completed outer merge visibly preserves K:4, changes O:7 to O:14 and
N:1/S:2 to N:2/S:4. Maps reflow to one column on phones, retain level labels,
and keep each atom name and count on one line. History remains visible below.

An initial 390px/200% case overflowed due to an unbroken interface signature;
evidence/zoom-overflow-before.png retains that failure. Local wrapping fixed it.
A later measured height assertion exposed the shared .btn specificity overriding
a generic minimum-height rule; the local .btn override fixes this, and the final
suite passes the unchanged >=48px assertion. Screenshot inspection also exposed
stale top-of-page navigation highlighting; the final scroll-based active-step
calculation defaults to step0 and provides aria-current. Final runtime assets use
version 726-5. Metadata needed no correction and is frozen with this candidate.

Limits: synthetic desktop viewport and CSS layout zoom do not prove physical phone,
Mac font/clipboard behavior, browser-native zoom shortcuts, screen-reader speech,
learner comprehension, independent acceptance or public release. No scores or
claims from a separate reviewer are invented.
