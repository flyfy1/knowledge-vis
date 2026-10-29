#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const config = fs.readFileSync(path.join(root, 'pages.config.js'), 'utf8');

const required = [
  ['topic filter container', 'id="topicChips"'],
  ['pagination container', 'id="pagination"'],
  ['previous-page control', 'id="prevPage"'],
  ['next-page control', 'id="nextPage"'],
  ['shareable page query', "searchParams.set('page'"],
  ['shareable topic query', "searchParams.set('topic'"],
  ['bounded page size', 'var pageSize = 12'],
  ['keyboard focus after paging', 'nextPage.focus()'],
];
for (const [label, needle] of required) {
  if (!html.includes(needle)) throw new Error(`missing ${label}: ${needle}`);
}
if (!html.includes("activeStage = stages.some")) throw new Error('stage query state is not restored');
if (!html.includes('function renderTopicChips')) throw new Error('topic chips renderer is missing');
if (!/window\.KNOWLEDGE_PAGES\s*=\s*\[/.test(config)) throw new Error('page registry missing');
const cardLinks = (html.match(/<a class="card"/g) || []).length;
if (cardLinks > 12) throw new Error('index contains a hard-coded unbounded card list');
console.log('index pagination contract: ok');
