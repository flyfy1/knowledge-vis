/* Capture focused mechanism states, avoiding sticky overlays in tall section captures. */
'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.LESSON_BASE_URL||'http://127.0.0.1:18768',dir=process.env.LESSON_SCREENSHOTS||path.join(__dirname,'../../specs/reviews/first-ten');
(async()=>{fs.mkdirSync(dir,{recursive:true});const browser=await chromium.launch({headless:true});try{
const page=await browser.newPage({viewport:{width:390,height:900},locale:'en-US'});
for(const id of [4,10,23,25,30,32,37,41,42,44]){
 await page.goto(`${base}/leetcode/${id}/`);await page.waitForFunction(()=>window.lessonSnapshot);
 const index=await page.evaluate(id=>{const frames=HardModels[id](LESSON.presets[0].input).frames;
  if(id===4)return frames.length-1;
  if(id===10)return frames.findIndex(f=>f.active[0]===2&&f.active[1]===4);
  if(id===23)return frames.findIndex(f=>f.message[1].startsWith('Insert'));
  if(id===25)return frames.findIndex(f=>f.state.changed===1);
  if(id===30)return frames.findIndex(f=>f.rows?.[2].values.includes('foo: 2'));
  if(id===32)return frames.findIndex(f=>f.state.best===4);
  if(id===37)return frames.findIndex(f=>f.message[1].startsWith('Undo'));
  if(id===41)return frames.findIndex(f=>f.state.target===0);
  if(id===42)return frames.findIndex(f=>f.state.water===7);
  return frames.findIndex(f=>f.active[0]===4&&f.active[1]===3);
 },id);assert.ok(index>=0,id+' mechanism exists');
 await page.locator('#position').fill(String(index));
 const state=await page.evaluate(()=>lessonSnapshot());
 for(const lang of ['en','zh']){await page.locator(`[data-lang="${lang}"]`).click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot()),state);await page.locator('#diagram').screenshot({path:path.join(dir,`${id}-${lang}-390.png`)});}
 console.log(JSON.stringify({id,event:index,message:await page.locator('#message').innerText(),state:state.frame.state}));
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
