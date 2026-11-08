'use strict';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const round=(v,n=2)=>Number(v.toFixed(n));

// Qd = intercept - demandSlope * P, Qs = supplyIntercept + supplySlope * P.
function marketState(o={}){
  const demandIntercept=clamp(Number(o.demandIntercept??80),30,110);
  const demandSlope=clamp(Number(o.demandSlope??.6),.2,1.8);
  const supplyIntercept=clamp(Number(o.supplyIntercept??8),0,40);
  const supplySlope=clamp(Number(o.supplySlope??.7),.2,1.8);
  const tax=clamp(Number(o.tax??0),0,30);
  const subsidy=clamp(Number(o.subsidy??0),0,30);
  const wedge=tax-subsidy;
  // Solve for the seller's received price first. The buyer pays exactly
  // `wedge` more (or less), so both curves still meet at the same Q.
  const sellerPrice=(demandIntercept-supplyIntercept-demandSlope*wedge)/(demandSlope+supplySlope);
  const buyerPrice=sellerPrice+wedge;
  const p=sellerPrice;
  const q=clamp(supplyIntercept+supplySlope*sellerPrice,0,200);
  const consumerSurplus=.5*q*Math.max(0,(demandIntercept/demandSlope)-buyerPrice);
  const producerSurplus=.5*q*Math.max(0,sellerPrice+ supplyIntercept/supplySlope);
  const taxRevenue=tax*q;
  const subsidyCost=subsidy*q;
  return {demandIntercept,demandSlope,supplyIntercept,supplySlope,tax,subsidy,wedge,p:Math.max(0,p),q,buyerPrice,sellerPrice,consumerSurplus,producerSurplus,taxRevenue,subsidyCost};
}

function baseline(o={}){return marketState({...o,tax:0,subsidy:0});}
function elasticityAt(s){
  const p=Math.max(s.p,.001),q=Math.max(s.q,.001);
  return {demand:-s.demandSlope*p/q,supply:s.supplySlope*p/q};
}
function deadweightLoss(base,policy){
  const totalBase=base.consumerSurplus+base.producerSurplus;
  const transfer=policy.taxRevenue-policy.subsidyCost;
  const totalPolicy=policy.consumerSurplus+policy.producerSurplus+transfer;
  return Math.max(0,totalBase-totalPolicy);
}
function surplusAt(s,buyerWedge=0,sellerWedge=0){
  const buyerPrice=s.p+buyerWedge;
  const sellerPrice=s.p+sellerWedge;
  const cs=.5*s.q*Math.max(0,s.demandIntercept/s.demandSlope-buyerPrice);
  const ps=.5*s.q*Math.max(0,sellerPrice+s.supplyIntercept/s.supplySlope);
  return {consumerSurplus:cs,producerSurplus:ps,totalSurplus:cs+ps};
}
const API={clamp,marketState,baseline,elasticityAt,deadweightLoss,surplusAt};
if(typeof window!=='undefined')window.SUPPLY_DEMAND=API;
if(typeof module!=='undefined')module.exports=API;

const STR={
  zh:{
    pageTitle:'供需与市场均衡 · 价格如何找到交点',tagline:'把价格、税、补贴、弹性与剩余放进同一张图：每次拖动都让因果链重新计算。',canvasLabel:'供需曲线与市场均衡交互图',foot:'供需与市场均衡 · 看见价格如何传递信息',nav0:'0 交点',nav1:'1 政策楔子',nav2:'2 弹性',nav3:'3 剩余',nav4:'4 误解检查',
    s0k:'第 0 步 · 市场协调',s0t:'均衡价格是两边都愿意交易的交点',s0e:'需求曲线表示买方在每个价格愿意买多少，供给曲线表示卖方愿意卖多少。两条曲线相交处，<strong>Qd = Qs</strong>；价格就把分散的计划压缩成一个可观察的信号。',s0hint:'先看交点：沿着一条水平价格线读出“想买”和“想卖”，差额就是短缺或过剩。',
    s1k:'第 1 步 · 税与补贴',s1t:'政策在买方与卖方之间插入一个价格楔子',s1e:'税让买方付得更多、卖方收到更少；补贴则相反。拖动两把旋钮，观察交易量、两端价格、政府账本和<strong>无谓损失</strong>一起变化。',taxLab:'单位税 / per-unit tax',subsidyLab:'单位补贴 / per-unit subsidy',tax:'税',subsidy:'补贴',price:'市场价格',buyerPrice:'买方支付',sellerPrice:'卖方收到',quantity:'交易量',dwl:'无谓损失',policyFeedbackTax:'税把交易量压低：少掉的交易不再同时给买方和卖方带来收益。',policyFeedbackSubsidy:'补贴把交易量推高，但公共支出会抵消一部分私人剩余。',policyFeedbackNone:'没有楔子时，买方支付与卖方收到的是同一个均衡价格。',
    s2k:'第 2 步 · 弹性',s2t:'同样的价格变化，数量反应可以很不一样',s2e:'弹性是“百分比数量变化 ÷ 百分比价格变化”。拖动斜率和截距，观察当前交点的<strong>点弹性</strong>：斜率本身不是弹性，价格与数量的位置也会参与计算。',elasticLab:'需求斜率 × 100',demandLab:'需求截距',elasticity:'需求点弹性',taxShare:'买方承担比例',elasticFeedbackElastic:'当前交点的点弹性较高；买方更容易通过减少购买来回应价格。',elasticFeedbackInelastic:'当前交点的点弹性较低；价格楔子更容易留在需求较不敏感的一侧。',
    s3k:'第 3 步 · 谁得到剩余',s3t:'价格之下与价格之上的面积都是可计算的收益',s3e:'消费者剩余是“愿付最高价 − 实际价格”的面积；生产者剩余是“实际价格 − 最低愿售价”的面积。调节两端的议价空间，看看总剩余何时最大。',buyerLab:'买方最高愿付价 × 100',sellerLab:'卖方成本偏移 × 100',consumer:'消费者剩余',producer:'生产者剩余',total:'总剩余',surplusFeedbackHigh:'两边的剩余都在增加；交易仍覆盖了双方都愿意做的部分。',surplusFeedbackLow:'有一侧的剩余被压缩；先问是谁的保留价格更接近市场价格。',
    s4k:'第 4 步 · 误解检查',s4t:'把“曲线上移动”与“曲线移动”分开',s4e:'价格变化通常让你沿着同一条曲线移动；收入、偏好、技术或政策等外部因素才会让整条曲线移动。做完判断，再回到交点和剩余核对你的因果链。',quizPrompt:'需求曲线不变时，给商品加单位税，最直接的图像变化是什么？',quizA:'沿需求曲线移动，买方支付价格上升。',quizB:'需求曲线整体向左移动。',quizC:'在买卖双方之间形成价格楔子，交易量通常下降。',quizGood:'答对了：税先形成楔子，再通过新交点改变数量；它不是偏好变化造成的需求曲线移动。',quizAgain:'再想一步：税同时改变买方支付与卖方收到的价格，哪一个图形结构能同时表达两端？',modelTitle:'模型假设',modelBody:'这里用线性需求与供给、固定外部条件和竞争性市场做教学模型。真实市场还会受到收入分布、预期、市场势力、配给和时间尺度影响。',scope:'读图顺序：先找交点 → 再读两端价格 → 再计算数量与面积。',
    qd:'需求量 Qd',qs:'供给量 Qs',shortage:'短缺',surplusWord:'过剩',noWedge:'无楔子',
  },
  en:{
    pageTitle:'Supply & Demand · How a price finds the crossing',tagline:'Put price, taxes, subsidies, elasticity, and surplus on one canvas: every drag recomputes the causal chain.',canvasLabel:'Interactive supply and demand market equilibrium graph',foot:'Supply & Demand · Watch price carry information',nav0:'0 Crossing',nav1:'1 Policy wedge',nav2:'2 Elasticity',nav3:'3 Surplus',nav4:'4 Misconception check',
    s0k:'STEP 0 · MARKET COORDINATION',s0t:'The equilibrium price is where both sides plan to trade',s0e:'Demand records how much buyers want at each price; supply records how much sellers offer. Where they cross, <strong>Qd = Qs</strong>: price compresses distributed plans into one visible signal.',s0hint:'Read the crossing first: at a horizontal price line, the gap between “want to buy” and “want to sell” is shortage or surplus.',
    s1k:'STEP 1 · TAXES & SUBSIDIES',s1t:'Policy inserts a price wedge between buyers and sellers',s1e:'A tax makes buyers pay more and sellers receive less; a subsidy does the reverse. Drag both controls and watch quantity, both prices, the public ledger, and <strong>deadweight loss</strong> update together.',taxLab:'Per-unit tax',subsidyLab:'Per-unit subsidy',tax:'Tax',subsidy:'Subsidy',price:'Market price',buyerPrice:'Buyer pays',sellerPrice:'Seller receives',quantity:'Quantity',dwl:'Deadweight loss',policyFeedbackTax:'The tax lowers quantity: the missing trades no longer create gains for both sides.',policyFeedbackSubsidy:'The subsidy raises quantity, but public spending offsets part of the private surplus.',policyFeedbackNone:'With no wedge, buyers pay and sellers receive the same equilibrium price.',
    s2k:'STEP 2 · ELASTICITY',s2t:'The same price change can trigger very different quantity responses',s2e:'Elasticity is percentage quantity change divided by percentage price change. Drag slope and intercept to inspect <strong>point elasticity</strong> at the crossing: slope alone is not elasticity; price and quantity also matter.',elasticLab:'Demand slope × 100',demandLab:'Demand intercept',elasticity:'Point demand elasticity',taxShare:'Buyer share of wedge',elasticFeedbackElastic:'Point elasticity is high at this crossing; buyers can more easily respond by buying less.',elasticFeedbackInelastic:'Point elasticity is low at this crossing; the wedge stays more on the less responsive side.',
    s3k:'STEP 3 · WHO GETS THE SURPLUS',s3t:'Areas above and below price are measurable gains',s3e:'Consumer surplus is the area between willingness to pay and actual price; producer surplus is the area between actual price and minimum willingness to sell. Adjust both reservation-price spaces and see when total surplus grows.',buyerLab:'Buyer max willingness × 100',sellerLab:'Seller cost offset × 100',consumer:'Consumer surplus',producer:'Producer surplus',total:'Total surplus',surplusFeedbackHigh:'Both sides have room to gain; trades still cover mutually beneficial units.',surplusFeedbackLow:'One side is squeezed; ask whose reservation price is closest to the market price.',
    s4k:'STEP 4 · MISCONCEPTION CHECK',s4t:'Separate movement along a curve from a curve shift',s4e:'A price change usually moves you along the same curve; income, preferences, technology, or policy can shift the whole curve. Make the call, then return to the crossing and surplus to audit the causal chain.',quizPrompt:'With demand fixed, what is the most direct graph change when a per-unit tax is added?',quizA:'Move along demand; the buyer price rises.',quizB:'Shift the demand curve left.',quizC:'Create a price wedge between sides; quantity usually falls.',quizGood:'Correct: the tax creates a wedge, then the new crossing changes quantity; it is not a preference-driven demand shift.',quizAgain:'Try one more step: tax changes both prices, so which graph structure captures both sides at once?',modelTitle:'Model assumptions',modelBody:'This teaching model uses linear curves, fixed outside conditions, and a competitive market. Real markets also depend on income distribution, expectations, market power, rationing, and time scale.',scope:'Reading order: find the crossing → read both prices → then calculate quantity and areas.',
    qd:'Demand Qd',qs:'Supply Qs',shortage:'Shortage',surplusWord:'Surplus',noWedge:'No wedge',
  }
};

let lang='zh';
const $=id=>document.getElementById(id);
function t(k,p={}){let s=(STR[lang]||STR.zh)[k]||k;for(const [key,val] of Object.entries(p))s=s.split('{'+key+'}').join(String(val));return s;}
function fmt(v,n=1){return Number(v).toFixed(n);}
function applyLang(next){lang=next;document.documentElement.lang=next==='zh'?'zh-CN':'en';document.title=t('pageTitle');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));document.querySelectorAll('[data-i18n-html]').forEach(el=>el.innerHTML=t(el.dataset.i18nHtml));document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAria)));document.querySelectorAll('#langToggle button').forEach(b=>{b.classList.toggle('active',b.dataset.lang===next);b.setAttribute('aria-pressed',String(b.dataset.lang===next));});renderAll();}

function chart(c,state,opts={}){
  const ctx=c.getContext('2d'),cssW=c.clientWidth||840,dpr=window.devicePixelRatio||1;const W=900,H=390;c.width=cssW*dpr;c.height=cssW*H/W*dpr;ctx.setTransform(dpr*cssW/W,0,0,dpr*cssW/W,0,0);ctx.fillStyle='#0d1621';ctx.fillRect(0,0,W,H);
  const pad={l:62,r:22,t:24,b:48},pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;const x=q=>pad.l+q/100*pw;const y=p=>pad.t+(110-p)/110*ph;
  ctx.strokeStyle='#2c3b50';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
  ctx.font='12px system-ui';ctx.fillStyle='#9aaabd';ctx.fillText(lang==='zh'?'价格 P':'Price P',12,pad.t+8);ctx.fillText(lang==='zh'?'数量 Q':'Quantity Q',W-78,H-14);
  for(let p=0;p<=100;p+=20){ctx.strokeStyle='rgba(44,59,80,.35)';ctx.beginPath();ctx.moveTo(pad.l,y(p));ctx.lineTo(W-pad.r,y(p));ctx.stroke();ctx.fillStyle='#708197';ctx.fillText(String(p),25,y(p)+4);}
  const plotLine=(fn,color,dash=[])=>{ctx.strokeStyle=color;ctx.lineWidth=3;ctx.setLineDash(dash);ctx.beginPath();for(let q=0;q<=100;q+=1){const px=x(q),py=y(clamp(fn(q),0,110));if(q===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.stroke();ctx.setLineDash([]);};
  const d=q=>(state.demandIntercept-q)/state.demandSlope;const s=q=>(q-state.supplyIntercept)/state.supplySlope;
  if(opts.fillSurplus){ctx.fillStyle='rgba(103,215,249,.18)';ctx.beginPath();ctx.moveTo(x(0),y(state.p));for(let q=0;q<=state.q;q++){ctx.lineTo(x(q),y(d(q)));}ctx.lineTo(x(state.q),y(state.p));ctx.closePath();ctx.fill();ctx.fillStyle='rgba(126,226,168,.16)';ctx.beginPath();ctx.moveTo(x(0),y(state.p));for(let q=0;q<=state.q;q++){ctx.lineTo(x(q),y(s(q)));}ctx.lineTo(x(state.q),y(state.p));ctx.closePath();ctx.fill();}
  plotLine(d,'#67d7f9');plotLine(s,'#ffb454');
  const eqQ=state.q,eqP=state.p;ctx.strokeStyle='#c3a4ff';ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(x(eqQ),y(0));ctx.lineTo(x(eqQ),y(eqP));ctx.moveTo(pad.l,y(eqP));ctx.lineTo(x(eqQ),y(eqP));ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#c3a4ff';ctx.beginPath();ctx.arc(x(eqQ),y(eqP),6,0,Math.PI*2);ctx.fill();
  if(state.tax||state.subsidy){ctx.strokeStyle='#ff7a93';ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(pad.l,y(state.buyerPrice));ctx.lineTo(x(eqQ),y(state.buyerPrice));ctx.moveTo(pad.l,y(state.sellerPrice));ctx.lineTo(x(eqQ),y(state.sellerPrice));ctx.stroke();ctx.setLineDash([]);}
  ctx.font='bold 13px system-ui';ctx.fillStyle='#67d7f9';ctx.fillText(lang==='zh'?'需求':'Demand',x(72),y(d(72))-8);ctx.fillStyle='#ffb454';ctx.fillText(lang==='zh'?'供给':'Supply',x(72),y(s(72))+18);ctx.fillStyle='#c3a4ff';ctx.fillText(`P=${fmt(eqP)} · Q=${fmt(eqQ)}`,x(eqQ)+9,y(eqP)-8);
  if(state.tax||state.subsidy){ctx.fillStyle='#ff7a93';ctx.fillText(`${lang==='zh'?'买方':'buyer'} ${fmt(state.buyerPrice)} / ${lang==='zh'?'卖方':'seller'} ${fmt(state.sellerPrice)}`,x(Math.min(eqQ+5,65)),y(state.buyerPrice)-10);}
}

function metric(label,value){return `<div class="metric"><span>${label}</span><b>${value}</b></div>`;}
function renderBase(){const s=baseline();chart($('market-canvas'),s);$('base-readout').innerHTML=[metric(t('price'),fmt(s.p)),metric(t('quantity'),fmt(s.q)),metric(t('qd'),fmt(s.q)),metric(t('qs'),fmt(s.q))].join('');}
function renderPolicy(){const tax=+$('tax').value,subsidy=+$('subsidy').value,s=marketState({tax,subsidy});chart($('policy-canvas'),s);$('tax-val').textContent=fmt(tax);$('subsidy-val').textContent=fmt(subsidy);$('policy-readout').innerHTML=[metric(t('buyerPrice'),fmt(s.buyerPrice)),metric(t('sellerPrice'),fmt(s.sellerPrice)),metric(t('quantity'),fmt(s.q)),metric(t('dwl'),fmt(deadweightLoss(baseline(),s)))].join('');const msg=tax>subsidy?t('policyFeedbackTax'):subsidy>tax?t('policyFeedbackSubsidy'):t('policyFeedbackNone');$('policy-feedback').textContent=msg;}
function renderElastic(){const slope=+$('elastic').value/100,intercept=+$('demand').value,s=marketState({demandSlope:slope,demandIntercept:intercept,tax:12});chart($('elasticity-canvas'),s);const e=elasticityAt(s),share=clamp((s.buyerPrice-s.p)/(s.buyerPrice-s.sellerPrice||1),0,1);$('elastic-val').textContent=fmt(slope*100,0);$('demand-val').textContent=fmt(intercept,0);$('elastic-readout').innerHTML=[metric(t('elasticity'),fmt(Math.abs(e.demand),2)),metric(t('taxShare'),fmt(share*100,0)+'%'),metric(t('quantity'),fmt(s.q)),metric(t('price'),fmt(s.p))].join('');$('elastic-feedback').textContent=Math.abs(e.demand)>1?t('elasticFeedbackElastic'):t('elasticFeedbackInelastic');}
function renderSurplus(){const buyer=+$('buyer').value,seller=+$('seller').value,s=marketState({demandIntercept:buyer,supplyIntercept:seller});chart($('surplus-canvas'),s,{fillSurplus:true});$('buyer-val').textContent=fmt(buyer,0);$('seller-val').textContent=fmt(seller,0);const ss=surplusAt(s);$('surplus-readout').innerHTML=[metric(t('consumer'),fmt(ss.consumerSurplus)),metric(t('producer'),fmt(ss.producerSurplus)),metric(t('total'),fmt(ss.totalSurplus)),metric(t('quantity'),fmt(s.q))].join('');$('surplus-feedback').textContent=ss.consumerSurplus>20&&ss.producerSurplus>20?t('surplusFeedbackHigh'):t('surplusFeedbackLow');}
function renderAll(){renderBase();renderPolicy();renderElastic();renderSurplus();}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{const saved=localStorage.getItem('knowledge-lang');if(saved==='zh'||saved==='en')lang=saved;document.querySelectorAll('#langToggle button').forEach(b=>b.addEventListener('click',()=>{localStorage.setItem('knowledge-lang',b.dataset.lang);applyLang(b.dataset.lang);}));['tax','subsidy','elastic','demand','buyer','seller'].forEach(id=>$(id).addEventListener('input',renderAll));document.querySelectorAll('.quiz-options button').forEach(b=>b.addEventListener('click',()=>{const good=b.dataset.answer==='tax';$('quiz-feedback').textContent=good?t('quizGood'):t('quizAgain');$('quiz-feedback').className='feedback '+(good?'good':'warn');}));applyLang(lang);window.addEventListener('resize',renderAll);});
