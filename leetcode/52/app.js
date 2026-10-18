'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,$=id=>document.getElementById(id);
let run=Queens52.trace(4),index=0,selected=null,revealed=false,copyState='';
function message(f){return t(f.kind,{n:run.n,r:f.r,c:f.c,d:f.r-f.c,u:f.r+f.c,keys:f.conflicts.join(', '),count:f.count});}
function board(f,label='boardLabel'){
 const table=document.createElement('table');table.className='queen-board';table.setAttribute('aria-label',t(label));
 const head=document.createElement('thead'),tr=document.createElement('tr'),corner=document.createElement('th');corner.textContent=t('row')+' / '+t('col');tr.append(corner);
 for(let c=0;c<run.n;c++){const th=document.createElement('th');th.scope='col';th.textContent=c;tr.append(th);}head.append(tr);table.append(head);
 const body=document.createElement('tbody');
 for(let r=0;r<run.n;r++){const row=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=r;row.append(th);
  for(let c=0;c<run.n;c++){const td=document.createElement('td');let val='empty';td.textContent='.';
   if(f.placement[r]===c){td.className='queen';td.textContent='Q';val='queen';}
   else if(f.r===r&&f.c===c&&f.kind==='reject'){td.className='rejected';td.textContent='×';val='rejectCell';}
   else if(f.r===r&&f.c===c&&f.kind==='undo'){td.className='candidate';td.textContent='?';val='undoCell';}
   td.setAttribute('aria-label',t('cell',{r,c,value:t(val)}));row.append(td);
  }body.append(row);
 }table.append(body);return table;
}
function state(f){const dl=document.createElement('dl');dl.className='state-list';for(const k of ['placement','cols','down','up']){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=t(k);dd.textContent=(k==='placement'?'[':'{')+f[k].join(', ')+(k==='placement'?']':'}');dl.append(dt,dd);}return dl;}
const operations={start:'count = 0\ncols, down, up = set(), set(), set()\nsearch(0)',reject:'if c in cols or r - c in down or r + c in up:\n    continue',place:'cols.add(c)\ndown.add(r - c)\nup.add(r + c)',undo:'cols.remove(c)\ndown.remove(r - c)\nup.remove(r + c)',solution:'if r == n:\n    count += 1\n    return',end:'return count'};
function render(){
 const f=run.frames[index];$('prev').disabled=index===0;$('next').disabled=index===run.frames.length-1;$('reset').disabled=index===0;
 $('position').max=run.frames.length-1;$('position').value=index;$('progress').textContent=t('progress',{i:index,last:run.frames.length-1,count:f.count});$('message').textContent=message(f);
 $('diagram').replaceChildren(board(f));$('state').replaceChildren(...state(f).childNodes);
 if(index){$('beforeDiagram').replaceChildren(board(run.frames[index-1],'previousBoardLabel'),state(run.frames[index-1]));}else{$('beforeDiagram').textContent=t('noBefore');}
 $('results').replaceChildren();if(!f.leaves.length){$('results').textContent=t('none');}else{const ul=document.createElement('ul');ul.className='solution-ledger';f.leaves.forEach((b,i)=>{const li=document.createElement('li'),label=document.createElement('b'),pre=document.createElement('pre');label.textContent=t('boardNumber',{i:i+1});pre.textContent='['+b.join(', ')+']';li.append(label,pre);ul.append(li);});$('results').append(ul);}
 $('operation').textContent=operations[f.kind];$('history').replaceChildren(...run.frames.slice(0,index+1).map((f,i)=>{const li=document.createElement('li');li.textContent=i+' · '+message(f);return li;}));
 $('reveal').disabled=selected===null;$('feedback').hidden=!revealed;$('feedback').className='readout '+(selected==='2'?'status-good':'status-bad');$('feedback').textContent=revealed?t(selected==='2'?'correct':'incorrect')+' '+t('explanation'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(run.frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};$('preset').onchange=e=>{run=Queens52.trace(Number(e.target.value));index=0;render();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{selected=r.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
locale.onChange(render);locale.init();
function updateStep(){
 const sections=[...document.querySelectorAll('.step')];
 const current=sections.filter(el=>el.getBoundingClientRect().top<=120).pop()||sections[0];
 document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+current.id));
}
window.addEventListener('scroll',updateStep,{passive:true});window.addEventListener('resize',updateStep);locale.onChange(updateStep);updateStep();
