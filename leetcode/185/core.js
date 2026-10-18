'use strict';
const SalaryLesson = (()=>{
const row=(id,name,salary,departmentId=1,department='R&D')=>({id,name,salary,departmentId,department});
const presets=[
 [row(1,'A',90),row(2,'B',90),row(3,'C',80),row(4,'D',70),row(5,'E',60)],
 [row(1,'A',90),row(2,'B',80),row(3,'C',70),row(4,'D',60),row(5,'E',20,2,'Sales'),row(6,'F',10,2,'Sales')],
 [row(1,'A',90,1,'Lab'),row(2,'B',80,1,'Lab'),row(3,'C',70,1,'Lab'),row(4,'D',60,1,'Lab'),row(5,'E',5,2,'Lab')],
 [row(1,'A',50),row(2,'B',50),row(3,'C',50),row(4,'D',50)],[],
 [row(1,'A',0),row(2,'B',-1),row(3,'C',-1),row(4,'D',-2),row(5,'E',-3)]
];
function trace(input){
 const rows=input.map(x=>({...x})).sort((a,b)=>a.departmentId-b.departmentId||b.salary-a.salary||a.id-b.id);
 const frames=[{ranks:[],event:null}];let ranks=[],rank=0;
 rows.forEach((r,i)=>{const p=rows[i-1],fresh=!p||p.departmentId!==r.departmentId,same=!fresh&&p.salary===r.salary,old=rank;
 rank=fresh?1:same?rank:rank+1;ranks.push(rank);
 frames.push({ranks:[...ranks],event:{kind:fresh?'newDept':same?'same':'lower',name:r.name,dept:r.departmentId,salary:r.salary,prev:p?.salary,old,rank}});
 });return {rows,frames};
}
return {presets,trace};
})();
if(typeof module!=='undefined')module.exports=SalaryLesson;
