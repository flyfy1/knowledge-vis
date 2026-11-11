const fs=require('fs'),C=require('../core.js');
const cases=JSON.parse(fs.readFileSync(0,'utf8'));
process.stdout.write(JSON.stringify(cases.map(g=>C.trace(g))));
