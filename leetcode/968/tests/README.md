# Reproduce author checks

Run from the repository root. No server is started. Default preview is the existing http://127.0.0.1:18791/leetcode/968/.

```sh
LESSON_EVIDENCE_DIR=/tmp/968-review python3 -B leetcode/968/tests/test_solution.py
LESSON_EVIDENCE_DIR=/tmp/968-review node leetcode/968/tests/test_core.cjs
LESSON_EVIDENCE_DIR=/tmp/968-review node leetcode/968/tests/browser.cjs
LESSON_EVIDENCE_DIR=/tmp/968-review node leetcode/968/tests/current_marker.cjs
LESSON_EVIDENCE_DIR=/tmp/968-review node leetcode/968/tests/capture_focus.cjs
LESSON_EVIDENCE_DIR=/tmp/968-review node leetcode/968/tests/offline.cjs
python3 -B scripts/register_leetcode_lesson.py 968 --validate-only
```

Use the supplied NODE_PATH and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when present. LESSON_PREVIEW_URL optionally changes the full lesson URL. Every result/screenshot producer honors LESSON_EVIDENCE_DIR. `write_copy.py` is an authoring helper, not a test; do not rerun it against a frozen candidate.

The browser test uses actual Chromium and native host clipboard shortcuts (Control+C on the Linux author host; Meta+C on macOS). Before each fallback attempt it writes and reads a distinct sentinel. It does not prepopulate the clipboard with source for the fallback check. Browser CSS zoom is set to 2 for the 200% reflow check; this is distinct from operating-system display scaling. Mobile widths are emulated, not actual phone observations.

Python oracle: undirected neighbor set-cover enumeration, independent of postorder rules. Core oracle likewise enumerates subsets with independent edge coverage, then checks every return frame. Saved N states describe return-time obligations and may subsequently be covered by an ancestor; they are not current coverage flags.

Full-page screenshots retain source and fallback disclosures after tests. Focused captures avoid the capture-dependent sticky navigation overlay. Inspect screenshots visually; generating them alone is not a visual review.

`current_marker.cjs` is the 968-R1 rendered regression: an older camera alongside the current camera, default-tree installation, root repair, rewind/replay and locale roundtrips at 1280px and 320px. It checks computed SVG strokes and retained K labels/camera identities, and captures focused diagrams. The unchanged assertion failed against the reviewed CSS; `evidence/968-r1-red.log` preserves that result.
