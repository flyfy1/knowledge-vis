'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,C=ThreeParts,$=id=>document.getElementById(id);
let cutI=0,cutJ=3,preset=0,frame=0,choice=null,revealed=false,copyState='';
function pieceHTML(a,i,j){const r=C.cuts(a,i,j),starts=[0,i+1,j],ends=[i,j-1,a.length-1];return r.parts.map((p,n)=>'<div class="piece"><p>'+t('part',{part:n+1,start:starts[n],end:ends[n]})+'</p><p class="digits">'+p.join('')+'</p><p>'+t('decimal',{value:r.values[n]})+'</p></div>').join('');}
function describe(f){const p={...f,starts:f.starts?.join(','),bits:f.bits?.join(','),result:f.result?.join(','),checked:f.offset+1};if(f.starts){p.a=f.starts[0]+f.length;p.b=f.starts[1]+f.length;p.s2=f.starts[1];p.s3=f.starts[2];}return t(f.kind,p);}
function render(){
 for(const [id,key] of [['langToggle','langAria'],['baselineRegion','baselineAria'],['sourcePre','sourceAria'],['copyText','fallbackAria']])$(id).setAttribute('aria-label',t(key));
 document.querySelector('.step-nav').setAttribute('aria-label',t('navAria'));
 $('handParts').innerHTML=pieceHTML(C.presets[0],cutI,cutJ);const hand=C.cuts(C.presets[0],cutI,cutJ);
 $('handResult').textContent=t('handResult',{i:cutI,j:cutJ,values:hand.values.join(', '),status:t(hand.ok?'equal':'unequal')});
 $('baselineTable').innerHTML='<thead><tr>'+['cut','parts','values','valid'].map(k=>'<th scope="col">'+t(k)+'</th>').join('')+'</tr></thead><tbody>'+C.baseline(C.presets[0]).map(r=>'<tr><td>['+r.i+','+r.j+']</td><td>'+r.parts.map(p=>p.join('')).join(' | ')+'</td><td>'+r.values.join(', ')+'</td><td>'+t(r.ok?'yes':'no')+'</td></tr>').join('')+'</tbody>';
 const a=C.presets[preset],frames=C.trace(a),now=frames[frame];
 $('digits').innerHTML=a.map((b,i)=>'<div class="digit">'+b+'<small>'+i+'</small></div>').join('');
 $('progress').textContent=t('progress',{at:frame,last:frames.length-1,message:describe(now)});
 $('history').innerHTML=frames.slice(0,frame+1).map((f,i)=>'<li'+(i===frame?' class="current-row"':'')+'>'+describe(f)+(i===frame?' '+t('current'):'')+'</li>').join('');
 $('finalParts').innerHTML=now.result&&now.result[0]>=0?pieceHTML(a,...now.result):'';
 $('prev').disabled=frame===0;$('next').disabled=$('end').disabled=frame===frames.length-1;
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;
 $('feedback').textContent=revealed?t(choice==='1'?'correct':'retry')+' '+t('explain'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
function jOptions(){const select=$('cutJ');select.innerHTML=Array.from({length:4-(cutI+2)+1},(_,n)=>n+cutI+2).map(j=>'<option>'+j+'</option>').join('');select.value=String(cutJ);}
$('cutI').addEventListener('change',e=>{cutI=+e.target.value;cutJ=Math.max(cutJ,cutI+2);jOptions();render();});
$('cutJ').addEventListener('change',e=>{cutJ=+e.target.value;render();});
$('preset').addEventListener('change',e=>{preset=+e.target.value;frame=0;render();});
for(const [id,fn] of Object.entries({prev:()=>frame--,next:()=>frame++,reset:()=>frame=0,end:()=>frame=C.trace(C.presets[preset]).length-1}))$(id).addEventListener('click',()=>{fn();render();});
document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;render();}));
$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();});
function nav(){const boundary=document.querySelector('.step-nav').getBoundingClientRect().bottom+32;let active='step0';document.querySelectorAll('.step').forEach(s=>{if(s.getBoundingClientRect().top<=boundary)active=s.id;});document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active));}
window.addEventListener('scroll',nav,{passive:true});window.addEventListener('resize',nav);locale.onChange(nav);locale.onChange(render);jOptions();locale.init();
