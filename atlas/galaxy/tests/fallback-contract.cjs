'use strict';

const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../app.mjs'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../../galaxy.html'),'utf8');
const style=fs.readFileSync(path.join(__dirname,'../style.css'),'utf8');

assert.match(app,/lowPowerReason:/);
assert.match(app,/failureReason:/);
assert.match(app,/fallback-note/);
assert.match(html,/id="fallback-note"/);
assert.match(style,/\.fallback-note/);
console.log(JSON.stringify({checks:5,scope:'low-power and renderer-failure fallback explanations remain localized and styled'},null,2));
