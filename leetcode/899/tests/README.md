Run from the repository root with the supplied preview already running:

```bash
OUTPUT_DIR=/tmp/899-logic python3 -B leetcode/899/tests/check.py
node leetcode/899/tests/copy-check.cjs
OUTPUT_DIR=/tmp/899-browser node leetcode/899/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 899 --validate-only
```

Browser dependencies resolve via the environment's NODE_PATH. The runner respects PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, uses real Chromium and the existing http://127.0.0.1:18770 preview, and starts no service. LESSON_URL may override the preview URL, but the local-origin asset assertion deliberately expects this preview host. Browser clipboard tests record the actual Linux host shortcut; mobile viewport emulation does not change the host OS. Evidence-writing tests accept OUTPUT_DIR; the dictionary AST test emits stdout only. No test registers, commits, publishes or modifies runtime files.

Logic tests execute the original Python callable, the literal displayed baseline extracted from HTML, and the independent graph-closure oracle. Core frames are audited with list removal/append, letter counts and rotation membership. Contrast calibration includes all primary channels and #747474 against black immediately below AA; rendered background composition is supported for solid colors only, rejecting images. This lesson uses solid surfaces.

Frozen author's evidence is in evidence/. These are self-checks, not the separate cold review. Reviewers should write rerun outputs outside the frozen folder. See ../BRIEF.md and evidence/SELF-CHECK.md for evidence limits; the candidate file hashes are in evidence/candidate.json.
