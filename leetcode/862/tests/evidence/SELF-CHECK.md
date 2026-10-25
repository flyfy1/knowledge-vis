# #862 author self-check — frozen candidate r1

Status: complete author candidate; independent per-lesson review pending. This
is self-check evidence, not separate review, learner results, LeetCode acceptance,
registration, deployment or release. Only leetcode/862/ was authored.
Official statement, examples, constraints and Python3 callable are captured in
official-graphql.json with the exact URL, request, HTTP 200 and UTC timestamp.

Commands actually passed from repository root:

- `python3 -B leetcode/862/tests/check.py`: 5,574 small cases including exhaustive
  lengths 1..6 over [-2,0,2], random seed 862; 1,700 full intermediate traces;
  four length-100000 boundaries. Executes canonical Solution.shortestSubarray,
  compares independent slice/sum oracle and baseline, asserts input unchanged.
  Intermediate invariants include best length at each completed prefix, actual
  attaining interval, strict queue order and each deletion inequality.
- `NODE_PATH="$NODE_PATH" node leetcode/862/tests/copy.cjs`: AST duplicate keys,
  bilingual pair shapes, placeholders and every static copy consumer passed.
- `NODE_PATH="$NODE_PATH" node leetcode/862/tests/browser.cjs`: passed both
  locales, all eight presets, every forward/back/forward transition, reset/end
  and endpoint disabled behavior, three prediction options, change after reveal,
  locale preservation, exact H1/document title and official link.
- `python3 -B scripts/register_leetcode_lesson.py 862 --validate-only`: exit 0,
  empty stdout/stderr. See preflight.json. This was validation only.

Browser: real headless Chromium 156.0.8078.4, Linux ARM64, supplied executable
via PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Final browser-results.json binds SHA256
of every shipped lesson file and metadata to its actual served bytes. Canonical
source equals embedded mirror, DOM textContent, successful clipboard readback,
all downloaded bytes and four manual fallback readbacks. Each fallback attempt
used a fresh verified non-source sentinel before denying automatic writes;
Control+C on the actual Linux host transferred the full selected source.
Storage denial and file:// offline source/trace initialization passed.

Layout: EN/ZH × 320/390/736/1440 × CSS zoom 1/2 = 16 states. No document or
readout overflow. Native closed select A–H fits each measured width including
24px arrow reserve and padding; full input/result remains adjacent below it.
System font stack is shared PingFang SC, Microsoft YaHei, system-ui, sans-serif;
no claim about the resolved installed font. Native keyboard Enter/Tab, 3px
focus and forced-colors outline pass. Related links were keyboard-activated at
320px in both locales: #327 step1 actually explains prefix subtraction and
exclusive-end indices, #239 step2 explains both-end candidate removals for
window maxima. Captured destination text/hash and labels are in browser results.

Numerical contrast helper calibrated black=0, white=1, primaries .2126/.7152/
.0722, black:white=21, #747474:black=4.492948073 (correctly below 4.5).
Measured solid text pairs: main 16.087, explanation 12.616, muted hint 7.744,
queue cells 13.397, candidate/current 10.910, disabled controls 6.449,
selected locale 13.101; orange focus on panel2 8.937. All pass applicable AA;
main reading text exceeds 7. Shared + local shipped CSS: 11,294 bytes.

Visually inspected screenshots using view_image: bilingual page tops, English
operation3 domination and Chinese operation4 current/candidate overlap, desktop
terminal, both narrow normal layouts, English 320px zoom2 terminal, Chinese
320px zoom2 controls, English revealed exercise. Cells retain actual index:value,
orange current border and explicit current/candidate words simultaneously;
wrapped readouts and selected labels remain legible. Zoom2 naturally requires
more vertical reading. Other screenshot geometry is checked automatically;
no claim of physical-device or screen-reader speech verification.

Resolved author findings retained here:
1. First narrow zoom2 run reported document width 386 vs viewport 320. Native
   long select labels also exceeded their width. Added H1 wrapping, compact
   A–H with full descriptions, and wrapping official link. The remaining page
   overflow was traced to shared official-link white-space:nowrap. Local fix
   passed the unchanged width/arrow-budget assertions. zoom-debug.png records
   the diagnostic candidate; it is not a screenshot of the final candidate.
2. AST check found duplicate `back`: navigation copy and back-removal event.
   Renamed the event to backEvent and added actual bilingual navigation-label
   assertions. Final AST/browser checks pass.
3. The comprehensive browser run found a /favicon.ico 404 only after following
   related lesson #239. Diagnostic console locations confirmed this exact
   pre-existing sibling request. Final test records it in relatedWarnings and
   rejects every other console/page/asset error. #862 uses a data favicon;
   its own errors, bad assets and external runtime requests are empty. No
   sibling or shared files were modified to clear this warning.

Limits: simulation is separate from executing Python; execution evidence is the
Python test above. CSS zoom2 is headless Chromium page scaling, not browser
chrome zoom. No real novice, physical device, public origin, submission or
independent teaching review was tested. All workflow status stays in this
record and BRIEF, not in learner-facing lesson copy.
