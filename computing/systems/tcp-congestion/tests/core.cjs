const assert=require('assert');const n=require('../app.js');
assert.equal(n.packetCount(4,4),1024);assert(n.overhead(4,1)>n.overhead(4,5));assert.equal(n.transferMs(4,80,4),1080);assert.deepEqual(n.routeStats(1).hops,5);assert(n.congestion(10).loss>n.congestion(3).loss);assert(n.congestion(10).window<n.congestion(3).window);console.log('network-flow core ok');
