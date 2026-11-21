---
lang: en
title: How Git Stores All History · A Hands-on Essay
desc: Every time you run git add and git commit, Git does not store a stack of patches inside .git/—it writes an entire directory snapshot as immutable, content-addressed objects. Following Git 2.56.0 byte formats and primary documentation, this essay traces one commit all the way down: the .git/ map, blob headers and SHA-1/SHA-256, binary tree sorting and subtree sharing, the commit DAG, the index stat cache and Racy Git, refs, HEAD and reflog reachability, Myers diff and 3-way merge, packfile COPY/INSERT delta opcodes and fanout indices, wire protocol v2 and partial clones, and the reftable/SHA-256/sparse-index frontier. Nine hands-on models run the real algorithms rewritten in the page and crosschecked item by item against git 2.56.0.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.us: {v} µs
u.days: {v} days
u.files: {v} files
u.revs: {v} versions
:::

# How Git Stores All History {#hero}

::: strings
kicker: Computing · Software principles · A hands-on long essay
:::

Every time you run `git commit`, Git stores a complete snapshot of your entire project.<br>If every commit saves a full snapshot, why does disk usage not explode—and what actually changes when you amend or undo history? {.sub}

Most people instinctively picture Git as a chronological chain of "code patches"—each commit recording only the handful of lines changed since the last one. Open `.git/` once and you discover the exact opposite: **at its core, Git is not a diff-patch tool at all, but an immutable, content-addressed object database paired with a few mutable pointer files**. This essay asks one question: **what bytes does Git actually write into `.git/` when you run `git add` and `git commit`, why can those snapshots compare in milliseconds without blowing up disk space, and how can `git reflog` resurrect commits erased by `git reset --hard`?** {.lead}

All byte layouts, algorithms, and frontier status notes here match **Git 2.56.0** (`/opt/homebrew/bin/git`, released 28 September 2026) and its shipped primary documentation (`gitformat-loose`, `gitformat-index`, `gitformat-pack`, `reftable`, `racy-git`, `BreakingChanges`). The page runs no external libraries: nine interactive models rewrite SHA-1, SHA-256, zlib DEFLATE compression, binary tree encoding, Myers diff, 3-way merge, and packfile delta opcodes from scratch in `models.js`, while `tools/crosscheck.cjs` checks 58 outputs directly against real `git 2.56.0` on disk and agrees on all 58. For background, see [[a-secret-in-public#ch6|A Secret Agreed in Public, Chapter 6]] (cryptographic hashes and avalanche) and [[graph-algorithms#step0|Graph Algorithms]] (graphs and traversal). This essay was written with an AI; the last paragraph of each chapter states what the model leaves out. {.note}

## A map of `.git/`: the four regions {#ch1}

::: strings
toc: Four regions of .git/
:::

When you run `git add` and `git commit`, data flows through the working tree, the staging index (`.git/index`), and the object store (`.git/objects/`); all that moves at the very end is a 41-byte pointer file (`HEAD` and `refs/heads/`). {.law}

Suppose you initialize an empty folder, create `hello.txt`, and run the four commands below. In the terminal you see only a two-line summary, yet on disk Git divides the repository into four cleanly separated regions.

::: html ch1-code
code.aria: Minimal Git repository initialization and commit sequence
code: "$ git init -b main\n$ printf 'hello git\\n' > hello.txt\n$ git add hello.txt\n$ git commit -m \"init\""
:::

The first region is the **Working Tree**—ordinary files and directories on disk, with zero history inside them. The second is the binary file `.git/index` (**the staging area / dircache**), holding the sorted manifest for the next snapshot together with each file's OS `stat` fingerprint. The third is `.git/objects/` (**the object database**): every committed file payload, directory snapshot, commit record, and annotated tag written here is immutable and addressed solely by the cryptographic hash of its bytes. The fourth consists of `HEAD` and `.git/refs/`, which store no project data at all—only **rewritable sticky notes** pointing to commits.

::: diagram dg-gitmap keys=dg.gitmap
cap: Figure 1. The four regions of a Git repository. From top to bottom, `git add` hashes working files into objects and updates the index; `git commit` writes tree and commit objects and advances the branch pointer.
aria: Diagram: four layers — Working Tree, .git/index, .git/objects/, and HEAD/refs — with command flows between them
l1: Working Tree
l1s: Plain files and folders on disk
l2: Staging Index (.git/index)
l2s: Next snapshot manifest and stat cache
l3: Object Store (.git/objects/)
l3s: Immutable blobs, trees, commits, tags
l4: References (HEAD & refs/)
l4s: Mutable 41-byte branch pointer files
x1: "git add: write blob + index"
x2: "git commit: write tree & commit"
x3: Move branch pointer forward
:::

Once those four regions are clear, several quirks of Git make immediate sense. Why does a modified file already leave an object in `.git/objects/` right after `git add` before you even commit? Because `git add` already wrote the blob to the object store. Why does switching branches (`git checkout` / `git switch`) across thousands of files finish in milliseconds? Because Git only swaps working-tree paths whose hash differs from the target tree, without copying history. The next nine chapters trace every layer down from top to bottom.

This chapter draws only the boundaries. The same objects on disk can live either as loose files or inside packed archives (chapter 8), and refs can use prefix-compressed binary tables instead of small text files (chapter 10). {.take}

## Blobs & content addressing: from bytes to shard path {#ch2}

::: strings
toc: Blobs & content addressing
:::

Git never stores files by name: it prepends `&lt;type&gt; &lt;size&gt;\0` to raw bytes, hashes the whole buffer with SHA-1 or SHA-256, and writes the zlib-compressed result under `.git/objects/&lt;first-two-hex&gt;/`. {.law}

Drop two files with completely different names but identical bytes into the same repository and `.git/objects/` stores only **one** file object—a **blob** (binary large object). A blob carries no filename, no timestamp, and no permissions: nothing but raw content bytes.

Specifically, when you run `git add` on `hello.txt` containing `hello git\n` (10 bytes), Git constructs the exact ASCII prefix `blob 10\0` and appends those 10 bytes, forming an {=ch2.helloRaw}-byte buffer. It hashes those {=ch2.helloRaw} bytes: in a default SHA-1 repository the first 8 hex digits are always `{=ch2.helloOid}` (40 hex chars / 20 bytes total), while in an `--object-format=sha256` repository the first 12 hex digits are `{=ch2.hello256}` (64 hex chars / 32 bytes total). In parallel, **zlib** (RFC 1950/1951 DEFLATE) compresses those {=ch2.helloRaw} bytes and stores them at `.git/objects/{=ch2.helloShard}/...`. Why split the first two hex characters into up to 256 subdirectories? Because older filesystems (such as ext3 or HFS+) slow down markedly when hundreds of thousands of files sit in a single directory.

::: diagram dg-blob keys=dg.blob
cap: Figure 2. How a loose blob object is built: `hello git\n` gets an ASCII header to reach {=ch2.helloRaw} bytes, is hashed for its address, compressed with zlib, and sharded into `.git/objects/`.
aria: Diagram: raw bytes gain a blob header, then split into hashing for the OID and zlib deflation, converging into the two-character shard path
in: Raw file bytes
inv: "hello git\\n (10 B)"
prep: prepend header
hdr: Uncompressed object (18 B)
hdrv: "blob 10\\0hello git\\n"
hash: SHA-1 / SHA-256
oid: 8d0e4123...
zlib: zlib deflate
zsz: 26 B compressed
path: Disk path (2-hex shard)
pathv: .git/objects/8d/0e4123...
:::

Type your own bytes into the lab below. Watch how flipping even **one single bit** in byte 0 flips roughly half of the output hash bits ([[a-secret-in-public#ch6|the avalanche effect]]) and lands the object in an entirely different shard folder—the foundation for Git guaranteeing bit-level integrity from a short hex ID.

::: lab ch2-model
model.title: Build a Git Blob Object Byte by Byte
model.how: Edit the text below, switch between SHA-1 and SHA-256, or tick "Flip 1 bit". The upper strip shows the exact <code>blob &lt;size&gt;\0&lt;content&gt;</code> header bytes; the lower grid compares every bit of the hash before and after flipping 1 bit.
ctl.text: File bytes
ctl.algo: Hash format
ctl.nl: Append trailing \n
ctl.flip: Flip 1 bit (byte 0, bit 0)
cv.aria: Upper byte strip showing the blob header and payload; lower bit grid comparing original and 1-bit-flipped object hashes
cv.hdr: hdr
cv.pay: payload
cv.orig: Original hash bits
cv.flip: Flipped (cyan=same, gold=diff)
cv.bits: "{diff}/{bits} bits flipped"
read.oid: Object ID (first 16 hex)
read.path: .git/objects/ shard path
read.raw: Header + payload bytes
read.zlib: zlib compressed bytes
say.base: With header prepended, total uncompressed size is {raw} bytes, compressed to {zlib} bytes by our pure-JS DEFLATE/zlib encoder; the leading two {algo} hex digits <code>{shard}</code> place it at <code>{path}</code>.
say.flip: Flipping just bit 0 of byte 0 inverted <em>{diff} of {bits} hash bits ({pct})</em> and jumped the shard directory from <code>{s0}</code> to <code>{s1}</code>—even a 1-bit difference never shares an object path.
:::

Note that the lab's `zlib` byte count comes from a pure-JS RFC 1951 fixed-Huffman DEFLATE encoder rewritten in `models.js`, which uses a few more bytes than native C zlib's dynamic Huffman tables on tiny strings; `tools/crosscheck.cjs` verifies that Node's `zlib.inflateSync` and real `git cat-file -p` decode its output byte-for-byte with identical SHA-1 and SHA-256 OIDs. Even an empty file (`0` bytes) gets `blob 0\0` prepended, and an empty tree (`tree 0\0`) in SHA-256 always hashes to `{=ch2.emptyTree256}...`.

The model leaves out: `core.compression` level tuning, symlinks (`120000`), and executable bit metadata (blobs never store permissions—that lives in the `tree` objects of the next chapter). {.take}

## Trees & directory snapshots: why full snapshots stay small {#ch3}

::: strings
toc: Trees & directory snapshots
:::

Git encodes directories as `tree` objects containing sorted `&lt;mode&gt; &lt;name&gt;\0&lt;20/32-byte raw hash&gt;` entries; editing one file creates new trees only along the path back to the root while reusing every unchanged file and subtree by hash. {.law}

Because blobs contain neither filenames nor folder structure, Git needs a second object type to capture directories: the **tree**. Each folder becomes a compact binary record listing its immediate children: ASCII file mode (`100644` for regular files, `100755` for executables, `40000` for subdirectories—stored **without** a leading zero inside raw tree bytes, even though `git ls-tree` prints `040000`), an ASCII space, the entry name, a `\0` NUL byte, and immediately the **raw 20-byte (or 32-byte) binary hash** rather than 40 hex characters.

Tree entry sorting hides a subtle rule verified in `tools/crosscheck.cjs`: Git compares directory entries as if a trailing `'/'` (`0x2F`) were appended to every subdirectory name. If a directory contains both a file named `foo-bar.txt` and a subfolder named `foo`, `foo-bar.txt` sorts **before** `foo` because `'-'` (ASCII 45) is less than `'/'` (ASCII 47).

::: diagram dg-tree keys=dg.tree
cap: Figure 3. Top: binary layout of one tree entry. Bottom: when only README changes between two commits, the new root tree points straight to the existing `src/` subtree hash without copying a single byte inside it.
aria: Diagram: binary mode, name, and raw OID fields of a tree entry, plus structural sharing of an unchanged subtree across two commits
fmt: Binary layout of one tree entry
mode: "100644"
name: "hello.txt\\0"
oid: 20 B raw hash
t1: Commit 1 root
t2: Commit 2 root
b1: README v1
b2: README v2 (new)
shared: src/ subtree (reused)
:::

This is how Git saves "a complete snapshot on every commit" without multiplying disk usage. In a repository with $N$ files and tree depth $d$, modifying 1 file writes only **1 new blob plus $d+1$ new tree objects** along the ancestor path from that file to the root. Across 50 single-file commits in a 1,000-file repository, naive full-copy snapshots would accumulate {=ch3.naive50} file copies, whereas Git's Merkle tree stores only {=ch3.git50} blobs.

::: lab ch3-model
model.title: Structural Sharing: Editing One File Touches Only One Branch
model.how: Pick which file to modify (top-level <code>README.md</code>, depth-1 <code>src/index.js</code>, or depth-2 <code>src/core/hash.js</code>), then vary file count <code>N</code> and commit count <code>C</code>. Left: our 10-file sample repo showing newly minted objects in gold and reused objects in green. Right: cumulative blobs across commits compared to naive copies.
ctl.edit: File edited
ctl.n: Files in repo N
ctl.c: Commits C
cv.aria: Left side shows Merkle tree structural sharing across the sample repository; right side plots naive vs Git blob counts over commits
cv.tree: Sample repo sharing
cv.new: new
cv.shr: reused
cv.x: Commits C
cv.y: Cumulative blobs
cv.naive: Naive copy
cv.git: Git snapshot
read.new: New objects this commit
read.shr: Unchanged objects reused
read.naive: Naive full-copy blobs
read.git: Git Merkle-tree blobs
say: Editing <code>{path}</code> (depth {depth}) mints only <em>{new}</em> new objects (1 blob + {trees} trees) out of {total}, reusing all {shr} other objects by hash. Over {c} commits on {n} files, Git stores <em>{git}</em> blobs instead of {naive} (saving {save}).
:::

Switch the edited path from depth-2 `src/core/hash.js` to root `README.md`: newly created objects drop from {=ch3.treeNew} down to 2 (1 blob + 1 root tree), while `docs/`, `src/`, and `tests/` sit completely untouched, reusing {=ch3.treeShared} of {=ch3.treeTotal} objects. One decisive consequence follows: **every tree's hash depends transitively on every single byte beneath it**. Any edit anywhere changes every ancestor tree hash up to the root; conversely, if two commits share the same root tree OID, Git knows in $O(1)$ time that their entire working trees are byte-for-byte identical.

The model leaves out: cross-directory rename detection (Git never records moves inside trees; `diff` infers renames heuristically from blob similarity) and packfile compression (chapter 8). {.take}

## Commits & the DAG: why history is rewritten by copying, never mutating {#ch4}

::: strings
toc: Commits & the DAG
:::

A `commit` object is a tiny plain-text block naming a root `tree`, zero or more `parent` hashes, author/committer timestamps, and a message; because hashes lock down every `parent` pointer, `amend` and `rebase` never edit old commits in place—they mint fresh commits and move branch labels. {.law}

Trees freeze the filesystem at one instant, yet they carry no timeline. What links snapshots into history is the third object type: **commit**. Inspect any commit with `git cat-file -p HEAD` and you see only plain ASCII lines:
- `tree &lt;oid&gt;`: the root directory snapshot for this revision; {#f1}
- `parent &lt;oid&gt;`: zero lines for a root commit, one for a normal commit, two or more for a merge commit; {#f2}
- `author` and `committer`: name, email, Unix timestamp, timezone offset; {#f3}
- a blank line followed by the commit message. {#f4}

Connecting every commit to its `parent` pointers yields an immutable **directed acyclic graph (DAG)** (see [[graph-algorithms#step0|Graph Algorithms]]). Changing a single character in an older commit—even shifting its timestamp by 1 second—changes its hash, which invalidates the `parent` hash stored inside every descendant commit.

::: diagram dg-dag keys=dg.dag
cap: Figure 4. Top: plain-text body of a commit object. Bottom: `git commit --amend` leaves old commit `C2` completely untouched inside `.git/objects/` while writing a brand-new commit `C2'` with the same parent `C1`.
aria: Diagram: commit object payload (tree, parent, author, committer, message) and DAG showing C2' created alongside orphaned C2 during amend
ct: "tree 07ed5a7..."
cp: "parent d60f514..."
ca: "author Ada ... 1700000000"
cm: Commit message body
old: orphaned
ptr: main
:::

That is why "rewriting history" (`git commit --amend`, `git rebase`) **never overwrites existing objects**. In our default graph, `C0` hashes to `{=ch4.c0Oid}` and `C2` hashes to `{=ch4.c2Oid}`; running `amend` computes a brand-new commit `{=ch4.c2pOid}` pointing back to `C1` and moves `main` over to it, while `{=ch4.c2Oid}` stays intact in `.git/objects/`. Try stepping through the graph operations below.

::: lab ch4-model
model.title: Rewriting History on an Immutable Commit DAG
model.how: Click <code>commit</code>, <code>amend</code>, <code>rebase</code>, or <code>merge</code> to watch the DAG and the live <code>HEAD</code> commit byte payload update. Dashed red circles mark older commits left behind in <code>.git/objects/</code> after branch pointers move.
ctl.hint: Action
btn.commit: commit (main)
btn.amend: amend HEAD
btn.rebase: rebase feat → main
btn.merge: merge feat → main
btn.reset: Reset DAG
cv.aria: Commit DAG highlighting branch-reachable nodes and orphaned commits left in the object store after amend or rebase
cv.reach: Reachable
cv.orph: Orphaned
read.head: Current HEAD OID
read.total: Commits in object store
read.orph: Unreferenced old commits
read.sz: HEAD commit object bytes
pay.aria: Raw bytes of the current HEAD commit object
ev.init: Initial graph: two branches diverge from C1 with zero orphaned commits.
ev.commit-main: New commit on main: appends a child node pointing back to the previous tip.
ev.amend-main: Amend executed: the old tip stays intact in .git/objects/, while main jumps to a newly hashed commit sharing the same parent.
ev.rebase-feat: Rebase executed: feat commits are replayed onto main's tip with fresh OIDs; the old feat chain is now unreferenced by branches.
ev.merge-feat: Merge executed: a new commit lists two parent hashes, joining both lines without stranding any node.
say: {ev} Total commits in the object store: {total}, of which <em>{orph}</em> are no longer reachable from any branch (chapter 6 shows how reflog keeps them safe).
:::

This explains the golden rule against rebasing already-shared branches: you never "deleted" the commits your teammates pulled—you minted a parallel chain of **identical-looking commits with completely different hashes**.

The model leaves out: optional `gpgsig` signature headers (which also enter the commit hash), separating `author` vs `committer` timestamps during rebase, and octopus merges with three or more parents. {.take}

## The Index (staging area): how `git status` skips hashing clean files {#ch5}

::: strings
toc: The Index & stat cache
:::

`.git/index` pairs the staged tree manifest with each file's OS `lstat(2)` metadata cache; `git status` skips reading and hashing any file whose timestamps, inode, and size still match—while a subtle "Racy Git" guard forces re-hashing if edits land within the same timestamp tick as the index file. {.law}

In a repository with 20,000 files, editing 3 files and running `git status` finishes in tens of milliseconds. If Git actually read and hashed all 20,000 files from disk on every `status`, interactive work would stall. The shortcut lives inside `.git/index`.

As documented in `gitformat-index`, `.git/index` opens with a 12-byte header (`DIRC` signature for Directory Cache, format version 2/3/4, and entry count), followed by path-sorted entries, optional extensions such as `TREE`, and a trailing full-file hash checksum. Crucially, **every index entry stores both the staged object ID and the filesystem `lstat(2)` tuple collected when that entry was written**: `ctime`, `mtime`, `dev`, `ino`, `uid`, `gid`, and 32-bit `size`.

::: diagram dg-index keys=dg.index
cap: Figure 5. `.git/index` v2 layout and `ce_match_stat()`: Git checks OS `stat` fields first and only opens and hashes files whose metadata changed or whose timestamp equals the index file itself.
aria: Diagram: index DIRC header, sorted entries holding stat metadata plus OID, TREE extension, and the lstat hit vs miss branches
sig: "DIRC (4 B)"
ver: "v2 (4 B)"
cnt: "count (4 B)"
ent: Sorted entries (byte order)
stat: "ctime mtime ino size"
oid: "mode OID flags path"
ext: "TREE ext + checksum"
chk: "lstat(2) check"
hit: match: skip read
miss: miss: rehash
:::

In our default 2,000-file repository with 3 modified files and 5 `touch`-ed files, `.git/index` takes roughly {=ch5.idxBytes}, and `git status` skips reading {=ch5.idxSkip} clean files altogether. Yet `technical/racy-git.adoc` documents a classic edge case called **Racy Git**. Suppose you run `git add foo` and then overwrite `foo` in place **within the same filesystem timestamp tick** without changing its byte length. Both `mtime` and `size` match `.git/index`! To prevent silent missed edits, Git's `ce_match_stat()` refuses to trust any clean `stat` match whose `file.mtime &gt;= index.mtime` (**racily clean**), forcing a full content read; even better, when writing a new `.git/index`, **Git zeroes out cached `st_size` (`0`) on racily clean entries** so future runs keep verifying content (verified directly against `git 2.56.0` in `tools/crosscheck.cjs`).

::: lab ch5-model
model.title: Index Stat Cache & the Racy-Git Guard
model.how: Vary tracked files, truly modified files, and <code>mtime</code>-only touched files, then toggle "Trigger Racy Git" (in-place same-size edit within the index timestamp tick) to see cache hit rates and how <code>src/racy.cfg</code> gets its cached size zeroed to <code>0</code>.
ctl.n: Tracked files
ctl.mod: Modified content & size
ctl.touch: Touched mtime only
ctl.racy: Trigger Racy Git (same tick, same size)
cv.aria: Top table of six sample file stat checks including Racy Git truncation; bottom bar chart of skipped vs re-hashed files
cv.col1: Path
cv.col2: Idx size
cv.col3: Action
cv.skip: skip read
cv.stat: stat miss: rehash
cv.racy: racy=0: rehash
cv.barS: Skipped
cv.barH: Hashed
read.skip: Skipped via stat cache
read.hash: Read & re-hashed
read.racy: Racy-clean forced checks
read.idx: Estimated .git/index size
say.norm: Across {n} files, <code>lstat(2)</code> cleared <em>{skip}</em> clean entries ({pct} zero content reads), hashing only the {mod} edited and {touch} timestamp-bumped files.
say.racy: With Racy Git active, <code>src/racy.cfg</code> has <code>mtime ≥ .git/index mtime</code> and identical size: Git distrusts the cache, truncates cached <code>st_size</code> to <em>0</em>, and forces {racy} content checks so the edit cannot slip past.
:::

Now you know what `git update-index --refresh` does: after a build tool `touch`es timestamps without changing bytes, refreshing re-hashes those files once and stamps the new `mtime` into `.git/index`. Meanwhile, the `TREE` cache-tree extension caches ready-made `tree` hashes for untouched folders so `git commit` can skip rebuilding them too.

The model leaves out: `fsmonitor` filesystem-watcher hooks (avoiding even `lstat` calls on large trees), index v4 path-prefix compression, and multi-stage `1/2/3` conflict entries during merges. {.take}

## Refs, branches, tags, `HEAD` & reflog: how `reset --hard` stays recoverable {#ch6}

::: strings
toc: Refs, HEAD & reflog
:::

A Git branch is not a folder of commits—it is a {=ch6.branchBytes}-byte pointer file under `.git/refs/heads/`; `git reset --hard` moves only those bytes, while `.git/logs/HEAD` shields unreferenced commits from `git gc` until the reflog expires. {.law}

In the classic `files` backend, creating a branch allocates almost nothing: `git branch feat` writes 40 hex digits plus a newline—literally **{=ch6.branchBytes} bytes** (65 bytes in SHA-256)—to `.git/refs/heads/feat`. Which branch is active sits in `.git/HEAD` as **{=ch6.headBytes} bytes** of text: `ref: refs/heads/main\n`. Run `git checkout &lt;oid&gt;` to enter **detached HEAD**, and `.git/HEAD` simply swaps that `ref:` line for the 40-hex commit ID directly.

Tags live alongside branches: a lightweight tag is another 41-byte file under `.git/refs/tags/`, whereas an annotated tag (`git tag -a v1.0 -m ...`) writes the fourth Git object type (`tag`) into `.git/objects/`—cryptographically binding target OID, object type, tag name, tagger timestamp, and message—and points the tag ref at that tag object.

::: diagram dg-refs keys=dg.refs
cap: Figure 6. Branches and tags are lightweight pointers into `.git/objects/`. After `git reset --hard` moves `main` back to `C3`, `C4` falls off the branch graph yet remains pinned alive by `.git/logs/HEAD`.
aria: Diagram: HEAD pointing to refs/heads/main pointing to C3, tags/v1.0 pointing to C2, and logs/HEAD keeping orphaned C4 alive
head: HEAD
branch: refs/heads/main
tag: tags/v1.0 → C2
log: .git/logs/HEAD (reflog)
logs: pins C4 until reflog expires
:::

This explains the everyday rescue miracle: you run `git reset --hard HEAD~2`, recent commits vanish from `git log`, working files revert—yet `git reflog` brings everything back in seconds. Every time `HEAD` or a branch moves locally, Git appends an audit line to `.git/logs/HEAD` and `.git/logs/refs/heads/...` recording the old OID, new OID, timestamp, and command reason. When garbage collection (`git gc`) traces **reachability**, it treats **every active branch, tag, `HEAD`, AND every unexpired `reflog` entry** as a GC root.

::: lab ch6-model
model.title: Reachability, Reflog Expiry & Garbage Collection
model.how: Toggle <code>git reset --hard HEAD~2</code>, advance the clock in days, adjust <code>gc.reflogExpireUnreachable</code> (default 30 days), and toggle <code>git gc --prune=now</code> to watch commits move from reachable (green) to reflog-protected (gold), dangling (violet), and pruned (red).
ctl.reset: Run git reset --hard HEAD~2 (rewind main to C3)
ctl.days: Days elapsed
ctl.exp: Unreachable reflog expiry
ctl.gc: Run git gc --prune=now
cv.aria: Reachability state diagram of commits C1–C5, detached D1, and tag v1.0 across refs, reflog, and gc
cv.reach: Reachable
cv.reflog: Reflog
cv.dang: Dangling
cv.pruned: Pruned
cv.exp: Expiry
read.reach: Reachable from refs
read.reflog: Protected by reflog only
read.dang: Dangling (eligible for gc)
read.pruned: Pruned from object store
say.safe: Branches and tags reach {reach} commits directly; zero commits are stranded.
say.saved: <code>main</code> was reset (or detached), yet {days} days is under the <em>{exp}-day</em> limit: <code>logs/HEAD</code> still anchors {reflog} commits so <code>git reset</code> recovers them instantly.
say.dangling: After {days} days past the {exp}-day reflog expiry, {dang} commits become truly dangling, though they sit on disk until <code>git gc</code> runs.
say.pruned: <code>git gc --prune=now</code> reclaimed {pruned} expired unreachable commits along with their exclusive trees and blobs.
:::

Two practical numbers to keep straight: reflog entries still reachable from the current branch expire after **90 days** (`gc.reflogExpire`), while unreachable entries created by `reset` or detached `HEAD` expire after **30 days** (`gc.reflogExpireUnreachable`). And remember: `reflog` is strictly **local**—it is never pushed or fetched across remotes.

The model leaves out: Git's default two-week grace period for newly written loose objects (`gc.pruneExpire = 2.weeks.ago`) protecting concurrent processes; toggling `gc` here simulates `--prune=now`. {.take}

## Diff & 3-way merge: computing line edits from snapshots {#ch7}

::: strings
toc: Diff & 3-way merge
:::

Because commits store independent snapshots rather than patches, `git diff` computes Eugene Myers's shortest edit script on the fly; `git merge` finds the lowest common ancestor `B` on the commit DAG and aligns `diff(B, Ours)` against `diff(B, Theirs)`. {.law}

If Git stores full snapshots instead of line diffs, how does `git diff` pinpoint inserted and deleted lines? **Store snapshots; compute diffs lazily when asked.** To compare two commits, Git walks their root trees side by side, skipping entire subtrees whenever their OIDs match, and runs a line diff only on pairs of differing blobs.

Git's default line diff uses Eugene Myers's 1986 shortest-edit-script algorithm: lay old lines $0..N$ across $x$ and new lines $0..M$ down $y$, and find a minimum-cost path from $(0,0)$ to $(N,M)$ where stepping right deletes an old line, stepping down inserts a new line, and matching lines let you slide diagonally for free. Searching outward by edit distance $d = 0, 1, 2 \dots$ runs in $O((N+M)D)$ time—proportional to actual edits $D$ rather than total file size.

::: diagram dg-merge keys=dg.merge
cap: Figure 7. Three-way merge needs the lowest common ancestor `B` (merge base) on the commit DAG: comparing `Ours` and `Theirs` alone cannot tell which side changed a differing line.
aria: Diagram: base ancestor B branching to Ours O and Theirs T, merging into M, and conflict markers when edits collide
base: Merge Base B (LCA)
ours: Ours (O)
theirs: Theirs (T)
out: Merge Result (M)
rule: Conflicting edits against B emit:
cfl: "<<<<<<< / ======= / >>>>>>> markers"
:::

During `git merge`, comparing `Ours` directly with `Theirs` is ambiguous: if `Ours` says `port = 8080` and `Theirs` says `port = 3000`, without `Base` no tool knows who changed it or whether both did. So Git's `ort` merge engine (default since Git 2.34) first locates the **merge base `B`** (Lowest Common Ancestor) on the commit DAG and runs both `diff(B, Ours)` and `diff(B, Theirs)`:
- edits touching disjoint spans of `B` merge cleanly; {#m1}
- identical edits by both sides (convergent changes) collapse cleanly into one copy; {#m2}
- different edits overlapping the same span of `B`—including deleting a line one side modified—emit `&lt;&lt;&lt;&lt;&lt;&lt;&lt;`, `=======`, `&gt;&gt;&gt;&gt;&gt;&gt;&gt;` markers. In Git 2.56.0, `git add --resolved` specifically stages only resolved unmerged paths and aborts if any leftover conflict markers remain inside them. {#m3}

::: lab ch7-model
model.title: Myers Edit Graph & 3-Way Line Merge
model.how: Switch between four merge scenarios (disjoint clean edits, identical convergent edits, same-line conflict, delete vs modify) and slide the Myers step <code>d</code> to watch the edit-graph frontier find the shortest path on the left while live 3-way merge output updates below.
ctl.case: Merge scenario
case.clean: Disjoint edits
case.same: Identical edits
case.conflict: Same-line conflict
case.delmod: Delete vs modify
ctl.step: Myers search step d
cv.aria: Left: Myers edit graph grid and shortest path from Base to Ours; Right: aligned Base, Ours, and Theirs lines
cv.grid: Myers edit graph (Base → Ours)
cv.merge: 3-way line view
cv.step: "step d = {d}"
read.do: Edit distance B → Ours
read.dt: Edit distance B → Theirs
read.hunks: Changed regions
read.conf: Conflicts
out.aria: Exact merged output text
say.clean: <code>Ours</code> and <code>Theirs</code> modified non-overlapping spans of <code>Base</code>: Git merges both changes cleanly with zero conflicts.
say.same: Both branches edited the exact same span to identical lines (convergent edit): after checking <code>Base</code>, Git resolves it with <em>0</em> conflicts.
say.conflict: Both <code>Ours</code> (D={do}) and <code>Theirs</code> (D={dt}) rewrote the same base lines differently, emitting conflict markers across the overlap.
say.delmod: One side deleted a line while the other side modified it: the two hunks overlap on <code>Base</code>, raising <em>{conf}</em> conflict.
:::

One famous subtlety: in a "criss-cross merge" history, two branches can share two incomparable merge bases. Git's `ort` backend recursively merges those merge bases into a virtual common ancestor first before computing the final 3-way merge.

The model leaves out: `patience`/`histogram` diff options, similarity-based file/directory rename detection, and recursive virtual merge-base synthesis for criss-cross histories. {.take}

## Packfiles & delta compression: inside `.pack` and `.idx` {#ch8}

::: strings
toc: Packfiles & delta compression
:::

Git defers delta compression until packing: `pack-objects` sorts objects by `(type, path hash, descending size)`, scans a sliding window to express older versions as `COPY`/`INSERT` byte scripts pointing backward to newer bases, and writes a 256-bucket fanout `.idx` for fast lookup. {.law}

If a 100 KB source file changes two lines a day across 200 commits, storing 200 separate zlib-compressed loose blobs would waste megabytes. Git fixes this during `git gc`, `git repack -ad`, or network transfer by packing objects into `.git/objects/pack/pack-*.pack` paired with `pack-*.idx` (plus reverse-index `pack-*.rev` by default since Git 2.40).

Only here does **delta compression** appear—and `technical/pack-heuristics.adoc` records its deliberately counter-intuitive sort order:
1. **Object type** (commits, trees, blobs, and tags never delta against different types); {#h1}
2. **Filename and directory path hash** (clustering revisions of the same path side by side); {#h2}
3. **Descending uncompressed size** (keeping the **newest, usually largest** version intact as a full base object so latest checkouts read straight through with zero delta replay, while older revisions store backward `OFS_DELTA` pointers!). {#h3}

::: diagram dg-pack keys=dg.pack
cap: Figure 8. `.pack` v2 uses variable-length headers, negative `OFS_DELTA` offsets, and `COPY`/`INSERT` delta opcodes; `.idx` v2 jumps straight into sorted OIDs via a 256-entry first-byte fanout table.
aria: Diagram: .pack v2 header and entry structure, COPY/INSERT delta bytecode instructions, and .idx v2 256-bucket fanout lookup
phdr: .pack (v2) header & object entries
pmag: PACK v2
pobj: type+size
pofs: OFS_DELTA
dtitle: Delta bytecode stream (base → target)
copy: COPY off,len
ins: INSERT bytes
idx: .idx (v2) fast lookup
fan: 256 fanout
oids: sorted OID
off: offset
:::

To reconstruct a target object from its base, Git's delta stream executes only two byte opcodes: **`COPY`** (MSB = `1`, encoding little-endian offset and byte length masks to copy slices straight out of the base buffer) and **`INSERT`** (MSB = `0`, appending 1–127 literal new bytes). To locate any object inside a multi-gigabyte packfile without scanning it, `.idx` v2 begins with a **256-entry fanout table** where `fanout[b]` stores how many packed OIDs begin with byte `&lt;= b`. Looking up `8d0e41...` reads `fanout[0x8c]` and `fanout[0x8d]`, immediately narrowing binary search to ~1/256 of the sorted OID table before jumping straight to its CRC32 and pack offset.

::: lab ch8-model
model.title: Sliding-Window Delta Packing & .idx Fanout Lookup
model.how: Vary sliding window <code>W</code>, toggle the type/path/size sorting heuristic (off falls back to OID order), and select any object slot in <code>.idx</code>. Top-left compares loose vs packed bytes; top-right breaks down the real <code>COPY</code>/<code>INSERT</code> delta stream; bottom traces the 256-bucket fanout probe.
ctl.win: Sliding window W
ctl.sort: Sort by (type, path, descending size)
ctl.slot: Query object slot in .idx
cv.aria: Loose vs packed size bars, COPY and INSERT delta byte breakdown, and 256-entry .idx v2 fanout table lookup
cv.loose: Loose
cv.pack: Packed
cv.copy: COPY
cv.ins: INSERT
cv.fan: ".idx 256-bucket fanout (0x{fb})"
sort.on: heuristic sort enabled
sort.off: unsorted OID order
read.loose: 10 loose blobs total
read.pack: .pack total bytes
read.save: Compression savings
read.probe: Fanout slice / search steps
say: With window <code>W={win}</code> and {sortMode}, 10 revisions shrank from {loose} to <em>{pack}</em> ({save} saved across {deltas} <code>OFS_DELTA</code> entries), reconstructing one target from <em>{copyB} B</em> copied and {insB} B inserted. In <code>.idx</code>, byte <code>0x{fb}</code> narrowed 10 entries to {span} in {steps} binary-search steps (offset {off} B).
:::

Uncheck the sorting heuristic while keeping `W=4`: sorting objects by their nearly random hashes scatters versions of `engine.js` apart, delta matches collapse, and `.pack` size immediately jumps back toward loose storage. At default `W=4` with sorting enabled, 10 revisions shrink from {=ch8.looseTot} down to {=ch8.packTot} (a {=ch8.packSave} reduction). That 2006 sorting heuristic is why Git needs no per-commit delta book-keeping yet rivals dedicated delta stores once packed.

The model leaves out: 8-byte large-offset extension tables for packs exceeding 2 GiB, delta chain depth limits (`--depth=50` default), and `multi-pack-index` (MIDX) spanning multiple packfiles. {.take}

## Network transport, partial clones & `git fsck` {#ch9}

::: strings
toc: Transport, partial clones & fsck
:::

Wire Protocol v2 negotiates missing commits via `ls-refs` and `have`/`want` exchanges before streaming a thin packfile; shallow clones truncate the commit graph, while partial clones (`--filter=blob:none`) pull the full commit and tree topology while fetching heavy blobs on demand. {.law}

When you `git fetch` or `git clone`, Git never compares raw object lists file by file. Because every commit hash summarizes its entire tree and ancestry:
1. Under **Wire Protocol v2** (`gitprotocol-v2`), the client starts with `command=ls-refs` to fetch only the refs it cares about (avoiding the v1 pitfall of downloading hundreds of thousands of tags upfront); {#w1}
2. The client sends `command=fetch` listing the `want &lt;oid&gt;` tips it lacks and recent `have &lt;oid&gt;` commits it already holds; {#w2}
3. The server walks backward from `want` until hitting common `have` ancestors (often accelerated in milliseconds by reachability `.bitmap` files), knowing every ancestor below a common commit is already present on the client; {#w3}
4. The server streams a **"thin pack"** that is even allowed to emit deltas against base objects already sitting on the client, which the client completes into a self-contained pack on arrival. {#w4}

::: diagram dg-wire keys=dg.wire
cap: Figure 9. Git Wire Protocol v2 fetch flow: targeted `ls-refs`, `want`/`have` graph negotiation, and a thin pack over the wire; bottom compares history-truncating vs blob-deferring clone filters.
aria: Diagram: client and server sequence for ls-refs, ref OIDs, want/have negotiation, and thin pack transfer plus clone filter options
cli: Client
srv: Server
m1: ls-refs
m2: branch & tag OIDs
m3: want + have
m4: thin pack (missing)
flt: Large-repo slimming options
flts: "--depth=k | --filter=blob:none"
:::

For multi-gigabyte repositories full of binary assets, two options cut initial transfer dramatically. **Shallow clones (`--depth=k`)** record artificial boundary commits in `.git/shallow` and sever older history completely. **Blobless partial clones (`--filter=blob:none`)** download the **entire commit DAG and all tree objects**, omitting historical blobs and designating the server as a **promisor remote** that supplies old blobs lazily when a command like `git checkout` or `git blame` needs them. Git 2.56.0 also added `git repack --drop-filtered` so clients can later evict oversized promisor blobs once they leave the index.

::: lab ch9-model
model.title: Full vs Shallow vs Partial Clone Trade-offs
model.how: On a 200-commit repo carrying heavy binary assets, switch across Full, <code>--depth</code>, <code>blob:none</code>, and <code>tree:0</code> clones and vary depth or binary asset size to compare first-clone transfer bytes, round trips, and offline capabilities.
ctl.mode: Clone mode
ctl.depth: Shallow --depth
ctl.bin: Binary asset size / rev (MiB)
cv.aria: Left: object scope downloaded for commits, trees, and blobs; Right: wire bytes across the four clone modes
cv.commits: Commits
cv.trees: Trees
cv.blobs: History blobs
cv.head: HEAD blobs
cv.wire: Initial wire bytes
mode.name.full: Full
mode.name.shallow: Shallow
mode.name.blobless: blob:none
mode.name.treeless: tree:0
read.wire: Initial wire download
read.ratio: Share of full clone
read.objs: Objects transferred
read.trips: Minimum round trips
say.full: <strong>Full clone</strong> pulls all {objs} objects ({wire}): every <code>git log</code>, <code>blame</code>, and historical <code>diff</code> works completely offline, at the price of downloading every past binary revision.
say.shallow: <strong>Shallow clone (<code>--depth={depth}</code>)</strong> cuts transfer to {wire} ({pct}), but severs older commit history locally so offline ancestry queries stop at the shallow boundary.
say.blobless: <strong>Blobless partial clone (<code>--filter=blob:none</code>)</strong> downloads every commit and every tree while fetching only HEAD's working blobs: initial transfer drops to <em>{wire}</em> ({pct}), keeping full topology local while deferring old blobs to the promisor remote.
say.treeless: <strong>Treeless clone (<code>--filter=tree:0</code>)</strong> fetches only {objs} commit headers upfront and pulls needed trees and blobs on demand ({trips}+ round trips), best suited to ephemeral CI builds.
:::

In our 200-commit example with 12 MiB binary updates, a full clone transfers {=ch9.fullMB}, whereas `--filter=blob:none` downloads just {=ch9.bloblessMB} ({=ch9.bloblessPct}) while retaining full graph topology. And when you want to verify that silent disk corruption never touched a single bit, **`git fsck`** walks every loose and packed object, decompresses and re-hashes its raw bytes against its OID, and checks reachability of every referenced tree and blob (see [[what-a-drive-is-made-of#ch5|What a Drive Is Made Of, Chapter 5]] on lower-layer storage ECC).

The model leaves out: `bundle-uri` / `packfile-uri` offloading of static base packs to CDNs, multi-round `have` backoff heuristics in heavily branched repos, and silent storage-hardware bit rot. {.take}

## Where the frontier is (November 2026): Reftable, SHA-256 & monorepos {#ch10}

::: strings
toc: Frontier (November 2026)
:::

Loose ref files and 40-hex SHA-1 hashes are hitting scale and cryptographic limits: as of Git 2.56.0, the `reftable` ref backend is mature and slated for Git 3.0's defaults, while seamless SHA-1 ↔ SHA-256 repository interoperability remains explicitly marked incomplete. {.law}

Everything up to chapter 9 describes the architecture that powers almost every repository on earth today. Yet design choices made twenty years ago for the Linux kernel (tens of thousands of commits, a handful of branches) strain under modern enterprise monorepos (millions of refs, hundreds of thousands of files) and aging cryptography. Keep three categories strictly separated as of **November 2026**:

### Established {#h.est .sub3}

- **SHA-1 cryptanalysis and Git's response**: NIST formally deprecated SHA-1 in 2011, followed by practical collision demonstrations: SHAppening (2015, ~$2^{57}$ ops), SHAttered (February 2017, two colliding PDFs in $2^{63}$ ops), and Shambles (2020, chosen-prefix collision in $2^{63}$ ops). Git **v2.13.0** (2017) switched to hardened collision-detecting SHA-1 by default, but `technical/hash-function-transition.adoc` notes hardened SHA-1 cannot guarantee safety against future attacks; in **August 2018**, Git selected **SHA-256** as its successor hash (years and operation counts cited directly from Git 2.56.0's `BreakingChanges.adoc` and `hash-function-transition.adoc`). {#e1}
- **Why loose refs and `packed-refs` break at scale**: storing 100k+ branches as individual 41-byte files wastes filesystem inodes and 4 KiB disk blocks, fails when two refs differ only by case on Windows/macOS or differ in Unicode normalization, and incurs `stat`/directory scan penalties. Conversely, `packed-refs` forces a full-file rewrite on every single ref deletion. In `technical/reftable.adoc`'s 866k-ref Android benchmark, `packed-refs` takes **62.2 MiB** and **409,660.1 µs** for a cold single-ref lookup, versus **36.1 MiB** and **33.9 µs** for `reftable`. {#e2}

### Already built {#h.demo .sub3}

- **`reftable` ref backend (Git 2.45–2.56.0)**: integrated in Git **2.45** (April 2024, `git init --ref-format=reftable`), followed by `git refs migrate` in 2.46+ and declared mature enough to become Git 3.0's default in Git **2.51**. In **Git 2.56.0** (released **28 September 2026**, `RelNotes/2.56.0.adoc`), `git refs` gained low-level `create/delete/update/rename` subcommands and `reftable` tombstone iteration was further optimized. {#d1}
- **Native SHA-256 object stores & pluggable ODB prep**: `git init --object-format=sha256` (since Git 2.29) and the `.git/objects/object-map/*.map` format (`gitformat-loose`) are shipped in Git 2.56.0 (verified in `tools/crosscheck.cjs` for SHA-256 blobs and nested trees). `RelNotes/2.56.0.adoc` also refactored the object store into pluggable `odb_source` structs and deferred loading of the loose-object map until needed. {#d2}
- **Monorepo toolchain (`scalar` & cone-mode sparse index)**: Git 2.56.0 ships the standalone `scalar` binary configuring partial clone, `commit-graph`, `multi-pack-index` (MIDX), cone-mode sparse checkout (`core.sparseCheckoutCone`), and `extensions.sparseIndex`, which collapses directories outside your sparse cone into single `040000` `SKIP_WORKTREE` index entries. {#d3}

::: diagram dg-reftable keys=dg.reftable
cap: Figure 10. `files` + `packed-refs` vs `reftable`: `reftable` packs prefix-compressed refs into sorted 4 KiB blocks and writes small tombstone/delta tables with geometric compaction instead of rewriting the whole file.
aria: Diagram: top compares loose files and full-rewrite packed-refs; bottom shows reftable 4 KiB prefix-compressed blocks, tombstone table, and geometric compaction
f1: Traditional files + packed-refs
f2: "Loose files (4K) + packed-refs"
f3: Deleting 1 ref rewrites entire file
r1: reftable (Git 2.45–2.56+)
rb1: blk 0 (4K)
rb2: blk 1 (4K)
rb3: tombstone
r2: Prefix compression + binary search
r3: "Geometric compaction (O(update))"
:::

### Specifications, plans and claims {#h.claim .sub3}

- **Git 3.0 default flip (`BreakingChanges.adoc`, no release date set as of November 2026)**: four default flips are staged behind `WITH_BREAKING_CHANGES` for Git 3.0—`sha256` object format, `reftable` ref backend, `main` default branch, and mandatory Rust build support (following Git 2.55 enabling Rust by default in builds). The document explicitly predicates the SHA-256 and reftable flips on ecosystem readiness across forges (GitHub/GitLab) and alternative Git implementations (JGit, libgit2, Gitoxide), and notes there is **no** plan to drop `sha1` reading support. {#c1}
- **SHA-1 ↔ SHA-256 interoperability incomplete (Git 2.52–2.56.0)**: `RelNotes/2.52.0.adoc` explicitly warns that `extensions.compatObjectFormat` currently hides "an incomplete feature that is not yet usable for any purpose other than developing the feature further" and discourages general use. Active SHA-1 repositories still cannot toggle to SHA-256 in place without re-exporting commits via `git fast-export` / `git fast-import`. {#c2}

::: lab ch10-model
model.title: Ref Backend Write Amplification & Sparse Index Scaling
model.how: Drag the reference count N (1,000 to 866,000, matching Android's benchmark scale) and active sparse directories (out of 20 top-level dirs in a 100k-file repo), and toggle atomic single-ref deletion/update to compare <code>packed-refs</code> rewrite amplification against <code>reftable</code>.
ctl.refs: Reference count N (10^k)
ctl.act: Active top-level dirs (of 20)
ctl.del: Measure single-ref atomic write amplification
cv.aria: Left: storage size and cold lookup latency across loose, packed-refs, and reftable; Right: full index vs cone-mode sparse index entry count
cv.refsz: Storage
cv.lat: Cold lookup
cv.idx: Index entries
cv.full: Full index
cv.sparse: Sparse index
op.del: "1 atomic update rewrites {packW} in packed-refs vs {reftW} in reftable ({amp} amplification)"
op.idle: tick the box above to measure single-ref update amplification
read.packed: packed-refs size
read.reft: reftable size
read.amp: Single-ref write amplification
read.sparse: Sparse index entries
say: At {n} refs, <code>packed-refs</code> takes {packSz} and <code>reftable</code> compresses to <em>{reftSz}</em>; {opDesc}. Across 100,000 files in 20 top-level dirs, checking out {act} active dirs shrinks the index to <em>{spEnt}</em> entries ({spSave} fewer).
:::

At 100,000 refs, `packed-refs` takes {=ch10.packed100k} while `reftable` drops to {=ch10.reftable100k}—and the deeper win is avoiding rewriting all {=ch10.packed100k} every time CI deletes a single tag. With cone-mode sparse checkout active on 2 of 20 top-level directories in a 100,000-file repo, `.git/index` collapses to {=ch10.sparseEntries} entries. **Every version and roadmap claim in this chapter reflects November 2026**—check newer `BreakingChanges` and forge announcements before relying on future defaults.

The model leaves out: amortized compaction overhead under sustained high-frequency writes in `reftable`, and OS-specific filesystem inode/directory caching behavior across APFS, ext4, and NTFS. {.take}

## Wrap-up: when `.git/` bloats, stalls, or loses commits, ask three questions {#ch11}

::: strings
toc: Wrap-up: ask three questions
:::

You never need to memorize every byte offset. When `.git/` blows up, `git status` crawls, or a mistake wipes commits, ask three questions: which objects are still reachable? Which cache did this operation miss? Which layer holds the pointer or delta? {.law}

{.qs}
- **Why did the repo grow huge—and how do you actually shrink it?** Check `git count-objects -vH` (`size-pack` vs `garbage`, chapter 8). If large binaries were committed in the past, deleting them in a new commit leaves old blobs intact in every ancestor commit; you have to rewrite history (chapters 3–4), expire reflogs (chapter 6), and run `git gc --prune=now`—or clone with `--filter=blob:none` (chapter 9). {#q1}
- **Why did `git status` or branch commands suddenly turn sluggish?** Check if `.git/index` `stat` caches invalidated en masse (container volume mounts changing `uid`/`mtime`) or if an un-sparsed monorepo needs cone mode (`sparseIndex`, chapters 5 and 10). Slow branch listing or deletion across tens of thousands of refs points to `files` directory scans or full `packed-refs` rewrites—test `git refs migrate --ref-format=reftable` (chapter 10). {#q2}
- **Can a botched `reset` or `rebase` still be recovered?** As long as you ran **`git add` or `git commit`**, those objects entered `.git/objects/` (chapters 1–2): commits dropped by `git reset --hard`, bad rebases, or force-deleted branches remain pinned locally by `.git/logs/HEAD` for 30 days by default via `git reflog` (chapters 4 and 6). The **only** work Git cannot rescue is working-tree edits that never even ran `git add`. {#q3}

In one sentence: `git add` and `git commit` build an immutable **content-addressed tree (blob → tree → commit)** and quietly nudge a 41-byte branch sticky note forward—giving you instantaneous snapshots, lightweight branching, on-demand diffs, delta-packed storage, and weeks of local safety nets. {#sum .sum}

Related essays: [[a-secret-in-public#ch6|A Secret Agreed in Public, Chapter 6]] (one-way hashes and SHA-256 avalanche), [[graph-algorithms#step0|Graph Algorithms]] (graphs and ancestry walks), [[what-a-drive-is-made-of#ch6|What a Drive Is Made Of, Chapter 6]] (why flash FTLs and object stores append new copies and remap pointers rather than overwriting in place), and W1 of this series, [[how-threejs-draws-a-scene]]. {#links}

::: footer
**Sources.** All object formats, protocols, and release behaviors match **Git 2.56.0** (`/opt/homebrew/bin/git`, released 28 September 2026) and its shipped primary documentation: `gitformat-loose(5)`, `gitformat-index(5)`, `gitformat-pack(5)`, `gitformat-signature(5)`, `gitprotocol-v2(5)`, `gitrepository-layout(5)`, `git-refs(1)`, `BreakingChanges.adoc`, `RelNotes/2.45.0.adoc`–`2.56.0.adoc`, and under `technical/`: `racy-git.adoc`, `pack-heuristics.adoc`, `reftable.adoc`, `hash-function-transition.adoc`, `partial-clone.adoc`, `sparse-checkout.adoc`, `sparse-index.adoc`, and `scalar.adoc`. Algorithms and wire standards: Eugene W. Myers, *An O(ND) Difference Algorithm and Its Variations*, Algorithmica 1(2), 1986; RFC 1950 (zlib) and RFC 1951 (DEFLATE); RFC 3174 (SHA-1) and NIST FIPS 180-4 (SHA-256). File-by-file references and exact crosscheck logs are recorded in `BRIEF.md` in this directory.

**The models.** The page runs zero external libraries and executes no native Git binary in the browser. `models.js` implements pure-JS SHA-1, SHA-256, CRC32, Adler-32 + DEFLATE/zlib compression, loose object framing, tree entry sorting and structural sharing, commit/tag serialization, `DIRC` v2 index encoding and `stat`-cache / Racy-Git evaluation, Myers diff and 3-way merge, `PACK` v2 varint and `OFS_DELTA` / `COPY` / `INSERT` bytecode encoding/decoding, `.idx` v2 fanout binary search, and clone/ref/sparse scaling models. `tools/crosscheck.cjs` verified 58 real outputs directly against `/opt/homebrew/bin/git` (2.56.0) in a scratch directory—blobs, nested trees, commits, tags, index checksums, Racy-Git zeroed size, five 3-way merges, real `.pack` decompression and `OFS_DELTA` reconstruction, and `reftable` headers—achieving 58/58 exact agreement. Written with Antigravity.
:::
