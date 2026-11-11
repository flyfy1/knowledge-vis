// Browser check for #1172. Run from the repo root:
//   PREVIEW_ROOT=http://127.0.0.1:18770 NODE_PATH=... node leetcode/1172/tests/browser.cjs
const {chromium}=require('playwright');
const BASE=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';
const fail=(m,d)=>{throw new Error(m+' '+JSON.stringify(d));};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
for(const width of [320,390,1280])for(const lang of ['en','zh']){
 const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto(BASE+'/leetcode/1172/',{waitUntil:'networkidle'});await page.click(`#langToggle [data-lang=${lang}]`);
 if(!(await page.locator('#handOp').textContent()).length)fail('step 0 stage empty before first click',{});
 // Step 1: holes at 1 then 0; next pushes go 0, 1, then 3.
 await page.click('#hole1');await page.click('#hole0');
 const targets=[];for(let k=0;k<3;k++){targets.push(await page.locator('#holeTarget').textContent());await page.click('#push1');}
 const want=lang==='en'?['stack 0','stack 1','stack 3']:['第 0 栈','第 1 栈','第 3 栈'];
 want.forEach((w,k)=>{if(!targets[k].includes(w))fail('hole target',{k,targets});});
 // Step 2 starts with identical states and only diverges after the hole.
 if(await page.locator('#rightState').textContent()!=='[1,2] [3,4]')fail('right state before hole',{});
 await page.click('#makeHole');await page.click('#compare');
 if(await page.locator('#rightState').textContent()!=='[1,5] [3,4]')fail('right state after push',{});
 // Step 3 fresh scene: pick 9, reveal says right and quotes [7,10].
 for(let k=0;k<3;k++)await page.click('#change');
 await page.getByRole('button',{name:'8',exact:true}).click();await page.click('#reveal');
 const wrong=await page.locator('#feedback').textContent();
 await page.getByRole('button',{name:'9',exact:true}).click();await page.click('#reveal');
 const fb=await page.locator('#feedback').textContent();
 if(!fb.includes('[7,10]')||fb.includes('[8,10]')||!(lang==='en'?fb.startsWith('Your prediction is right'):fb.startsWith('你的预测正确'))||!(lang==='en'?wrong.includes('You predicted 8'):wrong.includes('你的预测是 8')))fail('quiz',{fb,wrong});
 await page.click('#runCheck');await page.waitForFunction(()=>document.querySelector('#checkResult').textContent.length>0);
 const check=await page.locator('#checkResult').textContent();if(check.startsWith('Mismatch'))fail('check',{check});
 const href=await page.locator('#step5 a').getAttribute('href');if(href!=='../23/#step1')fail('related',{href});
 const geo=await page.evaluate(()=>({cw:document.documentElement.clientWidth,sw:document.documentElement.scrollWidth}));if(geo.sw>geo.cw)fail('overflow',geo);
 if(errors.length)fail('errors',errors);
 console.log(JSON.stringify({width,lang,fb:fb.slice(0,30),sw:geo.sw}));await page.close();}
await browser.close();})().catch(e=>{console.error(e);process.exit(1);});
