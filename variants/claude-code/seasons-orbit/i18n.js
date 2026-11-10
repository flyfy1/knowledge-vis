'use strict';
// Earth's orbit & the seasons — lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).
const STRINGS = {
  zh: {
    pageTitle: '地球公转与四季 · 斜着的地轴管冷暖',
    back: '← 知识索引',
    compare: '对照另一版本：地球公转与四季 →',
    navLabel: '地球公转与四季步骤导航',
    tagline: '北半球的夏天，是不是因为地球离太阳近？不是——1 月初地球离太阳最近，北京却正冷。真正的原因是地轴斜着：绕太阳一圈，南北半球轮流把正面朝向太阳，正午太阳的高度和白天的长短跟着轮流变。六步里，你拖动同一个日期，从轨道、地轴、正午太阳和昼长四个角度看清这件事，最后把倾角拧到 0，看四季消失。',
    nav0: '0 离得近就热？', nav1: '1 斜着的地轴', nav2: '2 正午太阳多高', nav3: '3 白天有多长', nav4: '4 倾角决定什么', nav5: '5 收束',
    date: '日期（2026 年，全页共用）', dateFmt: '{m}月{d}日',
    m0: '1月', m1: '2月', m2: '3月', m3: '4月', m4: '5月', m5: '6月', m6: '7月', m7: '8月', m8: '9月', m9: '10月', m10: '11月', m11: '12月',
    playYear: '播放一年', pause: '暂停',
    spring: '春季', summer: '夏季', autumn: '秋季', winter: '冬季',
    // step 0
    s0k: '第 0 步 · 先排除一个答案',
    s0t: '夏天热，是因为地球离太阳更近吗？',
    s0e: '这一步要回答：地球离太阳的远近，能不能解释四季？地球绕太阳转一圈是一年，叫<strong>公转</strong>。公转轨道是一个椭圆，但非常接近正圆：离太阳最近的位置叫<strong>近日点</strong>，最远的叫<strong>远日点</strong>。离得越近，同样面积每秒收到的阳光越多，这个量和距离的平方成反比；下面说的「阳光强度」都指大气层顶（还没被空气削弱）的值，和全年平均距离处相比。拖日期或按「播放一年」，看地球在轨道上的位置和距离曲线；再留意读数里同一天北纬 40° 和南纬 40° 一天平均收到的阳光——两地离太阳一样远。',
    c0a: '俯视公转轨道（真实比例）', c0b: '日地距离（百万千米；纵轴不从 0 开始）',
    s0lgEarth: '地球（当天位置）', s0lgSun: '太阳（在椭圆的一个焦点上）', s0lgCircle: '以太阳为圆心的正圆，对照用', s0lgTrail: '已经走过的日期', s0lgPeri: '近日点', s0lgAph: '远日点',
    s0readout: '{date}：日地距离 {dist} 百万千米，阳光强度是平均距离处的 {pct}%。北半球是{sn}，南半球是{ss}。这一天一天平均收到的阳光：北纬 40° {qn} W/m²，南纬 40° {qs} W/m²。',
    s0prog: '已走过 {k}/365 天。',
    s0hint: '观察顺序：先看轨道——真实比例下它和虚线正圆几乎重合。再拖到 1 月 3 日（近日点）：距离最小，可北半球正是冬天，北纬 40° 收到的阳光只有南纬 40° 的约三分之一。7 月 5 日（远日点）正好反过来。全年距离只变化约 {span} 百万千米（约 {spanPct}%），阳光强度只在 {lo}%–{hi}% 之间；同一天两个半球却一冷一热，所以距离不是四季的原因。',
    // step 1
    s1k: '第 1 步 · 真正的原因',
    s1t: '地轴是斜的，绕太阳转一圈时会发生什么？',
    s1e: '这一步要回答：如果不是距离，是什么让南北半球轮流过夏天？地球绕着一根穿过南北极的假想直线自转，这根线叫<strong>地轴</strong>。地轴不垂直于公转轨道面，而是偏了约 23.44°，而且在公转中始终指向太空中同一个方向（北极大致指向北极星）。于是一年里有半年北极这头偏向太阳，半年偏离太阳。正午太阳在头顶正上方的那个纬度叫<strong>直射点纬度</strong>（天文上叫太阳赤纬 δ，北为正）：它在 6 月 21 日前后到北纬 23.44°（夏至），12 月 21 日前后到南纬 23.44°（冬至），3 月和 9 月的二十几号回到赤道（春分、秋分）。',
    c1a: '斜着看公转轨道：地轴方向始终不变', c1b: '这一天从侧面看地球（阳光从右边来）',
    s1lgAxis: '地轴（北极端）', s1lgLit: '被照亮的半球', s1lgEq: '赤道', s1lgTrop: '南北回归线（±23.44°）', s1lgPolar: '南北极圈（±66.56°）', s1lgSub: '直射点',
    s1readout: '{date}：直射点在{sub}。{lean}',
    subN: '北纬 {v}°', subS: '南纬 {v}°', sub0: '赤道上（0°）',
    leanN: '北极这头偏向太阳，北半球被照亮的部分多于一半。', leanS: '南极这头偏向太阳，南半球被照亮的部分多于一半。', lean0: '两极都不偏向太阳，晨昏线正好穿过两极，南北半球受光一样多。',
    s1hint: '观察顺序：拖动日期，在斜视的轨道图里看四个灰色的地球——地轴的方向从来不变，变的是太阳在地球的哪一侧。再看侧视图：6 月底地轴的北端倒向太阳，黄色直射点升到北回归线；12 月底倒向另一边，直射点降到南回归线。侧视图只画出地轴朝向或背离太阳的那部分倾斜。',
    // step 2
    s2k: '第 2 步 · 太阳的高度',
    s2t: '同一个地方，冬天和夏天的正午太阳一样高吗？',
    s2e: '这一步要回答：直射点在南北移动，对某个固定的地方意味着什么？<strong>正午太阳高度</strong> h 是正午时太阳离地平线的角度，90° 就是在头顶。它等于 90° 减去「当地纬度 φ 与直射点纬度 δ 之差」：h = 90° − |φ − δ|。太阳越低，同一束阳光斜着铺开，落在地面上的光斑越长，每平方米分到的阳光就越少；光斑长度是太阳在头顶时的 1/sin h 倍，每平方米的阳光是头顶时的 sin h 倍（sin h = 光束宽度 ÷ 光斑长度）（<a class="xlink" href="../../../earth/climate/climate-energy/#step0">→ 气候能量账本第 0 步：入射角与能量</a>）。',
    lat2: '地点纬度 φ（北正南负）', pBeijing: '北京 40°N', pGuangzhou: '广州 23°N', pSydney: '悉尼 34°S',
    c2a: '正午的阳光：一束光落在地面上多长', c2b: '这个纬度全年的正午太阳高度',
    s2lgBeam: '同样宽的一束阳光', s2lgSpot: '光斑（落在地面的长度）', s2lgOver: '太阳在头顶时的光斑长度', s2lgCurve: '全年正午太阳高度', s2lgNow: '当天',
    s2readout: '{date}，{lat}：正午太阳高度 h = 90° − |{phi}° − ({dec}°)| = {h}°，太阳在{dir}。光斑是头顶时的 {stretch} 倍，每平方米的阳光是头顶时的 {pct}%。',
    s2below: '{date}，{lat}：h = 90° − |{phi}° − ({dec}°)| = {h}°，正午太阳也在地平线下——这一天是极夜。',
    north1: '北', south1: '南',
    dirS: '正南方', dirN: '正北方', dirZ: '头顶正上方',
    s2hint: '观察顺序：选「北京 40°N」，拖日期从 12 月到 6 月：太阳升高，光斑缩短，曲线上的点走到最高。再选「悉尼 34°S」：同一天的高低正好反过来。广州在北回归线附近，夏至前后太阳几乎在头顶。',
    // step 3
    s3k: '第 3 步 · 白天的长度',
    s3t: '为什么夏天白天长、冬天白天短？离赤道越远差得越多吗？',
    s3e: '这一步要回答：一天里有多少小时太阳在地平线上？任何时刻地球都只有一半被照亮，亮暗分界叫<strong>晨昏线</strong>（<a class="xlink" href="../../../earth/astronomy/day-night-rotation/#step1">→ 昼夜交替第 1 步：亮的一半与晨昏线</a>）。地球自转时，你所在的纬线圈被晨昏线切成亮、暗两段，亮段占的比例就是<strong>昼长</strong>（白天的小时数）。地轴斜着时，晨昏线不再穿过两极，北半球夏天时纬线圈的亮段长于一半。用模型算：昼长 = 2 × arccos(−tan φ · tan δ) ÷ 15°（小时）。当 |φ| 足够大、括号里超出 −1…1 时，太阳整天不落叫<strong>极昼</strong>，整天不出叫<strong>极夜</strong>。日出、日落用地方太阳时表示（太阳最高时为 12:00）。',
    lat3: '地点纬度 φ（北正南负）', pEquator: '赤道 0°', pArctic: '北纬 70°（极圈内）',
    c3a: '24 小时表盘：黄色是白天', c3b: '这个纬度全年的昼长（小时）',
    s3lgDay: '白天', s3lgNight: '夜里', s3lgCurve: '全年昼长', s3lgSeen: '已经走过的日期', s3lgRef: '12 小时',
    s3readout: '{date}，{lat}：昼长 {len}，日出 {rise}、日落 {set}（地方太阳时）。',
    s3polarDay: '{date}，{lat}：极昼——太阳 24 小时都在地平线上。',
    s3polarNight: '{date}，{lat}：极夜——太阳整天都没有升起。',
    s3range: '这个纬度全年昼长在 {min} 到 {max} 之间。',
    s3hint: '观察顺序：选「北京 40°N」按「播放一年」，看表盘上黄色弧伸缩、曲线被一天天描出来；再选「赤道 0°」，全年都是 12 小时左右；选「北纬 70°」，夏天出现 24 小时的极昼、冬天出现 0 小时的极夜。春分、秋分那两天，各纬度昼长都约 12 小时。',
    hm: '{h} 小时 {m} 分',
    // step 4
    s4k: '第 4 步 · 拧动倾角',
    s4t: '如果地轴不倾斜，还会有四季吗？倾斜得更厉害呢？',
    s4e: '这一步要回答：前面所有变化，是不是都来自地轴的倾角？这里把<strong>倾角</strong> ε（地轴偏离「垂直于轨道面」的角度）当作可调的假设，轨道和距离保持不变。直射点纬度在 −ε 到 +ε 之间来回，这两条纬线就是<strong>回归线</strong>；纬度高于 90° − ε 的地方一年里至少有一天极昼和一天极夜，那条纬线叫<strong>极圈</strong>。看两张图：北纬 40° 和南纬 40° 全年正午太阳高度的起伏，以及直射点在一年里扫过的纬度范围。',
    tilt4: '假想的地轴倾角 ε', real4: '回到真实倾角 23.44°',
    c4a: '正午太阳高度：北纬 40° 与南纬 40°', c4b: '直射点全年走过的纬度',
    s4lgN: '北纬 40°', s4lgS: '南纬 40°', s4lgSub: '直射点纬度', s4lgTrop: '回归线之间（热带）', s4lgPolar: '极圈以内',
    s4readout: '倾角 {eps}°：北纬 40° 正午太阳高度在 {hmin}° 到 {hmax}° 之间（相差 {swing}°），昼长在 {dmin} 到 {dmax} 之间；南纬 40° 的起伏一样大，只是季节相反。回归线在 ±{eps}°，极圈在 ±{polar}°。',
    s4zero: '倾角 0°：直射点全年停在赤道，北纬 40° 每天正午太阳高度都是 {h}°、昼长都是 12 小时——不再有四季。（不倾斜时没有回归线和极圈。）',
    s4hint: '观察顺序：先把倾角拖到 0°，两条正午高度曲线变成同一条水平线，直射点停在赤道。再慢慢加大：两条曲线的起伏一起变大，而且一高一低；直射点扫过的纬度和热带一起变宽，极圈向赤道靠拢。拖到 45° 时，热带和极圈内区域在 ±45° 处相接。',
    // step 5
    s5k: '第 5 步 · 收束',
    s5t: '一句话说清四季',
    s5fin: '地球离太阳的远近全年只变约 3%，而且 1 月初最近时北半球正是冬天，所以<strong>距离不是四季的原因</strong>。原因是<strong>地轴倾斜约 23.44° 且方向不变</strong>：公转让直射点在南北回归线之间来回，于是同一地方的<strong>正午太阳高度</strong>和<strong>昼长</strong>一起随季节变化——太阳越高、白天越长，一天收到的阳光越多，就是夏天；南北半球正好相反。倾角为 0 时这些变化全部消失。',
    formula: '正午太阳高度 h = 90° − |φ − δ|\n昼长 = 2 · arccos(−tan φ · tan δ) ÷ 15° 小时\n直射点 δ 在 −23.44° … +23.44° 之间',
    boundary: '模型实话：太阳位置用天文年历的低精度公式，按 2026 年每天世界时 12 点计算，二分二至日期可能差一天；所有高度和昼长都是几何值，不含大气折射（真实日出更早、日落更晚几分钟）、不含太阳圆面大小；第 1 步斜视轨道图压扁了纵向、地球和太阳都画大了，第 0 步的轨道才是真实比例；第 4 步只改倾角，轨道不变；冷暖还受海陆、洋流和季节滞后影响（最热常在夏至后一两个月），本页只讲阳光的几何。还有一个细节：南半球夏天恰逢近日点，大气层顶阳光比北半球夏天多约 {extra}%，但海洋多、热容量大，这点差别被冲淡了。',
    linksTitle: '接着看',
    lk1: '昼夜交替 · 第 1 步：亮的一半与晨昏线 →',
    lk2: '昼夜交替 · 第 2 步：转一圈是一天 →',
    lk3: '气候能量账本 · 第 0 步：入射角越斜，能量越分散 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《地球公转与四季》的平行版本。',
    fN: '北纬 {v}°', fS: '南纬 {v}°', fEq: '赤道 0°'
  },
  en: {
    pageTitle: 'Earth’s Orbit & the Seasons · The Tilted Axis Sets the Temperature',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Earth’s Orbit & the Seasons →',
    navLabel: 'Seasons lesson steps',
    tagline: 'Is northern summer warm because Earth is closer to the Sun? No — Earth is closest in early January, right in Beijing\'s winter. The real cause is the tilted axis: around the orbit the two hemispheres take turns facing the Sun, and the noon Sun\'s height and the length of the day swing with them. In six steps you drag one shared date and watch this from four angles — the orbit, the axis, the noon Sun and day length — then turn the tilt down to zero and watch the seasons vanish.',
    nav0: '0 Closer = hotter?', nav1: '1 The tilted axis', nav2: '2 Noon Sun height', nav3: '3 Day length', nav4: '4 Turn the tilt', nav5: '5 Wrap-up',
    date: 'Date (2026, shared by the whole page)', dateFmt: '{mon} {d}',
    m0: 'Jan', m1: 'Feb', m2: 'Mar', m3: 'Apr', m4: 'May', m5: 'Jun', m6: 'Jul', m7: 'Aug', m8: 'Sep', m9: 'Oct', m10: 'Nov', m11: 'Dec',
    playYear: 'Play one year', pause: 'Pause',
    spring: 'spring', summer: 'summer', autumn: 'autumn', winter: 'winter',
    s0k: 'Step 0 · Rule one answer out',
    s0t: 'Is summer hot because Earth is closer to the Sun?',
    s0e: 'This step answers: can the Earth–Sun distance explain the seasons? Earth goes round the Sun once a year — its <strong>orbit</strong>. The orbit is an ellipse, but very nearly a circle: the closest point is called <strong>perihelion</strong>, the farthest <strong>aphelion</strong>. The closer Earth is, the more sunlight each square metre receives per second; that amount falls off with the square of the distance. "Sunlight strength" below always means the value at the top of the atmosphere (before air weakens it), compared with the value at the average distance. Drag the date or press "Play one year" to watch Earth\'s place on the orbit and the distance curve; then look at the readout\'s daily-average sunlight at 40° N and 40° S on the same day — two places exactly as far from the Sun.',
    c0a: 'Orbit seen from above (true proportions)', c0b: 'Earth–Sun distance (million km; axis does not start at 0)',
    s0lgEarth: 'Earth (on this date)', s0lgSun: 'Sun (at one focus of the ellipse)', s0lgCircle: 'a perfect circle round the Sun, for comparison', s0lgTrail: 'dates already visited', s0lgPeri: 'perihelion', s0lgAph: 'aphelion',
    s0readout: '{date}: Earth–Sun distance {dist} million km; sunlight is {pct}% of its value at the average distance. The northern hemisphere is in {sn}, the southern in {ss}. Daily-average sunlight today: 40° N gets {qn} W/m², 40° S gets {qs} W/m².',
    s0prog: '{k}/365 days visited. ',
    s0hint: 'What to watch: first the orbit — at true proportions it almost sits on the dashed circle. Then go to Jan 3 (perihelion): the distance is smallest, yet it is northern winter, and 40° N receives only about a third of what 40° S gets. Jul 5 (aphelion) is the mirror image. Over the year the distance changes by only about {span} million km (about {spanPct}%), and sunlight strength stays between {lo}% and {hi}%; yet on any one day the two hemispheres have opposite seasons, so distance is not the cause.',
    s1k: 'Step 1 · The real cause',
    s1t: 'The axis is tilted. What happens as Earth goes round the Sun?',
    s1e: 'This step answers: if not distance, what makes the hemispheres take turns at summer? Earth spins about an imaginary line through the poles, its <strong>axis</strong>. The axis is not perpendicular to the plane of the orbit but leans about 23.44°, and throughout the orbit it keeps pointing the same way in space (the North Pole points roughly at the Pole Star). So for half the year the northern end leans towards the Sun and for half the year away. The latitude where the noon Sun stands straight overhead is the <strong>subsolar latitude</strong> (astronomers call it the Sun\'s declination δ, north positive): it reaches 23.44° N around June 21 (the June solstice), 23.44° S around December 21 (the December solstice), and the equator around March 20 and September 23 (the equinoxes).',
    c1a: 'Orbit seen at a slant: the axis never changes direction', c1b: 'Earth from the side on this date (sunlight from the right)',
    s1lgAxis: 'axis (north end)', s1lgLit: 'lit hemisphere', s1lgEq: 'equator', s1lgTrop: 'tropics (±23.44°)', s1lgPolar: 'polar circles (±66.56°)', s1lgSub: 'subsolar point',
    s1readout: '{date}: the Sun is overhead at {sub}. {lean}',
    subN: '{v}° N', subS: '{v}° S', sub0: 'the equator (0°)',
    leanN: 'The northern end of the axis leans towards the Sun; more than half of the northern hemisphere is lit.', leanS: 'The southern end leans towards the Sun; more than half of the southern hemisphere is lit.', lean0: 'Neither pole leans towards the Sun; the day–night line runs through both poles and the hemispheres are lit equally.',
    s1hint: 'What to watch: drag the date and look at the four grey Earths on the slanted orbit — the axis never changes direction; what changes is which side of Earth the Sun is on. Then the side view: in late June the north end leans into the sunlight and the yellow subsolar point climbs to the Tropic of Cancer; in late December it leans the other way and the point drops to the Tropic of Capricorn. The side view shows only the part of the tilt towards or away from the Sun.',
    s2k: 'Step 2 · How high the Sun climbs',
    s2t: 'In one place, is the noon Sun as high in winter as in summer?',
    s2e: 'This step answers: as the subsolar latitude moves north and south, what does it mean for one fixed place? The <strong>noon Sun height</strong> h is the Sun\'s angle above the horizon at noon; 90° means straight overhead. It equals 90° minus the gap between your latitude φ and the subsolar latitude δ: h = 90° − |φ − δ|. The lower the Sun, the more a beam of sunlight is smeared along the ground: the patch it lights is longer and each square metre gets less. The patch is 1/sin h times as long as with the Sun overhead, and each square metre gets sin h of the overhead amount (sin h = beam width ÷ patch length) (<a class="xlink" href="../../../earth/climate/climate-energy/#step0">→ Climate energy budget, step 0: angle of incidence and energy</a>).',
    lat2: 'Latitude φ (north +, south −)', pBeijing: 'Beijing 40° N', pGuangzhou: 'Guangzhou 23° N', pSydney: 'Sydney 34° S',
    c2a: 'Noon sunlight: how long a patch one beam lights', c2b: 'Noon Sun height through the year at this latitude',
    s2lgBeam: 'a beam of fixed width', s2lgSpot: 'lit patch on the ground', s2lgOver: 'patch length with the Sun overhead', s2lgCurve: 'noon height over the year', s2lgNow: 'this date',
    s2readout: '{date}, {lat}: noon Sun height h = 90° − |{phi}° − ({dec}°)| = {h}°, due {dir}. The patch is {stretch}× its overhead length; each square metre gets {pct}% of the overhead amount.',
    s2below: '{date}, {lat}: h = 90° − |{phi}° − ({dec}°)| = {h}°, so even at noon the Sun is below the horizon — a day of polar night.',
    north1: 'N', south1: 'S',
    dirS: 'south', dirN: 'north', dirZ: 'overhead',
    s2hint: 'What to watch: pick "Beijing 40° N" and drag the date from December to June — the Sun climbs, the patch shrinks, and the dot on the curve reaches its top. Then pick "Sydney 34° S": on the same dates it is the other way round. Guangzhou sits near the Tropic of Cancer, so around the June solstice the Sun is almost overhead.',
    s3k: 'Step 3 · Length of the day',
    s3t: 'Why are summer days long and winter days short — and more so far from the equator?',
    s3e: 'This step answers: for how many hours is the Sun above the horizon? At any moment only half of Earth is lit; the boundary is the <strong>day–night line</strong> (<a class="xlink" href="../../../earth/astronomy/day-night-rotation/#step1">→ Day and night, step 1: the lit half and its boundary</a>). As Earth spins, your circle of latitude is cut by that line into a lit and a dark part; the lit share is the <strong>day length</strong> (hours of daylight). With a tilted axis the line no longer passes through the poles, so in northern summer the lit part of a northern circle is more than half. In the model: day length = 2 × arccos(−tan φ · tan δ) ÷ 15° (hours). When |φ| is large enough that the bracket leaves −1…1, the Sun never sets (<strong>polar day</strong>) or never rises (<strong>polar night</strong>). Sunrise and sunset are given in local solar time (Sun highest at 12:00).',
    lat3: 'Latitude φ (north +, south −)', pEquator: 'Equator 0°', pArctic: '70° N (inside the Arctic Circle)',
    c3a: '24-hour dial: yellow is daylight', c3b: 'Day length through the year at this latitude (hours)',
    s3lgDay: 'day', s3lgNight: 'night', s3lgCurve: 'day length over the year', s3lgSeen: 'dates already visited', s3lgRef: '12 hours',
    s3readout: '{date}, {lat}: day length {len}; sunrise {rise}, sunset {set} (local solar time).',
    s3polarDay: '{date}, {lat}: polar day — the Sun stays above the horizon for all 24 hours.',
    s3polarNight: '{date}, {lat}: polar night — the Sun never rises.',
    s3range: 'Over the year, day length here runs from {min} to {max}.',
    s3hint: 'What to watch: pick "Beijing 40° N" and press "Play one year" — the yellow arc on the dial stretches and shrinks while the curve is traced day by day. Pick "Equator 0°": about 12 hours all year. Pick "70° N": a 24-hour polar day in summer and a 0-hour polar night in winter. On the two equinoxes every latitude gets about 12 hours.',
    hm: '{h} h {m} min',
    s4k: 'Step 4 · Turn the tilt',
    s4t: 'Without a tilted axis, would there be seasons? And with a bigger tilt?',
    s4e: 'This step answers: do all the changes so far come from the tilt? Here the <strong>tilt</strong> ε (how far the axis leans from perpendicular to the orbit) is a what-if setting; the orbit and distances stay the same. The subsolar latitude swings between −ε and +ε, and those two parallels are the <strong>tropics</strong>; places beyond 90° − ε get at least one day of polar day and one of polar night each year, and that parallel is the <strong>polar circle</strong>. Two charts: the noon Sun height through the year at 40° N and 40° S, and the band of latitudes the subsolar point sweeps over the year.',
    tilt4: 'What-if axial tilt ε', real4: 'Back to the real tilt 23.44°',
    c4a: 'Noon Sun height: 40° N and 40° S', c4b: 'Latitudes the subsolar point visits during the year',
    s4lgN: '40° N', s4lgS: '40° S', s4lgSub: 'subsolar latitude', s4lgTrop: 'between the tropics', s4lgPolar: 'inside the polar circles',
    s4readout: 'Tilt {eps}°: at 40° N the noon Sun height runs from {hmin}° to {hmax}° (a swing of {swing}°) and day length from {dmin} to {dmax}; 40° S swings just as much, with the seasons reversed. Tropics at ±{eps}°, polar circles at ±{polar}°.',
    s4zero: 'Tilt 0°: the subsolar point stays on the equator all year; at 40° N the noon Sun height is {h}° and the day is 12 hours long every day — no more seasons. (With no tilt there are no tropics or polar circles.)',
    s4hint: 'What to watch: drag the tilt to 0° first — both noon-height curves collapse onto one flat line and the subsolar point parks on the equator. Then increase it slowly: both curves swing more, always in opposite directions; the band swept by the subsolar point widens with the tropics, and the polar circles creep towards the equator. At 45° the tropics and the polar zones meet at ±45°.',
    s5k: 'Step 5 · Wrap-up',
    s5t: 'The seasons in one sentence',
    s5fin: 'The Earth–Sun distance changes by only about 3% over the year, and Earth is closest in early January during northern winter, so <strong>distance is not the cause of the seasons</strong>. The cause is <strong>an axis tilted about 23.44° that keeps its direction</strong>: the orbit carries the subsolar point back and forth between the tropics, so at any one place the <strong>noon Sun height</strong> and the <strong>day length</strong> rise and fall together — a higher Sun and a longer day bring more sunlight per day, and that is summer; the two hemispheres are always opposite. With zero tilt all of it disappears.',
    formula: 'noon Sun height h = 90° − |φ − δ|\nday length = 2 · arccos(−tan φ · tan δ) ÷ 15° hours\nsubsolar latitude δ stays within −23.44° … +23.44°',
    boundary: 'Honest model notes: the Sun\'s position comes from the Astronomical Almanac low-precision formulas at 12:00 UT on each day of 2026, so equinox and solstice dates may be off by a day; heights and day lengths are geometric — no atmospheric refraction (real sunrise is a few minutes earlier, sunset later) and no allowance for the Sun\'s disc; the slanted orbit in step 1 is squashed vertically with Earth and Sun drawn far too large, while the orbit in step 0 is to scale; step 4 changes only the tilt, not the orbit; real warmth also depends on land and sea, currents and seasonal lag (the warmest weeks usually come a month or two after the June solstice) — this page covers only the geometry of sunlight. One more detail: southern summer coincides with perihelion, so top-of-atmosphere sunlight then is about {extra}% more than in northern summer, but the larger, slower-warming southern oceans blunt the difference.',
    linksTitle: 'Keep going',
    lk1: 'Day and night · step 1: the lit half and the day–night line →',
    lk2: 'Day and night · step 2: one turn is one day →',
    lk3: 'Climate energy budget · step 0: the slanter the light, the more spread out the energy →',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of "Earth’s Orbit & the Seasons".',
    fN: '{v}° N', fS: '{v}° S', fEq: 'Equator 0°'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { const saved = localStorage.getItem('knowledge-lang'); if (saved === 'zh' || saved === 'en') lang = saved; else lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en'; } catch (_) { lang = /^zh/i.test((typeof navigator !== 'undefined' && navigator.language) || '') ? 'zh' : 'en'; }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  Object.keys(params).forEach(name => { text = text.split(`{${name}}`).join(String(params[name])); });
  return text;
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem('knowledge-lang', lang); } catch (_) { /* storage denied: keep the in-memory value */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshSeasons === 'function') window.refreshSeasons();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.SEASONS_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
