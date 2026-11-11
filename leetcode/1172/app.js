'use strict';
const L=LeetCodeLocale(window.LEETCODE_COPY);const cap=2;const $=id=>document.getElementById(id);
function t(k,p){return L.t(k,p)}
const show=st=>st.length?st.map(s=>'['+s.join(',')+']').join(' '):'—';
// Same rules as the problem statement, written as a plain scan (used only for teaching displays).
function applyOp(st,op,v){if(op==='push'){let i=st.findIndex(s=>s.length<cap);if(i<0){st.push([]);i=st.length-1}st[i].push(v);return null}if(op==='popAtStack'){if(!st[v]||!st[v].length)return -1;return st[v].pop()}while(st.length&&st.at(-1).length===0)st.pop();if(!st.length)return -1;return st.at(-1).pop()}
function drawStacks(id,st){const el=$(id);el.replaceChildren(...st.map((s,i)=>{const d=document.createElement('div');d.className='stack'+(s.length<cap?' has-hole':'');d.setAttribute('aria-label',`stack ${i}`);s.forEach(v=>{const p=document.createElement('div');p.className='plate';p.textContent=v;d.appendChild(p)});const lab=document.createElement('small');lab.textContent=i;d.appendChild(lab);return d}))}

// Step 0: hand trace.
const handOps=[['push',1],['push',2],['push',3],['push',4],['push',5],['popAtStack',0],['push',20],['push',21],['popAtStack',0],['popAtStack',2],['pop'],['pop'],['pop'],['pop'],['pop']];
let hand=[],handStep=0,handLast='';
function handRender(){drawStacks('handStacks',hand);$('handOp').textContent=handStep===0?t('initial'):handStep>=handOps.length&&handLast==='done'?t('done'):handLast;$('handState').textContent=t('stacks',{s:show(hand)})}
function handNext(){if(handStep>=handOps.length){handLast='done';handRender();return}const [op,v]=handOps[handStep++];const out=applyOp(hand,op,v);handLast=op==='push'?t('push',{v}):t('opResult',{op:`${op}(${v??''})`,r:out});handRender()}
$('handNext').onclick=handNext;$('handReset').onclick=()=>{hand=[];handStep=0;handLast='';handRender()};

// Step 1: open holes yourself and compare a scan with the heap top.
let holes,nextVal,holeLast='';
function holeReset(){holes=[[1,2],[3,4],[5,6],[7]];nextVal=8;holeLast='';holeRender()}
function holeRender(){drawStacks('holeStacks',holes);$('push1').textContent=t('pushNext',{v:nextVal});$('holeOp').textContent=holeLast;
 const free=holes.map((s,i)=>s.length<cap?i:-1).filter(i=>i>=0);$('holeSet').textContent=t('holes',{h:'['+free.join(', ')+']'});
 const i=holes.findIndex(s=>s.length<cap);$('holeTarget').textContent=i<0?t('target1New',{i:holes.length,n:holes.length}):t('target1',{i,n:i+1})}
['hole0','hole1','hole2'].forEach((id,k)=>{$(id).onclick=()=>{const r=applyOp(holes,'popAtStack',k);holeLast=t('opResult',{op:`popAtStack(${k})`,r});holeRender()}});
$('push1').onclick=()=>{const v=nextVal++;applyOp(holes,'push',v);holeLast=t('push',{v});holeRender()};
$('pop1').onclick=()=>{const r=applyOp(holes,'pop');holeLast=t('opResult',{op:'pop()',r});holeRender()};
$('reset1').onclick=holeReset;

// Step 2: one "current stack" pointer versus the leftmost hole.
let hole=false,compared=false;
function wrongRender(){$('wrongState').textContent=compared?'[1,2] [3,4] [5]':hole?'[1] [3,4]':'[1,2] [3,4]';$('rightState').textContent=compared?'[1,5] [3,4]':hole?'[1] [3,4]':'[1,2] [3,4]';$('wrongInfo').textContent=compared?t('compareInfo'):hole?t('holeInfo'):''}
$('makeHole').onclick=()=>{hole=true;wrongRender()};
$('compare').onclick=()=>{if(!hole){$('wrongInfo').textContent=t('needHole');return}compared=true;wrongRender()};

// Step 3: predict, then reveal.
const qs=[{q:'q1',ans:'2',r:'r1',opts:['-1','2','5']},{q:'q2',ans:'5',r:'r2',opts:['-1','2','5']},{q:'q3',ans:'-1',r:'r3',opts:['-1','2','5']},{q:'q4',ans:'9',r:'r4',opts:['-1','8','9','10']}];let qi=0,chosen=null,revealed=false;
function question(){const x=qs[qi];$('question').textContent=t(x.q);const p=$('predictions');p.replaceChildren(...x.opts.map(v=>{const b=document.createElement('button');b.className='btn'+(chosen===v?' primary':'');b.textContent=v;b.setAttribute('aria-pressed',String(chosen===v));b.onclick=()=>{chosen=v;revealed=false;question()};return b}));$('reveal').disabled=chosen===null;$('feedback').textContent=revealed?(chosen===x.ans?t('correctPick'):t('wrongPick',{p:chosen}))+' '+t('feedback',{v:x.ans,r:t(x.r)}):''}
$('reveal').onclick=()=>{revealed=true;question()};$('change').onclick=()=>{qi=(qi+1)%qs.length;chosen=null;revealed=false;question()};

// Step 5: optimized model against the scan oracle.
const checkOps=[['p',1],['p',2],['p',3],['p',4],['a',0],['p',5],['o'],['o'],['o'],['o'],['o']];
function oracle(){let a=[[]],c=2;const out=[];function p(v){let i=a.findIndex(s=>s.length<c);if(i<0){a.push([]);i=a.length-1}a[i].push(v)}function pa(i){return a[i]?.length?a[i].pop():-1}function po(){while(a.length&&!a.at(-1).length)a.pop();return a.length?a.at(-1).pop():-1}checkOps.forEach(x=>{if(x[0]==='p')p(x[1]);else out.push(x[0]==='a'?pa(x[1]):po())});return out}
function optimizedTrace(){let a=[],free=[],out=[];const c=2;const add=i=>{if(i<a.length&&a[i].length<c&&!free.includes(i)){free.push(i);free.sort((x,y)=>x-y)}};const clean=()=>{while(free.length&&(free[0]>=a.length||a[free[0]].length>=c))free.shift()};const p=v=>{clean();let i=free.length?free.shift():a.push([])-1;a[i].push(v);add(i)};const pa=i=>{if(!a[i]?.length)return-1;const v=a[i].pop();add(i);return v};const po=()=>{while(a.length&&!a.at(-1).length)a.pop();if(!a.length)return-1;const i=a.length-1,v=a[i].pop();add(i);return v};checkOps.forEach(x=>{if(x[0]==='p')p(x[1]);else out.push(x[0]==='a'?pa(x[1]):po())});return out}
$('runCheck').onclick=async()=>{
  const expected=oracle(),actual=optimizedTrace();
  const ok=expected.length===actual.length&&expected.every((v,i)=>v===actual[i]);
  let sourceOk=$('source').textContent===window.PYTHON_SOURCE;
  try{sourceOk=sourceOk&&(await fetch('solution.py').then(r=>r.text()))===window.PYTHON_SOURCE}catch(e){sourceOk=false}
  $('checkResult').textContent=ok&&sourceOk?t('passed',{n:checkOps.length}):'Mismatch: expected '+expected.join(',')+'; got '+actual.join(',');
};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);$('copyStatus').textContent=t('copied')}catch(e){const fallback=$('copyFallback');fallback.value=window.PYTHON_SOURCE;fallback.hidden=false;fallback.focus();fallback.select();$('copyStatus').textContent=t('copyFail')}};
$('source').textContent=window.PYTHON_SOURCE;
L.onChange(()=>{handRender();holeRender();wrongRender();question()});
holes=[[1,2],[3,4],[5,6],[7]];nextVal=8;L.init();holeReset();
