(()=>{'use strict';
  const $=id=>document.getElementById(id);
  const canvases={latitude:$('latitudeCanvas'),albedo:$('albedoCanvas'),greenhouse:$('greenhouseCanvas')};
  const colors={cyan:'#65dded',orange:'#ffc46b',yellow:'#ffe36e',red:'#ff8f70',muted:'#9eb4c4',blue:'#65aee8'};
  const ctxFor=canvas=>{const d=Math.min(window.devicePixelRatio||1,2),w=canvas.clientWidth||720,h=canvas.clientHeight||300;canvas.width=w*d;canvas.height=h*d;const x=canvas.getContext('2d');x.setTransform(d,0,0,d,0,0);return [x,w,h]};
  const deg=r=>r*Math.PI/180;
  const arrow=(x,x1,y1,x2,y2,color)=>{x.strokeStyle=color;x.fillStyle=color;x.lineWidth=2.4;x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();const a=Math.atan2(y2-y1,x2-x1),s=8;x.beginPath();x.moveTo(x2,y2);x.lineTo(x2-s*Math.cos(a-.5),y2-s*Math.sin(a-.5));x.lineTo(x2-s*Math.cos(a+.5),y2-s*Math.sin(a+.5));x.closePath();x.fill()};
  const label=(x,s,a,b,color=colors.muted,size=13)=>{x.fillStyle=color;x.font=`${size}px system-ui`;x.fillText(s,a,b)};
  function drawLatitude(){
    const [x,w,h]=ctxFor(canvases.latitude);const lat=+$('latitude').value;const theta=90-lat;const rad=deg(lat);const ins=Math.max(0,Math.cos(rad));
    x.fillStyle='#07131d';x.fillRect(0,0,w,h);
    const cx=w*.67,cy=h*.56,R=Math.min(h*.28,125);x.strokeStyle='#2d6b7d';x.lineWidth=2;x.fillStyle='#102c3d';x.beginPath();x.arc(cx,cy,R,0,Math.PI*2);x.fill();x.stroke();
    x.strokeStyle='#21475a';x.lineWidth=1;for(const f of[-.55,0,.55]){x.beginPath();x.ellipse(cx,cy+f*R,R,Math.abs(f)*R*.5+3,0,0,Math.PI*2);x.stroke()}x.beginPath();x.moveTo(cx-R,cy);x.lineTo(cx+R,cy);x.stroke();
    x.fillStyle='#3b7080';x.beginPath();x.moveTo(cx-R*.7,cy+R*.08);x.lineTo(cx-R*.2,cy-R*.35);x.lineTo(cx+R*.12,cy-R*.2);x.lineTo(cx+R*.7,cy-R*.5);x.lineTo(cx+R*.88,cy+R*.08);x.lineTo(cx+R*.35,cy+R*.36);x.lineTo(cx-R*.18,cy+R*.28);x.closePath();x.fill();
    const rayLen=155;const startX=70,startY=64;for(let i=0;i<4;i++){const sy=startY+i*31;const ex=cx-R*.62+i*R*.26,ey=cy-R*.72;const dx=ex-startX,dy=ey-sy;const scale=rayLen/Math.hypot(dx,dy);arrow(x,startX,sy,startX+dx*scale,sy+dy*scale,colors.yellow)}
    label(x,tr('sunAngle')+': '+theta.toFixed(0)+'°',28,h-48,colors.yellow,14);label(x,tr('insolation')+': '+Math.round(ins*100)+'%',28,h-24,colors.cyan,14);label(x,lat<20?(tr('latitude')+' '+lat+'° · nearly overhead'):lat<50?(tr('latitude')+' '+lat+'° · slanted light'):(tr('latitude')+' '+lat+'° · grazing light'),cx-R,cy+R+30,colors.muted,13);
    $('latitudeVal').textContent=lat+'°';$('sunAngleVal').textContent=theta.toFixed(0)+'°';$('insolationVal').textContent=Math.round(ins*100)+'%';$('latitudeReadout').textContent=lat===0?tr('latitude')+': 0° · '+(tr('sunAngle')||'太阳高度角')+' 90°，光斑最集中。':tr('latitude')+': '+lat+'° · '+(tr('insolation')||'相对入射功率')+' '+Math.round(ins*100)+'% · 同样的能量摊在约 '+(1/Math.max(ins,.01)).toFixed(1)+' 倍面积上。';
  }
  function drawAlbedo(){
    const [x,w,h]=ctxFor(canvases.albedo);const a=+$('albedo').value/100;const incoming=100,reflected=Math.round(incoming*a),absorbed=incoming-reflected;
    x.fillStyle='#07131d';x.fillRect(0,0,w,h);const surface=h*.69;x.fillStyle=a>.62?'#d6e7ec':a<.25?'#236277':'#547b78';x.fillRect(0,surface,w,h-surface);x.fillStyle='#17384a';x.fillRect(0,surface-5,w,5);label(x,a>.62?'snow / cloud':a<.25?'ocean / forest':'mixed surface',20,surface+34,colors.muted,14);
    for(let i=0;i<5;i++){const px=w*.18+i*w*.14;arrow(x,px,25,px,surface-18,colors.yellow)}
    const refl=Math.max(28,reflected*1.1);for(let i=0;i<Math.max(1,Math.round(a*5));i++){const px=w*.18+i*w*.14;arrow(x,px,surface-18,px-36,surface-refl,colors.cyan)}
    for(let i=0;i<Math.max(1,Math.round((1-a)*5));i++){const px=w*.18+i*w*.14;arrow(x,px,surface-10,px,surface+38,colors.orange)}
    label(x,tr('reflected')+': '+reflected,22,24,colors.cyan,14);label(x,tr('absorbed')+': '+absorbed,22,h-18,colors.orange,14);
    $('albedoVal').textContent=Math.round(a*100)+'%';$('incomingVal').textContent=incoming;$('reflectedVal').textContent=reflected;$('absorbedVal').textContent=absorbed;$('albedoReadout').textContent=tr('albedo')+' '+Math.round(a*100)+'% · '+(tr('absorbed')||'被吸收')+' = 100 × (1 − '+a.toFixed(2)+') = '+absorbed+'.';
  }
  function drawGreenhouse(){
    const [x,w,h]=ctxFor(canvases.greenhouse);const g=+$('greenhouse').value/100;const a=+$('albedo').value/100;const absorbed=1-a;const eff=255*Math.pow(absorbed/.7,.25);const surface=eff+33*g/.55;const escape=100-60*g;
    x.fillStyle='#07131d';x.fillRect(0,0,w,h);const atm=h*.25;const ground=h*.75;x.fillStyle=`rgba(91,186,206,${.12+.3*g})`;x.fillRect(0,0,w,atm);x.fillStyle='#314c4d';x.fillRect(0,ground,w,h-ground);x.fillStyle='#6e977b';x.fillRect(0,ground-6,w,6);label(x,tr('topOfAtmosphere'),20,24,colors.muted,13);label(x,tr('greenhouse')+' '+Math.round(g*100)+'%',w*.68,24,colors.cyan,13);
    for(let i=0;i<5;i++){const px=w*.15+i*w*.14;arrow(x,px,34,px,ground-24,colors.yellow)}
    for(let i=0;i<7;i++){const px=w*.15+i*w*.1;const top=28+(i%3)*24;const endX=px+(i%2?34:-30);if(i<Math.round(escape/100*7))arrow(x,px,ground-15,endX,top,colors.red);else{arrow(x,px,ground-15,endX,atm+45,colors.red);arrow(x,endX,atm+45,endX+(i%2?30:-30),ground-48,colors.red)}}
    label(x,tr('effectiveTemp')+': '+Math.round(eff)+' K',20,ground+36,colors.yellow,14);label(x,tr('surfaceTemp')+': '+Math.round(surface)+' K',w*.55,ground+36,colors.orange,14);
    $('greenhouseVal').textContent=Math.round(g*100)+'%';$('effectiveTempVal').textContent=Math.round(eff)+' K';$('surfaceTempVal').textContent=Math.round(surface)+' K';$('escapeVal').textContent=Math.round(escape)+'%';$('greenhouseReadout').textContent=tr('greenhouse')+' '+Math.round(g*100)+'% · '+tr('escape')+' '+Math.round(escape)+'% · '+(tr('surfaceTemp')||'模型地表温度')+' '+Math.round(surface)+' K.';
  }
  const cards=[['☀️','latitude','Latitude / 纬度','Changing the ray angle changes energy per square metre.','改变光线角度，就改变每平方米获得的能量。'],['🧊','albedo','Albedo / 反照率','Bright surfaces reflect more of the incoming beam.','明亮表面把更多入射光反射回去。'],['🌫️','greenhouse','Greenhouse / 温室','Absorbing infrared changes how high the surface must warm.','吸收红外会改变地表必须升到多高才能平衡。']];
  function renderCards(){const box=$('evidence');box.innerHTML='';cards.slice().sort(()=>Math.random()-.5).forEach(c=>{const b=document.createElement('button');b.dataset.kind=c[1];b.innerHTML='<strong>'+c[0]+' '+c[2]+'</strong><span>'+((document.documentElement.lang==='en')?c[3]:c[4])+'</span>';b.onclick=()=>b.classList.toggle('selected');box.append(b)})}
  function drawAll(){drawLatitude();drawAlbedo();drawGreenhouse()}
  ['latitude','albedo','greenhouse'].forEach(id=>$(id).addEventListener('input',drawAll));
  $('shuffle').onclick=renderCards;
  $('check').onclick=()=>{const got=[...document.querySelectorAll('#evidence button.selected')].map(b=>b.dataset.kind);const ok=got.length===3&&cards.every(c=>got.includes(c[1]));$('checkReadout').textContent=ok?'✓ '+(document.documentElement.lang==='en'?'All three controls are connected: input → reflection → escape.':'三张证据都选中：入射 → 反射 → 出射，能量链闭合。'):(document.documentElement.lang==='en'?'Select the three cards, then check again.':'请选中三张证据卡，再检查一次。')};
  document.querySelectorAll('[data-scroll]').forEach(b=>b.onclick=()=>document.querySelector(b.dataset.scroll)?.scrollIntoView({behavior:'smooth'}));
  window.addEventListener('resize',drawAll);window.addEventListener('langchange',()=>{renderCards();drawAll()});
  const nav=[...document.querySelectorAll('.step-nav a')],steps=[...document.querySelectorAll('.step')];const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){nav.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-25% 0px -65%'});steps.forEach(s=>io.observe(s));renderCards();drawAll();
})();
