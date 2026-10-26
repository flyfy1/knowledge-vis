const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:393,height:851},deviceScaleFactor:3,isMobile:true,hasTouch:true,locale:'zh-CN'});
 for(const asset of ['index.html','style.css','i18n.js']){
  const body=require('node:child_process').execFileSync('git',['show','1d90150cf9c1db194769dff92dc4178ce7779fb0:photosynthesis/'+asset],{encoding:'utf8'});
  await page.route(asset==='index.html'?'**/photosynthesis/':'**/photosynthesis/'+asset,r=>r.fulfill({body,contentType:asset.endsWith('.css')?'text/css':asset.endsWith('.js')?'text/javascript':'text/html'}));
 }
 await page.route('**/photosynthesis/app.js*',r=>r.fulfill({path:process.env.DEPLOYED_APP||'/tmp/photosynthesis-live-app.js',contentType:'text/javascript'}));
 await page.goto('http://127.0.0.1:18843/photosynthesis/');
 const sizes=[];
 for(let i=0;i<4;i++){
  if(i)await page.evaluate(()=>dispatchEvent(new Event('resize')));
  await page.waitForTimeout(120);
  sizes.push(await page.evaluate(()=>({pageHeight:document.documentElement.scrollHeight,canvas:[...document.querySelectorAll('canvas')].map(c=>({id:c.id,cssHeight:c.clientHeight,bufferHeight:c.height}))})));
 }
 console.log(JSON.stringify(sizes,null,2));
 fs.writeFileSync('photosynthesis/tests/evidence/deployed-reproduction.json',JSON.stringify({description:'Public deployed app.js replayed against delivery baseline HTML/CSS, Chrome mobile emulation, 393x851 DPR 3; initial render and 3 resize events.',sizes},null,2));
 await page.evaluate(()=>scrollTo({top:1800,behavior:'instant'}));await page.screenshot({path:'photosynthesis/tests/evidence/deployed-gap.png'});
 }finally{await browser.close();}
})();
