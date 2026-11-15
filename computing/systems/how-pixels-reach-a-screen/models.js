/* How pixels reach a screen: the page's models.
   A framebuffer calculator; raster timings taken from the CTA-861 tables as Linux carries them (drm_edid.c) and the VESA
   CVT reduced-blanking v2 formula (ported from edid-decode's calc_cvt_mode); an event-driven present-queue simulator
   (immediate / FIFO with two or three buffers / mailbox, the Vulkan VkPresentModeKHR policies, and variable refresh
   with low-framerate compensation, following the Linux KMS "Variable Refresh Properties" text); a colour pipeline in the
   KMS order DEGAMMA_LUT → CTM → GAMMA_LUT with the sRGB transfer function, matrices derived from primaries, PQ, and a
   1-D LUT with linear interpolation; a link-fit calculator (DisplayPort 8b/10b and 128b/132b, HDMI TMDS and FRL, DSC,
   chroma subsampling); BT.709 Y'CbCr 4:2:0 with a 2×2 box filter on small pixel patches; active-matrix row time and an
   RC settling estimate; a moving-edge blur integrated along the eye's tracking path; the SMPTE ST 2084 (PQ) curve; and
   an input-to-photon latency sum that reuses the present-queue simulator.
   Real-world figures sit in SRC / FRONTIER with their source and the date it was opened (also in BRIEF.md). Constants
   chosen for a model rather than taken from a source are marked TUNED here and on the page.
   UMD: window.PixelModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PixelModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── sourced figures (BRIEF.md has URL and the date each was opened, 2026-11-15) ── */
  const SRC = {
    // Linux v6.12 drivers/gpu/drm/drm_edid.c, edid_cea_modes_1[] (the CTA-861 VIC table). DRM_MODE(name, type, clock kHz,
    // hdisplay, hsync_start, hsync_end, htotal, 0, vdisplay, vsync_start, vsync_end, vtotal, 0, flags)
    cta: {
      vic16:  { hz: 60,  clk: 148500,  h: [1920, 2008, 2052, 2200], v: [1080, 1084, 1089, 1125] },
      vic97:  { hz: 60,  clk: 594000,  h: [3840, 4016, 4104, 4400], v: [2160, 2168, 2178, 2250] },
      vic117: { hz: 100, clk: 1188000, h: [3840, 4896, 4984, 5280], v: [2160, 2168, 2178, 2250] },
      vic118: { hz: 120, clk: 1188000, h: [3840, 4016, 4104, 4400], v: [2160, 2168, 2178, 2250] },
      vic199: { hz: 60,  clk: 2376000, h: [7680, 8232, 8408, 9000], v: [4320, 4336, 4356, 4400] }
    },
    // VESA CVT reduced blanking v2, as implemented in edid-decode calc-gtf-cvt.cpp (calc_cvt_mode, rb == RB_CVT_V2):
    // h_blank 80 (front porch 8, sync 32), v_sync 8, v back porch 6, v front porch ≥ 1, vertical blank ≥ 460 µs,
    // pixel clock rounded down to a 0.001 MHz step. (The VESA CVT document itself was not opened; see BRIEF.)
    cvt: { hBlank: 80, hfp: 8, hsync: 32, vsync: 8, vbp: 6, vfpMin: 1, minVblankUs: 460, stepMHz: 0.001 },
    // VESA DisplayPort 2.0 press release (2019-06-26): DP 1.4a HBR3 8.1 Gbps/lane × 4 = 32.4 Gbps, 25.92 Gbps payload
    // with 8b/10b; DP 2.0 UHBR20 payload 77.37 Gbps with 128b/132b. UHBR payloads are derived here: Linux v6.12
    // drm_dp_helper.c drm_dp_bw_channel_coding_efficiency() gives 128b/132b an efficiency of 96.71 % including FEC and
    // link/PHY control symbols (DP 2.1 §3.5.2.18); 4 × 20 × 0.9671 = 77.37 reproduces VESA's figure. For 8b/10b the FEC
    // overhead is separate: drm_dp_bw_overhead() adds (256·6 + 1)/(256·250) = 2.4016 %, and FEC must be on for DSC on an
    // external DP link (i915 intel_dp_supports_dsc()).
    dp: { rates8b10b: { rbr: 1.62, hbr: 2.7, hbr2: 5.4, hbr3: 8.1 }, hbr3Payload4: 25.92, uhbrEff: 0.9671, fec8b10b: (256 * 6 + 1) / (256 * 250), vesaUhbr20: 77.37, uhbrRaw: { uhbr10: 10, uhbr135: 13.5, uhbr20: 20 } },
    // Linux v6.12 include/drm/display/drm_dp.h: DPCD link-training registers
    dpcd: { linkBwSet: 0x100, laneCountSet: 0x101, trainingPatternSet: 0x102, lane0Set: 0x103, lane3Set: 0x106, laneStatus: 0x202,
      bwCodes: { 0x06: 1.62, 0x0a: 2.7, 0x14: 5.4, 0x1e: 8.1 }, bwUnit: 0.27, swingLevels: 4, preEmphLevels: 4 },
    // HDMI: TMDS character rate limits 340 MHz (1.4) and 600 MHz (2.0; drm_edid.c reads Max_TMDS_Char_Rate × 5 MHz and
    // treats > 340 MHz as HDMI 2.0 scrambling); FRL lane/rate pairs from drm_get_max_frl_rate() (3/3, 3/6, 4/6, 4/8, 4/10,
    // 4/12 Gbps); 16b/18b coding (secondary sources, spec not opened); HDMI 2.2 96 Gbps raw (HDMI Forum, reported 2025-06-25).
    hdmi: { tmds14: 340, tmds20: 600, tmdsBitsPerChar: 10, tmdsLanes: 3, frl: [[3, 3], [3, 6], [4, 6], [4, 8], [4, 10], [4, 12]], frlCode: 16 / 18, hdmi22Raw: 96 },
    // VESA DSC page: 3:1 for RGB, 2:1 for native 4:2:0
    dsc: { rgbRatio: 3, yuv420Ratio: 2, introduced: '2014-04' },
    // IEC 61966-2-1 sRGB transfer (as given in W3C CSS Color 4)
    srgb: { a: 0.055, gamma: 2.4, slope: 12.92, thr: 0.04045 },
    // CIE xy primaries and D65 white: ITU-R BT.709, SMPTE EG 432-1 (Display P3, D65), ITU-R BT.2020
    prim: { bt709: [[0.64, 0.33], [0.30, 0.60], [0.15, 0.06]], p3: [[0.680, 0.320], [0.265, 0.690], [0.150, 0.060]], bt2020: [[0.708, 0.292], [0.170, 0.797], [0.131, 0.046]], d65: [0.3127, 0.3290] },
    // ITU-R BT.2087 709 → 2020 linear matrix, four decimals (typed for comparison with the derived matrix; not opened)
    bt2087: [[0.6274, 0.3293, 0.0433], [0.0691, 0.9195, 0.0114], [0.0164, 0.0880, 0.8956]],
    // SMPTE ST 2084 / ITU-R BT.2100-2 PQ constants, 10 000 cd/m² peak
    pq: { m1: 2610 / 16384, m2: 2523 / 4096 * 128, c1: 3424 / 4096, c2: 2413 / 4096 * 32, c3: 2392 / 4096 * 32, peak: 10000 },
    // ITU-R BT.709 luma coefficients
    ycc: { kr: 0.2126, kb: 0.0722 },
    // Linux KMS documentation, "Variable Refresh Properties": a 48 Hz flip rate on a 60 Hz display; a 35–60 Hz range
    kmsVrr: { fps: 48, hz: 60, vmin: 35, vmax: 60 },
    // Microsoft Learn, "For best performance, use DXGI flip model" (ms.date 2018-05-31): Independent Flip can reach 1 frame
    // of latency with a waitable swap chain; DirectFlip with panel fitters scales by e.g. 0.25× to 4×
    dxgi: { ifFrames: 1, fitLo: 0.25, fitHi: 4 }
  };

  const FRONTIER = {
    asOf: '2026-11',
    dp21b: { announced: '2025-01-06', release: '2025 spring', dp80llM: 3, passiveM: 1, gbps: 80 },   // VESA press release 2025-01-06 (established standard)
    hdmi22: { reported: '2025-06-25', gbps: 96, ultra96: [64, 80, 96], k12: 120, k16: 60 },       // HDMI Forum via CE Pro 2025-06-25 (established standard)
    oled720: { date: '2026-09-21', hz: 720, inch: 24.5, res: '1920×1080', gtg: 0.02 },             // LG Display press release, via Notebookcheck 2026-09-21 (vendor claim)
    edp15: { date: '2021-10-27', ver: '1.5' },                                                   // VESA eDP 1.5 press release (established standard)
    asyncCts: { date: '2022-05-02', update: '2023-05' }                                          // VESA AdaptiveSync Display CTS (established; seen via search)
  };

  /* ── helpers ── */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* ── 01 the framebuffer: bytes per pixel, frame size, the scan-out read rate ── */
  const FB = {
    fmts: { rgba8: { B: 4, bpc: 8 }, rgb10a2: { B: 4, bpc: 10 }, fp16: { B: 8, bpc: 16 } },
    res: { fhd: [1920, 1080], qhd: [2560, 1440], uhd: [3840, 2160], k8: [7680, 4320] },
    hzs: [60, 120, 144, 240]
  };
  function framebuffer(res, fmt, hz, nbuf) {
    const [w, h] = FB.res[res], B = FB.fmts[fmt].B, px = w * h, frame = px * B;
    return { w, h, px, B, frame, frameMiB: frame / 1048576, total: frame * nbuf, totalMiB: frame * nbuf / 1048576, pxPerS: px * hz, readGBps: frame * hz / 1e9, nbuf };
  }
  // sRGB transfer (IEC 61966-2-1): encoded ↔ linear
  const S = SRC.srgb;
  const srgbToLin = c => (c <= S.thr ? c / S.slope : Math.pow((c + S.a) / (1 + S.a), S.gamma));
  const linToSrgb = l => (l <= S.thr / S.slope ? l * S.slope : (1 + S.a) * Math.pow(l, 1 / S.gamma) - S.a);
  // how many 8-bit codes fall in the darkest share of linear light, encoded vs stored linearly
  function darkCodes(share) { return { srgb: Math.floor(linToSrgb(share) * 255) + 1, linear: Math.floor(share * 255) + 1 }; }

  /* ── 02 raster timing ── */
  function fromDrm(m) { return { h: [m.h[0], m.h[1] - m.h[0], m.h[2] - m.h[1], m.h[3] - m.h[2]], v: [m.v[0], m.v[1] - m.v[0], m.v[2] - m.v[1], m.v[3] - m.v[2]], hz: m.hz, clkKHz: m.clk }; }
  function cvtRb2(hAct, vAct, hz) {
    const c = SRC.cvt, hPeriodEst = (1e6 / hz - c.minVblankUs) / vAct;
    const vbi = Math.max(Math.floor(c.minVblankUs / hPeriodEst) + 1, c.vfpMin + c.vsync + c.vbp);
    const hTot = hAct + c.hBlank, vTot = vAct + vbi;
    const clkKHz = Math.round(1000 * Math.floor(hz * vTot * hTot / 1e6 / c.stepMHz + 1e-9) * c.stepMHz);
    return { h: [hAct, c.hfp, c.hsync, c.hBlank - c.hfp - c.hsync], v: [vAct, vbi - c.vsync - c.vbp, c.vsync, c.vbp], hz, clkKHz };
  }
  const TIM = {
    order: ['cta16', 'cta97', 'cvt4k60', 'cta118', 'cta117', 'cta199'],
    presets: {
      cta16: fromDrm(SRC.cta.vic16), cta97: fromDrm(SRC.cta.vic97), cta118: fromDrm(SRC.cta.vic118), cta117: fromDrm(SRC.cta.vic117), cta199: fromDrm(SRC.cta.vic199),
      cvt4k60: cvtRb2(3840, 2160, 60)
    }
  };
  // the reader may edit porches; the pixel clock follows from totals × refresh
  function timing(t, edit) {
    const h = t.h.slice(), v = t.v.slice(), e = edit || {};
    if (e.hfp != null) h[1] = e.hfp; if (e.hbp != null) h[3] = e.hbp; if (e.vfp != null) v[1] = e.vfp;
    const hz = e.hz != null ? e.hz : t.hz;
    const hTot = h[0] + h[1] + h[2] + h[3], vTot = v[0] + v[1] + v[2] + v[3];
    const pclk = hTot * vTot * hz;                                      // Hz
    const lineUs = hTot / pclk * 1e6, frameMs = 1000 / hz;
    const act = h[0] * v[0], blankShare = 1 - act / (hTot * vTot);
    const vblankUs = (vTot - v[0]) * lineUs, hblankNs = (hTot - h[0]) / pclk * 1e9;
    const edited = h.join() !== t.h.join() || v.join() !== t.v.join() || hz !== t.hz;
    return { h, v, hz, hTot, vTot, pclk, pclkMHz: pclk / 1e6, lineUs, frameMs, blankShare, vblankUs, hblankNs, actRate: act * hz, edited, matches: Math.abs(pclk - t.clkKHz * 1000) < 1 };
  }

  /* ── 03/04/11 the present queue: an event-driven simulation over a fixed window ──
     Modes (Vulkan VkPresentModeKHR names): immediate (flip at once, may tear), fifo2 (vsync, one back buffer), fifo3 (vsync,
     two back buffers queued in order), mailbox (vsync, newest finished frame wins, older ones dropped), vrr (variable
     refresh: the vertical front porch stretches until a flip arrives or the panel's longest allowed frame runs out; LFC
     repeats the last frame at an even sub-multiple of the frame interval). Render times are mean × (1 ± jitter), seeded.
     Latency of a frame = the moment its first line is scanned out − the moment rendering of it started. */
  const PRES = { modes: ['immediate', 'fifo2', 'fifo3', 'mailbox'], hzs: [60, 120, 144], act: 2160 / 2250 };
  function present(o) {
    const p = Object.assign({ hz: 60, ms: 1000 / 48, jitter: 0, mode: 'fifo2', vmin: SRC.kmsVrr.vmin, vmax: SRC.kmsVrr.vmax, lfc: true, seed: 11, win: 1000, warm: 250 }, o || {});
    const R = rng(p.seed), dur = () => p.ms * (1 + p.jitter * (2 * R() - 1));
    const vrr = p.mode === 'vrr', P = 1000 / (vrr ? p.vmax : p.hz), Sc = PRES.act * P, Pmax = 1000 / p.vmin, T = p.warm + p.win + 150;   // 150 ms tail: frames finished near the window's end still get scanned
    const frames = [], scans = [];
    const newFrame = t0 => { const f = { id: frames.length, start: t0, end: t0 + dur(), first: null }; frames.push(f); return f; };

    if (p.mode === 'immediate') {
      const EPS = 1e-9;   // a flip that lands on the start of a scan (to rounding) is inside blanking, not a tear
      let t = 0; while (t < T + 50) { const f = newFrame(t); t = f.end; }
      // which frame is in the front buffer at time x
      let k = 0;
      for (let i = 0; i * P < T; i++) {
        const t0 = i * P, t1 = t0 + Sc, segs = [], tears = [];
        while (k + 1 < frames.length && frames[k + 1].end <= t0 + EPS) k++;
        let cur = frames[k].end <= t0 + EPS ? k : -1, from = 0, j = cur + 1;
        while (j < frames.length && frames[j].end < t1) {
          const fr = (frames[j].end - t0) / Sc;
          if (fr > from + EPS) { segs.push([cur, from, fr]); tears.push(fr); }
          cur = j; from = fr; j++;
        }
        segs.push([cur, from, 1]);
        for (const [id, a] of segs) if (id >= 0 && frames[id].first == null) frames[id].first = t0 + a * Sc;
        scans.push({ t: t0, segs, tears, repeat: segs.length === 1 && i > 0 && scans[i - 1].segs[scans[i - 1].segs.length - 1][0] === segs[0][0] });
      }
    } else if (!vrr) {
      const B = p.mode === 'fifo2' ? 2 : 3, Q = [];
      let free = B - 1, front = -1, cur = null, t = 0, i = 0;
      const startIf = now => { if (!cur && free > 0) { free--; cur = newFrame(now); } };
      startIf(0);
      while (i * P < T) {
        const tr = i * P;
        if (cur && cur.end <= tr + 1e-9) {   // a frame finished at the refresh instant (to rounding) makes that refresh
          const now = cur.end; Q.push(cur); cur = null;
          if (p.mode === 'mailbox') while (Q.length > 1) { Q.shift(); free++; }
          startIf(now); continue;
        }
        let flipped = false;
        if (Q.length) { const f = p.mode === 'mailbox' ? Q.pop() : Q.shift(); if (p.mode === 'mailbox') { free += Q.length; Q.length = 0; } f.first = tr; front = f.id; free++; flipped = true; }
        scans.push({ t: tr, segs: [[front, 0, 1]], tears: [], repeat: !flipped && i > 0 });
        startIf(tr); i++; t = tr;
      }
    } else {
      // three buffers: one on screen, one finished and waiting, one being drawn
      const Pmin = P, Q = []; let free = 2, front = -1, cur = null, lastStart = 0, est = 0;
      scans.push({ t: 0, segs: [[-1, 0, 1]], tears: [], repeat: false });
      const startIf = now => { if (!cur && free > 0) { free--; cur = newFrame(now); } };
      startIf(0);
      // LFC: the driver measures the interval between presents (est) and, when it is longer than the panel's longest frame,
      // places repeats at anchor + j·est/m (anchor = when the last shown frame was presented) so that the next present lands
      // on a slot rather than in the middle of a repeat. A repeat slot shorter than Pmin cannot be used.
      let anchor = 0, lastReady = 0;
      const nextRepeat = () => {
        if (p.lfc && est > Pmax) { const m = Math.ceil(est / Pmax), d = est / m; if (d >= Pmin - 1e-9) { let j = 1; while (anchor + j * d < lastStart + Pmin - 1e-9) j++; return Math.min(anchor + j * d, lastStart + Pmax); } }
        return lastStart + Pmax;
      };
      while (lastStart < T) {
        const tq = Q.length ? Math.max(Q[0].end, lastStart + Pmin) : Infinity, tRep = nextRepeat(), tEnd = cur ? cur.end : Infinity;
        if (tEnd <= Math.min(tq, tRep)) { const now = tEnd; if (frames.length > 1) est = now - lastReady; lastReady = now; Q.push(cur); cur = null; startIf(now); continue; }
        const now = Math.min(tq, tRep); let flipped = false, waited = 0;
        if (Q.length && tq <= tRep) { const f = Q.shift(); waited = now - f.end; f.first = now; front = f.id; anchor = f.end; free++; flipped = true; }
        scans.push({ t: now, segs: [[front, 0, 1]], tears: [], repeat: !flipped, waited });
        lastStart = now; startIf(now);
      }
    }
    return Object.assign(stats(frames, scans, p), { frames, scans, P, Sc, Pmax, p });
  }
  function stats(frames, scans, p) {
    const w0 = p.warm, w1 = p.warm + p.win, inW = x => x >= w0 && x < w1;
    const rendered = frames.filter(f => inW(f.end)), shown = rendered.filter(f => f.first != null);
    const dropped = rendered.length - shown.length;
    const lat = shown.map(f => f.first - f.start), mean = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
    const scW = scans.filter(s => inW(s.t)), tears = scW.reduce((s, x) => s + x.tears.length, 0), repeats = scW.filter(s => s.repeat).length;
    // pacing: the clock of the content (render start) against the clock of the screen (first scan-out), frame to frame
    const sh = frames.filter(f => f.first != null && f.first >= w0 && f.first < w1).sort((a, b) => a.first - b.first);
    const err = []; const holds = [];
    for (let i = 1; i < sh.length; i++) { err.push(Math.abs((sh[i].first - sh[i - 1].first) - (sh[i].start - sh[i - 1].start))); holds.push(sh[i].first - sh[i - 1].first); }
    const s = p.win / 1000;
    return { renderFps: rendered.length / s, shownFps: sh.length / s,   // shown = first scanned out inside the window
      dropped, tearsPerS: tears / s, repeatsPerS: repeats / s, latency: mean(lat), latMax: lat.length ? Math.max(...lat) : 0, pacing: mean(err), holdMin: holds.length ? Math.min(...holds) : 0, holdMax: holds.length ? Math.max(...holds) : 0 };
  }

  /* ── 05 the colour pipeline: DEGAMMA_LUT → CTM → GAMMA_LUT ── */
  function xyToXYZ([x, y]) { return [x / y, 1, (1 - x - y) / y]; }
  function inv3(m) {
    const [a, b, c] = m[0], [d, e, f] = m[1], [g, h, i] = m[2];
    const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C;
    return [[A / det, -(b * i - c * h) / det, (b * f - c * e) / det], [B / det, (a * i - c * g) / det, -(a * f - c * d) / det], [C / det, -(a * h - b * g) / det, (a * e - b * d) / det]];
  }
  const mul3 = (m, n) => m.map(r => [0, 1, 2].map(j => r[0] * n[0][j] + r[1] * n[1][j] + r[2] * n[2][j]));
  const apply3 = (m, v) => m.map(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
  function rgbToXYZ(prim) {
    const P = [0, 1, 2].map(i => xyToXYZ(prim[i])), M = [[P[0][0], P[1][0], P[2][0]], [P[0][1], P[1][1], P[2][1]], [P[0][2], P[1][2], P[2][2]]];
    const s = apply3(inv3(M), xyToXYZ(SRC.prim.d65));
    return M.map(r => r.map((x, j) => x * s[j]));
  }
  function convMatrix(from, to) { return mul3(inv3(rgbToXYZ(SRC.prim[to])), rgbToXYZ(SRC.prim[from])); }
  // PQ (SMPTE ST 2084): absolute luminance ↔ signal 0..1
  const Q = SRC.pq;
  function pqEncode(nits) { const y = Math.pow(clamp(nits, 0, Q.peak) / Q.peak, Q.m1); return Math.pow((Q.c1 + Q.c2 * y) / (1 + Q.c3 * y), Q.m2); }
  function pqDecode(e) { const p = Math.pow(clamp(e, 0, 1), 1 / Q.m2); return Q.peak * Math.pow(Math.max(p - Q.c1, 0) / (Q.c2 - Q.c3 * p), 1 / Q.m1); }
  const COL = {
    colours: { red: [255, 0, 0], skin: [224, 172, 138], grey: [128, 128, 128], dark: [24, 24, 24] },
    targets: ['srgb', 'p3', 'pq'], luts: [17, 33, 256, 1024], sdrNits: 200   // TUNED: the brightness SDR white is mapped to in HDR mode (a user setting)
  };
  function regamma(target, l, sdrNits) { return target === 'pq' ? pqEncode(l * sdrNits) : linToSrgb(clamp(l, 0, 1)); }
  // a 1-D LUT of n entries sampled from the exact curve, read with linear interpolation (input 0..1)
  function lut(fn, n) { const t = Array.from({ length: n }, (_, i) => fn(i / (n - 1))); return x => { const u = clamp(x, 0, 1) * (n - 1), i = Math.min(Math.floor(u), n - 2), f = u - i; return t[i] + (t[i + 1] - t[i]) * f; }; }
  function colour(rgb8, target, bits, lutN, sdrNits) {
    const sn = sdrNits || COL.sdrNits, max = (1 << bits) - 1;
    const enc = rgb8.map(c => c / 255), lin = enc.map(srgbToLin);
    const M = target === 'srgb' ? [[1, 0, 0], [0, 1, 0], [0, 0, 1]] : convMatrix('bt709', target === 'p3' ? 'p3' : 'bt2020');
    const lin2 = apply3(M, lin);
    const exact = x => regamma(target, x, sn), L = lut(exact, lutN);
    const out = lin2.map(x => Math.round(L(x) * max)), outExact = lin2.map(x => Math.round(exact(x) * max));
    // a grey ramp of all 256 input codes through the same pipeline: worst error and distinct output levels
    let worst = 0; const levels = new Set();
    for (let c = 0; c < 256; c++) { const l = srgbToLin(c / 255); const a = L(l) * max, b = exact(l) * max; worst = Math.max(worst, Math.abs(a - b)); levels.add(Math.round(a)); }
    const nits = target === 'pq' ? lin2.map(x => x * sn) : null;
    return { enc, lin, M, lin2, out, outExact, worst, levels: levels.size, nits, max };
  }

  /* ── 06/07 what a link carries ── */
  const LINK = {
    order: ['hdmi14', 'hdmi20', 'hbr2', 'hbr3', 'uhbr10', 'frl48', 'uhbr135', 'uhbr20', 'frl96'],   // by capacity, so the first that fits is the smallest
    // capacity in Gb/s of picture data; kind decides how the need is counted
    caps: {
      hdmi14: { kind: 'tmds', maxChar: SRC.hdmi.tmds14 },
      hdmi20: { kind: 'tmds', maxChar: SRC.hdmi.tmds20 },
      hbr2:   { kind: 'dp', raw: 4 * SRC.dp.rates8b10b.hbr2, gbps: 4 * SRC.dp.rates8b10b.hbr2 * 0.8 },
      hbr3:   { kind: 'dp', raw: 4 * SRC.dp.rates8b10b.hbr3, gbps: 4 * SRC.dp.rates8b10b.hbr3 * 0.8 },
      uhbr10: { kind: 'dp', uhbr: true, raw: 4 * SRC.dp.uhbrRaw.uhbr10, gbps: 4 * SRC.dp.uhbrRaw.uhbr10 * SRC.dp.uhbrEff },
      uhbr135:{ kind: 'dp', uhbr: true, raw: 4 * SRC.dp.uhbrRaw.uhbr135, gbps: 4 * SRC.dp.uhbrRaw.uhbr135 * SRC.dp.uhbrEff },
      uhbr20: { kind: 'dp', uhbr: true, raw: 4 * SRC.dp.uhbrRaw.uhbr20, gbps: 4 * SRC.dp.uhbrRaw.uhbr20 * SRC.dp.uhbrEff },
      frl48:  { kind: 'frl', raw: 4 * 12, gbps: 4 * 12 * SRC.hdmi.frlCode },
      frl96:  { kind: 'frl', raw: SRC.hdmi.hdmi22Raw, gbps: SRC.hdmi.hdmi22Raw * SRC.hdmi.frlCode, claimed: true }
    },
    modes: {
      fhd60: { t: 'cta16' }, qhd144: { cvt: [2560, 1440, 144] }, uhd60: { t: 'cta97' }, uhd120: { t: 'cta118' },
      uhd144: { cvt: [3840, 2160, 144] }, uhd240: { cvt: [3840, 2160, 240] }, k8_60: { t: 'cta199' }
    },
    modeOrder: ['fhd60', 'qhd144', 'uhd60', 'uhd120', 'uhd144', 'uhd240', 'k8_60'],
    bpcs: [8, 10, 12], chromas: ['444', '422', '420'], dscs: [0, 12, 10, 8]
  };
  // TMDS capacity counted as payload bits: 3 lanes × max character rate × 8 data bits per 10-bit character
  for (const k of ['hdmi14', 'hdmi20']) { const c = LINK.caps[k]; c.raw = c.maxChar * SRC.hdmi.tmdsLanes * SRC.hdmi.tmdsBitsPerChar / 1000; c.gbps = c.maxChar * SRC.hdmi.tmdsLanes * 8 / 1000; }
  function modeTiming(mode) { const m = LINK.modes[mode]; return timing(m.t ? TIM.presets[m.t] : cvtRb2(...m.cvt)); }
  const chromaFactor = c => (c === '444' ? 3 : c === '422' ? 2 : 1.5);
  function linkNeed(mode, bpc, chroma, dsc) {
    const tm = modeTiming(mode), bpp = dsc ? dsc : bpc * chromaFactor(chroma);
    // TMDS character rate (MHz): 4:4:4 scales with bpc/8, 4:2:2 rides at the pixel clock up to 12 bits, 4:2:0 at half rate
    const tmdsChar = chroma === '444' ? tm.pclkMHz * bpc / 8 : chroma === '422' ? tm.pclkMHz : tm.pclkMHz / 2 * bpc / 8;
    return { tm, bpp, gbps: tm.pclk * bpp / 1e9, tmdsChar, dsc: !!dsc };
  }
  function linkFit(mode, bpc, chroma, dsc) {
    const n = linkNeed(mode, bpc, chroma, dsc);
    const rows = LINK.order.map(k => {
      const c = LINK.caps[k];
      if (c.kind === 'tmds') { const na = n.dsc || (chroma === '422' && bpc > 12); const need = na ? null : n.tmdsChar * SRC.hdmi.tmdsLanes * 8 / 1000; return { k, cap: c.gbps, need, fits: !na && n.tmdsChar <= c.maxChar + 1e-9, na, claimed: false }; }
      // DSC on an 8b/10b DP link needs FEC, which takes 2.4 % of the link (UHBR's 96.71 % already includes its FEC)
      const cap = c.kind === 'dp' && !c.uhbr && n.dsc ? c.gbps / (1 + SRC.dp.fec8b10b) : c.gbps;
      return { k, cap, need: n.gbps, fits: n.gbps <= cap + 1e-9, na: false, claimed: !!c.claimed, fec: cap !== c.gbps };
    });
    const first = rows.find(r => r.fits);
    return { need: n, rows, first: first ? first.k : null };
  }
  // the smallest DSC bits per pixel (in 1/16 steps, DSC's granularity) that fits a capacity
  // (on an 8b/10b DP link pass fec = true: FEC is mandatory with DSC there and costs 2.4016 %)
  function dscFor(mode, cap, fec) { const tm = modeTiming(mode), c = fec ? cap / (1 + SRC.dp.fec8b10b) : cap; return Math.floor(c * 1e9 / tm.pclk * 16) / 16; }

  /* ── 07 chroma subsampling on a pixel patch: BT.709 Y'CbCr (full range), 2×2 box average of Cb and Cr, replicated back ── */
  const SUB = { patterns: ['text', 'photo', 'lines'], W: 16, H: 12 };
  function patch(kind) {
    const W = SUB.W, H = SUB.H, out = [];
    // a 5×7 bitmap "A" and "B", drawn twice: saturated red on blue
    const A = ['01110', '10001', '10001', '11111', '10001', '10001', '10001'], Bm = ['11110', '10001', '10001', '11110', '10001', '10001', '11110'];
    const R = rng(5);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let c;
      if (kind === 'text') {
        const gy = y - 2, ink = (bm, x0) => gy >= 0 && gy < 7 && x - x0 >= 0 && x - x0 < 5 && bm[gy][x - x0] === '1';
        c = ink(A, 2) || ink(Bm, 9) ? [230, 30, 30] : [20, 40, 170];
      } else if (kind === 'photo') {
        const u = x / (W - 1), v = y / (H - 1), n = (R() - 0.5) * 6;
        c = [150 + 60 * u + n, 110 + 40 * v + n, 80 + 30 * (1 - u) + n].map(z => Math.round(clamp(z, 0, 255)));
      } else c = x % 2 === 0 ? [230, 30, 30] : [30, 200, 60];
      out.push(c);
    }
    return out;
  }
  const K = SRC.ycc;
  function toYcc([r, g, b]) { const R = r / 255, G = g / 255, B = b / 255, Y = K.kr * R + (1 - K.kr - K.kb) * G + K.kb * B; return [Y, (B - Y) / (2 * (1 - K.kb)), (R - Y) / (2 * (1 - K.kr))]; }
  function fromYcc([Y, Cb, Cr]) { const R = Y + 2 * (1 - K.kr) * Cr, B = Y + 2 * (1 - K.kb) * Cb, G = (Y - K.kr * R - K.kb * B) / (1 - K.kr - K.kb); return [R, G, B].map(z => Math.round(clamp(z, 0, 1) * 255)); }
  function subsample(kind, mode) {
    const W = SUB.W, H = SUB.H, src = patch(kind), ycc = src.map(toYcc), out = [];
    const sx = mode === '444' ? 1 : 2, sy = mode === '420' ? 2 : 1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const x0 = x - (x % sx), y0 = y - (y % sy); let cb = 0, cr = 0, n = 0;
      for (let j = y0; j < y0 + sy; j++) for (let i = x0; i < x0 + sx; i++) { const q = ycc[j * W + i]; cb += q[1]; cr += q[2]; n++; }
      out.push(fromYcc([ycc[y * W + x][0], cb / n, cr / n]));
    }
    let sum = 0, worst = 0, bad = 0;
    src.forEach((c, i) => { const e = Math.max(...c.map((z, k) => Math.abs(z - out[i][k]))); sum += c.reduce((s, z, k) => s + Math.abs(z - out[i][k]), 0) / 3; worst = Math.max(worst, e); if (e > 16) bad++; });
    const bitsPerPx = 8 * (1 + 2 / (sx * sy));
    return { src, out, mean: sum / src.length, worst, bad, share: bad / src.length, bitsPerPx };
  }

  /* ── 08 rows: the time a row gets, and an RC settling estimate for the pixel ── */
  const PANEL = {
    rows: [1080, 1440, 2160], techs: { asi: 0.8, oxide: 0.3, ltps: 0.1 },  // TUNED: charging time constant τ in µs (order of magnitude)
    vtotRatio: 2250 / 2160                                                  // the CTA 4K vertical total as a share of active rows
  };
  function rowTime(rows, hz, tech, bits) {
    const tau = PANEL.techs[tech], vtot = Math.round(rows * PANEL.vtotRatio), lineUs = 1e6 / (hz * vtot);
    const b = bits || 10, lsb = 1 / ((1 << b) - 1), err = Math.exp(-lineUs / tau);         // fraction of the step still missing
    const needUs = tau * Math.log(2 / lsb);                                                // settle to half a code
    return { vtot, lineUs, tau, err, errCodes: err / lsb, ok: err <= lsb / 2, needUs, hzMax: 1e6 / (vtot * needUs) };
  }

  /* ── 09 motion blur: a bright edge moving at v px/s, followed by the eye. Each pixel switches once (first-order response
     τ, the pixel at p switches at the first frame boundary after the edge passes it); the backlight or emission is on for
     the last `duty` share of every frame. Perceived profile I(u) = time average of light(u + v·t, t) along the eye's
     path; blur width = distance between the 10 % and 90 % points (the blurred-edge-width idea behind MPRT). ── */
  const BLUR = { speeds: [240, 480, 960, 1920, 3840], hzs: [60, 120, 240, 480], duties: [1, 0.5, 0.25], taus: { oled: 0.03, fast: 1.0, slow: 4.0 } }; // taus TUNED (ms)
  function blur(v, hz, duty, tauMs, n) {
    const T = 1000 / hz, vt = v * T / 1000, M = 6, N = n || 241, half = Math.max(vt * 1.5, v * (tauMs * 4 + T) / 1000, 6);
    const us = Array.from({ length: N }, (_, i) => -half + 2 * half * i / (N - 1));
    const steps = 360, prof = us.map(u => {
      let acc = 0, wsum = 0;
      for (let k = -M; k < M; k++) for (let s = 0; s < steps; s++) {
        const ph = (s + 0.5) / steps; if (ph < 1 - duty) continue;
        const t = (k + ph) * T, p = u + v * t / 1000;                    // screen position under this retinal point at time t
        const kSw = Math.ceil(p / vt - 1e-12), tSw = kSw * T;             // the frame boundary at which pixel p turns bright
        const L = t < tSw ? 0 : (tauMs > 0 ? 1 - Math.exp(-(t - tSw) / tauMs) : 1);
        acc += L; wsum++;
      }
      return acc / wsum;
    });
    // the edge moves right: bright behind (u ≪ 0), dark ahead; the profile falls from ~1 to 0
    const hi = prof[0], lo = prof[N - 1], at = q => { const y = lo + (hi - lo) * q; for (let i = 1; i < N; i++) if ((prof[i - 1] - y) * (prof[i] - y) <= 0) { const a = prof[i - 1], b = prof[i]; return us[i - 1] + (us[i] - us[i - 1]) * (a === b ? 0 : (a - y) / (a - b)); } return NaN; };
    const width = Math.abs(at(0.1) - at(0.9));
    return { us, prof, width, ms: width / v * 1000, holdPx: vt * duty, T };
  }

  /* ── 10 PQ against a plain gamma 2.4 curve stretched to a peak ── */
  function pqCode(nits, bits) { const max = (1 << (bits || 10)) - 1; return Math.round(pqEncode(nits) * max); }
  function steps(nits, peak, bits) {
    const max = (1 << (bits || 10)) - 1;
    const cq = pqCode(nits, bits), lq = pqDecode(cq / max), lq1 = pqDecode((cq + 1) / max);
    const g = c => peak * Math.pow(c / max, 2.4), cg = Math.round(Math.pow(clamp(nits / peak, 0, 1), 1 / 2.4) * max);
    const lg = g(cg), lg1 = g(Math.min(cg + 1, max));
    return { pq: { code: cq, step: (lq1 - lq) / Math.max(lq, 1e-9) }, gamma: { code: cg, step: (lg1 - lg) / Math.max(lg, 1e-9), clipped: nits > peak } };
  }

  /* ── 11 input to photon: a sum of stages, the render-and-queue part taken from the present-queue simulator ── */
  const LAT = { polls: [125, 1000, 8000], panels: { lcd: 5, oled: 0.5 }, composeFrames: 1 };  // panel response TUNED (ms); composed = one extra refresh (TUNED)
  function latency(o) {
    const p = Object.assign({ fps: 120, hz: 120, mode: 'fifo2', composed: false, panel: 'lcd', poll: 1000 }, o || {});
    const F = 1000 / p.fps, sim = present({ hz: p.hz, ms: F, mode: p.mode, vmin: 48, vmax: p.hz, jitter: 0.1, seed: 3 });
    const P = 1000 / p.hz;
    const st = [
      ['poll', 500 / p.poll], ['tick', F / 2], ['render', sim.latency],
      ['compose', p.composed ? LAT.composeFrames * P : 0], ['scan', PRES.act * P / 2], ['panel', LAT.panels[p.panel]]
    ];
    return { stages: st, total: st.reduce((s, x) => s + x[1], 0), sim, F, P };
  }

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  let PROSE_CACHE = null;
  function prose() {
    if (PROSE_CACHE) return PROSE_CACHE;
    const q = framebuffer('uhd', 'rgba8', 120, 3), q60 = framebuffer('uhd', 'rgba8', 60, 2), qfp = framebuffer('uhd', 'fp16', 120, 3);
    const dk = darkCodes(0.01);
    const t97 = timing(TIM.presets.cta97), t118 = timing(TIM.presets.cta118), t117 = timing(TIM.presets.cta117), tcvt = timing(TIM.presets.cvt4k60), t16 = timing(TIM.presets.cta16);
    const k = SRC.kmsVrr;
    const f2 = present({ hz: k.hz, ms: 1000 / k.fps, mode: 'fifo2' }), im = present({ hz: k.hz, ms: 1000 / k.fps, mode: 'immediate' }), f3 = present({ hz: 60, ms: 1000 / 90, mode: 'fifo3' }), mb = present({ hz: 60, ms: 1000 / 90, mode: 'mailbox' }), f2fast = present({ hz: 60, ms: 1000 / 90, mode: 'fifo2' });
    const f348 = present({ hz: k.hz, ms: 1000 / k.fps, mode: 'fifo3' }), v31 = present({ ms: 31, mode: 'vrr', lfc: true }), vrFast = present({ ms: 1000 / 90, mode: 'vrr' });
    const vr = present({ ms: 1000 / k.fps, mode: 'vrr' }), v25 = present({ ms: 40, mode: 'vrr', lfc: false }), v25l = present({ ms: 40, mode: 'vrr', lfc: true });
    const cRed = colour(COL.colours.red, 'p3', 8, 1024), cRed2020 = colour(COL.colours.red, 'pq', 10, 1024), c17 = colour(COL.colours.grey, 'srgb', 8, 17), c1024 = colour(COL.colours.grey, 'srgb', 8, 1024), cPq17 = colour(COL.colours.grey, 'pq', 10, 17);
    const M2020 = convMatrix('bt709', 'bt2020');
    const n4k60 = linkNeed('uhd60', 8, '444', 0), n4k60h = linkNeed('uhd60', 10, '444', 0), n4k120 = linkNeed('uhd120', 10, '444', 0), n4k240 = linkNeed('uhd240', 10, '444', 0), n8k = linkNeed('k8_60', 10, '444', 0);
    const d240 = dscFor('uhd240', LINK.caps.hbr3.gbps, true), d8k = dscFor('k8_60', LINK.caps.hbr3.gbps, true), d240nf = dscFor('uhd240', LINK.caps.hbr3.gbps, false), n4k240d = linkNeed('uhd240', 10, '444', 12);
    const n4k60_420 = linkNeed('uhd60', 10, '420', 0);
    const sT = subsample('text', '420'), sP = subsample('photo', '420'), sL = subsample('lines', '422');
    const r60 = rowTime(2160, 60, 'oxide'), r240 = rowTime(2160, 240, 'oxide'), rA = rowTime(2160, 120, 'asi'), rA60 = rowTime(2160, 60, 'asi');
    const b60 = blur(960, 60, 1, 0), b240 = blur(960, 240, 1, 0), bS = blur(960, 60, 0.25, 0), bL = blur(960, 120, 1, 4), bO = blur(960, 120, 1, BLUR.taus.oled);
    const s100 = steps(100, 10000), s1 = steps(1, 10000), sg1 = steps(1, 1000);
    const L0 = latency({ fps: 120, hz: 120, mode: 'fifo3', composed: true, panel: 'lcd', poll: 125 }), L1 = latency({ fps: 120, hz: 120, mode: 'vrr', composed: false, panel: 'oled', poll: 1000 });
    PROSE_CACHE = {
      // hero, ch1
      pxPerS: [q.pxPerS, 0], pxPerSyi: [q.pxPerS / 1e8, 2], frameMiB: [q.frameMiB, 1], fb3MiB: [q.totalMiB, 1], readGBps: [q.readGBps, 2], read60: [q60.readGBps, 2], fp16GBps: [qfp.readGBps, 2],
      darkSrgb: [dk.srgb, 0], darkLin: [dk.linear, 0],
      // ch2
      h97: [t97.hTot, 0], v97: [t97.vTot, 0], pclk97: [t97.pclkMHz, 0], hfp97: [t97.h[1], 0], hs97: [t97.h[2], 0], hbp97: [t97.h[3], 0], vfp97: [t97.v[1], 0], vs97: [t97.v[2], 0], vbp97: [t97.v[3], 0],
      blank97: [t97.blankShare, 1, 'pct'], pclk118: [t118.pclkMHz, 0], h117: [t117.hTot, 0],
      pclkCvt: [tcvt.pclkMHz, 3], hCvt: [tcvt.hTot, 0], vCvt: [tcvt.vTot, 0], blankCvt: [tcvt.blankShare, 1, 'pct'],
      // ch3
      kFps: [k.fps, 0], kHz: [k.hz, 0], f2Shown: [f2.shownFps, 0], f2Lat: [f2.latency, 1], imTears: [im.tearsPerS, 0], imLat: [im.latency, 1],
      f3p48: [f348.pacing, 1], f3h48min: [f348.holdMin, 1], f3h48max: [f348.holdMax, 1], f3Lat: [f3.latency, 1], mbLat: [mb.latency, 1], mbDrop: [mb.dropped, 0], f2fastLat: [f2fast.latency, 1],
      // ch4
      kMin: [k.vmin, 0], kMax: [k.vmax, 0], vrPace: [vr.pacing, 1], vrLat: [vr.latency, 1], v25Pace: [v25.pacing, 1], v25lPace: [v25l.pacing, 1], vPmax: [1000 / k.vmin, 1], vPmin: [1000 / k.vmax, 1], v31Pace: [v31.pacing, 1], vRatio: [k.vmax / k.vmin, 2], vP2min: [2000 / k.vmax, 1], v25ms: [40, 0], fastFps: [90, 0], vrFastLat: [vrFast.latency, 1],
      // ch5
      p3R: [cRed.out[0], 0], p3G: [cRed.out[1], 0], p3B: [cRed.out[2], 0], m00: [M2020[0][0], 4], m01: [M2020[0][1], 4], m02: [M2020[0][2], 4],
      pqR: [cRed2020.out[0], 0], pqG: [cRed2020.out[1], 0], lut17: [c17.worst, 1], lut17lv: [c17.levels, 0], lut1024lv: [c1024.levels, 0], lutPq17: [cPq17.worst, 1], sdrNits: [COL.sdrNits, 0],
      // ch6
      need4k60: [n4k60.gbps, 2], char4k60: [n4k60.tmdsChar, 0], char4k60h: [n4k60h.tmdsChar, 1], char4k60_420: [n4k60_420.tmdsChar, 1], need4k120: [n4k120.gbps, 2], need4k240: [n4k240.gbps, 2], need8k: [n8k.gbps, 2],
      capHbr3: [LINK.caps.hbr3.gbps, 2], capUhbr20: [LINK.caps.uhbr20.gbps, 2], capFrl: [LINK.caps.frl48.gbps, 2], capHdmi20: [LINK.caps.hdmi20.gbps, 1], capUhbr135: [LINK.caps.uhbr135.gbps, 2], capUhbr10: [LINK.caps.uhbr10.gbps, 2], capHbr3Fec: [LINK.caps.hbr3.gbps / (1 + SRC.dp.fec8b10b), 2], fecPct: [SRC.dp.fec8b10b, 1, 'pct'], uhbrEff: [SRC.dp.uhbrEff, 2, 'pct'], char4k60_422: [linkNeed('uhd60', 10, '422', 0).tmdsChar, 0],
      // ch7
      dsc240: [d240, 2], dsc240nf: [d240nf, 2], dsc8k: [d8k, 2], need240d: [n4k240d.gbps, 2], dscRatio240: [30 / d240, 1], subT: [sT.mean, 1], subP: [sP.mean, 1], subTbad: [sT.share, 0, 'pct'], subLworst: [sL.worst, 0],
      // ch8
      row60: [r60.lineUs, 2], row240: [r240.lineUs, 3], vtot2160: [r60.vtot, 0], tauOx: [PANEL.techs.oxide, 2], tauAsi: [PANEL.techs.asi, 1], needAsi: [rA.needUs, 1], hzMaxAsi: [rA.hzMax, 0], hzMaxOx: [r60.hzMax, 0], asiErr120: [rA.errCodes, 1],
      // ch9
      blur60: [b60.width, 1], blur240: [b240.width, 1], blurStrobe: [bS.width, 1], blurLcd: [bL.width, 1], blurOled: [bO.width, 1], ramp60: [b60.holdPx, 0], bv: [960, 0], tauO: [BLUR.taus.oled, 2], tauF: [BLUR.taus.fast, 0], tauS: [BLUR.taus.slow, 0],
      // ch10
      pq100: [s100.pq.code, 0], pq1: [s1.pq.code, 0], pqStep100: [s100.pq.step, 2, 'pct'], pqStep1: [s1.pq.step, 2, 'pct'], gStep1: [sg1.gamma.step, 1, 'pct'], pqTop: [pqCode(1000, 10), 0],
      // ch11
      lat0: [L0.total, 1], l0fps: [120, 0], l0poll: [125, 0], l1poll: [1000, 0], panLcd: [LAT.panels.lcd, 0], panOled: [LAT.panels.oled, 1],
      // ch12
      row720: [rowTime(1080, FRONTIER.oled720.hz, 'ltps').lineUs, 2], jump720: [960 / FRONTIER.oled720.hz, 2],
      // ch5 (DXGI)
      fitLo: [SRC.dxgi.fitLo, 2], fitHi: [SRC.dxgi.fitHi, 0],
      lat1: [L1.total, 1], lat0r: [L0.stages[2][1], 1], lat0c: [L0.stages[3][1], 1]
    };
    return PROSE_CACHE;
  }

  /* ── formatting ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    const k = Math.pow(10, s); x = Math.sign(x) * Math.round(Math.abs(x) * k * (1 + 1e-12)) / k;
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s });
  }
  function fmtKind(v, kind) { if (kind === 'str') return String(v); if (kind === 'hex2') return '0x' + v.toString(16).toUpperCase().padStart(2, '0'); return null; }

  /* ── live sentences: each returns { key } ── */
  const say = {
    fb(r) { return { key: r.readGBps >= 10 ? 'ch1.say.huge' : r.B === 8 ? 'ch1.say.fp16' : 'ch1.say.ok' }; },
    timing(r) { if (!r.edited) return { key: 'ch2.say.std' }; return { key: r.pclkMHz > 1188 ? 'ch2.say.fast' : 'ch2.say.edit' }; },
    present(r) {
      const m = r.p.mode;
      if (m === 'immediate') return { key: r.tearsPerS > 0 ? 'ch3.say.tear' : 'ch3.say.notear' };
      if (m === 'vrr') { if (r.renderFps > r.p.vmax + 0.5) return { key: 'ch4.say.cap' }; if (1000 / r.p.ms < r.p.vmin) return { key: r.p.lfc ? 'ch4.say.lfc' : 'ch4.say.nolfc' }; return { key: 'ch4.say.smooth' }; }
      if (r.pacing > 2) return { key: 'ch3.say.stutter' };
      if (m === 'mailbox') return { key: 'ch3.say.mailbox' };
      return { key: r.latency > 2.5 * r.P ? 'ch3.say.queue' : 'ch3.say.even' };
    },
    colour(r, target) { if (target === 'pq') return { key: 'ch5.say.pq' }; if (r.levels < 256 && r.worst >= 0.5) return { key: 'ch5.say.band' }; return { key: 'ch5.say.' + target }; },
    link(r) { if (!r.first) return { key: 'ch6.say.none' }; return { key: r.need.dsc ? 'ch6.say.dsc' : 'ch6.say.fit' }; },
    sub(r, mode) { if (mode === '444') return { key: 'ch7.say.full' }; return { key: r.share > 0.2 ? 'ch7.say.bad' : 'ch7.say.fine' }; },
    row(r) { return { key: r.ok ? 'ch8.say.ok' : 'ch8.say.short' }; },
    blur(r, duty, tau) { if (tau >= 1 && r.width > 1.5 * r.holdPx) return { key: 'ch9.say.lcd' }; return { key: duty < 1 ? 'ch9.say.strobe' : 'ch9.say.hold' }; },
    pq(r) { return { key: r.gamma.clipped ? 'ch10.say.clip' : r.gamma.step > r.pq.step * 1.5 ? 'ch10.say.pqwins' : 'ch10.say.close' }; },
    lat(r) { const big = r.stages.reduce((a, b) => (b[1] > a[1] ? b : a)); return { key: 'ch11.say.' + big[0] }; }
  };

  return { SRC, FRONTIER, rng, FB, framebuffer, srgbToLin, linToSrgb, darkCodes, TIM, timing, cvtRb2, fromDrm, PRES, present, COL, colour, convMatrix, rgbToXYZ, pqEncode, pqDecode, lut,
    LINK, linkNeed, linkFit, dscFor, modeTiming, SUB, patch, subsample, toYcc, fromYcc, PANEL, rowTime, BLUR, blur, pqCode, steps, LAT, latency, prose, fmt, fmtKind, say };
});
