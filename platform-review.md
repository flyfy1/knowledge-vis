# 平台双语改造 · 独立评审报告

- 评审对象：`~/workspace/knowledge-site/` @ commit `e6004bf`（index.html、pages.config.js、fourier/{index.html, style.css, app.js, i18n.js}）
- 验收标准：`UI-I18N-SPEC.md`（含「分类与标签」一节）
- 评审方式：独立评审（未参与开发、未改源码）。Playwright + /opt/meta-chromium/chrome 真操作，file:// 打开；桌面 1280×900 双语全步骤截图 + DOM 可见文本扫描 + 像素量验 + 状态机式切换测试；390×844 移动端抽查；DPR=2 专项上下文。全程共 34 项自动断言 + 逐张截图目检。
- 证据截图：`platform-review-shots/`（21 张，清单见文末）。

## 结论：✅ 可上线

**必须级 0 条，建议级 3 条。** 双语改造完整落地，红线（既有功能与数学不回退）全部守住。

## 核查结果明细

### 1. 双语完整性 —— 通过
- EN 模式逐个步骤（0–6）截图目检 + 剥离 script/style 后的可见文本扫描：**汉字残留 0 处**。
- Canvas 内文字真切换（目检截图）：第 0/6 步 `x chain (horizontal)` / `y chain (vertical)`（fourier-s0-en.png、fourier-s6-en.png）、第 3 步 `Circle: turning at a steady speed` / `Wave: projected height, unrolled over time →`（fourier-s3-en.png）、第 5 步时域/频域画布标题与轴注 `frequency → (numbers on the axis = multiples of the fundamental)`（fourier-s5-en.png）；ZH 模式对应位置为「x 链（横坐标）」「y 链（纵坐标）」等（fourier-s6-zh.png）。
- ZH 模式英文残留扫描仅命中 `ift`、`rad` 两项，逐一核实均为数学/单位符号（公式 e^(−2πift)、角度单位 rad），非文案残留——属检查器误报，实测无问题。
- 页头（fourier-header-en/zh.png）：回链「← Knowledge Index / ← 知识索引」、H1、导语、右上角 langToggle 位置与高亮双语正确。

### 2. 切换体验 —— 通过
- 动画中切换：第 0 步 N 自动递增在 EN→ZH 切换后继续（18→23 不中断）；读数标签同步变「重构误差」。
- 状态不丢：第 6 步 N=17 切换语言后滑杆值与读数保持 17，状态行文案随语言正确（"Current preset: “Heart”…"）；第 3 步暂停态切语言后按钮为「▶ 继续 / ▶ Resume」与暂停状态一致；第 1 步冻结态同理（「▶ 继续滚动 / ▶ Resume scrolling」）。状态型按钮由 langRefreshers 按当前状态重贴标签，实现正确。
- 持久与跨页：两页刷新后语言保持；索引（ZH）→傅里叶、傅里叶（EN）→索引跨页语言一致（file:// 下 localStorage 同源共享，实测承接成功）。
- 默认语言：en-US 浏览器默认 EN、zh-CN 浏览器默认 ZH，两页一致，符合 SPEC「navigator.language」规则。

### 3. 分类与筛选 —— 通过
- chips 五枚（全部 + 四类）双语标签与注册表顺序正确；逐个点选：signal → 1 卡；probability / computing / math → 空状态文案（EN "Nothing in this category yet — stay tuned." / ZH「这个分类下还没有条目，敬请期待。」），chip 不隐藏，符合 SPEC。
- 卡片分类徽标双语正确（Signals & Systems / 信号与系统）、状态徽标 Live/已上线同步切换；`KNOWLEDGE_CATEGORIES` 注册表与条目 `category` 字段与 SPEC 约定一致，tags 未与分类混用。

### 4. 不回退抽查（数学红线）—— 全部通过
| 抽查项 | 期望 | 实测 |
|---|---|---|
| 第 5 步方波频谱 top3 | 1.27 / 0.42 / 0.25 | "frequency 1 (amplitude 1.27), frequency 3 (amplitude 0.42), frequency 5 (amplitude 0.25)" ✓ |
| 第 4 步吉布斯过冲 N=3 / N=25 | ≈9.4% / ≈9.0% | 9.4% / 9.0% ✓ |
| 第 6 步 error 随 N 下降（爱心） | 单调下降，N=25 约 0.16% | N=5: 1.63% → N=25: 0.16% → N=60: 0.05% ✓ |
| 第 2 步总和/分量峰值比（同频同幅、第三分量归零，像素量验） | ≈2 | 白线幅度 112px / 分量 56px = **2.000** ✓ |
| DPR=2 resize 幂等（s3 画布，视口 1280→1000→1280→900→1280） | CSS 高恒定、backing = 2× | 恒为 [300, 600] ✓ |
| 移动端 390 | 不破版、无横向溢出 | 两页 scrollWidth = 390，关键步截图正常，语言切换可点 ✓ |
| console / pageerror | 0 | 全流程（双语、桌面/移动、DPR）**0 报错** ✓ |

`git diff` 亦佐证 app.js 改动仅 64 行、集中于语言层，数学函数未动。

### 5. 英文文案质量 —— 整体地道，3 条建议级（见下）
通读英文版：3Blue1Brown 式科普口吻，无逐字直译腔；术语准确统一（time/frequency domain、Gibbs phenomenon、fundamental frequency、Fourier series 与 transform 的区分表述严谨）；英式拼写前后一致（normalised / equaliser / travelling）。索引页英文（"play to the end, and it clicks."）同样自然。

## 必须级清单

**无。**

## 建议级清单（3 条，不阻塞上线）

1. **s0hint 英文一句略带直译感**（fourier/i18n.js，en.s0hint）：原文 "Written in mathematics, this scene is f(t) = Σ …" —— "Written in mathematics" 不地道，建议改为 "In mathematical notation, this scene reads f(t) = Σ …"。证据：fourier-s0-en.png。
2. **弯撇号 U+2019 在部分字体栈下渲染出多余间隙**：EN 文案中的 ’ 在本评审 Chromium 的字体栈下显示为 "Circle' s Shadow"、"Don' t"、"wave' s"（证据：fourier-s3-en.png、fourier-s5-en.png）。源文本身是标准排版撇号、内容无误；在字体完整的真实浏览器上通常正常。若想彻底消除风险，可把 EN 字符串的 ’ 换成直撇号 '，或接受现状。属观感项，不影响理解。
3. **s4overText 英文略压缩**（fourier/i18n.js，en.s4overText）：原文 "the larger N, the closer to 8.9%" 可展开为 "as N grows, it approaches 8.9%" 更顺。证据：fourier-s4-en-n25.png（读数实测文本）。

## 方法说明（一条环境备注）

本沙箱 Chromium 对 loopback HTTP 施加 Local Network Access 拦截（127.0.0.1 / localhost 均被拦、加 `--disable-web-security` 亦然），无法以本地 HTTP 服务复核；跨页与持久化改在 file:// 下验证——该 Chromium 的 file:// localStorage 为同源共享，实测承接成功；生产为同源 HTTP 部署，两页使用同一 `knowledge-lang` 键与同一套读写逻辑，结论可迁移。另：file:// 下点卡片进入 `fourier/` 是目录列表页，此为 file:// 固有行为（生产 HTTP 会解析到 index.html），非站点问题。

## 证据截图清单（platform-review-shots/）

- 索引页：index-en.png、index-zh.png、index-mobile-zh.png
- 傅里叶页头：fourier-header-en.png、fourier-header-zh.png
- 傅里叶 EN 全步：fourier-s0-en.png … fourier-s6-en.png（含 fourier-s4-en-n25.png 过冲读数特写）
- 傅里叶 ZH 抽查：fourier-s0-zh.png、fourier-s4-zh.png、fourier-s5-zh.png、fourier-s6-zh.png
- 移动端 ZH：fourier-s0/s3/s4/s6-mobile-zh.png
