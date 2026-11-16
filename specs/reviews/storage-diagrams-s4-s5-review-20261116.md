# Review: static diagrams for S4 (how-usb-drives-talk) and S5 (storage-over-a-network), 2026-11-16

Reviewer: Claude Code subagent (claude-opus-5-5). Scope: the uncommitted diagram retrofit (STANDARD.md §4a) in
`computing/systems/how-usb-drives-talk/` (9 diagrams) and `computing/systems/storage-over-a-network/` (10 diagrams):
models.js `dgVals()`, app.js `DG.*`, index.html figures, `dg.*` copy keys, tests. Prose and models outside the diagrams
were not re-reviewed.

## Verdict

Ready to register after the fixes below. All tests pass (see the end). The blocking defects were labels spilling out
of their boxes, which the builder's browser check could not see; the check now covers that.

## Defects found and fixed

Layout (seen in screenshots; the original `diagramCheck` tested label against label and against the viewBox, not
label against its own box):

1. S4 `stack`, wide, en and zh: the drive-controller, bridge host-side and bridge device-side labels spilled out of
   their 56-unit boxes (three lines in en). The bridge and drive boxes are now 168 wide and 70/50/70 tall; the arrows
   and link lines were moved to match.
2. S4 `heat`, narrow, en and zh: "Heat: drive and chip power P" ran across the chip's heat arrow. In the narrow layout
   the arrows are now at x = 48 / 298, and the label has a wrap width that stops short of the right arrow.
3. S4 `heat` caption: "the model is the drawing on the right" was wrong in the narrow layout, where the circuit sits
   below. Now "the circuit drawing" / 「其中的电路图」.
4. S4 `uas`: the data-out lifeline ran through "Idle during reads". The line now has a gap around the label.
5. S5 `caps`, wide and 320, en: the NVMe/TCP PDU-header label spilled out of its box (four lines). That row is now
   taller (76 wide, 50 narrow; `rowY` helper), and the label drops the redundant "NVMe/TCP" (the column title says it):
   "Command PDU header: 8-byte common header, 72 bytes with the command" / 「命令 PDU 包头：…」.
6. S5 `level`, wide and 320: "The file system is on your side…" (4 lines) spilled out of its box, and the file-level
   "on the server" box was tight. Boxes are taller and the grey frame was extended.
7. S5 `path`, wide, en: "Protocol stack (kernel or user space)" touched its box edges. The boxes are now 158 × 63.

Test change (both pages' `tests/browser.cjs`): `lbox` in app.js now marks each centred label with `data-in="x,y,w,h"`,
and `diagramCheck` requires the label's `getBBox()` after wrapping to stay inside that box with 2 units of clearance,
at 1280/390/320 in both languages. This adds a check and loosens nothing. Before the fixes it flagged items 1, 5, 6
and 7; afterwards it reports nothing.

Copy and facts:

8. S5 `dg.caps.cdb`: "CDB up to 16 bytes" was not right. RFC 7143 §11.2.2.3 carries longer CDBs in an Extended CDB AHS.
   It now reads "a 16-byte CDB field" / 「16 字节的 CDB 字段」 (the BHS field is 16 bytes, §11.3).
9. S5 `dg.fc.credit` (en): "…stops and waits, and never sends anyway." was garbled. Now "…stops and waits; it never
   sends without one."
10. S5 `dg.rdma.cap` (en): the linked title now uses the site's quoted form, "chapter 11 of “How a Network Card Moves
    Packets”". The title matches pages.config.js, and `#ch11` exists (the RDMA chapter).
11. S4 `dg.stick.aria`, zh and en: it stated "four channels to thirty-two dies" as fact, while the label says the counts
    vary. It now says the drawing shows four channels of eight.

## Verified, and against what

- RFC 7143, opened (rfc-editor.org text): BHS 48 bytes (§11.2.1). Extended CDB AHS for CDBs > 16 bytes (§11.2.2.3,
  §11.3). Defaults: InitialR2T=Yes, ImmediateData=Yes, MaxRecvDataSegmentLength 8192, MaxBurstLength 262144,
  FirstBurstLength 65536, MaxOutstandingR2T 1 (§13). These give the drawn ladder: 8 KiB immediate, then R2Ts of
  256/256/256/248 KiB with 32/32/32/31 Data-Out PDUs, 133 PDUs and 5 round trips. The node test pins all of it.
- Checked from memory of the specs, not opened in this review:
  - USB 2.0 Table 5-10: 512-byte bulk, 13 per microframe, 55 bytes overhead, 7,500-byte microframe, 129 left. Bulk IN
    is token / DATA / ACK, and a device that is not ready answers NAK.
  - USB 3.2 packets: 20-byte header packet, then DPPSTART 4 + up to 1,024 data + CRC-32 4 + DPPEND 4 = 32 bytes of
    overhead. 8b/10b at Gen 1 and 128b/132b at Gen 2.
  - Mass storage: BOT CBW 31 bytes, CSW 13 bytes, CB up to 16 bytes, protocol codes 50h/62h. The four UAS pipes;
    over USB 3 the tag is the stream ID, up to 65,533.
  - USB4: PCIe tunnel through host router and device router, with the PCIe switch in the device (consistent with
    how-thunderbolt-works §11).
  - Fibre Channel framing: SOF 4 / header 24 / payload ≤ 2,112 / CRC 4 / EOF 4 = 2,148 bytes, and at least 6
    primitives = 24 bytes of idle. R_RDY returns a buffer-to-buffer credit.
  - RoCE v2: UDP port 4791, 12-byte BTH (consistent with how-a-nic-moves-packets ch11, which also describes
    go-back-N).
  - NVMe/TCP: 8-byte common header and 72-byte command capsule PDU header with a 64-byte SQE (64 bytes as in
    why-nvme-is-fast).
  - Erasure coding: RS(10,4) gives 1.4× space, survives 4 failures, and a rebuild reads 10 fragments. Three replicas
    give 3× space and survive 2 failures.
- Drawn numbers: every one comes from `dgVals()` and is pinned in `tests/models.cjs`. "To scale" is honest in each place
  it is claimed: the S4 microframe bar (bytes), the encoding bars and the chain pipe thickness (model MB/s, with box
  and pipe lengths stated as schematic), and the S5 NAS timeline (model ms). Every other diagram's caption says it is
  schematic.
- English: read every `dg.*` string. zh/en key parity and digit parity are enforced by the node tests. The browser test
  finds no CJK in English mode, including SVG text.
- Screenshots: every diagram at 1280/390/320 in zh and en, before and after the fixes. Scratch is in
  /tmp/agent-tasks/review-s4s5/.

## Residual doubts and not done

- Hyphens render wide ("7,500–byte", "Bulk–Only", "go–back–N"). The source bytes are ASCII hyphens, and the same
  rendering appears in the HTML prose, so this comes from the page font's hyphen glyph, not the diagrams. Left alone.
- Colour reuse in S5: green means "storage end" (`level`, `path` target), "optimized path" (`mp`) and "no translation"
  (`caps` notes). It is not contradictory within any one diagram, but it is not one meaning per colour across the
  page. The S4 heat diagram draws the thermal resistor in gold, which elsewhere means data. Cosmetic.
- The narrow S4 `stack` omits the "chip has to speak both languages" label, and the narrow S5 `iscsi` omits the
  "round trip N" brackets; both captions still carry the point.
- The SK hynix 194 MB/s per-die figure and the 0.85 PCIe efficiency are pre-existing prose values (BRIEF.md marks the
  first as title-only and the second as tuned). The diagrams reuse them unchanged.
- The overlap check still cannot see a label on a line. Items 2 and 4 were found by eye, and every final screenshot
  was looked at.
- AGENTS.md asks that each fix also update `specs/<slug>.md`. This review was limited to the two page directories plus
  this file, so whoever registers the pages should mirror the diagram notes into
  `specs/how-usb-drives-talk.md` and `specs/storage-over-a-network.md`.
