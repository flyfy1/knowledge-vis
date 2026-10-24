'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let index=0,frames=AllOneLesson.trace(AllOneLesson.presets[0]),hand=false,revealed=false,copyState='';
function buckets(el,groups){
 el.replaceChildren();const add=(text,cls)=>{const d=document.createElement('div');d.className=cls;d.textContent=text;el.append(d);};add('head','link');
 if(!groups.length)add(t('empty'),'link');
 for(const g of groups){add('↕','link');const box=document.createElement('div');box.className='bucket';const b=document.createElement('b');b.textContent=t('bucket',{c:g.c});const k=document.createElement('div');k.textContent=g.keys.join(' ↔ ');box.append(b,k);el.append(box);}add('↕','link');add('tail','link');
}
function positions(el,counts){el.replaceChildren();if(!Object.keys(counts).length)el.textContent=t('emptyMap');for(const [key,c]of Object.entries(counts)){const d=document.createElement('div');d.textContent=key+' → '+c;el.append(d);}}
function operation(f){
 if(f.kind==='initial')return t('initial');
 if(f.kind.startsWith('get'))return t('query',{op:f.kind,key:f.result});
 const cleanup=t(f.dropped?'drop':'keep');let reason;
 if(!f.a)reason=t('new');else if(!f.b)reason=t('remove',{cleanup});else reason=t('move',{a:f.a,b:f.b,target:t(f.reused?'reuse':'create'),cleanup});
 return t('action',{op:f.kind,key:f.key,reason});
}
function render(){
 const f=frames[index];$('handReveal').textContent=t(hand?'handHide':'handShow');$('handReveal').setAttribute('aria-expanded',String(hand));$('handAnswer').hidden=!hand;
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
 $('progress').textContent=t('progress',{i:index,n:frames.length-1});$('operation').textContent=operation(f);
 buckets($('beforeBuckets'),f.before.groups);buckets($('afterBuckets'),f.after.groups);positions($('beforeMap'),f.before.counts);positions($('afterMap'),f.after.counts);
 const gs=f.after.groups;$('invariantRead').textContent=t('extremes',{min:gs.length?gs[0].keys.join(', '):'""',max:gs.length?gs[gs.length-1].keys.join(', '):'""'});
 $('ledger').replaceChildren();if(!index){const li=document.createElement('li');li.textContent=t('historyEmpty');$('ledger').append(li);}frames.slice(1,index+1).forEach(f=>{const li=document.createElement('li');li.textContent=operation(f);$('ledger').append(li);});
 const choice=document.querySelector('[name="prediction"]:checked');$('reveal').disabled=!choice;$('feedback').textContent=revealed?t(choice.value==='1'?'correct':'incorrect')+' '+t('answer'):t(choice?'chosen':'waiting');$('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').onchange=()=>{frames=AllOneLesson.trace(AllOneLesson.presets[+$('preset').value]);index=0;render();};
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
$('handReveal').onclick=()=>{hand=!hand;render();};document.querySelectorAll('[name="prediction"]').forEach(e=>e.onchange=()=>{revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonSource').textContent=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFail';$('manualCopy').hidden=false;$('manualSource').value=window.PYTHON_SOURCE;$('manualSource').focus();$('manualSource').select();}render();};
locale.onChange(render);locale.init();
function updateNav(){let active=document.querySelector('.step');const h=document.querySelector('.step-nav').getBoundingClientRect().height+100;document.querySelectorAll('.step').forEach(s=>{if(s.getBoundingClientRect().top<=h)active=s;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
addEventListener('scroll',updateNav,{passive:true});addEventListener('resize',updateNav);locale.onChange(updateNav);updateNav();
