'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,choice=null,revealed=false,copyState='';
let model=MazeCore.trace(MazeCore.presets[0]);
const wrap=document.createElement('div');wrap.className='board-wrap';wrap.tabIndex=0;wrap.setAttribute('role','region');$('board').before(wrap);wrap.append($('board'));
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('navigation'));wrap.setAttribute('aria-label',t('crop'));
 const p=MazeCore.presets[preset],f=model.frames[index],fmt=p=>'('+p.join(',')+')',list=a=>a.length?a.map(fmt).join(' '):t('empty');
 $('presetDescription').textContent=t('preset'+preset);
 $('input').textContent=t('input',{walls:list(p.walls),s:fmt(p.s),target:fmt(p.t)});
 $('board').replaceChildren();
 for(let y=p.origin[1]+7;y>=p.origin[1];y--)for(let x=p.origin[0];x<p.origin[0]+8;x++){
  const k=[x,y].join(','),seen=f.seen.includes(k),current=f.current&&f.current.join(',')===k,wall=p.walls.some(a=>a.join(',')===k),pending=f.queue.some(a=>a.join(',')===k);
  const e=document.createElement('div');e.className='cell'+(seen?' visited':'')+(wall?' wall':'')+(current?' current':'');
  const coord=document.createElement('small');const cx=document.createElement('span'),cy=document.createElement('span');cx.textContent=x+',';cy.textContent=String(y);coord.append(cx,cy);const mark=document.createElement('b');
  let flags=[p.s.join(',')===k?'S':'',p.t.join(',')===k?'T':'',wall?'#':seen?'v':'·',pending?'Q':''].filter(Boolean).join(' ');mark.textContent=current?'['+flags+']':flags;e.append(coord,mark);$('board').append(e);
 }
 $('state').textContent=t('state',{phase:f.phase+1,limit:f.limit,n:f.seen.length,q:f.queue.length});
 $('seen').textContent=t('set',{cells:f.seen.map(k=>'('+k+')').join(' ')});$('pending').textContent=t('queue',{cells:list(f.queue)});
 $('event').textContent=t(f.kind,{cell:f.current?fmt(f.current):'',added:list(f.added),n:f.seen.length,limit:f.limit});
 $('progress').textContent=t('progress',{index,total:model.frames.length-1,status:f.result===null?t('ongoing'):t('result',{result:String(f.result)})});
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===model.frames.length-1;$('end').disabled=index===model.frames.length-1;
 $('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice===1?'correct':'incorrect')+' '+t('answer'):'';$('reveal').disabled=choice===null;
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').onchange=()=>{preset=Number($('preset').value);model=MazeCore.trace(MazeCore.presets[preset]);index=0;render();};
$('prev').onclick=()=>{if(index>0)index--;render();};$('next').onclick=()=>{if(index<model.frames.length-1)index++;render();};$('end').onclick=()=>{index=model.frames.length-1;render();};$('reset').onclick=()=>{index=0;render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}render();};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];function updateNav(){let active=sections[0];const edge=document.querySelector('nav').getBoundingClientRect().bottom+32;for(const s of sections)if(s.getBoundingClientRect().top<=edge)active=s;document.querySelectorAll('.step-nav a').forEach(a=>{const yes=a.hash==='#'+active.id;a.classList.toggle('active',yes);if(yes)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
