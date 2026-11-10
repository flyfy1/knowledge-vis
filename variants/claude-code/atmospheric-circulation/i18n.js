'use strict';
// Atmospheric circulation lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '大气环流与季风 · 热量怎样被风搬走',
    back: '← 知识索引',
    compare: '对照另一版本：大气环流与季风 · 风从哪里来 →',
    navLabel: '大气环流步骤导航',
    tagline: '赤道一年到头晒得多，两极晒得少，可赤道并没有越来越热，两极也没有越来越冷：多出来的热被风和洋流搬走了。这一页从「要搬走多少热」算起，看冷热不均怎样让空气转圈，地球自转又怎样把一个大圈拧成三圈和几条风带，最后看陆地和海洋升温快慢不同，怎样让季风一年掉一次头。',
    nav0: '0 要搬多少热', nav1: '1 冷热转圈', nav2: '2 自转的拧劲', nav3: '3 大圈能伸多远', nav4: '4 三圈与风带', nav5: '5 季风', nav6: '6 收束',

    s0k: '第 0 步 · 账本',
    s0t: '如果大气和海洋不搬运热量，赤道和极地会差多少度？',
    s0e: '这一步要回答：低纬多吸收的太阳能，要靠多大的热量输送才能和高纬拉平？我们用一个<strong>能量平衡模型</strong>：把半个地球按纬度切成很多条带，每条带吸收的太阳能（第二张图的橙线，单位瓦/平方米）减去它向太空放出的热（青线，温度越高放得越多），剩下的差额只能靠相邻条带之间的热量输送补齐。输送用一个系数 <strong>D</strong> 表示：同样的南北温差下，D 越大，搬走的热越多；它是风和洋流搬热本领的总代表，不区分谁搬的。三张图的横轴都是纬度（0° 是赤道，90° 是极点）。第一张画各纬度的年平均温度，灰色虚线是 D = 0、完全不输送时的温度；第二张画吸收（橙）与放出（青），橙色阴影是盈余、蓝色阴影是亏损；第三张画穿过每条纬线向极地输送的总功率，单位拍瓦（1 PW = 10¹⁵ 瓦）。（<a class="xlink" href="../../../earth/climate/climate-energy/#step0">→ 地球能量收支第 0 步：同一个太阳，为什么不同纬度晒到的能量不同</a>）',
    dSlider: '热量输送本领 D（瓦/平方米/℃）',
    c0a: '年平均温度 / ℃', c0b: '吸收的太阳能与放出的热 / 瓦每平方米', c0c: '向极地的热量输送 / 拍瓦', latAxis: '纬度',
    s0lgT: '当前 D 下的温度', s0lgT0: 'D = 0（不输送）', s0lgIn: '吸收的太阳能', s0lgOut: '放出的热', s0lgSur: '盈余 / 亏损', s0lgF: '输送功率',
    s0readout: 'D = {D}：赤道 {eq} ℃，极点 {pole} ℃，相差 {gap} ℃（不输送时相差 {gap0} ℃）。约 {cross}° 以内吸收多于放出、以外相反；向极地的输送最大 {pw} 拍瓦，出现在纬度 {lat}°。全球平均 {mean} ℃，不随 D 改变。',
    s0none: 'D = 0：每条纬度带只能自己收支平衡，赤道 {eq} ℃、极点 {pole} ℃，相差 {gap} ℃，没有任何热量向极地流动。全球平均 {mean} ℃。',
    s0hint: '观察顺序：先把 D 拖到 0，看第一张图里温度线与灰色虚线重合，赤道和极地相差一百多度；再慢慢加大 D，温度线变平，第三张图的输送曲线鼓起来。注意全球平均温度一直不变：输送只是把热从低纬挪到高纬。D ≈ 0.65 时，模型给出的最大输送约 5.5 拍瓦、出现在 30° 多一点，和对实测数据的估算同一量级；参数是这类教学模型的常用值，反照率分布是本页设定的。',

    s1k: '第 1 步 · 冷热转圈',
    s1t: '一边热、一边冷，空气为什么会转成一个圈？',
    s1e: '这一步要回答：温差怎样变成气压差，再变成风？想象海边两根空气柱，地面气压一开始都是 1000 百帕（hPa，气压单位）。空气越热越「蓬松」：同样多的空气，热柱子占的高度更高。所以从地面往上数到同一个气压（比如 500 百帕），热柱子要升得更高；换句话说，在同一个高度上，热柱子上方的气压更高。于是高空的空气从热的一边流向冷的一边；热柱子上的空气被搬走，它地面的气压就下降（叫<strong>热低压</strong>），冷柱子地面的气压上升，近地面的风就从冷的一边吹向热的一边。合起来是一个圈：热处上升、高空流向冷处、冷处下沉、地面流回来。这叫<strong>热力环流</strong>，白天的海风、夏天的季风都是它。图中纵轴是高度（千米），每条线连着两根柱子里同一个气压值的高度（叫<strong>等压面</strong>）；拖动滑杆改变「陆地比海面热多少度」；读数里的温度是整根空气柱从地面到高空的平均值，高空很冷，所以平均在零度以下。',
    dtSlider: '陆地比海面热多少（℃，负数表示更冷）',
    c1: '海面与陆地上方的等压面（纵轴：高度 千米）', sea: '海', land: '陆',
    s1lgIso: '等压面（每 100 百帕一条）', s1lgFlow: '环流方向（动画只示意方向，速度不按比例）',
    s1readout: '陆地柱平均 {tl} ℃、海面柱 {ts} ℃：500 百帕面在陆地上方 {zl} 米、海面上方 {zs} 米，相差 {dz} 米；5 千米高处气压差 {dp} 百帕。{dir}',
    s1warm: '高空空气从陆地流向海面，地面风从海面吹向陆地（海风）。',
    s1cold: '高空空气从海面流向陆地，地面风从陆地吹向海面（陆风）。',
    s1zero: '两边一样热，等压面是平的，没有气压差，也就没有环流。',
    s1hint: '观察顺序：先把温差拖到 0，等压面全部水平；拖到正值，陆地一侧的等压面被抬高，越往上抬得越多；拖到负值，倾斜反过来，环流也反向。每多 1 ℃，500 百帕面就高出约 20 米。这里只算了「一开始」的气压分布；风吹起来以后会把空气搬走，正是这个搬运让地面出现热低压。',

    s2k: '第 2 步 · 自转的拧劲',
    s2t: '赤道的空气往北走，为什么会变成一股强劲的西风？',
    s2e: '这一步要回答：如果地球不转，热力环流会从赤道一路通到极地；地球在转，结果为什么不一样？地球每天自西向东转一圈，赤道地面跟着地球以约 465 米/秒向东运动；纬度越高，离地轴越近，地面向东的速度越小。一圈空气绕地轴转动的「转动量」叫<strong>角动量</strong>，它等于「向东的速度 × 离地轴的距离」。没有摩擦时角动量保持不变，就像花样滑冰的人收拢手臂会越转越快。所以一圈原本跟着赤道地面一起转的空气，往高纬移动、离地轴变近，向东的速度就得变大，比脚下的地面跑得更快：在地面上的人看来，它变成了一股越来越强的<strong>西风</strong>（从西边吹来的风）。这种「往高纬走就向东偏」的效果，在北半球表现为向右偏、在南半球向左偏，常写成<strong>科里奥利参数</strong> f = 2Ω sin φ（Ω 是地球自转角速度，φ 是纬度），它在赤道为 0，越往两极越大。（<a class="xlink" href="../../../earth/astronomy/day-night-rotation/#step4">→ 昼夜与自转第 4 步：地球朝哪个方向转、多久一圈</a>）',
    latSlider: '空气团到达的纬度 φ',
    c2a: '侧视地球：一圈空气离地轴的距离', c2b: '相对地面的西风速度 / 米每秒（横轴：纬度）',
    s2lgRing: '这一圈空气', s2lgEq: '出发时（赤道）', s2lgU: '角动量守恒给出的西风', s2lgGround: '地面自身向东的速度',
    s2readout: '纬度 {phi}：离地轴 {r} 千米（赤道的 {pct}%），地面向东 {g} 米/秒，这圈空气向东 {abs} 米/秒，所以相对地面是 {u} 米/秒的西风。f = {f} × 10⁻⁴ /秒，{side}。',
    s2north: '北半球：运动的空气向右偏', s2south: '南半球：运动的空气向左偏', s2eq: '赤道：没有水平偏转',
    s2hint: '观察顺序：从 0° 慢慢拖到 30°，看侧视图里那一圈空气缩小，速度图上的点沿曲线抬升；到 30° 已经是 134 米/秒的西风，60° 时接近 700 米/秒。真实大气的高空西风一般只有每秒几十米，说明空气走不了这么远就被摩擦和大气中的涡旋挡下了：从赤道出发的环流只能伸到中纬度。把滑杆拖到负纬度，西风同样出现，但偏转方向反过来。',

    s3k: '第 3 步 · 大圈能伸多远',
    s3t: '自转越快，从赤道出发的大圈为什么越窄？',
    s3e: '这一步要回答：从赤道上升、向两极流去的那个大圈（叫<strong>哈得来环流</strong>）能伸到多高的纬度？上一步说明，空气向高纬走得越远，西风就越强，这股强西风需要南北之间足够大的温度差来「撑住」。Held 和 Hou（1980）据此估算出哈得来环流的边缘纬度 φH ≈ √(5gHΔ / 3Ω²a²)（弧度）：g 是重力加速度，H ≈ 10 千米是对流层高度，a 是地球半径，Ω 是自转角速度，Δ = 赤道与两极在不输送热量时的温差 ÷ 300 K。式子说的是：温差越大，大圈越宽；自转越快，大圈越窄，宽度和自转快慢成反比。这个式子是「角度不大」时的近似，估算超过约 45° 后只能当定性参考。图是从赤道（左端）到北极（右端）的剖面，纵轴是高度。',
    daySlider: '自转一圈要几小时（地球是 24）', dTSlider: '不输送热量时赤道比两极热多少（℃）',
    c3: '从赤道到北极的剖面（横轴：纬度，纵轴：高度 千米）',
    s3lgCell: '哈得来环流', s3lgEddy: '中高纬：涡旋（天气系统）负责搬热', s3lgEarth: '地球上实际的边缘（约 30°）',
    s3readout: '一天 {h} 小时、温差 {dT} ℃：估算边缘在约 {phi}°，此处由角动量守恒给出的西风约 {u} 米/秒。{note}',
    s3pole: '一天 {h} 小时、温差 {dT} ℃：估算值 {phi}° 已超过 90°，意思是大圈一路伸到极地；这时式子早已不适用，只能定性地说「转得慢，大圈宽」。',
    s3valid: '估算在近似适用范围内。', s3invalid: '估算已超过 45°，只说明大圈能伸到很高的纬度，具体数值不可信。',
    s3hint: '观察顺序：先保持 24 小时，温差取第 0 步里 D = 0 时算出的约 115 ℃，大圈边缘落在 31° 左右，接近地球实际的 30°。再把一天拖到 12 小时，大圈缩到一半；拖到 96 小时（转得很慢），大圈一路伸到极地附近，这时估算已越过适用范围。最后保持 24 小时改温差，看边缘只随温差的平方根变化。',

    s4k: '第 4 步 · 三圈与风带',
    s4t: '在不同纬度，地面的风从哪个方向吹来？',
    s4e: '这一步要回答：把前三步合起来，地面上的风带长什么样？在地球上，从赤道上升的哈得来环流大约在 30° 下沉，地面的气流再流回赤道；向赤道流的风被自转拧向西，成了从东北（北半球）或东南（南半球）吹来的<strong>信风</strong>。30° 到 60° 之间的地面风流向极地，被拧向东，成了<strong>盛行西风</strong>；这里的「费雷尔环流」是中纬度涡旋平均出来的结果，不是一个真正的独立大圈。60° 以上是较弱的<strong>极地环流</strong>，地面吹<strong>极地东风</strong>。空气上升的地方（赤道、60° 附近）水汽冷却凝结，多雨；下沉的地方（30° 附近、极地）空气变干，多沙漠和晴天。图里上面是从南极到北极的剖面，下面是一张没有大陆的理想地图，箭头是地面风的方向。',
    latSlider4: '选一个纬度',
    c4a: '南极 → 北极剖面：三对环流', c4b: '理想化的地面风（没有大陆）',
    s4lgUp: '上升（多雨）', s4lgDown: '下沉（干燥）', s4lgSel: '你选的纬度',
    s4readout: '纬度 {phi}：{belt}，风从{dir}方吹来；属于{cell}。{motion}',
    trade: '信风带', westerly: '盛行西风带', polar: '极地东风带',
    hadley: '哈得来环流', ferrel: '费雷尔环流（中纬度涡旋的平均）', polarCell: '极地环流',
    rise: '这里空气上升，水汽凝结，常多雨。', sink: '这里空气下沉、变干，常晴朗少雨。', flat: '这里地面风以水平流动为主。',
    dirN: '北', dirNE: '东北', dirE: '东', dirSE: '东南', dirS: '南', dirSW: '西南', dirW: '西', dirNW: '西北',
    s4hint: '观察顺序：从北纬 15° 拖到 45° 再到 75°，读数里的风向从东北变成西南再变回东北；剖面图里亮点依次落在哈得来、费雷尔、极地三个圈里。再拖到南半球同样的纬度，风向变成东南、西北、东南：南北半球左右对称。这是把带状边界固定在 30° 和 60° 的理想图，真实风带会随季节南北移动，还会被大陆打断。',

    s5k: '第 5 步 · 季风',
    s5t: '为什么南亚的风夏天从海上来、冬天从陆地来？',
    s5e: '这一步要回答：同一片海岸，风向为什么随季节掉头？关键是陆地和海洋升温的快慢。海水上层几十米会被风浪搅匀，一起吸热，「热容量」很大，夏天升温慢、冬天降温也慢；陆地只有表面薄薄一层参与，热容量小，升温降温都快。模型把北纬 20° 的陆地当作 1 米深的水（表示它的热容量很小），把海洋当作一层几十米深的混合层，两者吸收同样的季节性阳光，各自算出比全年平均高或低多少度。夏天陆地比海面热，按第 1 步，地面风从海上吹向陆地；再加上北半球向右偏，就成了从<strong>西南</strong>来的<strong>夏季风</strong>，带来海上的水汽；冬天陆地更冷，风反过来，从<strong>东北</strong>吹来。这种随季节掉头的风叫<strong>季风</strong>。上面的图横轴是月份、纵轴是比全年平均高出的度数；下面的图是一段海岸的示意（北边陆地，南边海洋）。',
    month: '月份', depth: '海洋混合层深度（米）', playYear: '播放一年',
    c5a: '比全年平均高出 / ℃（横轴：月份）', c5b: '海岸示意：北边陆地，南边海洋',
    s5lgLand: '陆地', s5lgSea: '海面', s5lgMonth: '当前月份',
    mon1: '1月', mon2: '2月', mon3: '3月', mon4: '4月', mon5: '5月', mon6: '6月', mon7: '7月', mon8: '8月', mon9: '9月', mon10: '10月', mon11: '11月', mon12: '12月',
    s5readout: '{m}：陆地比全年平均 {land} ℃，海面 {sea} ℃，陆地减海面 {diff} ℃ → {wind}。全年里陆地温度的起伏（半振幅）{la} ℃、海面 {sa} ℃；陆地最热在 {lp}，海面最热在 {sp}。',
    s5summer: '陆地更热，地面风从海上吹向陆地，偏转后为西南季风', s5winter: '陆地更冷，地面风从陆地吹向海上，偏转后为东北季风', s5calm: '两边差不多热，风向正在转换',
    s5hint: '观察顺序：按「播放一年」，看陆地曲线又高又早地起伏，海面曲线又平又晚；示意图里的风箭头随之在夏天指向陆地、冬天指向海洋。再把混合层调浅到 10 米，海面的起伏变大、陆海温差变小。模型没有蒸发、云和热量输送，陆地的季节起伏比真实的大；它也没有水汽和降雨，所以风向转换的月份只是大致对应真实季风。',
    lowL: '低', highH: '高',

    s6k: '第 6 步 · 收束', s6t: '把「风从哪里来」说给别人听',
    s6fin: '<strong>第 0 步</strong>：低纬吸收多、高纬放出多，要靠约 5 拍瓦的向极输送才能把赤道和两极的温差从一百多度压到四十度左右。<strong>第 1 步</strong>：热空气柱更高，同一高度上气压更大，空气在高空从热处流向冷处、在地面从冷处流回热处。<strong>第 2 步</strong>：向高纬流动的空气保持角动量，变成越来越强的西风。<strong>第 3 步</strong>：所以从赤道出发的大圈只能伸到约 30°，自转越快越窄。<strong>第 4 步</strong>：三圈环流给出信风、盛行西风和极地东风，上升带多雨、下沉带干燥。<strong>第 5 步</strong>：陆地热容量小，夏热冬冷都比海快，风随季节掉头，就是季风。',
    quizPrompt: '小测：如果地球自转变慢，一天 48 小时，其他不变，哈得来环流的边缘会怎样？',
    quizA: '基本不变，仍在 30° 左右', quizB: '向高纬扩展到约 60°', quizC: '向赤道收缩到约 15°',
    check: '检查答案', correct: '对。边缘纬度和自转角速度成反比：一天变成 48 小时，Ω 减半，估算从约 {a}° 变成约 {b}°（已超过 45°，只能当定性结论：大圈会伸得更远）。', wrong: '再想想第 3 步的式子：φH 和 Ω 成反比。转得越慢，Ω 越小，大圈会怎样？',
    boundary: '适用范围：第 0 步是只有纬度一个维度的扩散能量平衡模型，D 代表大气和海洋的总输送；第 1 步只算温差造成的初始气压分布；第 2 步假设空气没有摩擦、从赤道静止出发；第 3 步的 Held–Hou 估算是小角度近似；第 4 步的风带边界固定在 30° 和 60°，没有大陆和季节移动；第 5 步的两层模型没有蒸发、云、水汽和热量输送。',
    linksTitle: '接着去看',
    lk1: '→ 四季与地轴倾斜，第 2 步：同一个地方，夏天和冬天正午的太阳一样高吗',
    lk2: '→ 地球能量收支，第 0 步：同一个太阳，为什么不同地方晒到的能量不同',
    lk3: '→ 经纬度，第 0 步：怎样用两个数说出地球上任意一个地方',
    lk4: '→ 水的循环，第 1 步：上升的空气冷却到露点，凝结成云',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《大气环流与季风 · 风从哪里来》的平行版本。'
  },
  en: {
    pageTitle: 'Atmospheric Circulation & Monsoons · How Wind Carries Heat',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Atmospheric Circulation & Monsoons · Where Winds Come From →',
    navLabel: 'Atmospheric circulation steps',
    tagline: 'The tropics soak up more sunshine than the poles all year round, yet the equator does not keep heating up and the poles do not keep cooling: winds and ocean currents carry the extra heat away. This page starts by working out how much heat has to move, then shows how uneven heating makes air turn over, how Earth’s spin twists one big loop into three cells and a set of wind belts, and how land and sea warming at different speeds makes the monsoon reverse once a year.',
    nav0: '0 Heat to move', nav1: '1 Warm and cold', nav2: '2 The spin’s twist', nav3: '3 How far the loop reaches', nav4: '4 Cells and belts', nav5: '5 Monsoon', nav6: '6 Wrap-up',

    s0k: 'Step 0 · The ledger',
    s0t: 'If air and ocean carried no heat, how much warmer would the equator be than the poles?',
    s0e: 'This step answers: how much heat must be carried poleward to even out the extra sunshine absorbed at low latitudes? We use an <strong>energy-balance model</strong>: cut half the globe into many latitude strips. Each strip absorbs sunlight (orange in the middle chart, in watts per square metre) and gives heat off to space (cyan; the warmer it is, the more it gives off). Any difference has to be made up by heat moving between neighbouring strips. A single number <strong>D</strong> sets how well heat moves: for the same north–south temperature difference, a larger D carries more heat. It stands in for winds and ocean currents together, without saying which does the carrying. All three charts have latitude across (0° is the equator, 90° the pole). The first shows the annual-mean temperature, with the grey dashed line for D = 0, no transport at all. The second shows absorbed (orange) against emitted (cyan), with orange shading for surplus and blue for deficit. The third shows the total power flowing poleward across each latitude circle, in petawatts (1 PW = 10¹⁵ W). (<a class="xlink" href="../../../earth/climate/climate-energy/#step0">→ Earth’s energy budget, step 0: why one Sun delivers different energy to different latitudes</a>)',
    dSlider: 'Heat-transport strength D (W/m² per °C)',
    c0a: 'Annual-mean temperature / °C', c0b: 'Sunlight absorbed and heat emitted / W per m²', c0c: 'Poleward heat transport / PW', latAxis: 'Latitude',
    s0lgT: 'Temperature with this D', s0lgT0: 'D = 0 (no transport)', s0lgIn: 'Sunlight absorbed', s0lgOut: 'Heat emitted', s0lgSur: 'Surplus / deficit', s0lgF: 'Transport',
    s0readout: 'D = {D}: equator {eq} °C, pole {pole} °C, a gap of {gap} °C ({gap0} °C with no transport). Strips equatorward of about {cross}° absorb more than they emit and those poleward do the opposite; poleward transport peaks at {pw} PW at latitude {lat}°. The global mean is {mean} °C whatever D is.',
    s0none: 'D = 0: each strip must balance on its own, so the equator sits at {eq} °C and the pole at {pole} °C, a gap of {gap} °C, and no heat flows poleward. The global mean is {mean} °C.',
    s0hint: 'What to try: drag D to 0 and the temperature line lies on the grey dashed one, with the equator over a hundred degrees warmer than the pole. Then raise D slowly: the temperature line flattens and the transport curve in the third chart swells. Notice the global mean never moves: transport only shifts heat from low to high latitudes. At D ≈ 0.65 the model’s peak transport is about 5.5 PW, a little past 30°, the same size as estimates from observations. The parameters are the usual values for this kind of teaching model; the albedo pattern is this page’s choice.',

    s1k: 'Step 1 · Warm and cold',
    s1t: 'Warm on one side, cold on the other: why does the air start turning in a loop?',
    s1e: 'This step answers: how does a temperature difference turn into a pressure difference, and then into wind? Picture two columns of air at the coast, both starting with 1000 hectopascals (hPa, a pressure unit) at the ground. Warm air is “puffier”: the same amount of air takes up more height in the warm column. So you have to climb higher in the warm column to reach the same pressure, say 500 hPa; put the other way, at any given height the pressure above the warm column is higher. Air aloft therefore flows from the warm side to the cold side. Losing air lowers the ground pressure under the warm column (a <strong>thermal low</strong>) and raises it under the cold one, so near the ground the wind blows from cold to warm. Together that is a loop: rising over the warm side, flowing to the cold side aloft, sinking there, and returning along the ground. It is called a <strong>thermal circulation</strong>; the daytime sea breeze and the summer monsoon are both examples. In the picture, height (km) runs up the side, and each line joins the heights where the two columns reach the same pressure (an <strong>isobaric surface</strong>). The slider sets how much warmer the land is than the sea; the readout’s temperatures are averages over each whole column, ground to upper air, and because the upper air is very cold they sit below freezing.',
    dtSlider: 'How much warmer the land is than the sea (°C; negative = colder)',
    c1: 'Isobaric surfaces over sea and land (up: height, km)', sea: 'Sea', land: 'Land',
    s1lgIso: 'Isobaric surfaces (every 100 hPa)', s1lgFlow: 'Direction of the loop (animation shows direction only, not speed)',
    s1readout: 'Land column averages {tl} °C, sea column {ts} °C: the 500 hPa surface sits at {zl} m over the land and {zs} m over the sea, {dz} m apart; at 5 km the pressure differs by {dp} hPa. {dir}',
    s1warm: 'Aloft, air flows from land to sea; at the ground the wind blows from sea to land (a sea breeze).',
    s1cold: 'Aloft, air flows from sea to land; at the ground the wind blows from land to sea (a land breeze).',
    s1zero: 'Both sides are equally warm, so the isobaric surfaces are flat, there is no pressure difference and no loop.',
    s1hint: 'What to try: set the difference to 0 and every isobaric surface is level. Make it positive and the surfaces lift on the land side, more the higher you go; make it negative and the tilt, and the loop, reverse. Each extra 1 °C raises the 500 hPa surface by about 20 m. This only computes the starting pressure pattern; once the wind blows it moves air away, and that movement is what creates the thermal low at the ground.',

    s2k: 'Step 2 · The spin’s twist',
    s2t: 'Air leaving the equator heads north: why does it turn into a strong westerly?',
    s2e: 'This step answers: on a still Earth a thermal loop could run all the way from equator to pole; why is a spinning Earth different? Earth turns west to east once a day, so the ground at the equator moves east at about 465 m/s; at higher latitudes the ground is closer to the axis and moves east more slowly. The “amount of spin” of a ring of air around the axis is its <strong>angular momentum</strong>, equal to its eastward speed × its distance from the axis. Without friction it stays the same, just as a figure skater spins faster when pulling in their arms. So a ring of air that started out moving with the equatorial ground has to speed up eastward as it moves poleward and closer to the axis, until it outruns the ground beneath it: to someone standing there it is an ever-stronger <strong>westerly</strong> (a wind from the west). This sideways turn of moving air is to the right in the northern hemisphere and to the left in the southern; its strength is usually written as the <strong>Coriolis parameter</strong> f = 2Ω sin φ (Ω is Earth’s spin rate, φ the latitude), zero at the equator and growing toward the poles. (<a class="xlink" href="../../../earth/astronomy/day-night-rotation/#step4">→ Day and night, step 4: which way Earth turns, and how long a turn takes</a>)',
    latSlider: 'Latitude φ the air reaches',
    c2a: 'Earth from the side: the ring’s distance from the axis', c2b: 'Westerly speed relative to the ground / m/s (across: latitude)',
    s2lgRing: 'This ring of air', s2lgEq: 'Where it started (equator)', s2lgU: 'Westerly from conserved angular momentum', s2lgGround: 'The ground’s own eastward speed',
    s2readout: 'Latitude {phi}: {r} km from the axis ({pct}% of the equator’s), the ground moves east at {g} m/s and the ring at {abs} m/s, so relative to the ground it is a {u} m/s westerly. f = {f} × 10⁻⁴ /s; {side}.',
    s2north: 'northern hemisphere: moving air turns to the right', s2south: 'southern hemisphere: moving air turns to the left', s2eq: 'equator: no sideways turn',
    s2hint: 'What to try: drag slowly from 0° to 30° and watch the ring shrink in the side view while the dot climbs the speed curve. By 30° it is already a 134 m/s westerly, and at 60° nearly 700 m/s. Real winds aloft are usually a few tens of metres per second, which tells us the air cannot get that far before friction and the swirling eddies of the atmosphere stop it: a loop starting at the equator can only reach the mid-latitudes. Drag to negative latitudes and the westerly appears again, but the turn is the other way.',

    s3k: 'Step 3 · How far the loop reaches',
    s3t: 'Why does the big loop from the equator get narrower when the planet spins faster?',
    s3e: 'This step answers: how far toward the poles can the big loop that rises at the equator (the <strong>Hadley cell</strong>) reach? The previous step showed that the farther air travels poleward the stronger its westerly becomes, and such a strong westerly can only be “held up” by a large enough north–south temperature difference. Held and Hou (1980) used this to estimate the edge of the Hadley cell as φH ≈ √(5gHΔ / 3Ω²a²) radians, where g is gravity, H ≈ 10 km the height of the lower atmosphere, a Earth’s radius, Ω its spin rate, and Δ the equator-to-pole temperature difference with no heat transport, divided by 300 K. In words: a bigger temperature difference widens the loop, faster spin narrows it, and the width is inversely proportional to the spin rate. It is a small-angle approximation, so estimates beyond about 45° are only a qualitative guide. The picture is a slice from the equator (left end) to the North Pole (right end), with height up the side.',
    daySlider: 'Hours per rotation (Earth: 24)', dTSlider: 'Equator-minus-pole temperature with no transport (°C)',
    c3: 'Slice from equator to North Pole (across: latitude, up: height km)',
    s3lgCell: 'Hadley cell', s3lgEddy: 'Mid and high latitudes: eddies (weather systems) carry the heat', s3lgEarth: 'Earth’s actual edge (about 30°)',
    s3readout: '{h}-hour day, {dT} °C difference: the estimated edge is near {phi}°, where conserved angular momentum gives a westerly of about {u} m/s. {note}',
    s3pole: '{h}-hour day, {dT} °C difference: the estimate, {phi}°, is past 90°, meaning the loop runs all the way to the pole; the formula has long stopped applying, so all we can say is “slow spin, wide loop”.',
    s3valid: 'The estimate is within the approximation’s range.', s3invalid: 'The estimate is beyond 45°: it only says the loop reaches high latitudes; the number itself is not reliable.',
    s3hint: 'What to try: keep 24 hours and use a difference of about 115 °C, the D = 0 gap from step 0; the edge lands near 31°, close to Earth’s real 30°. Then set the day to 12 hours and the loop shrinks to half; at 96 hours (a slow spin) it stretches almost to the pole, by which point the estimate is outside its range. Finally keep 24 hours and change the temperature difference: the edge only moves with its square root.',

    s4k: 'Step 4 · Cells and belts',
    s4t: 'At each latitude, which direction does the surface wind come from?',
    s4e: 'This step answers: putting the first three steps together, what do the surface wind belts look like? On Earth the Hadley cell rises at the equator and sinks near 30°, and the surface air flows back toward the equator. Turned westward by the spin, that return flow becomes the <strong>trade winds</strong>, from the north-east in the northern hemisphere and the south-east in the southern. Between 30° and 60° the surface flow heads poleward and is turned eastward into the <strong>prevailing westerlies</strong>; the “Ferrel cell” here is what the mid-latitude eddies look like when averaged, not a real stand-alone loop. Beyond 60° a weaker <strong>polar cell</strong> brings the <strong>polar easterlies</strong>. Where air rises (the equator, around 60°) its vapour cools and condenses, so it rains a lot; where air sinks (around 30°, the poles) it dries out, giving deserts and clear skies. The top picture is a slice from South Pole to North Pole; the bottom one is an idealised map with no continents, with arrows showing the surface wind.',
    latSlider4: 'Pick a latitude',
    c4a: 'South Pole → North Pole slice: three pairs of cells', c4b: 'Idealised surface winds (no continents)',
    s4lgUp: 'Rising (wet)', s4lgDown: 'Sinking (dry)', s4lgSel: 'Your latitude',
    s4readout: 'Latitude {phi}: {belt}, wind from the {dir}; part of the {cell}. {motion}',
    trade: 'trade-wind belt', westerly: 'westerly belt', polar: 'polar-easterly belt',
    hadley: 'Hadley cell', ferrel: 'Ferrel cell (the average of mid-latitude eddies)', polarCell: 'polar cell',
    rise: 'Air rises here; its vapour condenses and it is often rainy.', sink: 'Air sinks and dries here; it is often clear and dry.', flat: 'Here the surface flow is mostly horizontal.',
    dirN: 'north', dirNE: 'north-east', dirE: 'east', dirSE: 'south-east', dirS: 'south', dirSW: 'south-west', dirW: 'west', dirNW: 'north-west',
    s4hint: 'What to try: drag from 15° N to 45° N and on to 75° N; the readout’s wind turns from north-east to south-west and back to north-east, while the bright dot in the slice moves through the Hadley, Ferrel and polar cells. Then try the same latitudes in the south: south-east, north-west, south-east, a mirror image. This idealised picture pins the belt edges at 30° and 60°; real belts shift north and south with the seasons and are broken up by continents.',

    s5k: 'Step 5 · Monsoon',
    s5t: 'Why does South Asia’s wind come off the sea in summer and off the land in winter?',
    s5e: 'This step answers: why does the wind on the same coast reverse with the seasons? The key is how fast land and sea warm up. Wind and waves stir the top few tens of metres of the sea, so all that water absorbs heat together; its “heat capacity” is large, so it warms slowly in summer and cools slowly in winter. On land only a thin surface layer takes part, so its heat capacity is small and it warms and cools quickly. The model treats land at 20° N as if it were 1 metre of water (meaning its heat capacity is small) and the sea as a mixed layer tens of metres deep; both receive the same seasonal sunshine, and each gets its own departure from its annual mean. In summer the land is warmer, so by step 1 the surface wind blows from sea to land; turned to the right in the northern hemisphere it arrives from the <strong>south-west</strong> as the <strong>summer monsoon</strong>, bringing moisture off the ocean. In winter the land is colder and the wind reverses, coming from the <strong>north-east</strong>. A wind that reverses with the seasons is a <strong>monsoon</strong>. The top chart has months across and degrees above the annual mean up the side; the bottom picture is a sketch of a coast with land to the north and sea to the south.',
    month: 'Month', depth: 'Ocean mixed-layer depth (m)', playYear: 'Play one year',
    c5a: 'Above the annual mean / °C (across: month)', c5b: 'Coast sketch: land to the north, sea to the south',
    s5lgLand: 'Land', s5lgSea: 'Sea surface', s5lgMonth: 'Current month',
    mon1: 'Jan', mon2: 'Feb', mon3: 'Mar', mon4: 'Apr', mon5: 'May', mon6: 'Jun', mon7: 'Jul', mon8: 'Aug', mon9: 'Sep', mon10: 'Oct', mon11: 'Nov', mon12: 'Dec',
    s5readout: '{m}: land {land} °C from its annual mean, sea {sea} °C, land minus sea {diff} °C → {wind}. Over the year the land swings by ±{la} °C and the sea by ±{sa} °C; the land is warmest in {lp}, the sea in {sp}.',
    s5summer: 'land warmer, surface wind blows from sea to land, turned into a south-west monsoon', s5winter: 'land colder, surface wind blows from land to sea, turned into a north-east monsoon', s5calm: 'both about equally warm; the wind is turning round',
    s5hint: 'What to try: press “Play one year” and watch the land curve swing high and early while the sea curve stays flat and late; the wind arrow in the sketch points toward the land in summer and out to sea in winter. Then make the mixed layer shallow, 10 m: the sea swings more and the land–sea difference shrinks. The model has no evaporation, clouds or heat transport, so the land’s seasonal swing is larger than in reality; it also has no moisture or rain, so the months when the wind turns only roughly match the real monsoon.',
    lowL: 'L', highH: 'H',

    s6k: 'Step 6 · Wrap-up', s6t: 'Explain where winds come from',
    s6fin: '<strong>Step 0</strong>: low latitudes absorb more and high latitudes emit more, and about 5 PW of poleward transport is needed to squeeze the equator-to-pole gap from over a hundred degrees down to around forty. <strong>Step 1</strong>: a warm column is taller, so at the same height its pressure is higher; air flows from warm to cold aloft and back from cold to warm along the ground. <strong>Step 2</strong>: air moving poleward keeps its angular momentum and becomes an ever-stronger westerly. <strong>Step 3</strong>: so the loop from the equator only reaches about 30°, and less on a faster-spinning planet. <strong>Step 4</strong>: three cells give the trades, the westerlies and the polar easterlies, with wet rising belts and dry sinking belts. <strong>Step 5</strong>: land’s small heat capacity makes it heat and cool faster than the sea, so the wind reverses with the seasons: the monsoon.',
    quizPrompt: 'Quick check: if Earth spun more slowly, with a 48-hour day and nothing else changed, what would happen to the edge of the Hadley cell?',
    quizA: 'Hardly change, still near 30°', quizB: 'Spread poleward to around 60°', quizC: 'Shrink toward the equator, to around 15°',
    check: 'Check', correct: 'Right. The edge is inversely proportional to the spin rate: a 48-hour day halves Ω, and the estimate moves from about {a}° to about {b}° (beyond 45°, so read it qualitatively: the loop reaches much farther).', wrong: 'Think again about step 3’s formula: φH is inversely proportional to Ω. A slower spin means a smaller Ω, so what happens to the loop?',
    boundary: 'Scope: step 0 is a one-dimensional (latitude-only) diffusive energy-balance model in which D stands for air and ocean transport together; step 1 only computes the starting pressure pattern from a temperature difference; step 2 assumes frictionless air starting at rest on the equator; step 3’s Held–Hou estimate is a small-angle approximation; step 4 fixes the belt edges at 30° and 60° with no continents or seasons; step 5’s two-layer model has no evaporation, clouds, moisture or heat transport.',
    linksTitle: 'Where to go next',
    lk1: '→ Seasons and axial tilt, step 2: is the noon Sun as high in winter as in summer?',
    lk2: '→ Earth’s energy budget, step 0: why one Sun delivers different energy to different places',
    lk3: '→ Latitude and longitude, step 0: naming any place on Earth with two numbers',
    lk4: '→ The water cycle, step 1: rising air cools to its dew point and condenses into cloud',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Atmospheric Circulation & Monsoons · Where Winds Come From”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
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
  if (typeof window.refreshLesson === 'function') window.refreshLesson();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.LESSON_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
