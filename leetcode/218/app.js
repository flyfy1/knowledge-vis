'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,frames=Skyline.trace(Skyline.presets[0]),index=0,choice=null,revealed=false,copyState='';
$('pythonCode').textContent=window.PYTHON_SOURCE;
$('copyText').value=window.PYTHON_SOURCE;
function point(f){return f.answer.length&&f.answer[f.answer.length-1][0]===f.x;}
function draw(f){
 const b=Skyline.presets[preset],maxX=Math.max(...b.map(v=>v[1])),minX=Math.min(...b.map(v=>v[0])),maxH=Math.max(...b.map(v=>v[2]));
 const X=x=>48+600*(x-minX)/(maxX-minX),Y=h=>218-180*h/maxH;
 let html='<line class="axis" x1="48" y1="218" x2="660" y2="218"/><line class="axis" x1="48" y1="26" x2="48" y2="218"/><text x="662" y="220">x</text><text x="15" y="26">h</text><text x="20" y="224">0</text>';
 b.forEach((v,j)=>{html+=`<rect class="building" x="${X(v[0])}" y="${Y(v[2])}" width="${X(v[1])-X(v[0])}" height="${218-Y(v[2])}"/>`;});
 const xs=[...new Set(b.flatMap(v=>v.slice(0,2)))].sort((a,b)=>a-b);
 xs.forEach((x,j)=>html+=`<text text-anchor="middle" x="${X(x)}" y="${j%2?254:238}">${x}</text>`);
 [...new Set(b.map(v=>v[2]))].forEach(h=>html+=`<text text-anchor="end" x="42" y="${Y(h)+5}">${h}</text>`);
 if(f.answer.length){let d=`M ${X(f.answer[0][0])} 218`;f.answer.forEach(v=>{d+=` H ${X(v[0])} V ${Y(v[1])}`;});d+=` H ${X(f.x)}`;html+=`<path class="roof" d="${d}"/>`;}
 if(f.x!==null)html+=`<line class="cursor" x1="${X(f.x)}" x2="${X(f.x)}" y1="26" y2="218"/>`;
 $('skyline').innerHTML=html;
}
function render(){
 const f=frames[index];
 $('langToggle').setAttribute('aria-label',t('langLabel'));
 document.querySelector('nav').setAttribute('aria-label',t('navLabel'));
 $('diagram').setAttribute('aria-label',t('diagram'));$('history').setAttribute('aria-label',t('history'));
 $('prev').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
 $('position').max=frames.length-1;$('position').value=index;
 $('progress').textContent=t('progress',{k:index,n:frames.length-1,i:f.i});
 $('event').textContent=f.x===null?t('initial'):t('transition',{x:f.x,old:f.old,height:f.height,emit:point(f)?t('emitted',{x:f.x,height:f.height}):t('unchanged')});
 $('buildings').textContent=Skyline.presets[preset].map((b,i)=>`${i+1}: [${b.join(',')}]`).join(' · ');
 $('ops').replaceChildren();
 const ops=f.ops.length?f.ops.map(v=>t(v.kind,v)):[t(f.x===null?'initial':'noOps')];
 ops.forEach(s=>{const li=document.createElement('li');li.textContent=s;$('ops').append(li);});
 $('heap').replaceChildren();
 if(!f.heap.length){const li=document.createElement('li');li.textContent=t('heapEmpty');$('heap').append(li);}
 f.heap.forEach((v,k)=>{const li=document.createElement('li'),b=document.createElement('b');const expired=v[1]<=f.x;li.className=expired?'expired':'';b.textContent=t('slot',{k,root:k===0?t('root'):''});li.append(b,document.createTextNode(`(${v.join(',')}) · ${t(expired?'expired':'active')}`));$('heap').append(li);});
 $('output').textContent=t('output',{points:JSON.stringify(f.answer)});
 $('ledger').replaceChildren();frames.slice(1,index+1).forEach(g=>{const tr=document.createElement('tr');[g.x,`${g.old} → ${g.height}`,point(g)?`[${g.x},${g.height}]`:t('none')].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});$('ledger').append(tr);});
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;
 if(revealed)$('feedback').textContent=t(choice==='1'?'correct':'incorrect')+' '+t('explainQuiz');
 $('copyStatus').textContent=copyState?t(copyState):'';
 draw(f);
}
$('preset').addEventListener('change',e=>{preset=+e.target.value;frames=Skyline.trace(Skyline.presets[preset]);index=0;render();});
$('prev').addEventListener('click',()=>{index=Math.max(0,index-1);render();});
$('next').addEventListener('click',()=>{index=Math.min(frames.length-1,index+1);render();});
$('end').addEventListener('click',()=>{index=frames.length-1;render();});
$('reset').addEventListener('click',()=>{index=0;render();});
$('position').addEventListener('input',e=>{index=+e.target.value;render();});
for(const input of document.querySelectorAll('[name=prediction]'))input.addEventListener('change',()=>{choice=input.value;revealed=false;render();});
$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('copy').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
 catch(_){copyState='manual';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}
 render();
});
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}});},{rootMargin:'-15% 0px -65% 0px'});
document.querySelectorAll('.step').forEach(s=>observer.observe(s));
locale.onChange(render);locale.init();
