'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
const presets=[[[4,1,4,9],3],[[1,3,-1,-3,5,3,6,7],3],[[-2147483648,2147483647,0,0,-2],2],[[7],1],[[2,2,-5,8],4]];
let model=Median480.trace(...presets[0]),pos=0,choice=null,revealed=false,copyState='';
function elem(tag,text,cl){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cl)e.className=cl;return e;}
function interval(node){let lo=node,hi=node;while(lo<model.size){lo*=2;hi=hi*2+1;}lo-=model.size;hi-=model.size;const parts=model.values.slice(lo,hi+1).map(String);if(hi>=model.values.length)parts.push(t('padding'));return parts.join(', ');}
function render(){
 const f=model.frames[pos],last=model.frames.length-1;
 $('inputData').textContent=`nums = [${model.nums.join(', ')}], k = ${model.k}`;
 $('progress').textContent=t('progress',{i:pos,n:last,count:f.active.length,k:model.k});
 $('prev').disabled=pos===0;$('next').disabled=pos===last;$('end').disabled=pos===last;$('reset').disabled=pos===0;
 $('position').max=last;$('position').value=pos;
 let event=t(f.kind,{x:f.value});
 if(f.kind==='query')event=t('query',{a:Math.floor((model.k+1)/2),b:Math.floor((model.k+2)/2),x:f.selections[0].value,y:f.selections[1].value,m:f.answers.at(-1)});
 $('event').textContent=event;
 $('active').textContent=f.active.length?'['+f.active.join(', ')+']':t('empty');
 $('freq').replaceChildren(...model.values.map((v,i)=>elem('span',`${v} → ${f.tree[model.size+i]}`)));
 const visited=new Set(f.selections.flatMap(s=>[...s.route.map(r=>r.node),s.leaf]));
 const levels=[];for(let start=1;start<model.size*2;start*=2){const row=elem('div',undefined,'tree-level');for(let node=start;node<start*2;node++)row.append(elem('div',t('node',{n:node,range:interval(node),count:f.tree[node]}),'tree-node-box'+(visited.has(node)?' visited':'')));levels.push(row);}
 $('tree').replaceChildren(...levels);
 const routes=f.selections.map(s=>{const box=elem('div',undefined,'route');for(const r of s.route)box.append(elem('p',t('routeLine',{...r,direction:t(r.left?'left':'right')})));box.append(elem('p',t('found',s)));return box;});
 $('route').replaceChildren(...(routes.length?routes:[elem('p',t('noRoute'))]));
 $('history').replaceChildren(...(f.answers.length?f.answers.map((v,i)=>elem('span',t('window',{i:i+1})+`: ${v}`,'ledger-item')):[elem('p',t('none'))]));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;
 if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('explanation');
 $('copyStatus').textContent=copyState?t(copyState):'';
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('nav'));
}
$('prev').onclick=()=>{pos=Math.max(0,pos-1);render();};$('next').onclick=()=>{pos=Math.min(model.frames.length-1,pos+1);render();};$('reset').onclick=()=>{pos=0;render();};$('end').onclick=()=>{pos=model.frames.length-1;render();};$('position').oninput=()=>{pos=Number($('position').value);render();};
$('preset').onchange=()=>{model=Median480.trace(...presets[Number($('preset').value)]);pos=0;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=Number(el.value);revealed=false;render();});
$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+e.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}},{rootMargin:'-20% 0px -60% 0px'});
document.querySelectorAll('section.step').forEach(e=>observer.observe(e));
locale.onChange(render);locale.init();
