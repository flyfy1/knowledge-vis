const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const out=process.env.LESSON_EVIDENCE_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});const p=await b.newPage({viewport:{width:390,height:1000}});const records=[];await p.goto((process.env.LESSON_PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/864/');await p.waitForFunction(()=>document.querySelector('#frameRead').textContent.includes('target='));
for(const l of ['zh','en']){
 await p.locator(`[data-lang=${l}]`).click();await p.selectOption('#preset','0');await p.locator('#traceNext').click();await p.locator('#traceNext').click();
 assert((await p.locator('#frameRead').textContent()).includes('d=2'));
 const events=await p.locator('#events').textContent();assert(events.includes(l==='en'?'New key':'拿到新钥匙'));assert(events.includes(l==='en'?'already discovered':'已发现'));
 records.push({locale:l,state:'@.aA at distance 2 before terminal detection',frame:await p.locator('#frameRead').textContent(),events});
 await p.selectOption('#preset','4');await p.locator('#traceNext').click();const blocked=await p.locator('#events').textContent();assert(blocked.includes(l==='en'?'Missing matching key':'尚无对应钥匙'));assert((await p.locator('#frameRead').textContent()).includes('-1'));records.push({locale:l,state:'@Aa exhausted',events:blocked,frame:await p.locator('#frameRead').textContent()});
 await p.locator('[name=prediction][value="0"]').check();await p.locator('#reveal').click();let text=await p.locator('#predictionFeedback').textContent();assert(text.includes('2+4'));assert(text.includes(l==='en'?'full state':'完整状态'));records.push({locale:l,state:'wrong prediction',text});
 await p.locator('[name=prediction][value="1"]').check();assert(!(await p.locator('#predictionFeedback').textContent()).includes('2+4'));await p.locator('#reveal').click();text=await p.locator('#predictionFeedback').textContent();assert(text.startsWith(l==='en'?'Correct.':'正确。'));records.push({locale:l,state:'correct prediction',text});
 await p.locator('#predictionFeedback').scrollIntoViewIfNeeded();await p.locator('#step3 .stage').screenshot({path:path.join(out,`prediction-${l}.png`)});
 await p.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw Error('expected fallback');};});await p.locator('#copyPython').click();text=await p.locator('#copyStatus').textContent();assert(text.includes(l==='en'?'system copy shortcut':'系统复制快捷键'));assert(!text.includes('2+4'));records.push({locale:l,state:'clipboard fallback, distinct from algorithm feedback',text});
 await p.locator('.site-head').scrollIntoViewIfNeeded();await p.locator('.site-head').screenshot({path:path.join(out,`header-${l}.png`)});
}
fs.writeFileSync(path.join(out,'semantic-binding.json'),JSON.stringify({authorSelfCheck:true,status:'pass',records},null,2)+'\n');await b.close();console.log('Focused bilingual semantic binding passed');})().catch(e=>{console.error(e);process.exit(1);});
