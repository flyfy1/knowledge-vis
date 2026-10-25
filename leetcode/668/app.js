'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let selected=0,index=0,frames=TableCore.trace(3,3,5),threshold=3,choice=null,revealed=false,copyState='';
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function matrix(target,m,n,x,caption){
  const wrap=el('div',undefined,'table-wrap');wrap.tabIndex=0;wrap.setAttribute('aria-label',t('scrollMatrix'));
  const table=el('table',undefined,'matrix');table.append(el('caption',caption));
  const head=el('thead'),tr=el('tr'),corner=el('th',t('rowHeader'));corner.scope='col';tr.append(corner);
  for(let j=1;j<=n;j++){const th=el('th',j);th.scope='col';tr.append(th);}head.append(tr);table.append(head);
  const body=el('tbody');
  for(let i=1;i<=m;i++){const r=el('tr'),th=el('th',i);th.scope='row';r.append(th);for(let j=1;j<=n;j++){const counted=x!==null&&i*j<=x;r.append(el('td',(counted?'≤ ':'')+i*j,counted?'included':''));}body.append(r);}
  table.append(body);wrap.append(table);$(target).replaceChildren(wrap);
}
function contributions(target,rows){$(target).replaceChildren(...rows.map((count,r)=>el('span',t('rowContribution',{i:r+1,count}))));}
function renderCount(){
  matrix('countTable',3,3,threshold,t('matrixCaption',{x:threshold}));
  const rows=TableCore.counts(3,3,threshold);contributions('rowCounts',rows);
  $('countReadout').textContent=t('totalCount',{x:threshold,parts:rows.join(' + '),count:rows.reduce((a,b)=>a+b,0)});
  $('countLedger').replaceChildren(...Array.from({length:9},(_,i)=>{const tr=el('tr'),th=el('th',i+1);th.scope='row';tr.append(th,el('td',TableCore.counts(3,3,i+1).reduce((a,b)=>a+b,0)));if(i+1===threshold)tr.className='changed';return tr;}));
}
function render(){
  $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));
  $('historyWrap').setAttribute('aria-label',t('scrollHistory'));
  matrix('handTable',3,3,null,t('handCaption'));renderCount();
  const input=TableCore.presets[selected],f=frames[index],q=f.test;
  $('progress').textContent=t('progress',{...input,i:index,total:frames.length-1});
  $('position').max=frames.length-1;$('position').value=index;
  $('prev').disabled=$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===frames.length-1;
  $('intervalValue').textContent=`[${f.lo}, ${f.hi}]`;
  $('testValue').textContent=q?`${q.mid} → ${q.count}`:t('noTest');
  $('decision').textContent=q?t(q.enough?'enough':'few',{...q,...f,k:input.k}):t('initial',{hi:f.hi});
  $('terminal').hidden=f.lo!==f.hi;if(f.lo===f.hi)$('terminal').textContent=t('terminal',f);
  matrix('labTable',input.m,input.n,q?q.mid:null,t(q?'labMatrix':'initialMatrix',{...input,mid:q?q.mid:''}));
  contributions('labRows',q?q.rows:[]);
  const history=frames.slice(1,index+1).map((frame,i)=>{const x=frame.test,tr=el('tr');if(i===index-1)tr.className='current';const th=el('th',i+1);th.scope='row';tr.append(th,...[`[${x.beforeLo}, ${x.beforeHi}]`,`${x.mid} → ${x.count}`,`[${frame.lo}, ${frame.hi}]`,t(x.enough?'keep':'exclude')].map(v=>el('td',v)));return tr;});
  if(!history.length){const tr=el('tr'),td=el('td',t('emptyHistory'));td.colSpan=5;tr.append(td);history.push(tr);}$('history').replaceChildren(...history);
  $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===2?'correct':'incorrect')+' '+t('answer');
  $('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('threshold').oninput=e=>{threshold=Number(e.target.value);renderCount();};
$('preset').onchange=e=>{selected=Number(e.target.value);index=0;const {m,n,k}=TableCore.presets[selected];frames=TableCore.trace(m,n,k);render();};
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});const strip=document.querySelector('.step-nav-inner');document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on){a.setAttribute('aria-current','step');const r=a.getBoundingClientRect(),s=strip.getBoundingClientRect();if(r.left<s.left)strip.scrollLeft-=s.left-r.left+12;else if(r.right>s.right)strip.scrollLeft+=r.right-s.right+12;}else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
