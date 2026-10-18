'use strict';
// Capture each visual state in a fresh Chromium process to avoid ARM raster-cache artifacts.
// OUTPUT_DIR=/tmp/review60 node leetcode/60/tests/capture.cjs
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/60/';
const cases=[];for(const lang of ['en','zh']){
 for(const width of [320,390,736,1440])cases.push({lang,width,height:1000,kind:'diagram',name:`${lang}-${width}`});
 cases.push({lang,width:640,height:1000,kind:'zoom',name:`${lang}-zoom200`});
 for(const kind of ['header','prediction','revealed'])cases.push({lang,width:390,height:1000,kind,name:`${lang}-${kind}`});
 cases.push({lang,width:736,height:414,kind:'diagram',name:`${lang}-landscape`});
}cases.push({lang:'zh',width:1440,height:1000,kind:'forced',name:'forced-colors'});
(async()=>{
 const result=[];
 for(const c of cases){
  const browser=await chromium.launch({headless:true,args:['--disable-gpu'],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
  const page=await browser.newPage({viewport:{width:c.width,height:c.height}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(url);await page.emulateMedia({reducedMotion:'reduce'});await page.click(`[data-lang=${c.lang}]`);
  if(c.kind==='diagram'||c.kind==='zoom'){
   await page.selectOption('#preset','2');await page.click('#next');if(c.kind==='zoom')await page.evaluate(()=>document.documentElement.style.zoom='2');
   await page.locator('#blocks').scrollIntoViewIfNeeded();await page.evaluate(()=>window.scrollTo(0,document.querySelector('#blocks').getBoundingClientRect().top+scrollY-200));
  }else if(c.kind==='prediction'||c.kind==='revealed'){
   await page.check('[name=prediction][value="2"]');if(c.kind==='revealed'){await page.click('#reveal');await page.locator('#feedback').scrollIntoViewIfNeeded();}else await page.locator('#step3').scrollIntoViewIfNeeded();
  }else if(c.kind==='forced'){
   await page.emulateMedia({forcedColors:'active'});await page.focus('#copy');await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
  }else await page.evaluate(()=>window.scrollTo(0,0));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
  const target=path.join(out,c.name+'.png');await page.screenshot({path:target});result.push({...c,bytes:fs.statSync(target).size});
  await browser.close();
 }
 fs.writeFileSync(path.join(out,'capture-results.json'),JSON.stringify({type:'author visual captures',result:'pass',cases:result},null,2)+'\n');console.log(JSON.stringify({result:'pass',captures:result.length}));
})().catch(e=>{console.error(e);process.exit(1);});
