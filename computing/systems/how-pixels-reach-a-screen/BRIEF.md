# BRIEF — 像素是怎么到屏幕上的 (How Pixels Reach a Screen)

Built-By: Claude Code (claude-opus-5-5)
Verified-By: self-check by builder (node model test, browser test zh at 1280/390/320 and reduced motion, canvas sweep, screenshots of every model and diagram at three widths); independent review 2026-11-15 by Claude Code (claude-opus-5-5), a separate session: models, prose numbers, English, diagrams, link/DSC/FEC figures against Linux v6.12 sources (specs/reviews/how-pixels-reach-a-screen-review-20261115.md)
Category: computing 计算机 / subtopic systems 系统 · Stage: university
Series: computer architecture series, queued item "how pixels reach a screen" (`specs/essay-briefs/TASK-arch-series.md`)
Format: long interactive essay, zh written in full; `copy.en.js` translated (Claude Code, claude-haiku-5-5) and revised by the reviewer.
Files: index.html, copy.zh.js, copy.en.js, models.js, app.js, REGISTRY.json, tests/models.cjs, tests/browser.cjs
No page-provenance label (the registrar adds it).

## The one question

一块 4K 屏每秒刷新 120 次，就是每秒要送出近十亿个像素，每个都得在对的时刻亮成对的颜色。这些像素是怎么从显卡的一块内存，
经过一根线，变成你眼前的光的？画面为什么会撕裂、卡顿？
(Unchanged. "近十亿" is 3840 × 2160 × 120 = 995,328,000 visible pixels a second; with blanking the 4K120 CTA clock is
1188 MHz, which ch2 says.)

## Changes from the suggested ladder

- Ladder kept in order, with these merges: the display engine, the compositor and the colour pipeline are one
  chapter (ch5), because the KMS plane → CRTC → DEGAMMA/CTM/GAMMA path is where both happen; DP and HDMI are one
  chapter (ch6) with link training inside it; LCD vs OLED and motion blur are one chapter (ch9).
- Final order: 1 framebuffer, 2 pixel clock and blanking, 3 tearing and stutter (present modes), 4 VRR and LFC,
  5 display engine + compositor + colour, 6 DP/HDMI link + training, 7 DSC and 4:2:0, 8 TCON and row time,
  9 LCD/OLED and motion blur, 10 HDR/PQ, 11 latency waterfall, 12 frontier (Nov 2026), 13 three questions.
- Later chapters reuse earlier models by name: ch4 is model 3's timeline with variable refresh; ch6 counts the need
  with model 2's timings; ch7 sizes DSC with model 6; ch11's "render + queue" stage is model 3 run live.
- Sibling material linked, not repeated: GPU rendering (how-a-gpu-computes #ch9), CVT bandwidth, DSC on Thunderbolt and
  DP Alt Mode (how-thunderbolt-works #ch6), USB4 tunnels (how-usb-drives-talk #ch8), lane signalling (how-pcie-works
  #ch8), GDDR (how-memory-talks #ch9), the rendering pipeline (computer-graphics), RGB primaries and gamut
  (inside-a-phone #screen).

## Chapters, models, results, tuned parameters

1. **Framebuffer** (`framebuffer`, `darkCodes`). 4K RGBA8: 31.6 MiB a frame, 94.9 MiB triple-buffered, 3.98 GB/s read
   at 120 Hz (1.99 at 60), FP16 7.96 GB/s. The darkest 1 % of linear light gets 26 of 256 sRGB codes vs 3 linear.
2. **Raster timing** (`timing`, `cvtRb2`). CTA VIC 97: 4400 × 2250, 594 MHz, 16.2 % blanking; VIC 118 1188 MHz;
   VIC 117 htotal 5280; CVT-RB2 4K60 3920 × 2222, 522.614 MHz, 4.8 % (same as how-thunderbolt-works' own CVT code,
   cross-checked in tests). Porches are editable; the clock follows.
3. **Present queue** (`present`): event-driven, seeded jitter, immediate / FIFO 2 / FIFO 3 / mailbox (Vulkan
   names). 48 fps on 60 Hz (the KMS doc's example): FIFO 2 shows 30 fps at 33.3 ms latency; immediate tears 36 times a
   second at 20.8 ms (48 − gcd(48, 60); reviewer fixed a rounding miscount that gave 42); FIFO 3 shows 48 fps but holds 16.7 ms for three frames and 33.3 for the fourth, pacing error 6.3 ms. 90 fps on 60 Hz:
   FIFO 3 33.3 ms, mailbox 13.9 ms and drops 30 frames a second, FIFO 2 16.7 ms.
4. **VRR + LFC** (same simulator, three buffers). 48 fps on 35–60 Hz: pacing 0, 20.8 ms. 25 fps without LFC 7.9 ms
   pacing, with LFC 0. 35–60 is 1.71×, so intervals between 28.6 and 33.3 ms cannot be split; 31 ms with LFC still
   14.2 ms. Above range (90 fps) back to queueing, 33.3 ms. The LFC predictor (last ready-to-ready interval, slots at
   anchor + j·est/m) is a model choice; real driver algorithms are not public (ch4.limit says so).
5. **Colour pipeline** (`colour`): DEGAMMA (exact) → CTM (derived from primaries + D65; 709→2020 equals BT.2087 to
   1e-4) → GAMMA LUT (n entries, linear interpolation, uniform in linear light). Red on P3: 234, 51, 35. HDR PQ 10-bit
   red: 543, 333, …. 17-entry LUT on a grey ramp: worst 16.1 codes, 238 of 256 levels left; 1024 entries keep 256.
   PQ LUT at 17 entries: 141.5 codes. TUNED: SDR white in HDR mode 200 nits (labelled as a user setting).
6. **Link fit** (`linkFit`, `linkNeed`). 4K60 8-bit 14.26 Gb/s (TMDS 594 MHz, fits HDMI 2.0's 600 exactly; 10-bit
   742.5 MHz does not, 4:2:0 371.3 does). 10-bit 4:2:2 also rides 594 MHz. 4K120 10-bit 35.64 Gb/s → smallest fit UHBR10 (38.68), then
   HDMI 2.1 FRL (42.67 with 16b/18b, RS-FEC not deducted). 4K240 10-bit 68.56; 8K60 10-bit 71.28. Capacities: HBR3 ×4 25.92
   (25.31 with the FEC that DSC requires), UHBR10/13.5/20 = 4 × lane rate × 96.71 % (Linux channel-coding efficiency) =
   38.68 / 52.22 / 77.37 (the last equals VESA's figure). Link rows are ordered by capacity.
7. **DSC and 4:2:0** (`dscFor`, `subsample`). 4K240 into HBR3 needs ≤ 11.06 bpp (2.7:1) once the mandatory FEC (2.4016 %) is counted,
   11.31 without it; at 12 bpp still 27.42 Gb/s; 8K60 ≤ 10.63 bpp. 4:2:0 on red-on-blue text: mean error 26.3, 44 % of pixels off by more than 16; the photo patch
   1.2; red/green lines at 4:2:2 worst 141.
8. **Row time** (`rowTime`): row = 1/(Hz · vtotal), RC settling to half a 10-bit code. 2160 rows: 7.41 µs at 60 Hz,
   1.852 at 240. TUNED τ (order of magnitude, labelled on the page): a-Si 0.8 µs, oxide 0.30, LTPS 0.1 → a-Si needs
   6.1 µs, tops out at 73 Hz, misses by 10.0 codes at 120 Hz; oxide tops out at 194 Hz. τ doubled halves the maximum
   (tested).
9. **Motion blur** (`blur`): moving edge integrated along the eye's path, 10–90 % width. 960 px/s: 60 Hz hold 12.8 px
   (0.8 × the 16 px jump), 240 Hz 3.2, 60 Hz at 25 % duty 3.2, slow LCD at 120 Hz 10.5, OLED at 120 Hz 6.4.
   TUNED τ: OLED 0.03 ms, fast LCD 1, slow LCD 4. Doubling OLED τ moves the width < 2 %; doubling slow-LCD τ widens it
   > 20 % (tested).
10. **PQ** (`steps`, `pqCode`): 10-bit full-range codes. 1 nit = 153, 100 nits = 520, 1000 nits = 769 (half the codes
    below 100 nits). Step at 1 nit: PQ 1.94 %, gamma 2.4 stretched to 1000 nits 4.2 %; PQ at 100 nits 0.98 %.
11. **Latency waterfall** (`latency`): poll/2 + frame/2 + model 3's render-and-queue + compositor + half a scan +
    panel. 120 fps/120 Hz FIFO 3, compositor, LCD, 125 Hz mouse: 38.9 ms (render+queue 13.4, compositor 8.3). VRR,
    no compositor, OLED, 1000 Hz: 18.8 ms. TUNED: panel response LCD 5 ms, OLED 0.5 ms; compositor = one extra refresh.

Present-queue stats are measured over a 1 s window after 250 ms warm-up, with a 150 ms tail so frames finished near
the end of the window are not counted as dropped.

## Diagrams (STANDARD §4a, inline SVG from app.js, labels from copy, wide 720 and narrow 340 layouts)

1. `overview` (ch1): the pixel's route, card side vs monitor side.
2. `fmt` (ch1): RGBA8 / RGB10A2 / FP16 bit widths, to scale.
3. `raster` (ch2): active area, front porch, sync, back porch on both axes, scan direction.
4. `flip` (ch3): front/back buffer pointer swap; flip in vertical blanking vs flip mid-scan (the tear line).
5. `vrr` (ch4): fixed vs variable refresh timelines, stretched front porch, forced repeat at the longest frame.
6. `engine` (ch5): planes (format, scale, alpha blend) → DEGAMMA LUT → CTM → GAMMA LUT, drawn after the KMS properties.
7. `dp` (ch6): four main lanes, AUX, HPD; 8b/10b vs 128b/132b.
8. `train` (ch6): link training with DPCD 0x100/0x101/0x202, swing/pre-emphasis, fall back a rate.
9. `chroma` (ch7): 4:4:4 / 4:2:2 / 4:2:0 sample grids, 24/16/12 bits.
10. `tft` (ch8): active matrix corner, gate and source drivers, one row on.
11. `stack` (ch9): LCD vs OLED cross-sections.
12. `lat` (ch11): latency stages, in the computer vs on the display chain.
Each caption says 示意 / 不按比例 or that the bits are drawn to scale.

## Sources (opened 2026-11-15 unless marked)

- Linux v6.12 `drivers/gpu/drm/drm_edid.c` (edid_cea_modes_1, VIC 16/97/117/118/199; HDMI Max_TMDS_Char_Rate × 5 MHz;
  `drm_get_max_frl_rate` lane/rate pairs): https://raw.githubusercontent.com/torvalds/linux/v6.12/drivers/gpu/drm/drm_edid.c
- Linux v6.12 `include/drm/display/drm_dp.h` (DPCD 0x100, 0x101, 0x102, 0x103–0x106, 0x202; LINK_BW codes):
  https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/plain/include/drm/display/drm_dp.h?h=v6.12
- Linux KMS documentation (planes/CRTC, DEGAMMA_LUT/CTM/GAMMA_LUT, "Variable Refresh Properties": 48 Hz on 60 Hz,
  35–60 Hz range, front porch extended until flip or timeout): https://docs.kernel.org/gpu/drm-kms.html
- edid-decode `calc-gtf-cvt.cpp` (`calc_cvt_mode`, RB v2): https://git.linuxtv.org/v4l-utils.git/plain/utils/edid-decode/calc-gtf-cvt.cpp
- Microsoft Learn, "For best performance, use DXGI flip model" (ms.date 2018-05-31; DirectFlip, panel fitters
  0.25×–4×, MPO, independent flip 1 frame): https://learn.microsoft.com/en-us/windows/win32/direct3ddxgi/for-best-performance--use-dxgi-flip-model
- VESA DisplayPort 2.0 press release, 2019-06-26 (HBR3 32.4/25.92 Gb/s, UHBR20 77.37 Gb/s, 128b/132b):
  https://vesa.org/featured-articles/vesa-publishes-displayport-2-0-video-standard-enabling-support-for-beyond-8k-resolutions-higher-refresh-rates-for-4k-hdr-and-virtual-reality-applications/
- VESA DSC page (3:1 RGB, 2:1 native 4:2:0, introduced 2014): https://vesa.org/vesa-display-compression-codecs/dsc/
- VESA/DisplayPort.org, DP 2.1b and DP80LL, 2025-01-06 (3 m active, ~1 m passive, spring 2025):
  https://www.displayport.org/pr/vesa-to-update-displayport-2-1-with-new-active-cable-specification-for-up-to-3x-longer-dp80-cables/
- CE Pro, HDMI 2.2, 2025-06-25 (96 Gb/s, Ultra96 for 64/80/96, 12K120/16K60):
  https://www.cepro.com/news/hdmi-forum-introduces-highly-anticipated-hdmi-2-2-96gbps-specification/619616/
- Notebookcheck, LG Display 720 Hz 24.5″ 1080p OLED, 0.02 ms, 2026-09-21 (vendor claim):
  https://www.notebookcheck.net/LG-Display-launches-720Hz-gaming-OLED-panel-built-specifically-for-Esports.1404675.0.html
- Typed from the standards as widely reproduced (not re-opened as PDFs): IEC 61966-2-1 sRGB constants (as in W3C CSS
  Color 4), BT.709 / SMPTE EG 432-1 (P3 D65) / BT.2020 primaries, D65 xy, BT.709 luma coefficients, ST 2084 PQ
  constants (cross-checked against several reproductions of BT.2100-2 Table 4).

- Linux v6.12 `drivers/gpu/drm/display/drm_dp_helper.c` (`drm_dp_bw_channel_coding_efficiency`: 128b/132b 967100 ppm incl.
  FEC; `drm_dp_bw_overhead`: 8b/10b FEC +24016 ppm) and `drivers/gpu/drm/i915/display/intel_dp.c` (`intel_dp_supports_dsc`:
  no DSC on external DP without FEC), opened 2026-11-15 by the reviewer.
- VESA eDP 1.5 release (2021-10-27) and Adaptive-Sync Display CTS r1.1 PDF (19 May 2023): seen via search results by the
  reviewer (vesa.org URLs in the review note).

## Not verified from a primary source

- HDMI 2.1 FRL 16b/18b coding and the FRL payload figure (42.67): secondary sources; HDMI spec not opened (hdmi.org
  spec pages not usable; the HDMI 2.2 page returned 404). FRL's RS-FEC overhead is not modelled (ch6.limit).
- HDMI 2.2 line coding: not found; the 85.33 Gb/s bar assumes 16b/18b and is labelled 宣称.
- ITU-R BT.2100-2 and BT.2087 PDFs (404 / not opened); matrix and PQ constants typed from reproductions and checked by
  derivation (matrix) and round trip (PQ).
- AMD's "2.5× range for LFC": trade press only; the page says it is not verified.
- AdaptiveSync CTS launch date 2022-05-02: VESA release seen through search results, not opened. (eDP 1.5 2021-10-27 and the
  CTS r1.1 of May 2023 confirmed by the reviewer against VESA-hosted listings.)
- TI SLLA598 (DP link training app note): downloaded but could not be parsed; the training description rests on
  drm_dp.h and the KMS docs.
- Miller et al. 2013 (PQ derivation from Barten's model) and Someya 2005 (MPRT): not opened; the page says so for
  Miller; MPRT is described as the idea behind the blur width, not as a reproduced metric.
- LG Display 720 Hz OLED mass production: vendor claim via Notebookcheck.

## Facts that will go stale

FRONTIER in models.js: DP 2.1b / DP80LL, HDMI 2.2 / Ultra96 product availability, 720 Hz OLED, eDP Panel Replay
adoption, AdaptiveSync certification. ch12.c1 says the top-tier products (UHBR20, 96 Gb/s FRL) are still few and not
individually checked.

## Checked / not checked

Checked: every number in the prose against prose() (tests/models.cjs `want` map); CTA tables typed again; CVT-RB2
against the Thunderbolt essay; 709→2020 vs BT.2087; PQ round trip; sentence branches all reachable; keys, links
(live siblings, anchors, titles), alias ownership; browser drive of all eleven models; reduced motion; canvas sweep;
screenshots of all 12 diagrams and 11 models at 1280/390/320.
Not checked: real-hardware LUT and LFC behaviour; a cross-model review.
Reviewer (2026-11-15, Claude Code claude-opus-5-5): re-derived 594 MHz / 16.2 %, 522.614 MHz (4K60 CVT-RB2, labelled), 35.64,
68.56, 71.28, PQ constants and codes 153/520/769, BT.2087 row; fixed immediate-mode tear count, FIFO rounding at refresh
instants, link order, DSC FEC, UHBR derivation, HDMI 2.0 4:2:2 claim, ch3/ch6 prose; English edited; site-nav include added;
browser test zh+en, canvas sweep, screenshots of all diagrams and models at 1280/390/320. Details in the review note.

## For the translator

Keep {placeholders}; units come from u.*. "宣称" = "claimed"; "示意，不按比例" = "schematic, not to scale". Model names
(模型 3 etc.) are cross-references and must stay numbered.

## Registrar notes

- Title: zh 像素是怎么到屏幕上的 / en How Pixels Reach a Screen; 13 concepts (#ch1–#ch13) in REGISTRY.json.
- Aliases avoid every registered alias and the words the task reserves for siblings (Thunderbolt: 4K 60Hz 需要多少带宽,
  DSC 压缩是什么, DP Alt Mode; phone: 色域, 三原色; graphics: 渲染管线, 光栅化; memory: GDDR7). This page takes
  画面撕裂, 垂直同步, 可变刷新率, FreeSync, 像素时钟, 帧缓冲, 链路训练, 4:2:0, OLED vs LCD, PQ 曲线, 显示延迟.
- Links to computer-graphics and inside-a-phone are cross-category (`../../graphics/…`, `../../../tech/devices/…`);
  the test checks they are live in pages.config.js.

## Registrar (2026-11-15)

- Essay commit 3e6bf23d (this tree as reviewed, with the review note specs/reviews/how-pixels-reach-a-screen-review-20261115.md).
  Registered together with how-the-os-talks-to-hardware. The hand-added site-nav lines (sn-20261115) pass build-site-nav --check.
- Alias decisions after the one-click check: 显示流压缩 / Display Stream Compression stay off this page, as the review decided, and
  went to how-thunderbolt-works #ch6 with bare DSC (they had no owner and returned nothing; bare DSC opened #ch7 here by prefix).
  #ch7 keeps DSC 有损吗 / is DSC lossy / 视觉无损 / visually lossless. The page tag 显卡 / Graphics Cards would have taken bare 显卡
  from the GPU essay, so 显卡 / graphics card became aliases of how-a-gpu-computes #ch1. 像素 / pixel and 色域 / gamut stay on
  inside-a-phone #screen. One-click additions: #ch1 显示器是怎么工作的 / how does a monitor work; #ch2 刷新率 / refresh rate; #ch5
  颜色管理 / color management; #ch6 DP, HDMI (bare DP opened the OS essay through DPDK). Pinned in tests/concept-search.cjs.
- Siblings now link here: how-thunderbolt-works ch6.p1 (#ch2) and ch6.p4 (#ch7), how-a-gpu-computes ch9.p2 (#ch1). Not linked:
  how-memory-talks #ch9 (GDDR, no sentence about the screen), how-usb-drives-talk #ch8 (DisplayPort only named as a tunnel),
  inside-a-phone #screen (colour vision and metamerism, nothing about scan-out).
- Known inconsistency (not changed): how-thunderbolt-works ch6.p4 fits 8K60 30-bit into HBR3 at 25.92 Gb/s with DSC; this page's
  ch7.p4 shows that DSC on 8b/10b DP needs FEC, which leaves 25.31 Gb/s. The Thunderbolt model would need the same FEC rule.
