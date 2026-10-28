'use strict';
const assert=require('node:assert/strict');const api=require('../app.js');
const e0=api.equilibrium(.01,1,0);assert(Math.abs(e0.h-e0.a)<1e-12);assert(e0.ratio>0&&e0.ratio<1);
const strong=api.equilibrium(.1,1,0),weak=api.equilibrium(.001,1,0);assert(strong.ratio>weak.ratio);
const dilute=api.equilibrium(.01,.1,0);assert(dilute.ratio>e0.ratio);assert(dilute.h<e0.h);
const common=api.equilibrium(.01,1,.2);assert(common.ratio<e0.ratio);assert(common.pH>e0.pH);
let s=api.initialState({ka:.01,c:1,seed:4});for(let i=0;i<120;i++)s=api.advanceState(s);assert(s.elapsed>3.9);assert(s.eq.pH===e0.pH);console.log('acid-base core ok');
