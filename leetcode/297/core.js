'use strict';
window.Tree297={
 presets:[['1,2,#,#,3,4,#,#,5,#,#','p0'],['8,#,#','p1'],['#','p2'],['1,2,#,#,#','p3'],['-1,0,#,#,2,#,#','p4']],
 trace(text){const tokens=text.split(',').map(s=>s.trim());const frames=[{cursor:0,consumed:[],nodes:[],event:'start'}];const nodes=[];let cursor=0;function walk(depth=0){if(cursor>=tokens.length)throw Error('missing token');const token=tokens[cursor++];if(token==='#'){frames.push({cursor,consumed:tokens.slice(0,cursor),nodes:nodes.slice(),event:'empty',token,depth});return null;}const node={value:token,left:null,right:null};nodes.push({value:token,depth});frames.push({cursor,consumed:tokens.slice(0,cursor),nodes:nodes.slice(),event:'node',token,depth});node.left=walk(depth+1);node.right=walk(depth+1);return node;}let root=null,valid=true,error='';try{root=walk();if(cursor!==tokens.length){valid=false;error='extra tokens';}}catch(e){valid=false;error=e.message;}return {tokens,frames,root,valid,error};}
};
