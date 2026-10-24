# Reproduce author checks

Run from the repository root with the already running preview at
http://127.0.0.1:18770. No server or registration command is started by these tests.
Dependencies: Python 3, Node, installed Playwright and acorn via NODE_PATH;
Pillow is used only for optional review contact sheets. Browser scripts honor
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. PREVIEW_ROOT may override the preview origin.

```bash
export OUTPUT_DIR=/tmp/leetcode-352-review
python3 -B leetcode/352/tests/test_solution.py
node leetcode/352/tests/test_core.cjs
node leetcode/352/tests/browser.cjs
node leetcode/352/tests/zoom.cjs
python3 -B leetcode/352/tests/contact_sheet.py
python3 -B scripts/register_leetcode_lesson.py 352 --validate-only
```

Without OUTPUT_DIR, generated evidence goes to this folder's evidence/ directory.
Always set OUTPUT_DIR when reviewing a frozen candidate. All result/screenshot
producers accept it; no test edits solution, metadata, registry or shared files.
The native zoom test uses a local test-only extension with tabs permission and a
fresh temporary profile below OUTPUT_DIR, deleted in finally. It calls actual
chrome.tabs.setZoom(2), checks getZoom, innerWidth and DPR, then captures via CDP
without a clip (Playwright's regular screenshot clip assumes unzoomed units).
No existing browser profile or credentials are used.

Python's oracle scans integer membership over the fixed domain, independently of
neighbor insertion. Exhaustive inputs use a smaller equivalent membership scan.
The browser-model test uses a separate membership-run oracle. AST traversal
checks localization definitions for duplicate keys before evaluation. Browser
checks exercise actual controls, source/clipboard success and rejection fallback,
state restoration, native keyboard navigation, local request errors, inaccessible
storage, offline source, internal links, and computed-color contrast.

Viewport screenshots retain the real sticky navigation. Section-only reading
captures hide that navigation during capture to avoid the known full-element
sticky-overlay artifact; this does not change application files or viewport
interaction checks. Full-page captures may show the sticky bar at the current
capture scroll offset; use focused reading/viewport captures to assess geometry.
Visual inspection is a human author action recorded in SELF-CHECK.md, not an
assertion that screenshot production itself establishes visual correctness.

All reports are author self-checks. No LeetCode submission, independent review,
actual novice study, deployment or registry acceptance is implied.
