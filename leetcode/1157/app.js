'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=window.MajorityCore;
let handIndex=0,index=0,choice=null,revealed=false,copyState='';
const hands=C.hand(C.presets[0].arr);let model=C.trace(C.presets[0]);
function el(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function candidate(f){return f.summary[1]?f.summary[0]:t('none');}
function handText(f){return f.i<0?t('handStart'):t(f.kind,{i:f.i,v:C.presets[0].arr[f.i]});}
function eventText(f){
 if(f.kind==='start')return t('start');
 if(f.kind==='verify')return f.summary[1]?t('verifyEvent',{c:f.summary[0],pos:f.positions.join(', '),low:f.low,high:f.high,count:f.count,t:model.threshold,result:f.result}):t('verifyEmpty');
 const a=f.before,b=model.tree[f.id];
 const why=t(!a[1]||!b[1]?'reasonEmpty':a[0]===b[0]?'reasonSame':'reasonDiff');
 return t('blockEvent',{id:f.id,x:a[0],p:a[1],y:b[0],q:b[1],c:f.summary[0],b:f.summary[1],why});
}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('navigation'));
 $('officialArray').replaceChildren();$('handTiles').replaceChildren();
 const h=hands[handIndex],arr=C.presets[0].arr;
 arr.forEach((v,i)=>{
  const a=el('div','','tile');a.append(el('small',t('idx',{i})),el('b',String(v)));$('officialArray').append(a);
  const status=h.survivors.includes(i)?'kept':i<=h.i?'paired':'pending';
  const b=el('div','','tile '+(status==='kept'?'survivor':status==='paired'?'paired':'')+(i===h.i?' current':''));
  b.append(el('small',t('idx',{i})),el('b',String(v)),el('small',t(status)+(i===h.i?' · '+t('current'):'')));$('handTiles').append(b);
 });
 $('handEvent').textContent=handText(h);$('handRead').textContent=t('handRead',{k:handIndex,c:h.survivors.length?arr[h.survivors[0]]:t('none'),b:h.survivors.length});
 $('pairs').textContent=t('pairs',{pairs:h.pairs.length?h.pairs.map(p=>'('+p.join(',')+')').join(' '):t('none')});
 $('handHistory').replaceChildren();hands.slice(1,handIndex+1).forEach(f=>$('handHistory').append(el('li',handText(f))));
 $('handPrev').disabled=handIndex===0;$('handReset').disabled=handIndex===0;$('handNext').disabled=handIndex===hands.length-1;
 const f=model.frames[index];
 $('queryInput').textContent=t('input',{a:model.arr.join(', '),l:model.left,r:model.right,t:model.threshold,s:model.size});
 $('blocks').replaceChildren();
 model.blocks.forEach(id=>{const bounds=model.bounds[id],summary=model.tree[id],used=f.used.includes(id),cur=f.id===id;
  const b=el('div','','block'+(used?' used':'')+(cur?' current':''));b.dataset.node=id;
  b.append(el('p',t('blockInfo',{id,l:bounds[0],r:bounds[1]})),el('p',t('blockSummary',{c:summary[0],b:summary[1]})),el('p',t(used?'merged':'waiting')+(cur?' · '+t('current'):'')));$('blocks').append(b);
 });
 $('event').textContent=eventText(f);$('progress').textContent=t('progress',{k:f.used.length,n:model.blocks.length,c:candidate(f),b:f.summary[1],status:t(f.kind==='verify'?'verified':'unverified')});
 $('history').replaceChildren();if(!index)$('history').append(el('li',t('noEvents')));model.frames.slice(1,index+1).forEach(g=>$('history').append(el('li',eventText(g))));
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===model.frames.length-1;$('end').disabled=index===model.frames.length-1;
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice===1?'correct':'incorrect')+' '+t('explanation'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('handNext').onclick=()=>{handIndex=Math.min(handIndex+1,hands.length-1);render();};$('handPrev').onclick=()=>{handIndex=Math.max(handIndex-1,0);render();};$('handReset').onclick=()=>{handIndex=0;render();};
$('preset').onchange=()=>{model=C.trace(C.presets[Number($('preset').value)]);index=0;render();};
$('next').onclick=()=>{index=Math.min(index+1,model.frames.length-1);render();};$('prev').onclick=()=>{index=Math.max(index-1,0);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=model.frames.length-1;render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null){revealed=true;render();}};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}render();};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){const y=document.querySelector('.step-nav').getBoundingClientRect().bottom+32;let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=y)active=s;document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let scheduled=false;function scheduleNav(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;updateNav();});}window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);locale.onChange(scheduleNav);updateNav();
