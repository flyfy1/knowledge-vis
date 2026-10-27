Author self-check evidence (not independent review): Python canonical solution matched an independently implemented edge-removal oracle on official examples and seeded small graphs. Browser checks remain recorded in this folder after execution.

## Fix self-check — L1192-R1-RECURSION

- Cause confirmed by the red feedback loop: `Solution().criticalConnections(1000, [[i,i+1] for i in range(999)])` raised `RecursionError`.
- Fix: `solution.py` now keeps DFS frames in an explicit heap-backed stack, preserving parent-edge skipping, low-link merges, and strict bridge checks without interpreter recursion.
- Regression: `test_official_depth_boundary_without_recursion_error` executes the actual Python callable on `n=100000` path input and verifies all `99999` bridges; examples and 480 seeded oracle cases also pass.
- Source parity: decoded `python-code.js` equals `solution.py` byte-for-byte, including final newline (1659 bytes); the displayed browser source is populated from that mirror.
- Browser checks: Chromium at 390px and 1280px in English and Chinese rendered the updated explicit-stack mapping; path preset End/Reset retained expected bridge output. Normal 320px/390px width checks remained clean. A synthetic `body.style.zoom=2` at 320px made the long source block extend document width (scrollWidth 412); that stress artifact is recorded rather than claimed clean.
- Metadata: `python3 -B scripts/register_leetcode_lesson.py 1192 --validate-only` exited 0.

This is author self-check evidence only; `L1192-R1-RECURSION` remains `fixed awaiting independent re-review` and is not independently accepted here.
