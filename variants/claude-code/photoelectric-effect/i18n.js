'use strict';
// Photoelectric-effect lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '光电效应 · 一次只吞一个光子',
    back: '← 知识索引',
    compare: '对照另一版本：光电效应 · 光是一份一份的 →',
    navLabel: '光电效应步骤导航',
    tagline: '光照到金属上，有时能打出电子，有时再亮也打不出来。决定成败的不是亮度，而是颜色。六步里你会从一只真空光电管出发，找到这道门槛，记下一个光子的能量账，用电压把电子的动能量出来，再用几条谱线亲手测出普朗克常数，最后看连续波的图像为什么解释不了这一切。',
    nav0: '0 门槛', nav1: '1 能量账', nav2: '2 遏止电压', nav3: '3 测 h', nav4: '4 弱光', nav5: '5 收束',

    s0k: '第 0 步 · 先看现象',
    s0t: '什么样的光，才能把电子从金属里打出来？',
    s0e: '这一步要回答：把一块钠板封进真空管里用光照，是光越亮越容易打出电子，还是另有门槛？装置是这样的：光从窗口照到<strong>阴极</strong>（钠板）上，被打出来的电子飞向对面的<strong>阳极</strong>，再经导线流回阴极；电流表读出的就是<strong>光电流</strong> I，等于每秒到达阳极的电子数乘以每个电子的电荷 e。光有两个可调的量：<strong>波长</strong> λ，决定颜色，λ 越短，频率 f = c/λ 越高（光作为波的性质见 <a class="xlink" href="../../../physics/waves/interference/#step1">→ 干涉页第 1 步：波的加强与抵消</a>）；<strong>亮度</strong>，本页按光的功率算，100% = 1 mW。画面按爱因斯坦的<strong>光子</strong>模型来画：光由一份一份的能量包组成，每个光子带能量 hf（h 是普朗克常数），第 1 步再细算这笔账。并不是每个光子都能打出电子：本页假设平均每 10 个光子打出 1 个（<strong>量子效率</strong> η = 10%），真实金属通常更低。',
    lamLabel: '波长 λ（nm）', intLabel: '亮度（% of 1 mW）', clearDots: '清除记录点',
    s0lgPh: '光子（颜色按波长）', s0lgEl: '飞出的电子', s0lgCurve: '当前亮度下 I 随 λ 的曲线', s0lgDot: '记录点（每个试过的组合都留下）',
    c0a: '真空光电管（教学慢放，不按真实比例）', c0b: '光电流 I（µA）与波长 λ（nm），钠板',
    lbLamp: '光源', lbCathode: '阴极（{m}）', lbAnode: '阳极', lbMeter: '电流表',
    s0readout: 'λ = {lam} nm（每个光子 hf = {ev} eV；钠的逸出功 φ = {phi} eV）· 亮度 {pct}%：每秒 {nph} 个光子打到板上，{verdict}',
    s0yes: '每秒飞出 {ne} 个电子，光电流 I = {I} µA。',
    s0no: '一个电子也打不出来，I = 0。每个光子比 φ 少 {gap} eV；调亮只会让这样「不够格」的光子更多。',
    s0dark: '亮度为 0：没有光子，也没有电子。',
    s0count: '慢放计数（画面约每秒 {rate} 个光子；真实是每秒 {nph} 个）：已有 {np} 个光子打到板上，飞出 {ne} 个电子。',
    s0still: '已开启「减弱动态」：光电管为静态示意，数值见上方读数。',
    s0hint: '观察顺序：① 保持亮度不动，把波长从 450 nm 往长处拖：「光电流与波长」图每到一处留下一个白点；电流先缓慢上升（同样的功率，波长越长，每个光子能量越小、个数越多），越过 λ₀ ≈ {l0} nm 后一下子掉到 0。② 停在 600 nm，把亮度拖到 100%：光电管里光子明显变多，电子仍然一个都没有。③ 回到 450 nm 再拖亮度：电流跟亮度成正比。这里出现两个问题：门槛 λ₀ 从哪来？飞出来的电子各带多少能量？第 1、2 步回答。逸出功 φ：电子离开金属至少要付的能量；eV（电子伏）：一个电子经过 1 V 电压得到的能量，1 eV ≈ 1.602 × 10⁻¹⁹ J。',

    s1k: '第 1 步 · 一个光子的账',
    s1t: '电子吞下一个光子，这份能量怎么花？',
    s1e: '这一步要回答：为什么存在门槛 λ₀，而且门槛跟亮度无关？爱因斯坦的回答：电子一次只吸收一个光子，拿到的能量就是 <strong>E = hf = hc/λ</strong>，h ≈ 6.626 × 10⁻³⁴ J·s 是<strong>普朗克常数</strong>（它最早出现在黑体辐射里，见 <a class="xlink" href="../../../physics/modern/blackbody-radiation/#step5">→ 黑体辐射页第 5 步：能量为什么一份一份</a>）。这份能量先要付<strong>逸出功</strong> φ，即电子离开金属至少要付的能量；剩下的变成电子飞出时的动能。离表面最近、最容易出来的电子只付 φ，动能最大：<strong>K_max = hf − φ</strong>（爱因斯坦光电方程）；更深处的电子要多付一些，动能更小，所以飞出的电子动能分布在 0 到 K_max 之间。hf 恰好等于 φ 时一点不剩，这个频率叫<strong>截止频率</strong> f₀ = φ/h，对应波长 λ₀ = hc/φ。频率低于 f₀ 的光子，来再多也没用：电子吞一个、不够、热掉，攒不起来。能量单位用 eV（电子伏，1 eV ≈ 1.602 × 10⁻¹⁹ J，一个电子经过 1 V 电压得到的能量）。',
    metalLabel: '金属：',
    mt_Cs: '铯 Cs', mt_Na: '钠 Na', mt_Zn: '锌 Zn', mt_Cu: '铜 Cu', mt_Pt: '铂 Pt',
    c1a: '一个光子的能量账（eV）', c1b: 'K_max（eV）与频率 f（10¹⁴ Hz）',
    col1: '光子 hf', col2: '电子：φ + K_max', lbPhi: 'φ', lbK: 'K_max',
    s1lgHf: '光子能量 hf（颜色按波长）', s1lgPhi: '逸出功 φ', s1lgK: '剩下的最大动能 K_max', s1lgSel: '选中金属的 K_max–f 直线', s1lgOther: '其他四种金属',
    s1yes: '{metal}：λ = {lam} nm，f = {f} × 10¹⁴ Hz，hf = {ev} eV；减去 φ = {phi} eV，K_max = {k} eV。截止频率 f₀ = {f0} × 10¹⁴ Hz（λ₀ = {l0} nm）。',
    s1no: '{metal}：λ = {lam} nm，f = {f} × 10¹⁴ Hz，hf = {ev} eV，小于 φ = {phi} eV，打不出电子。要 f 高于 f₀ = {f0} × 10¹⁴ Hz，也就是 λ 短于 {l0} nm。',
    s1hint: '观察顺序：① 选钠，拖波长：「能量账」图里彩色柱（光子能量 hf）跟着变高变矮，橙色虚线 φ 不动，绿色那段 K_max 是两者之差；柱子低于虚线时绿色消失。② 看「K_max 与频率」图：五种金属各是一条直线，彼此平行：频率每高 1 × 10¹⁴ Hz，K_max 就多 {dk} eV，这个斜率就是 h。③ 换金属：只有直线的起点 f₀ 左右移动，斜率不变。铜和铂的门槛在紫外区（λ < {lCu} nm），可见光一律打不出电子。',

    s2k: '第 2 步 · 用电压量动能',
    s2t: 'K_max 是电子的能量，怎样用一只电压表把它量出来？',
    s2e: '这一步要回答：能不能直接测出 K_max = hf − φ？办法是给电子设一道「坡」：让阳极的电势比阴极低 |V|（V 为负），电子飞向阳极就要逆着电场走，每飞过去要付出 e|V| 的能量（电压与能量的关系见 <a class="xlink" href="../../../physics/electromagnetism/electric-fields/#step3">→ 电场页第 3 步：沿电场移动电荷要做功</a>）。动能 K 小于 e|V| 的电子半路折返，只有 K > e|V| 的电子到得了阳极，电流因此变小。|V| 大到连动能为 K_max 的电子也过不去时，电流刚好为 0，这时的 |V| 叫<strong>遏止电压</strong> V_s，满足 <strong>eV_s = K_max</strong>。用 eV 作能量单位时最方便：K_max 是几 eV，V_s 就是几伏。V 为正时电场帮电子加速，飞出的电子全部被收集，电流不再随 V 增加，叫<strong>饱和电流</strong>。本步固定用钠板。「电子行」图每行画一个电子，从下往上初动能由小到大，均匀排在 0 到 K_max 之间（本页的假设）；绿色到达阳极，粉色折返。',
    vLabel: '电压 V（阳极相对阴极，V）', lam2Label: '波长 λ（nm）', bright: '亮度：', intFull: '100%', intHalf: '50%',
    sweep2: '从 +2 V 扫到 −4 V', clearTrace: '清除扫描点',
    c2a: '电子行：每行一个电子，越往上越快', c2b: 'I–V 曲线：光电流 I（µA）与电压 V',
    lbVs: '−V_s',
    s2lgArr: '到达阳极的电子', s2lgBack: '半路折返的电子', s2lgCur: '当前亮度的 I–V 曲线', s2lgOther: '另一种亮度（对照）', s2lgDot: '扫描或拖动留下的点',
    s2readout: 'λ = {lam} nm、亮度 {pct}%、V = {V} V：K_max = {k} eV，所以 V_s = {vs} V。{state}I = {I} µA，是饱和电流 {isat} µA 的 {frac}%。',
    s2stFwd: '电压帮电子加速，飞出的电子全部到达阳极。',
    s2stPart: '只有动能大于 {ev} eV 的电子能爬到阳极。',
    s2stStop: '连动能最大的电子也爬不过去。',
    s2none: 'λ = {lam} nm：光子能量 {ev} eV 不到钠的 φ = {phi} eV，没有电子飞出，任何电压下 I 都是 0。',
    s2hint: '观察顺序：① 点「从 +2 V 扫到 −4 V」：「I–V 曲线」图留下一串点，V > 0 时电流不变，V < 0 后直线下降，在 −V_s 处归零；「电子行」图里粉色折返的行从下往上越来越多。② 点「亮度 50%」再扫一次：饱和电流减半，归零的位置不动。③ 把波长调短：V_s 变大，归零点往左移。下降段是直线，这来自「动能均匀分布」的假设；真实曲线更弯，但归零点只由 K_max 决定。',
    quiz2: '亮度减半，遏止电压 V_s 会怎样？',
    quiz2a: '也减半', quiz2b: '不变', quiz2c: '变成两倍',
    check: '核对',
    correct2: '对。亮度只改变每秒来多少个光子，不改变每个光子的能量 hf，所以 K_max = hf − φ 不变，V_s 也不变；变的只是饱和电流（减半）。',
    wrong2: '再看「I–V 曲线」图：两种亮度的曲线高度不同，它们在哪里归零？',

    s3k: '第 3 步 · 测出普朗克常数',
    s3t: '换几种颜色的光各测一次 V_s，能不能算出 h？',
    s3e: '这一步要回答：既然 eV_s = hf − φ，能否反过来用实验测出普朗克常数 h？把式子改写成 <strong>V_s = (h/e)·f − φ/e</strong>：以频率 f 为横轴、遏止电压 V_s（电流归零时的反向电压）为纵轴，数据点应落在一条直线上，<strong>斜率是 h/e</strong>，直线延长到 f = 0 处的值是 −φ/e，与横轴的交点是截止频率 f₀。汞灯发出几条波长确定的谱线，用滤光片一次只放一条进来，测一次 V_s。点一条谱线就记录一个点。这些读数是<strong>模拟</strong>的：用模型算出 V_s，再加上不超过 ±0.03 V 的读表误差（固定的伪随机数，不是真实数据）。有两个以上的点时，页面用<strong>最小二乘法</strong>拟合直线，即让各点到直线的竖直距离的平方和最小。',
    metal3Label: '阴极金属：', lineLabel: '汞灯谱线（nm）：', all3: '测完全部谱线', clear3: '清空全部数据',
    c3: '遏止电压 V_s（V）与频率 f（10¹⁴ Hz）',
    s3lgFit: '最小二乘拟合直线（虚线为延长段）',
    s3start: '还没有数据：点一条谱线测一次 V_s。',
    s3got: '{metal}，{lam} nm（f = {f} × 10¹⁴ Hz）：测得 V_s = {vs} V（模型值 {vt} V，加了模拟读数误差）。',
    s3miss: '{metal}，{lam} nm（f = {f} × 10¹⁴ Hz）：光子能量 {ev} eV 不到 φ，电流始终为 0，测不到 V_s，不记点。',
    s3fit: '{metal}，{n} 个点拟合：斜率 h/e = {slope} V/(10¹⁴ Hz)，所以 h = {h} × 10⁻³⁴ J·s（公认值 6.626，相差 {err}%）；延长到 f = 0 处是 {b} V，所以 φ = {phi} eV；与横轴交于 f₀ = {f0} × 10¹⁴ Hz。',
    s3few: '{metal}：已记录 {n} 个点。至少要 2 个点才能定一条直线。',
    s3others: '其他金属的直线：{list}。斜率几乎相同，h 与金属无关；不同的只是截距 φ。',
    s3item: '{metal} h = {h} × 10⁻³⁴ J·s',
    s3hint: '观察顺序：① 选钠，点「测完全部谱线」（或逐条点）：546.1 nm 和 577.0 nm 测不到（光子能量不够），其余 5 个点排成一条直线，读数里有拟合出的 h。② 换成铯再测一遍：新直线与钠的几乎平行，整体略高（铯的 φ 小）。③ 换成锌：只有 253.7 nm 一条够格，一个点定不出直线，要测锌得用更短的紫外光。④ 点「清空全部数据」，只测 404.7 和 435.8 nm 两条挨得很近的谱线：同样的 ±0.03 V 误差，h 的误差会大得多（钠：{errPair}%，测完 5 条时只有 {errAll}%）。',

    s4k: '第 4 步 · 很弱的光',
    s4t: '如果光只是连续的波，弱光要照多久才能打出第一个电子？',
    s4e: '这一步要回答：光子图像和「光是连续的波」这两种说法，在弱光下预言什么不同？<strong>连续波</strong>把能量均匀铺满整个照射面，每个原子只接得住落在自己那一小块面积 A原子（约 (0.1 nm)² = 10⁻²⁰ m²）上的功率，要一点点攒够逸出功 φ（电子离开金属至少要付的能量），电子才能出来。<strong>光强</strong> I 指每平方米上的光功率（W/m²），光越弱攒得越久：等待时间 t = φ / (I × A原子)。在<strong>光子图像</strong>里能量不用攒：一个光子到了，就可能立刻打出一个电子；光弱只是光子少，电子来得稀，第一个电子何时出现是随机的，平均等 1 ÷（每秒飞出的电子数）。实验上，Lawrence 和 Beams 在 1928 年测得：光一照上，电子在约 3 × 10⁻⁹ s 之内就开始出现。下面固定 λ = 400 nm、钠板受光面积 1 cm²、η = 10%。时间轴是对数刻度：每一大格时间差 1000 倍。',
    i4Label: '光强 I（W/m²，对数滑杆）', reseed4: '换一组随机时刻',
    c4: '等待时间（对数刻度，每大格 ×1000）',
    row1: '波动图像：一个原子攒够 φ 的时间', row2: '光子图像：最先飞出的 10 个电子',
    tk_h: '1 小时', tk_yr: '1 年',
    s4lgWave: '波动图像的等待时间', s4lgPh: '光子图像：每个点是一个电子飞出的时刻', s4lgMean: '平均间隔 1/(每秒电子数)',
    s4readout: 'I = {I} W/m²：波动图像要等 {tw}（{tws} s）。光子图像每秒飞出 {rate} 个电子，平均每 {tp} s 一个；这一组随机时刻里，第一个电子出现在 {t1} s。两种图像相差约 {ratio} 倍。',
    u_yr: '年', u_d: '天', u_h: '小时', u_min: '分钟', u_s: '秒',
    s4hint: '观察顺序：① 把光强往弱拖：「等待时间」图里橙色条往右伸，到 10⁻⁶ W/m² 时要等一年多；青色点也往右移，但第一个点始终在 1 µs 以内。② 点「换一组随机时刻」：青色点重新洒开。第一个点的位置每次都不一样，在对数轴上可能比平均间隔（白色竖线）早好几格；后面的点逐渐排到「平均间隔 × 第几个」附近。这是光子到达的随机性。③ 两种图像的等待时间都与 I 成反比，差的是量级：波动图像慢了约 {ratio} 倍，而实验站在光子这一边。这是数量级估算，A原子 取得大一些或小一些会改变具体数字，但抹不掉十几个数量级的差距。',

    s5k: '第 5 步 · 收束', s5t: '光的能量一份一份地交给电子',
    s5fin: '回头看：<strong>第 0 步</strong>，钠板有门槛波长 λ₀：长于它的光再亮也打不出电子，短于它的光电流与亮度成正比。<strong>第 1 步</strong>，原因是电子一次只吞一个光子，hf 要先付逸出功 φ，剩下的才是动能：K_max = hf − φ。<strong>第 2 步</strong>，用反向电压把电子挡回去，电流归零时 eV_s = K_max；亮度只改电流大小，不改 V_s。<strong>第 3 步</strong>，几条谱线的 V_s 与 f 排成直线，斜率给出 h，不同金属的直线平行。<strong>第 4 步</strong>，连续波要让弱光攒上很久，实验里电子却几乎立刻出现：光的能量是一份一份到达的。',
    formula: 'E = hf = hc/λ\nK_max = hf − φ\neV_s = K_max\nf₀ = φ / h',
    boundary: '适用范围与模型失配：逸出功取教科书上的近似值（干净表面），真实值随表面状况变化零点几 eV；量子效率 η 统一取 10% 且与波长无关，真实值通常更低并随波长变化；饱和电流假设平板电极、电子全部被收集；I–V 曲线下降段的直线形状来自「动能在 0 到 K_max 之间均匀分布」的假设，真实曲线更弯；电极之间的接触电势差会让测到的 V_s 整体偏移一点，但不改斜率 h/e；第 3 步的读数误差是模拟的；第 4 步是数量级估算；忽略温度引起的热电子发射。动画是教学慢放，光子和电子的速度、个数都不是真实比例。',
    quiz5: '钠板用 600 nm 的光照，打不出电子。把亮度调到 10 倍，会怎样？',
    quiz5a: '能打出电子，只是动能很小', quiz5b: '仍然打不出：每个光子的能量没变', quiz5c: '要多照一会儿，攒够能量就会出来',
    correct5: '对。600 nm 光子的能量是 {ev} eV，小于钠的 φ = {phi} eV。亮度 ×10 只是这样的光子多了 10 倍；电子一次只吞一个光子，所以还是打不出来。选项 3 是连续波图像的预言，第 4 步已经看到它和实验不符。',
    wrong5: '回到第 0 步试一试：600 nm、亮度 100%，光电流是多少？',
    linksTitle: '接着去哪',
    lk1: '→ 黑体辐射页第 5 步：普朗克为什么提出「能量一份一份」',
    lk2: '→ 双缝实验页第 2 步：一次只发一颗粒子，条纹还会出现吗',
    lk3: '→ 干涉页第 1 步：光作为波，加强与抵消只看路程差',
    lk4: '→ 电场页第 3 步：沿电场移动电荷要做功，电压怎样换成能量',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《光电效应 · 光是一份一份的》的平行版本。'
  },
  en: {
    pageTitle: 'The Photoelectric Effect · One Photon at a Time',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: The Photoelectric Effect · Light Comes in Packets →',
    navLabel: 'Photoelectric effect step navigation',
    tagline: 'Shine light on a metal and sometimes electrons fly out, sometimes they never do, however bright the light. What decides it is not brightness but colour. In six steps you start from a vacuum phototube, find that threshold, balance one photon’s energy budget, measure the electrons’ energy with a voltage, measure Planck’s constant yourself from a few spectral lines, and finally see why a continuous-wave picture of light cannot explain any of it.',
    nav0: '0 Threshold', nav1: '1 Budget', nav2: '2 Stopping voltage', nav3: '3 Measure h', nav4: '4 Dim light', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Look first',
    s0t: 'What kind of light can knock electrons out of a metal?',
    s0e: 'This step asks: seal a sodium plate in a vacuum tube and shine light on it. Does brighter light simply knock out more electrons, or is there a threshold? The set-up: light comes through a window onto the <strong>cathode</strong> (the sodium plate); electrons knocked out fly across to the <strong>anode</strong> and return through the wire. The meter reads the <strong>photocurrent</strong> I: electrons arriving at the anode per second times the charge e of each one. Two things about the light can be changed. The <strong>wavelength</strong> λ sets the colour; shorter λ means higher frequency f = c/λ (for light as a wave, see <a class="xlink" href="../../../physics/waves/interference/#step1">→ Interference, step 1: waves reinforcing and cancelling</a>). The <strong>brightness</strong> is the light’s power, with 100% = 1 mW. The animation follows Einstein’s <strong>photon</strong> model: light arrives in packets, each carrying energy hf (h is Planck’s constant); step 1 does the accounting. Not every photon frees an electron: this page assumes one in ten on average (a <strong>quantum efficiency</strong> η = 10%); real metals are usually lower.',
    lamLabel: 'Wavelength λ (nm)', intLabel: 'Brightness (% of 1 mW)', clearDots: 'Clear recorded dots',
    s0lgPh: 'photons (coloured by wavelength)', s0lgEl: 'electrons knocked out', s0lgCurve: 'I against λ at the current brightness', s0lgDot: 'recorded dots (one per setting you try)',
    c0a: 'Vacuum phototube (slowed down, not to scale)', c0b: 'Photocurrent I (µA) vs wavelength λ (nm), sodium',
    lbLamp: 'lamp', lbCathode: 'cathode ({m})', lbAnode: 'anode', lbMeter: 'meter',
    s0readout: 'λ = {lam} nm (each photon carries hf = {ev} eV; sodium’s work function φ = {phi} eV) · brightness {pct}%: {nph} photons hit the plate per second, and {verdict}',
    s0yes: '{ne} electrons come out per second, a photocurrent I = {I} µA.',
    s0no: 'not a single electron comes out: I = 0. Each photon is {gap} eV short of φ; more brightness only means more photons that fall short.',
    s0dark: 'Brightness 0: no photons, no electrons.',
    s0count: 'Slow-motion count (about {rate} photons per second on screen; really {nph} per second): {np} photons have hit the plate and {ne} electrons have come out.',
    s0still: 'Reduced motion is on: the tube is a still picture; the numbers are in the readout above.',
    s0hint: 'What to try: ① Keep the brightness fixed and drag the wavelength up from 450 nm. Each position leaves a white dot on the “photocurrent vs wavelength” chart. The current first creeps up (at the same power, longer wavelengths mean smaller photons and more of them), then drops straight to 0 past λ₀ ≈ {l0} nm. ② Stop at 600 nm and push the brightness to 100%: many more photons in the tube, still not one electron. ③ Go back to 450 nm and drag the brightness: the current is proportional to it. Two questions remain: where does λ₀ come from, and how much energy does each electron carry? Steps 1 and 2 answer them. Work function φ: the least energy an electron must pay to leave the metal. eV (electronvolt): the energy one electron gains across 1 V, 1 eV ≈ 1.602 × 10⁻¹⁹ J.',

    s1k: 'Step 1 · One photon’s budget',
    s1t: 'An electron swallows one photon. Where does that energy go?',
    s1e: 'This step asks: why is there a threshold λ₀ at all, and why doesn’t brightness move it? Einstein’s answer: an electron absorbs one photon at a time and gets exactly <strong>E = hf = hc/λ</strong>, where h ≈ 6.626 × 10⁻³⁴ J·s is <strong>Planck’s constant</strong> (it first appeared in blackbody radiation; see <a class="xlink" href="../../../physics/modern/blackbody-radiation/#step5">→ Blackbody radiation, step 5: why energy comes in lumps</a>). Out of that, the electron first pays the <strong>work function</strong> φ, the least energy needed to leave the metal; whatever is left becomes kinetic energy. The electrons nearest the surface pay only φ and leave fastest: <strong>K_max = hf − φ</strong> (Einstein’s photoelectric equation). Electrons from deeper pay more, so the emitted energies range from 0 up to K_max. When hf just equals φ nothing is left over; that frequency is the <strong>threshold frequency</strong> f₀ = φ/h, with wavelength λ₀ = hc/φ. Photons below f₀ are useless however many arrive: an electron takes one, it is not enough, and the energy is lost as heat before another arrives. Energies are in eV (electronvolts: 1 eV ≈ 1.602 × 10⁻¹⁹ J, the energy one electron gains across 1 V).',
    metalLabel: 'Metal:',
    mt_Cs: 'Caesium Cs', mt_Na: 'Sodium Na', mt_Zn: 'Zinc Zn', mt_Cu: 'Copper Cu', mt_Pt: 'Platinum Pt',
    c1a: 'One photon’s energy budget (eV)', c1b: 'K_max (eV) vs frequency f (10¹⁴ Hz)',
    col1: 'photon hf', col2: 'electron: φ + K_max', lbPhi: 'φ', lbK: 'K_max',
    s1lgHf: 'photon energy hf (coloured by wavelength)', s1lgPhi: 'work function φ', s1lgK: 'what is left: K_max', s1lgSel: 'K_max–f line of the chosen metal', s1lgOther: 'the other four metals',
    s1yes: '{metal}: λ = {lam} nm, f = {f} × 10¹⁴ Hz, hf = {ev} eV; minus φ = {phi} eV leaves K_max = {k} eV. Threshold f₀ = {f0} × 10¹⁴ Hz (λ₀ = {l0} nm).',
    s1no: '{metal}: λ = {lam} nm, f = {f} × 10¹⁴ Hz, hf = {ev} eV is less than φ = {phi} eV, so no electrons. f must exceed f₀ = {f0} × 10¹⁴ Hz, i.e. λ shorter than {l0} nm.',
    s1hint: 'What to try: ① Pick sodium and drag the wavelength. On the “energy budget” chart the coloured bar (photon energy hf) rises and falls, the orange dashed line φ stays put, and the green part K_max is the difference; once the bar is below the line the green disappears. ② On the “K_max vs frequency” chart each metal is a straight line, and all five are parallel: every extra 1 × 10¹⁴ Hz adds {dk} eV to K_max, and that slope is h. ③ Switch metals: only the starting point f₀ slides; the slope stays. Copper and platinum have thresholds in the ultraviolet (λ < {lCu} nm), so no visible light frees electrons from them.',

    s2k: 'Step 2 · Measure energy with a voltage',
    s2t: 'K_max is an energy. How can a voltmeter measure it?',
    s2e: 'This step asks: can K_max = hf − φ be measured directly? Put a hill in the electrons’ way: hold the anode |V| below the cathode (V negative). An electron flying to the anode now moves against the electric field and pays e|V| of energy to get across (for how voltage turns into energy, see <a class="xlink" href="../../../physics/electromagnetism/electric-fields/#step3">→ Electric fields, step 3: moving a charge along the field takes work</a>). Electrons with K below e|V| turn back halfway; only those with K above e|V| reach the anode, so the current falls. Once |V| is large enough to stop even the K_max electrons, the current is exactly 0; that |V| is the <strong>stopping voltage</strong> V_s, with <strong>eV_s = K_max</strong>. In eV this is painless: K_max in eV is V_s in volts. With V positive the field speeds electrons up, every emitted electron is collected, and the current stops growing with V: the <strong>saturation current</strong>. This step uses the sodium plate throughout. On the “electron rows” chart each row is one electron, with starting kinetic energy rising from bottom to top, spread evenly between 0 and K_max (this page’s assumption); green ones reach the anode, pink ones turn back.',
    vLabel: 'Voltage V (anode relative to cathode, V)', lam2Label: 'Wavelength λ (nm)', bright: 'Brightness:', intFull: '100%', intHalf: '50%',
    sweep2: 'Sweep from +2 V to −4 V', clearTrace: 'Clear sweep dots',
    c2a: 'Electron rows: one per row, faster ones higher up', c2b: 'I–V curve: photocurrent I (µA) vs voltage V',
    lbVs: '−V_s',
    s2lgArr: 'electrons reaching the anode', s2lgBack: 'electrons turning back', s2lgCur: 'I–V curve at the current brightness', s2lgOther: 'the other brightness (for comparison)', s2lgDot: 'dots left by sweeping or dragging',
    s2readout: 'λ = {lam} nm, brightness {pct}%, V = {V} V: K_max = {k} eV, so V_s = {vs} V. {state}I = {I} µA, {frac}% of the saturation current {isat} µA.',
    s2stFwd: 'The voltage speeds electrons up and every one reaches the anode. ',
    s2stPart: 'Only electrons with more than {ev} eV make it up the hill. ',
    s2stStop: 'Not even the fastest electron makes it up the hill. ',
    s2none: 'λ = {lam} nm: the photon energy {ev} eV is below sodium’s φ = {phi} eV, no electrons come out, and I = 0 at every voltage.',
    s2hint: 'What to try: ① Press “Sweep from +2 V to −4 V”. The “I–V curve” chart fills with dots: flat for V > 0, falling in a straight line once V < 0, reaching zero at −V_s. On the “electron rows” chart more and more rows turn pink, from the bottom up. ② Choose brightness 50% and sweep again: the saturation current halves, the zero crossing stays put. ③ Shorten the wavelength: V_s grows and the zero crossing moves left. The straight falling section comes from the even-spread assumption; real curves bend, but where they reach zero depends only on K_max.',
    quiz2: 'Halve the brightness. What happens to the stopping voltage V_s?',
    quiz2a: 'It halves too', quiz2b: 'It stays the same', quiz2c: 'It doubles',
    check: 'Check',
    correct2: 'Right. Brightness changes how many photons arrive per second, not the energy hf of each one, so K_max = hf − φ is unchanged and so is V_s. Only the saturation current changes (it halves).',
    wrong2: 'Look at the “I–V curve” chart again: the two brightness curves have different heights, but where do they reach zero?',

    s3k: 'Step 3 · Measure Planck’s constant',
    s3t: 'Measure V_s for a few colours of light. Can you get h out of it?',
    s3e: 'This step asks: since eV_s = hf − φ, can an experiment run the equation backwards and measure Planck’s constant h? Rewrite it as <strong>V_s = (h/e)·f − φ/e</strong>. With frequency f across and the stopping voltage V_s (the reverse voltage at which the current reaches zero) up the side, the data should fall on a straight line whose <strong>slope is h/e</strong>; extended back to f = 0 it reads −φ/e, and it crosses the axis at the threshold frequency f₀. A mercury lamp emits a few lines of precisely known wavelength; a filter lets one through at a time, and you measure V_s once. Click a line to record a point. The readings are <strong>simulated</strong>: the model’s V_s plus a meter-reading error of at most ±0.03 V (fixed pseudo-random numbers, not real data). With two or more points the page fits a line by <strong>least squares</strong>, choosing the line that makes the sum of squared vertical distances from the points smallest.',
    metal3Label: 'Cathode metal:', lineLabel: 'Mercury lines (nm):', all3: 'Measure every line', clear3: 'Clear all data',
    c3: 'Stopping voltage V_s (V) vs frequency f (10¹⁴ Hz)',
    s3lgFit: 'least-squares line (dashed where extrapolated)',
    s3start: 'No data yet: click a spectral line to measure V_s.',
    s3got: '{metal}, {lam} nm (f = {f} × 10¹⁴ Hz): measured V_s = {vs} V (model value {vt} V plus simulated reading error).',
    s3miss: '{metal}, {lam} nm (f = {f} × 10¹⁴ Hz): the photon energy {ev} eV is short of φ, the current stays at 0, so there is no V_s to record.',
    s3fit: '{metal}, fit to {n} points: slope h/e = {slope} V per 10¹⁴ Hz, so h = {h} × 10⁻³⁴ J·s (accepted value 6.626, off by {err}%). Extended to f = 0 the line reads {b} V, so φ = {phi} eV; it crosses the axis at f₀ = {f0} × 10¹⁴ Hz.',
    s3few: '{metal}: {n} point(s) recorded. A line needs at least 2.',
    s3others: 'Lines for the other metals: {list}. The slopes are nearly equal, so h does not depend on the metal; only the intercept φ differs.',
    s3item: '{metal} h = {h} × 10⁻³⁴ J·s',
    s3hint: 'What to try: ① Pick sodium and press “Measure every line” (or click them one by one). 546.1 nm and 577.0 nm give nothing (their photons fall short); the other 5 points line up, and the readout shows the fitted h. ② Switch to caesium and measure again: the new line is almost parallel to sodium’s and sits a little higher (caesium’s φ is smaller). ③ Switch to zinc: only 253.7 nm qualifies, and one point cannot fix a line; zinc needs shorter ultraviolet light. ④ Press “Clear all data” and measure only the two neighbouring lines 404.7 and 435.8 nm: with the same ±0.03 V error, the error in h is far larger (sodium: {errPair}%, against {errAll}% with all 5 lines).',

    s4k: 'Step 4 · Very dim light',
    s4t: 'If light were just a continuous wave, how long would dim light take to free the first electron?',
    s4e: 'This step asks: where do the photon picture and the idea that light is a continuous wave predict different things? A <strong>continuous wave</strong> spreads its energy evenly over the lit surface, so each atom only catches the power landing on its own tiny patch A_atom (about (0.1 nm)² = 10⁻²⁰ m²) and must slowly save up the work function φ (the least energy an electron needs to leave the metal) before an electron can escape. The <strong>intensity</strong> I is light power per square metre (W/m²), and the dimmer the light, the longer the saving: waiting time t = φ / (I × A_atom). In the <strong>photon picture</strong> there is no saving up: when a photon arrives it can free an electron at once. Dim light just means fewer photons, so electrons come out sparsely and the first one appears at a random moment, after 1 ÷ (electrons per second) on average. Experimentally, Lawrence and Beams found in 1928 that electrons start to appear within about 3 × 10⁻⁹ s of the light arriving. Below, λ = 400 nm, the sodium plate’s lit area is 1 cm² and η = 10%. The time axis is logarithmic: each major step is a factor of 1000.',
    i4Label: 'Intensity I (W/m², log slider)', reseed4: 'Draw new random times',
    c4: 'Waiting time (log scale, ×1000 per major step)',
    row1: 'Wave picture: time for one atom to collect φ', row2: 'Photon picture: the first 10 electrons out',
    tk_h: '1 h', tk_yr: '1 yr',
    s4lgWave: 'waiting time in the wave picture', s4lgPh: 'photon picture: each dot is the moment one electron leaves', s4lgMean: 'mean gap 1/(electrons per second)',
    s4readout: 'I = {I} W/m²: the wave picture has to wait {tw} ({tws} s). In the photon picture {rate} electrons leave per second, one every {tp} s on average; in this draw of random times the first appears at {t1} s. The two pictures differ by a factor of about {ratio}.',
    u_yr: 'years', u_d: 'days', u_h: 'hours', u_min: 'minutes', u_s: 'seconds',
    s4hint: 'What to try: ① Drag the intensity down. On the “waiting time” chart the orange bar stretches right; at 10⁻⁶ W/m² the wait is over a year. The cyan dots move right too, but the first one always stays under 1 µs. ② Press “Draw new random times”: the cyan dots scatter afresh. The first one lands somewhere different each time and on the log axis can come several steps before the mean gap (the white tick); later dots settle near “mean gap × their position in line”. That is the randomness of photon arrivals. ③ In both pictures the wait scales as 1/I; what differs is the size: the wave picture is slower by a factor of about {ratio}, and experiment sides with the photons. This is an order-of-magnitude estimate: a larger or smaller A_atom shifts the numbers but cannot close a gap of a dozen orders of magnitude.',

    s5k: 'Step 5 · Wrap-up', s5t: 'Light hands its energy to electrons one packet at a time',
    s5fin: 'The thread, step by step. <strong>Step 0</strong>: sodium has a threshold wavelength λ₀; longer wavelengths free no electrons however bright, shorter ones give a current proportional to brightness. <strong>Step 1</strong>: the reason is that an electron swallows one photon at a time; hf pays the work function φ first and the rest is kinetic energy, K_max = hf − φ. <strong>Step 2</strong>: a reverse voltage turns electrons back, and when the current reaches zero, eV_s = K_max; brightness changes the current, not V_s. <strong>Step 3</strong>: V_s against f for several lines is a straight line whose slope gives h, and different metals give parallel lines. <strong>Step 4</strong>: a continuous wave would make dim light wait a long time, yet electrons appear almost at once: light’s energy arrives in packets.',
    formula: 'E = hf = hc/λ\nK_max = hf − φ\neV_s = K_max\nf₀ = φ / h',
    boundary: 'Scope and model mismatch: work functions are textbook approximations for clean surfaces; real values shift by a few tenths of an eV with surface condition. The quantum efficiency η is fixed at 10% and independent of wavelength; real values are usually lower and vary with wavelength. The saturation current assumes plane electrodes that collect every electron. The straight falling section of the I–V curve comes from assuming kinetic energies spread evenly between 0 and K_max; real curves bend. The contact potential between the electrodes shifts the measured V_s slightly but leaves the slope h/e alone. Step 3’s reading errors are simulated; step 4 is an order-of-magnitude estimate; thermionic emission from heat is ignored. The animation is slowed down for teaching: photon and electron speeds and numbers are not to scale.',
    quiz5: 'A sodium plate under 600 nm light gives no electrons. Make the light 10 times brighter. What happens?',
    quiz5a: 'Electrons come out, just slowly moving ones', quiz5b: 'Still none: each photon carries the same energy as before', quiz5c: 'Wait a bit longer and enough energy builds up for electrons to escape',
    correct5: 'Right. A 600 nm photon carries {ev} eV, less than sodium’s φ = {phi} eV. Ten times brighter just means ten times as many such photons; an electron takes one at a time, so still none escape. The third option is the continuous-wave prediction, and step 4 showed it disagrees with experiment.',
    wrong5: 'Try it in step 0: 600 nm at 100% brightness. What is the photocurrent?',
    linksTitle: 'Where to go next',
    lk1: '→ Blackbody radiation, step 5: why Planck proposed that energy comes in lumps',
    lk2: '→ Double-slit experiment, step 2: one particle at a time, do the fringes still appear?',
    lk3: '→ Interference, step 1: light as a wave, where path difference decides reinforcement or cancellation',
    lk4: '→ Electric fields, step 3: moving a charge along the field takes work, and how voltage becomes energy',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Photoelectric Effect · Light Comes in Packets”.'
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
