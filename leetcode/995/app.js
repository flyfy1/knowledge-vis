'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let hand=0,preset=0,index=0,frames=LessonCore.trace(LessonCore.presets[0].a,2),choice=null,revealed=false,copyState='';
function bits(container,values,original,i,fixedUntil){
 const cards=values.map((v,j)=>{
  const card=document.createElement('div');card.className='bit'+(j<fixedUntil?' fixed':'')+(j===i?' current':'');
  function part(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;card.append(e);}
  part('small',t('position',{i:j}));part('b',v);part('small',t('original',{v:original[j]}));
  part('small',t(j<fixedUntil?'fixed':'pending'),'state');if(j===i)part('small',t('current'),'current-label');return card;
 });container.replaceChildren(...cards);
}
function render(){
 const input=LessonCore.presets[preset],f=frames[index],r=f.rows.at(-1);
 $('presetDescription').textContent=t('pre'+preset);
 bits($('handBits'),[[0,1,0],[1,0,0],[1,1,1]][hand],[0,1,0],-1,hand===2?3:hand);
 $('handText').textContent=t('hand'+hand);$('handPrev').disabled=hand===0;$('handNext').disabled=hand===2;
 const fail=r&&r.action==='fail';bits($('bits'),f.values,input.a,f.i,fail?f.i:f.i+1);
 for(const [id,disabled] of [['prev',index===0],['reset',index===0],['next',index===frames.length-1],['end',index===frames.length-1]])$(id).disabled=disabled;
 $('event').textContent=!r?t('init',{a:JSON.stringify(input.a),k:input.k}):t('event',{...r,original:input.a[r.i],decision:t(r.action,{i:r.i,k:input.k,n:input.a.length,last:r.i+input.k-1,end:r.end})});
 $('progress').textContent=t('progress',{done:f.rows.length,n:input.a.length,starts:f.starts.length?f.starts.join(', '):t('noStarts'),count:f.starts.length,result:f.result===null?t('notFinal'):t('result',{value:f.result})});
 const rows=f.rows.map(row=>{const tr=document.createElement('tr');if(row.i===f.i)tr.className='changed';for(const text of [row.i,`${row.old} → ${row.before} → ${row.after}`,`${input.a[row.i]} ^ ${row.before} = ${row.bit}`,t(row.action+'Short',{end:row.end})]){const td=document.createElement('td');td.textContent=text;tr.append(td);}return tr;});
 if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent=t('empty');tr.append(td);rows.push(tr);}$('ledger').replaceChildren(...rows);
 $('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice===2?'correct':'wrong'+choice)+' '+t('answer'):'';$('reveal').disabled=choice===null;
 $('copyStatus').textContent=copyState?t(copyState):'';$('langToggle').setAttribute('aria-label',t('language'));
}
$('handPrev').onclick=()=>{if(hand>0)hand--;render();};$('handNext').onclick=()=>{if(hand<2)hand++;render();};
$('preset').onchange=()=>{preset=Number($('preset').value);const p=LessonCore.presets[preset];frames=LessonCore.trace(p.a,p.k);index=0;render();};
$('prev').onclick=()=>{if(index>0)index--;render();};$('next').onclick=()=>{if(index<frames.length-1)index++;render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=Number(el.value);revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null){revealed=true;render();}};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}render();};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){const zoom=Number(getComputedStyle(document.body).zoom)||1;const threshold=document.querySelector('.step-nav').getBoundingClientRect().bottom+32*zoom;let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=threshold)active=s;document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active.id));}
let navScheduled=false;function scheduleNav(){if(navScheduled)return;navScheduled=true;requestAnimationFrame(()=>{navScheduled=false;updateNav();});}
window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);locale.onChange(scheduleNav);updateNav();
