'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.LESSON_BASE_URL||'http://127.0.0.1:18863';
const out=process.env.LESSON_SCREENSHOTS||'/tmp/frozen-learning-after';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),checks=[],errors=[];
 try{
  for(const width of [320,390,1280]){
   const context=await browser.newContext({viewport:{width,height:844},isMobile:width<640,hasTouch:width<640,deviceScaleFactor:1,reducedMotion:'reduce'});
   const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
   await p.goto(base+'/frozen-bubble/');
   for(const lang of ['zh','en']){
    await p.locator(`[data-lang=${lang}]`).click();
    assert.match(await p.locator('.development-credit').textContent(),/Codex/);
    assert.equal(await p.locator('[data-i18n]').evaluateAll(es=>es.filter(e=>!e.textContent.trim()||e.textContent==='undefined').length),0);
    assert.ok(await p.locator('.research-source').evaluate(e=>Boolean(e.compareDocumentPosition(document.querySelector('.comparison'))&Node.DOCUMENT_POSITION_FOLLOWING)));
    assert.match(await p.locator('.research-source').textContent(),/Ahmadi.*How soap bubbles freeze/s);
    await p.locator('#growth-reset').click();await p.locator('#seed').click();
    await p.locator('#growth-time').evaluate(e=>{e.value=10;e.dispatchEvent(new Event('input',{bubbles:true}));});
    await p.locator('#undercooling').evaluate(e=>{e.value=2;e.dispatchEvent(new Event('input',{bubbles:true}));});
    const low=await p.locator('#growth').evaluate(e=>e.toDataURL());
    await p.locator('#undercooling').scrollIntoViewIfNeeded();
    await p.locator('#undercooling').focus();await p.keyboard.press('End');
    assert.equal(await p.locator('#undercooling').inputValue(),'18');
    assert.equal(await p.locator('#growth-readout').getAttribute('data-time'),'10');
    assert.notEqual(await p.locator('#growth').evaluate(e=>e.toDataURL()),low);
    if(width<640){
      const boxes=await p.locator('#growth,#undercooling').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom};}));
      assert.ok(boxes.every(b=>b.top>=65 && b.bottom<=844),'Mobile growth and changed slider are visible together');
    }
    await p.screenshot({path:path.join(out,`${lang}-${width}-growth-control.png`)});
    const click=async selector=>width<640?p.locator(selector).tap():p.locator(selector).click();
    for(const [moment,phase] of [[4,1],[12,2],[24,3]]){
      await click(`[data-moment="${moment}"]`);
      assert.equal(await p.locator('#compare-readout').getAttribute('data-time'),String(moment));
      assert.equal(await p.locator('#compare-play').getAttribute('aria-pressed'),'false');
      assert.equal(await p.locator('#cold-observation').getAttribute('data-phase'),String(phase));
      if(width<640){
        for(const mode of ['cold','warm']){
          await click(`[data-scene="${mode}"]`);
          assert.equal(await p.locator('#compare-readout').getAttribute('data-time'),String(moment));
          assert.equal(await p.locator(`#${mode}-scene`).isVisible(),true);
          assert.equal(await p.locator(`#${mode==='cold'?'warm':'cold'}-scene`).isVisible(),false);
          await p.locator('.scene-picker').evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));
          await p.evaluate(()=>scrollBy(0,-144));
          const bounds=await p.locator('.phase-buttons,#'+mode).evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom};}));
          assert.ok(bounds.every(b=>b.top>=65&&b.bottom<=844),'Story buttons and active canvas are visible together');
          await p.screenshot({path:path.join(out,`${lang}-${width}-${mode}-${moment}.png`)});
        }
      }
    }
    if(width===1280){await p.locator('.comparison').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`${lang}-desktop-compare.png`)});}
    await p.locator('#compare-reset').click();assert.equal(await p.locator('#warm-observation').getAttribute('data-phase'),'0');
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    checks.push(`${lang}/${width}: source before comparison, localized credit, growth slider visible with changing canvas, touch/key controls, paused story moments, A/B same-time switching and reset`);
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'teaching.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
