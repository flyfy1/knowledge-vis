'use strict';
(function (root) {
  const presets = [
    {words:['ab','cb'], stream:'abxcb'},
    {words:['cd','f','kl'], stream:'abcdefghijkl'},
    {words:['ab'], stream:'b'},
    {words:['a','ba'], stream:'ba'},
    {words:['aa'], stream:'aaaa'},
    {words:['abc'], stream:'zzabcx'},
    {words:['ab','ab'], stream:'abab'},
    {words:['cab'], stream:'cab'}
  ];
  function build(words) {
    const nodes=[{path:'',terminal:false,children:{}}];
    for(const word of words){
      let id=0;
      for(const ch of [...word].reverse()){
        if(!(ch in nodes[id].children)){
          const next=nodes.length;
          nodes[id].children[ch]=next;
          nodes.push({path:nodes[id].path+ch,terminal:false,children:{}});
        }
        id=nodes[id].children[ch];
      }
      nodes[id].terminal=true;
    }
    return nodes;
  }
  function trace({words,stream}) {
    const nodes=build(words),limit=Math.max(...words.map(w=>w.length));
    const frames=[];
    let buffer='',history=[],received='',query=0;
    function save(kind,extra={}){
      frames.push(JSON.parse(JSON.stringify({kind,buffer,received,query,history,node:0,path:'',tested:'',result:null,...extra})));
    }
    save('initial');
    for(const letter of stream){
      query++;received+=letter;buffer=(buffer+letter).slice(-limit);
      save('append',{letter});
      let node=0,path='';
      for(let i=buffer.length-1;i>=0;i--){
        const ch=buffer[i],from=node;
        if(!(ch in nodes[node].children)){
          history.push({query,letter,prefix:received,result:false,match:''});
          save('missing',{node,path,tested:path+ch,ch,from,result:false});break;
        }
        node=nodes[node].children[ch];path+=ch;
        if(nodes[node].terminal){
          const match=[...path].reverse().join('');
          history.push({query,letter,prefix:received,result:true,match});
          save('terminal',{node,path,tested:path,ch,from,result:true,match});break;
        }
        if(i===0){
          history.push({query,letter,prefix:received,result:false,match:''});
          save('exhausted',{node,path,tested:path,ch,from,result:false});
        }else save('edge',{node,path,tested:path,ch,from});
      }
    }
    return {nodes,limit,frames};
  }
  const api={presets,build,trace};
  if(typeof module!=='undefined')module.exports=api;
  else root.StreamCore=api;
})(typeof window!=='undefined'?window:globalThis);
