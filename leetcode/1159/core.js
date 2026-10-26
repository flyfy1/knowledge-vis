'use strict';
window.MarketLesson = (() => {
  const presets = [
    {key:'worked', users:[['1','Lenovo'],['2','Samsung'],['3','LG'],['4','HP']], orders:[['1','2019-08-01',4,2],['2','2019-08-02',2,3],['3','2019-08-03',3,3],['4','2019-08-04',1,2],['5','2019-08-04',1,4],['6','2019-08-05',2,4]], items:{1:'Samsung',2:'Lenovo',3:'LG',4:'HP'}},
    {key:'zero', users:[['7','Apple'],['8','LG']], orders:[['7','2020-01-01',1,7]], items:{1:'Samsung'}},
    {key:'many', users:[['9','Samsung']], orders:[['8','2020-01-01',1,9],['9','2020-01-03',2,9],['10','2020-01-04',3,9]], items:{1:'Apple',2:'Samsung',3:'LG'}}
  ];
  function frames(p){
    const by={}; p.orders.forEach(o=>(by[o[3]]??=[]).push(o)); Object.values(by).forEach(a=>a.sort((x,y)=>x[1].localeCompare(y[1])));
    const rows=[]; const ranked=[]; p.orders.slice().sort((a,b)=>a[1].localeCompare(b[1])).forEach(o=>{const n=(by[o[3]].indexOf(o)+1);ranked.push({...o,rank:n,brand:p.items[o[2]]});});
    rows.push({kind:'start',ranked:[],result:null}); ranked.forEach((r,i)=>rows.push({kind:'rank',ranked:ranked.slice(0,i+1),result:null}));
    const second={};ranked.forEach(r=>{if(r.rank===2) second[r[3]]=r;});
    rows.push({kind:'joined',ranked,second,result:p.users.map(u=>({id:u[0],value:second[u[0]]&&p.items[second[u[0]][2]]===u[1]?'yes':'no'}))});
    return rows;
  }
  return {presets,frames};
})();
