'use strict';
const L=LeetCodeLocale(window.COPY),t=L.t,C=IslandCore,$=id=>document.getElementById(id);
let preset=0,index=0,frames=C.trace(C.presets[0]),flip=null,choice=null,revealed=false,copyState=null;
function board(id,grid,labels,current,interactive=false){
 const host=$(id);host.style.setProperty('--n',grid.length);host.tabIndex=0;host.setAttribute('role','group');host.setAttribute('aria-label',t('gridLabel'));host.replaceChildren();
 grid.forEach((row,r)=>row.forEach((v,c)=>{const e=document.createElement(interactive?'button':'div');e.className='tile'+(v?' land':'')+(current&&current[0]===r&&current[1]===c?' current':'');
 const value=labels?(v?(labels[r][c]||'?'):0):v;
 e.textContent=value;const small=document.createElement('small');small.textContent=`(${r},${c})`;e.append(small);
 if(interactive){e.type='button';e.disabled=!!C.presets[0][r][c];e.dataset.step='0';e.setAttribute('aria-label',t('cell',{r,c,v}));e.setAttribute('aria-pressed',String(!!current&&current[0]===r&&current[1]===c));e.onclick=()=>{flip=flip&&flip[0]===r&&flip[1]===c?null:[r,c];renderHand();$(id).children[r*grid.length+c].focus();};}host.append(e);
 }));
}
function renderHand(){const grid=C.presets[0].map(row=>row.slice());if(flip)grid[flip[0]][flip[1]]=1;board('handGrid',grid,null,flip,true);$('handRead').textContent=t('handRead',{cell:flip?`(${flip})`:t('none'),area:Math.max(0,...Object.values(C.trace(grid).at(-1).area))});}
function renderTrace(){const f=frames[index],grid=C.presets[preset];$('presetRead').textContent=t('preset'+preset);let event=t(f.kind==='start'?'start':f.kind==='done'?'done':f.kind==='label'?'labelEvent':'testEvent',f.event||{});
 $('frameRead').textContent=t('frame',{i:index,total:frames.length-1,event,best:f.best});
 board('traceGrid',grid,f.labels,f.kind==='test'?[f.event.r,f.event.c]:null);
 $('gridText').replaceChildren();grid.forEach((row,r)=>{const p=document.createElement('p');p.textContent=t('row',{r,values:row.map((v,c)=>v?(f.labels[r][c]||'?'):0).join(', ')});$('gridText').append(p);});
 $('areas').textContent=t('areas',{values:Object.entries(f.area).filter(([k])=>k!=='0').map(([k,v])=>`ID${k}=${v}`).join('; ')||t('empty')});
 $('ledger').replaceChildren();for(const e of f.history){const li=document.createElement('li');li.textContent=t('ledgerLine',{...e,raw:e.raw.join(','),ids:e.ids.join(','),sum:[1,...e.parts].join(' + ')});$('ledger').append(li);}
 $('emptyLedger').hidden=f.history.length>0;$('prev').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
}
function renderQuiz(){board('quizGrid',[[1,1,0],[1,0,1],[0,1,1]],null,[1,1]);$('reveal').disabled=choice===null;$('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('answer'):t('pending');$('feedback').classList.toggle('correct',revealed&&choice==='1');}
$('preset').onchange=e=>{preset=Number(e.target.value);frames=C.trace(C.presets[preset]);index=0;renderTrace();};
$('prev').onclick=()=>{if(index)index--;renderTrace();};$('next').onclick=()=>{if(index<frames.length-1)index++;renderTrace();};$('end').onclick=()=>{index=frames.length-1;renderTrace();};$('traceReset').onclick=()=>{index=0;renderTrace();};$('handReset').onclick=()=>{flip=null;renderHand();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=e.value;revealed=false;renderQuiz();});$('reveal').onclick=()=>{revealed=true;renderQuiz();};$('quizReset').onclick=()=>{choice=null;revealed=false;document.querySelectorAll('[name=prediction]').forEach(e=>e.checked=false);renderQuiz();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
L.onChange(()=>{renderHand();renderTrace();renderQuiz();if(copyState)$('copyStatus').textContent=t(copyState);});L.init();
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}),{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('.step').forEach(e=>observer.observe(e));
