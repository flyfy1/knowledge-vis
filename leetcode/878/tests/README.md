# Reproduce author checks

From the repository root, using the already-running preview at port 18770:

```sh
OUTPUT_DIR=/tmp/878-review-evidence python3 -B leetcode/878/tests/test_solution.py
OUTPUT_DIR=/tmp/878-review-evidence node leetcode/878/tests/test_core.cjs
OUTPUT_DIR=/tmp/878-review-evidence node leetcode/878/tests/browser.cjs
OUTPUT_DIR=/tmp/878-review-evidence node leetcode/878/tests/access.cjs
OUTPUT_DIR=/tmp/878-review-evidence node leetcode/878/tests/mapping.cjs
python3 -B scripts/register_leetcode_lesson.py 878 --validate-only
```

Each test accepts `OUTPUT_DIR`, defaulting to this folder's `evidence` directory.
The browser also accepts `LESSON_URL`. Set `NODE_PATH` to the installed browser
packages as provided by the environment. The launch uses
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if supplied. No persistent server is started.
The browser host is Linux here: native fallback copy uses Control+C, after a new,
verified clipboard sentinel for each locale attempt. The test never writes the
source to the clipboard as a substitute for the manual transfer.

`test_solution.py` imports and executes the real official `Solution` interface.
Its direct enumeration and periodic union oracle do not use binary search or the
optimized floor-count formula. `test_core.cjs` uses a direct two-stream merge as
its output oracle and enumeration for intermediate counts; checks retained-answer
and first-true boundaries after every update. It parses copy.js with Acorn to
reject duplicate keys before evaluation, and verifies exact source embedding.

`browser.cjs` covers all presets, endpoints, every intermediate frame with
rewind/replay, count experiment, all prediction options, state-preserving locale
switches, exact visible source/copied/downloaded bytes, denied clipboard and
storage, keyboard, forced colors, offline file opening, deep links, narrow layouts,
200% CSS page magnification, local request errors, and calibrated sRGB contrast.
CSS magnification does not claim native browser chrome zoom or physical devices.
Screenshots are evidence to inspect, not an automatic visual-quality verdict.

These are author self-checks. Independent lesson review, actual novice teach-back,
LeetCode submission acceptance, deployment and public delivery are not performed.
The frozen candidate is identified by evidence/candidate-sha256.json. Use a fresh
OUTPUT_DIR when reviewing so the candidate's evidence is not rewritten.

`mapping.cjs` is the focused 878-R1 regression. It checks rendered bilingual
code explanations against concrete Python operations, then compares both
branches with the hand-calculated default trace. It captures the full bullet
list at 320px and 200% CSS magnification. The original candidate fails its first
mapping assertion; the preserved red log is evidence/r1-mapping-red.log.
