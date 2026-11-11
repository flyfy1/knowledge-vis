'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let hand=0,preset=0,index=0,frames=LessonCore.trace(LessonCore.presets[0]),choice=null,revealed=false,copyState='';
const handFrames=LessonCore.trace(LessonCore.presets[0]);
function drawBoard(id,n,f){
 const board=$(id),nodes=[];board.style.setProperty('--n',n);
 const add=(text,cls)=>{const el=document.createElement('div');el.textContent=text;el.className=cls;nodes.push(el);return el;};
 add('','axis row-axis');for(let c=0;c<n;c++)add(c,'axis');
 for(let r=0;r<n;r++){
  add(r,'axis row-axis');for(let c=0;c<n;c++){
   const lamp=f.active.some(([x,y])=>x===r&&y===c),lit=f.active.some(([x,y])=>x===r||y===c||Math.abs(x-r)===Math.abs(y-c)),query=f.q&&f.q[0]===r&&f.q[1]===c;
   const el=add(lamp?'L':lit?'+':'·','cell'+(lit?' lit':'')+(lamp?' lamp':'')+(query?' query':''));
   if(query){const q=document.createElement('small');q.textContent='Q';el.append(q);}
  }
 }board.replaceChildren(...nodes);
}
function render(){
 const p=LessonCore.presets[preset],f=frames[index],last=f.history.at(-1);
 drawBoard('handBoard',4,handFrames[hand]);$('handText').textContent=t('hand'+hand);$('handPrev').disabled=hand===0;$('handNext').disabled=hand===4;
 drawBoard('board',p.n,f);$('input').textContent=t('input',{n:p.n,lamps:JSON.stringify(p.lamps),queries:JSON.stringify(p.queries)});
 $('event').textContent=f.phase==='initial'?t('initial'):t(f.phase,{r:f.q[0],c:f.q[1],counts:f.counts.join(', '),bit:last.bit,removed:f.removed.length?JSON.stringify(f.removed):t('none')});
 $('progress').textContent=t('progress',{i:index,total:frames.length-1,done:f.ans.length,q:p.queries.length,off:f.history.filter(h=>h.removed!==null).length,ans:JSON.stringify(f.ans)});
 $('presetDescription').textContent=t('sel'+preset);
 $('active').textContent=f.active.length?JSON.stringify(f.active):t('none');
 ['rows','cols','down','up'].forEach((name,i)=>{$(name).textContent=Object.keys(f.maps[i]).length?Object.entries(f.maps[i]).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k,v])=>`${k} → ${v}`).join('; '):t('emptyMap');});
 for(const [id,off] of [['prev',index===0],['reset',index===0],['next',index===frames.length-1],['end',index===frames.length-1]])$(id).disabled=off;
 const rows=f.history.map(h=>{const tr=document.createElement('tr');for(const text of [`${h.i} / (${h.q})`,`[${h.counts.join(', ')}]`,h.bit,h.removed===null?t('pending'):h.removed.length?JSON.stringify(h.removed):t('none')]){const td=document.createElement('td');td.textContent=text;tr.append(td);}return tr;});
 if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent=t('noHistory');tr.append(td);rows.push(tr);}$('ledger').replaceChildren(...rows);
 $('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice===2?'correct':'wrong'+choice)+' '+t('answer'):'';$('reveal').disabled=choice===null;
 $('copyStatus').textContent=copyState?t(copyState):'';$('langToggle').setAttribute('aria-label',t('language'));
 ['handWrap','boardWrap'].forEach(id=>$(id).setAttribute('aria-label',t('boardLabel')));
}
$('handPrev').onclick=()=>{if(hand>0)hand--;render();};$('handNext').onclick=()=>{if(hand<4)hand++;render();};
$('preset').onchange=()=>{preset=Number($('preset').value);frames=LessonCore.trace(LessonCore.presets[preset]);index=0;render();};
$('prev').onclick=()=>{if(index>0)index--;render();};$('next').onclick=()=>{if(index<frames.length-1)index++;render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=Number(el.value);revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null){revealed=true;render();}};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}render();};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){const threshold=document.querySelector('.step-nav').getBoundingClientRect().bottom+32;let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=threshold)active=s;document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active.id));}
let navScheduled=false;function scheduleNav(){if(navScheduled)return;navScheduled=true;requestAnimationFrame(()=>{navScheduled=false;updateNav();});}window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);locale.onChange(scheduleNav);updateNav();
