'use strict';
const STR = {
  zh: {
    languageLabel: "语言切换",
    back: "← 知识索引",
    navLabel: "步骤导航",
    catBadge: "物理与电路",
    stageBadge: "初中",
    foot: "浮力与阿基米德 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页",
    docTitle: '浮力与阿基米德 · 排开的水有多重，浮力就有多大',
    pageTitle: '浮力与阿基米德',
    tagline: '把物体慢慢浸入水里，弹簧秤读数一路掉下去——掉的那部分恰好等于被它排开的水的重量。',
    nav0: '0 秤的读数掉了', nav1: '1 排开的水', nav2: '2 深度还是体积', nav3: '3 浮沉的力', nav4: '4 钢船为何浮', nav5: '5 收束',
    unitN: 'N', unitCm: 'cm', unitCm3: 'cm³', unitM3: 'm³', unitKg: 'kg', unitDens: 'kg/m³',
    lblFb: 'F浮', lblDrop: '读数减少', lblBucket: '桶里水重', lblTotal: '总质量', lblCap: '可排水质量',
    objAl: '铝块', objFe: '铁块', objSmall: '小块', objMid: '中块', objBig: '大块',
    liqWater: '水', liqSalt: '盐水', liqOil: '植物油',
    s0k: '第 0 步 · 秤的读数掉了',
    s0t: '把物体浸入水里，弹簧秤的读数为什么变小？',
    s0e: '这一步要回答：物体慢慢浸入水中，弹簧秤的读数会怎样变化？弹簧秤读的是向上拉住物体的力。物体浸入水里后，水会给它一个向上的托力，这个力叫<strong>浮力</strong>（单位牛，N）。选一个物体，拖「放下的深度」，看弹簧伸长和读数。',
    s0stage: '弹簧秤吊着方块：虚线是水面，弹簧越短说明读数越小',
    s0canvas: '弹簧秤吊着方块逐渐浸入水中，弹簧随读数缩短',
    s0obj: '物体', s0z: '放下的深度 z（从底面碰到水面算起）', s0reset: '拿出水面',
    s0ro: '重力 W = {w} N；浸入体积 {vs} cm³（共 {v} cm³）；浮力 F浮 = {fb} N；读数 = W − F浮 = {r} N。',
    s0result: '结论：浸得越多读数越小，浮力越大。条件：物体沉得下去（本页物体密度大于水）；水视为静止。',
    s1k: '第 1 步 · 排开的水',
    s1t: '浮力到底等于什么？',
    s1e: '这一步要回答：浮力的大小和被物体挤开的水有什么关系？水杯装满水，物体浸入时挤出的水流进量桶。<strong>排开的水</strong>就是被物体占去位置而溢出的那部分水。拖深度，比较「读数减少量」和「桶里水的重力」。',
    s1stage: '溢水杯与量桶：浸得越深，溢出的水越多；右侧两根柱子比较两个力',
    s1canvas: '溢水杯示意图：物体浸入后水溢到桶里，两根柱子比较读数减少量与溢出水重',
    s1obj: '物体', s1z: '放下的深度 z', s1reset: '拿出并倒空桶',
    s1ro: '读数减少 {d} N；桶里排开的水 {vs} cm³，重 {ww} N；两者相差 {diff} N（模拟称量误差约 ±1%）。',
    s1result: '结论：F浮 = G排 = ρ液·g·V排（阿基米德原理）。条件：物体浸入静止液体；V排是浸在液体里的那部分体积。',
    s2k: '第 2 步 · 深度还是体积',
    s2t: '浮力和浸入的深度有关吗？',
    s2e: '这一步要回答：物体越沉越深，浮力会一直变大吗？浮力只由 ρ液、g 和<strong>排开的体积</strong>决定。图中横轴是放下的深度，纵轴是浮力；物体还没全浸入时，越深排开的越多；全浸入后继续下沉，排开的体积不再变。选物体大小和液体，拖深度。',
    s2stage: '横轴：深度 z（cm）；纵轴：浮力 F浮（N）；三条线是三种大小的方块，亮线是当前选择',
    s2canvas: '浮力对深度的折线图：先上升，方块全部浸没后变成水平线',
    s2obj: '方块大小', s2liq: '液体', s2z: '放下的深度 z',
    s2ro: '边长 {s} cm 的方块在{liq}里：z = {z} cm 时 V排 = {vs} cm³，F浮 = {fb} N；{state}',
    s2part: '还没全浸入，再深一点浮力还会增加。',
    s2full: '已全浸入，再深浮力不变。',
    s2result: '结论：浮力随排开体积增大，全浸入后与深度无关；换密度更大的液体，平台按比例抬高。条件：不可压缩液体、方块不变形。',
    s3k: '第 3 步 · 浮沉的力',
    s3t: '松手后，物体浮起还是沉底，由哪两个力的比较决定？',
    s3e: '这一步要回答：松手后物体向上还是向下动，由重力 W（向下）和浮力 F浮（向上）谁大决定。物体全浸入时 F浮 = ρ液·g·V；若 W 更大就下沉，若 F浮 更大就上浮，直到浮在水面时 F浮 刚好等于 W。选液体，拖物体密度，按「松手」，看箭头。',
    s3stage: '水槽：红色向下箭头 = 重力 W，青色向上箭头 = 浮力 F浮，长度按同一比例尺',
    s3canvas: '水槽示意图：物体上下各画一个箭头，浮着时两箭头一样长',
    s3liq: '液体', s3rho: '物体密度 ρ物', s3drop: '松手', s3lift: '拿起来重放',
    s3ro: 'W = {w} N；全浸入时 F浮 最大 {fm} N；{res}',
    s3resFloat: '浮在水面，F浮 = W = {w} N，约 {p}% 浸入。',
    s3resSink: '沉到底，F浮 = {fm} N 小于 W，缸底托住 {n} N。',
    s3resNeutral: '悬浮，F浮 = W。',
    s3ready: '物体在液面上方，按「松手」。',
    s3result: '结论：ρ物 < ρ液 时浮（浮着时 F浮 = W），ρ物 > ρ液 时沉。条件：实心均匀物体，静止液体。',
    s4k: '第 4 步 · 钢船为何浮',
    s4t: '钢比水重很多，钢船为什么能浮？',
    s4e: '这一步要回答：把一块钢做成空心的船壳，为什么就能浮起来？关键是整体平均密度 = 总质量 ÷ 船壳围出的总体积。船壳体积越大排开的水越多。设钢板质量固定 800 kg，拖船壳体积和货物质量，看吃水线；装到浮力托不住时就沉。',
    s4stage: '船的侧视图：虚线是水面，船壳浸入水中的部分排开水；右侧读数是总质量与能排开的水质量',
    s4canvas: '船的侧视图：船壳体积越大吃水越浅，货物越多吃水越深，超载就沉没',
    s4v: '船壳围出的体积 V', s4c: '货物质量', s4reset: '卸货并复位',
    s4ro: '总质量 {m} kg；平均密度 {rho} kg/m³；船壳全浸入最多排开 {cap} kg 的水；{res}',
    s4resFloat: '浮着，吃水 {p}% 的船高，还能再装 {left} kg。',
    s4resSink: '超载，沉没（总质量超过最多能排开的水质量）。',
    s4result: '结论：只要总质量不超过船壳体积 × 水的密度，船就浮着。条件：本页船壳视为长方体、不进水、钢体积忽略；真实船要考虑稳性和海浪。',
    s5k: '第 5 步 · 收束', s5t: '把阿基米德原理说给别人听',
    s5e: '浸在液体里的物体受到向上的浮力，大小等于它排开的液体的重力。',
    f1t: '公式', f1b: 'F浮 = ρ液·g·V排；弹簧秤读数 = W − F浮。',
    f2t: '只看体积', f2b: '浮力由排开的体积和液体密度决定，全浸入后与深度无关（第 2 步）。',
    f3t: '浮沉条件', f3b: '比较 W 与 F浮，也就是比较平均密度与液体密度；空心让平均密度变小（第 3、4 步）。',
    modelT: '模型实话',
    model1: '本页 g = 9.8 N/kg，水 1000 kg/m³，盐水 1030，植物油 920；称量误差用确定性小抖动模拟 ±1%。',
    model2: '物体与液体视为静止；真实浮沉有振荡、水的阻力和表面张力。',
    model3: '船只是一个长方体壳；真实船的稳性、浪与重心位置不在本页模型内。',
    nextT: '继续看（站内）',
    l1: '压强 · 第 2 步：浮力其实来自上下表面压强差（p = ρgh）',
    l2: '密度 · 第 3 步：比较密度判浮沉（浮力页的另一个入口）',
    l3: '密度 · 第 4 步：排水法也是同一个「排开体积」'
  },
  en: {
    languageLabel: "Language",
    back: "← Knowledge Index",
    navLabel: "Step navigation",
    catBadge: "Physics & Circuits",
    stageBadge: "Junior High",
    foot: "Buoyancy & Archimedes · Built by Claude Sonnet via Mini Claude Code · static bilingual page",
    docTitle: 'Buoyancy & Archimedes · The Displaced Water’s Weight Is the Buoyant Force',
    pageTitle: 'Buoyancy & Archimedes',
    tagline: 'Lower an object into water and the spring scale reading keeps dropping — by exactly the weight of the water it pushes aside.',
    nav0: '0 Scale drops', nav1: '1 Displaced water', nav2: '2 Depth or volume', nav3: '3 Float or sink forces', nav4: '4 Why steel ships float', nav5: '5 Recap',
    unitN: 'N', unitCm: 'cm', unitCm3: 'cm³', unitM3: 'm³', unitKg: 'kg', unitDens: 'kg/m³',
    lblFb: 'F_b', lblDrop: 'Reading drop', lblBucket: 'Bucket water', lblTotal: 'Total', lblCap: 'Capacity',
    objAl: 'Aluminium block', objFe: 'Iron block', objSmall: 'Small block', objMid: 'Medium block', objBig: 'Large block',
    liqWater: 'Water', liqSalt: 'Salt water', liqOil: 'Cooking oil',
    s0k: 'Step 0 · The scale drops',
    s0t: 'Why does the spring scale read less once the object is in water?',
    s0e: 'This step asks: as an object sinks into water, how does the spring scale reading change? The scale reads the upward pull holding the object. Once in water, the water pushes up on it too; that upward push is the <strong>buoyant force</strong> (in newtons, N). Pick an object, drag how far it is lowered, and watch the spring and the reading.',
    s0stage: 'A spring scale holds a block: the dashed line is the water surface; a shorter spring means a smaller reading',
    s0canvas: 'A spring scale lowers a block into water; the spring shortens as the reading falls',
    s0obj: 'Object', s0z: 'Lowered depth z (from when the bottom touches the surface)', s0reset: 'Lift out of water',
    s0ro: 'Weight W = {w} N; submerged volume {vs} cm³ (of {v} cm³); buoyant force F_b = {fb} N; reading = W − F_b = {r} N.',
    s0result: 'Takeaway: the more submerged, the smaller the reading and the larger the buoyant force. Holds when the object sinks (here every object is denser than water) in still water.',
    s1k: 'Step 1 · Displaced water',
    s1t: 'What exactly is the buoyant force equal to?',
    s1e: 'This step asks: how is the buoyant force related to the water the object pushes aside? A cup is filled to the brim; as the object goes in, water spills into a bucket. The <strong>displaced water</strong> is the water pushed out of the object’s place. Drag the depth and compare “how much the reading fell” with “the weight of the water in the bucket”.',
    s1stage: 'Overflow cup and bucket: the deeper it goes, the more spills; the two bars on the right compare two forces',
    s1canvas: 'Overflow cup diagram: water spills into a bucket; two bars compare the reading drop with the spilled water’s weight',
    s1obj: 'Object', s1z: 'Lowered depth z', s1reset: 'Lift out and empty bucket',
    s1ro: 'Reading fell by {d} N; displaced water in the bucket {vs} cm³ weighs {ww} N; they differ by {diff} N (simulated scale error about ±1%).',
    s1result: 'Takeaway: F_b = W_displaced = ρ_liq·g·V_displaced (Archimedes’ principle). Holds for an object in still liquid; V_displaced is the part of the volume below the liquid surface.',
    s2k: 'Step 2 · Depth or volume',
    s2t: 'Does buoyancy depend on how deep the object is?',
    s2e: 'This step asks: as an object sinks deeper, does the buoyant force keep growing? It depends only on ρ_liq, g and the <strong>displaced volume</strong>. The graph’s x-axis is lowered depth, y-axis is the buoyant force: before the block is fully under, deeper means more displaced; once fully under, going deeper changes nothing. Pick a block size and liquid and drag the depth.',
    s2stage: 'x-axis: depth z (cm); y-axis: buoyant force F_b (N); three lines for three block sizes, the bright one is selected',
    s2canvas: 'Graph of buoyant force against depth: rises, then flat once the block is fully submerged',
    s2obj: 'Block size', s2liq: 'Liquid', s2z: 'Lowered depth z',
    s2ro: 'A {s} cm block in {liq}: at z = {z} cm the displaced volume is {vs} cm³ and F_b = {fb} N; {state}',
    s2part: 'not fully under yet, so going deeper still adds buoyancy.',
    s2full: 'fully under, so going deeper leaves it unchanged.',
    s2result: 'Takeaway: buoyancy grows with displaced volume and is independent of depth once fully submerged; a denser liquid lifts the plateau in proportion. Holds for an incompressible liquid and a rigid block.',
    s3k: 'Step 3 · Float or sink forces',
    s3t: 'After letting go, which two forces decide float or sink?',
    s3e: 'This step asks: after release, does the object go up or down? That is decided by weight W (down) versus buoyant force F_b (up). Fully under, F_b = ρ_liq·g·V; if W is bigger it sinks, if F_b is bigger it rises, until floating at the surface where F_b equals W. Pick a liquid, drag the object’s density, press “Let go”, and watch the arrows.',
    s3stage: 'Tank: the red down arrow is weight W, the cyan up arrow is buoyant force F_b, drawn to one common scale',
    s3canvas: 'Tank diagram: one arrow up and one down on the object; when floating the two are equal length',
    s3liq: 'Liquid', s3rho: 'Object density ρ_obj', s3drop: 'Let go', s3lift: 'Lift it back up',
    s3ro: 'W = {w} N; fully under, F_b would be {fm} N; {res}',
    s3resFloat: 'floats, F_b = W = {w} N, about {p}% submerged.',
    s3resSink: 'sinks to the bottom: F_b = {fm} N is less than W, the floor supports {n} N.',
    s3resNeutral: 'hangs in balance, F_b = W.',
    s3ready: 'The object is above the liquid; press “Let go”.',
    s3result: 'Takeaway: ρ_obj < ρ_liq floats (F_b = W while floating); ρ_obj > ρ_liq sinks. Holds for solid uniform objects in still liquid.',
    s4k: 'Step 4 · Why steel ships float',
    s4t: 'Steel is far denser than water — so why does a steel ship float?',
    s4e: 'This step asks: why does a hollow steel shell float when a solid lump sinks? What counts is the overall average density = total mass ÷ the volume the hull encloses; a bigger hull displaces more water. The steel plates weigh a fixed 800 kg. Drag the hull volume and the cargo mass and watch the waterline; load it past what the buoyancy can hold and it sinks.',
    s4stage: 'Ship side view: the dashed line is the water surface; the hull below it displaces water; the readout compares total mass with the water mass it can displace',
    s4canvas: 'Ship side view: a bigger hull rides higher, more cargo sits deeper, overloading sinks it',
    s4v: 'Volume enclosed by the hull V', s4c: 'Cargo mass', s4reset: 'Unload and reset',
    s4ro: 'Total mass {m} kg; average density {rho} kg/m³; fully submerged the hull can displace at most {cap} kg of water; {res}',
    s4resFloat: 'floats, draft {p}% of hull height, room for {left} kg more.',
    s4resSink: 'overloaded: it sinks (total mass exceeds the water mass the hull can displace).',
    s4result: 'Takeaway: the ship floats as long as total mass stays below hull volume × water density. Holds in this box-hull model: no leaks, steel volume ignored; real ships also need stability and wave margins.',
    s5k: 'Step 5 · Recap', s5t: 'Explain Archimedes’ principle to a friend',
    s5e: 'An object in a liquid feels an upward buoyant force equal to the weight of the liquid it displaces.',
    f1t: 'Formula', f1b: 'F_b = ρ_liq·g·V_displaced; scale reading = W − F_b.',
    f2t: 'Volume, not depth', f2b: 'Buoyancy follows displaced volume and liquid density; once fully under, depth does not matter (step 2).',
    f3t: 'Float or sink', f3b: 'Compare W with F_b, i.e. average density with liquid density; hollow shapes lower the average density (steps 3, 4).',
    modelT: 'Honest model notes',
    model1: 'This page uses g = 9.8 N/kg, water 1000 kg/m³, salt water 1030, cooking oil 920; scale error is a deterministic wobble of about ±1%.',
    model2: 'Object and liquid are treated as still; real floating involves bobbing, drag and surface tension.',
    model3: 'The ship is a simple box shell; stability, waves and centre of gravity are outside this model.',
    nextT: 'Keep going (on this site)',
    l1: 'Pressure · step 2: buoyancy really comes from the pressure difference across the object (p = ρgh)',
    l2: 'Density · step 3: compare densities to predict floating (another way into this page)',
    l3: 'Density · step 4: the displacement method uses the same displaced volume'
  }
};
let currentLang = null;
function getLang() {
  if (currentLang) return currentLang;
  try {
    const saved = localStorage.getItem('knowledge-lang');
    if (saved === 'zh' || saved === 'en') return currentLang = saved;
  } catch (e) { /* in-memory fallback */ }
  return currentLang = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}
function t(key, params) {
  const p = params || {};
  return STR[getLang()][key].replace(/\{(\w+)\}/g, (_, n) => String(p[n]));
}
function applyLang(lang) {
  currentLang = lang;
  try { localStorage.setItem('knowledge-lang', lang); } catch (e) { /* keep currentLang */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(el => {
    const on = el.dataset.lang === lang;
    el.classList.toggle('active', on);
    el.setAttribute('aria-pressed', String(on));
  });
  if (typeof window.onLang === 'function') window.onLang();
}
getLang();
if (typeof module !== 'undefined') module.exports = { STR };
