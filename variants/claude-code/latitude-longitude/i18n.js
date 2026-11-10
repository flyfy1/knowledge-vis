'use strict';
// Latitude & longitude lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).
const STRINGS = {
  zh: {
    pageTitle: '经纬网 · 用两个角度给地球上的点写地址',
    back: '← 知识索引',
    compare: '对照另一版本：经纬网 →',
    navLabel: '经纬网步骤导航',
    tagline: '球面上没有现成的方格，也分不出哪里是「左上角」。可只要说出两个角度——离赤道多少度、离本初子午线多少度——地球上任何一个点就被唯一地找到了。七步里你会亲手转动地球仪读出坐标，看清为什么越往北「一度」越短、为什么平面地图一定会变形、为什么飞机不沿纬线飞，以及经度怎样变成时差。',
    nav0: '0 两个角度', nav1: '1 读坐标', nav2: '2 一度有多长', nav3: '3 摊成地图', nav4: '4 最短的路', nav5: '5 经度与时间', nav6: '6 收束',
    // step 0
    s0k: '第 0 步 · 地址怎么写',
    s0t: '球面上没有格子，怎样用两个数说清一个点在哪？',
    s0e: '这一步要回答：给你地球表面上任意一个点，能不能只用两个数把它说清楚，而且别人照着这两个数能找回同一个点？办法是量两个<strong>角度</strong>，都从地球中心看过去。<strong>纬度</strong>：从赤道往北（或往南）转过多少度，0° 到 90°，北边叫北纬（N），南边叫南纬（S）。纬度相同的点连起来是一个和赤道平行的圈，叫<strong>纬线</strong>。<strong>经度</strong>：从一条起点经线往东（或往西）转过多少度，0° 到 180°，往东叫东经（E），往西叫西经（W）。连接南北极的半个圆叫<strong>经线</strong>；起点那条经线经过英国伦敦的格林尼治，叫<strong>本初子午线</strong>（0° 经线），这是国际约定，不是大自然规定的。把纬度当「上下」、经度当「左右」，就得到一张和平面直角坐标系相似的网（<a class="xlink" href="../../../math/algebra/coordinate-plane/#step2">→ 坐标平面第 2 步：两个数怎样定位平面上的点</a>）。',
    latS: '纬度 φ', lonS: '经度 λ', viewS: '转动地球仪（只改看的方向，不改点）',
    pBeijing: '北京', pLondon: '伦敦', pSydney: '悉尼', pQuito: '基多（赤道上）', pPole: '北极点',
    s0lgPar: '这个点所在的纬线', s0lgMer: '这个点所在的经线', s0lgLatA: '纬度角（从赤道量起）', s0lgLonA: '经度角（从本初子午线量起）', s0lgRef: '赤道和本初子午线',
    c0a: '地球仪：两个角度都从地心量', c0b: '同一个点画在经纬方格上',
    s0readout: '这个点：{lat}，{lon}。{latMeaning}{lonMeaning}{back}',
    s0latN: '从地心看，它在赤道以北 {v}°；', s0latS: '从地心看，它在赤道以南 {v}°；', s0lat0: '它就在赤道上（纬度 0°）；',
    s0lonE: '它所在的经线在本初子午线以东 {v}°。', s0lonW: '它所在的经线在本初子午线以西 {v}°。', s0lon0: '它就在本初子午线上（经度 0°）。', s0lon180: '它在 180° 经线上，往东往西量都是 180°。',
    s0pole: '在极点上所有经线交于一点，经度写多少都指同一个点；所以极点只需要纬度。',
    s0back: '（这个点现在转到了地球仪背面，在图上显示为暗点。拖「转动地球仪」把它转回来。）',
    s0hint: '观察顺序：先只拖「纬度」，点沿着青色经线上下滑，橙色扇形张开或收拢，经纬方格上的点只上下动；再只拖「经度」，点沿着橙色纬线绕圈，青色扇形变化，经纬方格上的点只左右动。最后拖「转动地球仪」：点的坐标不变，变的只是你看的方向。',
    // step 1
    s1k: '第 1 步 · 反过来读',
    s1t: '只看图上的位置，你能读出它的经纬度吗？',
    s1e: '这一步要回答：上一步是「给坐标、找点」，反过来「给点、读坐标」行不行？地球仪上的黄色星星是一座城市。网格线每 15° 一条，带数字的线每 30° 一条：沿赤道标的是经度（E 东经、W 西经），沿中间那条竖线标的是纬度（N 北纬、S 南纬）。先找星星夹在哪两条纬线之间、哪两条经线之间，再估计它离每条线有多远。拖两个滑杆把橙色十字放到星星上，按「检查」。误差用两点之间沿地面最短的距离算，单位千米。',
    guessLat: '你读出的纬度', guessLon: '你读出的经度', check: '检查', nextCity: '换一座城市',
    c1: '地球仪：星星是哪座城市？（网格每 15°）',
    s1lgStar: '要读坐标的城市', s1lgGuess: '你的估计', s1lgErr: '两者的地面距离',
    s1before: '第 {round} 题。目前估计：{lat}，{lon}。估好了就按「检查」。',
    s1after: '第 {round} 题：它是{city}，{lat}，{lon}。你的估计离它 {km} 千米——{grade}',
    gradeGreat: '很准（300 千米以内）。', gradeClose: '接近了（1000 千米以内）；再对照一下它离最近那条网格线有几度。', gradeFar: '偏得较远：先确认它在赤道以北还是以南、在本初子午线以东还是以西。',
    s1hist: '已完成 {n} 题，误差：{list} 千米。',
    s1histNone: '还没有检查过。',
    s1hint: '提示：网格线之间是 15°，所以「夹在 30°N 和 45°N 之间、更靠近 30°N」大约就是 35°N。经度同理。换城市时地球仪会转到大致对着它的方向，但不会正对着。',
    cCairo: '开罗', cNewyork: '纽约', cSydney: '悉尼', cSingapore: '新加坡', cReykjavik: '雷克雅未克', cRio: '里约热内卢', cTokyo: '东京', cCapetown: '开普敦', cBeijing: '北京', cLondon: '伦敦', cHonolulu: '檀香山',
    // step 2
    s2k: '第 2 步 · 一度不一样长',
    s2t: '在赤道上往东走 1°，和在哈尔滨往东走 1°，路一样长吗？',
    s2e: '这一步要回答：经度每差 1°，地面上相隔多少千米？它和纬度有关吗？把地球从侧面剖开看（「侧面剖开」那张图）：纬线是一个水平的圈，它的圆心在地轴上，半径是从地轴到地面的水平距离。纬度 φ 越大，这个圈离地轴越近，半径越小。半径和地球半径 R = 6371 千米的比值只由 φ 决定，这个比值叫 φ 的<strong>余弦</strong>，记作 cos φ（<a class="xlink" href="../../../math/geometry/trigonometry/#step3">→ 三角函数第 3 步：cos 就是横向的那一段</a>）。所以纬线圈半径 = R·cos φ，一圈长 2πR·cos φ；它被经线分成 360 份，每份（经度 1°）≈ 111.2 × cos φ 千米。经线不一样：每条经线都是地球的半个大圆，所以沿经线走纬度 1° 处处约 111.2 千米。',
    lat2: '纬度 φ（北纬）',
    c2a: '侧面剖开：纬线圈的半径', c2b: '经度 1° 的地面长度（千米）',
    s2lgR: '地球半径 R', s2lgr: '纬线圈半径 R·cos φ', s2lgCurve: '111.2 × cos φ', s2lgRef: '纬度 1° 的长度（恒定）', s2lgDot: '已经看过的纬度',
    s2readout: '北纬 {lat}°：纬线圈半径 = 6371 × cos {lat}° ≈ {r} 千米，一圈 ≈ {L} 千米。沿这条纬线向东走经度 1° ≈ {k} 千米，是赤道上的 {pct}%；沿经线向北走纬度 1° 仍是 ≈ {kl} 千米。',
    s2pole: '北纬 90° 是北极点：纬线圈缩成一个点，半径 0，经度 1° 的长度也是 0——所有经线在这里交汇。沿经线走纬度 1° 仍是 ≈ {kl} 千米。',
    s2hint: '观察顺序：从 0° 往 90° 拖「纬度」，看剖面图里橙色半径变短、长度曲线上的点沿曲线滑下；对照绿色虚线（纬度 1° 的长度）始终不动。试试 60°：经度 1° 恰好缩成赤道上的一半。新加坡在 1°N 附近、哈尔滨在 46°N 附近，可以各拖到那里比一比。',
    // step 3
    s3k: '第 3 步 · 把球摊平',
    s3t: '把经纬网画成方方正正的地图，哪里会被拉变形？',
    s3e: '这一步要回答：上一步说纬线越往北越短，可在方格地图上每条纬线都画得和赤道一样长——那多出来的长度去哪了？把球面画到平面上的规则叫<strong>投影</strong>。这里比较两种：<strong>经纬方格图</strong>（等距圆柱投影）把经度、纬度直接当横、纵坐标，纬线间距处处相等；<strong>墨卡托图</strong>在高纬度把纬线间距也按同样比例拉大，好让小块区域的形状不走样，航海图常用它。地球仪上的圆在地面上一样大（半径 800 千米）；看它们画到地图上变成什么样。拉伸倍数 = 圆在地图上的宽（或高、面积）÷ 赤道上同样大小的圆在地图上的宽（或高、面积），1 表示不变形。括号里的公式描述无穷小的圆；800 千米的圆在高纬度横跨好几度，所以实测会略大于公式，到 70°N 多出约 2%–7%。',
    lat3: '橙色圆所在纬度', projPlate: '经纬方格图', projMerc: '墨卡托图',
    c3a: '地球仪：每个圆在地面上一样大', c3b: '地图：同样的圆画出来',
    s3lgMove: '可移动的圆（800 千米）', s3lgRef: '对照圆：0°、30°、60°', s3lgLand: '大陆（手绘粗略轮廓）',
    s3readout: '{proj}，橙色圆在 {lat}°N：东西方向拉伸 {ew} 倍（公式 1/cos φ = {few}），南北方向 {ns} 倍（公式 {fns}），面积 {area} 倍（公式 {farea}）。{note}',
    s3notePlate: '只横向被拉宽，所以高纬度的圆变成扁椭圆。',
    s3noteMerc: '横竖拉伸一样多，所以圆还是圆，但面积被放大得更厉害。',
    s3note0: '在赤道上两种地图都不变形。',
    s3hint: '观察顺序：先在「经纬方格图」下把纬度从 0° 拖到 70°，看橙色圆横向变宽、高度不变；再按「墨卡托图」重复一遍，看它保持圆形却整体变大。对照地球仪，这些圆其实一样大。格陵兰在 72°N 附近，墨卡托图把那里的面积放大约 {g} 倍，所以它看上去和非洲差不多大。',
    // step 4
    s4k: '第 4 步 · 最短的路',
    s4t: '两座城市都在北纬 40° 附近，沿着纬线走是最短的路吗？',
    s4e: '这一步要回答：在球面上从 A 到 B，哪条路最短？在平面上最短的是直线；在球面上，最短的路是<strong>大圆</strong>的一段。大圆是圆心恰好在地球中心的圆，比如赤道和每一条经线圈；除了赤道，纬线都不是大圆，它们的圆心在地轴上、比地心高。两城都在纬度 φ、经度相差 Δλ：沿纬线走的长度是 R·cos φ × Δλ（Δλ 换成弧度）；沿大圆走的长度用球面三角算出（模型里用半正矢公式）。大圆路线会先向极地方向拱起再回来，在经纬方格地图上看像一条弯路，其实它才是直的。',
    lat4: '两城所在纬度 φ', dl4: '经度差 Δλ', preset4: '≈ 马德里 → 北京（40°N，相差约 120°）',
    c4a: '地球仪：两条路线', c4b: '经纬方格图上的同两条路线',
    s4lgAlong: '沿纬线走', s4lgGreat: '大圆航线（最短）', s4lgEnds: '两座城市',
    s4readout: '纬度 {lat}°N，经度相差 {dl}°：沿纬线 ≈ {along} 千米，沿大圆 ≈ {great} 千米，省下 {saved}%。大圆最北拱到 {top}°N。',
    s4zero: '经度差 0°：两点重合，距离为 0。',
    s4eq: '在赤道上（φ = 0°）：赤道本身就是大圆，两条路线重合，省下 0%。',
    s4hint: '观察顺序：保持经度差 120° 不变，把纬度从 0° 往上拖：越往北，蓝色大圆比橙色纬线短得越多，拱得也越高。再固定纬度、把经度差拖到 180°：大圆直接越过北极。注意图中只比较了这两条路线，真实航线还要考虑风、空域和机场。',
    // step 5
    s5k: '第 5 步 · 经度与时间',
    s5t: '北京正午的时候，伦敦和纽约是几点？',
    s5e: '这一步要回答：经度为什么能换算成时间？地球自西向东自转，24 小时转 360°，也就是每小时 15°（<a class="xlink" href="../../../earth/astronomy/day-night-rotation/#step2">→ 昼夜交替第 2 步：转一圈是一天</a>）。太阳正对着的那条经线叫<strong>正午经线</strong>，那里此刻是中午 12 点；它每小时向西移 15°。以太阳在正南（或正北）最高处为 12 点算出的时间叫<strong>地方太阳时</strong>：地方太阳时 = 世界时 + 经度 ÷ 15（东经为正、西经为负，单位小时）。世界时是 0° 经线的地方太阳时。地图上暗的一半是夜，按春分、秋分那天画（太阳直射赤道，昼夜分界是两条竖线）。',
    utc5: '世界时（0° 经线的地方太阳时）', play5: '播放一天（24 小时）', pause5: '暂停', clear5: '清除记录',
    c5: '经纬方格图：太阳此刻正对哪条经线？',
    s5lgNoon: '正午经线', s5lgNight: '夜（春秋分那天）', s5lgSwept: '这一轮已轮过正午的经度', s5lgCity: '城市（编号见下表）',
    s5readout: '世界时 {utc}：正午经线在 {noon}。{prog}',
    s5prog: '这一轮已轮过正午的经度：{deg}°/360°（相当于转了 {h} 小时）。',
    s5progNone: '按「播放一天」开始记录哪些经度轮过了正午。',
    noon5: '回到北京正午',
    s5row: '{n}. {city}（{lon}）：地方太阳时 {time}，{dn}',
    day: '白天', night: '夜里',
    s5hint: '观察顺序：按「播放一天」，看橙色正午线从右往左扫过地图，顶部的橙色条记录已经轮过正午的经度；表里各城的时间一起走，但彼此的差始终不变。比如北京 116.4°E、伦敦约 0°：相差 116.4 ÷ 15 ≈ 7.8 小时。日常用的「北京时间」是按时区规定的 120°E 的地方太阳时；北京本地在 116.4°E，地方太阳时比北京时间慢约 {lag} 分钟。',
    // step 6
    s6k: '第 6 步 · 收束',
    s6t: '一句话说清经纬网',
    s6fin: '<strong>纬度</strong>是从地心看离赤道的角度，<strong>经度</strong>是离本初子午线的角度，两者合起来唯一确定地面上一个点（极点只需纬度）。因为纬线圈的半径是 R·cos φ，经度 1° 的长度随纬度缩短，纬度 1° 却处处约 111.2 千米；也正因为这样，把球摊成矩形地图必然拉伸高纬度，最短航线（大圆）在方格地图上看起来是弯的。地球每小时转 15°，所以经度每差 15° 地方太阳时差 1 小时。',
    formula: '经度 1° ≈ 111.2 × cos φ 千米\n纬度 1° ≈ 111.2 千米\n地方太阳时 = 世界时 + 经度 ÷ 15',
    boundary: '模型实话：本页把地球当作半径 6371 千米的正球体（真实地球两极略扁，赤道半径比极半径长约 21 千米）；城市坐标取到约 0.1°；大陆轮廓是手绘的粗略示意，只用来认方向，不参与任何计算；第 5 步只按春分、秋分画昼夜，其他日子昼夜分界是弯的；时区、夏令时是人为规定，不等于地方太阳时。',
    linksTitle: '接着看',
    lk1: '坐标平面 · 第 2 步：平面上的两个数怎样定位一个点 →',
    lk2: '三角函数 · 第 3 步：cos 为什么是「横向的那一段」→',
    lk3: '昼夜交替 · 第 2 步：地球转一圈是一天 →',
    lk4: '地球公转与四季 · 第 1 步：地轴斜着，直射点在纬度上来回移动 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《经纬网》的平行版本。',
    // coordinate text
    fN: '北纬 {v}°', fS: '南纬 {v}°', fEq: '纬度 0°（赤道）', fE: '东经 {v}°', fW: '西经 {v}°', fPM: '经度 0°', f180: '经度 180°'
  },
  en: {
    pageTitle: 'Latitude & Longitude · Two Angles as an Address',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Latitude & Longitude →',
    navLabel: 'Latitude and longitude steps',
    tagline: 'A sphere has no ready-made grid and no "top-left corner". Yet two angles — how far from the equator, how far from the prime meridian — single out any point on Earth. In seven steps you will turn a globe and read coordinates, see why "one degree" shrinks towards the poles, why every flat map must stretch something, why aircraft do not follow parallels, and how longitude turns into a time difference.',
    nav0: '0 Two angles', nav1: '1 Read a point', nav2: '2 How long is 1°', nav3: '3 Flatten it', nav4: '4 Shortest route', nav5: '5 Longitude & time', nav6: '6 Wrap-up',
    s0k: 'Step 0 · Writing an address',
    s0t: 'A sphere has no grid. How can two numbers say where a point is?',
    s0e: 'This step answers: given any point on Earth\'s surface, can two numbers describe it so precisely that someone else can find the very same point? The trick is to measure two <strong>angles</strong>, both seen from Earth\'s centre. <strong>Latitude</strong>: how many degrees north (or south) of the equator, from 0° to 90°, written N or S. All points with the same latitude form a circle parallel to the equator, called a <strong>parallel</strong>. <strong>Longitude</strong>: how many degrees east (or west) of a starting meridian, from 0° to 180°, written E or W. A <strong>meridian</strong> is a half-circle from pole to pole; the starting one runs through Greenwich in London and is called the <strong>prime meridian</strong> (0° longitude) — an international agreement, not something nature chose. Treat latitude as "up–down" and longitude as "left–right" and you get a net much like a coordinate grid (<a class="xlink" href="../../../math/algebra/coordinate-plane/#step2">→ Coordinate plane, step 2: two numbers locate a point on a plane</a>).',
    latS: 'Latitude φ', lonS: 'Longitude λ', viewS: 'Turn the globe (changes the view, not the point)',
    pBeijing: 'Beijing', pLondon: 'London', pSydney: 'Sydney', pQuito: 'Quito (on the equator)', pPole: 'North Pole',
    s0lgPar: 'the point\'s parallel', s0lgMer: 'the point\'s meridian', s0lgLatA: 'latitude angle (from the equator)', s0lgLonA: 'longitude angle (from the prime meridian)', s0lgRef: 'equator and prime meridian',
    c0a: 'Globe: both angles measured from the centre', c0b: 'The same point on a latitude–longitude grid',
    s0readout: 'This point: {lat}, {lon}. {latMeaning}{lonMeaning}{back}',
    s0latN: 'Seen from the centre it is {v}° north of the equator; ', s0latS: 'Seen from the centre it is {v}° south of the equator; ', s0lat0: 'It sits on the equator (latitude 0°); ',
    s0lonE: 'its meridian is {v}° east of the prime meridian.', s0lonW: 'its meridian is {v}° west of the prime meridian.', s0lon0: 'it sits on the prime meridian (longitude 0°).', s0lon180: 'it is on the 180° meridian — 180° whether you count east or west.',
    s0pole: 'At a pole every meridian meets, so any longitude names the same point; a pole needs only its latitude.',
    s0back: ' (The point has turned to the far side of the globe and shows as a dim dot. Drag "Turn the globe" to bring it back.)',
    s0hint: 'What to watch: drag only "Latitude" — the point slides along the cyan meridian, the orange wedge opens or closes, and the dot on the grid moves only up and down. Then drag only "Longitude" — the point travels round the orange parallel, the cyan wedge changes, and the grid dot moves only sideways. Finally drag "Turn the globe": the coordinates stay put; only your viewing direction changes.',
    s1k: 'Step 1 · Read it backwards',
    s1t: 'Looking only at a spot on the globe, can you read its coordinates?',
    s1e: 'This step answers: step 0 went from coordinates to a point — can you go from a point to coordinates? The yellow star on the globe is a city. Grid lines are 15° apart and every 30° line is numbered: numbers along the equator are longitudes (E east, W west), numbers along the middle vertical line are latitudes (N north, S south). Find which two parallels and which two meridians the star sits between, then estimate how far it is from each. Drag the two sliders to put the orange cross on the star and press "Check". The error is the shortest distance along the ground between the two points, in kilometres.',
    guessLat: 'Your latitude reading', guessLon: 'Your longitude reading', check: 'Check', nextCity: 'Another city',
    c1: 'Globe: which city is the star? (grid every 15°)',
    s1lgStar: 'the city to read', s1lgGuess: 'your estimate', s1lgErr: 'ground distance between them',
    s1before: 'Round {round}. Current estimate: {lat}, {lon}. Press "Check" when you are happy with it.',
    s1after: 'Round {round}: it is {city}, {lat}, {lon}. Your estimate is {km} km away — {grade}',
    gradeGreat: 'spot on (within 300 km).', gradeClose: 'close (within 1000 km); check how many degrees it sits from the nearest grid line.', gradeFar: 'quite far off: first make sure it is north or south of the equator, east or west of the prime meridian.',
    s1hist: '{n} rounds done, errors: {list} km.',
    s1histNone: 'Nothing checked yet.',
    s1hint: 'Tip: grid lines are 15° apart, so "between 30°N and 45°N, nearer 30°N" is about 35°N. Longitude works the same way. A new city turns the globe roughly towards it, but never exactly.',
    cCairo: 'Cairo', cNewyork: 'New York', cSydney: 'Sydney', cSingapore: 'Singapore', cReykjavik: 'Reykjavík', cRio: 'Rio de Janeiro', cTokyo: 'Tokyo', cCapetown: 'Cape Town', cBeijing: 'Beijing', cLondon: 'London', cHonolulu: 'Honolulu',
    s2k: 'Step 2 · Not every degree is equal',
    s2t: 'Is 1° east at the equator as far as 1° east in Harbin?',
    s2e: 'This step answers: how many kilometres apart are two places 1° of longitude apart, and does it depend on latitude? Slice the Earth and look from the side (the "side slice" panel): a parallel is a horizontal circle centred on the axis, and its radius is the horizontal distance from the axis to the surface. The larger the latitude φ, the closer the circle sits to the axis and the smaller its radius. The ratio of that radius to Earth\'s radius R = 6371 km depends only on φ; it is called the <strong>cosine</strong> of φ, written cos φ (<a class="xlink" href="../../../math/geometry/trigonometry/#step3">→ Trigonometry, step 3: cos is the horizontal part</a>). So the parallel\'s radius is R·cos φ and its length is 2πR·cos φ; meridians cut it into 360 pieces, so 1° of longitude ≈ 111.2 × cos φ km. Meridians are different: each is half of a great circle of the Earth, so 1° of latitude along a meridian is about 111.2 km everywhere.',
    lat2: 'Latitude φ (north)',
    c2a: 'Side slice: radius of the parallel', c2b: 'Ground length of 1° of longitude (km)',
    s2lgR: 'Earth radius R', s2lgr: 'parallel radius R·cos φ', s2lgCurve: '111.2 × cos φ', s2lgRef: 'length of 1° of latitude (constant)', s2lgDot: 'latitudes already visited',
    s2readout: '{lat}° N: parallel radius = 6371 × cos {lat}° ≈ {r} km, once round ≈ {L} km. Going 1° of longitude east along it ≈ {k} km, {pct}% of the equator value; going 1° of latitude north along a meridian is still ≈ {kl} km.',
    s2pole: '90° N is the North Pole: the parallel shrinks to a point with radius 0, so 1° of longitude has length 0 — every meridian meets here. 1° of latitude along a meridian is still ≈ {kl} km.',
    s2hint: 'What to watch: drag "Latitude" from 0° to 90° — in the side slice the orange radius shortens, and on the length plot the dot slides down the curve, while the green dashed line (1° of latitude) never moves. Try 60°: 1° of longitude is exactly half its equator length. Singapore is near 1° N and Harbin near 46° N — visit both and compare.',
    s3k: 'Step 3 · Flatten the sphere',
    s3t: 'Draw the grid as a neat rectangle — where does the map get stretched?',
    s3e: 'This step answers: parallels get shorter towards the poles, yet a rectangular map draws every parallel as long as the equator — where does the extra length come from? A rule for drawing the sphere on a flat sheet is a <strong>projection</strong>. Two are compared here. The <strong>plate carrée</strong> (equirectangular) map uses longitude and latitude directly as x and y, so parallels are evenly spaced. The <strong>Mercator</strong> map also spreads the parallels apart at high latitude by the same factor, so small shapes keep their form — which is why sailors liked it. The circles on the globe are all the same size on the ground (radius 800 km); see what they become on the map. Stretch = the circle\'s width (or height, or area) on the map ÷ the width (height, area) of the same circle at the equator; 1 means no distortion. The formulas in brackets are for a vanishingly small circle; an 800 km circle spans several degrees at high latitude, so the measured value comes out a little larger — by about 2–7% at 70° N.',
    lat3: 'Latitude of the orange circle', projPlate: 'Plate carrée', projMerc: 'Mercator',
    c3a: 'Globe: every circle is the same size on the ground', c3b: 'Map: the same circles, as drawn',
    s3lgMove: 'movable circle (800 km)', s3lgRef: 'reference circles at 0°, 30°, 60°', s3lgLand: 'continents (rough hand-drawn outline)',
    s3readout: '{proj}, orange circle at {lat}° N: east–west stretch ×{ew} (formula 1/cos φ = {few}), north–south ×{ns} (formula {fns}), area ×{area} (formula {farea}). {note}',
    s3notePlate: 'Only the width is stretched, so high-latitude circles become flat ellipses.',
    s3noteMerc: 'Width and height stretch equally, so circles stay round — but their area grows even faster.',
    s3note0: 'At the equator neither map distorts.',
    s3hint: 'What to watch: with "Plate carrée" drag the latitude from 0° to 70° — the orange circle widens but keeps its height. Repeat with "Mercator": it stays round but grows. On the globe they are all the same size. Greenland sits near 72° N, where Mercator inflates area about {g}-fold — which is why it looks as big as Africa.',
    s4k: 'Step 4 · The shortest route',
    s4t: 'Two cities both lie near 40° N. Is following the parallel the shortest way?',
    s4e: 'This step answers: on a sphere, which path from A to B is shortest? On a plane it is a straight line; on a sphere it is an arc of a <strong>great circle</strong> — a circle whose centre is exactly Earth\'s centre, like the equator or any full meridian circle. Apart from the equator, parallels are not great circles: their centres sit on the axis, above or below Earth\'s centre. Put both cities at latitude φ, Δλ of longitude apart. Along the parallel the distance is R·cos φ × Δλ (Δλ in radians); along the great circle it comes from spherical trigonometry (the model uses the haversine formula). The great-circle route first bulges towards the pole and then comes back; on a plate carrée map it looks bent, yet it is the straight one.',
    lat4: 'Latitude of both cities φ', dl4: 'Longitude difference Δλ', preset4: '≈ Madrid → Beijing (40° N, about 120° apart)',
    c4a: 'Globe: two routes', c4b: 'The same two routes on a plate carrée map',
    s4lgAlong: 'along the parallel', s4lgGreat: 'great-circle route (shortest)', s4lgEnds: 'the two cities',
    s4readout: 'Latitude {lat}° N, {dl}° of longitude apart: along the parallel ≈ {along} km, along the great circle ≈ {great} km, saving {saved}%. The great circle bulges as far north as {top}° N.',
    s4zero: 'Longitude difference 0°: the two points coincide, distance 0.',
    s4eq: 'On the equator (φ = 0°) the parallel is itself a great circle; the two routes coincide and the saving is 0%.',
    s4hint: 'What to watch: keep the difference at 120° and drag latitude upwards — the further north, the more the blue great circle beats the orange parallel and the higher it arches. Then fix the latitude and drag the difference to 180°: the great circle goes straight over the North Pole. Only these two routes are compared; real flights also weigh winds, airspace and airports.',
    s5k: 'Step 5 · Longitude and time',
    s5t: 'When it is noon in Beijing, what time is it in London and New York?',
    s5e: 'This step answers: why can longitude be turned into time? Earth spins west to east, 360° in 24 hours — 15° per hour (<a class="xlink" href="../../../earth/astronomy/day-night-rotation/#step2">→ Day and night, step 2: one turn is one day</a>). The meridian facing the Sun is the <strong>noon meridian</strong>: it is 12:00 there right now, and it moves 15° west every hour. Time counted so that 12:00 is when the Sun is highest is called <strong>local solar time</strong>: local solar time = UT + longitude ÷ 15 (east positive, west negative, in hours). UT, universal time, is the local solar time at 0° longitude. The dark half of the map is night, drawn for an equinox (the Sun over the equator, so day and night are split by two vertical lines).',
    utc5: 'Universal time (local solar time at 0°)', play5: 'Play one day (24 h)', pause5: 'Pause', clear5: 'Clear trace',
    c5: 'Plate carrée map: which meridian faces the Sun now?',
    s5lgNoon: 'noon meridian', s5lgNight: 'night (equinox day)', s5lgSwept: 'longitudes that have had noon this round', s5lgCity: 'cities (numbers in the table)',
    s5readout: 'Universal time {utc}: the noon meridian is at {noon}. {prog}',
    s5prog: 'Longitudes that have had noon this round: {deg}°/360° (that is {h} hours of turning).',
    s5progNone: 'Press "Play one day" to start recording which longitudes have had noon.',
    noon5: 'Back to noon in Beijing',
    s5row: '{n}. {city} ({lon}): local solar time {time}, {dn}',
    day: 'day', night: 'night',
    s5hint: 'What to watch: press "Play one day" — the orange noon line sweeps from right to left and the orange bar on top records which longitudes have already had noon; the cities\' clocks all run together, but the gaps between them never change. Beijing is at 116.4° E and London near 0°: 116.4 ÷ 15 ≈ 7.8 hours apart. Everyday "Beijing time" is the local solar time of 120° E, fixed by the time zone; Beijing itself sits at 116.4° E, so its local solar time runs about {lag} minutes behind Beijing time.',
    s6k: 'Step 6 · Wrap-up',
    s6t: 'The grid in one sentence',
    s6fin: '<strong>Latitude</strong> is the angle from the equator and <strong>longitude</strong> the angle from the prime meridian, both seen from Earth\'s centre; together they pin down one point on the surface (a pole needs only its latitude). Because a parallel has radius R·cos φ, 1° of longitude shrinks with latitude while 1° of latitude stays about 111.2 km; that is also why flattening the globe into a rectangle must stretch high latitudes, and why the shortest route (a great circle) looks bent on a grid map. Earth turns 15° an hour, so every 15° of longitude is one hour of local solar time.',
    formula: '1° of longitude ≈ 111.2 × cos φ km\n1° of latitude ≈ 111.2 km\nlocal solar time = UT + longitude ÷ 15',
    boundary: 'Honest model notes: Earth is treated as a perfect sphere of radius 6371 km (the real one is slightly flattened; its equatorial radius is about 21 km longer than its polar radius); city coordinates are given to about 0.1°; continent outlines are rough hand drawings for orientation only and never enter a calculation; step 5 draws day and night for an equinox only — on other days the boundary curves; time zones and daylight saving are human rules, not local solar time.',
    linksTitle: 'Keep going',
    lk1: 'Coordinate plane · step 2: two numbers locate a point on a plane →',
    lk2: 'Trigonometry · step 3: why cos is "the horizontal part" →',
    lk3: 'Day and night · step 2: one turn of the Earth is one day →',
    lk4: 'Earth\'s orbit & the seasons · step 1: the tilted axis moves the overhead Sun between latitudes →',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of "Latitude & Longitude".',
    fN: '{v}° N', fS: '{v}° S', fEq: '0° (equator)', fE: '{v}° E', fW: '{v}° W', fPM: '0° longitude', f180: '180° longitude'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { const saved = localStorage.getItem('knowledge-lang'); if (saved === 'zh' || saved === 'en') lang = saved; else if (typeof navigator !== 'undefined') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en'; } catch (_) { if (typeof navigator !== 'undefined') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en'; }
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
  if (typeof window.refreshLatLon === 'function') window.refreshLatLon();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.LATLON_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
