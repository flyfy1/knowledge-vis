'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let selected=0,day=0,frames=StockCore.trace(StockCore.presets[0]),choice=null,revealed=false,copyState='';
const fmt=x=>x===-Infinity?'−∞':String(x);
function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));$('ledgerWrap').setAttribute('aria-label',t('scrollLedger'));
 const {prices,k}=StockCore.presets[selected],f=frames[day];
 const names=Array.from({length:k},(_,i)=>[`h[${i+1}]`,`c[${i+1}]`]).flat();
 $('prev').disabled=day===0;$('next').disabled=day===prices.length;$('end').disabled=day===prices.length;$('reset').disabled=day===0;
 $('position').max=prices.length;$('position').value=day;$('progress').textContent=t('progress',{day,n:prices.length,k,profit:f.values.at(-1)});$('dayNote').textContent=day?t('dayNote',{day,p:f.price}):t('noDay');
 $('prices').replaceChildren(...prices.map((p,i)=>{const e=node('div',undefined,'price'+(i===day-1?' current':''));e.append(node('small',t('day')+' '+(i+1)),node('b',p),node('div',t(i===day-1?'current':i<day?'done':'future'),'marker'));return e;}));
 const grid=node('div',undefined,'transition-grid');names.forEach((name,i)=>{const card=node('div',undefined,'state-card');card.append(node('h3',name));if(day){card.append(node('p',t('old')+': '+fmt(f.old[i])),node('p',t('candidate')+': '+(i%2===0?fmt(f.oldCash[Math.floor(i/2)])+' − '+f.price:fmt(f.oldHold[Math.floor(i/2)+1])+' + '+f.price)+' = '+fmt(f.candidates[i])),node('p',t('new')+': '+fmt(f.values[i]),'result'),node('p',t('decision')+': '+t(f.candidates[i]>f.old[i]?'improve':f.candidates[i]===f.old[i]?'tie':'keep'),'decision'));}else card.append(node('p',fmt(f.values[i]),'result'));grid.append(card);});$('transition').replaceChildren(grid);
 const head=node('tr');[t('day'),t('price'),...names].forEach(s=>{const th=node('th',s);th.scope='col';head.append(th);});$('ledgerHead').replaceChildren(head);$('ledger').replaceChildren(...frames.slice(0,day+1).map((r,i)=>{const tr=node('tr',undefined,i===day?'active-row':'');[i,r.price===null?'—':r.price,...r.values.map(fmt)].forEach((s,j)=>{const cell=node(j===0?'th':'td',s);if(j===0)cell.scope='row';tr.append(cell);});return tr;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('preset').addEventListener('change',e=>{selected=Number(e.target.value);day=0;frames=StockCore.trace(StockCore.presets[selected]);render();});
$('prev').onclick=()=>{if(day>0)day--;render();};$('next').onclick=()=>{if(day<frames.length-1)day++;render();};$('reset').onclick=()=>{day=0;render();};$('end').onclick=()=>{day=frames.length-1;render();};$('position').oninput=e=>{day=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
locale.onChange(render);locale.init();
function syncNav(){
 let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});
 const strip=document.querySelector('.step-nav-inner');
 document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on){a.setAttribute('aria-current','step');const r=a.getBoundingClientRect(),s=strip.getBoundingClientRect();if(r.left<s.left)strip.scrollLeft-=s.left-r.left+12;else if(r.right>s.right)strip.scrollLeft+=r.right-s.right+12;}else a.removeAttribute('aria-current');});
}
window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);syncNav();
