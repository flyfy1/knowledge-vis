const C=require('../core.js');let s='';process.stdin.on('data',b=>s+=b);process.stdin.on('end',()=>process.stdout.write(JSON.stringify(JSON.parse(s).map(([nums,k])=>C.trace({nums,k})))));
