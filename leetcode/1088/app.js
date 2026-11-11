'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id),C=window.ConfusingCore;
const fmt=v=>String(v);
let turnX=16,turnBad=false,gridN=70,gridBad=false,gridShown=false;
let traceN=70,frames=C.trace(70),at=0,nBad=false,choice=null,revealed=false,copyState='';
function parseN(text,max){const s=String(text).trim();if(!/^\d{1,10}$/.test(s))return null;const v=Number(s);return v>=1&&v<=max?v:null;}
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function digitTile(d,cls,mark){const e=el('div','digit '+cls,d);e.append(el('small','',mark||' '));return e;}

function renderTurn(){
 const r=C.turnDetail(turnX);
 $('turnFrom').replaceChildren(...r.digits.map(d=>digitTile(d,d in C.TURN?'ok':'bad',d in C.TURN?'':'✕')));
 $('turnTo').replaceChildren(...r.cells.map(c=>digitTile(c.to===null?'✕':c.to,c.to===null?'bad':'ok',c.to===null?c.from+' ✕':c.from+'→'+c.to)));
 let text=r.kind==='invalid'?t('vInvalid',{x:turnX}):t(r.kind==='self'?'vSelf':'vConfusing',{x:turnX,r:r.result});
 if(r.ok&&r.raw!==String(r.result))text+=' '+t('vZero',{raw:r.raw,r:r.result});
 if(turnBad)text=t('badInput')+' '+text;
 $('turnRead').textContent=text;$('turnInput').setAttribute('aria-invalid',String(turnBad));
}
function renderGrid(){
 const g=C.grid(gridN);
 $('grid').replaceChildren(...g.cells.map(c=>{const self=gridShown&&c.kind==='self';const e=el('span','cell '+(c.kind==='invalid'?'invalid':self?'self':'turnable'),self?'↺'+c.x:String(c.x));return e;}));
 $('gridRead').textContent=gridShown?t('gridCountShown',{N:gridN,bad:g.invalid,s:g.survivors,t:g.self,c:g.confusing}):t('gridCount',{N:gridN,bad:g.invalid,s:g.survivors});
 $('gridToggle').textContent=t(gridShown?'gridHide':'gridShow');$('gridToggle').setAttribute('aria-pressed',String(gridShown));
 $('splitBlock').hidden=!gridShown;$('gridBad').hidden=!gridBad;$('gridInput').setAttribute('aria-invalid',String(gridBad));
}
function digitStates(f){
 const L=f.digits.length,e=f.event,prefixRows=f.ledger.filter(r=>r.phase==='prefix');
 return f.digits.map((d,j)=>{
  if(e.type==='prefix'){if(j<e.pos)return ['matched','✓'];if(j===e.pos)return [e.turnable?'current':'current bad',e.turnable?'▲':'▲ ✕'];return ['pending',''];}
  if(prefixRows.length===0)return ['',''];
  const last=prefixRows.at(-1);
  if(!last.turnable){if(j<last.pos)return ['matched','✓'];if(j===last.pos)return ['bad','✕'];return ['pending',''];}
  return j<=last.pos?['matched','✓']:['pending',''];
 });
}
function rowLabel(r){
 if(r.phase==='shorter')return t('rowShorter',r);if(r.phase==='prefix')return t('rowPrefix',r);if(r.phase==='itself')return t('rowItself');return t('rowSelf',r);
}
function eventText(f){
 const e=f.event;
 switch(e.type){
  case 'start':return t('evStart',{n:f.n,L:e.L});
  case 'shorter':return t('evShorter',{length:e.length,e:e.length-1,add:e.add});
  case 'prefix':{const s=t('evPrefix',{pos:e.pos,digit:e.digit,lower:e.lower.length?e.lower.join(', '):t('none'),k:e.lower.length,rest:e.rest,add:e.add});return e.turnable?s:s+' '+t('evPrefixStop',{digit:e.digit});}
  case 'itself':return t('evItself');
  case 'self':return t('evSelf',e);
  default:return t('evFinal',{s:f.survivors,t:f.same,answer:f.answer});
 }
}
function renderTrace(){
 const f=frames[at],e=f.event;
 $('progress').textContent=t('progress',{i:at,total:frames.length-1});
 $('event').textContent=eventText(f);
 $('mTurn').textContent=fmt(f.survivors);$('mSame').textContent=fmt(f.same);$('mAnswer').textContent=e.type==='final'?fmt(f.answer):t('pending');
 const states=digitStates(f);$('nDigits').replaceChildren(...f.digits.map((d,j)=>digitTile(d,states[j][0],states[j][1])));
 $('sampleBox').hidden=e.type!=='self';
 if(e.type!=='self'){$('sample').replaceChildren();$('sampleBefore').textContent='';$('sampleAfter').textContent='';}
 else{
  $('sample').replaceChildren(...e.sample.map(s=>el('span','chip '+(s.kept?'kept':'out'),s.v+(s.kept?' ✓':' ✗'))));
  $('sampleBefore').hidden=!e.before;$('sampleBefore').textContent=e.before?t('sampleBefore',{k:e.before}):'';
  $('sampleAfter').hidden=!e.after;$('sampleAfter').textContent=e.after?t('sampleAfter',{k:e.after}):'';
 }
 const rows=f.ledger.map((r,i)=>{const current=i===f.ledger.length-1&&e.type!=='start'&&e.type!=='final';const tr=el('tr',current?'current-row':'');
  for(const v of [(current?'★ ':'')+rowLabel(r),'+'+(r.phase==='self'?r.kept:r.add),r.survivors,r.same])tr.append(el('td','',String(v)));return tr;});
 if(!rows.length){const tr=el('tr');const td=el('td','',t('ledgerEmpty'));td.colSpan=4;tr.append(td);rows.push(tr);}
 $('ledger').replaceChildren(...rows);
 $('prev').disabled=$('reset').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;
 $('nBad').hidden=!nBad;$('nInput').setAttribute('aria-invalid',String(nBad));
 document.querySelectorAll('#tracePresets button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.n)===traceN)));
}
function renderPrediction(){
 $('reveal').disabled=choice===null;
 $('feedback').textContent=revealed?(choice===2?t('correct'):t('wrong'+choice))+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&choice===2);
}
function render(){renderTurn();renderGrid();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';$('langToggle').setAttribute('aria-label',t('language'));$('stepNav').setAttribute('aria-label',t('navLabel'));}

$('turnInput').addEventListener('input',()=>{const v=parseN($('turnInput').value,C.MAX_N);turnBad=v===null;if(v!==null)turnX=v;renderTurn();});
document.querySelectorAll('#turnPresets button').forEach(b=>b.onclick=()=>{turnX=Number(b.dataset.x);turnBad=false;$('turnInput').value=b.dataset.x;renderTurn();});
$('gridInput').addEventListener('input',()=>{const v=parseN($('gridInput').value,300);gridBad=v===null;if(v!==null)gridN=v;renderGrid();});
$('gridToggle').onclick=()=>{gridShown=!gridShown;renderGrid();};
function loadTrace(n){traceN=n;frames=C.trace(n);at=0;nBad=false;$('nInput').value=String(n);renderTrace();}
function applyInput(){const v=parseN($('nInput').value,C.MAX_N);if(v===null){nBad=true;renderTrace();return;}loadTrace(v);}
$('apply').onclick=applyInput;$('nInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applyInput();}});
$('tracePresets').replaceChildren(...C.presets.map(n=>{const b=el('button','btn chip-btn',String(n));b.type='button';b.dataset.n=n;b.onclick=()=>loadTrace(n);return b;}));
$('prev').onclick=()=>{if(at>0)at--;renderTrace();};$('next').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};
$('reset').onclick=()=>{at=0;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};
document.querySelectorAll('[name=prediction]').forEach(r=>r.onchange=()=>{choice=Number(r.value);revealed=false;renderPrediction();});
$('reveal').onclick=()=>{if(choice!==null){revealed=true;renderPrediction();}};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){const bottom=$('stepNav').getBoundingClientRect().bottom+40;let current=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=bottom)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+current.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let navQueued=false;window.addEventListener('scroll',()=>{if(!navQueued){navQueued=true;requestAnimationFrame(()=>{navQueued=false;updateNav();});}},{passive:true});window.addEventListener('resize',updateNav);updateNav();
