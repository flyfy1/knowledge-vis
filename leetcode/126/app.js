'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,frames=LadderCore.trace(LadderCore.presets[0]),choice=null,revealed=false,copyState='';
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function eventText(f){return t(f.kind,{w:f.word,edges:f.added.map(e=>e.join(' → ')).join('; ')||t('none'),count:(f.answer||[]).length});}
function render(){
 const p=LadderCore.presets[preset],f=frames[index];
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
 $('next').textContent=t(index===frames.length-1?'complete':frames[index+1].kind==='done'?'reconstruct':frames[index+1].kind==='absent'?'checkEnd':'next');
 $('position').max=frames.length-1;$('position').value=index;$('progress').textContent=t('progress',{i:index,n:frames.length-1,b:p.begin,e:p.end});$('dictionary').textContent=t('dictionary',{words:p.words.join(', ')});
 $('message').textContent=eventText(f);$('queue').textContent=t('queue',{words:f.queue.join(' → ')||t('empty')});
 const layers=[];
 for(let d=0;d<=Math.max(...Object.values(f.dist));d++){
  const layer=node('div',undefined,'layer'),words=node('div',undefined,'words');layer.append(node('h3',t('layer',{d})));
  Object.keys(f.dist).filter(w=>f.dist[w]===d).forEach(w=>{const card=node('div',undefined,'word'+(w===f.word?' current':''));card.append(node('b',w),node('p',w===p.begin?t('start'):t('parents',{words:(f.parents[w]||[]).join(', ')})));words.append(card);});layer.append(words);layers.push(layer);
 }
 $('layers').replaceChildren(...layers);$('history').replaceChildren(...frames.slice(0,index+1).filter(f=>f.kind==='expand').map(f=>node('li',eventText(f))));
 $('answers').replaceChildren(...(f.answer?f.answer.length?f.answer.map(a=>node('div',a.join(' → '),'route')):[node('p','[]')]:f.kind==='absent'?[node('p','[]')]:[node('p',t('pending'),'hint')]));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('explanation');
 $('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('preset').onchange=e=>{preset=Number(e.target.value);index=0;frames=LadderCore.trace(LadderCore.presets[preset]);render();};
$('prev').onclick=()=>{if(index)index--;render();};$('next').onclick=()=>{if(index<frames.length-1)index++;render();};$('end').onclick=()=>{index=frames.length-1;render();};$('reset').onclick=()=>{index=0;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});const strip=document.querySelector('.step-nav-inner');document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on){a.setAttribute('aria-current','step');const r=a.getBoundingClientRect(),s=strip.getBoundingClientRect();if(r.left<s.left)strip.scrollLeft-=s.left-r.left+12;else if(r.right>s.right)strip.scrollLeft+=r.right-s.right+12;}else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
