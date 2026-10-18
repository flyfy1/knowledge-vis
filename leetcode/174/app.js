'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let grid=DungeonLesson.presets[0],frames=DungeonLesson.trace(grid),index=0,prediction=null,revealed=false,copyState='';
const number=v=>v===Infinity?'∞':v;
function renderHand(){
 const h=Number($('health').value),values=[h];let hp=h,dead=false;
 for(const v of ($('path').value==='right'?[-2,-3,10]:[-2,-5,10])){if(dead){values.push('†');continue;}hp+=v;values.push(hp);if(hp<=0)dead=true;}
 $('healthValue').value=h;$('handResult').textContent=t('handResult',{values:values.join(' → '),status:t(dead?'dead':'alive')});
}
function render(){
 $('langToggle').setAttribute('aria-label',t('langLabel'));document.querySelector('nav').setAttribute('aria-label',t('navLabel'));
 $('gridWrap').setAttribute('aria-label',t('gridLabel'));
 const f=frames[index],e=f.event;
 $('position').max=frames.length-1;$('position').value=index;
 $('prev').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
 $('progress').textContent=t('progress',{i:index,total:frames.length-1});
 $('grid').innerHTML=`<caption>${t('gridLabel')}</caption><thead><tr><th scope="col">${t('corner')}</th>${grid[0].map((_,c)=>`<th scope="col">c=${c}</th>`).join('')}</tr></thead><tbody>${grid.map((row,r)=>`<tr><th scope="row">r=${r}</th>${row.map((v,c)=>{const current=e&&e.r===r&&e.c===c,pending=f.needs[r][c]===null;return `<td class="${current?'current':pending?'pending':'done'}"><span>v=${v}</span><b><small>N=</small>${pending?'?':f.needs[r][c]}</b><span>${current?'★ ':''}${t(current?'current':pending?'pending':'done')}</span></td>`;}).join('')}</tr>`).join('')}</tbody>`;
 $('event').textContent=e?t(e.r===grid.length-1&&e.c===grid[0].length-1?'exitEvent':'event',{...e,down:number(e.down),right:number(e.right)}):t('initial');
 $('final').hidden=index!==frames.length-1;if(!$('final').hidden)$('final').textContent=t('final',{need:f.needs[0][0]});
 $('reveal').disabled=prediction===null;$('feedback').hidden=!revealed;
 if(revealed)$('feedback').textContent=t(prediction==='2'?'correct':'incorrect')+' '+t('quizExplain');
 $('copyStatus').textContent=copyState?t(copyState):'';renderHand();
}
$('path').addEventListener('change',renderHand);$('health').addEventListener('input',renderHand);
$('preset').addEventListener('change',e=>{grid=DungeonLesson.presets[Number(e.target.value)];frames=DungeonLesson.trace(grid);index=0;render();});
$('prev').addEventListener('click',()=>{index=Math.max(0,index-1);render();});$('next').addEventListener('click',()=>{index=Math.min(frames.length-1,index+1);render();});$('reset').addEventListener('click',()=>{index=0;render();});$('end').addEventListener('click',()=>{index=frames.length-1;render();});$('position').addEventListener('input',e=>{index=Number(e.target.value);render();});
document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{prediction=el.value;revealed=false;render();}));$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallbackStatus';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();});
const links=[...document.querySelectorAll('.step-nav a')],sections=[...document.querySelectorAll('.step')];let queued=false;
function active(){queued=false;const edge=document.querySelector('nav').getBoundingClientRect().height+40;let current=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=edge)current=s;links.forEach(a=>{const on=a.hash==='#'+current.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
function queue(){if(!queued){queued=true;requestAnimationFrame(active);}}
window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);locale.onChange(render);locale.onChange(queue);locale.init();queue();
