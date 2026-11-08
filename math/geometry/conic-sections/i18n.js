'use strict';
const STR = {
  zh: {
    languageLabel: "语言切换",
    back: "← 知识索引",
    navLabel: "步骤导航",
    catBadge: "数学基础",
    stageBadge: "高中",
    foot: "圆锥曲线 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页",
    docTitle: '圆锥曲线 · 一个圆锥，四种切法',
    pageTitle: '圆锥曲线',
    tagline: '圆、椭圆、抛物线、双曲线看起来毫不相干，其实是同一个圆锥被不同角度的平面切出来的一家人，一个离心率 e 就能把它们连成一条线。',
    nav0: '0 四种切法', nav1: '1 离心率 e', nav2: '2 两个焦点', nav3: '3 反射的秘密', nav4: '4 从方程认曲线', nav5: '5 收束',
    kCircle: '圆', kEllipse: '椭圆', kParabola: '抛物线', kHyperbola: '双曲线', kDegenerate: '退化（直线或没有图形）',
    mParabola: '抛物线镜面', mEllipse: '椭圆镜面',
    unitDeg: '°',
    s0k: '第 0 步 · 四种切法',
    s0t: '同一个圆锥，用平面切出来的截口会是什么形状？',
    s0e: '这一步要回答：把一个圆锥用一个平面切开，切口曲线是什么，由什么决定？图上是圆锥的侧面（轴竖直，半顶角 α = 30°）和一块平面（侧面看是一条线）。设平面与轴的夹角为 φ：φ = 90° 切口是<strong>圆</strong>；φ 比 α 大但小于 90° 是<strong>椭圆</strong>；φ = α（平面平行于圆锥的一条母线）是<strong>抛物线</strong>；φ 比 α 小是<strong>双曲线</strong>（会同时切到上下两半圆锥）。拖「平面与轴的夹角 φ」，看左边平面转动，右边切口形状变化。',
    s0stage: '左：圆锥侧面（虚线是轴）与切平面（橙线）；右：这个平面切出来的截口曲线（形状按 e = cos φ ÷ cos α 画，大小不代表真实位置）',
    s0canvas: '圆锥与切平面：平面转动时，截口依次是圆、椭圆、抛物线、双曲线',
    s0phi: '平面与轴的夹角 φ',
    s0ro: 'φ = {phi}°，圆锥半顶角 α = 30°：切口是{kind}，离心率 e = cos φ ÷ cos α = {e}。',
    s0result: '结论：切口形状只由角度决定——φ 从 90° 减小，依次是圆（e = 0）、椭圆（0 < e < 1）、抛物线（e = 1）、双曲线（e > 1）。条件：平面不过圆锥顶点；过顶点时会退化成点或直线。截口大小取决于平面位置，本页不模拟。',
    s1k: '第 1 步 · 离心率 e',
    s1t: '有没有一个数，能一口气分清这几种曲线？',
    s1e: '这一步要回答：能不能用一条统一的规则同时定义圆、椭圆、抛物线和双曲线？规则是：平面上到一个定点（<strong>焦点</strong> F）的距离，与到一条定直线（<strong>准线</strong>）的距离之比等于常数 e 的点，连成的曲线。这个常数 e 叫<strong>离心率</strong>。拖 e，看曲线从圆变椭圆、抛物线、双曲线；拖「点的位置」，读两段距离的比，验证它始终等于 e。',
    s1stage: '平面：红点是焦点 F，竖直虚线是准线，橙点 P 在曲线上；青线 PF 和粉线 PD（到准线的垂线段）的长度之比就是 e',
    s1canvas: '焦点、准线和曲线上的一个点：到焦点与到准线的距离之比恒等于离心率',
    s1elab: '离心率 e', s1p: '点 P 的位置',
    s1ro: 'e = {e}：{kind}；此刻 |PF| = {pf}，|PD| = {pd}，|PF| ÷ |PD| = {ratio}。',
    s1result: '结论：e = 0 是圆，0 < e < 1 椭圆，e = 1 抛物线，e > 1 双曲线；比值对曲线上每个点都一样。条件：本页固定半通径 ℓ = 1 来定尺度；e = 0 时准线在无穷远，曲线是以焦点为圆心的圆。',
    s2k: '第 2 步 · 两个焦点',
    s2t: '用一根线、两颗图钉，怎样画出椭圆？',
    s2e: '这一步要回答：椭圆和双曲线为什么有「两个焦点」，它们的定义是什么？<strong>椭圆</strong>：到两个焦点 F₁、F₂ 的距离之和等于定值 2a；<strong>双曲线</strong>：到两焦点的距离之差的绝对值等于定值 2a。设焦距的一半为 c，当 c < a 是椭圆，c > a 是双曲线，其中 b² = |a² − c²|。拖 a 和 c，再拖「点的位置」，读两段距离之和（或差）；曲线会被点走过的轨迹一点点描出来。',
    s2stage: '平面：两个红点是焦点，橙点 P 沿曲线移动，青线是 PF₁，粉线是 PF₂；黄色小点是 P 走过的位置（轨迹），淡线是整条曲线',
    s2canvas: '两个焦点与曲线上的点：椭圆上 PF₁ + PF₂ 恒为 2a，双曲线上 |PF₁ − PF₂| 恒为 2a',
    s2a: '半长轴 a（定值的一半）', s2c: '焦距的一半 c', s2tlab: '点 P 的位置', s2clear: '清除轨迹',
    s2ro: '{kind}：a = {a}，c = {c}，b = {b}；|PF₁| = {d1}，|PF₂| = {d2}，{op} = {val}（2a = {a2}）。',
    s2sum: '距离之和', s2diff: '距离之差的绝对值',
    s2deg: '退化：c 与 a 几乎相等，曲线缩成线段或射线。',
    s2result: '结论：椭圆是「两距离之和为定值」，双曲线是「两距离之差为定值」；c = 0 时两个焦点重合，椭圆成圆。条件：只画椭圆和双曲线的右支（左支关于 y 轴对称）；c 接近 a 时曲线退化。',
    s3k: '第 3 步 · 反射的秘密',
    s3t: '为什么卫星天线是抛物面，椭圆形的房间里一个焦点的耳语会在另一个焦点听到？',
    s3e: '这一步要回答：光线打到圆锥曲线形状的镜面上，会往哪里反射？<strong>反射</strong>的规则是入射角等于反射角（相对曲线在该点的切线）。抛物线有一个神奇性质：平行于轴的光线，反射后全部经过焦点；椭圆则是：从一个焦点射出的光线，反射后经过另一个焦点。选镜面，拖「光线」，打开「画多条光线」，看它们怎样聚到焦点。',
    s3stage: '镜面（粗线）和光线：绿色是入射光，橙色是反射光；红点是焦点；读数给出反射光线与焦点的距离',
    s3canvas: '抛物线镜面把平行光聚到焦点，椭圆镜面把一个焦点的光聚到另一个焦点',
    s3mode: '镜面形状', s3r: '光线', s3many: '画多条光线',
    s3ro: '{mode}：光线在 ({x}, {y}) 处反射；反射光线到焦点的距离 = {miss}（应接近 0）；入射角与反射角相差 {dang}°。',
    s3result: '结论：抛物面把平行光聚到焦点（反过来，焦点处的光源变成平行光，如手电筒和车灯），椭圆把一个焦点的光送到另一个焦点。条件：理想镜面、二维截面；本页数值用曲线的隐式方程求法线，不是画出来的巧合。',
    s4k: '第 4 步 · 从方程认曲线',
    s4t: '拿到一个二次方程，怎么不画图就知道它是哪种曲线？',
    s4e: '这一步要回答：方程 Ax² + Bxy + Cy² + Ey = 1 对应哪种曲线？看<strong>判别式</strong> Δ = B² − 4AC：Δ < 0 是椭圆（A = C 且 B = 0 时是圆），Δ = 0 是抛物线，Δ > 0 是双曲线；有时是退化情形（两条平行线或没有图形）。拖 A、B、C、E，对比读数里的 Δ 和图上真正画出的曲线。',
    s4stage: '方程 A·x² + B·xy + C·y² + E·y = 1 的图像（−4 到 4 的方格内）；读数给出判别式 Δ 与类型',
    s4canvas: '二次方程的图像：判别式的符号决定曲线是椭圆、抛物线还是双曲线',
    s4a: '系数 A', s4b: '系数 B（xy 项）', s4c: '系数 C', s4elab: '系数 E（y 的一次项）', s4reset: '恢复默认（圆 x² + y² = 1）',
    s4ro: 'A = {a}，B = {b}，C = {c}，E = {e}：Δ = B² − 4AC = {d}，判定：{kind}。{note}',
    s4noReal: '图上没有曲线：方程在当前范围内没有实数解（比如 A、C 都取负号时）。',
    s4rot: 'xy 项使曲线整体旋转了。',
    s4none: '',
    s4result: '结论：二次项 Ax² + Bxy + Cy² 的判别式 B² − 4AC 决定曲线家族；B ≠ 0 表示曲线的轴不平行于坐标轴。条件：本页只含 y 的一次项 E；一般方程还有 x 的一次项，平移后同样分类。抛物线需要 B = 0 且 C = 0 或类似的完全平方形式，并且一次项不能「沿着」平方的方向。',
    s5k: '第 5 步 · 收束', s5t: '把圆锥曲线说给别人听',
    s5e: '圆、椭圆、抛物线、双曲线是圆锥被平面切出的一家人；一个离心率 e 把它们连成一条线，焦点让它们有了反射性质，二次方程的判别式让你一眼认出它们。',
    f1t: '同一家人', f1b: '平面与轴的夹角决定切口：圆 → 椭圆 → 抛物线 → 双曲线（第 0 步），统一用 e 衡量（第 1 步）。',
    f2t: '焦点', f2b: '椭圆距离和为定值、双曲线距离差为定值；焦点带来反射性质（第 2–3 步）。',
    f3t: '代数', f3b: 'Ax² + Bxy + Cy² + ⋯ = 0 的判别式 B² − 4AC 的符号分出椭圆、抛物线、双曲线（第 4 步）。',
    modelT: '模型实话',
    model1: '第 0 步的截口只画形状（由 e = cos φ ÷ cos α），大小取决于平面位置，没有模拟；平面过顶点会退化。',
    model2: '反射用的是理想镜面的二维截面，数值由隐式方程的法线算出；真实天线是三维抛物面，还有加工误差。',
    model3: '第 4 步只有 y 的一次项，是一般二次方程的特例；退化情形（平行线、一点、空集）只简要提示。',
    nextT: '继续看（站内）',
    l1: '二次函数与抛物线 · 第 0 步：投篮的轨迹就是一条抛物线',
    l2: '特征向量 · 第 4 步：用主轴把 xy 项消掉，椭圆就「摆正」了',
    l3: '圆周角 · 第 0 步：圆是 e = 0 的圆锥曲线'
  },
  en: {
    languageLabel: "Language",
    back: "← Knowledge Index",
    navLabel: "Step navigation",
    catBadge: "Mathematical Foundations",
    stageBadge: "Senior High",
    foot: "Conic Sections · Built by Claude Sonnet via Mini Claude Code · static bilingual page",
    docTitle: 'Conic Sections · One Cone, Four Cuts',
    pageTitle: 'Conic Sections',
    tagline: 'Circle, ellipse, parabola and hyperbola look unrelated, yet they are one family cut from the same cone by planes at different angles — and a single number, the eccentricity e, strings them on one line.',
    nav0: '0 Four cuts', nav1: '1 Eccentricity e', nav2: '2 Two foci', nav3: '3 Reflection secret', nav4: '4 Name it from the equation', nav5: '5 Recap',
    kCircle: 'circle', kEllipse: 'ellipse', kParabola: 'parabola', kHyperbola: 'hyperbola', kDegenerate: 'degenerate (lines or nothing)',
    mParabola: 'Parabolic mirror', mEllipse: 'Elliptical mirror',
    unitDeg: '°',
    s0k: 'Step 0 · Four cuts',
    s0t: 'Cut one cone with a plane: what shape is the cut edge?',
    s0e: 'This step asks: when a plane cuts a cone, what is the cut curve and what decides it? The picture shows the cone from the side (axis vertical, half-angle α = 30°) and a plane (a line seen edge-on). Let φ be the angle between plane and axis: φ = 90° gives a <strong>circle</strong>; φ between α and 90° gives an <strong>ellipse</strong>; φ = α (the plane parallel to a generating line of the cone) gives a <strong>parabola</strong>; φ below α gives a <strong>hyperbola</strong> (it cuts both halves of the double cone). Drag “angle φ between plane and axis” and watch the plane turn on the left and the cut shape change on the right.',
    s0stage: 'Left: the cone from the side (dashed line is the axis) and the cutting plane (orange line); right: the curve this plane cuts out (drawn from e = cos φ ÷ cos α; its size does not reflect the real position)',
    s0canvas: 'A cone and a cutting plane: as the plane turns, the cut is a circle, ellipse, parabola, then hyperbola',
    s0phi: 'Angle φ between plane and axis',
    s0ro: 'φ = {phi}°, cone half-angle α = 30°: the cut is a {kind}, eccentricity e = cos φ ÷ cos α = {e}.',
    s0result: 'Takeaway: the shape depends only on the angle — as φ falls from 90°: circle (e = 0), ellipse (0 < e < 1), parabola (e = 1), hyperbola (e > 1). Holds for a plane that misses the apex; through the apex it degenerates to a point or lines. The cut’s size depends on the plane’s position, which is not simulated here.',
    s1k: 'Step 1 · Eccentricity e',
    s1t: 'Is there one number that tells these curves apart?',
    s1e: 'This step asks: can one rule define circle, ellipse, parabola and hyperbola together? The rule: the curve is the set of points whose distance to a fixed point (the <strong>focus</strong> F) divided by their distance to a fixed line (the <strong>directrix</strong>) equals a constant e, called the <strong>eccentricity</strong>. Drag e and watch the curve go from circle to ellipse, parabola, hyperbola; drag “position of P” and read the ratio of the two distances to confirm it always equals e.',
    s1stage: 'Plane: the red dot is the focus F, the vertical dashed line is the directrix, the orange dot P is on the curve; the length of cyan PF divided by pink PD (the perpendicular to the directrix) is e',
    s1canvas: 'A focus, a directrix and a point on the curve: the ratio of distance to focus over distance to directrix always equals the eccentricity',
    s1elab: 'Eccentricity e', s1p: 'Position of P',
    s1ro: 'e = {e}: {kind}; right now |PF| = {pf}, |PD| = {pd}, |PF| ÷ |PD| = {ratio}.',
    s1result: 'Takeaway: e = 0 is a circle, 0 < e < 1 an ellipse, e = 1 a parabola, e > 1 a hyperbola; the ratio is the same at every point. Holds with the semi-latus rectum fixed at ℓ = 1 for scale; at e = 0 the directrix is at infinity and the curve is a circle around the focus.',
    s2k: 'Step 2 · Two foci',
    s2t: 'With a loop of string and two pins, how do you draw an ellipse?',
    s2e: 'This step asks: why do ellipses and hyperbolas have two foci, and how are they defined? An <strong>ellipse</strong> is the set of points whose distances to two foci F₁, F₂ add up to a constant 2a; a <strong>hyperbola</strong> is the set where the distances differ by a constant 2a in absolute value. With half the focal distance c, c < a gives an ellipse and c > a a hyperbola, with b² = |a² − c²|. Drag a and c, then drag “position of P” and read the sum (or difference); the trail of P’s visited positions traces the curve bit by bit.',
    s2stage: 'Plane: the two red dots are foci, the orange dot P moves along the curve, cyan is PF₁ and pink is PF₂; the small yellow dots are the positions P has visited (a trail), the faint line is the whole curve',
    s2canvas: 'Two foci and a point on the curve: on an ellipse PF₁ + PF₂ stays 2a, on a hyperbola |PF₁ − PF₂| stays 2a',
    s2a: 'Semi-major a (half the constant)', s2c: 'Half the focal distance c', s2tlab: 'Position of P', s2clear: 'Clear the trail',
    s2ro: '{kind}: a = {a}, c = {c}, b = {b}; |PF₁| = {d1}, |PF₂| = {d2}, {op} = {val} (2a = {a2}).',
    s2sum: 'sum of distances', s2diff: 'absolute difference of distances',
    s2deg: 'Degenerate: c is almost equal to a, so the curve collapses to a segment or rays.',
    s2result: 'Takeaway: an ellipse is “two distances add to a constant”, a hyperbola “two distances differ by a constant”; at c = 0 the foci merge and the ellipse is a circle. Only the ellipse and the hyperbola’s right branch are drawn (the left branch mirrors it); near c = a the curve degenerates.',
    s3k: 'Step 3 · Reflection secret',
    s3t: 'Why is a satellite dish parabolic, and why can a whisper at one focus of an elliptical room be heard at the other?',
    s3e: 'This step asks: when light hits a mirror shaped like a conic, where does it go? The rule of <strong>reflection</strong> is that the angle of incidence equals the angle of reflection (measured from the tangent at that point). A parabola has a remarkable property: rays parallel to its axis all reflect through the focus; for an ellipse, rays leaving one focus reflect through the other. Pick a mirror, drag the “ray”, switch on “draw many rays” and watch them gather at the focus.',
    s3stage: 'Mirror (thick line) and rays: green is incoming, orange is reflected; red dots are foci; the readout gives how far the reflected ray passes from the focus',
    s3canvas: 'A parabolic mirror gathers parallel light at its focus, an elliptical mirror carries light from one focus to the other',
    s3mode: 'Mirror shape', s3r: 'Ray', s3many: 'Draw many rays',
    s3ro: '{mode}: the ray reflects at ({x}, {y}); the reflected ray passes {miss} from the focus (should be near 0); incident and reflected angles differ by {dang}°.',
    s3result: 'Takeaway: a parabolic mirror gathers parallel light at its focus (and turns a source at the focus into a parallel beam, like a torch or headlamp); an ellipse sends light from one focus to the other. Holds for ideal mirrors in a 2D cross-section; the numbers come from the normal of the curve’s implicit equation, not a coincidence of drawing.',
    s4k: 'Step 4 · Name it from the equation',
    s4t: 'Given a quadratic equation, how can you tell which curve it is without drawing?',
    s4e: 'This step asks: which curve does Ax² + Bxy + Cy² + Ey = 1 describe? Look at the <strong>discriminant</strong> Δ = B² − 4AC: Δ < 0 is an ellipse (a circle if A = C and B = 0), Δ = 0 a parabola, Δ > 0 a hyperbola; sometimes it is degenerate (two parallel lines or nothing). Drag A, B, C, E and compare the Δ in the readout with the curve actually drawn.',
    s4stage: 'The graph of A·x² + B·xy + C·y² + E·y = 1 (inside the square −4 to 4); the readout gives the discriminant Δ and the type',
    s4canvas: 'The graph of a quadratic equation: the sign of the discriminant decides ellipse, parabola or hyperbola',
    s4a: 'Coefficient A', s4b: 'Coefficient B (xy term)', s4c: 'Coefficient C', s4elab: 'Coefficient E (linear in y)', s4reset: 'Reset (the circle x² + y² = 1)',
    s4ro: 'A = {a}, B = {b}, C = {c}, E = {e}: Δ = B² − 4AC = {d}, verdict: {kind}. {note}',
    s4noReal: 'No curve is drawn: the equation has no real solutions in this range (for example when A and C are both negative).',
    s4rot: 'The xy term has rotated the curve.',
    s4none: '',
    s4result: 'Takeaway: the discriminant B² − 4AC of the quadratic part Ax² + Bxy + Cy² picks the family; B ≠ 0 means the curve’s axes are not parallel to the coordinate axes. Holds here with only a linear term E in y; the general equation also has an x term, and after shifting it classifies the same way. A parabola needs the quadratic part to be a perfect square and the linear term not to point along it.',
    s5k: 'Step 5 · Recap', s5t: 'Explain conic sections to a friend',
    s5e: 'Circle, ellipse, parabola and hyperbola are one family cut from a cone by planes; the eccentricity e puts them on one line, the foci give their reflecting property, and the discriminant of a quadratic equation names them at a glance.',
    f1t: 'One family', f1b: 'The angle between plane and axis sets the cut: circle → ellipse → parabola → hyperbola (step 0), all measured by e (step 1).',
    f2t: 'Foci', f2b: 'An ellipse has a constant distance sum, a hyperbola a constant difference; foci give the reflecting property (steps 2–3).',
    f3t: 'Algebra', f3b: 'The sign of B² − 4AC in Ax² + Bxy + Cy² + ⋯ = 0 separates ellipse, parabola and hyperbola (step 4).',
    modelT: 'Honest model notes',
    model1: 'Step 0 draws only the cut’s shape (from e = cos φ ÷ cos α); its size depends on the plane’s position, which is not simulated; a plane through the apex degenerates.',
    model2: 'Reflection uses an ideal mirror in a 2D cross-section with numbers from the implicit equation’s normal; a real dish is a 3D paraboloid with manufacturing errors.',
    model3: 'Step 4 has only a linear term in y, a special case of the general quadratic; degenerate cases (parallel lines, a point, empty) are only hinted at.',
    nextT: 'Keep going (on this site)',
    l1: 'Quadratics & Parabolas · step 0: a basketball shot’s path is a parabola',
    l2: 'Eigenvectors · step 4: principal axes remove the xy term and “straighten” the ellipse',
    l3: 'Inscribed Angles · step 0: the circle is the e = 0 conic'
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
