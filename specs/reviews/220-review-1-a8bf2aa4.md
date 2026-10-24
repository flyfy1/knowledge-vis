# Independent review: Contains Duplicate III (220)

Candidate: a76348087789c9c7e4de951810a4eafb9ce50b21. URL: http://127.0.0.1:18793/leetcode/220/. Review run: 220-review-1-a8bf2aa4; reviewer is this independent agent run (no separate human comprehension measurement). Target: basic Python, lists, loops, functions, elementary recursion.

## Frozen interpretation and cold walkthrough (before source)

Read only specs/leetcode-review-gates.md before opening the real Chromium browser. Weights: 15/20/20/20/15/10; canonical Python expected for this algorithm problem. Teaching must explain both distances, expiry, bucket geometry, the continuing-path invariant and actual executable Python cost. No author notes, previous reports, source or test output read at this stage.

00 — Question: which pair meets both inclusive bounds? Action: read [1,8,3], k=2,t=2, manually calculate (0,2): position gap 2, value gap 2, predict true; click k=1. Observable: last row changes from Yes to No for position, preserves value-gap Yes, result becomes false. Conclusion: value closeness alone cannot establish eligibility; positions are original zero-based indices.

01 — Question: which old positions still matter? Action: read and hand-follow baseline loops and moving interval. Observable: i=2,k=1 retains position 1 (8), excludes position 0 (1); sorted-neighbor counterexample retains original gap 2. Conclusion: moving right can never revive an expired position; baseline repeats up to k comparisons, so removing expiry alone does not yet eliminate the scan.

02 — Pre-operation prediction: default trace must insert 1 in bucket 0, insert 8 in bucket 2, then probe 3 in bucket 1; same bucket misses, left bucket hits at gap 2. With expiry preset k=1, 1 must be removed before probing 3 and final result must be false. Same-bucket width t+1 bounds the maximum integer gap by t; adjacent buckets require actual difference checking; buckets beyond neighbors cannot qualify. Negative floor rounding is necessary.

03 — Before reveal: exercise [-5,8,-2],k=1,t=3 should be false: at i=2, -5 expires; 8 is 10 away. Independently chosen fresh code check (UI offers presets only): [-4,7,-1],k=2,t=3 should be true, indices (0,2) meet both bounds and both negatives have floor bucket -1 at width 4. Counterexample [-4,7,-1],k=1,t=3 should be false despite value gap 3. Extra tempting-rule counterexample [0,5],k=1,t=3 should be false despite adjacent buckets. These predictions are saved before revealing or checking code.

02 — Action: advanced all eight default actions. Observable: 1 expiry empty, 2 probe 0/−1/1 empty, 3 insert 1→0; 4 expiry retains position 0, 5 probe 2/1/3 empty, 6 insert 8→2; 7 expiry retains positions [0,1]; 8 probe bucket 1 empty then bucket 0 value 1 gap 2, witness (0,2), returns true without insertion. Conclusion: three lookups replace a candidate scan; visual integer ranges explain lookup eligibility rather than arbitrary decoration. Back restored action 7 including seven history entries and no witness. Selecting expiry preset restarted; End showed 10/10 false, history explicitly removed position 0 at gap 2>1, probed unsuccessfully, inserted 3, then exhausted. Stored values 8 and 3 remain at completion; expiry invariant applies at probes, not after insertion.

03 — Action: selected false and revealed. Observable: correct prediction; explanation removes −5 before i=2, leaves only 8, gap 10. Changed answer to first choice; explanation disappeared pending another reveal. Conclusion: answer feedback depends on the current committed choice and cannot use a previously revealed answer as current feedback.

04 — Question: why is every valid pair found and how is it executable? Action: read invariant, proof, boundaries/cost, opened complete implementation. Observable: code removes nums[i-indexDiff-1], computes x//width, checks same and adjacent buckets, inserts only after a miss. Default transition maps to bucket=3//3=1, missing bucket 1, then abs(3-buckets[0])=2 returns True. Conclusion: at each probe all stored positions are exactly eligible predecessors; no same-bucket overwrite can lose a candidate on a continuing path. Exhaustion implies every possible right endpoint was tried. Expected dictionary time and transient k+1 storage are distinguished from rewind snapshots. New vocabulary is introduced with concrete ranges before the general invariant. Some friction for the target reader: enumerate and dictionary membership/deletion are visible without a separate syntax primer, though dictionary lookup is explained and each operation has a causal counterpart.

Cold walkthrough saved before opening source or tests. Screenshots cold-desktop.png and cold-hit.png captured from real Chromium. Fresh custom cases are code checks, not custom UI experiments. Browser code display above is lesson content, not repository source inspection.

## Source, statement and executable audit

HEAD independently confirmed as the requested revision. Initial/final git status showed only this report and its exclusive evidence directory untracked. No implementation, author evidence, tests or services changed. No earlier report for 220 was found in specs/reviews; no inherited finding was closed.

Read the public [official statement](https://leetcode.com/problems/contains-duplicate-iii/) normally through the web tool after coldwalk; it was readable without bypass. It confirms distinct indices, both inclusive inequalities, both official examples and all four bounds shown in the lesson. Python is a faithful original solution, not an analogy. The saved lesson-local official-graphql.json has the Python3 class/method/arguments/return stub matching solution.py, plus TypeScript support; the local verification note was read only after coldwalk. No non-Python language contract is needed. There is no supportedLanguages exception excluding a preferred language.

Read LANGUAGE_FILES in scripts/register_leetcode_lesson.py: Python canonical solution.py, offline python-code.js, export PYTHON_SOURCE. Read canonical source, core.js, app.js, copy.js, HTML/CSS and tests before executing tests. Core explicitly floors negative bucket IDs and emits separate expiry/probe/insert snapshots. Python stores values only; visual positions are explanatory metadata. JS checks the actual gap for same bucket too, a redundant check equivalent to Python's unconditional same-bucket return under the established width invariant. Snapshots are deep copied; rewind does not recompute an altered state. On a continuing path bucket uniqueness makes deleting the expired value's bucket safe.

Independent actual-source checks used runpy.run_path on solution.py with -B (no bytecode writes). Saved predictions passed:

| Input | k | t | Predicted/actual |
| --- | ---: | ---: | --- |
| [-4,7,-1] | 2 | 3 | true / true |
| [-4,7,-1] | 1 | 3 | false / false |
| [0,5] | 1 | 3 | false / false |
| [-1,3] | 1 | 3 | false / false |
| [2,2] | 1 | 0 | true / true |
| [1,9,1] | 1 | 0 | false / false |
| [1,9,1] | 2 | 0 | true / true |
| [-1000000000,0] | 1 | 1000000000 | true / true |
| [-1000000000,1000000000] | 1 | 1000000000 | false / false |

Fresh negative example hand state: width 4; insert -4 in bucket -1; insert 7 in bucket 1 after missing buckets 1,0,2. With k=2, i=2 retains both, -1//4=-1 hits -4. With k=1, delete bucket -1 before probing; bucket -1 and -2 miss, bucket 0 misses, so insert -1 and exhaust false. This excludes both expired-neighbor and unconditional-adjacency wrong rules. No input mutation observed.

A separate seed-20261018 generator tested 1,200 arrays (lengths 2..18, values -25..25, every sampled k within contract, t=0..7) against direct enumeration of all i<j. All agreed with bool results and preserved input. sys.settrace on the actual canonical first-probe line checked 5,319 intermediate states: exact eligible predecessor values, floor bucket keys and no collisions. These checks execute the submission itself, rather than trusting the teaching trace.

Inspected provided test scripts before rerunning. Commands executed from repository root, output redirected with TEST_OUTPUT_DIR=$PWD/specs/reviews/220-evidence/220-review-1-a8bf2aa4:

- `python3 -B leetcode/220/tests/test_solution.py`: exit 0; 77,013 cases, 1,997 actual-method probe checks, max n=100000, including final-position hit, expiry miss and early hit. Result python-results.json.
- `node leetcode/220/tests/test_core.cjs`: exit 0; 5,422 trace cases, 42,032 frames; source mirror and 112 bilingual keys passed. Result core-results.json.
- `node leetcode/220/tests/browser.cjs`: exit 0; result browser-results.json.
- `node leetcode/220/tests/browser-extra.cjs`: exit 0; result browser-extra-results.json.

Generated JSON retains the scripts' literal “author self-check” kind labels. Here these are reviewer reruns of inspected author tests, supplemental to the independent coldwalk and independent source checks; those labels are not independent comprehension claims. All generated results/screenshots are in this run's exclusive directory. Existing author evidence was not regenerated.

Cost independently follows from constant many dictionary operations per element and each expiry occurring once: expected O(n), O(min(n,k)) auxiliary space for legal k>=1 despite a transient k+1 entries. Input stays unchanged. Width >=1 prevents zero division; Python integer arithmetic avoids overflow at ±10^9. Trace history copies cost O(n²) space for generalized input and are explicitly separated from submission costs. Baseline worst case sums up to n(n−1)/2 comparisons when k=n, about five billion at n=100000.

## Interaction, translations and access

Real browser: Chromium 156.0.8078.4, Playwright package via NODE_PATH, executablePath uses process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. All eight presets traversed in English and Chinese, each forward state compared after Back/Next, reset returned slider to zero and endpoints disabled correctly. End results were true,false,true,true,false,true,false,false. Completed history and bucket snapshots restored together. Preset changes restart trace; language changes retain trace, selected prediction and revealed feedback. Reset intentionally resets trace while preserving the separate exercise answer. All three exercise options revealed with correct/incorrect reasoning; changing a choice hid old feedback. No runtime or request errors.

Keyboard Space advanced the focused Next control; Tab moved to Reset; focus outline was solid 3px. Slider Home/End reached exact endpoints. Table and history have keyboard-focusable local scrolling; code pre blocks are focusable. Controls measured at least 48px. File-protocol offline source/interaction, denied storage and unavailable fetch checks passed. Copy native clipboard readback, displayed code text, selected manual fallback and downloaded bytes exactly equaled canonical solution.py in both locales. Rejected clipboard API showed the full source, focused its textarea and selected every source character. Offline mirror decoded exactly to canonical source including final newline.

Read the bilingual copy rather than relying only on key counts: distance limits, width derivation, floor example, excluded buckets, expired exercise, invariant, termination and expected costs carry equivalent explanations. Independently visited Chinese negative preset at action 7/8, width 390: table held -4 in bucket -1 [-4,-1] and 5 in bucket 1 [4,7]; current -1 was not yet inserted. Switching back to English preserved action 7. Screenshot independent-zh-negative-390.png.

Browser scripts exercised both locales at 320,390,736,1440 and 1280 with 200% CSS zoom, dense official example action 17/19, plus 32 narrow final-preset states. No page overflow or essential chip/bucket clipping was found. Visually inspected cold-hit, header-en-320, trace-en-1440, trace-en-320, trace-en-390, trace-zh-320, independent-zh-negative-390, extremes-zh-320 and both zoom200 images. Concrete associations remain clear: each bucket's integer range is above its stored value/original position; current chip borders do not alter data. Long bound values fit at 320. Nav scrolls horizontally; the screenshot's top content behind sticky navigation is a capture/scroll position, not text intersection within state components. Essential states can be scrolled fully into view. No collision finding is inferred from container boxes.

Measured rendered contrast: body 16.09:1, muted progress 7.08:1, disabled text 6.45:1 with opacity 1, primary control 13.10:1, selected control 10.73:1, muted chip 6.45:1. Disabled endpoints remain readable. Forced colors focus and reduced-motion behavior passed. This is browser/screenshot evidence, not testing by a human novice or a screen-reader user. Zoom evidence is CSS zoom at 200%, not a separate native browser zoom shortcut test.

## Candidate identity and preflight

Served bytes equaled checkout bytes for HTML, canonical Python, mirror, app, core, copy, local CSS, common JS and shared CSS. SHA-256:

| File | SHA-256 |
| --- | --- |
| 220/index.html | e4c903d531ea36a699935f1723add78883d29ec69d7ee5674bad20a87929a382 |
| 220/solution.py | e67c01aba6fe78e51aa255d6e1926b34cfa630ddf7a245fc9d468c3342914901 |
| 220/python-code.js | ea8d5ccdd56a1eeff3e16fb38ad2b3390865973fbb7cd0aac861db2d6c92f51c |
| 220/core.js | 9e08a7c25f7392349ac60cfc2798bdb54a5e7b395efd11e931427b7b5e9a37e5 |
| 220/app.js | ac21ed92201fa0891b88261a56e61e47300bffcb80df67fdd3d9a1e77956bcc5 |
| 220/copy.js | 6116052e652983d288fd81609af73e0af0675dcea1eec16bd948bf5665043d08 |
| 220/local.css | 906e0de972937572eddfa4870e21182e5cd3c44709c91f257357076e1f1b338c |
| style.css | 6e369a3bb35519eaa15f25a22bf8938d94882c4fd9b860a79522544f38a23f27 |
| common.js | f7d1d8914d9e583d385a4051636d8042739098768461d096b0e132bbb8267c9b |

`python3 -B scripts/register_leetcode_lesson.py 220 --validate-only` ran successfully twice from repository root: exit 0, no stdout. No registration ran. lesson-entry.json complexity is one nonempty string: “Expected O(n) time; O(min(n, indexDiff)) auxiliary space”. This meets both the metadata shape gate and the audited cost.

## Findings and scores

Required open IDs: none. No earlier required IDs discovered to close.

Optional stable note **220-R1-N1** — minor, open, section 04, both locales, desktop and mobile, this candidate. Reproduce: open complete code after reading proof. Expected improvement: explicitly introduce `enumerate`, dictionary membership and `del` for the stated basic-Python reader. Actual: the table lookup and expiry roles are explained, but those syntax forms receive no dedicated example. This is minor transfer friction, not a missing causal bridge; the concrete transition and complete executable code are reconstructable. Owner: lesson author, optional future enhancement; fix revision/regression: not applicable. No required gate violated.

| Dimension | Weight | Score | Rationale |
| --- | ---: | ---: | --- |
| Problem/terms/hand calculation | 15 | 4 | Concrete three-value pair table precedes abstraction; inclusive bounds and original positions checked by changing only k. |
| Derivation/saved work | 20 | 4 | Baseline repeated scans, irreversible expiry, concrete bucket ranges, neighbor necessity and distant exclusion all explained causally. |
| State/correctness | 20 | 4 | Probe invariant, no overwrite on continuing path, explicit before/after insertion, negative division and termination independently verified. |
| Interaction/visual meaning | 20 | 4 | Predictions confirmed; visible value/position/bucket links, restored history and complete traces; feedback changes correctly. |
| Python/cost | 15 | 3 | Faithful executable source and exact parity; independent examples/invariants/cost/mutation pass. Minor syntax onboarding friction described above. |
| Bilingual/device | 10 | 4 | Equivalent reasoning, preserved locale state, readable tested narrow/zoom states, keyboard access and strong contrast. |

Weighted score: 96.25/100. Every dimension >=3; no required open findings; browser, source, execution and metadata evidence complete for this scope. **Accepted** for candidate a76348087789c9c7e4de951810a4eafb9ce50b21. This is an independent lesson review, separate from publication. No successful LeetCode submission or measured human comprehension is claimed.
