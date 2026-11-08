'use strict';
const STR = {
  zh: {
    languageLabel: "语言切换",
    back: "← 知识索引",
    navLabel: "步骤导航",
    catBadge: "物理与电路",
    stageBadge: "初中",
    foot: "压强 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页",
    docTitle: '压强 · 力不变，摊得越开压得越轻',
    pageTitle: '压强',
    tagline: '穿雪鞋不陷、图钉尖头易摁——同样的力，作用面积越小，压得越狠。「每单位面积上的压力」就是压强。',
    nav0: '0 雪地里的脚', nav1: '1 图钉的两端', nav2: '2 水越深压越大', nav3: '3 大气的重量', nav4: '4 小力顶大力', nav5: '5 收束',
    unitN: 'N', unitCm2: 'cm²', unitKpa: 'kPa', unitMpa: 'MPa', unitM: 'm', unitMm: 'mm', unitCm: 'cm',
    liqWater: '水', liqSalt: '盐水', liqOil: '植物油', liqHg: '水银',
    s0k: '第 0 步 · 雪地里的脚',
    s0t: '同样重的人，为什么穿雪鞋就不陷下去？',
    s0e: '这一步要回答：同样的重力压在雪地上，接触面积变大，陷下多深会怎么变？<strong>压力</strong>是垂直压在表面上的力（单位牛，N）；<strong>压强</strong>是每单位面积承受的压力，p = F ÷ S（S 是接触面积），单位帕（Pa），本页用千帕（1 kPa = 1000 Pa）。拖动力和接触面积，看雪面的凹陷。',
    s0stage: '雪地剖面：箭头是压力 F，方块底边宽度代表接触面积 S，凹陷深度代表雪被压下多少',
    s0canvas: '雪地示意图：重物压在雪面上，接触面积越小凹陷越深',
    s0f: '压力 F（人的重力）', s0a: '接触面积 S',
    s0ro: 'p = F ÷ S = {f} N ÷ {a} cm² = {p} kPa；雪被压下约 {d} cm。',
    s0result: '结论：力不变，面积越大压强越小，陷得越浅。条件：雪是示意的均匀软物，凹陷深度按「深度 ∝ 压强」简单设定，封顶 25 cm。',
    s1k: '第 1 步 · 图钉的两端',
    s1t: '图钉两端受同一个力，压强差多少倍？',
    s1e: '这一步要回答：用手指推图钉，钉帽和钉尖受力一样，压强为什么差那么多？拖面积滑杆（横轴按 10 的幂排布，每格大 10 倍），点沿曲线移动：面积每扩大 10 倍，压强缩小到十分之一。再改力 F，看整条线怎么平移。',
    s1stage: '横轴：接触面积 S（cm²，对数刻度）；纵轴：压强 p（kPa，对数刻度）；橙色点是当前面积',
    s1canvas: '压强对面积的对数坐标图：面积每大 10 倍压强小到十分之一，是一条下降直线',
    s1f: '手指推力 F', s1a: '接触面积 S 的 10 为底对数 lg S',
    s1ro: 'S = {a} cm² → p = {p} {u}；面积是钉帽（1 cm²）的 {r} 倍。',
    s1result: '结论：同一个力下 p 与 S 成反比。条件：力均匀分布在接触面上；真实钉尖不是理想平面，本页取理想值。',
    s2k: '第 2 步 · 水越深压越大',
    s2t: '液体里某一点的压强，由什么决定？',
    s2e: '这一步要回答：容器侧壁越靠下的小孔，水为什么喷得越用力？液体内部 <strong>深度 h</strong>（该点到液面的竖直距离）处的压强 p = ρgh，ρ 是液体密度（<a href="../density/#step0">密度页</a>讲了它），g = 9.8 N/kg。拖水位，选液体，看每个孔的压强箭头和水柱。',
    s2stage: '水槽：四个小孔，箭头长度 = 孔处压强；水柱走势按理想小孔出流画',
    s2canvas: '侧壁开孔的水槽：越靠下的孔压强箭头越长、水喷得越远',
    s2liq: '液体', s2h: '液面高度 H',
    s2ro: '最低孔处深度 {d} m，p = ρgh = {rho} × 9.8 × {d} = {p} kPa；最深孔压强是最浅孔的 {r} 倍。',
    s2result: '结论：同种液体里压强随深度线性增大，换密度更大的液体，同一深度压强按比例增大。条件：静止液体、不计大气压；水柱形状按理想出流（与 ρ 无关）近似。',
    s3k: '第 3 步 · 大气的重量',
    s3t: '我们头顶的空气有多大压强，高处为什么变小？',
    s3e: '这一步要回答：空气也有重量，所以也有压强。<strong>大气压</strong>就是头顶整个空气柱压在单位面积上的力，海平面约 101.3 kPa。用<strong>气压计</strong>：管里的液柱被大气压托住，液柱高 h = p ÷ (ρg)。拖海拔，看液柱怎么落。',
    s3stage: '气压计：管里的液柱高度由大气压托起；虚线是海平面处的高度',
    s3canvas: '气压计示意图：海拔越高液柱越矮',
    s3liq: '管里的液体', s3z: '海拔高度 z',
    s3ro: '海拔 {z} m：大气压约 {p} kPa（海平面的 {r}%）；{liq} 柱高 {h} {u}。',
    s3result: '结论：海平面水银柱约 760 mm、水柱约 10.3 m；越高空气越稀，气压越低。条件：本页用等温近似 p = p₀·e^(−z/8400)，真实大气随温度、天气变化。',
    s4k: '第 4 步 · 小力顶大力',
    s4t: '为什么按小活塞能顶起大重物？',
    s4e: '这一步要回答：密闭液体里的压强处处相等（帕斯卡原理），小活塞上多大的力能顶起大活塞上的重物？压强 p = F₁ ÷ S₁，大活塞受力 F₂ = p × S₂。按「压下小活塞 10 cm」，看大活塞抬起多高。',
    s4stage: '液压机：左边小活塞，右边大活塞，上面放着 100 kg 的重物（约 980.7 N）',
    s4canvas: '液压机示意图：左边小活塞下压，右边大活塞抬起重物',
    s4f1: '小活塞上的力 F₁', s4a1: '小活塞面积 S₁', s4a2: '大活塞面积 S₂',
    s4push: '压下小活塞 10 cm', s4reset: '复位',
    s4ro: 'p = {p} kPa；F₂ = {f2} N（{cmp} 重物 980.7 N）。{move}',
    s4lift: '够顶起',
    s4nolift: '顶不起',
    s4moved: '小活塞下压 10 cm，大活塞升 {d2} cm；输入功 {w1} J，输出功 {w2} J。',
    s4stuck: '大活塞不动：F₂ 不够；增大 F₁ 或 S₂ ÷ S₁ 再试。',
    s4idle: '按「压下小活塞 10 cm」演示。',
    s4result: '结论：F₂ = F₁ × S₂ ÷ S₁，力放大，位移缩小，功不变（理想情况）。条件：不可压缩、无泄漏、无摩擦；真实液压机有损耗。',
    s5k: '第 5 步 · 收束', s5t: '把「压强」说给别人听',
    s5e: '压强 = 单位面积上的压力：同样的力，面积越小压强越大。',
    f1t: '固体', f1b: 'p = F ÷ S：靠增大面积减压（雪鞋），靠减小面积增压（图钉）。',
    f2t: '液体与大气', f2b: '液体内 p = ρgh，随深度线性增大；大气压来自头顶空气的重量，随海拔降低。',
    f3t: '密闭液体', f3b: '帕斯卡原理：压强处处相等，液压机因此「力放大、位移缩小」。',
    modelT: '模型实话',
    model1: '雪的凹陷、水柱走势、等温大气都是教学近似；真实雪会压实变硬，大气随温度分层。',
    model2: '本页液压机不计摩擦与泄漏；真实机器输出功小于输入功。',
    model3: '水柱走势按理想出流画，射程与密度无关，但孔处压强随密度成比例——两者别混为一谈。',
    nextT: '继续看（站内）',
    l1: '杠杆与滑轮 · 第 2 步：力放大一定要用位移来换（功的账本）',
    l2: '密度 · 第 3 步：p = ρgh 里的 ρ，以及浮沉怎么比较',
    l3: '粒子与物态 · 第 1 步：气体压强背后的粒子热运动'
  },
  en: {
    languageLabel: "Language",
    back: "← Knowledge Index",
    navLabel: "Step navigation",
    catBadge: "Physics & Circuits",
    stageBadge: "Junior High",
    foot: "Pressure · Built by Claude Sonnet via Mini Claude Code · static bilingual page",
    docTitle: 'Pressure · Same Force, Spread Wider, Pushes Softer',
    pageTitle: 'Pressure',
    tagline: 'Snowshoes keep you on top; a thumbtack tip goes in easily. The same force pressed on a smaller area pushes harder: force per unit area is pressure.',
    nav0: '0 Feet in snow', nav1: '1 Two ends of a tack', nav2: '2 Deeper, harder', nav3: '3 Weight of air', nav4: '4 Small force, big lift', nav5: '5 Recap',
    unitN: 'N', unitCm2: 'cm²', unitKpa: 'kPa', unitMpa: 'MPa', unitM: 'm', unitMm: 'mm', unitCm: 'cm',
    liqWater: 'Water', liqSalt: 'Salt water', liqOil: 'Cooking oil', liqHg: 'Mercury',
    s0k: 'Step 0 · Feet in snow',
    s0t: 'Same weight, so why does a snowshoe not sink?',
    s0e: 'This step asks: with the same weight on snow, how does the dent change when the contact area grows? <strong>Force</strong> here is the push perpendicular to the surface (newtons, N); <strong>pressure</strong> is force per unit area, p = F ÷ S (S is the contact area), in pascals (Pa) — this page uses kilopascals (1 kPa = 1000 Pa). Drag the force and the contact area and watch the snow dent.',
    s0stage: 'Snow cross-section: the arrow is force F, the block’s base width is contact area S, the dent depth shows how far the snow is pressed',
    s0canvas: 'Snow diagram: a weight on snow; the smaller the contact area, the deeper the dent',
    s0f: 'Force F (the person’s weight)', s0a: 'Contact area S',
    s0ro: 'p = F ÷ S = {f} N ÷ {a} cm² = {p} kPa; snow dented about {d} cm.',
    s0result: 'Takeaway: same force, bigger area, lower pressure, shallower dent. Holds in this model: snow is a uniform soft material with dent depth ∝ pressure, capped at 25 cm.',
    s1k: 'Step 1 · Two ends of a tack',
    s1t: 'Both ends of a thumbtack feel the same force — how different is the pressure?',
    s1e: 'This step asks: you push a thumbtack with a finger; head and tip carry the same force, so why is the pressure so different? Drag the area slider (the axis is in powers of ten) and watch the dot slide along the curve: every 10× larger area gives one-tenth the pressure. Then change F and see the whole line shift.',
    s1stage: 'x-axis: contact area S (cm², log scale); y-axis: pressure p (kPa, log scale); the orange dot is the current area',
    s1canvas: 'Log–log graph of pressure against area: each 10× increase in area cuts pressure to a tenth, a straight falling line',
    s1f: 'Finger force F', s1a: 'Contact area S as log₁₀ S',
    s1ro: 'S = {a} cm² → p = {p} {u}; that area is {r}× the tack head (1 cm²).',
    s1result: 'Takeaway: for a fixed force, p is inversely proportional to S. Holds when the force is spread evenly over the contact; a real tack tip is not an ideal flat patch.',
    s2k: 'Step 2 · Deeper, harder',
    s2t: 'What sets the pressure at a point inside a liquid?',
    s2e: 'This step asks: why does a hole lower on a tank wall spray harder? In a liquid at <strong>depth h</strong> (vertical distance below the surface) the pressure is p = ρgh, where ρ is the liquid’s density (see the <a href="../density/#step0">density page</a>) and g = 9.8 N/kg. Drag the water level, pick a liquid, and watch each hole’s pressure arrow and jet.',
    s2stage: 'Tank: four small holes; arrow length = pressure at the hole; jet paths are drawn for ideal outflow',
    s2canvas: 'Tank with holes in its wall: lower holes have longer pressure arrows and the jets reach farther',
    s2liq: 'Liquid', s2h: 'Water level H',
    s2ro: 'Lowest hole at depth {d} m: p = ρgh = {rho} × 9.8 × {d} = {p} kPa; the deepest hole’s pressure is {r}× the shallowest’s.',
    s2result: 'Takeaway: in one liquid, pressure grows linearly with depth; a denser liquid gives proportionally more at the same depth. Holds for still liquid, gauge pressure (air pressure left out); jet shapes use ideal outflow, which does not depend on ρ.',
    s3k: 'Step 3 · Weight of air',
    s3t: 'How much pressure does the air above us exert, and why does it fall with height?',
    s3e: 'This step asks: air has weight, so does it press? <strong>Atmospheric pressure</strong> is the weight of the whole air column above, per unit area; at sea level it is about 101.3 kPa. A <strong>barometer</strong> holds a liquid column up with it: column height h = p ÷ (ρg). Drag the altitude and watch the column fall.',
    s3stage: 'Barometer: air pressure holds up the liquid column; the dashed line marks the sea-level height',
    s3canvas: 'Barometer diagram: the higher the altitude, the shorter the column',
    s3liq: 'Liquid in the tube', s3z: 'Altitude z',
    s3ro: 'Altitude {z} m: air pressure about {p} kPa ({r}% of sea level); the {liq} column is {h} {u} tall.',
    s3result: 'Takeaway: at sea level mercury stands near 760 mm and water near 10.3 m; higher up the air is thinner and the pressure lower. Holds in this isothermal model p = p₀·e^(−z/8400); the real atmosphere varies with temperature and weather.',
    s4k: 'Step 4 · Small force, big lift',
    s4t: 'Why can a small piston lift a big weight?',
    s4e: 'This step asks: in a sealed liquid the pressure is the same everywhere (Pascal’s principle), so what force on the small piston lifts the load on the big one? Pressure p = F₁ ÷ S₁, and the big piston gets F₂ = p × S₂. Press “Push small piston 10 cm” and see how high the big one rises.',
    s4stage: 'Hydraulic press: small piston left, big piston right, a 100 kg load on top (about 980.7 N)',
    s4canvas: 'Hydraulic press diagram: the small piston goes down and the big piston lifts the load',
    s4f1: 'Force on small piston F₁', s4a1: 'Small piston area S₁', s4a2: 'Big piston area S₂',
    s4push: 'Push small piston 10 cm', s4reset: 'Reset',
    s4ro: 'p = {p} kPa; F₂ = {f2} N ({cmp} the 980.7 N load). {move}',
    s4lift: 'enough to lift',
    s4nolift: 'not enough to lift',
    s4moved: 'Small piston down 10 cm, big piston up {d2} cm; work in {w1} J, work out {w2} J.',
    s4stuck: 'The big piston stays put: F₂ is too small. Raise F₁ or S₂ ÷ S₁ and try again.',
    s4idle: 'Press “Push small piston 10 cm” to demonstrate.',
    s4result: 'Takeaway: F₂ = F₁ × S₂ ÷ S₁ — force is multiplied, distance shrinks, work stays equal (ideal case). Holds for incompressible liquid with no leaks or friction; real presses lose energy.',
    s5k: 'Step 5 · Recap', s5t: 'Explain pressure to a friend',
    s5e: 'Pressure is force per unit area: the same force on a smaller area presses harder.',
    f1t: 'Solids', f1b: 'p = F ÷ S: spread the area to lower pressure (snowshoes), shrink it to raise pressure (a tack).',
    f2t: 'Liquids and air', f2b: 'In a liquid p = ρgh grows linearly with depth; air pressure is the weight of the air above and falls with altitude.',
    f3t: 'Sealed liquid', f3b: 'Pascal’s principle: pressure is equal everywhere, so a hydraulic press trades force gain for shorter travel.',
    modelT: 'Honest model notes',
    model1: 'The snow dent, jet paths and isothermal atmosphere are teaching approximations; real snow compacts and the atmosphere is layered by temperature.',
    model2: 'The hydraulic press here has no friction or leaks; real machines deliver less work than they take in.',
    model3: 'Jet paths use ideal outflow, whose reach does not depend on ρ, while the pressure at a hole grows in proportion to ρ — keep the two apart.',
    nextT: 'Keep going (on this site)',
    l1: 'Levers & Pulleys · step 2: why gaining force always costs distance (the work ledger)',
    l2: 'Density · step 3: the ρ inside p = ρgh, and how floating is decided',
    l3: 'Particles & States · step 1: the particle motion behind gas pressure'
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
