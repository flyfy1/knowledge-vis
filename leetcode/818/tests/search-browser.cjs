'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),C=require('../core.js');
const out=path.join(__dirname,'evidence/search-r1'),base=process.env.PREVIEW_URL||'http://127.0.0.1:18770';
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[],records=[];
 p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/leetcode/818/');
 const click=id=>p.locator('#'+id).click(),lang=l=>p.locator('[data-lang='+l+']').click(),txt=id=>p.locator('#'+id).textContent();
 const state=x=>`(p,s)=(${x.p},${x.s}) · g=${x.g}, h=${x.h}, f=${x.f}`;
 const reset=async()=>{if(!await p.locator('#searchReset').isDisabled())await click('searchReset');};
 const snapshot=()=>p.locator('#searchStage').innerHTML();
 for(const l of ['en','zh']){
  await lang(l);
  // Set all old interactions, then ensure the new preset/control path is isolated.
  await click('reset');await click('a');await p.locator('#preset').selectOption('6');await click('next');await p.locator('[name=prediction][value="1"]').check();await click('reveal');
  const old=[await txt('handRead'),await txt('frameRead'),await txt('feedback')];
  for(const target of [6,3,5]){
   await p.locator('#searchPreset').selectOption(String(target));
   assert(await p.locator('#searchPrev').isDisabled());assert(await p.locator('#searchReset').isDisabled());
   const frames=C.searchTrace(target);let before=await snapshot();
   for(let at=0;at<frames.length;at++){
    if(at)await click('searchNext');
    const f=frames[at];
    const read=await txt('searchRead');
    assert(read.includes(`${at}/${frames.length-1}`));
    assert(read.includes(l==='en'?`${f.expanded} state expansions, ${f.generated} heap entries generated, ${f.discovered} distinct pairs`:`展开 ${f.expanded} 个状态，生成 ${f.generated} 个堆条目，发现 ${f.discovered} 个不同数对`));
    assert.equal(await txt('searchCurrent'),f.current?state(f.current):l==='en'?'Initial: no pop yet':'初始：未取出');
    const children=await p.locator('#searchChildren li').allTextContents();
    if(f.children.length)for(let i=0;i<2;i++){
     const x=f.children[i];assert(children[i].startsWith(x.command+' → '+state(x)));
     const label={new:['新发现：入队','New: queued'],improved:['更小 g：更新并入队','Improved g: updated and queued'],notBetter:['非更优：不入队','Not better: not queued']}[x.status][l==='en'?1:0];assert(children[i].includes(label));
     if(x.previous!==undefined)assert(children[i].includes(l==='en'?`Previous best g=${x.previous}`:`原 best g=${x.previous}`));
    }
    const frontier=await p.locator('#searchFrontier li').allTextContents();assert.equal(frontier.length,f.frontier.length);frontier.forEach((row,i)=>assert(row.startsWith(state(f.frontier[i]))));
    assert.equal(await p.locator('#searchHistory li').count(),at);
    const now=await snapshot();
    if(at){await click('searchPrev');assert.equal(await snapshot(),before);await click('searchNext');assert.equal(await snapshot(),now);}
    await lang(l==='en'?'zh':'en');await lang(l);assert.equal(await snapshot(),now);before=now;
    if(at===1||f.children.some(x=>x.status==='improved')||f.kind==='goal')records.push({locale:l,target,at,current:await txt('searchCurrent'),read,children,frontier});
   }
   assert(await p.locator('#searchNext').isDisabled());assert(await p.locator('#searchEnd').isDisabled());
   assert((await txt('searchRead')).includes(l==='en'?'Goal popped':'目标已取出'));
   assert.equal(await p.locator('#searchChildren li').count(),1);assert((await txt('searchChildren')).includes(l==='en'?'generates no children':'无需展开子边'));
   await reset();await click('searchEnd');assert.equal(await snapshot(),before);
  }
  assert.deepEqual([await txt('handRead'),await txt('frameRead'),await txt('feedback')],old);
  // Formula operands and scope in actual localized text, after interaction.
  for(const [key,required] of Object.entries({accel:['v*(2**k-1)','2+4+8=14'],toward:['q=(d+v-1)//v','2**k-1≥q','q.bit_length()','h=2'],away:['1+d.bit_length()','(7,8)','h=1+1=2'],heapOrder:['(f,-g,position,speed)'],cost:['O(Q log Q)','O(D·2^D)','O(2^D)']})){
   const text=await p.locator(`[data-i18n=${key}]`).textContent();for(const operand of required)assert(text.includes(operand),`${l} ${key} ${operand}`);
  }
 }
 // Narrow initial, populated improvement, final; zoom is CSS zoom=2 at 1280.
 for(const l of ['en','zh'])for(const width of [320,390,736,1440]){
  await p.setViewportSize({width,height:1000});await lang(l);await p.locator('#searchPreset').selectOption('5');
  const frames=C.searchTrace(5),improved=frames.findIndex(f=>f.children.some(x=>x.status==='improved'));
  for(const phase of ['initial','improved','goal']){
   await reset();if(phase==='improved')for(let i=0;i<improved;i++)await click('searchNext');if(phase==='goal')await click('searchEnd');
   await p.locator('#searchRead').scrollIntoViewIfNeeded();
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   for(const id of ['searchCurrent','searchChildren','searchFrontier','searchHistory'])assert(await p.locator('#'+id).evaluate(e=>e.scrollWidth<=e.clientWidth));
   if(width===320||width===1440)await p.screenshot({path:path.join(out,`${l}-${width}-search-${phase}.png`)});
  }
  assert((await p.locator('h1').textContent()).includes('#818'));
 }
 for(const l of ['en','zh']){
  await p.setViewportSize({width:1280,height:1000});await p.evaluate(()=>document.documentElement.style.zoom='2');await lang(l);await reset();await click('searchNext');await p.locator('#searchRead').scrollIntoViewIfNeeded();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:path.join(out,l+'-search-zoom200.png')});await p.evaluate(()=>document.documentElement.style.zoom='');
 }
 await reset();await p.locator('#searchNext').focus();await p.keyboard.press('Enter');assert((await txt('searchCurrent')).includes('(0,1)'));assert.equal(await p.locator('#searchNext').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 await p.emulateMedia({forcedColors:'active'});await p.locator('#searchNext').focus();assert.equal(await p.locator('#searchNext').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 // Calibrate the exact contrast helper independently before checking inherited colors.
 function lum(h){const a=h.match(/\w\w/g).map(x=>{const v=parseInt(x,16)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
 function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 assert.equal(lum('#000000'),0);assert.equal(lum('#ffffff'),1);assert.equal(lum('#00ff00'),.7152);assert.equal(lum('#ff0000'),.2126);assert.equal(lum('#0000ff'),.0722);assert.equal(ratio('#ffffff','#000000'),21);assert(ratio('#747474','#000000')<4.5);
 const colors=[['#e8edf4','#1c2330'],['#9aa7b8','#1c2330'],['#ffb454','#1c2330']].map(([fg,bg])=>({fg,bg,ratio:ratio(fg,bg)}));assert(colors.every(x=>x.ratio>=4.5));
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'search-browser.json'),JSON.stringify({kind:'author self-check',records,colors,contrastCalibrated:true,viewports:[320,390,736,1440],zoom:'CSS zoom=2 at viewport 1280x1000',locales:['en','zh'],keyboard:true,errors},null,2));
 await b.close();console.log('Search browser checks passed: both locales, every preset/pop, rewind, counts, formulas, improvement, isolation, widths, zoom, keyboard');
})().catch(e=>{console.error(e);process.exit(1);});
