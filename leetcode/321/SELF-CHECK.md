# #321 author self-check — frozen candidate 321-author-v1

Status: complete author candidate, ready for a separate independent review. No independent acceptance, measured novice result, LeetCode submission or deployment is claimed. Only leetcode/321/ was authored; shared assets, registry, workflow, campaign state and reports were not edited.

## Official contract

The public official page and GraphQL were accessed on 2026-10-25 (Asia/Singapore). The exact timestamp, response, examples, constraints and selector stubs are in tests/evidence/official-graphql.json. The observed Python3 stub is Solution.maxNumber(self, nums1: list[int], nums2: list[int], k: int) -> list[int]. Both arrays have lengths 1…500, digits 0…9 and no leading zero; 1 ≤ k ≤ m+n. Python was selected under the general preference, without a language exception. Internal empty subsequences are explicitly distinguished from official inputs.

## Actual checks

- `python3 -B leetcode/321/tests/check.py`: PASS. 4,140 official/exhaustive/seeded/transfer oracle checks, seed 321; four maximum-constraint cases, including 500+500 identical digits at k=1000 and k=500. Exact displayed exhaustive baseline also executed. Inputs unchanged, result length and fresh returned list checked.
- `node leetcode/321/tests/core.cjs`: PASS. 4,136 browser-solution fixtures, 7,108 independent subsequence fixtures, 1,600 independent interleaving fixtures; 74,082 intermediate invariant frames. Prefix-stack optimality, deletion accounting, merge prefixes/pointers and snapshot separation checked. Acorn detects duplicate copy keys before evaluation; 107 nonempty bilingual pairs.
- `node leetcode/321/tests/browser.cjs`: PASS, 784 assertions. Real headless Chromium on the supplied preview. Both languages, all presets, every frame and rewind, forward/back/forward, reset and disabled endpoints, all prediction choices/reveal/change, language state preservation, storage denial, real clipboard and denial fallback with manual Ctrl+C, exact embedded/displayed/copied/downloaded/manual source parity. Internal URLs and fragment targets pass. Keyboard Enter/Tab, focus outline, forced colors and reduced motion pass. No page/console/asset errors and no external requests.
- Dimensions: both languages at 320, 390, 736 and 1440 CSS px; 200% CSS layout zoom at 1440. No document overflow, digit tiles remain ≥36×48 px at narrow widths, tested buttons/selects ≥48×48 px. Text contrast minimum 6.449:1 (disabled); ordinary body 16.087:1, explanatory text 12.616:1, stage labels 7.079:1. Exact pairs and focus ratio are recorded in browser-check.json.
- Shared + local shipped CSS: 11,829 bytes, below 25,000. Tokens are reused exactly. All runtime scripts are local, and Python source is embedded for offline display.
- Required final preflight from repository root: `python3 -B scripts/register_leetcode_lesson.py 321 --validate-only` → exit 0, no stdout/stderr. Recorded in tests/evidence/preflight.txt. No registration executed. Complexity is one nonempty string covering time and space.

## Visual inspection and semantic binding

The author opened and visually inspected all 20 final PNG captures: both headers, both selection/merge stages at each of 320/390/736/1440, and both zoomed merge stages. Narrow layouts stack the two comparisons, retain individual digit widths, wrap explanations and controls, and preserve source association. The old empty stack / new [6] state is distinct from the before-emission A=[8], B=[6,6,3] / after-emission [6,6,8] state. At desktop and zoom, labels and values remain separate and readable. No value/label overlap observed.

For focused stage screenshots the sticky navigation is masked only during capture, avoiding a sticky overlay artifact. Anchor navigation was separately exercised with the real nav visible and target geometry/active-step assertions. History has an intentional scroll boundary; all prior operations remain in its focusable DOM region and rewind restores exact snapshots. Full headers show the real navigation and language control.

Semantic evidence in browser-check.json records both languages for all prediction options: the shared 8,8 then 9>1 requires choosing A; correct result [8,8,9,8,8,1], counterfactual B-first maximum [8,8,8,9,8,1]. The latter was separately enumerated. Clipboard-denial feedback instead describes manual copying and is not reused for algorithm states. A language change retains the selected answer and reveal rather than moving choices or clearing state.

Author fixes before freezing: corrected the initial draft's transfer example so its first-source decision is actually necessary (verified counterfactual); replaced observer-only navigation after a zoom inspection exposed stale highlighting; added an empty local data favicon to avoid an automatic missing root favicon request; ensured 48px control widths as well as heights. Test-harness fixes separately corrected translated empty-state comparison, allowed smooth anchor scroll to settle, and used actual keyboard modality for forced-colors focus. One transient Chromium closure was rerun; final complete suite passes. These are author self-check findings, not independent review findings or acceptance history.

## Boundaries and remaining authority

No physical mobile device or browser chrome UI zoom was tested: zoom evidence is Chromium CSS layout zoom. No novice teach-back or independent cold walkthrough was performed. Independent review must inspect this frozen candidate and can rerun tests with OUTPUT_DIR to preserve it. Metadata and runtime hashes are recorded in candidate-sha256.json; any subsequent fix is a new candidate for fresh review. No shared concept-map/registry edit was made under the folder-only ownership rule; lesson-entry.json supplies the intended concept anchors for the authorized registration stage.
