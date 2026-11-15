# BRIEF — 电脑是怎么开机的 (How a Computer Boots)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at three widths); Claude Code (claude-opus-5-5), independent review 2026-11-15: every claim in copy.zh.js/copy.en.js against the sources below (ATX 2.1a Tables 4-2/4-10 and SDM 093 §12.1.4/§11.4/Table 11-1 re-opened; edk2 UefiGpt.h, Acpi65.h, CryptPkcs7VerifyCommon.c; KB5062710, KB5025885, SBAT.md, Gleixner cover letter, UAPI PCR registry, Linux boot protocol, TF-A design, Pluton page), English copy read in full, all thirteen diagrams and ten models viewed at 1280/390/320 in zh and en plus reduced motion, tests rerun; note specs/reviews/how-a-computer-boots-review-20261115.md
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: computer architecture series, first item "queued after the above" (`specs/essay-briefs/TASK-arch-series.md`)
Format: long interactive essay, zh written in full; `copy.en.js` translated (Haiku), then corrected by the reviewer; no `enStub`.
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs
No page-provenance label (the registrar adds it).

## The one question

按下电源键到看到登录界面，大约十几秒。一颗刚上电、什么都不知道的 CPU，是怎么一步步找到第一条指令、找到内存、找到硬盘、
把操作系统请进来的？它又怎么确认请进来的不是恶意代码？
(Refined: "找到第一条指令" added, because the reset vector is where "knows nothing" is answered.)

## Changes from the starting ladder (TASK file)

- Microcode and CSME/PSP became ch4 "CPU 不是第一个醒的", placed after the reset vector and SPI chapters. On AMD the
  PSP trains DRAM before x86 starts, so the chapter has to follow "where the first instruction is" to make the
  contrast.
- Fast boot and S3/S0ix/S4 were merged into ch5 (cache as RAM, memory training, the timeline model). The timeline
  shows each sleep state as a different cut of the same boot path.
- Legacy BIOS, PCI enumeration (a link to B1 #ch6, not re-explained) and ACPI were merged into ch6 with the UEFI
  phases. The MADT model is the ACPI part.
- Secure Boot is split into ch8 (the chain and verifier) and ch9 (revocation: dbx, SBAT, whole-certificate, BootHole,
  BlackLotus).
- Kernel handoff, long mode and paging (a link to A3 #ch3) and INIT-SIPI-SIPI are in ch11. Init/systemd and
  initramfs are one paragraph.
- Final order: 1 power, 2 reset vector, 3 SPI flash, 4 who wakes first, 5 no memory yet + timeline + sleep states,
  6 UEFI phases + legacy + ACPI, 7 GPT, 8 Secure Boot, 9 revocation, 10 measured boot, 11 kernel handoff + SMP,
  12 Arm and Apple, 13 frontier, 14 closing (three questions).

## Chapters, models, results, tuned parameters

1. **Power-on state machine** (`powerOn`). Three rails ramp linearly to their set points; the reader controls the
   ramp time, the +3.3 V set point and T3. Checks follow ATX3 design guide rev 2.1a Table 4-10 (T1 < 200 ms;
   T2 0.2–20 ms from 10 % into regulation; T3 100–250 ms) and Table 4-2 (+3.3 V 3.14–3.47 V).
   - Results: T1 13.6 ms, PWR_OK 163.6 ms. At 3.10 V, PWR_OK never rises. With a 25 ms ramp, T2 is 21.3 ms (fail).
   - TUNED: rail start delays 2/4/6 ms. Doubling them moves T1 by +6 ms and does not change the verdict (tested).
2. **Reset vector** (`resetVector`, `fetchAddr`). Uses the CS hidden base FFFF0000H + EIP FFF0H; the reader picks the
   flash size and enters a hex offset.
   - Results: the reset vector sits at offset 0x01FFFFF0 of a 32 MiB image. After a far jump, F000:FFF0 is 0xFFFF0.
3. **SPI read timing** (`spiRead`). Clocks = instruction + address + mode + dummy + data, per the W25Q256JV command
   table.
   - 64 B: 03h at 50 MHz takes 544 clocks, 10.88 µs; EBh at 133 MHz takes 148 clocks, 1.11 µs.
   - 16 MiB: 03h 2.68 s, 0Bh 1.01 s, EBh 0.25 s (66 MB/s), 10.6× faster than 03h.
4. No model (prose plus the "first" diagram).
5. **Boot timeline** (`timeline`). Six scenarios.
   - Results: normal 12.0 s (firmware 41 %), first boot 26.5 s (training 57 %), fast 9.6 s, S3 2.2 s, S4 8.5 s,
     S0ix 0.3 s.
   - TUNED (order of magnitude only, stated on the page): stage durations, and 15 s of first-boot training (a reader
     slider, 1–60 s). Doubling any one duration changes only that bar; the set of stages each scenario runs is what
     the model shows.
6. **MADT builder** (`madt`). Byte-exact header and entries; the checksum makes the bytes sum to 0 mod 256.
   - Results: 8 cores give 120 bytes with checksum 0xB9; 64 cores give 568 bytes. Flipping one bit makes the sum
     nonzero.
7. **GPT builder and parser** (`gptBuild`, `gptEdit`, `gptParse`). Real offsets and real CRC32. The test compares it
   with an independent parse using `Buffer` and `zlib.crc32`.
   - Results on 64 GiB: header CRC 0xFEE8232E, array CRC 0x93A5FB89, last LBA 134217727, first usable LBA 34, ESP at
     2048.
   - Editing any field makes the parser fall back to the backup header. Editing both copies leaves nothing usable.
     Recomputing the CRC passes every edit except the signature and MyLBA.
8. **Secure Boot verifier** (`chain`, `verifyImage`). Real SHA-256 and textbook RSA (about 62-bit moduli, BigInt).
   The check order is dbx hash → unsigned → dbx cert → untrusted signer → signature, then SBAT in shim.
   - The old shim boots until dbx is applied. A tampered GRUB gives badsig; a self-signed loader gives untrusted.
   - An own kernel boots only after MOK is enrolled.
9. **Revocation** (`revoke`). Four loaders (attacker's old build, an unlisted sibling, current, old install media)
   under none, hash, SBAT, or cert.
   - Hash: 150 builds take 28 + 48 × 150 = 7228 bytes, 22 % of a typical 32 kB dbx.
   - SBAT blocks the sibling and the old media, with no dbx bytes.
   - The PCA 2011 cert without the 2023 CA in db blocks today's loader too.
10. **PCR extend** (`pcrRun`, `unseal`). About 17 events in PCRs 0/2/4/5/7, recomputed with node crypto in the test.
    - Results: PCR 0 starts b8418242…; after a firmware update it starts cc721e3e…, with 60 of 64 hex digits
      different.
    - A key sealed to PCR 7 survives firmware and GRUB updates but locks when Secure Boot is turned off. A key
      sealed to 0, 2, 4 and 7 locks on firmware, option ROM, GRUB and order changes.
11. **AP bring-up** (`bringup`). A linear model calibrated to Gleixner's 112-thread numbers (800 → 80 ms).
    - Calibration: tSerial = 800/111 ms per AP; parallel = 11.5 ms (3.5 ms alive + 8 ms microcode) + 0.62 ms per AP.
    - Extrapolated to 512 threads: 3683 vs 327 ms.
    - Labelled on the page as calibrated, not measured, except at 112 threads.
12–14. No models.

Reuse across chapters: ch5 uses ch1's PWR_OK time as its first bar. ch11 refers back to the ch6 MADT. ch10 measures
the GPT header from ch7 and the shim/GRUB images from ch8 (the same bytes and hashes). ch14 sends the reader back to
ch1, 5, 8, 9 and 10.

## Diagrams (STANDARD §4a, inline SVG from app.js, labels from copy, portrait layout ≤ 600 px)

There are thirteen diagrams:

1. power — the power-on timing (PS_ON#, rails, PWR_OK, CPU reset; T1/T2/T3)
2. map — the physical address map at reset, Intel and schematic: flash at the top of 4 GiB, reset vector 16 bytes below
3. spi — 03h and EBh command segments in clocks
4. first — Intel (CSME, Boot Guard ACM, IBB) and AMD (PSP ROM, PSP bootloader, ABL trains DRAM) before the first fetch
5. car — cache as RAM
6. flow — SEC→PEI→DXE→BDS→loader, ExitBootServices, and legacy BIOS (POST, 0x7C00, 0xAA55)
7. acpi — RSDP→XSDT→FADT/DSDT, MADT, MCFG
8. gpt — the GPT layout on 64 GiB; the LBA numbers come from `gptBuild`
9. chain — PK/KEK/db/dbx, the shim→GRUB→kernel chain, the Windows chain, and MOK
10. revoke — dbx entries (48 bytes each) vs one SBAT line
11. pcr — the PCR extend chain; the short hex values under each step are real SHA-256 extends of the labels
12. sipi — INIT, 10 ms, SIPI, 200 µs, SIPI; the AP starts at 0x000VV000
13. arm — TF-A BL1/BL2/BL31/BL33 with exception levels, and Apple's Boot ROM→LLB→iBoot→kernel

## Sources (each opened by me on 2026-11-15)

### Power and the reset vector

- Intel, *ATX Version 3 Multi Rail Desktop Platform Power Supply Design Guide* rev 2.1a (Nov 2023), doc 336521:
  https://cdrdv2-public.intel.com/336521/336521_Rev2p1a.pdf. Used Table 4-2 (regulation) and Table 4-10 (T1–T4).
- Intel SDM, combined volumes, order 325384-093US (Sept 2026):
  https://cdrdv2-public.intel.com/929358/325384-093-sdm-vol-3abcd.pdf
  - Vol. 3A §12.1.4: first instruction, CS F000H, base FFFF0000H, EIP FFF0H.
  - §11.4: MP initialization, BSP selection, INIT-SIPI-SIPI, Table 11-1 delays, vector 000VV000H.
  - §12.8.5: IA-32e initialization order.

### SPI flash

- Winbond W25Q256JV datasheet rev I (2018-10-23): https://cdn.sparkfun.com/assets/c/2/9/2/6/W25Q256JV.pdf
  - Instruction tables for 03h, 0Bh, 3Bh, 6Bh and EBh.
  - Clock limits: fR = 50 MHz, FR = 133 MHz.

### UEFI, ACPI, GPT and legacy BIOS (via edk2 headers and code)

- edk2 headers, master as of 2026-11-15 (the UEFI 2.11 §5 and ACPI definitions as code):
  - https://raw.githubusercontent.com/tianocore/edk2/master/MdePkg/Include/Uefi/UefiGpt.h
  - https://raw.githubusercontent.com/tianocore/edk2/master/MdePkg/Include/Uefi/UefiMultiPhase.h
  - https://raw.githubusercontent.com/tianocore/edk2/master/MdePkg/Include/IndustryStandard/Mbr.h
  - https://raw.githubusercontent.com/tianocore/edk2/master/MdePkg/Include/Guid/Gpt.h
  - https://raw.githubusercontent.com/tianocore/edk2/master/MdePkg/Include/IndustryStandard/Acpi10.h
  - https://raw.githubusercontent.com/tianocore/edk2/master/MdePkg/Include/IndustryStandard/Acpi65.h
  - https://raw.githubusercontent.com/tianocore/edk2/master/MdePkg/Include/Guid/ImageAuthentication.h
- edk2 GPT validation and backup fallback:
  https://raw.githubusercontent.com/tianocore/edk2/master/MdeModulePkg/Universal/Disk/PartitionDxe/Gpt.c
- SeaBIOS: the MBR is read to 0x07C0:0 and checked for 0xAA55: https://raw.githubusercontent.com/coreboot/seabios/master/src/boot.c

### TPM and measured boot

- TCG TPM 2.0 Library Part 1 r1.59 (2019-11-08), §17.2, the extend equation:
  https://trustedcomputinggroup.org/wp-content/uploads/TCG_TPM2_r1p59_Part1_Architecture_pub.pdf
- UAPI Linux TPM PCR registry (PCR 0/1/2/4/5/7 usage): https://uapi-group.org/specifications/specs/linux_tpm_pcr_registry/
- Microsoft Learn, *How Windows uses the TPM* (CRTM, measuring the signer for PCR 7):
  https://learn.microsoft.com/en-us/windows/security/hardware-security/tpm/how-windows-uses-the-tpm

### Secure Boot keys, revocation and incidents

- Microsoft, *Windows Secure Boot key creation and management guidance* (PK/KEK/db/dbx; dbx is checked first):
  https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/windows-secure-boot-key-creation-and-management-guidance
- Microsoft KB5062710, certificate expiry (page updated 2026-05-18): https://support.microsoft.com/help/5062710
  - Expiry dates: KEK CA 2011 on 2026-06-24, UEFI CA 2011 on 2026-06-27, Windows Production PCA 2011 on 2026-10-19.
  - Replacements: KEK 2K CA 2023, UEFI CA 2023, Option ROM UEFI CA 2023, Windows UEFI CA 2023.
  - "Continue to boot normally" without the new certificates, but no new boot-level updates.
- Microsoft KB5025885 (CVE-2023-24932), phases from 2023-05-09; enforcement "to be announced":
  https://support.microsoft.com/en-us/topic/kb5025885-how-to-manage-the-windows-boot-manager-revocations-for-secure-boot-changes-associated-with-cve-2023-24932-41a975df-beb2-40c1-99a3-b3ff139f832d
- rhboot/shim SBAT.md (BootHole: 3 certificates and 150 hashes, about 10 kB of a typical 32 kB dbx; generation
  numbers): https://github.com/rhboot/shim/blob/main/SBAT.md
- Eclypsium, *There's a hole in the boot* (BootHole, CVE-2020-10713, 2020-07-29): https://eclypsium.com/research/theres-a-hole-in-the-boot/
- ESET WeLiveSecurity, *BlackLotus UEFI bootkit: Myth confirmed* (2023-03-01; CVE-2022-21894):
  https://www.welivesecurity.com/2023/03/01/blacklotus-uefi-bootkit-myth-confirmed/

### Firmware stacks before the OS

- coreboot docs:
  - AMD family 17h (PSP, ABL, no CAR): https://doc.coreboot.org/soc/amd/family17h.html
  - Architecture and stages: https://doc.coreboot.org/getting_started/architecture.html
- UEFI Forum, *Establishing the Root of Trust* white paper (2016; Boot Guard description):
  https://www.UEFI.org/sites/default/files/resources/UEFI%20RoT%20white%20paper_Final%208%208%2016%20%28003%29.pdf
- Intel, *Below-the-OS security* white paper: https://www-ssl.intel.com/content/dam/www/central-libraries/us/en/documents/below-the-os-security-white-paper.pdf

### Kernel handoff and other architectures

- Linux kernel doc, *The Linux/x86 Boot Protocol* (header 0x1F1, "HdrS" at 0x202, protocol 2.15, EFI stub, EFI
  handover deprecated): https://www.kernel.org/doc/html/latest/arch/x86/boot.html
- Thomas Gleixner, *[patch V2 00/38] cpu/hotplug, x86: Reworked parallel CPU bringup*, 2023-05-04 (≈800 → ≈80 ms on
  112 threads; alive 350 µs–3.5 ms; microcode ≈8 ms): https://lore.kernel.org/all/87a61qxtx0.ffs@tglx/T/ and
  https://lwn.net/Articles/930964
- Trusted Firmware-A, *Firmware Design* (BL1/BL2/BL31/BL32/BL33, exception levels):
  https://trustedfirmware-a.readthedocs.io/en/latest/design/firmware-design.html
- Apple Platform Security guide:
  - Boot process for iPhone and iPad: https://support.apple.com/guide/security/boot-process-for-iphone-and-ipad-devices-secb3000f149/web
  - Mac with Apple silicon (LLB, LocalPolicy): https://support.apple.com/guide/security/boot-process-secac71d5623/web
- Linux arm64 ACPI doc: https://kernel.org/doc/html/v6.6/arch/arm64/arm-acpi.html

### Frontier

- UEFI 2.11 and PI 1.9, 2024-12-17: https://www.businesswire.com/news/home/20241217759265/en
- ACPI 6.6 exists: https://uefi.org/specs/ACPI/6.6/01_Introduction.html (no release date confirmed)
- Microsoft Pluton (page date 2026-05-27; chip list; Rust-based firmware from 2024):
  https://learn.microsoft.com/en-us/windows/security/hardware-security/pluton/microsoft-pluton-security-processor
- AMD openSIL schedule (Venice 2026, Medusa H1 2027), TechPowerUp 2025-10-30:
  https://www.techpowerup.com/342415/amd-opensil-targets-zen-6-support-in-the-first-half-of-2027

## Not verified from a primary source

Reviewer, 2026-11-15: moved out of this list — the GPT header and entry layout (edk2 UefiGpt.h, field order matches ch7.p3), the MADT header, Local APIC (8 B) and I/O APIC (12 B) structures (edk2 Acpi65.h), the ATX numbers (Intel 336521 rev 2.1a opened as text: Table 4-2 +12 V 11.20–12.60, +3.3 V 3.14–3.47; Table 4-10 T1 < 200 ms required / < 500 ms legacy, T2 0.2–20 ms, T3 100–250 ms; +5VSB T0 < 2 s), the SDM 093 section numbers and values (§12.1.4 F000H/FFFF0000H/FFF0H, §11.4.4.1 BSP step 2 "Loads the microcode update", Table 11-1 10 ms / 200 µs, 000VV000H), and certificate expiry behaviour: edk2 CryptoPkg/Library/BaseCryptLib/Pk/CryptPkcs7VerifyCommon.c sets X509_V_FLAG_NO_CHECK_TIME ("Also disable time checks"), https://raw.githubusercontent.com/tianocore/edk2/master/CryptoPkg/Library/BaseCryptLib/Pk/CryptPkcs7VerifyCommon.c. Whether every vendor firmware also ignores expiry is not verified (ch13.d1 says so). The MADT model writes header revision 5 (ACPI 6.2/6.3 era); edk2 Acpi65.h defines revision 6. Not wrong, left as is.


- **UEFI and PI specifications themselves.** uefi.org returned 403 for the UEFI 2.11 §5 page. All GPT and ACPI
  layouts come from the edk2 headers and code, which implement them. PI phase names come from secondary documents
  and the edk2 tree.
- **TCG PC Client Platform Firmware Profile.** The PDF returned 403/404. PCR assignments come from the UAPI registry
  and Microsoft Learn, not from the PFP.
- **Intel Boot Guard details** (microcode verifies the ACM, the ACM verifies the IBB against an OEM key hash in
  fuses). Intel publishes no specification; the sources are the UEFI white paper and third-party analyses.
- **CSME running before the CPU.** Secondary sources only.
- **AMD PSP internals.** The coreboot document only; the PSP specification is under NDA.
- **ACPI 6.6 release date.**
- **openSIL schedule.** Reported by press (TechPowerUp, igor'sLAB), not an AMD primary document. No report found
  that the Venice source has been published.
- **KB5025885 enforcement date.** The page still read "to be announced" when opened. If it has since been set, ch9
  and ch13 need a date.
- **Stage durations in ch5 and the S3/S4/S0ix times.** TUNED orders of magnitude, not measured. coreboot
  board-status timestamps could not be retrieved.
- **SPI controller limits.** What the chipset's SPI controller actually runs at was not looked up.

## Facts that will go stale

- **Certificate rollover.** The expiry dates themselves are fixed, but how old media behave after the PCA 2011
  revocation will change.
- **KB5025885 enforcement date.**
- **openSIL source releases.**
- **Pluton chip list.**
- **Latest Linux boot-protocol version.**
- **UEFI and ACPI spec versions.**

## Checked / not checked

### Checked

- SHA-256 and CRC32 against node's crypto and zlib.
- GPT against an independent Buffer parse.
- PCR values recomputed with node crypto.
- MADT checksum for every core count.
- The power grid of 30 × 21 × 26 slider states.
- Every say branch reached.
- Every prose number pinned.
- Literals pinned against model constants: the SPI clock counts, the GPT offsets, the tuned durations and the
  calibration constants.
- Links:
  - Only live siblings are linked, and every linked anchor exists.
  - Each linked title matches the sibling's copy.
  - a-secret-in-public is named in plain text, because it is not registered.
- Browser:
  - Widths 1280/390/320, plus reduced motion.
  - All thirteen diagrams pass the label checks.
  - Every model is driven.
- Canvas sweep: 636 states, no collisions.
- Screenshots of every model and diagram at 1280/390/320, viewed.

### Not checked

- (English: now read in full and browser-tested by the reviewer; see the review note.)
- Screen-reader reading order.
- Real hardware timings.
- `ch1.say.t1` (T1 over 200 ms with the other timings in spec) is reachable only through start delays that the sliders do not expose. The node test covers it; no reader will see it.

## For the translator

- Keep the RSA and SHA-256 numbers as they are: they are computed.
- In the PCR diagram, the hex under each step is a real SHA-256 extend of the *label text*. Translating the labels
  changes those hex values, which is fine.
- `ch8.step.res` is "{who}: {why}".

## Registrar notes

- **Title:** 电脑是怎么开机的 / How a Computer Boots.
- **Concepts:** 14, one per chapter (#ch1–#ch14).
- **Aliases avoided** (reserved for siblings):
  - B1: PCIe 枚举, BAR, 配置空间, 开机点名
  - B3: 内存训练, 开机内存训练黑屏
  - B2: SPI, eSPI, I2C
  - Thunderbolt: IOMMU, DMA 攻击
  - a-secret-in-public: 数字签名, 证书链, 根证书, CA, RSA 签名, 哈希函数, hash function
  - Bare "GPT", which collides with the language model. This page uses GPT 分区表 / GUID 分区表 / GUID partition table.
- **Aliases this page takes:**
  - 上电时序 / PWR_OK
  - 复位向量 / reset vector
  - SPI 闪存 / BIOS 芯片
  - 硬件信任根 / Boot Guard / AMD PSP / Intel CSME / 微码更新
  - 用缓存当内存 / 睡眠和休眠的区别
  - UEFI / ACPI 表 / MADT
  - GPT 分区表 / GUID 分区表 / EFI 系统分区
  - 安全启动 / Secure Boot / shim / db 和 dbx
  - BootHole / BlackLotus / SBAT / dbx 撤销 / 引导程序病毒
  - 度量启动 / TPM PCR / PCR 扩展 / TPM 封存
  - INIT-SIPI-SIPI / 多核启动 / initramfs
  - TF-A / iBoot / DeviceTree
  - 安全启动证书过期 / openSIL / Pluton / coreboot
  - 电脑开不了机
- **Plain-text sibling to convert to a link once it is live:** 《当着所有人的面约定一个秘密》 in ch8.p2 and
  ch14.links (a-secret-in-public).
- **Links to existing pages:**
  - how-memory-talks #ch7 (ch5.p2, ch14.links)
  - rsa-encryption (ch8.p2, ch14.links). This is an existing lesson page, not a series sibling, so do not re-register it.
  - how-pcie-works #ch6, how-a-computer-is-wired #ch8, how-thunderbolt-works #ch8
  - how-virtual-memory-works #ch3, what-a-drive-is-made-of #ch1
  - how-a-cpu-runs-a-program, how-cores-share-memory

## Registrar (2026-11-15)

- Essay commit 509b4d6e (this tree as reviewed, with the review note specs/reviews/how-a-computer-boots-review-20261115.md).
  Registered together with A6.
- Alias decisions on the reviewer's two points: #ch8 "boot chain of trust" became "Secure Boot chain of trust", and zh gains
  安全启动信任链 (开机信任链 kept); the bare "chain of trust" stays reserved for a-secret-in-public #ch6. While that draft is
  unregistered, a bare "chain of trust" query reaches #ch8 only by substring (score 55), so the draft's exact alias will win once
  it registers. #ch3 keeps SPI 闪存 / SPI flash / 四线 SPI 读 / quad SPI read; plain SPI and SPI bus still open how-a-computer-is-wired #ch8.
- One-click additions: #ch1 电脑开机过程, 开机过程, 电脑怎么开机 / how does a computer boot, boot process, computer boot process, what
  happens when you press the power button; #ch6 BIOS 是什么 / BIOS (bare BIOS used to open a biology page by substring); #ch12 TF-A
  (it used to open how-memory-talks #ch6 through tFAW). 内存训练 stays on how-memory-talks #ch7, PCIe 枚举 on how-pcie-works #ch6.
  Pinned in tests/concept-search.cjs.
- Siblings now link here: how-memory-talks ch7.p4 (#ch5), how-pcie-works ch6.limit (#ch6), how-a-computer-is-wired ch8.p5 (#ch3,
  its words "BIOS 闪存"), what-a-drive-is-made-of ch1.p3 (#ch7, its words "分区表"). how-virtual-memory-works and
  how-a-cpu-runs-a-program were checked and not linked: neither mentions the reset vector or boot. 《当着所有人的面约定一个秘密》 stays
  plain text (a-secret-in-public is not registered).
- tests/models.cjs allows the provenance label. Scripts move to `?v=20261115r` (never deployed).

OS/pixels registrar (2026-11-15): ch11.p6 links how-the-os-talks-to-hardware #ch9 (how the initramfs drivers find their devices).
Scripts `?v=20261115s`.
