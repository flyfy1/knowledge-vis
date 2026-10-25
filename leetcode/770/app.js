'use strict';
const locale=LeetCodeLocale(window.CALC_COPY),t=locale.t,$=id=>document.getElementById(id);
let selected=0,step=0,trace=CalcIV.trace(CalcIV.presets[0]),choice=null,revealed=false,copyState='';
$('baselineCode').textContent=window.BASELINE_SOURCE;
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
function describe(f){return t(f.kind,{...f,text:trace.tokens.slice(f.start,f.end).join(' ')});}
function tuple(k){return k.length?'('+k.join(', ')+')':t('constant');}
function polynomial(target,rows,applicable=true){
 target.replaceChildren();if(!applicable){target.textContent=t('notOperand');return;}
 if(!rows.length){target.textContent=t('empty');return;}
 const table=document.createElement('table'),thead=document.createElement('thead'),tr=document.createElement('tr');
 for(const key of ['key','coefficient']){const th=document.createElement('th');th.scope='col';th.textContent=t(key);tr.append(th);}thead.append(tr);table.append(thead);
 const body=document.createElement('tbody');for(const[k,c]of rows){const tr=document.createElement('tr');for(const value of [tuple(k),c]){const td=document.createElement('td');td.textContent=value;tr.append(td);}body.append(tr);}table.append(body);target.append(table);
}
function render(){
 const f=trace.frames[step];
 $('langToggle').setAttribute('aria-label',t('language'));$('stepNav').setAttribute('aria-label',t('nav'));
 [...$('preset').options].forEach((el,i)=>el.textContent=t('p'+i));
 $('input').textContent=t('inputLabel',{...CalcIV.presets[selected],values:Object.keys(CalcIV.presets[selected].values).length?JSON.stringify(CalcIV.presets[selected].values):t('none')});
 $('tokens').textContent=t('tokens',{text:trace.tokens.map((x,i)=>i+':'+x).join(' · ')});
 $('progress').textContent=t('progress',{s:step,n:trace.frames.length-1,l:f.start,r:f.end});$('event').textContent=describe(f);
 polynomial($('left'),f.left,f.kind==='operation');polynomial($('right'),f.right,f.kind==='operation');if(f.kind==='start')$('result').textContent=t('unread');else polynomial($('result'),f.result);
 $('pairs').replaceChildren();if(!f.pairs.length){const li=document.createElement('li');li.textContent=t('noPairs');$('pairs').append(li);}else for(const p of f.pairs){const li=document.createElement('li');li.textContent=`${p.ca} × ${tuple(p.a)} · ${p.cb} × ${tuple(p.b)} → ${tuple(p.key)} : ${p.c}`;$('pairs').append(li);}
 $('pairs').setAttribute('aria-label',t('pair'));
 $('calls').replaceChildren();if(!f.calls.length)$('calls').textContent=t('none');else for(const c of f.calls){const li=document.createElement('li');li.textContent=t('call',c);$('calls').append(li);}
 $('output').textContent=f.kind==='done'?t('output',{answer:JSON.stringify(trace.output)}):t('pending');
 $('history').replaceChildren();for(const frame of trace.frames.slice(1,step+1)){const li=document.createElement('li');li.textContent=describe(frame);$('history').append(li);}
 $('prev').disabled=$('reset').disabled=step===0;$('next').disabled=$('end').disabled=step===trace.frames.length-1;
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',e=>{selected=Number(e.target.value);trace=CalcIV.trace(CalcIV.presets[selected]);step=0;render();});
for(const[id,move]of Object.entries({prev:()=>step-1,next:()=>step+1,reset:()=>0,end:()=>trace.frames.length-1}))$(id).addEventListener('click',()=>{step=move();render();});
document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=Number(el.value);revealed=false;render();}));
$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();});
locale.onChange(render);locale.init();
function updateNav(){let active='step0';document.querySelectorAll('.step').forEach(s=>{if(s.getBoundingClientRect().top<=120)active=s.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const current=a.hash==='#'+active;a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);locale.onChange(updateNav);updateNav();
