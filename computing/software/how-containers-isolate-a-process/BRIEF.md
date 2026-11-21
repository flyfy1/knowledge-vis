# BRIEF — how-containers-isolate-a-process

Author: Antigravity (gemini-flash-worker-agy, thinking: on, effort unavailable; planner: gemini-pro-orchestrator-neon, thinking: effort=1.00), 2026-11-21. Task: Software Core Principles Series W9.
Status: unregistered draft (`page.json` omits `"status": "live"`). Both Chinese (`content.zh.md`) and English (`content.en.md`) were authored together from scratch.

## Pinned specifications & honest host boundary

- **Specifications**:
  - **OCI Image Specification `v1.1.0`** (released 2024-02-15; `v1.1.1` maintenance 2025-03-03) — `ImageIndex`, `Manifest`, `Config`, `rootfs.diff_ids`, `ChainID` recurrence.
  - **OCI Runtime Specification `v1.2.0`** (released 2024-02-13) — `config.json` (`linux.namespaces`, `uidMappings`, `resources.cpu/memory`, `seccomp`, `process.capabilities`).
  - **Linux Kernel `6.x` primitives**: `namespaces(7)`, `pid_namespaces(7)`, `user_namespaces(7)`, `mount_namespaces(7)`, `cgroups(7)` (`cgroup-v2.rst`), `overlayfs.rst`, `seccomp(2)`, `capabilities(7)`, `veth(4)`, `pivot_root(2)`.
- **Honest host limitation**: Built and verified on macOS (`Darwin 27.2.0 arm64`) with neither a Linux kernel nor `docker`, `containerd`, `runc`, or `unshare` installed (`which docker` → not found). Therefore, live Linux kernel `unshare`/cgroups/OverlayFS execution cannot be run on this host. Instead, `tools/crosscheck.cjs` validates:
  1. Pure-JS FIPS 180-4 SHA-256 (`models.js` `sha256Hex`) byte-for-byte against Node.js `node:crypto`.
  2. Canonical OCI Manifest, Config, DiffID, and `ChainID = sha256(ChainID(k-1) + " " + DiffID(k))` digests against `node:crypto`.
  3. Exact mathematical conservation laws and threshold boundaries across all 9 models.

## One question

> When you type `docker run --rm -m 512m --cpus=0.5 python:3.12-slim python app.py`, there is no `struct container` inside the Linux kernel: what does that command ask the kernel to assemble, why can ten copies of a 200 MiB image share 199 MiB on disk, and what can still leak across the shared host kernel?

## Chapters, diagrams, and interactive models

1. **#ch1 No Container in the Kernel**: `docker` CLI → `containerd-shim` → `runc` → syscalls (`dg-stack`, `ch1-code`). Lab `ch1-model`: Process vs OCI Container vs MicroVM vs Full VM memory footprint & startup reference ledger (leaves out cross-container page cache and memory ballooning; boot/overhead figures are parameterized order-of-magnitude values).
2. **#ch2 OCI Image Layers & Content-Addressable Digests**: `Index → Manifest → Config → DiffID / ChainID` (`dg-oci`). Lab `ch2-model`: real SHA-256 ChainID cache-hit/invalidation cascade across 2–10 service variants (leaves out tar compression ratios and runtime writable layer).
3. **#ch3 OverlayFS & `pivot_root`**: `lowerdir + upperdir + workdir → merged` (`dg-overlay`). Lab `ch3-model`: read vs 4 KiB append Copy-Up vs `chmod +x` Copy-Up vs split-`RUN` `.wh.` whiteout vs same-`RUN` delete vs `.wh..wh..opq` opaque dir (leaves out `redirect_dir` and `xino` inode maps).
4. **#ch4 Linux Namespaces & Rootless UserNS**: 8 namespaces and dual-sided PID/UID view (`dg-ns`). Lab `ch4-model`: toggling `PID`, `/proc` remount, `MNT`, `NET`, and `USER` namespaces (`uid_map 0 -> 100000`) showing `/proc` leak and breakout severity (leaves out `setns` and `TIME` offsets).
5. **#ch5 Container Networking**: `veth` pair + `docker0` bridge + `nftables` `MASQUERADE` NAT (`dg-net`). Lab `ch5-model`: `bridge-nat` vs `same-bridge` vs `ebpf-host` vs `host-net` with VXLAN +50 B MTU fragmentation check (per-packet ns values are parameterized weights, not universal NIC benchmarks; leaves out TSO/GRO).
6. **#ch6 `cgroups v2` CPU Throttling**: `cpu.max = quota period` CFS bandwidth control (`dg-cfs`). Lab `ch6-model`: 200 ms multi-thread wall-clock timeline demonstrating 4 threads burning 50 ms quota in 12.5 ms and freezing 87.5 ms, plus 10 ms period tuning (leaves out `cpu.max.burst`).
7. **#ch7 `cgroups v2` Unified Memory & OOM**: unified `memory.current`, `memory.high` reclaim/PSI, `memory.max` OOM (`dg-mem`). Lab `ch7-model`: heap + page cache + non-reclaimable `tmpfs` vs thresholds (leaves out swap and multi-process `oom_score_adj`).
8. **#ch8 Security Perimeter**: `NoNewPrivs` → `seccomp-bpf` (~330 allowed / 44 blocked out of ~374) → `Capabilities` → `AppArmor/SELinux` (`dg-sec`). Lab `ch8-model`: 4-gate syscall probe evaluator (leaves out seccomp argument filtering and Landlock).
9. **#ch9 PID 1 Signals & Zombies**: `CMD "sh -c"` vs `CMD [...]` vs `--init` (`tini`) (`dg-pid1`). Lab `ch9-model`: `0..20 s` timeline of orphan zombie accumulation and `SIGTERM @5s` → `10s` `SIGKILL (137)` vs clean `1s` drain (leaves out custom `--stop-signal` and `pids.max`).
10. **#ch10 Frontier (November 2026)**: Established standards, demonstrated systems (idmapped mounts, Firecracker/Kata MicroVMs, EROFS/Nydus/composefs, WASI 0.2 & WASI 0.3), and workload-dependent caveats.
11. **#ch11 Wrap-up**: 3 diagnostic questions (`.qs`), `.sum`, cross-links to `how-the-os-talks-to-hardware`, `how-virtual-memory-works`, and `how-a-nic-moves-packets`.

## Frontier sources & dates (facts that will go stale)

All external sources verified via web search on **2026-11-21**:
- **OCI Image Spec `v1.1.0` (2024-02-15) & `v1.1.1` (2025-03-03)**: `https://github.com/opencontainers/image-spec/releases/tag/v1.1.0`
- **OCI Runtime Spec `v1.2.0` (2024-02-13)**: `https://github.com/opencontainers/runtime-spec/releases/tag/v1.2.0`
- **containerd `2.0` (2024-11-05), `2.1` (2025-05-07), `2.2` (2025-11-06, EROFS snapshotter improvements) & runc `1.3.0` (mid-2025)**: release schedules checked via endoflife.date / CNCF / containerd release summaries (2026-11-21).
- **Slacker (Harter et al., USENIX FAST '16)**: ~76% startup time in pull/unpack; 6.4% image data read at startup (`https://www.usenix.org/conference/fast16/technical-sessions/presentation/harter`).
- **Firecracker (Agache et al., USENIX NSDI '20)**: `< 5 MiB` memory overhead per microVM, `< 125 ms` boot, up to 150 microVMs/sec/host (`https://www.usenix.org/conference/nsdi20/presentation/agache`).
- **WASI `0.2` (2024-01-25) & WASI `0.3.0` (2026-06-11)**: Bytecode Alliance releases introducing Component Model and native `async func` / `stream<T>` / `future<T>` (`https://bytecodealliance.org/`).
- **Docker default seccomp profile**: allowlists ~300–330+ safe syscalls and blocks ~44 high-risk syscalls (`SCMP_ACT_ERRNO`).

## Crosscheck & test summary

- `tools/crosscheck.cjs`: verifies FIPS 180-4 SHA-256, OCI Manifest/Config/DiffID/ChainID digests against `node:crypto`, and 70+ spec invariants across all 9 models.
- `tests/models.cjs`: verifies all 9 model equations, all 43 `bindings.cjs` numbers, copy parity, zero CJK in English/HTML/figures, SVG text geometry, and zero alias collisions across `search/chunks/*.js` and sibling `REGISTRY.json` files.
- **Not verified on this host**: live Linux kernel execution (`unshare`, `cgroups v2` `/sys/fs/cgroup`, `mount -t overlay`, `docker run`) and Playwright browser rendering (coordinator runs `tests/browser.cjs` and `canvas-text-overlap.cjs --sweep` serially).
