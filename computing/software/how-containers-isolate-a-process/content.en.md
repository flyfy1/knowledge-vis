---
lang: en
title: How Containers Isolate a Process · A Hands-on Essay
desc: One docker run line spawns what looks like a fresh Linux box, yet there is no "container" struct anywhere in the Linux kernel. Following OCI Image 1.1 / Runtime 1.2 specs and Linux 6.x primitives, this essay takes that command apart: OCI layer SHA-256 ChainID deduplication, OverlayFS copy-up and .wh. whiteouts, eight Linux namespaces and Rootless UserNS UID mapping, veth bridges and NAT, cgroups v2 CPU throttling and unified memory OOM, seccomp-bpf and capabilities, PID 1 signals and zombie reaping, plus November 2026 frontiers in MicroVMs, EROFS, and WASI 0.3. Nine hands-on models cross-checked against Node crypto and exact spec arithmetic.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.ms: {v} ms
u.s: {v} s
u.mib: {v} MiB
u.bytes: {v} B
u.kpps: {v} kpps
u.cpus: {v} CPU
u.thr: {v} thr
u.count: {v}
:::

# How Containers Isolate a Process {#hero}

::: strings
kicker: Computing · Software principles · A hands-on long essay
:::

One `docker run` command conjures up a "clean Linux machine".<br>Yet there is no "container" object inside the Linux kernel—what did it actually lock in a sandbox? {.sub}

Type `docker run --rm -m 512m --cpus=0.5 python:3.12-slim python app.py`, and milliseconds later a process runs with what looks like its own root directory, network card, and `PID 1`. Search the entire Linux kernel source tree, however, and you will never find a `struct container`. This essay asks one question: **what does that command actually ask the kernel to assemble, why can ten copies of a {=ch2.img} MiB image share {=ch2.tenShared} MiB on disk, and what can still leak across the shared host kernel?** We follow the real lifecycle from launch to shutdown: first how the runtime toolchain unpacks layers and calls into the kernel, then how SHA-256 content addressing deduplicates images and OverlayFS builds a writable filesystem illusion, then how eight namespaces filter a process's view, how virtual cables bridge packets out, how `cgroups v2` throttles CPUs or kills on memory, and finally what `seccomp-bpf` and PID 1 actually guard. {.lead}

The structure follows **OCI Image Spec v1.1.0** (released 15 February 2024), **OCI Runtime Spec v1.2.0** (released 13 February 2024), and **Linux kernel 6.x primitives** (`namespaces(7)`, `cgroups(7)` v2, `overlayfs`, `seccomp(2)`, `capabilities(7)`). This page does not run a live Docker daemon (authored on a macOS Darwin host with neither a Linux kernel nor `dockerd`): nine interactive models reimplement the exact algorithms in `models.js`, while `tools/crosscheck.cjs` checks our pure-JS FIPS 180-4 SHA-256 and OCI Manifest / Config / ChainID digests byte-for-byte against Node `node:crypto` alongside all kernel arithmetic invariants. Background concepts live in [[how-the-os-talks-to-hardware]] and [[how-virtual-memory-works]]. Each chapter ends by stating what its model leaves out. {.note}

## There Is No "Container" in the Kernel {#ch1}

::: strings
toc: No Container in the Kernel
:::

A container is not a miniature virtual machine. To the host Linux kernel, it is just an ordinary process wearing three harnesses: Namespaces limit what it can see, cgroups v2 limit how much hardware it can burn, and OverlayFS plus seccomp limit which files and syscalls it can touch. {.law}

Here is that one-line command and the four steps that actually cross the system-call boundary into the Linux kernel. When you type `docker run`, the `docker` CLI merely hands flags to `containerd`, which spawns a lightweight `containerd-shim` process (so restarting the Docker daemon does not kill running workloads). An OCI runtime such as `runc` then reads `config.json`, calls `clone3`, `pivot_root`, writes `cgroup.procs`, locks down `prctl(PR_SET_SECCOMP)`, and finally `execve`s into `python app.py`.

::: html ch1-code
code.aria: One docker run command and the OCI runtime syscalls beneath it
code: "docker run --rm -m 512m --cpus=0.5 python:3.12-slim python app.py\n\n# containerd-shim -> runc reads OCI config.json and asks the kernel to:\n# 1. clone3(CLONE_NEWPID | CLONE_NEWNS | CLONE_NEWNET | CLONE_NEWUTS | CLONE_NEWIPC | CLONE_NEWCGROUP)\n# 2. mount(\"overlay\", merged, \"overlay\", \"lowerdir=...,upperdir=...,workdir=...\") + pivot_root()\n# 3. write(\"/sys/fs/cgroup/docker/<id>/cpu.max\", \"50000 100000\") + memory.max = 536870912\n# 4. prctl(PR_SET_NO_NEW_PRIVS, 1) + seccomp(SECCOMP_SET_MODE_FILTER, &prog) + execve(\"python\")"
:::

Each layer down strips away higher-level nouns. The CLI speaks image names and `--cpus=0.5`; `containerd` tracks content-addressed tar blobs and manages shims; `runc` turns `config.json` into Linux syscalls and pseudo-file writes; inside the kernel itself, "images" and "containers" do not exist—only **threads, namespace pointers, cgroup accounting files, VFS mount trees, and BPF filter programs**.

::: diagram dg-stack keys=dg.stack
cap: Figure 1. Four layers crossed by one docker run command. Below the syscall boundary sits one shared Linux kernel serving every container on the host (see [[how-the-os-talks-to-hardware#ch1|chapter 1 of How the OS Talks to Hardware]] on privilege rings).
aria: Diagram: four layers, docker CLI, containerd and runc, syscall boundary, and the shared Linux kernel
l1: docker CLI
l1s: Parses flags & environment
l2: containerd + shim + runc
l2s: Unpacks layers, builds OCI config.json
l3: Syscall boundary
l3s: clone3, mount/pivot_root, seccomp
l4: Shared Linux kernel
l4s: Namespaces · cgroups v2 · OverlayFS
x1: gRPC / CRI call
x2: OCI config.json + rootfs
x3: Hooks onto task_struct
:::

This marks the bright line between containers and hardware virtual machines. A hypervisor VM (such as QEMU/KVM) relies on CPU hardware virtualization ([[how-virtual-memory-works#ch11|chapter 11 of How Virtual Memory Works]]) to boot a separate guest kernel, guest page tables, and virtual devices per instance. Isolation is hardware-backed, at the cost of seconds of boot time and a full kernel's memory footprint per guest. Containers discard that second kernel altogether, starting in milliseconds while sharing the single host kernel underneath.

::: lab ch1-model
model.title: Isolation Boundaries: Memory Footprint & Boot Ledger
model.how: Switch between isolation modes and drag the replica slider to compare shared-host-kernel density against per-instance guest kernels, boot latency, and exposed host subsystems.
ctl.mode: Isolation mode
mode.process: Bare process
mode.container: OCI container
mode.microvm: MicroVM
mode.vm: Full VM
ctl.rep: Replicas
cv.aria: Stacked horizontal bar chart comparing total RAM across four isolation modes split into shared host kernel, guest kernel or VMM, and app RSS
leg.host: Host kernel (shared)
leg.guest: Guest kernel / VMM
leg.app: App RSS
kern.shared: Shared host kernel
kern.iso: Separate guest kernel
read.mem: Total RAM footprint
read.boot: Startup reference time
read.kern: Kernel boundary
read.sub: Shared host subsystems
say.process: {n} bare processes share one kernel at <em>{mem} MiB</em> total and start in ~{boot} ms, leaving all {sub}/10 host subsystems fully exposed.
say.container: {n} OCI containers still share the single host kernel (only {over} MiB shim overhead each), totaling <em>{mem} MiB</em> and booting in ~{boot} ms, while {sub}/10 host kernel surfaces remain shared.
say.microvm: {n} MicroVMs (modeled on Firecracker numbers) give each workload its own slim guest kernel and minimal VMM, taking <em>{mem} MiB</em> and booting in ~{boot} ms with only {sub}/10 hypercall surface shared.
say.vm: {n} full VMs pack a complete guest kernel and full emulation into every instance (<em>{mem} MiB</em> total, ~{boot} ms boot), cutting kernel sharing down at steep memory cost.
:::

Check the numbers at 8 instances: 8 OCI containers take {=ch1.cTotal8} MiB and launch in roughly {=ch1.cBoot} ms each; 8 full VMs consume {=ch1.vmTotal8} MiB at roughly {=ch1.vmBoot} ms boot each (while a MicroVM trims boot down to ~{=ch1.mBoot} ms). Dropping per-instance kernels buys density and speed; the rest of this essay explains how files, PIDs, packets, CPU slices, memory, and syscalls are locked down inside that single shared kernel.

The model leaves out: cross-container page cache savings (covered in chapters 2 and 7), demand-paged kernel modules, and memory ballooning; boot timings and base footprints are order-of-magnitude model parameters rather than a single machine's benchmark. {.take}

## OCI Image Layers and Content-Addressable Digests {#ch2}

::: strings
toc: OCI Image Layers & ChainID
:::

A container image is not a monolithic disk snapshot; it is an ordered list of read-only tar archives linked by SHA-256 digests. Whenever two services share the same lower layers, the host stores those bytes exactly once. {.law}

When `containerd` pulls `python:3.12-slim`, it fetches a tree of **SHA-256 content-addressed** JSON objects (OCI Image Spec v1.1.0). First comes an **Image Index** matching CPU architectures (such as `linux/amd64` or `linux/arm64`) to an **Image Manifest**. The Manifest points to an **Image Config** (command, environment variables, and unpacked layer `diff_ids`) plus a stack of read-only compressed tar layers.

::: diagram dg-oci keys=dg.oci
cap: Figure 2. Pointer chain in OCI Image Spec v1.1.0 and the ChainID recurrence. Changing one byte in layer L3 leaves ChainIDs for L0 through L2 completely untouched.
aria: Diagram: OCI Image Index pointing to Manifest, Config, and layers L0 to L3 linked by ChainID
idx: Image Index (multi-arch)
idxs: linux/amd64 · linux/arm64
mref: sha256 -> Manifest
man: Image Manifest
mans: config + layers[] digests
cref: sha256 -> Config
cfg: Image Config
cfgs: rootfs.diff_ids[L0..L3]
chain: ChainID = sha256(prev + DiffID)
l0: debian:12-slim (124 MiB)
l1: python:3.12 (48 MiB)
l2: pip-deps (27 MiB)
l3: app.py (1 MiB)
:::

Checking a single layer's unpacked tar digest (`DiffID`) alone is not enough, because identical pip packages unpacked onto Debian vs Alpine yield different root filesystems. The OCI spec therefore defines **ChainID**: `ChainID(L0) = DiffID(L0)`, and for every higher layer `ChainID(Lk) = sha256(ChainID(Lk-1) + " " + DiffID(Lk))`. That single formula creates an asymmetry: **changing a lower layer invalidates every ChainID above it**, whereas editing only the top application layer leaves every base ChainID identical.

::: lab ch2-model
model.title: Real SHA-256 OCI Layer & ChainID Deduplication
model.how: Choose which layer mutates and how many distinct services share the host, then inspect real 64-hex SHA-256 ChainIDs and watch how cache hits propagate into on-disk savings.
ctl.mut: Mutation point
mut.none: Differ only at top (app)
mut.L3: 1-byte edit in app.py
mut.L2: Rebuild pip-deps
mut.L1: Upgrade Python base
ctl.rep: Service instances
cv.aria: Bar chart comparing naive full copies against OCI content-addressed storage, plus L0 to L3 layer reuse blocks
col.layer: Layer
col.status: Cache state
col.chain: Real ChainID (first 22 hex chars)
st.shared: Cache hit
st.rebuilt: Rebuilt
bar.naive: Naive full copies ({n}×)
bar.stored: OCI store on disk
bar.layers: L0–L3 stack (green=shared, red=rebuilt)
read.shared: Shared base bytes
read.stored: Actual disk stored
read.naive: Naive copy total
read.hits: Layer hits
say.none: When {n} Python services differ only in L3 (1 MiB), L0–L2 (<em>{shared} MiB</em>) share identical ChainIDs—occupying just {stored} MiB on disk instead of {naive} MiB (saving {saved} MiB).
say.l3: Editing 1 byte in L3 changes L3's digest, while the <em>{shared} MiB ChainIDs</em> below stay intact; {n} variants add only 1 MiB each at the top.
say.l2: Changing L2 invalidates L2's ChainID and cascades into <em>rebuilding L3 too</em>, shrinking shared storage to {shared} MiB ({stored} MiB total).
say.l1: Upgrading L1 near the bottom breaks the ChainID chain from L1 upward, leaving only L0 (124 MiB) shared across {n} variants and swelling disk usage to <em>{stored} MiB</em>.
:::

Now we can answer the disk-sharing puzzle from the hero: with a `124 + 48 + 27 + 1 =` {=ch2.img} MiB image, two services differing only in their top 1 MiB layer take {=ch2.stored2} MiB instead of {=ch2.naive2} MiB ({=ch2.shared} MiB shared). Across ten variants on one host, naive copies burn {=ch2.tenNaive} MiB while content addressing stores {=ch2.tenStored} MiB—sharing {=ch2.tenShared} MiB identically on disk (and ten containers of the exact same image share all 200 MiB of read-only layers with zero extra copies). That SHA-256 chain is why Dockerfile guides tell you to put volatile `COPY .` lines at the very bottom.

The model leaves out: compression ratios between compressed tar `Digest` and unpacked `DiffID`, empty metadata-only layers, and the thin per-container writable layer examined in chapter 3. {.take}

## OverlayFS and `pivot_root`: Layered Illusion on Disk {#ch3}

::: strings
toc: OverlayFS & Copy-Up
:::

A container's `/` filesystem is not copied on startup. The Linux kernel's OverlayFS merges a stack of read-only directories (lowerdir) with one private writable directory (upperdir): reads fall through, writes copy the whole file up first, and deletes write a zero-byte whiteout marker. {.law}

Unpacked OCI layers sit on disk strictly read-only so ten containers never corrupt a shared `/usr/bin/python`. OverlayFS stacks four paths: read-only `lowerdir=L1:L0`, one private `upperdir` per container, an empty `workdir` on the same filesystem for atomic renames, and the combined `merged` view, into which `pivot_root` moves the process's `/` root (unlike memory page-level copy-on-write in [[how-virtual-memory-works#ch9|chapter 9 of How Virtual Memory Works]], OverlayFS operates at **whole-file** granularity).

::: diagram dg-overlay keys=dg.overlay
cap: Figure 3. OverlayFS directory stacking: reads fall down to lowerdir, modifications trigger whole-file Copy-Up into upperdir, and deletions place whiteout markers instead of touching read-only layers.
aria: Diagram: lowerdir read-only stack, upperdir writable layer, and workdir merging into the container's merged root view
low: lowerdir (L0+L1 read-only)
lows: python · model.bin 100M · pkg.tar
up: upperdir (writable)
ups: copy-up model.bin + .wh.pkg.tar
wk: workdir (atomic rename staging)
mount: mount -t overlay -> pivot_root
mg: merged (container / view)
mg1: model.bin -> served from upperdir
mg2: pkg.tar -> hidden by whiteout
:::

Two subtle behaviors explain most container storage surprises. First is **Copy-Up**: opening a {=ch3.modelSize} MiB lower-layer file to append even 4 KiB—or simply running `chmod +x` on its permission bits—forces the kernel to **copy all {=ch3.modelSize} MiB into `upperdir` first** before modifying the copy. Second is **Whiteout**: because lower layers cannot be altered, deleting a lower file in a subsequent `RUN` or runtime session creates a 0-byte `0/0` char device (or `.wh.&lt;name&gt;` in OCI tar archives; recreating a directory writes `.wh..wh..opq`). The file disappears from `ls`, yet all {=ch3.pkgSize} MiB stay locked in the lower layer forever.

::: lab ch3-model
model.title: OverlayFS Ledger: Copy-Up & Whiteout Cost
model.how: Select six real file operations or Dockerfile patterns and inspect lowerdir, upperdir, and merged views to see when 100 MiB copies silently and when deleting a file saves zero bytes.
ctl.op: File operation
op.read: Read python binary
op.append: Append 4 KiB to 100M file
op.chmod: chmod +x 100M file
op.rm-split: Next RUN rm 80M tar
op.rm-same: Same RUN && rm 80M tar
op.opaque: Recreate /var/cache dir
cv.aria: Three horizontal panels showing files stored in lowerdir, upperdir, and the resulting merged view
tier.lower: lowerdir (L0 + L1 read-only layers)
tier.upper: upperdir (writable / new layer)
tier.merged: merged (visible inside container /)
empty: (empty — zero writes yet)
read.copy: Copy-Up traffic
read.upper: upperdir size
read.total: Total stored bytes
read.waste: Hidden dead bytes
say.read: Reading lower-layer files serves straight from shared L0/L1 page cache: upperdir uses <em>{upper} MiB</em> and Copy-Up is {copy} MiB.
say.append: Appending just 4 KiB to a 100 MiB lower file triggers a full <em>{copy} MiB Copy-Up</em>; both copies sit on disk, pushing total storage to {total} MiB.
say.chmod: Even a single-bit <code>chmod +x</code> forces the kernel to copy all <em>{copy} MiB</em> up into upperdir so inode metadata can be written.
say.rm-split: Running <code>rm pkg.tar</code> in a separate <code>RUN</code> layer writes a 0-byte whiteout <code>.wh.pkg.tar</code>: the container sees {vis} MiB, while <em>{waste} MiB</em> stay trapped in L1 (total {total} MiB).
say.rm-same: Chaining <code>curl ... &amp;&amp; rm pkg.tar</code> in the same <code>RUN</code> unlinks the file before snapshot commit—zero whiteout needed, cutting total stored size to <em>{total} MiB</em>.
say.opaque: Recreating the directory in upperdir places an opaque marker <code>.wh..wh..opq</code> hiding all lower entries (<em>{waste} MiB</em> hidden, {total} MiB still stored).
:::

Compare those two delete paths: deleting `pkg.tar` in a second `RUN` step leaves an image of {=ch3.splitTotal} MiB, whereas chaining `&& rm` in the same `RUN` shrinks it to {=ch3.sameTotal} MiB (saving {=ch3.pkgSize} MiB). And for databases or large model weights written at runtime, mounting a host **Volume / Bind Mount** bypasses OverlayFS completely so writes never stall on Copy-Up.

The model leaves out: `redirect_dir` metadata renames, persistent inode numbering (`xino`), and overlay writable quota limits; file sizes are chosen for transparent arithmetic. {.take}

## Linux Namespaces: Eight Pairs of Blinkers {#ch4}

::: strings
toc: Linux Namespaces
:::

A Linux namespace does not clone the kernel. It puts blinkers on a process tree so the exact same kernel tables show two different PIDs, networks, mount trees, or user IDs across the boundary. {.law}

Once the filesystem is stacked, the kernel sets up visibility isolation across {=ch4.nsTotal} Linux namespaces (`PID`, `MNT`, `NET`, `UTS`, `IPC`, `CGROUP`, `USER`, `TIME`—each visible as an inode under `/proc/&lt;hostPID&gt;/ns/`). By default `runc` unshares the first six so a process thinks it is `PID 1` with its own mounts and loopback interface. Yet **without a `USER` namespace, `UID 0` (root) inside the container is the exact same `UID 0` on the host kernel**.

::: diagram dg-ns keys=dg.ns
cap: Figure 4. Eight Linux namespaces and two-sided mapping: host PID 4821 appears as PID 1 inside, and under Rootless UserNS, container UID 0 maps to unprivileged host UID 100000 via uid_map.
aria: Diagram: eight namespace badges above two cards comparing container view PID 1 UID 0 with host view PID 4821 UID 100000
in: Container view
inp: PID 1 · UID 0
out: Host kernel view
outp: PID 4821 · UID 100000
umap: /proc/4821/uid_map
umaps: "0 100000 65536"
:::

Two common traps follow directly. First, **namespaces filter views, not kernel existence**: `ps aux` on the host still lists that container process at its real host PID (`PID {=ch4.hostPid}`), and inside the container `ps` only hides the host's {=ch4.hostProcs} processes if **both** `PID` namespace isolation **and** a fresh `MNT` remount of `/proc` were applied (`{=ch4.ctProcs}` visible processes). Second, **Rootless UserNS mapping**: writing `0 {=ch4.uidBase} 65536` into `/proc/&lt;pid&gt;/uid_map` lets code inside think it runs as `UID 0` while every host kernel permission check evaluates it as unprivileged `UID {=ch4.uidBase}`.

::: lab ch4-model
model.title: Namespace Blinkers & Rootless UID Mapping Inspector
model.how: Toggle individual namespaces and the /proc remount switch to inspect how PIDs, UIDs, and visible process counts diverge between inside the container and on the host kernel.
ctl.pid: PID Namespace
ctl.proc: Fresh /proc mount
ctl.mnt: MNT Namespace
ctl.net: NET Namespace
ctl.user: USER Namespace (Rootless)
cv.aria: Eight namespace toggles and two comparison cards showing inside-container view versus host-kernel truth
cv.inside: Inside container view
cv.outside: Host kernel reality
read.pid: Container PID / Host PID
read.uid: Inside UID → Host UID
read.procs: Processes visible via ps
read.ns: Active namespaces
say.rootful-ok: The process sees itself as PID {inPid} (really host PID {hostPid}) and sees only {procs} container processes; yet without USER namespace, inside UID 0 equals <em>host UID {uidOut}</em>—any path breakout grants real host root.
say.rootless: With Rootless USER namespace active, the process keeps UID 0 and PID {inPid} inside, while the host kernel enforces permissions as unprivileged <em>UID {uidOut}</em>.
say.proc-leak: PID namespace is enabled, yet without remounting <code>/proc</code> inside MNT namespace, running <code>ps</code> still reveals all <em>{procs} host processes</em>!
say.host-pid: With PID namespace off (like <code>--pid=host</code>), the container exposes its real <em>host PID {hostPid}</em> and can inspect or signal {procs} host processes directly.
say.no-mnt: Without MNT namespace isolation, the container shares the host's entire mount tree directly; real host UID is {uidOut}.
:::

Notice the interaction between `PID` and `/proc`: unsharing `PID` alone without remounting `/proc` leaves all {=ch4.hostProcs} host processes readable in `/proc` even though `getpid()` returns `1`, whereas combining `PID`, `MNT`, and a fresh `/proc` mount leaves only {=ch4.ctProcs} container processes visible.

The model leaves out: `setns()` joining an existing container (`docker exec`), multi-range `/etc/subuid` allocations, and `TIME` namespace monotonic/boottime offsets. {.take}

## Container Networking: `veth`, `bridge`, and NAT {#ch5}

::: strings
toc: Container Networking
:::

A fresh `NET` namespace starts with only a loopback `lo` interface. Containers reach the outside world across a virtual patch cable (`veth` pair) punched through the namespace wall into a host Linux `bridge` and `nftables` NAT rules. {.law}

Once isolated into its own `NET` namespace, a process has no route out. The runtime creates a `veth` pair—two linked virtual Ethernet devices in the kernel where every frame pushed into one end immediately arrives at the other—moves one end into the container as `eth0` (`172.17.0.2`), attaches the host end to the software switch `docker0` (`172.17.0.1`), and programs `nftables`/`iptables` `MASQUERADE` rules plus `conntrack` state to rewrite source addresses on exit through the physical NIC (see [[how-a-nic-moves-packets#ch3|chapter 3 of How a NIC Moves Packets]] for driver ring buffers).

::: diagram dg-net keys=dg.net
cap: Figure 5. Logical packet path across Bridge + NAT inside one Linux host kernel before hitting the physical NIC.
aria: Diagram: container eth0 across veth pair into host bridge docker0, nftables conntrack NAT, and physical NIC
ct: Container NET Namespace
cts: eth0 (172.17.0.2)
veth: veth pair crosses netns wall
br: Host software bridge docker0
brs: L2 forwarding (172.17.0.1)
nat: nftables MASQUERADE NAT
nic: Host physical NIC ens5
nics: Source IP rewritten to host IP
:::

Every isolation hop stays inside the host kernel yet adds measurable software overhead: crossing netns boundaries, software bridge switching, and `conntrack` table lookups. Worse, cross-node overlay networks (such as **VXLAN**) prepend **{=ch5.vxlan} bytes** of outer headers; if the container's `eth0` keeps a 1500 B MTU instead of lowering to `{=ch5.mtu} B`, full TCP segments hit fragmentation or drop silently. Modern CNIs like Cilium bypass the Linux bridge and `iptables` chains entirely with eBPF `bpf_redirect_peer` (see [[how-a-nic-moves-packets#ch10|chapter 10 of How a NIC Moves Packets]]), whereas `--network=host` skips all network isolation for native NIC speed.

::: lab ch5-model
model.title: Packet Hops, Software Path Cost & VXLAN MTU Check
model.how: Switch networking modes, adjust payload bytes and packet rate, and toggle VXLAN overlay encapsulation (+50 B) to see when packets traverse netfilter hooks and when they breach the 1500 B MTU ceiling.
ctl.mode: Network mode
mode.bridge-nat: Bridge + NAT
mode.same-bridge: Same-bridge peers
mode.ebpf-host: eBPF host-routing
mode.host-net: --network=host
ctl.pkt: TCP payload size
ctl.kpps: Packet rate
ctl.vx: VXLAN overlay (+50 B)
cv.aria: Kernel stage pipeline diagram and packet frame bar plotted against the 1500 B NIC MTU line
cv.path: Kernel stages traversed
cv.mtu: Total frame vs effective MTU
frag.yes: Fragmented!
frag.no: Fits MTU
read.hops: Kernel stages crossed
read.cpu: Software path CPU share
read.mtu: IP size / effective MTU
read.frag: MTU check
say.bridge-nat: Default Bridge + NAT crosses {ns} netns wall, software bridge <code>docker0</code>, and {hooks} conntrack/NAT hooks (~{cpu}% modeled core load for full network isolation).
say.same-bridge: Container-to-container over <code>docker0</code> crosses {ns} netns boundaries locally via L2 forwarding without leaving the host NIC or adding VXLAN headers.
say.ebpf-host: eBPF host-routing intercepts packets at the <code>veth</code> hook with <code>bpf_redirect_peer</code>, skipping bridge switching and iptables chains (0 bridge hops, 0 conntrack hooks).
say.host-net: <code>--network=host</code> removes the network namespace entirely (0 hops, 0 NAT overhead), exposing all host ports directly to the container.
say.frag: Warning: with 40 B TCP/IP headers plus 50 B VXLAN overhead, total packet size exceeds the effective <em>{mtu} B</em> ceiling ({ip} B &gt; {mtu} B), causing IP fragmentation or blackhole drops unless container MTU is set to 1450 B.
:::

Look at the modeled software cost ratio ({=ch5.bridgeNs} ns/pkt on Bridge + NAT vs {=ch5.ebpfNs} ns/pkt with eBPF bypass) alongside that MTU trap: forgetting the {=ch5.vxlan}-byte VXLAN header silently breaks full-sized 1460-byte TCP payloads unless MTU drops to `{=ch5.mtu} B`.

The model leaves out: TCP segmentation offload (TSO/GRO coalescing 64 KiB batches in software), $O(N)$ `iptables` rule scaling at large service counts vs $O(1)$ IPVS/eBPF maps, and bridge lock contention; per-packet nanoseconds are parameterized path weights rather than universal hardware measurements. {.take}

## `cgroups v2` CPU Throttling: How Four Threads Burn 50 ms in 12.5 ms {#ch6}

::: strings
toc: cgroups v2 CPU Throttling
:::

A `--cpus=0.5` limit is not a half-speed CPU core. It is a budget of 50 ms of CPU time handed out every 100 ms; four worker threads can burn the whole budget in 12.5 ms of wall time and freeze all threads for the remaining 87.5 ms. {.law}

This explains a classic production mystery: a Go, JVM, or Node service averages **30% CPU**, yet P99 latency repeatedly spikes near 100 ms. In `cgroups v2`, passing `--cpus=0.5` writes `50000 100000` (microseconds) to `/sys/fs/cgroup/.../cpu.max`—meaning all threads combined get **{=ch6.quota} ms of CPU time every {=ch6.period} ms period**.

::: diagram dg-cfs keys=dg.cfs
cap: Figure 6. How cpu.max = 50000 100000 (0.5 CPU) behaves with 1 thread vs 4 parallel threads: the exact same 50 ms quota freezes 4 threads for 87.5% of every period.
aria: Diagram: 1 thread running 50 ms then freezing 50 ms versus 4 threads exhausting 50 ms in 12.5 ms wall time and freezing for 87.5 ms
hdr: "cpu.max = 50000 100000 (0.5 CPU)"
r1: 1 worker thread
frz1: 50 ms throttled
r4: 4 parallel threads (on 8-core host)
burn4: 4 × 12.5 = 50 ms burned
frz4: All threads frozen 87.5 ms
:::

Why? By default, runtimes inspect `/proc/cpuinfo` and see **all host cores** (say 8), not the container's cgroup limit. Whenever a GC pause or concurrent request wakes 4 threads on 4 physical cores simultaneously, the {=ch6.quota} ms bucket drains in `50 / 4 = {=ch6.burn4}` ms of wall time. The kernel then freezes the entire cgroup for the remaining `{=ch6.freeze4}` ms (`nr_throttled` climbs in `cpu.stat`), stretching even a tiny single-threaded RPC right across the stall.

::: lab ch6-model
model.title: cgroups v2 CFS Bandwidth Control Timeline
model.how: Keep --cpus at 0.5 and drag worker threads from 1 to 4 or 8 to see red freeze bands swallow the period; then shorten the period from 100 ms to 10 ms to see tail stalls shrink by 10×.
ctl.cpus: CPU quota (--cpus)
ctl.thr: Active worker threads
ctl.per: Period length
per.100: 100 ms (default)
per.20: 20 ms
per.10: 10 ms
cv.aria: 200 ms wall-clock timeline showing parallel thread CPU bars in gold/cyan and post-quota freeze zones in red
cv.x: Wall-clock time (ms)
read.burn: Bucket burnout time
read.freeze: Freeze per period
read.rpc: Worst 20 ms RPC latency
read.stat: Throttles in 200 ms
say.throttled: With {cpus} CPU ({quota} ms per {period} ms), {thr} parallel threads empty the bucket in <em>{burn} ms</em> and freeze for <em>{freeze} ms</em>—stretching a 20 ms RPC up to {rpc} ms!
say.smooth: Active threads ({thr}) do not exceed {cpus} CPU: the bucket never empties within {period} ms, leaving <em>0 ms frozen</em> and steady 20.0 ms latency.
:::

Check the default: at `0.5 CPU` ({=ch6.quota} ms / {=ch6.period} ms) with 4 threads, quota burns out in {=ch6.burn4} ms and stalls for {=ch6.freeze4} ms, turning a 20 ms RPC into {=ch6.rpc4} ms! Cutting `period` to 10 ms drops each freeze window tenfold to {=ch6.freeze10} ms, while matching thread pools (`GOMAXPROCS`, JVM `ActiveProcessorCount`) to the cgroup quota removes the burst stall altogether.

The model leaves out: `cpu.max.burst` unused-credit carry-over (Linux 5.14+), `cpu.weight` contention under full host saturation, and 1–4 ms scheduler tick granularity. {.take}

## `cgroups v2` Memory: Page Cache, PSI, and OOM Kill {#ch7}

::: strings
toc: cgroups v2 Memory
:::

cgroups v2 charges anonymous heap, kernel slab, tmpfs, and file page cache to one unified memory.current counter. Crossing memory.high slows the process via reclaim stalls; pushing unreclaimable memory past memory.max fires an instant OOM-kill. {.law}

Under older `cgroups v1`, containers suffered from split accounting across anonymous RSS, page cache ([[how-the-os-talks-to-hardware#ch10|chapter 10 of How the OS Talks to Hardware]]), and `kmem`—often leaving leaked cache unbilled or misattributed. **`cgroups v2` unifies every memory class into a single `memory.current` ledger** governed by four watermarks: `memory.min` → `memory.low` → `memory.high` (throttling & direct reclaim) → `memory.max` (hard OOM ceiling).

::: diagram dg-mem keys=dg.mem
cap: Figure 7. cgroups v2 unified memory accounting: clean file page cache can be evicted at memory.high, whereas anonymous RSS plus tmpfs exceeding memory.max triggers OOM-kill.
aria: Diagram: stacked bar of anonymous heap, tmpfs, and page cache compared against memory.high and memory.max lines
anon: Anon heap + tmpfs
cache: Page cache
hi: memory.high
max: memory.max
hdesc: Above memory.high: evict clean page cache
hsubs: Direct reclaim introduces PSI memory stalls
mdesc: Unreclaimable > memory.max: OOM-kill
msubs: Kernel kills highest-scoring task (exit 137)
:::

Clean file page cache can always be dropped back to disk when memory hits `memory.high` ({=ch7.high} MiB at 80% of {=ch7.max} MiB), trading throughput for **PSI (`memory.pressure`)** direct-reclaim stalls rather than crashing (page reclaim mechanics in [[how-virtual-memory-works#ch7|chapter 7 of How Virtual Memory Works]]). Writing logs or temp files into `/dev/shm` (`tmpfs`), however, is **non-reclaimable**—it counts against `memory.current` just like malloc'd heap, and once `anon + tmpfs` tops `memory.max`, the OOM killer immediately executes `SIGKILL`.

::: lab ch7-model
model.title: cgroups v2 Memory Pressure, Page Cache & OOM Simulator
model.how: Drag anonymous heap, file page cache, and tmpfs sliders to watch clean page cache absorb pressure via eviction—then raise tmpfs to see why writing files to /dev/shm triggers OOM-kill.
ctl.anon: Anon heap (RSS)
ctl.cache: File page cache
ctl.tmpfs: tmpfs / /dev/shm
ctl.max: memory.max hard limit
cv.aria: Comparison bars of requested working set versus cgroups v2 enforced memory.current against memory.high and memory.max thresholds
leg.anon: Anon heap
leg.cache: Page cache
leg.rec: Reclaimed
bar.req: Requested working set
bar.cur: Enforced memory.current (high = 80%)
st.healthy: Healthy
st.reclaim: Reclaiming cache
st.thrash: Heavy PSI thrash
st.oom: OOM-killed!
read.cur: Enforced memory.current
read.rec: Evicted page cache
read.psi: PSI memory stall
read.state: Cgroup state
say.healthy: Demand stays below <code>memory.high</code> ({high} MiB): heap, tmpfs, and full page cache fit with <em>0% reclaim stall</em>.
say.reclaim: Above <code>memory.high</code> ({high} MiB) but below hard limit: the kernel evicts <em>{rec} MiB</em> of clean page cache down to {cur} MiB, adding {psi}% PSI reclaim stall.
say.thrash: Danger: unreclaimable heap + tmpfs alone sits at <em>{unrec} MiB</em> between <code>high</code> ({high} MiB) and <code>max</code> ({max} MiB)—all {rec} MiB of page cache are wiped, causing {psi}% heavy thrashing.
say.oom: <strong>OOM-kill!</strong> Unreclaimable memory (anon + tmpfs = <em>{unrec} MiB</em>) breaches <code>memory.max</code> ({max} MiB); no cache eviction can save it, and the kernel kills the task (exit 137).
:::

At the defaults (240 MiB heap + 220 MiB page cache = 460 MiB), the container crosses {=ch7.high} MiB (`memory.high`) yet stays below {=ch7.max} MiB (`memory.max`) by shedding {=ch7.reclaimed} MiB of clean cache at a {=ch7.psi} PSI stall—until 300 MiB written into `tmpfs` drives unreclaimable memory past {=ch7.max} MiB.

The model leaves out: swap offloading when `memory.swap.max > 0`, dirty-page writeback throttling latency, and multi-process `oom_score_adj` victim selection inside one cgroup. {.take}

## Security Perimeter: Capabilities, `seccomp-bpf`, and Shared Kernel {#ch8}

::: strings
toc: Security Perimeter
:::

Containers share one system-call gate into the host kernel. Being "root" inside a container grants only what survives four checks: NoNewPrivs, the seccomp-bpf syscall filter, Linux Capabilities bitmasks, and MAC labels. {.law}

Without a `USER` namespace, `UID 0` inside a container would hold root power over the shared syscall table ([[how-the-os-talks-to-hardware#ch2|chapter 2 of How the OS Talks to Hardware]])—able to call `mount`, `bpf`, or `kexec_load` to hijack the host kernel. To seal that boundary, OCI runtimes enforce four stacked gates before `execve()`.

::: diagram dg-sec keys=dg.sec
cap: Figure 8. Four security gates on every container syscall: NoNewPrivs blocks setuid escalation, seccomp-bpf filters raw syscall numbers before execution, then Capabilities and LSM MAC check privilege and labels.
aria: Diagram: syscall passing sequentially through NoNewPrivs, seccomp-bpf, Capabilities, and AppArmor/SELinux before kernel code
g1: 1. NoNewPrivs bit locked
g1s: Blocks setuid binary escalation
g2: 2. seccomp-bpf cBPF filter
g2s: Allow ~330 / block 44 syscalls
g3: 3. Capabilities bitmask
g3s: Drops CAP_SYS_ADMIN & root caps
g4: 4. LSM MAC policy
g4s: AppArmor / SELinux blocks host paths
kern: Host kernel syscall handler
:::

Look closely at Gate 2 (**seccomp-bpf**): out of ~{=ch8.totalSys} Linux syscalls, Docker/containerd's default allowlist permits ~{=ch8.allowedSys} safe calls and blocks **{=ch8.blockedSys}** high-risk syscalls (`kexec_load`, `init_module`, `bpf`, `mount`, `reboot`) with `EPERM` before the kernel handler runs. Gate 3 splits traditional omnipotent root into 41 **Capabilities**: container defaults drop `CAP_SYS_ADMIN` ("the new root") and `CAP_SYS_PTRACE`, keeping minimal ones like `CAP_NET_RAW` unless hardened with `--cap-drop=ALL`.

::: lab ch8-model
model.title: Four-Gate Syscall & Capability Perimeter Tester
model.how: Pick a syscall probe and toggle seccomp-bpf, Capabilities, and LSM switches to watch which gate intercepts the call with EPERM or EACCES and how large the exposed syscall surface remains.
ctl.probe: Syscall probe
pr.read_write: read / write (normal I/O)
pr.raw_ping: socket(SOCK_RAW) (ping)
pr.mount_fs: mount() (mount filesystem)
pr.ptrace: ptrace() (trace process)
pr.bpf: bpf() (load kernel eBPF)
pr.kexec: kexec_load() (replace kernel)
ctl.sec: Default seccomp-bpf
ctl.netraw: CAP_NET_RAW
ctl.sysadm: CAP_SYS_ADMIN
ctl.lsm: AppArmor / SELinux MAC
cv.aria: Four security gate status cards showing PASS, EPERM, or EACCES for each stage
gate.none: All gates passed
gate.nnp: NoNewPrivs
gate.seccomp: seccomp-bpf
gate.caps: Capabilities
gate.lsm: AppArmor / LSM
read.verdict: Kernel result
read.gate: Blocked at gate
read.allowed: Open syscall surface
read.req: Required capability
say.allow: <strong>{probe}</strong> clears all four gates and returns <em>{verdict}</em> ({allowed} syscalls currently open). Hardened pods should drop unused capabilities such as CAP_NET_RAW.
say.seccomp: <strong>{probe}</strong> never reaches kernel logic—<em>seccomp-bpf</em> stops it at Gate 2 with <code>{verdict}</code> (blocking {blocked} dangerous syscalls by default).
say.caps: seccomp lets the call through, yet Gate 3 blocks it with <code>{verdict}</code> because <em>{cap}</em> is missing from the task's capability mask.
say.lsm: Even with seccomp and {cap} open, Gate 4 (AppArmor / SELinux MAC) denies the access via <code>{verdict}</code>.
:::

Uncheck `seccomp-bpf` and grant `CAP_SYS_ADMIN`: both `mount()` and `bpf()` flip straight to `ALLOW`. That is why `--privileged` effectively destroys container isolation—it enables every capability and disables seccomp, AppArmor, and device cgroups at once.

The model leaves out: argument-inspecting seccomp filters (such as allowing `clone()` without `CLONE_NEWUSER`), SELinux MCS category labels, and Landlock unprivileged sandboxing. {.take}

## PID 1 Inside a Container: Lost Signals and Unreaped Zombies {#ch9}

::: strings
toc: PID 1 Signals & Zombies
:::

PID 1 in any Linux PID namespace holds two lonely duties: the kernel refuses to apply default kill behavior to unhandled SIGTERM on PID 1, and every orphaned grandchild is reparented to PID 1 waiting to be reaped with wait(). {.law}

Why does `docker stop` often hang for {=ch9.grace} full seconds before killing a container, leaving half-written HTTP responses behind? One line in a Dockerfile separates clean shutdowns from 10-second hangs: Shell form `CMD "python app.py"` boots `/bin/sh -c` as `PID 1`, whereas Exec form `CMD ["python", "app.py"]` or `--init` (`tini`) replaces or manages `PID 1` properly.

::: diagram dg-pid1 keys=dg.pid1
cap: Figure 9. Signal delivery and orphan reaping under Shell form vs --init (tini). /bin/sh ignores SIGTERM and never reaps orphaned grandchild zombies.
aria: Diagram: top box showing sh as PID 1 ignoring SIGTERM and waiting 10 s for SIGKILL; bottom box showing tini forwarding SIGTERM and reaping zombies
sh1: CMD "python app.py" -> sh is PID 1
sh2: Drops default SIGTERM · leaks zombies
sh3: "Wait 10s -> SIGKILL (exit 137)"
in1: --init -> tini is PID 1
in2: Forwards SIGTERM · loops waitpid()
in3: 1s clean exit (Exit 0 · 0 zombies)
:::

Two Linux rules cause this:

- **Why are signals ignored?** To keep `systemd` from dying on stray signals, the kernel silently ignores `SIGTERM` for PID 1 unless PID 1 registers an explicit signal handler. `/bin/sh` does not handle or forward `SIGTERM`, so Docker waits the entire {=ch9.grace}-second grace window and fires unblockable `SIGKILL` (exit code `{=ch9.exitKill}` = `128 + 9`). {#s1}
- **Why do zombies pile up?** Whenever a grandchild exits after its direct parent died, it becomes an orphan reparented to PID 1 and lingers in the process table as `&lt;defunct&gt;` (`Z` state) until PID 1 calls `waitpid()` on `SIGCHLD`. If PID 1 never reaps children, leaked slots eventually exhaust the PID limit. {#s2}

::: lab ch9-model
model.title: PID 1 Signal Grace Window & Zombie Accumulation
model.how: Switch Dockerfile entrypoints, drag the timeline past t = 5 s (when docker stop sends SIGTERM), and raise orphan spawn rate to watch defunct zombie slots pile up or clear.
ctl.mode: Entrypoint form
mode.shell: Shell: sh -c app
mode.exec: Exec: app as PID 1
mode.init: --init (tini as PID 1)
ctl.t: Timeline (SIGTERM at 5s)
ctl.rate: Orphan spawn rate
ctl.stop: Send docker stop at 5s
cv.aria: Line graph of accumulated zombie slots from 0 to 20 seconds with vertical markers at SIGTERM and final exit or SIGKILL
cv.x: Container uptime (s)
cv.y: Defunct zombie processes
st.running: Running
st.ignoring-sigterm: Hanging (ignores SIGTERM)
st.killed-sigkill: Killed by SIGKILL
st.draining: Draining gracefully
st.exited-clean: Exited cleanly
read.state: Container state
read.zomb: Peak zombie slots
read.wait: Time stuck after stop
read.exit: Exit code
say.run: Container running at t = {t} s with <em>{z}</em> unreaped zombie process slots so far. Drag past 5 s to trace shutdown.
say.hang: At t = 5 s, <code>/bin/sh</code> as PID 1 dropped SIGTERM! Container is hanging through the {grace} s grace window (<em>{wait} s</em> elapsed) with {z} zombies sitting in the PID table.
say.sigkill: The {grace} s grace window expired: Docker sent unblockable <code>SIGKILL</code>, killing the app abruptly with exit code <em>{code}</em> (128 + 9).
say.exec: Exec form puts the app at PID 1 with a signal handler, draining cleanly in 1 s (exit {code}); yet without a <code>SIGCHLD</code> reaper loop, it still accumulated <em>{z}</em> zombies while alive.
say.init: With <code>--init</code>, <code>tini</code> runs as PID 1, reaps orphans on every <code>SIGCHLD</code> (<em>{z}</em> zombies), forwards SIGTERM to the app, and exits in 1 s with code {code}.
:::

At the defaults (`t = 5 s` vs `15 s`), `sh -c` accumulates {=ch9.zombies5} zombies in the first 5 seconds, wastes all {=ch9.grace} seconds ignoring `SIGTERM`, and dies on `{=ch9.exitKill}`. Adding `--init` (`tini`) costs tens of KiB and eliminates both bugs at once.

The model leaves out: Exec apps that implement their own `SIGCHLD` reaper loop, custom `--stop-signal` settings (such as `SIGQUIT` for Nginx), and `pids.max` cgroup fork failures (`EAGAIN`). {.take}

## Where the Frontier Is (November 2026) {#ch10}

::: strings
toc: Where the Frontier Is
:::

Containers are fast because they share one kernel, and fragile for the exact same reason. By November 2026, evolution splits down two tracks: eliminating copy-ups and redundant tarball downloads on startup, and shrinking the shared-kernel attack surface with MicroVMs and WebAssembly sandboxes. {.law}

### Established {#h.est .sub3}

- Container plumbing rests on settled standards: Linux `namespaces(7)` (including `USER` namespaces), unified `cgroups v2` (merged in Linux 4.5 and default across modern Linux distributions and Kubernetes 1.25+), **OCI Image Spec v1.1.0** (released 15 February 2024; maintenance `v1.1.1` on 3 March 2025), **OCI Runtime Spec v1.2.0** (released 13 February 2024), and `seccomp-bpf`. {#e1}
- Foundational cold-start measurement from the Slacker study (Harter et al., USENIX FAST '16): pulling and unpacking full image tarballs accounts for roughly **76%** of container startup time, even though only **6.4%** of downloaded image data is actually read during startup. {#e2}

### Already built {#h.demo .sub3}

- **ID-mapped Mounts (`AT_RECURSIVE` / `idmap`, Linux 5.12+ / 5.19+, containerd 2.x & runc 1.2/1.3)**: Previously, running Rootless UserNS containers with distinct UID offsets forced a recursive `chown -R`, triggering full OverlayFS Copy-Up across gigabytes of layers. With `mount_setattr` (Linux 5.12) and idmapped lower layers in OverlayFS (Linux 5.19), the VFS mount view translates UIDs/GIDs on the fly without copying a single byte (`containerd 2.0` shipped 5 November 2024, `2.1` on 7 May 2025, `2.2` on 6 November 2025; `runc 1.3.0` stabilized mid-2025). {#d1}
- **Hardware-Virtualized MicroVMs (Firecracker & Kata Containers)**: For untrusted multi-tenant code, serverless workers, and AI agent sandboxes, AWS Firecracker (Agache et al., NSDI 2020) strips legacy BIOS and PCI emulation down to a minimal KVM VMM with **&lt; {=ch10.fcMem} MiB** memory overhead per microVM and **&lt; {=ch10.fcBoot} ms** boot time (up to 150 microVMs/sec per host). Kata Containers wraps Firecracker, Cloud Hypervisor, or QEMU behind standard OCI runtime semantics for Kubernetes pods. {#d2}
- **Lazy Pulling & Kernel-Native Read-Only Images (EROFS / Nydus / composefs)**: To skip unpacking entire multi-gigabyte images before executing one binary, CNCF Nydus (RAFS v6) and containerd's native **EROFS snapshotter** (expanded in `containerd 2.2`, November 2025, with parallel unpack, writable layer quotas, and block-backed writable layers for VM containers) mount in-kernel EROFS images directly or stream chunks on demand over HTTP range requests, while `composefs` pairs OverlayFS with `fs-verity` for per-file deduplication and integrity checking. {#d3}
- **WebAssembly System Sandboxes (WASI 0.2 & WASI 0.3)**: Bytecode Alliance shipped **WASI 0.2** (Preview 2) on **25 January 2024** atop the typed WIT Component Model, and ratified **WASI 0.3.0** on **11 June 2026**, adding native `async func`, `stream&lt;T&gt;`, and `future&lt;T&gt;` primitives into the core ABI (enabled by default starting in `Wasmtime 46`). Via containerd Wasm shims, workloads run without bundling a Linux rootfs or exposing 300+ POSIX syscalls. {#d4}

### Specifications, plans and claims {#h.claim .sub3}

- **Trade-offs remain workload-dependent (as of November 2026)**: Reported multi-fold cold-start speedups from Nydus, eStargz, or EROFS snapshotters depend heavily on image size, network round-trip latency, and startup read locality (multi-GB AI inference weights behave differently from 50 MiB microservices) and should be treated as vendor/benchmark claims for specific setups. Likewise, while WASI 0.3.0 is ratified, ecosystem toolchains transitioning from WASI 0.2 (`wasip3` language bindings) remain actively rolling out and cannot replace full POSIX containers that require arbitrary dynamic binaries or direct GPU drivers. {#c1}

Versions, release dates, and kernel support evolve continuously; every frontier note here reflects public status checked as of November 2026. {.take}

## Wrap-up: When a Container Misbehaves, Ask Three Questions First {#ch11}

::: strings
toc: Wrap-up: Three Questions
:::

You do not need to memorize dozens of `/proc` and `/sys` paths. When a container stalls, dies, or leaks, ask three countable questions: Which resource quota throttled or killed it? Which filesystem layer triggered copies or whiteouts? And what still crosses the shared kernel? {.law}

{.qs}
- **Did it freeze or get killed?** Check `nr_throttled` in `cpu.stat` (chapter 6: multi-threaded bursts exhausting 100 ms `cpu.max` buckets in milliseconds), check `oom_kill` in `memory.events` (chapter 7: anon RSS plus `/dev/shm` tmpfs exceeding `memory.max`), and check whether `docker stop` waits a full 10 seconds to exit 137 (chapter 9: `/bin/sh` as PID 1 ignoring `SIGTERM`). {#q1}
- **Why did the image or disk suddenly bloat?** Check three ledgers: did editing an early Dockerfile line invalidate every `ChainID` above it (chapter 2)? Did a separate `RUN rm` leave `.wh.` whiteouts hiding dead lower bytes (chapter 3)? Or did runtime appends/`chmod` copy a massive lower file up into `upperdir`? {#q2}
- **How isolated is it really?** Verify four gates: was `/proc` remounted and `USER` namespace mapped to an unprivileged host UID (chapter 4)? On VXLAN overlays, was container MTU lowered to 1450 B (chapter 5)? Are `seccomp-bpf` enabled and `CAP_SYS_ADMIN` dropped (chapter 8)—and for untrusted tenants, do you need the separate guest kernel of a chapter-10 MicroVM? {#q3}

In one sentence: `docker run` builds no new computer; it dresses an ordinary Linux process in visibility filters, resource limits, and layered mounts—once you trace each symptom back to its kernel counter, container magic disappears. {#sum .sum}

Related essays: [[how-the-os-talks-to-hardware]] (privilege rings, syscall entry, and kernel page cache), [[how-virtual-memory-works]] (memory copy-on-write, page faults, and VM nested paging), and [[how-a-nic-moves-packets]] (NIC driver rings, XDP, and eBPF bypass). {#links}

::: footer
**Sources and specifications.** Open Container Initiative, Image Format Specification v1.1.0 (2024-02-15) and v1.1.1 (2025-03-03), Runtime Specification v1.2.0 (2024-02-13); Linux Kernel 6.x docs and man pages: `namespaces(7)`, `pid_namespaces(7)`, `user_namespaces(7)`, `mount_namespaces(7)`, `cgroups(7)` and `cgroup-v2.rst`, `overlayfs.rst`, `seccomp(2)`, `capabilities(7)`, `veth(4)`, `pivot_root(2)`. Literature & releases: T. Harter et al., *Slacker: Fast Distribution with Lazy Docker Containers*, USENIX FAST '16; A. Agache et al., *Firecracker: Lightweight Virtualization for Serverless Applications*, USENIX NSDI '20; containerd 2.0 / 2.1 / 2.2 (Nov 2024 / May 2025 / Nov 2025) and runc 1.2 / 1.3 release notes; Bytecode Alliance WASI 0.2 (2024-01-25) and WASI 0.3.0 (2026-06-11). Full citations, URLs, and access dates are recorded in BRIEF.md inside this page's directory.

**Model & honest host disclosure.** This page neither invokes a container daemon nor loads external libraries. Because this essay was authored and verified on a macOS Darwin arm64 host lacking a Linux kernel or `docker` / `containerd` / `runc` binaries, chapters 1–9 reimplement the exact OCI and Linux 6.x algorithms in `models.js`; `tools/crosscheck.cjs` checks our pure-JS FIPS 180-4 SHA-256 and canonical OCI Image Index / Manifest / Config / ChainID digests byte-for-byte against Node.js `node:crypto`, and verifies OverlayFS copy-up/whiteout ledgers, namespace PID/UID mappings, VXLAN MTU bounds, CFS `cpu.max` timelines, cgroups v2 memory reclaim/OOM thresholds, seccomp gate order, and PID 1 signal state transitions. Live kernel `unshare`/cgroups execution could not be performed on Darwin and is noted explicitly in BRIEF.md. Modeled boot times and per-packet software path costs are labeled parameters rather than universal hardware constants. This essay was written by Antigravity AI.
:::
