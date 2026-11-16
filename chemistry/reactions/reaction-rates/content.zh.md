---
lang: zh
---

::: strings
docTitle: 反应速率 · 数一数成功碰撞
back: ← 知识索引
pageTitle: 反应速率 · 数一数成功碰撞
tagline: 反应快慢取决于成功碰撞：碰得更勤，能量达标的比例更大，反应就更快。
foot: 反应速率 · 一个碰撞一个碰撞地看
navLabel: 步骤导航
:::

## 碰上也不一定成 {#step0 h2=s0t}

::: strings
nav0: 0 成功碰撞
:::

第 0 步 · 成功碰撞 {#s0k .step-kicker i18n=text}

反应物粒子在盒子里运动。A 与 B 碰到时，只有相对速率达到活化能阈值，才记作一次**成功碰撞**并生成产物；碰到了但能量不足的，仍是碰撞，却不会反应。先数清成功碰撞，才谈反应快慢。 {#s0e .explain}

::: html step0-1
canvasLabel: 粒子碰撞模拟画布
:::

✓ 成功碰撞（这对 A、B 被消耗，生成绿色 P）　✗ 能量不足；标记停留约 0.5 秒后淡出 {#s0note .legend i18n=text}

::: html step0-2
pause: 暂停
reset: 重置本步
:::

::: strings
run: 运行
s0ro: 最近 {sec} 秒（门槛 {v}）：碰撞 {collisions} 次，其中成功 {successes} 次；成功占比 {rate}%；产物累计 {products} 个。
:::

## 人多，碰得多 {#step1 h2=s1t}

::: strings
nav1: 1 浓度
:::

第 1 步 · 浓度 {#s1k .step-kicker i18n=text}

把同一个盒子里的 A、B 粒子加多，单位时间里相遇的机会就变多。拖动粒子数，观察滑窗内的成功碰撞/秒和产物曲线；曲线的每个点都来自模拟计数。 {#s1e .explain}

::: html step1-1
traceLabel: 产物累计曲线
countLab: 粒子总数
:::

::: strings
countVal: {n} 个
s1ro: 粒子 {n} 个 · 成功碰撞率 {rate}/秒 · 产物累计 {products} 个。
s1compare: 对照（{seeds} 个种子 × {sec} 秒均值）：粒子数 {base} → {n}，成功碰撞率 {a} → {b}/秒。
:::

## 跑得快，达标的也多 {#step2 h2=s2t}

::: strings
nav2: 2 温度
:::

第 2 步 · 温度 {#s2k .step-kicker i18n=text}

升温会同时做两件事：粒子跑得更快，碰撞更勤；更多碰撞越过活化能门槛。「相对温度」是本页的速率旋钮（不是开尔文温度）。本步门槛 90，只有少数碰撞达标（落在速率分布的高能尾部）——正是这种情形下，升温比同幅加粒子更陡；若门槛很低、多数碰撞本来就达标，第二重效应就弱了。 {#s2e .explain}

::: html step2-1
tempLab: 相对温度
:::

::: strings
tempVal: {t}%
s2ro: 温度 {t}% · 平均速率 {speed} · 碰撞 {coll}/秒 · 成功占比 {ready}%（近 8 秒）· 成功碰撞率 {rate}/秒。
s2compare: 同幅 +50% 对照（门槛 {thr}，{seeds} 个种子 × {sec} 秒均值）：粒子 32→48（A、B 各 +50%），成功率 +{conc}%；相对温度 100%→150%（平均速率 ×{sp}），成功率 +{temp}%——其中碰撞频率 +{cf}%，成功占比 {sh0}% → {sh1}%。结论：升温{verdict}。
:::

## 整块还是粉末：接触面决定机会 {#step3 h2=s3t}

::: strings
nav3: 3 表面积
:::

第 3 步 · 表面积 {#s3k .step-kicker i18n=text}

固体总量相同（36 个 B 位点）。整块时只有最外一圈位点贴着溶液，里面的被包住——A 粒子会被固体弹开，够不着它们；磨成粉（9 颗小粒）后每个位点都露在外面。亮橙描边 = 可碰（表面）位点，暗棕 = 被包住，虚线框是接触区。固体 B 不动，成功只看 A 撞上来的速率，所以本步门槛另设为 40。 {#s3e .explain}

::: html step3-1
surfaceLab: 固体形态
block: 整块
powder: 粉末
:::

::: strings
s3ro: {shape} · 可碰位点 {active}/{total} · 门槛 {v} · 成功碰撞率 {rate}/秒。
s3compare: 同样 {total} 个位点：可碰名单从 {a} 扩到 {b}，成功率从 {r1} 升到 {r2}/秒（{seeds} 个种子 × {sec} 秒均值）。
:::

## 把门槛降下来 {#step4 h2=s4t}

::: strings
nav4: 4 催化剂
:::

第 4 步 · 催化剂 {#s4k .step-kicker i18n=text}

催化剂降低活化能阈值，因而更多已有速率的碰撞能达标；它不把粒子突然加速。拖动阈值，观察成功占比和平均速率：成功率升了，速率分布仍保持原样。下面的反应坐标图把「跨过门槛」画成能量峰：粒子运动的统计保持不变，改变的是要翻过的峰高。 {#s4e .explain}

先固定粒子运动，只把阈值往下调：成功占比上升而平均速率近似不变；再打开催化剂开关，比较同一速度分布下门槛的变化。 {#s4bridge .hint i18n=text}

::: html step4-1
energyLabel: 活化能反应坐标图
:::

粉红线：当前未加催化剂的门槛；绿虚线：催化剂把门槛压低。峰高是示意，成功率仍来自上方碰撞模拟。 {#energyNote .energy-note i18n=text}

::: html step4-2
thresholdLab: 活化能阈值
catOn: 加入催化剂
:::

::: strings
energyAxisX: 反应坐标
energyAxisY: 相对能量
energyUncat: 未催化门槛
energyCat: 催化剂门槛
energyReactants: 反应物
energyProducts: 产物
thresholdVal: {v}
catOff: 移除催化剂
s4ro: 阈值 {v} · 平均速率 {speed} · 成功占比 {ready}%（近 8 秒）· 成功碰撞率 {rate}/秒。
s4compare: 加催化剂：阈值 {a} → {b}（{seeds} 个种子均值）：成功率从 {r1} 升到 {r2}/秒，平均速率 {speed} → {speed2}，没有变。
:::

## 四个旋钮，改的是两件事 {#step5 h2=s5t}

::: strings
nav5: 5 终章
:::

第 5 步 · 终章 {#s5k .step-kicker i18n=text}

浓度↑让碰撞更勤；温度↑让碰撞更勤且达标比例更高；表面积↑扩大可碰粒子名单；催化剂↓活化能门槛。它们都在增加成功碰撞次数，但路径不同。 {#s5e .explain}

::: html step5-1
modelTitle: 模型假设与失配
modelBody: 本页把粒子简化为在盒内匀速直线运动、碰壁弹性反弹；粒子之间相遇不改变运动（彼此穿过），每次相遇只在接触开始时记一次碰撞。A、B 相遇且相对速率超过阈值才算成功：这对 A、B 被消耗，相遇处生成一个产物 P（约 4 秒后移出画面，计数保留）；为了让浓度保持不变，同时补入同速率的新 A、B（像持续进料的反应器；固体位点原地补齐），所以本页反应速率不会随时间变慢——真实的密闭体系里，反应物会越用越少、速率逐渐下降。「相对温度」只是速率缩放旋钮，不是开尔文温度；真实体系的速率分布服从麦克斯韦分布，温度与速率常数用阿伦尼乌斯方程联系，这里只表达定性图景。催化剂按本页口径只降低阈值，不改变粒子速率分布。
linkEq: → 去化学平衡第 0 步：平衡是正逆反应速率相等
linkParticles: → 去粒子与状态：热运动的底图
:::

::: strings
seconds: 秒
collisions: 碰撞
products: 产物
success: 成功
failed: 失败
avgSpeed: 平均速率
ready: 达标比例
A: A
B: B
P: P
canvasLegend: ● A（青）/ B（橙）反应物　◆ P 产物（绿）
statusRunning: 运行中
statusPaused: 已暂停
computing: 对照计算中…
surfaceLegend: ■ 亮橙：可碰位点　■ 暗棕：被包住　● A 溶液粒子　◆ P 产物
notSteeper: 并不更陡
steeper: 更陡
traceGhost: 虚线：调节前 {n} 个粒子
traceNow: 实线：当前 {n} 个粒子
traceY: 产物累计（个）
traceX: 时间（最近 20 秒）
:::
