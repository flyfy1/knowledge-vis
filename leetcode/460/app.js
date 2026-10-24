'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let index=0,preset=0,frames=LFULesson.trace(LFULesson.presets[0]),hand=false,revealed=false,copyState='';
function buckets(el,s){
 el.replaceChildren();if(!s.groups.length){el.textContent=t('empty');return;}
 for(const g of s.groups){const box=document.createElement('div');box.className='bucket'+(g.f===s.min?' minimum':'');const b=document.createElement('b');b.textContent=t('bucket',{f:g.f,mark:g.f===s.min?t('minimum'):''});box.append(b);for(const k of g.keys){const e=document.createElement('span'),v=s.items.find(x=>x[0]===k)[1];e.textContent=t('entry',{k,v,f:g.f});box.append(e);}el.append(box);}
}
function operation(f){if(f.kind==='initial')return t('initial');const op=f.kind==='get'?`get(${f.key})`:`put(${f.key},${f.value})`;return op+' — '+(f.victim===null?'':t('evict',{k:f.victim})+' ')+t(f.reason,{r:f.result,a:f.from,b:f.to,v:f.value});}
function render(){
 const f=frames[index];$('handReveal').textContent=t(hand?'handHide':'handShow');$('handReveal').setAttribute('aria-expanded',String(hand));$('handAnswer').hidden=!hand;
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
 $('progress').textContent=t('progress',{c:LFULesson.presets[preset].cap,i:index,n:frames.length-1});$('operation').textContent=operation(f);
 buckets($('beforeBuckets'),f.before);buckets($('afterBuckets'),f.after);
 const s=f.after,victim=s.items.length===LFULesson.presets[preset].cap?s.groups.find(g=>g.f===s.min).keys[0]:t('none');$('invariantRead').textContent=t('invariantRead',{m:s.min,k:victim});
 $('ledger').replaceChildren();if(!index){const li=document.createElement('li');li.textContent=t('historyEmpty');$('ledger').append(li);}frames.slice(1,index+1).forEach(f=>{const li=document.createElement('li');li.textContent=operation(f);$('ledger').append(li);});
 const choice=document.querySelector('[name="prediction"]:checked');$('reveal').disabled=!choice;$('feedback').textContent=revealed?t(choice.value==='1'?'correct':'incorrect')+' '+t('answer'):t(choice?'chosen':'waiting');$('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').onchange=()=>{preset=+$('preset').value;frames=LFULesson.trace(LFULesson.presets[preset]);index=0;render();};
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
$('handReveal').onclick=()=>{hand=!hand;render();};document.querySelectorAll('[name="prediction"]').forEach(e=>e.onchange=()=>{revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonSource').textContent=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFail';$('manualCopy').hidden=false;$('manualSource').value=window.PYTHON_SOURCE;$('manualSource').focus();$('manualSource').select();}render();};
locale.onChange(render);locale.init();
function updateNav(){let active=document.querySelector('.step');const h=document.querySelector('.step-nav').getBoundingClientRect().height+100;document.querySelectorAll('.step').forEach(s=>{if(s.getBoundingClientRect().top<=h)active=s;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
addEventListener('scroll',updateNav,{passive:true});addEventListener('resize',updateNav);locale.onChange(updateNav);updateNav();
