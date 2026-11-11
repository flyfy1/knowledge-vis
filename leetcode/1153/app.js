'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=ConvertCore;
const SANDBOX=[['abbc','bccd'],['abab','baba']];
let sb=0,sbHist=[SANDBOX[0][0]],sbLog=[];
let preset='0',input={...C.presets[0]},frames=C.trace(input.s,input.t,input.alphabet),at=0,restarted=false,inputError=null;
let selection=null,revealed=false,copyState='';
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function stripRow(label,str,cls=i=>''){const r=el('tr');const th=el('th',label);th.scope='row';r.append(th);[...str].forEach((ch,i)=>r.append(el('td',ch,cls(i))));return r;}
// Step 1: hand sandbox (real alphabet).
function renderSandbox(){
 const cur=sbHist[sbHist.length-1],target=SANDBOX[sb][1];
 const ok=i=>cur[i]===target[i]?'ok':'';
 const marks=el('tr');marks.append(el('th',''));[...cur].forEach((c,i)=>marks.append(el('td',c===target[i]?'✓':'·',ok(i))));
 $('sbStrip').replaceChildren(stripRow(t('rowCurrent'),cur,ok),stripRow(t('rowTarget'),target),marks);
 const from=$('sbFrom').value,letters=[...new Set(cur)].sort();
 $('sbFrom').replaceChildren(...letters.map(c=>{const o=el('option',c);o.value=c;return o;}));
 if(letters.includes(from))$('sbFrom').value=from;
 const toPrev=$('sbTo').value;
 $('sbTo').replaceChildren(...[...C.FULL].map(c=>{const o=el('option',c);o.value=c;return o;}));
 $('sbTo').value=toPrev||'b';
 // Stuck if two columns share a current letter but need different targets.
 const need={};let stuck=false;for(let i=0;i<cur.length;i++){if(cur[i] in need&&need[cur[i]]!==target[i])stuck=true;need[cur[i]]=target[i];}
 const matches=[...cur].filter((c,i)=>c===target[i]).length;
 $('sbRead').textContent=t('sbRead',{n:sbLog.length,ok:matches,len:cur.length,status:cur===target?t('sbDone'):stuck?t('sbStuck'):t('sbGoing')});
 $('sbRead').classList.toggle('correct',cur===target);
 $('sbHistory').replaceChildren(...sbLog.map(h=>el('li',`${h.from}→${h.to}: ${h.before} → ${h.after}`)));
 $('sbUndo').disabled=$('sbReset').disabled=sbLog.length===0;
 $('sbApply').disabled=$('sbFrom').value===$('sbTo').value||cur===target;
 $('sbApply').title=$('sbFrom').value===$('sbTo').value?t('sameLetter'):'';
}
// Step 6: trace.
function letterList(xs){return xs.join(' ');}
function renderTrace(){
 const f=frames[at],e=f.event,n=frames.length-1,s=input.s,tt=input.t;
 const phase=at===0?'phaseStart':['map','repeat','conflict'].includes(e.type)?'phaseScan':['equal','full','spareOk'].includes(e.type)?'phaseCheck':'phasePlan';
 const res=f.result===null?'resPending':f.result?'resTrue':'resFalse';
 $('frameRead').textContent=t('frame',{i:at,n,phase:t(phase),result:t(res)});
 $('restart').textContent=inputError?t(inputError.key,inputError.params):restarted?t('restartNote'):'';
 $('restart').classList.toggle('error',!!inputError);
 const key={start:'evStart',map:'evMap',repeat:'evRepeat',conflict:'evConflict',equal:'evEqual',full:'evFull',spareOk:'evSpareOk',merge:'evMerge',chain:'evChain',spare:'evSpare'}[e.type];
 $('eventRead').textContent=t(key,e);
 const scanned=i=>i<=f.i;
 const pos=el('tr','', 'idx');pos.append(el('th','i'));[...s].forEach((_,i)=>pos.append(el('td',(i===f.i&&phase==='phaseScan'?'▼':'')+i,i===f.i&&phase==='phaseScan'?'cur':'')));
 const cls=i=>(e.type==='conflict'&&(i===e.i||i===e.k)?'bad':i===f.i&&phase==='phaseScan'?'cur':scanned(i)?'':'later');
 const rows=[pos,stripRow(t('rowStr1'),s,cls),stripRow(t('rowStr2'),tt,cls)];
 if(phase==='phasePlan')rows.push(stripRow(t('rowNow'),f.current,i=>f.current[i]===tt[i]?'ok':''));
 $('strip').replaceChildren(...rows);
 const keys=Object.keys(f.map).sort();
 $('mapView').textContent=keys.length?keys.map(k=>`${k}→${f.map[k]}`).join('  '):t('mapEmpty');
 const sh=C.shapes(f.map),items=[];
 for(const c of sh.chains)items.push(el('li',t('shapeChain',{path:c.join(' → ')})));
 for(const c of sh.cycles)items.push(el('li',t('shapeCycle',{path:c.join(' → ')}),'cycle'));
 if(sh.fixed.length)items.push(el('li',t('shapeFixed',{letters:letterList(sh.fixed)})));
 if(!items.length)items.push(el('li',t('mapEmpty')));
 $('shapes').replaceChildren(...items);
 $('usedRead').textContent=t('usedCount',{used:new Set(tt).size,A:input.alphabet.length});
 $('history').replaceChildren(...(f.history.length?f.history.map((h,k)=>el('li',`${t('kind'+h.kind[0].toUpperCase()+h.kind.slice(1))} · ${h.from}→${h.to}: ${h.before} → ${h.after}`,k===f.history.length-1?'latest':'')):[el('li',t('historyEmpty'),'empty')]));
 $('prev').disabled=$('traceReset').disabled=at===0;$('next').disabled=$('end').disabled=at===n;
}
function setInputs(){$('in1').value=input.s;$('in2').value=input.t;$('alphabet').value=input.alphabet;}
function restart(next){input=next;frames=C.trace(input.s,input.t,input.alphabet);at=0;restarted=true;inputError=null;$('preset').value=preset;renderTrace();}
function runCustom(){
 const s=$('in1').value.trim(),tt=$('in2').value.trim(),alphabet=$('alphabet').value;
 const bad=[...new Set([...s,...tt].filter(c=>!alphabet.includes(c)))];
 if(!s.length||!tt.length||s.length>30||tt.length>30)inputError={key:'errEmpty',params:{}};
 else if(s.length!==tt.length)inputError={key:'errLength',params:{a:s.length,b:tt.length}};
 else if(bad.length)inputError={key:'errLetters',params:{bad:bad.join(' ')}};
 else inputError=null;
 if(inputError){renderTrace();return;}
 preset='custom';restart({s,t:tt,alphabet});
}
function renderPrediction(){
 $('reveal').disabled=selection===null;$('predictReset').disabled=selection===null;
 $('feedback').textContent=revealed?(selection===1?t('correct'):t('wrong'+selection))+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&selection===1);
}
function render(){renderSandbox();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('sbPreset').onchange=e=>{sb=Number(e.target.value);sbHist=[SANDBOX[sb][0]];sbLog=[];renderSandbox();};
$('sbFrom').onchange=$('sbTo').onchange=renderSandbox;
$('sbApply').onclick=()=>{const cur=sbHist[sbHist.length-1],from=$('sbFrom').value,to=$('sbTo').value;if(from===to)return;const after=C.convert(cur,from,to);sbHist.push(after);sbLog.push({from,to,before:cur,after});renderSandbox();if($('sbApply').disabled)$('sbUndo').focus();};
$('sbUndo').onclick=()=>{if(sbLog.length){sbHist.pop();sbLog.pop();}renderSandbox();if($('sbUndo').disabled)$('sbApply').focus();};
$('sbReset').onclick=()=>{sbHist=[SANDBOX[sb][0]];sbLog=[];renderSandbox();$('sbApply').focus();};
$('preset').onchange=e=>{preset=e.target.value;const p=C.presets[Number(preset)];restart({...p});setInputs();};
$('run').onclick=runCustom;
for(const id of ['in1','in2'])$(id).addEventListener('keydown',e=>{if(e.key==='Enter')runCustom();});
$('prev').onclick=()=>{if(at>0)at--;renderTrace();};
$('next').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};
$('end').onclick=()=>{at=frames.length-1;renderTrace();};
$('traceReset').onclick=()=>{at=0;renderTrace();};
for(const r of document.querySelectorAll('[name="prediction"]'))r.onchange=()=>{selection=Number(r.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{if(selection!==null){revealed=true;renderPrediction();}};
$('predictReset').onclick=()=>{selection=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(r=>r.checked=false);renderPrediction();};
$('sourceCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copySource').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
setInputs();
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav');let current=document.querySelector('.step');for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let navScheduled=false;function scheduleNav(){if(navScheduled)return;navScheduled=true;requestAnimationFrame(()=>{navScheduled=false;updateNav();});}
window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);updateNav();
