'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id),C=window.DivideCore;
let nums=C.presets[0].nums.slice(),k=C.presets[0].k,frames=C.trace(nums,k),at=0,inputError=null,choice=null,revealed=false,copyState='';
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function load(a,kk){nums=a.slice();k=kk;frames=C.trace(nums,k);at=0;inputError=null;$('numsInput').value=nums.join(', ');$('kInput').value=String(k);render();}
function parse(){
 const text=$('numsInput').value.trim(),parts=text?text.split(/[\s,，]+/).filter(Boolean):[];
 const a=parts.map(s=>/^\d{1,3}$/.test(s)?Number(s):NaN),kk=/^\d{1,3}$/.test($('kInput').value.trim())?Number($('kInput').value.trim()):NaN;
 const bad=C.check(a,kk);if(bad){inputError=bad;renderTrace();return;}load(a,kk);
}
function renderFreq(){
 const counts=new Map();for(const v of nums)counts.set(v,(counts.get(v)||0)+1);
 const f=Math.max(...counts.values()),top=[...counts].find(([,c])=>c===f)[0];
 $('freq').replaceChildren(...[...counts].map(([v,c])=>{const d=el('div','bar'+(c===f?' top':''));d.append(el('span','bar-count',String(c)));const col=el('div','bar-col');col.style.height=(14+c*18)+'px';d.append(col,el('span','bar-value',String(v)));return d;}));
 $('freqRead').textContent=t('freqRead',{f,v:top,need:f*k,n:nums.length});
}
function eventText(f){
 const e=f.event;
 switch(e.type){
  case 'start':return t('evStart',{n:f.n,k:f.k});
  case 'count':return t(e.grew?'evCountGrew':f.run===1?'evCountNew':'evCountSame',{i:e.i,v:e.value,run:f.run,f:f.most});
  case 'bound':return t(e.ok?'evBoundOk':'evBoundNo',{f:e.f,k:f.k,need:e.need,n:f.n});
  case 'deal':return t('evDeal',{i:e.i,v:e.value,p:e.pile,f:f.most});
  default:return t(e.ok?'evFinalOk':'evFinalNo',{f:e.f,lengths:e.lengths.join(', '),s:e.shortest,k:f.k,n:f.n});
 }
}
function renderTrace(){
 const f=frames[at],e=f.event;
 $('progress').textContent=t('progress',{i:at,total:frames.length-1});$('event').textContent=eventText(f);
 $('mRun').textContent=e.type==='count'?String(f.run):'—';$('mMost').textContent=e.type==='start'?'—':String(f.most);
 $('mAnswer').textContent=e.type==='bound'||e.type==='deal'||e.type==='final'?t(frames.at(-1).event.ok?'trueWord':'falseWord'):t('pending');
 // Per-position notes: run lengths during phase 1, pile numbers once dealt.
 const runs=[];nums.forEach((v,i)=>runs.push(i>0&&v===nums[i-1]?runs[i-1]+1:1));
 const countedUpTo=e.type==='start'?-1:e.type==='count'?e.i:nums.length-1,dealtUpTo=e.type==='deal'?e.i:e.type==='final'?nums.length-1:-1,cur=e.type==='count'||e.type==='deal'?e.i:-1;
 $('array').replaceChildren(...nums.map((v,i)=>{let note=' ',cls='cell';
  if(dealtUpTo>=0){if(i<=dealtUpTo){note='→ '+(i%f.most);cls+=' pile-'+(i%f.most%6);}else cls+=' pending';}
  else if(i<=countedUpTo){note='×'+runs[i];if(runs[i]===f.most&&f.most>1)cls+=' top';}else cls+=' pending';
  if(i===cur){cls+=' current';note='▲ '+note;}
  const d=el('div',cls);d.append(el('span','v',String(v)),el('small','',note));return d;}));
 if(!f.piles)$('piles').replaceChildren(el('p','hint',t('noPiles')));
 else $('piles').replaceChildren(...f.piles.map((p,j)=>{const row=el('div','pile'+(f.event.type==='final'&&p.length<f.k?' short':''));row.append(el('span','pile-label',t('pileLabel',{p:j,len:p.length})));const chips=el('div','chips');p.forEach((v,m)=>chips.append(el('span','chip pile-'+(j%6)+(e.type==='deal'&&e.pile===j&&m===p.length-1?' current':''),String(v))));row.append(chips);return row;}));
 const g=C.greedyLongest(nums,k);$('greedy').textContent=t('greedyLabel',{chains:g.chains.map(c=>'['+c.join(', ')+']').join(' + '),ok:t(g.ok?'trueWord':'falseWord')});
 $('prev').disabled=$('reset').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;
 $('inputError').hidden=!inputError;$('inputError').textContent=inputError?t('err_'+inputError):'';
 $('numsInput').setAttribute('aria-invalid',String(!!inputError&&inputError!=='k'));$('kInput').setAttribute('aria-invalid',String(inputError==='k'));
 document.querySelectorAll('#presets button').forEach((b,i)=>{const p=C.presets[i];b.setAttribute('aria-pressed',String(p.k===k&&p.nums.join()===nums.join()));});
 renderFreq();
}
function renderPrediction(){
 $('reveal').disabled=choice===null;
 $('feedback').textContent=revealed?(choice===1?t('correct'):t('wrong'+choice))+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&choice===1);
}
function render(){renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';$('langToggle').setAttribute('aria-label',t('language'));$('stepNav').setAttribute('aria-label',t('navLabel'));}
$('presets').replaceChildren(...C.presets.map((p,i)=>{const b=el('button','btn preset-btn','['+p.nums.join(',')+'], k='+p.k);b.type='button';b.dataset.preset=i;b.onclick=()=>load(p.nums,p.k);return b;}));
$('apply').onclick=parse;for(const id of ['numsInput','kInput'])$(id).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();parse();}});
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
