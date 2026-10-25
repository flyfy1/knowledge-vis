const fs=require('node:fs'),Module=require('node:module');
const filename='/tmp/leetcode-726-frozen-e8e49a0-20261025/leetcode/726/tests/review-r1.cjs';
const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(require('node:path').dirname(filename));m._compile(fs.readFileSync('/tmp/leetcode-726-review-r1-original-20261025.cjs','utf8'),filename);
