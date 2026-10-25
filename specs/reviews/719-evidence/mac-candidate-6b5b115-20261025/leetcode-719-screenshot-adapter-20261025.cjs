// Root Mac host adapter: retain every original assertion, change only CDP capture surface.
const fs=require('node:fs'),Module=require('node:module');
const filename='/tmp/leetcode-719-frozen-6b5b115-20261025/leetcode/719/tests/browser.cjs';
const original=fs.readFileSync(filename,'utf8');
if(original.split('fromSurface:false').length!==2)throw Error('Unexpected screenshot adapter seam');
const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(require('node:path').dirname(filename));
m._compile(original.replace('fromSurface:false','fromSurface:true'),filename);
