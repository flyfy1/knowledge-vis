const {chromium}=require('playwright'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}),p=await b.newPage({viewport:{width:1440,height:1000}}),s=await p.context().newCDPSession(p),results=[];
for(const [label,url] of [['blank','data:text/html,<h1>Screenshot control</h1>'],['lesson','file:///tmp/leetcode-719-frozen-6b5b115-20261025/leetcode/719/index.html']]){
 await p.goto(url);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 for(const fromSurface of [false,true,false]){try{const r=await s.send('Page.captureScreenshot',{format:'png',fromSurface,captureBeyondViewport:false});fs.writeFileSync(process.env.OUTPUT_DIR+'/'+label+'-'+fromSurface+'.png',Buffer.from(r.data,'base64'));results.push({label,fromSurface,ok:true});}catch(e){results.push({label,fromSurface,ok:false,error:e.message});}}
}
await b.close();fs.writeFileSync(process.env.OUTPUT_DIR+'/screenshot-probe.json',JSON.stringify(results,null,2));console.log(results);
})().catch(e=>{console.error(e);process.exit(1);});
