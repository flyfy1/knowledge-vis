const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const root=require('node:path').resolve(__dirname,'../..');
const source=fs.readFileSync(root+'/integral/i18n.js','utf8');
assert.ok(/∫v/.test(source),'integral course must explicitly distinguish signed velocity accumulation');
assert.ok(/∫\|v\|/.test(source),'distance must explicitly integrate speed');
assert.doesNotMatch(source,/高是速度时它给出路程|高换成速度，积出来的就是路程|feed it a velocity curve and it accumulates distance/);
console.log('PASS integral signed-area caveats in bilingual lesson');
