'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=RangeCore;
let probe='4',preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
const fmt=p=>JSON.stringify(p),rangeText=p=>C.ranges(p).map(([l,r])=>`[${l},${r})`).join(' ∪ ')||t('empty');
function plot(id,p,lo,hi){
  const container=$(id),line=document.createElement('div');line.className='interval-line';line.setAttribute('aria-hidden','true');
  for(const [l,r] of C.ranges(p)){
    const band=document.createElement('span');band.className='interval-band';band.style.left=((l-lo)/(hi-lo)*100)+'%';band.style.width=((r-l)/(hi-lo)*100)+'%';line.append(band);
    for(const [x,start] of [[l,true],[r,false]]){const dot=document.createElement('span');dot.className='endpoint'+(start?' start':'');dot.style.left=((x-lo)/(hi-lo)*100)+'%';line.append(dot);}
  }
  const list=document.createElement('div');list.className='range-list';
  if(!p.length){const empty=document.createElement('span');empty.textContent=t('empty');list.append(empty);}
  for(const [l,r] of C.ranges(p)){const chip=document.createElement('span');chip.className='range-chip';chip.textContent=`[${l},${r})`;list.append(chip);}
  container.replaceChildren(line,list);
}
function renderPoints(id,p){
  const el=$(id);el.replaceChildren(document.createTextNode(t('points',{p:''})+'['));
  p.forEach((x,i)=>{el.append(document.createTextNode(String(x)+(i<p.length-1?',':'')));if(i<p.length-1)el.append(document.createElement('wbr'));});
  el.append(document.createTextNode(']'));
}
function renderHand(){plot('handPlot',[2,4,6,8],1,9);$('handRead').textContent=t('hand'+probe);for(const x of ['4','55','6'])$('probe'+x).setAttribute('aria-pressed',String(probe===x));}
function renderTrace(){
  const f=frames[at],ops=C.presets[preset],coords=ops.flatMap(o=>o.slice(1)),lo=Math.min(...coords)-1,hi=Math.max(...coords)+1;
  $('progress').textContent=t('progress',{n:at,total:ops.length,k:f.after.length});
  $('operation').textContent=f.op?t('operation',{op:t(f.op[0]),l:f.op[1],r:f.op[2]}):t('initial');
  $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;
  $('sliceRead').hidden=!f.op;$('reason').hidden=!f.op;
  if(f.op){const [kind,l,r]=f.op;
    $('sliceRead').textContent=kind==='query'?t('queryRead',{i:f.i,j:f.j,l,r,result:t(String(f.result))}):t('updateRead',{i:f.i,j:f.j,l,r,removed:fmt(f.before.slice(f.i,f.j)),replacement:fmt(f.replacement)});
    $('reason').textContent=kind==='query'?'':t(kind+'Reason');
  }
  $('axis').textContent=t('axis',{l:lo,r:hi});
  renderPoints('beforePoints',f.before);renderPoints('afterPoints',f.after);
  plot('beforePlot',f.before,lo,hi);plot('afterPlot',f.after,lo,hi);
  $('noHistory').hidden=f.history.length>0;
  $('history').replaceChildren(...f.history.map(h=>{const li=document.createElement('li');li.textContent=t('historyRow',{op:t(h.op[0]),l:h.op[1],r:h.op[2],ranges:rangeText(h.after),result:h.result===null?'':' · '+t(String(h.result))});return li;}));
}
function renderPrediction(){
  $('reveal').disabled=selected===null;
  $('feedback').textContent=revealed?t(selected===2?'correct':'incorrect')+' '+t('answer'):t('await');
  $('feedback').classList.toggle('correct',revealed&&selected===2);
}
function render(){renderHand();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
for(const x of ['4','55','6'])$('probe'+x).onclick=()=>{probe=x;renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('tracePrev').onclick=()=>{if(at>0)at--;renderTrace();};$('traceNext').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};
$('traceReset').onclick=()=>{at=0;renderTrace();};$('traceLast').onclick=()=>{at=frames.length-1;renderTrace();};
for(const radio of document.querySelectorAll('[name="prediction"]'))radio.onchange=()=>{selected=Number(radio.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};
$('quizReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(x=>x.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{
 copyState='copying';$('copyStatus').textContent=t(copyState);
 try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}
 catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}
 $('copyStatus').textContent=t(copyState);
};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav'),sections=[...document.querySelectorAll('.step')];let current=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
