# Claude Code 四页独立评审 · 2026-11-09

- **评审者**：Claude Code（`claude-opus-5-5`），新会话、未参与这四页的编写；基线 `main` @ 61f8b95d，分支 `review/claude-pages-20261109`。
- **独立性边界**：与作者是同一模型（Claude Opus 5.5）。WORKFLOW.md 建议的「换模型系交叉评审」仍待做；本评审不能替代它。
- **范围**：`engineering/control/step-response`、`psychology/cognition/signal-detection`、`psychology/ethics/veil-of-ignorance`、`language/phonology/vowel-space`；另含任务 2（署名清单缺口）。
- **读过的约定**：AUTHORSHIP.md、UI-I18N-SPEC.md、specs/visual-page-provenance.md、WORKFLOW.md。任务书提到的 `AGENTS.md` 在仓库中不存在（`ls`、`find -maxdepth 2 -iname 'agents*'` 均无结果），未读。
- **修复提交**：c79b98cc（页面修复，authored）、9fc45981（四页署名刷新，mechanical）、9d33140a（任务 2）。

文件行号凡标 `@61f8b95d` 的指修复前版本。截图在 [claude-pages-review-20261109/](claude-pages-review-20261109/)，全量截图（4 页 × 1280/390/320 × 中英 + 390 减弱动态，共 197 张逐步截图）连同交互截图和评审脚本（`shots.cjs`、`interact.cjs`、`montage.cjs`）归档在评审机的 `~/Documents/archive/knowledge-vis/claude-pages-review-20261109/`（约 60 MB，未入库）。

## 方法

1. **来源**：BRIEF 列出的每个来源都亲自取下来逐条对照（见各页「事实与来源」）。
2. **数字**：在 node 里用 `sim-core.js` 独立复算页面上的每个数字，参数自选，包括滑杆边界和细网格扫描，不采信 BRIEF 自述。
3. **测试覆盖**：逐条比对页面断言与 `tests/core.cjs` 的断言。
4. **浏览器**：`python3 -m http.server 18871 --bind 127.0.0.1`；Playwright（chromium）在 1280/390/320、zh/en、`reducedMotion: reduce` 下逐步截图，并程序化检查页面级横向溢出（`scrollWidth > clientWidth`）、元素越界、文字框重叠、空的 i18n 节点、console error / pageerror / 4xx。再用交互脚本把按钮点到底、滑杆推到边界、切换语言看状态是否保留。截图都亲自看过（以 Playwright 拼图查看）。
5. **署名**：页头标签与 `page-provenance.json`、`git log`、`Built-By` trailer 三方对照。

**自动检查的两类假阳性**（已人工核对排除）：`nav-step` 越界是步骤导航条自身 `overflow-x:auto` 横向滚动，页面 `scrollWidth` 始终等于视口宽度；「P × s0k」重叠来自关闭状态 `<details class="page-provenance">` 里的段落——Chromium 用 content-visibility 隐藏它们，但仍返回布局盒，截图上看不到。

**通用结论（四页都成立）**：所有 `#stepN` 深链都存在且落点内容与链接文字一致（逐个读了目标步骤的标题和正文）；中英键集合与占位符一致（测试覆盖）；切换语言不改滑杆、试验点、抽样记录和猜测；控制台零报错；三种宽度均无页面级横向溢出；减弱动态下 step-response 第 0 步直接画完，其余三页没有自动动画。

---

## 1. step-response（阶跃响应）

### 事实与来源

| 页面说法 | 来源核对 | 结论 |
| --- | --- | --- |
| 超调 `100·e^(−ζπ/√(1−ζ²))`、峰值时间 `π/ωd`、调节时间 `3/(ζωn)`（5%）或 `4/(ζωn)`（2%） | [MSU ME451 L15](https://www.egr.msu.edu/classes/me451/jchoi/2014/notes/ME451_L15_Timeresp2nd.pdf) 第 9 页表格 | 一致 |
| 超调只依赖 ζ、不依赖 ωn；ζ>1 时无峰值时间/超调 | 同讲义第 10 页 | 一致 |
| 极点 `−ζωn ± jωn√(1−ζ²)`、`ζ = cos θ`（θ 与负实轴夹角） | 同讲义第 12 页 | 一致 |
| 两条指标 → 极点可行区（夹角上限 ∩ ζωn 下限） | 同讲义第 16–18 页（讲义用 5% 调节时间，本页用 2%，做法相同） | 一致 |
| 讲义第 20 页 ζ=0.6、ωn=5 求超调 | 讲义确有此题，未给答案；公式算得 9.48%，测试复现 | 一致 |
| 「临界阻尼：不冲过 1 的情况里最快到达（ωn 固定时）」 | 讲义未直接写；独立复算 ζ∈{1,1.05,1.2,1.5,2}、ωn=2 的 2% 调节时间，ζ=1 最短 | 在页面写明的条件下成立 |

### must-fix

无。

### should-fix

1. **[已修] 调节时间估算的误差范围写错。** s3hint 写「0.1 ≤ ζ ≤ 0.95 时两者相差在 ±25% 以内」（`i18n.js:35@61f8b95d`，英文同）。按 0.01 步长细扫，实测/估算最低 **0.703（ζ≈0.78）**，最高 1.2504（ζ=0.95），两端都越出 ±25%。原测试只在 0.05 步长网格上查、且上限放宽到 1.3（`tests/core.cjs:15@61f8b95d`），与文案不一致，因此没发现。修复：文案改为「约 0.70–1.25 倍（ζ≈0.78 时最短）」，sim-core 注释、BRIEF 同步；测试改为 0.01 细扫并钉住 0.70/1.25/0.78，且检查 s3hint 引用的就是这组数。
2. **[已修] 测试没覆盖页面的两条结论。** s4hint「振荡总在包络 1 ± e^(−ζωn t)/√(1−ζ²) 里」和 regime_critical「临界阻尼最快且不冲过」没有测试。已补：4 组参数逐点检查包络；ζ=1 与 4 个过阻尼值比较调节时间；第 0 步读数「37%」也钉住。
3. **[已修] 规则 11：后续步骤复用 ζ、ωn 不就近解释。** s2e 只说「式子里只有 ζ」（`i18n.js:26@61f8b95d`），s4e「ζ 和 ωn 能不能画在同一张图上」（`:38`）、s5e 同样；读者从导航直接跳进来时没有口径。已在 s2e、s4e、s5e（中英）加一句白话。

### nit（未改）

- 第 2 步没有历史轨迹（规则「呈现历史」）：右图是固定的公式曲线，圆点沿它移动，已能看出「ζ 决定超调」，影响不大。
- 第 5 步 ζ=0.7、ωn=3 时实测调节时间正好 2.00 s，判定 ✓ 落在边界上；测试只断言 ≤ 2。

### 模型与代码

`sim-core.js` RK4（dt=0.005）与解析式对照：ζ∈{0.1,0.3,0.5,0.6,0.9} 超调误差 < 0.05 个百分点、峰值时间误差 < 0.01 s（测试）；`metrics` 的「留在带内至少最后 10% 时长才算稳定」逻辑正确，ζ=0.05、30 s 正确报未稳定。`poles`、`zetaForOvershoot`（10% → ζ=0.591、θ=53.8°）复算一致。

### 教学与 UI

播放可暂停/继续、可拖时间滑杆逐刻查看（交互实测：暂停后读数 600 ms 内不变；继续后走完；拖到 2.5 s 读数 y=1.06）；暂停按钮开播前禁用；减弱动态下点「施加阶跃」立即画完。第 1、3、4 步旧曲线/旧极点保留可见。截图：[sr-step0-paused-390.png](claude-pages-review-20261109/sr-step0-paused-390.png)、[sr-320-zh-steps1-5.png](claude-pages-review-20261109/sr-320-zh-steps1-5.png)。

---

## 2. signal-detection（信号检测论）

### 事实与来源

取 [Georgeson, *Sensitivity and Bias*（Birmingham PDF）](https://www.birmingham.ac.uk/Documents/college-les/psych/vision-laboratory/sdtintro.pdf)，共 7 页：

| 页面说法 | 讲义位置 | 结论 |
| --- | --- | --- |
| 医生 80/20/20/80、机器 98/2/38/62，各 100 张 | 第 3 页 Example 2、Table 1 | 一致 |
| z 值 0.842/−0.842、2.054/−0.305；d' 1.683 vs 2.359；C 0 vs −0.874；P(c) 都是 0.800 | 第 3 页 Table 1 | 一致，测试复现到 3 位小数 |
| `d' = z(H) − z(F)`，`P(c) = 0.5 + (H−F)/2` | 第 1 页 Fig.1、第 5 页 | 一致 |
| `C = −[z(H)+z(F)]/2`；C<0 宽松（偏 yes）、C>0 严格、C=0 无偏 | 第 6 页 §4 | 一致 |
| 等方差正态是简化假设 | 第 4 页「This may not be so」 | 一致 |
| 例子是假设的 | 第 6 页「The (imaginary) doctors」 | 一致（页面写「假设的教学例子」） |
| 第 5 步最佳判据、与贝叶斯「先验 × 似然比」是同一笔账 | 页面不当作引用；测试用 `x* = ln β/d' + d'/2` 交叉核对 | 推导正确 |

### must-fix

无。

### should-fix

1. **[已修] 第 5 步最佳判据超出图域时显示错误。** 滑杆角落（p=0.05、代价比 0.1，或 p=0.95、代价比 10）的最优 c* = ±3.50，超出图示 −2.5…2.5：绿点画到画布外看不见（`app.js:185@61f8b95d`），读数只多一个没有解释的「↔」（`app.js:191@61f8b95d`）。修复：点钉在图域边缘并加方向箭头，读数写明「在图示范围之外，绿点画在边缘」；测试钉住两个角落的 ±3.5（精确值 ±ln190/1.5 ≈ ±3.498）。截图：[after-sdt-step5-edges.png](claude-pages-review-20261109/after-sdt-step5-edges.png)。
2. **[已修] 规则 11：H、F、c、d' 跨步复用不就近解释。** s3e「只看得到 H 和 F」（`i18n.js:34@61f8b95d`）、s3hint 的 c、s4e 的 d'、s5e 期望代价公式里的 H、F 与「判据 c」（`i18n.js:48@61f8b95d`）都没有口径。已在中英文就近补上。
3. **[已修] 测试没钉住揭晓文案里的数字。** reveal 写的 2.36、1.68、−0.87 现在由测试检查。

### nit（未改）

- 第 3 步 d'=3.5、c=1.5 时 F 显示 0.00（真值 0.0006），旁边「反算 d' = 3.50」看起来与「F=0 时 z 为无穷大」的边界说明有张力；可改为 3 位小数。
- 第 4 步无论是否押过猜测，揭晓文字始终可见；BRIEF 写的是「揭晓并回显」，行为与 BRIEF 一致，但先押后看的设计可以更强。
- 320 宽下第 5 步横轴刻度较挤，仍可读。

### 模型与代码

`Phi` 用 A&S 7.1.26（误差 < 1.5e-7），`z` 用二分 80 次，复现讲义 z 值到 5e-4 内；`rates/measures` 往返误差 < 1e-6；固定种子 4 万次试验与模型 H/F 相差 < 0.01；`bestK` 0.001 步长扫描与解析式在 0.002 内一致。100 次试验后实测 H=0.80、F=0.20，模型 0.77/0.23（交互实测）。

### 教学与 UI

试验点按批累积、最新 20 个放大，计数与实测 H/F 逐步靠近模型面积；「清空」重置计数与种子；第 2 步旧判据线保留。截图：[sdt-320-zh-steps0-5.png](claude-pages-review-20261109/sdt-320-zh-steps0-5.png)。

---

## 3. veil-of-ignorance（无知之幕）

### 事实与来源

取 SEP [Original Position](https://plato.stanford.edu/entries/original-position/)（Samuel Freeman；页面显示 First published 2008-12-20，substantive revision 2023-10-24，与 BRIEF 一致）：

| 页面说法 | SEP 原文 | 结论 |
| --- | --- | --- |
| 幕后的人不知道自己的阶层、财富、社会地位 | 「no one knows their place in society, class position, wealth, or social status」 | 一致 |
| 最大最小原则；选择一次性、决定一生前景 | 「not renegotiable or repeatable … determines all one’s future prospects」 | 一致 |
| 适用条件 | 三条（TJ 154–55/134 rev.）：①无或很不可靠的概率依据；②maximin 选出的结果「acceptable alternative we can live with」；③其他选项有「worse outcomes that we could not accept and live with」。**并且**「Rawls later says that the first plays a minor role, and that it is the second and third conditions that are crucial (JF 99)」 | **页面原文只写①③，见 should-fix 1** |
| 罗尔斯否认各方有规避风险的心理倾向 | 「Rawls denies that the parties have a psychological disposition to risk-aversion」 | 一致（终章「不只是性格上怕不怕风险」） |
| 海萨尼：不充分理由原则 → 等概率 → 平均效用（Harsanyi 1975） | 「Harsanyi contends … principle of insufficient reason … equal probability … principle of average utility (Harsanyi 1975)」 | 一致 |

η、k、三个社会、5 个位置都由页面明说是教学设定；η 分界 ≈0.8、≈3.5 与 `63t²+12t−35=0`（k=0.6 时最大最小的最好 t≈0.656）独立推导复核一致：最差位置 (1−0.6t²)(10+35t) 求导即得该方程。

### must-fix

1. **[已修] 第 0、2 步画布顶部社会名互相压叠、不可读。** `app.js:40@61f8b95d` 不论宽度都画「A · …」全名：390 英文下 B、C 两个名字叠成一团，320 中英文下同样（中文「差距大」压在「托底的增长」上）。截图：[before-veil-390-en-step0.png](claude-pages-review-20261109/before-veil-390-en-step0.png)、[before-veil-320-zh-step0.png](claude-pages-review-20261109/before-veil-320-zh-step0.png)。修复：按列宽测量文字，放不下时只画字母（全名在下方按钮上）。修后：[after-veil-390-en-step0.png](claude-pages-review-20261109/after-veil-390-en-step0.png)、[after-veil-320-zh-step2.png](claude-pages-review-20261109/after-veil-320-zh-step2.png)。

### should-fix

1. **[已修] 罗尔斯的条件不完整，且重心放错。** s2e 只列①③（`i18n.js:27@61f8b95d`），漏了②，也没说罗尔斯后来认为①次要、②③才关键；判断题正确项 quizB 又以「无概率依据」作为罗尔斯的理由（`i18n.js:50@61f8b95d`），恰好落在他自己说次要的那条上。中文还把 「could not accept and live with」 加引号意译为「无法接受、无法忍受」，像直接引文却与原文不符。修复：s2e 列全三条并补 JF 99 的说法，中文改为「无法接受、无法与之共处」且去掉引号；quizB 改为「一次性、决定一生、而别的选项可能坏到无法接受」；BRIEF 同步；测试检查 s2e 中英都写了三条与后两条的重点。
2. **[已修] 切换社会无声销毁抽样记录。** 第 0 步换社会清空 draws（`app.js:168@61f8b95d`），第 1 步换社会清空累计折线（`app.js:171@61f8b95d`），违反 UI-I18N-SPEC 状态一致性第 5 条（「不得无声销毁用户手动产生的数据」）。交互实测：B 抽 8 次后点 C，记录消失且无提示。修复：记录按社会分别保存，换回来还在；「清空记录」只清当前社会；s0hint 写明这一点。实测：B 抽 4 次 → C 抽 1 次 → 回 B 仍是 4 次。
3. **[已修] k=0 时平均原则「最好的 t」读数误导。** k=0 时平均值对所有 t 都是 45（打平），读数却报「平均原则 0.00」（`app.js:161@61f8b95d`），与 s4hint「平均原则无所谓」矛盾。修复：曲线在 t 上平坦时读数显示「任意 t（各 t 相同）」；测试检查 k=0 时平均恒为 45。
4. **[已修] 规则 11：第 4 步复用 η、确定性等价、平均/最大最小原则不解释。** 已在 s4e 中英文补口径。

### nit（未改）

- 英文读数「1 draws so far」单复数。
- η 恰好 3.50 时 A 与 C 的确定性等价都显示 30.0、判 A，是分界点上的平局显示，正文写的是「约 3.5」，可接受。

### 教学与 UI

第 1 步 500 次抽样后累计平均 44.67 → 45；第 3 步 η=0/0.8/3.5/8 胜者 B/C/A/A 与 s3hint 一致；第 4 步 k=1、t=1 时全部归零、η=1 不报错。截图在全量目录。

---

## 4. vowel-space（元音空间）

### 数据复算（任务书要求）

```
curl https://raw.githubusercontent.com/praat/praat/6a9874e525d80a2b4c2e6a8d687081963c6d4e6a/dwtools/Table_dataSets.cpp
sha256 3027b8856df330f4abf9149b140d87411d4de835dc8d7c821cc0c1e2b1da3cc3   ← 与 BRIEF 一致
node language/phonology/vowel-space/tools/pb-means.cjs <该文件>          → MATCH sim-core.js MEANS
```

脚本的行序假设也独立核对过：Praat 代码 `vowel [10] = {iy, ih, eh, ae, ah, aa, ao, uh, uw, er}`，`vowel_id = ((i−1) % 20)/2 + 1`、`speaker_id = (i−1)/20 + 1`，1–33 男、34–61 女、62–76 儿童，62/63/65–68/73/76 为女孩；源码注释还说明 2008-01-25 之前的顺序是错的（hud 在 who'd 之后）。`pb-means.cjs` 用的正是修正后的顺序。另用 Python 独立数得 1520 行、321 个星标行，与 BRIEF 一致。（BRIEF 里按 Praat 手册列出的「heed iy … hud ah, heard er」只是词—标签对照，顺序与行序不同，已在 BRIEF 加注说明，避免误读。）

### 事实与来源

| 页面说法 | 核对 | 结论 |
| --- | --- | --- |
| 共振峰 = 从喉到唇的声道的共鸣 | [UIUC ECE590SIP 2018 Lecture 4](https://courses.grainger.illinois.edu/ece590sip/sp2018/spectrograms4_vowels.html)：「formant = resonance of the vocal tract, from larynx to lips」 | 一致 |
| 除 /ɝ/ 外元音大体可用 F1、F2 解释；边界略有重叠；男/女/儿童划分不同 | 同讲义：「perception of American English vowels (except /ɝ/) can be explained based on the 1st and 2nd formant frequencies … a little overlap at each boundary … different for voices of men, women, and children」 | 内容一致，但原文说的是**感知**（见 should-fix 1） |
| 33 男、28 女、15 儿童（8 女孩）；每个元音 2 次；hVd 词 | Praat 源码注释与代码 | 一致 |
| Peterson & Barney (1952) *JASA* 24(2): 175–184 原文 Table II | 未取得原文 | **未核实**（页面与 BRIEF 本就声明不声称与 Table II 一致，处理得当） |
| 「heed、who'd 的 F1 最低」等排序、儿童÷男性比值 20 个里 18 个在 1.2–1.5、男性模板认对女 7/10、童 3/10、λ=1 后 10/10 | 由复算出的均值独立计算 | 一致（女性认错 hud→had、who'd→hood、heard→head；儿童认错 7 个，与第 3 步读数一致） |

### must-fix

无。

### should-fix

1. **[已修] s1hint 让读者「见 BRIEF 来源」。** 页面上没有 BRIEF 链接，读者无从查到（`i18n.js:23@61f8b95d`，英文同）；而且把讲义的「perception … can be explained」写成「元音大体可以用 F1、F2 解释」，丢了「感知」。修复：s1hint 改为 HTML，直接链接 UIUC 讲义，并写「感知」；BRIEF 同步。
2. **[已修] 规则 11：第 3、4 步复用 F1、F2 不解释。** s3e（`i18n.js:32@61f8b95d`）、s4e 已补「第一、第二共振峰」口径。

### nit（未改）

- 320 宽下第 0 步谱图底部 F0 标注与谐波竖线挤在一起，峰标签可读。截图：[vowel-320-zh-steps0-4.png](claude-pages-review-20261109/vowel-320-zh-steps0-4.png)。
- s1er 把 /ɝ/ 的低 F3 与讲义「/ɝ/ 不能只靠 F1、F2」联系起来，是作者的推断（措辞「对得上」较克制），讲义本身没提 F3。

---

## 5. 署名（任务 1 第 5 项）

四页标签与 `page-provenance.json` 在评审前一致：`sourceRevision` 都是该页最后一次 `Authorship-Impact: authored` 的 Claude Code 提交（step-response 779eb86a、signal-detection 67da60ac、veil e0ff2703、vowel 523a73f6），其后只有 mechanical 提交（54160951 加标签、61f8b95d 改版本号）；`data-developer`、edition、scope 中英文、commit 链接都对得上。

修复后（9fc45981）：`sourceRevision` → c79b98cc。signal-detection、veil 原来没有 `originalSourceRevision`，旧值（同时也是建页提交）放入该字段；step-response、vowel-space 的 `originalSourceRevision` 已记录建页提交（04373f5b、01151d62），为不丢失这一信息，旧值改放 `previousSourceRevision`（仓库 atlas 记录已有此字段）。这一点与任务书「旧值放进 originalSourceRevision」的字面要求不同，是有意的取舍。标签和 BRIEF 的评审状态从「仅自检」改为「2026-11-09 经另一个 Claude Code 会话独立评审（同一模型；跨模型评审待做）」。

## 6. 任务 2：署名清单缺口

`node tests/page-provenance-core.cjs` 在 61f8b95d 失败：静态标签多出 `biology/ecology/population-ecology` 和 `math/linear-algebra/linear-transform`。

### population-ecology —— 证据充分，已登记

- `git log --follow`：3820f26b（10-29，「Add parallel knowledge lessons」，**无** Built-By）建页；**07fec169**（10-29，「Add predator prey phase plane」，`Built-By: Codex (gpt-6.1-sol)`，`Verified-By: self-check …`）新增了这个标签（`git show 07fec169 -- population-ecology/index.html` 第 27–30 行）；之后只有 aeac49f3、ec7f0050 两个 Claude Code mechanical 搬迁提交。
- `node scripts/authorship.cjs`：primary unattributed（建页 +96 行），codex 1 次 +12 行，claude-code 仅 mechanical。与上面一致。
- 旧标签不合契约：摘要写「Codex 开发 · 相图增强」而非「改进版本」；`data-source-revision="c21cdb49"`，而 c21cdb49 是「Add momentum collision lesson」，根本没改这页（它是 Codex 工作分支的起点）。
- 处理：按契约重写标签，登记为 `developer: Codex`、`kind: revised`、`sourceRevision: 07fec169832ff73a422c35a90a1520962890a1b0`，scope 中英文取自原标签说明，`originalAuthorship` 写明建页提交 3820f26b 未声明 Agent、原作者不断言。sourceRevision 保持 Codex 的提交，而不是本次改标签的提交（9d33140a 是 Claude Code 的格式整理，不能冒充 Codex 的作品）。截图：[task2-popeco-lintrans-320.png](claude-pages-review-20261109/task2-popeco-lintrans-320.png)。

### linear-transform —— 无证据，未登记，标签移除

- 历史上只有 a0ef4c69（main）及同内容的 6ee84cd7（`local/linear-algebra` 分支），两者都**没有** Built-By；同批 10-29 的 c21cdb49、3820f26b 也都没有；`authorship/overrides.json` 的 commits/files 为空；worklog、spec、BRIEF 都没写作者；`authorship.cjs` 推导为 unattributed。
- 唯一写着「Codex」的是标签本身（「Codex lesson · Linear map lab」，而且不合契约：无 `data-developer`、无 source revision）。同批其他页面多由 Codex 制作，但按 AUTHORSHIP §1「不猜」，这不能作为证据。
- 处理：不登记；按 AUTHORSHIP §7「未核实来源的页面不贴标」移除 `<details class="page-provenance">` 和 provenance CSS 引用，保留其中给学习者的数值说明（「数值读数四舍五入…」）作为普通段落。若 Yangyu 确认作者，可在 `overrides.json` 补记后再贴标。
- **后续（2026-11-09）**：Yangyu 确认作者是 Muse。已在 `overrides.json` 对 a0ef4c69 补记（agent `alberto`，模型未知），并重新贴上 `Alberto (Muse)` 原创版本标签；`page-provenance-core` 现为 32 个标签。原标签声称的 Codex 没有证据，不恢复。

### 结果

- `node tests/page-provenance-core.cjs`：PASS，31 个标签（Codex/revised 27、Claude Code/original 4）。
- `PROVENANCE_BASE_URL=http://127.0.0.1:18871 node tests/page-provenance-browser.cjs`：PASS（任务 2 后、9fc45981 后各跑一次，串行）。
- 两页自带测试（`linear-transform/tests/linear-transform.cjs`、`population-ecology/tests/population-ecology.cjs`）PASS；320 宽截图无溢出、无报错。
- specs/visual-page-provenance.md 的「Known gap」已追加结案说明。

## 7. 测试结果（修复后）

```
PASS step-response core     (79 bilingual keys, 3 deep links)
PASS signal-detection core  (88 bilingual keys, 5 deep links)
PASS veil-of-ignorance core (76 bilingual keys, 5 deep links)
PASS vowel-space core       (61 bilingual keys, 5 deep links)
MATCH sim-core.js MEANS     (vowel-space, Praat 6a9874e5)
PASS page-provenance-core   (31 labels)
PASS page-provenance-browser
```

浏览器复查（修复后全量截图 + 交互脚本）：32 个配置无页面级溢出、无真实文字重叠、无 console error、无空 i18n 节点。

## 8. 仍待做

- 跨模型（如 Codex）交叉评审：本评审与作者同模型，盲区可能重合。
- 学习者冷走（WORKFLOW 第 3 条第一顺位）只由本评审者以「先不看 BRIEF」的方式走了一遍，没有真人体验者拖动参数验证。
- 各页 nit：已在后续提交修复第 5 步读数（实为 should-fix，见下）、SDT 极端 F 显示、veil 平局与单复数、vowel F0 标注与 s1er 措辞；未改的是 SR 第 2 步历史轨迹、SDT 揭晓先押后看、SDT 320 宽刻度较挤（均为设计取舍或可读）。
- ~~linear-transform 的作者需要 Yangyu 确认后才能重新贴标。~~ 已确认为 Muse 并重新贴标。
- Peterson & Barney 1952 原文 Table II 未取得，vowel-space 的均值只核对到 Praat 发行的数据。

## 9. 后续修复（2026-11-09，同一会话）

- **升级为 should-fix**：step-response 第 5 步的 nit「调节时间正好落在 2.00 s」进一步查明，是读数和判定矛盾：调节时间按 0.005 s 步长量化，两位小数会把 2.005 s 显示成「2.00 s」却判 ✗。遍历全部滑杆组合，共 20 个组合中招（如 ζ=0.65、ωn=3）。第 5 步改为显示三位小数；`tests/core.cjs` 遍历全部组合，断言显示值与判定一致（超调一位小数本来就 0 个冲突）。
- SDT：H、F 在两位小数下会显示为 0.00/1.00 但真值不是时，改显示四位小数。
- veil：η=3.50 时 A、C 并列，显示为「A / C（并列）」，两柱都打 ✓；英文单复数修正。
- vowel：F0 标注加底板；s1er 写明是本页推断。
- 浏览器核对（390/320，中英）：上述读数都符合预期，控制台零报错。

## 10. canvas 文字重叠检查（2026-11-09，同一会话）

- 新增 `tests/canvas-text-overlap.cjs`。负对照：在 9d33140a 上，它报出的正是本评审靠肉眼发现的 veil 社会名重叠，宽度、语言都对得上。
- 用 `--sweep` 扫四页后又发现并修复 4 处（06fbf811）：
  - step-response 第 4 步：ζ 较大时 ωd 压到 θ；
  - signal-detection 第 5 步：c* 压到横轴刻度；
  - veil 第 4 步：η=0 时「平均」和「确定性等价」两个标注完全重叠；
  - vowel 第 3、4 步：320 宽下 ʊ 压在 ʌ 上。
- 修复后四页共扫 9014 个画布状态，没有重叠。
- 全站普查见 [canvas-text-survey-20261109](canvas-text-survey-20261109.md)：67 页有重叠；另外查出 coordinate-plane 第 6 步读数为空白的递归 bug，已修复（5abad24c）。
