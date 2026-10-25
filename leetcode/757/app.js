'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=IntersectionCore;
let hand=new Set(),preset=0,at=0,model=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
const setText=a=>a.length?'{'+a.join(', ')+'}':t('empty');
for(let x=1;x<=5;x++){const b=document.createElement('button');b.type='button';b.className='btn';b.dataset.step='0';b.textContent=x;b.onclick=()=>{if(hand.has(x))hand.delete(x);else hand.add(x);renderHand();};$('handPoints').append(b);}
function renderHand(){
 const a=[...hand].sort((a,b)=>a-b);
 [...$('handPoints').children].forEach((b,i)=>b.setAttribute('aria-pressed',String(hand.has(i+1))));
 $('handRead').textContent=t('handRead',{s:setText(a),n:a.length});
 $('handCoverage').replaceChildren(...[[1,3],[3,5]].map(iv=>{const hits=a.filter(x=>x>=iv[0]&&x<=iv[1]),p=document.createElement('p');p.textContent=t('coverage',{interval:JSON.stringify(iv),s:setText(hits),n:hits.length,state:t(hits.length>=2?'yes':'no')});return p;}));
}
function renderTrace(){
 const {frames,ordered}=model,f=frames[at];
 $('progress').textContent=t('progress',{k:at,n:ordered.length,c:f.chosen.length});
 $('operation').textContent=at?t('operation',{iv:JSON.stringify(f.interval),before:setText(f.before),hits:f.before.filter(x=>x>=f.interval[0]&&x<=f.interval[1]).length,added:setText(f.added),p:f.p,q:f.q}):t('initial');
 $('chosen').replaceChildren(...(f.chosen.length?f.chosen.map(x=>{const el=document.createElement('span');el.className='point'+(f.added.includes(x)?' new':'');el.textContent=(f.added.includes(x)?'+ ':'')+x;return el;}):[document.createTextNode(t('empty'))]));
 $('ledger').replaceChildren(...ordered.map((iv,i)=>{const row=document.createElement('tr'),done=i<at,g=frames[i+1];if(i===at-1)row.className='current';for(const value of [JSON.stringify(iv),...(done?[setText(g.before),setText(g.added),setText(g.chosen)]:[t('pending'),'—','—'])]){const td=document.createElement('td');td.textContent=value;row.append(td);}return row;}));
 $('result').textContent=at===ordered.length?t('result',{n:f.chosen.length}):t('notFinal');
 $('prev').disabled=at===0;$('next').disabled=at===ordered.length;$('end').disabled=at===ordered.length;
}
function renderQuiz(){
 $('reveal').disabled=selected===null;
 $('feedback').textContent=revealed?t(selected===1?'correct':'incorrect')+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&selected===1);
}
function render(){renderHand();renderTrace();renderQuiz();$('copyStatus').textContent=copyState?t(copyState):'';}
$('handReset').onclick=()=>{hand.clear();renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;model=C.trace(C.presets[preset]);renderTrace();};
$('prev').onclick=()=>{at=Math.max(0,at-1);renderTrace();};$('next').onclick=()=>{at=Math.min(model.ordered.length,at+1);renderTrace();};$('reset').onclick=()=>{at=0;renderTrace();};$('end').onclick=()=>{at=model.ordered.length;renderTrace();};
for(const radio of document.querySelectorAll('[name="prediction"]'))radio.onchange=()=>{selected=Number(radio.value);revealed=false;renderQuiz();};
$('reveal').onclick=()=>{revealed=true;renderQuiz();};$('quizReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(x=>x.checked=false);renderQuiz();};
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
