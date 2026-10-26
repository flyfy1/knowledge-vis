import * as THREE from 'three';
import {OrbitControls} from '../../day-night-rotation/vendor/three/addons/controls/OrbitControls.js';

export function createGalaxy({host,labels,model,positions,colors,lang,onSelect,onCamera,onFailure,onReset=()=>{},reduced=false}) {
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,matchMedia('(max-width:760px)').matches?1.25:1.7));
  renderer.setClearColor(0x080d19,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  const canvas=renderer.domElement;canvas.tabIndex=0;host.prepend(canvas);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,500);
  function defaultCamera(){return new THREE.Vector3(0,host.clientWidth/host.clientHeight<1?35:30,host.clientWidth/host.clientHeight<1?155:125);}
  camera.position.copy(defaultCamera());
  const controls=new OrbitControls(camera,canvas);controls.enableDamping=false;controls.enableZoom=false;controls.minDistance=20;controls.maxDistance=210;controls.maxPolarAngle=Math.PI-.12;controls.minPolarAngle=.12;
  const mobile=matchMedia('(pointer:coarse)').matches;let interactive=!mobile;controls.enabled=interactive;canvas.style.touchAction='pan-y';
  const abort=new AbortController(),signal=abort.signal;let disposed=false,raf=0,frames=0,visible=true,rotating=false,last=0,currentLang=lang,selected=null,path=[],neighbors=new Set(),activePointers=new Set(),down=null,gesture=false;
  const meshes=new Map(),labelMap=new Map(),groupLabels=new Map(),edgeObjects=[];
  scene.add(new THREE.AmbientLight(0xb8d4ff,2));
  const key=new THREE.DirectionalLight(0xffffff,3.5);key.position.set(-30,50,65);scene.add(key);
  const rim=new THREE.DirectionalLight(0x7196ff,2.5);rim.position.set(40,-30,-30);scene.add(rim);
  const sphere=new THREE.SphereGeometry(1.25,24,16);
  const glowCanvas=document.createElement('canvas');glowCanvas.width=64;glowCanvas.height=64;
  const ctx=glowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'#ffffffc0');gradient.addColorStop(.2,'#ffffff50');gradient.addColorStop(.5,'#ffffff15');gradient.addColorStop(1,'#ffffff00');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  const texture=new THREE.CanvasTexture(glowCanvas);
  for(const n of model.nodes){
    const color=colors[n.group]||'#b4d9ff';
    const mesh=new THREE.Mesh(sphere,new THREE.MeshStandardMaterial({color,roughness:.53,metalness:.23,emissive:color,emissiveIntensity:.14}));
    mesh.position.fromArray(positions.get(n.id));mesh.userData.id=n.id;scene.add(mesh);meshes.set(n.id,mesh);
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,color,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending}));halo.scale.set(8,8,1);mesh.add(halo);
    const label=document.createElement('div');label.className='planet-label';labels.append(label);labelMap.set(n.id,label);
  }
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.95,.035,6,64),new THREE.MeshBasicMaterial({color:0xd3f5ff,transparent:true,opacity:.85,depthTest:false}));scene.add(ring);
  for(const e of model.edges){
    const a=new THREE.Vector3().fromArray(positions.get(e.from)),b=new THREE.Vector3().fromArray(positions.get(e.to));
    const middle=a.clone().add(b).multiplyScalar(.5);middle.z+=Math.min(a.distanceTo(b)*.12,3);
    const geometry=new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(a,middle,b).getPoints(20));
    const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x6b89b1,transparent:true,opacity:.22,depthWrite:false}));scene.add(line);
    const trace=new THREE.Line(geometry,new THREE.LineDashedMaterial({color:0xffca84,transparent:true,opacity:1,dashSize:.65,gapSize:.38,depthTest:false}));trace.computeLineDistances();trace.visible=false;scene.add(trace);edgeObjects.push({e,line,trace});
  }
  const groupPositions=new Map();
  for(const group of [...new Set(model.nodes.map(n=>n.group))]){
    const members=model.nodes.filter(n=>n.group===group),center=new THREE.Vector3();members.forEach(n=>center.add(meshes.get(n.id).position));center.divideScalar(members.length);groupPositions.set(group,center);
    const label=document.createElement('div');label.className='group-label';labels.append(label);groupLabels.set(group,label);
  }
  // Decorative background stars: seeded, never knowledge nodes and never selectable.
  const stars=[];let seed=7043;const random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<(mobile?280:620);i++)stars.push((random()-.5)*340,(random()-.5)*240,-70-random()*130);
  const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));
  scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xb8d1ef,size:.25,transparent:true,opacity:.65,sizeAttenuation:true})));
  const raycaster=new THREE.Raycaster(),point=new THREE.Vector2(),projection=new THREE.Vector3();
  function request(){if(!disposed&&!raf&&visible&&!document.hidden)raf=requestAnimationFrame(draw);}
  function draw(time){
    raf=0;if(disposed||!visible||document.hidden)return;
    if(rotating&&!reduced){const dt=Math.min((time-last)||16,40);orbit(dt*.000055,0,false);}last=time;
    camera.updateMatrixWorld();
    ring.visible=!!selected;if(selected){ring.position.copy(meshes.get(selected).position);ring.quaternion.copy(camera.quaternion);}
    renderer.render(scene,camera);frames++;
    const width=host.clientWidth,height=host.clientHeight,occupied=[];
    const candidates=model.nodes.map(n=>({n,priority:n.id===selected?0:neighbors.has(n.id)?1:2})).sort((a,b)=>a.priority-b.priority||a.n.id.localeCompare(b.n.id));
    for(const {n,priority} of candidates){
      const label=labelMap.get(n.id);projection.copy(meshes.get(n.id).position).project(camera);
      const x=(projection.x*.5+.5)*width,y=(-projection.y*.5+.5)*height;
      const w=label.offsetWidth||160,h=label.offsetHeight||34;
      const box={x:x-w/2-5,y:y+12,w:w+10,h:h+6};
      const collision=occupied.some(r=>box.x<r.x+r.w&&box.x+box.w>r.x&&box.y<r.y+r.h&&box.y+box.h>r.y);
      const show=projection.z>-1&&projection.z<1&&x>55&&x<width-55&&y>35&&y<height-50&&!collision;
      label.hidden=!show;if(show){occupied.push(box);label.style.left=x+'px';label.style.top=y+'px';label.style.opacity=priority<2?'1':'.65';}
    }
    for(const [group,label] of groupLabels){projection.copy(groupPositions.get(group)).project(camera);const x=(projection.x*.5+.5)*width,y=(-projection.y*.5+.5)*height;
      const w=label.offsetWidth||150,box={x:x-w/2,y:y-45,w,h:18};
      const collision=occupied.some(r=>box.x<r.x+r.w&&box.x+box.w>r.x&&box.y<r.y+r.h&&box.y+box.h>r.y);
      label.hidden=collision||projection.z>1||x<60||x>width-60||y<85||y>height-25;if(!label.hidden)occupied.push(box);label.style.left=x+'px';label.style.top=y+'px';}
    if(rotating&&!reduced)request();
  }
  function resize(){if(disposed)return;const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();request();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(raf);raf=0;}else request();});intersection.observe(host);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else request();},{signal});
  controls.addEventListener('change',request);controls.addEventListener('end',()=>onCamera(snapshot()));
  function orbit(dx,dy,notify=true){const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);spherical.theta+=dx;spherical.phi=Math.max(.12,Math.min(Math.PI-.12,spherical.phi+dy));camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));controls.update();request();if(notify)onCamera(snapshot());}
  function zoom(factor){const offset=camera.position.clone().sub(controls.target);offset.setLength(Math.max(20,Math.min(210,offset.length()*factor)));camera.position.copy(controls.target).add(offset);controls.update();request();onCamera(snapshot());}
  canvas.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();zoom(e.deltaY>0?1.08:.92);}},{passive:false,signal});
  canvas.addEventListener('keydown',e=>{const keys={ArrowLeft:[.13,0],ArrowRight:[-.13,0],ArrowUp:[0,-.13],ArrowDown:[0,.13]};if(keys[e.key]){e.preventDefault();orbit(...keys[e.key]);}else if(['+','=','-','0'].includes(e.key)){e.preventDefault();if(e.key==='0')reset();else zoom(e.key==='-'?1.15:.85);}},{signal});
  canvas.addEventListener('pointerdown',e=>{activePointers.add(e.pointerId);if(activePointers.size===1){down={x:e.clientX,y:e.clientY};gesture=false;}else gesture=true;},{signal});
  canvas.addEventListener('pointercancel',e=>{activePointers.delete(e.pointerId);down=null;},{signal});
  canvas.addEventListener('pointerup',e=>{activePointers.delete(e.pointerId);if(!interactive||!down||gesture||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6||e.button!==0)return;const rect=canvas.getBoundingClientRect();point.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(point,camera);const hit=raycaster.intersectObjects([...meshes.values()],false)[0];if(hit)onSelect(hit.object.userData.id);down=null;},{signal});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();onFailure('context');},{signal});
  function snapshot(){return {position:camera.position.toArray(),target:controls.target.toArray()};}
  function restore(value){if(value&&[...value.position||[],...value.target||[]].length===6&&[...value.position,...value.target].every(Number.isFinite)){camera.position.fromArray(value.position);controls.target.fromArray(value.target);controls.update();request();}}
  function reset(){rotating=false;controls.target.set(0,0,0);camera.position.copy(defaultCamera());controls.update();request();onCamera(snapshot());onReset();}
  function focus(){if(!selected)return;const offset=camera.position.clone().sub(controls.target).normalize().multiplyScalar(mobile?75:65);controls.target.copy(meshes.get(selected).position);camera.position.copy(controls.target).add(offset);controls.update();request();onCamera(snapshot());}
  function setSelection(id,route=[]){selected=meshes.has(id)?id:null;path=route;neighbors=new Set(model.adjacency.get(id)||[]);const pathSet=new Set(path);
    for(const [key,mesh]of meshes){const lit=!selected||key===selected||neighbors.has(key)||pathSet.has(key);mesh.material.emissiveIntensity=key===selected?.5:lit?.2:.025;mesh.material.color.set(colors[model.nodes.find(n=>n.id===key).group]||'#b4d9ff').multiplyScalar(lit?1:.6);labelMap.get(key).classList.toggle('selected',key===selected);}
    for(const {e,line,trace} of edgeObjects){const related=e.from===id||e.to===id;line.material.opacity=related?.8:.14;line.material.color.set(related?0xaadfff:0x6b89b1);trace.visible=path.some((n,i)=>i>0&&((n===e.from&&path[i-1]===e.to)||(n===e.to&&path[i-1]===e.from)));}request();
  }
  function setLanguage(language,groups,canvasLabel){currentLang=language;canvas.setAttribute('aria-label',canvasLabel);for(const n of model.nodes)labelMap.get(n.id).textContent=n.title[currentLang];for(const g of groups)if(groupLabels.has(g.id))groupLabels.get(g.id).textContent=g.label[currentLang];request();}
  function setTouch(value){interactive=value;controls.enabled=value;controls.enableZoom=mobile&&value;canvas.style.touchAction=mobile&&value?'none':'pan-y';}
  function destroy(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);raf=0;abort.abort();resizeObserver.disconnect();intersection.disconnect();controls.dispose();const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());texture.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();labels.replaceChildren();}
  resize();
  return {setSelection,setLanguage,setTouch,focus,zoom,reset,restore,snapshot,destroy,rotate(value){rotating=!!value&&!reduced;request();},setReduced(value){reduced=value;if(value)rotating=false;request();},stats:()=>({frames,raf,disposed,rotating,visible,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,drawCalls:renderer.info.render.calls,dpr:renderer.getPixelRatio()}),project(id){const p=meshes.get(id)?.position.clone().project(camera);return p?{x:(p.x*.5+.5)*host.clientWidth,y:(-p.y*.5+.5)*host.clientHeight}:null;}};
}
