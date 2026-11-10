'use strict';
// Network flow lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '网络传输 · 不丢、不堵地送达一封消息',
    back: '← 知识索引',
    compare: '对照另一版本：网络流 · 一封消息的旅程 →',
    navLabel: '网络传输步骤导航',
    tagline: '你要把一个文件从一台电脑送到另一台。中间的网络只肯一小块一小块地搬，会丢东西，还和成千上万别人共用。这一页沿着一次传输往下走：怎么切块、要等多久、怎样确认没丢，最后是发送方怎样在看不见别人的情况下，自己摸索出「发多快才不堵」。',
    nav0: '0 分包', nav1: '1 等待与带宽', nav2: '2 握手与确认', nav3: '3 窗口', nav4: '4 排队', nav5: '5 增与减', nav6: '6 公平', nav7: '7 收束',

    s0k: '第 0 步 · 切成包',
    s0t: '一个文件要切成多少个包，多付多少字节？',
    s0e: '这一步要回答：网络不肯一次搬整个文件，那么一个文件要拆成几块、为拆块多付多少字节？网络搬运的单位叫<strong>包</strong>（packet）：每个包前面有一段<strong>头部</strong>，写着收发地址、序号等信息，本页按最常见的情况固定为 40 字节（IPv4 20 字节 + TCP 20 字节）。一条链路一次能送的最大包长叫 <strong>MTU</strong>（最大传输单元，含头部），以太网通常是 1500 字节。所以每个包最多装 MTU − 40 字节的数据，包数 = ⌈文件字节数 ÷ (MTU − 40)⌉（⌈ ⌉ 表示向上取整：最后一个包装不满也算一个）。',
    sizeSlider: '文件大小', mtuSlider: 'MTU（每个包的最大长度，含头部）',
    s0lgHead: '头部（40 字节）', s0lgData: '数据', s0lgCurve: '头部占比随 MTU 的变化（当前文件）',
    c0top: '前几个包（宽度按字节数画）', c0bot: '头部占线上总字节的比例（横轴 MTU，对数刻度）',
    s0more: '…… 共 {n} 个',
    s0readout: '{kb} KB = {bytes} 字节；每包最多装 {mtu} − 40 = {payload} 字节数据 → 切成 {n} 个包（最后一个装 {last} 字节）。头部共 {n} × 40 = {header} 字节，占线上总字节的 {pct}%。',
    s0hint: '观察顺序：先固定文件大小，把 MTU 从 576 拖到 9000，看上图每个包变长、包数变少，下图橙点沿曲线下降；再固定 MTU 改文件大小，看包数翻倍而头部占比几乎不变（只有包很少时，最后一个装不满才会让占比跳一下）。',

    s1k: '第 1 步 · 等待与带宽',
    s1t: '下载一个文件要多久？把带宽加倍一定有用吗？',
    s1e: '这一步要回答：从发出请求到收完文件要多少时间，它由什么决定？两个量要分开看。<strong>往返时延 RTT</strong>：一个很小的包从这边到那边再回来所需的时间，主要由距离和沿途设备决定，单位毫秒（ms）。<strong>带宽</strong>：链路每秒能推出去多少比特，单位 Mbit/s。请求发出后，要等半个 RTT 才到对方，回来的第一个字节又要半个 RTT，之后数据按带宽一个接一个推过来。本页的模型是：<strong>总时间 T = RTT + 文件大小 ÷ 带宽</strong>（忽略握手和拥塞控制，它们放在后面几步）。',
    filePage: '网页 50 KB', filePhoto: '照片 5 MB', fileVideo: '视频 500 MB',
    rttSlider: '往返时延 RTT', bwSlider: '带宽',
    s1lgRtt: '等待（RTT）', s1lgTx: '推送数据（大小 ÷ 带宽）', s1lgCurve: '当前文件与 RTT 下 T 随带宽的变化', s1lgFloor: '虚线：T 的下限 = RTT',
    c1top: '总时间 T 的组成', c1bot: '总时间 T（纵轴对数刻度）随带宽（横轴对数刻度）',
    s1readout: 'T = RTT + 大小 ÷ 带宽 = {rtt} + {tx} = {total}；其中等待占 {pct}%。带宽翻倍只省 {save}；RTT 减半能省 {halfRtt}。',
    s1hint: '观察顺序：选「网页 50 KB」，把带宽从 1 拖到 1000 Mbit/s，看下图曲线很快贴上虚线（RTT 下限），再加带宽几乎不省时间；换成「视频 500 MB」重复，看这次曲线一路下降、RTT 那一段在上图里几乎看不见。图上保留你拖过的点。',

    s2k: '第 2 步 · 握手与确认',
    s2t: '网络会丢包，发送方怎样知道对方真的收到了？',
    s2e: '这一步要回答：网络可能丢包，发送方怎样确认每个字节都到了？TCP 给字节编号：<strong>序号 seq</strong> 是这一段数据第一个字节的编号；接收方回一个<strong>确认 ACK</strong>，里面的<strong>确认号 ack</strong> 是「下一个我想要的字节编号」，也就是已经连续收到的最后一个字节加 1。编号要从双方各自挑的一个起点开始，所以正式传数据前先<strong>三次握手</strong>：客户端发 SYN 报出自己的起点 x，服务器回 SYN-ACK 报出自己的起点 y 并确认 x + 1（SYN 本身占一个编号），客户端再确认 y + 1，可以顺带发出第一段数据。发出一段后若在<strong>超时时间 RTO</strong> 内没等到确认，就认定它丢了并重发。本步为了看清每条消息，每次只发一段、收到确认再发下一段，RTO 固定为 2 个 RTT；单程时间是半个 RTT。',
    next2: '送出下一条', play2: '全部播放', lose2: '让第 2 段数据丢失', reset2: '重来',
    client: '客户端', server: '服务器',
    st_closed: 'CLOSED（未连接）', st_listen: 'LISTEN（等待连接）', st_synsent: 'SYN-SENT（已发起，等回应）', st_synrcvd: 'SYN-RCVD（已回应，等确认）', st_estab: 'ESTABLISHED（已建立）',
    m_syn: 'SYN seq={seq}', m_synack: 'SYN-ACK seq={seq} ack={ack}', m_ackdata: 'ACK ack={ack} + 数据1 seq={seq}', m_ack: 'ACK ack={ack}', m_data: '数据{k} seq={seq}', m_retx: '数据{k} 重发 seq={seq}', m_lost: '（丢失）',
    s2lgMsg: '已送出的消息（箭头朝向接收方）', s2lgLost: '丢失的包', s2lgTimer: '重发计时器（RTO）',
    c2: '时间往下走：每条斜线是一条消息',
    s2progress: '已送出 {k}/{N} 条。',
    s2state: '客户端：{c}；服务器：{s}。',
    d_syn: '客户端报出起点 seq = {seq}。', d_synack: '服务器报出自己的起点 seq = {seq}，并确认 ack = {ack}（SYN 占了 1 个编号）。', d_ackdata: '客户端确认 ack = {ack}，同时送出第 1 段：字节 {seq}–{end}。', d_ack: '服务器确认 ack = {ack}：{prev} 之前的字节全部收到。', d_data: '客户端送出第 {k} 段：字节 {seq}–{end}。', d_lost: '第 {k} 段在路上丢了，服务器什么也没收到，也就不会回确认。', d_retx: '计时器到 RTO 仍没有确认，客户端重发第 {k} 段：字节 {seq}–{end}。',
    s2done: '3 段共 3000 字节在 {end} RTT 时全部确认；第一个数据字节在 {first} RTT 时才出发，前面这段花在握手上。',
    s2doneLoss: '3 段共 3000 字节在 {end} RTT 时全部确认，比不丢包多 {extra} RTT：第 2 段丢失后，客户端要等满 RTO = 2 RTT 才确定它丢了。',
    s2hint: '观察顺序：先不勾「丢失」，按「送出下一条」一条条看，留意数据段之后的 ack 总是那一段的 seq + 1000；看完握手后的状态变化。再打开「让第 2 段数据丢失」，看斜线在中途断掉、客户端那侧的计时器走满 2 RTT 后才重发，整条时间线往下推。',

    s3k: '第 3 步 · 窗口',
    s3t: '每次都等确认再发下一个包，链路能用上多少？',
    s3e: '这一步要回答：上一步每次只有一段在路上，链路大部分时间在空等；同时能有多少个包「在路上」才能把链路用满？允许已发出但还没被确认的包的最大个数叫<strong>窗口 W</strong>（单位：包，本页每包 1500 字节）。一个 RTT 内最多发 W 个包，所以吞吐 = min(链路速率 C，W × 1500 字节 ÷ RTT)。链路速率 C 和 RTT 的乘积叫<strong>带宽时延积 BDP</strong>，换算成包数，就是「刚好填满这条路」需要的包数：W ≥ BDP 时链路不再空闲。下图里的 RTT 指从开始发一个包到收到它的确认的时间。',
    wSlider: '窗口 W（包）', rtt3Slider: '往返时延 RTT', cSlider: '链路速率 C',
    s3lgBusy: '发送方在往链路上推包', s3lgIdle: '空等确认', s3lgCurve: '吞吐随窗口的变化', s3lgBdp: '虚线：W = BDP',
    c3top: '发送方的时间线（前 3 个 RTT，竖虚线每格一个 RTT）', c3bot: '吞吐（Mbit/s）随窗口 W（包）',
    s3readout: '推一个包要 {tau}；BDP = C × RTT = {bdp} 个包。W = {W}：每个 RTT 最多发 {W} 个包，吞吐 = {rate} Mbit/s，链路利用率 {pct}%。',
    s3full: '窗口已不小于 BDP，链路被填满，再加大窗口也不会更快。',
    s3hint: '观察顺序：保持 C 和 RTT 不变，把 W 从 1 往上拖，看上图青色块越来越密、空隙消失的那一刻正好是下图曲线拐平的地方（W = BDP）。再把 RTT 拉长，看同一个 W 的吞吐下降、拐点右移：路越长，需要在路上的包越多。',

    s4k: '第 4 步 · 排队',
    s4t: '窗口开得比 BDP 还大，多出来的包去哪了？',
    s4e: '这一步要回答：窗口超过 BDP 以后会发生什么？路径上最慢的那一段叫<strong>瓶颈</strong>，它前面的路由器有一个<strong>缓冲区</strong>，最多存 B 个包。路上最多容纳 BDP 个包，多出来的先在缓冲区<strong>排队</strong>，每个排队的包都让 RTT 变长（等前面的包推完）；缓冲区满了，再来的包就被<strong>丢弃</strong>。本步固定 C = 10 Mbit/s、空载 RTT = 60 ms（BDP = 50 个包），窗口固定不变，看稳定后的状态。',
    w4Slider: '窗口 W（包）', bSlider: '缓冲区 B（包）',
    s4lgPipe: '在路上（最多 BDP 个）', s4lgQueue: '在缓冲区排队（最多 B 个）', s4lgDrop: '每个 RTT 被丢弃', s4lgNow: '当前窗口',
    c4top: '窗口里的 W 个包分在哪儿', c4a: '吞吐（Mbit/s）', c4b: 'RTT（ms）', c4c: '丢包率（%）',
    s4readout: 'W = {W}：在路上 {pipe} 个，排队 {queue} 个，每个 RTT 丢 {drop} 个。吞吐 {rate} Mbit/s，RTT {rtt} ms，丢包率 {loss}%。',
    s4hint: '观察顺序：把 W 从 1 拖到 200。W < 50 时吞吐随 W 上升、RTT 不变；过了 50，吞吐封顶，RTT 开始变长（只是排队，没换来任何速度）；再过 50 + B，丢包率从 0 开始上升。改 B，看「只排队」那一段变长或变短。',

    s5k: '第 5 步 · 加性增、乘性减',
    s5t: '发送方不知道 BDP，怎样自己找到合适的窗口？',
    s5e: '这一步要回答：发送方看不见瓶颈，也不知道 BDP 和 B，它怎样调窗口？TCP 只能从结果里猜：丢包说明「太多了」。它把自己允许的窗口叫<strong>拥塞窗口 cwnd</strong>，按这几条规则每个 RTT 调一次（模仿 TCP Reno）：<strong>慢启动</strong>：从 1 开始，每个 RTT 翻倍，直到门限 ssthresh（这里初始为 64）；之后<strong>加性增</strong>：每个 RTT 加 1；一旦丢包就<strong>乘性减</strong>：cwnd 减半，ssthresh 也记成这个减半后的值。这三条合称 <strong>AIMD</strong>。本步的丢包规则沿用上一步：cwnd 超过 BDP + B 就丢。',
    b5Slider: '缓冲区 B（包）', play5: '播放 160 个 RTT', reset5: '重来',
    s5lgCwnd: '拥塞窗口 cwnd', s5lgLoss: '丢包', s5lgBdp: '虚线：BDP（填满链路）', s5lgCap: '虚线：BDP + B（再多就丢）', s5lgQueue: '缓冲区里排队的包',
    c5top: '拥塞窗口 cwnd（包）随轮次（每轮 1 个 RTT）', c5bot: '瓶颈缓冲区里排队的包数',
    ph_slow: '慢启动', ph_avoid: '加性增',
    s5progress: '第 {k}/{N} 轮：{phase}，cwnd = {cwnd}，已丢包 {losses} 次。',
    s5stats: '第 {from}–{to} 轮（跳过开头的慢启动）：链路利用率 {util}%（按时间加权），平均 RTT 是空载的 {rtt} 倍，丢包 {losses} 次。',
    s5hint: '观察顺序：先把 B 设成 0 播放，看 cwnd 在 25 和 51 之间锯齿形来回，锯齿下半段低于 BDP 虚线，链路有空闲；再把 B 设成 50 或更大重放，看锯齿整体高过 BDP（利用率到 100%），代价是下图一直有包在排队、RTT 变长。',

    s6k: '第 6 步 · 两条流',
    s6t: '后来的连接，能分到一半吗？',
    s6e: '这一步要回答：两条连接共用同一个瓶颈，一条已经跑得很快，另一条刚开始，各自只按 AIMD 调窗口，最后会平分吗？把两条流的窗口画成平面上的一个点（横轴流 1，纵轴流 2）。斜线 x₁ + x₂ = 100 是「刚好不丢包」的总量；对角线 x₁ = x₂ 是「平分」。加性增让两者各加 1：点沿 45° 往右上走，两者差距不变。乘性减让两者各减半：点朝原点方向缩，差距也减半。所以每次丢包差距减半，点一步步靠向对角线。对照：如果丢包时各减去固定的 8（<strong>加性减 AIAD</strong>），差距永远不变。本步假设两条流 RTT 相同、同一轮一起发现丢包。',
    modeAimd: '丢包时减半（AIMD）', modeAiad: '丢包时减 8（AIAD）', play6: '播放 200 轮', reset6: '重来',
    s6lgTraj: '两条流窗口的轨迹', s6lgFair: '对角线：平分', s6lgEff: '斜线：总和 = 100', s6lgF1: '流 1', s6lgF2: '流 2',
    c6top: '流 2 的窗口（纵）对流 1 的窗口（横）', c6bot: '两条流的窗口随轮次',
    s6readout: '第 {k}/{N} 轮：流 1 = {x1}，流 2 = {x2}，差距 {gap}；已一起丢包 {losses} 次。',
    s6gaps: '每次丢包后的差距：{list}',
    s6hint: '观察顺序：先选「减半（AIMD）」播放，看上图折线一来一回靠近对角线，下图两条线合拢；再选「减 8（AIAD）」重放，看折线在一条和对角线平行的线上来回，差距一直是 56。',

    s7k: '第 7 步 · 收束',
    s7t: '从切包到让路',
    s7fin: '一次传输被拆成了几个各管一件事的问题。<strong>分包</strong>：每包装 MTU − 40 字节，包越大头部占比越小。<strong>时间</strong>：T = RTT + 大小 ÷ 带宽，小文件受 RTT 支配，加带宽几乎没用。<strong>可靠</strong>：序号、确认和超时重发，握手先对好双方的起始编号，代价是开头 1 个 RTT。<strong>速度</strong>：窗口至少要有 BDP 个包，链路才不空闲；再多就只排队，排满就丢。<strong>让路</strong>：AIMD 只靠丢包信号摸索窗口，每次丢包差距减半，几条流最终趋于平分。',
    formula: '包数 = ⌈字节数 ÷ (MTU − 40)⌉\nT = RTT + 大小 ÷ 带宽\n吞吐 = min(C, W ÷ RTT)，BDP = C × RTT\nAIMD：每 RTT +1，丢包 ÷2',
    boundary: '适用范围：这些都是教学模型。头部固定 40 字节，不计选项、TLS 和链路层帧头；RTT 不随距离以外的因素变化；握手一步只演示停等，真实 TCP 同时有多段在路上、确认是累积的，还有快速重传；拥塞控制按每个 RTT 一轮计算，丢包规则固定为「超过 BDP + B 就丢」，两条流的丢包同时发生且 RTT 相同。现代系统还有 CUBIC、BBR 等别的算法，结论只覆盖这里演示的 Reno 式 AIMD。',
    linksTitle: '接着看',
    lk1: '→ 最短路页第 1 步：路由器怎样不试遍所有路线就选出下一跳',
    lk2: '→ 泊松过程页第 4 步：很多条随机到达流叠在一起，正是路由器缓冲区面对的输入',
    lk3: '→ 图算法（Claude 版）第 2 步：一层层往外扩，求出的就是「最少经过几跳」',
    lk4: '→ RSA 页第 3 步：包在路上谁都能看，内容要靠加密保护',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《网络流 · 一封消息的旅程》的平行版本。'
  },
  en: {
    pageTitle: 'Network Transfer · Delivering a Message Without Loss or Jams',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Network Flow · A Message’s Journey →',
    navLabel: 'Network transfer steps',
    tagline: 'You want to send a file from one computer to another. The network in between only carries small pieces, sometimes loses them, and is shared with thousands of other people. This page follows one transfer from start to finish: how to cut it up, how long to wait, how to confirm nothing went missing, and finally how a sender that cannot see anyone else works out for itself how fast it can go without jamming the road.',
    nav0: '0 Packets', nav1: '1 Latency', nav2: '2 Handshake', nav3: '3 Window', nav4: '4 Queues', nav5: '5 AIMD', nav6: '6 Fairness', nav7: '7 Wrap-up',

    s0k: 'Step 0 · Cutting into packets',
    s0t: 'How many packets does a file become, and how many extra bytes does that cost?',
    s0e: 'This step asks: the network will not carry a whole file at once, so how many pieces does a file become, and how many bytes does the cutting cost? The unit the network carries is a <strong>packet</strong>. Every packet starts with a <strong>header</strong> holding addresses, sequence numbers and so on; this page fixes it at the common 40 bytes (20 for IPv4 + 20 for TCP). The largest packet a link will carry is its <strong>MTU</strong> (maximum transmission unit, header included); Ethernet usually allows 1500 bytes. So each packet carries at most MTU − 40 bytes of data, and the packet count is ⌈file bytes ÷ (MTU − 40)⌉, where ⌈ ⌉ means round up: a part-filled last packet still counts as one.',
    sizeSlider: 'File size', mtuSlider: 'MTU (largest packet, header included)',
    s0lgHead: 'header (40 bytes)', s0lgData: 'data', s0lgCurve: 'header share as MTU changes (current file)',
    c0top: 'The first few packets (width drawn to scale in bytes)', c0bot: 'Header share of all bytes sent (across: MTU, log scale)',
    s0more: '… {n} in all',
    s0readout: '{kb} KB = {bytes} bytes; each packet carries at most {mtu} − 40 = {payload} data bytes → {n} packets (the last holds {last} bytes). Headers total {n} × 40 = {header} bytes, {pct}% of all bytes sent.',
    s0hint: 'What to watch: keep the file size fixed and drag MTU from 576 to 9000: the packets above get longer and fewer, and the orange dot slides down the curve below. Then fix MTU and change the file size: the packet count doubles while the header share barely moves (it only jumps when there are so few packets that the part-filled last one matters).',

    s1k: 'Step 1 · Latency and bandwidth',
    s1t: 'How long does a download take? Does doubling the bandwidth always help?',
    s1e: 'This step asks: how long from sending a request to holding the whole file, and what sets that time? Two quantities must be kept apart. <strong>Round-trip time (RTT)</strong>: how long a tiny packet takes to go there and back, set mostly by distance and the equipment on the way, measured in milliseconds (ms). <strong>Bandwidth</strong>: how many bits per second the link can push, measured in Mbit/s. After the request leaves, it takes half an RTT to arrive and another half for the first byte to come back; after that the data streams in at the bandwidth. The model on this page: <strong>total time T = RTT + file size ÷ bandwidth</strong> (ignoring the handshake and congestion control, which come in later steps).',
    filePage: 'Web page 50 KB', filePhoto: 'Photo 5 MB', fileVideo: 'Video 500 MB',
    rttSlider: 'Round-trip time RTT', bwSlider: 'Bandwidth',
    s1lgRtt: 'waiting (RTT)', s1lgTx: 'streaming data (size ÷ bandwidth)', s1lgCurve: 'T against bandwidth for the current file and RTT', s1lgFloor: 'dashed: the floor of T = RTT',
    c1top: 'What the total time T is made of', c1bot: 'Total time T (log scale) against bandwidth (log scale)',
    s1readout: 'T = RTT + size ÷ bandwidth = {rtt} + {tx} = {total}; waiting is {pct}% of it. Doubling the bandwidth saves only {save}; halving the RTT would save {halfRtt}.',
    s1hint: 'What to watch: pick “Web page 50 KB” and drag the bandwidth from 1 to 1000 Mbit/s: the curve below soon hugs the dashed RTT floor, and more bandwidth saves almost nothing. Repeat with “Video 500 MB”: now the curve keeps falling and the RTT part of the bar above is barely visible. Points you drag through stay on the chart.',

    s2k: 'Step 2 · Handshake and acknowledgements',
    s2t: 'Packets get lost. How does the sender know they arrived?',
    s2e: 'This step asks: the network may drop packets, so how does the sender confirm that every byte got through? TCP numbers the bytes. The <strong>sequence number seq</strong> is the number of the first byte in a segment; the receiver replies with an <strong>acknowledgement (ACK)</strong> whose <strong>ack number</strong> is “the next byte I want”, one past the last byte received in order. Numbering starts from a point each side picks for itself, so before any data there is a <strong>three-way handshake</strong>: the client sends SYN with its starting number x, the server replies SYN-ACK with its own starting number y and acknowledges x + 1 (the SYN itself uses one number), and the client acknowledges y + 1, possibly sending the first data alongside. If a segment is not acknowledged within the <strong>retransmission timeout (RTO)</strong>, the sender assumes it was lost and sends it again. To make every message visible, this step sends one segment at a time and waits for its ACK before the next; RTO is fixed at 2 RTTs, and a one-way trip takes half an RTT.',
    next2: 'Send next message', play2: 'Play all', lose2: 'Lose data segment 2', reset2: 'Start over',
    client: 'Client', server: 'Server',
    st_closed: 'CLOSED (no connection)', st_listen: 'LISTEN (waiting for one)', st_synsent: 'SYN-SENT (asked, awaiting reply)', st_synrcvd: 'SYN-RCVD (replied, awaiting confirmation)', st_estab: 'ESTABLISHED (connected)',
    m_syn: 'SYN seq={seq}', m_synack: 'SYN-ACK seq={seq} ack={ack}', m_ackdata: 'ACK ack={ack} + data 1 seq={seq}', m_ack: 'ACK ack={ack}', m_data: 'data {k} seq={seq}', m_retx: 'data {k} resent seq={seq}', m_lost: '(lost)',
    s2lgMsg: 'message sent (arrow points at the receiver)', s2lgLost: 'lost packet', s2lgTimer: 'retransmission timer (RTO)',
    c2: 'Time runs downward: each slanted line is one message',
    s2progress: '{k}/{N} messages sent. ',
    s2state: 'Client: {c}; server: {s}.',
    d_syn: 'The client announces its starting number seq = {seq}.', d_synack: 'The server announces its own starting number seq = {seq} and acknowledges ack = {ack} (the SYN used up one number).', d_ackdata: 'The client acknowledges ack = {ack} and sends segment 1: bytes {seq}–{end}.', d_ack: 'The server acknowledges ack = {ack}: every byte before {prev} has arrived.', d_data: 'The client sends segment {k}: bytes {seq}–{end}.', d_lost: 'Segment {k} is lost on the way; the server receives nothing, so it sends no ACK.', d_retx: 'The timer reaches RTO with no ACK, so the client resends segment {k}: bytes {seq}–{end}.',
    s2done: 'All 3 segments (3000 bytes) are acknowledged at {end} RTT; the first data byte did not leave until {first} RTT, the time spent on the handshake.',
    s2doneLoss: 'All 3 segments (3000 bytes) are acknowledged at {end} RTT, {extra} RTT later than without loss: after segment 2 vanished, the client had to wait out the full RTO = 2 RTT before concluding it was lost.',
    s2hint: 'What to watch: leave “Lose” off and press “Send next message” one at a time; notice that the ack after each data segment is that segment’s seq + 1000, and watch the states change after the handshake. Then switch on “Lose data segment 2”: the line breaks off halfway, the timer on the client side runs a full 2 RTT before the resend, and the whole timeline is pushed down.',

    s3k: 'Step 3 · The window',
    s3t: 'If every packet waits for an ACK, how much of the link gets used?',
    s3e: 'This step asks: in the previous step only one segment was ever on the way, so the link sat idle most of the time. How many packets must be “in flight” at once to keep the link busy? The most packets allowed out but not yet acknowledged is the <strong>window W</strong> (in packets; 1500 bytes each on this page). At most W packets go out per RTT, so throughput = min(link rate C, W × 1500 bytes ÷ RTT). The link rate C times the RTT is the <strong>bandwidth-delay product (BDP)</strong>; counted in packets, it is how many packets it takes to fill the path. Once W ≥ BDP the link never idles. Here RTT means the time from starting to send a packet until its ACK arrives.',
    wSlider: 'Window W (packets)', rtt3Slider: 'Round-trip time RTT', cSlider: 'Link rate C',
    s3lgBusy: 'sender pushing a packet onto the link', s3lgIdle: 'idle, waiting for ACKs', s3lgCurve: 'throughput against window', s3lgBdp: 'dashed: W = BDP',
    c3top: 'Sender timeline (first 3 RTTs; dashed lines one RTT apart)', c3bot: 'Throughput (Mbit/s) against window W (packets)',
    s3readout: 'Pushing one packet takes {tau}; BDP = C × RTT = {bdp} packets. W = {W}: at most {W} packets per RTT, throughput = {rate} Mbit/s, link use {pct}%.',
    s3full: 'The window is at least the BDP, so the link is full; a bigger window would not be faster.',
    s3hint: 'What to watch: hold C and RTT and drag W up from 1: the cyan blocks above get denser, and the moment the gaps vanish is exactly where the curve below flattens (W = BDP). Then lengthen the RTT: the same W gives less throughput and the knee moves right. A longer path needs more packets in flight.',

    s4k: 'Step 4 · Queues',
    s4t: 'If the window is bigger than the BDP, where do the extra packets go?',
    s4e: 'This step asks: what happens once the window exceeds the BDP? The slowest stretch of the path is the <strong>bottleneck</strong>; the router in front of it has a <strong>buffer</strong> that holds at most B packets. The path itself holds at most BDP packets; extra ones <strong>queue</strong> in the buffer first, and each queued packet makes the RTT longer (it must wait for the ones ahead). Once the buffer is full, newcomers are <strong>dropped</strong>. This step fixes C = 10 Mbit/s and an empty-path RTT of 60 ms (BDP = 50 packets), keeps the window fixed, and shows the settled state.',
    w4Slider: 'Window W (packets)', bSlider: 'Buffer B (packets)',
    s4lgPipe: 'in flight (at most BDP)', s4lgQueue: 'queued in the buffer (at most B)', s4lgDrop: 'dropped each RTT', s4lgNow: 'current window',
    c4top: 'Where the W packets of the window are', c4a: 'Throughput (Mbit/s)', c4b: 'RTT (ms)', c4c: 'Loss rate (%)',
    s4readout: 'W = {W}: {pipe} in flight, {queue} queued, {drop} dropped per RTT. Throughput {rate} Mbit/s, RTT {rtt} ms, loss rate {loss}%.',
    s4hint: 'What to watch: drag W from 1 to 200. Below 50, throughput rises with W and the RTT stays put; past 50, throughput is capped and the RTT starts to grow (pure queueing, no extra speed); past 50 + B, the loss rate climbs from 0. Change B and watch the “queue only” stretch grow or shrink.',

    s5k: 'Step 5 · Additive increase, multiplicative decrease',
    s5t: 'The sender does not know the BDP. How does it find a good window by itself?',
    s5e: 'This step asks: the sender cannot see the bottleneck and knows neither the BDP nor B, so how does it set its window? TCP can only infer from outcomes: a loss means “too much”. It calls its own allowed window the <strong>congestion window cwnd</strong> and adjusts it once per RTT by these rules (in the style of TCP Reno). <strong>Slow start</strong>: begin at 1 and double every RTT up to a threshold ssthresh (64 here at first). Then <strong>additive increase</strong>: add 1 per RTT. On any loss, <strong>multiplicative decrease</strong>: halve cwnd and set ssthresh to that halved value. Together these are <strong>AIMD</strong>. Losses follow the previous step’s rule: a cwnd above BDP + B loses packets.',
    b5Slider: 'Buffer B (packets)', play5: 'Play 160 RTTs', reset5: 'Start over',
    s5lgCwnd: 'congestion window cwnd', s5lgLoss: 'loss', s5lgBdp: 'dashed: BDP (link full)', s5lgCap: 'dashed: BDP + B (beyond this, loss)', s5lgQueue: 'packets queued in the buffer',
    c5top: 'Congestion window cwnd (packets) by round (one RTT each)', c5bot: 'Packets queued at the bottleneck buffer',
    ph_slow: 'slow start', ph_avoid: 'additive increase',
    s5progress: 'Round {k}/{N}: {phase}, cwnd = {cwnd}, {losses} losses so far.',
    s5stats: 'Rounds {from}–{to} (skipping the slow start): link use {util}% (time-weighted), mean RTT {rtt} times the empty-path RTT, {losses} losses.',
    s5hint: 'What to watch: set B to 0 and play: cwnd saws back and forth between 25 and 51, the lower half of each tooth sits below the BDP line, and the link idles. Then set B to 50 or more and replay: the whole sawtooth stays above the BDP line (100% use), paid for by a permanent queue in the lower chart and a longer RTT.',

    s6k: 'Step 6 · Two flows',
    s6t: 'Does a connection that starts later get half?',
    s6e: 'This step asks: two connections share one bottleneck, one already fast and one just starting; if each adjusts its own window by AIMD alone, do they end up splitting it evenly? Plot the two windows as one point on a plane (flow 1 across, flow 2 up). The line x₁ + x₂ = 100 is the total that just avoids loss; the diagonal x₁ = x₂ is an even split. Additive increase adds 1 to each: the point moves up-right at 45°, and the gap between them stays the same. Multiplicative decrease halves both: the point shrinks toward the origin, and the gap halves too. So every loss halves the gap and the point closes in on the diagonal. For contrast, if each subtracted a fixed 8 on loss (<strong>additive decrease, AIAD</strong>), the gap would never change. This step assumes both flows have the same RTT and notice a loss in the same round.',
    modeAimd: 'Halve on loss (AIMD)', modeAiad: 'Subtract 8 on loss (AIAD)', play6: 'Play 200 rounds', reset6: 'Start over',
    s6lgTraj: 'path of the two windows', s6lgFair: 'diagonal: even split', s6lgEff: 'slanted line: total = 100', s6lgF1: 'flow 1', s6lgF2: 'flow 2',
    c6top: 'Flow 2’s window (up) against flow 1’s window (across)', c6bot: 'Both windows by round',
    s6readout: 'Round {k}/{N}: flow 1 = {x1}, flow 2 = {x2}, gap {gap}; {losses} shared losses so far.',
    s6gaps: 'Gap after each loss: {list}',
    s6hint: 'What to watch: choose “Halve (AIMD)” and play: the zigzag above closes in on the diagonal and the two lines below merge. Then choose “Subtract 8 (AIAD)” and replay: the zigzag runs back and forth along a line parallel to the diagonal, and the gap stays 56 forever.',

    s7k: 'Step 7 · Wrap-up',
    s7t: 'From cutting packets to making room',
    s7fin: 'One transfer split into problems that each do one job. <strong>Packets</strong>: each carries MTU − 40 data bytes, and bigger packets mean a smaller header share. <strong>Time</strong>: T = RTT + size ÷ bandwidth; small files are ruled by the RTT and extra bandwidth barely helps. <strong>Reliability</strong>: sequence numbers, ACKs and timed resends, with a handshake to agree on starting numbers at the cost of one RTT up front. <strong>Speed</strong>: the window needs at least BDP packets to keep the link busy; beyond that packets only queue, and a full queue drops them. <strong>Sharing</strong>: AIMD finds its window from loss signals alone, every loss halves the gap between flows, and they drift toward an even split.',
    formula: 'packets = ⌈bytes ÷ (MTU − 40)⌉\nT = RTT + size ÷ bandwidth\nthroughput = min(C, W ÷ RTT), BDP = C × RTT\nAIMD: +1 per RTT, ÷2 on loss',
    boundary: 'Scope: these are teaching models. Headers are fixed at 40 bytes, ignoring options, TLS and link-layer framing; RTT depends on nothing but the path; the handshake step shows stop-and-wait only, whereas real TCP keeps many segments in flight, uses cumulative ACKs and fast retransmit; congestion control is computed one RTT per round with a fixed rule “beyond BDP + B means loss”, and the two flows lose packets together and share one RTT. Modern systems also use other algorithms such as CUBIC and BBR; the conclusions cover only the Reno-style AIMD shown here.',
    linksTitle: 'Keep going',
    lk1: '→ Shortest Path, step 1: how a router picks the next hop without trying every route',
    lk2: '→ Poisson Process, step 4: many random arrival streams merged, exactly what a router buffer faces',
    lk3: '→ Graph Algorithms (Claude edition), step 2: spreading out layer by layer gives the fewest hops to every node',
    lk4: '→ RSA, step 3: anyone can read a packet on the way, so the content needs encryption',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Network Flow · A Message’s Journey”.'
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
  if (typeof window.refreshNetLesson === 'function') window.refreshNetLesson();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.NET_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
