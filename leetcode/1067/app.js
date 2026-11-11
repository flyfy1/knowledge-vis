'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id),C=DigitCore;
let hand={d:1,low:1,high:13},handMsg=null,wallState={d:3,p:1,N:125};
let input={d:1,low:1,high:13,preset:0,rule:'correct'},frames=C.trace(1,1,13,'correct'),at=0,inputMsg=null,choice=null,revealed=false,copyState='';
const CORRECT=2;
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function message(target,msg){target.textContent=msg?t(msg.key,msg.params||{}):'';target.classList.toggle('error',!!(msg&&msg.key.startsWith('err')));}
// Step 0: every number written out, each occurrence of d boxed.
function renderHand(){
 const {d,low,high}=hand,ch=String(d),items=[];let count=0,numbers=0;
 for(let x=low;x<=high;x++){
  const s=String(x),node=el('span','num');let hits=0;
  for(const k of s){if(k===ch){hits++;node.append(el('span','dg hit',k));}else node.append(el('span','dg',k));}
  if(hits){count+=hits;numbers++;node.classList.add('has');}
  items.push(node);
 }
 $('handNumbers').replaceChildren(...items);
 $('handRead').textContent=t('handRead',{low,high,d,count,numbers});
 message($('handStatus'),handMsg);
}
// Step 2: the number wall 0..N, ten to a row.
function renderWall(){
 const {d,p,N}=wallState,place=Math.round(Math.log10(p)),cells=C.wall(N,d);
 $('wallNValue').textContent='N = '+N;$('wallN').value=N;$('wallD').value=d;$('wallPlace').value=p;
 $('wall').replaceChildren(...cells.map(c=>{
  const node=el('span','wcell'+(c.x===0?' zero':'')+(c.hits.includes(place)?' on':''));
  for(let k=0;k<c.s.length;k++){const pos=c.s.length-1-k,hit=c.hits.includes(pos);node.append(el('span','dg'+(hit?(pos===place?' hit':' other'):''),c.s[k]));}
  return node;
 }));
 const r=C.placeCount(N,d,p),from=Math.max(r.from,1);
 const partialText=r.kind==='above'?t('partAbove',{d,p}):r.kind==='equal'?t('partEqual',{d,start:Math.max(r.from+d*p,1),n:N,right:r.right}):t('partBelow',{d});
 $('wallRead').textContent=t('wallRead',{place:t('place'+p),d,n:N,count:r.count,block:10*p,blocks:r.left,p,full:r.full,from,cur:r.cur,partialText,partial:r.partial});
}
// Step 3: one frame per place.
function partialShort(row){return row.kind==='above'?t('partialAboveShort',{p:row.power}):row.kind==='equal'?t('partialEqualShort',{partial:row.partial}):t('partialBelowShort');}
function frameText(f){
 const lowm=f.low-1;
 if(f.type==='start')return t('frameStart',{high:f.high,lowm});
 if(f.type==='place'){
  const r=f.row;if(r.kind==='leading')return t('framePlaceLeading',{n:f.n,p:r.power});
  const blocksText=f.d===0&&f.rule==='correct'?t('blocksZero',{blocks:r.blocks}):t('blocksPlain',{blocks:r.blocks});
  return t('framePlace',{n:f.n,p:r.power,left:r.left,cur:r.cur,right:r.right,blocksText,full:r.full,cmp:r.kind==='above'?'>':r.kind==='equal'?'=':'<',d:f.d,partialText:partialShort(r),contribution:r.contribution,before:r.before,total:r.total});
 }
 if(f.type==='sideDone'){if(f.side==='high')return t('frameSideHigh',{n:f.n,value:f.value,lowm});return f.n===0?t('frameSideZero'):t('frameSideLow',{n:f.n,value:f.value});}
 const count=f.high-f.low+1,check=f.check===null?t('checkSkip',{count}):f.check===f.result?t('checkYes',{count,check:f.check}):t('checkNo',{count,check:f.check,diff:f.result-f.check});
 return t('frameStop',{high:f.high,lowm,fh:f.fh,fl:f.fl,result:f.result,check});
}
function renderTrace(){
 const f=frames[at];
 $('preset').value=input.preset===undefined?'custom':String(input.preset);$('rule').value=input.rule;
 $('inputRead').textContent=t('inputRead',{d:input.d,low:input.low,high:input.high,rule:t(input.rule==='correct'?'ruleCorrect':'ruleNaive')});
 message($('inputStatus'),inputMsg);
 $('progress').textContent=t('progress',{done:at+1,total:frames.length});
 $('frameRead').textContent=frameText(f);
 const rows=[];
 for(const side of ['high','low'])f.done[side].forEach((r,k)=>{
  const current=f.type==='place'&&f.side===side&&k===f.done[side].length-1,n=side==='high'?f.high:f.low-1;
  const tr=el('tr',current?'current':'');
  const cells=[(current?'★ ':'')+`f(${n})`,String(r.power),`${r.left} | ${r.cur} | ${r.right}`,r.kind==='leading'?'—':String(r.full),r.kind==='leading'?'—':`${r.cur} ${r.kind==='above'?'>':r.kind==='equal'?'=':'<'} ${f.d} → +${r.partial}`,String(r.contribution),String(r.total)];
  cells.forEach((c,i)=>tr.append(el(i===0?'th':'td','',c)));tr.firstChild.setAttribute('scope','row');
  rows.push(tr);
 });
 $('placeRows').replaceChildren(...rows);$('tableEmpty').hidden=rows.length>0;$('tableWrap').hidden=rows.length===0;
 $('prev').disabled=$('traceReset').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;
}
function loadInput(next,msg){input=next;frames=C.trace(input.d,input.low,input.high,input.rule);at=0;inputMsg=msg;$('traceD').value=input.d;$('traceLow').value=input.low;$('traceHigh').value=input.high;renderTrace();}
function renderPrediction(){
 $('reveal').disabled=choice===null;$('predictionReset').disabled=choice===null;
 $('feedback').textContent=revealed?(choice===CORRECT?t('correct'):t('wrong'+choice))+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&choice===CORRECT);
}
function render(){renderHand();renderWall();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('handD').replaceChildren(...Array.from({length:10},(_,d)=>{const o=el('option','',String(d));o.value=d;return o;}));$('handD').value=hand.d;
$('wallD').replaceChildren(...Array.from({length:9},(_,i)=>{const o=el('option','',String(i+1));o.value=i+1;return o;}));
$('handApply').onclick=()=>{const r=C.parse($('handD').value,$('handLow').value,$('handHigh').value,C.LIMITS.handMax,C.LIMITS.handSpan-1);if(!r.ok){handMsg={key:r.error,params:{max:C.LIMITS.handMax}};renderHand();return;}hand={d:r.d,low:r.low,high:r.high};handMsg=null;renderHand();};
$('wallN').oninput=$('wallN').onchange=()=>{wallState.N=+$('wallN').value;renderWall();};
$('wallD').onchange=()=>{wallState.d=+$('wallD').value;renderWall();};
$('wallPlace').onchange=()=>{wallState.p=+$('wallPlace').value;renderWall();};
$('preset').onchange=()=>{const i=+$('preset').value,p=C.presets[i];loadInput({...p,preset:i,rule:input.rule},null);};
$('rule').onchange=()=>loadInput({...input,rule:$('rule').value},null);
$('load').onclick=()=>{const r=C.parse($('traceD').value,$('traceLow').value,$('traceHigh').value);if(!r.ok){inputMsg={key:r.error,params:{max:C.LIMITS.maxHigh}};renderTrace();return;}const i=C.presets.findIndex(p=>p.d===r.d&&p.low===r.low&&p.high===r.high);loadInput({d:r.d,low:r.low,high:r.high,preset:i<0?undefined:i,rule:input.rule},{key:'loaded',params:{d:r.d,low:r.low,high:r.high}});};
$('prev').onclick=()=>{if(at>0)at--;renderTrace();};$('next').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};
$('traceReset').onclick=()=>{at=0;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{choice=Number(r.value);revealed=false;renderPrediction();});
$('reveal').onclick=()=>{if(choice!==null){revealed=true;renderPrediction();}};
$('predictionReset').onclick=()=>{choice=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(r=>r.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav');let current=document.querySelector('.step');for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let navQueued=false;window.addEventListener('scroll',()=>{if(navQueued)return;navQueued=true;requestAnimationFrame(()=>{navQueued=false;updateNav();});},{passive:true});window.addEventListener('resize',updateNav);updateNav();
