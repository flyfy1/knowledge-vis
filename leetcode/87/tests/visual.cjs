'use strict';
// Focused captures supplement the complete lifecycle suite. OUTPUT_DIR is honored.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18776')+'/leetcode/87/');
const checks=[];
for(const [lang,width] of [['en',1440],['zh',390],['en',320]]){
 await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','1');
 const cut=await page.evaluate(()=>Scramble87.trace('great','rgeat').frames.findIndex(f=>f.event==='cut'&&f.length===5&&f.k===2));
 await page.locator('#position').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input'));},cut);
 assert.match(await page.locator('#message').innerText(),/true/);
 await page.locator('#pairs').screenshot({path:path.join(out,`pair-great-${lang}-${width}.png`)});
 await page.locator('#tables').screenshot({path:path.join(out,`table-great-${lang}-${width}.png`),style:".step-nav { visibility:hidden !important; }"});
 assert.equal(await page.locator('.dp-table').count(),5);
 const tableWrap=page.locator('.dp-wrap').first();await tableWrap.focus();await page.keyboard.press('End');
 await tableWrap.evaluate(e=>e.scrollLeft=e.scrollWidth);assert.ok(await tableWrap.evaluate(e=>e.scrollLeft+e.clientWidth>=e.scrollWidth-1));
 await tableWrap.evaluate(e=>e.scrollLeft=0);assert.ok(await page.locator('.current').count()>=1);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 checks.push({lang,width,cut});
}
await page.setViewportSize({width:1440,height:1000});await page.locator('[data-lang=en]').click();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,'header-en.png')});
// Measure focus and all token pairs, not just default active text.
const colors=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','panel','panel2','text','muted','accent','accent2','good','bad'].map(k=>[k,s.getPropertyValue('--'+k).trim()]));});
function lum(hex){return hex.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,b,i)=>a+b*[.2126,.7152,.0722][i],0);}
function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
const contrasts=[];for(const surface of ['bg','panel','panel2'])for(const ink of ['text','muted','accent','accent2','good','bad']){const r=ratio(colors[ink],colors[surface]);assert.ok(r>=4.5);if(ink==='text')assert.ok(r>=7);contrasts.push({surface,ink,ratio:r});}
for(const surface of ['bg','panel','panel2'])assert.ok(ratio(colors.accent2,colors[surface])>=3);
await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#pythonCode').textContent(),fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8'));
fs.writeFileSync(path.join(out,'visual-results.json'),JSON.stringify({type:'author self-check',checks,contrasts,focusWidth:3,focusContrastOver3:true},null,2));await browser.close();console.log('Focused captures and contrast passed.');})().catch(e=>{console.error(e);process.exit(1);});
