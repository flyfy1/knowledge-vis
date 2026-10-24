'use strict';
const STR = {
  "zh": {
    "docTitle": "光的反射与折射 · 光路怎样拐弯 —— 一步一交互",
    "back": "← 知识索引",
    "pageTitle": "光的反射与折射",
    "tagline": "光在同一种介质里走直线，碰到界面却要转弯：打到镜面按入射角等于反射角弹回，穿进水里在界面处拐个弯，角度太斜还会全部弹回水里。这一页的光线都按真实定律算出来再画——拖一拖，量一量，看光路到底听谁的。",
    "foot": "光的反射与折射 · 一步一交互",
    "reset": "重置本步",
    "navLabel": "步骤导航",
    "canvasLabel": "本步交互光路图；操作方法见上方说明",
    "nav0": "0 镜面弹射",
    "nav1": "1 漫反射",
    "nav2": "2 穿水拐弯",
    "nav3": "3 全反射",
    "nav4": "4 眼睛被骗",
    "s0k": "第 0 步",
    "s0t": "镜面弹射：入射角等于反射角",
    "s0e": "这一步要回答：光打到镜面上，往哪边走？先认识两个词：<strong>法线</strong>是垂直于镜面、立在入射点上的那条假想线（图中的虚线）；<strong>入射角</strong>是入射光线与法线的夹角，<strong>反射角</strong>是反射光线与法线的夹角——两个角都从法线量起，不从镜面量起。拖动图中的光源点（或用滑杆）改变入射角，盯住两条弧边的读数：不管你怎么拖，反射角总等于入射角。适用条件：表面是光滑的镜面。",
    "s0angLab": "入射角（也可拖图中的光源点）",
    "s0p0": "入射 0°（正对镜面）",
    "s0p60": "入射 60°",
    "s0ro": "入射角 = {i}，反射角 = {r}——两者相等。",
    "s0zero": "现在光线正对镜面射入（入射角 0°），沿原路返回。",
    "s0hint": "注意：角度从法线量起。如果从镜面量起，读到的会是 90° 减去这个数——课本里的角度永远以法线为基准。",
    "cNormal": "法线",
    "cMirror": "镜面",
    "cIn": "入射",
    "cRefl": "反射",
    "cRefr": "折射",
    "cAir": "空气",
    "cWater": "水",
    "cTIR": "全反射",
    "s1k": "第 1 步",
    "s1t": "粗糙面：漫反射也守同一条定律",
    "s1e": "这一步要回答：纸面不光滑，为什么还能看见上面的字，却照不出人影？放大看，粗糙面是无数个朝向不同的小斜面，每个小斜面有自己的<strong>法线</strong>（垂直于该小斜面的假想线）。一束平行光打上去，每条光线在自己落点处仍按反射角等于入射角弹出——这叫<strong>漫反射</strong>：不是定律失效，而是法线方向处处不同，反射光被撒向四面八方。切换三种看法对比。",
    "s1bMirror": "看镜面",
    "s1bRough": "看粗糙面",
    "s1bBoth": "并排对比",
    "s1roMirror": "镜面：表面法线方向处处相同，三条平行光反射后仍互相平行——所以镜子能成清晰的像。",
    "s1roRough": "粗糙面：三条光线落在三个不同朝向的小斜面上，各自守定律，却弹向不同方向——光撒开了，成不了像，但从各个方向都能看见这个面。",
    "s1roBoth": "并排看：左边镜面反射光整齐，右边粗糙面反射光散开。差别只在法线方向是否一致，定律本身没变。",
    "s1hint": "我们能看见不发光的物体，靠的就是漫反射把光送进眼睛；各个方向都有反射光，所以站在哪个位置都看得见。",
    "cBeam": "平行光束",
    "s2k": "第 2 步",
    "s2t": "穿水拐弯：折射偏向法线",
    "s2e": "这一步要回答：光从空气斜着射进水，在界面处往哪边拐？光在界面处改变方向叫<strong>折射</strong>。拖光源（或滑杆）改入射角，图上的折射光线不是示意——它是按<strong>斯涅尔定律</strong>（两种介质的折射率之比决定折射角）实时算出来的。折射角仍从法线量起。预期：入射角越大，拐得越多；折射角总小于入射角，即光线向法线靠拢。",
    "s2angLab": "入射角（空气一侧，也可拖光源点）",
    "s2p0": "入射 0°（垂直入射）",
    "s2ro": "入射角 = {i}，折射角 ≈ {r}（按斯涅尔定律实算）；在界面处拐了 {d}。",
    "s2ro2": "折射角 < 入射角：光一进水就向法线方向偏。",
    "s2zero": "入射角 0° 时不偏折，光直着穿过去；变的是速度——光在水里比在空气里慢（这一页只点到这里）。",
    "s2hint": "介质让光拐弯的本事大小叫折射率：空气约 1.00，水是 1.33。本页所有折射角都用这两个数实时计算，读数保留一位小数并标 ≈。",
    "s3k": "第 3 步",
    "s3t": "反过来：水到空气，与全反射",
    "s3e": "这一步要回答：光从水里往空气走，会怎样？这次折射角比入射角大——光线偏离法线。一直加大入射角，折射角先到 90°：折射光线贴着界面滑出去，此时的入射角叫<strong>临界角</strong>。再大一点，折射光线干脆消失，光全部反射回水里，这叫<strong>全反射</strong>。用滑杆慢慢拖过临界角，看折射光线是怎么消失的。",
    "s3angLab": "入射角（水的一侧，也可拖光源点）",
    "s3p30": "入射 30°",
    "s3pCrit": "临界角 ≈{crit}",
    "s3p60": "入射 60°",
    "s3roRefr": "入射角 = {i}，折射角 ≈ {r}——比入射角大，光线偏离法线。",
    "s3roCrit": "入射角 {i} ≈ 临界角 {crit}：折射角到了 90°，折射光线贴着水面滑出去。",
    "s3roTIR": "全反射！入射角 {i} ≥ 临界角 ≈{crit}：没有光折射出去，全部反射回水里（图中橙线点亮）。",
    "s3ro2": "临界角 ≈ {crit}（由 arcsin(1/1.33) 实算）：拖过它试试。",
    "s3hint": "其实光到了界面总会分出一部分反射回水里（图中的淡橙线），余下才折射出去；到了全反射，折射的那部分彻底消失，反射就成了全部。光纤就是全反射的应用：光在细玻璃丝里一次次全反射，被“关”着走到另一头，几乎不漏出来。",
    "s4k": "第 4 步",
    "s4t": "被骗的眼睛：鱼看起来变浅了",
    "s4e": "这一步要回答：站在岸边看水里的鱼，鱼的位置可信吗？鱼身上发出的光在水面处折射、偏离法线进入眼睛；眼睛有个改不掉的习惯——默认光是沿直线来的，于是顺着进入眼睛的光<strong>反向延长</strong>去“找”鱼，交点比鱼的真实位置浅，这个假位置叫<strong>虚像</strong>。左右拖眼睛（或用滑杆），看虚像怎么动、是不是始终比真鱼浅。斜插进水的筷子“折断”，是同一个把戏。",
    "s4eyeLab": "眼睛的水平位置（也可拖图中的眼睛）",
    "s4ro": "真实深度 {real} 格；看起来只有 ≈{app} 格——鱼被“抬高”了约 {diff} 格。",
    "s4hint": "看的角度越斜，虚像抬得越高、还会横向挪一点；几乎正上方看去时，看起来的深度约是真实深度的 1/1.33。",
    "cEye": "眼睛",
    "cFish": "真鱼",
    "cFishV": "虚像",
    "q1t": "自测 1 · 一束光以入射角 40° 打在镜面上，反射角是多少？（从法线量起）",
    "q1o0": "40°",
    "q1o1": "50°",
    "q1o2": "80°",
    "q1why": "反射角 = 入射角 = 40°，两角都从法线量。50° 是从镜面量起的数，是最常见的量错基准。",
    "q2t": "自测 2 · 光从空气以 50° 入射进水，折射角比 50°——",
    "q2o0": "更小（向法线偏）",
    "q2o1": "更大（偏离法线）",
    "q2o2": "一样大，不拐弯",
    "q2why": "空气→水时光向法线偏，折射角 ≈ 35.2°，比 50° 小（第 2 步可亲手拖到 50° 验证）。",
    "q3t": "自测 3 · 水下的光源以 60° 入射角射向水面（临界角 ≈{crit}），会发生什么？",
    "q3o0": "折射出去，折射角比入射角大",
    "q3o1": "折射光线沿水面滑出去",
    "q3o2": "全反射，全部反射回水里",
    "q3why": "60° 已超过临界角 ≈{crit}，折射光线不存在，光全部反射回水里——就是第 3 步拖到的状态。",
    "fbRight": "答对了。",
    "fbWrong": "不对，再想一想——可以回前面的步骤亲手验证。",
    "score": "自测进度：答对 {k}/3 题，其中首次答对 {f} 题。",
    "scoreIdle": "自测进度：还没开始答题。",
    "finK": "终章",
    "finT": "收束：光在界面处的三条规矩",
    "fc1t": "反射：等角弹回",
    "fc1b": "反射角 = 入射角，两角都从法线量起；表面越光滑，反射越整齐，粗糙面只是法线方向乱、定律不变。",
    "fc2t": "折射：换介质就拐弯",
    "fc2b": "空气→水偏向法线，水→空气偏离法线；拐多少由斯涅尔定律算，折射率是介质“拐弯本事”的度量。",
    "fc3t": "虚像：眼睛顺光找错了位置",
    "fc3b": "眼睛默认光走直线，顺着折射光反向延长去找物，交点就是虚像——比实物浅。筷子“折断”、池水看上去变浅，都是它。",
    "finNote": "光在水里为什么变慢、凸透镜怎样成像，是后面页面的事；这一页先把界面处的账算清。"
  },
  "en": {
    "docTitle": "Reflection & Refraction · How Light Turns at a Surface — One Interaction at a Time",
    "back": "← Knowledge Index",
    "pageTitle": "Reflection & Refraction",
    "tagline": "Light travels straight inside one medium, but at a boundary it turns: it bounces off a mirror with the angle of reflection equal to the angle of incidence, bends as it enters water, and — at too steep an angle — reflects entirely back. Every ray on this page is computed from the real laws before it is drawn. Drag, measure, and see what light actually obeys.",
    "foot": "Reflection & Refraction · One Interaction at a Time",
    "reset": "Reset this step",
    "navLabel": "Step navigation",
    "canvasLabel": "Interactive ray diagram for this step; instructions appear above",
    "nav0": "0 Mirror bounce",
    "nav1": "1 Diffuse reflection",
    "nav2": "2 Bending into water",
    "nav3": "3 Total reflection",
    "nav4": "4 The fooled eye",
    "s0k": "Step 0",
    "s0t": "Mirror bounce: angle in equals angle out",
    "s0e": "Question: when light hits a mirror, which way does it go? Two terms first: the <strong>normal</strong> is the imaginary line perpendicular to the mirror at the point of incidence (the dashed line in the diagram); the <strong>angle of incidence</strong> is measured between the incoming ray and the normal, and the <strong>angle of reflection</strong> between the reflected ray and the normal — both are measured from the normal, never from the mirror surface. Drag the light source in the diagram (or use the slider) and watch the two arc readings: however you drag, the angle of reflection always equals the angle of incidence. This holds for smooth, mirror-like surfaces.",
    "s0angLab": "Angle of incidence (or drag the source in the diagram)",
    "s0p0": "Incidence 0° (head-on)",
    "s0p60": "Incidence 60°",
    "s0ro": "Angle of incidence = {i}, angle of reflection = {r} — equal.",
    "s0zero": "The ray now hits the mirror head-on (incidence 0°) and returns along its own path.",
    "s0hint": "Note: angles are measured from the normal. Measured from the mirror surface you would get 90° minus this value — textbooks always use the normal as the reference.",
    "cNormal": "normal",
    "cMirror": "mirror",
    "cIn": "in",
    "cRefl": "out",
    "cRefr": "bent",
    "cAir": "air",
    "cWater": "water",
    "cTIR": "total internal reflection",
    "s1k": "Step 1",
    "s1t": "Rough surfaces: diffuse reflection obeys the same law",
    "s1e": "Question: paper is not smooth, so why can we read it — yet never see our face in it? Zoomed in, a rough surface is a crowd of tiny facets tilted every which way, each with its own <strong>normal</strong> (the imaginary line perpendicular to that facet). A parallel beam lands on them; each ray still reflects with angle out equal to angle in at its own facet — this is <strong>diffuse reflection</strong>: the law does not fail; the normals point in different directions, so the reflected light scatters. Switch between the three views to compare.",
    "s1bMirror": "Mirror",
    "s1bRough": "Rough surface",
    "s1bBoth": "Side by side",
    "s1roMirror": "Mirror: the normal points the same way everywhere, so parallel incoming rays stay parallel after reflecting — that is why a mirror forms a sharp image.",
    "s1roRough": "Rough surface: the three rays land on three differently tilted facets; each obeys the law but heads off in its own direction — the light spreads out, no image forms, yet the surface is visible from almost anywhere.",
    "s1roBoth": "Side by side: an orderly reflection on the left, a scattered one on the right. Only the directions of the normals differ — the law itself is unchanged.",
    "s1hint": "We can see non-luminous objects at all because diffuse reflection sends some of the light into our eyes from almost any viewing position.",
    "cBeam": "parallel beam",
    "s2k": "Step 2",
    "s2t": "Bending into water: refraction turns toward the normal",
    "s2e": "Question: light travels from air into water at a slant — which way does it bend at the surface? A change of direction at a boundary is called <strong>refraction</strong>. Drag the source (or use the slider) to change the angle of incidence; the refracted ray in the diagram is not a sketch — it is computed live from <strong>Snell's law</strong> (the ratio of the two media's refractive indices sets the angle of refraction). The refraction angle is also measured from the normal. Expect: the larger the incidence angle, the stronger the bend, and the refraction angle is always smaller — the ray leans toward the normal.",
    "s2angLab": "Angle of incidence, air side (or drag the source)",
    "s2p0": "Incidence 0° (straight in)",
    "s2ro": "Angle of incidence = {i}, angle of refraction ≈ {r} (computed from Snell's law); the ray bent by {d} at the surface.",
    "s2ro2": "Refraction angle < incidence angle: entering water, the ray leans toward the normal.",
    "s2zero": "At 0° there is no bend — the ray goes straight through. What changes is the speed: light travels slower in water than in air (this page leaves it at that).",
    "s2hint": "How strongly a medium bends light is its refractive index: air ≈ 1.00, water 1.33. Every refraction angle on this page is computed from those two numbers, shown to one decimal place with ≈.",
    "s3k": "Step 3",
    "s3t": "The other way: water to air, and total internal reflection",
    "s3e": "Question: what happens when light travels from water out into air? Now the angle of refraction is larger than the angle of incidence — the ray leans away from the normal. Keep increasing the incidence angle and the refraction angle reaches 90° first: the refracted ray skims along the surface. The incidence angle at that moment is the <strong>critical angle</strong>. Push a little further and the refracted ray disappears altogether — all the light reflects back into the water. That is <strong>total internal reflection</strong>. Drag the slider slowly across the critical angle and watch the refracted ray vanish.",
    "s3angLab": "Angle of incidence, water side (or drag the source)",
    "s3p30": "Incidence 30°",
    "s3pCrit": "Critical angle ≈{crit}",
    "s3p60": "Incidence 60°",
    "s3roRefr": "Angle of incidence = {i}, angle of refraction ≈ {r} — larger than the incidence angle; the ray leans away from the normal.",
    "s3roCrit": "Incidence {i} ≈ the critical angle {crit}: the refraction angle has reached 90°, and the refracted ray skims along the surface.",
    "s3roTIR": "Total internal reflection! Incidence {i} ≥ critical angle ≈{crit}: no light refracts out at all; everything reflects back into the water (orange ray lit).",
    "s3ro2": "The critical angle is ≈ {crit} (computed from arcsin(1/1.33)) — drag past it and see.",
    "s3hint": "In fact, some of the light always reflects back into the water at the surface (the faint orange ray in the diagram) and only the rest refracts out; at total internal reflection the refracted part vanishes completely, so the reflection becomes everything. Optical fibres run on total internal reflection: light inside a thin glass thread reflects totally again and again, trapped until it reaches the far end, with almost nothing leaking out.",
    "s4k": "Step 4",
    "s4t": "The fooled eye: the fish is not where it looks",
    "s4e": "Question: standing on the bank, can you trust where a fish in the water appears to be? Light from the fish refracts at the surface, leaning away from the normal, and enters the eye. The eye has an unbreakable habit — it assumes light arrived in a straight line, so it extends the incoming ray <strong>backwards</strong> to “find” the fish. The meeting point is shallower than the real fish: a <strong>virtual image</strong>. Drag the eye sideways (or use the slider) and watch the virtual image move — and stay shallower than the real fish. The “broken” chopstick in a glass of water is the same trick.",
    "s4eyeLab": "Eye position, left–right (or drag the eye in the diagram)",
    "s4ro": "Real depth {real} units; it looks like only ≈{app} units — the fish is lifted by about {diff} units.",
    "s4hint": "The more slanted the viewing angle, the higher the virtual image is lifted (and it shifts sideways a little); seen from almost directly above, the apparent depth is about 1/1.33 of the real depth.",
    "cEye": "eye",
    "cFish": "real fish",
    "cFishV": "virtual image",
    "q1t": "Quiz 1 · A ray hits a mirror at an incidence angle of 40°. What is the angle of reflection? (Measured from the normal.)",
    "q1o0": "40°",
    "q1o1": "50°",
    "q1o2": "80°",
    "q1why": "Angle of reflection = angle of incidence = 40°, both measured from the normal. 50° is the value measured from the mirror surface — the classic wrong reference.",
    "q2t": "Quiz 2 · Light enters water from air at 50°. The angle of refraction is —",
    "q2o0": "smaller (bent toward the normal)",
    "q2o1": "larger (bent away from the normal)",
    "q2o2": "the same — no bend",
    "q2why": "From air into water the ray bends toward the normal: the refraction angle is ≈ 35.2°, smaller than 50° (drag Step 2 to 50° and check).",
    "q3t": "Quiz 3 · A source under water shines at the surface with an incidence angle of 60° (critical angle ≈{crit}). What happens?",
    "q3o0": "It refracts out, with a larger angle",
    "q3o1": "The refracted ray skims along the surface",
    "q3o2": "Total internal reflection — all of it reflects back",
    "q3why": "60° is beyond the critical angle ≈{crit}, so no refracted ray exists; all the light reflects back into the water — the state you dragged to in Step 3.",
    "fbRight": "Correct.",
    "fbWrong": "Not quite — think again; you can go back and test it in the earlier steps.",
    "score": "Quiz progress: {k}/3 correct, {f} of them on the first try.",
    "scoreIdle": "Quiz progress: not started yet.",
    "finK": "Finale",
    "finT": "Wrap-up: three rules at a boundary",
    "fc1t": "Reflection: equal angles out",
    "fc1b": "Angle of reflection = angle of incidence, both measured from the normal. The smoother the surface, the tidier the reflection; a rough surface only scrambles the normals, not the law.",
    "fc2t": "Refraction: a new medium, a new direction",
    "fc2b": "Air→water bends toward the normal; water→air bends away. Snell's law computes how much; the refractive index measures a medium's bending power.",
    "fc3t": "Virtual images: the eye looks back wrongly",
    "fc3b": "The eye assumes straight-line travel and extends refracted light backwards to locate objects; the meeting point is the virtual image — shallower than the real thing. “Broken” chopsticks and shallower-looking pools are both this.",
    "finNote": "Why light slows down in water, and how convex lenses form images, belong to later pages; this page settles the accounts at the boundary itself."
  }
};
let _lang = null;
let _langMem = 'zh'; // localStorage 不可用时的内存退化
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 退化为内存变量 */ }
  return null;
}
function saveLang(v) {
  _langMem = v;
  try { window.localStorage.setItem('knowledge-lang', v); } catch (e) { /* 忽略 */ }
}
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s) { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n-title]').forEach(el => el.title = t(el.dataset.i18nTitle));
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang);
    });
  });
  applyLang(getLang());
}
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
