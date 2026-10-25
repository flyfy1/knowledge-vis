// Focused author regression for 726-R1; never writes outside OUTPUT_DIR.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const {spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence/review-r1');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const run=spawnSync('python3',['-B','-c',`
import json,re,pathlib,tracemalloc
p=pathlib.Path(${JSON.stringify(root)})
ns={}
exec(re.search(r'const baseline=\x60(.*?)\x60;', (p/'app.js').read_text(), re.S).group(1),ns)
rows=[]
for formula,depth,expected in [('H1000',0,{'H':1000}),('H100000',0,{'H':100000}),('(H2O)3',1,{'H':6,'O':3})]:
    tracemalloc.start()
    actual=ns['expanded_counts'](formula)
    _,peak=tracemalloc.get_traced_memory()
    tracemalloc.stop()
    assert actual==expected,(formula,actual)
    rows.append(dict(formula=formula,n=len(formula),d=depth,A=sum(actual.values()),counts=actual,peakBytes=peak))
print(json.dumps(rows))
`],{encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
 const baseline=JSON.parse(run.stdout),observations=[],failures=[];
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try {
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:18784/leetcode/726/');
  for(const locale of ['en','zh'])for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:1000});
   await page.click(`[data-lang=${locale}]`);
   const cost=page.locator('[data-i18n=baselineCost]');
   const text=await cost.textContent();
   if(!text.includes('O(n + A·(d+1))'))failures.push(`${locale}/${width}: missing base-level expansion term`);
   if(!text.includes('d = 0'))failures.push(`${locale}/${width}: missing zero-depth boundary`);
   if(!text.includes(locale==='en'?'building and tallying A entries':'构建并统计 A 个条目'))failures.push(`${locale}/${width}: missing base-level work explanation`);
   if(text.includes('O(n + A·d)'))failures.push(`${locale}/${width}: retains incorrect bound`);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await cost.scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(out,`baseline-${locale}-${width}.png`)});
   observations.push({locale,width,text});
  }
  for(const locale of ['en','zh']){
   await page.click(`[data-lang=${locale}]`);
   assert.equal(await page.locator('[data-i18n=handLedger]').textContent(),'Mg: 1　+　( O: 1, H: 1 ) × 2　→　H: 2, Mg: 1, O: 2');
   await page.selectOption('#preset','2');
   for(let i=0;i<8;i++)await page.click('#next');
   const event=await page.locator('#event').textContent();
   assert(event.includes('O: 1 + 3 × 2 = 7'));
   assert.equal(await page.locator('#history li').count(),8);
   assert.equal(await page.locator('#history li').last().textContent(),event);
   assert((await page.locator('#progress').textContent()).includes('8/10'));
   assert((await page.locator('#progress').textContent()).includes('11/13'));
   assert((await page.locator('#output').textContent()).includes(locale==='en'?'not emitted yet':'尚未排序输出'));
   assert((await page.locator('#afterMaps .map-values').nth(0).textContent()).includes('K: 4'));
   assert((await page.locator('#afterMaps .map-values').nth(1).textContent()).includes('O: 7'));
   await page.check('[name=prediction][value="1"]');await page.click('#reveal');
   assert((await page.locator('#feedback').textContent()).includes('HHe6NaO3'));
   await page.selectOption('#preset','0');
   assert.equal(await page.locator('#history li').count(),0);
   assert(await page.locator('#feedback').isVisible()); // independent prediction scope
   await page.check('[name=prediction][value="0"]');
   assert(await page.locator('#feedback').isHidden());
   await page.click(`[data-lang=${locale==='en'?'zh':'en'}]`);
   assert(await page.locator('[name=prediction][value="0"]').isChecked());
   await page.click(`[data-lang=${locale}]`);
   observations.push({locale,frame:8,history:8,event,predictionScope:'independent; answer change clears feedback; locale preserves choice'});
   await page.setViewportSize({width:390,height:1100});
   await page.evaluate(()=>document.body.style.zoom='2');
   await page.locator('[data-i18n=baselineCost]').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:path.join(out,`baseline-${locale}-zoom200.png`),fullPage:true});
   await page.evaluate(()=>document.body.style.zoom='');
  }
  const report={finding:'726-R1',result:failures.length?'fail':'pass',baseline,observations,failures,browser:await browser.version(),host:process.platform};
  fs.writeFileSync(path.join(out,'regression.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
  assert.deepEqual(failures,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
