/* Focused author regression for 920-COPY-R1; no acceptance claim. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'evidence/copy-r1');
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/920/';
const copy={};require('vm').runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{window:copy});
const original=require('child_process').execFileSync('git',['show','6568fbe9ebb0ab01bcf2736a8f9331c34b9c8c33:leetcode/920/copy.js'],{encoding:'utf8'});
const base={};require('vm').runInNewContext(original,{window:base});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 try {
 const context=await browser.newContext({viewport:{width:320,height:900}}),page=await context.newPage(),errors=[],states=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(url);await page.locator('#pythonSource').waitFor();
 assert.equal(await page.locator('footer,[data-i18n="foot"]').count(),0,'920-COPY-R1: remove footer and binding');
 assert(!Object.hasOwn(copy.COPY,'foot'),'remove unused key');
 for(const key of Object.keys(base.COPY).filter(k=>k!=='foot'))assert.deepEqual(copy.COPY[key],base.COPY[key],key+' unchanged');
 await page.selectOption('#preset','0');for(let i=0;i<4;i++)await page.locator('#next').click();
 await page.locator('input[value="2"]').check();await page.locator('#reveal').click();
 const table=await page.locator('#tableBody').textContent();
 for(const language of ['zh','en','zh']){
  await page.locator('[data-lang='+language+']').click();
  assert.equal(await page.locator('#tableBody').textContent(),table);
  assert(await page.locator('input[value="2"]').isChecked());assert((await page.locator('#feedback').textContent()).includes('18'));
  const body=await page.locator('body').textContent();for(const old of base.COPY.foot)assert(!body.includes(old));
  for(const key of ['sim','p4','boundaries'])assert.equal(await page.locator('[data-i18n='+key+']').textContent(),base.COPY[key][language==='zh'?0:1]);
  await page.locator('.related a').last().focus();
  assert(await page.locator('.related a').last().evaluate(e=>document.activeElement===e));
  const keyboard=[];
  await page.locator('#copy').focus();
  for(let i=0;i<4;i++){keyboard.push(await page.evaluate(()=>document.activeElement.id||document.activeElement.getAttribute('href')));await page.keyboard.press('Tab');}
  assert.deepEqual(keyboard,['copy','download','../629/#step2','../552/#step2']);
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
  const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bottom:document.querySelector('main').getBoundingClientRect().bottom,bodyBottom:document.body.getBoundingClientRect().bottom}));
  assert(geometry.scrollWidth<=geometry.width);assert(Math.abs(geometry.bottom-geometry.bodyBottom)<=1,'no footer gap');
  const name='page-end-320-'+language+'-'+states.length+'.png';await page.screenshot({path:path.join(out,name)});
  states.push({language,geometry,keyboard,screenshot:name,limitations:['sim','p4','boundaries'],trace:'dp[2][2]=2',prediction:18});
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'focused-browser.json'),JSON.stringify({finding:'920-COPY-R1',type:'author self-check',url,states,errors},null,2)+'\n');
 console.log('PASS 920-COPY-R1: zh → en → zh, footer removal, preserved neighbors/state/keyboard/page end');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
