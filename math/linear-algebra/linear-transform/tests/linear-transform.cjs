#!/usr/bin/env node
const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const i18n=fs.readFileSync(path.join(root,'i18n.js'),'utf8');
function ok(c,m){if(!c)throw new Error(m);console.log('✓ '+m)}
ok(html.includes('id="grid-canvas"')&&html.includes('id="basis-canvas"'),'core canvases present');
for(const id of ['a','b','c','d','x-coord','y-coord','invert-btn','order-ab','order-ba'])ok(html.includes(`id="${id}"`),`control ${id} present`);
for(const k of ['s0t','s1t','s2t','s3t','s4t','quizA','finale'])ok(i18n.includes(`${k}:`),`translation key ${k} present`);
ok(app.includes('ad-bc')||app.includes('m.a*m.d-m.b*m.c'),'determinant formula present');
ok(app.includes('onLangRefresh')&&app.includes('renderAll'),'language refresh and render loop present');
console.log('linear-transform static checks passed');
