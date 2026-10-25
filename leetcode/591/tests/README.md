# Reproduce author checks

From the repository root, using the existing preview server:

```
python3 -B leetcode/591/tests/check.py
node leetcode/591/tests/browser.cjs
node leetcode/591/tests/accessibility.cjs
python3 -B scripts/register_leetcode_lesson.py 591 --validate-only
```

Browser scripts require Playwright from NODE_PATH and honor
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. They use the already running
http://127.0.0.1:18780 preview, not a new service. Every script that writes results
or screenshots honors LESSON_EVIDENCE_DIR, e.g. set it to an external temporary
directory to rerun without mutating the frozen candidate. check.py passes its
oracle fixture path to check-core.cjs; this internal helper writes nothing.
The metadata validation command is read-only and writes nothing.

check.py executes the exact canonical solution.py and a recursive grammar oracle.
It exports independently calculated expectations and tests every JS trace against
them; check-core.cjs audits intermediate transitions, first CDATA terminator,
consumed positions, matching stack pops, preset verdicts, dictionary shape and
pre-parse duplicate keys, and exact offline source mirror. Browser checks exercise
every preset/frame in both languages, forward/back/reset/end, keyboard range
navigation, quiz answer/reveal/change/locale, native clipboard success and forced
failure/manual selection, exact rendered/downloaded source, internal links,
blocked storage, offline-file source display, errors, widths, zoom and contrast.
accessibility.cjs additionally checks 200% CSS zoom at phone and desktop widths,
48px control heights, rendered invariant wording, and native horizontal keyboard
scroll in the operation table. Forced-colors and reduced-motion paths are checked.

These are author self-checks, not independent lesson review or LeetCode submission
acceptance. Screenshots are browser evidence, not actual learner/device testing.
