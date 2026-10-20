import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = id => document.getElementById(id);
const colors = {base:0x6ee7ff, space:0xffb454, height:0x7ee2a8};
const fmt = n => Number(n.toFixed(3)).toString();
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let quizAnswer = null, solved = false, raf = 0, lastTime = 0;
const scenes = [], dirty = new Set();
const V = (x,y,z) => new THREE.Vector3(x,y,z);

// X is length a, Z is base width b, and Y is height c. Units are shared.
function rebuild(s) {
  if(s.model) {
    s.scene.remove(s.model);
    s.model.traverse(o => {o.geometry?.dispose();if(o.material) o.material.dispose();});
  }
  const model = s.model = new THREE.Group();
  s.scene.add(model);
  const [a,b,c] = s.lengths;
  const point = (x,y,z) => V(x-a/2,y-c/2,z-b/2);
  const A=point(0,0,0), B=point(a,0,0), C=point(a,0,b), D=point(a,c,b);
  const box = new THREE.BoxGeometry(a,c,b);
  model.add(new THREE.Mesh(box,new THREE.MeshLambertMaterial({color:0x72a2c5,transparent:true,opacity:0.16,side:THREE.DoubleSide,depthWrite:false})));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box),new THREE.LineBasicMaterial({color:0x8aa1b8,transparent:true,opacity:0.72}));
  edges.renderOrder=1;model.add(edges);
  function triangle(points,color) {
    const g=new THREE.BufferGeometry().setFromPoints(points);
    g.setIndex([0,1,2]);g.computeVertexNormals();
    const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.09,side:THREE.DoubleSide,depthWrite:false}));
    mesh.renderOrder=2;model.add(mesh);
  }
  triangle([A,B,C],colors.base);triangle([A,C,D],colors.space);
  // Solid cylinders, drawn after translucent surfaces, retain depth within the triangle.
  function rod(p,q,color,radius=0.035) {
    const delta=q.clone().sub(p);
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,delta.length(),12),new THREE.MeshBasicMaterial({color}));
    mesh.position.copy(p).add(q).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(V(0,1,0),delta.normalize());
    mesh.renderOrder=3;model.add(mesh);
  }
  rod(A,B,0xb0bdcb,0.018);rod(B,C,0xb0bdcb,0.018);
  rod(A,C,colors.base,0.045);rod(C,D,colors.height,0.035);rod(A,D,colors.space,0.055);
  for(const [p,color] of [[A,colors.space],[C,colors.base],[D,colors.space]]) {
    const dot=new THREE.Mesh(new THREE.SphereGeometry(0.075,12,8),new THREE.MeshBasicMaterial({color}));
    dot.position.copy(p);dot.renderOrder=4;model.add(dot);
  }
  const m=Math.min(a,b,c)*0.16;
  function rightAngle(p,u,v,color) {
    const p1=p.clone().addScaledVector(u,m), p2=p1.clone().addScaledVector(v,m), p3=p.clone().addScaledVector(v,m);
    rod(p1,p2,color,0.018);rod(p2,p3,color,0.018);
  }
  rightAngle(B,V(-1,0,0),V(0,0,1),colors.base);
  rightAngle(C,V(-a,0,-b).normalize(),V(0,1,0),colors.height);
  const mid=(p,q)=>p.clone().add(q).multiplyScalar(0.5);
  const specs=[['a = '+fmt(a),mid(A,B),'#c3cfdd',0,18],['b = '+fmt(b),mid(B,C),'#c3cfdd',0,18],['c = '+fmt(c),mid(C,D),'#7ee2a8',-28,0],['e',mid(A,C),'#6ee7ff',0,-16],['d',mid(A,D),'#ffb454',14,-10]];
  s.labelsHost.replaceChildren();
  s.labels=specs.map(([text,point,color,dx,dy])=>{
    const el=document.createElement('span');el.className='scene-label';el.textContent=text;el.style.color=color;s.labelsHost.append(el);
    return {el,point,dx,dy};
  });
  schedule(s);
}
function render(s) {
  const start=performance.now(), w=s.canvas.clientWidth, h=s.canvas.clientHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  s.renderer.setPixelRatio(dpr);s.renderer.setSize(w,h,false);
  const aspect=w/h, radius=s.step===0?4.3:7.7;
  const halfH=radius/Math.min(1,aspect);
  s.camera.left=-halfH*aspect;s.camera.right=halfH*aspect;s.camera.top=halfH;s.camera.bottom=-halfH;s.camera.updateProjectionMatrix();
  s.renderer.render(s.scene,s.camera);
  for(const {el,point,dx,dy} of s.labels) {
    const q=point.clone().project(s.camera);
    const x=Math.max(28,Math.min(w-34,(q.x+1)*w/2+dx)), y=Math.max(16,Math.min(h-16,(1-q.y)*h/2+dy));
    el.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
  }
  s.frames++;s.lastDrawMs=performance.now()-start;
}
function animating(){return !document.hidden&&scenes.some(s=>s.visible&&s.auto);}
function schedule(s){if(s)dirty.add(s);if(!raf&&!document.hidden)raf=requestAnimationFrame(frame);}
function frame(time){
  raf=0;const dt=lastTime?Math.min((time-lastTime)/1000,0.05):0;lastTime=time;
  for(const s of scenes)if(s.auto&&s.visible){s.controls.update(dt);dirty.add(s);}
  for(const s of dirty)render(s);dirty.clear();
  if(animating()){if(!raf)raf=requestAnimationFrame(frame);}else lastTime=0;
}
function stop(s){s.auto=false;s.controls.autoRotate=false;updateStatus();schedule(s);}
function clearView(s){stop(s);s.camera.position.set(11,8,-12);s.camera.zoom=1;s.camera.lookAt(0,0,0);s.controls.target.set(0,0,0);s.controls.update();schedule(s);}
function updateStatus(){if(!scenes.length)return;$('s0-status').textContent=t(scenes[0].auto?'autoStatus':'stillStatus');$('s0-stop').disabled=!scenes[0].auto;}
function updateLedger(){
  const [a,b,c]=scenes[1].lengths, base2=a*a+b*b,sum=base2+c*c;
  ['a','b','c'].forEach((k,i)=>$(k+'-val').textContent=fmt(scenes[1].lengths[i]));
  const values={a:fmt(a),b:fmt(b),c:fmt(c),base2:fmt(base2),sum:fmt(sum),e:Math.sqrt(base2).toFixed(3),d:Math.sqrt(sum).toFixed(3)};
  $('book1').textContent=t('ledger1',values);$('book2').textContent=t('ledger2',values);
}
function renderQuizResult(){
  // Gated render: the summary formula, proof and conditions enter the DOM
  // only after a correct answer (same precedent as the derivative page).
  const host=$('quiz-result');
  if(!solved){host.hidden=true;host.replaceChildren();return;}
  const formula=document.createElement('p');formula.className='formula';formula.textContent='d = √(a² + b² + c²)';
  const proof=document.createElement('p');proof.textContent=t('quizProof');
  const cond=document.createElement('p');cond.textContent=t('condition');
  host.replaceChildren(formula,proof,cond);host.hidden=false;
}
function updateQuiz(){
  $('quiz-feedback').textContent=t(solved?'quizCorrect':quizAnswer===null?'quizIdle':'quizWrong');
  $('quiz-unlock').classList.toggle('solved',solved);$('quiz-lock').hidden=solved;renderQuizResult();
  document.querySelectorAll('[data-answer]').forEach(el=>{el.disabled=solved;el.setAttribute('aria-pressed',String(Number(el.dataset.answer)===quizAnswer));el.classList.toggle('active',Number(el.dataset.answer)===quizAnswer);});
}
for(const step of [0,1]) {
  const canvas=$(`s${step}-canvas`), scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-8,8,8,-8,0.1,100);camera.position.set(11,8,-12);camera.lookAt(0,0,0);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  scene.add(new THREE.HemisphereLight(0xcceaff,0x18202c,2));
  const sun=new THREE.DirectionalLight(0xffffff,2.5);sun.position.set(-4,9,-6);scene.add(sun);
  const controls=new OrbitControls(camera,canvas);
  controls.enablePan=false;controls.enableZoom=true;controls.minZoom=0.55;controls.maxZoom=2.75;controls.enableDamping=false;
  controls.autoRotate=step===0&&!motion.matches;controls.autoRotateSpeed=0.5;
  controls.minPolarAngle=0.12;controls.maxPolarAngle=Math.PI-0.12;
  // One-finger rotation; scrolling remains available everywhere outside the viewport.
  controls.touches.ONE=THREE.TOUCH.ROTATE;
  const s={step,canvas,scene,camera,renderer,controls,lengths:[2,3,6],auto:controls.autoRotate,visible:false,labelsHost:canvas.nextElementSibling,labels:[],frames:0,lastDrawMs:0};
  scenes.push(s);rebuild(s);
  controls.addEventListener('start',()=>stop(s));controls.addEventListener('change',()=>schedule(s));
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();stop(s);
    const spherical=new THREE.Spherical().setFromVector3(camera.position);
    spherical.theta+=event.key==='ArrowLeft'?-0.1:event.key==='ArrowRight'?0.1:0;
    spherical.phi=THREE.MathUtils.clamp(spherical.phi+(event.key==='ArrowUp'?-0.1:event.key==='ArrowDown'?0.1:0),0.12,Math.PI-0.12);
    camera.position.setFromSpherical(spherical);controls.update();schedule(s);
  });
  $(`s${step}-view`).onclick=()=>clearView(s);
}
$('s0-stop').onclick=()=>stop(scenes[0]);
for(const [i,key] of ['a','b','c'].entries())$('s1-'+key).addEventListener('input',event=>{scenes[1].lengths[i]=Number(event.target.value);rebuild(scenes[1]);updateLedger();});
document.querySelectorAll('[data-answer]').forEach(el=>el.onclick=()=>{if(solved)return;quizAnswer=Number(el.dataset.answer);solved=quizAnswer===3;updateQuiz();});
document.querySelectorAll('[data-lang]').forEach(el=>el.onclick=()=>applyLang(el.dataset.lang));
window.refreshLanguage=()=>{updateStatus();updateLedger();updateQuiz();scenes.forEach(schedule);};
const observer=new IntersectionObserver(entries=>{for(const e of entries){const s=scenes.find(s=>s.canvas===e.target);s.visible=e.isIntersecting;if(s.visible)schedule(s);}});
scenes.forEach(s=>observer.observe(s.canvas));
const resizer=new ResizeObserver(()=>scenes.forEach(schedule));scenes.forEach(s=>resizer.observe(s.canvas));
window.addEventListener('resize',()=>scenes.forEach(schedule));
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;lastTime=0;}else scenes.forEach(schedule);});
motion.addEventListener('change',()=>{if(motion.matches)stop(scenes[0]);});
function updateNav(){
  const sections=[...document.querySelectorAll('.step')];
  const current=sections.reduce((best,el)=>Math.abs(el.getBoundingClientRect().top-100)<Math.abs(best.getBoundingClientRect().top-100)?el:best);
  document.querySelectorAll('[data-nav]').forEach(el=>{const active=el.dataset.nav===current.dataset.step;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
}
window.addEventListener('scroll',updateNav,{passive:true});
applyLang(getLang());updateNav();
// Boot succeeded: dismiss the load-failure watchdog in index.html.
window.__SD_READY=true;if(window.__sdBootTimer){clearTimeout(window.__sdBootTimer);}
// Read-only acceptance evidence; mutations use the actual UI controls.
window.SPACE_DIAGONAL={get state(){return {revision:THREE.REVISION,solved,quizAnswer,rafPending:!!raf,scenes:scenes.map(s=>({step:s.step,lengths:[...s.lengths],camera:s.camera.position.toArray(),auto:s.auto,visible:s.visible,frames:s.frames,lastDrawMs:s.lastDrawMs,geometries:s.renderer.info.memory.geometries,triangles:s.renderer.info.render.triangles,dpr:s.renderer.getPixelRatio()}))};}};
