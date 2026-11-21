'use strict';
// Dependency-free Node verification for W8 (how-chromium-renders-a-web-page).
// Tests all 9 models in models.js, every branch & edge case, zero undefined outputs,
// prose bindings (bindings.cjs), copy.zh.js / copy.en.js parity, Guardrails 1 & 2,
// unprefill(html, Z) CJK hygiene, inline SVG compliance, and REGISTRY.json uniqueness.
// Run: node computing/software/how-chromium-renders-a-web-page/tests/models.cjs
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const DIR = path.join(__dirname, '..');
const ROOT = path.join(DIR, '..', '..', '..');
const M = require(path.join(DIR, 'models.js'));
const B = require(path.join(DIR, 'bindings.cjs'))(M);
const { unprefill } = require(path.join(ROOT, 'scripts', 'lib', 'prefill.cjs'));

const load = l => {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(DIR, `copy.${l}.js`), 'utf8'), ctx);
  return ctx.window.ESSAY_COPY[l];
};
const Z = load('zh');
const E = load('en');
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');

let n = 0;
let fails = 0;
function check(name, got, want) {
  n++;
  if (got !== want) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want}`); }
}
function ok(name, cond, info) {
  n++;
  if (!cond) { fails++; console.error(`FAIL ${name}${info ? ': ' + info : ''}`); }
}
function near(name, got, want, tol) {
  n++;
  if (!(Math.abs(got - want) <= tol)) { fails++; console.error(`FAIL ${name}: got ${got}, expected ${want} ± ${tol}`); }
}
function noUndef(name, obj) {
  n++;
  const bad = Object.entries(obj).filter(([, v]) => v === undefined).map(([k]) => k);
  if (bad.length) { fails++; console.error(`FAIL ${name}: undefined keys ${bad.join(',')}`); }
}

/* ── 1. Display budgets & formatting ── */
{
  near('60 Hz budget = 1000/60', M.DISPLAY_BUDGETS[60], 16.6666667, 1e-5);
  near('120 Hz budget = 1000/120', M.DISPLAY_BUDGETS[120], 8.3333333, 1e-5);
  check('bytesStr KiB', M.bytesStr(256 * 1024), '256.0 KiB');
  check('bytesStr MiB', M.bytesStr(1024 * 1024), '1.00 MiB');
}

/* ── 2. ch2: HTML parsing, CSSOM & preload scanner ── */
{
  const dPre = M.simulateParseTimeline({ mode: 'blocking', cssMs: 30, jsMs: 70, preload: true });
  const dNo = M.simulateParseTimeline({ mode: 'blocking', cssMs: 30, jsMs: 70, preload: false });
  const dCss = M.simulateParseTimeline({ mode: 'blocking', cssMs: 90, jsMs: 40, preload: true });
  const dDef = M.simulateParseTimeline({ mode: 'defer', cssMs: 30, jsMs: 70, preload: true });
  const dAsyEarly = M.simulateParseTimeline({ mode: 'async', cssMs: 30, jsMs: 20, preload: true });
  const dAsyAfter = M.simulateParseTimeline({ mode: 'async', cssMs: 30, jsMs: 100, preload: true });

  [dPre, dNo, dCss, dDef, dAsyEarly, dAsyAfter].forEach((r, i) => noUndef('ch2 #' + i, r));
  check('ch2 blocking+preload DCL=84, saved=14', [dPre.domContentLoaded, dPre.preloadSavedMs, dPre.sayKey].join(), '84,14,blockingJsWait');
  check('ch2 no-preload DCL=98', [dNo.domContentLoaded, dNo.preloadSavedMs].join(), '98,0');
  check('ch2 CSSOM bottleneck branch', dCss.sayKey, 'blockingCssWait');
  check('ch2 defer branch & zero block', [dDef.parserBlockedMs, dDef.firstPaint, dDef.domContentLoaded, dDef.sayKey].join(), '0,32,72,deferReady');
  check('ch2 async early pauses only during exec', [dAsyEarly.parserBlockedMs, dAsyEarly.sayKey].join(), '8,asyncEarly');
  check('ch2 async after HTML causes 0 block', [dAsyAfter.parserBlockedMs, dAsyAfter.sayKey].join(), '0,asyncAfter');
}

/* ── 3. ch3: Selector matching, Bloom filter & InvalidationSet ── */
{
  const sSimp = M.simulateStyleCalc({ selectorKind: 'simpleClass', domNodes: 180, ruleCount: 250, smartEngine: true });
  const sDeep = M.simulateStyleCalc({ selectorKind: 'deepDesc', domNodes: 180, ruleCount: 250, smartEngine: true });
  const sUniv = M.simulateStyleCalc({ selectorKind: 'universalTail', domNodes: 180, ruleCount: 250, smartEngine: true });
  const sNaive = M.simulateStyleCalc({ selectorKind: 'deepDesc', domNodes: 180, ruleCount: 250, smartEngine: false });

  [sSimp, sDeep, sUniv, sNaive].forEach((r, i) => noUndef('ch3 #' + i, r));
  check('ch3 simpleClass: 0 ancestor walks', [sSimp.invalidatedNodes, sSimp.ancestorWalks, sSimp.sayKey].join(), '5,0,smartSimple');
  ok('ch3 deepDesc: Bloom rejects > 0', sDeep.bloomRejects > 0 && sDeep.sayKey === 'smartDeep');
  ok('ch3 universalTail blows up keyChecks & ancestorWalks vs deepDesc',
    sUniv.keyChecks > sDeep.keyChecks * 4 && sUniv.ancestorWalks > sDeep.ancestorWalks * 2 && sUniv.sayKey === 'smartUniversal');
  check('ch3 naive scans all 180 nodes', [sNaive.invalidatedNodes, sNaive.sayKey].join(), '180,naiveFull');
}

/* ── 4. ch4: LayoutNG vs Forced Synchronous Layout Thrashing ── */
{
  const t60 = M.simulateLayoutThrashing({ pattern: 'thrash', itemCount: 50, treeNodes: 300 });
  const t120 = M.simulateLayoutThrashing({ pattern: 'thrash', itemCount: 30, treeNodes: 300 });
  const tOk = M.simulateLayoutThrashing({ pattern: 'thrash', itemCount: 10, treeNodes: 100 });
  const bat = M.simulateLayoutThrashing({ pattern: 'batched', itemCount: 50, treeNodes: 300 });
  const con = M.simulateLayoutThrashing({ pattern: 'contained', itemCount: 50, treeNodes: 300 });

  [t60, t120, tOk, bat, con].forEach((r, i) => noUndef('ch4 #' + i, r));
  check('ch4 thrash 50×300 exceeds 60 Hz', [t60.forcedReflows, t60.layoutWorkMs, t60.sayKey].join(), '50,17.55,thrashOver60');
  check('ch4 thrash 30×300 exceeds 120 Hz only', [t120.layoutWorkMs, t120.sayKey].join(), '10.53,thrashOver120');
  check('ch4 thrash 10×100 fits', [tOk.layoutWorkMs, tOk.sayKey].join(), '1.17,thrashFits');
  check('ch4 batched: 0 forced reflows, 0.54 ms', [bat.forcedReflows, bat.endOfFrameLayouts, bat.layoutWorkMs, bat.sayKey].join(), '0,1,0.54,batchedClean');
  check('ch4 contained: 1.29 ms', [con.forcedReflows, con.layoutWorkMs, con.sayKey].join(), '50,1.29,containedFast');
}

/* ── 5. ch5: Property Trees ── */
{
  const pTf = M.evaluatePropertyTrees({ changeType: 'transform', tx: 60, scrollY: 40, opacity: 0.85, clipOn: true });
  const pSc = M.evaluatePropertyTrees({ changeType: 'scroll', tx: 0, scrollY: 40, opacity: 1, clipOn: true });
  const pEf = M.evaluatePropertyTrees({ changeType: 'opacity', tx: 0, scrollY: 0, opacity: 0.4, clipOn: true });
  const pLf = M.evaluatePropertyTrees({ changeType: 'left', tx: 60, scrollY: 40, opacity: 0.85, clipOn: true });
  const pOut = M.evaluatePropertyTrees({ changeType: 'transform', tx: -120, scrollY: 200, opacity: 1, clipOn: true });

  [pTf, pSc, pEf, pLf, pOut].forEach((r, i) => noUndef('ch5 #' + i, r));
  check('ch5 default screen pos & matrix', [pTf.screenX, pTf.screenY, pTf.visibleAreaPct, pTf.blinkStagesRerun, pTf.matrixStr, pTf.sayKey].join('|'), '130|20|81|0|matrix(1, 0, 0, 1, 60, -40)|transformFast');
  check('ch5 scroll branch', [pSc.dirtyTree, pSc.blinkStagesRerun, pSc.sayKey].join(), 'scroll,0,scrollFast');
  check('ch5 opacity branch', [pEf.dirtyTree, pEf.effectiveAlpha, pEf.sayKey].join(), 'effect,0.4,effectFast');
  check('ch5 left forces 5 Blink stages', [pLf.dirtyTree, pLf.blinkStagesRerun, pLf.sayKey].join(), 'layout,5,leftSlow');
  check('ch5 clipped completely out', [pOut.visibleAreaPct, pOut.sayKey].join(), '0,clippedOut');
}

/* ── 6. ch6: PaintArtifactCompositor & Layer Explosion ── */
{
  const lExp = M.simulateLayerization({ cardCount: 20, badgeMode: 'promotedBelow', overlap: true, cardSizePx: 280 });
  const lAbv = M.simulateLayerization({ cardCount: 20, badgeMode: 'promotedAbove', overlap: true, cardSizePx: 280 });
  const lNoOv = M.simulateLayerization({ cardCount: 20, badgeMode: 'promotedBelow', overlap: false, cardSizePx: 280 });
  const lStat = M.simulateLayerization({ cardCount: 20, badgeMode: 'static', overlap: true, cardSizePx: 280 });

  [lExp, lAbv, lNoOv, lStat].forEach((r, i) => noUndef('ch6 #' + i, r));
  check('ch6 exploded: 22 layers, 8.43 MiB', [lExp.compositedLayers, lExp.vramMiB, lExp.sayKey].join(), '22,8.43,exploded');
  check('ch6 promotedAbove: 2 layers, 2.44 MiB', [lAbv.compositedLayers, lAbv.vramMiB, lAbv.sayKey].join(), '2,2.44,aboveSafe');
  check('ch6 non-overlapping: 2 layers', [lNoOv.compositedLayers, lNoOv.sayKey].join(), '2,noOverlapSafe');
  check('ch6 static: 1 root layer', [lStat.compositedLayers, lStat.sayKey].join(), '1,allMerged');
}

/* ── 7. ch7: TileManager & Checkerboarding ── */
{
  const tIdle = M.simulateTileRaster({ scrollSpeed: 0, tileSize: 256, oopRaster: false, skewportRows: 0 });
  const tCb = M.simulateTileRaster({ scrollSpeed: 3600, tileSize: 256, oopRaster: false, skewportRows: 0 });
  const tSkew = M.simulateTileRaster({ scrollSpeed: 3600, tileSize: 256, oopRaster: false, skewportRows: 2 });
  const tGpu = M.simulateTileRaster({ scrollSpeed: 3600, tileSize: 256, oopRaster: true, skewportRows: 0 });

  [tIdle, tCb, tSkew, tGpu].forEach((r, i) => noUndef('ch7 #' + i, r));
  check('ch7 idle clean', [tIdle.checkerboardTiles, tIdle.sayKey].join(), '0,idleClean');
  ok('ch7 fast CPU scroll without skewport shows checkerboards in grid & pct',
    tCb.checkerboardTiles > 0 && tCb.checkerboardPct > 0 && tCb.sayKey === 'checkerboard' &&
    tCb.grid.flat().filter(x => x === 'checker').length === tCb.checkerboardTiles);
  check('ch7 skewport=2 eliminates checkerboard', [tSkew.checkerboardTiles, tSkew.sayKey].join(), '0,skewportClean');
  check('ch7 OOP-R GPU eliminates checkerboard', [tGpu.checkerboardTiles, tGpu.sayKey].join(), '0,ooprClean');
}

/* ── 8. ch8: Viz SurfaceAggregator ── */
{
  const vOk = M.simulateVizFrame({ displayHz: 60, mainThreadMs: 8, rasterMs: 2, oopifCount: 2 });
  const vSplit = M.simulateVizFrame({ displayHz: 120, mainThreadMs: 14, rasterMs: 3, oopifCount: 2 });

  [vOk, vSplit].forEach((r, i) => noUndef('ch8 #' + i, r));
  check('ch8 60 Hz locked', [vOk.mainFps, vOk.implFps, vOk.sayKey].join(), '60,60,allLocked');
  check('ch8 120 Hz decoupled: main 40 fps, impl 120 fps, 38 quads',
    [vSplit.mainFps, vSplit.implFps, vSplit.mergedQuads, vSplit.sayKey].join(), '40,120,38,mainBehindImplLocked');
}

/* ── 9. ch9: Animation Isolation ── */
{
  const aTf = M.simulateAnimationIsolation({ propMode: 'transform', jsSpikeMs: 50, domBoxes: 250, displayHz: 120 });
  const aBs = M.simulateAnimationIsolation({ propMode: 'boxShadow', jsSpikeMs: 50, domBoxes: 250, displayHz: 120 });
  const aLf = M.simulateAnimationIsolation({ propMode: 'left', jsSpikeMs: 50, domBoxes: 250, displayHz: 120 });
  const aCl = M.simulateAnimationIsolation({ propMode: 'left', jsSpikeMs: 0, domBoxes: 50, displayHz: 60 });

  [aTf, aBs, aLf, aCl].forEach((r, i) => noUndef('ch9 #' + i, r));
  check('ch9 transform immune: 0 dropped frames, 120 fps', [aTf.stagesExecuted, aTf.droppedFrames, aTf.effectiveFps, aTf.sayKey].join(), '1,0,120,compositorImmune');
  check('ch9 boxShadow stalled', [aBs.stagesExecuted, aBs.droppedFrames > 0, aBs.sayKey].join(), '3,true,paintStalled');
  check('ch9 left stalled', [aLf.stagesExecuted, aLf.droppedFrames > aBs.droppedFrames, aLf.sayKey].join(), '5,true,layoutStalled');
  check('ch9 cleanMain at 60 Hz + light DOM + 0 spike', [aCl.droppedFrames, aCl.sayKey].join(), '0,cleanMain');
}

/* ── 10. ch10: Frontier (Skia Graphite & Speculation Rules) ── */
{
  const f1 = M.simulateFrontierPipeline({ backend: 'graphite', drawCmds: 600, workers: 3, prerender: true });
  const f2 = M.simulateFrontierPipeline({ backend: 'graphite', drawCmds: 600, workers: 3, prerender: false });
  const f3 = M.simulateFrontierPipeline({ backend: 'ganesh', drawCmds: 600, workers: 3, prerender: true });
  const f4 = M.simulateFrontierPipeline({ backend: 'ganesh', drawCmds: 600, workers: 3, prerender: false });

  [f1, f2, f3, f4].forEach((r, i) => noUndef('ch10 #' + i, r));
  check('ch10 all 4 sayKeys', [f1.sayKey, f2.sayKey, f3.sayKey, f4.sayKey].join(), 'graphitePrerender,graphiteCold,ganeshPrerender,ganeshCold');
  ok('ch10 Graphite 3 workers faster & lower overdraw than Ganesh', f1.cpuRecordMs < f4.cpuRecordMs && f1.overdrawPct < f4.overdrawPct);
}

/* ── 11. Prose bindings ({=...}) ── */
{
  const want = {
    'budget.60': '16.67', 'budget.120': '8.33',
    'ch2.blockDcl': '84', 'ch2.noPreDcl': '98', 'ch2.saved': '14', 'ch2.deferFp': '32', 'ch2.deferDcl': '72',
    'ch3.inv': '5', 'ch3.deepChecks': '125', 'ch3.bloomRej': '25', 'ch3.univChecks': '950', 'ch3.univWalks': '2,275', 'ch3.naiveNodes': '180', 'ch3.naiveChecks': '45,000',
    'ch4.thrashMs': '17.55', 'ch4.thrash60': '105.3', 'ch4.batchMs': '0.54', 'ch4.contMs': '1.29', 'ch4.ratio': '32.5',
    'ch5.sx': '130', 'ch5.sy': '20', 'ch5.visPct': '81',
    'ch6.expLayers': '22', 'ch6.expVram': '8.43', 'ch6.safeLayers': '2', 'ch6.safeVram': '2.44', 'ch6.bigVram': '35.87',
    'ch7.tile256KiB': '256', 'ch7.tile512MiB': '1.00', 'ch7.cpuCb': '12.5', 'ch7.skewCb': '0.0', 'ch7.gpuCb': '0.0',
    'ch8.mainFps': '40', 'ch8.implFps': '120', 'ch8.quads': '38', 'ch8.implMs': '2.00',
    'ch9.tfDrop': '0', 'ch9.bsDrop': '12', 'ch9.lfDrop': '102', 'ch9.lfMax': '60.5', 'ch9.lfFps': '56.3',
    'ch10.grCpu': '2.20', 'ch10.gnCpu': '8.40', 'ch10.grNav': '12.8', 'ch10.gnNav': '103.4', 'ch10.overRej': '34'
  };
  check('binding keys match', Object.keys(B).sort().join(), Object.keys(want).sort().join());
  for (const k of Object.keys(want)) check('binding ' + k, B[k], want[k]);
}

/* ── 12. Copy keys, parity, Guardrails 1 & 2, language hygiene & SVGs ── */
{
  const keys = [...app.matchAll(/\bt\('([\w.]+)'/g)].map(m => m[1]).filter(k => !k.endsWith('.'));
  check('every literal app.js key exists', [...new Set(keys)].filter(k => Z[k] == null).join(), '');

  const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'page.json'), 'utf8'));
  const dyn = Object.entries(PJ.dynamicKeys).flatMap(([p, vs]) => vs.map(v => p + '.' + v));
  check('all dynamicKeys exist in zh', dyn.filter(k => Z[k] == null).join(), '');
  check('all dynamicKeys exist in en', dyn.filter(k => E[k] == null).join(), '');
  check('zh and en have identical keys', Object.keys(Z).sort().join(), Object.keys(E).sort().join());

  const ph = s => (String(s).match(/\{[a-zA-Z_]\w*\}/g) || []).sort().join();
  check('runtime placeholders match in zh and en', Object.keys(Z).filter(k => ph(Z[k]) !== ph(E[k])).join(), '');
  check('no en stub flag', [String((PJ.languages || {}).en), /data-lang-en="stub"/.test(html)].join(), 'undefined,false');
  check('no CJK in copy.en.js', Object.keys(E).filter(k => /[㐀-鿿]/.test(E[k])).join(), '');
  check('status is live in page.json', String(PJ.status), 'live');

  // Guardrail 1: no raw <script>, <link>, <iframe>, <div> tags inside copy HTML strings
  const rawHtmlTag = /<(?:script|link|iframe|div|span)\b/i;
  for (const [lName, tbl] of [['zh', Z], ['en', E]]) {
    const badTags = Object.entries(tbl).filter(([k, v]) => !k.startsWith('dg.') && k !== 'ch1.code' && rawHtmlTag.test(v)).map(([k]) => k);
    check(`Guardrail 1 (${lName}): no unescaped HTML tag names in prose`, badTags.join(), '');
  }

  // Guardrail 2: no &lt;/&gt;/&amp; inside textContent keys (dg.*, ch1.code, h3, ctl.*, read.*)
  const textOnly = k => k.startsWith('dg.') && !k.endsWith('.cap') || k === 'ch1.code' || /\.(title|ctl|read)\./.test(k);
  for (const [lName, tbl] of [['zh', Z], ['en', E]]) {
    const badEsc = Object.entries(tbl).filter(([k, v]) => textOnly(k) && /&(lt|gt|amp);/.test(v)).map(([k]) => k);
    check(`Guardrail 2 (${lName}): no HTML entities in textContent keys`, badEsc.join(), '');
  }

  const h = unprefill(html, Z)
    .replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '')
    .replace(/<div[^>]*id="langToggle"[\s\S]*?<\/div>/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta[^>]*>/g, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const cjk = h.match(/[^\n]{0,30}[㐀-鿿][^\n]{0,30}/g) || [];
  check('no Chinese in index.html outside pre-filled copy', cjk.slice(0, 3).join(' | '), '');

  const figs = fs.readdirSync(path.join(DIR, 'figures'));
  for (const f of figs) {
    const s = fs.readFileSync(path.join(DIR, 'figures', f), 'utf8');
    ok(`figures/${f} has no Chinese`, !/[㐀-鿿]/.test(s));
  }
  const dgFiles = figs.filter(f => f.startsWith('dg-'));
  check('eight SVG diagrams', dgFiles.length, 8);
  const dgSrc = dgFiles.map(f => fs.readFileSync(path.join(DIR, 'figures', f), 'utf8')).join('');
  const rawTxt = [...dgSrc.matchAll(/<text [^>]*>([^<]+)<\/text>/g)].map(m => m[1]);
  ok('SVG literal text only neutral tokens (256×256)', rawTxt.every(s => /^([0-9×²]+|GPU)$/.test(s)), rawTxt.join('|'));
  ok('every SVG <text> has x, y, font-size >= 14 and no transform',
    [...dgSrc.matchAll(/<text ([^>]*)>/g)].every(m =>
      /\bx="/.test(m[1]) && /\by="/.test(m[1]) && +(m[1].match(/font-size="([\d.]+)"/) || [0, 0])[1] >= 14 && !/transform=/.test(m[1])
    ));
}

/* ── 13. REGISTRY.json parity, live slugs & collision audit ── */
{
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry zh title = hero', R.title.zh, Z['hero.title']);
  check('registry en title = hero', R.title.en, E['hero.title']);
  check('registry zh desc = doc.desc', R.desc.zh, Z['doc.desc']);
  check('registry en desc = doc.desc', R.desc.en, E['doc.desc']);
  check('registry path', [R.category, R.subtopic, R.path].join(), 'computing,software,computing/software/how-chromium-renders-a-web-page/');
  ok('10-14 concepts and every id starts with chromium-',
    R.concepts.length >= 10 && R.concepts.length <= 14 && R.concepts.every(c => c.id.startsWith('chromium-')));
  for (const c of R.concepts) ok(`concept ${c.id} anchor ${c.anchor} exists`, html.includes(`id="${c.anchor.slice(1)}"`));

  // Verify relatedPages contains ONLY live slugs
  const pCtx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'pages.config.js'), 'utf8'), pCtx);
  const liveSlugs = new Set(pCtx.window.KNOWLEDGE_PAGES.filter(p => p.status === 'live').map(p => p.slug));
  for (const c of R.concepts) {
    for (const rel of (c.relatedPages || [])) ok(`relatedPages ${rel} is live`, liveSlugs.has(rel));
  }

  // Collision check against search index and sibling software REGISTRY.json files
  const sq = s => String(s).normalize('NFKC').toLowerCase().replace(/[\s\-‐-―_·・'’]/gu, '');
  const mine = R.concepts.flatMap(c => [...new Set([...c.aliases.zh, ...c.aliases.en].map(sq))]);
  check('no duplicate alias inside this REGISTRY.json', mine.filter((a, i) => mine.indexOf(a) !== i).join(), '');

  const taken = new Set();
  const mCtx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'search/manifest.js'), 'utf8'), mCtx);
  for (const ref of mCtx.window.KNOWLEDGE_CONCEPTS.chunks) {
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, ref.split('?')[0]), 'utf8'), mCtx);
  }
  for (const r of mCtx.window.KNOWLEDGE_CONCEPTS.concepts) {
    if (String(r[0] || '').startsWith('chromium-')) continue;
    for (const a of [...r[5], ...r[6]]) taken.add(sq(a));
  }
  for (const d of fs.readdirSync(path.join(ROOT, 'computing/software'))) {
    if (d === 'how-chromium-renders-a-web-page') continue;
    const rp = path.join(ROOT, 'computing/software', d, 'REGISTRY.json');
    if (!fs.existsSync(rp)) continue;
    const SR = JSON.parse(fs.readFileSync(rp, 'utf8'));
    for (const c of (SR.concepts || [])) {
      for (const a of [...(c.aliases?.zh || []), ...(c.aliases?.en || [])]) taken.add(sq(a));
    }
  }
  check('zero alias collisions across repo', mine.filter(a => taken.has(a)).join(), '');
}

console.log(`${n - fails}/${n} checks passed`);
if (fails) process.exit(1);
