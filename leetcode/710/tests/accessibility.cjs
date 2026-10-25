'use strict';
const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
const out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const page=await browser.newPage({viewport:{width:320,height:1000}});await page.goto(process.env.LESSON_URL||'http://127.0.0.1:18770/leetcode/710/');const results=[];
for(const width of [320,390]){await page.setViewportSize({width,height:1000});for(const locale of ['en','zh']){await page.click(`[data-lang="${locale}"]`);
for(let preset=0;preset<6;preset++){await page.selectOption('#preset',String(preset));const m=await page.$eval('#preset',e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {text:e.selectedOptions[0].textContent,ink:c.measureText(e.selectedOptions[0].textContent).width,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),width:e.clientWidth};});assert(m.ink+m.padding+24<=m.width,JSON.stringify(m));results.push({width,locale,preset,...m});}
}}
await page.setViewportSize({width:320,height:1000});const pairs=[];
for(const locale of ['en','zh']){await page.click(`[data-lang="${locale}"]`);await page.selectOption('#preset','1');await page.click('#end');
 const disabled=await page.locator('#next,#end').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e);return {id:e.id,disabled:e.disabled,fg:s.color,bg:s.backgroundColor,opacity:s.opacity};}));assert(disabled.every(e=>e.disabled&&e.opacity==='1'&&e.fg==='rgb(154, 167, 184)'&&e.bg==='rgb(22, 27, 34)'));pairs.push(...disabled);
 await page.locator('#domain').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await page.locator('#domain').screenshot({path:path.join(out,'focused-domain-'+locale+'.png')});
 // Check keyboard scrolling of the cumulative ledger and source pane.
 await page.focus('#ledger');await page.keyboard.press('End');await page.waitForFunction(()=>document.getElementById('ledger').scrollTop>0);assert(await page.$eval('#ledger',e=>e.scrollTop>0));
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);await page.focus('#pythonCode >> xpath=..');await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.getElementById('pythonCode').parentElement.scrollLeft>0);
 assert(await page.locator('#pythonCode >> xpath=..').evaluate(e=>e.scrollLeft>0));
}
function lum(rgb){const c=rgb.match(/\d+/g).map(Number).slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
for(const p of pairs){p.ratio=(Math.max(lum(p.fg),lum(p.bg))+.05)/(Math.min(lum(p.fg),lum(p.bg))+.05);assert(p.ratio>=4.5);}
fs.writeFileSync(path.join(out,'accessibility-results.json'),JSON.stringify({status:'pass',selectedLabels:results,disabledContrast:pairs,keyboardScrollableLedgerAndSource:true,host:process.platform},null,2)+'\n');console.log('pass: all 24 closed selected labels, disabled contrast, keyboard-scrolled ledger/source');await browser.close();})().catch(e=>{console.error(e);process.exit(1);});
