'use strict';
const assert=require('node:assert/strict');
const api=require('../app.js');

const base=api.bufferState({pKa:4.8,total:.1,ratio:1});
const ten=api.bufferState({pKa:4.8,total:.1,ratio:10});
assert.equal(base.pH,4.8);
assert(Math.abs(ten.pH-5.8)<1e-12,'tenfold ratio should add one pH unit');
assert.equal(api.bufferState({pKa:4.8,total:.01,ratio:1}).pH,base.pH,'dilution keeps pH when ratio is fixed');

const acid=api.bufferState({pKa:4.8,total:.1,ratio:1,acid:.01});
const basePush=api.bufferState({pKa:4.8,total:.1,ratio:1,base:.01});
assert(acid.pH<base.pH&&basePush.pH>base.pH,'opposite pushes move pH in opposite directions');
assert(acid.neutralizedAcid>.009&&acid.excessAcid===0,'buffer consumes a small acid dose');

const dilute=api.capacityResponse(.02,.01),concentrated=api.capacityResponse(.2,.01);
assert(Math.abs(concentrated.deltaPH)<Math.abs(dilute.deltaPH),'more inventory means less pH movement');
const samples=api.titrationSamples({total:.1,steps:9});
assert.equal(samples.length,9);
assert(samples[0].buffer>samples[samples.length-1].buffer,'acid side has lower pH than base side');
assert(samples[0].water>samples[samples.length-1].water,'water curve is monotonic across the push');
console.log('buffer-capacity core ok');
