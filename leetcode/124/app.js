'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let values=PathCore.presets[0].slice(),frames=PathCore.trace(values),step=0,choice=null,revealed=false,copyState='';
const idOf=i=>String.fromCharCode(65+i);
function element(tag,text){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;}
function svgElement(tag,attrs,text){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(text!==undefined)el.textContent=text;return el;}
function tree(f){
 const svg=$('tree');svg.replaceChildren();svg.setAttribute('aria-label',t('treeLabel')+'. '+values.map((v,i)=>v===null?'':t('treeNode',{id:idOf(i),value:v,left:values[i*2+1]==null?t('absent'):idOf(i*2+1),right:values[i*2+2]==null?t('absent'):idOf(i*2+2),gain:i in f.gains?f.gains[i]:t('pending')})).join(' '));
 const pos=i=>{const depth=Math.floor(Math.log2(i+1)),offset=i-(2**depth-1);return {x:(offset+.5)*280/2**depth,y:40+depth*90};};
 values.forEach((v,i)=>{if(v===null)return;const p=pos(i);if(i){const parent=pos(Math.floor((i-1)/2));svg.append(svgElement('line',{x1:parent.x,y1:parent.y+47,x2:p.x,y2:p.y-28,class:'tree-edge'}));}});
 values.forEach((v,i)=>{if(v===null)return;const p=pos(i),done=i in f.gains,current=i===f.current;svg.append(svgElement('rect',{x:p.x-30,y:p.y-29,width:60,height:76,rx:8,class:'tree-node'+(done?' done':'')+(current?' current':'')}));svg.append(svgElement('text',{x:p.x,y:p.y-10,'text-anchor':'middle'},idOf(i)+(current?' ★':'')));svg.append(svgElement('text',{x:p.x,y:p.y+12,'text-anchor':'middle',class:'value'},v));svg.append(svgElement('text',{x:p.x,y:p.y+34,'text-anchor':'middle',class:'status'},done?'g='+f.gains[i]:t('pending')));});
}
function render(){
 const f=frames[step],n=frames.length-1;
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));$('ledgerWrap').setAttribute('aria-label',t('tableLabel'));
 $('prev').disabled=step===0;$('reset').disabled=step===0;$('next').disabled=step===n;$('end').disabled=step===n;$('position').max=n;$('position').value=step;$('rootReadout').textContent=values[0];$('progress').textContent=t('progress',{k:step,n,best:f.best===null?t('none'):f.best});tree(f);
 const row=f.rows.at(-1);$('calculation').textContent=row?t('calc',{id:idOf(row.i),v:row.value,rawL:row.rawL,rawR:row.rawR,L:row.left,R:row.right,through:row.through,gain:row.gain,old:step===1?'−∞':frames[step-1].best,best:row.best}):t('emptyTrace');
 $('ledger').replaceChildren(...f.rows.map((r,j)=>{const tr=element('tr');if(j===f.rows.length-1)tr.className='active-row';[idOf(r.i),r.value,r.left,r.right,r.through,r.gain,r.best].forEach((value,i)=>{const cell=element(i?'td':'th',value);if(!i)cell.scope='row';tr.append(cell);});return tr;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('answer');$('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
function restart(){frames=PathCore.trace(values);step=0;render();}
$('preset').onchange=e=>{values=PathCore.presets[Number(e.target.value)].slice();$('rootValue').value=values[0];restart();};$('rootValue').oninput=e=>{values[0]=Number(e.target.value);restart();};
$('prev').onclick=()=>{step=Math.max(0,step-1);render();};$('next').onclick=()=>{step=Math.min(frames.length-1,step+1);render();};$('reset').onclick=()=>{step=0;render();};$('end').onclick=()=>{step=frames.length-1;render();};$('position').oninput=e=>{step=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
