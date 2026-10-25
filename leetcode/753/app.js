'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=SafeCore;
let typed=0,preset=0,at=0,frames=C.trace(...C.presets[0]),selected=null,revealed=false,copyState='';
function tile(s,hot=false){const el=document.createElement('span');el.className='tile'+(hot?' hot':'');el.textContent=s;return el;}
function renderHand(){
 const s='00110',windows=[];for(let i=2;i<=typed;i++)windows.push(s.slice(i-2,i));
 $('handStrip').replaceChildren(...[...s].map((d,i)=>tile(i<typed?d:'·',typed>=2&&i>=typed-2&&i<typed)));
 $('handLedger').replaceChildren(...(windows.length?windows.map((w,i)=>tile(w,i===windows.length-1)):[document.createTextNode(t('empty'))]));
 $('handRead').textContent=t('handRead',{typed:s.slice(0,typed)||t('empty'),i:typed,w:typed<2?t('noWindow'):s.slice(typed-2,typed),c:new Set(windows).size});
 $('handPrev').disabled=!typed;$('handNext').disabled=typed===5;
}
function opText(op){
 const [n,k]=C.presets[preset],word=v=>C.word(v,n-1,k);
 if(op.kind==='initial')return t('initial');
 if(op.kind==='push')return t('push',{edge:C.word(op.edge,n,k),v:word(op.v),d:op.digit,to:word(op.target),next:op.digit+1});
 return op.digit===null?t('popStart'):t('pop',{v:word(op.v),d:op.digit});
}
function renderTrace(){
 const [n,k]=C.presets[preset],f=frames[at],E=k**n,V=k**(n-1),word=v=>C.word(v,n-1,k);
 $('progress').textContent=t('progress',{i:at,total:frames.length-1,used:f.used.length,edges:E,f:f.finished.length});
 $('operation').textContent=opText(f.op);$('prev').disabled=at===0;$('next').disabled=at===frames.length-1;$('end').disabled=at===frames.length-1;
 $('stack').replaceChildren(...(f.stack.length?f.stack.map(([v,d],i)=>tile(word(v)+' / '+(d===null?t('startDigit'):d),i===f.stack.length-1)):[document.createTextNode(t('empty'))]));
 $('finished').replaceChildren(...(f.finished.length?f.finished.map((d,i)=>tile(d,i===f.finished.length-1)):[document.createTextNode(t('empty'))]));
 const s='0'.repeat(n-1)+f.finished.slice().reverse().join('');
 $('result').textContent=f.stack.length?t('pending'):t('result',{s,l:s.length,e:E,n});
 $('edges').replaceChildren(...Array.from({length:E},(_,e)=>{const row=document.createElement('tr'),used=f.used.includes(e);for(const value of [C.word(e,n,k),word(Math.floor(e/k)),word(e%V),t(used?'used':'unused')]){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}if(used)row.className='used';return row;}));
 $('history').replaceChildren(...frames.slice(1,at+1).map(f=>{const li=document.createElement('li');li.textContent=opText(f.op);return li;}));
}
function renderPrediction(){
 $('reveal').disabled=selected===null;
 $('feedback').textContent=revealed?t(selected===2?'correct':'incorrect')+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&selected===2);
}
function render(){renderHand();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('handNext').onclick=()=>{typed=Math.min(5,typed+1);renderHand();};$('handPrev').onclick=()=>{typed=Math.max(0,typed-1);renderHand();};$('handReset').onclick=()=>{typed=0;renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(...C.presets[preset]);renderTrace();};
$('prev').onclick=()=>{at=Math.max(0,at-1);renderTrace();};$('next').onclick=()=>{at=Math.min(frames.length-1,at+1);renderTrace();};$('reset').onclick=()=>{at=0;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};
for(const radio of document.querySelectorAll('[name="prediction"]'))radio.onchange=()=>{selected=Number(radio.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('quizReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(x=>x.checked=false);renderPrediction();};
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
