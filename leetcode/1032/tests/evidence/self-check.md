# #1032 author self-check — 1032-author-v1

Author: Codex; exact runtime model identifier unavailable. Date: 2026-10-26.
Scope: authored candidate and self-check. Independent reviewer/run/report/outcome
pending. This is not independent acceptance, a LeetCode submission, publication,
real-device testing or observed novice comprehension.

## Contract and computational evidence

`official-graphql.json` is the dated public official GraphQL response, including
statement, constraints, official example and actual selector snippets. Frontend
ID 1032 (internal question ID 1097), Hard, free. Python3's stateful class interface
was observed directly; Python is the canonical preferred language. The class
accepts lowercase nonempty words and one letter per query; it preserves history
between calls and returns a Boolean for any nonempty matching suffix. Nothing
was inferred from category alone. No language exception or conceptual alternative
was substituted.

Commands from repository root:

- `python3 -B leetcode/1032/tests/test_solution.py`: PASS, 30,623 dictionary/stream
  cases and 280,521 queries. Independent direct-character suffix comparisons;
  binary exhaustive dictionaries of 1–3 words of length up to 3 with every
  six-letter binary stream; 600 seeded random cases; official result sequence;
  duplicates, overlap, zero calls, multiple objects; 2000 length-200 words and
  40000 queries. Every stored buffer and all trie prefixes/terminals checked;
  input list remains unchanged. Canonical original Python is actually executed.
- `node leetcode/1032/tests/test_core.cjs`: PASS, 4,040 cases / 60,191 frames.
  Independent string-ending oracle; intermediate reversed suffix paths, all
  missing-edge exclusions, partial-path exhaustion, terminal behavior, bounded
  buffers, deterministic traces and deep-snapshot isolation checked.
- Copy is JSON-parsed with a duplicate-key-rejecting hook before normal lookup;
  all pairs have exactly two nonempty strings. Embedded source equals exact
  `solution.py`, including final newline.

## Actual browser evidence

`node leetcode/1032/tests/browser.cjs` and
`node leetcode/1032/tests/browser_extra.cjs`: PASS. Both use real installed
Chromium and the already-running preview at
http://127.0.0.1:18770/leetcode/1032/. See browser-results.json for exact browser
version, computed colors, per-preset results, observed bilingual semantic text,
viewport geometry, source transfers and links. All test result/screenshot writers
honor OUTPUT_DIR. No persistent service was started.

- EN and zh, all 8 presets, every operation; forward→back→forward restores exact
  state, reset restores start, endpoints disabled; history is independently
  compared after every forward frame. The official preset finishes with
  false,false,false,true,false,true,false,false,false,false,false,true.
- Partial b path under word ab ends false, terminal a with a child returns true,
  and absent x edge returns false with distinct causal explanations in both
  languages. Visible path/current-node/terminal labels coexist; formula operands
  and meanings are inspected as rendered text, not merely key presence.
- All prediction choices are selected and explicitly revealed; feedback is correct
  for each, answer change clears feedback, locale roundtrips preserve choice,
  reveal, preset and trace position. Tiny hand example goes to both endpoints.
- Exact localized H1 and document title asserted, including narrow zh→en→zh.
  Locale switching works when storage throws, preserving the appended letter.
- Displayed `textContent`, embedded source, successful clipboard source, real
  native manual fallback source, and downloaded bytes equal canonical Python
  without normalization. Each of FOUR fallback attempts gets a unique fresh
  non-source clipboard sentinel that is written and read back first. Actual
  Linux host Control+C then transfers the selected textarea source and reads it
  back exactly. This is native copying, not only a DOM selection assertion.
  Both locales have exact downloads in evidence. Source also initializes through
  file:// without fetch.
- 320/390/736/1440 widths × 100%/200% CSS content zoom × both locales: 16 populated
  layout observations. Page width and trie node content do not overflow. Native
  select labels are A–H with full bilingual preset descriptions directly below;
  measured glyph width fits inside client width minus padding and 24px arrow
  reserve for every preset at 320px, both zoom levels and locales.
- Actual keyboard Enter performs an operation with visible 3px focus. Keyboard
  deep links activate existing destinations. Explicit step navigation assertions
  at narrow zoom put the target below the sticky nav. Reduced motion and forced
  colors exercised. Controls use at least 48 CSS px; focus uses exact shared
  orange and stable labels, and no ambient motion is introduced.
- No runtime console/page errors, failed assets or external asset requests in the
  main lesson context. Link targets return real populated sections and have been
  read for the promised concept; related-targets.json binds destination hashes.
  Existing collection includes #212 and #336. This verifies local preview
  availability, not public deployment.

Computed contrast is recorded from actual browser styles with nearest opaque
backgrounds. The actual measurement helper is calibrated against black/white 21:1,
equal colors 1:1, primary-color luminances (0.2126, 0.7152, 0.0722), and
#747474 on black = 4.492948073111701 (below 4.5 without rounding).
The helper is scoped to opaque solid backgrounds, as used here. Body 16.09:1; hint 7.08:1; explanation 12.62:1; readouts
and node text 13.40:1; visited labels 10.91:1; enabled action/nav 13.10:1; opaque
disabled text 6.45:1. All measured normal text exceeds 4.5:1. Disabled controls
remain legible; no inherited opacity is accepted. The shared stylesheet is 9425
bytes; local CSS is 2452 bytes, total 11877 <25000. No external fonts or images.

## Visual inspection and pre-freeze repairs

Generated screenshots were actually opened through the image-view tool. Full
views inspected include narrow English and Chinese trie states, desktop trie,
320px 200% trie, Chinese zoom header, English prediction and Chinese partial-path
exhaustion. All generated screenshots were also inspected in contact-en.jpg,
contact-zh.jpg, contact-extra-en.jpg, contact-extra-zh.jpg and contact-states.jpg.
The source panel deliberately scrolls horizontally; code is never shrunk to fit.
At 200% the prose and node labels wrap and all content remains available through
ordinary scrolling. The four closed-preset screenshots (both locales/zoom levels) were also opened
and inspected: H is complete, the native arrow has margin, and the full preset
description wraps below. Source/prediction screenshots can start partway down a
section because they focus the relevant state; the separate navigation geometry
assertion checks actual anchor placement rather than treating capture position
as a clipping defect.

Initial self-check at 320px/200% found document width 380 >320: header top-row
minimum widths did not wrap. Before freeze, the header was allowed to wrap,
official-link whitespace was made normal and controls constrained. Long native
preset labels were moved into a wrapping description. Later inspection found
`.btn.primary` overrode inherited disabled background; an explicit local disabled
primary rule corrected that. Narrow gutters were reduced using existing 8px
spacing so enlarged words wrap cleanly. Final geometry/disabled checks and browser
reruns pass. These are author pre-freeze repairs, not independent review closures.

A contextual trie link was added beside its first definition; its actual #212
step1 destination was keyboard-activated and read. Final Python localization/source
checks and both browser suites were rerun on the final files. No runtime change
is being hidden as an author-status-only edit.

## Gate, identity and limits

`python3 -B scripts/register_leetcode_lesson.py 1032 --validate-only`, executed
from repository root: PASS, exit 0, empty stdout/stderr. See metadata-preflight.json.
No registration performed. `lesson-entry.json` has one nonempty complexity string.
Candidate runtime/tests/brief hashes and shared dependency hashes are recorded
in candidate-manifest.json. Only leetcode/1032 was authored. No commit, push,
deploy, service changes, credential access or agent spawning occurred.

The six-dimension independent lesson review remains pending. Physical phones,
OS-level browser zoom, public delivery and actual learner teach-back remain
unverified. The 200% evidence uses real Chromium CSS content zoom. Offline and
preview checks establish behavior in this environment, not LeetCode acceptance.
The next action is a separate cold review against the frozen candidate manifest.

Calibration command: `node leetcode/1032/tests/contrast_calibration.cjs` passed.
It executes the exact helper/calibration block extracted from browser.cjs and
recomputes all nine recorded rendered color pairs with exact equality. See
contrast-calibration.json. Actual font stacks, glyph budgets and Linux browser
context are recorded in browser-extra-results.json; no resolved physical font
or cross-platform fidelity is inferred.
