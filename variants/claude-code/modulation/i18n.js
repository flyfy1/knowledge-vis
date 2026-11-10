'use strict';
// Modulation lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    formula: 'm(t)·cos(2πf_c t)：谱线搬到 f_c ± f，振幅减半\nAM：[1 + μ·m(t)]·cos(2πf_c t)，μ ≤ 1 才能包络检波\nFM：cos(2πf_c t + 2πΔf∫m dt)，β = Δf / f_m，卡森带宽 ≈ 2(Δf + f_m)',
    pageTitle: '调制 · 让声音搭上高频载波',
    back: '← 知识索引',
    compare: '对照另一版本：调制与频移 · 把信号搬上高频运走 →',
    navLabel: '调制步骤导航',
    tagline: '人声的频率集中在几千赫兹以下：天线要做得极大才发得出去，而且所有电台挤在同一段频率里会搅成一团。办法是把声音「搭」在一个高频正弦（载波）上。本页全部用真实采样（每秒 102 400 个样本、80 ms 窗口）和 FFT 现算：先看乘法怎样把频谱整体搬家，再看怎样搬回来、为什么要对准频率和相位，最后比较 AM 和 FM 两种搭法在噪声里的表现。',
    sep: '、',
    nav0: '0 乘一个载波', nav1: '1 共用一根线', nav2: '2 搬回来', nav3: '3 AM 与包络', nav4: '4 FM', nav5: '5 噪声里的较量', nav6: '6 收束',

    s0k: '第 0 步 · 乘法',
    s0t: '把声音乘上一个高频余弦，频谱会发生什么？',
    s0e: '这一步要回答：把消息信号 m(t) 乘上 cos(2πf_c t)，它的频谱去了哪里？这里的消息 m(t) 是一段「声音」：500 Hz（振幅 0.6）加 1500 Hz（振幅 0.4）两个余弦，最高频率 B = 1.5 kHz 叫消息的<strong>带宽</strong>。被乘的高频余弦叫<strong>载波</strong>，频率 f_c。<strong>频谱</strong>是把信号拆成不同频率的余弦后，每个频率的振幅（<a class="xlink" href="../../../signal/transforms/fourier/#step5">→ 傅里叶页第 5 步：频谱</a>）；下图每根竖线是一个频率成分，由 8192 个样本做 FFT 算出。乘法的效果来自积化和差：cos(2πft)·cos(2πf_c t) = ½cos(2π(f_c − f)t) + ½cos(2π(f_c + f)t)。所以每条谱线都会一分为二，落在 f_c − f 和 f_c + f，振幅各减半。这种只做乘法的调制叫<strong>双边带调制</strong>（DSB），f_c 上下两组谱线叫<strong>边带</strong>。',
    fc0: '载波频率 f_c',
    c0a: '时域 0–2 ms：消息 m（橙）、乘积（青）', c0b: '频谱（横轴 kHz）：消息（橙）与乘积（青）',
    s0lgM: '消息 m(t)', s0lgS: '乘积 m(t)·cos(2πf_c t)', s0lgEnv: '±m(t)：乘积的外轮廓',
    s0readout: 'f_c = {fc}：乘积的谱线在 {lines}；f_c 本身没有谱线，占用 {lo}–{hi}，宽 {w}（= 2B）。',
    s0hint: '观察顺序：只拖 f_c。下图橙色是原消息的两根谱线（0.5、1.5 kHz），青色是乘积的四根：它们以 f_c 为中心，整组左右平移，形状不变，高度都是原来的一半（0.3 和 0.2）。上图青色乘积快速振荡，外轮廓（虚线）就是 ±m(t)：消息的形状被「装」进了载波的振幅里。f_c 只要大于 B，两组边带就不会在 0 Hz 附近相撞。',

    s1k: '第 1 步 · 频分复用',
    s1t: '两个人共用一根线，载波要隔开多远才不串音？',
    s1e: '这一步要回答：声音 A 用载波 20 kHz、声音 B 用载波 f_B，两路相加送进同一根线，接收 A 的人还能干净地取回 A 吗？声音 B 是 800 Hz（0.7）加 1200 Hz（0.3）。接收 A 的做法（下一步细讲）：把线上信号乘以 2·cos(2π·20k·t)，再用<strong>理想低通</strong>只留下 0–1.5 kHz。这样按频率分段共用一根线的办法叫<strong>频分复用</strong>（FDM）。<strong>串扰</strong> = 取回的 A 与真实 A 之差的功率 ÷ A 的功率，用 dB 表示（越负越好；完全没有串扰时为 −∞）。阴影是 A 占用的频段 20 kHz ± 1.5 kHz。',
    fB1: '声音 B 的载波 f_B',
    c1a: '线上频谱（kHz）：A 的边带（橙）、B 的边带（粉）', c1b: '取回的 A（青）与真实 A（虚线），0–4 ms',
    s1lgA: '声音 A 的边带', s1lgB: '声音 B 的边带', s1lgBand: 'A 的频段 20 ± 1.5 kHz', s1lgTrue: '真实的 A', s1lgOut: '接收端取回的 A',
    s1readout: '载波间隔 {d}：串扰 {x}。',
    s1none: '−∞ dB（取回的 A 与原声逐点相同，差值只剩舍入误差）',
    s1some: '{db} dB（误差为 A 的 {pct}%）',
    s1hint: '观察顺序：把 f_B 从 21.5 kHz 慢慢往右拖。粉色的 B 边带起初闯进阴影里的 A 频段，下图青线明显偏离虚线；间隔 2.5 kHz 时，B 最靠里的谱线（f_B − 1.2 kHz = 21.3 kHz）仍落在 A 的频段里，串扰 −13.6 dB；间隔到 3 kHz（= 2B）起，B 完全离开 A 的频段，串扰为 −∞。按每路占 2B 宽来规划，载波隔开 2B 就不会串音。',

    s2k: '第 2 步 · 相干解调',
    s2t: '接收端的本地载波差一点频率或相位，会怎样？',
    s2e: '这一步要回答：用「再乘一次载波、再低通」把声音搬回来时，接收端自己产生的<strong>本地载波</strong>必须和发送端一模一样吗？发送 m(t)·cos(2πf_c t)，f_c = 20 kHz；接收端乘以 2·cos(2π(f_c + Δf)t + φ)，再低通到 3 kHz（比声音的 1.5 kHz 宽一些，给跑偏的声音留余地）。积化和差给出：输出 = m(t)·cos(2πΔf·t + φ)，2f_c 附近的成分被低通滤掉。这种依赖本地载波的方法叫<strong>相干解调</strong>。两笔账：相位差 φ 让输出整体乘 cos φ；频率差 Δf 让输出的幅度按 cos(2πΔf·t) 慢慢起伏，叫<strong>拍</strong>，每 1/Δf 秒循环一次。下图横跨整个 80 ms 窗口。<strong>整体比例</strong> = 输出在 m 上的最小二乘投影（输出与 m 的乘积和 ÷ m 的平方和）。',
    df2: '频率差 Δf', ph2: '相位差 φ',
    c2a: '0–80 ms：解调输出（青）、增益（虚线）',
    s2lgM: '原消息 m(t)', s2lgOut: '解调输出', s2lgGain: '理论增益 cos(2πΔf·t + φ)',
    s2readout: 'Δf = {df} Hz，φ = {ph}°：整体比例 {sc}（Δf = 0 时它应等于 cos φ = {cos}）；输出与 m·cos(2πΔf·t + φ) 之差的均方根 {err}。{beat}',
    s2beat: '拍的周期 1/Δf = {T} ms，其间输出两次降到 0。',
    s2nobeat: '',
    s2hint: '观察顺序：先保持 Δf = 0，只拖 φ：青线整体按 cos φ 缩小，φ = 60° 时正好一半，φ = 90° 时完全消失——本地载波与信号载波正交，乘积平均为零。再把 φ 拖回 0，把 Δf 调到 12.5 Hz：青线的幅度在 80 ms 内由大到零再反相变大，跟着虚线 cos(2πΔf·t) 走；整体比例变成 0，因为正负两半相互抵消。差 12.5 Hz（f_c 的 0.06%）就足以把声音搅成忽大忽小，所以相干接收机要锁定载波的频率和相位。',

    s3k: '第 3 步 · 带载波的 AM',
    s3t: '不想在接收端造本地载波，能不能直接读出包络？',
    s3e: '这一步要回答：发送端多付一点代价，能否让接收端不用本地载波，只看信号的外轮廓就取回声音？办法是先把消息抬高再乘载波：s(t) = [1 + μ·m(t)]·cos(2πf_c t)，这就是常说的 <strong>AM</strong>（调幅）。μ 叫<strong>调制深度</strong>，|m| 最大为 1。只要 1 + μ·m(t) 始终不小于 0，s(t) 的<strong>包络</strong>（振幅的外轮廓）正好是 1 + μ·m(t)；<strong>包络检波器</strong>（这里用理想版本：取解析信号的模，相当于整流后再平滑）读出包络，减 1 再除以 μ 就得到 m。代价是 f_c 处多了一根不带任何消息的载波谱线。<strong>失真</strong> = 检出的 m 与真实 m 之差的均方根 ÷ m 的均方根；<strong>效率</strong> = 边带功率 ÷ 总发送功率（只有边带携带消息）。',
    mu3: '调制深度 μ',
    c3a: '0–2 ms：AM 信号（灰）、包络（青）', c3b: '18–22 kHz 频谱：载波（橙）与边带（绿）',
    s3lgS: 'AM 信号', s3lgIdeal: '1 + μ·m(t)', s3lgEnv: '包络检波器读出的包络', s3lgCar: '载波谱线', s3lgSide: '边带谱线',
    s3readout: 'μ = {mu}：1 + μm 最低到 {min}；检出失真 {dist}%；效率 {eff}%（其余 {rest}% 的功率花在载波上）。',
    s3hint: '观察顺序：从 μ = 0.5 开始，青线（检出的包络）与虚线重合，失真 0%。向右拖到 1：虚线最低点刚好碰到 0，失真仍是 0%；效率升到约 21%，也就是说即便调到最深，近 4/5 的功率仍花在不带消息的载波上。继续拖过 1（<strong>过调制</strong>）：虚线跌到 0 以下，可包络不可能是负数，青线在那里被「折」回正值，失真跳到 6.7%（μ = 1.1）、34%（μ = 1.5）。下图看到载波谱线高度始终是 1，边带随 μ 变高。',

    s4k: '第 4 步 · 调频',
    s4t: '不改振幅、改频率：FM 的频谱有多宽？',
    s4e: '这一步要回答：如果让载波的振幅保持不变，而让它的瞬时频率跟着消息摆动，频谱长什么样、占多宽？用单音消息 cos(2πf_m t) 调频：<strong>瞬时频率</strong>（每一刻载波转得多快）= f_c + Δf·cos(2πf_m t)，f_c = 25 kHz，Δf 叫<strong>频偏</strong>（摆动幅度）。信号是 s(t) = cos(2πf_c t + β·sin(2πf_m t))，<strong>调制指数</strong> β = Δf / f_m。它的频谱不是两根边带，而是 f_c ± k·f_m（k = 1, 2, 3, …）上的一串谱线，高度由第一类贝塞尔函数 |J_k(β)| 给出。经验公式<strong>卡森带宽</strong> 2(Δf + f_m) 估计占用多宽；页面把谱线从 f_c 往两边一对对加，直到装下 98% 的功率，作为实测带宽与之对照。',
    fm4: '消息频率 f_m', dev4: '频偏 Δf',
    c4a: '瞬时频率（kHz）vs 时间，0–4 ms', c4b: '频谱（kHz）：阴影 = 卡森带宽，红框 = 98% 功率带宽',
    s4lgF: '瞬时频率', s4lgLine: '谱线', s4lgCarson: '卡森带宽 2(Δf + f_m)', s4lg98: '装下 98% 功率的带宽',
    s4readout: 'β = {beta}：载波谱线 {c}；{n} 根谱线高于 0.005；98% 功率带宽 {bw}，卡森估计 {carson}；总功率 {p}（与 Δf 无关）。',
    s4hint: '观察顺序：先把 Δf 拖到 0：只剩 f_c 一根谱线，瞬时频率是一条水平线。慢慢加大 Δf：上图曲线上下摆动的幅度就是 Δf，下图谱线从 f_c 向两侧铺开，间隔正好是 f_m。把 f_m 调到 1.25 kHz、Δf 调到 3 kHz（β = 2.4）：中间那根载波谱线几乎消失（0.0025），功率全跑到边带里。总功率始终是 0.5：FM 只是重新分配功率，不改变振幅。β 大于 0.2 时，卡森估计和实测 98% 带宽相差不超过一对谱线（2f_m）；β 不超过 0.2 时载波一根就装下 98% 功率，实测带宽为 0，卡森估计偏宽。',

    s5k: '第 5 步 · 噪声里的较量',
    s5t: '同样的噪声里，AM 和 FM 谁把声音保护得更好？',
    s5e: '这一步要回答：两台发射机都用振幅 1 的载波（f_c = 25.6 kHz），一台发 AM（μ = 1），一台发 FM（Δf = 7.5 kHz，对 1.5 kHz 的最高音 β = 5）；线路上叠加同一份随机噪声（模拟的高斯白噪声，3 组固定随机种子）。<strong>输入信噪比</strong> = 未调制载波的功率 ÷ 0–51.2 kHz 全带噪声功率（dB）。AM 接收端：只留 f_c ± 1.5 kHz，读包络。FM 接收端：只留卡森带宽 f_c ± 9 kHz，从相邻两个样本的相位差算出瞬时频率，再除以 Δf。两边最后都低通到 1.5 kHz。<strong>输出信噪比</strong> = 消息功率 ÷（输出 − 消息）的功率（dB，越大越好）。FM 占用的带宽是 AM 的 6 倍，这一步看它换来了什么。',
    cnr5: '输入信噪比（dB）', sweep5: '从 −6 dB 扫到 20 dB', seed5: '换一组噪声',
    c5a: 'AM 输出（橙）与原消息（虚线），0–4 ms', c5b: 'FM 输出（青）与原消息（虚线），0–4 ms', c5c: '输出信噪比 vs 输入信噪比（dB）',
    s5lgM: '原消息', s5lgAM: 'AM 接收结果', s5lgFM: 'FM 接收结果',
    s5readout: '第 {set}/3 组噪声 · 输入 {cnr} dB：AM 输出 {am} dB，FM 输出 {fm} dB，FM {cmp}。',
    s5ahead: '领先 {d} dB', s5behind: '落后 {d} dB',
    s5hint: '观察顺序：按「扫一遍」，下图两串点从左到右长出来。右半边（输入 ≥ 6 dB）两条线平行，FM 一直比 AM 高 16–19 dB：宽带换来了抗噪。往左看，FM 那串在 4 dB 以下急剧下坠，到 −2 dB 及以下反而不如 AM——这叫 FM 的<strong>门限效应</strong>：噪声大到能把相位转乱一整圈时，鉴频器输出会出现尖刺（上方 FM 波形里可以看到）。按「换一组噪声」重扫，数字略有变化，结论不变。无噪声时 FM 也只有约 51 dB：接收端只留卡森带宽，截掉了少量边带。',

    s6k: '第 6 步 · 收束',
    s6t: '乘一下就搬家，搬回来要对准',
    s6fin: '<strong>第 0 步</strong>：乘以载波 = 每条谱线一分为二搬到 f_c ± f、振幅减半，消息形状装进了振幅。<strong>第 1 步</strong>：每路占 2B 宽，载波隔开 ≥ 2B 才不串扰。<strong>第 2 步</strong>：再乘一次载波再低通就能搬回来，但相位差让声音乘 cos φ，频率差让它按拍起伏。<strong>第 3 步</strong>：带载波的 AM 让接收机只读包络就行，代价是大部分功率花在载波上，μ > 1 时包络折返、失真。<strong>第 4 步</strong>：FM 把消息放进频率，功率不变，频谱铺成一串贝塞尔谱线，宽度约 2(Δf + f_m)。<strong>第 5 步</strong>：FM 用更宽的频带换来更高的输出信噪比，但输入噪声太大时会跌过门限。',
    boundary: '适用范围：本页所有信号都是 fs = 102.4 kHz、8192 个样本的离散序列，所有频率都取 12.5 Hz 的整数倍，因此 FFT 没有频谱泄漏；滤波器都是理想的 FFT 频段掩码，包络检波用解析信号的模，均为理想化部件，真实电路的滤波器有过渡带、检波器有纹波。第 5 步的噪声是模拟的高斯白噪声，只有 3 组种子，数字会随种子小幅波动；「FM 领先 16–19 dB」只覆盖这里的 β = 5、输入 6–20 dB；AM 在 μ = 1 时实际发送功率略大于 FM（0.63 对 0.5），对 AM 有利。调制器（乘以载波）是线性的，但不是时不变的，所以它能造出输入里没有的频率。',
    linksTitle: '接着去哪',
    lk1: '→ 卷积页第 6 步：时域相乘对应频域卷积，搬频谱的另一种说法',
    lk2: '→ 采样页第 4 步：采样也是一次乘法，频谱被复制到 fs 的整数倍',
    lk3: '→ 频率响应页第 5 步：取出一个频段要靠带通滤波器',
    lk4: '→ 傅里叶页第 5 步：频谱从哪里来',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《调制与频移 · 把信号搬上高频运走》的平行版本。'
  },
  en: {
    formula: 'm(t)·cos(2πf_c t): lines move to f_c ± f at half amplitude\nAM: [1 + μ·m(t)]·cos(2πf_c t), envelope detection needs μ ≤ 1\nFM: cos(2πf_c t + 2πΔf∫m dt), β = Δf / f_m, Carson bandwidth ≈ 2(Δf + f_m)',
    pageTitle: 'Modulation · Putting a Voice on a Carrier',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Modulation · Shipping Signals on a Carrier →',
    navLabel: 'Modulation lesson steps',
    tagline: 'A voice lives below a few kilohertz. Radiating it directly would need an enormous antenna, and every station crammed into the same band would turn into one big mess. The fix is to let the voice ride on a high-frequency sine, the carrier. Everything on this page is computed live from real samples (102,400 per second, an 80 ms window) and FFTs: first how multiplication moves a whole spectrum, then how to move it back and why frequency and phase must line up, and finally how AM and FM hold up in noise.',
    sep: ', ',
    nav0: '0 Multiply', nav1: '1 One wire', nav2: '2 Bring it back', nav3: '3 AM & envelope', nav4: '4 FM', nav5: '5 Noise showdown', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Multiplication',
    s0t: 'Multiply a voice by a high-frequency cosine — where does its spectrum go?',
    s0e: 'This step asks: multiply the message m(t) by cos(2πf_c t); where does its spectrum end up? The message here is a little “voice”: cosines at 500 Hz (amplitude 0.6) and 1500 Hz (amplitude 0.4). Its highest frequency, B = 1.5 kHz, is the message <strong>bandwidth</strong>. The high-frequency cosine is the <strong>carrier</strong>, at frequency f_c. A <strong>spectrum</strong> splits a signal into cosines and lists each one’s amplitude (<a class="xlink" href="../../../signal/transforms/fourier/#step5">→ Fourier, step 5: the spectrum</a>); in the bottom chart each stem is one component, computed by an FFT of 8192 samples. What multiplication does comes from the product-to-sum identity: cos(2πft)·cos(2πf_c t) = ½cos(2π(f_c − f)t) + ½cos(2π(f_c + f)t). Every line splits in two, landing at f_c − f and f_c + f with half the amplitude each. Modulation by plain multiplication is <strong>double-sideband</strong> (DSB) modulation, and the two groups of lines either side of f_c are the <strong>sidebands</strong>.',
    fc0: 'Carrier frequency f_c',
    c0a: 'Time 0–2 ms: message (orange), product (cyan)', c0b: 'Spectrum (kHz): message (orange) and product (cyan)',
    s0lgM: 'Message m(t)', s0lgS: 'Product m(t)·cos(2πf_c t)', s0lgEnv: '±m(t): the product’s outline',
    s0readout: 'f_c = {fc}: the product’s lines sit at {lines}; there is no line at f_c itself. It occupies {lo}–{hi}, a width of {w} (= 2B).',
    s0hint: 'What to watch: drag only f_c. In the bottom chart the orange stems are the message’s two lines (0.5 and 1.5 kHz); the cyan ones are the product’s four. They are centred on f_c and slide sideways as a group without changing shape, each half as tall as before (0.3 and 0.2). In the top chart the cyan product oscillates fast, and its outline (dashed) is ±m(t): the message’s shape has been packed into the carrier’s amplitude. As long as f_c exceeds B, the two sidebands never collide around 0 Hz.',

    s1k: 'Step 1 · Frequency-division multiplexing',
    s1t: 'Two voices share one wire — how far apart must the carriers be?',
    s1e: 'This step asks: voice A rides a 20 kHz carrier and voice B a carrier at f_B; the two are added on one wire. Can A’s listener still pull out a clean A? Voice B is 800 Hz (0.7) plus 1200 Hz (0.3). A’s receiver (detailed in the next step) multiplies the wire by 2·cos(2π·20k·t) and keeps only 0–1.5 kHz with an <strong>ideal low-pass</strong>. Sharing a wire by giving each signal its own frequency slot is <strong>frequency-division multiplexing</strong> (FDM). <strong>Crosstalk</strong> = power of (recovered A − true A) ÷ power of A, in dB (more negative is better; −∞ means none at all). The shading marks A’s slot, 20 kHz ± 1.5 kHz.',
    fB1: 'Voice B’s carrier f_B',
    c1a: 'Spectrum on the wire (kHz): A’s sidebands (orange), B’s (pink)', c1b: 'Recovered A (cyan) and true A (dashed), 0–4 ms',
    s1lgA: 'Voice A’s sidebands', s1lgB: 'Voice B’s sidebands', s1lgBand: 'A’s slot, 20 ± 1.5 kHz', s1lgTrue: 'True A', s1lgOut: 'A as recovered',
    s1readout: 'Carrier spacing {d}: crosstalk {x}.',
    s1none: '−∞ dB (recovered A equals the original sample for sample, apart from round-off)',
    s1some: '{db} dB (the error is {pct}% of A)',
    s1hint: 'What to watch: ease f_B right from 21.5 kHz. At first B’s pink sidebands barge into A’s shaded slot and the cyan curve below strays far from the dashed one. At a spacing of 2.5 kHz, B’s innermost line (f_B − 1.2 kHz = 21.3 kHz) still falls inside A’s slot: crosstalk −13.6 dB. From a spacing of 3 kHz (= 2B) B has left A’s slot completely and the crosstalk is −∞. Plan for every voice taking a slot 2B wide, and carriers 2B apart never cross-talk.',

    s2k: 'Step 2 · Coherent demodulation',
    s2t: 'What if the receiver’s carrier is slightly off in frequency or phase?',
    s2e: 'This step asks: to bring the voice back by “multiply by the carrier again, then low-pass”, must the receiver’s own <strong>local carrier</strong> match the transmitter’s exactly? The transmitter sends m(t)·cos(2πf_c t) with f_c = 20 kHz; the receiver multiplies by 2·cos(2π(f_c + Δf)t + φ) and low-passes to 3 kHz (wider than the voice’s 1.5 kHz, leaving room for a shifted voice). The product-to-sum identity gives: output = m(t)·cos(2πΔf·t + φ), the components near 2f_c being removed by the low-pass. Relying on a local carrier like this is <strong>coherent demodulation</strong>. Two effects: a phase error φ scales the whole output by cos φ; a frequency error Δf makes the output’s size rise and fall as cos(2πΔf·t), a <strong>beat</strong> repeating every 1/Δf seconds. The chart spans the full 80 ms window. The <strong>overall scale</strong> is the least-squares projection of the output onto m (sum of output × m ÷ sum of m²).',
    df2: 'Frequency error Δf', ph2: 'Phase error φ',
    c2a: '0–80 ms: output (cyan), gain (dashed)',
    s2lgM: 'Message m(t)', s2lgOut: 'Demodulated output', s2lgGain: 'Predicted gain cos(2πΔf·t + φ)',
    s2readout: 'Δf = {df} Hz, φ = {ph}°: overall scale {sc} (with Δf = 0 it should equal cos φ = {cos}); RMS difference from m·cos(2πΔf·t + φ) is {err}. {beat}',
    s2beat: 'Beat period 1/Δf = {T} ms, during which the output drops to 0 twice.',
    s2nobeat: '',
    s2hint: 'What to watch: keep Δf = 0 and drag only φ. The cyan curve shrinks as a whole by cos φ: exactly half at φ = 60°, gone entirely at φ = 90°, where the local carrier is orthogonal to the received one and their product averages to zero. Return φ to 0 and set Δf to 12.5 Hz: within the 80 ms the cyan curve swells, fades to zero, comes back inverted and swells again, following the dashed cos(2πΔf·t); the overall scale becomes 0 because the positive and negative halves cancel. Being off by 12.5 Hz — 0.06% of f_c — is enough to make the voice pump up and down, which is why a coherent receiver must lock onto the carrier’s frequency and phase.',

    s3k: 'Step 3 · AM with a carrier',
    s3t: 'Can the receiver skip the local carrier and just read the outline?',
    s3e: 'This step asks: if the transmitter pays a little extra, can the receiver recover the voice from the signal’s outline alone, without a local carrier? Lift the message before multiplying: s(t) = [1 + μ·m(t)]·cos(2πf_c t). This is the familiar <strong>AM</strong> (amplitude modulation); μ is the <strong>modulation depth</strong>, and |m| is at most 1. As long as 1 + μ·m(t) never drops below 0, the <strong>envelope</strong> of s(t) — the outline of its amplitude — is exactly 1 + μ·m(t). An <strong>envelope detector</strong> (here an ideal one: the magnitude of the analytic signal, equivalent to rectifying and smoothing) reads the envelope; subtract 1 and divide by μ to get m back. The price is an extra line at f_c, the bare carrier, which carries no message at all. <strong>Distortion</strong> = RMS of (detected m − true m) ÷ RMS of m; <strong>efficiency</strong> = sideband power ÷ total transmitted power (only the sidebands carry the message).',
    mu3: 'Modulation depth μ',
    c3a: '0–2 ms: AM signal (grey), envelope (cyan)', c3b: 'Spectrum 18–22 kHz: carrier (orange), sidebands (green)',
    s3lgS: 'AM signal', s3lgIdeal: '1 + μ·m(t)', s3lgEnv: 'Envelope read by the detector', s3lgCar: 'Carrier line', s3lgSide: 'Sideband lines',
    s3readout: 'μ = {mu}: 1 + μm dips to {min}; detected distortion {dist}%; efficiency {eff}% (the other {rest}% of the power goes into the carrier).',
    s3hint: 'What to watch: start at μ = 0.5 — the cyan detected envelope lies on the dashed line and distortion is 0%. Drag right to 1: the dashed curve’s lowest point just touches 0, and distortion is still 0%; efficiency climbs to about 21%, so even at full depth nearly four-fifths of the power is spent on a carrier that carries no message. Keep going past 1 (<strong>overmodulation</strong>): the dashed curve dips below 0, but an envelope cannot be negative, so the cyan curve is folded back up there, and distortion jumps to 6.7% (μ = 1.1) and 34% (μ = 1.5). In the bottom chart the carrier line stays at height 1 while the sidebands grow with μ.',

    s4k: 'Step 4 · Frequency modulation',
    s4t: 'Keep the amplitude, wiggle the frequency: how wide is FM’s spectrum?',
    s4e: 'This step asks: if the carrier’s amplitude stays fixed and its instantaneous frequency swings with the message instead, what does the spectrum look like and how much room does it take? Modulate with a single tone cos(2πf_m t): the <strong>instantaneous frequency</strong> (how fast the carrier is turning at each moment) is f_c + Δf·cos(2πf_m t), with f_c = 25 kHz; Δf is the <strong>frequency deviation</strong>, the size of the swing. The signal is s(t) = cos(2πf_c t + β·sin(2πf_m t)), with <strong>modulation index</strong> β = Δf / f_m. Its spectrum is not two sidebands but a whole train of lines at f_c ± k·f_m (k = 1, 2, 3, …), whose heights are given by Bessel functions of the first kind, |J_k(β)|. The rule of thumb called <strong>Carson’s bandwidth</strong>, 2(Δf + f_m), estimates how wide it is; the page adds line pairs outward from f_c until 98% of the power is inside, as a measured bandwidth to compare against.',
    fm4: 'Message frequency f_m', dev4: 'Frequency deviation Δf',
    c4a: 'Instantaneous frequency (kHz) vs time, 0–4 ms', c4b: 'Spectrum (kHz): shaded = Carson, red box = 98 % power',
    s4lgF: 'Instantaneous frequency', s4lgLine: 'Spectral lines', s4lgCarson: 'Carson bandwidth 2(Δf + f_m)', s4lg98: 'Bandwidth holding 98% of the power',
    s4readout: 'β = {beta}: carrier line {c}; {n} lines above 0.005; 98% power bandwidth {bw}, Carson estimate {carson}; total power {p} (independent of Δf).',
    s4hint: 'What to watch: drag Δf to 0 first — a single line at f_c remains and the instantaneous frequency is a flat line. Raise Δf slowly: the swing of the top curve is Δf, and in the bottom chart lines spread out either side of f_c, spaced exactly f_m apart. Set f_m = 1.25 kHz and Δf = 3 kHz (β = 2.4): the central carrier line all but vanishes (0.0025) and the power has moved into the sidebands. Total power is always 0.5 — FM only redistributes power and never changes the amplitude. For β above 0.2, Carson’s estimate and the measured 98% bandwidth differ by at most one line pair (2f_m); for β up to 0.2 the carrier line alone holds 98% of the power, the measured bandwidth is 0 and Carson overestimates.',

    s5k: 'Step 5 · Showdown in noise',
    s5t: 'Through the same noise, which protects the voice better — AM or FM?',
    s5e: 'This step asks: two transmitters both use a unit-amplitude carrier (f_c = 25.6 kHz); one sends AM (μ = 1), the other FM (Δf = 7.5 kHz, so β = 5 for the 1.5 kHz top tone). The same random noise is added to both (simulated white Gaussian noise, 3 fixed random seeds). The <strong>input SNR</strong> = power of the unmodulated carrier ÷ noise power over the whole 0–51.2 kHz band, in dB. The AM receiver keeps f_c ± 1.5 kHz and reads the envelope. The FM receiver keeps Carson’s band f_c ± 9 kHz, measures the instantaneous frequency from the phase step between consecutive samples, and divides by Δf. Both finish with a 1.5 kHz low-pass. The <strong>output SNR</strong> = message power ÷ power of (output − message), in dB, higher is better. FM uses six times AM’s bandwidth; this step shows what that buys.',
    cnr5: 'Input SNR (dB)', sweep5: 'Sweep −6 dB → 20 dB', seed5: 'New noise set',
    c5a: 'AM output (orange) and message (dashed), 0–4 ms', c5b: 'FM output (cyan) and message (dashed), 0–4 ms', c5c: 'Output SNR vs input SNR (dB)',
    s5lgM: 'Original message', s5lgAM: 'AM result', s5lgFM: 'FM result',
    s5readout: 'Noise set {set}/3 · input {cnr} dB: AM output {am} dB, FM output {fm} dB, FM {cmp}.',
    s5ahead: 'ahead by {d} dB', s5behind: 'behind by {d} dB',
    s5hint: 'What to watch: press the sweep button and both rows of dots grow from left to right in the bottom chart. On the right (input ≥ 6 dB) the two rows run parallel, FM staying 16–19 dB above AM: the extra bandwidth has bought noise immunity. Look left: below about 4 dB the FM row plunges, and at −2 dB and below it is actually worse than AM — FM’s <strong>threshold effect</strong>. Once the noise is strong enough to spin the phase through a whole turn, the discriminator output fills with spikes (visible in the FM waveform above). Press “New noise set” and sweep again: the numbers shift a little, the conclusion doesn’t. Even without noise FM tops out near 51 dB, because the receiver keeps only Carson’s band and trims a little of the sidebands.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Multiplying moves the spectrum; moving it back takes alignment',
    s6fin: '<strong>Step 0</strong>: multiplying by a carrier splits every line in two and moves it to f_c ± f at half the amplitude, packing the message’s shape into the amplitude. <strong>Step 1</strong>: each voice needs a slot 2B wide, so carriers at least 2B apart avoid crosstalk. <strong>Step 2</strong>: multiplying by the carrier again and low-passing brings the voice back, but a phase error scales it by cos φ and a frequency error makes it beat. <strong>Step 3</strong>: AM with a carrier lets the receiver just read the envelope, at the cost of spending most of the power on the carrier; with μ > 1 the envelope folds and distorts. <strong>Step 4</strong>: FM puts the message in the frequency, keeps the power fixed, and spreads into a train of Bessel lines about 2(Δf + f_m) wide. <strong>Step 5</strong>: FM trades bandwidth for a better output SNR, but falls off a threshold when the input noise is too strong.',
    boundary: 'Scope: every signal here is a discrete sequence of 8192 samples at fs = 102.4 kHz, and every frequency is a whole multiple of 12.5 Hz, so the FFT shows no leakage. Filters are ideal FFT band masks and the envelope detector is the magnitude of the analytic signal — idealised parts; real filters have transition bands and real detectors ripple. The noise in step 5 is simulated white Gaussian noise with just 3 seeds, so the numbers move slightly from seed to seed; “FM ahead by 16–19 dB” covers only β = 5 and inputs of 6–20 dB here, and AM at μ = 1 actually transmits a little more power than FM (0.63 vs 0.5), which favours AM. A modulator (multiply by a carrier) is linear but not time-invariant — that is how it can create frequencies that weren’t in its input.',
    linksTitle: 'Where to go next',
    lk1: '→ Convolution, step 6: multiplying in time is convolving in frequency — another view of moving a spectrum',
    lk2: '→ Sampling, step 4: sampling is a multiplication too, copying the spectrum to every multiple of fs',
    lk3: '→ Frequency response, step 5: picking out one band takes a band-pass filter',
    lk4: '→ Fourier, step 5: where a spectrum comes from',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Modulation · Shipping Signals on a Carrier”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = STRINGS[lang] && STRINGS[lang][key] !== undefined ? STRINGS[lang][key] : (STRINGS.en[key] !== undefined ? STRINGS.en[key] : key);
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
  if (typeof window.refreshMOD === 'function') window.refreshMOD();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MOD_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
