/* Fixture registry for tests/site-template.cjs. */
window.KNOWLEDGE_CATEGORIES = [{ id: 'demo', name: { zh: '演示', en: 'Demo' } }];
window.KNOWLEDGE_SUBTOPICS = { demo: [{ id: 'basics', name: { zh: '基础', en: 'Basics' } }] };
window.KNOWLEDGE_PAGES = [
  { slug: 'fixture-essay', path: 'demo/basics/fixture-essay/', status: 'live', category: 'demo', subtopic: 'basics', stage: 'university',
    title: { zh: '样例长文', en: 'A Sample Essay' } },
  { slug: 'fixture-target', path: 'demo/basics/fixture-target/', status: 'live', category: 'demo', subtopic: 'basics', stage: 'university',
    title: { zh: '被引用的页面', en: 'The Page Being Cited' } },
];
