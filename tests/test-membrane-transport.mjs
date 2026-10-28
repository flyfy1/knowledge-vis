import {readFileSync} from 'node:fs';
const html=readFileSync('membrane-transport/index.html','utf8');
for(const token of ['Membrane transport','id="ci"','id="tonicity"','id="lang"','ATP pump']) if(!html.includes(token)) throw new Error(`missing ${token}`);
if(!html.includes('state.solute?Math.round(g*.6):0')) throw new Error('flux model missing');
console.log('membrane transport contract ok');
