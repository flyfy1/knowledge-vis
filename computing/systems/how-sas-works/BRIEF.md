# BRIEF — 服务器硬盘为什么用 SAS (Why Server Drives Use SAS)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots at 1280/390/320 and reduced motion); independent review pending
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: storage series S3 (`specs/essay-briefs/TASK-storage-series.md`)
Format: long interactive essay. Chinese complete; copy.en.js is a same-keys stub (`enStub`), translation later.
Files: index.html, copy.zh.js, copy.en.js (stub), models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs

## The one question

同样的盘片，做成 SATA 版和 SAS 版，服务器为什么偏偏要 SAS？
Underneath it: what a SCSI command is, and what SAS adds around it (connections, two ports, expanders, wide
ports, end-to-end protection, FEC) that SATA does not.

## Changes from the suggested ladder (TASK prompt)

- ch1 (layer map) added, as in S1/S2. It links to S1 #ch7 for the cross-interface map and zooms into the SAS column.
- "SAS layers (phy/link/port/transport/application, SSP/STP/SMP)" was folded into ch1's table. Its quantitative
  part became a separate ch3: one SSP read on the wire, with frames from 03-245r4 and the cost of opening and
  closing a connection. 8b/10b, FIS and NCQ are not re-taught; the page links to S2.
- The order changed to dual port (ch4) → expanders (ch5) → wide ports (ch6), so that ch5's uplink cap comes
  before ch6's "one connection holds one lane".
- ch5 combines addressing, SMP discovery, zoning and the fan-out model (Erlang C). ch6 is an event-stepped
  simulation of the same fan-out, not the closed formula. It shows that the formula is pessimistic for HDDs.
- ch7 (STP / why not the reverse) is prose only. The connector keying geometry is in SFF-8482, which I did not
  read, so the page says "the SATA plug is keyed out" without dimensions.
- ch8 (PI) adds a fault simulator: link, memory, misdirected write, lost write and media faults, with and
  without PI. It also adds two CRC results computed exhaustively: every 1- and 2-bit error is caught, and the
  first missed 3-bit error is given.
- ch9 models FEC under burst errors with interleaving. The link efficiency (128/150) is in the prose.
- ch10 frontier (dated 2026-11) and ch11 closing (three questions). There is no market-share number; see below.

## Chapters, models, results, tuned parameters

| Ch | Title | Model (models.js) | Basis |
|---|---|---|---|
| 1 | SAS 在地图上的哪里 | table only | T10 drafts page; SAS-2.1 split of SPL |
| 2 | 比任何一根线都老的命令 | `CDB.build/reach/smallest/sspIU/iscsi` | Seagate SCSI manual 100293068 Rev L Tables 107/109/112; 03-245r4 COMMAND IU; RFC 7143 §11.3 |
| 3 | 一次读要开两次门 | `SSP.frames/read` | 03-245r4 frame sizes; open/close time TUNED |
| 4 | 两个端口，两条路 | `AVAIL.run` | NIST e-Handbook 8.1.8.2/8.1.8.3; Exos AFR 0.35%; path MTBFs TUNED |
| 5 | 扩展器：一个口接一百块盘 | `FAN.run`, `FAN.erlangC` | M/M/c (Erlang C); ch3 hold time; Exos 285 MB/s, 168 IOPS; PM7-R |
| 6 | 宽端口：四条道，一辆车 | `WIDE.make/step/measure` | T10/02-335r2 (connections ≤ phys on a wide port) |
| 7 | SATA 盘为什么能插 SAS 口 | prose | 05-190r2 (SAS-1.1 ch5), 06-188r2 (STP affiliation) |
| 8 | 多出来的 8 个字节 | `PI.crc16/tuple/run/allTwoCaught/firstMissedTriple/garbage` | CRC-16/T10-DIF (reveng, Linux crc-t10dif, t10-pi.h); Seagate manual PI; FAST'08 |
| 9 | 24G 为什么要纠错 | `FEC.run/blockFail/singleOk/binomial` | Xia et al. (Broadcom), SIJ 2018; SAS-4 128b/150b, RS(30,26) over 5-bit symbols |
| 10 | 前沿在哪（截至 2026 年 11 月） | `FRONTIER` | sources below |
| 11 | 看到 SAS 时问三件事 | prose | — |

Results pinned in tests/models.cjs:
- READ(6/10/16) byte layouts.
- SSP COMMAND IU: 28 bytes, attribute in byte 9, CDB at 12.
- iSCSI BHS: 48 bytes, byte 1 = C1h for Simple, CDB at 32.
- CRC-16/T10-DIF: check value 0xD0DB, and the Linux table entries 0000/8BB7/9CD9/176E/55B3.
- CRC-32/MPEG-2: check value 0x0376E6E7.
- Erlang C(2, 3) = 4/9.
- The FEC Poisson burst model at b = 1 matches the binomial bound for a t = 2 RS code within 1%.
- singleOk(b) = min(5, 11 − b)/5.
- Wide-port simulation: one SSD fills exactly one lane, and four SSDs fill four.

Key numbers (all from `prose()`):

- **Link rates:** 300/600/1,200/2,400 MB/s per lane; 128/150 = 85.3%.
- **CDB reach:** READ(10) at 512 B reaches 2 TiB (2.20 TB).
- **One 4 KiB read at 24G:**
  - 4,364 bytes on the wire, taking 2.82 µs
  - 61% of the time carries payload, about 355,000 reads/s per lane
  - with a persistent connection: 94%
  - a 1 MiB read: 96.4%
- **Availability:**
  - one path: 65 min/yr (3.9 nines)
  - two paths: 5.2 min/yr (5.0 nines), of which 5.0 min is the drive itself and 8 s is failover
  - SATA drive on a dual backplane: 65 min/yr; with an interposer: 9.4 min/yr
- **Fan-out:**
  - 24 HDDs reading sequentially want 6,840 MB/s against a 4,592 MB/s 12G ×4 uplink, which saturates at 16 drives
  - 96 HDDs reading randomly keep the uplink 1.9% busy
- **Wide port:**
  - one 24G SSD gets 2,274 MB/s, and four lanes carry 9,103 MB/s
  - 12 HDDs at 74% utilisation wait 17.8 µs, and 24 HDDs wait 571 µs
- **T10 PI:**
  - the first missed triple is bits (0, 35, 3,281)
  - 0 of 65,536 random blocks slipped past the guard (seeded)
- **FEC at raw BER 1e-6:**
  - single-bit errors: 5.1×10⁻¹³ per codeword, one uncorrectable codeword every 3.7 h per lane
  - 7-bit bursts: 4.3×10⁻⁶, one every 1.6 ms; with 3-way interleave, 1.2×10⁻¹⁴
  - without FEC, one bad packet every 44.4 µs

Tuned parameters (each is flagged on the page with its sensitivity):

| Parameter | Value | Range tried | Effect (pinned) |
|---|---|---|---|
| SSP connection open + close | 0.5 µs | 0.25–1 µs | 4 KiB efficiency at 24G 74%–45%. The conclusion that small reads waste the link holds. |
| SOF/EOF delimiters | 8 B per frame | — | Assumed (two dwords). It changes the 4 KiB wire total by tens of bytes. |
| Two connections per read | — | persistent toggle | It is shown as a switch on the page. |
| Controller MTBF | 100,000 h | ×0.5–×2 | Single path 107–44 min/yr; dual path 5.3 min/yr. Dual path is insensitive to it. |
| Expander module MTBF / cable MTBF | 300,000 / 1,000,000 h | — | Order of magnitude only. |
| Repair time / drive replacement | 8 h / 24 h | 1–72 h on the slider | The drive term (24 h) dominates the dual-path result. |
| Failover pause | 30 s | 1–600 s on the slider | It becomes the largest term only with a weak controller (2×10⁴ h) and a pause of minutes. |
| Interposer MTBF | 1,000,000 h | — | — |
| Wide-port buffer, seed | 4 transfers, seed 5 | — | Results are deterministic and pinned. |
| FEC burst model | fixed length b, independent starts; ≥ 5 bursts per block = fail | Monte Carlo with 3,000 samples for 3–4 bursts | It agrees with the binomial bound at b = 1. |

## Sources (each opened by me on 2026-11-14 unless stated)

T10 and standards:
- T10 drafts list, https://www.t10.org/drafts.htm — statuses and dates:
  - SAS-4 INCITS 534, final draft 2018-03-28
  - SAS-4.1 INCITS 567-2023
  - SPL-5 INCITS 554-2023
  - SAS-5 INCITS 561 rev 04, 2026-05-11, "INCITS Approval"
  - SNT INCITS 584 rev 05, 2026-04-22, "Development"
- T10/03-245r4, https://www.t10.org/ftp/t10/document.03/03-245r4.pdf — SSP frame header 24 B, IU ≤ 1024 B, CRC 4 B, COMMAND IU layout, task attributes.
- T10/05-190r2, https://www.t10.org/ftp/t10/document.05/05-190r2.pdf — SAS-1.1 ch5 connectors: SAS plug secondary-port pins S8–S14; the SAS receptacle accepts the SATA plug.
- T10/02-482r0, https://www.t10.org/ftp/t10/document.02/02-482r0.pdf — SAS internal cable figure: the SAS plug carries 2 physical links plus power, the SATA-style receptacle 1 (supports ch7's two-port plug).
- T10/05-144r7, https://www.t10.org/ftp/t10/document.05/05-144r7.pdf — zoning proposal (128 zone groups).
- T10/06-188r2, https://www.t10.org/ftp/t10/document.06/06-188r2.pdf — STP affiliation, OPEN_REJECT (STP RESOURCES BUSY).
- T10/02-335r2, https://www.t10.org/ftp/t10/document.02/02-335r2.pdf — wide port rule (connections ≤ phys). I took this from a search excerpt; I did not read the full text.
- smp_utils man pages, https://manpages.opensuse.org/Leap-15.6/smp_utils/smp_conf_zone_perm_tbl.8.en.html — zone permission tables of 128 or 256 groups.
- RFC 7143 (iSCSI), https://www.rfc-editor.org/rfc/rfc7143.txt — §11.3 SCSI Command BHS.

Vendor documents:
- Seagate SCSI Commands Reference Manual 100293068 Rev L, https://seagate.com/files/staticfiles/support/docs/manual/Interface%20manuals/100293068L.pdf — READ(6/10/16) Tables 107/109/112, PI formats, SAS address in the phy log page.
- Seagate Exos data sheet DS2046.1-2512, https://www.seagate.com/content/dam/seagate/assets/support/internal-hard-drive/enterprise-hard-drives/exos/exos-ds2046.1-2512-en_us_V2_en_IN.pdf — 285 MB/s, 168 IOPS 4K random read, AFR 0.35%, MTBF 2.5 M h, 512/520/528 and 4096/4160/4224 B sectors.
- KIOXIA PM7-R, https://americas.kioxia.com/en-us/business/ssd/enterprise-ssd/pm7-r.html — 22.5 Gbit/s, dual-port 128 KiB sequential read 4,150–4,200 MB/s, 720K IOPS.

CRC and reliability:
- Linux lib/crc/crc-t10dif-main.c and include/linux/t10-pi.h, https://raw.githubusercontent.com/torvalds/linux/master/lib/crc/crc-t10dif-main.c and https://raw.githubusercontent.com/torvalds/linux/master/include/linux/t10-pi.h.
- reveng CRC catalogue, https://reveng.sourceforge.io/crc-catalogue/16.htm — CRC-16/T10-DIF: poly 8BB7, init 0, check D0DB.
- NIST/SEMATECH e-Handbook 8.1.8.2 and 8.1.8.3, https://www.itl.nist.gov/div898/handbook/apr/section1/apr182.htm and apr183.htm.
- Bairavasundaram et al., "An Analysis of Data Corruption in the Storage Stack", FAST '08, https://www.usenix.org/conference/fast-08/analysis-data-corruption-storage-stack — 1.53 M disks, 41 months, more than 400,000 checksum mismatches; nearline disks about an order of magnitude more often than enterprise disks. I used the abstract only.
- Xia et al. (Broadcom), "A Study of Forward Error Correction Codes for SAS Channels", Signal Integrity Journal 2018 — target 10⁻¹⁵; raw 10⁻⁶ gives 10⁻¹⁰ on the long channel; about 10⁻⁸ raw is needed; bursts of 7 or more bits defeat the code; interleaving helps. Opened via the Wayback snapshot http://web.archive.org/web/20240416083614/https://www.signalintegrityjournal.com/ext/resources/article-images-2018/A-Study-of-Forward-Error-Correction-Codes-for-SAS-Channels/4041_SAS4_FEC_11132017FinalPDF.pdf because the live site returns 403.

Frontier and trade press:
- STA/INCITS 24G+ SAS release, 2024-07-23, https://www.pr.com/press-release/916095.
- STA plugfest release, 2026-10-27, https://www.einpresswire.com/article/951848383/sta-plugfest-showcases-continued-sas-innovation-and-interoperability.
- Blocks & Files, 2023-11-23, https://blocksandfiles.com/2023/11/23/sas-roadmap — Cameron Brett: no 48G; 24G+ PHY at 22.5 Gbps; SAS stays the main HDD interface through 2027.
- Synopsys blog via design-reuse (2016), https://design-reuse.com/industryexpertblogs/40250/decoding-sas-24g-new-encoding-and-features.html — 128b/150b packet structure.

## Facts that will go stale

All of ch10, kept in `FRONTIER` in models.js and dated as of 2026-11:
- SAS-5 approval status and SNT status
- 24G+ feature list
- plugfest participants
- the Brett roadmap claim
- PM7-R figures

The Exos data sheet figures (285 MB/s, AFR) change with each drive generation.

## Checked / not checked

Checked against primary sources:
- CDB layouts, the SSP IU layout and frame sizes, the iSCSI BHS
- CRC-16 T10-DIF constants and table, PI tuple layout and sector formats
- SAS line rates and encodings, RS(30,26) symbol arithmetic
- T10 statuses and dates, the zone group sizes, STP affiliation, connector pin facts
- Exos and PM7-R figures

Not verified from a primary source:
- SPL-4/SAS-4 normative text (paywalled). 128b/150b, RS(30,26), 5-bit symbols and t = 2 come from Xia et al. and vendor blogs, which agree with each other. The real interleaving and bit ordering are not reproduced.
- SOF/EOF delimiter size (assumed 8 B per frame) and the SAS frame CRC's init/inversion conventions. The page uses a generic MSB-first CRC-32 and says so.
- SFF-8482 keying geometry (not read).
- Connection open/close time (tuned), and all path MTBF/MTTR values (tuned).
- 02-335r2: only a search excerpt.
- Market share of SAS vs NVMe in enterprise: the aggregator reports contradict each other and none is primary, so the page gives no number.
- Whether 24G+ has been published as a standard (the T10 page lists SAS-5 as in approval).
- A Tom's Hardware article ("SAS storage isn't dead yet") was truncated and is not used.
- SNIA and Microchip pages returned 403 and were not used.

## For the translator

copy.en.js is a same-keys copy of copy.zh.js with `window.ESSAY_COPY.enStub = true`. While that flag is set, the
page shows Chinese, and the tests skip the English sweep and the registry-en title match. Translate every value,
keep every `{placeholder}` and HTML tag, then delete the `enStub` line. The English title must equal
REGISTRY.json `title.en` ("Why Server Drives Use SAS"). Regenerate nothing by script after translation starts.
