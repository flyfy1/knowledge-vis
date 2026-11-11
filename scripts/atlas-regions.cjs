'use strict';
// Category -> atlas region, shared by scripts/build-atlas-data.cjs and
// scripts/atlas-import-registry.cjs. Physics splits by topic, so physics
// defaults to waves and the circuits cases live in partition-overrides.json.
// A region in groups.json may claim categories with "categories": [..]; that is
// how a new region (e.g. tech) takes the pages of a new category, and it wins
// over the defaults below.
const DEFAULT_CATEGORY_REGION = {
  math: 'math', signal: 'systems', engineering: 'systems',
  probability: 'measurement', computing: 'computing', chemistry: 'matter',
  biology: 'life', earth: 'earth', physics: 'waves',
  psychology: 'life', language: 'society',
};
function categoryRegions(groups) {
  const map = { ...DEFAULT_CATEGORY_REGION };
  for (const g of groups) for (const c of (g.categories || [])) map[c] = g.id;
  return map;
}
module.exports = { DEFAULT_CATEGORY_REGION, categoryRegions };
