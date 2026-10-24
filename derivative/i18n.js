/* derivative 页 · 双语文案与切换（逻辑与 parabola / linear-functions 页相同） */
var LANG_KEY = 'knowledge-lang';
var _memLang = null;
function storedLang(){ try{ return localStorage.getItem(LANG_KEY) || _memLang; }catch(e){ return _memLang; } }
function saveLang(l){ _memLang = l; try{ localStorage.setItem(LANG_KEY, l); }catch(e){} }
function getLang(){
  var s = storedLang();
  if (s === 'zh' || s === 'en') return s;
  return (navigator.language || 'en').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
}
var STR = {
zh: {
  docTitle: '导数 · 把「一段」压成「一点」 —— 一步一交互',
  back: '← 知识索引',
  pageTitle: '导数 · 把「一段」压成「一点」',
  tagline: '平均速度人人会算，可「这一刻」有多快，平均速度答不了。办法是把区间向一点无限收缩：割线两点越靠越拢，割线斜率就被逼向切线斜率——那个被逼出来的数，就是导数。',
  nav0: '0 平均速度', nav1: '1 割线逼近', nav2: '2 每点的导数', nav3: '3 导数在说什么', nav4: '4 自测', nav5: '5 终章',
  start: '开始探索 ↓',
  foot: 'visual.integ.life · 导数 The Derivative —— 一步一交互系列',
  cT: '时间 t（秒）', cS: '位移 s（米）', cSec: '割线', cTan: '切线',
  cDerivY: '导数 f′(x)', cCollT: '收集到的导数点（横轴 x，纵轴实测 f′）',

  s0k: '第 0 步 · 平均速度不够用',
  s0t: '平均速度不够用：它答的是「一段」，不是「此刻」',
  s0e: '一辆车沿直线跑，位移随时间是 s = t²（t 秒时走了 t² 米）。平均速度你早会算：一段位移除以这段时间。可教练问的是另一件事——「<b>第 1 秒这一刻</b>，它到底有多快？」先拖时刻探针看它每一刻在哪，再点下面三个区间：右端从 3 秒一路收到 1.5 秒，看平均速度怎么变。',
  s0play: '播放 ▶', s0pause: '暂停 ❚❚', s0replay: '重播 ⟳',
  s0prog: '播放中：t = {t} s（第 {n} / 30 小步）',
  s0progIdle: '未播放：t = {t} s（第 {n} / 30 小步）',
  s0progDone: '播放完毕：t = {t} s（第 {n} / 30 小步）',
  s0tLab: '时刻探针 t（秒）',
  s0probe: '时刻探针：t = <span>{t}</span> s 时，位移 s = t² = <b>{s} m</b>。这是「每一刻它在哪」，还不是「这一刻它多快」。',
  s0intLab: '选一段区间，算它的平均速度：',
  s0roA: '在 <span>[1, 3]</span> 这段：s(1) = {sa} m，s(3) = {sb} m，Δs = {ds} m，Δt = {dt} s，平均速度 = Δs ÷ Δt = <b>{v} m/s</b>。这是整整两秒的平均——答的是「这一段平均多快」，不是第 1 秒这一刻。把区间缩窄再试。',
  s0roB: '在 <span>[1, 2]</span> 这段：s(1) = {sa} m，s(2) = {sb} m，Δs = {ds} m，Δt = {dt} s，平均速度 = <b>{v} m/s</b>。只窄了一半，读数就从 4 掉到 3——它随区间的选法而变，所以哪个都当不了「此刻」的答案。再缩一档。',
  s0roC: '在 <span>[1, 1.5]</span> 这段：s(1) = {sa} m，s(1.5) = {sb} m，Δs = {ds} m，Δt = {dt} s，平均速度 = <b>{v} m/s</b>。区间越窄，这个数越往一个固定的值靠——靠向的那个数，才是第 1 秒这一刻的快慢。下一节就去把它抓出来。',
  s0conc: '先立两个名词：一段位移除以这段时间，叫这段上的<b>平均变化率</b>（这里就是平均速度）；而「某一刻的变化率」叫<b>瞬时变化率</b>。平均变化率随区间而变，答不了此刻；想问此刻，只能让区间向一点收缩——下一节换上几何外衣来做这件事。',
  s0hint: '播放键会让探针从 t = 0 走到 t = 3，看它沿曲线爬：越往后，同样 0.1 秒里走得越远——速度本身就在变，这正是「平均」答不了「此刻」的原因。',

  s1k: '第 1 步 · 割线逼近切线',
  s1t: '割线逼近切线：两点越靠越拢，斜率被逼向一个数',
  s1e: '换一身几何外衣：曲线 y = x²，定点 P = (1, 1)，另一个点 Q 在曲线上滑动。连线 PQ 叫<b>割线</b>——穿过曲线上两点的直线；它的斜率 Δy ÷ Δx，就是这一小段上的平均变化率。拖动 Q（或点 Δx 档位、拖滑杆）让 Q 向 P 靠拢，看割线怎么转、斜率读数往哪儿收。',
  s1preLab: '点一档 Δx：',
  s1dxLab: 'Δx（Q 与 P 的横坐标差，可正可负）',
  s1ro: 'Q = (<span>{qx}</span>, <span>{qy}</span>)：Δx = {dx}，Δy = {dy}，割线斜率 = Δy ÷ Δx = <b>{slope}</b>。对 y = x²，这个斜率恰好等于 2 + Δx——Δx 还剩多少，它就离 2 还差多少。',
  s1ro2: 'Δx 已经缩得足够小：割线和切线肉眼已分不开。关键在两侧：Δx 从正的一侧缩，斜率从 2 以上往下靠；从负的一侧缩，斜率从 2 以下往上靠——<b>两侧奔向同一个数 2</b>。这个被逼出来的数，就是 f 在 x = 1 处的<b>导数</b>，记作 f′(1) = 2；割线贴合到的那条直线，叫曲线在 P 点的<b>切线</b>。所谓极限，在这里就是这个意思：两点无限靠拢时，斜率被逼向的那个数。',
  s1roIdle: '把 Δx 继续缩小（试试 0.1 和 0.01），再试试负的一侧，让割线转到与曲线在 P 点「只碰一下」的位置——那条极限位置的直线自会出现。',
  s1hint: '注意负 Δx 的一侧同样重要：两侧靠不到同一个数的地方，导数就不存在——比如曲线上有个尖点时。这一点终章还会再说。',

  s2k: '第 2 步 · 每点一个导数',
  s2t: '每个点都有自己的导数：把斜率收集成新函数',
  s2e: 'P 换个位置，这个点的导数就变：x = 0 处曲线几乎是平的，往两边走切线越来越陡。拖动 P 沿 y = x² 滑动（x 从 −2 到 2），每个停点都用同一套办法实测一次：取 Δ = 0.001 的割线斜率当近似，再和规律值 2x 对账。下面第二幅图会把你测过的每个点的导数描成点列——看它们排成什么形状。',
  s2xLab: 'P 点的横坐标 x（拖 P 或拖滑杆）',
  s2ro: '在 x = <span>{x}</span> 处：实测（Δ = 0.001 的割线斜率）≈ <b>{meas}</b>；规律值 2x = <span>{exact}</span>。测得值只比 2x 多 0.001——那正是 Δ 还没缩完留下的尾巴，Δ 再小它还会更小。所以判定这一点的导数 = <b>{exact}</b>：实测是逼近，不冒充精确值。',
  s2reset: '清空收集的点',
  s2count: '已收集 {n} 个点的导数',
  s2ro2a: '下面图里每个点 = 「某个 x 处的导数」。多拖几个位置（别忘了负半轴：那边的导数是负的；x = 0 处导数是 0），看点列往什么形状上排。',
  s2ro2b: '已收集 <span>{n}</span> 个点：它们排成一条直线——正是 y = 2x（图中的虚线是对账线）。把每个 x 处的导数描出来，得到的图形本身就是一条直线：各点的斜率，组成了一个新函数。',
  s2conc: '收口：把每个点的导数收集成的新函数叫<b>导函数</b>（顾名思义：由原函数「导出」的函数），记作 f′(x)。对 f(x) = x²，f′(x) = 2x。顺带埋一句：x³ → 3x²（先不证明，自测题 2 里你会在 x = 1 处亲手验它）；更多的求导公式，都是同一套逼近办法的收口。',
  s2hint: '注意实测口径：读数永远带「≈」和 Δ 的大小；只有当 Δ 还能继续缩小、读数稳定奔向同一个数时，我们才把那个数判定为导数。',

  s3k: '第 3 步 · 导数在说什么',
  s3t: '导数在说什么：同一个数的三张脸',
  s3e: '导数算出来是个数，这个数在说什么？同一件事有三张脸：它的<b>正负</b>说增减，它的大小（<b>绝对值</b>）说陡缓，换回物理情境它就是<b>瞬时速度</b>。点三个读法按钮，拖探针逐一验证。',
  s3m1: '读法一 · 增减', s3m2: '读法二 · 陡缓', s3m3: '读法三 · 瞬时速度',
  s3xLab: '探针点的 x', s3tLab: '时刻 t（秒）',
  s3roIncPos: '读法一：x = <span>{x}</span> 处 f′(x) = <b>{d}</b>，大于 0——曲线在这里<b>上升</b>（图上绿色段）。导数为正，函数就往上走。',
  s3roIncNeg: '读法一：x = <span>{x}</span> 处 f′(x) = <b>{d}</b>，小于 0——曲线在这里<b>下降</b>（图上粉色段）。导数为负，函数往下走。',
  s3roIncZero: '读法一：x = <span>{x}</span> 处 f′(x) = <b>{d}</b>，正好等于 0——顶点：不升不降。这正是<a class="fourier-link" href="../parabola/#step2">抛物线第 2 步「顶点搬家」</a>里那个顶点，在这一页它多了一个名字：导数等于 0 的点。',
  s3roSteep: '读法二：x = <span>{x}</span> 处 |f′(x)| = <b>{abs}</b>。看虚线三角：横着走 1，竖着要爬 {abs}——|导数| 越大，切线越陡、曲线爬得越急；到 x = 0 附近 |f′| 接近 0，曲线几乎躺平。',
  s3roVel: '读法三：把坐标轴换回物理：横轴是时间 t、纵轴是位移 s，曲线还是 s = t²。t = <span>{t}</span> s 这一刻，瞬时速度 v = s′(t) = 2t = <b>{v} m/s</b>。这正是<a class="fourier-link" href="../velocity-vt/#step1">velocity-vt 第 1 步</a>里「每一刻的速度」——那一页用 v-t 图认它，这一页给了它一个算得出来的定义：把区间缩成一点。',
  s3hint: '三张脸是同一个数：符号定增减，绝对值定陡缓，换上单位（米/秒）就是速度。第 0 步 [1, 1.5] 区间算出的 2.5 只是平均速度；第 1 秒这一刻的速度，按读法三是 2 × 1 = 2 m/s。',

  s4k: '第 4 步 · 自测',
  s4t: '自测：在 x = 3 处逼近、试一试 x³、一个判断',
  s4e: '三道题是同一件事的三种问法：导数 = 把区间缩成一点后，变化率收敛到的那个数。先用工具实测，再作答。',
  q1t: '题 1 · 在 x = 3 处逼近',
  q1d: '还是 y = x²，换看 x = 3 这一点（第 1 步是 x = 1）。依次点三档 Δx，看割线斜率的读数往哪儿收，然后回答 f′(3)。',
  q1dxLab: '点一档 Δx 看割线斜率：',
  q1ro: 'Δx = <span>{dx}</span>：割线斜率 = ((3 + {dx})² − 9) ÷ {dx} = <b>{slope}</b>。它恰好等于 6 + Δx——Δx 还剩多少，就离极限还差多少。',
  q1ok: '✓ 对：f′(3) = <b>6</b>。7、6.1、6.01 都是割线斜率（过程量），它们一路逼向的 6 才是导数；而且 6 = 2 × 3，和导函数 f′(x) = 2x 正好对上。',
  q1no: '✗ {v} 是某一档 Δx 下的割线斜率，不是导数。看三档读数 7 → 6.1 → 6.01 的奔向：Δx 再缩下去，它们收敛到的数才是 f′(3)。',
  q2t: '题 2 · 试一试 x³',
  q2d: '换 f(x) = x³，看 x = 1 这一点。用和第 1 步同一套逼近工具实测几档，看读数一路往哪个整数收，再回答 f′(1) 是多少。提醒：每一档读数都是近似值，尾巴还没缩完——要选的是它们收敛到的那个数，不是某一档的读数本身。',
  q2dxLab: '点一档 Δx 实测割线斜率：',
  q2ro: 'Δx = <span>{dx}</span>：割线斜率 = ((1 + {dx})³ − 1) ÷ {dx} ≈ <b>{slope}</b>。Δx 越小，这个「测得」越贴近一个整数。',
  q2ok: '✓ 对：f′(1) = <b>3</b>。读数 7、4.75、3.31、3.0301 一路奔向 3，Δx = 0.01 时的 3.0301 只是尾巴没缩完——极限是 3，和「3x² 在 x = 1 处的值」对上。',
  q2no: '✗ 再看工具读数奔向哪：Δx 从 1 缩到 0.01，斜率 7 → 4.75 → 3.31 → 3.0301，越缩越贴近哪个整数？',
  q3t: '题 3 · 判断',
  q3d: '「导数就是切线本身。」这句话对吗？',
  q3true: '对', q3false: '错',
  q3ok: '✓ 判断正确：导数<b>不是</b>切线本身。导数是切线的<b>斜率</b>——一个数；切线是一条直线。「f′(1) = 2」说的是斜率等于 2，不是说导数是一条线。',
  q3no: '✗ 想想第 1 步被逼出来的 2 是什么：它是割线斜率收敛到的<b>数</b>。导数是一个数（切线的斜率），切线是那条直线——数和线不是一回事。选「错」。',
  s4hint: '三题答案：6、3、「错」。都是同一句话：导数是把区间缩成一点后，变化率收敛到的那个数。',

  s5k: '第 5 步 · 终章',
  s5t: '从「一段」到「此刻」：导数收口',
  s5e: '走完五步，把整页收成三句话——它们和物理页、抛物线页是同一条线的三站。',
  c1h: '平均 → 瞬时，靠缩区间',
  c1: '平均变化率要选一段区间，答案随区间而变（4、3、2.5 都对，也都不对题）；把区间向一点无限收缩，割线斜率收敛到的那个数，就是这一点的瞬时变化率。',
  c2h: '导数是切线的斜率',
  c2: '几何上，f′(x) 是曲线在该点切线的斜率：正负说增减，大小说陡缓。它是一个数，不是那条直线本身。',
  c3h: '导函数收集每点的斜率',
  c3: '对每个 x 都做一次同样的逼近，得到的新函数就是导函数 f′。本页亲手做完 x² → 2x，并在 x = 1 处验证了 x³ → 3x²。',
  s5fin: '两个留给后面的话：① <b>光滑是默认条件</b>：如果曲线在某点有个尖角（比如 |x| 在 0 处），左右两侧的割线斜率靠不到同一个数，那一点就没有导数——本页的一切，都建立在「两侧能靠到一起」上。② <b>反过来想</b>：如果只知道每一刻的变化率，能不能把原来的量累加回来？把变化率反过来累加回去，就是下一页的定积分（尚未上线，先在这里埋一句）。',
  s5lkVel: '物理那一面：velocity-vt 第 1 步——「每一刻的速度」与 v-t 图 →',
  s5lkPar: '几何那一面：抛物线第 2 步——顶点是导数等于 0 的点 →'
},
en: {
  docTitle: 'The Derivative · Squeezing an Interval into a Point — One Interaction per Step',
  back: '← Knowledge index',
  pageTitle: 'The Derivative · Squeezing an Interval into a Point',
  tagline: 'Everyone can compute an average speed — but how fast is it at this very instant? Shrink the interval toward a single point: the two ends of a secant line close in, its slope is forced toward the tangent slope — and the number it is forced to is the derivative.',
  nav0: '0 Average speed', nav1: '1 Secant → tangent', nav2: '2 A derivative at every point', nav3: '3 What it says', nav4: '4 Check yourself', nav5: '5 Wrap-up',
  start: 'Start exploring ↓',
  foot: 'visual.integ.life · The Derivative —— one interaction per step',
  cT: 'Time t (s)', cS: 'Displacement s (m)', cSec: 'secant', cTan: 'tangent',
  cDerivY: 'Derivative f′(x)', cCollT: 'Collected derivative points (x axis, measured f′ vertical)',

  s0k: 'Step 0 · Average speed is not enough',
  s0t: 'Average speed is not enough: it answers for an interval, not for an instant',
  s0e: 'A car moves along a line with displacement s = t² (after t seconds it has gone t² metres). Average speed is easy: displacement over a stretch divided by the time that stretch took. But the coach asks something else — “<b>at the instant t = 1 s</b>, exactly how fast is it?” Drag the time probe to see where it is at each moment, then try the three intervals: the right end pulls in from 3 s to 1.5 s — watch what the average speed does.',
  s0play: 'Play ▶', s0pause: 'Pause ❚❚', s0replay: 'Replay ⟳',
  s0prog: 'Playing: t = {t} s (small step {n} / 30)',
  s0progIdle: 'Not started: t = {t} s (small step {n} / 30)',
  s0progDone: 'Finished: t = {t} s (small step {n} / 30)',
  s0tLab: 'Time probe t (seconds)',
  s0probe: 'Time probe: at t = <span>{t}</span> s the displacement is s = t² = <b>{s} m</b>. That is “where it is at each moment” — not yet “how fast at this moment”.',
  s0intLab: 'Pick an interval and compute its average speed:',
  s0roA: 'On <span>[1, 3]</span>: s(1) = {sa} m, s(3) = {sb} m, Δs = {ds} m, Δt = {dt} s, average speed = Δs ÷ Δt = <b>{v} m/s</b>. That is an average over a full two seconds — it answers “how fast on average over this stretch”, not the instant t = 1. Narrow the interval and try again.',
  s0roB: 'On <span>[1, 2]</span>: s(1) = {sa} m, s(2) = {sb} m, Δs = {ds} m, Δt = {dt} s, average speed = <b>{v} m/s</b>. Narrow it just by half and the reading drops from 4 to 3 — it changes with the interval you choose, so none of these can be the answer for “this instant”. Narrow it once more.',
  s0roC: 'On <span>[1, 1.5]</span>: s(1) = {sa} m, s(1.5) = {sb} m, Δs = {ds} m, Δt = {dt} s, average speed = <b>{v} m/s</b>. The narrower the interval, the closer this number settles toward one fixed value — and that value is the speed at the instant t = 1. The next step goes and catches it.',
  s0conc: 'Two terms to fix in place: displacement over a stretch of time is called the <b>average rate of change</b> over that stretch (here: the average speed); the rate “at one instant” is the <b>instantaneous rate of change</b>. The average depends on the interval and cannot answer for an instant; to ask about an instant, the interval must shrink to a point — the next step does exactly that, in geometric clothes.',
  s0hint: 'The Play button walks the probe from t = 0 to t = 3 along the curve: the later it gets, the farther it travels in the same 0.1 s — the speed itself is changing, which is exactly why an “average” cannot answer for “this instant”.',

  s1k: 'Step 1 · The secant approaches the tangent',
  s1t: 'The secant approaches the tangent: two points close in, the slope is forced to one number',
  s1e: 'Same idea, geometric clothes: the curve y = x², a fixed point P = (1, 1), and a second point Q sliding on the curve. The line PQ is called a <b>secant</b> — a line through two points of the curve; its slope Δy ÷ Δx is exactly the average rate of change over that small stretch. Drag Q (or use the Δx presets and the slider) to bring Q toward P, and watch the secant turn and the slope reading settle.',
  s1preLab: 'Pick a Δx:',
  s1dxLab: 'Δx (difference of the x-coordinates of Q and P; may be negative)',
  s1ro: 'Q = (<span>{qx}</span>, <span>{qy}</span>): Δx = {dx}, Δy = {dy}, secant slope = Δy ÷ Δx = <b>{slope}</b>. For y = x² this slope works out to exactly 2 + Δx — whatever Δx remains is exactly how far it still is from 2.',
  s1ro2: 'Δx is now small enough that secant and tangent are indistinguishable to the eye. The key is the two sides: with Δx shrinking from the positive side, the slope comes down toward 2 from above; from the negative side it climbs toward 2 from below — <b>both sides are forced to the same number, 2</b>. That forced number is the <b>derivative</b> of f at x = 1, written f′(1) = 2; the line the secant settles onto is the <b>tangent</b> to the curve at P. “Limit” here means precisely this: the number the slope is forced to as the two points close in without bound.',
  s1roIdle: 'Keep shrinking Δx (try 0.1 and 0.01), then try the negative side too, until the secant turns into the position where it just touches the curve at P — the limiting line will appear.',
  s1hint: 'The negative-Δx side matters just as much: wherever the two sides cannot be forced to the same number, there is no derivative — for instance at a sharp corner of the curve. The wrap-up returns to this.',

  s2k: 'Step 2 · A derivative at every point',
  s2t: 'Every point has its own derivative: collecting slopes into a new function',
  s2e: 'Move P and the derivative at that point changes: near x = 0 the curve is almost flat, and the tangent steepens as you move out to either side. Drag P along y = x² (x from −2 to 2); at each stop, measure the same way as before — the secant slope with Δ = 0.001 as an approximation — and check it against the pattern value 2x. The second plot below records the derivative of every point you visit as a scatter — watch what shape they form.',
  s2xLab: 'x-coordinate of P (drag P or the slider)',
  s2ro: 'At x = <span>{x}</span>: measured (secant slope with Δ = 0.001) ≈ <b>{meas}</b>; pattern value 2x = <span>{exact}</span>. The measured value exceeds 2x by only 0.001 — precisely the tail left by Δ not being fully shrunk; a smaller Δ would shrink it further. So the derivative at this point is judged to be <b>{exact}</b>: the measurement approaches it, it does not impersonate the exact value.',
  s2reset: 'Clear collected points',
  s2count: '{n} derivative points collected',
  s2ro2a: 'Each dot below = “the derivative at some x”. Visit more positions (do not forget the negative half: derivatives there are negative; at x = 0 the derivative is 0) and watch what shape the dots line up into.',
  s2ro2b: '<span>{n}</span> points collected: they line up on a straight line — exactly y = 2x (the dashed line is the check). Plotting the derivative at every x produces a graph that is itself a straight line: the slopes form a new function.',
  s2conc: 'To wrap up: the new function that collects the derivative at every point is called the <b>derived function</b> — the derivative function — written f′(x). For f(x) = x², f′(x) = 2x. One seed for later: x³ → 3x² (not proved here; in check question 2 you will verify it by hand at x = 1); the other differentiation rules are all this same squeezing procedure, wrapped up.',
  s2hint: 'Mind the measurement wording: a reading always carries “≈” and the size of Δ; only when Δ can keep shrinking and the reading keeps settling toward one number do we judge that number to be the derivative.',

  s3k: 'Step 3 · What the derivative says',
  s3t: 'What the derivative says: three faces of one number',
  s3e: 'The derivative comes out as a number — what does the number say? One thing, three faces: its <b>sign</b> tells rising from falling, its size (its <b>absolute value</b>) tells steep from gentle, and back in a physics setting it is the <b>instantaneous velocity</b>. Switch between the three readings and drag the probe to check each one.',
  s3m1: 'Reading 1 · Rising / falling', s3m2: 'Reading 2 · Steep / gentle', s3m3: 'Reading 3 · Instantaneous velocity',
  s3xLab: 'Probe point x', s3tLab: 'Time t (seconds)',
  s3roIncPos: 'Reading 1: at x = <span>{x}</span>, f′(x) = <b>{d}</b>, which is positive — the curve is <b>rising</b> here (the green stretch). A positive derivative means the function climbs.',
  s3roIncNeg: 'Reading 1: at x = <span>{x}</span>, f′(x) = <b>{d}</b>, which is negative — the curve is <b>falling</b> here (the pink stretch). A negative derivative means the function descends.',
  s3roIncZero: 'Reading 1: at x = <span>{x}</span>, f′(x) = <b>{d}</b>, exactly 0 — the vertex: neither rising nor falling. This is the very vertex of the <a class="fourier-link" href="../parabola/#step2">parabola page, step 2 “moving the vertex”</a>; on this page it gains a new name: a point where the derivative is 0.',
  s3roSteep: 'Reading 2: at x = <span>{x}</span>, |f′(x)| = <b>{abs}</b>. Look at the dashed triangle: run 1 horizontally and you must climb {abs} — the larger |derivative|, the steeper the tangent and the harder the curve climbs; near x = 0, |f′| is close to 0 and the curve almost lies flat.',
  s3roVel: 'Reading 3: put the physics clothes back on — the horizontal axis is time t, the vertical axis displacement s, and the curve is still s = t². At the instant t = <span>{t}</span> s the instantaneous velocity is v = s′(t) = 2t = <b>{v} m/s</b>. This is exactly “the speed at each moment” of <a class="fourier-link" href="../velocity-vt/#step1">velocity-vt, step 1</a> — that page recognises it on a v–t graph; this page gives it a definition you can compute: shrink the interval to a point.',
  s3hint: 'The three faces are one number: the sign fixes rising vs falling, the absolute value fixes steepness, and with units attached (m/s) it is a velocity. The 2.5 computed on step 0 over [1, 1.5] was only an average; the speed at the instant t = 1, by reading 3, is 2 × 1 = 2 m/s.',

  s4k: 'Step 4 · Check yourself',
  s4t: 'Check yourself: squeeze at x = 3, try x³, one judgement call',
  s4e: 'Three questions, three phrasings of one idea: the derivative is the number the rate of change is forced to as the interval shrinks to a point. Measure with the tools first, then answer.',
  q1t: 'Question 1 · Squeezing at x = 3',
  q1d: 'Still y = x², but now look at the point x = 3 (step 1 used x = 1). Click the three Δx presets in turn, watch where the secant-slope readings settle, then answer f′(3).',
  q1dxLab: 'Click a Δx to see the secant slope:',
  q1ro: 'Δx = <span>{dx}</span>: secant slope = ((3 + {dx})² − 9) ÷ {dx} = <b>{slope}</b>. It works out to exactly 6 + Δx — whatever Δx remains is exactly how far is left to the limit.',
  q1ok: '✓ Correct: f′(3) = <b>6</b>. The readings 7, 6.1, 6.01 are secant slopes (quantities along the way); the 6 they are all forced toward is the derivative — and 6 = 2 × 3 matches the derivative function f′(x) = 2x.',
  q1no: '✗ {v} is a secant slope at one particular Δx, not the derivative. Watch where the three readings 7 → 6.1 → 6.01 are heading: the number they converge to as Δx keeps shrinking is f′(3).',
  q2t: 'Question 2 · Try x³',
  q2d: 'Now take f(x) = x³ and look at x = 1. Measure a few presets with the same squeezing tool as step 1, and watch which whole number the readings keep closing in on — then answer: what is f′(1)? Remember every reading is an approximation with the tail not fully shrunk: you are choosing the number they converge to, not any single reading itself.',
  q2dxLab: 'Click a Δx to measure the secant slope:',
  q2ro: 'Δx = <span>{dx}</span>: secant slope = ((1 + {dx})³ − 1) ÷ {dx} ≈ <b>{slope}</b>. The smaller Δx, the closer this “measured” value gets to a whole number.',
  q2ok: '✓ Correct: f′(1) = <b>3</b>. The readings 7, 4.75, 3.31, 3.0301 march straight toward 3; the 3.0301 at Δx = 0.01 is just the un-shrunk tail — the limit is 3, matching “the value of 3x² at x = 1”.',
  q2no: '✗ Look again at where the tool readings are heading: as Δx shrinks from 1 to 0.01 the slopes run 7 → 4.75 → 3.31 → 3.0301 — which whole number are they closing in on?',
  q3t: 'Question 3 · Judgement',
  q3d: '“The derivative is the tangent line itself.” Is that right?',
  q3true: 'Right', q3false: 'Wrong',
  q3ok: '✓ Correct judgement: the derivative is <b>not</b> the tangent itself. The derivative is the <b>slope</b> of the tangent — a number; the tangent is a line. “f′(1) = 2” says the slope equals 2, not that the derivative is a line.',
  q3no: '✗ Think about what the 2 squeezed out in step 1 was: a <b>number</b> the secant slopes converged to. The derivative is a number (the slope of the tangent); the tangent is the line itself — a number and a line are not the same thing. Choose “Wrong”.',
  s4hint: 'The three answers are 6, 3 and “Wrong” — all the same sentence: the derivative is the number the rate of change is forced to as the interval shrinks to a point.',

  s5k: 'Step 5 · Wrap-up',
  s5t: 'From an interval to an instant: wrapping up the derivative',
  s5e: 'Five steps done — the whole page folds into three sentences, and they are three stops on one line shared with the physics page and the parabola page.',
  c1h: 'Average → instantaneous, by shrinking',
  c1: 'An average rate of change needs an interval, and the answer changes with the interval (4, 3, 2.5 are all correct, and none answers the question); shrink the interval toward a point without bound, and the number the secant slope is forced to is the instantaneous rate of change at that point.',
  c2h: 'The derivative is the slope of the tangent',
  c2: 'Geometrically, f′(x) is the slope of the tangent to the curve at that point: its sign says rising or falling, its size says steep or gentle. It is a number, not the line itself.',
  c3h: 'The derivative function collects every point’s slope',
  c3: 'Do the same squeeze at every x and the resulting new function is the derivative function f′. On this page you did x² → 2x by hand, and verified x³ → 3x² at x = 1.',
  s5fin: 'Two parting notes: ① <b>Smoothness is the standing assumption</b>: if the curve has a sharp corner at some point (like |x| at 0), the secant slopes from the two sides cannot be forced to the same number, and there is no derivative at that point — everything on this page rests on “the two sides can meet”. ② <b>Run it backwards</b>: if you know the rate of change at every instant, can you accumulate the original quantity back? Accumulating a rate of change back is the definite integral — the next page (not yet published; planted here in one sentence).',
  s5lkVel: 'The physics face: velocity-vt step 1 — “the speed at each moment” and the v–t graph →',
  s5lkPar: 'The geometry face: parabola step 2 — the vertex is a point where the derivative is 0 →'
}
};
function t(key, params){
  var lang = getLang();
  var s = (STR[lang] && STR[lang][key]) || STR.zh[key] || key;
  if (params) Object.keys(params).forEach(function(k){ s = s.split('{' + k + '}').join(String(params[k])); });
  return s;
}
var _langRefreshers = [];
function onLangRefresh(fn){ _langRefreshers.push(fn); }
function applyLang(){
  var lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach(function(el){ el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-html]').forEach(function(el){ el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  document.querySelectorAll('#langToggle button[data-lang]').forEach(function(b){
    b.classList.toggle('active', b.getAttribute('data-lang') === lang);
  });
  document.title = t('docTitle');
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  _langRefreshers.forEach(function(fn){ fn(); });
}
function initLangToggle(){
  document.querySelectorAll('#langToggle button[data-lang]').forEach(function(b){
    b.addEventListener('click', function(){
      if (getLang() !== b.getAttribute('data-lang')){ saveLang(b.getAttribute('data-lang')); applyLang(); }
    });
  });
  applyLang();
}
document.addEventListener('DOMContentLoaded', initLangToggle);
