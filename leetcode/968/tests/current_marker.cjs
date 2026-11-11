// 968-R1: current operation must remain visible when it installs a camera.
const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
const out=path.resolve(process.env.LESSON_EVIDENCE_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
 try {
 const page=await browser.newPage({viewport:{width:1280,height:900}}),rows=[];
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(process.env.LESSON_PREVIEW_URL||'http://127.0.0.1:18791/leetcode/968/');
 await page.locator('#progress').filter({hasText:'0/'}).waitFor();
 async function check(label,current,older,count,progress){
  const nodes=await page.locator('#tree g').evaluateAll(gs=>gs.map(g=>({text:g.textContent,current:g.classList.contains('current'),camera:g.classList.contains('camera'),stroke:getComputedStyle(g.querySelector('circle')).stroke,width:getComputedStyle(g.querySelector('circle')).strokeWidth})));
  const active=nodes.filter(n=>n.current);assert.equal(active.length,1);assert.equal(active[0].text,current);
  assert.equal(active[0].stroke,'rgb(255, 180, 84)',`${label}: current outline must be orange`);assert.equal(active[0].width,'4px');
  assert.equal(nodes.filter(n=>n.camera).length,count);assert.match(await page.locator('#progress').textContent(),progress);
  if(older){const prior=nodes.find(n=>n.text===older);assert(prior.camera);assert(!prior.current);assert.equal(prior.stroke,'rgb(110, 231, 255)');assert.equal(prior.width,'3px');}
  rows.push({label,nodes,progress:await page.locator('#progress').textContent(),ledger:await page.locator('#ledger').textContent()});
 }
 for(const width of [1280,320])for(const lang of ['en','zh']){
  await page.setViewportSize({width,height:900});await page.locator(`[data-lang=${lang}]`).click();
  await page.selectOption('#preset','4');for(let i=0;i<6;i++)await page.locator('#next').click();
  await check(`${lang}-${width}-two-cameras`,'C:K','B:K',2,/6\/7/);
  await page.locator('#prev').click();await check(`${lang}-${width}-rewind`,'G:N','B:K',1,/5\/7/);
  await page.locator('#next').click();await check(`${lang}-${width}-replay`,'C:K','B:K',2,/6\/7/);
  await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();await page.locator(`[data-lang=${lang}]`).click();
  await check(`${lang}-${width}-locale-roundtrip`,'C:K','B:K',2,/6\/7/);
  await page.locator('#treeWrap').evaluate(el=>el.scrollLeft=el.scrollWidth);
  await page.locator('#treeWrap').screenshot({path:path.join(out,`${lang}-${width}-current-camera.png`)});
  if(width===320){
   await page.locator('#treeWrap').evaluate(el=>el.scrollLeft=0);
   await page.locator('#treeWrap').screenshot({path:path.join(out,`${lang}-${width}-older-camera.png`)});
  }
  await page.selectOption('#preset','3');for(let i=0;i<4;i++)await page.locator('#next').click();
  await check(`${lang}-${width}-before-root-repair`,'A:N','C:K',1,/4\/5/);
  await page.locator('#next').click();await check(`${lang}-${width}-root-repair`,'A:K','C:K',2,/5\/5/);
  await page.locator('#treeWrap').evaluate(el=>el.scrollLeft=100);
  await page.locator('#treeWrap').screenshot({path:path.join(out,`${lang}-${width}-root-repair.png`)});
  await page.locator('#prev').click();await check(`${lang}-${width}-undo-root-repair`,'A:N','C:K',1,/4\/5/);
  await page.locator('#next').click();await check(`${lang}-${width}-replay-root-repair`,'A:K','C:K',2,/5\/5/);
  await page.selectOption('#preset','0');for(let i=0;i<3;i++)await page.locator('#next').click();
  await check(`${lang}-${width}-default-installation`,'B:K',null,1,/3\/4/);
 }
 fs.writeFileSync(path.join(out,'current-marker-results.json'),JSON.stringify({kind:'author self-check',finding:'968-R1',host:process.platform,result:'pass',rows},null,2));
 console.log('968-R1 current marker pass: both locales, desktop/narrow, camera overlap, root repair, rewind/replay');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
