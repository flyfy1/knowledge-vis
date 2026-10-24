const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const acorn=require('acorn');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'), evidence=path.join(__dirname,'evidence','r3-fenwick');
fs.mkdirSync(evidence,{recursive:true});
// Check definitions including later assignments in each locale namespace.
const definitions={zh:new Set(),en:new Set()};
const ast=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'});
function record(locale,key){assert.ok(!definitions[locale].has(key),`duplicate ${locale}.${key}`);definitions[locale].add(key)}
function walk(n){
 if(!n||typeof n!=='object')return;
 if(n.type==='ObjectExpression'){
  const keys=n.properties.filter(p=>p.type==='Property').map(p=>p.key.name??p.key.value);
  assert.equal(new Set(keys).size,keys.length,'duplicate object key');
  for(const p of n.properties)if(['zh','en'].includes(p.key?.name)&&p.value.type==='ObjectExpression')for(const prop of p.value.properties)record(p.key.name,prop.key.name??prop.key.value);
 }
 if(n.type==='AssignmentExpression'&&n.left.type==='MemberExpression'){
  const obj=n.left.object;
  if(obj.type==='MemberExpression'&&['zh','en'].includes(obj.property.name)&&obj.object.type==='MemberExpression'&&obj.object.property.name==='LEETCODE_COPY')record(obj.property.name,n.left.property.value??n.left.property.name);
 }
 for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);
}
walk(ast);assert.deepEqual([...definitions.zh].sort(),[...definitions.en].sort());
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const page=await browser.newPage({viewport:{width:1280,height:900}}), errors=[], records=[];
 page.on('pageerror',e=>errors.push(e.message));
 const url=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/315/';
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#bitRows').children.length===5);
 const includes=async(id,s)=>assert.ok((await page.locator(id).innerText()).includes(s),`${id}: missing ${s}`);
 const cells=async()=>page.locator('#bitRows tr').evaluateAll(rows=>rows.map(r=>[...r.children].map(c=>c.textContent)));
 for(const locale of ['en','zh']){
  await page.click(`[data-lang=${locale}]`);await page.click('#resetBit');
  const before=await cells();
  assert.deepEqual(before.map(r=>r.slice(0,4)),[['bit[1]','[1, 1]','1','1'],['bit[2]','[1, 2]','3','3'],['bit[3]','[3, 3]','1','1'],['bit[4]','[1, 4]','4','4'],['bit[5]','[5, 5]','1','1']]);
  await page.locator('#rankRange').fill('4');
  await includes('#bitReadout','bit[3] (3..3) = 1 + bit[2] (1..2) = 3');
  await includes('#bitReadout',locale==='en'?'Fenwick nodes':'树状数组格子');
  await page.click('#applyBit');assert.ok(await page.locator('#applyBit').isDisabled());
  assert.deepEqual((await cells()).map(r=>r[3]),['1','4','1','5','1']);
  await includes('#updateReadout','3→4');await includes('#updateReadout','4→5');
  for(const [rank,total,reads] of [[1,0,0],[2,1,1],[3,4,1],[4,5,2],[5,5,1]]){
   await page.locator('#rankRange').fill(String(rank));await includes('#bitReadout',`prefix(rank−1): ${total}`);
   assert.equal(await page.locator('#fenwickCost').innerText(),String(reads));
  }
  await page.click(`[data-lang=${locale==='en'?'zh':'en'}]`);
  assert.ok(await page.locator('#applyBit').isDisabled());assert.deepEqual((await cells()).map(r=>r[3]),['1','4','1','5','1']);
  await page.click(`[data-lang=${locale}]`);await page.click('#resetBit');
  assert.deepEqual((await cells()).map(r=>r[3]),['1','3','1','4','1']);
  await page.locator('#rankRange').fill('4');await page.locator('#rankRange').focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#rankRange').inputValue(),'5');
  await page.locator('#applyBit').focus();await page.keyboard.press('Enter');assert.ok(await page.locator('#applyBit').isDisabled());
  await page.click('#transferReset');assert.ok(await page.locator('#transferReveal').isDisabled());
  assert.equal(await page.locator('#transferFeedback').innerText(),'');
  for(const choice of ['equal','leaf','rank','strict']){
   await page.check(`[name=transfer][value=${choice}]`);
   assert.equal(await page.locator('#transferFeedback').innerText(),'');
   await page.locator('#transferReveal').focus();await page.keyboard.press('Enter');
   await includes('#transferFeedback','[0,2,1,3]');
   const text=await page.locator('#transferFeedback').innerText();
   assert.equal(text.startsWith(locale==='en'?'Correct.':'正确。'),choice==='strict');
   if(choice!=='strict')assert.ok(text.startsWith({equal:'B',leaf:'C',rank:'D'}[choice]));
   await page.click(`[data-lang=${locale==='en'?'zh':'en'}]`);assert.ok(await page.locator(`[name=transfer][value=${choice}]`).isChecked());
   await includes('#transferFeedback','[0,2,1,3]');await page.click(`[data-lang=${locale}]`);
   records.push({locale,choice,feedback:text});
  }
  for(const width of [320,390,1280]){
   await page.setViewportSize({width,height:900});
   for(const target of ['#step3 .stage','#step4 .stage:has(#transferFeedback)']){
    await page.locator(target).scrollIntoViewIfNeeded();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const geometry=await page.locator(target).evaluate(el=>{
     const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),spans=[];let node;
     while(node=walker.nextNode()){if(!node.textContent.trim()||node.parentElement.closest('.table-wrap'))continue;const r=document.createRange();r.selectNodeContents(node);for(const rect of r.getClientRects())if(rect.width&&rect.height)spans.push({text:node.textContent.trim(),x:rect.x,right:rect.right,y:rect.y,bottom:rect.bottom});}return spans;
    });
    assert.ok(geometry.every(r=>r.x>=0&&r.right<=width+1),'text outside viewport');
    const name=target.includes('step3')?'tree':'transfer';
    if(name==='tree'){const region=page.locator('#step3 .table-wrap');await region.evaluate(el=>el.scrollLeft=0);if(width<520){await region.focus();await page.keyboard.press('End');await region.evaluate(el=>el.scrollLeft=el.scrollWidth);assert.ok(await region.evaluate(el=>el.scrollLeft>0));await region.screenshot({path:path.join(evidence,`${locale}-${width}-table-right.png`)});await region.evaluate(el=>el.scrollLeft=0);}}
    await page.locator(target).screenshot({path:path.join(evidence,`${locale}-${width}-${name}.png`)});
    records.push({locale,width,state:name,geometry});
   }
   assert.ok(await page.locator('[name=transfer][value=strict]').isChecked());await includes('#transferFeedback','[0,2,1,3]');
  }
  await page.setViewportSize({width:1280,height:900});await page.evaluate(()=>document.body.style.zoom='2');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#step3 .stage').screenshot({path:path.join(evidence,`${locale}-zoom200-tree.png`)});
  await page.locator('#step4 .stage:has(#transferFeedback)').screenshot({path:path.join(evidence,`${locale}-zoom200-transfer.png`)});
  await page.evaluate(()=>document.body.style.zoom='');
  await page.click('#transferReset');assert.ok(await page.locator('#transferReveal').isDisabled());
  assert.equal(await page.locator('#transferFeedback').innerText(),'');assert.equal(await page.locator('[name=transfer]:checked').count(),0);
 }
 // Verify served candidate assets; canonical and mirror stay byte-identical offline too.
 for(const file of ['index.html','app.js','copy.js','core.js','review-fixes.css','solution.py','python-code.js']){
  const response=await page.request.get(new URL(file,url).href);assert.equal(response.status(),200);
  assert.deepEqual(await response.body(),fs.readFileSync(path.join(root,file)));
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(evidence,'browser-r3.json'),JSON.stringify({status:'author self-check; independent re-review pending',errors,records},null,2)+'\n');
 await browser.close();console.log('PASS R315-4/R315-5 author checks: cell intervals, old/new updates, prefix partition, transfer wrong/correct/reset, locale/resize retention, keyboard, 320/390/1280, 200% CSS zoom, served bytes');
})().catch(e=>{console.error(e);process.exit(1)});
