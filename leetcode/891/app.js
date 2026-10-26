'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
const hand=[[2],[1],[3],[2,1],[2,3],[1,3],[2,1,3]],seen=new Set();
let preset=0,k=0,choice=null,revealed=false,copyState='';
function node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
hand.forEach((a,i)=>{
  const b=node('button',undefined,'btn');b.type='button';b.dataset.step='0';b.append(node('b',JSON.stringify(a)),node('span'));
  b.addEventListener('click',()=>{seen.add(i);renderHand();});$('handGrid').append(b);
});
function renderHand(){
  let sum=0;
  [...$('handGrid').children].forEach((b,i)=>{const w=Math.max(...hand[i])-Math.min(...hand[i]);if(seen.has(i))sum+=w;b.lastChild.textContent=seen.has(i)?t('width',{w}):t('hiddenWidth');b.setAttribute('aria-pressed',String(seen.has(i)));});
  $('handRead').textContent=t('handRead',{k:seen.size,sum});$('handDone').hidden=seen.size!==7;
}
function renderTrace(){
  const {a,rows,result}=WidthCore.trace(WidthCore.presets[preset]),n=a.length;
  $('progress').textContent=t('progress',{k,n,phase:t(k===0?'initial':k===n?'complete':'middle')});
  $('input').textContent=t('input',{input:JSON.stringify(WidthCore.presets[preset]),a:JSON.stringify(a)});
  $('prev').disabled=k===0;$('next').disabled=k===n;$('end').disabled=k===n;
  $('positions').replaceChildren(...a.map((v,i)=>{
    const e=node('div',undefined,'position'+(i<k?' done':'')+(i===k-1?' current':''));
    e.append(node('span',t('pos',{i})),node('b',String(v)),node('span',t(i===k-1?'current':i<k?'done':'pending')));return e;
  }));
  $('groups').replaceChildren();$('roleTitle').hidden=k===0;
  if(k){const r=rows[k-1];$('roleTitle').textContent=t('roleTitle',{i:r.i,v:r.value});
    for(const isMax of [true,false]){
      const box=node('div',undefined,'group-box'),list=node('ul');
      box.append(node('p',t(isMax?'maxRole':'minRole',{count:isMax?r.maxCount:r.minCount})));
      for(const s of WidthCore.groups(a,r.i,isMax))list.append(node('li',t('selection',{set:'{'+s.join(',')+'}',values:'['+s.map(j=>a[j]).join(',')+']'})));
      box.append(list);$('groups').append(box);
    }
  }
  $('ledger').replaceChildren(...rows.slice(0,k).map(r=>{
    const li=node('li',t('ledgerTerm',{i:r.i,v:r.value,max:r.maxCount,min:r.minCount,delta:r.delta}),r.i===k-1?'current':'');
    li.append(node('span',t('transition',r)));return li;
  }));
  const sum=k?rows[k-1].after:0;
  $('total').textContent=k===0?t('emptyLedger'):k===n?t('result',{sum,result}):t('partial',{sum});
}
function renderQuiz(){
  document.querySelectorAll('[name=prediction]').forEach(el=>{el.checked=el.value===choice;});
  $('reveal').disabled=choice===null;
  $('feedback').textContent=!revealed?t(choice===null?'quizIdle':'quizChosen'):t(choice==='1'?'correct':choice==='0'?'incorrect0':'incorrect2')+' '+t('explanation');
}
function renderCopy(){if(copyState)$('copyStatus').textContent=t(copyState);}
$('handReset').addEventListener('click',()=>{seen.clear();renderHand();});
$('preset').addEventListener('change',e=>{preset=Number(e.target.value);k=0;renderTrace();});
$('prev').addEventListener('click',()=>{k=Math.max(0,k-1);renderTrace();});
$('next').addEventListener('click',()=>{k=Math.min(WidthCore.presets[preset].length,k+1);renderTrace();});
$('end').addEventListener('click',()=>{k=WidthCore.presets[preset].length;renderTrace();});
$('reset').addEventListener('click',()=>{k=0;renderTrace();});
document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;renderQuiz();}));
$('reveal').addEventListener('click',()=>{if(choice!==null){revealed=true;renderQuiz();}});
$('quizReset').addEventListener('click',()=>{choice=null;revealed=false;renderQuiz();});
$('pythonSource').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
  catch(_){copyState='manual';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}
  renderCopy();
});
locale.onChange(()=>{renderHand();renderTrace();renderQuiz();renderCopy();});locale.init();
function updateNavigation(){
  const sections=[...document.querySelectorAll('.step')];
  const limit=document.querySelector('.step-nav').getBoundingClientRect().height+80;
  let current=sections[0].id;
  for(const section of sections)if(section.getBoundingClientRect().top<=limit)current=section.id;
  document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+current));
}
window.addEventListener('scroll',updateNavigation,{passive:true});
window.addEventListener('resize',updateNavigation);updateNavigation();
