// Numbers in the prose, computed from models.js at build time ({=name} in content.*.md).
// Language-neutral: the same formatted string goes into both Chinese and English prose.
module.exports = M => {
  const b = {};
  const f = (x, d) => M.fmt(x, d == null ? 0 : d, 'en');

  // General display budgets
  b['budget.60'] = f(M.DISPLAY_BUDGETS[60], 2);
  b['budget.120'] = f(M.DISPLAY_BUDGETS[120], 2);

  // ch2: HTML parser + preload scanner + defer vs blocking
  const pBlock = M.simulateParseTimeline({ mode: 'blocking', cssMs: 30, jsMs: 70, preload: true });
  const pNoPre = M.simulateParseTimeline({ mode: 'blocking', cssMs: 30, jsMs: 70, preload: false });
  const pDefer = M.simulateParseTimeline({ mode: 'defer', cssMs: 30, jsMs: 70, preload: true });
  b['ch2.blockDcl'] = f(pBlock.domContentLoaded, 0);
  b['ch2.noPreDcl'] = f(pNoPre.domContentLoaded, 0);
  b['ch2.saved'] = f(pBlock.preloadSavedMs, 0);
  b['ch2.deferFp'] = f(pDefer.firstPaint, 0);
  b['ch2.deferDcl'] = f(pDefer.domContentLoaded, 0);

  // ch3: Style matching, Bloom filter, InvalidationSet
  const sDeep = M.simulateStyleCalc({ selectorKind: 'deepDesc', domNodes: 180, ruleCount: 250, smartEngine: true });
  const sUniv = M.simulateStyleCalc({ selectorKind: 'universalTail', domNodes: 180, ruleCount: 250, smartEngine: true });
  const sNaive = M.simulateStyleCalc({ selectorKind: 'deepDesc', domNodes: 180, ruleCount: 250, smartEngine: false });
  b['ch3.inv'] = f(sDeep.invalidatedNodes, 0);
  b['ch3.deepChecks'] = f(sDeep.keyChecks, 0);
  b['ch3.bloomRej'] = f(sDeep.bloomRejects, 0);
  b['ch3.univChecks'] = f(sUniv.keyChecks, 0);
  b['ch3.univWalks'] = f(sUniv.ancestorWalks, 0);
  b['ch3.naiveNodes'] = f(sNaive.invalidatedNodes, 0);
  b['ch3.naiveChecks'] = f(sNaive.keyChecks, 0);

  // ch4: LayoutNG & Forced Synchronous Layout Thrashing
  const lThrash = M.simulateLayoutThrashing({ pattern: 'thrash', itemCount: 50, treeNodes: 300 });
  const lBatch = M.simulateLayoutThrashing({ pattern: 'batched', itemCount: 50, treeNodes: 300 });
  const lCont = M.simulateLayoutThrashing({ pattern: 'contained', itemCount: 50, treeNodes: 300 });
  b['ch4.thrashMs'] = f(lThrash.layoutWorkMs, 2);
  b['ch4.thrash60'] = f(lThrash.budget60Pct, 1);
  b['ch4.batchMs'] = f(lBatch.layoutWorkMs, 2);
  b['ch4.contMs'] = f(lCont.layoutWorkMs, 2);
  b['ch4.ratio'] = f(lThrash.layoutWorkMs / lBatch.layoutWorkMs, 1);

  // ch5: Property Trees
  const ptDef = M.evaluatePropertyTrees({ changeType: 'transform', tx: 60, scrollY: 40, opacity: 0.85, clipOn: true });
  b['ch5.sx'] = f(ptDef.screenX, 0);
  b['ch5.sy'] = f(ptDef.screenY, 0);
  b['ch5.visPct'] = f(ptDef.visibleAreaPct, 0);

  // ch6: Layerization & Layer Explosion
  const lyExp = M.simulateLayerization({ cardCount: 20, badgeMode: 'promotedBelow', overlap: true, cardSizePx: 280 });
  const lyAbv = M.simulateLayerization({ cardCount: 20, badgeMode: 'promotedAbove', overlap: true, cardSizePx: 280 });
  const lyBig = M.simulateLayerization({ cardCount: 36, badgeMode: 'promotedBelow', overlap: true, cardSizePx: 480 });
  b['ch6.expLayers'] = f(lyExp.compositedLayers, 0);
  b['ch6.expVram'] = f(lyExp.vramMiB, 2);
  b['ch6.safeLayers'] = f(lyAbv.compositedLayers, 0);
  b['ch6.safeVram'] = f(lyAbv.vramMiB, 2);
  b['ch6.bigVram'] = f(lyBig.vramMiB, 2);

  // ch7: Tiling & Checkerboarding
  const tCpu = M.simulateTileRaster({ scrollSpeed: 3600, tileSize: 256, oopRaster: false, skewportRows: 0 });
  const tSkew = M.simulateTileRaster({ scrollSpeed: 3600, tileSize: 256, oopRaster: false, skewportRows: 2 });
  const tGpu = M.simulateTileRaster({ scrollSpeed: 3600, tileSize: 256, oopRaster: true, skewportRows: 0 });
  b['ch7.tile256KiB'] = f((256 * 256 * 4) / 1024, 0);
  b['ch7.tile512MiB'] = f((512 * 512 * 4) / (1024 * 1024), 2);
  b['ch7.cpuCb'] = f(tCpu.checkerboardPct, 1);
  b['ch7.skewCb'] = f(tSkew.checkerboardPct, 1);
  b['ch7.gpuCb'] = f(tGpu.checkerboardPct, 1);

  // ch8: Viz SurfaceAggregator
  const vz = M.simulateVizFrame({ displayHz: 120, mainThreadMs: 14, rasterMs: 3, oopifCount: 2 });
  b['ch8.mainFps'] = f(vz.mainFps, 0);
  b['ch8.implFps'] = f(vz.implFps, 0);
  b['ch8.quads'] = f(vz.mergedQuads, 0);
  b['ch8.implMs'] = f(vz.implAggMs, 2);

  // ch9: Animation Isolation (120 Hz + 50 ms JS spike)
  const aTf = M.simulateAnimationIsolation({ propMode: 'transform', jsSpikeMs: 50, domBoxes: 250, displayHz: 120 });
  const aBs = M.simulateAnimationIsolation({ propMode: 'boxShadow', jsSpikeMs: 50, domBoxes: 250, displayHz: 120 });
  const aLf = M.simulateAnimationIsolation({ propMode: 'left', jsSpikeMs: 50, domBoxes: 250, displayHz: 120 });
  b['ch9.tfDrop'] = f(aTf.droppedFrames, 0);
  b['ch9.bsDrop'] = f(aBs.droppedFrames, 0);
  b['ch9.lfDrop'] = f(aLf.droppedFrames, 0);
  b['ch9.lfMax'] = f(aLf.maxPauseMs, 1);
  b['ch9.lfFps'] = f(aLf.effectiveFps, 1);

  // ch10: Frontier (Graphite vs Ganesh)
  const fGr = M.simulateFrontierPipeline({ backend: 'graphite', drawCmds: 600, workers: 3, prerender: true });
  const fGn = M.simulateFrontierPipeline({ backend: 'ganesh', drawCmds: 600, workers: 3, prerender: false });
  b['ch10.grCpu'] = f(fGr.cpuRecordMs, 2);
  b['ch10.gnCpu'] = f(fGn.cpuRecordMs, 2);
  b['ch10.grNav'] = f(fGr.navToPaintMs, 1);
  b['ch10.gnNav'] = f(fGn.navToPaintMs, 1);
  b['ch10.overRej'] = f(fGr.overdrawRejectedPct, 0);

  return b;
};
