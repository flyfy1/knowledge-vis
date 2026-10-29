'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.ATLAS_BASE_URL||'http://127.0.0.1:18769';
const output=process.env.ATLAS_EVIDENCE||'/tmp/math-physics-atlas-evidence';fs.mkdirSync(output,{recursive:true});
let checks=0;function ok(v,m){assert.ok(v,m);checks++;}
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const errors=[],requests=[];
 try{
  const context=await browser.newContext({viewport:{width:1512,height:1100},locale:'en-US'});
  const p=await context.newPage();p.on('pageerror',e=>errors.push(String(e)));
  p.on('request',r=>{if(r.frame()===p.mainFrame()&&p.url().includes('/atlas/'))requests.push(r.url());});
  await p.goto(base+'/atlas/');
  const data=await p.evaluate(()=>window.ATLAS);
  assert.ok(data.nodes.length>=39);assert.ok(data.edges.length>=51);
  assert.equal(new Set(data.nodes.map(n=>n.id)).size,data.nodes.length);
  for(const e of data.edges){ok(data.nodes.some(n=>n.id===e.from)&&data.nodes.some(n=>n.id===e.to),'edge endpoints');ok(e.reason.en&&e.reason.zh&&e.source,'edge evidence');}
  for(const r of data.trails)for(let i=1;i<r.nodes.length;i++)ok(data.edges.some(e=>[e.from,e.to].includes(r.nodes[i-1])&&[e.from,e.to].includes(r.nodes[i])),'route adjacent concepts are connected');
  // Validate actual internal section destinations independently of UI selection.
  for(const href of new Set([...data.nodes,...data.edges].map(x=>x.source).filter(x=>x.startsWith('../')))){
   const u=new URL(href,base+'/atlas/'),response=await p.request.get(u.href.split('#')[0]);ok(response.ok(),'source HTTP '+href);
   if(u.pathname.includes('/power-converters/')){const content=await p.request.get(base+'/power-converters/app.js');ok((await content.text()).includes('section('+u.hash.slice(5)+','),'generated source anchor '+href);}else ok((await response.text()).includes('id="'+u.hash.slice(1)+'"'),'source anchor '+href);
  }
  // Main user loop, actual navigation to evidence, and Back restoration.
  await p.locator('#search').fill('Fourier');await p.locator('[data-result=fourier]').click();
  assert.equal(await p.locator('#detailTitle').innerText(),'Fourier analysis');
  await p.locator('[data-edge="fourier:convolution"] .evidence-link').click();
  ok(p.url().endsWith('/convolution/#step6'),'source opens convolution theorem');
  ok(await p.locator('#step6').count(),'actual lesson section');await p.goBack();
  assert.equal(await p.locator('#search').inputValue(),'Fourier');
  await p.locator('[data-target=convolution]').click();
  assert.equal(await p.locator('#detailTitle').innerText(),'Convolution');
  assert.equal(await p.locator('#search').inputValue(),'');
  await p.goBack();assert.equal(await p.locator('#detailTitle').innerText(),'Fourier analysis');assert.equal(await p.locator('#search').inputValue(),'Fourier');
  // Every concept and relation is present in both languages with a usable destination.
  for(const lang of ['en','zh']){
   await p.locator(`[data-lang=${lang}]`).click();
   for(const n of data.nodes){
    await p.goto(base+'/atlas/?node='+n.id+'&view=list');
    assert.equal(await p.locator('#detailTitle').innerText(),n.title[lang]);
    assert.equal(await p.locator('.primary-link').getAttribute('href'),n.source);
    assert.equal(await p.locator('.relation').count(),data.edges.filter(e=>e.from===n.id||e.to===n.id).length);
    ok((await p.locator('#detail .definition').innerText()).length>15,'definition rendered');
   }
  }
  for(const lang of ['en','zh'])for(const width of [320,390,768,1512]){
   await p.setViewportSize({width,height:1000});await p.goto(base+'/atlas/');await p.locator(`[data-lang=${lang}]`).click();
   ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no page overflow '+width+' '+lang);
   if(width<700)ok(await p.locator('#listView').isVisible(),'mobile default list');
   await p.locator('[data-trail=waves]').click();await p.locator('#trail button').nth(2).click();
   assert.equal(await p.locator('#detailTitle').innerText(),data.nodes.find(n=>n.id==='fourier').title[lang]);
   await p.locator('[data-view=graph]').click();
   await p.locator('[data-node=sine]').click();
   assert.equal(await p.locator('#detailTitle').innerText(),data.nodes.find(n=>n.id==='sine').title[lang]);
   if(width<=1000){ok((await p.locator('#detailTitle').boundingBox()).y<200,'stacked map selection reaches explanation');assert.equal(await p.evaluate(()=>document.activeElement.id),'detailTitle');}
   await p.locator('#group').selectOption('measurement');ok(await p.locator('#listView').isVisible(),'category shows filtered list');assert.equal(await p.locator('.result:visible').count(),6);
   ok(await p.locator('.outside-note').isVisible(),'outside-selection explanation');
   await p.locator('#search').fill('zzzz-no-match');ok(await p.locator('#empty').isVisible(),'no result');
   await p.locator('#emptyReset').click();assert.equal(await p.locator('.result:visible').count(),data.nodes.length);assert.equal(await p.evaluate(()=>document.activeElement.id),'search');
   await p.locator('#search').fill(lang==='en'?'卷积':'convolution');ok(await p.locator('[data-result=convolution]').isVisible(),'cross-language search');
   await p.locator('#reset').click();await p.locator('[data-view=graph]').click();
   await p.locator('[data-node=fourier]').focus();await p.keyboard.press('Enter');
   ok(new URL(p.url()).searchParams.get('node')==='fourier','keyboard selection');
   // Native disclosure keyboard access and language state retention.
   const summary=p.locator('[data-edge="fourier:convolution"] summary');await summary.focus();
   await p.keyboard.press('Enter');const opened=await summary.locator('..').getAttribute('open');
   await p.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.equal(await p.locator('[data-edge="fourier:convolution"]').getAttribute('open'),opened);
   await p.locator(`[data-lang=${lang}]`).click();
   await p.evaluate(()=>scrollTo(0,0));
   if([390,1512].includes(width))await p.screenshot({path:path.join(output,`${lang}-${width}.png`),fullPage:true});
  }
  await p.setViewportSize({width:640,height:1000});await p.goto(base+'/atlas/?node=gaussian&view=list');
  await p.evaluate(()=>document.documentElement.style.fontSize='32px');
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% text zoom no page overflow');
  await p.evaluate(()=>{ATLAS.nodes.find(n=>n.id==='gaussian').title.en='A'.repeat(120);});await p.locator('[data-lang=en]').click();
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'long unbroken title wraps');
  await p.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await p.locator('#search').focus();
  ok(await p.locator('#search').evaluate(e=>getComputedStyle(e).outlineStyle!=='none'),'forced-color focus retained');
  const blocked=await browser.newContext({viewport:{width:320,height:800},locale:'zh-CN'});
  await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('denied');}});});
  const q=await blocked.newPage();q.on('pageerror',e=>errors.push(String(e)));
  await q.goto(base+'/atlas/?node=missing');ok(await q.locator('#invalid').isVisible(),'invalid node notice');await q.locator('[data-lang=en]').click();assert.equal(await q.locator('#detailTitle').innerText(),'Fourier analysis');
  await q.locator('[data-result=sine]').click();ok(await q.locator('#invalid').isHidden(),'invalid notice clears');
  const nojs=await browser.newContext({javaScriptEnabled:false});const fallback=await nojs.newPage();await fallback.goto(base+'/atlas/');ok(await fallback.locator('noscript').isVisible(),'no JS fallback');
  assert.deepEqual(errors,[]);
  const remote=requests.filter(u=>!u.startsWith(base)&&!u.startsWith('data:'));assert.deepEqual(remote,[]);
  const report={checks,concepts:data.nodes.length,relations:data.edges.length,locales:['en','zh'],widths:[320,390,768,1512],errors,externalRuntimeRequests:remote,limits:['No physical-device or screen-reader speech test','No learning-effect claim'],base};
  fs.writeFileSync(path.join(output,'browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
