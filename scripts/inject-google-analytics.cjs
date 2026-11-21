#!/usr/bin/env node
/* Inject the shared tag into a disposable publication package, never source pages. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const OMIT = new Set(['.git', '.github', '.agent', '.runs', '.claude', 'node_modules', 'specs', 'docs', 'worklog', 'tests', 'evidence', 'provenance', 'authorship', 'templates', 'scripts', 'deploy', 'platform-shots', 'platform-review-shots']);
const TAG = /<script\b[^>]*\bsrc=["'][^"']*\/google-analytics\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>\s*/gi;
function inject(root) {
  root = path.resolve(root);
  if (fs.existsSync(path.join(root, '.git'))) throw new Error('Refusing to mutate a Git checkout; use an exported publication package.');
  const tracker = fs.readFileSync(path.join(root, 'google-analytics.js'));
  if (!/G-[A-Z0-9]{6,}/.test(tracker.toString())) throw new Error('GA measurement ID is not configured.');
  const version = crypto.createHash('sha256').update(tracker).digest('hex').slice(0, 12);
  let count = 0;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (entry.name.startsWith('.') || OMIT.has(entry.name)) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(file); continue; }
      if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
      let html = fs.readFileSync(file, 'utf8');
      // Redirect-only documents do not represent an additional page view.
      if (!/<head\b/i.test(html) || /<meta\b[^>]*http-equiv=["']refresh["']/i.test(html)) continue;
      const relative = path.relative(root, file).split(path.sep).join('/');
      if (!/^[a-zA-Z0-9/_\.\-]+$/.test(relative)) throw new Error('Unsupported public path: ' + relative);
      const route = '/' + relative.replace(/index\.html$/, '');
      const tag = '<script defer src="/google-analytics.js?v=' + version + '" data-page="' + route + '"></script>\n';
      html = html.replace(TAG, '').replace(/<\/head\s*>/i, tag + '</head>');
      if (!html.includes(tag)) throw new Error('Missing head end: ' + relative);
      fs.writeFileSync(file, html);
      count++;
    }
  }
  walk(root);
  return {count, version};
}
module.exports = {inject};
if (require.main === module) {
  if (process.argv.length !== 3) throw new Error('Usage: node scripts/inject-google-analytics.cjs <exported-site-directory>');
  console.log(JSON.stringify(inject(process.argv[2])));
}
