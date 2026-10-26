const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const b=await chromium.launch({headless:true,channel:'chrome'});const rows=[];const log=x=>{rows.push(x);fs.writeFileSync(path.join(__dirname,'ui.json'),JSON.stringify(rows,null,2));console.log(JSON.stringify(x));};try{const p=await b.newPage({viewport:{width:390,height:1000},hasTouch:true});await p.goto('http://127.0.0.1:18927/atlas/galaxy.html?node=oscillation&low=1&lang=zh');await p.waitForTimeout(500);const snap=async(stage)=>log({stage,url:p.url(),text:await p.locator('body').innerText(),controls:await p.locator('button,a,summary').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({tag:e.tagName,text:e.innerText,aria:e.getAttribute('aria-label'),href:e.getAttribute('href')})))});await snap('initial');
 const candidates=await p.getByRole('button').all();let chosen=null;
 for(const c of candidates){if(!await c.isVisible())continue;const name=(await c.innerText())+' '+(await c.getAttribute('aria-label')||'');if(/正弦|余弦/.test(name)&&/为什么|相连|关系|连接/.test(name)){chosen=c;break;}}
 if(!chosen){for(const c of candidates){if(await c.isVisible()&&/正弦|余弦/.test((await c.innerText())+' '+(await c.getAttribute('aria-label')||''))){chosen=c;break;}}}
 if(chosen){log({chosen:await chosen.innerText(),aria:await chosen.getAttribute('aria-label')});await chosen.click();await p.waitForTimeout(250);await snap('selected relation');}
 else log({blocked:'No visible relation button mentioning sine/cosine found; no speculative canvas clicks.'});
 const summaries=await p.locator('summary').all();for(const s of summaries){if(await s.isVisible()&&/为什么|相连|连接/.test(await s.innerText())){await s.click();break;}}
 await snap('reading');
 const details=await p.getByRole('button').all();for(const c of details){if(await c.isVisible()&&/为什么.*(?:连接|相连)|Why this connection/i.test((await c.innerText())+' '+(await c.getAttribute('aria-label')||''))){await c.click();await p.waitForTimeout(200);break;}}
 await snap('note');
 const note=p.getByText(/圆周|真实.*圆|不是.*圆/).first();if(await note.isVisible())await note.scrollIntoViewIfNeeded();await p.screenshot({path:path.join(__dirname,'phone-note.png'),fullPage:false});
 const links=await p.getByRole('link').all();let exp=null;for(const l of links){if(await l.isVisible()&&/投影.*实验|实验.*投影|投影.*交互/.test(await l.innerText())){exp=l;break;}}
 if(exp){log({experiment:await exp.innerText(),href:await exp.getAttribute('href')});await exp.click();await p.waitForTimeout(200);log({stage:'experiment target only',url:p.url(),heading:await p.locator('h1,h2').allTextContents()});await p.goBack();await p.waitForTimeout(200);await snap('Back');}
 else log({experimentNotOpened:'No unambiguous visible projection-experiment link matched; no other course opened.'});
 }finally{await b.close();log({browser:'CLOSED'});}})().catch(e=>{console.error(e);process.exitCode=1});
