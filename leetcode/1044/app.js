'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
const presets=['banana','aaaa','abcd','aa','ab','ababab'];
let model=DupCore.build(presets[0]),rankAt=0,scanAt=0,showSecond=false,prediction=null,revealed=false,copyState='';
function cell(row,text,cls){const td=document.createElement('td');td.textContent=text;if(cls)td.className=cls;row.append(td);return td;}
function row(target){const tr=document.createElement('tr');$(target).append(tr);return tr;}
function suffixCell(tr,s,h){const td=cell(tr,'','suffix');const strong=document.createElement('span');strong.className='prefix';strong.textContent=s.slice(0,h);td.append(strong,document.createTextNode(s.slice(h)));}
function buttons(prefix,at,max){$(prefix+'Prev').disabled=at===0;$(prefix+'Next').disabled=at===max;$(prefix+'Reset').disabled=at===0;$(prefix+'End').disabled=at===max;}
function renderHand(){
  $('hand').replaceChildren();Array.from('banana').forEach((c,i)=>{const d=document.createElement('div');d.className='char'+(i>=1&&i<4?' hit':'')+(showSecond&&i>=3?' second':'');const b=document.createElement('b');b.textContent=c;const small=document.createElement('small');small.textContent=i;d.append(b,small);$('hand').append(d);});
  $('handToggle').textContent=t(showSecond?'hide':'show');$('handToggle').setAttribute('aria-pressed',String(showSecond));$('handRead').textContent=t(showSecond?'handBoth':'handOne');
}
function renderSorted(){
  $('sorted').replaceChildren();const s='banana',sa=[5,3,1,0,4,2];sa.forEach((i,p)=>{let h=0;if(p)while(i+h<s.length&&sa[p-1]+h<s.length&&s[i+h]===s[sa[p-1]+h])h++;const tr=row('sorted');cell(tr,i);suffixCell(tr,s.slice(i),h);cell(tr,h);});
}
function renderRank(){
  const f=model.rounds[rankAt],max=model.rounds.length-1;
  buttons('rank',rankAt,max);$('rankRead').textContent=rankAt?t('rankEvent',{at:rankAt,total:max,k:f.k,width:f.k*2})+(rankAt===max?' '+t('rankDone'):''):t('rankInitial',{total:max});
  $('ranks').replaceChildren();f.sa.forEach(i=>{const tr=row('ranks');cell(tr,i);cell(tr,model.s.slice(i),'suffix');cell(tr,f.pairs?'('+f.pairs[i].join(', ')+')':t('initialPair'));cell(tr,f.rank[i]);});
  $('history').replaceChildren();model.rounds.slice(0,rankAt+1).forEach(f=>{const li=document.createElement('li');li.textContent=f.k?t('historyRound',{k:f.k,width:f.k*2,r:'['+f.rank.join(', ')+']'}):t('historyInitial',{r:'['+f.rank.join(', ')+']'});$('history').append(li);});
}
function renderScan(){
  const f=model.scan[scanAt];buttons('scan',scanAt,model.s.length);
  $('scanInput').textContent='s = '+JSON.stringify(model.s)+'; sa = ['+model.sa.join(', ')+']';
  $('scanRead').textContent=t('scanRead',{at:scanAt,n:model.s.length,carry:f.carry,scope:t(scanAt===model.s.length?'finalBest':'bestSoFar'),len:f.bestLen,answer:JSON.stringify(model.s.slice(f.bestStart,f.bestStart+f.bestLen)),start:f.bestLen?f.bestStart:t('noBest')});
  $('scan').replaceChildren();if(!f.rows.length){const td=cell(row('scan'),t('pending'));td.colSpan=8;}
  f.rows.forEach((r,p)=>{const tr=row('scan');if(p===f.rows.length-1)tr.className='changed';cell(tr,r.i);cell(tr,r.j===null?t('none'):r.j);suffixCell(tr,model.s.slice(r.i),r.lcp);cell(tr,r.before);cell(tr,r.extra);cell(tr,r.lcp);cell(tr,r.carry);cell(tr,t(p===f.rows.length-1?'current':'completed'));});
}
function renderPrediction(){
  $('reveal').disabled=prediction===null;$('feedback').hidden=!revealed;
  $('feedback').textContent=revealed?t(prediction===2?'feedbackCorrect':'feedbackWrong')+' '+t('feedback'):'';
}
function render(){renderHand();renderSorted();renderRank();renderScan();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('handToggle').addEventListener('click',()=>{showSecond=!showSecond;renderHand();});
$('preset').addEventListener('change',()=>{model=DupCore.build(presets[Number($('preset').value)]);rankAt=scanAt=0;renderRank();renderScan();});
for(const prefix of ['rank','scan'])for(const action of ['Prev','Next','Reset','End'])$(prefix+action).addEventListener('click',()=>{
  const max=prefix==='rank'?model.rounds.length-1:model.s.length;
  let at=prefix==='rank'?rankAt:scanAt;at=action==='Prev'?Math.max(0,at-1):action==='Next'?Math.min(max,at+1):action==='Reset'?0:max;
  if(prefix==='rank'){rankAt=at;renderRank();}else{scanAt=at;renderScan();}
});
document.querySelectorAll('[name="prediction"]').forEach(el=>el.addEventListener('change',()=>{prediction=Number(el.value);revealed=false;renderPrediction();}));
$('reveal').addEventListener('click',()=>{revealed=true;renderPrediction();});
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
  catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}
  $('copyStatus').textContent=t(copyState);
});
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+e.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}});},{rootMargin:'-10% 0px -65% 0px'});
document.querySelectorAll('.step').forEach(el=>observer.observe(el));
