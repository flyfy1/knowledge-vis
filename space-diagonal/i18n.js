'use strict';
const STR = {
  "zh": {
    "docTitle": "空间对角线 · 两次勾股",
    "languageLabel": "语言切换",
    "back": "← 知识索引",
    "format3d": "3D 互动页",
    "category": "数学基础",
    "stage": "初中",
    "pageTitle": "长方体的空间对角线",
    "tagline": "已知盒子的长、宽、高，怎样求从一个角到最远角的直线距离？把平面勾股连用两次：先走底面，再竖起来。",
    "navLabel": "步骤导航",
    "nav0": "0 认出三角形",
    "nav1": "1 两次勾股",
    "nav2": "2 自己算一次",
    "s0k": "第 0 步 · 观察",
    "s0t": "体内的斜线，属于哪个三角形？",
    "s0e": "这一步要回答：穿过盒子内部的直线，怎样和底面联系起来？你已学过<a href=\"../pythagoras/#step2\">直角三角形的勾股关系：两条直角边的平方和等于斜边的平方</a>。空间对角线 d 就是穿过长方体内部、连接最远两个角的直线；底面对角线 e 是底面上两个相对角的连线。这里先固定长 a = 2、宽 b = 3、高 c = 6（同一长度单位）。先拖动画布改变视角，沿青色 e 到达底角，再沿绿色 c 向上，看橙色 d 怎样闭合这个竖直三角形；小方角表示两条线垂直。",
    "dragHint": "拖动旋转 · 滚轮或双指捏合缩放；也可聚焦画布后按方向键。在画布外上下滚动页面。",
    "canvasLabel": "可旋转的长方体，橙色 d 为空间对角线，青色 e 为底面对角线，绿色 c 为高；拖动或用方向键旋转，滚轮缩放",
    "legendD": "━ d · 空间对角线",
    "legendE": "━ e · 底面对角线",
    "legendC": "━ c · 高",
    "modelNote": "数学模型，非实测。无坐标轴；a、b 在底面，c 是高。半透明面的明暗与边线表示空间朝向；彩色三角形以透视教学叠层显示，外壳不会遮住它。投影中看似斜的方角在空间里仍为 90°。",
    "loadFail": "3D 图形加载失败：本站自托管的 three.js 模块未能载入，请检查网络后刷新页面重试。",
    "stop": "停止自转",
    "view": "回到清晰视角（停转）",
    "autoStatus": "正在缓慢自转；首次拖动、方向键或停止按钮会使本次访问停止自转。",
    "stillStatus": "视角已固定；仍可拖动旋转。",
    "s0result": "看见的关系：e 与高 c 垂直，它们和 d 构成竖直直角三角形。这依赖长方体的高垂直于整个底面。",
    "s1k": "第 1 步 · 计算",
    "s1t": "同一条 e，接起两次勾股",
    "s1e": "这一步要回答：已知长 a、宽 b、高 c，怎样求空间对角线 d（体内最远两个角的直线距离）？底面对角线 e（底面相对两角的连线）先由 a、b 算出，再与高 c 算出 d。先只改 a，保持 b、c 不变：看底面青色 e 和体内橙色 d 一起变长或变短；再只改 c，青色 e 不变，橙色 d 改变。滑杆改变真实棱长，不改变视角；所有长度用同一单位。",
    "s1bridge": "试验顺序：先固定 b、c，只改 a，确认 e 和 d 一起变化；再固定 a、b，只改 c，确认 e 不动而 d 变化。这样能把“先求底面 e、再把 e 与 c 组合”这两次勾股分开看。",
    "aLab": "长 a（单位）",
    "bLab": "宽 b（单位）",
    "cLab": "高 c（单位）",
    "book1": "① 底面直角三角形 · 求 e",
    "book2": "② 竖直直角三角形 · 求 d",
    "ledger1": "e = √(a² + b²)\n= √({a}² + {b}²) = √{base2} ≈ {e} 单位",
    "ledger2": "d = √(e² + c²) = √(a² + b² + c²)\n= √({base2} + {c}²) = √{sum} ≈ {d} 单位",
    "rounding": "当前值：显示保留 3 位小数；第二行使用未舍入的 e² = a² + b²，不拿显示的近似 e 再平方。长度表示距离，没有“越大越好”。",
    "s1result": "为什么能接起来？底面内 a ⟂ b，底面外 e ⟂ c。两个真实存在的直角三角形，才允许勾股连用两次。",
    "s2k": "第 2 步 · 自测",
    "s2t": "这一次，先选再揭晓",
    "s2e": "这一步要回答：另一个长方体的空间对角线 d（体内相对两角的直线距离）是多少？已知 a、b 是互相垂直的底边，c 是垂直底面的高。用上一步的两次勾股，先求底面对角线 e（底面相对两角的连线），再求 d；不沿三条棱绕路。选出 d 的值，答对才揭晓总结公式与适用条件。",
    "quizGiven": "新长方体：a = 1，b = 2，c = 2（单位）",
    "quizLabel": "选择空间对角线的长度",
    "locked": "先选一个答案，答对后点亮总结公式。",
    "quizIdle": "提示：先算底面 e²，再加高的平方。",
    "quizWrong": "再想一想：d² = (1² + 2²) + 2²。需要求的是长度，不是平方，也不是棱长之和。",
    "quizCorrect": "答对了：d = 3 单位。两次勾股，走通了！",
    "quizProof": "先有 e² = 1² + 2² = 5，再有 d² = 5 + 2² = 9，所以 d = 3 单位。",
    "condition": "只对长方体或三条两两垂直的棱成立：底面内与竖直截面内的两个直角三角形必须真实存在，斜盒子不能直接套用。",
    "finale": "带走一个方法：先在底面求距离，再把这段距离与高组成直角三角形。空间里的距离，仍从平面勾股出发。",
    "backPythagoras": "← 回到勾股第 4 步：用三边检验直角条件",
    "proofLink": "回看勾股第 2 步：用面积理解公式为何成立 →",
    "foot": "空间对角线 · 一步一交互"
  },
  "en": {
    "docTitle": "Space diagonal · Pythagoras twice",
    "languageLabel": "Language",
    "back": "← Knowledge Index",
    "format3d": "Interactive 3D",
    "category": "Mathematical Foundations",
    "stage": "Junior secondary",
    "pageTitle": "A box’s space diagonal",
    "tagline": "Given a box’s length, width and height, how far is it from one corner to the opposite corner? Use Pythagoras twice: across the base, then upwards.",
    "navLabel": "Step navigation",
    "nav0": "0 Find the triangle",
    "nav1": "1 Use it twice",
    "nav2": "2 Try it yourself",
    "s0k": "Step 0 · Observe",
    "s0t": "Which triangle contains the line inside?",
    "s0e": "Question: how does the straight line through the box connect to its base? You already know <a href=\"../pythagoras/#step2\">Pythagoras: in a right triangle, the squared legs add up to the squared hypotenuse</a>. The space diagonal d joins opposite, farthest corners through the box. The base diagonal e joins opposite corners on the bottom face. Fix length a = 2, width b = 3 and height c = 6, in the same unit. Drag to change the view. Follow cyan e to the bottom corner, then green c upwards: orange d closes this upright triangle. Small square marks indicate perpendicular lines.",
    "dragHint": "Drag to rotate; use the scroll wheel or pinch to zoom. Or focus the canvas and use the arrow keys. Scroll the page outside the canvas.",
    "canvasLabel": "Rotatable box: orange d is the space diagonal, cyan e the base diagonal, green c the height. Drag or use arrow keys to rotate, scroll to zoom",
    "legendD": "━ d · Space diagonal",
    "legendE": "━ e · Base diagonal",
    "legendC": "━ c · Height",
    "modelNote": "Mathematical model, not a measurement. No coordinate axes: a and b lie on the base; c is height. Translucent shaded faces and edges show depth and orientation. The colored triangle is an X-ray teaching overlay, visible through the shell. Its square angle marks remain 90° in space even when they look slanted in projection.",
    "loadFail": "The 3D view failed to load: this site’s self-hosted three.js module could not be loaded. Please check your connection and reload the page.",
    "stop": "Stop rotation",
    "view": "Clear view (stop rotation)",
    "autoStatus": "Rotating slowly. Your first drag, arrow key or stop action ends automatic rotation for this visit.",
    "stillStatus": "View held still. You can still drag to rotate.",
    "s0result": "What to notice: e is perpendicular to height c. Together with d, they form an upright right triangle, because a box’s height is perpendicular to the entire base.",
    "s1k": "Step 1 · Calculate",
    "s1t": "One shared e, two right triangles",
    "s1e": "Question: given length a, width b and height c, how do we find the space diagonal d, the straight distance between opposite corners inside? First find the base diagonal e, the line across the bottom face, from a and b. Then combine e with c to find d. Change only a, holding b and c fixed: watch cyan e and orange d grow or shrink together. Then change only c: e stays fixed while d changes. Sliders change actual edge lengths and preserve your view. All lengths share one unit.",
    "s1bridge": "Try this order: hold b and c fixed while changing only a; confirm that e and d move together. Then hold a and b fixed while changing only c; confirm that e stays put while d changes. This separates the two Pythagoras steps: find e on the base, then combine e with c.",
    "aLab": "Length a (units)",
    "bLab": "Width b (units)",
    "cLab": "Height c (units)",
    "book1": "① Base right triangle · Find e",
    "book2": "② Upright right triangle · Find d",
    "ledger1": "e = √(a² + b²)\n= √({a}² + {b}²) = √{base2} ≈ {e} units",
    "ledger2": "d = √(e² + c²) = √(a² + b² + c²)\n= √({base2} + {c}²) = √{sum} ≈ {d} units",
    "rounding": "Current values, shown to 3 decimal places. The second line uses exact e² = a² + b², never the rounded display of e. Length measures distance; larger is not inherently better.",
    "s1result": "Why can we connect the steps? On the base, a ⟂ b. In the upright triangle, e ⟂ c. Both right triangles must actually exist for Pythagoras to work twice.",
    "s2k": "Step 2 · Check yourself",
    "s2t": "Choose first, then reveal",
    "s2e": "Question: what is the space diagonal d, the straight distance between opposite corners inside a different box? Edges a and b are perpendicular on the base; height c is perpendicular to that base. Use the two right triangles: find the base diagonal e, the straight line between opposite bottom corners, then d. Do not follow a route along the three edges. Choose d below; a correct answer unlocks the summary formula and its conditions.",
    "quizGiven": "New box: a = 1, b = 2, c = 2 (units)",
    "quizLabel": "Choose the space diagonal length",
    "locked": "Choose an answer. A correct choice unlocks the summary formula.",
    "quizIdle": "Hint: find e² on the base, then add the squared height.",
    "quizWrong": "Try again: d² = (1² + 2²) + 2². We want a length, not its square or the sum of the edges.",
    "quizCorrect": "Correct: d = 3 units. You used Pythagoras twice!",
    "quizProof": "First e² = 1² + 2² = 5. Then d² = 5 + 2² = 9, so d = 3 units.",
    "condition": "This requires a rectangular box, or three mutually perpendicular edges: both the base and upright right triangles must really exist. Do not apply it directly to a skewed box.",
    "finale": "Take away a method: find a distance across the base, then pair that distance with the height in a right triangle. A distance in space still starts with Pythagoras in a plane.",
    "backPythagoras": "← Pythagoras, step 4: check the right-angle condition from three sides",
    "proofLink": "Revisit Pythagoras, step 2: see why the formula follows from areas →",
    "foot": "Space diagonal · One interaction at a time"
  }
};
let currentLang;
function getLang() {
  if (currentLang) return currentLang;
  try {
    const saved = localStorage.getItem('knowledge-lang');
    if (saved === 'zh' || saved === 'en') return currentLang = saved;
  } catch { /* In-memory language remains available without storage. */ }
  return currentLang = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}
function t(key, params = {}) {
  return STR[getLang()][key].replace(/\{(\w+)\}/g, (_, name) => String(params[name]));
}
function applyLang(lang) {
  currentLang = lang;
  try { localStorage.setItem('knowledge-lang', lang); } catch { /* Keep currentLang. */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-html]').forEach(el => el.innerHTML = t(el.dataset.i18nHtml));
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-lang]').forEach(el => {
    const active = el.dataset.lang === lang;
    el.classList.toggle('active', active);
    el.setAttribute('aria-pressed', String(active));
  });
  if (window.refreshLanguage) window.refreshLanguage();
}
getLang();
