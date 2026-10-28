'use strict';

const path=require('node:path');

// Prefer a project install, then the caller's NODE_PATH, then the Mac mini's
// shared Codex runtime. This keeps the static repo dependency-free while making
// the installed Playwright runtime the default for local browser checks.
const candidates=[
  process.env.PLAYWRIGHT_NODE_PATH,
  'playwright',
  path.join(process.env.HOME||'', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
].filter(Boolean);
let error;
for(const candidate of candidates){
  try{module.exports=require(candidate);return;}catch(err){error=err;}
}
error.message=`Playwright is unavailable. Checked ${candidates.join(', ')}. ${error.message}`;
throw error;
