# Completed lane acceptance and evidence audit

Read-only follow-up on 2026-10-26. Both lanes naturally reached `completed` with
`current: null` and `accepted_local` entries. Their runner/native processes had
exited when the completed snapshots were captured; both checkouts were clean.
No restart, interruption, STOP, import, publication, review-history edit or local
commit/push was performed by this follow-up.

| ID | Accepted at (SGT) | Frozen candidate | Review commit | Registration HEAD | Score |
| --- | --- | --- | --- | --- | --- |
| 975 | 04:45:31 | `bc00150bef56379abd88333f62211cf7b16146c9` | `ce7077a06e7f89e1d7bcd7d3990f923c300a4afd` | `d1e5c03e4f58203b7b08f4a5b858a563b245e375` | 92.5 |
| 980 | 04:44:54 | `a440fe53769a1831f8e2f8f4f4bbd0195ff0906c` | `5b21967b134c73fbe7ba54ddd1168e35b1ff306a` | `d95031d1b9d90fa9e1cc578c000caef0c6756510` | 95 |

Both review histories contain one accepted review with `required_open: []`.
Raw completed progress, complete entries, registered registry rows, all runs and
final results are retained in `975-acceptance.json`, `980-acceptance.json` and the
corresponding `*-completed-progress.json`. Every author/reviewer events stream is
archived losslessly as `*-events.jsonl.gz`, bound to its original uncompressed SHA.
The capture script is read-only. Evidence manifests preserve every reviewer file's
path/hash/size; JSON evidence is copied locally. Screenshots remain at the recorded
immutable lane review paths and are hash-manifested, rather than duplicated here.

Full reports were read and copied without editing their bytes:

- [975 report](975-review-1-d2ae4c19.md), SHA-256
  `6d3457bfe7f6a63206c1da5c0034bfd3487f1f982aae0ce9f33d5981f0256001`.
- [980 report](980-review-1-43fed71e.md), SHA-256
  `8cb266502c313f7ee2833d33c24ffbc5ef192b3445789bf80c5181726a2dc7f0`.

## Findings and limitations preserved

#975 retains the reviewer's initially incorrect cold predictions and subsequent
independent corrections. The final report names no required finding. Unnumbered
advisories concern dense tuple/stack derivation and 320px table/readout navigation;
they are not silently promoted to required fixes or discarded. A root favicon
404 on a sibling-lesson visit remains recorded in browser.json. Official browser
navigation encountered Cloudflare verification without bypass; ordinary web
statement access and saved Python-interface evidence are the stated boundary.

#980 retains optional **980-R1-A1**: reaching a distant middle event in larger
presets requires repeated navigation; no jump-to-middle control. Required controls
remain available, so the independent reviewer classified it advisory. The original
long browser harness **failed/incompleted with exit 1**, reporting a closed
page/context at browser.cjs:18, and never produced browser.json. Its cause was not
established. The failure and all command/result events remain in the archive.

The independent replacement command `item_20` actually exited 0 and recorded all
six presets in both locales, terminal totals, source display/automatic clipboard/
sentinel-based native fallback/download parity, 320/390/1280 layout, CSS zoom 2,
and keyboard checks. Cold and other successful commands supply prediction,
rewind, contrast, visual states, locale preservation and related-link observations.
`980-browser-interruption-followup-events.json` preserves the exact failed command,
replacement command and relevant related/state checks; it is not a reconstructed
claim that the original harness passed.

**Coverage gap found after acceptance:** the original report's final assertion
that applicable checks were complete through replacement was broader than the
captured replacement coverage. The late unavailable-localStorage test (explicitly
required by `specs/leetcode-explainers.md`), offline file-source check and explicit
network allowlist/error audit were not established by that completed replacement
command. This gap existed; it is not retrospectively attributed to the original
reviewer or erased from the report.

## New independent supplemental verification — gap closed

After root requested the narrow checks, the preparer read and applied the
website-design skill's actual-state, self-contained-assets and verification-boundary
rules. No design/UI change was introduced. The inspected original harness segments
were implemented in [980-supplemental-browser.cjs](980-supplemental-browser.cjs),
covering only the three missing areas without clipboard activity or a full rerun.

Exact execution command (script streamed over SSH, no script written on Pi):

```sh
ssh pi 'NODE_PATH=/home/songyy/projects/integ-games/node_modules PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/home/songyy/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome /home/songyy/.local/node-v22.23.2-linux-arm64/bin/node -' < specs/reviews/parallel-975980-evidence-20261026/980-supplemental-browser.cjs
```

The actual execution exited **0 at 04:48:12 SGT**, Linux Chromium `156.0.8078.4`;
[result JSON](980-supplemental-browser.json) records Node/browser/executable, asset
hashes and every request. A temporary loopback static server read the existing
checkout and was closed in the same test process; no persistent service or worker
was launched. Browser scratch data was outside the checkout. No clipboard API was
used. The canonical source SHA stayed
`abe291bca8cc7c644450e598ab5128269691de7dbf2410e3ac9603ea9de9921f`; frozen candidate
and registered HEAD had the same lesson tree `0df616491870cbc77e1003ab898c40a0aa2afb77`.

| Supplemental check | Actual observation |
| --- | --- |
| Unavailable localStorage | Throwing getter exercised four times; both locales changed correctly, exact Python displayed, Next/Reset functional |
| `file://` source | Exact canonical text including newline in both locales; no HTTP request; local controls functional |
| Network/errors | Eight local requests per context; zero external attempts, failed requests, HTTP ≥400 responses or page errors; route allowlists enforced |
| Frozen identity | Before/after HEAD, lesson tree, seven runtime asset hashes and clean Git status unchanged |

This new supplemental verification closes the identified coverage gap without
finding a lesson defect. It is separate from the original independent review;
the report, acceptance entries and failed harness evidence were not modified.
No reopening was performed. No physical-device, public delivery, online submission
or cross-platform claim follows. Later import still requires the normal fresh
guarded boundary and exact identities; local acceptance alone is not publication.

## Prospective recommendation only — not adopted policy

When a reviewer substitutes checks for an interrupted suite, list the original
suite's required checks, mark completed/pending/unavailable evidence separately,
and map each pending item to an actual successful replacement command/result.
Retain the interrupted exit status and avoid an umbrella completeness conclusion
until that mapping closes. This is a short proposal for later dispatcher review,
not a change to an active spec, prompt, rubric or current acceptance history.
