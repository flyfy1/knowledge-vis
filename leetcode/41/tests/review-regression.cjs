const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const lum=c=>{const a=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*a[0]+.7152*a[1]+.0722*a[2]};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const page=await browser.newPage({viewport:{width:390,height:844}}), failures=[], results=[],errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 const check=(name,fn)=>{try{fn();results.push(name)}catch(e){failures.push(`${name}: ${e.message}`)}};
 await page.goto('http://127.0.0.1:18770/leetcode/41/');await page.waitForFunction(()=>window.lessonSnapshot);
 for(const lang of ['en','zh']){
  await page.click(`[data-lang="${lang}"]`);await page.click('#reset');await page.click('#next');
  const colors=await page.locator('#diagram .hot small').first().evaluate(e=>({fg:getComputedStyle(e).color,bg:getComputedStyle(e.parentElement).backgroundColor}));
  const ratio=(Math.max(lum(colors.fg),lum(colors.bg))+.05)/(Math.min(lum(colors.fg),lum(colors.bg))+.05);
  check(`${lang} 41-R3 contrast ${ratio.toFixed(2)}`,()=>assert.ok(ratio>=4.5));
  await page.click('#next');
  const state=await page.locator('#state').innerText();
  check(`${lang} 41-R2 inactive destination`,()=>{assert.ok(state.includes('swap_to'));assert.ok(state.includes('∅'));assert.ok(!state.includes('-1'))});
  const legend=await page.locator('#markerLegend').count();
  check(`${lang} 41-R2 visible legend`,()=>assert.equal(legend,1));
 }
 await browser.close();
 console.log(JSON.stringify({results,failures,errors},null,2));
 if(failures.length||errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
