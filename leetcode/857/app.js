'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let pair='AB',preset=0,index=0,choice=null,revealed=false,copyState='';
let model=WorkerLab.trace(WorkerLab.presets[0]);
const fmt=n=>n===null?t('none'):n.toFixed(5);
function render(){
 $('handRead').textContent=t('hand'+pair);
 $('presetDescription').textContent=t('preset'+preset);
 ['AB','AC','BC'].forEach(x=>$('pair'+x).setAttribute('aria-pressed',String(pair===x)));
 const p=WorkerLab.presets[preset],f=model.frames[index];
 $('inputRead').textContent=t('input',{q:p.q.join(', '),w:p.w.join(', '),k:p.k});
 $('frameRead').textContent=index?t('frame',{i:index,n:p.q.length,id:f.x.id,r:fmt(f.x.rate),sum:f.sum,cost:fmt(f.cost),scope:t(index===p.q.length?'final':'bestSoFar'),best:fmt(f.best),ids:f.bestIds.join(', ')}):t('initial',{n:p.q.length});
 $('members').replaceChildren();
 if(!f.kept.length)$('members').textContent=t('empty');
 for(const a of f.kept){const el=document.createElement('div');el.className='worker'+(f.x&&a.id===f.x.id?' current':'');el.textContent=t('worker',{id:a.id,q:a.q,w:a.w,r:fmt(a.rate),mark:f.x&&a.id===f.x.id?t('currentMark'):''});$('members').append(el);}
 $('ledger').replaceChildren();
 model.frames.slice(1,index+1).forEach(a=>{const li=document.createElement('li');li.textContent=t('ledger',{i:a.done,id:a.x.id,q:a.x.q,removed:a.removed?'#'+a.removed.id:t('noRemoval'),old:a.old,drop:a.removed?a.removed.q:0,sum:a.sum,r:fmt(a.x.rate),cost:fmt(a.cost),best:fmt(a.best)});$('ledger').append(li);});
 $('emptyHistory').hidden=index>0;
 $('tracePrev').disabled=index===0;$('traceReset').disabled=index===0;
 $('traceNext').disabled=index===p.q.length;$('traceLast').disabled=index===p.q.length;
 $('reveal').disabled=choice===null||revealed;
 $('predictionFeedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('answer'):t(choice===null?'pending':'chosen');
 $('predictionFeedback').classList.toggle('correct',revealed&&choice==='1');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
['AB','AC','BC'].forEach(x=>$('pair'+x).onclick=()=>{pair=x;render();});
$('preset').onchange=()=>{preset=Number($('preset').value);model=WorkerLab.trace(WorkerLab.presets[preset]);index=0;render();};
$('tracePrev').onclick=()=>{index=Math.max(0,index-1);render();};
$('traceNext').onclick=()=>{index=Math.min(model.frames.length-1,index+1);render();};
$('traceReset').onclick=()=>{index=0;render();};$('traceLast').onclick=()=>{index=model.frames.length-1;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=el.value;revealed=false;render();});
$('reveal').onclick=()=>{revealed=true;render();};$('predictionReset').onclick=()=>{choice=null;revealed=false;document.querySelectorAll('[name=prediction]').forEach(e=>e.checked=false);render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='manualCopy';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}render();};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));},{rootMargin:'-15% 0px -65% 0px'});
document.querySelectorAll('.step').forEach(e=>observer.observe(e));
