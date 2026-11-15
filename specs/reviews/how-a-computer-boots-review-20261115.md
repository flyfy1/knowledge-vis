# Review: computing/systems/how-a-computer-boots (2026-11-15)

Reviewer: Claude Code (claude-opus-5-5), independent reviewer (did not build the page).
Built-By: Claude Code (claude-opus-5-5), zh; English translated by Haiku.
Scope: every claim in copy.zh.js and copy.en.js; models.js, app.js, index.html, tests; the English page in a browser;
all 13 diagrams and 10 models viewed at 1280/390/320 in zh and en, plus reduced motion. Edits were made only inside
the page directory. Nothing was committed or staged.

## First-read notes (zh, 1280)

1. Each model has a clear default view, and its live sentence matches what is on screen. The argument holds together
   from start to finish: chapters 1–7 cover finding code, and chapters 8–10 cover whether to trust it.
2. ch10: the readout "PCR 0 的 64 位里变了几位" and the prose "64 位十六进制" read as 64 bits. A SHA-256 PCR is 256
   bits, written as 64 hex digits, and the model counts hex digits. The English said "64 bits" outright.
3. ch11: the slider runs from 2 to 512 threads. Only the 112-thread point is measured, but the live sentence at 112
   did not say so, and the 4–192 thread sentences did not say they were extrapolated.
4. ch7: with "recompute CRC" ticked and the disk GUID edited, the sentence said "读出的分区已经和原来不同". This is
   false, because only the disk GUID changed.
5. ch13.d1 quoted Microsoft ("devices continue to boot") without explaining why. Without that reason, readers are
   left believing the 2011 certificates "expiring" might brick machines.

## Errors found and fixed

- **Model count.** The description said 「九个」 / "Nine". There are ten model sections, and the description already
  listed ten items. Changed to 十个 / Ten in copy.zh.js, copy.en.js, the index.html meta tag and REGISTRY.json.
  tests/models.cjs now counts the `chN.model.title` keys (10) and pins the wording in both languages.
- **PCR units.** ch10.read.diff, ch10.p4 and ch10.model.how now say 64 hex digits of a 256-bit value, in both
  languages. A test forbids "64 bits" anywhere in the English.
- **Certificate expiry (ch13.d1).** Added the mechanism, from a primary source: edk2's
  `CryptPkcs7VerifyCommon.c` sets `X509_V_FLAG_NO_CHECK_TIME` ("Also disable time checks"). So an expired CA still
  verifies what it signed in the past. What stops at expiry is new signing: new shims, boot managers, and db/dbx
  updates. The text says we have not verified whether any individual firmware checks expiry anyway. The dates
  (KEK CA 2011 2026-06-24, UEFI CA 2011 2026-06-27, Windows Production PCA 2011 2026-10-19) match KB5062710. The
  quote now uses KB5062710's actual wording: "continue to start and operate normally".
- **Bring-up extrapolation.** Added `ch11.say.cal` for the 112-thread point (this is the calibrated point, so it
  matches by construction). `ch11.say.mid` and `ch11.say.small` now say they are extrapolated. ch11.p5 calls the
  512-thread figures an estimate, not a measurement. All of this is pinned in the tests.
- **Tuned stage durations.** ch5.p5 now says 调出来的参数（数量级，不是测量）/ "tuned parameters (orders of
  magnitude…)". ch5.tuned already said this; no other prose quotes these numbers.
- **ch7.say.fixed** is reworded so it is true for every field edit.
- **Small accuracy fixes:**
  - ch6.p4: "XSDT 列出的每张表" has the 36-byte header (the RSDP and FACS do not).
  - ch11.p2: long mode is entered "before DXE". It was "in SEC and PEI", which is not true of every edk2 platform.
  - ch12.p1: BL33 runs at EL2, "or EL1 without EL2" (TF-A doc).
  - ch4.p3: the microcode step is now "one of the earliest". This was a softening; the SDM confirms it is BSP step 2.
- **English.**
  - Doubled units: "{t2} ms", "{t3} ms" rendered as "6.8 ms ms".
  - `u.x` changed from "×{v}" to "{v}×", so the text reads "10.0× faster".
  - Rewrote the following, which read like translations: hero.sub (made consistent with "a dozen seconds"),
    ch2.p3, ch3.p4, ch5.say.first, ch6.p5, ch9 title, ch10 unseal/locked sentences (these are now correct when
    several PCRs are listed), ch11.p1, ch11.tuned, ch12.p3, ch14.q2.
  - Diagram labels: "Update" became "May update", "Runtime only" became "Runtime services", and "Final: path
    fingerprint" became "Final value: the path's fingerprint". Longer versions overflowed at 1280.
- **Layout bug (app.js).** The ch5 timeline drew its row labels unsplit. The English labels ("Wake from hibernate
  S4") ran off the left edge of the canvas at 320 px; the canvas sweep reported 203 findings. The labels now use the
  computed two-line split.

## Sources checked by the reviewer

- **ATX 3 design guide rev 2.1a.** Opened as text. Table 4-2: +12 V 11.20/12.60, +3.3 V 3.14/3.47. Table 4-10:
  T1 < 200 (legacy < 500), T2 0.2–20, T3 100–250 (legacy 100–500), and the note on T3 < 100 ms.
- **Intel SDM 325384-093.** §12.1.4: F000H, FFFF0000H, FFF0H, and the far-jump rule. §11.4 and Table 11-1:
  10 ms / 200 µs and 000VV000H.
- **edk2 headers.** UefiGpt.h: the header and entry field order. Acpi65.h: the MADT header and the LAPIC/IOAPIC
  structures. The SPI clock counts and the GPT/MADT byte totals were also recomputed by hand.
- **KB5062710.**
- **KB5025885.** Phases 2023-05-09, 2024-04-09 and 2024-07-09. Enforcement is still "announced at a later date".
  PCA 2011 goes into dbx, plus SVN.
- **shim SBAT.md.** 3 certificates and 150 hashes; 10 of 32 kB.
- **Gleixner cover letter (LWN 930964).** 112 threads, ~800 → ~80 ms, 350 µs–3.5 ms, ~8 ms.
- **UAPI PCR registry.** PCR 0/2/4/5/7 and 8–15.
- **Linux x86 boot protocol.** 0x1F1, HdrS at 0x202, 2.15/5.5, handover deprecated, "64-bit mode with paging
  enabled".
- **TF-A firmware design.** BL1 at EL3 from the reset vector, BL2 at S-EL1, BL31 at EL3, BL33 at EL2/EL1, and FVP
  ROM at 0x0.
- **Pluton page.** ms.date 2026-05-27, the chip list, and Rust firmware from 2024.

## Still unverified (all labelled on the page)

- Boot Guard, CSME-first and AMD PSP internals (secondary sources and coreboot docs only).
- W25Q256JV command table (not reopened; the clock counts are consistent with the standard Winbond tables).
- ACPI 6.6 release date.
- openSIL schedule (press report).
- Chipset SPI controller limits.
- Apple guide wording (not reopened).
- ESET and Eclypsium pages (dates and CVEs are consistent with the KB articles; not reopened).
- The stage durations (tuned).
- The MADT model writes header revision 5. ACPI 6.5 defines 6. Revision 5 is a valid older revision, so it was left.

## Tests (final run)

- `node tests/models.cjs`: PASS, 7124 checks.
- `tests/browser.cjs` (ESSAY_BASE_URL=http://127.0.0.1:18976): PASS, zh+en at 1280/390/320, 13 diagrams, reduced
  motion.
- `tests/canvas-text-overlap.cjs --sweep`: PASS, 635 canvas states, 1280/390/320 × zh/en.
- The evidence directories were unchanged. The server on port 18976 has been stopped.

## Aliases for the registrar

The aliases in REGISTRY.json do not collide with existing owners: B1 (PCIe enumeration, BAR), B3 (memory training),
B2 (SPI, eSPI, I2C), Thunderbolt (IOMMU, DMA) and the signature/hash words of a-secret-in-public. Two points need
attention:

- **#ch8 "boot chain of trust".** a-secret-in-public #ch6 owns the en alias "chain of trust". Keep the
  boot-scoped string, or rename it to "Secure Boot chain of trust". Do not take the bare "chain of trust".
- **#ch3 "SPI 闪存 / SPI flash / 四线 SPI 读 / quad SPI read".** These sit next to B2's "SPI" / "SPI bus". The
  strings are distinct, and ch3.p2 links B2 #ch8, so they can be kept.

## Verdict

Ready to register once the registrar decides on the two alias points above. No false statements remain that I could
find. Everything that is unverified is labelled on the page.
