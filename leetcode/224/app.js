'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,$=id=>document.getElementById(id);
let run=Calculator224.trace(Calculator224.presets[0]),index=0,selected=null,revealed=false,copyState='';
Calculator224.presets.forEach((s,i)=>{const o=document.createElement('option');o.value=i;o.textContent=s;$('preset').append(o);});
function explain(f){
 const p=f.before;if(!p)return t('start');
 if(f.kind==='number')return t('number',{v:f.number,a:p.total,sign:p.sign,b:f.total});
 if(f.kind==='+')return t('plus');if(f.kind==='-')return t('minus');
 if(f.kind==='(')return t('open',{a:p.total,sign:p.sign});
 const [a,sign]=p.stack[p.stack.length-1];return t('close',{a,sign,inner:p.total,b:f.total});
}
function render(){
 const f=run.frames[index],last=run.frames.length-1;
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===last;$('position').max=last;$('position').value=index;
 $('progress').textContent=t('progress',{i:index,n:last});$('state').textContent=t('state',{total:f.total,sign:f.sign,depth:f.stack.length});
 $('message').textContent=explain(f)+(index===last?' '+t('done'):'');
 $('expression').replaceChildren(...[...run.s].map((c,i)=>{const el=document.createElement('span');el.className='token'+(i<=f.end?' consumed':'')+(i>=f.start&&i<=f.end?' current':'');const val=document.createElement('span'),pos=document.createElement('small');val.textContent=c===' '?'␠':c;pos.textContent=i;el.append(val,pos);return el;}));
 const pairs=f.stack.length?f.stack.map(([a,b],i)=>t('pair',{i:i+1,a,b})):[t('empty')];$('stack').replaceChildren(...pairs.map(s=>{const p=document.createElement('p');p.textContent=s;return p;}));
 $('ledgerWrap').setAttribute('aria-label',t('ledger'));
 $('rows').replaceChildren(...run.frames.slice(1,index+1).map(f=>{const tr=document.createElement('tr');[`${f.start}${f.end!==f.start?'–'+f.end:''} / ${run.s.slice(f.start,f.end+1)}`,`${f.before.total} / ${f.before.sign}`,`${f.total} / ${f.sign}`,String(f.stack.length)].forEach((s,j)=>{const td=document.createElement(j===0?'th':'td');if(j===0)td.scope='row';td.textContent=s;tr.append(td);});return tr;}));
 $('reveal').disabled=selected===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(selected==='2'?'correct':'incorrect')+' '+t('explanation'):'';$('feedback').className='readout '+(selected==='2'?'status-good':'status-bad');$('copyStatus').textContent=copyState?t(copyState):'';
}
$('prev').onclick=()=>{index--;render();};$('next').onclick=()=>{index++;render();};$('reset').onclick=()=>{index=0;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};$('preset').onchange=e=>{run=Calculator224.trace(Calculator224.presets[Number(e.target.value)]);index=0;render();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{selected=r.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
locale.onChange(render);locale.init();
function updateStep(){const current=[...document.querySelectorAll('.step')].filter(s=>s.getBoundingClientRect().top<=120).pop()||$('step0');document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateStep,{passive:true});window.addEventListener('resize',updateStep);locale.onChange(updateStep);updateStep();
