// Browser check for #1178. Run from the repo root with a local static server:
//   PREVIEW_ROOT=http://127.0.0.1:18770 NODE_PATH=... node leetcode/1178/tests/browser.cjs
const {chromium}=require('playwright');
const BASE=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';
const fail=(msg,data)=>{throw new Error(msg+' '+JSON.stringify(data));};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 for(const width of [320,390,1280])for(const lang of ['en','zh']){
  const page=await browser.newPage({viewport:{width,height:900}});const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(BASE+'/leetcode/1178/',{waitUntil:'networkidle'});
  await page.click(`#langToggle button[data-lang=${lang}]`);
  // Corrected hand example and trap.
  const step0=await page.locator('#step0').textContent(),step1=await page.locator('#step1').textContent();
  if(lang==='en'&&(!step0.includes('c, t, r are not in the puzzle (its o is)')||!step1.includes('puzzle bxyqrsa, first letter b')||!step1.includes('2⁶ = 64')))fail('en copy',{step0,step1});
  if(lang==='zh'&&(!step0.includes('c、t、r 不在谜题中（它的 o 在谜题里）')||!step1.includes('谜题 bxyqrsa，首字母是 b')||!step1.includes('2⁶ = 64')))fail('zh copy',{step0,step1});
  // Trace totals per preset, 64 candidate sets each.
  const expected=[1,3,2];
  for(let i=0;i<3;i++){
   await page.selectOption('#preset',String(i));
   if(!(await page.locator('#prev').isDisabled()))fail('prev should start disabled',{i});
   await page.click('#next');
   await page.click('#end');
   const progress=await page.locator('#progress').textContent();
   if(!progress.includes('64/64')||!progress.trim().endsWith(String(expected[i])))fail('trace total',{i,progress});
   const never=await page.locator('#groupRows tr.never').count(),hit=await page.locator('#groupRows tr.hit').count();
   if(never+hit!==await page.locator('#groupRows tr').count())fail('every group resolved at end',{i,never,hit});
  }
  // Official preset: actor's group is never asked.
  await page.selectOption('#preset','0');await page.click('#end');
  const groups=await page.locator('#groupRows').textContent();
  if(!groups.includes('{a,c,o,r,t}'))fail('actor group',{groups});
  // Fresh quiz: answer hidden until reveal; per-option explanation.
  if(!(await page.locator('#reveal').isDisabled()))fail('reveal before choice',{});
  await page.check('[name=guess][value="3"]');await page.click('#reveal');
  const wrong=await page.locator('#feedback').textContent();
  if(!wrong.includes('oats'))fail('misconception feedback',{wrong});
  await page.check('[name=guess][value="2"]');
  if(await page.locator('#feedback').isVisible())fail('feedback should clear on change',{});
  await page.click('#reveal');
  const feedback=await page.locator('#feedback').textContent();
  if(!(lang==='en'?feedback.startsWith('Correct'):feedback.startsWith('答对了')))fail('quiz',{feedback});
  const geo=await page.evaluate(()=>({cw:document.documentElement.clientWidth,sw:document.documentElement.scrollWidth}));
  if(geo.sw>geo.cw)fail('horizontal overflow',{width,lang,geo});
  const lang2=await page.evaluate(()=>document.documentElement.lang);
  if(lang2!==(lang==='zh'?'zh-CN':'en'))fail('html lang',{lang2});
  const source=await page.evaluate(()=>window.PYTHON_SOURCE);
  if(errors.length||!source.includes('sub = (sub - 1) & rest'))fail('errors/source',{errors});
  console.log(JSON.stringify({width,lang,feedback:feedback.slice(0,20),scrollWidth:geo.sw}));
  await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
