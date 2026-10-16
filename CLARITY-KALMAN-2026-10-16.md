# 卡尔曼滤波单页：概念清晰度评审与改稿

评审对象：`kalman-work/index.html`、`i18n.js` 全部中英文案；参照 `SPEC.md`，并核读 `app.js`，确认文字是否符合图、控件和实际计算。读者假设：第一次接触卡尔曼滤波，能理解平均值和坐标图，尚不知道方差、贝叶斯更新或矩阵滤波。

已经直接修改两个指定文件。没有修改算法、公式计算、数值参数、变量名、DOM 属性或国际化键。以下引用均来自修改前的文件；“改后”是已写入文件的实际字符串，不是待实施方案。

## 一、总体判断与阅读路径

问题不只在术语多，而在解释把关键因果关系交给了比喻。页面用“秤、拔河、钟、呼吸、阀门、诚实”推进，却没有先让读者弄清：测量是什么，预测凭什么，误差如何比较，内部不确定度是否能感知实际错误。这会让外行形成一个错误印象：算法察觉运动突变后，会自己增大 P、提高对传感器的信任。

其中最需要纠正的事实关系是：本页固定模型、Q、R 的一维递推中，P 与 K 不使用测量值或残差，真实位置跳变不会自动使 P 变大。`app.js` 的 `stepKalman1d`、`riccatiStep` 可以直接验证这一点。另有“二维＝平面移动”“位置变化＝速度”“模拟数据＝真数据”“地图蓝线＝某一种滤波器”等容易误学的表述。

改稿采用以下顺序：具体定位任务 → 图的坐标和噪声 → 怎样判断估计好坏 → 平均为何滞后 → 预测与修正 → 参数假设 → 稳定权重及其边界 → 用位置推断速度 → 原理与真实应用。七步以及关闭速度变化后的替换正文，均以“这一步要回答……”／“The question: …”起头。

### 覆盖口径

已逐一通读两语种各 118 个键，包含标题、导航、正文、控件、图例、所有动态读数状态、备用模板、机动开关替换文案、终章卡片和链接。共修改 81 个键的中英文值（162 个字符串），另改 HTML 文档标题和页头后备标题。下面逐键列出问题与双语改文；末尾列出保留项，避免把“通读全部”误解为只读了主要段落。

## 二、逐条评审：原文 → 问题 → 已实施改文

以下引用以代码文本展示，保留原有 HTML 标签与动态占位符。中英文的共有问题合并说明；英文措辞问题在对应条目中指出。

### 01. `docTitle`

**原文（中）**

```text
卡尔曼滤波 · 在预测与测量之间称重 · 一步一交互
```

**原文（英）**

```text
Kalman Filter · Weighing Prediction Against Measurement · One Interaction per Step
```

**问题**：标题用“称重”代替学习目标；英文 The Weighing 生硬。改为直接说明算法做什么。

**改后（中）**

```text
卡尔曼滤波 · 怎样结合预测与测量 · 一步一交互
```

**改后（英）**

```text
Kalman Filter · Combining Predictions and Measurements · One Interaction per Step
```

### 02. `pageTitle`

**原文（中）**

```text
卡尔曼滤波 · 称重
```

**原文（英）**

```text
Kalman Filter · The Weighing
```

**问题**：标题用“称重”代替学习目标；英文 The Weighing 生硬。改为直接说明算法做什么。

**改后（中）**

```text
卡尔曼滤波 · 用测量修正预测
```

**改后（英）**

```text
Kalman Filter · Correcting Predictions with Measurements
```

### 03. `tagline`

**原文（中）**

```text
你永远看不到真实状态，只能在「模型说它在哪」和「传感器说它在哪」之间做取舍。卡尔曼滤波把这场拔河做成一台秤：权重不由人拍脑袋，而是由两边各自的不确定度当场算出来。本页每一步都用带种子的同一批真数据，当场算给你看。
```

**原文（英）**

```text
You never get to see the true state — only what your model predicts and what your noisy sensor reports. A Kalman filter turns that tug-of-war into a scale: the weights are never guessed, they are computed on the spot from how uncertain each side is. Every number on this page is computed live, from the same seeded data.
```

**问题**：“真实状态／模型／不确定度”未经解释并列；“永远”过度概括；“同一批真数据”混淆模拟与实测，也掩盖后续换场景。用定位任务引出预测和修正。

**改后（中）**

```text
手机定位会抖动，我们却想知道人实际在哪。卡尔曼滤波先用运动模型预测位置，再用传感器的新测量修正预测。模型是对运动规律的简化描述；预测和测量各可能偏多少，决定修正多少。本页用可重复生成的模拟数据演示这个过程。
```

**改后（英）**

```text
A phone reports a jittery location. How can we estimate where its user actually is? A Kalman filter predicts a position using a motion model, then corrects it with a new sensor reading. The model is a simplified description of how motion works. The correction depends on how uncertain the prediction and the reading are. This page uses reproducible simulated data.
```

### 04. `nav0`

**原文（中）**

```text
0 抖动的十字标
```

**原文（英）**

```text
0 Jittery Crosses
```

**问题**：导航／步骤标签依赖“钩子、笨办法、拔河”等修辞，或让“二维”被理解成平面运动；改为可预期的学习任务。

**改后（中）**

```text
0 从抖动读数估位置
```

**改后（英）**

```text
0 Estimate a Position
```

### 05. `nav1`

**原文（中）**

```text
1 两种笨办法
```

**原文（英）**

```text
1 Two Naive Fixes
```

**问题**：导航／步骤标签依赖“钩子、笨办法、拔河”等修辞，或让“二维”被理解成平面运动；改为可预期的学习任务。

**改后（中）**

```text
1 直接测量与平均
```

**改后（英）**

```text
1 Readings vs. Averages
```

### 06. `nav3`

**原文（中）**

```text
3 K 的拔河
```

**原文（英）**

```text
3 The Q–R Tug-of-War
```

**问题**：导航／步骤标签依赖“钩子、笨办法、拔河”等修辞，或让“二维”被理解成平面运动；改为可预期的学习任务。

**改后（中）**

```text
3 调整 Q 与 R
```

**改后（英）**

```text
3 Adjust Q and R
```

### 07. `nav4`

**原文（中）**

```text
4 稳态
```

**原文（英）**

```text
4 Steady State
```

**问题**：导航／步骤标签依赖“钩子、笨办法、拔河”等修辞，或让“二维”被理解成平面运动；改为可预期的学习任务。

**改后（中）**

```text
4 权重何时稳定
```

**改后（英）**

```text
4 When Weights Settle
```

### 08. `nav5`

**原文（中）**

```text
5 二维追踪
```

**原文（英）**

```text
5 Tracking in 2D
```

**问题**：导航／步骤标签依赖“钩子、笨办法、拔河”等修辞，或让“二维”被理解成平面运动；改为可预期的学习任务。

**改后（中）**

```text
5 同时估位置与速度
```

**改后（英）**

```text
5 Position and Velocity
```

### 09. `nav6`

**原文（中）**

```text
6 终章 · 来路与去向
```

**原文（英）**

```text
6 Finale · Origins & Reach
```

**问题**：导航／步骤标签依赖“钩子、笨办法、拔河”等修辞，或让“二维”被理解成平面运动；改为可预期的学习任务。

**改后（中）**

```text
6 原理与应用
```

**改后（英）**

```text
6 Principles and Uses
```

### 10. `s0k`

**原文（中）**

```text
第 0 步 · 钩子
```

**原文（英）**

```text
Step 0 · The Hook
```

**问题**：导航／步骤标签依赖“钩子、笨办法、拔河”等修辞，或让“二维”被理解成平面运动；改为可预期的学习任务。

**改后（中）**

```text
第 0 步 · 从测量估位置
```

**改后（英）**

```text
Step 0 · Estimate a Position
```

### 11. `s1k`

**原文（中）**

```text
第 1 步 · 两种笨办法
```

**原文（英）**

```text
Step 1 · Two Naive Fixes
```

**问题**：导航／步骤标签依赖“钩子、笨办法、拔河”等修辞，或让“二维”被理解成平面运动；改为可预期的学习任务。

**改后（中）**

```text
第 1 步 · 比较两种简单方法
```

**改后（英）**

```text
Step 1 · Compare Two Simple Methods
```

### 12. `s3k`

**原文（中）**

```text
第 3 步 · K 的拔河
```

**原文（英）**

```text
Step 3 · The Q–R Tug-of-War
```

**问题**：导航／步骤标签依赖“钩子、笨办法、拔河”等修辞，或让“二维”被理解成平面运动；改为可预期的学习任务。

**改后（中）**

```text
第 3 步 · 调整 Q 与 R
```

**改后（英）**

```text
Step 3 · Adjust Q and R
```

### 13. `s5k`

**原文（中）**

```text
第 5 步 · 二维追踪
```

**原文（英）**

```text
Step 5 · Tracking in 2D
```

**问题**：导航／步骤标签依赖“钩子、笨办法、拔河”等修辞，或让“二维”被理解成平面运动；改为可预期的学习任务。

**改后（中）**

```text
第 5 步 · 同时估位置与速度
```

**改后（英）**

```text
Step 5 · Estimate Position and Velocity
```

### 14. `lgTruth`

**原文（中）**

```text
真路（真值）
```

**原文（英）**

```text
Truth (hidden path)
```

**问题**：“真路”容易把位置随时间的图误读为空间路线。用真实位置对应纵轴。

**改后（中）**

```text
真实位置
```

**改后（英）**

```text
True position
```

### 15. `s0t`

**原文（中）**

```text
十字标全在抖，真路在哪
```

**原文（英）**

```text
The crosses jitter — where is the true path?
```

**问题**：“真路”容易把位置随时间的图误读为空间路线。用真实位置对应纵轴。

**改后（中）**

```text
读数在抖，实际位置在哪里？
```

**改后（英）**

```text
The readings jitter. Where is the object?
```

### 16. `s0e`

**原文（中）**

```text
一个点正沿着一条<strong>看不见的真路</strong>运动，你能拿到的只有带噪声的测量——图上的十字标，抖得厉害。先凭眼睛猜：真路大概在哪？然后点「运行卡尔曼」，看一条平滑的估计线怎样浮现；最后揭晓真路，当场对账。你的手机 GPS 每一秒都在解这同一道题。
```

**原文（英）**

```text
A point is moving along a <strong>path you cannot see</strong>. All you get are noisy measurements — the crosses on the plot, jittering badly. Guess with your eyes first: where does the true path run? Then press “Run the Kalman filter” and watch a smooth estimate emerge; finally, reveal the truth and settle the score. Your phone’s GPS solves this exact problem every second.
```

**问题**：没有交代坐标轴，空间路线与时间序列混淆；“平滑”暗示一定准确；“GPS 每秒解同一道题”把类比说成实现事实。补问题、噪声定义与读图方法。

**改后（中）**

```text
这一步要回答：<strong>带误差的测量，能帮我们更准地估计位置吗？</strong>一个点沿直线移动。图的横轴是时间步，纵轴是位置；十字标是每次测到的位置。测量会随机偏离真实位置，这种随机误差叫噪声。先猜真实位置随时间怎样变化，再点「运行卡尔曼」。最后点「揭晓真实位置」，比较估计和真值。手机定位也要处理类似问题，但实际系统更复杂。
```

**改后（英）**

```text
The question: <strong>can noisy readings give us a better estimate of position?</strong> An object moves along a straight line. The horizontal axis shows time steps; the vertical axis shows position. Each cross is a sensor reading. Readings differ randomly from the true position; this random error is called noise. Guess how the position changes, then press “Run the Kalman filter”. Reveal the true position to check the estimate. Phone navigation faces a similar, more complex problem.
```

### 17. `s0reveal`

**原文（中）**

```text
揭晓真路
```

**原文（英）**

```text
Reveal the truth
```

**问题**：按钮与正文统一称呼，避免“真路／truth”的指代歧义。

**改后（中）**

```text
揭晓真实位置
```

**改后（英）**

```text
Reveal the true position
```

### 18. `s0ro0`

**原文（中）**

```text
还没运行。图上只有测量十字标（噪声 σ = 1.0）；真路藏着，估计还没生成。
```

**原文（英）**

```text
Not run yet. The plot shows only the measurement crosses (noise σ = 1.0); the truth is hidden and no estimate exists.
```

**问题**：σ 首次出现无定义，读者可能误当最大误差。

**改后（中）**

```text
尚未运行。十字标是位置测量，真实位置暂未显示。噪声 σ = 1.0；σ 是标准差，表示随机误差的典型大小，不是误差上限。
```

**改后（英）**

```text
Not run yet. The crosses are position readings; the true positions are hidden. Noise σ = 1.0. Here σ is the standard deviation: a measure of typical error size, not a maximum error.
```

### 19. `s0roRun`

**原文（中）**

```text
估计线（青）已生成。它到底准不准？点「揭晓真路」，两条 RMSE 当场对账。
```

**原文（英）**

```text
The estimate (cyan) is drawn. How good is it, really? Press “Reveal the truth” and compare the two RMSEs on the spot.
```

**问题**：RMSE 未解释就用于“对账”；补算法含义、量纲与优劣方向。

**改后（中）**

```text
青色估计线已生成。点「揭晓真实位置」，比较 RMSE（均方根误差）：把每次误差平方、求平均，再开平方；它与位置同单位，越小越准。
```

**改后（英）**

```text
The cyan estimate is ready. Reveal the true position to compare RMSE (root mean square error): square each error, average the squares, then take the square root. It has the same units as position; smaller is better.
```

### 20. `s0roDone`

**原文（中）**

```text
对账（同一批 90 个点）：原始测量的 RMSE = <span>{rm}</span> · 卡尔曼估计的 RMSE = <span>{rk}</span>——估计把误差压到了原始的约 {pct}%。它凭什么？第 2 步把这台秤拆开给你看。
```

**原文（英）**

```text
The reckoning (same 90 points): raw-measurement RMSE = <span>{rm}</span> · Kalman-estimate RMSE = <span>{rk}</span> — the estimate cuts the error to about {pct}% of the raw one. How? Step 2 takes the scale apart.
```

**问题**：“误差压到”没明确是哪种误差，也易把单次结果当性能保证。读数明确统计范围与指标。

**改后（中）**

```text
这批 90 个点的 RMSE：原始测量 = <span>{rm}</span> · 卡尔曼估计 = <span>{rk}</span>。估计的 RMSE 约为原始测量的 {pct}%。这是本批数据的结果；第 2 步解释怎样算出估计。
```

**改后（英）**

```text
RMSE over the same 90 points: raw readings = <span>{rm}</span> · Kalman estimate = <span>{rk}</span>. The estimate has about {pct}% of the raw readings’ RMSE. This result applies to this dataset. Step 2 shows how the estimate is calculated.
```

### 21. `s0hint`

**原文（中）**

```text
先把口径说清（全页通用）：真路是随机游走（每步扰动 σ = 0.25），并在第 45 步突然跳变 +3；测量 = 真值 + 高斯噪声（σ = 1.0）。数据由种子 7 的伪随机数生成，任何人都能复算。第 0 步的滤波器用 Q = 0.0625、R = 1——恰好是真值的噪声参数；第 3 步你会看到，参数给错时这台秤怎样失灵。
```

**原文（英）**

```text
Ground rules, stated once for the whole page: the truth is a random walk (per-step jitter σ = 0.25) that jumps by +3 at step 45; measurements are truth plus Gaussian noise (σ = 1.0). The data comes from a seeded generator (seed 7), so anyone can reproduce it exactly. The step-0 filter uses Q = 0.0625 and R = 1 — exactly the truth’s noise parameters. In step 3 you will see what happens when those are declared wrong.
```

**问题**：“全页通用”与后续不同场景矛盾；随机游走、高斯、种子、Q/R 无定义；“恰好是真值参数”忽略突变不在模型内。改成本场景说明并区分随机噪声与突变。

**改后（中）**

```text
本场景的数据这样生成：真实位置每步加一个随机扰动（σ = 0.25），称为随机游走；第 45 步另加一次 +3 的突变。测量 = 真值 + 高斯噪声（σ = 1.0）；高斯噪声通常偏得少，偶尔偏得多，正负对称。随机数种子为 7，即固定生成起点，重跑可得同一批数据。第 0 步设 Q = 0.0625、R = 1：Q 是模型每步未能预测的扰动方差，R 是测量误差方差。方差是标准差的平方。这些参数匹配随机噪声，但模型未预知那次突变；第 3 步会换场景调参数。
```

**改后（英）**

```text
For this scene, each true position is the previous one plus a random change (σ = 0.25): a random walk. At step 45, an extra +3 jump is added. Each measurement is truth plus Gaussian noise (σ = 1.0): small errors are more common than large ones, with positive and negative errors equally likely. Seed 7 fixes the random generator’s starting point so the data can be reproduced. The step-0 filter uses Q = 0.0625 and R = 1. Q is the variance of the change the model cannot predict; R is the measurement-error variance. Variance is standard deviation squared. These settings match the random noise, but do not anticipate the jump. Step 3 uses a different scene to explore tuning.
```

### 22. `s1t`

**原文（中）**

```text
直接信，或者抹平——各输在哪
```

**原文（英）**

```text
Trust it raw, or smooth it flat — each loses its own way
```

**问题**：“各输在哪”预设方法低劣，没有建立比较问题。

**改后（中）**

```text
取平均以后，为什么还会跟不上？
```

**改后（英）**

```text
Why can an average lag behind?
```

### 23. `s1e`

**原文（中）**

```text
同一批数据，先试两种不用动脑的策略。<strong>策略 A：直接用测量</strong>——不迟到，但把噪声原样端上来，抖。<strong>策略 B：滑动平均</strong>（拿最近 W 个测量取平均）——抖是压下去了，可真路在第 45 步跳变时，它要花 W 步才慢慢爬过去，滞后写在脸上。两条策略的「信测量多少」都是<strong>写死的</strong>：A 永远全信，B 永远信 1/W。
```

**原文（英）**

```text
Same data, two strategies that require no thought. <strong>Strategy A: use the measurements as-is</strong> — never late, but the noise is served untouched: jitter. <strong>Strategy B: a moving average</strong> over the last W measurements — the jitter is ironed out, but when the truth jumps at step 45 the average needs W steps to crawl over: lag, written on its face. Both strategies have their trust <strong>hard-wired</strong>: A always trusts fully; B always trusts 1/W.
```

**问题**：“不用动脑／笨”贬低有效基线；“B 永远信 1/W”混淆单点权重与总体信任，且遗漏启动窗口。解释平滑与滞后的原因。

**改后（中）**

```text
这一步要回答：<strong>直接用测量，和先取平均，各有什么代价？</strong>仍看上一批数据。直接用测量，能立刻反映变化，也会保留全部测量噪声。滑动平均是取最近 W 个测量的平均值：随机误差能相互抵消一些，但旧位置也会混进结果。第 45 步突变后，窗口要经过 W 步才完全换成突变后的测量。窗口装满后，每个测量的权重都是 1/W；开始时数据不足，就对已有测量取平均。
```

**改后（英）**

```text
The question: <strong>what do we gain and lose by averaging the readings?</strong> Use the same data as before. A raw reading responds immediately to a change, but includes all the sensor noise. A moving average takes the mean of the latest W readings. Some random errors cancel, but older positions remain in the result. After the jump at step 45, it takes W steps for the window to contain only readings from after the jump. Once the window is full, each reading has weight 1/W; at the start, we average the readings available.
```

### 24. `s1wLab`

**原文（中）**

```text
W · 滑动平均的窗宽
```

**原文（英）**

```text
W · moving-average window
```

**问题**：“窗宽”无实体指代；改为控件直接操作的数量。

**改后（中）**

```text
W · 平均最近多少个测量
```

**改后（英）**

```text
W · number of recent readings to average
```

### 25. `s1showKf`

**原文（中）**

```text
卡尔曼（先露个脸）
```

**原文（英）**

```text
Kalman (a first glimpse)
```

**问题**：“先露个脸”不说明曲线代表什么。

**改后（中）**

```text
卡尔曼估计
```

**改后（英）**

```text
Kalman estimate
```

### 26. `s1ro`

**原文（中）**

```text
对真值的 RMSE：原始测量 = <span>{rr}</span> · 滑动平均（W = {w}）= <span>{rm}</span> · 卡尔曼 = <span>{rk}</span>（同一批数据、同一条真路）
```

**原文（英）**

```text
RMSE against the truth: raw measurements = <span>{rr}</span> · moving average (W = {w}) = <span>{rm}</span> · Kalman = <span>{rk}</span> (same data, same hidden path)
```

**问题**：读数补比较对象、统计口径和优劣方向。

**改后（中）**

```text
同一批数据的位置 RMSE（越小越准）：原始测量 = <span>{rr}</span> · 滑动平均（W = {w}）= <span>{rm}</span> · 卡尔曼估计 = <span>{rk}</span>
```

**改后（英）**

```text
Position RMSE on the same data (smaller is better): raw readings = <span>{rr}</span> · moving average (W = {w}) = <span>{rm}</span> · Kalman estimate = <span>{rk}</span>
```

### 27. `s1hint`

**原文（中）**

```text
拖一拖 W：窗越大越平滑、跳变处爬得越慢——平滑与滞后是同一枚硬币。卡尔曼的权重不是写死的：它随「预测有多不确定」实时变化（下一步看它怎样呼吸）。在这个场景里它同时赢了两条笨办法；但这不是保证书——第 3 步把参数调拧，它照样输给你看。
```

**原文（英）**

```text
Drag W: a wider window is smoother and slower over the jump — smoothness and lag are the same coin. The Kalman weight is not hard-wired: it moves with how uncertain the prediction currently is (watch it breathe in the next step). On this scenario it beats both naive fixes at once — but that is no blanket guarantee: tune its parameters wrong in step 3 and it will lose in front of you.
```

**问题**：“同时赢两条”未限定可变 W；“实时变化／呼吸”暗示持续自适应。改为操作、观察、判据，并预告权重可稳定。

**改后（中）**

```text
先增大 W，观察曲线是否更平滑，以及第 45 步之后是否更慢跟上。再减小 W，对照 RMSE 读数。平滑程度和准确程度要分开看；不同 W 可能改变方法的排名。卡尔曼用预测与测量各自的不确定度计算新测量的权重，下一步会拆开这个计算；权重也可能逐渐稳定。
```

**改后（英）**

```text
Increase W and look for less jitter and a slower response after step 45. Then reduce W and compare the RMSE values. Judge smoothness and accuracy separately; changing W can change which method ranks best. A Kalman filter calculates the new reading’s weight from prediction and measurement uncertainty. We unpack that calculation next. The weight can also settle to a constant.
```

### 28. `s2t`

**原文（中）**

```text
一步一步跳给你看：钟的呼吸
```

**原文（英）**

```text
One step at a time: watch the bell breathe
```

**问题**：“钟的呼吸”没有说明学习目标，中文“钟”也易误读为时钟。

**改后（中）**

```text
新测量来了，预测该改多少？
```

**改后（英）**

```text
How much should a new reading change the prediction?
```

### 29. `s2e`

**原文（中）**

```text
卡尔曼记的不是一个数，而是一口<strong>高斯钟</strong>：中心是估计 x̂，胖瘦是不确定度 P。一步分两半：<strong>预测</strong>——按模型往前走，钟只会变胖（P 加上过程噪声 Q）；<strong>更新</strong>——新测量 z 到了（它自己也是一口钟，胖瘦由 R 定），两口钟按精度加权合成一口更瘦的后验钟，权重就是 <strong>K</strong>。下面单步推进，一步一停，数字全印在公式行下面（Q = 0.0625，R = 1，与第 0 步同一台滤波器）。
```

**原文（英）**

```text
A Kalman filter does not remember a number; it remembers a <strong>Gaussian bell</strong>: the centre is the estimate x̂, the width is the uncertainty P. Each step has two halves. <strong>Predict</strong> — step forward with the model, and the bell can only fatten (P grows by the process noise Q). <strong>Update</strong> — a new measurement z arrives (it is a bell too, its width set by R), and the two bells merge, precision-weighted, into a thinner posterior bell; the weight is <strong>K</strong>. Step through it below, one half-step at a time, with every number printed (Q = 0.0625, R = 1 — the same filter as step 0).
```

**问题**：一段塞入高斯、后验、精度与 K；P 被当作几何宽度；预测位置不变却没有模型解释。按问题→保存什么→预测→修正铺开，定义符号，并说明适用本模型。

**改后（中）**

```text
这一步要回答：<strong>拿到新测量后，位置估计该改多少？</strong>滤波器保存位置估计 x̂，以及估计误差的方差 P；P 越大，表示它认为估计越不确定。图中的高斯曲线是钟形的，横轴是可能的位置，曲线越高表示附近的位置越可能；中心是 x̂，宽度由标准差 √P 决定。<strong>先预测：</strong>本模型假设下一位置平均不变，所以 x̂⁻ 沿用 x̂，但 P 要加上扰动方差 Q；上标 ⁻ 表示尚未用新测量。<strong>再更新：</strong>z 是新测量，R 是它的误差方差。K 叫卡尔曼增益，表示朝 z 修正多大比例。更新后的估计称为后验，供下一轮继续预测。下面用 Q = 0.0625、R = 1，与第 0 步相同。公式依次回答：预测是什么、修正比例多大、更新后得到什么。
```

**改后（英）**

```text
The question: <strong>how much should a new reading change our position estimate?</strong> The filter stores an estimate x̂ and an error variance P. A larger P means the filter considers its estimate less certain. Each Gaussian curve is bell-shaped: its horizontal axis is possible position, and a higher curve means nearby positions are more likely. Its centre is x̂ and its width is set by the standard deviation √P. <strong>Predict:</strong> this model assumes no average change in position, so x̂⁻ stays at x̂ while P grows by the disturbance variance Q. The superscript ⁻ means “before using the new reading”. <strong>Update:</strong> z is the new reading and R its error variance. The Kalman gain K is the fraction of the gap to z that we correct. The updated estimate, called the posterior, feeds the next prediction. We use Q = 0.0625 and R = 1, as in step 0. The formulas give the prediction, the correction fraction, and the updated result, in that order.
```

### 30. `s2roInit`

**原文（中）**

```text
起点：拿第一个测量当初始估计 x̂ = z[0] = <span>{x0}</span>，P₀ = 1。点「预测一步」开始第 1 步。
```

**原文（英）**

```text
Start: take the first measurement as the initial estimate, x̂ = z[0] = <span>{x0}</span>, P₀ = 1. Press “Predict one step” to begin step 1.
```

**问题**：初始 P 是设定值，原文未说明下标含义。

**改后（中）**

```text
初始位置估计取第一个测量：x̂ = z[0] = <span>{x0}</span>。初始误差方差 P₀ = 1；下标 ₀ 表示起点。点「预测一步」，开始第 1 步。
```

**改后（英）**

```text
Start with the first reading as the position estimate: x̂ = z[0] = <span>{x0}</span>. The initial error variance is P₀ = 1; the subscript ₀ marks the starting value. Press “Predict one step” to begin step 1.
```

### 31. `s2roPred`

**原文（中）**

```text
预测（走向第 {k} 步）：先变胖——x̂⁻ = <span>{xp}</span>，P⁻ = P + Q = <span>{pp}</span>（√P⁻ = {sp}）。图上青钟是预测，灰钟是上一步留下的后验。点「用测量更新」，把 z[{k}] 请进来。
```

**原文（英）**

```text
Predict (toward step {k}): fatten first — x̂⁻ = <span>{xp}</span>, P⁻ = P + Q = <span>{pp}</span> (√P⁻ = {sp}). The cyan bell is the prediction; the grey one is last step’s posterior. Now press “Update” and let z[{k}] in.
```

**问题**：“先变胖”隐藏实际变化量，√P 未说明含义。读数解释位置不变而方差增加。

**改后（中）**

```text
第 {k} 步预测：位置估计仍为 x̂⁻ = <span>{xp}</span>；误差方差增至 P⁻ = P + Q = <span>{pp}</span>，对应标准差 √P⁻ = {sp}。青色曲线是预测，灰色是上次更新后的估计。点「用测量更新」，加入 z[{k}]。
```

**改后（英）**

```text
Prediction for step {k}: the position estimate stays at x̂⁻ = <span>{xp}</span>. Error variance grows to P⁻ = P + Q = <span>{pp}</span>, giving standard deviation √P⁻ = {sp}. Cyan is the prediction; grey is the previous updated estimate. Press “Update with the measurement” to use z[{k}].
```

### 32. `s2roUpd`

**原文（中）**

```text
更新：K = P⁻ / (P⁻ + R) = <span>{K}</span> · 残差 z − x̂⁻ = <span>{res}</span> · x̂ = <span>{x}</span>，P = (1 − K)·P⁻ = <span>{p}</span>。后验钟（绿）比预测钟瘦，并被橙色的测量钟（中心 z = {z}）拉过去约 {kpct}%。
```

**原文（英）**

```text
Update: K = P⁻ / (P⁻ + R) = <span>{K}</span> · innovation z − x̂⁻ = <span>{res}</span> · x̂ = <span>{x}</span>, P = (1 − K)·P⁻ = <span>{p}</span>. The posterior bell (green) is thinner than the prediction and has been pulled about {kpct}% of the way toward the orange measurement bell (centred at z = {z}).
```

**问题**：残差／innovation 未定义，“拉过去百分比”未说明是距离比例；把测量本身当随机状态分布。明确修正量与测量支持曲线的解释。

**改后（中）**

```text
这次修正多少？K = P⁻ / (P⁻ + R) = <span>{K}</span>。测量与预测的差（残差）z − x̂⁻ = <span>{res}</span>。修正后 x̂ = <span>{x}</span>；误差方差降为 P = (1 − K)·P⁻ = <span>{p}</span>。绿色是更新后的分布；橙色以测量 z = {z} 为中心，表示不同位置对这次测量的支持程度，宽度由 R 决定。更新把估计沿预测与测量之差移动了约 {kpct}%。
```

**改后（英）**

```text
How far do we correct? K = P⁻ / (P⁻ + R) = <span>{K}</span>. The measurement minus the prediction, called the innovation, is z − x̂⁻ = <span>{res}</span>. The corrected estimate is x̂ = <span>{x}</span>. Error variance falls to P = (1 − K)·P⁻ = <span>{p}</span>. Green is the updated distribution. The estimate moves about {kpct}% of the gap from prediction to reading. Orange is centred on the reading z = {z}: it shows how well each possible position explains this reading, with width set by R.
```

### 33. `s2roDone`

**原文（中）**

```text
已经走到最后一步（k = {k}）。点「重置」重来，或回到上一步的场景慢慢拖。
```

**原文（英）**

```text
That was the last step (k = {k}). Press “Reset” to go again.
```

**问题**：原中文提示回上一步“慢慢拖”，但上一步没有时间拖动控件；改为实际可用操作。

**改后（中）**

```text
已到最后一步（k = {k}）。点「重置」可重新逐步查看预测与更新。
```

**改后（英）**

```text
Last step reached (k = {k}). Press “Reset” to inspect prediction and update again.
```

### 34. `cvPost`

**原文（中）**

```text
后验（上一步的信念）
```

**原文（英）**

```text
Posterior (previous belief)
```

**问题**：图例省掉“信念、胖瘦”的二次转译，与正文阶段和分布含义对应。

**改后（中）**

```text
上次更新后的估计
```

**改后（英）**

```text
Previous updated estimate
```

### 35. `cvPred`

**原文（中）**

```text
预测钟（变胖了）
```

**原文（英）**

```text
Prediction bell (fatter)
```

**问题**：图例省掉“信念、胖瘦”的二次转译，与正文阶段和分布含义对应。

**改后（中）**

```text
预测分布
```

**改后（英）**

```text
Predicted distribution
```

### 36. `cvMeasBell`

**原文（中）**

```text
测量钟（宽由 R 定）
```

**原文（英）**

```text
Measurement bell (width from R)
```

**问题**：图例省掉“信念、胖瘦”的二次转译，与正文阶段和分布含义对应。

**改后（中）**

```text
测量支持曲线（R）
```

**改后（英）**

```text
Measurement likelihood (R)
```

### 37. `cvPostNew`

**原文（中）**

```text
后验钟（变瘦了）
```

**原文（英）**

```text
Posterior bell (thinner)
```

**问题**：图例省掉“信念、胖瘦”的二次转译，与正文阶段和分布含义对应。

**改后（中）**

```text
更新后的估计
```

**改后（英）**

```text
Updated estimate
```

### 38. `s2hint`

**原文（中）**

```text
盯着 P 的呼吸：预测时必涨（世界会自己变），更新时必落（证据总归是证据）。K 就是这口呼吸的阀门——预测越不确定（P⁻ 大），K 越大、新测量说话越响；测量越不靠谱（R 大），K 越小。下一歩把 Q、R 交到你手里。
```

**原文（英）**

```text
Watch P breathe: it always rises on prediction (the world moves on its own) and always falls on update (evidence is evidence). K is the valve on that breath — the more uncertain the prediction (large P⁻), the larger K and the louder the new measurement speaks; the less trustworthy the measurement (large R), the smaller K. Next step, the Q and R knobs are yours.
```

**问题**：“证据总归是证据／必涨必落”泛化到所有滤波；“呼吸阀门”替代因果；未区分内部方差与实际误差。写明比较条件和模型边界。

**改后（中）**

```text
先点一次预测，再点一次更新，比较曲线中心和宽度。本页这个模型在预测时增加 P，在更新时减小 P。P⁻ 越大，固定 R 下 K 越大；R 越大，固定 P⁻ 下 K 越小。但 P 是按模型计算的不确定度，不是实际误差的实时测量：即使真实位置突然跳变，它也不会因此自动增大。下一步可调 Q、R，查看参数怎样影响结果。
```

**改后（英）**

```text
Click once to predict, then once to update. Compare the curve centres and widths. In this model, prediction increases P and an update reduces it. With R fixed, a larger P⁻ gives a larger K. With P⁻ fixed, a larger R gives a smaller K. But P is uncertainty calculated from the model, not a live measurement of actual error. A surprise jump in the true position does not automatically increase P. Next, adjust Q and R to see how the settings affect the result.
```

### 39. `s3t`

**原文（中）**

```text
Q 与 R：你信模型，还是信尺子
```

**原文（英）**

```text
Q and R: do you trust the model, or the ruler?
```

**问题**：“信模型还是信尺子”只给二选一印象，没有交代控制量和作用机制。

**改后（中）**

```text
Q 与 R 怎样改变修正幅度？
```

**改后（英）**

```text
How do Q and R change the correction?
```

### 40. `s3e`

**原文（中）**

```text
换一个场景：真值先躺平、在第 40 步突然跳变 +4（灰虚线处），然后继续躺平（带每步 σ = 0.05 的小扰动），测量噪声 σ = 1。滤波器的两个旋钮：<strong>Q</strong> 是你认定的「世界有多爱变」，<strong>R</strong> 是你认定的「尺子有多不准」。恢复得好不好用两把尺量（都按定义真算）：<strong>进入步数</strong> = 阶跃后估计第一次落进真值 ±0.5 带内的步数；<strong>带内占比</strong> = 阶跃之后的全部步数里，估计待在带内的比例——光快不够，还得待得住。
```

**原文（英）**

```text
A new scene: the truth lies flat, jumps by +4 at step 40 (grey dashed line), then lies flat again (with a small per-step jitter of σ = 0.05); measurement noise is σ = 1. The filter has two knobs: <strong>Q</strong> is your declared “how much the world likes to change”, <strong>R</strong> your declared “how bad the ruler is”. Recovery is scored two ways (both computed by these definitions): <strong>entry steps</strong> — how many steps after the jump until the estimate first lands inside the ±0.5 band around the truth; <strong>in-band share</strong> — of all steps after the jump, the fraction the estimate spends inside that band. Fast is not enough; it also has to stay.
```

**问题**：“躺平”与随机游走不符；旋钮像改变真实世界；两指标的计数起点不明。明确数据固定、修改假设、当步起计及优劣方向。

**改后（中）**

```text
这一步要回答：<strong>怎样设定对预测和测量的信任，才能既跟上变化又少抖动？</strong>换一个模拟场景：真实位置缓慢随机变化（每步扰动 σ = 0.05），第 40 步突然增加 +4；灰虚线标出突变时刻，测量噪声 σ = 1。数据不随滑块改变。滑块只改滤波器的假设：<strong>Q</strong> 是模型每步未能预测的扰动方差，<strong>R</strong> 是测量误差方差。除 RMSE 外，再看两个恢复指标：<strong>进入步数</strong>是首次满足估计与真值相差不超过 ±0.5 时，距突变已过的步数；<strong>带内占比</strong>是从突变当步起，误差在此范围内的步数占比。前者越小越快，后者越大越稳。
```

**改后（英）**

```text
The question: <strong>how can we follow a change without following every bit of noise?</strong> This is a new simulated scene. The true position drifts slowly (per-step disturbance σ = 0.05), then jumps by +4 at step 40, marked by the grey dashed line. Measurement noise is σ = 1. The sliders leave the data unchanged; they change the filter’s assumptions. <strong>Q</strong> is the variance of changes the model cannot predict; <strong>R</strong> is the measurement-error variance. Alongside RMSE, compare two recovery measures. <strong>Entry steps</strong> counts elapsed steps from the jump until the estimate first lies within ±0.5 of the truth. <strong>In-band share</strong> is the fraction of steps, starting with the jump itself, that stay in that range. A smaller entry count means a faster response; a larger share means more time close to the truth.
```

### 41. `s3qLab`

**原文（中）**

```text
Q · 过程噪声（世界有多爱变）
```

**原文（英）**

```text
Q · process noise (how restless the world is)
```

**问题**：“世界多爱变”不是严格的过程噪声定义；Q 描述模型未解释的变化。

**改后（中）**

```text
Q · 每步未预测扰动的方差
```

**改后（英）**

```text
Q · variance of unpredicted changes
```

### 42. `s3rLab`

**原文（中）**

```text
R · 测量噪声（尺子有多不准）
```

**原文（英）**

```text
R · measurement noise (how bad the ruler is)
```

**问题**：“尺子多不准”未说明方差，无法与 σ 对上。

**改后（中）**

```text
R · 测量误差的方差
```

**改后（英）**

```text
R · measurement-error variance
```

### 43. `s3kLab`

**原文（中）**

```text
稳态增益 K：每来一个新测量，估计朝它挪这么多。<br>（当前 Q、R 下长跑后的收敛值——K 的来历第 4 步细看。这里印的是稳态值，本图滤波从 P₀ = 1 起跑，前几步的 K 还略有不同。）
```

**原文（英）**

```text
Steady-state gain K: how far the estimate moves toward each new measurement.<br>(The converged value for the current Q and R after a long run — where K comes from is step 4. This is the steady value; the plotted filter starts from P₀ = 1, so its first few K values differ slightly.)
```

**问题**：“挪这么多”把无量纲比例写成位置量；稳态／收敛术语互相解释，没有朴素定义。

**改后（中）**

```text
长期稳定后的增益 K：估计朝新测量移动的距离，占预测与测量之差的比例。<br>当前 Q、R 固定不变时，这个比例会逐渐稳定，称为稳态。本图从 P₀ = 1 开始，最初的 K 与这里显示的稳态值略有不同；第 4 步解释原因。
```

**改后（英）**

```text
Steady-state gain K: the fraction of the gap from prediction to new reading that the estimate moves.<br>With Q and R fixed, this fraction settles over time: its steady state. This run starts at P₀ = 1, so its early gains differ slightly from the steady value shown here. Step 4 explains why.
```

### 44. `s3ro`

**原文（中）**

```text
当前这组 Q、R：RMSE = <span>{rk}</span> · 进入步数 = <span>{entry}</span> · 带内占比 = <span>{share}</span> · 参照：原始测量 RMSE = <span>{rr}</span>
```

**原文（英）**

```text
This Q, R pair: RMSE = <span>{rk}</span> · entry steps = <span>{entry}</span> · in-band share = <span>{share}</span> · reference: raw-measurement RMSE = <span>{rr}</span>
```

**问题**：读数明确位置误差与判读方向。

**改后（中）**

```text
当前 Q、R 的结果：位置 RMSE = <span>{rk}</span> · 进入步数 = <span>{entry}</span> · 带内占比 = <span>{share}</span> · 原始测量 RMSE = <span>{rr}</span>（RMSE 越小越准）
```

**改后（英）**

```text
Results for the current Q and R: position RMSE = <span>{rk}</span> · entry steps = <span>{entry}</span> · in-band share = <span>{share}</span> · raw-reading RMSE = <span>{rr}</span> (smaller RMSE is better)
```

### 45. `s3miniRo`

**原文（中）**

```text
Q = {q}，R = {r} · K = <b>{k}</b> · RMSE <b>{rmse}</b> · 进入 <b>{entry}</b> · 带内 <b>{share}</b>
```

**原文（英）**

```text
Q = {q}, R = {r} · K = <b>{k}</b> · RMSE <b>{rmse}</b> · entry <b>{entry}</b> · in-band <b>{share}</b>
```

**问题**：备用读数模板也须统一口径，避免只改可见正文。

**改后（中）**

```text
Q = {q}，R = {r} · 稳态 K = <b>{k}</b> · 位置 RMSE <b>{rmse}</b> · 进入步数 <b>{entry}</b> · 带内占比 <b>{share}</b>
```

**改后（英）**

```text
Q = {q}, R = {r} · steady K = <b>{k}</b> · position RMSE <b>{rmse}</b> · entry steps <b>{entry}</b> · in-band share <b>{share}</b>
```

### 46. `s3pModel`

**原文（中）**

```text
信模型
```

**原文（英）**

```text
Trust the model
```

**问题**：“信模型”改为相对权重偏向，避免暗示排斥另一方。

**改后（中）**

```text
偏重模型预测
```

**改后（英）**

```text
Favour the prediction
```

### 47. `s3pBalanced`

**原文（中）**

```text
均衡
```

**原文（英）**

```text
Balanced
```

**问题**：“均衡／balanced”易被理解为普适最优或等权。

**改后（中）**

```text
折中设置
```

**改后（英）**

```text
Middle setting
```

### 48. `s3pMeas`

**原文（中）**

```text
信测量
```

**原文（英）**

```text
Trust the measurements
```

**问题**：“信模型”改为相对权重偏向，避免暗示排斥另一方。

**改后（中）**

```text
偏重新测量
```

**改后（英）**

```text
Favour new readings
```

### 49. `s3hint`

**原文（中）**

```text
三档小图是同一场景的三台滤波器，数字当场算。看左档：在这个场景里它比原始测量还差——太信模型，阶跃之后几十步都没追回来；右档 1 步就扑进带内，却只在一半的时间里待得住，另一半被噪声拽出去；中档进入不最快、待得最久、总误差最小。<strong>没有哪档是「正确答案」</strong>：Q、R 是你对世界的声明，声明错了，最优滤波也救不了你。
```

**原文（英）**

```text
The three small plots run the same scene with three declarations, all numbers computed live. Look at the left one: here it does worse than the raw measurements — it trusts the model so hard that dozens of steps after the jump it still has not caught up. The right one dives into the band in a single step, yet spends only about half its time inside it, dragged out by noise the rest of the time. The middle one enters slowest of the two that enter, stays longest, and has the smallest total error. <strong>None of them is “the correct answer”</strong>: Q and R are declarations about the world, and a wrong declaration is something no optimality can rescue.
```

**问题**：“声明错最优也救不了”没有操作路径；预设结果被写成价值判断。保留已有数值，补单变量实验和参数估计依据。

**改后（中）**

```text
先选三档预设，比较下方固定参数的小图。左档 K 小，修正慢，在这批数据中 RMSE 比原始测量还大。右档 1 步进入误差带，但只有约一半时间留在带内：反应快，也更容易跟着测量噪声抖。中档进入较慢，却在带内停留最久，RMSE 最小。再拖滑块，只改变 Q 或 R，观察主图与 K。<strong>这里的排名只适用于本场景</strong>；参数应依据模型遗漏的变化和传感器误差来估计，再用数据检验。
```

**改后（英）**

```text
Select each preset and compare the fixed examples below. The left setting has a small K and corrects slowly; on these data, its RMSE exceeds the raw readings’ RMSE. The right setting enters the error band in 1 step but stays there only about half the time: it responds quickly and follows more sensor noise. The middle setting enters more slowly, but spends the most time in the band and has the lowest RMSE. Now change only Q or only R and watch the main plot and K. <strong>This ranking belongs to this scene.</strong> Estimate the parameters from unmodelled motion and sensor errors, then check them against data.
```

### 50. `cvJump`

**原文（中）**

```text
阶跃（第 40 步）
```

**原文（英）**

```text
the jump (step 40)
```

**问题**：“阶跃”首次出现在图例仍无解释；用具体事件指代。

**改后（中）**

```text
位置突变（第 40 步）
```

**改后（英）**

```text
Position jump (step 40)
```

### 51. `s4t`

**原文（中）**

```text
跑久了，K 自己定下来
```

**原文（英）**

```text
Run it long enough and K settles itself
```

**问题**：“自己定下来”没有说明何种条件下稳定。

**改后（中）**

```text
为什么修正比例会逐渐稳定？
```

**改后（英）**

```text
Why does the correction fraction settle?
```

### 52. `s4e`

**原文（中）**

```text
把滤波器放到一条长数据上跑 300 步（Q = 0.04，R = 2），盯着 P 看：不管初值 P₀ 给多大或多小，P 都收敛到<strong>同一个固定点</strong>——因为 P 的递推只由 Q、R 决定，与数据无关。这个固定点是代数 Riccati 方程 P = (P + Q)·R / (P + Q + R) 的解，图上虚线就是它。
```

**原文（英）**

```text
Put the filter on a long run — 300 steps, Q = 0.04, R = 2 — and watch P: no matter how large or small the initial P₀, P converges to <strong>the same fixed point</strong>, because the P recursion is driven by Q and R alone, not by the data. That fixed point solves the algebraic Riccati equation P = (P + Q)·R / (P + Q + R); the dashed line is that solution.
```

**问题**：P 递推遗漏初值；固定点／Riccati 没解释在回答什么；上图对数轴无提示。先说不变条件与实验，再解释方程含义。

**改后（中）**

```text
这一步要回答：<strong>Q、R 一直不变时，K 会怎样变化？</strong>本例跑 300 步，Q = 0.04、R = 2。上图比较两种初始方差 P₀：初值不同，但更新后的 P 都逐渐接近同一个值，这叫收敛；稳定后的值称为固定点。原因是本模型的 P 只由上一步的 P、Q、R 计算，不使用测量值。固定点满足 P = (P + Q)·R / (P + Q + R)：意思是更新一轮后 P 仍不变。这是本例的代数 Riccati 方程，虚线标出它的解。上图纵轴按倍数分隔，等距不代表等差。
```

**改后（英）**

```text
The question: <strong>what happens to K when Q and R stay fixed?</strong> Run this example for 300 steps with Q = 0.04 and R = 2. The upper plot compares different initial variances P₀. Both approach the same value: they converge to a fixed point. In this model, each P is calculated from the previous P, Q and R, without using the reading itself. At the fixed point, P = (P + Q)·R / (P + Q + R): another update leaves P unchanged. This is the algebraic Riccati equation for this example; the dashed line marks its solution. The vertical axis uses a logarithmic scale: equal distances represent equal ratios, not equal differences.
```

### 53. `s4ro1`

**原文（中）**

```text
Riccati 解：P* = <span>{pss}</span>，K* = <span>{kss}</span> · 跑满 300 步：P₀ = 10 的跑到 <span>{p1}</span>，P₀ = 0.01 的跑到 <span>{p2}</span>，两者相差 <span>{dp}</span> · 把 P* 代回方程，残差 = <span>{res}</span>（浮点尾数级）
```

**原文（英）**

```text
Riccati solution: P* = <span>{pss}</span>, K* = <span>{kss}</span> · after 300 steps: starting from P₀ = 10 lands on <span>{p1}</span>, from P₀ = 0.01 on <span>{p2}</span> — a difference of <span>{dp}</span> · plugging P* back into the equation leaves a residual of <span>{res}</span> (floating-point dust)
```

**问题**：星号／残差／浮点尾数未解释；换成稳定值、两边差及有限精度。

**改后（中）**

```text
稳定值（* 表示稳态）：P* = <span>{pss}</span>，K* = <span>{kss}</span>。300 步后，P₀ = 10 得到 <span>{p1}</span>，P₀ = 0.01 得到 <span>{p2}</span>；差值 <span>{dp}</span>。将 P* 代回方程，两边差 <span>{res}</span>；微小差异来自计算机有限精度。
```

**改后（英）**

```text
Steady values (* marks steady state): P* = <span>{pss}</span>, K* = <span>{kss}</span>. After 300 steps, P₀ = 10 gives <span>{p1}</span> and P₀ = 0.01 gives <span>{p2}</span>; the difference is <span>{dp}</span>. Substituting P* into the equation leaves a difference of <span>{res}</span> between the two sides. Tiny differences reflect finite computer precision.
```

### 54. `s4ro2`

**原文（中）**

```text
等价演示：跑到第 250 步时 P 早已站稳。让一支<strong>指数平滑器</strong>（y ← y + α(z − y)，α 就取 K*）与卡尔曼站在同一个状态起跑，此后 50 步两条轨迹逐点最大差 = <span>{md}</span>。这个 0 不是量不出来：第 250 步时 P 已收敛到浮点不动点（与闭式 P* 逐位相同），卡尔曼该步的 K 与闭式 K* 也逐位相同——同状态、同增益、同输入，两条递推此后每一步都恒等，差恰为 0 是推出来的事实。
```

**原文（英）**

```text
The equivalence demo: by step 250, P has long settled. Start an <strong>exponential smoother</strong> (y ← y + α(z − y), with α set to K*) from exactly the Kalman filter’s state at step 250 and run both for 50 more steps: the largest pointwise difference between the two traces is <span>{md}</span>. That 0 is not a failure to measure: by step 250, P has converged to its floating-point fixed point (bit-for-bit the closed-form P*), and the filter’s gain K there equals the closed-form K* bit for bit — same state, same gain, same inputs — so the two recursions are identical at every later step. The difference is exactly 0 by derivation.
```

**问题**：先谈“等价／逐位相同”而没讲指数平滑是什么；大量浮点辩护遮住条件。补 y、α 定义与同起点条件，保留全部既有公式和实验数值。

**改后（中）**

```text
下图回答：稳定后的卡尔曼估计，能否用固定比例修正来复现？指数平滑就是每次都按同一比例 α 修正：y ← y + α(z − y)，y 是平滑后的估计。第 250 步让它从卡尔曼当前估计开始，设 α = K*；此后 50 步逐点最大差 = <span>{md}</span>。两者起点相同、输入相同，且本次计算中 K 已稳定到与 K* 相同的计算精度，因此曲线重合；不代表两种方法从任意起点都相同。
```

**改后（英）**

```text
The lower plot asks: can a fixed correction fraction reproduce the settled Kalman estimate? Exponential smoothing always corrects by the same fraction α: y ← y + α(z − y), where y is the smoothed estimate. At step 250, start it from the Kalman estimate and set α = K*. The largest pointwise difference over the next 50 steps is <span>{md}</span>. Both methods start together and receive the same readings. In this run, K has settled to K* at computer precision, so the curves overlap. This does not make the methods identical from arbitrary starting points.
```

### 55. `s4hint`

**原文（中）**

```text
这就是卡尔曼最动人的落点：花哨的「最优滤波」，站稳之后就是你早已会用的指数平滑——只不过平滑系数 α 不再靠手调，而是由 Q、R 算出来的。反过来也成立：如果你的世界真的平稳，卡尔曼不会比一支调对 α 的平滑器更神；它的本事在于<strong>环境变时 P 会重新呼吸</strong>（回第 2 步看）。
```

**原文（英）**

```text
This is the most quietly astonishing stop on the page: the fancy “optimal filter”, once settled, <em>is</em> the exponential smoother you already knew — except its α was never hand-tuned; it was computed from Q and R. The converse holds too: in a truly stationary world a Kalman filter is no magic beyond a well-tuned smoother. Its real talent is that when conditions change, P starts breathing again (go back to step 2 and watch).
```

**问题**：“世界平稳就等价／环境变 P 重新呼吸”是核心错误：固定模型下 P 不读测量残差。限定等价模型，明确实际运动与内部方差的因果边界。

**改后（中）**

```text
对比两张图：上图说明 P 和 K 在本例中趋于稳定，下图说明固定 K 后的位置更新就是指数平滑。稳定的 α 可以由 Q、R 算出，不必只靠试调。这个结论针对本页的一维随机游走模型；其他运动模型未必等价于这种平滑器。<strong>真实运动突然变化，不会自动改变这里的 P 或 K</strong>；要改变它们，需要调整模型、Q、R，或改变可用测量。下一步换成同时预测位置和速度的模型。
```

**改后（英）**

```text
Compare the plots. Above, P and K settle; below, updating position with a fixed K is exponential smoothing. Q and R determine the settled α. This equivalence applies to the one-dimensional random-walk model on this page; other motion models need not reduce to this smoother. <strong>A sudden change in real motion does not automatically change P or K here.</strong> Those change when the model, Q, R or available measurements change. Next we use a model that predicts both position and velocity.
```

### 56. `cvPss`

**原文（中）**

```text
Riccati 稳态 P*
```

**原文（英）**

```text
Riccati steady state P*
```

**问题**：图例以可理解的量名替代首次出现的方程名。

**改后（中）**

```text
稳定方差 P*
```

**改后（英）**

```text
Steady error variance P*
```

### 57. `s5t`

**原文（中）**

```text
估出一个没量过的量：速度
```

**原文（英）**

```text
Estimating a quantity nobody measured: velocity
```

**问题**：标题指出输入与目标的缺口。

**改后（中）**

```text
只测位置，怎样估出速度？
```

**改后（英）**

```text
How can we estimate velocity from position readings alone?
```

### 58. `s5e`

**原文（中）**

```text
升维：小车沿直线运动，状态是 [位置, 速度]。传感器<strong>只测位置</strong>（十字标，σ = 1.2），速度从没被直接量过——但滤波器照样能把它估出来，因为模型知道「位置的变化就是速度」。小车的速度分三段：匀速、突然反向（第 60 步，机动段阴影）、再加速。状态方程用的四个矩阵印在下面，dt = 1。
```

**原文（英）**

```text
One dimension up: a cart moves along a line, its state is [position, velocity]. The sensor <strong>measures position only</strong> (the crosses, σ = 1.2); velocity is never measured directly — yet the filter estimates it anyway, because the model knows position changes <em>are</em> velocity. The cart’s velocity comes in three acts: cruise, a sudden reversal (step 60, the shaded manoeuvre stretch), then faster cruise. The four matrices of the state model are printed below; dt = 1.
```

**问题**：“升维”混淆状态维数与空间维数；“位置变化就是速度”漏掉时间；未解释只测位置为何能改速度。以预测关系搭桥，定义状态、dt 和矩阵用途。

**改后（中）**

```text
这一步要回答：<strong>只测位置，能否同时估计速度？</strong>小车仍沿直线移动；这里的“二维”指状态有 [位置, 速度] 两个分量，不是平面运动。状态就是想追踪的一组量。传感器<strong>只测位置</strong>（十字标，噪声标准差 σ = 1.2）。模型暂按匀速预测：用当前位置加上速度乘以时间间隔，得到下一位置。连续位置读数能约束速度，所以修正位置时也能修正速度。这里 dt = 1，表示每步的时间间隔；速度先恒定，在第 60 步反向，随后再提速。阴影标出运动发生改变的一段。下方矩阵是把这套预测与测量关系写成数字表，不需要先掌握矩阵运算。
```

**改后（英）**

```text
The question: <strong>can we estimate velocity when the sensor measures only position?</strong> The cart still moves along a straight line. “Two-dimensional” means a state with two components, [position, velocity], rather than motion across a plane. A state is the set of quantities we want to track. The sensor <strong>measures position only</strong> (crosses; noise standard deviation σ = 1.2). The model predicts constant velocity: next position is current position plus velocity times elapsed time. Successive position readings constrain velocity, so a position correction can also correct the velocity estimate. Here dt = 1 is the time between steps. The cart starts at constant velocity, reverses at step 60, then speeds up later. The shading marks the changed-motion interval. The matrices below are tables that encode the prediction and measurement rules; you can follow the plots without knowing matrix arithmetic.
```

### 59. `s5matNote`

**原文（中）**

```text
F 推进状态，H 挑出能测的分量，Q 是过程噪声（q 缩放），R 是测量噪声方差：
```

**原文（英）**

```text
F advances the state, H picks out the measurable part, Q is the process noise (scaled by q), R the measurement-noise variance:
```

**问题**：F/H 只给动词，无具体输入输出；标量 P 突然变矩阵；Q 与小写 q 关系不清。就地定义矩阵各项，供后续读数使用。

**改后（中）**

```text
矩阵读法：F 用当前位置和速度预测下一状态；H 只取位置，与传感器对应。Q 记录模型未预测的扰动，q 控制其强度；R 是位置测量误差方差。这里 P 扩展成协方差矩阵：对角项分别是位置和速度误差的方差，非对角项表示两种误差的关联。
```

**改后（英）**

```text
Reading the matrices: F predicts the next state from position and velocity. H selects position, matching the sensor. Q describes disturbances the model cannot predict, with strength set by q; R is the position-reading error variance. P is now a covariance matrix: its diagonal entries are the position- and velocity-error variances, and its off-diagonal entries describe how those errors vary together.
```

### 60. `s5symNote`

**原文（中）**

```text
数值卫生：每步更新后把 P 对称化（取 (P + Pᵀ)/2）。复算表明，不对称量本身全程 ≤ 1.7e-16——这一步不掩盖任何数值问题，只是把浮点账做平。
```

**原文（英）**

```text
Numerical hygiene: after each update, P is symmetrised (replaced by (P + Pᵀ)/2). Recomputation shows the raw asymmetry itself never exceeds 1.7e-16 across the whole run — this step hides no numerical problem; it just keeps the floating-point books tidy.
```

**问题**：“数值卫生／账做平”模糊对称化作用；转置未解释；数值误差易与估计误差混淆。保留公式与原阈值并解释对象。

**改后（中）**

```text
实现补充：为避免计算机舍入误差破坏对称性，每次更新后用 (P + Pᵀ)/2 替换 P；Pᵀ 表示把行列互换。原始不对称量全程 ≤ 1.7e-16，是极小的数值误差，不是位置或速度的误差。
```

**改后（英）**

```text
Implementation note: after each update, P is replaced by (P + Pᵀ)/2 to remove asymmetry from computer rounding; Pᵀ swaps rows and columns. Before this correction, the asymmetry stays at or below 1.7e-16 throughout the run. This tiny numerical discrepancy is not an error in position or velocity.
```

### 61. `s5manOn`

**原文（中）**

```text
机动段：开（反向 + 加速）
```

**原文（英）**

```text
Manoeuvre: on (reversal + speedup)
```

**问题**：“机动”是新术语且控件操作不具体。

**改后（中）**

```text
改变速度：开（反向 + 加速）
```

**改后（英）**

```text
Velocity changes: on (reverse + speed up)
```

### 62. `s5manOff`

**原文（中）**

```text
机动段：关（全程匀速）
```

**原文（英）**

```text
Manoeuvre: off (constant velocity)
```

**问题**：“机动”是新术语且控件操作不具体。

**改后（中）**

```text
改变速度：关（全程匀速）
```

**改后（英）**

```text
Velocity changes: off (constant velocity)
```

### 63. `s5eOff`

**原文（中）**

```text
升维：小车沿直线运动，状态是 [位置, 速度]。传感器<strong>只测位置</strong>（十字标，σ = 1.2），速度从没被直接量过——但滤波器照样能把它估出来，因为模型知道「位置的变化就是速度」。<strong>机动段已关</strong>：小车全程匀速（速度恒为 0.35），现实与「匀速模型」严丝合缝；测量噪声还是同一种子抽出的同一串，只换真值剖面——和机动开启时对照着看。状态方程用的四个矩阵印在下面，dt = 1。
```

**原文（英）**

```text
One dimension up: a cart moves along a line, its state is [position, velocity]. The sensor <strong>measures position only</strong> (the crosses, σ = 1.2); velocity is never measured directly — yet the filter estimates it anyway, because the model knows position changes <em>are</em> velocity. <strong>Manoeuvre off</strong>: the cart cruises at one constant velocity (0.35 throughout), so reality and the constant-velocity model agree exactly; the measurement noise is the same sequence drawn from the same seed — only the truth profile changed. Compare it with the manoeuvre-on run. The four matrices of the state model are printed below; dt = 1.
```

**问题**：另一模式会替换正文，不能依赖默认模式已解释术语。同步补问题、状态、速度关系与受控对照。

**改后（中）**

```text
这一步要回答：<strong>只测位置，能否同时估计速度？</strong>小车沿直线移动，状态 [位置, 速度] 是要追踪的两个量；“二维”指这两个分量。传感器<strong>只测位置</strong>（噪声标准差 σ = 1.2）。匀速模型用当前位置加上速度乘以时间间隔，预测下一位置；连续位置读数也能约束速度。<strong>速度变化已关闭</strong>：小车全程速度为 0.35，符合匀速假设。测量噪声与开启时是同一种子生成的同一串，只改变真实运动。切换按钮可比较模型符合或不符合运动时的表现。下方矩阵记录预测与测量关系；dt = 1 是每步的时间间隔。
```

**改后（英）**

```text
The question: <strong>can we estimate velocity from position readings alone?</strong> The cart moves along a line. Its state [position, velocity] contains the two quantities we track; this is the sense of “two-dimensional” here. The sensor <strong>measures position only</strong> (noise standard deviation σ = 1.2). The constant-velocity model predicts next position as current position plus velocity times elapsed time. Successive position readings also constrain velocity. <strong>Velocity changes are off:</strong> the cart travels at 0.35 throughout, matching the model’s assumption. Sensor noise is the same seeded sequence used with changes on; only the true motion differs. Toggle the buttons to compare when the model fits the motion and when it does not. The matrices below encode prediction and measurement; dt = 1 is the time between steps.
```

### 64. `s5qLab`

**原文（中）**

```text
q · 过程噪声强度（小车有多「野」）
```

**原文（英）**

```text
q · process-noise strength (how wild the cart is)
```

**问题**：“小车有多野”把模型参数当作真实运动变化开关。

**改后（中）**

```text
q · 模型未预测扰动的强度
```

**改后（英）**

```text
q · strength of unmodelled disturbances
```

### 65. `s5pSmall`

**原文（中）**

```text
q = 0.0005 · 太信模型
```

**原文（英）**

```text
q = 0.0005 · trust the model too much
```

**问题**：“太信”预设参数错误，与关闭机动后该档最优的说明冲突。改为描述参数假设。

**改后（中）**

```text
q = 0.0005 · 少允许速度变化
```

**改后（英）**

```text
q = 0.0005 · expect little velocity change
```

### 66. `s5pMid`

**原文（中）**

```text
q = 0.02 · 适中
```

**原文（英）**

```text
q = 0.02 · moderate
```

**问题**：“太信”预设参数错误，与关闭机动后该档最优的说明冲突。改为描述参数假设。

**改后（中）**

```text
q = 0.02 · 中等扰动强度
```

**改后（英）**

```text
q = 0.02 · moderate disturbance strength
```

### 67. `s5pBig`

**原文（中）**

```text
q = 0.2 · 太信测量
```

**原文（英）**

```text
q = 0.2 · trust the measurements too much
```

**问题**：“太信”预设参数错误，与关闭机动后该档最优的说明冲突。改为描述参数假设。

**改后（中）**

```text
q = 0.2 · 多允许速度变化
```

**改后（英）**

```text
q = 0.2 · allow more velocity change
```

### 68. `s5ro`

**原文（中）**

```text
位置 RMSE = <span>{rp}</span> · 速度 RMSE = <span>{rv}</span>（速度从没被测过）· 机动窗（第 60–80 步）最大位置误差 = <span>{mx}</span> · 当前协方差 P = [[{p00}, {p01}], [{p01}, {p11}]]（全程对称、对角元为正，逐步值可经 window.KALMAN 查）
```

**原文（英）**

```text
Position RMSE = <span>{rp}</span> · velocity RMSE = <span>{rv}</span> (velocity is never measured) · largest position error in the manoeuvre window (steps 60–80) = <span>{mx}</span> · current covariance P = [[{p00}, {p01}], [{p01}, {p11}]] (symmetric, with positive diagonal, at every step — step-by-step values are exposed via window.KALMAN)
```

**问题**：“当前”误导为动画时刻，代码实际输出最后一步；P 与 RMSE 混排未区分内外误差；“机动窗”与图中阴影范围不同。明确统计范围和最终 P。

**改后（中）**

```text
全程位置 RMSE = <span>{rp}</span> · 全程速度 RMSE = <span>{rv}</span>（速度只由位置读数推断）。第 60–80 步最大位置误差 = <span>{mx}</span>。最后一步的协方差矩阵 P = [[{p00}, {p01}], [{p01}, {p11}]]；它表示模型计算的不确定度，不是上面的实际误差。全程矩阵对称、对角项为正；逐步值可经 window.KALMAN 查。
```

**改后（英）**

```text
Position RMSE over the full run = <span>{rp}</span> · velocity RMSE = <span>{rv}</span> (velocity is inferred from position readings). Largest position error during steps 60–80 = <span>{mx}</span>. Final error covariance P = [[{p00}, {p01}], [{p01}, {p11}]]. It describes uncertainty calculated by the model, rather than the actual errors above. All matrices are symmetric with positive diagonal entries; step-by-step values are available via window.KALMAN.
```

### 69. `s5roOff`

**原文（中）**

```text
位置 RMSE = <span>{rp}</span> · 速度 RMSE = <span>{rv}</span>（速度从没被测过）· 当前协方差 P = [[{p00}, {p01}], [{p01}, {p11}]]（全程对称、对角元为正，逐步值可经 window.KALMAN 查）
```

**原文（英）**

```text
Position RMSE = <span>{rp}</span> · velocity RMSE = <span>{rv}</span> (velocity is never measured) · current covariance P = [[{p00}, {p01}], [{p01}, {p11}]] (symmetric, with positive diagonal, at every step — step-by-step values are exposed via window.KALMAN)
```

**问题**：“当前”误导为动画时刻，代码实际输出最后一步；P 与 RMSE 混排未区分内外误差；“机动窗”与图中阴影范围不同。明确统计范围和最终 P。

**改后（中）**

```text
全程位置 RMSE = <span>{rp}</span> · 全程速度 RMSE = <span>{rv}</span>（速度只由位置读数推断）。最后一步的协方差矩阵 P = [[{p00}, {p01}], [{p01}, {p11}]]；它表示模型计算的不确定度。全程矩阵对称、对角项为正；逐步值可经 window.KALMAN 查。
```

**改后（英）**

```text
Position RMSE over the full run = <span>{rp}</span> · velocity RMSE = <span>{rv}</span> (velocity is inferred from position readings). Final error covariance P = [[{p00}, {p01}], [{p01}, {p11}]]. It describes uncertainty calculated by the model. All matrices are symmetric with positive diagonal entries; step-by-step values are available via window.KALMAN.
```

### 70. `s5hint`

**原文（中）**

```text
第 3 步的拔河在二维重演：q 给得太小，滤波器笃信「匀速」，小车一反向就被拖出 2 以上的误差；q 给得太大，它又把测量噪声当成速度的抖动往回捞。中间那档在这个场景里总误差最小。真实导航里没有「正确」的 q——只有对运动烈度的诚实估计。
```

**原文（英）**

```text
Step 3’s tug-of-war, replayed in 2D: with q too small the filter is so sure of “constant velocity” that the reversal drags it past 2 units of error; with q too large it starts mistaking measurement noise for changes in velocity and hauls that noise aboard. The middle setting has the smallest total error on this scene. Out in real navigation there is no “correct” q — only an honest estimate of how violent the motion is.
```

**问题**：“二维拔河／运动烈度”仍无模型偏差含义；“无正确 q”过于绝对。补受控对照和参数选择依据，保留既有误差数值。

**改后（中）**

```text
先比较三档 q，再关闭速度变化，看看排名是否改变。在速度变化开启的本批数据中，q 太小会让滤波器修正速度较慢，反向后位置误差可超过 2；q 太大则让测量噪声引起更大的估计波动。中档总误差较小。q 不会改变小车的真实运动，只改变滤波器允许模型出错的程度；应根据实际运动偏离匀速假设的程度估计，并用数据检验。
```

**改后（英）**

```text
Compare the three q presets, then turn velocity changes off and check whether their ranking changes. With changes on in this dataset, a small q makes velocity corrections slow; after the reversal, position error can exceed 2. A large q makes the estimate respond more strongly to sensor noise. The middle preset has lower overall error. q does not change the cart’s motion. It changes how much error the filter allows in its motion model. Estimate it from departures from constant velocity, then check against data.
```

### 71. `s5hintOff`

**原文（中）**

```text
现实不拐弯时，「太信模型」这一档在这个场景里反而最准——因为模型这次说的就是真话。机动开启时的滞后不是滤波器笨，是真值在第 60、110 步背着模型改了主意。q 的正确大小从来不在滤波器里，在你对现实有多守规矩的判断里。
```

**原文（英）**

```text
When reality never turns, the “trust the model too much” preset is the most accurate one on this scene — because this time the model is simply telling the truth. The lag with the manoeuvre on was not the filter being stupid; the truth changed its mind at steps 60 and 110 behind the model’s back. The right size of q never lives inside the filter; it lives in your judgement of how well-behaved reality is.
```

**问题**：“现实改主意／背着模型”不说明信息限制；补模型失配定义和同噪声比较的目的。

**改后（中）**

```text
全程匀速时，小 q 这一档在本场景里最准确，因为它的假设更符合实际运动。再打开速度变化：真速度在第 60、110 步改变，匀速模型无法提前知道，估计需要靠后续位置测量追上。两种模式的噪声相同，适合比较模型失配的影响；模型失配就是假设的运动规律与实际不符。
```

**改后（英）**

```text
With constant velocity throughout, the small-q preset is the most accurate here because its assumption fits the motion. Turn velocity changes back on: the true velocity changes at steps 60 and 110. The constant-velocity model cannot anticipate these changes and must catch up using later position readings. Both modes use the same noise, making them a useful comparison of model mismatch: the gap between assumed and actual motion.
```

### 72. `cvMan`

**原文（中）**

```text
机动段（第 60–110 步）
```

**原文（英）**

```text
Manoeuvre (steps 60–110)
```

**问题**：图例沿用“机动”术语，改成直接描述；与误差统计的较短区间明确区分。

**改后（中）**

```text
速度变化段（第 60–110 步）
```

**改后（英）**

```text
Changed-motion interval (steps 60–110)
```

### 73. `s6t`

**原文（中）**

```text
它从哪来，到哪去
```

**原文（英）**

```text
Where it comes from, where it goes
```

**问题**：终章“来路去向”过泛，改成原理与应用两个具体问题。

**改后（中）**

```text
这套更新为什么成立，又能用在哪里？
```

**改后（英）**

```text
Why does this update work, and where is it useful?
```

### 74. `s6e`

**原文（中）**

```text
收个尾。卡尔曼更新的形状，其实你在本站见过它的亲戚：<strong>贝叶斯更新</strong>。高斯先验碰上高斯似然，后验均值恰好是按<strong>精度（1/方差）加权</strong>的平均——第 2 步那口后验钟，就是这条公式在连续世界里的样子（贝叶斯页处理的是二元假设的离散亲戚，思想同源、形状不同）。而估计还有另一半：<strong>控制</strong>——没有状态估计，反馈就无从下手；把最优估计与最优控制拼起来，就是 LQG。
```

**原文（英）**

```text
To close. The shape of the Kalman update has a relative you have met on this site: <strong>Bayes’ rule</strong>. A Gaussian prior meeting a Gaussian likelihood yields a posterior whose mean is exactly the <strong>precision-weighted</strong> (1/variance) average of the two — the posterior bell of step 2 is that formula living in the continuous world. (The Bayes page works the discrete cousin — updating over binary hypotheses; same ancestry, different shape.) Estimation also has a second half: <strong>control</strong>. With no state estimate there is nothing to feed back; optimal estimation plus optimal control is LQG.
```

**问题**：假定读者看过别页；先验／似然／后验／精度／LQG 连环抛出；“无估计无反馈”过度断言。逐一定义，给加速刹车例子，限定 LQG 条件。

**改后（中）**

```text
这一步要回答：<strong>前面的加权有何依据，怎样接到真实应用？</strong>先看贝叶斯更新：用新证据修正已有判断。预测分布叫先验；似然表示不同真实位置对这次测量的支持程度；结合两者得到的分布叫后验。先验和测量误差都是高斯、且误差独立时，第 2 步的更新均值就是按精度加权的结果。精度是 1/方差：方差越小，权重越大。本站贝叶斯页用离散的二元假设展示相同的更新思想，无需先读过。再看控制：例如先估计小车位置和速度，再据此决定加速或刹车。在线性模型、二次代价和高斯噪声等条件下，卡尔曼估计可与最优控制组成 LQG（线性二次高斯控制）；二次代价指用误差和控制量的平方衡量代价。
```

**改后（英）**

```text
The question: <strong>what justifies this weighting, and how does it connect to real applications?</strong> Bayesian updating means revising an existing judgment using new evidence. The prediction distribution is the prior. The likelihood describes how well each possible true position explains the reading. Combining them gives the posterior. With a Gaussian prior and independent Gaussian measurement error, the updated mean in step 2 is a precision-weighted average. Precision is 1/variance, so a smaller variance gives more weight. The site’s Bayes page illustrates the same idea with discrete, binary hypotheses; no prior reading is needed here. For control, imagine using estimated cart position and velocity to decide when to accelerate or brake. With a linear model, quadratic costs and Gaussian noise, among other conditions, Kalman estimation can be combined with optimal control as LQG: linear-quadratic-Gaussian control. A quadratic cost penalises squared errors and control effort.
```

### 75. `s6card1`

**原文（中）**

```text
卡尔曼滤波的成名战：1960 年代它被装进阿波罗的导航计算机，用稀疏又带噪声的观测把飞船的状态一路估到月球。估计理论从此成了航天器的标准配置。
```

**原文（英）**

```text
The Kalman filter’s famous debut: in the 1960s it flew in Apollo’s navigation computer, turning sparse, noisy observations into a spacecraft state estimate all the way to the Moon. State estimation has been standard equipment on spacecraft ever since.
```

**问题**：“一路估到月球／从此标准配置”用传奇叙事替代机制，也没说用的是扩展形式。保留年代，写清预测什么、用何证据修正。

**改后（中）**

```text
在 1960 年代的阿波罗导航中，卡尔曼滤波的扩展形式用于估计飞船运动。做法与本页相通：先用运动模型预测位置和速度，再用带误差的观测修正估计。航天器运动更复杂，需要更完整的模型。
```

**改后（英）**

```text
In Apollo navigation in the 1960s, an extended form of Kalman filtering helped estimate spacecraft motion. The idea is the one explored here: predict position and velocity with a motion model, then correct the estimate with noisy observations. Spacecraft motion requires a more detailed model.
```

### 76. `s6card2`

**原文（中）**

```text
你的手机每一秒都在融合 GPS、加速度计、陀螺仪：每个传感器各有一口「钟」的胖瘦，融合就是第 2 步的加权，一遍遍地做。地图上那条稳稳贴着路走的蓝线，就是这么来的。
```

**原文（英）**

```text
Your phone fuses GPS, accelerometer and gyroscope every second: each sensor carries its own fat or thin “bell”, and fusing them is step 2’s weighting, done over and over. The blue line that glides steadily along the road on your map is exactly that.
```

**问题**：“每秒都融合／蓝线就是这么来”把可能应用冒充具体产品实现；传感器测不同物理量，不能直接视作同一位置的几个钟。解释传感器功能及模型连接。

**改后（中）**

```text
手机定位可结合 GPS 位置与惯性传感器信息：加速度计测加速度，陀螺仪测转动。把不同传感器的信息结合起来，叫传感器融合。卡尔曼类方法可先用运动信息预测，再用位置测量修正，并根据各自误差分配权重。地图蓝点还可能经过道路匹配等处理，不能仅凭它的平滑程度判断用了哪种算法。
```

**改后（英）**

```text
Phone navigation can combine GPS positions with inertial sensors: accelerometers measure acceleration, and gyroscopes measure rotation. Combining information from different sensors is called sensor fusion. Kalman-based methods can predict motion, correct it with position readings, and weight the information by its uncertainty. A map dot may also be adjusted to match nearby roads. Its smoothness alone does not reveal which algorithm produced it.
```

### 77. `s6card3`

**原文（中）**

```text
真实世界很少是线性高斯的。补救路线定性地说：EKF 把非线性在当前估计处线性化，UKF 用一组采样点穿过非线性，粒子滤波干脆养一群假设去碰运气。再往外，模型写错、野值、滤波发散，都是工程现场要另行处理的功课——本页的干净结论只在线性高斯的世界里全额成立。
```

**原文（英）**

```text
The real world is rarely linear and Gaussian. The standard escapes, qualitatively: the EKF linearises the nonlinearity around the current estimate; the UKF pushes a small set of sample points through it; particle filters keep a whole crowd of hypotheses and let luck sort them out. Beyond that, a mis-specified model, outliers and filter divergence are separate engineering battles — the clean conclusions of this page hold in full only in the linear-Gaussian world.
```

**问题**：EKF／UKF 未展开，非线性未定义；粒子滤波“碰运气”误导为随机猜测；“干净结论全额成立”没说哪条结论。解释机制并明确最小均方误差及条件。

**改后（中）**

```text
汽车转弯时，运动关系可能不再是本页这样简单的线性关系；线性指输出是输入的加权和，曲线关系则可能是非线性的。常见扩展有：扩展卡尔曼滤波 EKF，在当前估计附近用线性关系近似；无迹卡尔曼滤波 UKF，让一组有代表性的点通过非线性模型；粒子滤波，用许多候选状态及其权重近似分布，并按观测调整权重。它们都有各自的近似和代价。在线性、高斯且模型与噪声假设正确时，标准卡尔曼滤波给出最小均方误差估计。异常测量、错误模型仍可能让实际结果很差。
```

**改后（英）**

```text
A turning vehicle may need more than the simple linear relationships used here. A linear relationship expresses an output as a weighted sum of inputs; a curved relationship may be nonlinear. Common extensions include the extended Kalman filter (EKF), which uses a local linear approximation; the unscented Kalman filter (UKF), which passes representative points through the nonlinear model; and particle filters, which approximate a distribution with many candidate states and adjust their weights using observations. Each has approximation errors and computational costs. For a linear Gaussian system with correct model and noise assumptions, the standard Kalman filter gives the minimum mean-square-error estimate. Bad readings or a wrong model can still produce poor practical results.
```

### 78. `s6fin`

**原文（中）**

```text
卡尔曼滤波教的与其说是一条算法，不如说是一种<strong>诚实</strong>：永远同时报告你的答案和你的不确定；让下一个证据按权重改口；参数声明错了，就当众输给你看。这台秤拆完装回去了——下次你的手机定位在高楼之间跳来跳去，你会知道：那是它的 P 正在变胖。
```

**原文（英）**

```text
What the Kalman filter really teaches is less an algorithm than a kind of <strong>honesty</strong>: always report your answer together with your uncertainty; let the next piece of evidence revise you, weighted as it deserves; and when your declared parameters are wrong, lose in public. The scale is taken apart and put back together — next time your phone’s dot jumps around between tall buildings, you will know: that is its P, fattening.
```

**问题**：“诚实／当众输”把模型拟人化；“定位跳就是 P 变胖”是不可由现象推出的错误因果。以任务回收和输出边界结束。

**改后（中）**

```text
回到最初的定位问题：<strong>先预测位置，再按不确定度用测量修正，重复进行。</strong>本页用模拟真值检查估计是否准确；实际定位通常没有这样的答案可对照。P 报告的是模型计算的不确定度，参数或模型不合适时，它也可能过于自信。手机在高楼间定位跳动，可能涉及信号反射等多种原因，不能据此断定 P 正在增大。读算法的输出时，要同时问：估计是什么、假设是什么、实际误差如何验证。
```

**改后（英）**

```text
Return to the location problem: <strong>predict a position, correct it with a reading according to uncertainty, and repeat.</strong> Here, simulated truth lets us check accuracy. Real navigation rarely offers that answer key. P reports uncertainty calculated from the model; a poor model or poor parameters can make it overconfident. A phone location jumping between tall buildings may involve signal reflections or other problems. It does not tell us that P is growing. When reading an estimate, ask what it says, what it assumes, and how its error can be checked.
```

### 79. `s6lkB`

**原文（中）**

```text
贝叶斯更新：信念如何改口 →
```

**原文（英）**

```text
Bayesian updating: how beliefs change their mind →
```

**问题**：“信念改口”再加一层拟人比喻，改为链接对应的学习问题。

**改后（中）**

```text
贝叶斯更新：怎样用证据修正判断 →
```

**改后（英）**

```text
Bayesian updating: revise an estimate with evidence →
```

### 80. `s6lkC`

**原文（中）**

```text
反馈与控制：估计的另一半 →
```

**原文（英）**

```text
Feedback & control: the other half →
```

**问题**：“另一半”无具体关系，改为从估计到行动。

**改后（中）**

```text
反馈与控制：怎样根据估计调整行动 →
```

**改后（英）**

```text
Feedback and control: act on an estimate →
```

### 81. `s6lkL`

**原文（中）**

```text
冲激与 LTI →
```

**原文（英）**

```text
Impulse & LTI →
```

**问题**：LTI 缩写未展开；补全中文含义与英文全称。

**改后（中）**

```text
冲激与 LTI：线性时不变系统 →
```

**改后（英）**

```text
Impulse and LTI: linear time-invariant systems →
```

### HTML 后备文字

| 位置 | 原文 | 问题 | 改后 |
| --- | --- | --- | --- |
| `<title>` | 卡尔曼滤波 · 在预测与测量之间称重 | 先给隐喻，没有清楚说学习对象 | 卡尔曼滤波 · 怎样结合预测与测量 |
| `h1[data-i18n="pageTitle"]` | 卡尔曼滤波 · 称重 | 与字典标题一同改，避免初始后备标题继续使用抽象隐喻 | 卡尔曼滤波 · 用测量修正预测 |

HTML 中没有独立英文后备标题；运行时中英文标题都取自 `docTitle` 和 `pageTitle`，已同步修改。语言按钮的 `中` / `EN`、无障碍属性文字及全部属性值保持原样。

### 已审阅并保留的字符串

这些条目自身能够直接指认操作或图形对象，或其符号已由修改后的相邻正文解释。保留不代表未审阅；尤其完整保留 `s2formula` 两个语言版本中的公式。

| 键 | 原文（中） | 原文（英） | 处理 |
| --- | --- | --- | --- |
| `back` | ← 知识索引 | ← Knowledge Index | 原样保留；操作、对象或阶段含义明确。 |
| `nav2` | 2 预测—更新 | 2 Predict–Update | 原样保留；操作、对象或阶段含义明确。 |
| `start` | 开始探索 ↓ | Start exploring ↓ | 原样保留；操作、对象或阶段含义明确。 |
| `foot` | visual.integ.life · 卡尔曼滤波 Kalman Filter —— 一步一交互系列 | visual.integ.life · Kalman Filter — one interaction per step | 原样保留；操作、对象或阶段含义明确。 |
| `lgMeas` | 测量（十字标） | Measurements (crosses) | 原样保留；操作、对象或阶段含义明确。 |
| `lgEst` | 卡尔曼估计 | Kalman estimate | 原样保留；操作、对象或阶段含义明确。 |
| `lgMa` | 滑动平均 | Moving average | 原样保留；操作、对象或阶段含义明确。 |
| `lgRaw` | 原始测量 | Raw measurements | 原样保留；操作、对象或阶段含义明确。 |
| `s0run` | 运行卡尔曼 | Run the Kalman filter | 原样保留；操作、对象或阶段含义明确。 |
| `s0reset` | 重置 | Reset | 原样保留；操作、对象或阶段含义明确。 |
| `s1showRaw` | 原始测量（连线） | Raw measurements (connected) | 原样保留；操作、对象或阶段含义明确。 |
| `s1showMa` | 滑动平均 | Moving average | 原样保留；操作、对象或阶段含义明确。 |
| `s2k` | 第 2 步 · 预测—更新 | Step 2 · Predict–Update | 原样保留；操作、对象或阶段含义明确。 |
| `s2formula` | 预测：x̂⁻ = x̂ ， P⁻ = P + Q ｜ 增益：K = P⁻ / (P⁻ + R) ｜ 更新：x̂ = x̂⁻ + K·(z − x̂⁻) ， P = (1 − K)·P⁻ | Predict: x̂⁻ = x̂ , P⁻ = P + Q ｜ Gain: K = P⁻ / (P⁻ + R) ｜ Update: x̂ = x̂⁻ + K·(z − x̂⁻) , P = (1 − K)·P⁻ | 原样保留；公式前新增问题、变量和计算顺序解释。 |
| `s2nextPred` | 预测一步 → | Predict one step → | 原样保留；操作、对象或阶段含义明确。 |
| `s2nextUpd` | 用测量更新 → | Update with the measurement → | 原样保留；操作、对象或阶段含义明确。 |
| `s2play` | 连播 10 步 | Play 10 steps | 原样保留；操作、对象或阶段含义明确。 |
| `s2stop` | 停 | Stop | 原样保留；操作、对象或阶段含义明确。 |
| `s2reset` | 重置 | Reset | 原样保留；操作、对象或阶段含义明确。 |
| `s3roNever` | 始终没进入 | never entered | 原样保留；操作、对象或阶段含义明确。 |
| `s3miniK` | 稳态 K = {K} | steady K = {K} | 原样保留；由同一步的新正文解释符号、稳态或指标含义。 |
| `s3roFmt` | 进入步数 {entry} · 带内占比 {share} | entry steps: {entry} · in-band {share} | 原样保留；由同一步的新正文解释符号、稳态或指标含义。 |
| `s4k` | 第 4 步 · 稳态 | Step 4 · Steady State | 原样保留；操作、对象或阶段含义明确。 |
| `cvP10` | P[k]（P₀ = 10） | P[k] (P₀ = 10) | 原样保留；由同一步的新正文解释符号、稳态或指标含义。 |
| `cvP001` | P[k]（P₀ = 0.01） | P[k] (P₀ = 0.01) | 原样保留；由同一步的新正文解释符号、稳态或指标含义。 |
| `cvEqK` | 卡尔曼（继续递推） | Kalman (recursion continues) | 原样保留；由同一步的新正文解释符号、稳态或指标含义。 |
| `cvEqS` | 指数平滑（α = K*） | Exponential smoother (α = K*) | 原样保留；由同一步的新正文解释符号、稳态或指标含义。 |
| `cvPos` | 位置 | Position | 原样保留；操作、对象或阶段含义明确。 |
| `cvVel` | 速度 | Velocity | 原样保留；操作、对象或阶段含义明确。 |
| `lgPosTrue` | 真位置 | True position | 原样保留；操作、对象或阶段含义明确。 |
| `lgPosEst` | 估计位置 | Estimated position | 原样保留；操作、对象或阶段含义明确。 |
| `lgVelTrue` | 真速度 | True velocity | 原样保留；操作、对象或阶段含义明确。 |
| `lgVelEst` | 估计速度 | Estimated velocity | 原样保留；操作、对象或阶段含义明确。 |
| `s6k` | 第 6 步 · 终章 | Step 6 · Finale | 原样保留；操作、对象或阶段含义明确。 |
| `s6card1T` | 阿波罗导航 | Apollo navigation | 原样保留；操作、对象或阶段含义明确。 |
| `s6card2T` | 手机与传感器融合 | Phones & sensor fusion | 原样保留；操作、对象或阶段含义明确。 |
| `s6card3T` | 非线性世界 | The nonlinear world | 原样保留；操作、对象或阶段含义明确。 |

## 三、从本页看到的全站通病

以下是基于本页及 `SPEC.md` 的风险推断，没有把其他页面当作已经逐页审计过的事实。

1. **规范管了外观和双语覆盖，没有规定解释的依赖顺序。** 当前规范对切换、Canvas、主题、响应式描述很具体，却只要求“短讲解”。AI 可以交出技术合规而认知跳跃的页面。对应本页：`tagline`、`s2e`、`s6e`。
2. **把可读性误当成有趣的修辞。** 多个比喻轮番上场，每个都需要读者额外翻译；“呼吸”还制造自动适应真实错误的假机制。对应 `pageTitle`、`s2t`、`s2hint`、`s4hint`、`s6fin`。
3. **用术语链压缩了本该展示的推理。** “高斯先验→似然→后验→精度→LQG”对熟手是摘要，对新手是缺失的课程。当前“英文对标某科普风格”也无法检验这条依赖链。对应 `s2e`、`s5matNote`、`s6e`、`s6card3`。
4. **可复现和算得对，不能代替解释清楚。** 种子、浮点差、接口导出占据主叙述，读者却不知道 RMSE 回答什么、矩阵各项是什么。对应 `s0hint`、`s4ro2`、`s5symNote`、`s5ro`。
5. **动画缺少问题与观察任务。** “看看它呼吸”“拖一拖”未说明改变什么、固定什么、看哪个结果。其他交互页也可能有“能玩但学不到因果”的风险。对应 `s1hint`、`s3hint`、`s5hint`。
6. **从单次演示越界为普遍结论。** 本批数据的排名、某个模型的等价性、固定参数下的行为，被写成算法整体能力。尤其“自动适应”必须核对代码究竟读不读残差。对应 `s1hint`、`s4hint`、`s5hint`。
7. **现实、模拟、模型内量没有分层。** 真值与模拟、实际误差与内部方差、调参数与改数据、状态维数与空间维数混在一起。对应 `tagline`、`s0hint`、`s3e`、`s5e`、`s5ro`。
8. **应用故事比机制更确定。** 手机和航天轶事容易被 AI 写成“正是这个算法”“每一秒都在做”，缺少版本、条件和证据。对应 `s0e`、`s6card1`、`s6card2`、`s6fin`。
9. **英文复写中文的修辞负担。** “The Weighing”“lag, written on its face”“floating-point dust”“let luck sort them out”既不自然，也损害精确含义。双语不应是让中文隐喻在英文再演一遍。对应 `pageTitle`、`s1e`、`s4ro1`、`s6card3`。

## 四、System prompt / SPEC 可直接粘贴的条文

建议把下列整个区块加入 SPEC 的“解释清晰度硬要求”，并在系统提示中明确：这些是生成与自查的验收条件，不得仅通过宣称“已做到”来代替。先按 BRIEF 写出问题和概念依赖，再写页面；工程约束和解释约束分别检查。下面规则不要求为了满足字数上限而删除必要限定条件。

```text
## 解释清晰度硬要求（知识页生成与交付前必须逐条检查）

1. 每页开头必须给出一个具体对象、可获得的信息和想求的未知量。例如“只拿到带误差的位置读数，想估计实际位置”。每步正文的首句必须是一个具体问题：“这一步要回答：……”。该步的交互与读数必须直接服务于这个问题，不用“认识、探索、感受某概念”代替问题。

2. 写正文前先列概念依赖表，逐项记录术语或符号的首次出现位置、当场定义、所依赖的旧概念。标题、图例、提示和动态读数也算首次出现。新术语首次出现时必须附一句普通语言解释；不得在解释中再引入未定义术语。必要术语过密时，先给具体操作或例子，把专业命名延后。交付前逐项核对依赖表。

3. 每张图首次出现时，必须交代横轴、纵轴、主要标记分别表示什么；没有轴的图说明空间或编码含义。引入公式前先写它回答的问题；所有变量须在公式前或紧邻处解释。说明结果是位置、方差、比例还是其他量；不得把方差直接称为曲线宽度，也不得把比例写成位移。

4. 每个指标首次出现时，必须说明“比较谁与谁、在哪段样本上、怎样计算、单位是什么、越大还是越好”。动态读数须标清当前值、最终值、全程统计或局部区间。备用模板、终止状态和模式切换后的读数遵守同一口径，不得只解释默认状态。

5. 每个交互提示必须给出一个可执行的观察顺序：改哪个控件、保持什么不变、看哪处图或读数、用什么现象判断结果。比较因果时先建议一次只改一个量。明确控件究竟改变真实数据、模型假设还是显示方式；未实现的操作不得写进提示。

6. 比喻只能辅助已经说明的机制：首次使用须说明它对应的量或关系。同一概念不连续更换多种比喻，公式与读数回到准确量名。删除比喻后，文字仍须完整说明输入如何影响输出；不能用“呼吸、相信、诚实”等拟人词充当算法会检测、决策或自适应的证据。

7. 对“总是、必然、最优、自动、等价、会收敛”等断言，必须在同句或紧邻句列出适用条件，并对照公式或实现核验依赖关系。写“某变量因某现象变化”前，检查计算是否实际使用该现象。实测误差、模型计算的不确定度、数值舍入误差必须使用不同量名，不能相互替代。

8. 每个实验必须明确模拟或实测、哪几步共用数据、哪里更换场景。结论只覆盖实际展示的场景与参数范围；可调参数会影响排名时，提示读者对照实时读数，不写固定赢家。若演示含模型未包含的突变或其他失配，须明确指出，不能同时声称模型完全匹配现实。

9. 应用卡片必须说明“预测或处理什么、得到什么观测、如何修正或使用结果”。真实产品和历史事实使用可核查的一手来源；无法确认的具体实现改写为可能用途，不写“每个产品都是这样”“界面现象证明某内部变量变化”。讲扩展算法时至少说明它近似或处理什么，不以缩写清单或随机猜测类比替代机制。

10. 中英文分别按首次阅读路径自查，再做语义对齐：问题、定义、条件、证据强度一致，英文不照搬中文比喻或句法。验收时检查所有状态的术语定义、遗漏占位符与键集。修改既有页面时，另外比较程序结构、公式、参数与 DOM 属性，确保清晰度改稿没有顺手改变行为。交付一份“原句—障碍—改句”清单；对每个删除的限定条件说明理由。
```

### 条文与具体毛病的对应关系

| 条文 | 针对的毛病 | 本页触发位置 | 可检查的证据 |
| --- | --- | --- | --- |
| 1 | 抽象开场、步骤无问题 | tagline、s2t、s4e | 首屏能指出已知与未知；每步第一句是可回答的问题 |
| 2 | 术语先用后解释、概念链跳跃 | s0roRun、s2e、s6e | 依赖表中无未定义前置词；图例和读数也入表 |
| 3 | 读不懂图、公式无任务、量纲混淆 | s0e、s2e、s3kLab | 坐标、符号、单位或量类型有明确解释 |
| 4 | 指标不可判读、最终值误写当前值 | s0roRun、s3e、s5ro | 指标口径齐全；读数与实际统计区间一致 |
| 5 | 交互只让人拖，没有观察路径 | s1hint、s3hint、s5hint | 控件、保持量、观察点、判断标准均可指认 |
| 6 | 比喻堆叠、拟人化伪机制 | s2hint、s4hint、s6fin | 去掉比喻后仍有完整因果；无凭空的自适应 |
| 7 | 最优／等价过度泛化、P 与误差混淆 | s4hint、s5ro、s6fin | 条件可列出；依赖关系与递推式一致 |
| 8 | 真数据误称、单次结果泛化 | tagline、s0hint、s1hint | 场景来源、切换点、失配和结论范围明确 |
| 9 | 应用传奇、产品实现断言、缩写轰炸 | s6card1–3 | 来源可追溯；每张卡能指出观测与处理对象 |
| 10 | 英文翻译腔、默认状态外漏改、改稿越界 | pageTitle、s2roDone、s5eOff | 双语语义审查记录与结构、键、占位符差异检查 |

### 对 BRIEF 的配套建议

不要只给“第几步讲哪个知识点”。每步大纲应增加五个必填项：读者此时知道什么；这步唯一要回答的问题；输入与想求的量；控件操作及预期观察；只在什么条件下可以得出的结论。再单列“新术语首次出现表”和“模拟设定／模型失配”。生成者先检验 BRIEF 是否具备这些信息，缺失时提出合理设定并明确标注；不能靠填充比喻掩盖缺口。

## 五、核验记录与边界

- 两种语言修改前后均为 **118 个键**，键集、顺序完全相同；两语种键集也一致。
- 对每个键分别比较占位符序列：名称、出现次数、重复项、原有顺序完全一致。原中英文个别模板的顺序本就不同，按各自原文保留。
- 将字典字符串值遮去后，修改前后 JavaScript 逐字相同；即只改了字典值，未改语言机制或其他逻辑。
- `s2formula` 中英文完整字符串逐字相同；其他保留的公式表达含义不变；实际公式、矩阵数值与数值参数所在的 `app.js` 逐字未改。
- HTML 经解析后，元素、元素顺序及全部属性完全相同；只变化两个标题文本节点。
- `app.js`、`style.css`、`SPEC.md` 与改前逐字相同。没有修改全站规范文件，规范建议只写在本报告中。
- `node --check i18n.js` 与 `node --check app.js` 通过。
- Chromium 浏览器对照改前／改后：390 和 1280 宽度，各测试中文、英文；语言切换、运行及揭晓、预测及更新、三档 Q/R 预设、速度变化开关均无页面或控制台错误；无空的国际化文本、未替换占位符；改后两种宽度无页面横向溢出。场景数据、一维原始／滤波 RMSE 和稳态计算结果与改前完全相同。

本次任务限定只改字符串，因此保留原有步骤顺序、矩阵展示位置、数值细节和开发接口说明。若后续允许教学结构调整，建议将矩阵实现和对称化说明移入可展开的进阶区，将第 2 步和终章的多概念段落分成更小的视觉单元；这属于后续设计建议，本次未实施。

### 事实核对来源

核心 P／K 依赖关系直接依据本页 `app.js` 的 `stepKalman1d`、`riccatiStep`、`kalman1d`；状态维数、速度预测和最终协方差的口径依据 `kalman2d`、`gen2D`、`drawS5`。这些都可由本地实现复核，无需用外部类比推断。

阿波罗卡片对“扩展形式”的改写依据 NASA 的 [Navigation Filter Design Best Practices, Technical Bulletin 20-03](https://www.nasa.gov/sites/default/files/atoms/files/techbul_20-03-nav_filter_042920.pdf)：该一手材料明确提及 EKF 用于阿波罗月球交会的机载导航。页面文案没有据此声称所有航天器或手机使用同一种实现。
