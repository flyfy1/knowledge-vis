/* Interactive runtime for "How an Encrypted Local Image Gets Decoded".
   All visible strings come from copy.zh.js / copy.en.js via window.ESSAY_COPY. */
(() => {
  'use strict';
  const M = window.EncImageModels;
  const COPY = window.ESSAY_COPY || {};
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const C = {
    bg: '#0f1219', line: '#2b3242', grid: '#1f2533', ink: '#ebe8e0',
    mute: '#a3aab8', gold: '#e9b949', cyan: '#63c7e6', red: '#f07a6d', green: '#7ad6a0',
  };
  const FONT = '12px -apple-system,"PingFang SC","Microsoft YaHei",system-ui,sans-serif';

  const LS = 'knowledge-lang';
  let memLang = null;
  function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
  function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) {} }
  let lang = readLang();
  if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
  const hasLang = l => !!COPY[l];
  const effLang = () => (hasLang(lang) ? lang : 'zh');
  function t(key, vars) {
    const L = effLang();
    let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key]
      : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return s;
  }
  const fmt = (x, d) => M.fmt(x, d, effLang());
  const put = (sel, s) => { const e = $(sel); if (e && e.textContent !== s) e.textContent = s; };
  const putHTML = (sel, s) => { const e = $(sel); if (e && e.__h !== s) { e.innerHTML = s; e.__h = s; } };
  const radioVal = name => { const r = document.querySelector(`input[name=${name}]:checked`); return r ? r.value : null; };

  const hooks = [];
  const sims = [];
  const io = new IntersectionObserver(es => es.forEach(e => {
    for (const s of sims) {
      if (s.cvs.includes(e.target)) {
        e.target.__vis = e.isIntersecting;
        s.vis = s.cvs.some(cv => cv.__vis);
        s.dirty = true;
      }
    }
  }), { rootMargin: '60px' });

  function reg(cvs, o) {
    o.cvs = [].concat(cvs); o.vis = false; o.dirty = true;
    sims.push(o);
    o.cvs.forEach(cv => io.observe(cv));
    return o;
  }
  window.addEventListener('resize', () => sims.forEach(s => { s.dirty = true; }));
  function loop() {
    for (const s of sims) if (s.vis && s.dirty) { s.dirty = false; s.draw(); }
    requestAnimationFrame(loop);
  }
  function fit(cv) {
    const r = cv.getBoundingClientRect();
    const d = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.round(r.width * d));
    const H = Math.max(1, Math.round(r.height * d));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const c = cv.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0);
    c.font = FONT;
    c.textBaseline = 'middle';
    c.clearRect(0, 0, r.width, r.height);
    return { c, w: r.width, h: r.height };
  }

  function applyLang() {
    document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
    document.title = t('doc.title');
    const md = document.querySelector('meta[name=description]');
    if (md) md.content = t('doc.desc');
    $$('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
    $$('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
    $$('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
    $$('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    hooks.forEach(f => f());
    sims.forEach(s => { s.dirty = true; if (s.text) s.text(); });
  }
  $$('#langToggle button').forEach(b => b.addEventListener('click', () => {
    lang = b.dataset.lang; writeLang(lang); applyLang();
  }));

  /* Ch 1: V2 layout */
  function updateCh1() {
    const plain = Number($('#c1Plain').value);
    const aes = Number($('#c1Aes').value);
    const r = M.v2Layout(plain, aes);
    put('#c1PlainO', t('u.b', { v: fmt(r.plainSize, 0) }));
    put('#c1AesO', t('u.b', { v: fmt(r.aesSize, 0) }));
    put('#c1Dat', t('u.b', { v: fmt(r.datSize, 0) }));
    put('#c1AesPad', t('u.b', { v: fmt(r.aesCipherBytes, 0) }));
    put('#c1Xor', t('u.b', { v: fmt(r.xorBytes, 0) }));
    put('#c1Diff', '+' + t('u.b', { v: fmt(r.overhead, 0) }));
    const bar = $('#c1Bar');
    if (bar) {
      const wHdr = 10, wPad = 10;
      const wAes = Math.max(14, Math.min(44, Math.round(14 + (r.aesSize / 2048) * 30)));
      const wXor = 100 - wHdr - wPad - wAes;
      bar.innerHTML =
        `<span class="s-hdr" style="width:${wHdr}%">15B</span>` +
        `<span class="s-aes" style="width:${wAes}%">AES ${r.aesSize}B</span>` +
        `<span class="s-pad" style="width:${wPad}%">+${r.padBytes}B</span>` +
        `<span class="s-xor" style="width:${wXor}%">XOR ${fmt(r.xorBytes, 0)}B</span>`;
    }
    putHTML('#c1Say', t('ch1.say', {
      plain: fmt(r.plainSize, 0), aes: fmt(r.aesSize, 0), pad: r.padBytes,
      aesPad: fmt(r.aesCipherBytes, 0), aesEnd: fmt(r.xorStart - 1, 0),
      xor: fmt(r.xorBytes, 0), diff: r.overhead,
    }));
  }
  $('#c1Plain').addEventListener('input', updateCh1);
  $('#c1Aes').addEventListener('input', updateCh1);
  hooks.push(updateCh1);

  /* Ch 2: XOR involution */
  function updateCh2() {
    const f = radioVal('c2Fmt') || 'jpg';
    const k = Number($('#c2Key').value);
    const r = M.xorRecover(f, k);
    put('#c2KeyO', r.keyHex);
    const hexList = arr => arr.map(M.hexByte).join(' ');
    put('#c2Plain', hexList(r.tailPlain));
    put('#c2Cipher', hexList(r.tailCipher));
    put('#c2Derived', r.derivedKeys.map(b => '0x' + M.hexByte(b)).join(', '));
    put('#c2Restored', hexList(r.restored));
    const strip = $('#c2Bytes');
    if (strip) {
      strip.innerHTML = r.tailPlain.map((p, i) =>
        `<div class="byte-cell gn">${M.hexByte(p)}<small>P[${i}]</small></div>` +
        `<div class="byte-cell rd">${M.hexByte(r.tailCipher[i])}<small>C[${i}]</small></div>` +
        `<div class="byte-cell hi">${M.hexByte(r.derivedKeys[i])}<small>C⊕P</small></div>`
      ).join('');
    }
    putHTML('#c2Say', t('ch2.say', { fmt: r.format, key: r.keyHex }));
  }
  $$('input[name=c2Fmt]').forEach(el => el.addEventListener('change', updateCh2));
  $('#c2Key').addEventListener('input', updateCh2);
  hooks.push(updateCh2);

  /* Ch 3: ECB vs CBC */
  function updateCh3() {
    const mode = radioVal('c3Mode') || 'ecb';
    const flip = radioVal('c3Flip') === '1';
    const r = M.ecbVsCbc(mode, flip);
    put('#c3PadA', r.ctA[3]);
    put('#c3PadB', r.ctB[3]);
    put('#c3Match', r.padSame ? t('ch3.yes') : t('ch3.no'));
    const mEl = $('#c3Match');
    if (mEl) mEl.className = r.padSame ? 'g' : 'c';
    const box = $('#c3Blocks');
    if (box) {
      const cls = r.padSame ? 'same' : 'diff';
      box.innerHTML = [0, 1, 2, 3].map(i => {
        const isLast = i === 3;
        const c = isLast ? cls : (r.ctA[i] === r.ctB[i] ? 'same' : 'diff');
        return `<div class="blk-card ${c}"><div class="lbl">Block ${i + 1}${isLast ? ' (Pad)' : ''}</div>` +
          `<div class="hex">A: ${r.ctA[i]}</div><div class="hex">B: ${r.ctB[i]}</div></div>`;
      }).join('');
    }
    putHTML('#c3Say', t('ch3.say.' + mode));
  }
  $$('input[name=c3Mode], input[name=c3Flip]').forEach(el => el.addEventListener('change', updateCh3));
  hooks.push(updateCh3);

  /* Ch 4: Known plaintext oracle */
  function updateCh4() {
    const mode = radioVal('c4Mode') || 'exact16';
    const cand = Number($('#c4Cand').value);
    const r = M.knownPlaintextCheck(mode, cand);
    put('#c4CandO', t('u.m', { v: fmt(cand, 0) }));
    put('#c4Bits', t('u.bits', { v: r.bits }));
    const fpStr = r.expectedFP >= 0.01 ? fmt(r.expectedFP, 2) : `10^${Math.round(r.log10FP)}`;
    put('#c4Fp', fpStr);
    put('#c4Risk', r.zeroPaddingRisk ? t('ch4.risk.hi') : t('ch4.risk.no'));
    const riskEl = $('#c4Risk');
    if (riskEl) riskEl.className = r.zeroPaddingRisk ? 'r' : 'n';
    putHTML('#c4Say', t('ch4.say.' + mode, { cand: fmt(cand, 0), fp: fpStr }));
  }
  $$('input[name=c4Mode]').forEach(el => el.addEventListener('change', updateCh4));
  $('#c4Cand').addEventListener('input', updateCh4);
  hooks.push(updateCh4);

  /* Ch 5: Memory window probability + Canvas chart */
  const sim5 = reg($('#c5Cv'), {
    text() {
      const ram = Number($('#c5Ram').value);
      const life = Number($('#c5Life').value);
      const rounds = Number($('#c5Rounds').value);
      const r = M.memoryWindowProb(ram, 450, life, rounds);
      put('#c5RamO', t('u.mb', { v: fmt(ram, 0) }));
      put('#c5LifeO', t('u.ms', { v: fmt(life, 1) }));
      put('#c5RoundsO', String(rounds));
      put('#c5Scan', t('u.s', { v: fmt(r.scanSec, 2) }));
      put('#c5P1', t('u.pct', { v: fmt(r.pSingle * 100, 3) }));
      put('#c5Pn', t('u.pct', { v: fmt(r.pMulti * 100, 2) }));
      putHTML('#c5Say', t('ch5.say', {
        ram: fmt(ram, 0), scan: fmt(r.scanSec, 2), life: fmt(life, 1),
        rounds, pn: t('u.pct', { v: fmt(r.pMulti * 100, 2) }),
      }));
    },
    draw() {
      const { c, w, h } = fit($('#c5Cv'));
      const ram = Number($('#c5Ram').value);
      const life = Number($('#c5Life').value);
      const rounds = Number($('#c5Rounds').value);
      const L = 48, R = w - 18, T = 18, B = h - 28;
      const X = x => L + (R - L) * (x / 100);
      const Y = y => B - (B - T) * y;
      c.strokeStyle = C.grid; c.lineWidth = 1;
      for (const yv of [0, 0.5, 1]) {
        const py = Y(yv);
        c.beginPath(); c.moveTo(L, py); c.lineTo(R, py); c.stroke();
        c.fillStyle = C.mute; c.textAlign = 'right';
        c.fillText(Math.round(yv * 100) + '%', L - 6, py);
      }
      c.textAlign = 'center';
      for (const xv of [1, 25, 50, 75, 100]) {
        c.fillText(String(xv), X(xv), B + 14);
      }
      c.strokeStyle = C.gold; c.lineWidth = 2.2; c.beginPath();
      for (let i = 1; i <= 100; i++) {
        const p = M.memoryWindowProb(ram, 450, life, i).pMulti;
        const px = X(i), py = Y(p);
        if (i === 1) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke();
      const cur = M.memoryWindowProb(ram, 450, life, rounds).pMulti;
      c.fillStyle = C.cyan;
      c.beginPath(); c.arc(X(rounds), Y(cur), 5, 0, Math.PI * 2); c.fill();
    },
  });
  ['#c5Ram', '#c5Life', '#c5Rounds'].forEach(sel => $(sel).addEventListener('input', () => {
    sim5.text(); sim5.dirty = true;
  }));

  /* Ch 6: ARM64 registers */
  function updateCh6() {
    const mode = radioVal('c6Call') || 'db';
    const r = M.arm64CallTrace(mode);
    put('#c6Fn', r.fn);
    put('#c6Res', r.matched ? t('ch6.ok') : t('ch6.no'));
    const resEl = $('#c6Res');
    if (resEl) resEl.className = r.matched ? 'n' : 'r';
    const box = $('#c6Regs');
    if (box) {
      box.innerHTML = r.regs.map(item =>
        `<div class="reg-item"><span class="rn">${item.r}</span><span class="rv">${item.val}</span><span class="rm">${item.mean}</span></div>`
      ).join('');
    }
    putHTML('#c6Say', t('ch6.say.' + mode));
  }
  $$('input[name=c6Call]').forEach(el => el.addEventListener('change', updateCh6));
  hooks.push(updateCh6);

  /* Ch 7: ADRP + LDR + ASLR */
  function updateCh7() {
    const pcMB = Number($('#c7Pc').value);
    const tgtMB = Number($('#c7Tgt').value);
    const slideMB = Number($('#c7Slide').value);
    const pc = (pcMB * 1024 * 1024) + 0x92ff0;
    const tgt = (tgtMB * 1024 * 1024) + 0xd26f8;
    const base = BigInt(0x100000000) + BigInt(slideMB) * BigInt(1024 * 1024) + BigInt(0x4f8000);
    const r = M.adrpResolve(pc, tgt, '0x' + base.toString(16));
    put('#c7PcO', r.pcHex);
    put('#c7TgtO', r.targetHex);
    put('#c7SlideO', `+${slideMB} MB`);
    put('#c7Delta', (r.pageDelta >= 0 ? '+' : '') + fmt(r.pageDelta, 0));
    put('#c7Off', r.pageOffHex);
    put('#c7Base', r.baseHex);
    put('#c7Rt', r.runtimeTargetHex);
    putHTML('#c7Say', t('ch7.say', {
      pc: r.pcHex, tgt: r.targetHex, delta: fmt(r.pageDelta, 0),
      off: r.pageOffHex, rt: r.runtimeTargetHex,
    }));
  }
  ['#c7Pc', '#c7Tgt', '#c7Slide'].forEach(sel => $(sel).addEventListener('input', updateCh7));
  hooks.push(updateCh7);

  /* Ch 8: std::string 24B layout */
  function updateCh8() {
    const txt = $('#c8Str').value;
    const r = M.stdStringLayout(txt);
    put('#c8Len', t('u.b', { v: r.len }));
    put('#c8Mode', t('ch8.mode.' + r.mode));
    put('#c8Flag', '0x' + r.flagByte);
    const strip = $('#c8Bytes');
    if (strip) {
      strip.innerHTML = r.slots.map((hex, i) => {
        let cls = 'gn';
        if (r.isHeap) cls = i < 8 ? 'cy' : (i < 16 ? 'vl' : 'rd');
        else cls = i === 23 ? 'hi' : (i < r.len ? 'gn' : '');
        return `<div class="byte-cell ${cls}">${hex}<small>[${i}]</small></div>`;
      }).join('');
    }
    putHTML('#c8Say', t('ch8.say.' + r.mode, { len: r.len, flag: r.flagByte }));
  }
  $('#c8Str').addEventListener('input', updateCh8);
  hooks.push(updateCh8);

  applyLang();
  requestAnimationFrame(loop);
})();
