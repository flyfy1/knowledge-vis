(function () {
  'use strict';

  const M = window.BondingModels;
  const COPY = window.ESSAY_COPY || {};
  let lang = 'zh';
  try {
    const saved = localStorage.getItem('knowledge-lang');
    if (saved && COPY[saved]) lang = saved;
  } catch (_) {}
  if (!COPY[lang]) lang = Object.keys(COPY)[0] || 'zh';

  const reduce = typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COL = {
    bg: '#0f1219',
    panel: '#141925',
    grid: 'rgba(255,255,255,.08)',
    axis: 'rgba(255,255,255,.26)',
    ink: '#eaedf3',
    body: '#c8cfd8',
    mute: '#8b95a6',
    gold: '#e9b949',
    goldBg: 'rgba(233,185,73,.18)',
    cyan: '#5ec2df',
    cyanBg: 'rgba(94,194,223,.18)',
    red: '#f07a6d',
    redBg: 'rgba(240,122,109,.18)',
    green: '#7ad6a0',
    greenBg: 'rgba(122,214,160,.18)',
    violet: '#a890f0',
    violetBg: 'rgba(168,144,240,.18)'
  };

  const SANS = 'ui-sans-serif,system-ui,-apple-system,"PingFang SC","Noto Sans SC",sans-serif';
  const MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';

  function getPath(obj, path) {
    let cur = obj;
    for (const part of String(path).split('.')) {
      if (cur && typeof cur === 'object' && part in cur) cur = cur[part];
      else return undefined;
    }
    return cur;
  }

  function t(path, vars) {
    const raw = getPath(COPY[lang], path) ?? getPath(COPY.zh, path);
    if (raw === undefined) return path;
    let s = String(raw);
    if (vars) {
      for (const k of Object.keys(vars)) {
        s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
      }
    }
    return s;
  }

  const $ = (id) => document.getElementById(id);
  const radio = (name) => {
    const el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  };

  /* ── Canvas & Label Placement Helpers ─────────────────────────── */
  function fit(cv) {
    const rect = cv.getBoundingClientRect();
    const w = Math.max(240, Math.round(rect.width || 640));
    const h = Math.max(180, Math.round(rect.height || 300));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    if (cv.width !== pw || cv.height !== ph) {
      cv.width = pw;
      cv.height = ph;
    }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = COL.bg;
    ctx.fillRect(0, 0, w, h);
    return { ctx, w, h, narrow: w < 460 };
  }

  function makePlacer(w, h, bounds) {
    const b = bounds || { x0: 4, y0: 4, x1: w - 4, y1: h - 4 };
    const boxes = [];
    function overlaps(ax, ay, aw, ah) {
      for (let i = 0; i < boxes.length; i++) {
        const o = boxes[i];
        if (ax < o.x + o.w && ax + aw > o.x && ay < o.y + o.h && ay + ah > o.y) return true;
      }
      return false;
    }
    return function place(ctx, text, x, y, opts) {
      const o = opts || {};
      const pad = o.pad || 3;
      const font = o.font || ('11px ' + SANS);
      ctx.font = font;
      const tw = ctx.measureText(text).width;
      const th = o.lh || 13;
      const bw = tw + pad * 2;
      const bh = th + pad * 2;
      const align = o.align || 'left';
      let baseX = align === 'center' ? x - bw / 2 : (align === 'right' ? x - bw : x);
      let baseY = y - bh / 2;
      const shifts = o.shifts || [
        [0, 0], [0, -16], [0, 16], [0, -30], [0, 30],
        [-bw * 0.6, -14], [bw * 0.6, -14], [-bw * 0.6, 14], [bw * 0.6, 14]
      ];
      let chosen = null;
      for (let i = 0; i < shifts.length; i++) {
        let cx = Math.max(b.x0, Math.min(b.x1 - bw, baseX + shifts[i][0]));
        let cy = Math.max(b.y0, Math.min(b.y1 - bh, baseY + shifts[i][1]));
        if (!overlaps(cx, cy, bw, bh)) {
          chosen = { x: cx, y: cy, w: bw, h: bh };
          break;
        }
      }
      if (!chosen) {
        if (o.optional) return false;
        chosen = {
          x: Math.max(b.x0, Math.min(b.x1 - bw, baseX)),
          y: Math.max(b.y0, Math.min(b.y1 - bh, baseY)),
          w: bw,
          h: bh
        };
      }
      boxes.push(chosen);
      if (o.pill) {
        ctx.fillStyle = o.pill === true ? 'rgba(15,18,25,.86)' : o.pill;
        ctx.beginPath();
        roundRect(ctx, chosen.x, chosen.y, chosen.w, chosen.h, 4);
        ctx.fill();
      }
      ctx.fillStyle = o.color || COL.ink;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, chosen.x + pad, chosen.y + chosen.h / 2 + 0.5);
      return true;
    };
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawPanelTitle(ctx, title, x, y, maxW) {
    ctx.font = '600 11.5px ' + SANS;
    ctx.fillStyle = COL.body;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    let txt = title;
    while (txt.length > 4 && ctx.measureText(txt).width > maxW) {
      txt = txt.slice(0, -2) + '…';
    }
    ctx.fillText(txt, x, y);
  }

  function drawAxes(ctx, x0, y0, x1, y1) {
    ctx.strokeStyle = COL.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y1);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  /* ── Ch1: 1D Particle in a Box ────────────────────────────────── */
  function drawCh1() {
    const cv = $('bxCv');
    const L = parseFloat($('bxL').value);
    const n = parseInt(radio('bxN') || '1', 10);
    const merged = $('bxMerge').checked;

    $('bxLo').textContent = L.toFixed(1) + ' Å';
    const cmp = M.boxModel.compare(n, L, merged);
    $('bxE1').textContent = cmp.eSingle.toFixed(2) + ' eV';
    $('bxE2').textContent = cmp.eEff.toFixed(2) + ' eV';
    $('bxSave').textContent = (merged ? '−' + cmp.saved.toFixed(2) : cmp.saved.toFixed(2)) + ' eV';
    $('bxRatio').textContent = merged ? '1/4 ×' : '1.00 ×';
    $('bxSay').textContent = t(merged ? 'ch1.say.merged' : 'ch1.say.single', {
      L: L.toFixed(1),
      eff: cmp.effLen.toFixed(1),
      n,
      e1: cmp.eSingle.toFixed(2),
      e2: cmp.eEff.toFixed(2),
      save: (cmp.eSingle - M.boxModel.energyEv(n, L * 2)).toFixed(2)
    });

    if (!isVisible(cv)) return;
    const { ctx, w, h, narrow } = fit(cv);
    const place = makePlacer(w, h);
    const padL = narrow ? 36 : 48, padR = 16, padT = 32, padB = 32;
    const pw = w - padL - padR;
    const ph = h - padT - padB;

    const topH = ph * 0.56;
    const botY0 = padT + topH + 14;
    const botH = ph - topH - 14;

    // Top: potential walls & wavefunctions
    drawPanelTitle(ctx, t('cv.boxWave') + '  (' + t('cv.boxPsi', { n, L: cmp.effLen.toFixed(1) }) + ')', padL, 8, pw);

    const wallX0 = padL + 10;
    const wallX1 = padL + pw - 10;
    const wallMid = (wallX0 + wallX1) / 2;
    const baseLine = padT + topH * 0.52;
    const amp = topH * 0.36;

    // Hard walls
    ctx.strokeStyle = COL.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wallX0, padT + 4);
    ctx.lineTo(wallX0, padT + topH);
    ctx.lineTo(wallX1, padT + topH);
    ctx.lineTo(wallX1, padT + 4);
    ctx.stroke();

    // Central partition (solid if isolated, dashed if merged)
    ctx.save();
    ctx.strokeStyle = merged ? 'rgba(139,149,166,.35)' : COL.gold;
    ctx.lineWidth = merged ? 1.5 : 3;
    if (merged) ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(wallMid, padT + 6);
    ctx.lineTo(wallMid, padT + topH);
    ctx.stroke();
    ctx.restore();

    // Baseline
    ctx.strokeStyle = COL.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(wallX0, baseLine);
    ctx.lineTo(wallX1, baseLine);
    ctx.stroke();

    // Single-box wave (left half always shown in cyan as reference)
    const wSingle = M.boxModel.wave(n, L, 80);
    ctx.strokeStyle = COL.cyan;
    ctx.lineWidth = merged ? 1.5 : 2.5;
    if (merged) {
      ctx.save();
      ctx.setLineDash([4, 3]);
    }
    ctx.beginPath();
    for (let i = 0; i < wSingle.length; i++) {
      const px = wallX0 + wSingle[i].u * (wallMid - wallX0);
      const py = baseLine - wSingle[i].psi * amp * (merged ? 0.85 : 1);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    if (!merged) {
      // Right isolated box too
      ctx.beginPath();
      for (let i = 0; i < wSingle.length; i++) {
        const px = wallMid + wSingle[i].u * (wallX1 - wallMid);
        const py = baseLine - wSingle[i].psi * amp;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    } else {
      ctx.restore();
      const wMerged = M.boxModel.wave(n, L * 2, 140);
      ctx.fillStyle = COL.goldBg;
      ctx.beginPath();
      ctx.moveTo(wallX0, baseLine);
      for (let i = 0; i < wMerged.length; i++) {
        const px = wallX0 + wMerged[i].u * (wallX1 - wallX0);
        const py = baseLine - wMerged[i].psi * amp;
        ctx.lineTo(px, py);
      }
      ctx.lineTo(wallX1, baseLine);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = COL.gold;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      for (let i = 0; i < wMerged.length; i++) {
        const px = wallX0 + wMerged[i].u * (wallX1 - wallX0);
        const py = baseLine - wMerged[i].psi * amp;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    place(ctx, merged ? t('cv.boxMerged') : t('cv.boxSingle'), wallX0 + 6, padT + 14, {
      color: merged ? COL.gold : COL.cyan,
      pill: true,
      font: '600 10.5px ' + SANS
    });

    // Bottom: kinetic energy bar comparison (Single vs Merged 2L)
    const e1 = cmp.eSingle;
    const e2 = M.boxModel.energyEv(n, L * 2);
    const barMax = Math.max(e1, 1);
    const bw1 = (e1 / barMax) * (pw - 95);
    const bw2 = (e2 / barMax) * (pw - 95);
    const rowH = Math.min(20, (botH - 12) / 2);

    ctx.fillStyle = COL.panel;
    ctx.fillRect(padL, botY0, pw, botH);
    ctx.strokeStyle = COL.grid;
    ctx.strokeRect(padL, botY0, pw, botH);

    // Row 1: Single L
    ctx.fillStyle = COL.cyan;
    ctx.fillRect(padL + 8, botY0 + 8, Math.max(4, bw1), rowH);
    place(ctx, 'L: ' + e1.toFixed(1) + ' eV', padL + 14 + Math.max(4, bw1), botY0 + 8 + rowH / 2, {
      color: COL.cyan,
      font: '11px ' + MONO,
      align: 'left'
    });

    // Row 2: Merged 2L
    ctx.fillStyle = COL.gold;
    ctx.fillRect(padL + 8, botY0 + 14 + rowH, Math.max(4, bw2), rowH);
    place(ctx, '2L: ' + e2.toFixed(1) + ' eV (−75%)', padL + 14 + Math.max(4, bw2), botY0 + 14 + rowH * 1.5, {
      color: COL.gold,
      font: '11px ' + MONO,
      align: 'left'
    });
  }

  /* ── Ch2: H2+ LCAO ────────────────────────────────────────────── */
  const h2CurveFixed = M.h2plusModel.curve(false);
  const h2CurveVar = M.h2plusModel.curve(true);

  function drawCh2() {
    const cv = $('h2Cv');
    const rBohr = parseFloat($('h2R').value);
    const orb = radio('h2Orb') || 'bond';
    const bas = radio('h2Bas') || 'z1';
    const isVar = bas === 'var';
    const isAnti = orb === 'anti';

    const pt = isVar ? M.h2plusModel.evalVariational(rBohr) : M.h2plusModel.evalAt(rBohr, 1.0);
    const rA = pt.rA;
    const curE = isAnti ? pt.dEAntiEv : pt.dEBondEv;

    $('h2Ro').textContent = rBohr.toFixed(2) + ' a₀ (' + rA.toFixed(2) + ' Å)';
    $('h2Dist').textContent = rA.toFixed(2) + ' Å (' + rBohr.toFixed(2) + ' a₀)';
    $('h2Energy').textContent = (curE >= 0 ? '+' : '') + curE.toFixed(2) + ' eV';
    $('h2S').textContent = pt.S.toFixed(3);
    $('h2Zeta').textContent = pt.zeta.toFixed(3);

    const sayKey = isAnti ? 'ch2.say.anti' : (isVar ? 'ch2.say.bondVar' : 'ch2.say.bondFixed');
    $('h2Say').textContent = t(sayKey, {
      rBohr: rBohr.toFixed(2),
      rA: rA.toFixed(2),
      de: (curE >= 0 ? '+' : '') + curE.toFixed(2),
      s: pt.S.toFixed(3),
      zeta: pt.zeta.toFixed(3)
    });

    if (!isVisible(cv)) return;
    const { ctx, w, h, narrow } = fit(cv);
    const place = makePlacer(w, h);

    // Responsive split: side-by-side on wide, stacked on narrow
    const rectL = narrow
      ? { x: 46, y: 26, w: w - 60, h: h * 0.46 - 26 }
      : { x: 50, y: 28, w: w * 0.50 - 58, h: h - 60 };
    const rectR = narrow
      ? { x: 20, y: h * 0.56 + 16, w: w - 40, h: h * 0.44 - 28 }
      : { x: w * 0.53 + 6, y: 28, w: w * 0.47 - 22, h: h - 60 };

    // Left: Potential Energy Curve ΔE(R)
    drawPanelTitle(ctx, t('cv.h2TitleV'), rectL.x, 8, rectL.w);
    const xMin = 0.8, xMax = 6.0;
    const eMin = -3.5, eMax = 6.0;
    const mapX = (r) => rectL.x + ((r - xMin) / (xMax - xMin)) * rectL.w;
    const mapY = (e) => rectL.y + rectL.h - ((Math.max(eMin, Math.min(eMax, e)) - eMin) / (eMax - eMin)) * rectL.h;

    // Zero line
    const y0 = mapY(0);
    ctx.strokeStyle = COL.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rectL.x, y0);
    ctx.lineTo(rectL.x + rectL.w, y0);
    ctx.stroke();

    drawAxes(ctx, rectL.x, rectL.y, rectL.x + rectL.w, rectL.y + rectL.h);
    ctx.font = '10.5px ' + MONO;
    ctx.fillStyle = COL.mute;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [-3, 0, 3, 6].forEach((ev) => {
      const yy = mapY(ev);
      ctx.fillText(String(ev), rectL.x - 5, yy);
    });
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    [1, 2, 3, 4, 5, 6].forEach((rb) => {
      ctx.fillText(rb + 'a₀', mapX(rb), rectL.y + rectL.h + 5);
    });

    const cData = isVar ? h2CurveVar : h2CurveFixed;
    // Bonding curve
    ctx.strokeStyle = COL.gold;
    ctx.lineWidth = isAnti ? 1.5 : 2.5;
    ctx.beginPath();
    cData.pts.forEach((p, idx) => {
      const px = mapX(p.rBohr), py = mapY(p.dEBondEv);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Antibonding curve
    ctx.strokeStyle = COL.red;
    ctx.lineWidth = isAnti ? 2.5 : 1.5;
    ctx.beginPath();
    cData.pts.forEach((p, idx) => {
      const px = mapX(p.rBohr), py = mapY(p.dEAntiEv);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Exact benchmark cross
    const exX = mapX(M.h2plusModel.EXACT.rBohr);
    const exY = mapY(-M.h2plusModel.EXACT.deEv);
    ctx.strokeStyle = COL.green;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(exX, exY, 5, 0, Math.PI * 2);
    ctx.stroke();
    place(ctx, t('cv.h2ExactPt'), exX + 8, exY + 12, {
      color: COL.green,
      font: '10px ' + SANS,
      pill: true,
      optional: true
    });

    // Current cursor dot
    const curX = mapX(rBohr);
    const curY = mapY(curE);
    ctx.fillStyle = isAnti ? COL.red : COL.gold;
    ctx.beginPath();
    ctx.arc(curX, curY, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COL.bg;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Right: Electron density |psi|^2 heatmap in the nuclear plane
    drawPanelTitle(ctx, t('cv.h2TitleRho'), rectR.x, narrow ? rectR.y - 18 : 8, rectR.w);
    const dg = M.h2plusModel.densityGrid(rBohr, pt.zeta, isAnti, 56, 30);
    const cellW = rectR.w / dg.nx;
    const cellH = rectR.h / dg.ny;
    for (let iy = 0; iy < dg.ny; iy++) {
      for (let ix = 0; ix < dg.nx; ix++) {
        const val = dg.grid[iy * dg.nx + ix];
        const norm = Math.sqrt(Math.min(1, Math.abs(val) / (dg.maxAbs || 1)));
        const neg = val < 0;
        const rC = neg ? Math.round(94 * norm) : (isAnti ? Math.round(240 * norm) : Math.round(233 * norm));
        const gC = neg ? Math.round(194 * norm) : (isAnti ? Math.round(122 * norm) : Math.round(185 * norm));
        const bC = neg ? Math.round(223 * norm) : (isAnti ? Math.round(109 * norm) : Math.round(73 * norm));
        ctx.fillStyle = 'rgb(' + (15 + Math.round(rC * 0.85)) + ',' + (18 + Math.round(gC * 0.85)) + ',' + (25 + Math.round(bC * 0.85)) + ')';
        ctx.fillRect(rectR.x + ix * cellW, rectR.y + iy * cellH, cellW + 0.6, cellH + 0.6);
      }
    }
    ctx.strokeStyle = COL.grid;
    ctx.strokeRect(rectR.x, rectR.y, rectR.w, rectR.h);

    // Proton positions
    const mapGridX = (gx) => rectR.x + ((gx + dg.xMax) / (2 * dg.xMax)) * rectR.w;
    const pAx = mapGridX(-rBohr / 2);
    const pBx = mapGridX(rBohr / 2);
    const pCy = rectR.y + rectR.h / 2;

    if (isAnti) {
      ctx.save();
      ctx.strokeStyle = COL.cyan;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(rectR.x + rectR.w / 2, rectR.y + 4);
      ctx.lineTo(rectR.x + rectR.w / 2, rectR.y + rectR.h - 4);
      ctx.stroke();
      ctx.restore();
      place(ctx, t('cv.h2Node'), rectR.x + rectR.w / 2, rectR.y + 14, {
        color: COL.cyan,
        align: 'center',
        pill: true,
        font: '10px ' + SANS
      });
    } else {
      place(ctx, t('cv.h2Bridge'), rectR.x + rectR.w / 2, rectR.y + 14, {
        color: COL.gold,
        align: 'center',
        pill: true,
        font: '10px ' + SANS
      });
    }

    [pAx, pBx].forEach((px) => {
      ctx.fillStyle = COL.cyan;
      ctx.beginPath();
      ctx.arc(px, pCy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    void pxA;
  }

  /* ── Ch3: Huckel Aromaticity & Conjugation ────────────────────── */
  function drawCh3() {
    const cv = $('hkCv');
    const N = parseInt(radio('hkN') || '6', 10);
    const ring = $('hkRing').checked;
    const sol = M.huckelModel.solve(N, ring);

    const molKey = 'ch3.mol.' + (ring ? 'ring' : 'chain') + N;
    $('hkName').textContent = t(molKey);
    $('hkDeloc').textContent = sol.delocBeta.toFixed(3) + ' |β|';
    $('hkGap').textContent = sol.gapBeta.toFixed(3) + ' |β| (' + sol.gapEv.toFixed(2) + ' eV)';
    $('hkLam').textContent = isFinite(sol.lambdaNm) ? Math.round(sol.lambdaNm) + ' nm' : '∞ (零带隙)';

    let sayKey = 'ch3.say.uvChain';
    if (ring && sol.isAromatic4n2) sayKey = 'ch3.say.aromatic';
    else if (ring && sol.isAntiaromatic4n) sayKey = 'ch3.say.anti';
    else if (!ring && isFinite(sol.lambdaNm) && sol.lambdaNm >= 380) sayKey = 'ch3.say.visChain';

    $('hkSay').textContent = t(sayKey, {
      n: N,
      half: N / 2,
      deloc: sol.delocBeta.toFixed(2),
      gap: sol.gapBeta.toFixed(2),
      lam: isFinite(sol.lambdaNm) ? Math.round(sol.lambdaNm) : '∞'
    });

    if (!isVisible(cv)) return;
    const { ctx, w, h, narrow } = fit(cv);
    const place = makePlacer(w, h);

    const rectL = narrow
      ? { x: 44, y: 26, w: w - 58, h: h * 0.48 - 26 }
      : { x: 48, y: 28, w: w * 0.44 - 58, h: h - 54 };
    const rectR = narrow
      ? { x: 20, y: h * 0.56 + 16, w: w - 40, h: h * 0.44 - 28 }
      : { x: w * 0.48 + 8, y: 28, w: w * 0.52 - 22, h: h - 54 };

    // Left: Energy levels -2.2 .. +2.2 (in units of |beta|, so -values[i] is negative for bonding)
    drawPanelTitle(ctx, t('cv.hkLevels'), rectL.x, 8, rectL.w);
    const yMap = (eBeta) => rectL.y + rectL.h * (1 - (eBeta + 2.3) / 4.6);

    // Zero line (alpha)
    ctx.strokeStyle = COL.grid;
    ctx.beginPath();
    ctx.moveTo(rectL.x, yMap(0));
    ctx.lineTo(rectL.x + rectL.w, yMap(0));
    ctx.stroke();

    drawAxes(ctx, rectL.x, rectL.y, rectL.x + rectL.w, rectL.y + rectL.h);
    ctx.font = '10.5px ' + MONO;
    ctx.fillStyle = COL.mute;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [-2, -1, 0, 1, 2].forEach((b) => {
      ctx.fillText((b > 0 ? '+' : '') + b + '|β|', rectL.x - 5, yMap(b));
    });

    // Group degenerate levels within 1e-4 so we draw horizontal slots cleanly
    const groups = [];
    for (let i = 0; i < sol.values.length; i++) {
      const e = sol.values[i];
      const last = groups[groups.length - 1];
      if (last && Math.abs(last.e - e) < 1e-3) last.indices.push(i);
      else groups.push({ e, indices: [i] });
    }

    groups.forEach((g) => {
      const yy = yMap(g.e);
      const count = g.indices.length;
      const slotW = Math.min(82, (rectL.w - 20 - (count - 1) * 14) / count);
      const totalW = count * slotW + (count - 1) * 14;
      const startX = rectL.x + (rectL.w - totalW) / 2;

      g.indices.forEach((idx, j) => {
        const sx = startX + j * (slotW + 14);
        const isHomo = idx === sol.homoIdx;
        const isLumo = idx === sol.lumoIdx && sol.lumoIdx !== sol.homoIdx;
        const occ = sol.occ[idx];
        ctx.strokeStyle = isHomo ? COL.gold : (isLumo ? COL.red : (occ > 0 ? COL.cyan : COL.mute));
        ctx.lineWidth = (isHomo || isLumo) ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(sx, yy);
        ctx.lineTo(sx + slotW, yy);
        ctx.stroke();

        // Draw electrons (up/down arrows)
        const cx = sx + slotW / 2;
        if (occ >= 1) drawSpin(ctx, cx - (occ === 2 ? 5 : 0), yy, 1, isHomo ? COL.gold : COL.cyan);
        if (occ === 2) drawSpin(ctx, cx + 5, yy, -1, isHomo ? COL.gold : COL.cyan);
      });
    });

    if (sol.homoIdx >= 0) {
      place(ctx, t('cv.hkH'), rectL.x + rectL.w - 4, yMap(sol.values[sol.homoIdx]) - 10, {
        color: COL.gold,
        align: 'right',
        pill: true,
        font: '600 10px ' + MONO,
        optional: true
      });
    }
    if (sol.lumoIdx >= 0 && sol.lumoIdx !== sol.homoIdx) {
      place(ctx, t('cv.hkL'), rectL.x + rectL.w - 4, yMap(sol.values[sol.lumoIdx]) + 10, {
        color: COL.red,
        align: 'right',
        pill: true,
        font: '600 10px ' + MONO,
        optional: true
      });
    }

    // Right: HOMO coefficient lobes & nodes
    drawPanelTitle(ctx, t('cv.hkHomoVis'), rectR.x, narrow ? rectR.y - 18 : 8, rectR.w);
    const vec = sol.vectors[sol.homoIdx] || sol.vectors[0];
    const cx = rectR.x + rectR.w / 2;
    const cy = rectR.y + rectR.h / 2;
    const coords = [];
    if (ring) {
      const rad = Math.min(rectR.w, rectR.h) * 0.33;
      for (let i = 0; i < N; i++) {
        const ang = -Math.PI / 2 + (2 * Math.PI * i) / N;
        coords.push({ x: cx + rad * Math.cos(ang), y: cy + rad * Math.sin(ang) });
      }
    } else {
      const span = rectR.w - 44;
      for (let i = 0; i < N; i++) {
        const x = rectR.x + 22 + (N === 1 ? span / 2 : (i / (N - 1)) * span);
        const y = cy + (i % 2 === 0 ? -12 : 12);
        coords.push({ x, y });
      }
    }

    // Sigma backbone
    ctx.strokeStyle = COL.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    coords.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    if (ring && N > 2) ctx.closePath();
    ctx.stroke();

    // Node markers between opposite-sign neighbors
    let nodes = 0;
    const pairs = ring ? N : N - 1;
    for (let i = 0; i < pairs; i++) {
      const a = coords[i];
      const b = coords[(i + 1) % N];
      const va = vec[i], vb = vec[(i + 1) % N];
      if (va * vb < -1e-4) {
        nodes++;
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        ctx.strokeStyle = COL.red;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx - 4, my - 4);
        ctx.lineTo(mx + 4, my + 4);
        ctx.moveTo(mx + 4, my - 4);
        ctx.lineTo(mx - 4, my + 4);
        ctx.stroke();
      }
    }

    // Lobe circles proportional to |c_i|
    const maxC = Math.max(0.25, ...vec.map((v) => Math.abs(v)));
    const maxR = Math.min(26, (Math.min(rectR.w, rectR.h) / (N > 6 ? 7 : 5.5)));
    coords.forEach((p, i) => {
      const c = vec[i];
      const r = Math.max(4, (Math.abs(c) / maxC) * maxR);
      const pos = c >= 0;
      ctx.fillStyle = Math.abs(c) < 1e-3 ? COL.mute : (pos ? COL.cyanBg : COL.goldBg);
      ctx.strokeStyle = Math.abs(c) < 1e-3 ? COL.mute : (pos ? COL.cyan : COL.gold);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = COL.ink;
      ctx.font = '600 10px ' + MONO;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.abs(c) < 1e-3 ? '0' : (pos ? '+' : '−'), p.x, p.y);
    });

    place(ctx, t('cv.hkNodeSym') + ': ' + nodes, rectR.x + rectR.w - 6, rectR.y + rectR.h - 10, {
      color: COL.mute,
      align: 'right',
      font: '11px ' + MONO
    });
  }

  function drawSpin(ctx, x, y, dir, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x, y + 9);
    if (dir > 0) {
      ctx.moveTo(x - 3, y - 5);
      ctx.lineTo(x, y - 9);
      ctx.lineTo(x + 3, y - 5);
    } else {
      ctx.moveTo(x - 3, y + 5);
      ctx.lineTo(x, y + 9);
      ctx.lineTo(x + 3, y + 5);
    }
    ctx.stroke();
  }

  /* ── Ch4a: Two-site Polar/Covalent Continuum ──────────────────── */
  function drawCh4a() {
    const cv = $('tsCv');
    const dEv = parseFloat($('tsD').value);
    const tEv = parseFloat($('tsT').value);
    const res = M.twoSiteModel.eval(dEv, tEv);

    $('tsDo').textContent = dEv.toFixed(1) + ' eV';
    $('tsTo').textContent = tEv.toFixed(1) + ' eV';
    $('tsQ').textContent = res.qTransfer.toFixed(3) + ' e';
    $('tsPa').textContent = (res.pA * 100).toFixed(1) + '%';
    $('tsCov').textContent = res.covGain.toFixed(2) + ' eV';
    $('tsGap').textContent = res.gap.toFixed(2) + ' eV';

    const sayKey = res.qTransfer < 0.25 ? 'ch4.sayA.cov' : (res.qTransfer < 0.72 ? 'ch4.sayA.polar' : 'ch4.sayA.ionic');
    $('tsSay').textContent = t(sayKey, {
      d: dEv.toFixed(1),
      t: tEv.toFixed(1),
      q: res.qTransfer.toFixed(2),
      pa: (res.pA * 100).toFixed(1) + '%',
      cov: res.covGain.toFixed(2)
    });

    if (!isVisible(cv)) return;
    const { ctx, w, h, narrow } = fit(cv);
    const place = makePlacer(w, h);
    const padL = narrow ? 36 : 48, padR = 16, padT = 26, padB = 26;
    const eMax = 6.2;
    const yMap = (e) => padT + ((eMax - Math.max(-eMax, Math.min(eMax, e))) / (2 * eMax)) * (h - padT - padB);

    const colW = (w - padL - padR) / 3;
    const xA = padL + colW * 0.45;
    const xM = padL + colW * 1.5;
    const xB = padL + colW * 2.55;
    const lineW = Math.min(72, colW * 0.58);

    // Reference zero
    ctx.strokeStyle = COL.grid;
    ctx.beginPath();
    ctx.moveTo(padL, yMap(0));
    ctx.lineTo(w - padR, yMap(0));
    ctx.stroke();

    const yA = yMap(-dEv / 2);
    const yB = yMap(dEv / 2);
    const yBond = yMap(res.eBond);
    const yAnti = yMap(res.eAnti);

    // Correlation lines
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(xA + lineW / 2, yA); ctx.lineTo(xM - lineW / 2, yBond);
    ctx.moveTo(xA + lineW / 2, yA); ctx.lineTo(xM - lineW / 2, yAnti);
    ctx.moveTo(xB - lineW / 2, yB); ctx.lineTo(xM + lineW / 2, yBond);
    ctx.moveTo(xB - lineW / 2, yB); ctx.lineTo(xM + lineW / 2, yAnti);
    ctx.stroke();
    ctx.restore();

    // Levels
    ctx.lineWidth = 3;
    ctx.strokeStyle = COL.cyan;
    ctx.beginPath(); ctx.moveTo(xA - lineW / 2, yA); ctx.lineTo(xA + lineW / 2, yA); ctx.stroke();
    ctx.strokeStyle = COL.mute;
    ctx.beginPath(); ctx.moveTo(xB - lineW / 2, yB); ctx.lineTo(xB + lineW / 2, yB); ctx.stroke();
    ctx.strokeStyle = COL.gold;
    ctx.beginPath(); ctx.moveTo(xM - lineW / 2, yBond); ctx.lineTo(xM + lineW / 2, yBond); ctx.stroke();
    ctx.strokeStyle = COL.red;
    ctx.beginPath(); ctx.moveTo(xM - lineW / 2, yAnti); ctx.lineTo(xM + lineW / 2, yAnti); ctx.stroke();

    drawSpin(ctx, xM - 5, yBond, 1, COL.gold);
    drawSpin(ctx, xM + 5, yBond, -1, COL.gold);

    // Labels
    place(ctx, t('cv.tsLeft'), xA, Math.min(h - 32, yA + 16), { color: COL.cyan, align: 'center', font: '10.5px ' + SANS });
    place(ctx, t('cv.tsRight'), xB, Math.max(20, yB - 16), { color: COL.mute, align: 'center', font: '10.5px ' + SANS });
    place(ctx, t('cv.tsEbond') + ' ' + res.eBond.toFixed(2) + ' eV', xM, yBond + 18, { color: COL.gold, align: 'center', pill: true, font: '10.5px ' + MONO });
    place(ctx, t('cv.tsEanti') + ' +' + res.eAnti.toFixed(2) + ' eV', xM, yAnti - 16, { color: COL.red, align: 'center', pill: true, font: '10.5px ' + MONO });

    // Electron density bar at bottom showing pA vs pB
    const barW = Math.min(260, w - padL - padR);
    const barX = padL + (w - padL - padR - barW) / 2;
    const barY = h - 22;
    ctx.fillStyle = COL.cyan;
    ctx.fillRect(barX, barY, barW * res.pA, 10);
    ctx.fillStyle = COL.red;
    ctx.fillRect(barX + barW * res.pA, barY, barW * res.pB, 10);
    place(ctx, 'A ' + (res.pA * 100).toFixed(0) + '%', barX - 6, barY + 5, { color: COL.cyan, align: 'right', font: '10.5px ' + MONO });
    place(ctx, 'B ' + (res.pB * 100).toFixed(0) + '%', barX + barW + 6, barY + 5, { color: COL.red, align: 'left', font: '10.5px ' + MONO });
  }

  /* ── Ch4b: Madelung & Born-Haber ──────────────────────────────── */
  function drawCh4b() {
    const cv = $('mdCv');
    const L = parseInt($('mdL').value, 10);
    const view = radio('mdView') || 'madelung';
    const m3d = M.madelungModel.sumNaClEvjen(L);
    const m1d = M.madelungModel.sum1D(L);
    const bh = M.madelungModel.BORN_HABER_NACL;

    $('mdLo').textContent = 'L = ' + L + ' (' + (2 * L + 1) + '³)';
    $('md3d').textContent = m3d.toFixed(4) + ' (→ 1.7476)';
    $('md1d').textContent = m1d.toFixed(4) + ' (→ 1.3863)';
    $('mdGas').textContent = '+' + bh.gasIonPairCost + ' kJ/mol';
    $('mdLat').textContent = bh.latticeEnthalpy + ' kJ/mol';
    $('mdSay').textContent = t(view === 'madelung' ? 'ch4.sayB.mad' : 'ch4.sayB.bh', {
      L,
      n3: 2 * L + 1,
      m3d: m3d.toFixed(4),
      m1d: m1d.toFixed(4)
    });

    if (!isVisible(cv)) return;
    const { ctx, w, h, narrow } = fit(cv);
    const place = makePlacer(w, h);
    const padL = narrow ? 46 : 56, padR = 20, padT = 30, padB = 34;
    const pw = w - padL - padR;
    const ph = h - padT - padB;

    if (view === 'madelung') {
      drawPanelTitle(ctx, t('ch4.opt.mad'), padL, 8, pw);
      const yMin = 0.8, yMax = 2.05;
      const xMap = (l) => padL + ((l - 1) / 9) * pw;
      const yMap = (v) => padT + ph - ((v - yMin) / (yMax - yMin)) * ph;

      // Exact asymptote dashed lines
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = COL.gold;
      ctx.beginPath();
      ctx.moveTo(padL, yMap(M.madelungModel.EXACT_NACL));
      ctx.lineTo(padL + pw, yMap(M.madelungModel.EXACT_NACL));
      ctx.stroke();
      ctx.strokeStyle = COL.cyan;
      ctx.beginPath();
      ctx.moveTo(padL, yMap(M.madelungModel.EXACT_1D));
      ctx.lineTo(padL + pw, yMap(M.madelungModel.EXACT_1D));
      ctx.stroke();
      ctx.restore();

      drawAxes(ctx, padL, padT, padL + pw, padT + ph);
      ctx.font = '10.5px ' + MONO;
      ctx.fillStyle = COL.mute;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      [1.0, 1.4, 1.75, 2.0].forEach((v) => ctx.fillText(v.toFixed(2), padL - 6, yMap(v)));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = 1; i <= 10; i++) ctx.fillText(String(i), xMap(i), padT + ph + 6);

      // Curves up to 10, highlighting current L
      ctx.strokeStyle = COL.gold;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 1; i <= 10; i++) {
        const px = xMap(i), py = yMap(M.madelungModel.sumNaClEvjen(i));
        if (i === 1) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.strokeStyle = COL.cyan;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 1; i <= 10; i++) {
        const px = xMap(i), py = yMap(M.madelungModel.sum1D(i));
        if (i === 1) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Current L dots
      ctx.fillStyle = COL.gold;
      ctx.beginPath(); ctx.arc(xMap(L), yMap(m3d), 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COL.cyan;
      ctx.beginPath(); ctx.arc(xMap(L), yMap(m1d), 5.0, 0, Math.PI * 2); ctx.fill();

      place(ctx, t('cv.mdExact3d'), padL + pw - 6, yMap(M.madelungModel.EXACT_NACL) - 12, { color: COL.gold, align: 'right', pill: true, font: '10.5px ' + SANS });
      place(ctx, t('cv.mdExact1d'), padL + pw - 6, yMap(M.madelungModel.EXACT_1D) + 12, { color: COL.cyan, align: 'right', pill: true, font: '10.5px ' + SANS });
    } else {
      // Born-Haber energy ledger waterfall
      drawPanelTitle(ctx, t('cv.mdBhTitle'), padL, 8, pw);
      const steps = [
        { lbl: '0', from: 0, to: 0, col: COL.mute },
        { lbl: t('cv.mdBhSub'), from: 0, to: 107, col: COL.cyan },
        { lbl: t('cv.mdBhDiss'), from: 107, to: 228, col: COL.cyan },
        { lbl: t('cv.mdBhIp'), from: 228, to: 724, col: COL.red },
        { lbl: t('cv.mdBhEa'), from: 724, to: 375, col: COL.green },
        { lbl: t('cv.mdBhLat'), from: 375, to: -411, col: COL.gold },
        { lbl: t('cv.mdBhNet'), from: 0, to: -411, col: COL.gold }
      ];
      const yMin = -520, yMax = 820;
      const yMap = (v) => padT + ph - ((v - yMin) / (yMax - yMin)) * ph;

      ctx.strokeStyle = COL.grid;
      ctx.beginPath(); ctx.moveTo(padL, yMap(0)); ctx.lineTo(padL + pw, yMap(0)); ctx.stroke();
      drawAxes(ctx, padL, padT, padL + pw, padT + ph);
      ctx.font = '10px ' + MONO;
      ctx.fillStyle = COL.mute;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      [-400, 0, 400, 724].forEach((v) => ctx.fillText(String(v), padL - 5, yMap(v)));

      const bw = Math.min(54, (pw - 24) / steps.length * 0.68);
      const gap = pw / steps.length;
      steps.forEach((s, i) => {
        const cx = padL + gap * (i + 0.5);
        const yTop = yMap(Math.max(s.from, s.to));
        const yBot = yMap(Math.min(s.from, s.to));
        const bhPx = Math.max(3, yBot - yTop);
        ctx.fillStyle = s.col;
        ctx.fillRect(cx - bw / 2, yTop, bw, bhPx);
        if (!narrow || i % 2 === 0 || i >= 4) {
          place(ctx, s.lbl, cx, s.to >= s.from ? yTop - 10 : yBot + 11, {
            color: s.col,
            align: 'center',
            pill: true,
            font: '10px ' + SANS,
            optional: true
          });
        }
      });
    }
  }

  /* ── Ch5: Tight-binding Band Structure ────────────────────────── */
  function drawCh5() {
    const cv = $('tbCv');
    const N = parseInt(radio('tbN') || '64', 10);
    const twoAtom = radio('tbBas') !== '1';
    const dEv = parseFloat($('tbD').value);
    const effD = twoAtom ? dEv : 0;

    $('tbDo').textContent = (twoAtom ? dEv : 0).toFixed(1) + ' eV';
    const sol = M.bandModel.solve(N, effD, 2.0, twoAtom);

    $('tbGap').textContent = sol.bulkGap.toFixed(2) + ' eV';
    $('tbWidth').textContent = sol.bandwidth.toFixed(2) + ' eV';
    $('tbKind').textContent = t('ch5.kind.' + sol.kind);
    const visKey = sol.kind === 'metal' ? 'metal' : (sol.bulkGap < 1.65 ? 'ir' : (sol.bulkGap < 3.1 ? 'semi' : 'transparent'));
    $('tbVis').textContent = t('ch5.vis.' + visKey);

    $('tbSay').textContent = t('ch5.say.' + sol.kind, {
      n: N,
      gap: sol.bulkGap.toFixed(2),
      width: sol.bandwidth.toFixed(2)
    });

    if (!isVisible(cv)) return;
    const { ctx, w, h, narrow } = fit(cv);
    const place = makePlacer(w, h);
    const rectL = narrow
      ? { x: 46, y: 26, w: w - 60, h: h * 0.56 - 26 }
      : { x: 50, y: 28, w: w * 0.62 - 60, h: h - 58 };
    const rectR = narrow
      ? { x: 46, y: h * 0.64 + 14, w: w - 60, h: h * 0.36 - 24 }
      : { x: w * 0.66, y: 28, w: w * 0.34 - 18, h: h - 58 };

    drawPanelTitle(ctx, t('cv.tbTitleLeft'), rectL.x, 8, rectL.w);
    const eMin = -5.5, eMax = 5.5;
    const mapY = (e) => rectL.y + rectL.h - ((Math.max(eMin, Math.min(eMax, e)) - eMin) / (eMax - eMin)) * rectL.h;
    const mapX = (k) => rectL.x + (k / Math.PI) * rectL.w;

    // Bandgap shaded strip
    if (sol.bulkGap > 0.05) {
      const gy1 = mapY(sol.bulkGap / 2);
      const gy2 = mapY(-sol.bulkGap / 2);
      ctx.fillStyle = 'rgba(240,122,109,.10)';
      ctx.fillRect(rectL.x, gy1, rectL.w, gy2 - gy1);
    }

    // Fermi level E=0
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = COL.green;
    ctx.beginPath();
    ctx.moveTo(rectL.x, mapY(0));
    ctx.lineTo(rectL.x + rectL.w, mapY(0));
    ctx.stroke();
    ctx.restore();

    drawAxes(ctx, rectL.x, rectL.y, rectL.x + rectL.w, rectL.y + rectL.h);
    ctx.font = '10.5px ' + MONO;
    ctx.fillStyle = COL.mute;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [-4, -2, 0, 2, 4].forEach((e) => ctx.fillText((e > 0 ? '+' : '') + e, rectL.x - 5, mapY(e)));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('0', rectL.x, rectL.y + rectL.h + 5);
    ctx.fillText('π/a', rectL.x + rectL.w, rectL.y + rectL.h + 5);

    // Dispersion curve(s)
    if (!twoAtom) {
      ctx.strokeStyle = COL.cyan;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const k = (i / 60) * Math.PI;
        const ek = -4.0 * Math.cos(k);
        const px = mapX(k), py = mapY(ek);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    } else {
      [-1, 1].forEach((sgn) => {
        ctx.strokeStyle = sgn < 0 ? COL.cyan : COL.red;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const k = (i / 60) * Math.PI;
          const ek = sgn * Math.sqrt((effD / 2) * (effD / 2) + 16 * Math.cos(k / 2) * Math.cos(k / 2));
          const px = mapX(k), py = mapY(ek);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });
    }

    // Discrete finite-N states plotted on curve
    const halfN = sol.values.length / 2;
    sol.values.forEach((ev, idx) => {
      const k = sol.kPts[idx];
      const occ = idx < halfN;
      ctx.fillStyle = occ ? COL.cyan : COL.red;
      ctx.beginPath();
      ctx.arc(mapX(k), mapY(ev), N > 24 ? 2.6 : 4.2, 0, Math.PI * 2);
      ctx.fill();
    });

    place(ctx, t('cv.tbEf'), rectL.x + rectL.w - 4, mapY(0) - 10, { color: COL.green, align: 'right', pill: true, font: '10px ' + MONO });
    if (sol.bulkGap > 0.2) {
      place(ctx, t('cv.tbGap', { g: sol.bulkGap.toFixed(1) }), rectL.x + rectL.w / 2, mapY(0) + 12, {
        color: COL.red,
        align: 'center',
        pill: true,
        font: '10px ' + SANS,
        optional: true
      });
    }

    // Right: Density of states histogram
    drawPanelTitle(ctx, t('cv.tbTitleRight'), rectR.x, narrow ? rectR.y - 16 : 8, rectR.w);
    const bins = 18;
    const hist = new Array(bins).fill(0);
    const occHist = new Array(bins).fill(0);
    sol.values.forEach((ev, idx) => {
      const b = Math.max(0, Math.min(bins - 1, Math.floor(((ev - eMin) / (eMax - eMin)) * bins)));
      hist[b]++;
      if (idx < halfN) occHist[b]++;
    });
    const maxH = Math.max(1, ...hist);
    const bh = rectR.h / bins;
    for (let b = 0; b < bins; b++) {
      const by = rectR.y + rectR.h - (b + 1) * bh;
      const bw = (hist[b] / maxH) * (rectR.w - 6);
      if (bw > 0) {
        ctx.fillStyle = occHist[b] >= hist[b] / 2 ? COL.cyan : COL.red;
        ctx.fillRect(rectR.x, by + 1, bw, Math.max(2, bh - 2));
      }
    }
    ctx.strokeStyle = COL.axis;
    ctx.strokeRect(rectR.x, rectR.y, rectR.w, rectR.h);
  }

  /* ── Ch6: Coulson-Bent Hybridization ──────────────────────────── */
  function drawCh6() {
    const cv = $('hyCv');
    const sPct = parseFloat($('hyS').value);
    const molKey = radio('hyMol') || 'h2o';
    const preset = M.hybridModel.PRESETS[molKey] || M.hybridModel.PRESETS.h2o;

    const customMode = Math.abs(sPct - preset.sBond * 100) > 0.6;
    const nBonds = customMode ? 2 : preset.nBonds;
    const nLone = customMode ? Math.max(0, Math.round((1 - nBonds * (sPct / 100)) / 0.3)) : preset.nLone;
    const res = M.hybridModel.eval(sPct / 100, preset.nBonds, preset.nLone);

    $('hySo').textContent = sPct.toFixed(1) + '%';
    $('hyAng').textContent = res.angleDeg.toFixed(1) + '°';
    $('hyIdx').textContent = 'sp' + (isFinite(res.m) ? res.m.toFixed(2) : '∞');
    $('hySbond').textContent = (res.sBond * 100).toFixed(1) + '% / ' + (res.pShare * 100).toFixed(1) + '%';
    $('hySlone').textContent = preset.nLone > 0 ? (res.sLone * 100).toFixed(1) + '%' : '0%（无孤对）';

    if (customMode) {
      $('hySay').textContent = t('ch6.say.custom', {
        sbond: sPct.toFixed(1),
        m: res.m.toFixed(2),
        ang: res.angleDeg.toFixed(1)
      });
    } else {
      $('hySay').textContent = t('ch6.say.' + molKey);
    }
    void nLone;

    if (!isVisible(cv)) return;
    const { ctx, w, h, narrow } = fit(cv);
    const place = makePlacer(w, h);
    const cx = narrow ? w * 0.5 : w * 0.38;
    const cy = narrow ? h * 0.44 : h * 0.54;
    const bondLen = Math.min(w, h) * 0.28;

    const halfAng = (res.angleDeg * Math.PI) / 360;
    const b1x = cx - bondLen * Math.sin(halfAng);
    const b1y = cy + bondLen * Math.cos(halfAng);
    const b2x = cx + bondLen * Math.sin(halfAng);
    const b2y = cy + bondLen * Math.cos(halfAng);

    // Lone pair lobes upward if nLone > 0
    if (preset.nLone > 0) {
      const lpAngles = preset.nLone === 1 ? [0] : [-0.42, 0.42];
      lpAngles.forEach((a) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a);
        ctx.fillStyle = COL.violetBg;
        ctx.strokeStyle = COL.violet;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, -bondLen * 0.52, 16, bondLen * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
      place(ctx, t('cv.hyLone') + ' (' + preset.nLone + ')', cx, cy - bondLen * 0.85, {
        color: COL.violet,
        align: 'center',
        pill: true,
        font: '10.5px ' + SANS
      });
    }

    // Bonds
    ctx.strokeStyle = COL.cyan;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(b1x, b1y);
    ctx.moveTo(cx, cy); ctx.lineTo(b2x, b2y);
    ctx.stroke();

    // Extra 3rd/4th bond hint for BF3 / CH4
    if (preset.nBonds >= 3) {
      ctx.save();
      ctx.strokeStyle = 'rgba(94,194,223,.55)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - bondLen * 0.92);
      if (preset.nBonds === 4) {
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + bondLen * 0.36, cy - bondLen * 0.72);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Angle arc
    ctx.strokeStyle = COL.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 34, Math.PI / 2 - halfAng, Math.PI / 2 + halfAng);
    ctx.stroke();

    // Central & ligand spheres
    ctx.fillStyle = COL.gold;
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
    [[b1x, b1y], [b2x, b2y]].forEach(([bx, by]) => {
      ctx.fillStyle = COL.cyan;
      ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2); ctx.fill();
    });

    place(ctx, t('cv.hyAngle', { a: res.angleDeg.toFixed(1) }), cx, cy + 48, {
      color: COL.gold,
      align: 'center',
      pill: true,
      font: '600 11px ' + MONO
    });

    // Right / bottom s-character budget bar
    const bx = narrow ? 24 : w * 0.68;
    const by = narrow ? h - 52 : h * 0.36;
    const bw = narrow ? w - 48 : w * 0.26;
    drawPanelTitle(ctx, t('cv.hyRatio'), bx, by - 22, bw);
    const totalBondS = Math.min(1, preset.nBonds * res.sBond);
    ctx.fillStyle = COL.cyan;
    ctx.fillRect(bx, by, bw * totalBondS, 18);
    ctx.fillStyle = COL.violet;
    ctx.fillRect(bx + bw * totalBondS, by, bw * (1 - totalBondS), 18);
    ctx.strokeStyle = COL.axis;
    ctx.strokeRect(bx, by, bw, 18);
    place(ctx, t('cv.hyBond') + ' ' + Math.round(totalBondS * 100) + '%', bx, by + 28, {
      color: COL.cyan,
      font: '10px ' + SANS
    });
    if (preset.nLone > 0) {
      place(ctx, t('cv.hyLone') + ' ' + Math.round((1 - totalBondS) * 100) + '%', bx + bw, by + 28, {
        color: COL.violet,
        align: 'right',
        font: '10px ' + SANS
      });
    }
  }

  /* ── Ch7: 2D Lennard-Jones Molecular Dynamics ─────────────────── */
  let mdSim = M.ljMdModel.createSim({ N: 25, L: 12.0, Tstar: 0.20, epsScale: 1.0, seed: 42 });
  // Equilibrate briefly on init so first paint already reflects chosen phase
  for (let i = 0; i < 60; i++) mdSim.step(0.015, 0.20, 1.0, true);
  let mdPlaying = !reduce;
  let mdRaf = 0;

  function resetMdSim() {
    const Tstar = parseFloat($('mdT').value);
    const eps = parseFloat($('mdEps').value);
    mdSim = M.ljMdModel.createSim({ N: 25, L: 12.0, Tstar, epsScale: eps, seed: 42 });
    for (let i = 0; i < 60; i++) mdSim.step(0.015, Tstar, eps, true);
    drawCh7();
  }

  function updateMdReadouts() {
    const Tstar = parseFloat($('mdT').value);
    const eps = parseFloat($('mdEps').value);
    const nve = $('mdNve').checked;
    const met = mdSim.metrics();
    $('mdTo').textContent = Tstar.toFixed(2);
    $('mdEpso').textContent = eps.toFixed(1) + '×';
    $('mdPhase').textContent = t('ch7.phase.' + met.phase);
    $('mdTemp').textContent = met.Tinst.toFixed(3);
    $('mdCoord').textContent = met.coordNum.toFixed(2);
    $('mdEtot').textContent = met.E.toFixed(2) + ' ε';

    const sayKey = nve ? 'ch7.say.nve' : ('ch7.say.' + met.phase);
    $('md2Say').textContent = t(sayKey, {
      t: met.Tinst.toFixed(2),
      coord: met.coordNum.toFixed(1),
      etot: met.E.toFixed(2)
    });
  }

  function drawCh7() {
    const cv = $('md2Cv');
    const eps = parseFloat($('mdEps').value);
    updateMdReadouts();
    if (!isVisible(cv)) return;

    const { ctx, w, h, narrow } = fit(cv);
    const place = makePlacer(w, h);
    const rectL = narrow
      ? { x: 18, y: 26, w: w - 36, h: h * 0.54 - 28 }
      : { x: 20, y: 28, w: w * 0.46 - 28, h: h - 46 };
    const rectR = narrow
      ? { x: 46, y: h * 0.60 + 16, w: w - 62, h: h * 0.40 - 28 }
      : { x: w * 0.52 + 8, y: 28, w: w * 0.48 - 24, h: h - 58 };

    // Left: 2D Periodic Box
    drawPanelTitle(ctx, t('cv.md2Box'), rectL.x, 8, rectL.w);
    const boxSize = Math.min(rectL.w, rectL.h);
    const bx = rectL.x + (rectL.w - boxSize) / 2;
    const by = rectL.y + (rectL.h - boxSize) / 2;
    ctx.fillStyle = COL.panel;
    ctx.fillRect(bx, by, boxSize, boxSize);
    ctx.strokeStyle = COL.axis;
    ctx.strokeRect(bx, by, boxSize, boxSize);

    const scale = boxSize / mdSim.L;
    const rad = Math.max(4.5, 0.48 * scale);
    for (let i = 0; i < mdSim.N; i++) {
      const px = bx + mdSim.x[i] * scale;
      const py = by + mdSim.y[i] * scale;
      const speed2 = mdSim.vx[i] * mdSim.vx[i] + mdSim.vy[i] * mdSim.vy[i];
      const hot = Math.min(1, speed2 / 2.2);
      ctx.fillStyle = hot > 0.65 ? COL.red : (hot > 0.25 ? COL.gold : COL.cyan);
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.25)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Right: V_LJ(r) curve
    drawPanelTitle(ctx, t('cv.md2Pot'), rectR.x, narrow ? rectR.y - 16 : 8, rectR.w);
    const rMinX = 0.88, rMaxX = 2.60;
    const vMin = -2.6, vMax = 2.0;
    const mapX = (r) => rectR.x + ((r - rMinX) / (rMaxX - rMinX)) * rectR.w;
    const mapY = (v) => rectR.y + rectR.h - ((Math.max(vMin, Math.min(vMax, v)) - vMin) / (vMax - vMin)) * rectR.h;

    ctx.strokeStyle = COL.grid;
    ctx.beginPath(); ctx.moveTo(rectR.x, mapY(0)); ctx.lineTo(rectR.x + rectR.w, mapY(0)); ctx.stroke();
    drawAxes(ctx, rectR.x, rectR.y, rectR.x + rectR.w, rectR.y + rectR.h);
    ctx.font = '10px ' + MONO;
    ctx.fillStyle = COL.mute;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [-2, -1, 0, 1, 2].forEach((v) => ctx.fillText(String(v), rectR.x - 5, mapY(v)));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    [1.0, 1.5, 2.0, 2.5].forEach((r) => ctx.fillText(r.toFixed(1), mapX(r), rectR.y + rectR.h + 5));

    ctx.strokeStyle = COL.cyan;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const r = rMinX + (i / 80) * (rMaxX - rMinX);
      const v = M.ljMdModel.potential(r, eps);
      const px = mapX(r), py = mapY(v);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    const rMinPt = M.ljMdModel.rMinSigma;
    ctx.fillStyle = COL.gold;
    ctx.beginPath();
    ctx.arc(mapX(rMinPt), mapY(-eps), 4.5, 0, Math.PI * 2);
    ctx.fill();
    place(ctx, t('cv.md2Rmin'), mapX(rMinPt) + 8, mapY(-eps) - 10, {
      color: COL.gold,
      pill: true,
      font: '10px ' + SANS,
      optional: true
    });
  }

  function mdTick() {
    mdRaf = 0;
    const cv = $('md2Cv');
    if (!mdPlaying || reduce || !isVisible(cv)) return;
    const Tstar = parseFloat($('mdT').value);
    const eps = parseFloat($('mdEps').value);
    const nve = $('mdNve').checked;
    for (let k = 0; k < 4; k++) mdSim.step(0.014, Tstar, eps, !nve);
    drawCh7();
    mdRaf = window.requestAnimationFrame(mdTick);
  }

  function ensureMdLoop() {
    if (mdPlaying && !reduce && !mdRaf && isVisible($('md2Cv'))) {
      mdRaf = window.requestAnimationFrame(mdTick);
    }
  }

  /* ── Ch8: Materials & Crystal Slip Barrier ────────────────────── */
  function drawCh8() {
    const cv = $('stCv');
    const matId = radio('stMat') || 'nacl';
    const shift = parseFloat($('stShift').value);
    const mat = M.structureModel.MATERIALS[matId];
    const slip = M.structureModel.slipEnergyEv(matId, shift);

    $('stShifto').textContent = shift.toFixed(2) + ' a';
    $('stBarrier').textContent = slip.peakEv.toFixed(3) + ' eV';
    $('stDe').textContent = (slip.dEEv >= 0 ? '+' : '') + slip.dEEv.toFixed(3) + ' eV';
    $('stMech').textContent = t('ch8.mech.' + matId);
    $('stCond').textContent = t('ch8.cond.' + matId);

    $('stSay').textContent = t('ch8.say.' + matId, {
      shift: shift.toFixed(2),
      de: slip.dEEv.toFixed(3)
    });
    void mat;

    if (!isVisible(cv)) return;
    const { ctx, w, h, narrow } = fit(cv);
    const place = makePlacer(w, h);
    const rectL = narrow
      ? { x: 18, y: 26, w: w - 36, h: h * 0.44 - 24 }
      : { x: 20, y: 28, w: w * 0.44 - 28, h: h - 50 };
    const rectR = narrow
      ? { x: 46, y: h * 0.54 + 16, w: w - 62, h: h * 0.46 - 28 }
      : { x: w * 0.50 + 8, y: 28, w: w * 0.50 - 24, h: h - 58 };

    // Left: two crystal planes sliding by shift
    drawPanelTitle(ctx, t('cv.stLattice', { s: shift.toFixed(2) }), rectL.x, 8, rectL.w);
    ctx.fillStyle = COL.panel;
    ctx.fillRect(rectL.x, rectL.y, rectL.w, rectL.h);
    ctx.strokeStyle = COL.grid;
    ctx.strokeRect(rectL.x, rectL.y, rectL.w, rectL.h);

    const cols = 5;
    const spacing = (rectL.w - 40) / cols;
    const yBot = rectL.y + rectL.h * 0.66;
    const yTop = rectL.y + rectL.h * 0.34 - (slip.netRepulsive ? 12 * Math.sin(shift * Math.PI) : 0);

    for (let i = 0; i < cols; i++) {
      const bx = rectL.x + 28 + i * spacing;
      const tx = rectL.x + 28 + ((i + shift) % cols) * spacing;
      const isIonic = matId === 'nacl';
      const posBot = !isIonic || i % 2 === 0;
      const posTop = !isIonic || i % 2 === 1;

      // Directional bond lines for diamond / covalent
      if (matId === 'diamond') {
        ctx.strokeStyle = shift > 0.25 && shift < 0.75 ? COL.red : COL.cyan;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx, yBot);
        ctx.lineTo(bx + shift * spacing * 0.4, yTop);
        ctx.stroke();
      } else if (matId === 'copper') {
        ctx.fillStyle = 'rgba(233,185,73,.10)';
        ctx.fillRect(rectL.x + 12, yTop - 16, rectL.w - 24, (yBot - yTop) + 32);
      }

      // Bottom ion/atom
      ctx.fillStyle = isIonic ? (posBot ? COL.cyan : COL.red) : (matId === 'copper' ? COL.gold : COL.cyan);
      ctx.beginPath(); ctx.arc(bx, yBot, 9, 0, Math.PI * 2); ctx.fill();
      // Top ion/atom
      ctx.fillStyle = isIonic ? (posTop ? COL.cyan : COL.red) : (matId === 'copper' ? COL.gold : COL.cyan);
      ctx.beginPath(); ctx.arc(tx, yTop, 9, 0, Math.PI * 2); ctx.fill();
      if (isIonic) {
        ctx.fillStyle = '#0c0e13';
        ctx.font = '700 10px ' + MONO;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(posBot ? '+' : '−', bx, yBot);
        ctx.fillText(posTop ? '+' : '−', tx, yTop);
      }
    }

    if (slip.netRepulsive && shift > 0.25 && shift < 0.75) {
      place(ctx, t('cv.stRepel'), rectL.x + rectL.w / 2, rectL.y + rectL.h - 14, {
        color: COL.red,
        align: 'center',
        pill: true,
        font: '600 10.5px ' + SANS
      });
    }

    // Right: barrier curve Comparison
    drawPanelTitle(ctx, t('cv.stCurve'), rectR.x, narrow ? rectR.y - 16 : 8, rectR.w);
    const eMax = 4.0;
    const mapX = (s) => rectR.x + s * rectR.w;
    const mapY = (e) => rectR.y + rectR.h - (Math.min(eMax, Math.max(0, e)) / eMax) * rectR.h;
    drawAxes(ctx, rectR.x, rectR.y, rectR.x + rectR.w, rectR.y + rectR.h);
    ctx.font = '10px ' + MONO;
    ctx.fillStyle = COL.mute;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [0, 1, 2, 3, 4].forEach((e) => ctx.fillText(e.toFixed(0), rectR.x - 5, mapY(e)));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    [0, 0.5, 1.0].forEach((s) => ctx.fillText(s.toFixed(1), mapX(s), rectR.y + rectR.h + 5));

    const order = ['diamond', 'nacl', 'copper', 'pe', 'graphite'];
    const colors = { diamond: COL.violet, nacl: COL.red, copper: COL.gold, pe: COL.green, graphite: COL.cyan };
    order.forEach((id) => {
      const sel = id === matId;
      ctx.strokeStyle = colors[id];
      ctx.lineWidth = sel ? 3 : 1.3;
      ctx.globalAlpha = sel ? 1 : 0.45;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const s = i / 40;
        const val = M.structureModel.slipEnergyEv(id, s).dEEv;
        if (i === 0) ctx.moveTo(mapX(s), mapY(val)); else ctx.lineTo(mapX(s), mapY(val));
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Active dot
    ctx.fillStyle = colors[matId];
    ctx.beginPath();
    ctx.arc(mapX(shift), mapY(slip.dEEv), 5.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── Ch9: 2D HP Lattice Protein Folding ───────────────────────── */
  const hpEnumCache = {};
  let hpLastFold = {};
  function getHpData(seqKey) {
    const seq = M.hpProteinModel.PRESETS[seqKey].seq;
    if (!hpEnumCache[seqKey]) hpEnumCache[seqKey] = M.hpProteinModel.enumerate(seq);
    if (!hpLastFold[seqKey]) {
      const T = parseFloat($('hpT').value);
      hpLastFold[seqKey] = M.hpProteinModel.foldMC(seq, T, 1600, 16);
    }
    return { seq, enumData: hpEnumCache[seqKey], fold: hpLastFold[seqKey] };
  }

  function runHpFold() {
    const seqKey = radio('hpSeq') || 'designable';
    const seq = M.hpProteinModel.PRESETS[seqKey].seq;
    const T = parseFloat($('hpT').value);
    const seed = Math.round(T * 100) + 16;
    hpLastFold[seqKey] = M.hpProteinModel.foldMC(seq, T, 1600, seed);
    drawCh9();
  }

  function drawCh9() {
    const cv = $('hpCv');
    const seqKey = radio('hpSeq') || 'designable';
    const T = parseFloat($('hpT').value);
    const { seq, enumData, fold } = getHpData(seqKey);

    $('hpTo').textContent = T.toFixed(2);
    $('hpWalks').textContent = enumData.totalWalks.toLocaleString('en-US');
    $('hpMinE').textContent = String(enumData.minE);
    $('hpDeg').textContent = enumData.degeneracy.toLocaleString('en-US');
    $('hpBestE').textContent = String(fold.bestE);

    $('hpSay').textContent = t('ch9.say.' + seqKey, { bestE: fold.bestE });

    if (!isVisible(cv)) return;
    const { ctx, w, h, narrow } = fit(cv);
    const place = makePlacer(w, h);
    const rectL = narrow
      ? { x: 18, y: 26, w: w - 36, h: h * 0.48 - 26 }
      : { x: 20, y: 28, w: w * 0.46 - 28, h: h - 48 };
    const rectR = narrow
      ? { x: 46, y: h * 0.56 + 16, w: w - 62, h: h * 0.44 - 28 }
      : { x: w * 0.52 + 8, y: 28, w: w * 0.48 - 24, h: h - 58 };

    // Left: 2D folded lattice chain
    const coords = fold.bestCoords || enumData.nativeCoords;
    drawPanelTitle(ctx, t('cv.hpFold', { e: fold.bestE }), rectL.x, 8, rectL.w);
    ctx.fillStyle = COL.panel;
    ctx.fillRect(rectL.x, rectL.y, rectL.w, rectL.h);
    ctx.strokeStyle = COL.grid;
    ctx.strokeRect(rectL.x, rectL.y, rectL.w, rectL.h);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    coords.forEach(([x, y]) => {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    });
    const spanX = Math.max(2, maxX - minX);
    const spanY = Math.max(2, maxY - minY);
    const step = Math.min((rectL.w - 50) / spanX, (rectL.h - 46) / spanY, 34);
    const ox = rectL.x + rectL.w / 2 - ((minX + maxX) / 2) * step;
    const oy = rectL.y + rectL.h / 2 - ((minY + maxY) / 2) * step;

    // Non-bonded H-H contacts
    ctx.save();
    ctx.strokeStyle = COL.green;
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 2;
    for (let i = 0; i < coords.length; i++) {
      if (seq[i] !== 'H') continue;
      for (let j = i + 2; j < coords.length; j++) {
        if (seq[j] !== 'H') continue;
        const dx = Math.abs(coords[i][0] - coords[j][0]);
        const dy = Math.abs(coords[i][1] - coords[j][1]);
        if (dx + dy === 1) {
          ctx.beginPath();
          ctx.moveTo(ox + coords[i][0] * step, oy + coords[i][1] * step);
          ctx.lineTo(ox + coords[j][0] * step, oy + coords[j][1] * step);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // Peptide backbone
    ctx.strokeStyle = COL.body;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    coords.forEach(([x, y], idx) => {
      const px = ox + x * step, py = oy + y * step;
      if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // H / P beads
    coords.forEach(([x, y], idx) => {
      const px = ox + x * step, py = oy + y * step;
      const isH = seq[idx] === 'H';
      ctx.fillStyle = isH ? COL.gold : COL.cyan;
      ctx.beginPath(); ctx.arc(px, py, 8.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0c0e13';
      ctx.font = '700 9.5px ' + MONO;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(seq[idx], px, py);
    });

    // Right: exact 15,037-walk energy histogram
    drawPanelTitle(ctx, t('cv.hpHist', { n: enumData.totalWalks.toLocaleString('en-US') }), rectR.x, narrow ? rectR.y - 16 : 8, rectR.w);
    const energies = [-5, -4, -3, -2, -1, 0];
    const counts = energies.map((e) => enumData.hist[e] || 0);
    const maxLog = Math.log10(enumData.totalWalks + 1);
    drawAxes(ctx, rectR.x, rectR.y, rectR.x + rectR.w, rectR.y + rectR.h);
    const slotW = rectR.w / energies.length;
    energies.forEach((e, i) => {
      const c = counts[i];
      const frac = c > 0 ? Math.log10(c + 1) / maxLog : 0;
      const bh = frac * (rectR.h - 14);
      const bx = rectR.x + i * slotW + slotW * 0.18;
      const bw = slotW * 0.64;
      const by = rectR.y + rectR.h - bh;
      const isMin = e === enumData.minE;
      if (c > 0) {
        ctx.fillStyle = isMin && enumData.degeneracy === 1 ? COL.green : (isMin ? COL.gold : COL.cyan);
        ctx.fillRect(bx, by, bw, Math.max(4, bh));
        place(ctx, String(c), bx + bw / 2, by - 9, {
          color: isMin ? COL.green : COL.mute,
          align: 'center',
          font: '10px ' + MONO,
          optional: true
        });
      }
      ctx.fillStyle = COL.mute;
      ctx.font = '10.5px ' + MONO;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(String(e), bx + bw / 2, rectR.y + rectR.h + 5);
    });
  }

  /* ── Ch10: Frontier & Scaling ─────────────────────────────────── */
  const FRONTIER_STATUS = {
    'ch10.f1': ['established'],
    'ch10.f2': ['demonstrated'],
    'ch10.f3': ['demonstrated', 'contested'],
    'ch10.f4': ['contested'],
    'ch10.f5': ['demonstrated']
  };

  function drawCh10() {
    const cv = $('frCv');
    const nAtoms = parseInt($('frN').value, 10);
    const filt = radio('frFilt') || 'all';
    const sc = M.FRONTIER.scaling.evalAt(nAtoms);

    $('frNo').textContent = nAtoms + ' atoms';
    $('frMlip').textContent = sc.mlip.toLocaleString('en-US') + '×';
    $('frDft').textContent = sc.dft.toLocaleString('en-US') + '×';
    $('frCcsd').textContent = sc.ccsd > 1e6 ? (sc.ccsd / 1e6).toFixed(1) + 'M×' : sc.ccsd.toLocaleString('en-US') + '×';
    $('frDate').textContent = M.FRONTIER.asOf;

    $('frSay').textContent = t('ch10.say.n', {
      n: nAtoms,
      mlip: sc.mlip.toLocaleString('en-US'),
      dft: sc.dft.toLocaleString('en-US'),
      ccsd: sc.ccsd.toLocaleString('en-US')
    });

    // Filter frontier bullet items cleanly
    Object.keys(FRONTIER_STATUS).forEach((key) => {
      const el = document.querySelector('[data-i18n-html="' + key + '"]');
      if (!el) return;
      const show = filt === 'all' || FRONTIER_STATUS[key].indexOf(filt) >= 0;
      el.style.display = show ? '' : 'none';
    });

    if (!isVisible(cv)) return;
    const { ctx, w, h, narrow } = fit(cv);
    const place = makePlacer(w, h);
    const padL = narrow ? 48 : 58, padR = 20, padT = 30, padB = 34;
    const pw = w - padL - padR;
    const ph = h - padT - padB;

    drawPanelTitle(ctx, t('ch10.model.title'), padL, 8, pw);
    const nMin = 10, nMax = 100;
    const logMax = 8.0; // 10^8
    const mapX = (n) => padL + ((Math.log10(n) - Math.log10(nMin)) / (Math.log10(nMax) - Math.log10(nMin))) * pw;
    const mapY = (val) => padT + ph - (Math.min(logMax, Math.max(0, Math.log10(Math.max(1, val)))) / logMax) * ph;

    drawAxes(ctx, padL, padT, padL + pw, padT + ph);
    ctx.font = '10px ' + MONO;
    ctx.fillStyle = COL.mute;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [0, 2, 4, 6, 8].forEach((p) => ctx.fillText('10^' + p, padL - 6, padT + ph - (p / logMax) * ph));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    [10, 20, 50, 100].forEach((n) => ctx.fillText(String(n), mapX(n), padT + ph + 5));

    const series = [
      { key: 'mlip', col: COL.green, lbl: 'MLIP O(N)' },
      { key: 'dft', col: COL.cyan, lbl: 'DFT O(N³)' },
      { key: 'ccsd', col: COL.red, lbl: 'CCSD(T) O(N⁷)' }
    ];
    series.forEach((s) => {
      ctx.strokeStyle = s.col;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i <= 36; i++) {
        const n = nMin + (i / 36) * (nMax - nMin);
        const ev = M.FRONTIER.scaling.evalAt(n)[s.key];
        const px = mapX(n), py = mapY(ev);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      const curPx = mapX(nAtoms), curPy = mapY(sc[s.key]);
      ctx.fillStyle = s.col;
      ctx.beginPath(); ctx.arc(curPx, curPy, 5, 0, Math.PI * 2); ctx.fill();
    });

    // Vertical marker at current N
    ctx.save();
    ctx.strokeStyle = 'rgba(233,185,73,.45)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(mapX(nAtoms), padT); ctx.lineTo(mapX(nAtoms), padT + ph); ctx.stroke();
    ctx.restore();
    place(ctx, t('cv.frCurr', { n: nAtoms }), mapX(nAtoms), padT + 14, { color: COL.gold, align: 'center', pill: true, font: '10.5px ' + MONO });
  }

  /* ── Copy Application & Language Toggle ───────────────────────── */
  function applyCopy() {
    document.title = t('doc.title');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('doc.description'));

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    document.querySelectorAll('#langToggle [data-lang]').forEach((btn) => {
      const active = btn.getAttribute('data-lang') === lang;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    const playBtn = $('mdPlay');
    if (playBtn) playBtn.textContent = t(mdPlaying ? 'ch7.btn.pause' : 'ch7.btn.play');
  }

  /* ── Visibility & Redraw Scheduler ────────────────────────────── */
  const visible = new WeakSet();
  const draws = [
    ['bxCv', drawCh1],
    ['h2Cv', drawCh2],
    ['hkCv', drawCh3],
    ['tsCv', drawCh4a],
    ['mdCv', drawCh4b],
    ['tbCv', drawCh5],
    ['hyCv', drawCh6],
    ['md2Cv', drawCh7],
    ['stCv', drawCh8],
    ['hpCv', drawCh9],
    ['frCv', drawCh10]
  ];
  const drawMap = new Map(draws);

  function isVisible(cv) {
    if (!cv) return false;
    if (visible.has(cv)) return true;
    const r = cv.getBoundingClientRect();
    return r.bottom >= -120 && r.top <= (window.innerHeight || 900) + 120;
  }

  function redrawAll() {
    draws.forEach(([, fn]) => fn());
  }

  if (typeof window.IntersectionObserver === 'function') {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const cv = entry.target;
        if (entry.isIntersecting) {
          visible.add(cv);
          const fn = drawMap.get(cv.id);
          if (fn) fn();
          if (cv.id === 'md2Cv') ensureMdLoop();
        } else {
          visible.delete(cv);
        }
      });
    }, { rootMargin: '140px 0px' });
    draws.forEach(([id]) => {
      const el = $(id);
      if (el) io.observe(el);
    });
  }

  /* ── Bind Controls ────────────────────────────────────────────── */
  function bind(sel, evt, fn) {
    document.querySelectorAll(sel).forEach((el) => el.addEventListener(evt, fn));
  }

  bind('#bxL', 'input', drawCh1);
  bind('input[name="bxN"], #bxMerge', 'change', drawCh1);

  bind('#h2R', 'input', drawCh2);
  bind('input[name="h2Orb"], input[name="h2Bas"]', 'change', drawCh2);

  bind('input[name="hkN"], #hkRing', 'change', drawCh3);

  bind('#tsD, #tsT', 'input', drawCh4a);

  bind('#mdL', 'input', drawCh4b);
  bind('input[name="mdView"]', 'change', drawCh4b);

  bind('input[name="tbN"], input[name="tbBas"]', 'change', drawCh5);
  bind('#tbD', 'input', drawCh5);

  bind('input[name="hyMol"]', 'change', () => {
    const preset = M.hybridModel.PRESETS[radio('hyMol')];
    if (preset) $('hyS').value = (preset.sBond * 100).toFixed(1);
    drawCh6();
  });
  bind('#hyS', 'input', drawCh6);

  bind('#mdT, #mdEps', 'input', drawCh7);
  bind('#mdNve', 'change', drawCh7);
  $('mdPlay').addEventListener('click', () => {
    mdPlaying = !mdPlaying;
    $('mdPlay').textContent = t(mdPlaying ? 'ch7.btn.pause' : 'ch7.btn.play');
    if (mdPlaying && !reduce) ensureMdLoop();
    else if (mdRaf) {
      window.cancelAnimationFrame(mdRaf);
      mdRaf = 0;
    }
  });
  $('mdStep').addEventListener('click', () => {
    const Tstar = parseFloat($('mdT').value);
    const eps = parseFloat($('mdEps').value);
    const nve = $('mdNve').checked;
    for (let k = 0; k < 5; k++) mdSim.step(0.015, Tstar, eps, !nve);
    drawCh7();
  });
  $('mdReset').addEventListener('click', resetMdSim);

  bind('input[name="stMat"]', 'change', drawCh8);
  bind('#stShift', 'input', drawCh8);

  bind('input[name="hpSeq"]', 'change', drawCh9);
  bind('#hpT', 'input', drawCh9);
  $('hpFold').addEventListener('click', runHpFold);

  bind('#frN', 'input', drawCh10);
  bind('input[name="frFilt"]', 'change', drawCh10);

  document.querySelectorAll('#langToggle [data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('data-lang');
      if (COPY[next]) {
        lang = next;
        try { localStorage.setItem('knowledge-lang', next); } catch (_) {}
        applyCopy();
        redrawAll();
      }
    });
  });

  window.addEventListener('resize', () => {
    window.clearTimeout(window.__bondResizeTimer);
    window.__bondResizeTimer = window.setTimeout(redrawAll, 60);
  });

  applyCopy();
  redrawAll();
  ensureMdLoop();
  window.__essayReady = true;
})();
