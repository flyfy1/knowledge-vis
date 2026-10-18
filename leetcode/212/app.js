'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,frames=WordSearchLesson.trace(WordSearchLesson.presets[0]),prediction=null,revealed=false,copyState='';
function eventText(f){return t(f.kind,{...f,prefix:f.prefix||t('empty'),before:f.before||t('empty')});}
function render(){
 const f=frames[index],input=WordSearchLesson.presets[preset];
 $('langToggle').setAttribute('aria-label',t('langLabel'));document.querySelector('nav').setAttribute('aria-label',t('navLabel'));
 $('progress').textContent=t('progress',{i:index,total:frames.length-1});$('event').textContent=eventText(f);
 $('position').max=frames.length-1;$('position').value=index;
 $('prev').disabled=index===0;$('next').disabled=$('end').disabled=index===frames.length-1;
 $('words').textContent=t('input',{words:input.words.join(', ')});
 $('board').style.setProperty('--cols',input.board[0].length);
 $('board').replaceChildren(...input.board.flatMap((row,r)=>Array.from(row).map((ch,c)=>{
  const cell=document.createElement('div'),order=f.path.findIndex(([a,b])=>a===r&&b===c),target=f.target&&f.target[0]===r&&f.target[1]===c;
  cell.className='cell'+(order>=0?' used':'')+(target?' target':'');
  const letter=document.createElement('b');letter.textContent=ch;
  const coord=document.createElement('small');coord.textContent=`(${r},${c})`;
  const mark=document.createElement('small');mark.textContent=order>=0?`${order+1} ↦`:'·';
  cell.append(letter,coord,mark);return cell;
 })));
 $('path').textContent=t('path',{path:f.path.map(p=>'('+p.join(',')+')').join(' → ')||t('empty'),prefix:f.prefix||t('empty')});
 $('found').textContent=t('found',{count:f.found.length,words:f.found.join(', ')||'∅'});
 $('trie').replaceChildren(...f.nodes.map(n=>{
  const node=document.createElement('div');node.className='node'+(n.prefix===f.prefix?' active':'');
  const title=document.createElement('b');title.textContent=n.prefix;
  const children=document.createElement('span');children.textContent=t('nextLetters',{letters:n.next.join(', ')||'∅'});
  const status=document.createElement('span');status.textContent=t(!n.word?'notWord':n.pending?'pending':'emitted');
  node.append(title,children,status);return node;
 }));
 $('history').setAttribute('aria-label',t('historyLabel'));
 $('history').replaceChildren(...frames.slice(1,index+1).map(f=>{const li=document.createElement('li');li.textContent=eventText(f);return li;}));
 $('reveal').disabled=prediction===null;$('feedback').hidden=!revealed;
 if(revealed)$('feedback').textContent=t(prediction==='2'?'correct':'incorrect')+' '+t('quizExplain');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',e=>{preset=Number(e.target.value);index=0;frames=WordSearchLesson.trace(WordSearchLesson.presets[preset]);render();});
$('next').addEventListener('click',()=>{index=Math.min(index+1,frames.length-1);render();});
$('prev').addEventListener('click',()=>{index=Math.max(index-1,0);render();});
$('reset').addEventListener('click',()=>{index=0;render();});
$('end').addEventListener('click',()=>{index=frames.length-1;render();});
$('position').addEventListener('input',e=>{index=Number(e.target.value);render();});
document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{prediction=el.value;revealed=false;render();}));
$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallbackStatus';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();});
const links=[...document.querySelectorAll('.step-nav a')],sections=[...document.querySelectorAll('.step')];let queued=false;
function updateActive(){queued=false;let active=sections[0];const boundary=document.querySelector('nav').getBoundingClientRect().height+40;for(const s of sections)if(s.getBoundingClientRect().top<=boundary)active=s;links.forEach(a=>{const yes=a.hash==='#'+active.id;a.classList.toggle('active',yes);if(yes)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
function queueActive(){if(!queued){queued=true;requestAnimationFrame(updateActive);}}
window.addEventListener('scroll',queueActive,{passive:true});window.addEventListener('resize',queueActive);locale.onChange(render);locale.onChange(queueActive);locale.init();queueActive();
