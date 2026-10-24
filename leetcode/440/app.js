'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let selected=0,index=0,frames=PrefixCore.trace(23,14),choice=null,revealed=false,copyState='';
function node(tag,value,cls){const e=document.createElement(tag);if(value!==undefined)e.textContent=value;if(cls)e.className=cls;return e;}
function row(values){const tr=node('tr');values.forEach((v,i)=>{const c=node(i===0?'th':'td',v);if(i===0)c.scope='row';tr.append(c);});return tr;}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));
 $('countWrap').setAttribute('aria-label',t('scrollCount'));$('historyWrap').setAttribute('aria-label',t('scrollHistory'));
 const input=PrefixCore.presets[selected],f=frames[index];
 $('progress').textContent=t('progress',{...input,i:index,total:frames.length-1});
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
 $('position').max=frames.length-1;$('position').value=index;
 $('prefixValue').textContent=f.p;$('remainingValue').textContent=f.r;$('sizeValue').textContent=f.size;
 $('decision').textContent=f.r===0?t('terminal',f):f.size<=f.r?t('skipPreview',{...f,next:f.p+1,after:f.r-f.size}):t('descendPreview',{...f,next:f.p*10,after:f.r-1});
 $('countCaption').textContent=t('countCaption',{parts:f.rows.map(x=>x.count).join(' + '),size:f.size});
 $('count').replaceChildren(...f.rows.map(x=>row([x.d,`[${x.first}, ${x.stop})`,`[${x.first}, ${x.clipped})`,x.count])));
 const moves=frames.slice(1,index+1).map((f,i)=>{const m=f.move,tr=row([i+1,t(m.kind,{size:m.size,r:m.beforeR}),`(${m.beforeP}, ${m.beforeR})`,`(${m.p}, ${m.r})`]);if(i===index-1)tr.className='active-row';return tr;});
 if(!moves.length){const tr=node('tr'),td=node('td',t('initial'));td.colSpan=4;tr.append(td);moves.push(tr);}
 $('history').replaceChildren(...moves);
 $('handOrder').replaceChildren(...[1,10,11,12,13,2,3,4,5,6,7,8,9].map((v,i)=>{const e=node('div',undefined,'number'+(i===1?' target':''));e.append(node('small','#'+(i+1)),node('b',v));return e;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('preset').onchange=e=>{selected=Number(e.target.value);index=0;const {n,k}=PrefixCore.presets[selected];frames=PrefixCore.trace(n,k);render();};
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});const strip=document.querySelector('.step-nav-inner');document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on){a.setAttribute('aria-current','step');const r=a.getBoundingClientRect(),s=strip.getBoundingClientRect();if(r.left<s.left)strip.scrollLeft-=s.left-r.left+12;else if(r.right>s.right)strip.scrollLeft+=r.right-s.right+12;}else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
