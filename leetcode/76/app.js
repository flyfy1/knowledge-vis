'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,$=id=>document.getElementById(id);
const presets=[['ABAAC','AAC'],['AAAC','AAC'],['ADOBECODEBANC','ABC'],['a','aa'],['a','a'],['aA','AA']];
let run=Window76.trace(...presets[0]),index=0,selected=null,revealed=false,copyState='',validation='';
function el(tag,text){const e=document.createElement(tag);e.textContent=text;return e;}
function description(f){
 const count=f.have[f.c]??0,action=t(f.missing===0?'shrink':'grow');
 if(f.type==='start')return t('start',f);
 if(f.type==='done')return t('done',{result:run.result||t('empty')});
 if(f.type==='check')return t('check',{...f,width:f.right-f.left+1});
 return t(f.type,{...f,count,action:(f.c in f.need?'':t('irrelevant')+' ')+action});
}
function render(){
 const f=run.frames[index],last=run.frames.length-1;
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===last;
 $('position').max=last;$('position').value=index;
 $('progress').textContent=t('progress',{i:index,total:last,s:run.s,target:run.t});
 $('message').textContent=description(f);
 $('state').textContent=t('state',{...f,valid:t(f.missing===0?'valid':'notValid')});
 $('best').textContent=t('best',{best:f.best?f.best.text:t('none'),bounds:f.best?`[${f.best.start},${f.best.end}]`:'—',length:f.best?f.best.length:'—'});
 $('tiles').replaceChildren(...[...run.s].map((c,i)=>{const inside=i>=f.left&&i<=f.right,d=el('div','');d.className='tile'+(inside?' inside':'');d.append(el('span',i),el('b',c),el('span',(i===f.left?'L ':'')+(i===f.right?'R':'')+(inside?' · '+t('inside'):'')));return d;}));
 $('counts').replaceChildren(...Object.keys(f.need).sort().map(c=>{const row=document.createElement('tr');[c,f.need[c],f.have[c],Math.max(f.need[c]-f.have[c],0)].forEach((v,i)=>{const cell=el(i===0?'th':'td',v);if(i===0)cell.scope='row';row.append(cell);});return row;}));
 $('rows').replaceChildren(...run.frames.slice(0,index+1).map((f,i)=>{const row=document.createElement('tr');[`${i} · ${t('event_'+f.type)}${f.c?' '+f.c:''}`,`[${f.left},${f.right}] "${f.window}"`,f.missing,f.best?f.best.text:'—'].forEach((v,j)=>{const cell=el(j===0?'th':'td',v);if(j===0)cell.scope='row';row.append(cell);});if(i===index)row.className='changed';return row;}));
 $('ledgerWrap').setAttribute('aria-label',t('ledger'));
 $('reveal').disabled=selected===null;$('feedback').hidden=!revealed;
 $('feedback').className='readout '+(selected==='2'?'status-good':'status-bad');
 $('feedback').textContent=revealed?t(selected==='2'?'correct':'incorrect')+' '+t('explanation'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
 $('validation').hidden=!validation;$('validation').textContent=validation?t(validation):'';
}
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(run.frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};
$('preset').onchange=e=>{const [s,t]=presets[Number(e.target.value)];run=Window76.trace(s,t);index=0;validation='';$('inputS').value=s;$('inputT').value=t;render();};
$('customForm').noValidate=true;$('customForm').onsubmit=e=>{e.preventDefault();try{const candidate=Window76.trace($('inputS').value,$('inputT').value);run=candidate;index=0;validation='applied';$('preset').value='custom';}catch(_){validation='invalid';}render();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{selected=r.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
locale.onChange(render);locale.init();
function updateStep(){const current=[...document.querySelectorAll('.step')].filter(s=>s.getBoundingClientRect().top<=120).pop()||$('step0');document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateStep,{passive:true});window.addEventListener('resize',updateStep);locale.onChange(updateStep);updateStep();
