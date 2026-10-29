'use strict';
const STR = {
  zh: {
    languageLabel: "语言切换",
    back: "← 知识索引",
    navLabel: "步骤导航",
    catBadge: "地球与太空",
    stageBadge: "初中",
    foot: "等高线 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页",
    docTitle: '等高线 · 把山一层层切开摊在纸上',
    pageTitle: '等高线',
    tagline: '地图上那些一圈圈的曲线，是把山体按相同高度一层层切开、再从正上方看下去的样子——圈越密的地方越陡。',
    nav0: '0 切开的山', nav1: '1 疏密看陡缓', nav2: '2 间距与细节', nav3: '3 水往哪流', nav4: '4 走一条路线', nav5: '5 收束',
    terHill: '山丘（带小山包）', terRidge: '山脊', terSaddle: '双峰与鞍部', terBasin: '环形山盆地',
    unitM: 'm', unitDeg: '°',
    s0k: '第 0 步 · 切开的山',
    s0t: '纸是平的，山是立体的，一圈圈的线是怎么来的？',
    s0e: '这一步要回答：地图上的等高线是怎样得到的？想象用一个水平的平面把山切开：切在海拔 H 的位置，切面和山表面相交的那一圈曲线上，每个点的海拔都正好是 H，这条线就是 <strong>等高线</strong>。每隔相同的高度切一刀，再从正上方往下看，就得到一圈圈的线。拖「切到多高」，上图是山的侧面，下图是正上方看到的地图，已经切过的等高线会留在图上。',
    s0stage: '上：山的剖面（侧面）和水平切面；下：从正上方看的地图，每隔 10 m 一条等高线；亮线是当前这一刀',
    s0canvas: '山的侧面剖面和对应的等高线地图：切面升高，一圈圈等高线依次出现',
    s0h: '切到多高', s0reset: '切面放回地面',
    s0ro: '切面高度 {h} m：已经切出 {n} 条等高线（每隔 {iv} m 一条）；当前最高的一条在海拔 {top} m。',
    s0result: '结论：同一条等高线上所有点的海拔相同；相邻两条线相差一个固定的「等高距」（这里 10 m）。条件：这是虚构的地形；真实地图的等高距按比例尺和地形选取（如 5、10、20 m）。',
    s1k: '第 1 步 · 疏密看陡缓',
    s1t: '等高线挤在一起的地方，为什么说坡陡？',
    s1e: '这一步要回答：怎么从等高线的疏密看出坡有多陡？相邻两条等高线的海拔差固定（等高距 10 m），如果水平距离很短，说明在很短的水平距离里升了 10 m，坡就陡；水平距离很长，坡就缓。<strong>坡度</strong>是坡面与水平面的夹角。拖两个滑杆移动探测点，看箭头（上坡方向）、相邻两线的水平距离和坡度。',
    s1stage: '地图：橙点是探测点，箭头指向最陡的上坡方向，青色线段量出这里相邻两条等高线的水平距离',
    s1canvas: '一座山丘的等高线地图：探测点所在位置的上坡方向和相邻等高线间距',
    s1x: '探测点左右位置', s1y: '探测点上下位置',
    s1ro: '探测点海拔 {z} m；相邻等高线（间隔 {iv} m）的水平距离约 {d} m，坡度约 {a}°（{kind}）。',
    s1gentle: '缓坡', s1mid: '中等坡', s1steep: '陡坡', s1flat: '几乎是平地，等高线间距极大',
    s1result: '结论：等高线越密，水平距离越短，坡越陡；等高线越疏，坡越缓。条件：用有限差分算坡度；地图宽 1000 m，高度是虚构的；等高线间距只在局部近似平行时成立。',
    s2k: '第 2 步 · 间距与细节',
    s2t: '等高距取大还是取小？小山包会不会被漏掉？',
    s2e: '这一步要回答：等高距选得越大，地图上会丢掉什么？<strong>等高距</strong>是相邻两条等高线的海拔差。选一种地形，拖等高距：等高距小，线多，细节多，但图更密；等高距大，线少，图清爽，但低于一个等高距的起伏（比如小山包）就画不出来。',
    s2stage: '同一块地形用不同等高距画出：数字是整条线的海拔（米），每 5 条标一次',
    s2canvas: '所选地形的等高线图：等高距越大，等高线越少，小起伏消失',
    s2ter: '地形', s2iv: '等高距',
    s2ro: '{ter}：最高点约 {top} m，等高距 {iv} m，共画出 {n} 条等高线。{note}',
    s2lost: '提示：有一些小起伏（如小山包）低于一个等高距，可能已经从图上消失了。',
    s2ok: '提示：这个等高距下，主要地形都画得出来。',
    s2result: '结论：等高距决定图能表达的最小起伏；越大越概括，越小越详细。条件：本页地形是虚构函数，用等距栅格近似画线，线条略有锯齿。',
    s3k: '第 3 步 · 水往哪流',
    s3t: '把一滴水放在山坡上，它会沿什么方向流？',
    s3e: '这一步要回答：水在地形上往哪个方向流，和等高线有什么几何关系？水总是沿<strong>最陡的下坡方向</strong>流，这个方向和等高线垂直。选一块地形，设好水滴的位置，按「放水」，看水滴走出来的路径怎样一路垂直穿过等高线，最后流到哪里。',
    s3stage: '地图：蓝点是水滴起点，蓝线是水流经过的路径（越走越长）；路径每一步都垂直于所在位置的等高线',
    s3canvas: '地图上的水流路径：垂直穿过等高线，从高处流向低处',
    s3ter: '地形', s3x: '水滴左右位置', s3y: '水滴上下位置', s3go: '放水', s3reset: '清除水流',
    s3ro0: '设好位置后按「放水」。',
    s3roEdge: '水流从海拔 {z0} m 一路下降到 {z1} m，流出了地图边界，路径总长约 {len} m。',
    s3roPit: '水流从海拔 {z0} m 下降到 {z1} m，停在一个低洼处（四周都更高），路径总长约 {len} m。',
    s3result: '结论：水沿垂直于等高线的最陡下坡方向流，所以山脊线分开水流，山谷线汇集水流，盆地里水无处可去。条件：只看地形，不含土壤渗透和水量；用固定步长沿梯度下降的方向走。',
    s4k: '第 4 步 · 走一条路线',
    s4t: '沿着一条直线路线走，一共要爬多高？',
    s4e: '这一步要回答：沿一条路线走，海拔怎么变化，累计要上坡多少米？起点固定在地图左侧中间，调方向和长度确定路线，剖面图把路线穿过每条等高线的位置依次点出来。拖「走到哪里」，看已走过的路程累计上坡和下坡。',
    s4stage: '上：地图和路线（橙线），圆点是目前走到的位置；下：路线的海拔剖面，黄点是每次穿过等高线的位置',
    s4canvas: '地图上的路线和对应的海拔剖面：每穿过一条等高线，剖面上就多一个点',
    s4th: '路线方向（0° 为向右，正为向下）', s4len: '路线长度', s4p: '走到哪里',
    s4ro: '路线长约 {len} m；已走 {p}%：海拔 {z} m；累计上坡 {up} m、下坡 {down} m；整条路线最高 {max} m、穿过 {n} 条等高线。',
    s4result: '结论：剖面由路线与各条等高线的交点决定；累计上坡不等于终点和起点的海拔差，因为中间可能先上后下。条件：路线取直线并受地图边界截断；剖面用高密度采样近似。',
    s5k: '第 5 步 · 收束', s5t: '把等高线说给别人听',
    s5e: '等高线是同一海拔的点连成的线：疏密看陡缓，数字看高低，垂直于它的方向是水流的方向。',
    f1t: '怎么来的', f1b: '水平面切山，切口俯视就是等高线，相邻两条差一个等高距（第 0 步）。',
    f2t: '怎么读', f2b: '密 = 陡，疏 = 缓；等高距决定能看到多小的起伏（第 1–2 步）。',
    f3t: '怎么用', f3b: '水垂直于等高线往低处流；路线穿过等高线的位置画出剖面（第 3–4 步）。',
    modelT: '模型实话',
    model1: '地形是虚构的光滑函数，不是真实山体；真实地图靠测量得到，有悬崖、陡坎等不连续的地方。',
    model2: '等高线用栅格线性插值画出，略有锯齿；水流用固定步长梯度下降近似。',
    model3: '地图宽度取 1000 m，高度取米；坡度分档（缓 < 5°、中 5–12°、陡 > 12°）是本页的教学约定。',
    nextT: '继续看（站内）',
    l1: '导数 · 第 0 步：坡度其实就是变化率，等高线越密变化越快',
    l2: '梯度下降 · 第 0 步：水沿最陡下坡方向走，和算法「沿梯度往下」是一回事',
    l3: '坐标系与点的位置 · 第 0 步：地图上用 (x, y) 定位，再加一个海拔就是三维位置'
  },
  en: {
    languageLabel: "Language",
    back: "← Knowledge Index",
    navLabel: "Step navigation",
    catBadge: "Earth & Space",
    stageBadge: "Junior High",
    foot: "Contour Lines · Built by Claude Sonnet via Mini Claude Code · static bilingual page",
    docTitle: 'Contour Lines · Slice a Mountain and Lay It Flat',
    pageTitle: 'Contour Lines',
    tagline: 'The rings on a map come from slicing a hill at equal heights and looking straight down: where the rings crowd together, the ground is steep.',
    nav0: '0 Sliced hill', nav1: '1 Spacing = steepness', nav2: '2 Interval & detail', nav3: '3 Where water goes', nav4: '4 Walk a route', nav5: '5 Recap',
    terHill: 'Hill (with a knoll)', terRidge: 'Ridge', terSaddle: 'Twin peaks & saddle', terBasin: 'Crater basin',
    unitM: 'm', unitDeg: '°',
    s0k: 'Step 0 · Sliced hill',
    s0t: 'Paper is flat, a hill is 3D — where do the rings come from?',
    s0e: 'This step asks: how are contour lines made? Imagine slicing the hill with a horizontal plane at height H: where the plane meets the surface, every point has altitude exactly H, and that curve is a <strong>contour line</strong>. Slice at equal height steps, look straight down, and you get rings. Drag “slice height”: the top picture is a side view of the hill, the bottom is the map seen from above, and the contours already cut stay on it.',
    s0stage: 'Top: a side cross-section of the hill and the horizontal slicing plane; bottom: the map from directly above, one contour every 10 m; the bright line is the current slice',
    s0canvas: 'A side cross-section of the hill and its contour map: as the slicing plane rises, rings appear one by one',
    s0h: 'Slice height', s0reset: 'Put the plane back on the ground',
    s0ro: 'Slice height {h} m: {n} contour lines cut so far (one every {iv} m); the highest is at {top} m.',
    s0result: 'Takeaway: every point on one contour has the same altitude, and neighbouring lines differ by a fixed “contour interval” (10 m here). Holds for this made-up terrain; real maps choose the interval to suit scale and terrain (such as 5, 10 or 20 m).',
    s1k: 'Step 1 · Spacing = steepness',
    s1t: 'Why does crowded contour spacing mean a steep slope?',
    s1e: 'This step asks: how do you read steepness from contour spacing? Neighbouring contours differ by a fixed height (the 10 m interval). If the horizontal distance between them is short, the ground rises 10 m over a short run, so it is steep; a long distance means a gentle slope. The <strong>slope angle</strong> is the angle between the ground and the horizontal. Drag the two sliders to move the probe and read the arrow (uphill), the horizontal gap between neighbouring lines, and the slope angle.',
    s1stage: 'Map: the orange dot is the probe, the arrow points steepest uphill, and the cyan segment measures the horizontal gap between neighbouring contours here',
    s1canvas: 'Contour map of a hill: the probe’s uphill direction and the gap between neighbouring contours at that spot',
    s1x: 'Probe left–right', s1y: 'Probe up–down',
    s1ro: 'Probe altitude {z} m; the horizontal gap between neighbouring contours ({iv} m apart) is about {d} m and the slope is about {a}° ({kind}).',
    s1gentle: 'gentle slope', s1mid: 'moderate slope', s1steep: 'steep slope', s1flat: 'almost flat, contours very far apart',
    s1result: 'Takeaway: the closer the contours, the shorter the gap and the steeper the slope; the sparser, the gentler. Slope comes from a finite difference; the map is 1000 m wide with made-up heights, and the gap idea holds where neighbouring lines run roughly parallel.',
    s2k: 'Step 2 · Interval & detail',
    s2t: 'Should the contour interval be big or small — can a small knoll be lost?',
    s2e: 'This step asks: the larger the interval, what does the map lose? The <strong>contour interval</strong> is the height difference between neighbouring contours. Pick a terrain and drag the interval: a small interval gives many lines and lots of detail but a crowded map; a large one is clean but any bump smaller than one interval (like a knoll) cannot be drawn.',
    s2stage: 'The same terrain drawn with different intervals: numbers are the line’s altitude in metres, every 5th line labelled',
    s2canvas: 'Contour map of the chosen terrain: a larger interval gives fewer lines and small bumps disappear',
    s2ter: 'Terrain', s2iv: 'Contour interval',
    s2ro: '{ter}: highest point about {top} m, interval {iv} m, {n} contour lines drawn. {note}',
    s2lost: 'Note: some small bumps (like the knoll) are lower than one interval and may have vanished from the map.',
    s2ok: 'Note: at this interval the main landforms are all drawn.',
    s2result: 'Takeaway: the interval sets the smallest relief a map can show: larger = more generalised, smaller = more detailed. Holds for this made-up terrain, drawn from a regular grid, so lines are slightly jagged.',
    s3k: 'Step 3 · Where water goes',
    s3t: 'Put a drop of water on a slope — which way does it flow?',
    s3e: 'This step asks: which way does water flow over the terrain, and how does that relate to contour lines? Water flows along the <strong>steepest downhill direction</strong>, which is perpendicular to the contours. Pick a terrain, set where the drop starts, press “Release water”, and watch the path cross every contour at a right angle and see where it ends.',
    s3stage: 'Map: the blue dot is where the drop starts and the blue line is its path (growing as it goes); every step is perpendicular to the contour at that spot',
    s3canvas: 'A water path on the map: crossing contours at right angles, from high ground to low',
    s3ter: 'Terrain', s3x: 'Drop left–right', s3y: 'Drop up–down', s3go: 'Release water', s3reset: 'Clear the flow',
    s3ro0: 'Set the position, then press “Release water”.',
    s3roEdge: 'The water ran from {z0} m down to {z1} m and left the map edge; the path is about {len} m long.',
    s3roPit: 'The water ran from {z0} m down to {z1} m and stopped in a hollow (higher all around); the path is about {len} m long.',
    s3result: 'Takeaway: water follows the steepest downhill direction, perpendicular to the contours, so ridges split flow, valleys collect it, and a basin traps it. Holds for terrain shape only, ignoring soil absorption and volume; the path uses fixed steps down the gradient.',
    s4k: 'Step 4 · Walk a route',
    s4t: 'Walking a straight route, how much climbing is there in total?',
    s4e: 'This step asks: along a route, how does altitude change and how many metres of ascent add up? The start is fixed at the left-middle of the map; set the direction and length to choose the route, and the profile marks every place the route crosses a contour. Drag “how far along” to see ascent and descent accumulate over the part already walked.',
    s4stage: 'Top: the map and route (orange line), the dot is the current position; bottom: the route’s altitude profile, yellow dots mark each contour crossing',
    s4canvas: 'The route on the map and its altitude profile: each contour crossed adds a point to the profile',
    s4th: 'Route direction (0° = right, positive = down)', s4len: 'Route length', s4p: 'How far along',
    s4ro: 'Route about {len} m long; {p}% walked: altitude {z} m; total ascent {up} m, descent {down} m so far; the whole route peaks at {max} m and crosses {n} contours.',
    s4result: 'Takeaway: the profile is set by where the route crosses each contour; total ascent is not the same as end minus start altitude, since it may climb then drop. Holds for a straight route clipped at the map edge, with the profile from dense sampling.',
    s5k: 'Step 5 · Recap', s5t: 'Explain contour lines to a friend',
    s5e: 'Contours join points of equal altitude: spacing shows steepness, numbers show height, and the direction perpendicular to them is where water flows.',
    f1t: 'Where they come from', f1b: 'A horizontal plane slices the hill and the cut seen from above is the contour; neighbours differ by one interval (step 0).',
    f2t: 'Reading them', f2b: 'Close = steep, far = gentle; the interval sets the smallest relief you can see (steps 1–2).',
    f3t: 'Using them', f3b: 'Water runs across contours at right angles downhill; a route’s crossings draw its profile (steps 3–4).',
    modelT: 'Honest model notes',
    model1: 'The terrain is a made-up smooth function, not a real mountain; real maps are surveyed and have cliffs and other discontinuities.',
    model2: 'Contours come from grid interpolation and look slightly jagged; the water path is fixed-step gradient descent.',
    model3: 'The map is 1000 m wide with heights in metres; the slope bands (gentle < 5°, moderate 5–12°, steep > 12°) are this page’s teaching convention.',
    nextT: 'Keep going (on this site)',
    l1: 'Derivatives · step 0: slope is just a rate of change — the denser the contours, the faster it changes',
    l2: 'Gradient Descent · step 0: water runs steepest downhill, the same as the algorithm’s “follow the gradient down”',
    l3: 'Coordinate Plane · step 0: a map locates things by (x, y); add altitude and you have a 3D position'
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
