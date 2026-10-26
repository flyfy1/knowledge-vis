'use strict';
const{chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1157/';
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const p=await b.newPage({viewport:{width:390,height:1100},reducedMotion:'reduce'}),records=[],errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url);await p.waitForFunction(()=>document.querySelector('#progress').textContent.length>5);
 async function align(selector){await p.locator(selector).first().evaluate(e=>window.scrollBy(0,e.getBoundingClientRect().top-document.querySelector('nav').getBoundingClientRect().height-20));}
 for(const lang of ['en','zh']){
  await p.click(`[data-lang=${lang}]`);await p.setViewportSize({width:390,height:1100});await p.evaluate(()=>document.body.style.zoom=1);
  for(const preset of ['0','1','3']){
   await p.selectOption('#preset',preset);await p.click('#end');await align('#event');
   const event=await p.locator('#event').textContent(),progress=await p.locator('#progress').textContent();
   if(preset==='0'){assert(event.includes('low=0'));assert(event.includes('high=4'));assert(event.includes(lang==='zh'?'真实次数=4':'true count=4'));assert(progress.includes(lang==='zh'?'余票 = 2':'balance = 2'));}
   if(preset==='1')assert(event.includes(lang==='zh'?'摘要无候选':'No candidate'));
   if(preset==='3'){assert(event.includes('low=0'));assert(event.includes('high=1'));assert(event.includes(lang==='zh'?'返回 -1':'return -1'));}
   const name=`verified-${lang}-preset${preset}-390.png`;await p.screenshot({path:path.join(OUT,name)});records.push({lang,preset,event,progress,screenshot:name});
  }
  await p.setViewportSize({width:320,height:1100});await p.evaluate(()=>document.body.style.zoom=2);await p.selectOption('#preset','0');await p.click('#next');await align('#blocks .block');
  const rect=await p.locator('#blocks .block').first().evaluate(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,nav:document.querySelector('nav').getBoundingClientRect().bottom};});assert(rect.top>rect.nav);assert(rect.bottom<1100);
  const name=`settled-${lang}-320-zoom2-block.png`;await p.screenshot({path:path.join(OUT,name)});records.push({lang,width:320,zoom:2,rect,screenshot:name,reason:'Align first block below sticky navigation; prior whole-block screenshots showed scroll/capture cropping, not text overlap.'});
  // 120% font-size sensitivity is synthetic stress, not a claim about another OS.
  await p.evaluate(()=>{document.body.style.zoom=1;document.querySelector('#preset').style.fontSize='19.2px';});
  for(let i=0;i<7;i++){
   await p.selectOption('#preset',String(i));const fit=await p.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {text:e.selectedOptions[0].textContent,font:s.font,needed:c.measureText(e.selectedOptions[0].textContent).width+parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)+22,available:e.clientWidth};});assert(fit.needed<=fit.available);records.push({lang,preset:i,fontStress:'120% synthetic',fit});
  }
  await p.evaluate(()=>document.querySelector('#preset').style.fontSize='');
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(OUT,'supplemental-results.json'),JSON.stringify({kind:'author self-check',status:'pass',records,errors},null,2)+'\n');await b.close();console.log('PASS supplemental',records.length,'records');
})().catch(e=>{console.error(e);process.exit(1);});
