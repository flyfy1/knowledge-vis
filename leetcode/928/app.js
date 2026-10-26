'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,C=Malware,$=id=>document.getElementById(id);
let preset=0,removed=C.presets[0].initial[0],round=0,checked=0,choice=null,revealed=false,copyState='';
function data(){return C.presets[preset];}
function table(headers,rows){return '<thead><tr>'+headers.map(x=>'<th scope="col">'+t(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody>';}
function render(){
 $('presetDescription').textContent=String.fromCharCode(65+preset)+' · '+t('pre'+preset);
 const {graph,initial}=data(),frames=C.spread(graph,initial,removed),now=frames[round],s=C.summarize(graph,initial),scan=C.scan(s.scores),edges=[];
 for(let a=0;a<graph.length;a++)for(let b=a+1;b<graph.length;b++)if(graph[a][b])edges.push(a+'–'+b);
 $('inputRead').textContent=t('input',{n:graph.length,seeds:initial.join(','),removed,edges:edges.join(', ')||t('none')});
 const points=graph.map((_,i)=>[150+88*Math.cos(-Math.PI/2+2*Math.PI*i/graph.length),120+88*Math.sin(-Math.PI/2+2*Math.PI*i/graph.length)]);
 let svg='';for(let i=0;i<graph.length;i++)for(let j=i+1;j<graph.length;j++)if(graph[i][j]&&i!==removed&&j!==removed)svg+=`<line x1="${points[i][0]}" y1="${points[i][1]}" x2="${points[j][0]}" y2="${points[j][1]}"/>`;
 svg+=points.map(([x,y],i)=>`<g data-node="${i}" data-infected="${now.includes(i)}"><circle cx="${x}" cy="${y}" r="23" class="${i===removed?'removed':now.includes(i)?'infected':''}"/><text x="${x}" y="${y-6}">${i}${initial.includes(i)?'*':''}</text><text class="state-label" x="${x}" y="${y+12}">${i===removed?'X':now.includes(i)?'I':'H'}</text></g>`).join('');$('graph').innerHTML=svg;
 $('round').textContent=t('round',{i:round,last:frames.length-1,count:now.length,nodes:now.join(',')||t('none'),status:t(round===frames.length-1?'stopped':'growing')});
 $('history').innerHTML=frames.slice(0,round+1).map((f,i)=>'<li'+(i===round?' class="current"':'')+'>'+t('history',{i,nodes:f.join(',')||t('none'),added:i?f.filter(x=>!frames[i-1].includes(x)).join(','):t('seedRound')})+'</li>').join('');
 $('prev').disabled=round===0;$('next').disabled=$('end').disabled=round===frames.length-1;
 $('baselineTable').innerHTML=table(['candidate','final'],initial.map(node=>`<tr><td>${node}</td><td>${C.spread(graph,initial,node).at(-1).length}</td></tr>`));
 $('groups').innerHTML=s.groups.map((g,id)=>'<div class="group"><p>'+t('groupText',{id,members:g.members.join(','),size:g.members.length,seeds:g.seeds.join(','),count:g.seeds.length,owner:g.seeds.length===1?g.seeds[0]:t('none')})+'</p></div>').join('');
 const f=scan[checked];$('scoreRead').textContent=t('scoreRead',{i:checked,n:initial.length,total:s.total,best:checked?t('best',{answer:f.answer,saved:f.best,final:s.total-1-f.best,done:t(checked===initial.length?'done':'notDone')}):t('noBest')});
 $('scoreTable').innerHTML=table(['candidate','saved','final'],s.scores.map((v,i)=>`<tr data-candidate="${v.node}"><td class="${i===checked-1?'current':''}">${v.node} ${i===checked-1?t('current'):''}</td><td class="${i>=checked?'pending':''}">${i<checked?v.saved:'? '+t('pending')}</td><td>${i<checked?v.final:'?'}</td></tr>`));
 $('scorePrev').disabled=checked===0;$('scoreNext').disabled=$('scoreEnd').disabled=checked===initial.length;
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice==='5'?'correct':'retry')+' '+t('explain');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
function removeOptions(){const select=$('remove');select.innerHTML=data().initial.map(v=>`<option value="${v}">${v}</option>`).join('');select.value=String(removed);}
$('preset').addEventListener('change',e=>{preset=Number(e.target.value);removed=data().initial[0];round=checked=0;removeOptions();render();});
$('remove').addEventListener('change',e=>{removed=Number(e.target.value);round=0;render();});
for(const [id,fn] of Object.entries({prev:()=>round--,next:()=>round++,reset:()=>round=0,end:()=>round=C.spread(data().graph,data().initial,removed).length-1,scorePrev:()=>checked--,scoreNext:()=>checked++,scoreReset:()=>checked=0,scoreEnd:()=>checked=data().initial.length}))$(id).addEventListener('click',()=>{fn();render();});
document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;render();}));
$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();});
function updateNavigation(){const boundary=document.querySelector('.step-nav').getBoundingClientRect().bottom+32;let active='step0';document.querySelectorAll('.step').forEach(section=>{if(section.getBoundingClientRect().top<=boundary)active=section.id;});document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active));}
window.addEventListener('scroll',updateNavigation,{passive:true});window.addEventListener('resize',updateNavigation);locale.onChange(updateNavigation);
removeOptions();locale.onChange(render);locale.init();
