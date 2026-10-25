'use strict';
const locale=LeetCodeLocale(window.COPY), t=locale.t;
const $=id=>document.getElementById(id);
let preset=0,frames=Paths980.trace(Paths980.presets[0]),index=0,choice=null,revealed=false;
const coord=(v,cols)=>`(${Math.floor(v/cols)},${v%cols})`;
function board(el,input,path=[]){
 const cols=input[0].length;el.style.setProperty('--cols',cols);el.setAttribute('role','img');el.setAttribute('aria-label',t('boardLabel')+': '+JSON.stringify(input)+'; '+t('read',{path:path.map(v=>coord(v,cols)).join(' → ')||t('empty'),r:input.flat().filter(x=>x!==-1).length-path.length,n:'—'}));
 el.replaceChildren();input.flat().forEach((x,v)=>{
  const k=path.indexOf(v),cell=document.createElement('div');cell.className='cell'+(x===-1?' wall':'')+(k>=0?' used':'')+(k>=0&&k===path.length-1?' current':'');
  const a=document.createElement('small'),b=document.createElement('b'),c=document.createElement('span');a.textContent=coord(v,cols);b.textContent=({1:'S / 1',2:'E / 2',0:'· / 0','-1':'× / −1'})[x];c.textContent=k>=0?'#'+(k+1):'—';cell.append(a,b,c);el.append(cell);
 });
}
function eventText(f){return t(f.kind,{at:f.at===null?'':coord(f.at,Paths980.presets[preset][0].length)});}
function render(){
 const input=Paths980.presets[preset],f=frames[index],cols=input[0].length;
 board($('handBoard'),Paths980.presets[0]);board($('quizBoard'),[[1,0,2],[0,-1,0]]);board($('board'),input,f.path);
 $('langToggle').setAttribute('aria-label',t('langLabel'));document.querySelector('nav').setAttribute('aria-label',t('navLabel'));
 $('progress').textContent=t('progress',{i:index,n:frames.length-1,event:eventText(f)});
 $('readout').textContent=t('read',{path:f.path.length?f.path.map(v=>coord(v,cols)).join(' → '):t('empty'),r:f.remaining,n:f.found});
 $('prev').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;$('reset').disabled=index===0;
 $('routes').replaceChildren();for(const route of f.routes){const li=document.createElement('li');li.textContent=route.map(v=>coord(v,cols)).join(' → ');$('routes').append(li);}if(!f.routes.length){const li=document.createElement('li');li.textContent=t('none');$('routes').append(li);}
 $('ledger').replaceChildren();const first=Math.max(0,index-7);$('ledger').start=first+1;for(let i=first;i<=index;i++){const li=document.createElement('li');li.textContent=t('progress',{i,n:frames.length-1,event:eventText(frames[i])});if(i===index)li.className='ledger-current';$('ledger').append(li);}
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t('feedback',{verdict:t(choice==='1'?'correct':'incorrect')});
 if($('copyStatus').dataset.state)$('copyStatus').textContent=t($('copyStatus').dataset.state);
}
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('end').onclick=()=>{index=frames.length-1;render();};$('reset').onclick=()=>{index=0;render();};
$('preset').onchange=()=>{preset=Number($('preset').value);frames=Paths980.trace(Paths980.presets[preset]);index=0;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=el.value;revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null){revealed=true;render();}};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);$('manualCopy').hidden=true;$('copyStatus').dataset.state='copied';}catch(_){$('manualCopy').hidden=false;$('copyStatus').dataset.state='fallback';$('copyText').focus();$('copyText').select();}render();};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('.step').forEach(s=>observer.observe(s));
