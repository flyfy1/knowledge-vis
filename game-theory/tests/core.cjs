'use strict';const assert=require('node:assert/strict');const g=require('../app.js');
const pd=g.GAMES.pd.cells;assert.deepEqual(g.bestResponses(pd,0),[[1],[1]]);assert.equal(g.dominantStrategy(pd,0),1);assert.equal(g.dominantStrategy(pd,1),1);assert.deepEqual(g.nashEquilibria(pd),[[1,1]]);
const battle=g.GAMES.battle.cells;assert.deepEqual(g.nashEquilibria(battle),[[0,0],[1,1]]);
const matching=g.GAMES.matching.cells;assert.deepEqual(g.nashEquilibria(matching),[]);const mix=g.mixedEquilibrium(matching);assert.ok(Math.abs(mix.p-.5)<1e-9&&Math.abs(mix.q-.5)<1e-9);console.log('game-theory core: ok');
