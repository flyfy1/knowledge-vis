'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let selected=0,index=0,frames=ArithmeticCore.trace(ArithmeticCore.presets[0]),choice=null,revealed=false,copyState='';
function node(tag,value,cls){const e=document.createElement(tag);if(value!==undefined)e.textContent=value;if(cls)e.className=cls;return e;}
function cards(values,move){return values.map((v,i)=>{const cls=move?(i===move.i?'target':i===move.j?'source':''):'';const e=node('div',undefined,'card '+cls);e.append(node('small',t('index',{i})),node('b',v));if(move)e.append(node('span',t(i===move.i?'targetTag':i===move.j?'sourceTag':'unusedTag')));return e;});}
function row(values){const e=node('tr');values.forEach((v,i)=>{const c=node(i===0?'th':'td',v);if(i===0)c.scope='row';e.append(c);});return e;}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));$('historyWrap').setAttribute('aria-label',t('scrollHistory'));
 const nums=ArithmeticCore.presets[selected],f=frames[index],m=f.move;
 $('hand').replaceChildren(...cards([2,4,6],null));$('array').replaceChildren(...cards(nums,m));
 $('progress').textContent=t('progress',{i:index,total:frames.length-1,answer:f.answer});
 $('prev').disabled=$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===frames.length-1;
 $('position').max=frames.length-1;$('position').value=index;
 $('transition').textContent=m?t('transition',{...m,left:nums[m.j],right:nums[m.i]}):t('initial');
 $('maps').replaceChildren(...f.dp.map((map,k)=>{const e=node('div',undefined,'map-row'+(m&&m.i===k?' target':''));e.append(node('b','dp['+k+']'));const entries=node('div',undefined,'entries');const keys=Object.keys(map).sort((a,b)=>Number(a)-Number(b));if(!keys.length)entries.append(node('span',t('empty'),'muted'));keys.forEach(d=>entries.append(node('span',d+' : '+map[d],'entry'+(m&&m.i===k&&m.d===Number(d)?' hot':''))));e.append(entries);return e;}));
 const history=frames.slice(1,index+1).map((f,k)=>{const m=f.move,e=row([`(${m.j}, ${m.i})`,m.d,m.c,`${m.before} → ${m.after}`,'+'+m.c,m.answer]);if(k===index-1)e.className='active-row';return e;});
 if(!history.length){const tr=node('tr'),td=node('td',t('noHistory'));td.colSpan=6;tr.append(td);history.push(tr);}$('history').replaceChildren(...history);
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===2?'correct':'incorrect')+' '+t('answer');$('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('preset').onchange=e=>{selected=Number(e.target.value);index=0;frames=ArithmeticCore.trace(ArithmeticCore.presets[selected]);render();};
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});const strip=document.querySelector('.step-nav-inner');document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on){a.setAttribute('aria-current','step');const r=a.getBoundingClientRect(),s=strip.getBoundingClientRect();if(r.left<s.left)strip.scrollLeft-=s.left-r.left+12;else if(r.right>s.right)strip.scrollLeft+=r.right-s.right+12;}else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
