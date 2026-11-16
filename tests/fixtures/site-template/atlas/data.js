/* Fixture atlas for tests/site-template.cjs: one concept owned once, one alias owned twice. */
(() => {
  window.ATLAS = { nodes: [
    { id: 'fixture-cache-line', title: { zh: '缓存行', en: 'cache line' }, aliases: { zh: ['缓存块'], en: [] },
      lessons: [{ slug: 'fixture-target', anchor: 'ch2', primary: true }] },
    { id: 'fixture-dup-a', title: { zh: '甲', en: 'A' }, aliases: { zh: ['重名'], en: [] }, lessons: [{ slug: 'fixture-target', anchor: 'ch1', primary: true }] },
    { id: 'fixture-dup-b', title: { zh: '乙', en: 'B' }, aliases: { zh: ['重名'], en: [] }, lessons: [{ slug: 'fixture-target', anchor: 'ch2', primary: true }] },
  ] };
})();
