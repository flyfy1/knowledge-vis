'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=FenceCore;
let tiny=false,y=0,preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
const coord=p=>'('+p.join(',')+')',list=ps=>ps.map(coord).join(' → ');
function svgEl(name,attrs,text){const e=document.createElementNS('http://www.w3.org/2000/svg',name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;}
function plot(id,points,lower=[],upper=[],pending=null,boundary=[]){
 const svg=$(id);svg.replaceChildren();svg.setAttribute('aria-label',t('plotLabel'));
 const xmin=Math.min(0,...points.map(p=>p[0])),xmax=Math.max(2,...points.map(p=>p[0])),ymin=Math.min(0,...points.map(p=>p[1])),ymax=Math.max(2,...points.map(p=>p[1]));
 const X=x=>55+(x-xmin)/(xmax-xmin)*360,Y=y=>310-(y-ymin)/(ymax-ymin)*250;
 for(let x=xmin;x<=xmax;x++){svg.append(svgEl('line',{x1:X(x),x2:X(x),y1:60,y2:310,class:'grid'}));svg.append(svgEl('text',{x:X(x),y:342,'text-anchor':'middle'},x));}
 for(let v=ymin;v<=ymax;v++){svg.append(svgEl('line',{x1:55,x2:415,y1:Y(v),y2:Y(v),class:'grid'}));svg.append(svgEl('text',{x:35,y:Y(v)+5,'text-anchor':'middle'},v));}
 svg.append(svgEl('text',{x:448,y:315},'x'),svgEl('text',{x:35,y:35},'y'));
 for(const[ps,cls]of [[lower,'lower'],[upper,'upper']])if(ps.length>1)svg.append(svgEl('polyline',{points:ps.map(p=>X(p[0])+','+Y(p[1])).join(' '),class:cls}));
 const keys=new Set(boundary.map(p=>p.join(',')));
 for(const p of points){let cls=keys.has(p.join(','))?'boundary':'';if(pending&&p.join(',')===pending.join(','))cls='candidate';svg.append(svgEl('circle',{cx:X(p[0]),cy:Y(p[1]),r:6,class:cls}));svg.append(svgEl('text',{x:X(p[0])+9,y:Y(p[1])-12},coord(p)));}
}
function renderTiny(){
 const ps=C.presets[0],edge=[[0,0],[1,0],[2,0],[2,2],[0,2]];
 plot('tinyPlot',ps,tiny?edge.concat([edge[0]]):[],[],null,tiny?edge:[]);
 $('tinyToggle').textContent=t(tiny?'hide':'show');$('tinyToggle').setAttribute('aria-pressed',String(tiny));$('tinyRead').textContent=t(tiny?'tinyShown':'tinyHidden');
}
function renderTurn(){const ps=[[0,0],[1,y],[2,0]],value=C.cross(...ps);plot('turnPlot',ps,ps);$('turnRead').textContent=t('turnRead',{y,value,meaning:t(value>0?'left':value===0?'straight':'right')});}
function operation(f){
 const params={...f,pass:t(f.pass),a:f.a?coord(f.a):'',b:f.b?coord(f.b):'',point:f.point?coord(f.point):''};
 if(f.kind==='done')return t('opDone',{n:f.result.length,result:f.result.map(coord).join(', ')});
 return t({start:'opStart',pass:'opPass',pop:'opPop',keep:'opKeep',append:'opAppend'}[f.kind],params);
}
function renderTrace(){const f=frames[at];
 $('inputRead').textContent=t('input',{points:list(C.sort(C.presets[preset]))});$('progress').textContent=t('progress',{at,max:frames.length-1,pass:t(f.pass)});$('operationRead').textContent=operation(f);
 $('lowerRead').textContent=f.lower.length?list(f.lower):t('empty');$('upperRead').textContent=f.upper.length?list(f.upper):t('empty');
 plot('tracePlot',C.presets[preset],f.lower,f.upper,f.kind==='pop'||f.kind==='keep'?f.point:null,f.result||[]);
 $('history').replaceChildren(...frames.slice(1,at+1).map(f=>{const e=document.createElement('li');e.textContent=operation(f);return e;}));
 $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;$('traceReset').disabled=at===0;
}
function renderPrediction(){$('reveal').disabled=selected===null;$('feedback').textContent=revealed?t(selected===2?'correct':'incorrect')+' '+t('answer'):t('await');$('feedback').classList.toggle('correct',revealed&&selected===2);}
function render(){renderTiny();renderTurn();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';
 $('langToggle').setAttribute('aria-label',t('languageLabel'));document.querySelector('.step-nav').setAttribute('aria-label',t('navLabel'));document.querySelectorAll('.plot-scroll').forEach(el=>el.setAttribute('aria-label',t('scrollLabel')));$('history').setAttribute('aria-label',t('history'));
}
$('tinyToggle').onclick=()=>{tiny=!tiny;renderTiny();};$('turnY').onchange=e=>{y=Number(e.target.value);renderTurn();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('tracePrev').onclick=()=>{if(at>0)at--;renderTrace();};$('traceNext').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};$('traceLast').onclick=()=>{at=frames.length-1;renderTrace();};
for(const el of document.querySelectorAll('[name="prediction"]'))el.onchange=()=>{selected=Number(el.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('predictionReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(el=>el.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const sections=[...document.querySelectorAll('.step')],edge=document.querySelector('.step-nav').getBoundingClientRect().bottom+40;let current=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<=edge)current=section;for(const a of document.querySelectorAll('.step-nav a')){const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');}}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
