'use strict';
// Pins the page's display models: the CTA-861 timing tables and the CVT-RB2 port (cross-checked against the Thunderbolt
// essay's own CVT); the framebuffer arithmetic; the present-queue simulator (tearing, vsync, mailbox, VRR and LFC) on
// its invariants; the colour pipeline (sRGB round trip, the derived 709 → 2020 matrix against BT.2087, PQ constants and
// round trip, LUT error); the link-fit table against the DisplayPort and HDMI figures; 4:2:0 on its patches; row time,
// motion blur and PQ steps; the latency sum; the sourced and frontier figures typed again from their sources; every
// number the prose quotes (placeholders filled from prose(), literals checked against models.js); every live sentence
// branch; copy keys, language hygiene, the registry, links to live siblings and the sibling essays' aliases.
// Run: node computing/systems/how-pixels-reach-a-screen/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const ROOT = path.join(DIR, '..', '..', '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
// index.html may be a template build with the zh copy pre-filled (specs/site-template.md §8); every check reads
// the markup with exactly that pre-fill removed, so hand-typed text still shows (scripts/lib/prefill.cjs).
const { unprefill } = require(path.join(DIR, '..', '..', '..', 'scripts', 'lib', 'prefill.cjs'));
const html = unprefill(fs.readFileSync(path.join(DIR, 'index.html'), 'utf8'), Z);
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
const { SRC, FRONTIER } = M;

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function within(name, got, lo, hi) { n++; if (!(got >= lo && got <= hi)) { fails++; console.error(`FAIL ${name}: ${got} not in [${lo}, ${hi}]`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
const f = (x, d) => x.toFixed(d);
const P = M.prose();

/* ── sourced figures, typed again from the sources (BRIEF.md lists URL and date) ── */
{
  // Linux v6.12 drm_edid.c edid_cea_modes_1[]: clock kHz, h and v (display, sync start, sync end, total)
  const C = SRC.cta, row = m => [m.clk, ...m.h, ...m.v].join();
  check('VIC 16 1080p60', row(C.vic16), '148500,1920,2008,2052,2200,1080,1084,1089,1125');
  check('VIC 97 2160p60', row(C.vic97), '594000,3840,4016,4104,4400,2160,2168,2178,2250');
  check('VIC 117 2160p100', row(C.vic117), '1188000,3840,4896,4984,5280,2160,2168,2178,2250');
  check('VIC 118 2160p120', row(C.vic118), '1188000,3840,4016,4104,4400,2160,2168,2178,2250');
  check('VIC 199 4320p60', row(C.vic199), '2376000,7680,8232,8408,9000,4320,4336,4356,4400');
  // every CTA preset's clock = htotal × vtotal × refresh exactly
  for (const k of ['cta16', 'cta97', 'cta117', 'cta118', 'cta199']) check(k + ' clock = totals × Hz', M.timing(M.TIM.presets[k]).matches, true);
  // edid-decode calc_cvt_mode, RB v2
  const V = SRC.cvt; check('CVT-RB2 constants', [V.hBlank, V.hfp, V.hsync, V.vsync, V.vbp, V.vfpMin, V.minVblankUs].join(), '80,8,32,8,6,1,460');
  const cvt = M.cvtRb2(3840, 2160, 60); check('CVT-RB2 4K60 totals and clock', [cvt.h.reduce((a, b) => a + b), cvt.v.reduce((a, b) => a + b), cvt.clkKHz].join(), '3920,2222,522614');
  // cross-check: the Thunderbolt essay computes the same monitor with its own CVT code
  { const TB = require(path.join(DIR, '..', 'how-thunderbolt-works', 'models.js')), P2 = TB.prose ? TB.prose() : null;
    if (P2 && P2.pclk4k) check('same 4K60 CVT pixel clock as how-thunderbolt-works', f(P2.pclk4k[0], 3), f(cvt.clkKHz / 1000, 3)); else console.log('NOTE: how-thunderbolt-works prose().pclk4k not found; CVT cross-check skipped'); }
  // DisplayPort (VESA DP 2.0 release 2019-06-26) and DPCD (drm_dp.h)
  check('DP rates 1.62/2.7/5.4/8.1, HBR3 ×4 payload 25.92', [...Object.values(SRC.dp.rates8b10b), SRC.dp.hbr3Payload4].join(), '1.62,2.7,5.4,8.1,25.92');
  check('8b/10b: 4 × 8.1 × 0.8 = 25.92', f(4 * 8.1 * 0.8, 2), '25.92');
  // Linux v6.12 drm_dp_helper.c: drm_dp_bw_channel_coding_efficiency(true) = 967100 ppm; drm_dp_bw_overhead() FEC += 24016 ppm
  check('UHBR efficiency 96.71 % (kernel)', SRC.dp.uhbrEff, 0.9671);
  check('UHBR payloads from the kernel efficiency: 38.68/52.22/77.37', ['uhbr10', 'uhbr135', 'uhbr20'].map(k => f(M.LINK.caps[k].gbps, 2)).join(), '38.68,52.22,77.37');
  check('kernel efficiency reproduces VESA UHBR20 77.37', f(4 * 20 * SRC.dp.uhbrEff, 2), f(SRC.dp.vesaUhbr20, 2));
  within('UHBR20 payload ≈ 80 × 128/132 less overhead', M.LINK.caps.uhbr20.gbps / (80 * 128 / 132), 0.99, 1.0);
  check('8b/10b FEC overhead (256·6+1)/(256·250) = 24016 ppm', Math.round(SRC.dp.fec8b10b * 1e6), 24016);
  const D = SRC.dpcd; check('DPCD 0x100/0x101/0x102/0x103/0x106/0x202', [D.linkBwSet, D.laneCountSet, D.trainingPatternSet, D.lane0Set, D.lane3Set, D.laneStatus].map(x => '0x' + x.toString(16)).join(), '0x100,0x101,0x102,0x103,0x106,0x202');
  for (const [code, gbps] of Object.entries(D.bwCodes)) check('LINK_BW_SET ' + code + ' × 0.27', f(+code * D.bwUnit, 2), f(gbps, 2));
  check('swing and pre-emphasis levels 0–3', [D.swingLevels, D.preEmphLevels].join(), '4,4');
  const H = SRC.hdmi; check('TMDS 340/600 MHz; FRL pairs', [H.tmds14, H.tmds20, H.frl.map(p => p.join('x')).join(' ')].join(), '340,600,3x3 3x6 4x6 4x8 4x10 4x12');
  check('DSC 3:1 RGB, 2:1 native 4:2:0, 2014-04', [SRC.dsc.rgbRatio, SRC.dsc.yuv420Ratio, SRC.dsc.introduced].join(), '3,2,2014-04');
  // colour
  for (const c of [0, 0.002, 0.04045, 0.2, 0.5, 0.9, 1]) within('sRGB round trip ' + c, Math.abs(M.linToSrgb(M.srgbToLin(c)) - c), 0, 1e-12);
  check('sRGB 0.5 → 0.2140 linear', f(M.srgbToLin(0.5), 4), '0.2140');
  const M2 = M.convMatrix('bt709', 'bt2020');
  SRC.bt2087.forEach((r, i) => r.forEach((x, j) => within(`709→2020 [${i}][${j}] vs BT.2087`, Math.abs(M2[i][j] - x), 0, 1e-4)));
  M2.forEach((r, i) => within('709→2020 row ' + i + ' sums to 1 (white stays white)', Math.abs(r[0] + r[1] + r[2] - 1), 0, 1e-12));
  const Pq = SRC.pq; check('PQ constants m1 m2 c1 c2 c3', [Pq.m1, Pq.m2, Pq.c1, Pq.c2, Pq.c3].map(x => x.toFixed(7)).join(), '0.1593018,78.8437500,0.8359375,18.8515625,18.6875000');
  for (const L of [0.005, 0.1, 1, 100, 1000, 10000]) within('PQ round trip ' + L, Math.abs(M.pqDecode(M.pqEncode(L)) / L - 1), 0, 1e-9);
  check('PQ 10000 nits = 1.0', f(M.pqEncode(10000), 9), '1.000000000');
  check('BT.709 luma 0.2126 / 0.0722', [SRC.ycc.kr, SRC.ycc.kb].join(), '0.2126,0.0722');
  check('KMS VRR example 48 fps on 60 Hz, 35–60', [SRC.kmsVrr.fps, SRC.kmsVrr.hz, SRC.kmsVrr.vmin, SRC.kmsVrr.vmax].join(), '48,60,35,60');
  check('DXGI: independent flip 1 frame; fitters 0.25×–4×', [SRC.dxgi.ifFrames, SRC.dxgi.fitLo, SRC.dxgi.fitHi].join(), '1,0.25,4');
  const F = FRONTIER;
  check('DP 2.1b 2025-01-06, DP80LL 3 m vs ~1 m passive, 80 Gb/s', [F.dp21b.announced, F.dp21b.dp80llM, F.dp21b.passiveM, F.dp21b.gbps].join(), '2025-01-06,3,1,80');
  check('HDMI 2.2 2025-06-25, 96 Gb/s, Ultra96 64/80/96, 12K120 16K60', [F.hdmi22.reported, F.hdmi22.gbps, F.hdmi22.ultra96.join('/'), F.hdmi22.k12, F.hdmi22.k16].join(), '2025-06-25,96,64/80/96,120,60');
  check('LG Display 720 Hz 24.5″ 1080p OLED, 0.02 ms, 2026-09-21', [F.oled720.date, F.oled720.hz, F.oled720.inch, F.oled720.gtg].join(), '2026-09-21,720,24.5,0.02');
  check('eDP 1.5 2021-10-27; AdaptiveSync CTS 2022-05-02 / 2023-05', [F.edp15.date, F.edp15.ver, F.asyncCts.date, F.asyncCts.update].join(), '2021-10-27,1.5,2022-05-02,2023-05');
  // the same figures as written in the prose
  for (const [k, s] of [['ch12.e1', '2025 年 1 月 6 日'], ['ch12.e1', '2025 年春季'], ['ch12.e1', '80 Gb/s'], ['ch12.e1', '大约只能 1 米'], ['ch12.e1', '到 3 米'],
    ['ch12.e2', '2025 年 6 月 25 日'], ['ch12.e2', '96 Gb/s'], ['ch12.e2', '64、80 或 96 Gb/s'], ['ch12.e2', '12K 120 Hz、16K 60 Hz'], ['ch12.e3', '2021 年 10 月 27 日'], ['ch12.e3', 'eDP 1.5'],
    ['ch12.e4', '2022 年 5 月 2 日'], ['ch12.e4', '2023 年 5 月'], ['ch12.d1', '2026 年 9 月'], ['ch12.d1', '24.5 英寸、1920 × 1080、720 Hz'], ['ch12.d1', '0.02 毫秒'], ['ch12.d1', '2026 年 9 月 21 日'],
    ['ch12.law', '截至 2026 年 11 月'], ['ch7.p4', '2014 年发布'], ['ch7.p4', '3:1'], ['ch7.p4', '2:1'], ['footer', '2019 年 6 月 26 日'], ['footer', 'Linux v6.12'],
    ['ch6.p2', '1.62 到 8.1 Gb/s'], ['ch6.p2', '32.4 Gb/s'], ['ch6.p2', 'VESA 的数字'], ['ch6.p3', '0x100 和 0x101'], ['ch6.p3', '0.27 Gb/s 的倍数'], ['ch6.p3', '0x1e 就是 8.1'],
    ['ch6.p4', '600 MHz'], ['ch6.p4', '四条通道各 12 Gb/s'], ['ch6.p4', '16b/18b'], ['ch2.p5', '80 个像素'], ['ch2.p5', '460 微秒'], ['ch5.p3', '1 帧延迟'], ['ch4.p2', 'HDMI 2.1']]) says(k, s);
  check('0x1e = 30 → 30 × 0.27 = 8.1', f(0x1e * 0.27, 1), '8.1'); check('HBR3 raw ×4 = 32.4', f(4 * SRC.dp.rates8b10b.hbr3, 1), '32.4');
  check('FRL top pair 4 × 12', SRC.hdmi.frl[SRC.hdmi.frl.length - 1].join(), '4,12');
  // the unverified pieces are labelled as such in the prose
  says('ch6.limit', '规范本页没有打开'); says('ch6.limit', '标为宣称'); says('ch4.p5', '本页没有在一手资料里核实'); says('ch10.p3', '这篇论文本页没有打开');
  says('ch12.d1', '厂商宣称');
}

/* ── 01 framebuffer ── */
{
  const r = M.framebuffer('uhd', 'rgba8', 120, 3);
  check('4K RGBA8 frame = 3840 × 2160 × 4', r.frame, 33177600); check('4K × 120 px/s', r.pxPerS, 995328000);
  for (const res of Object.keys(M.FB.res)) for (const fm of Object.keys(M.FB.fmts)) { const q = M.framebuffer(res, fm, 60, 2); check(`${res} ${fm}: total = 2 × frame`, q.total, 2 * q.frame); }
  const dk = M.darkCodes(0.01); check('codes for the darkest 1%: sRGB 26, linear 3', [dk.srgb, dk.linear].join(), '26,3');
  says('ch1.p3', '1%');
}

/* ── 02 timing: edits move the clock, not the visible size ── */
{
  const t97 = M.TIM.presets.cta97, base = M.timing(t97);
  check('unedited is standard', base.edited, false);
  const e = M.timing(t97, { hfp: 8, hbp: 40 }); check('edited porches: htotal 3840 + 8 + 88 + 40', e.hTot, 3976); check('edited is flagged', e.edited, true);
  within('blanking share falls with smaller porches', base.blankShare - e.blankShare, 0.01, 1);
  check('VIC 118 = VIC 97 at twice the clock', M.timing(M.TIM.presets.cta118).pclk, 2 * base.pclk);
}

/* ── 03/04 the present queue: invariants over the slider grid ── */
{
  for (const mode of M.PRES.modes) for (const hz of M.PRES.hzs) for (const fps of [20, 30, 48, 59, 60, 61, 90, 144, 200]) for (const j of [0, 0.1, 0.3]) {
    const r = M.present({ mode, hz, ms: 1000 / fps, jitter: j });
    n++; if (r.shownFps > hz + 0.5 && mode !== 'immediate') { fails++; console.error(`FAIL ${mode} ${hz} Hz ${fps} fps shows ${r.shownFps} > refresh`); }
    n++; if (mode !== 'immediate' && r.tearsPerS !== 0) { fails++; console.error(`FAIL ${mode} tears`); }
    n++; if (!(r.latency > 0)) { fails++; console.error(`FAIL ${mode} ${hz} ${fps}: latency ${r.latency}`); }
    if (mode === 'fifo2' || mode === 'fifo3') { n++; if (r.dropped > 0) { fails++; console.error(`FAIL FIFO drops frames (${mode} ${hz} ${fps})`); } }
  }
  // vsync quantises: 48 on 60 double-buffered shows 30; triple-buffered shows 48 with uneven holds
  const f2 = M.present({ hz: 60, ms: 1000 / 48, mode: 'fifo2' }), f3 = M.present({ hz: 60, ms: 1000 / 48, mode: 'fifo3' });
  check('fifo2 48 on 60 → 30 shown', Math.round(f2.shownFps), 30); check('fifo3 48 on 60 → 48 shown', Math.round(f3.shownFps), 48);
  check('fifo3 holds 16.7 / 33.3', [f(f3.holdMin, 1), f(f3.holdMax, 1)].join(), '16.7,33.3');
  { const sh = f3.frames.filter(x => x.first != null && x.first >= 250 && x.first < 1250).sort((a, b) => a.first - b.first), h = sh.slice(1).map((x, i) => x.first - sh[i].first);
    let okW = h.length > 8; for (let i = 0; i + 4 <= h.length; i++) if (h.slice(i, i + 4).filter(x => x > 25).length !== 1) okW = false; check('fifo3 48 on 60: every four holds have exactly one long one', okW, true); says('ch3.p4', '三帧停'); }
  // immediate: a flip lands in blanking only when the frame end coincides with a refresh; 48 on 60 → 48 − gcd(48, 60) = 36 tears a second
  check('immediate 48 on 60: 36 tears a second (closed form)', M.present({ hz: 60, ms: 1000 / 48, mode: 'immediate' }).tearsPerS, 48 - 12);
  check('immediate 30 on 60: no tears (every flip on a refresh)', M.present({ hz: 60, ms: 1000 / 30, mode: 'immediate' }).tearsPerS, 0);
  // VRR: inside the range each frame is held as long as it took; LFC removes the stutter below the range
  for (const fps of [36, 40, 48, 55, 59]) { const v = M.present({ mode: 'vrr', ms: 1000 / fps }); within(`VRR ${fps} fps in range: pacing 0`, v.pacing, 0, 0.05); check(`VRR ${fps} fps: no repeats`, v.repeatsPerS, 0); }
  for (const [a, b] of [[48, 120], [48, 144]]) for (const fps of [20, 25, 30, 40]) { const v = M.present({ mode: 'vrr', vmin: a, vmax: b, ms: 1000 / fps, lfc: true }); within(`LFC ${a}–${b} at ${fps}: pacing ≈ 0`, v.pacing, 0, 0.05); }
  const v25 = M.present({ mode: 'vrr', ms: 40, lfc: false }), v25l = M.present({ mode: 'vrr', ms: 40, lfc: true });
  within('35–60 at 25 fps: no LFC stutters', v25.pacing, 5, 20); within('35–60 at 25 fps: LFC fixes it (2 × 20 ms ≥ 16.7)', v25l.pacing, 0, 0.05);
  // the max/min ≥ 2 condition: intervals between Pmax and 2·Pmin cannot be split
  check('35–60 is 1.71×', f(60 / 35, 2), '1.71'); within('31 ms on 35–60 with LFC still stutters', M.present({ mode: 'vrr', ms: 31, lfc: true }).pacing, 5, 25);
  // repeats are counted and shown when below range
  within('VRR 25 fps: repeats per second > 0', v25l.repeatsPerS, 1, 60);
}

/* ── 05 colour ── */
{
  for (const c of Object.keys(M.COL.colours)) for (const n2 of M.COL.luts) { const r = M.colour(M.COL.colours[c], 'srgb', 8, n2); if (n2 >= 256) check(`sRGB target is identity (${c}, ${n2})`, r.out.join(), M.COL.colours[c].join()); }
  const g = M.colour(M.COL.colours.grey, 'p3', 8, 1024); check('grey stays grey on P3', new Set(g.out).size, 1);
  says('ch5.p5', 'ITU-R BT.2087'); says('ch5.p5', '255, 0, 0'); says('ch5.p5', '{sdrNits}'); says('ch5.p5', '可调的设置'); says('ch5.say.pq', '系统里的一个设置');
}

/* ── 06 links ── */
{
  for (const m of M.LINK.modeOrder) for (const b of M.LINK.bpcs) for (const c of M.LINK.chromas) for (const d of M.LINK.dscs) {
    const r = M.linkFit(m, b, c, d);
    for (const row of r.rows) { n++; if (row.fits && row.need != null && row.need > row.cap + 1e-9) { fails++; console.error(`FAIL ${m} ${b} ${c} ${d}: ${row.k} fits but needs ${row.need} > ${row.cap}`); } }
  }
  check('4K60 8-bit fits HDMI 2.0 exactly at 594 MHz', M.linkFit('uhd60', 8, '444', 0).rows.find(r => r.k === 'hdmi20').fits, true);
  check('4K60 10-bit does not fit HDMI 2.0', M.linkFit('uhd60', 10, '444', 0).rows.find(r => r.k === 'hdmi20').fits, false);
  check('4K60 10-bit 4:2:0 fits HDMI 2.0', M.linkFit('uhd60', 10, '420', 0).rows.find(r => r.k === 'hdmi20').fits, true);
  check('4K120 10-bit: smallest fit is UHBR10', M.linkFit('uhd120', 10, '444', 0).first, 'uhbr10');
  for (let i = 1; i < M.LINK.order.length; i++) { n++; if (M.LINK.caps[M.LINK.order[i]].gbps < M.LINK.caps[M.LINK.order[i - 1]].gbps) { fails++; console.error('FAIL link order not by capacity at ' + M.LINK.order[i]); } }
  { const r = M.linkFit('uhd240', 10, '444', 10).rows.find(x => x.k === 'hbr3'); check('DSC on HBR3 counts FEC', f(r.cap, 4), f(25.92 / (1 + SRC.dp.fec8b10b), 4)); }
  { const r = M.linkFit('uhd240', 10, '444', 10).rows.find(x => x.k === 'uhbr20'); check('DSC on UHBR20: no extra FEC', r.cap, M.LINK.caps.uhbr20.gbps); }
  { const r = M.linkFit('uhd60', 8, '444', 0).rows.find(x => x.k === 'hbr3'); check('no DSC: no FEC on HBR3', r.cap, M.LINK.caps.hbr3.gbps); }
  check('4K60 10-bit 4:2:2 fits HDMI 2.0 at 594 MHz', M.linkFit('uhd60', 10, '422', 0).rows.find(r => r.k === 'hdmi20').fits, true);
  says('ch6.p4', '4:2:2'); says('ch7.p4', 'FEC'); says('ch6.limit', 'FEC');
  check('4K240 10-bit needs DSC on HBR3', M.linkFit('uhd240', 10, '444', 0).rows.find(r => r.k === 'hbr3').fits, false);
  check('DSC 1/16 bpp step', P.dsc240[0] * 16 % 1, 0);
  says('ch6.p5', 'UHBR20 放得下');
}

/* ── 07 chroma ── */
{
  for (const k of M.SUB.patterns) { check(k + ' 4:4:4 is lossless', M.subsample(k, '444').worst <= 1, true); check(k + ' bits 24/16/12', ['444', '422', '420'].map(m => M.subsample(k, m).bitsPerPx).join(), '24,16,12'); }
  // luma is untouched: the brightness of each pixel survives 4:2:0
  const r = M.subsample('text', '420'); let worstY = 0; r.src.forEach((c, i) => { worstY = Math.max(worstY, Math.abs(M.toYcc(c)[0] - M.toYcc(r.out[i])[0]) * 255); }); within('4:2:0 keeps luma within clamp error', worstY, 0, 40);
  says('ch7.p2', '24 位'); says('ch7.p2', '12 位');
}

/* ── 08 rows ── */
{
  const r = M.rowTime(2160, 60, 'oxide'); check('2160 rows at 60 Hz: 1/(60 × 2250) s', f(r.lineUs, 4), f(1e6 / (60 * 2250), 4));
  check('row time halves when Hz doubles', f(M.rowTime(2160, 120, 'oxide').lineUs * 2, 6), f(r.lineUs, 6));
  check('τ doubled halves the top refresh (tuned sensitivity)', f(M.rowTime(2160, 60, 'asi').hzMax / M.rowTime(2160, 60, 'oxide').hzMax, 3), f(0.3 / 0.8, 3));
  says('ch8.tuned', 'τ 翻倍，最高刷新率减半');
}

/* ── 09 blur ── */
{
  const b = M.blur(960, 60, 1, 0); within('hold blur 10–90% ≈ 0.8 × jump', b.width / b.holdPx, 0.78, 0.82);
  const s = M.blur(960, 60, 0.25, 0); within('25% duty cuts blur by 4', b.width / s.width, 3.8, 4.2);
  check('240 Hz hold = 60 Hz strobed at 25%', f(M.blur(960, 240, 1, 0).width, 1), f(s.width, 1));
  // tuned τ sensitivity: doubling the OLED τ barely moves the width; doubling the slow LCD τ widens it
  within('OLED τ ×2: < 2% change', Math.abs(M.blur(960, 120, 1, 0.06).width / M.blur(960, 120, 1, 0.03).width - 1), 0, 0.02);
  within('slow LCD τ ×2: wider by > 20%', M.blur(960, 120, 1, 8).width / M.blur(960, 120, 1, 4).width, 1.2, 3);
  says('ch9.limit', '响应时间翻倍');
}

/* ── 10 PQ ── */
{
  check('half of the PQ codes sit below 100 nits', P.pq100[0] / 1023 > 0.5, true); says('ch10.p2', '一半的级数给了 100 尼特以下');
  check('gamma clipped above its peak', M.steps(2000, 1000).gamma.clipped, true);
}

/* ── 11 latency ── */
{
  const L = M.latency({ fps: 120, hz: 120, mode: 'fifo3', composed: true, panel: 'lcd', poll: 125 });
  check('latency = sum of stages', f(L.total, 6), f(L.stages.reduce((s, x) => s + x[1], 0), 6));
  check('stage order', L.stages.map(s => s[0]).join(), 'poll,tick,render,compose,scan,panel');
  check('poll 125 Hz → 4 ms average', f(L.stages[0][1], 1), '4.0');
  says('ch11.tuned', '{panLcd}'); says('ch11.tuned', '{panOled}'); says('ch11.tuned', '多等一次刷新');
}

/* ── every number the prose quotes ── */
{
  const want = { pxPerS: '995328000', pxPerSyi: '9.95', frameMiB: '31.6', fb3MiB: '94.9', readGBps: '3.98', read60: '1.99', fp16GBps: '7.96', darkSrgb: '26', darkLin: '3',
    h97: '4400', v97: '2250', pclk97: '594', hfp97: '176', hs97: '88', hbp97: '296', vfp97: '8', vs97: '10', vbp97: '72', blank97: '16.2', pclk118: '1188', h117: '5280',
    pclkCvt: '522.614', hCvt: '3920', vCvt: '2222', blankCvt: '4.8',
    kFps: '48', kHz: '60', f2Shown: '30', f2Lat: '33.3', imTears: '36', imLat: '20.8', f3p48: '6.3', f3h48min: '16.7', f3h48max: '33.3', f3Lat: '33.3', mbLat: '13.9', mbDrop: '30', f2fastLat: '16.7',
    kMin: '35', kMax: '60', vrPace: '0.0', vrLat: '20.8', v25Pace: '7.9', v25lPace: '0.0', vPmax: '28.6', vPmin: '16.7', v31Pace: '14.2', vRatio: '1.71', vP2min: '33.3', v25ms: '40', fastFps: '90', vrFastLat: '33.3',
    p3R: '234', p3G: '51', p3B: '35', m00: '0.6274', m01: '0.3293', m02: '0.0433', pqR: '543', pqG: '333', lut17: '16.1', lut17lv: '238', lut1024lv: '256', lutPq17: '141.5', sdrNits: '200',
    need4k60: '14.26', char4k60: '594', char4k60h: '742.5', char4k60_420: '371.3', need4k120: '35.64', need4k240: '68.56', need8k: '71.28', capHbr3: '25.92', capUhbr20: '77.37', capFrl: '42.67', capHdmi20: '14.4', capUhbr135: '52.22', capUhbr10: '38.68', capHbr3Fec: '25.31', fecPct: '2.4', uhbrEff: '96.71', char4k60_422: '594',
    dsc240: '11.06', dsc240nf: '11.31', dsc8k: '10.63', need240d: '27.42', dscRatio240: '2.7', subT: '26.3', subP: '1.2', subTbad: '44', subLworst: '141',
    row60: '7.41', row240: '1.852', vtot2160: '2250', tauOx: '0.30', tauAsi: '0.8', needAsi: '6.1', hzMaxAsi: '73', hzMaxOx: '194', asiErr120: '10.0',
    blur60: '12.8', blur240: '3.2', blurStrobe: '3.2', blurLcd: '10.5', blurOled: '6.4', ramp60: '16', bv: '960', tauO: '0.03', tauF: '1', tauS: '4',
    pq100: '520', pq1: '153', pqStep100: '0.98', pqStep1: '1.94', gStep1: '4.2', pqTop: '769',
    lat0: '38.9', l0fps: '120', l0poll: '125', l1poll: '1000', panLcd: '5', panOled: '0.5', row720: '1.23', jump720: '1.33', fitLo: '0.25', fitHi: '4', lat1: '18.8', lat0r: '13.4', lat0c: '8.3' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : typeof d === 'number' ? f(v, d) : M.fmtKind(v, d), want[k]);
  for (const k of Object.keys(want)) check('want has a model value ' + k, k in P, true);
  const used = new Set();
  const scan = key => { const v = Z[key] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P)) { fails++; console.error(`FAIL {${p[1]}} in ${key} is not filled on the page`); } } };
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) scan(m[1]);
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // literals in the prose, checked against the models
  says('hero.lead', '3840 × 2160 × 120'); check('3840 × 2160 × 120', 3840 * 2160 * 120, P.pxPerS[0]);
  says('ch1.p2', '一个像素 4 字节'); says('ch1.p2', '一个像素 8 字节'); check('bytes per pixel 4/4/8', Object.values(M.FB.fmts).map(x => x.B).join(), '4,4,8');
  says('ch2.p3', '3840 个像素'); says('ch2.p3', '2160 行');
  says('ch4.p5', '最高刷新率至少是最低的 2 倍'); says('ch4.p5', '每 31 毫秒一帧');
  says('dg.dp.c8', '80%'); says('dg.dp.c128', '97%'); check('128/132 ≈ 97%', f(128 / 132 * 100, 0), '97');
  says('dg.chroma.b444', '24'); says('dg.chroma.b422', '16'); says('dg.chroma.b420', '12');
  says('ch7.model.how', '16×12'); check('patch 16 × 12', [M.SUB.W, M.SUB.H].join(), '16,12');
  says('ch7.read.bad', '16'); says('ch5.p6', '17 格'); says('ch5.p6', '1024 格'); check('LUT sizes', M.COL.luts.join(), '17,33,256,1024');
  says('ch9.limit', '{tauO}'); says('ch8.tuned', '{tauAsi}');
}

/* ── sentence branches ── */
{
  const has = k => { n++; if (Z[k] == null) { fails++; console.error('FAIL missing say key ' + k); } };
  const seen = new Set(), add = s => { has(s.key); seen.add(s.key); };
  for (const res of Object.keys(M.FB.res)) for (const fm of Object.keys(M.FB.fmts)) for (const hz of M.FB.hzs) for (const b of [2, 3]) add(M.say.fb(M.framebuffer(res, fm, hz, b)));
  for (const k of M.TIM.order) { const t = M.TIM.presets[k]; add(M.say.timing(M.timing(t))); for (const hfp of [0, 176, 600, 1200]) add(M.say.timing(M.timing(t, { hfp, hbp: t.h[3], vfp: t.v[1] }))); }
  for (const mode of M.PRES.modes) for (const hz of M.PRES.hzs) for (let fps = 20; fps <= 200; fps += 4) for (const j of [0, 0.15, 0.3]) add(M.say.present(M.present({ mode, hz, ms: 1000 / fps, jitter: j })));
  for (const hz of M.PRES.hzs) add(M.say.present(M.present({ mode: 'immediate', hz, ms: 1000 / hz })));
  for (const rg of ['35_60', '48_120', '48_144']) { const [a, b] = rg.split('_').map(Number); for (let fps = 15; fps <= 160; fps += 5) for (const lfc of [true, false]) add(M.say.present(M.present({ mode: 'vrr', vmin: a, vmax: b, lfc, ms: 1000 / fps }))); }
  for (const c of Object.keys(M.COL.colours)) for (const tg of M.COL.targets) for (const b of [8, 10]) for (const l of M.COL.luts) add(M.say.colour(M.colour(M.COL.colours[c], tg, b, l), tg));
  for (const m of M.LINK.modeOrder) for (const b of M.LINK.bpcs) for (const c of M.LINK.chromas) for (const d of M.LINK.dscs) add(M.say.link(M.linkFit(m, b, c, d)));
  for (const k of M.SUB.patterns) for (const m of ['444', '422', '420']) add(M.say.sub(M.subsample(k, m), m));
  for (const r of M.PANEL.rows) for (const hz of [30, 60, 90, 120, 144, 240, 360, 480]) for (const tech of Object.keys(M.PANEL.techs)) add(M.say.row(M.rowTime(r, hz, tech)));
  for (const v of [240, 960, 3840]) for (const hz of M.BLUR.hzs) for (const d of M.BLUR.duties) for (const tau of Object.values(M.BLUR.taus)) add(M.say.blur(M.blur(v, hz, d, tau, 121), d, tau));
  for (const pk of [100, 1000, 10000]) for (let i = 0; i <= 60; i++) add(M.say.pq(M.steps(Math.pow(10, -2 + 6 * i / 60), pk)));
  for (const fps of [30, 60, 120, 240, 360]) for (const hz of [60, 120, 144, 240]) for (const mode of ['immediate', 'fifo2', 'fifo3', 'mailbox', 'vrr']) for (const composed of [false, true]) for (const panel of ['lcd', 'oled']) for (const poll of M.LAT.polls) add(M.say.lat(M.latency({ fps, hz, mode, composed, panel, poll })));
  const all = Object.keys(Z).filter(k => /\.say\./.test(k));
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
  for (const k of seen) check('branch has copy ' + k, Z[k] != null, true);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria|)="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/'((?:ch\d+|dg|u|doc|nav|toc|hero)\.[\w.-]*\w)'/g)) keys.add(m[1]);
  for (const m of html.matchAll(/data-dg="(\w+)"/g)) keys.add('dg.' + m[1] + '.aria');
  // keys app.js builds from model names
  for (const k of M.LINK.order) keys.add('ch6.lk.' + k);
  for (const k of ['poll', 'tick', 'render', 'compose', 'scan', 'panel']) keys.add('ch11.st.' + k);
  for (const k of [...keys]) if (/\.$/.test(k)) keys.delete(k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  const prefixes = [...app.matchAll(/'((?:ch\d+|dg)\.[\w.]*)'\s*\+/g)].map(m => m[1]);
  for (const k of Object.keys(Z)) {
    const reach = keys.has(k) || html.includes(`"${k}"`) || app.includes(`'${k}'`) || prefixes.some(p => k.startsWith(p)) || /\.say\./.test(k);
    n++; if (!reach) { fails++; console.error('FAIL zh key never used ' + k); }
  }
  for (const [k, v] of Object.entries(Z)) if (/\.say\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!(m[1] in P) && !new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  const dgs = [...html.matchAll(/class="dia" data-dg="(\w+)"/g)].map(m => m[1]);
  check('twelve diagrams', dgs.length, 12);
  for (const d of dgs) { check('diagram spec ' + d, app.includes('DG.' + d + ' = '), true); for (const s of ['cap', 'aria']) check(`dg.${d}.${s}`, typeof Z[`dg.${d}.${s}`], 'string'); }
  for (const d of dgs) { n++; if (!/示意|按比例/.test(Z['dg.' + d + '.cap'])) { fails++; console.error('FAIL caption of ' + d + ' does not say whether it is to scale'); } }
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(DIR, file), 'utf8');
    if (file === 'index.html') {
      src = unprefill(src, Z);
      const tt = src.match(/<title>([^<]*)<\/title>/)[1], md = src.match(/<meta name="description" content="([^"]*)">/)[1];
      check('static <title> = doc.title', tt, Z['doc.title']); check('static meta description = doc.desc', md, Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
      src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿、，。：；（）「」《》]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  // the registrar adds the page-provenance label; at most one
  n++; if ((html.match(/class="page-provenance"/g) || []).length > 1) { fails++; console.error('FAIL more than one provenance label'); }
  const nModels = Object.keys(Z).filter(k => /^ch\d+\.model\.title$/.test(k)).length;
  check('eleven model sections', nModels, 11); says('doc.desc', '十一个可以动手的模型');
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug', R.slug, 'how-pixels-reach-a-screen'); check('registry path', R.path, 'computing/systems/how-pixels-reach-a-screen/');
  check('registry title zh', R.title.zh, Z['hero.title']); check('registry desc zh', R.desc.zh, Z['doc.desc']);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en || !c.title.zh || !c.desc.zh) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  // one word, one owner
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const mine = new Set(R.concepts.map(c => c.id));
  const owned = new Map(), own = (a, who) => { if (typeof a === 'string' && !owned.has(norm(a))) owned.set(norm(a), who); };
  const AL = JSON.parse(fs.readFileSync(path.join(ROOT, 'atlas', 'graph', 'aliases.json'), 'utf8'));
  for (const [id, v] of Object.entries(AL)) if (!mine.has(id)) for (const l of ['zh', 'en']) (v[l] || []).forEach(a => own(a, 'atlas aliases ' + id));
  const LD = path.join(ROOT, 'atlas', 'graph', 'lessons');
  for (const fn of fs.readdirSync(LD)) {
    if (fn === 'how-pixels-reach-a-screen.json') continue;
    const d = JSON.parse(fs.readFileSync(path.join(LD, fn), 'utf8'));
    for (const nd of d.nodes || []) if (nd.aliases && !mine.has(nd.id)) for (const l of ['zh', 'en']) (nd.aliases[l] || []).forEach(a => own(a, 'lesson ' + fn));
  }
  for (const sub of fs.readdirSync(path.join(DIR, '..'))) {
    const p = path.join(DIR, '..', sub, 'REGISTRY.json');
    if (sub !== 'how-pixels-reach-a-screen' && fs.existsSync(p)) for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts || []) for (const a of [...c.aliases.zh, ...c.aliases.en]) own(a, sub);
  }
  // words the task file leaves to siblings
  for (const a of ['4K 60Hz 需要多少带宽', 'DSC 压缩是什么', 'DP Alt Mode', 'DisplayPort Alt Mode', '雷电接显示器']) own(a, 'how-thunderbolt-works (task file)');
  for (const a of ['色域', '三原色', 'color gamut', 'RGB']) own(a, 'inside-a-phone (task file)');
  for (const a of ['渲染管线', '光栅化', 'rendering pipeline', 'rasterization']) own(a, 'computer-graphics (task file)');
  for (const a of ['GDDR7', 'GDDR', '显存']) own(a, 'how-memory-talks (task file)');
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  const mineAll = R.concepts.flatMap(c => [...c.aliases.zh, ...c.aliases.en]).map(norm);
  for (const l of ['zh', 'en']) { const xs = R.concepts.flatMap(c => c.aliases[l]).map(norm); n++; if (new Set(xs).size !== xs.length) { fails++; console.error('FAIL a ' + l + ' alias repeats inside this page'); } }
  for (const w of ['画面撕裂', 'screen tearing', '垂直同步', 'vsync', '可变刷新率', '像素时钟', 'pixel clock', '帧缓冲', 'framebuffer', 'PQ 曲线', '显示延迟', 'OLED vs LCD']) check('this page takes ' + w, mineAll.includes(norm(w)), true);
  // links: only live siblings, chapters that exist, titles quoted as in their copy or the registry
  const all = Object.values(Z).join('');
  const LIVE = { 'how-a-gpu-computes': '../how-a-gpu-computes/', 'how-thunderbolt-works': '../how-thunderbolt-works/', 'how-usb-drives-talk': '../how-usb-drives-talk/', 'how-pcie-works': '../how-pcie-works/', 'how-memory-talks': '../how-memory-talks/',
    'computer-graphics': '../../graphics/computer-graphics/', 'inside-a-phone': '../../../tech/devices/inside-a-phone/' };
  const hrefs = [...all.matchAll(/href='([^']+)'/g)].map(m => m[1]);
  for (const h of hrefs) { n++; if (!Object.values(LIVE).some(b => h === b || h.startsWith(b + '#'))) { fails++; console.error('FAIL unexpected link ' + h); } }
  const cfg = fs.readFileSync(path.join(ROOT, 'pages.config.js'), 'utf8');
  for (const [slug, base] of Object.entries(LIVE)) {
    const dir = path.join(DIR, base), sh = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
    check(slug + ' is live in pages.config.js', new RegExp('slug: "' + slug + '"[\\s\\S]{0,1500}?status: "live"').test(cfg), true);
    for (const m of all.matchAll(new RegExp("href='" + base.replace(/[./]/g, '\\$&') + "(#[\\w-]+)?'", 'g'))) if (m[1]) check(`${slug} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
    const cp = path.join(dir, 'copy.zh.js');
    if (fs.existsSync(cp)) { const cz = { window: {} }; vm.runInNewContext(fs.readFileSync(cp, 'utf8'), cz); check(slug + ' title quoted as in its copy', all.includes('《' + cz.window.ESSAY_COPY.zh['hero.title'] + '》'), true); }
  }
  check('inside-a-phone title as in pages.config.js', all.includes('《一部手机里的十个道理》') && cfg.includes('zh: "一部手机里的十个道理"'), true);
  check('computer-graphics quoted as the other essays do', all.includes('《计算机图形学》'), true);
  for (const [h, why] of [['../how-a-gpu-computes/#ch9', 'rendering into the framebuffer'], ['../how-thunderbolt-works/#ch6', 'CVT bandwidth, DSC, DP Alt Mode'], ['../how-memory-talks/#ch9', 'GDDR'], ['../how-pcie-works/#ch8', 'lane signalling'],
    ['../how-usb-drives-talk/#ch8', 'USB4 tunnels'], ['../../graphics/computer-graphics/', 'rendering pipeline'], ['../../../tech/devices/inside-a-phone/#screen', 'gamut and RGB']]) check(`links ${h} (${why})`, hrefs.includes(h), true);

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k] || ''), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (CTA tables and CVT-RB2 vs the Thunderbolt essay, framebuffer, timing edits, present-queue invariants, VRR and LFC, colour matrix vs BT.2087, PQ, link fit, 4:2:0, row time, blur, latency, sourced and frontier figures, every number in the prose, every sentence branch, keys, registry, links and aliases)`);
