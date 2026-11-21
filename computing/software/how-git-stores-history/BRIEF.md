# BRIEF — how-git-stores-history

Author: Antigravity (gemini-flash-worker-agy, thinking: on, effort unavailable; planner: gemini-pro-orchestrator-neon, thinking: effort=1.00), 2026-11-21. Task: W2 of the Software Core Principles series (`specs/essay-briefs/TASK-software-series.md`).
Status: unregistered draft (`page.json` omits `"status"` so the expected draft warning from `build-pages.cjs` applies). Both Chinese (`content.zh.md`) and English (`content.en.md`) were authored together cleanly (no `"languages": {"en": "stub"}` flag).

## Pinned release

- **Git 2.56.0** (`git version 2.56.0`, released **28 September 2026**, matching `/opt/homebrew/bin/git --version` on this host).
- Primary documentation consulted directly from `/opt/homebrew/Cellar/git/2.56.0_1/share/doc/git-doc/`:
  - `gitformat-loose(5)` (loose object header `<type> <size>\0`, SHA-1/SHA-256 shard layout, loose object map `.map` format)
  - `gitformat-index(5)` (`DIRC` v2/v3/v4 header, `stat` cache fields, `TREE` cache-tree extension, sparse directory entries)
  - `gitformat-pack(5)` (`PACK` v2 header, type+varint size encoding, negative `OFS_DELTA` offset encoding, `COPY`/`INSERT` delta opcodes, `.idx` v2 256-entry fanout table, `.rev`, `MIDX`)
  - `gitprotocol-v2(5)` (`ls-refs`, `fetch`, `have`/`want`, `thin pack`)
  - `gitrepository-layout(5)` & `git-refs(1)` (`create/delete/update/rename/migrate`)
  - `technical/racy-git.adoc` (`ce_match_stat_basic()`, `st_mtime >= index mtime`, zeroing `st_size` to `0`)
  - `technical/pack-heuristics.adoc` (type + basename/dirname hash + descending size sort heuristic, recency order)
  - `technical/reftable.adoc` (4 KiB prefix-compressed blocks, tombstone deletion, geometric compaction, Android 866k benchmark: 62.2 MiB vs 36.1 MiB, 409,660.1 µs vs 33.9 µs cold lookup)
  - `technical/hash-function-transition.adoc`, `technical/scalar.adoc`, `technical/partial-clone.adoc`, `technical/sparse-checkout.adoc`, `technical/sparse-index.adoc`
  - `BreakingChanges.adoc` & `RelNotes/2.45.0.adoc`–`2.56.0.adoc`

## One question & chapter ladder

**Core question:** What bytes does Git actually write into `.git/` when you run `git add` and `git commit`, why do full snapshots not blow up disk space, and how is history rewritten, packed, transferred, and garbage-collected?

11 chapters (`#ch1`–`#ch11`), 9 hands-on models (`ch2-model`–`ch10-model`), 10 static inline-SVG diagrams (`dg-gitmap`, `dg-blob`, `dg-tree`, `dg-dag`, `dg-index`, `dg-refs`, `dg-merge`, `dg-pack`, `dg-wire`, `dg-reftable`), 1 code block (`ch1-code`):

1. `#ch1` Map of `.git/`: working tree, `.git/index`, `.git/objects/`, and mutable pointers (`HEAD` + `refs/`). (`dg-gitmap`, `ch1-code`)
2. `#ch2` Blobs & content addressing: `<type> <size>\0<content>`, SHA-1 (20B) vs SHA-256 (32B), zlib DEFLATE, 2-char shard path, 1-bit avalanche. (`dg-blob`, `ch2-model`)
3. `#ch3` Trees & directory snapshots: binary `<mode> <name>\0<raw OID>` entries (`40000` without leading zero, implicit `/` directory sorting), Merkle subtree sharing across commits. (`dg-tree`, `ch3-model`)
4. `#ch4` Commits & the DAG: `tree`, `parent`, `author`, `committer`, message; immutable parent chains; why `amend`/`rebase` mint new commit OIDs and strand old ones. (`dg-dag`, `ch4-model`)
5. `#ch5` Index (`DIRC` v2): `stat` metadata cache skipping clean file reads, and the `Racy Git` guard (`mtime >= index mtime` forces re-hash and zeroes cached `st_size` to `0`). (`dg-index`, `ch5-model`)
6. `#ch6` Refs, branches, tags, `HEAD` & reflog: 41-byte branch files, 21-byte symbolic `HEAD`, detached `HEAD`, annotated `tag` objects, local `logs/HEAD` keeping `reset --hard` commits alive for 30 days until `gc`. (`dg-refs`, `ch6-model`)
7. `#ch7` Diff & 3-way merge: Myers (1986) $O((N+M)D)$ shortest edit script computed on read, merge base LCA on the commit DAG, convergent auto-merges, conflict markers, and Git 2.56 `git add --resolved`. (`dg-merge`, `ch7-model`)
8. `#ch8` Packfiles & delta compression: deferred packing, `(type, path, descending size)` sliding-window heuristic, `OFS_DELTA` negative varint offset, `COPY`/`INSERT` delta opcodes, `.idx` v2 256-entry fanout lookup. (`dg-pack`, `ch8-model`)
9. `#ch9` Transport, shallow/partial clones & `git fsck`: Wire Protocol v2 (`ls-refs`, `want`/`have`, thin packs), `--depth=k` vs `--filter=blob:none` promisor remotes vs `--filter=tree:0`, Git 2.56 `git repack --drop-filtered`, full `fsck` verification. (`dg-wire`, `ch9-model`)
10. `#ch10` Frontier (November 2026): Established / Demonstrated / Claimed separation covering `reftable` (Git 2.45–2.56), SHA-256 & `compatObjectFormat` status, `scalar` & cone-mode `sparseIndex`, and Git 3.0 breaking-change plans. (`dg-reftable`, `ch10-model`)
11. `#ch11` Wrap-up: 3 diagnostic questions for repo bloat, slow `status`/refs, and recovering lost commits.

## Crosscheck (tools/crosscheck.cjs, run against /opt/homebrew/bin/git 2.56.0): 58/58 agree

Run command: `node computing/software/how-git-stores-history/tools/crosscheck.cjs` (scratch repos created under `/tmp/agent-tasks/software/how-git-stores-history/`).

| Compared | Inputs | Tolerance | Result |
|---|---|---|---|
| `git --version` | host binary | exact | `git version 2.56.0` |
| `git hash-object -w` (SHA-1 & SHA-256) | empty, ASCII, UTF-8 Chinese, 120× repeated line | exact OID | 8/8 exact |
| Pure-JS zlib DEFLATE vs `zlib.inflateSync` & Git loose file | 4 payloads + `git cat-file -p` / `git fsck` reading `models.js` loose object | exact bytes | 10/10 exact |
| `git write-tree` tree sort & nested Merkle trees | `foo-bar.txt` vs `foo/` + 10-file `SAMPLE_REPO_FILES` + SHA-256 nested tree | exact OID | 3/3 exact |
| `git commit-tree` & `git mktag` | root commit, child commit, 2-parent merge commit, annotated tag | exact OID | 4/4 exact |
| `.git/index` `DIRC` v2 & Racy Git | binary header/trailer SHA-1 + same-mtime/same-size in-place edit | exact bytes & `st_size === 0` | 8/8 exact |
| `git merge-file -p` 3-way merge | disjoint, convergent identical, conflict, top insert, delete-vs-modify | exact output & conflict count | 10/10 exact |
| `git repack -ad` `.pack` v2, `.idx` v2 fanout, `OBJ_OFS_DELTA` | 40-line modified text blob packed by Git 2.56.0 | exact OID reconstruction | 12/12 exact |
| `git init --ref-format=reftable` | real reftable creation & `REFT` file header | exact | 2/2 exact |

Not crosschecked directly in `crosscheck.cjs`: network Wire Protocol v2 packet framing over SSH/HTTP and 100k-ref cold-cache filesystem latency timings (latter cited from `technical/reftable.adoc`).

## Tuned parameters (chosen for clarity, not Git constants)

- `ch3` default sample repo: 10 files (`SAMPLE_REPO_FILES`) across depth 0..2, scaled up to `N=100..5000`, `C=10..200`.
- `ch4` initial DAG: 4 commits (`C0 -> C1 -> C2` on `main`, `C1 -> F1` on `feat`).
- `ch5` index lab: `N=2000`, `mod=3`, `touch=5`, 6 representative inspector rows.
- `ch6` reflog lab: 5 main commits (`C1..C5`) + 1 detached commit (`D1`, 15d initial age) + tag `v1.0` on `C2`; default `gc.reflogExpireUnreachable = 30` days (matching Git's real default).
- `ch8` pack lab: 10 revisions (5 of `src/engine.js`, 5 of `README.md`), default sliding window `W=4`, chunk length `K=8` bytes for delta matching on small educational payloads (Git's C `diff-delta.c` uses 16-byte Rabin chunks).
- `ch9` clone lab: 200 commits, 25 source files, 12 MiB per binary asset revision.
- `ch10` frontier lab: `N = 10^3..10^6` refs anchored to `technical/reftable.adoc`'s 866k Android benchmark; sparse-index model of 100,000 files across 20 top-level dirs.

## Facts that will go stale (Frontier #ch10, November 2026)

- **Git 2.56.0** release date (28 September 2026, checked via Homebrew cellar timestamps and LWN `[ANNOUNCE] Git v2.56.0` on 2026-11-21) and `RelNotes/2.56.0.adoc` features (`git add --resolved`, `git repack --drop-filtered`, `git refs create/delete/update/rename`, `odb_source`, deferred loose-object map loading).
- **`reftable` adoption & Git 3.0 roadmap** (`BreakingChanges.adoc`, `RelNotes/2.51.0.adoc`, `RelNotes/2.56.0.adoc`, opened 2026-11-21): `reftable` slated as Git 3.0 default alongside `sha256`, `main` branch, and mandatory Rust (following Git 2.55 default-enabling Rust in builds); Git 3.0 still has no release date as of November 2026.
- **`compatObjectFormat` status** (`RelNotes/2.52.0.adoc` line 246, opened 2026-11-21): explicitly documented as incomplete / developer-only.

## Checked / not checked

- Checked: `tools/diagrams.cjs`, `build-pages.cjs`, `build-pages.cjs --print-budgets` (all SVG labels <= 86% budget), `tools/crosscheck.cjs` (58/58 vs Git 2.56.0), `tests/models.cjs`, and zero alias/ID collisions across all 11,465 existing terms and 923 existing concept IDs.
- Not checked by builder (deferred to coordinator serial Playwright pass): `tests/browser.cjs` and `tests/canvas-text-overlap.cjs --sweep` (forbidden to run Chromium in parallel builder per instructions).
