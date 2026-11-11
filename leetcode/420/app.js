'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let selected=0,index=0,data=PasswordCore.trace(PasswordCore.presets[0]),revealed=false,copyState='';
// Hand allocation lab: the learner spends the four compulsory deletions of preset 0 themselves.
const allocStart=PasswordCore.inspect(PasswordCore.presets[0]).runs.filter(r=>r.original>=3).map(r=>({c:r.char,L:r.original})),allocBudget=Math.max(0,PasswordCore.presets[0].length-20);let allocMoves=[];
function allocState(){const runs=allocStart.map(r=>({...r})),log=[];const R=()=>runs.reduce((v,r)=>v+Math.floor(r.L/3),0);for(const i of allocMoves){const before=R(),old=runs[i].L;runs[i].L--;log.push({c:runs[i].c,old,L:runs[i].L,before,after:R()});}return {runs,log,R:R()};}
const allocBest=PasswordCore.trace(PasswordCore.presets[0]).frames.at(-1).R;
function render(){
 $('handResult').textContent=t(document.querySelector('input[name=hand]:checked').value==='0'?'handBad':'handGood');
 $('comboResult').textContent=t(document.querySelector('input[name=combo]:checked').value==='0'?'comboBad':'comboGood');
 renderAlloc();
 const L=Number($('runLength').value),R=Math.floor(L/3);$('triples').replaceChildren();
 for(let i=0;i<L;i+=3){const el=document.createElement('code');el.textContent='a'.repeat(Math.min(3,L-i));if(L-i<3)el.className='tail';$('triples').append(el);}
 let fixed='';for(let i=0;i<L;i++)fixed+=i%3===2?(i===2?'B':'0'):'a';$('runResult').textContent=t('runRead',{L,R,fixed});
 const f=data.frames[index];$('input').textContent=t('input',{s:PasswordCore.presets[selected],n:f.n,M:f.missing});$('runs').replaceChildren();
 f.runs.forEach((r,i)=>{if(r.original<3)return;const div=document.createElement('div');div.className='run';for(const [tag,key,params] of [['b','runCard',{i:i+1,c:r.char}],['span','lengths',{old:r.original,now:r.length}],['span','need',{old:Math.floor(r.original/3),now:Math.floor(r.length/3)}]]){const el=document.createElement(tag);el.textContent=t(key,params);div.append(el);}$('runs').append(div);});
 const short=f.runs.filter(r=>r.original<3);if(short.length){const note=document.createElement('p');note.textContent=t('shortRuns',{runs:short.map(r=>r.char+'×'+r.length).join(' | ')});$('runs').append(note);}
 $('prev').disabled=$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===data.frames.length-1;
 const result=f.left?t('pending'):t(f.n<6?'shortAnswer':f.n<=20?'legalAnswer':'longAnswer',{...f,M:f.missing,answer:data.answer});
 $('progress').textContent=t('progress',{...f,i:index,total:data.frames.length-1,result});$('history').replaceChildren();f.events.forEach(e=>{const li=document.createElement('li');li.textContent=t(e.kind,e);$('history').append(li);});
 const choice=document.querySelector('input[name=prediction]:checked');$('reveal').disabled=!choice;$('feedback').textContent=revealed?t(choice.value==='2'?'correct':'incorrect')+'\n'+t('answer'):t(choice?'chosen':'waiting');$('copyStatus').textContent=copyState?t(copyState):'';
}
function renderAlloc(){
 const st=allocState(),left=allocBudget-allocMoves.length;
 $('allocRuns').replaceChildren(...st.runs.map(r=>{const div=document.createElement('div');div.className='run';const b=document.createElement('b');b.textContent=t('allocCard',{c:r.c,L:r.L,r:Math.floor(r.L/3)});div.append(b);return div;}));
 const buttons=$('allocButtons');if(buttons.children.length!==st.runs.length)buttons.replaceChildren(...st.runs.map((_,i)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.id='alloc'+i;b.onclick=()=>{allocMoves.push(i);render();};return b;}));
 st.runs.forEach((r,i)=>{const b=buttons.children[i];b.textContent=t('allocRun',{c:r.c,L:r.L});b.disabled=left===0||r.L<=1;});
 $('allocUndo').disabled=$('allocReset').disabled=allocMoves.length===0;
 $('allocStatus').textContent=t('allocStatus',{spent:allocMoves.length,R:st.R})+(left===0?' '+t(st.R===allocBest?'allocBest':'allocWorse',{R:st.R}):'');
 $('allocLog').replaceChildren(...st.log.map(e=>{const li=document.createElement('li');li.textContent=t('allocLog',e);return li;}));
}
$('allocUndo').onclick=()=>{allocMoves.pop();render();};$('allocReset').onclick=()=>{allocMoves=[];render();};
document.querySelectorAll('input[name=combo]').forEach(e=>e.onchange=render);
$('preset').onchange=e=>{selected=Number(e.target.value);index=0;data=PasswordCore.trace(PasswordCore.presets[selected]);render();};
$('runLength').oninput=render;
for(const action of ['prev','next','reset','end'])$(action).onclick=()=>{index=action==='prev'?index-1:action==='next'?index+1:action==='reset'?0:data.frames.length-1;render();};
document.querySelectorAll('input[name=hand]').forEach(e=>e.onchange=render);
document.querySelectorAll('input[name=prediction]').forEach(e=>e.onchange=()=>{revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonSource').textContent=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFail';$('manualCopy').hidden=false;$('manualSource').value=window.PYTHON_SOURCE;$('manualSource').focus();$('manualSource').select();}render();};
function updateNav(){const nav=document.querySelector('.step-nav');let active=document.querySelector('.step');document.querySelectorAll('.step').forEach(s=>{if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().height+24)active=s;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.onChange(updateNav);locale.init();window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
