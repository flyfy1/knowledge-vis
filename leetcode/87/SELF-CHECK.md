# Author self-check — #87

Status: complete author candidate; independent lesson review pending.
No separate reviewer, LeetCode acceptance, novice outcomes, publication or
production verification is claimed. No shared files/registry were changed.

Official contract and Python3 callable are preserved in
[official.json](tests/evidence/official.json). Public statement verified at
https://leetcode.com/problems/scramble-string/ and public GraphQL on 2026-10-18.
Python is the preferred officially observed language; no fallback contract is
needed. `solution.py` is the canonical submission, `python-code.js` embeds it
exactly. The browser trace is a separate teaching simulation.

Observed computational checks:

- 5,460 exhaustive pairs over a/b, lengths 1..6, against generated-string sets.
- 350 seed-87 cases over a/b/c, lengths 1..8; 22,332 completed Python interval
  cells compared to the independent generator oracle.
- Three official examples, unequal characters, duplicates, fresh true/false
  transfer cases and length-30 identical, unequal-count and reverse cases.
- 346 browser-core input pairs; 10,820 frames and 174,621 known cell observations;
  both child alignments, unknown/false distinction and snapshot isolation.

Observed browser checks are in browser-results.json and visual-results.json,
with reproducible commands in tests/README.md. Both locales and all six presets
were exercised to completion; replay, rewind, reset, custom validation, prediction
changes and locale preservation passed. Clipboard success and denial, copied,
displayed and downloaded bytes matched the canonical file. Offline file opening,
blocked localStorage, native keyboard actions, focus/forced colors, internal
anchors, and preview asset errors were checked. All runtime requests were local.

Screenshot inspection (author, not independent review):

- Header: clear #87, official link, language control and immediate tiny example.
- 320/390: comparison panels stack, coordinate strings wrap without shrinking;
  48px controls wrap to rows. Long tables scroll inside labeled focusable boxes;
  the final column is reachable, and shorter length layers remain readable.
- 736/1440: pairings share a row; both child truth values are visible alongside
  actual substrings. Retained table layers show smaller witnesses and the root.
- 200% CSS zoom at desktop: enlarged labels remain readable, controls and panels
  fit, and table geometry is preserved. Sticky navigation scrolls horizontally.
- Table-only captures suppress the sticky nav during capture to avoid overlay
  artifacts; ordinary navigation and deep-link geometry are separately checked.

Measured minimum rendered text contrast is 5.92:1; core text token is above 7:1
on all three shared surfaces. Focus accent is above 3:1 on adjacent dark
surfaces. Exact ratios are retained in contrast.json and visual-results.json.
Shared plus local shipped CSS remains below 25,000 bytes; final byte count is
recorded in browser-results.json. No new fonts, external assets, or animation.

Author teach-through: ab/ba exposes the swapped alignment; great/rgeat adds an
internal swap while preserving root order. The abcde/caebd root cuts show why
letter counts alone cannot prove reachability. dp[length][i][j] saves one
Boolean for each pair of equal-length pieces, and increasing lengths guarantee
known dependencies. Both children must succeed at one legal cut. The fresh
abcd/badc exercise requires independent child choices, then maps the witness
to two exact DP reads. This is the author's reasoning check, not a measured
learner teach-back.

Remaining gates: a separate reviewer must cold-walk and score this frozen
candidate, independently choose cases, and close any findings. Dispatcher owns
registry/concept-map registration and any later release. Actual devices,
production delivery and browser chrome zoom have not been verified here.
