'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,$=id=>document.getElementById(id);
const presets=[['ab','ba'],['great','rgeat'],['abcde','caebd'],['a','a'],['a','b'],['aab','aba']];
let run=Scramble87.trace(...presets[0]),index=0,selected=null,revealed=false,copyState='',validation='';
const el=(tag,text,cls='')=>{const e=document.createElement(tag);e.textContent=text;e.className=cls;return e;};
const truth=v=>t(v===null?'unknown':v?'yes':'no');
function render(){
 const f=run.frames[index],last=run.frames.length-1;
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===last;
 $('position').max=last;$('position').value=index;$('progress').textContent=t('progress',{a:run.a,b:run.b,i:index,total:last});
 $('message').textContent=t(f.event,{...f,n:run.n,a:run.a[f.i],b:run.b[f.j],v:truth(f.length?f.dp[f.length][f.i][f.j]:run.result),keep:truth(f.kept),swap:truth(f.swapped)});
 $('pairs').replaceChildren();
 if(f.event==='cut')for(const kind of ['keep','swap']){
  const box=el('div','','alignment');box.append(el('h3',t(kind)));
  for(const p of f[kind])box.append(el('p',t('pair',{...p,end1:p.i+p.length,end2:p.j+p.length,v:truth(p.value)}),'pair'));
  box.append(el('p',t('both',{v:truth(f[kind==='keep'?'kept':'swapped'])})));$('pairs').append(box);
 }else $('pairs').append(el('p',t('noCut'),'hint'));
 $('tables').replaceChildren();
 for(let length=1;length<=run.n;length++){
  const wrap=el('div','','dp-wrap');wrap.tabIndex=0;wrap.setAttribute('aria-label',t('layer',{length}));
  const table=el('table','','dp-table');table.append(el('caption',t('layer',{length})));
  const head=el('thead',''),hr=el('tr','');hr.append(el('th','i \\ j'));
  for(let j=0;j<=run.n-length;j++){const th=el('th',j);th.scope='col';hr.append(th);}head.append(hr);table.append(head);
  const body=el('tbody','');for(let i=0;i<=run.n-length;i++){
   const row=el('tr',''),th=el('th',i);th.scope='row';row.append(th);
   for(let j=0;j<=run.n-length;j++){
    const v=f.dp[length][i][j],cell=el('td',truth(v),v===null?'':v?'truth':'falsehood');
    if(f.length===length&&f.i===i&&f.j===j)cell.classList.add('current');row.append(cell);
   }body.append(row);
  }table.append(body);wrap.append(table);$('tables').append(wrap);
 }
 $('rows').replaceChildren(...f.ledger.map((r,i)=>{const row=el('tr','','');
  [`(${r.length},${r.i},${r.j})`,r.k??t('baseLabel'),r.event==='cut'?truth(r.kept):'—',r.event==='cut'?truth(r.swapped):'—',truth(r.value)].forEach((v,j)=>{const c=el(j===0?'th':'td',v);if(j===0)c.scope='row';row.append(c);});if(i===f.ledger.length-1)row.classList.add('changed');return row;
 }));$('ledgerWrap').setAttribute('aria-label',t('ledger'));
 $('reveal').disabled=selected===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(selected==='1'?'correct':'incorrect')+' '+t('answer'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';$('validation').hidden=!validation;$('validation').textContent=validation?t(validation):'';
}
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(run.frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};
$('preset').onchange=e=>{const [a,b]=presets[Number(e.target.value)];run=Scramble87.trace(a,b);index=0;validation='';$('inputA').value=a;$('inputB').value=b;render();};
$('customForm').noValidate=true;$('customForm').onsubmit=e=>{e.preventDefault();try{const candidate=Scramble87.trace($('inputA').value,$('inputB').value);run=candidate;index=0;validation='applied';$('preset').value='custom';}catch(_){validation='invalid';}render();};
document.querySelectorAll('[name=prediction]').forEach(r=>r.onchange=()=>{selected=r.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
locale.onChange(render);locale.init();
function updateStep(){const active=[...document.querySelectorAll('.step')].filter(s=>s.getBoundingClientRect().top<=120).pop()||$('step0');document.querySelectorAll('.step-nav a').forEach(a=>{const current=a.hash==='#'+active.id;a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateStep,{passive:true});window.addEventListener('resize',updateStep);locale.onChange(updateStep);updateStep();
