'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,frames=CollectionLesson.trace(CollectionLesson.presets[0]),hand=false,revealed=false,copyState='';
function tiles(el,values,marked){
 el.replaceChildren();
 if(!values.length){el.textContent=t('empty');return;}
 values.forEach((v,i)=>{const cell=document.createElement('div');cell.className='tile'+(i===marked?' marked':'');const label=document.createElement('small');label.textContent=t('slot',{i});const val=document.createElement('b');val.textContent=v;cell.append(label,val);el.append(cell);});
}
function positions(el,rows){el.replaceChildren();if(!rows.length)el.textContent=t('emptyMap');for(const [v,s] of rows){const row=document.createElement('div');row.textContent=v+' → {'+s.join(', ')+'}';el.append(row);}}
function operation(f){
 if(f.kind==='initial')return t('initial');
 if(f.kind==='insert')return t('inserted',{v:f.v,r:String(f.result),i:f.i});
 if(f.kind==='getRandom')return t('sampled',{v:f.v,i:f.i,c:f.count,n:f.after.nums.length});
 if(!f.result)return t('absent',{v:f.v});
 return t('removed',{v:f.v,i:f.i,j:f.j,last:f.last,repair:t(f.i===f.j?'noMove':'move',{i:f.i,j:f.j,last:f.last})});
}
function render(){
 const f=frames[index];
 tiles($('handSlots'),[4,4,9],+$('slotPick').value);
 const i=+$('slotPick').value,v=[4,4,9][i];$('slotResult').textContent=t('slotResult',{i,v,c:v===4?2:1});
 $('handReveal').textContent=t(hand?'handHide':'handShow');$('handReveal').setAttribute('aria-expanded',String(hand));$('handAnswer').hidden=!hand;
 $('prev').disabled=index===0;$('next').disabled=index===frames.length-1;$('reset').disabled=index===0;$('end').disabled=index===frames.length-1;
 $('progress').textContent=t('progress',{i:index,n:frames.length-1,phase:t(index===0?'start':index===frames.length-1?'ended':'running')});
 $('operation').textContent=operation(f);
 tiles($('beforeSlots'),f.before.nums,f.i);tiles($('afterSlots'),f.after.nums,f.i);positions($('beforeMap'),f.before.pos);positions($('afterMap'),f.after.pos);
 $('invariantRead').textContent=t('invariantRead',{n:f.after.nums.length});
 $('ledger').replaceChildren();if(!index){const li=document.createElement('li');li.textContent=t('historyEmpty');$('ledger').append(li);}frames.slice(1,index+1).forEach(f=>{const li=document.createElement('li');li.textContent=operation(f);$('ledger').append(li);});
 const selected=document.querySelector('[name="prediction"]:checked');$('reveal').disabled=!selected;
 $('feedback').textContent=revealed?t(selected.value==='2'?'correct':'incorrect')+' '+t('answer'):t(selected?'chosen':'waiting');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('slotPick').onchange=render;
$('preset').onchange=()=>{preset=+$('preset').value;frames=CollectionLesson.trace(CollectionLesson.presets[preset]);index=0;render();};
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
$('handReveal').onclick=()=>{hand=!hand;render();};document.querySelectorAll('[name="prediction"]').forEach(el=>el.onchange=()=>{revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonSource').textContent=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFail';$('manualCopy').hidden=false;$('manualSource').value=window.PYTHON_SOURCE;$('manualSource').focus();$('manualSource').select();}render();};
locale.onChange(render);locale.init();
function updateNav(){
 const sections=[...document.querySelectorAll('.step')];let active=sections[0];
 const threshold=document.querySelector('.step-nav').getBoundingClientRect().height+100;
 for(const section of sections)if(section.getBoundingClientRect().top<=threshold)active=section;
 document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active.id));
}
addEventListener('scroll',updateNav,{passive:true});addEventListener('resize',updateNav);locale.onChange(updateNav);updateNav();
