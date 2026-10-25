'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=KeysCore;
let preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,hand=false,copyState='';
function el(tag,text,cls){const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n;}
function renderTrace(){
 const grid=C.presets[preset],f=frames[at],front=new Set(f.front.map(C.key));
 $('inputRead').textContent=JSON.stringify(grid);
 $('frameRead').textContent=t('frame',{i:at,n:frames.length-1,d:f.depth,f:f.front.length,s:f.seen.length,target:f.target,status:f.result===null?t('pending'):f.result===-1?t('exhausted'):t('found',{d:f.result})});
 $('grid').style.gridTemplateColumns=`repeat(${grid[0].length},112px)`;
 $('gridScroll').setAttribute('aria-label',t('gridName'));
 const cells=[];
 grid.forEach((row,r)=>[...row].forEach((ch,c)=>{
  const states=f.seen.filter(x=>x.s[0]===r&&x.s[1]===c),active=states.some(x=>front.has(C.key(x.s)));
  const cell=el('div','','key-cell'+(active?' front':'')+(ch==='#'?' wall':''));
  cell.append(el('small',`(${r},${c})`),el('b',ch));cell.setAttribute('aria-label',t('cell',{r,c,ch}));
  if(!states.length)cell.append(el('small',t('unseen')));
  for(const x of states){const a=front.has(C.key(x.s));cell.append(el('span',`${a?'★ ':''}${x.s[2]}:${x.d}`,'record'+(a?' active-record':'')));}
  cells.push(cell);
 }));
 $('grid').replaceChildren(...cells);
 $('events').replaceChildren(...f.events.map(e=>el('li',t('event',{from:e.from.join(','),to:e.to.join(','),why:t('reason_'+e.reason)}))));
 $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;
}
function renderPrediction(){
 $('reveal').disabled=selected===null;
 $('predictionFeedback').textContent=revealed?t(selected===1?'correct':'incorrect')+' '+t('answer'):t(selected===null?'await':'selected');
 $('predictionFeedback').classList.toggle('correct',revealed&&selected===1);
}
function render(){renderTrace();renderPrediction();$('handAnswer').hidden=!hand;$('handToggle').textContent=t(hand?'handHide':'handReveal');$('handToggle').setAttribute('aria-expanded',String(hand));$('copyStatus').textContent=copyState?t(copyState):'';}
$('handToggle').onclick=()=>{hand=!hand;render();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('tracePrev').onclick=()=>{if(at)at--;renderTrace();};$('traceNext').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};$('traceLast').onclick=()=>{at=frames.length-1;renderTrace();};
for(const radio of document.querySelectorAll('[name=prediction]'))radio.onchange=()=>{selected=Number(radio.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('predictionReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name=prediction]').forEach(x=>x.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceDetails').open=true;$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav'),sections=[...document.querySelectorAll('.step')];let current=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
