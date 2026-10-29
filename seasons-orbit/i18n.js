'use strict';
const STR = {
  zh: {
    languageLabel: "语言切换",
    back: "← 知识索引",
    navLabel: "步骤导航",
    catBadge: "地球与太空",
    stageBadge: "初中",
    foot: "地球公转与四季 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页",
    docTitle: '地球公转与四季 · 地轴是斜的',
    pageTitle: '地球公转与四季',
    tagline: '夏天不是因为地球离太阳近，而是因为地轴斜着——绕太阳一圈，南北半球轮流把「脸」朝向太阳，昼夜长短也跟着轮流占上风。',
    nav0: '0 离得近就热？', nav1: '1 斜着的地轴', nav2: '2 正午太阳多高', nav3: '3 昼有多长', nav4: '4 没有倾斜会怎样', nav5: '5 收束',
    mon0: '1月', mon1: '2月', mon2: '3月', mon3: '4月', mon4: '5月', mon5: '6月', mon6: '7月', mon7: '8月', mon8: '9月', mon9: '10月', mon10: '11月', mon11: '12月',
    dateFmt: '{m}{d}日',
    unitDeg: '°', unitH: '小时', unitAu: 'AU', unitMkm: '百万千米',
    s0orbit: '轨道（真实比例，近似正圆）', s2yl: '正午太阳高度 (°)', lblDay: '日期', lblLat: '纬度', lblEps: '地轴倾角 ε',
    play: '让一年转起来', pause: '暂停',
    north: '北', south: '南',
    s0k: '第 0 步 · 离得近就热？',
    s0t: '北半球的夏天，地球是离太阳最近的时候吗？',
    s0e: '这一步要回答：夏天热，是因为地球那时离太阳更近吗？地球绕太阳一圈叫<strong>公转</strong>，一圈约 365 天，轨道是一个很扁的椭圆。<strong>天文单位 AU</strong> 是日地平均距离（约 1.5 亿千米）。拖日期，看日地距离怎么变，再看北半球那时是什么季节。',
    s0stage: '上：按真实比例的轨道（几乎是正圆），橙点是地球；下：日地距离随日期的曲线（纵轴放大了很多倍才看得出来）',
    s0canvas: '地球轨道图和日地距离曲线：距离一年只变化约 3%，最近在 1 月初',
    s0day: '日期', s0play: '让一年转起来', s0pause: '暂停',
    s0ro: '{date}：日地距离 {au} AU（{mkm} 百万千米）；{note}',
    s0near: '这时离太阳比较近，可北半球偏冷——所以季节不是由距离决定的。',
    s0far: '这时离太阳比较远，可北半球偏热——同样说明季节不是由距离决定的。',
    s0mid: '这时日地距离接近平均值。',
    s0result: '结论：日地距离一年只变化约 ±1.7%，最近在 1 月初（北半球冬天），最远在 7 月初（北半球夏天）——距离不是季节的原因。条件：用近似公式 r = 1 − 0.0167 cos(2π(N − 2)/365.25) AU，N 是从 1 月 1 日起的天数。',
    s1k: '第 1 步 · 斜着的地轴',
    s1t: '地轴斜着，绕太阳一圈时会发生什么？',
    s1e: '这一步要回答：地球绕太阳转，地轴的朝向有什么特点，它怎样让太阳直射点来回移动？<strong>地轴</strong>是地球自转的假想转轴，它和公转轨道面的垂线之间有约 23.4° 的夹角，而且一年里始终指向同一个方向（几乎指向北极星）。所以公转到不同位置，北半球有时朝向太阳、有时背向太阳。<strong>太阳直射点的纬度</strong>（也叫赤纬 δ）就是太阳正好在头顶的那条纬线。拖日期或按播放。',
    s1stage: '斜视图：椭圆是公转轨道（纵向压扁了），太阳在中间；每个地球的亮面朝向太阳，直线是地轴（方向永远不变），N 是北极',
    s1canvas: '地球绕太阳公转的斜视图：地轴方向不变，不同位置北半球朝向或背离太阳',
    s1day: '日期', s1play: '让一年转起来', s1pause: '暂停',
    s1ro: '{date}：太阳直射点在纬度 {dec}°{ns}；{tilt}',
    s1toN: '北半球朝向太阳。', s1toS: '南半球朝向太阳。', s1eq: '两个半球受到的照射差不多（接近二分日）。',
    s1result: '结论：一年里直射点在北纬 23.4° 与南纬 23.4° 之间往返一次；地轴倾斜 + 方向不变是原因。条件：用近似 δ = ε·sin(2π(N − 79.5)/365.25)，ε = 23.44°；地轴方向的缓慢进动忽略。',
    s2k: '第 2 步 · 正午太阳多高',
    s2t: '同一个地方，夏天和冬天正午的太阳一样高吗？',
    s2e: '这一步要回答：正午时太阳离地平线多高，和季节有什么关系，为什么这决定冷热？正午太阳高度 h = 90° − |纬度 − 直射点纬度|。太阳越高，同样一束阳光铺在地面上的面积越小，单位面积受热越多：相对强度 ∝ sin h。选纬度、拖日期，看太阳高度和曲线。',
    s2stage: '上：站在所选纬度看正午的太阳（虚线是地平线）；下：一年中正午太阳高度的曲线，橙点是所选日期',
    s2canvas: '正午太阳的高度示意和一年的高度曲线：夏天高，冬天低',
    s2lat: '观察者的纬度（北为正）', s2day: '日期',
    s2ro: '纬度 {lat}°，{date}：直射点 {dec}°，正午太阳高度 h = {h}°，太阳在{dir}；相对强度 sin h = {s}。',
    s2result: '结论：太阳越高，单位面积地面受到的阳光越多，所以夏天热；冬天太阳低，阳光「斜着摊开」。条件：只看正午的几何，不含大气吸收、云和地面热惯性（所以最热的日子要比夏至晚一些）。',
    s3k: '第 3 步 · 昼有多长',
    s3t: '为什么夏天白天更长，在极地甚至一整天不落？',
    s3e: '这一步要回答：昼长怎么随纬度和日期变化？太阳直射点移到北半球时，北半球更多的纬线圈落在被照亮的那半个地球上，白天就长。昼长 = 2 × arccos(−tanφ·tanδ) ÷ 15°（单位小时，φ 是纬度，δ 是直射点纬度）。右边的圆是 24 小时钟，黄色弧是白天；按播放，一年的昼长曲线会一点点画出来。',
    s3stage: '上：昼长曲线，橙点是所选日期（虚线是赤道的 12 小时参照）；下：24 小时圆环，黄色弧是白天',
    s3canvas: '一年昼长曲线与 24 小时圆环：夏天昼长，冬天昼短，极圈内有极昼和极夜',
    s3lat: '纬度（北为正）', s3day: '日期', s3play: '让一年转起来', s3pause: '暂停',
    s3ro: '纬度 {lat}°，{date}：昼长 {len} 小时（夜长 {night} 小时）。{pol}',
    s3polDay: '这里是极昼：太阳整天不落。', s3polNight: '这里是极夜：太阳整天不出。', s3polNone: '',
    s3result: '结论：直射点在哪个半球，那个半球昼长夜短；越靠近两极变化越大；赤道全年约 12 小时。条件：几何昼长，不含大气折射（实际昼长略长几分钟）和地形。',
    s4k: '第 4 步 · 没有倾斜会怎样',
    s4t: '如果地轴不斜，会有四季吗？倾斜得更厉害呢？',
    s4e: '这一步要回答：把地轴倾角 ε 当作可调的变量，四季强弱怎样跟着变？这是一个「假如」实验：ε = 0° 时地轴竖直，直射点永远在赤道；ε 越大，直射点来回摆得越远，季节越分明。两条线分别是北纬 40° 和南纬 40° 的正午太阳高度，看它们怎样互为反季节。',
    s4stage: '一年中正午太阳高度：青线 = 北纬 40°，橙线 = 南纬 40°，竖线是所选日期；ε 变大时两条线摆动更大',
    s4canvas: '不同地轴倾角下北纬 40° 与南纬 40° 的正午太阳高度曲线：倾角为零时两条线持平',
    s4eps: '假想的地轴倾角 ε', s4day: '日期',
    s4ro: 'ε = {eps}°：北纬 40° 正午太阳高度在 {nmin}°–{nmax}° 之间变化，南纬 40° 在 {smin}°–{smax}° 之间；北纬 40° 昼长 {lmin}–{lmax} 小时。{now}',
    s4now: '{date}：北纬 40° 此刻 {nh}°，南纬 40° 此刻 {sh}°。',
    s4result: '结论：倾角为 0 就没有四季，倾角越大季节越强；南北半球季节相反，因为直射点在一边时另一边的太阳就低。条件：只改倾角、公转轨道不变；极端倾角（如天王星约 98°）要另当别论。',
    s5k: '第 5 步 · 收束', s5t: '把四季说给别人听',
    s5e: '四季不是因为离太阳近，而是因为地轴斜着：绕太阳一圈，直射点在南北回归线之间往返，太阳高度和昼长随之周期变化。',
    f1t: '不是距离', f1b: '日地距离一年只变化约 3%，最近的时候北半球是冬天（第 0 步）。',
    f2t: '斜轴 + 公转', f2b: '地轴倾斜约 23.4° 且方向不变，让直射点一年来回一趟（第 1 步）。',
    f3t: '高度与昼长', f3b: '太阳越高、白天越长，单位面积受热越多，所以夏天热（第 2–4 步）。',
    modelT: '模型实话',
    model1: '赤纬和日地距离用的是近似公式，日期可能与真实至点、二分点相差一两天。',
    model2: '几何结果不含大气、海洋的热惯性，所以季节的最热最冷比至点落后约一个月。',
    model3: '轨道图为教学示意（斜视图纵向压扁）；第 0 步的轨道按真实比例，几乎是正圆。',
    nextT: '继续看（站内）',
    l1: '昼夜交替 · 第 4 步：自转方向，以及「公转加地轴倾斜才有四季」的伏笔',
    l2: '气候能量账本 · 第 0 步：太阳光怎样随纬度铺开成不同的热量',
    l3: '昼夜交替 · 第 2 步：地球转一圈是一天，昼夜怎样扫过'
  },
  en: {
    languageLabel: "Language",
    back: "← Knowledge Index",
    navLabel: "Step navigation",
    catBadge: "Earth & Space",
    stageBadge: "Junior High",
    foot: "Earth's Orbit & the Seasons · Built by Claude Sonnet via Mini Claude Code · static bilingual page",
    docTitle: 'Earth’s Orbit & the Seasons · The Axis Is Tilted',
    pageTitle: 'Earth’s Orbit & the Seasons',
    tagline: 'Summer is not because Earth is closer to the Sun, but because its axis is tilted: around the orbit the hemispheres take turns facing the Sun, and day length swings with them.',
    nav0: '0 Closer = hotter?', nav1: '1 The tilted axis', nav2: '2 Noon Sun height', nav3: '3 Day length', nav4: '4 No tilt?', nav5: '5 Recap',
    mon0: 'Jan', mon1: 'Feb', mon2: 'Mar', mon3: 'Apr', mon4: 'May', mon5: 'Jun', mon6: 'Jul', mon7: 'Aug', mon8: 'Sep', mon9: 'Oct', mon10: 'Nov', mon11: 'Dec',
    dateFmt: '{m} {d}',
    unitDeg: '°', unitH: 'h', unitAu: 'AU', unitMkm: 'million km',
    s0orbit: 'orbit (true scale, almost circular)', s2yl: 'Noon Sun altitude (°)', lblDay: 'Date', lblLat: 'Latitude', lblEps: 'Axis tilt ε',
    play: 'Run a whole year', pause: 'Pause',
    north: 'N', south: 'S',
    s0k: 'Step 0 · Closer = hotter?',
    s0t: 'Is Earth closest to the Sun in the northern summer?',
    s0e: 'This step asks: is summer hot because Earth is nearer the Sun then? Earth’s trip once around the Sun is its <strong>revolution</strong> (orbit), about 365 days, along a slightly squashed ellipse. The <strong>astronomical unit (AU)</strong> is the average Earth–Sun distance (about 150 million km). Drag the date, watch how the distance changes, and check what season it is in the north at that time.',
    s0stage: 'Top: the orbit to true scale (almost a circle), the orange dot is Earth; bottom: Earth–Sun distance through the year (the vertical axis is stretched a lot to make the change visible)',
    s0canvas: 'Earth’s orbit and the Earth–Sun distance curve: the distance varies only about 3% and is smallest in early January',
    s0day: 'Date', s0play: 'Run a whole year', s0pause: 'Pause',
    s0ro: '{date}: Earth–Sun distance {au} AU ({mkm} million km); {note}',
    s0near: 'Earth is relatively close to the Sun now, yet the north is in its cold season — so distance does not set the seasons.',
    s0far: 'Earth is relatively far from the Sun now, yet the north is in its warm season — again showing distance does not set the seasons.',
    s0mid: 'the Earth–Sun distance is near its average now.',
    s0result: 'Takeaway: the Earth–Sun distance changes only about ±1.7% over the year, smallest in early January (northern winter) and largest in early July (northern summer) — distance is not the cause of the seasons. Uses the approximation r = 1 − 0.0167 cos(2π(N − 2)/365.25) AU, N counting days from January 1.',
    s1k: 'Step 1 · The tilted axis',
    s1t: 'With a tilted axis, what happens as Earth goes round the Sun?',
    s1e: 'This step asks: what is special about Earth’s axis direction during the orbit, and how does it make the overhead-Sun point swing back and forth? The <strong>axis</strong> is the imaginary line Earth spins about; it makes an angle of about 23.4° with the perpendicular to the orbit plane and keeps pointing the same way all year (almost at the North Star). So at different points of the orbit the northern hemisphere sometimes leans toward the Sun and sometimes away. The <strong>subsolar latitude</strong> (also called declination δ) is the latitude where the Sun is exactly overhead. Drag the date or press play.',
    s1stage: 'Oblique view: the ellipse is the orbit (squashed vertically), the Sun in the middle; each Earth’s bright side faces the Sun, the line is the axis (its direction never changes), N is the north pole',
    s1canvas: 'Oblique view of Earth’s orbit: the axis direction stays fixed while the northern hemisphere leans toward or away from the Sun',
    s1day: 'Date', s1play: 'Run a whole year', s1pause: 'Pause',
    s1ro: '{date}: the Sun is overhead at latitude {dec}°{ns}; {tilt}',
    s1toN: 'the northern hemisphere leans toward the Sun.', s1toS: 'the southern hemisphere leans toward the Sun.', s1eq: 'both hemispheres are lit about equally (near an equinox).',
    s1result: 'Takeaway: over a year the overhead point moves between 23.4° N and 23.4° S and back once; the tilt plus the fixed direction is the cause. Uses δ = ε·sin(2π(N − 79.5)/365.25) with ε = 23.44°; slow precession of the axis is ignored.',
    s2k: 'Step 2 · Noon Sun height',
    s2t: 'Is the noon Sun as high in summer as in winter, in the same place?',
    s2e: 'This step asks: how high is the Sun at noon, how does that change with the seasons, and why does that decide how warm it is? Noon Sun altitude h = 90° − |latitude − subsolar latitude|. The higher the Sun, the smaller the ground area one beam is spread over, so each square metre gets more heat: relative intensity ∝ sin h. Pick a latitude, drag the date and watch the altitude and the curve.',
    s2stage: 'Top: the noon Sun as seen from the chosen latitude (dashed line is the horizon); bottom: noon Sun altitude through the year, the orange dot is the chosen date',
    s2canvas: 'A sketch of the noon Sun’s height and the yearly altitude curve: high in summer, low in winter',
    s2lat: 'Observer’s latitude (north positive)', s2day: 'Date',
    s2ro: 'Latitude {lat}°, {date}: overhead point {dec}°, noon altitude h = {h}°, Sun toward the {dir}; relative intensity sin h = {s}.',
    s2result: 'Takeaway: a higher Sun gives more sunlight per square metre, hence summer warmth; in winter a low Sun spreads the same beam thin. Holds for the noon geometry only, ignoring atmosphere, clouds and the thermal lag of ground and sea (the hottest days come after the solstice).',
    s3k: 'Step 3 · Day length',
    s3t: 'Why are summer days longer, and why does the Sun never set near the poles?',
    s3e: 'This step asks: how does day length change with latitude and date? When the overhead point is in the northern hemisphere, more of each northern latitude circle lies in the lit half of Earth, so days are long. Day length = 2 × arccos(−tanφ·tanδ) ÷ 15° (in hours, φ latitude, δ subsolar latitude). The ring on the right is a 24-hour clock with daylight in yellow; press play and the year’s day-length curve is drawn bit by bit.',
    s3stage: 'Top: the day-length curve, the orange dot is the chosen date (dashed line is the 12 h equator reference); bottom: a 24-hour ring, the yellow arc is daylight',
    s3canvas: 'Yearly day-length curve and 24-hour ring: long in summer, short in winter, with polar day and night inside the polar circles',
    s3lat: 'Latitude (north positive)', s3day: 'Date', s3play: 'Run a whole year', s3pause: 'Pause',
    s3ro: 'Latitude {lat}°, {date}: day length {len} h (night {night} h). {pol}',
    s3polDay: 'This is polar day: the Sun does not set all day.', s3polNight: 'This is polar night: the Sun does not rise all day.', s3polNone: '',
    s3result: 'Takeaway: the hemisphere where the Sun is overhead has long days and short nights; the nearer the poles, the larger the swing; the equator stays near 12 h all year. Holds for geometric day length, ignoring refraction (real days are a few minutes longer) and terrain.',
    s4k: 'Step 4 · No tilt?',
    s4t: 'Without a tilt would there be seasons? And with a bigger one?',
    s4e: 'This step asks: treat the axis tilt ε as an adjustable variable — how does the strength of the seasons follow? A “what if” experiment: at ε = 0° the axis is upright and the overhead point stays on the equator; the larger ε is, the farther it swings and the stronger the seasons. The two lines are noon Sun altitude at 40° N and 40° S: see how they are opposite seasons.',
    s4stage: 'Noon Sun altitude through the year: cyan = 40° N, orange = 40° S, the vertical line is the chosen date; a larger ε makes both swing more',
    s4canvas: 'Noon Sun altitude at 40° N and 40° S for different axis tilts: flat lines when the tilt is zero',
    s4eps: 'Imagined axis tilt ε', s4day: 'Date',
    s4ro: 'ε = {eps}°: noon Sun altitude at 40° N ranges {nmin}°–{nmax}° and at 40° S {smin}°–{smax}°; day length at 40° N {lmin}–{lmax} h. {now}',
    s4now: '{date}: right now 40° N has {nh}° and 40° S has {sh}°.',
    s4result: 'Takeaway: with zero tilt there are no seasons, and the larger the tilt the stronger they are; the hemispheres have opposite seasons because when the Sun is overhead on one side it is low on the other. Holds with only the tilt changed and the orbit unchanged; extreme tilts (like Uranus at about 98°) are a different story.',
    s5k: 'Step 5 · Recap', s5t: 'Explain the seasons to a friend',
    s5e: 'The seasons are not about being close to the Sun but about the tilted axis: around the orbit the overhead point moves back and forth between the tropics, and the Sun’s height and day length cycle with it.',
    f1t: 'Not distance', f1b: 'The Earth–Sun distance changes only about 3% a year, and it is smallest in the northern winter (step 0).',
    f2t: 'Tilt + orbit', f2b: 'A tilt of about 23.4° with a fixed direction sends the overhead point back and forth once a year (step 1).',
    f3t: 'Height and length', f3b: 'A higher Sun and longer day give more heat per square metre, so summer is warm (steps 2–4).',
    modelT: 'Honest model notes',
    model1: 'Declination and distance use approximate formulas, so dates can differ from the true solstices and equinoxes by a day or two.',
    model2: 'The geometry ignores the thermal inertia of air and ocean, so real hottest and coldest times lag the solstices by about a month.',
    model3: 'The oblique orbit picture is a teaching sketch (squashed vertically); the orbit in step 0 is to true scale and almost circular.',
    nextT: 'Keep going (on this site)',
    l1: 'Day & Night · step 4: spin direction, and the hint that orbit plus a tilted axis makes the seasons',
    l2: 'Climate Energy Ledger · step 0: how sunlight spreads into different amounts of heat by latitude',
    l3: 'Day & Night · step 2: one turn is one day, and how day and night sweep past'
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
