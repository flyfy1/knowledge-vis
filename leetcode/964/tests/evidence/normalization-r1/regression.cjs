// Run existing assertions with only the preview origin adapted to the supplied URL.
const fs=require('fs'),path=require('path'),Module=require('module');
const filename=path.resolve(__dirname,'../../browser.cjs');
process.env.EVIDENCE_DIR=path.join(__dirname,'regression');
const src=fs.readFileSync(filename,'utf8').replaceAll('http://127.0.0.1:18790','http://127.0.0.1:18770');
const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(path.dirname(filename));m._compile(src,filename);
