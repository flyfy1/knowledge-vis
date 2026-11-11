'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id),C=ValidCore;
const EX=[1,4,2,5,3];
let checked=[],selected=null,showAll=false,rowSel=1,colSel=2;
let input={nums:C.presets[0],preset:0,rule:'gt'},frames=C.trace(input.nums,input.rule),at=0,inputMsg=null,choice=null,revealed=false,copyState='';
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
// Triangle of subarrays: row = start i, column = end j >= i. cell(i,j) returns {mark,cls}.
function triangle(target,nums,cell,opts={}){
 const n=nums.length,parts=[el('div','tri-corner','i\\j')];target.style.setProperty('--n',n);
 for(let j=0;j<n;j++){const h=el('div','tri-head'+(opts.col===j?' hot':''));h.append(el('span','tri-idx',String(j)),el('span','tri-val',String(nums[j])));parts.push(h);}
 for(let i=0;i<n;i++){
  const h=el('div','tri-head row'+(opts.row===i?' hot':''));h.append(el('span','tri-idx',String(i)),el('span','tri-val',String(nums[i])));parts.push(h);
  for(let j=0;j<n;j++){
   if(j<i){parts.push(el('div','tri-void'));continue;}
   const s=cell(i,j),node=el(opts.buttons?'button':'div','tri-cell '+(s.cls||'')+(opts.row===i?' in-row':'')+(opts.col===j?' in-col':''),s.mark);
   if(opts.buttons){node.type='button';node.dataset.i=i;node.dataset.j=j;node.setAttribute('aria-label',`nums[${i}..${j}] = [${nums.slice(i,j+1).join(', ')}] ${s.mark==='·'?'':s.mark}`);node.setAttribute('aria-pressed',String(!!(selected&&selected[0]===i&&selected[1]===j)));}
   parts.push(node);
  }
 }
 target.replaceChildren(...parts);
}
function verdict(nums,i,j){return C.valid(nums,i,j)?'✓':'✗';}
function renderGrid0(){
 const isChecked=(i,j)=>checked.some(([a,b])=>a===i&&b===j);
 triangle($('grid0'),EX,(i,j)=>{const known=showAll||isChecked(i,j),v=verdict(EX,i,j);return {mark:known?v:'·',cls:(known?(v==='✓'?'ok':'bad'):'unknown')+(selected&&selected[0]===i&&selected[1]===j?' selected':'')};},{buttons:true});
 $('grid0').querySelectorAll('button').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,j=+b.dataset.j;selected=[i,j];if(!isChecked(i,j))checked.push([i,j]);renderGrid0();$('grid0').querySelector(`button[data-i="${i}"][data-j="${j}"]`).focus();});
 if(selected){const [i,j]=selected,k=C.breaker(EX,i,j);$('cellRead').textContent=t('cellRead',{i,j,sub:EX.slice(i,j+1).join(', '),v:EX[i],verdict:k<0?t('cellValid',{v:EX[i]}):t('cellInvalid',{k,b:EX[k],v:EX[i]})});}else $('cellRead').textContent=t('gridIdle');
 const total=EX.length*(EX.length+1)/2,valid=C.bruteCount(EX);
 $('gridCount').textContent=showAll?t('gridAll',{total,valid}):t('gridCount',{checked:checked.length,total,valid:checked.filter(([i,j])=>C.valid(EX,i,j)).length});
 $('showAll').textContent=t(showAll?'hideAll':'showAll');$('showAll').setAttribute('aria-pressed',String(showAll));
}
function renderRows(){
 const i=rowSel,next=C.firstSmaller(EX,i),count=next-i;
 triangle($('gridRow'),EX,(a,b)=>{const v=verdict(EX,a,b);return {mark:v,cls:(v==='✓'?'ok':'bad')+(a!==i?' dim':'')+(a===i&&b===next?' breaker':'')};},{row:i});
 $('rowRead').textContent=t('rowRead',{i,v:EX[i],last:next-1,count,why:next<EX.length?t('rowWhyCut',{v:EX[i],b:EX[next],k:next,i}):t('rowWhyEnd',{v:EX[i]})});
 const j=colSel,alive=[];for(let s=0;s<=j;s++)if(C.valid(EX,s,j))alive.push(s);
 const before=[];if(j>0)for(let s=0;s<j;s++)if(C.valid(EX,s,j-1))before.push(s);const dead=before.filter(s=>!alive.includes(s));
 triangle($('gridCol'),EX,(a,b)=>{const v=verdict(EX,a,b);return {mark:v,cls:(v==='✓'?'ok':'bad')+(b!==j?' dim':'')+(b===j&&dead.includes(a)?' breaker':'')};},{col:j});
 $('colRead').textContent=t('colRead',{j,v:EX[j],list:'['+alive.map(s=>`${s}:${EX[s]}`).join(', ')+']',count:alive.length,died:j===0?t('colFirst'):dead.length?t('colDied',{v:EX[j],dead:dead.map(s=>`${s}:${EX[s]}`).join(', ')}):t('colNone',{v:EX[j]})});
}
function renderTrace(){
 const f=frames[at],nums=f.nums,n=nums.length,j=f.type==='start'?-1:f.type==='stop'?n-1:f.j;
 $('preset').value=input.preset===undefined?'custom':String(input.preset);$('rule').value=input.rule;
 $('inputRead').textContent=t('inputRead',{nums:'['+nums.join(', ')+']',rule:t(input.rule==='gt'?'ruleGt':'ruleGe')});
 $('inputStatus').textContent=inputMsg?t(inputMsg.key,inputMsg.params||{}):'';$('inputStatus').classList.toggle('error',!!(inputMsg&&inputMsg.key.startsWith('err')));
 $('progress').textContent=t('progress',{done:j+1,total:n});
 const cond=f.rule==='ge'?'≥':'>',pairs=list=>'['+list.map(i=>`${i}:${nums[i]}`).join(', ')+']';
 if(f.type==='start')$('frameRead').textContent=t('frameStart');
 else if(f.type==='arrive'){const pops=f.popped.length?t('popsSome',{list:pairs(f.popped),cond,v:f.value,j:f.j}):t('popsNone',{cond,v:f.value});$('frameRead').textContent=t('frameArrive',{j:f.j,v:f.value,pops,stack:pairs(f.stack),count:f.count,before:f.totalBefore,total:f.total});}
 else $('frameRead').textContent=t('frameStop',{total:f.result,brute:f.brute,match:f.result===f.brute?t('matchYes'):t('matchNo',{diff:f.brute-f.result})});
 $('arr').style.setProperty('--n',n);
 $('arr').replaceChildren(...nums.map((v,k)=>{
  const state=k>j?'future':f.type==='arrive'&&k===f.j?'now':f.died[k]!==null?'dead':'alive';
  const cell=el('div','cell '+state);const st=el('span','cell-state');if(state==='dead')st.append(el('span','','✗'),el('span','','j='+f.died[k]));else st.textContent=state==='alive'?'✓':state==='now'?'★':'…';cell.append(el('span','cell-idx',String(k)),el('span','cell-val',String(v)),st);return cell;}));
 $('stack').replaceChildren(...(f.stack.length?f.stack.map((i,x)=>el('span','chip'+(f.type==='arrive'&&i===f.j?' pushed':''),`${i}:${nums[i]}`+(x===f.stack.length-1?' ←':''))):[el('span','chip empty',t('stackEmpty'))]));
 triangle($('gridTrace'),nums,(a,b)=>{
  if(b>j)return {mark:'',cls:'unknown'};
  const alive=f.died[a]===null||f.died[a]>b,truth=C.valid(nums,a,b);
  return {mark:alive?'✓':truth?'✗!':'✗',cls:(alive?'ok':truth?'bad mismatch':'bad')+(f.type==='arrive'&&b===f.j?' current':'')};
 },{col:f.type==='arrive'?f.j:undefined});
 $('ledgerEmpty').hidden=f.counts.length>0;
 $('ledger').replaceChildren(...f.counts.map((c,k)=>el('li','ledger-item'+(f.type==='arrive'&&k===f.j?' current':''),t('ledgerItem',{j:k,count:c}))));
 $('prev').disabled=$('traceReset').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;
}
function loadInput(next,message){input=next;frames=C.trace(input.nums,input.rule);at=0;inputMsg=message;renderTrace();}
function renderPrediction(){
 $('reveal').disabled=choice===null;$('predictionReset').disabled=choice===null;
 $('feedback').textContent=revealed?(choice===1?t('correct'):t('wrong'+choice))+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&choice===1);
}
function render(){renderGrid0();renderRows();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('showAll').onclick=()=>{showAll=!showAll;renderGrid0();};
$('rowSel').replaceChildren(...EX.map((v,i)=>{const o=el('option','',`i = ${i} · ${v}`);o.value=i;return o;}));$('rowSel').value=rowSel;
$('colSel').replaceChildren(...EX.map((v,j)=>{const o=el('option','',`j = ${j} · ${v}`);o.value=j;return o;}));$('colSel').value=colSel;
$('rowSel').onchange=()=>{rowSel=+$('rowSel').value;renderRows();};$('colSel').onchange=()=>{colSel=+$('colSel').value;renderRows();};
$('preset').onchange=()=>{const i=+$('preset').value;$('numsInput').value=C.presets[i].join(' ');loadInput({nums:C.presets[i],preset:i,rule:input.rule},null);};
$('rule').onchange=()=>loadInput({...input,rule:$('rule').value},null);
$('load').onclick=()=>{const r=C.parse($('numsInput').value);if(!r.ok){inputMsg={key:r.error};renderTrace();return;}const i=C.presets.findIndex(p=>p.join()===r.nums.join());loadInput({nums:r.nums,preset:i<0?undefined:i,rule:input.rule},{key:'loaded',params:{nums:'['+r.nums.join(', ')+']'}});};
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
