// Preserve the frozen test and every assertion; adapt only its Linux copy shortcut.
const fs=require('fs'),path=require('path'),Module=require('module'),assert=require('assert/strict'),crypto=require('crypto');
const file=path.resolve(process.argv[2]);const source=fs.readFileSync(file,'utf8');
const old="await p.keyboard.press('Control+c')",replacement="await p.keyboard.press('Meta+c')";
assert.equal(process.platform,'darwin');assert.equal(source.split(old).length-1,1);
const adapted=source.replace(old,replacement);
fs.writeFileSync(path.join(process.env.LESSON_TEST_OUTPUT_DIR,'host-key-adapter.json'),JSON.stringify({host:process.platform,originalPath:file,originalSHA256:crypto.createHash('sha256').update(source).digest('hex'),adaptedSHA256:crypto.createHash('sha256').update(adapted).digest('hex'),replacement:{from:old,to:replacement},assertionsUnchanged:true,outputLabelCaveat:'Frozen test output says Linux Control+C; actual executed shortcut is Meta+c on darwin, as recorded here.'},null,2));
const test=new Module(file,module);test.filename=file;test.paths=Module._nodeModulePaths(path.dirname(file));test._compile(adapted,file);
