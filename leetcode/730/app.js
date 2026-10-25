'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
const baseline=`def oracle(s):
    found = set()
    for mask in range(1, 1 << len(s)):
        word = ''.join(s[k] for k in range(len(s)) if mask & (1 << k))
        if word == word[::-1]:
            found.add(word)
    return len(found)`;
let preset=0,index=0,frames=PalindromeLesson.trace(PalindromeLesson.presets[0]),revealed=false,copyState='';
function render(){
  const s=PalindromeLesson.presets[preset],f=frames[index],total=frames.length-1;
  $('progress').textContent=index?t('progress',{k:index,total,i:f.i,j:f.j,part:s.slice(f.i,f.j+1),v:f.value}):t('initial',{total});
  $('prev').disabled=index===0;$('reset').disabled=index===0;
  $('next').disabled=index===total;$('end').disabled=index===total;
  $('finalCount').textContent=index===total?t('final',{v:f.value}):t('pending');
  const table=$('dpTable');table.replaceChildren();const caption=document.createElement('caption');caption.textContent=t('tableCaption');table.append(caption);
  const thead=table.createTHead(),hr=thead.insertRow();let th=document.createElement('th');th.textContent='i / j';hr.append(th);
  [...s].forEach((ch,j)=>{th=document.createElement('th');th.scope='col';th.textContent=`${j}: ${ch}`;hr.append(th);});
  const body=table.createTBody();f.dp.forEach((row,i)=>{const tr=body.insertRow();th=document.createElement('th');th.scope='row';th.textContent=`${i}: ${s[i]}`;tr.append(th);row.forEach((v,j)=>{const td=tr.insertCell();td.textContent=i>j?'—':v===null?'?':String(v);if(i===f.i&&j===f.j){td.className='current';td.textContent='▶ '+v;}});});
  $('groups').replaceChildren();
  if(!index){const li=document.createElement('li');li.textContent=t('noGroups');$('groups').append(li);}
  f.groups.forEach(g=>{const li=document.createElement('li');li.textContent=g.L===null?t('absent',g):g.L===g.R?t('single',g):t('wrapped',g);$('groups').append(li);});
  $('actual').hidden=!index;
  if(index)$('actual').textContent=t('actual',{items:PalindromeLesson.palindromes(s.slice(f.i,f.j+1)).join(', ')});
  const choice=document.querySelector('input[name="prediction"]:checked');$('reveal').disabled=!choice;
  $('feedback').hidden=!revealed;
  if(revealed){const v=Number(choice.value);$('feedback').textContent=t(v===1?'correct':'incorrect')+' '+t('answer')+' '+t('why'+v);}
  $('copyStatus').textContent=copyState?t(copyState):'';
  $('tableRegion').setAttribute('aria-label',t('tableLabel'));$('langToggle').setAttribute('aria-label',t('languageLabel'));$('stepNav').setAttribute('aria-label',t('navLabel'));
  $('handReveal').textContent=t($('handAnswer').hidden?'handReveal':'handHide');
}
$('handReveal').onclick=()=>{$('handAnswer').hidden=!$('handAnswer').hidden;render();};
$('prev').onclick=()=>{if(index>0)index--;render();};$('next').onclick=()=>{if(index<frames.length-1)index++;render();};
$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
$('preset').onchange=()=>{preset=Number($('preset').value);frames=PalindromeLesson.trace(PalindromeLesson.presets[preset]);index=0;render();};
document.querySelectorAll('input[name="prediction"]').forEach(el=>el.onchange=()=>{revealed=false;render();});
$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('baselineCode').firstElementChild.textContent=baseline;
$('copy').onclick=async()=>{
  try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
  catch(_){copyState='manual';$('manualCopy').hidden=false;$('copyText').value=window.PYTHON_SOURCE;$('copyText').focus();$('copyText').select();}
  $('copyStatus').textContent=t(copyState);
};
locale.onChange(render);locale.init();
const links=[...document.querySelectorAll('.step-nav a')];
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));},{rootMargin:'-15% 0px -65% 0px'});
document.querySelectorAll('.step').forEach(s=>observer.observe(s));
