'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=CrossingCore;
let preset=0,x=C.presets[0].slice(),frames=C.trace(x),at=0,selected=null,revealed=false,copyState='';
const ns='http://www.w3.org/2000/svg';
function svgNode(tag,attrs,text){const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(text!==undefined)el.textContent=text;return el;}
function plot(f){
 const svg=$('plot');svg.replaceChildren();svg.setAttribute('aria-label',t('plot'));$('plotRegion').setAttribute('aria-label',t('plot')); const width=svg.clientWidth||600,height=svg.clientHeight||320;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
 const all=frames[frames.length-1].points,xs=all.map(p=>p[0]),ys=all.map(p=>p[1]);
 const minX=Math.min(...xs)-1,maxX=Math.max(...xs)+1,minY=Math.min(...ys)-1,maxY=Math.max(...ys)+1;
 const scale=Math.min((width-64)/(maxX-minX),(height-64)/(maxY-minY)),cx=(minX+maxX)/2,cy=(minY+maxY)/2;
 const X=v=>width/2+(v-cx)*scale,Y=v=>height/2-(v-cy)*scale;
 svg.append(svgNode('line',{x1:12,y1:Y(0),x2:width-12,y2:Y(0),class:'axis-line'}),svgNode('line',{x1:X(0),y1:12,x2:X(0),y2:height-12,class:'axis-line'}),svgNode('text',{x:width-14,y:Y(0)-8},'x'),svgNode('text',{x:X(0)+8,y:22},'y'));
 for(let i=0;i<f.k;i++){
  const a=f.points[i],b=f.points[i+1],contact=f.hit&&f.hit.old===i;
  svg.append(svgNode('line',{x1:X(a[0]),y1:Y(a[1]),x2:X(b[0]),y2:Y(b[1]),class:'path-line'+(contact?' contact':'')+(i===f.k-1?' current':'')}));
  svg.append(svgNode('text',{x:X((a[0]+b[0])/2)+(a[0]===b[0]?9:0),y:Y((a[1]+b[1])/2)-(a[1]===b[1]?10:0)},String(i)));
 }
 svg.append(svgNode('circle',{cx:X(0),cy:Y(0),r:4,class:'point'}),svgNode('text',{x:X(0)-8,y:Y(0)+20,'text-anchor':'end'},'(0,0)'));
}
function formulas(i){
 const n=j=>x[i-j];
 return {
 A:i>=3?`${n(0)} ≥ ${n(2)} ∧ ${n(1)} ≤ ${n(3)}`:'',
 B:i>=4?`${n(1)} = ${n(3)} ∧ ${n(0)} + ${n(4)} ≥ ${n(2)}`:'',
 C:i>=5?`${n(2)} ≥ ${n(4)} ∧ ${n(0)} + ${n(4)} ≥ ${n(2)} ∧ ${n(1)} ≤ ${n(3)} ∧ ${n(1)} + ${n(5)} ≥ ${n(3)}`:''
 };
}
function renderTrace(){
 const f=frames[at],i=f.k-1;
 $('inputRead').textContent=t('inputRead',{x:x.join(', ')});
 $('frameRead').textContent=f.k?t('frame',{k:f.k,n:x.length,i}):t('initial');
 $('resultRead').textContent=f.hit?t('found',{kind:f.hit.kind,i,old:f.hit.old}):f.k===x.length?t('safeEnd',{n:x.length}):f.k?t('progress'):t('initial');
 $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;
 plot(f);const values=formulas(i);
 $('conditions').replaceChildren(...['A','B','C'].map(c=>{const div=document.createElement('div');div.className='condition'+(f.checks[c]?' hit':'');const title=document.createElement('b'),line=document.createElement('code'),status=document.createElement('span');title.textContent=t('derive'+c);line.textContent=values[c];status.textContent=values[c]?t(f.checks[c]?'testYes':'testNo'):t('notYet');div.append(title,line,status);return div;}));
 $('empty').hidden=f.k>0;$('coordinateRegion').hidden=f.k===0;$('coordinateRegion').setAttribute('aria-label',t('tableTitle'));
 $('coordinates').replaceChildren(...f.points.slice(1).map((p,j)=>{const tr=document.createElement('tr');[j,`(${f.points[j].join(', ')})`,`(${p.join(', ')})`,t(f.hit&&f.hit.old===j?'oldContact':j===i?'current':'older')].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});return tr;}));
}
function renderPrediction(){$('reveal').disabled=selected===null;$('predictionFeedback').textContent=revealed?t(selected===1?'correct':'incorrect')+' '+t('answer'):t('await');$('predictionFeedback').classList.toggle('correct',revealed&&selected===1);}
function render(){$('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
function restart(){frames=C.trace(x);at=0;renderTrace();}
$('preset').onchange=e=>{preset=Number(e.target.value);x=C.presets[preset].slice();$('finalLength').value=x[x.length-1];restart();};
$('finalLength').value=x[x.length-1];$('finalLength').onchange=e=>{x[x.length-1]=Number(e.target.value);restart();};
$('tracePrev').onclick=()=>{at=Math.max(0,at-1);renderTrace();};$('traceNext').onclick=()=>{at=Math.min(frames.length-1,at+1);renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};$('traceLast').onclick=()=>{at=frames.length-1;renderTrace();};
for(const el of document.querySelectorAll('[name="prediction"]'))el.onchange=()=>{selected=Number(el.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('predictionReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(el=>el.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('sourceDetails').open=true;$('manualSource').focus();$('manualSource').select();$('manualSource').scrollTop=0;}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const edge=document.querySelector('.step-nav').getBoundingClientRect().bottom+40;let id='step0';for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=edge)id=s.id;for(const a of document.querySelectorAll('.step-nav a')){const active=a.hash==='#'+id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');}}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',()=>{plot(frames[at]);updateNav();});updateNav();
