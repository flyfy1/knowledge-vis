# Independent static-version implementation review

Date: 2026-10-25. **Verdict: approved implementation; no required findings remain.** Approval covers the source hashes recorded in `leetcode-static-versions-evidence-20261025/independent-review/reviewed-source-sha256.json`. It does not establish deployment, all-120 generated-site verification or production delivery. No source implementation or Pi state was changed by this reviewer.

## Findings and disposition

**P1 — migration ownership guards: closed.** The first deployment helper held runner/release locks but omitted checkout ownership, actual clean HEAD verification and exact STOP ownership. The revised helper acquires checkout, runner and release locks, verifies clean actual HEAD against saved expected HEAD and requires `root-import803805-20261025`. The reviewed deployment SHA-256 is `cacac12d0e93c29dc474bb3f6161b71db94a1bac03cb635ce6ebff4e353892ce`. Its durable prepared receipt precedes production writes; partial application accepts only old-or-manifest bytes, retains protected files and does not mutate progress or release accounting.

**Legacy #2916 creator attribution: closed.** Independently used the Codex app's read_thread, followed its returned cursor, and retrieved creation turn `01a1472b-3ec8-7483-ba9d-0c70f53fb93d` in Codex thread `01a1472a-f9ef-78a3-a4f9-32816fda17c7`. It records added `core.js`, `copy.js`, `index.html` and `app.js` under #2916. This corroborates the new creator-provenance JSON. Codex attribution is supported; no exact creator model is inferred from Astra's later review.

## Implementation assessment

The separate generated registry is an appropriate compatibility fix. Numeric `problems.config.js` remains valid for cached old root HTML's strict numeric validator; generated HTML uses `problems.codex.config.js`. Derived rows alter only `path`, with no duplicate problem cards. Source root validation accepts only that ID's numeric or Codex path; arbitrary/Claude paths remain rejected. Canonical source previews keep numeric routes. The new output is a physical directory, not a client-side renamed address.

The pure runtime builder preserves version-file bytes and old numeric assets, replacing only the deployed numeric index with a fixed sibling redirect. Query and fragment are carried without reparsing, `location.replace` avoids an extra redirect history entry, and no base tag/meta-refresh interferes with anchors or downloads. The bilingual fallback accurately states its no-JavaScript query/fragment limitation. Untracked Claude files are neither discovered nor incorporated.

The publisher retains the existing source acceptance/reviewer/report/whole-tree/metadata gates and numeric source digest. Its changed payload includes physical version files, numeric compatibility files and both registries. Version assets precede redirects, registries and discovery. Missing prior migration fails before a new batch advertises absent versions. Historical pending payloads replay their recorded bytes without regeneration. Public verification now asserts version destinations and encoded query/fragment preservation through both numeric URL forms, while retaining numbered headings, official links, bilingual body and error checks. Current ledger registry hashes continue to refer to the canonical numeric registry.

Publisher implementation SHA-256: `17992c3928413c08973b4a3f330d5323f498c15f12feb0884e1762eb579d489d`. Builder SHA-256: `f92eca0575bfcf74a4b68b9d011470e99415f12b671328bba1cebf035ddfd12e`. Runner/publisher defaults are 20; explicit legacy batch sizes still work. Actual Pi launcher arguments must also adopt 20, because a saved explicit 100 overrides a parser default. The latest owner authorization permits continuation, but only after public migration verification and safe publisher adoption; this review does not launch anything.

## Independent executed evidence

Archived in `leetcode-static-versions-evidence-20261025/independent-review/`:

- Six pure builder tests passed. A separately constructed disposable Git fixture using the actual #51 runtime verified exact copied-byte parity, unchanged canonical source/registry, path-only derived metadata and generated discovery HTML.
- Actual Mac Chromium navigated generated homepage → physical #51 Codex page → Back with retained search, both languages, numeric directory and explicit-index redirects with encoded/duplicate parameters and fragment, explicit Codex index and exact Python download. An old strict-numeric homepage fixture continued to work through the separate numeric registry and redirect. No-JavaScript fallback and zero page/resource errors passed.
- 25 publisher regression tests passed, plus the subsequently added 19-waits/20-publishes test passed separately; seven queue/publication integration tests and seven live Chromium publisher-gate fixtures passed. The first browser-fixture invocation lacked NODE_PATH; its MODULE_NOT_FOUND failure is retained, then the unchanged tests passed with the installed Playwright runtime path.
- A disposable 120-ID migration fixture ran the deployment helper with AST substitutions limited to filesystem roots and the two discovery baseline hashes. Wrong STOP and an already-held checkout lock reject preparation; protected-file drift rejects apply; partial apply resumes; repeated apply is idempotent; all output bytes match and progress/ledger/protected bytes remain exact. This exercised no actual Pi path.

The custom browser harness initially matched only a query-free homepage when installing its old-root fixture; that assertion failure was a harness URL-match error. Correcting its route pattern made the intended old-client scenario run and pass; no implementation changed. The first migration fixture used macOS `/var` versus resolved `/private/var` paths; resolving its temporary root corrected that fixture setup. The production helper uses literal Pi paths. The temporary review HTTP server was stopped.

## Remaining release duties and limits

Build the real 120-lesson overlay from the committed exact revision, verify every generated runtime/hash and the public ordinary URLs, exercise root/collection discovery in both languages, and preserve the separate migration receipt. These are release duties, not waived by the one-lesson browser fixture or mocked publisher hash callbacks. `verify.py` hashes ordinary URLs and runs the actual publisher browser gate for all manifest entries; root-specific interaction still needs its separate check. Cached numeric HTML can temporarily display the legacy lesson while its assets remain valid; do not claim universal instant cache invalidation.

On interruption, retain STOP, stage and receipt. A process kill during a temporary-file write may leave a `.static-new-*` file that the protected inventory intentionally rejects; reconcile that owned remnant rather than deleting broad paths or bypassing the inventory. Resume only after full public proof, then adopt reviewed scripts/policy and the explicit 20 cadence at the clean saved central boundary. Historical receipts, accepted source identities and unrelated work remain preserved.
