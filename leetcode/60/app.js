'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,$=id=>document.getElementById(id);
const presets=[[4,9],[4,6],[4,7],[3,1],[4,24],[1,1]];
let run=Permutation60.trace(4,9),index=0,selected=null,revealed=false,copyState='',validation='';
function render(){
 const f=run.frames[index],o=f.operation;
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===run.n;
 $('position').max=run.n;$('position').value=index;
 $('progress').textContent=t('progress',{n:run.n,k:run.k,i:index});
 $('state').textContent=t('state',{prefix:f.prefix||t('empty'),unused:f.unused.join(', '),r:f.r});
 $('message').textContent=(o?t('transition',{old:o.before.r,q:o.q,block:o.block,r:f.r,digit:o.digit}):t('start',{r:f.r}))+(index===run.n?' '+t('done',{prefix:f.prefix}):'');
 const before=o?o.before:f,block=o?o.block:run.factorial[run.n-1];
 $('blockTitle').textContent=t('blockTitle',{m:before.unused.length,block,r:before.r});
 $('blocks').replaceChildren(...before.unused.map((digit,q)=>{
  const div=document.createElement('div');div.className='block'+(o&&q===o.q?' chosen':'');
  const label=document.createElement('div'),interval=document.createElement('span');label.textContent=t('blockLabel',{digit,q});interval.textContent=`[${q*block}, ${(q+1)*block-1}]`;
  div.append(label,interval);if(o&&q===o.q){const mark=document.createElement('b');mark.textContent=t('chosen');div.append(mark);}return div;
 }));
 $('ledgerWrap').setAttribute('aria-label',t('ledger'));$('noRows').hidden=index>0;$('ledger').hidden=index===0;
 $('rows').replaceChildren(...run.frames.slice(1,index+1).map((f,i)=>{
  const o=f.operation,tr=document.createElement('tr');
  const values=[String(i+1),t('rowBefore',{unused:o.before.unused.join(', '),r:o.before.r}),t('rowCalc',{block:o.block,q:o.q,digit:o.digit}),t('rowAfter',{prefix:f.prefix,r:f.r})];
  values.forEach((v,j)=>{const cell=document.createElement(j===0?'th':'td');if(j===0)cell.scope='row';cell.textContent=v;tr.append(cell);});return tr;
 }));
 $('operation').textContent=o?'block = factorial[m - 1]\nq, r = divmod(r, block)\nprefix.append(unused.pop(q))':'r = k - 1';
 $('reveal').disabled=selected===null;$('feedback').hidden=!revealed;
 $('feedback').className='readout '+(selected==='1'?'status-good':'status-bad');
 $('feedback').textContent=revealed?t(selected==='1'?'correct':'incorrect')+' '+t('explanation'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';$('validation').hidden=!validation;$('validation').textContent=validation?t(validation,{n:run.n,k:run.k}):'';
}
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(run.n,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};
$('preset').onchange=e=>{const [n,k]=presets[Number(e.target.value)];run=Permutation60.trace(n,k);index=0;validation='';$('inputN').value=n;$('inputK').value=k;render();};
$('customForm').noValidate=true;
$('customForm').onsubmit=e=>{e.preventDefault();try{const candidate=Permutation60.trace(Number($('inputN').value),Number($('inputK').value));run=candidate;index=0;validation='applied';$('preset').value='custom';}catch(_){validation='invalid';}render();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{selected=r.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
locale.onChange(render);locale.init();
function updateStep(){const current=[...document.querySelectorAll('.step')].filter(s=>s.getBoundingClientRect().top<=120).pop()||$('step0');document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateStep,{passive:true});window.addEventListener('resize',updateStep);locale.onChange(updateStep);updateStep();
