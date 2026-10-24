'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=RangeCore;
let base=0,pair=0,preset=0,at=0,frames=C.trace(...args()),selected=null,revealed=false,copyState='';
function args(){const p=C.presets[preset];return [p.nums,p.lower,p.upper];}
const hand=C.intervals([-2,5,-1],-2,2),prefix=C.prefix([-2,5,-1]);
const pairs=[];for(let i=0;i<3;i++)for(let j=i+1;j<=3;j++)pairs.push([i,j]);
$('pairSelect').innerHTML=pairs.map(([i,j],n)=>`<option value="${n}">i=${i}, j=${j}</option>`).join('');
function value(text,cls=''){const el=document.createElement('div');el.className='value '+cls;el.textContent=text;return el;}
function renderBase(){
 $('handValues').replaceChildren(...[-2,5,-1].map((x,i)=>value(`nums[${i}] = ${x}`)));
 $('baseRows').replaceChildren(...hand.slice(0,base).map(r=>{const tr=document.createElement('tr');[ `[${r.i},${r.j}]`,[-2,5,-1].slice(r.i,r.j+1).join(', '),r.sum,t(r.valid?'yes':'no')].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});return tr;}));
 $('baseStatus').textContent=t('baseStatus',{n:base,count:hand.slice(0,base).filter(r=>r.valid).length});$('basePrev').disabled=base===0;$('baseNext').disabled=base===6;
}
function renderPair(){const [i,j]=pairs[pair];$('prefixValues').replaceChildren(...prefix.map((x,k)=>value(`P[${k}]=${x}`,k===i||k===j?'active':'')));
 const sum=prefix[j]-prefix[i];$('pairRead').textContent=t('pairRead',{i,j,a:prefix[i],b:prefix[j],sum,end:j-1,items:[-2,5,-1].slice(i,j).join(', '),decision:t(-2<=sum&&sum<=2?'yes':'no')});}
function renderTrace(){const f=frames[at],p=C.presets[preset];
 $('inputRead').textContent=t('inputRead',{nums:p.nums.join(', '),lower:p.lower,upper:p.upper,p:C.prefix(p.nums).join(', ')});
 $('frameRead').textContent=t('frameRead',{n:at,max:frames.length-1,total:f.total});
 $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;
 $('halves').hidden=!f.left;
 if(f.kind==='count'){
 $('operationRead').textContent=t('countRead',{...f,bk:f.beforeK,bl:f.beforeL});
 $('leftValues').replaceChildren(...f.left.map((x,i)=>value(`L[${i}]=${x}`,i===f.leftIndex?'active':'')));
 $('rightValues').replaceChildren(...f.right.map((y,pos)=>value(t(pos<f.k?'lowCell':pos<f.l?'validCell':'highCell',{pos,y,x:f.x,diff:y-f.x}),pos>=f.k&&pos<f.l?'valid':'')));
 }else if(f.kind==='merge'){
 $('operationRead').textContent=t('mergeRead',{...f,merged:f.merged.join(', ')});$('leftValues').replaceChildren(...f.left.map(x=>value(x)));$('rightValues').replaceChildren(...f.right.map(x=>value(x)));
 }else $('operationRead').textContent=f.kind==='start'?t('startRead'):t('doneRead',{sorted:f.sorted.join(', ')});
 $('emptyLedger').hidden=f.ledger.length>0;
 $('countLedger').replaceChildren(...f.ledger.map(r=>{const li=document.createElement('li');li.textContent=`[${r.lo},${r.mid}) × [${r.mid},${r.hi}) / x=${r.x} / [${r.k},${r.l}) / +${r.add}`;return li;}));
}
function renderPrediction(){
 $('reveal').disabled=selected===null;
 $('predictionFeedback').textContent=revealed?t(selected===3?'correct':'incorrect')+' '+t('answer'):t('await');
 $('predictionFeedback').classList.toggle('correct',revealed&&selected===3);
}
function render(){renderBase();renderPair();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('basePrev').onclick=()=>{if(base>0)base--;renderBase();};$('baseNext').onclick=()=>{if(base<6)base++;renderBase();};$('baseReset').onclick=()=>{base=0;renderBase();};
$('pairSelect').onchange=e=>{pair=Number(e.target.value);renderPair();};
$('preset').onchange=e=>{preset=Number(e.target.value);frames=C.trace(...args());at=0;renderTrace();};
$('tracePrev').onclick=()=>{if(at>0)at--;renderTrace();};$('traceNext').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};$('traceLast').onclick=()=>{at=frames.length-1;renderTrace();};
for(const input of document.querySelectorAll('[name="prediction"]'))input.onchange=()=>{selected=Number(input.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('predictionReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(x=>x.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';}catch(_){copyState='fallback';$('sourceDetails').open=true;$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();} $('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){
 const nav=document.querySelector('.step-nav'),sections=[...document.querySelectorAll('.step')];
 const edge=nav.getBoundingClientRect().bottom+40;
 let current=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<=edge)current=section;
 document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
