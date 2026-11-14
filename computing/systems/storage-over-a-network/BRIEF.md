# BRIEF — 隔着网线的硬盘 (Drives Across a Wire)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: Claude Code (claude-opus-5-5): independent review of zh+en copy, models, sources and tests, 2026-11-15 (see Review); builder self-check (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots at three widths)
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: storage series S5 (`specs/essay-briefs/TASK-storage-series.md`)
Format: long interactive essay, Chinese and English (`copy.en.js` has the same keys and placeholders; the `enStub` flag is gone). Who translated it is not recorded in this directory; check the commit trailers.
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

硬盘明明插在别的机器里，你的电脑为什么能把它当成自己的盘？同样叫网络存储，为什么有的叫 NAS、有的叫 SAN，数据中心又为什么要把 NVMe 搬到网线上？
Refined on the page into one question: **一块盘离开机箱、隔了一段网络之后，什么变贵了？** The answer that runs through
the chapters: round trips (who waits for whom), losses (who resends), distance (light at 4.9 µs/km) and broken
paths (who takes over). Each protocol is a choice of which side pays for these.

## Changes from the task's suggested ladder

- ch1 merges "place on the layer map" with "block vs file vs object". The map is a table of eight protocols by
  level / command language / transport / wire, in S1 ch7's vocabulary. Model: bytes moved to change k bytes.
- ch2 NAS: model is the asymptotic bounds of operational analysis (files in flight ÷ per-file time vs link rate)
  instead of a separate close-to-open model; close-to-open is prose with RFC 7530 §10.3.1 and nfs(5) defaults.
- ch3 iSCSI does not redo the 48-byte BHS byte layout (S3 ch2 already builds the CDB inside it; linked). The
  model is the write path under RFC 7143's negotiated keys (InitialR2T, ImmediateData, FirstBurstLength,
  MaxBurstLength, MRDSL, MaxOutstandingR2T=1): round trips, PDUs, time.
- ch4 FC credits: sliding-window model, animated link plus utilisation curve; generations in prose.
- ch5 latency budget uses measured fabric round trips (SPDK 24.05, null bdev) rather than per-layer guesses;
  pairs with NVMe ch1 and reuses its media presets.
- ch6 TCP/RDMA: model compares go-back-N, ideal selective repeat and the Mathis TCP bound vs loss rate.
- ch7 NVMe-oF: capsule-by-capsule message ladder for iSCSI, NVMe/TCP, NVMe/RDMA; FC-NVMe prose only (not opened).
- ch8 multipath: two M/M/1 paths with the square-root split, plus failover; Linux timeouts in prose. Links S3 ch4
  for the availability arithmetic instead of redoing it.
- ch9 replication vs EC kept to one model (overhead, MTTDL nines, repair reads).
- ch10 frontier, ch11 closing (three questions). 11 chapters, 9 models.

## Chapters, models, published results, tuned parameters

1. **块、文件、对象** — Law: what you ask the far side for decides who owns the file system. Model `LEVEL.cost`:
   block = whole 4 KiB blocks (+ a read of a partial block if not cached); file = the k bytes (NFS/SMB WRITE);
   object = whole object (+ GET if not cached). Exact accounting of the protocols' semantics. Limits: no metadata,
   journal or headers; aligned start.
2. **NAS** — Model `NAS.run`: D = k·RTT + s/B; X = min(P/D, B/s); T = N/X (Lazowska et al. 1984 ch. 5 bounds).
   Test checks the bound against a fluid simulation of P workers sharing the link. "Round trips per file" k is a
   knob, not a measured count (said on the page).
3. **iSCSI** — Model `ISCSI.write`: RFC 7143 §13.10–13.17 rules; TCP/IP/Ethernet overhead per 1448-byte segment
   (MTU 1500 with timestamps; preamble + IFG counted). Time = rounds·RTT + wire/rate (no TCP window limit, no
   overlap: said on the page). Test hand-counts the default 1 MiB case (4 R2T, 127 Data-Out, 133 PDUs, 5 rounds).
4. **Fibre Channel** — Model `FC.run`: U = min(1, W·t_f/(t_f + 2·t_prop)) (Stallings §7.1); need = ceil(2t_p/t_f)+1;
   frame = payload + 36 + 24 idle bytes; 4.90 µs/km (group index 1.47). Test checks against an event simulation
   of a credit-limited link, and against Brocade's "LinkSpeed/2 credits per km" rule (model within 15%).
5. **Latency budget** — Model `BUDGET.run`: media (NVMe essay ch1 presets 8500/75/10 µs) + measured fabric RTT +
   2·d·4.90 µs + 2·hops·switch. **Tuned:** switch 1 µs per traversal; halving/doubling with three switches moves a
   NAND read from 99.4 to 108.4 µs (page says so; test pins share stays 20–35%).
6. **Loss** — Model `LOSS.run`: GBN U = (1−p)/(1+(W−1)p) (Stallings §7.3), SR U = 1−p, Mathis
   (MSS/RTT)·√1.5/√p capped at link. Test checks GBN against a slot simulation and both inversions.
7. **NVMe-oF capsules** — Model `CAPS.run`: message lists from NVMe/TCP 1.1 Figures 30–34 (72/24/24/24 bytes),
   RFC 7143 BHS 48, RoCE v2 headers (Eth 14, IPv4 20, UDP 8, BTH 12, RETH 16, AETH 4, ICRC 4, FCS 4). Pure
   ACKs not counted; one C2HData per read; RDMA MTU 4096. Test hand-counts a TCP read and an RDMA write.
8. **Multipath** — Model `MP`: T = p/(μ1−pλ) + (1−p)/(μ2−(1−p)λ) (Kleinrock vol. 1); optimum by the square-root
   rule (test checks against brute-force minimisation at five loads). **Tuned:** path-2 speed = 0.5 × path 1;
   test pins that at 0.25× and 1× the conclusions (spilling beats optimized-only at 80k/s; failover unstable
   unless the paths are equal) hold as stated.
9. **Replication vs EC** — Model `EC.run`: overhead n/k, tolerance n−k (exact); MTTDL ≈ μ^m/(λ^(m+1)·n(n−1)…(n−m))
   (standard Markov approximation); test checks it within 5% of the exact absorbing-chain solution for all four
   schemes. AFR from Backblaze 2025 counts (4317 failures / 115,638,676 drive days = 1.36%). **Tuned:** MTTR 24 h;
   48 h lowers both by about one nine, order unchanged (pinned). Greenan/Plank/Wylie 2010 critique cited on page.
10. **Frontier** — data block `FRONTIER` in models.js; dates pinned by the test.
11. **Three questions** — no model.

## Sources (opened by me on 2026-11-14 or 2026-11-15 unless stated)

- RFC 7143, iSCSI (Consolidated), April 2014 — https://www.rfc-editor.org/rfc/rfc7143.txt (2026-11-14): §11.2.1
  BHS 48 bytes; §13.1 digests (CRC32C) default None; §13.10 InitialR2T Yes; §13.11 ImmediateData Yes and the
  unsolicited-data table; §13.12 MRDSL 8192; §13.13 MaxBurstLength 262144; §13.14 FirstBurstLength 65536;
  §13.17 MaxOutstandingR2T 1; iqn examples; port 3260.
- RFC 7530, NFSv4, March 2015 — https://www.rfc-editor.org/rfc/rfc7530.txt (2026-11-15): §10.3.1 revalidate after
  OPEN, flush before CLOSE; COMPOUND procedure.
- Linux nfs(5) — https://man7.org/linux/man-pages/man5/nfs.5.html (2026-11-15): acregmin 3, acregmax 60,
  acdirmin 30, acdirmax 60; cto default.
- NVM Express TCP Transport Specification Revision 1.1, 2024-08-05 —
  https://nvmexpress.org/wp-content/uploads/NVM-Express-TCP-Transport-Specification-Revision-1.1-2024.08.05-Ratified.pdf
  (2026-11-14): Figure 11 capsule sizes, Figure 26 ICReq HLEN 128, Figure 30 CapsuleCmd HLEN 72, Figure 31
  CapsuleResp 24, Figures 32–34 H2CData/C2HData/R2T 24, C2HData SUCCESS flag, §3.3.1.1 digests.
- Linux kernel sources (github.com/torvalds/linux master, 2026-11-14): include/linux/nvme-tcp.h (struct layouts,
  digest 4), include/rdma/ib_pack.h (header byte counts), drivers/infiniband/sw/rxe/rxe_hdr.h (RETH, AETH),
  drivers/nvme/host/fabrics.h (ctrl_loss_tmo 600, reconnect_delay 10, fast_io_fail off), drivers/nvme/host/nvme.h
  (NVME_DEFAULT_KATO 5). open-iscsi etc/iscsid.conf (replacement_timeout 120, noop_out 5/5).
- IANA service names and ports CSV (2026-11-14): iscsi-target 3260, nvme 4420, nvme-disc 8009, roce 4791/udp
  registered 2014-10-17.
- SPDK NVMe-oF TCP and RDMA Performance Reports, Release 24.05 (Mellanox ConnectX-5) —
  https://review.spdk.io/download/performance-reports/SPDK_tcp_mlx_perf_report_2405.pdf and
  …/SPDK_rdma_mlx_perf_report_2405.pdf (2026-11-14): Test case 3, Tables 21/22, QD1 4 KiB random read, null bdev,
  point-to-point without switch, Xeon Gold 6348, Linux 6.0.18: TCP SPDK 17.50 µs, kernel 21.39 µs; RDMA SPDK
  4.72 µs, kernel 12.10 µs.
- Chelsio, "100G Kernel and User Space NVMe/TCP Using Chelsio Offload" (2021) —
  https://www.chelsio.com/wp-content/uploads/resources/t6-100g-nvmetcp-offload.pdf (2026-11-14): kernel TCP↔kernel
  TCP 4K read delta 21.46 µs. Vendor of offload NICs; used only as a cross-check of the kernel number.
- Wikipedia, "Fibre Channel" speed table, citing the FCIA speedmap (2026-11-14). FCIA PDFs returned 403.
- Brocade buffer-credit rule (LinkSpeed/2 per km for full frames), via search excerpts of Fabric OS admin guides and
  an IBM community post by David Green, 2020-10-14 (https://community.ibm.com/…/distance-link-tuning-on-fibre-channel-networks, opened 2026-11-14).
- R. Mittal et al., "Revisiting Network Support for RDMA", SIGCOMM 2018, arXiv:1806.08159 (2026-11-14): RoCE needs
  PFC; current NICs use go-back-N.
- M. Sathiamoorthy et al., "XORing Elephants", PVLDB 6(5) 2013, arXiv:1301.3791 (2026-11-14): Facebook HDFS
  RS(10,4), 40% overhead, repair transfers 10 blocks, repair traffic 10–20% of ~2 PB/day in a 3000-node cluster.
- Backblaze Drive Stats for 2025 (published 2026-02-12), via search result excerpts of the blog and the Business
  Wire release (2026-11-15): 4,317 failures, 115,638,676 drive days, AFR 1.36%.
- kernelnewbies Linux 5.0 (2026-11-15): NVMe/TCP host and target drivers; released 2019-03-03.

## Facts that will go stale (frontier, as of November 2026)

- NVMe 2.4 specification set released 2026-08-04 (nvmexpress.org/specifications, 2026-11-14; also The Register
  2026-08-04 and Business Wire 2026-08-04 via search).
- UEC Specification 1.0, 2025-06-11 (Linux Foundation press release https://www.linuxfoundation.org/press/uec-launches-spec-1.0, 2026-11-14). Claim "millions of endpoints" attributed.
- CXL 4.0, 2025-11-18, 128 GT/s (CXL Consortium release PDF and Blocks & Files 2025-11-24, via search excerpts; PDF not opened).
- Microsoft Windows Server Insider in-box NVMe-oF initiator (TCP, RDMA), Tech Community post dated 2026-03-13
  (opened 2026-11-14); not in released Windows Server 2025 (vendor note via search).
- Broadcom Brocade X8 directors and G820 56-port 128G switch, 2025-11-19 (StorageReview 2025-11-19, opened
  2026-11-14; Broadcom IR page returned 403). 128G HBAs: none found.
- 256GFC / FC-PI-9 as next FCIA step: from search excerpt of the FCIA 2024 Solutions Guide (PDF 403).

## Checked / not checked

Checked: every number in the prose is a `prose()` placeholder or a SPEC/FRONTIER/DEFAULTS value (test enforces);
every model re-derived independently in the test; every live sentence branch reached; every link to a site page
and anchor exists; no sibling-owned alias (S1, S2, S3, USB draft, NVMe, why-compute-waits-for-memory, both
tech/networks drafts) is taken.

Not verified from a primary source:
- FC frame layout (SOF 4, header 24, data ≤ 2112, CRC 4, EOF 4 = 2148; six idles between frames): FC-FS is
  paywalled; from secondary sources. Per-generation MB/s and 128GFC = 12,425 MB/s: Wikipedia's copy of the FCIA
  speedmap. The frame size is a control on the page, so the qualitative conclusion does not hinge on it.
- SMB2 compounding (MS-SMB2) and port 445: not opened.
- S3 "PUT replaces the whole object" semantics: from general knowledge of the API; not opened.
- Stallings, Kleinrock, Lazowska, Mathis 1997, Guo et al. 2016, DCQCN, Greenan et al. 2010: cited from memory
  of the texts; formulas re-derived in the test, papers not reopened.
- Light at 4.90 µs/km uses a group index of 1.47 (typical silica fibre); no datasheet opened.
- CXL 4.0 date and rate, NVMe 2.4 contents, Backblaze counts: search excerpts or secondary pages, not the PDFs.
- How many round trips real NFS/SMB clients make per small file: not measured; the page treats it as a knob.

## For the translator

Done: `copy.en.js` is a full translation, revised in the review below. Keep it key-for-key with `copy.zh.js`; the
model test checks keys, placeholders, and that `title.en`/`desc.en` in `REGISTRY.json` equal `doc.title` (before
" · ") and `doc.desc`.

## For the registrar

- zh title 隔着网线的硬盘 / en Drives Across a Wire; category computing, subtopic systems, stage university.
- Links out (live): what-a-drive-is-made-of #ch1 #ch7, how-sas-works #ch2 #ch4, why-nvme-is-fast #ch1 #ch3 #ch4
  #ch8, tcp-congestion #step1 #step4, distributed-systems #step0, why-compute-waits-for-memory #ch10.
- Mentioned as plain text (not linked) at build time: 《移动硬盘为什么跑不满》 (S4 draft); linked since registration (below). The tech/networks drafts
  (how-a-web-page-arrives for RTT/TCP, how-much-a-wire-can-carry #ch8 for Reed–Solomon) are not linked because
  they are not registered; link ch2/ch6 and ch9 to them once they are.
- Suggested atlas edges: ch1→ch2, ch1→ch3, ch3→ch7, ch5→ch6, ch5→ch7, ch4→ch6 (credits ↔ PFC), ch8 → how-sas-works
  #ch4, ch5 → why-nvme-is-fast #ch1, ch9 → distributed-systems.

## Review

Reviewer: Claude Code (claude-opus-5-5), separate session; did not build or translate the page. Date 2026-11-15.
Scope: zh and en read in full, every key of `copy.zh.js` and `copy.en.js`; every model driven to its extremes and
awkward middle values in both languages with the live sentence read each time (script in
/tmp/agent-tasks/storage/review-s5/); models re-derived by hand; sources reopened as listed below.
Verified-By form: `Claude Code (claude-opus-5-5): independent review of zh+en copy, models, sources, tests`.

### Checks (re-derived or reopened)

- ch1: 1 byte in 8 MiB cold = 4096 read + 4096 write = 8192 B; object GET+PUT = 16 MiB. Exact.
- ch2: D = 3·0.5 ms + 65536/125e6 s = 2.024 ms; T = 2.02 s; big file 0.526 s; s* = k·RTT·B = 183 KiB; at 30 ms,
  16 in flight: 1000/(16/90.52 ms) = 5.66 s. Matches the asymptotic bound X ≤ min(N/(D+Z), 1/D_max) (Lazowska ch. 5,
  with k·RTT as think time Z). Close-to-open: RFC 7530 §10.3.1 reopened (both rules; conditions now stated, see below).
- ch3: RFC 7143 reopened (rfc-editor txt): §11.2.1 BHS 48 bytes; §13.10 InitialR2T Yes; §13.11 ImmediateData Yes
  and the unsolicited-data table; §13.12 MRDSL 8192 and the FirstBurstLength cap on unsolicited PDUs; §13.13
  MaxBurstLength 262144; §13.14 FirstBurstLength 65536 (≤ MaxBurstLength); §13.17 MaxOutstandingR2T 1; §4.2.7.4
  iqn example. Hand count for 1 MiB: 8 KiB immediate, 4 R2T, 127 Data-Out, 133 PDUs, 5 round trips. Agrees.
- ch4: tf = 2172 B/1600 MB/s = 1.3575 µs; 50 km: need ceil(490.3/1.3575)+1 = 363; U = 40·1.3575/491.7 = 11%.
  Brocade rule: 2·d·5 µs/km ÷ (2148·10 bit / 8.5 GBd) ≈ 3.96 ≈ 8/2 per km at 8GFC, i.e. the same formula; model
  363 vs rule 400 per 100 km (9% apart). Wikipedia speed table reopened: 1/2/4/8/16/32/64/128GFC = 100…6400, 12,425
  MB/s; market years 1997/2011/2016/2020 as stated. FC-FS frame layout still secondary.
- ch5: SPDK 24.05 TCP and RDMA reports reopened (PDF text extracted): Tables 21/22, QD1 4 KiB random read, null
  bdev: TCP 17.50 / 21.39 µs, RDMA 4.72 / 12.10 µs; Xeon Gold 6348, ConnectX-5, Linux 6.0.18, point-to-point
  "without any switches". NVMe essay presets 8500/75/10 µs confirmed in its models.js.
- ch6: Stallings GBN U = (1−p)/(1+2ap) with W = 2a+1 → (1−p)/(1+(W−1)p). Mathis 1997 reopened (CCR PDF): sawtooth
  derivation gives C = √(3/2) for periodic loss; Table 1 (page 2, rendered and read) lists 1.22 = √(3/2), 0.87 =
  √(3/4) with delayed ACKs, 1.31 random loss (0.93 delayed); the alternatives 1.31 and 0.87
  are now stated in ch6.limit and pinned (TCP still far below GBN at the defaults).
- ch7: NVMe/TCP 1.1 PDF reopened: Figure 26 ICReq HLEN 128, Figure 30 CapsuleCmd 72, Figures 31–34 24 bytes,
  SUCCESS flag in the last C2HData suppresses the response capsule. Hand count of a 4 KiB TCP read: 162 + 4390 B
  on the wire, 456 B overhead, 90.0%.
- ch8: Square-root rule derived: minimise Σ λi/(μi−λi) s.t. Σλi = λ → μi/(μi−λi)² equal → μi−λi ∝ √μi. Defaults:
  λ1 = 100 − 10·70/17.07 = 59.0k (74%), T = 27.0 µs. Linux defaults reopened (kernel master): NVME_DEFAULT_KATO 5,
  NVMF_DEF_RECONNECT_DELAY 10, NVMF_DEF_CTRL_LOSS_TMO 600; `nvme_keep_alive_work_period()` sends every kato/2.
- ch9: MTTDL ≈ μ^m/(λ^(m+1)·n(n−1)…(n−m)) is the standard approximation with one repair at a time (parallel repair
  would add a factor m!); 3×: 9.9 nines, RS(10,4): 14.2. Halving/doubling MTTR pinned by the builder.
- Frontier, two places each: NVMe 2.4 on 2026-08-04 (The Register and Business Wire via search; set includes TCP
  1.3 and RDMA 1.3); Windows Server NVMe-oF initiator preview post 2026-03-13 (Microsoft Tech Community and Lightbits
  2026-05-28 release, via search); Broadcom X8/G820 2025-11-19, G820 56×128G (All About Circuits, Investing.com via
  search); UEC 1.0 2025-06-11, "millions of endpoints", "modern RDMA for Ethernet and IP" (Linux Foundation release,
  opened); CXL 4.0 2025-11-18, 128 GT/s (CXL Consortium release PDF and Converge Digest, via search); Backblaze 2025
  AFR 1.36% (Backblaze blog, opened; failure and drive-day counts only via TechRadar/StorageReview, and they reproduce
  1.36%).
- Links and anchors (18 targets) resolve; no alias of S1–S4, NVMe or the memory essay is taken; English titles of
  linked pages match `pages.config.js`; no CJK in English mode (browser test, including canvas text and aria).
- No buying advice; vendor claims (UEC scale, "11 nines", Broadcom "first") are attributed.

### Changes

- ch8.p4 (zh+en): **error fixed** — the Linux NVMe-oF host does not send a keep-alive every 5 s; 5 s is the
  timeout and the command goes every 2.5 s (`SPEC.linux.kaPeriod`).
- ch2: the live sentence said "stuck on round trips, link only 99.9% used" for 16 MiB files; it now switches to the
  "almost as fast as one big file" sentence within 25% of the big-file time (models.js `say.nas`, pinned).
- ch5: choosing "local PCIe" with distance or switches set added fibre and switch time to a local drive and said
  the network dominated; local now ignores both (models.js `BUDGET.run`, pinned). Live sentence no longer reads
  "每秒 … 次/秒" / "per second per second". Zero shows as 0 µs / 0%, not 0.00 ns / 0.00%. ch5.limit now says the null
  bdev figure also contains the host I/O stack, so the network share is slightly overstated.
- ch8: new sentence when load exceeds both paths together (it used to say "the best split is ∞"); the spill
  sentence no longer claims the optimised path "has begun to queue" when the paths are equal; best-share readout
  shows — when no split works.
- ch9: yearly loss probability uses expm1, so the nines no longer show "—" for small MTTR and AFR (prose values
  unchanged at the printed precision).
- ch3: small speeds keep two or three decimals (0.04 MB/s, not 0.0 MB/s).
- ch2.p2: RFC 7530 §10.3.1 conditions stated (absent delegation; the OPEN check is mandatory only for some opens).
- ch6.limit: Mathis constant assumption and its alternatives, with the direction and size of the shift.
- English: table headers now "Protocol / Asks for / Command language / Carried by / Wire / In this essay" with values
  "Files / Blocks / Whole objects"; on ≤ 640 px the header row is removed (each cell already carries its column name),
  which also fixes header cells sticking out of the viewport at 390/320 in English. "untick" → "tick" (zh 勾掉 →
  勾上: the box starts unticked). Plurals in ch7/ch9 sentences ("1 round trips", "1 drive failures", "block(s)") and
  "(64 R2T)" rewritten. ch6.law "dislike loss" → "cope worst with loss"; hero and ch11.sum: 接 is "another path takes
  over", not "reconnect"/"replace a cable" (zh made explicit the same way).
- tests/browser.cjs: radios and checkboxes clicked through their visible labels (no forced clicks on 1-px inputs),
  each assertion waits for its condition (≤ 3 s) instead of an 80 ms sleep; copy.en.js 404 filter and stub comments
  removed; new drive checks for the local-drive and overload fixes. tests/models.cjs: pins for the fixed sentence
  states, the Mathis alternatives and finite nines.

### Results

`node tests/models.cjs` PASS 1478 checks. `tests/browser.cjs` PASS three runs in a row (zh+en at 1280/390/320, reduced
motion). Canvas sweep (`--sweep`, scroll-aware): first run found 27 states where the English ch9 axis label "No loss in a year (nines)" ran past the 320 px canvas; shortened to "Nines, one year"; rerun PASS 1538 states, zh+en × 1280/390/320. Table header "Chapter" renamed "In this essay" (stacked cells read "In this essay: Chapter 2"). Screenshots in /tmp/agent-tasks/storage/review-s5/shots/.

### Unverified

- FC-FS frame layout (2148 B, six idles) and per-generation encodings: secondary only (FCIA and INCITS PDFs not
  opened). SMB2 compounding (MS-SMB2), S3 PUT semantics, Stallings, Kleinrock, Lazowska, Guo 2016, Greenan 2010,
  Mittal 2018 text: not reopened (formulas re-derived instead).
- Frontier dates other than UEC and Backblaze AFR: search excerpts from two outlets each, primary pages not opened.
  Windows Server 2025 not including the initiator: vendor note via search only.
- Backblaze failure and drive-day counts: secondary only (consistent with the primary 1.36%).
- XORing Elephants figures (10–20% of ~2 PB/day, 3000 nodes): not reopened.

## Registrar (2026-11-15)

- After the reviewer's last edit the registrar reran `tests/models.cjs` (1478 checks), `tests/browser.cjs` and the canvas
  sweep (1538 states): all PASS, then committed the essay as reviewed (d7abd777).
- Cross-links: ch11.links links how-usb-drives-talk and its #ch6 (SCSI translation in the enclosure) instead of "in
  preparation", zh and en; `tests/models.cjs` replaces the "no link to the unregistered USB draft" check with checks of those
  two links and checks that zh and en carry the same links. Every outbound link (25 per language) resolves to a page and an
  anchor. S1 ch7.p4, S2 ch10.links, S3 ch1.p3 (#ch3, #ch4) and ch11.links (#ch3, #ch4, #ch7), S4 ch6.p1 and ch11.links (#ch3)
  link this essay. The tech/networks drafts stay unlinked (not registered); S6 does not exist yet.
- Search aliases added from the one-click check (homepage and atlas, the 20 queries of the registrar's brief plus about
  60 variants and neighbour words): NAS 是什么, what is a NAS (#ch2); NVMe over TCP 是什么, what is NVMe over TCP (#ch7);
  multipath (#ch8; 多路径 already landed here, 多路径是什么 and multipath storage stay on how-sas-works #ch4); erasure coding vs
  replication (#ch9). None is owned by another page. Words left with their owners: 数据副本, data replication, CAP 定理
  (distributed-systems), 网络延迟, network latency, 丢包重传 (tcp-congestion), Reed-Solomon (how-sas-works #ch9), iSCSI CDB,
  SCSI 命令 (how-sas-works #ch2).
- `index.html` loads its four scripts with `?v=20261115` (specs/essays.md, "Cache keys").
- Atlas edges: 13 (6 between chapters; 1 from what-a-drive-is-made-of #ch7, 2 from how-sas-works #ch2 and #ch4, 2 from
  why-nvme-is-fast #ch1 and #ch4, 1 from tcp-congestion step 1, 1 from distributed-systems).
