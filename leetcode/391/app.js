'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id),C=RectangleLesson;
let preset=0,index=0,frames=C.trace(C.presets[0]),hand=false,revealed=false,copyState='';
const setText=xs=>xs.length?'{'+xs.map(x=>'('+x+')').join(', ')+'}':t('empty');
function grid(el,rs,full,odd){
 const box=C.bounds(full),[l,b,r,top]=box,w=r-l,h=top-b,s=64,pad=65,W=w*s+pad*2,H=h*s+pad*2;
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('role','img');
 const cells=C.cells(rs,box);svg.setAttribute('aria-label',t('gridLabel',{k:rs.length,cells:cells.map(c=>t('cellText',{x:c.x,y:c.y,n:c.count})).join('; ')}));el.setAttribute('aria-label',t('gridScroll'));
 const X=x=>pad+(x-l)*s,Y=y=>pad+(top-y)*s;
 function node(tag,attrs,text){const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;svg.append(e);return e;}
 const colors=getComputedStyle(document.documentElement),color=k=>colors.getPropertyValue('--'+k).trim();
 for(const c of cells){node('rect',{x:X(c.x),y:Y(c.y+1),width:s,height:s,fill:color(c.count===0?'panel2':'panel'),stroke:color('muted')});node('text',{x:X(c.x)+s/2,y:Y(c.y+.5)+7,'text-anchor':'middle',class:'count',style:'fill:'+color(c.count===0?'bad':c.count===1?'text':'accent2')},c.count);}
 node('rect',{x:X(l),y:Y(top),width:w*s,height:h*s,fill:'none',stroke:color('accent'),'stroke-width':2,'stroke-dasharray':'6 4'});
 for(let x=l;x<=r;x++)node('text',{x:X(x),y:Y(b)+38,'text-anchor':'middle',class:'axis'},x);
 for(let y=b;y<=top;y++)node('text',{x:X(l)-35,y:Y(y)+6,'text-anchor':'middle',class:'axis'},y);
 node('text',{x:W-15,y:Y(b)+38},'x');node('text',{x:X(l)-35,y:20},'y');
 for(const q of odd){const [x,y]=q.split(',').map(Number);node('circle',{cx:X(x),cy:Y(y),r:5,fill:color('accent2'),stroke:color('bg'),'stroke-width':2});
 node('text',{x:X(x),y:Y(y)+(y===top?-14:23),'text-anchor':'middle',style:'fill:'+color('accent2')},'('+q+')');}
 el.replaceChildren(svg);
}
function render(){
 const rs=C.presets[preset],f=frames[index];
 grid($('handGrid'),C.presets[0],C.presets[0],[]);
 $('handReveal').textContent=t(hand?'handHide':'handShow');$('handReveal').setAttribute('aria-expanded',String(hand));$('handReveal').setAttribute('aria-controls','handAnswer');$('handAnswer').hidden=!hand;
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===rs.length;$('end').disabled=index===rs.length;
 $('progress').textContent=t('progress',{k:index,n:rs.length,phase:t(index===0?'start':index===rs.length?'ended':'running')});
 $('operation').textContent=index?t('operation',{k:index,r:JSON.stringify(rs[index-1]),delta:f.area-frames[index-1].area,old:frames[index-1].area,area:f.area}):t('initial');
 grid($('traceGrid'),rs.slice(0,index),rs,f.odd);
 $('beforeSet').textContent=setText(f.before);$('afterSet').textContent=setText(f.odd);
 $('metrics').textContent=index?t('metrics',{area:f.area,box:JSON.stringify(f.box),boxArea:f.boxArea,a:t(f.areaOK?'pass':'fail'),c:t(f.cornerOK?'pass':'fail')}):t('initial');
 $('verdict').textContent=index===rs.length?t('verdict',{result:String(f.result)}):'';
 $('toggles').replaceChildren();for(const q of f.toggles){const row=document.createElement('tr');for(const text of ['('+q.point+')',t(q.remove?'remove':'add')]){const td=document.createElement('td');td.textContent=text;row.append(td);}$('toggles').append(row);}
 if(!index){const row=document.createElement('tr'),td=document.createElement('td');td.colSpan=2;td.textContent=t('none');row.append(td);$('toggles').append(row);}
 $('ledger').replaceChildren();for(const h of frames.slice(1,index+1)){const li=document.createElement('li');li.textContent=t('history',{k:h.k,area:h.area,odd:setText(h.odd)});$('ledger').append(li);}
 const selected=document.querySelector('[name="prediction"]:checked');$('reveal').disabled=!selected;
 $('feedback').textContent=revealed?t(selected.value==='1'?'correct':'incorrect')+' '+t('answer'):t(selected?'chosen':'waiting');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('handReveal').onclick=()=>{hand=!hand;render();};
$('preset').onchange=()=>{preset=+$('preset').value;index=0;frames=C.trace(C.presets[preset]);render();};
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
for(const radio of document.querySelectorAll('[name="prediction"]'))radio.onchange=()=>{revealed=false;render();};$('reveal').onclick=()=>{revealed=true;render();};
$('pythonSource').textContent=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFail';$('manualCopy').hidden=false;$('manualSource').value=window.PYTHON_SOURCE;$('manualSource').focus();$('manualSource').select();}render();};
function updateNav(){let active=$('step0');const threshold=document.querySelector('.step-nav').getBoundingClientRect().height+100;for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=threshold)active=s;for(const a of document.querySelectorAll('.step-nav a'))a.classList.toggle('active',a.hash==='#'+active.id);}
locale.onChange(()=>{render();updateNav();});locale.init();addEventListener('scroll',updateNav,{passive:true});addEventListener('resize',updateNav);
