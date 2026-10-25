'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,C=RationalCore;
const $=id=>document.getElementById(id);
let hand=0,phase=0,preset=0,choice=null,revealed=false,copyState='';
function item(text,current=false){const li=document.createElement('li');li.textContent=text;if(current)li.className='current';return li;}
function render(){
  $('langToggle').setAttribute('aria-label',t('language'));
  document.querySelector('nav').setAttribute('aria-label',t('nav'));
  $('handLedger').replaceChildren();let sum=C.frac(1n,10n);
  $('handLedger').append(item(t('handRow',{term:'1/10',sum:C.format(sum)}),hand===0));
  for(let i=1;i<=hand;i++){const term=C.frac(6n,C.pow(i+1));sum=C.add(sum,term);$('handLedger').append(item(t('handRow',{term:C.format(term),sum:C.format(sum)}),i===hand));}
  const gap=C.frac(sum.d-6n*sum.n,6n*sum.d);
  $('handRead').textContent=t('handRead',{n:hand,sum:C.format(sum),gap:C.format(gap)});
  $('undo').disabled=hand===0;$('add').disabled=hand===4;
  const pair=C.presets[preset];
  ['left','right'].forEach((side,i)=>{
    $(side+'Input').textContent=(i===0?'s = ':'t = ')+pair[i];
    const p=C.parse(pair[i]),v=C.stages(pair[i]);const rows=[];
    if(phase>=1)rows.push(t('parseRow',p));
    if(phase>=2)rows.push(t('finiteRow',{...p,v:C.format(v[1])}));
    if(phase>=3)rows.push(t('tailRow',{tail:p.k?`${p.B}/[10^${p.m} × (10^${p.k} − 1)]`:t('noTail'),v:C.format(v[2])}));
    $(side+'Ledger').replaceChildren(...rows.map((r,j)=>item(r,j===rows.length-1)));
  });
  $('progress').textContent=t('progress',{n:phase});$('initial').hidden=phase!==0;
  $('prev').disabled=phase===0;$('next').disabled=phase===4;
  if(phase===4){const a=C.stages(pair[0])[2],b=C.stages(pair[1])[2],eq=C.equal(a,b);$('comparison').textContent=t('comparison',{left:a.n*b.d,right:b.n*a.d,sign:eq?'=':'≠',answer:t(eq?'yes':'no')});}else $('comparison').textContent=t('wait');
  $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;
  if(revealed)$('feedback').textContent=t(choice==='1'?'correct':'incorrect')+' '+t('feedback');
  $('copyStatus').textContent=copyState?t(copyState):'';
}
$('add').onclick=()=>{hand=Math.min(4,hand+1);render();};
$('undo').onclick=()=>{hand=Math.max(0,hand-1);render();};
$('handReset').onclick=()=>{hand=0;render();};
$('next').onclick=()=>{phase=Math.min(4,phase+1);render();};
$('prev').onclick=()=>{phase=Math.max(0,phase-1);render();};
$('reset').onclick=()=>{phase=0;render();};
$('preset').onchange=()=>{preset=Number($('preset').value);phase=0;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=el.value;revealed=false;render();});
$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{
  try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
  catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}
  render();
};
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));},{rootMargin:'-15% 0px -65% 0px'});
document.querySelectorAll('.step').forEach(s=>observer.observe(s));
locale.onChange(render);locale.init();
