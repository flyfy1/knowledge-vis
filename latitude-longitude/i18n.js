'use strict';
const STR = {
  zh: {
    languageLabel: "语言切换",
    back: "← 知识索引",
    navLabel: "步骤导航",
    catBadge: "地球与太空",
    stageBadge: "初中",
    foot: "经纬网 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页",
    docTitle: '经纬网 · 用两个角度说出地球上任意一点',
    pageTitle: '经纬网',
    tagline: '地球是个球，没有「上下左右」的格子——但只要说「北纬多少度、东经多少度」，就能在地球表面上定位任意一点。',
    nav0: '0 两个角度', nav1: '1 越往北圈越小', nav2: '2 剥橘子皮', nav3: '3 走哪条路最近', nav4: '4 经度与时间', nav5: '5 收束',
    ct0: '新加坡', ct1: '伦敦', ct2: '纽约', ct3: '悉尼', ct4: '里约热内卢', ct5: '内罗毕', ct6: '雷克雅未克', ct7: '北京', ctNone: '自己设定的点',
    dirN: '北纬', dirS: '南纬', dirE: '东经', dirW: '西经', dirEq: '赤道', dirPm: '本初子午线',
    unitKm: 'km', unitDeg: '°', unitH: '时', latFmt: '{dir}{v}°', lonFmt: '{dir}{v}°', mapLbl: '橙色椭圆 = 球面上同样大的圆（粗的是所选纬度）',
    s0k: '第 0 步 · 两个角度',
    s0t: '怎样用两个数，说出地球表面上任意一个地方？',
    s0e: '这一步要回答：为什么两个角度就能定位地球上任何一个点？<strong>纬度</strong>是从赤道向北或向南量的角度（0°–90°），纬度相同的点连成与赤道平行的圈，叫纬线；<strong>经度</strong>是从本初子午线（经过英国格林尼治）向东或向西量的角度（0°–180°），经度相同的点连成从北极到南极的半圆，叫经线。选一个城市，或拖滑杆设定纬度、经度，再拖「转动地球」看另一面。',
    s0stage: '地球（从斜上方看）：每 30° 画一条纬线和一条经线；橙点是所选的点，橙色弧线是它所在的纬线和经线；城市位置为近似值',
    s0canvas: '带经纬网的地球仪：所选点由所在的纬线和经线交叉定位',
    s0city: '选一个城市', s0lat: '纬度（北为正）', s0lon: '经度（东为正）', s0view: '转动地球（视角经度）',
    s0ro: '{name}：{lat}，{lon}。在纬线（离赤道 {la}°）与经线（离本初子午线 {lo}°）的交叉处。',
    s0hid: '（这个点现在在地球背面，转动地球就能看到。）',
    s0result: '结论：纬度 + 经度 = 一个确定的点；北极南极的经线汇在一点，所以极点处经度没有意义。条件：地球近似球体；城市坐标取近似值。',
    s1k: '第 1 步 · 越往北圈越小',
    s1t: '一度经度到底有多远，各个纬度一样吗？',
    s1e: '这一步要回答：沿纬线走 1° 经度，距离在赤道和在高纬度一样吗？纬线圈的周长是 2πR·cos φ（R ≈ 6371 km 是地球半径，φ 是纬度），越靠近极点圈越小，所以 1° 经度对应的实际距离也越短；而 1° 纬度（沿经线走）到处都约 111 km。拖纬度，看被高亮的纬线圈和读数。',
    s1stage: '左：高亮的橙色圈是所选纬度的纬线；右：cos φ 曲线（纬线周长与赤道的比例），橙点是当前纬度',
    s1canvas: '地球上的一条高亮纬线和 cos 曲线：纬度越高纬线圈越小',
    s1lat: '纬度（北为正）',
    s1ro: '纬度 {lat}°：这条纬线一圈长 {len} km（赤道的 {pct}%）；沿它走 1° 经度约 {dlon} km，而沿经线走 1° 纬度约 {dlat} km。',
    s1result: '结论：1° 纬度处处约 111 km，1° 经度 = 111.2 km × cos 纬度，在极点缩为 0。条件：把地球当作半径 6371 km 的球体；真实地球略扁。',
    s2k: '第 2 步 · 剥橘子皮',
    s2t: '把球面摊成长方形地图，哪里会被拉变形？',
    s2e: '这一步要回答：球面不能不变形地摊平，那变形发生在哪里？想象把地球像橘子皮一样剥开：每条纬线的真实长度是 2πR·cos φ，所以「橘子皮」两侧是弯的（图上拖到最左）；如果硬要摊成矩形的世界地图，每条纬线都得被拉到赤道那么长，高纬度处横向被拉伸的倍数是 1 / cos φ。拖「摊平程度」，看橙色的圆（球面上真实的圆）被拉成了什么样。',
    s2stage: '地图：横轴经度、纵轴纬度；左端是橘子皮（每条纬线保持真实长度），右端是矩形地图；橙色椭圆是球面上同样大小的圆被拉伸后的样子',
    s2canvas: '地球摊平的过程：橘子皮形状逐步拉成矩形，高纬度的圆被横向拉长',
    s2u: '摊平程度（0 橘子皮 → 100 矩形）', s2lat: '被观察的圆所在纬度',
    s2ro: '摊平程度 {u}%：在纬度 {lat}°，横向被拉伸为真实的 {k} 倍，面积被放大为 {k} 倍。',
    s2none: '还没拉伸：每条纬线都保持真实长度，圆还是圆（但地图边缘是弯的）。',
    s2result: '结论：矩形世界地图把高纬度地区横向拉大 1/cos φ 倍，所以格陵兰看起来比实际大得多；任何平面地图都要在形状、面积、距离中取舍。条件：这里比较的是「橘子皮（正弦）」和「等距矩形」两种摊法，还有许多别的投影。',
    s3k: '第 3 步 · 走哪条路最近',
    s3t: '两个城市之间，最短的路在地图上为什么是弯的？',
    s3e: '这一步要回答：在球面上两点之间的最短路线是什么，为什么在矩形地图上看是弯的？球面上最短的路是过这两点和球心的平面截出的圆弧，叫<strong>大圆航线</strong>，长度用半正矢公式（haversine）算。如果在矩形地图上直接用度数当平面坐标去量，会得到偏大的距离。选两个城市，比较两个数。',
    s3stage: '上：地球上的两城市和大圆路线（橙）；下：矩形地图——橙色曲线是大圆航线，灰色虚线是在地图上直接连的直线',
    s3canvas: '两个城市之间的大圆航线：球面上是最短的圆弧，在矩形地图上是弯曲的',
    s3a: '出发城市', s3b: '到达城市',
    s3ro: '{a} → {b}：大圆距离 {gc} km；把地图当平面、直接按度数量得 {flat} km，差了 {diff}%。',
    s3same: '出发和到达是同一个城市，距离为 0。',
    s3result: '结论：球面最短路是大圆弧；矩形地图上的直线并不最短，尤其在高纬度和跨经度大时差别明显。条件：球形地球（R = 6371 km），不含地形与航空管制；「按度数量」是把 1° 都当成 111.2 km 的粗略做法。',
    s4k: '第 4 步 · 经度与时间',
    s4t: '为什么往东走，时间会变早？',
    s4e: '这一步要回答：经度和时间有什么关系？地球 24 小时自转 360°，所以每 15° 经度对应 1 小时。<strong>地方太阳时</strong>是以太阳正在头顶的时刻为正午的时间：世界时（UTC，本初子午线的时间）加上 经度 ÷ 15。拖世界时，看白天和黑夜的分界怎样在地图上向西移动；选一个城市看它的地方太阳时。',
    s4stage: '矩形地图：亮的一半是白天（假设春秋分，太阳直射赤道），暗的一半是夜；橙色竖线是正午所在的经线；点是各城市',
    s4canvas: '世界地图上的昼夜分界随世界时向西移动，每 15° 经度差 1 小时',
    s4utc: '世界时（UTC）', s4city: '城市',
    s4ro: '世界时 {utc}：正午在东经 {noon}°；{city}（{lon}）的地方太阳时 {local}，{dn}。',
    s4day: '那里是白天', s4night: '那里是夜里',
    s4result: '结论：经度每向东 15°，地方太阳时多 1 小时；白天夜晚的分界随地球自转西移。条件：用「春秋分、地方太阳时」简化，真实时区按国家和地区规定，夏令时与季节也会改变昼夜分界的形状。',
    s5k: '第 5 步 · 收束', s5t: '把经纬网说给别人听',
    s5e: '纬度（离赤道的角度）和经度（离本初子午线的角度）合起来就能定位地球上任何一点；球面摊成平面一定会变形。',
    f1t: '定位', f1b: '纬线平行于赤道，经线汇于两极；两个角度定一个点（第 0 步）。',
    f2t: '尺度', f2b: '1° 纬度约 111 km，1° 经度 = 111 km × cos 纬度（第 1 步）；摊平时高纬度被横向拉伸（第 2 步）。',
    f3t: '路线与时间', f3b: '最短路是大圆弧（第 3 步）；15° 经度对应 1 小时（第 4 步）。',
    modelT: '模型实话',
    model1: '地球当作半径 6371 km 的球体；真实地球略扁，赤道半径比极半径大约 21 km。',
    model2: '本页地图不画海岸线，城市坐标为近似值；等距矩形与「橘子皮」只是众多投影中的两种。',
    model3: '昼夜分界用春秋分、不计大气折射；时区与夏令时是人为规定，与地方太阳时不同。',
    nextT: '继续看（站内）',
    l1: '坐标系与点的位置 · 第 0 步：平面上用 (x, y) 定位，球面上改用两个角度',
    l2: '昼夜交替 · 第 2 步：地球自转一圈，昼夜怎样扫过各个经度',
    l3: '地球公转与四季 · 第 1 步：太阳直射点的纬度怎样随季节变化'
  },
  en: {
    languageLabel: "Language",
    back: "← Knowledge Index",
    navLabel: "Step navigation",
    catBadge: "Earth & Space",
    stageBadge: "Junior High",
    foot: "Latitude & Longitude · Built by Claude Sonnet via Mini Claude Code · static bilingual page",
    docTitle: 'Latitude & Longitude · Two Angles Name Any Spot on Earth',
    pageTitle: 'Latitude & Longitude',
    tagline: 'Earth is a sphere with no built-in grid — yet “so many degrees north, so many east” pins down any point on its surface.',
    nav0: '0 Two angles', nav1: '1 Circles shrink', nav2: '2 Peel the orange', nav3: '3 Shortest route', nav4: '4 Longitude & time', nav5: '5 Recap',
    ct0: 'Singapore', ct1: 'London', ct2: 'New York', ct3: 'Sydney', ct4: 'Rio de Janeiro', ct5: 'Nairobi', ct6: 'Reykjavik', ct7: 'Beijing', ctNone: 'A point you set',
    dirN: 'N', dirS: 'S', dirE: 'E', dirW: 'W', dirEq: 'the equator', dirPm: 'the prime meridian',
    unitKm: 'km', unitDeg: '°', unitH: 'h', latFmt: '{v}°{dir}', lonFmt: '{v}°{dir}', mapLbl: 'Orange ellipses = same-size circles on the sphere (bold = chosen latitude)',
    s0k: 'Step 0 · Two angles',
    s0t: 'How do two numbers name any place on Earth’s surface?',
    s0e: 'This step asks: why do two angles locate any point on Earth? <strong>Latitude</strong> is the angle north or south of the equator (0°–90°); points of equal latitude form a circle parallel to the equator, a parallel. <strong>Longitude</strong> is the angle east or west of the prime meridian (through Greenwich in Britain) (0°–180°); points of equal longitude form a half-circle from pole to pole, a meridian. Pick a city or drag the sliders for latitude and longitude, and drag “rotate the globe” to see the far side.',
    s0stage: 'The globe (seen from above and to the side): a parallel and a meridian every 30°; the orange dot is the chosen point and the orange arcs are its parallel and meridian; city positions are approximate',
    s0canvas: 'A globe with its grid: the chosen point sits where its parallel and meridian cross',
    s0city: 'Pick a city', s0lat: 'Latitude (north positive)', s0lon: 'Longitude (east positive)', s0view: 'Rotate the globe (view longitude)',
    s0ro: '{name}: {lat}, {lon}. It sits where the parallel ({la}° from the equator) crosses the meridian ({lo}° from the prime meridian).',
    s0hid: '(This point is on the far side of the globe right now; rotate to see it.)',
    s0result: 'Takeaway: latitude + longitude = one definite point; meridians meet at the poles, so longitude means nothing exactly at a pole. Holds with Earth approximated as a sphere and approximate city coordinates.',
    s1k: 'Step 1 · Circles shrink',
    s1t: 'How far is one degree of longitude, and is it the same at every latitude?',
    s1e: 'This step asks: walking 1° of longitude along a parallel, is the distance the same at the equator and at high latitude? A parallel’s circumference is 2πR·cos φ (R ≈ 6371 km is Earth’s radius, φ the latitude); the nearer a pole, the smaller the circle, so 1° of longitude covers less ground — while 1° of latitude (along a meridian) is about 111 km everywhere. Drag the latitude and watch the highlighted parallel and the readout.',
    s1stage: 'Left: the orange ring is the parallel at the chosen latitude; right: the cos φ curve (a parallel’s length relative to the equator), the orange dot is the current latitude',
    s1canvas: 'One highlighted parallel on the globe and the cos curve: the higher the latitude, the smaller the circle',
    s1lat: 'Latitude (north positive)',
    s1ro: 'Latitude {lat}°: this parallel is {len} km round ({pct}% of the equator); 1° of longitude along it is about {dlon} km, while 1° of latitude along a meridian is about {dlat} km.',
    s1result: 'Takeaway: 1° of latitude is about 111 km everywhere, 1° of longitude = 111.2 km × cos latitude, shrinking to 0 at the poles. Holds treating Earth as a 6371 km sphere; the real Earth is slightly flattened.',
    s2k: 'Step 2 · Peel the orange',
    s2t: 'Flatten the sphere into a rectangular map: where does it get stretched?',
    s2e: 'This step asks: a sphere cannot be flattened without distortion — where does it show up? Imagine peeling Earth like an orange: each parallel’s true length is 2πR·cos φ, so the “peel” has curved sides (drag all the way left). To force a rectangular world map, every parallel has to be stretched to the equator’s length, so at high latitude the horizontal stretch is 1 / cos φ. Drag “flatten” and watch what happens to the orange circle (a true circle on the sphere).',
    s2stage: 'Map: x longitude, y latitude; the left end is the orange peel (each parallel keeps its true length), the right end a rectangle; the orange ellipse is how a same-size circle on the sphere looks once stretched',
    s2canvas: 'Flattening the globe: the orange-peel shape is stretched into a rectangle and circles at high latitude are pulled wide',
    s2u: 'Flatten (0 peel → 100 rectangle)', s2lat: 'Latitude of the observed circle',
    s2ro: 'Flatten {u}%: at latitude {lat}° the horizontal stretch is {k}× the truth and the area is magnified {k}×.',
    s2none: 'Not stretched yet: every parallel keeps its true length and the circle stays a circle (but the map edges are curved).',
    s2result: 'Takeaway: a rectangular world map stretches high latitudes sideways by 1/cos φ, which is why Greenland looks far bigger than it is; every flat map trades off shape, area and distance. Compares only the “orange peel (sinusoidal)” and “equirectangular” layouts; many other projections exist.',
    s3k: 'Step 3 · Shortest route',
    s3t: 'Why is the shortest route between two cities curved on a flat map?',
    s3e: 'This step asks: what is the shortest path between two points on a sphere, and why does it look curved on a rectangular map? The shortest path is the arc cut by the plane through both points and Earth’s centre, a <strong>great circle</strong>, and its length comes from the haversine formula. If you instead treat degrees on the rectangular map as flat coordinates, you get too big a distance. Pick two cities and compare the two numbers.',
    s3stage: 'Top: the two cities and the great-circle route on the globe (orange); bottom: the rectangular map — the orange curve is the great circle, the grey dashed line is the straight line drawn on the map',
    s3canvas: 'The great-circle route between two cities: the shortest arc on the sphere, a curve on the rectangular map',
    s3a: 'From', s3b: 'To',
    s3ro: '{a} → {b}: great-circle distance {gc} km; measuring the map as flat degrees gives {flat} km, which is {diff}% off.',
    s3same: 'The start and end are the same city, so the distance is 0.',
    s3result: 'Takeaway: the shortest route on a sphere is the great-circle arc; a straight line on a rectangular map is not shortest, especially at high latitude and across large longitude gaps. Holds for a spherical Earth (R = 6371 km), ignoring terrain and air traffic rules; “measuring in degrees” treats every degree as 111.2 km, a crude method.',
    s4k: 'Step 4 · Longitude & time',
    s4t: 'Why does the time get earlier as you go east?',
    s4e: 'This step asks: how are longitude and time related? Earth turns 360° in 24 hours, so every 15° of longitude is 1 hour. <strong>Local solar time</strong> is time with noon when the Sun is overhead: universal time (UTC, the time on the prime meridian) plus longitude ÷ 15. Drag the UTC and watch the day/night boundary slide west across the map; pick a city to read its local solar time.',
    s4stage: 'Rectangular map: the bright half is day (assuming an equinox, Sun over the equator), the dark half is night; the orange vertical line is the meridian at noon; dots are cities',
    s4canvas: 'Day and night on a world map: the boundary moves west with universal time, 15° of longitude per hour',
    s4utc: 'Universal time (UTC)', s4city: 'City',
    s4ro: 'UTC {utc}: noon is at {noon}° longitude; local solar time in {city} ({lon}) is {local}, {dn}.',
    s4day: 'it is daytime there', s4night: 'it is night there',
    s4result: 'Takeaway: each 15° east adds an hour of local solar time, and the day/night boundary moves west as Earth turns. Simplified with an equinox and local solar time; real time zones are set by countries, and daylight saving and the season change the shape of the boundary.',
    s5k: 'Step 5 · Recap', s5t: 'Explain latitude and longitude to a friend',
    s5e: 'Latitude (angle from the equator) and longitude (angle from the prime meridian) together locate any point on Earth; flattening a sphere always distorts.',
    f1t: 'Locating', f1b: 'Parallels run parallel to the equator, meridians meet at the poles; two angles fix a point (step 0).',
    f2t: 'Scale', f2b: '1° of latitude is about 111 km, 1° of longitude = 111 km × cos latitude (step 1); flattening stretches high latitudes sideways (step 2).',
    f3t: 'Routes and time', f3b: 'The shortest route is a great-circle arc (step 3); 15° of longitude is one hour (step 4).',
    modelT: 'Honest model notes',
    model1: 'Earth is a sphere of radius 6371 km; the real Earth is slightly flattened, with an equatorial radius about 21 km larger than the polar one.',
    model2: 'The maps here draw no coastlines and city coordinates are approximate; equirectangular and “orange peel” are just two of many projections.',
    model3: 'Day/night uses an equinox and ignores refraction; time zones and daylight saving are human conventions, different from local solar time.',
    nextT: 'Keep going (on this site)',
    l1: 'Coordinate Plane · step 0: (x, y) locate a point on a plane; on a sphere two angles take over',
    l2: 'Day & Night · step 2: how day and night sweep across the longitudes in one turn',
    l3: 'Earth’s Orbit & the Seasons · step 1: how the Sun’s overhead latitude changes with the seasons'
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
