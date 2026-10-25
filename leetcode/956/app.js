'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let frames=Billboard.trace(Billboard.presets[0]),index=0,gap=0,choice=null,revealed=false,copyState='';
$('pythonSource').textContent=window.PYTHON_SOURCE;
$('manualSource').value=window.PYTHON_SOURCE;
function renderBranch(){const x=Number($('rodX').value);$('branch').textContent=t('branch',{x,a:1+x,d:Math.abs(2-x),h:1+Math.min(2,x)});}
function renderTrace(){
 const rods=Billboard.presets[Number($('preset').value)],f=frames[index],old=index?frames[index-1].states:null;
 if(!(gap in f.states))gap=0;
 $('progress').textContent=t('progress',{k:index,n:rods.length,detail:index?t('completed',{x:f.x}):t('initial')});
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===rods.length;$('end').disabled=index===rods.length;
 for(const [id,map] of [['oldMap',old],['newMap',f.states]]){
  $(id).replaceChildren();
  if(!map){$(id).textContent=t('noOld');continue;}
  Object.entries(map).forEach(([d,s])=>{const el=document.createElement('span');el.className='state'+(Number(d)===gap?' selected':'');el.textContent=`${d} → ${s.h}`;$(id).append(el);});
 }
 const select=$('gap');select.replaceChildren();Object.keys(f.states).forEach(d=>{const option=document.createElement('option');option.value=d;option.textContent=d;select.append(option);});select.value=gap;
 const s=f.states[gap];$('compare').textContent=t('compare',{d:gap,old:old&&old[gap]?old[gap].h:t('unreachable'),h:s.h});
 const format=indices=>indices.length?indices.map(i=>`#${i}:${rods[i]}`).join(' + '):t('empty');
 $('shortSupport').textContent=t('shortSupport',{rods:format(s.a),h:s.h});$('tallSupport').textContent=t('tallSupport',{rods:format(s.b),h:s.h+gap});
 $('shortBar').style.width=(100*s.h/rods.reduce((a,b)=>a+b,0))+'%';$('tallBar').style.width=(100*(s.h+gap)/rods.reduce((a,b)=>a+b,0))+'%';
 $('unused').textContent=t('unused',{indices:Array.from({length:index},(_,i)=>i).filter(i=>!s.a.includes(i)&&!s.b.includes(i)).map(i=>'#'+i).join(', ')||t('empty')});
 $('candidates').replaceChildren();const candidates=f.incoming.filter(c=>c.d===gap);
 if(!candidates.length){const li=document.createElement('li');li.textContent=t('noCandidates');$('candidates').append(li);}
 candidates.forEach(c=>{const li=document.createElement('li');li.textContent=t('candidate',{d:c.from,h:old[c.from].h,kind:t(c.kind),v:c.h,keep:t(c.h===s.h?'keep':'lose')});$('candidates').append(li);});
 $('history').replaceChildren();frames.slice(0,index+1).forEach((v,k)=>{const el=document.createElement('span');el.className='ledger-item'+(k===index?' current':'');el.textContent=t('historyItem',{k,h:v.states[0].h});$('history').append(el);});
 $('result').textContent=t(index===rods.length?'answer':'partial',{h:f.states[0].h});
}
function renderQuiz(){
 $('reveal').disabled=choice===null;
 $('feedback').textContent=!revealed?t(choice===null?'pending':'chosen'):t(choice==='1'?'correct':'incorrect')+' '+t('explanation');
}
$('handReveal').onclick=()=>{const hide=!$('hand').hidden;$('hand').hidden=hide;$('handReveal').setAttribute('aria-expanded',String(!hide));};
$('rodX').onchange=renderBranch;
$('preset').onchange=()=>{frames=Billboard.trace(Billboard.presets[Number($('preset').value)]);index=0;gap=0;renderTrace();};
$('gap').onchange=()=>{gap=Number($('gap').value);renderTrace();};
$('prev').onclick=()=>{index=Math.max(0,index-1);renderTrace();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);renderTrace();};
$('reset').onclick=()=>{index=0;gap=0;renderTrace();};$('end').onclick=()=>{index=frames.length-1;renderTrace();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=el.value;revealed=false;renderQuiz();});$('reveal').onclick=()=>{revealed=true;renderQuiz();};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(()=>{renderBranch();renderTrace();renderQuiz();$('copyStatus').textContent=copyState?t(copyState):'';});locale.init();
const nav=[...document.querySelectorAll('.step-nav a')];
let scrollPending=false;
function markStep(){
 const boundary=document.querySelector('.step-nav').getBoundingClientRect().bottom+32;
 let current='step0';
 document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=boundary)current=el.id;});
 nav.forEach(a=>a.classList.toggle('active',a.hash==='#'+current));
 scrollPending=false;
}
addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(markStep);}}, {passive:true});
addEventListener('resize',markStep);
markStep();
