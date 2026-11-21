(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ChromiumRenderModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DISPLAY_BUDGETS = {
    60: 1000 / 60,
    120: 1000 / 120
  };

  // Pin target for host Playwright Chromium milestone (confirmed by tools/crosscheck.cjs)
  const PINNED_BUILD = {
    browser: 'Chromium',
    architecture: 'RenderingNG (Blink + cc + Viz)',
    milestone: '151.0.7922.34'
  };

  const r1 = x => Math.round(x * 10) / 10;
  const r2 = x => Math.round(x * 100) / 100;
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  function fmt(x, d, locale) {
    if (!isFinite(x)) return '∞';
    const dec = d == null ? 0 : d;
    const n = Number(x);
    const fixed = n.toFixed(dec);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function bytesStr(bytes) {
    const b = Math.max(0, Number(bytes));
    if (b >= 1024 * 1024) return fmt(b / (1024 * 1024), 2) + ' MiB';
    if (b >= 1024) return fmt(b / 1024, 1) + ' KiB';
    return fmt(b, 0) + ' B';
  }

  /* ── ch2: HTML byte stream, CSSOM, parser-blocking scripts & preload scanner ── */
  function simulateParseTimeline(opts) {
    const o = opts || {};
    const mode = ['blocking', 'defer', 'async', 'module'].includes(o.mode) ? o.mode : 'blocking';
    const cssMs = clamp(Number(o.cssMs != null ? o.cssMs : 50), 10, 140);
    const jsMs = clamp(Number(o.jsMs != null ? o.jsMs : 40), 10, 140);
    const preload = o.preload !== undefined ? Boolean(o.preload) : true;

    function runOne(usePreload) {
      const headChunk1End = 2; // encounters <link rel="stylesheet">
      const headChunk2End = 16; // inline head work before reaching <script> at t = 16 ms
      const bodyParseMs = 12;

      const cssStart = headChunk1End;
      const cssEnd = cssStart + cssMs;

      const jsFetchMs = r1(jsMs * 0.6);
      const jsExecMs = r1(jsMs * 0.4);
      const jsFetchStart = usePreload ? headChunk1End : headChunk2End;
      const jsFetchEnd = jsFetchStart + jsFetchMs;

      let jsExecStart, jsExecEnd, htmlEnd, domContentLoaded, firstPaint, parserBlockedMs;
      const tracks = {
        html: [{ x0: 0, x1: headChunk2End, kind: 'parse' }],
        css: [{ x0: cssStart, x1: cssEnd, kind: 'css' }],
        jsFetch: [{ x0: jsFetchStart, x1: jsFetchEnd, kind: usePreload ? 'preload' : 'fetch' }],
        jsExec: []
      };

      if (mode === 'blocking') {
        jsExecStart = Math.max(headChunk2End, jsFetchEnd, cssEnd);
        jsExecEnd = jsExecStart + jsExecMs;
        parserBlockedMs = r1(jsExecEnd - headChunk2End);
        tracks.html.push({ x0: headChunk2End, x1: jsExecEnd, kind: 'blocked' });
        tracks.html.push({ x0: jsExecEnd, x1: jsExecEnd + bodyParseMs, kind: 'parse' });
        tracks.jsExec.push({ x0: jsExecStart, x1: jsExecEnd, kind: 'exec' });
        htmlEnd = r1(jsExecEnd + bodyParseMs);
        domContentLoaded = htmlEnd;
        firstPaint = r1(Math.max(htmlEnd, cssEnd));
      } else if (mode === 'defer' || mode === 'module') {
        htmlEnd = headChunk2End + bodyParseMs;
        tracks.html.push({ x0: headChunk2End, x1: htmlEnd, kind: 'parse' });
        jsExecStart = Math.max(htmlEnd, jsFetchEnd, cssEnd);
        jsExecEnd = jsExecStart + jsExecMs;
        tracks.jsExec.push({ x0: jsExecStart, x1: jsExecEnd, kind: 'exec' });
        parserBlockedMs = 0;
        domContentLoaded = r1(jsExecEnd);
        firstPaint = r1(Math.max(htmlEnd, cssEnd));
      } else {
        // async: pauses HTML parser only while executing if fetch finishes before HTML body finishes
        const rawBodyEnd = headChunk2End + bodyParseMs;
        if (jsFetchEnd < rawBodyEnd) {
          jsExecStart = jsFetchEnd;
          jsExecEnd = jsExecStart + jsExecMs;
          const preBody = Math.max(0, jsExecStart - headChunk2End);
          const remBody = Math.max(0, bodyParseMs - preBody);
          if (preBody > 0) tracks.html.push({ x0: headChunk2End, x1: jsExecStart, kind: 'parse' });
          tracks.html.push({ x0: jsExecStart, x1: jsExecEnd, kind: 'blocked' });
          if (remBody > 0) tracks.html.push({ x0: jsExecEnd, x1: jsExecEnd + remBody, kind: 'parse' });
          htmlEnd = r1(jsExecEnd + remBody);
          parserBlockedMs = jsExecMs;
        } else {
          tracks.html.push({ x0: headChunk2End, x1: rawBodyEnd, kind: 'parse' });
          jsExecStart = jsFetchEnd;
          jsExecEnd = jsExecStart + jsExecMs;
          htmlEnd = rawBodyEnd;
          parserBlockedMs = 0;
        }
        tracks.jsExec.push({ x0: jsExecStart, x1: jsExecEnd, kind: 'exec' });
        domContentLoaded = htmlEnd;
        firstPaint = r1(Math.max(htmlEnd, cssEnd));
      }

      return {
        cssStart, cssEnd,
        jsFetchStart, jsFetchMs, jsFetchEnd,
        jsExecStart: r1(jsExecStart), jsExecMs, jsExecEnd: r1(jsExecEnd),
        htmlEnd, domContentLoaded, firstPaint, parserBlockedMs,
        tracks
      };
    }

    const cur = runOne(preload);
    const noPre = runOne(false);
    const preloadSavedMs = preload ? r1(Math.max(0, noPre.domContentLoaded - cur.domContentLoaded)) : 0;

    let sayKey;
    if (mode === 'blocking') {
      sayKey = cur.cssEnd > cur.jsFetchEnd ? 'blockingCssWait' : 'blockingJsWait';
    } else if (mode === 'defer' || mode === 'module') {
      sayKey = 'deferReady';
    } else {
      sayKey = cur.parserBlockedMs > 0 ? 'asyncEarly' : 'asyncAfter';
    }

    return {
      mode, cssMs, jsMs, preload,
      cssStart: cur.cssStart, cssEnd: cur.cssEnd,
      jsFetchStart: cur.jsFetchStart, jsFetchMs: cur.jsFetchMs, jsFetchEnd: cur.jsFetchEnd,
      jsExecStart: cur.jsExecStart, jsExecMs: cur.jsExecMs, jsExecEnd: cur.jsExecEnd,
      htmlEnd: cur.htmlEnd,
      domContentLoaded: cur.domContentLoaded,
      firstPaint: cur.firstPaint,
      parserBlockedMs: cur.parserBlockedMs,
      preloadSavedMs,
      tracks: cur.tracks,
      sayKey
    };
  }

  /* ── ch3: Blink SelectorChecker (right-to-left + Bloom filter + InvalidationSet) ── */
  function fnv1aHash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function simulateStyleCalc(opts) {
    const o = opts || {};
    const selectorKind = ['simpleClass', 'deepDesc', 'universalTail'].includes(o.selectorKind) ? o.selectorKind : 'deepDesc';
    const domNodes = clamp(Math.round(Number(o.domNodes != null ? o.domNodes : 180)), 40, 400);
    const ruleCount = clamp(Math.round(Number(o.ruleCount != null ? o.ruleCount : 250)), 50, 500);
    const smartEngine = o.smartEngine !== undefined ? Boolean(o.smartEngine) : true;

    // Build deterministic synthetic DOM tree:
    // 0: body, 1: div.app, 2: main, 3..: sections -> cards -> leaves (a.btn / span.txt / em.tag)
    const nodes = [];
    const makeNode = (id, parent, tag, cls) => ({ id, parent, tag, cls, bloom: 0, dirty: false, matched: false });
    nodes.push(makeNode(0, -1, 'body', 'root'));
    nodes.push(makeNode(1, 0, 'div', 'app'));
    nodes.push(makeNode(2, 1, 'main', 'shell'));
    const secCount = 3;
    for (let s = 0; s < secCount && nodes.length < domNodes; s++) {
      nodes.push(makeNode(nodes.length, 2, 'section', s === 0 ? 'nav' : 'feed'));
    }
    // Distribute remaining nodes as ul.list -> li.card -> leaves across the sections
    let nextParent = 3;
    const cardSize = 5; // 1 li.card + 4 children
    while (nodes.length < domNodes) {
      const secId = 3 + (nextParent % secCount);
      nextParent++;
      const cardIdx = nodes.length;
      nodes.push(makeNode(cardIdx, secId, 'li', cardIdx === 6 ? 'card is-open' : 'card'));
      const leaves = [
        ['a', 'btn'],
        ['span', 'txt'],
        ['em', 'tag'],
        ['span', 'meta']
      ];
      for (let k = 0; k < leaves.length && nodes.length < domNodes; k++) {
        nodes.push(makeNode(nodes.length, cardIdx, leaves[k][0], leaves[k][1]));
      }
    }

    // Populate 12-bit ancestor Bloom filter (4096 bits across 128 32-bit words or 1 24-bit bitmask per node)
    const BITMASK_MOD = 24;
    const ancMaskOf = n => {
      let m = 0;
      const addTok = tok => {
        const h1 = fnv1aHash(tok) % BITMASK_MOD;
        const h2 = (fnv1aHash(tok) >>> 8) % BITMASK_MOD;
        m |= (1 << h1) | (1 << h2);
      };
      addTok(n.tag);
      for (const c of n.cls.split(' ')) if (c) addTok('.' + c);
      return m;
    };
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i].parent;
      nodes[i].bloom = p >= 0 ? (nodes[p].bloom | ancMaskOf(nodes[p])) : 0;
    }

    // Build synthetic rules according to selectorKind
    // ~15% of rules target the focal class/pattern, rest are distinct component rules
    const rules = [];
    for (let r = 0; r < ruleCount; r++) {
      const slot = r % 10;
      if (selectorKind === 'simpleClass') {
        if (slot < 2) rules.push({ keyCls: 'btn', keyTag: null, anc: [], universal: false });
        else if (slot < 5) rules.push({ keyCls: 'txt', keyTag: 'span', anc: [], universal: false });
        else rules.push({ keyCls: 'unused' + (r % 17), keyTag: 'p', anc: [], universal: false });
      } else if (selectorKind === 'deepDesc') {
        if (slot === 0) rules.push({ keyCls: 'btn', keyTag: 'a', anc: ['body', '.app', 'main', '.nav', '.card'], universal: false });
        else if (slot === 1) rules.push({ keyCls: 'btn', keyTag: 'a', anc: ['body', '.app', 'main', '.sidebar', '.promo'], universal: false });
        else if (slot < 5) rules.push({ keyCls: 'txt', keyTag: 'span', anc: ['body', '.app', '.card'], universal: false });
        else rules.push({ keyCls: 'unused' + (r % 17), keyTag: 'div', anc: ['.app', '.footer'], universal: false });
      } else {
        // universalTail: `.card *` or `.panel-* *` falls into Blink's universal bucket!
        if (slot < 4) rules.push({ keyCls: null, keyTag: '*', anc: ['.card'], universal: true });
        else if (slot < 7) rules.push({ keyCls: null, keyTag: '*', anc: ['.modal-missing'], universal: true });
        else rules.push({ keyCls: 'txt', keyTag: 'span', anc: ['.card'], universal: false });
      }
    }

    // Toggling `.is-open` on card #6 (with subtree children 7..10)
    const targetCardId = 6;
    if (smartEngine) {
      // InvalidationSet marks only the card and its subtree (plus universal affected subtree)
      for (let i = 0; i < nodes.length; i++) {
        if (i === targetCardId || nodes[i].parent === targetCardId) nodes[i].dirty = true;
      }
    } else {
      // Naive engine invalidates the entire document tree
      for (let i = 0; i < nodes.length; i++) nodes[i].dirty = true;
    }

    let invalidatedNodes = 0;
    let keyChecks = 0;
    let bloomRejects = 0;
    let ancestorWalks = 0;
    let matchedRules = 0;

    // Precompute RuleHash buckets by key tag/class when smartEngine is enabled
    const byClass = new Map();
    const universalRules = [];
    for (const r of rules) {
      if (r.universal) universalRules.push(r);
      else {
        const k = r.keyCls || ('tag:' + r.keyTag);
        if (!byClass.has(k)) byClass.set(k, []);
        byClass.get(k).push(r);
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node.dirty) continue;
      invalidatedNodes++;
      const nodeClasses = node.cls.split(' ');
      let candRules;
      if (smartEngine) {
        candRules = [...universalRules];
        for (const c of nodeClasses) if (byClass.has(c)) candRules.push(...byClass.get(c));
      } else {
        candRules = rules;
      }

      for (let j = 0; j < candRules.length; j++) {
        const rule = candRules[j];
        keyChecks++;
        if (!rule.universal) {
          if (rule.keyTag && rule.keyTag !== node.tag) continue;
          if (rule.keyCls && !nodeClasses.includes(rule.keyCls)) continue;
        }
        // Key selector matched; check ancestors
        if (rule.anc.length > 0) {
          if (smartEngine) {
            let bloomPass = true;
            for (let a = 0; a < rule.anc.length; a++) {
              const tok = rule.anc[a];
              const h1 = fnv1aHash(tok) % BITMASK_MOD;
              const h2 = (fnv1aHash(tok) >>> 8) % BITMASK_MOD;
              if ((node.bloom & ((1 << h1) | (1 << h2))) !== ((1 << h1) | (1 << h2))) {
                bloomPass = false;
                break;
              }
            }
            if (!bloomPass) {
              bloomRejects++;
              continue;
            }
          }
          // Walk ancestors right-to-left
          let ai = rule.anc.length - 1;
          let cur = node.parent;
          while (cur >= 0 && ai >= 0) {
            ancestorWalks++;
            const ancNode = nodes[cur];
            const need = rule.anc[ai];
            const hit = need[0] === '.' ? ancNode.cls.split(' ').includes(need.slice(1)) : ancNode.tag === need;
            if (hit) ai--;
            cur = ancNode.parent;
          }
          if (ai < 0) {
            matchedRules++;
            node.matched = true;
          }
        } else {
          matchedRules++;
          node.matched = true;
        }
      }
    }

    const estMs = r2(invalidatedNodes * 0.002 + keyChecks * 0.00018 + ancestorWalks * 0.00045);
    let sayKey;
    if (!smartEngine) sayKey = 'naiveFull';
    else if (selectorKind === 'simpleClass') sayKey = 'smartSimple';
    else if (selectorKind === 'deepDesc') sayKey = 'smartDeep';
    else sayKey = 'smartUniversal';

    return {
      selectorKind, domNodes, ruleCount, smartEngine,
      invalidatedNodes, keyChecks, bloomRejects, ancestorWalks, matchedRules, estMs,
      sampleNodes: nodes.slice(0, 18),
      sayKey
    };
  }

  /* ── ch4: LayoutNG immutable fragments & Forced Synchronous Layout Thrashing ── */
  function simulateLayoutThrashing(opts) {
    const o = opts || {};
    const pattern = ['thrash', 'batched', 'contained'].includes(o.pattern) ? o.pattern : 'thrash';
    const itemCount = clamp(Math.round(Number(o.itemCount != null ? o.itemCount : 50)), 10, 120);
    const treeNodes = clamp(Math.round(Number(o.treeNodes != null ? o.treeNodes : 300)), 100, 800);

    const NODE_LAYOUT_US = 1.8; // parameterized single-node LayoutNG work
    const BLINK_WALK_MS = 0.015; // per-reflow C++ style/layout boundary check overhead

    let forcedReflows, endOfFrameLayouts, nodesPerReflow, layoutWorkMs;
    const spans = [];

    if (pattern === 'thrash') {
      forcedReflows = itemCount;
      endOfFrameLayouts = 0;
      // Uncontained sibling/ancestor chain: ~35% clean subtrees cached by LayoutNG, 65% recomputed each read
      nodesPerReflow = Math.round(treeNodes * 0.65);
      const singleReflowMs = nodesPerReflow * NODE_LAYOUT_US / 1000;
      layoutWorkMs = r2(forcedReflows * singleReflowMs);
      let cursor = 0;
      const jsStepMs = 0.04;
      for (let i = 0; i < itemCount; i++) {
        spans.push({ t0: cursor, t1: cursor + jsStepMs, kind: 'js' });
        cursor += jsStepMs;
        spans.push({ t0: cursor, t1: cursor + singleReflowMs, kind: 'reflow' });
        cursor += singleReflowMs;
      }
    } else if (pattern === 'batched') {
      forcedReflows = 0;
      endOfFrameLayouts = 1;
      nodesPerReflow = treeNodes;
      layoutWorkMs = r2(treeNodes * NODE_LAYOUT_US / 1000);
      const jsTotalMs = itemCount * 0.04;
      spans.push({ t0: 0, t1: jsTotalMs, kind: 'js' });
      spans.push({ t0: jsTotalMs, t1: jsTotalMs + layoutWorkMs, kind: 'layout' });
    } else {
      // contained: CSS `contain: layout` isolates each card so forced reflow only recomputes 1 card subtree
      forcedReflows = itemCount;
      endOfFrameLayouts = 0;
      nodesPerReflow = Math.max(4, Math.round(treeNodes / itemCount));
      const singleReflowMs = nodesPerReflow * NODE_LAYOUT_US / 1000 + BLINK_WALK_MS;
      layoutWorkMs = r2(forcedReflows * singleReflowMs);
      let cursor = 0;
      const jsStepMs = 0.04;
      for (let i = 0; i < itemCount; i++) {
        spans.push({ t0: cursor, t1: cursor + jsStepMs, kind: 'js' });
        cursor += jsStepMs;
        spans.push({ t0: cursor, t1: cursor + singleReflowMs, kind: 'contained' });
        cursor += singleReflowMs;
      }
    }

    const budget60Pct = r1((layoutWorkMs / DISPLAY_BUDGETS[60]) * 100);
    const budget120Pct = r1((layoutWorkMs / DISPLAY_BUDGETS[120]) * 100);

    let sayKey;
    if (pattern === 'batched') sayKey = 'batchedClean';
    else if (pattern === 'contained') sayKey = 'containedFast';
    else if (layoutWorkMs > DISPLAY_BUDGETS[60]) sayKey = 'thrashOver60';
    else if (layoutWorkMs > DISPLAY_BUDGETS[120]) sayKey = 'thrashOver120';
    else sayKey = 'thrashFits';

    return {
      pattern, itemCount, treeNodes,
      forcedReflows, endOfFrameLayouts, nodesPerReflow,
      layoutWorkMs, budget60Pct, budget120Pct,
      spans,
      sayKey
    };
  }

  /* ── ch5: Pre-Paint & 4 RenderingNG Property Trees ── */
  function evaluatePropertyTrees(opts) {
    const o = opts || {};
    const changeType = ['transform', 'scroll', 'opacity', 'left'].includes(o.changeType) ? o.changeType : 'transform';
    const tx = clamp(Math.round(Number(o.tx != null ? o.tx : 60)), -120, 160);
    const scrollY = clamp(Math.round(Number(o.scrollY != null ? o.scrollY : 40)), 0, 200);
    const opacity = r2(clamp(Number(o.opacity != null ? o.opacity : 0.85), 0, 1));
    const clipOn = o.clipOn !== undefined ? Boolean(o.clipOn) : true;

    const baseBox = { x: 70, y: 60, w: 110, h: 64 };
    const clipRect = { x: 36, y: 32, w: 248, h: 148 };

    // Transform & Scroll matrix composition in viewport coordinates:
    // M_total = T_scroll * T_element = [1, 0, 0, 1, tx, -scrollY]
    const screenX = baseBox.x + tx;
    const screenY = baseBox.y - scrollY;
    const boxRect = { x: screenX, y: screenY, w: baseBox.w, h: baseBox.h };

    let clippedRect;
    if (clipOn) {
      const ix0 = Math.max(boxRect.x, clipRect.x);
      const iy0 = Math.max(boxRect.y, clipRect.y);
      const ix1 = Math.min(boxRect.x + boxRect.w, clipRect.x + clipRect.w);
      const iy1 = Math.min(boxRect.y + boxRect.h, clipRect.y + clipRect.h);
      const iw = Math.max(0, ix1 - ix0);
      const ih = Math.max(0, iy1 - iy0);
      clippedRect = { x: ix0, y: iy0, w: iw, h: ih };
    } else {
      clippedRect = { x: boxRect.x, y: boxRect.y, w: boxRect.w, h: boxRect.h };
    }

    const totalArea = baseBox.w * baseBox.h;
    const visibleAreaPct = Math.round((clippedRect.w * clippedRect.h / totalArea) * 100);
    const effectiveAlpha = r2(1.0 * opacity);

    const dirtyTree = changeType === 'opacity' ? 'effect' : (changeType === 'left' ? 'layout' : changeType);
    const blinkStagesRerun = changeType === 'left' ? 5 : 0;
    const matrixStr = `matrix(1, 0, 0, 1, ${tx}, ${-scrollY})`;

    let sayKey;
    if (visibleAreaPct === 0) sayKey = 'clippedOut';
    else if (changeType === 'left') sayKey = 'leftSlow';
    else if (changeType === 'scroll') sayKey = 'scrollFast';
    else if (changeType === 'opacity') sayKey = 'effectFast';
    else sayKey = 'transformFast';

    return {
      changeType, tx, scrollY, opacity, clipOn,
      baseBox, clipRect, boxRect, clippedRect,
      screenX, screenY, effectiveAlpha, visibleAreaPct,
      dirtyTree, blinkStagesRerun, matrixStr,
      sayKey
    };
  }

  /* ── ch6: PaintArtifactCompositor Layerization & Layer Explosion ── */
  function simulateLayerization(opts) {
    const o = opts || {};
    const cardCount = clamp(Math.round(Number(o.cardCount != null ? o.cardCount : 20)), 4, 36);
    const badgeMode = ['static', 'promotedBelow', 'promotedAbove'].includes(o.badgeMode) ? o.badgeMode : 'promotedBelow';
    const overlap = o.overlap !== undefined ? Boolean(o.overlap) : true;
    const cardSizePx = clamp(Math.round(Number(o.cardSizePx != null ? o.cardSizePx : 280)), 160, 480);

    const paintChunks = cardCount + 1;
    const VIEWPORT_W = 960;
    const rootContentH = cardSizePx + cardCount * 18;
    const rootBytes = VIEWPORT_W * rootContentH * 4;
    const badgeBytes = 220 * 120 * 4;
    const cardBytes = cardSizePx * cardSizePx * 4;

    let compositedLayers, vramBytes, explodedCards;
    if (badgeMode === 'static') {
      compositedLayers = 1;
      explodedCards = 0;
      vramBytes = rootBytes;
    } else if (badgeMode === 'promotedAbove') {
      compositedLayers = 2;
      explodedCards = 0;
      vramBytes = rootBytes + badgeBytes;
    } else {
      // promotedBelow: composited badge paints first; overlapping clipped cards cannot merge back behind it
      if (overlap) {
        compositedLayers = 2 + cardCount;
        explodedCards = cardCount;
        vramBytes = rootBytes + badgeBytes + cardCount * cardBytes;
      } else {
        compositedLayers = 2;
        explodedCards = 0;
        vramBytes = rootBytes + badgeBytes;
      }
    }

    const savedLayers = badgeMode === 'static' ? cardCount : Math.max(0, (2 + cardCount) - compositedLayers);
    const vramMiB = r2(vramBytes / (1024 * 1024));

    let sayKey;
    if (badgeMode === 'static') sayKey = 'allMerged';
    else if (badgeMode === 'promotedAbove') sayKey = 'aboveSafe';
    else if (!overlap) sayKey = 'noOverlapSafe';
    else sayKey = 'exploded';

    return {
      cardCount, badgeMode, overlap, cardSizePx,
      paintChunks, compositedLayers, explodedCards, savedLayers,
      vramBytes, vramMiB,
      sayKey
    };
  }

  /* ── ch7: cc::TileManager Tiling, OOP-R Raster, Pending/Active Trees & Checkerboarding ── */
  function simulateTileRaster(opts) {
    const o = opts || {};
    const scrollSpeed = clamp(Math.round(Number(o.scrollSpeed != null ? o.scrollSpeed : 2400)), 0, 4800);
    const tileSize = Number(o.tileSize) === 512 ? 512 : 256;
    const oopRaster = o.oopRaster !== undefined ? Boolean(o.oopRaster) : true;
    const skewportRows = clamp(Math.round(Number(o.skewportRows != null ? o.skewportRows : 1)), 0, 3);

    const LAYER_W = 1024;
    const LAYER_H = 3072;
    const VIEW_H = 768;
    const RASTER_BUDGET_MS = 4.0; // portion of 16.67 ms 60 Hz frame dedicated to raster tasks

    // Pixel area ratio: 512x512 = 4x pixels of 256x256
    const perTileMs = oopRaster
      ? (tileSize === 256 ? 0.25 : 0.75)
      : (tileSize === 256 ? 1.8 : 4.0);
    const tilesPerFrameCap = Math.max(1, Math.floor(RASTER_BUDGET_MS / perTileMs));

    const cols = LAYER_W / tileSize;
    const rows = LAYER_H / tileSize;

    // 2D tile readiness state; rows overlapping initial viewport start ready at t = 0
    const ready = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, () => r * tileSize < VIEW_H)
    );

    const FRAMES = 16;
    let bestSnap = null;
    let lastSnap = null;

    for (let f = 0; f < FRAMES; f++) {
      const scrollY = Math.min(LAYER_H - VIEW_H, Math.round(f * scrollSpeed / 60));
      const visR0 = Math.floor(scrollY / tileSize);
      const visR1 = Math.min(rows - 1, Math.floor((scrollY + VIEW_H - 1) / tileSize));
      const skewR1 = Math.min(rows - 1, visR1 + skewportRows);

      const nowQueue = [];
      const soonQueue = [];
      for (let r = visR0; r <= visR1; r++) {
        for (let c = 0; c < cols; c++) if (!ready[r][c]) nowQueue.push([r, c]);
      }
      for (let r = visR1 + 1; r <= skewR1; r++) {
        for (let c = 0; c < cols; c++) if (!ready[r][c]) soonQueue.push([r, c]);
      }

      const work = nowQueue.concat(soonQueue).slice(0, tilesPerFrameCap);
      for (const [r, c] of work) ready[r][c] = true;

      let visibleTiles = 0;
      let checkerboardTiles = 0;
      let pendingPrepaint = 0;
      const grid = [];
      for (let r = 0; r < rows; r++) {
        const rowStates = [];
        for (let c = 0; c < cols; c++) {
          const isVis = r >= visR0 && r <= visR1;
          const isSkew = r > visR1 && r <= skewR1;
          if (isVis) {
            visibleTiles++;
            if (ready[r][c]) rowStates.push('ready');
            else { checkerboardTiles++; rowStates.push('checker'); }
          } else if (isSkew) {
            if (ready[r][c]) rowStates.push('ready');
            else { pendingPrepaint++; rowStates.push('pending'); }
          } else {
            rowStates.push(ready[r][c] ? 'ready' : 'cold');
          }
        }
        grid.push(rowStates);
      }

      const checkerboardPct = r1(visibleTiles ? (checkerboardTiles / visibleTiles) * 100 : 0);
      const snap = {
        frameIndex: f,
        scrollY, visR0, visR1, skewR1,
        lastRasterizedThisFrame: work.length,
        visibleTiles, checkerboardTiles, checkerboardPct, pendingPrepaint, grid
      };
      lastSnap = snap;
      if (!bestSnap || checkerboardTiles > bestSnap.checkerboardTiles ||
          (checkerboardTiles === bestSnap.checkerboardTiles && checkerboardPct > bestSnap.checkerboardPct)) {
        bestSnap = snap;
      }
    }

    const chosen = (bestSnap && bestSnap.checkerboardTiles > 0) ? bestSnap : lastSnap;
    const peakCheckerboardPct = bestSnap ? bestSnap.checkerboardPct : 0;

    let sayKey;
    if (scrollSpeed === 0) sayKey = 'idleClean';
    else if (chosen.checkerboardTiles > 0) sayKey = 'checkerboard';
    else if (oopRaster) sayKey = 'ooprClean';
    else sayKey = 'skewportClean';

    return {
      scrollSpeed, tileSize, oopRaster, skewportRows,
      cols, rows,
      scrollY: chosen.scrollY,
      visR0: chosen.visR0,
      visR1: chosen.visR1,
      skewR1: chosen.skewR1,
      perTileMs, tilesPerFrameCap,
      lastRasterizedThisFrame: chosen.lastRasterizedThisFrame,
      visibleTiles: chosen.visibleTiles,
      checkerboardTiles: chosen.checkerboardTiles,
      checkerboardPct: chosen.checkerboardPct,
      peakCheckerboardPct,
      pendingPrepaint: chosen.pendingPrepaint,
      grid: chosen.grid,
      sayKey
    };
  }

  /* ── ch8: Viz CompositorFrame, SurfaceAggregator & OOPIF Merge ── */
  function simulateVizFrame(opts) {
    const o = opts || {};
    const displayHz = Number(o.displayHz) === 60 ? 60 : 120;
    const mainThreadMs = clamp(Math.round(Number(o.mainThreadMs != null ? o.mainThreadMs : 14)), 2, 30);
    const rasterMs = clamp(Math.round(Number(o.rasterMs != null ? o.rasterMs : 3)), 1, 12);
    const oopifCount = clamp(Math.round(Number(o.oopifCount != null ? o.oopifCount : 2)), 0, 6);

    const budgetMs = r2(DISPLAY_BUDGETS[displayHz]);
    const implAggMs = r2(1.2 + oopifCount * 0.4);
    const mainPipelineMs = mainThreadMs + rasterMs;
    const mergedQuads = 26 + 6 * oopifCount;
    const surfacesAggregated = 2 + oopifCount; // Browser Chrome + Main Frame + OOPIFs

    const mainVsyncSpan = Math.max(1, Math.ceil(mainPipelineMs / (budgetMs - 0.5)));
    const implVsyncSpan = Math.max(1, Math.ceil(implAggMs / budgetMs));
    const mainFps = r1(displayHz / mainVsyncSpan);
    const implFps = r1(displayHz / implVsyncSpan);

    let sayKey;
    if (implVsyncSpan > 1) sayKey = 'implOverload';
    else if (mainVsyncSpan > 1) sayKey = 'mainBehindImplLocked';
    else sayKey = 'allLocked';

    return {
      displayHz, budgetMs, mainThreadMs, rasterMs, oopifCount,
      implAggMs, mainPipelineMs, mergedQuads, surfacesAggregated,
      mainVsyncSpan, implVsyncSpan, mainFps, implFps,
      sayKey
    };
  }

  /* ── ch9: Main-thread jank vs Compositor isolation (top/left vs box-shadow vs transform) ── */
  function simulateAnimationIsolation(opts) {
    const o = opts || {};
    const propMode = ['transform', 'boxShadow', 'left'].includes(o.propMode) ? o.propMode : 'transform';
    const jsSpikeMs = clamp(Math.round(Number(o.jsSpikeMs != null ? o.jsSpikeMs : 50)), 0, 120);
    const domBoxes = clamp(Math.round(Number(o.domBoxes != null ? o.domBoxes : 250)), 50, 500);
    const displayHz = Number(o.displayHz) === 60 ? 60 : 120;

    const budgetMs = DISPLAY_BUDGETS[displayHz];
    const windowMs = 1600;
    const nFrames = Math.round((windowMs / 1000) * displayHz);

    let stagesExecuted, baseFrameMs;
    if (propMode === 'transform') {
      stagesExecuted = 1; // Composite only
      baseFrameMs = 0.6;
    } else if (propMode === 'boxShadow') {
      stagesExecuted = 3; // Paint + Raster + Composite
      baseFrameMs = r2(2.7 + domBoxes * 0.02);
    } else {
      stagesExecuted = 5; // Style + Layout + Paint + Raster + Composite
      baseFrameMs = r2(2.5 + domBoxes * 0.032);
    }

    // Two deterministic JS Long Tasks at t = 400 ms and t = 1100 ms
    const spikeTimes = [400, 1100];
    const frames = [];
    let droppedFrames = 0;
    let maxPauseMs = baseFrameMs;

    let i = 0;
    while (i < nFrames) {
      const t = i * budgetMs;
      let spikeHere = 0;
      if (propMode !== 'transform' && jsSpikeMs > 0) {
        for (const st of spikeTimes) {
          if (t >= st && t < st + budgetMs) {
            spikeHere = jsSpikeMs;
            break;
          }
        }
      }
      const workMs = r2(baseFrameMs + spikeHere);
      const span = Math.max(1, Math.ceil(workMs / budgetMs));
      const droppedHere = span - 1;
      droppedFrames += droppedHere;
      if (workMs > maxPauseMs) maxPauseMs = workMs;

      for (let k = 0; k < span && i < nFrames; k++, i++) {
        frames.push({
          idx: i,
          t: r1(i * budgetMs),
          ms: k === 0 ? workMs : 0,
          dropped: k > 0 || workMs > budgetMs
        });
      }
    }

    const effectiveFps = r1(displayHz * Math.max(0, nFrames - droppedFrames) / nFrames);
    maxPauseMs = r1(maxPauseMs);

    let sayKey;
    if (propMode === 'transform') sayKey = 'compositorImmune';
    else if (droppedFrames === 0) sayKey = 'cleanMain';
    else if (propMode === 'boxShadow') sayKey = 'paintStalled';
    else sayKey = 'layoutStalled';

    return {
      propMode, jsSpikeMs, domBoxes, displayHz,
      budgetMs: r2(budgetMs),
      stagesExecuted,
      baseFrameMs: r2(baseFrameMs),
      frames,
      totalFrames: nFrames,
      droppedFrames,
      maxPauseMs,
      effectiveFps,
      sayKey
    };
  }

  /* ── ch10: Frontier — Skia Graphite (Dawn/WebGPU parallel recorders + 2D depth) vs Ganesh & Speculation Rules ── */
  function simulateFrontierPipeline(opts) {
    const o = opts || {};
    const backend = o.backend === 'ganesh' ? 'ganesh' : 'graphite';
    const drawCmds = clamp(Math.round(Number(o.drawCmds != null ? o.drawCmds : 600)), 100, 1200);
    const workers = clamp(Math.round(Number(o.workers != null ? o.workers : 3)), 1, 4);
    const prerender = o.prerender !== undefined ? Boolean(o.prerender) : true;

    const threadsActive = backend === 'graphite' ? workers : 1;
    const cpuRecordMs = backend === 'ganesh'
      ? r2(drawCmds * 0.014)
      : r2((drawCmds / workers) * 0.009 + 0.4);
    const overdrawPct = backend === 'ganesh' ? 38 : 4;
    const overdrawRejectedPct = backend === 'ganesh' ? 0 : 34;

    const navBaseMs = prerender ? 12 : 95;
    const navToPaintMs = r1(navBaseMs + cpuRecordMs * (prerender ? 0.35 : 1));

    let sayKey;
    if (backend === 'graphite') sayKey = prerender ? 'graphitePrerender' : 'graphiteCold';
    else sayKey = prerender ? 'ganeshPrerender' : 'ganeshCold';

    return {
      backend, drawCmds, workers, threadsActive, prerender,
      cpuRecordMs, overdrawPct, overdrawRejectedPct, navToPaintMs,
      sayKey
    };
  }

  return {
    DISPLAY_BUDGETS,
    PINNED_BUILD,
    fmt,
    bytesStr,
    simulateParseTimeline,
    simulateStyleCalc,
    simulateLayoutThrashing,
    evaluatePropertyTrees,
    simulateLayerization,
    simulateTileRaster,
    simulateVizFrame,
    simulateAnimationIsolation,
    simulateFrontierPipeline
  };
});
