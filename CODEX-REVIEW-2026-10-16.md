**visual.integ.life 全站代码评审报告**

评审范围包括根目录索引、配置、跳转页、部署辅助脚本，以及全部 **19 个知识页**；除题述页面外，也包含已注册的 `kalman`、`sorting`。当前注册表实际名称为 `window.KNOWLEDGE_PAGES`。

本次未修改任何项目文件。验证包括源码检查、39 个页面 JavaScript 文件语法检查、注册表与路径核对、19 页浏览器交互冒烟检查、中英文切换、DPR 1/2/3 重复画布适配，以及若干数学恒等式核对。浏览器验证使用 Chromium；未进行完整的跨浏览器、屏幕阅读器和逐帧像素验收。

**总体判断：建议先修复下列三个 P1 问题，再做公共层整理。** 未发现 P0 问题；现有基础公式多数可靠，主要缺陷集中在交互对象引用、边界判定和展示状态。

严重程度：P1＝核心交互失效或明显误导教学结论；P2＝特定条件下结果错误、持续性能退化或可访问性缺陷；P3＝低影响维护问题。

---

**1. 正确性问题与风险**

**① P1：傅里叶页点击方波预设后，三个分量的滑杆失效**

位置：[fourier/app.js:430](/home/songyy/codex-review/knowledge-site/fourier/app.js:430)，约 430–435 行。

```js
comps.forEach((c, i) => {
  $('s2-f' + (i + 1)).addEventListener('input', e => {
    c.f = +e.target.value;
    syncLabels();
  });
});
```

随后预设替换了数组中的对象：

```js
comps[0] = { f: 1, a: 1 };
comps[1] = { f: 3, a: 0.33 };
comps[2] = { f: 5, a: 0.2 };
```

监听器闭包仍持有旧的 `c`，绘图和 `syncLabels()` 则读取新对象。

**已复现：**点击方波预设，把第一个频率滑杆设为 7 并触发 `input`，滑杆和读数立即回到 1。振幅滑杆同样受影响。

建议原地更新对象，或让监听器按索引访问 `comps[i]`。

**② P1：卷积页滑动平均自动播放会越过数组末尾，周期性显示 NaN**

位置：[convolution/app.js:333](/home/songyy/codex-review/knowledge-site/convolution/app.js:333)，约 333–386 行。

```js
const i1 = Math.floor(pos);
// smoothedAt 内：
for (let k = Math.max(0, i - w + 1); k <= i; k++) {
  s += data[k];
}
// 动画内：
pos += dt * 26;
if (pos > N + 30) pos = 0;
```

`data` 长度为 240，但 `pos` 允许推进到约 270；`i1 >= 240` 后，平均值开始累加 `undefined`。

**已复现：**按当前速度推进约 9.3 秒，读数出现：

```text
current window average = NaN
```

每轮约有一秒处于错误状态。若需要末尾停顿，应钳住数据索引，另用状态记录停顿时间。

**③ P1：Z 变换页把单位圆上的重根误判为“等幅振荡”**

位置：[ztransform/app.js:123](/home/songyy/codex-review/knowledge-site/ztransform/app.js:123)、[ztransform/app.js:968](/home/songyy/codex-review/knowledge-site/ztransform/app.js:968)。

冲激响应正确处理了重根：

```js
if (Math.abs(s) < 1e-9) {
  const p = r * Math.cos(th);
  return (n + 1) * Math.pow(p, n);
}
```

但判词只检查半径：

```js
const verdict = s4.r < 1 - 1e-9 ? t('s4vStable')
  : s4.r > 1 + 1e-9 ? t('s4vUnstable')
  : t('s4vMarginal');
```

**已通过现有键盘操作复现：**初始 `r=0.97`，按一次上方向键得到 `r=1`，持续左移把 `θ` 调到 0：

- `h[10] = 11`；
- `h[40] = 41`；
- 页面仍显示“振荡不衰也不涨（包络恒定）”。

`θ=π` 的单位圆重根也有同类问题。此时包络线性增长，应单独判为不稳定。此外，极点处的频响峰值应明确标为奇异/无穷，当前细化搜索会给出看似精确的巨大有限数。

**④ P2：卷积终章会把负峰画到 Canvas 外**

位置：[convolution/app.js:1072](/home/songyy/codex-review/knowledge-site/convolution/app.js:1072)。

```js
const baseY = h * 0.68, amp = h * 0.52;
const Y = v => baseY - v / maxV * amp * 0.92;
```

当 `v=-maxV` 时：

```text
Y = 1.1584 × h
```

当前画布高度为 300px，负峰落在 **347.52px**。选择矩形信号与差分核即可触发，正负边缘中的负峰会被裁掉；正弦信号也受影响。

建议根据实际最小值、最大值确定纵轴范围，并给底部输入条带独立留位。

**⑤ P2：采样页频谱示意忽略相消，给零序列画出非零峰**

位置：[sampling/app.js:449](/home/songyy/codex-review/knowledge-site/sampling/app.js:449)，约 449–487 行。

```js
const pos = new Set();
// 仅收集 |m·fs ± f| 的位置
const peakH = ph * 0.66;
```

第 4 步只合并频率位置，然后把所有峰画成相同高度，没有保留复幅值及其符号。

**已复现边界：**令 `f=fs=10Hz`，对应正弦采样值为：

```text
sin(2πn) ≈ 0
```

实测最大绝对值约 `1.08e-14`，但频谱仍在 0Hz 画出明显峰。这与第 2 步的零假波不一致。

建议按采样序列计算频谱，或明确把该图限定为“副本位置示意”，并对重合频率的相消单独处理。

**⑥ P2：CLT 卷积阶梯的横坐标存在累积偏移**

位置：[clt/app.js:711](/home/songyy/codex-review/knowledge-site/clt/app.js:711)、约 767 行、`CLT.ladder.level()`。

```js
out[i + j] += fi;
// 后续绘图及导出：
const x = (i + 0.5) * LAD_DX;
```

两个格心坐标相加后，坐标原点也需要累加。当前每一级仍使用同一个半格偏移，导致第 `n` 级整体左移 `(n−1)·dx/2`。

对导出密度积分，得到：

| 卷积次数 n | 理论均值 n/2 | 当前坐标下实测均值 |
|---|---:|---:|
| 2 | 1.000 | 0.999 |
| 3 | 1.500 | 1.498 |
| 5 | 2.500 | 2.496 |
| 6 | 3.000 | 2.995 |

总质量仍约等于 1，因此只检查积分会漏掉这个问题。建议为每级密度显式记录坐标起点，并同步修正绘图、查询和导出。

**⑦ P2：CLT 实验清零后仍画一个旧样本**

位置：[clt/app.js:451](/home/songyy/codex-review/knowledge-site/clt/app.js:451)、约 470 行。

```js
s2.count = 0;
// 绘图时：
count: Math.max(1, s2.count)
```

重置没有清空 `means`，绘图又强制读取一个元素。首次初始化会画一个默认的零值；运行后重置则会保留上次第一个样本。

**已复现：**真实计数为 0，直方图分箱总计数仍为 1。应允许空直方图，只对归一化分母做保护。

**⑧ P2：控制页倒地后，历史数组无限增长**

位置：[control/app.js:228](/home/songyy/codex-review/knowledge-site/control/app.js:228)，及多个步骤的动画回调。

```js
arr.push({ t: sim.t, th: sim.theta, a: sim.a });
const from = sim.t - (capSec || 13);
while (arr.length && arr[0].t < from) arr.shift();
```

倒地后 `BalanceSim.substep()` 不再推进时间，但动画每帧继续追加相同时间戳，时间窗口清理便无法限制长度。

**已复现：**对倒地模拟连续调用 10,000 次 `pushHist()`，数组长度达到 10,000。绘图和状态分类继续遍历它，页面停留越久越慢。

建议停止追加未推进时间的状态，并增加独立的容量上限。

**⑨ P2：部分页面重复登记 Canvas，重绘次数越多，resize 越贵**

位置：

- [bayes/app.js:127](/home/songyy/codex-review/knowledge-site/bayes/app.js:127)；
- [clt/app.js:155](/home/songyy/codex-review/knowledge-site/clt/app.js:155)；
- [lti/app.js:154](/home/songyy/codex-review/knowledge-site/lti/app.js:154)。

```js
function ctxOf(id) {
  const cv = $(id);
  allCanvases.push(cv);
  return fitCanvas(cv);
}
```

这些页面在 `draw()` 内反复调用 `ctxOf()`，导致同一个 Canvas 被多次加入数组。

连续触发 100 轮重绘后的实测：

| 页面 | 登记数变化 | 实际不同 Canvas 数 |
|---|---:|---:|
| bayes | 14 → 714 | 7 |
| clt | 17 → 817 | 8 |
| lti | 28 → 1428 | 14 |

`entropy`、`kalman` 已使用 `includes()` 去重，说明相同基础设施的修复已经产生跨页漂移。建议统一使用 `Set`，并分开“登记”和“取得上下文”。

**⑩ P2：图像“卷积”实际使用互相关，与前文翻核规则不一致**

位置：[convolution/app.js:222](/home/songyy/codex-review/knowledge-site/convolution/app.js:222)。

```js
s += at(x + kx, y + ky, c)
   * kernel[(ky + 1) * 3 + (kx + 1)];
```

代码注释已承认这是相关运算。对称模糊核下结果相同，因此默认案例掩盖了差别；对非对称浮雕核或自定义核，方向会与严格卷积相反。

建议统一数学定义，或者在图像步骤中明确说明采用图像库/CNN 常见的互相关约定。

部署辅助脚本另有一个 **P2 操作风险**：[cf_tunnel_visual.py:57](/home/songyy/codex-review/knowledge-site/cf_tunnel_visual.py:57) 与 `cf_tunnel_knowledge.py` 在写入隧道后，没有强制验证回读、DNS 查询及创建成功；DNS 创建失败仍可能打印 `DONE` 并正常退出。两份脚本也不能安全重跑补完部分失败的操作。此结论来自静态检查，本次未执行部署脚本。

---

**2. 跨页重复代码与可维护性**

| 重复内容 | 真实落点 | 抽取价值与风险 |
|---|---|---|
| Canvas DPR 适配 | 19 页各自定义 `fitCanvas()` | 价值高；应保留 CSS 高度与 backing store 分离，并支持页面自定义高度 |
| 动画调度、可见性、导航高亮 | 各页 `animators`、`visibleSet`、`loop()`、`nav()` | 价值高；统一暂停、错误处理和重绘生命周期 |
| 语言存储、字典替换、回调 | 19 份 `i18n.js` | 价值高；已出现存储校验和状态刷新差异 |
| 图例换行、边缘标签、数字格式 | bayes、clt、eigen、lti、freqresp 等 | 价值中高；先统一文本测量和布局原语，保留业务格式 |
| PRNG、高斯采样 | control、montecarlo、bayes、clt 等 | 可抽取；须保留算法版本和随机数消耗顺序 |
| 复数、FFT、卷积 | convolution、modulation、ztransform 等 | 谨慎抽取；FFT 正负号、归一化和谱口径必须显式约定 |

CSS 也有明显的整页复制痕迹：至少 **164 条非短行在十个以上页面完全相同**。例如 [bayes/style.css:149](/home/songyy/codex-review/knowledge-site/bayes/style.css:149) 仍包含卷积页序列编辑器、核编辑器，以及采样页专用规则，当前页面并不使用这些组件。

建议采用普通静态文件即可：

```text
shared/canvas.js
shared/runtime.js
shared/i18n.js
shared/base.css
各页 app.js / i18n.js / style.css
```

无需引入构建工具或大型框架。优先抽取基础设施；数学模型与教学流程继续按页隔离。`control/sim-core.js` 将物理核心独立为纯逻辑，是值得延续的做法。

迁移时尤其需要保护：

- 脚本加载顺序和全局变量名称；
- 隐藏面板首次显示时的尺寸；
- 语言刷新、尺寸刷新与重新计算之间的区别；
- 随机种子对应的实际序列；
- DPR 幂等性与窄屏布局。

---

**3. 双语 i18n 一致性与易错点**

**字典基础检查通过。**19 页当前中英文键集合一致，各键的占位符集合也一致；本次交互扫描未发现实际缺失键。`t('pal' + index)` 等动态拼接需要按完整键检查，不能把前缀误报为缺键。

但存在以下具体问题。

**P2：运行中切换语言，按钮文案与状态脱节。**

- [entropy/app.js:621](/home/songyy/codex-review/knowledge-site/entropy/app.js:621) 只刷新 `s2Render()`，没有恢复采样按钮的运行态文字；已复现 `running=true`，按钮却显示“连发采样”。
- [sorting/app.js:543](/home/songyy/codex-review/knowledge-site/sorting/app.js:543) 仅在 `!s0.playing` 时更新按钮；运行中切英文，按钮变成 `Start the race`，实际仍在播放。
- `eigen` 部分播放按钮也只注册 `draw()` 刷新，存在相同静态覆盖风险。

根因是 `applyLang()` 先用 HTML 的默认键覆盖动态按钮，再依赖各页手动补回。建议让按钮文案直接由状态渲染函数统一决定，并覆盖“运行、暂停、完成”三态的切语言检查。

**P2：三个页面接受非法的持久化语言值。**

位置：[bayes/i18n.js:242](/home/songyy/codex-review/knowledge-site/bayes/i18n.js:242)，`clt/i18n.js` 约 209 行，`entropy/i18n.js` 约 355 行。

```js
return window.localStorage.getItem('knowledge-lang');
// ...
if (s) { _lang = s; return s; }
```

它们没有校验 `zh/en`；其他多数页面已有校验。

已复现存储值为 `fr` 时：

```text
getLang() = "fr"
<html lang="en">
document.title = 中文标题
```

同时没有语言按钮处于选中态。应统一在读取入口验证枚举值。

**P2：属性翻译能力没有随模板一起复制。**

`fourier/i18n.js` 支持 `data-i18n-attr`；其他页面普遍只处理文本与 HTML。例如 [bayes/index.html:24](/home/songyy/codex-review/knowledge-site/bayes/index.html:24) 的导航始终为：

```html
aria-label="步骤导航"
```

英文模式下，辅助技术仍读到中文名称。卷积页动态输入的 `seq-0`、`kernel-0` 也缺少有意义的双语名称。

**Canvas 翻译机制总体可用，但接口不统一。**傅里叶使用 `KI18N` 与 `__onLangChange`，其他页使用全局 `t()` 与 `onLangRefresh()`；`freqresp`、`modulation` 切语言时调用 `updateAll()`，会连带重新计算仿真和 FFT。建议建立独立的 `renderTextAndCanvas()` 生命周期，让语言切换只影响呈现。

---

**4. 性能与可访问性**

**性能**

- **P2：CLT 的工作量上限并未真正封顶。**[clt/app.js:807](/home/songyy/codex-review/knowledge-site/clt/app.js:807) 用 `K = clamp(floor(6e6/n), 200, 4000)` 限制组数，但最低 200 组会突破 600 万次采样预算；合法参数 `σ=2、E=0.005` 得到 `n=614656`，总计约 **1.23 亿次同步采样**，期间主线程无法及时响应。
- **P2 风险：暂停后仍完整重画。**[montecarlo/app.js:324](/home/songyy/codex-review/knowledge-site/montecarlo/app.js:324) 即使暂停，仍每帧调用 `s0Draw()`；满 40,000 个点时，按 60fps 计算，每秒约执行 240 万次点绘制。适合增量绘图或 dirty 标记。
- **P2 风险：分形分块预算偏长。**[mandelbrot/app.js:266](/home/songyy/codex-review/knowledge-site/mandelbrot/app.js:266) 每块允许计算约 26ms，且只在行之间检查时间；深度迭代时单行也可能超预算。建议缩短预算，重计算再逐步迁移 Worker。
- 前述 Canvas 重复登记、倒地历史增长，会进一步放大长期运行成本，应优先解决。

**可访问性**

- **P2：210 个 HTML Canvas 均没有 `aria-label` / `aria-labelledby`。**部分页面有外部读数，这是有用基础；仍需把图表名称、说明和关键数据关联起来。
- 仅 15 个 Canvas 设置了 `tabindex`。三角函数、Z 变换等已有键盘支持；分形框选、卷积像素探查、傅里叶手绘等仍缺少充分的键盘等价入口。
- **P2：索引筛选会丢失键盘焦点。**[index.html:142](/home/songyy/codex-review/knowledge-site/index.html:142) 每次点击都清空并重建筛选按钮；已复现激活分类后 `document.activeElement` 变为 `BODY`。建议保留按钮节点，只更新选中状态。
- 语言、分类及预设选择普遍只靠 `.active` / `.on` 表达，缺少对应的 `aria-pressed`、`aria-current` 或适当选择语义。
- 未发现 `prefers-reduced-motion` 处理；全站平滑滚动及自动动画应提供减少动态效果的路径。
- [fourier/app.js:763](/home/songyy/codex-review/knowledge-site/fourier/app.js:763) 手绘仅处理 `pointerdown/move/up`，没有 `pointercancel`；触摸手势被系统取消时，绘制状态可能残留。

**已通过的布局基础检查：**索引及全部知识页在 390px、英文模式下未出现整页横向溢出；19 页 `fitCanvas()` 在 DPR 1/2/3 下重复调用均保持尺寸幂等。这不覆盖 Canvas 内部内容裁切，卷积负峰问题正是两者的区别。

---

**5. 按优先级排序的改进清单**

以下成本为单人粗估，包含针对性验证。

| 优先级 | 可落地改进及收益 | 成本 |
|---|---|---|
| 1 | 修复傅里叶预设的对象引用，使全部分量滑杆在切预设后继续有效。 | 低，约半天 |
| 2 | 钳住卷积滑动平均索引并显式处理末尾停顿，消除每轮 NaN。 | 低，约半天 |
| 3 | 补齐 Z 变换单位圆重根与频响奇异点判定，纠正不稳定系统的教学结论。 | 低至中，约 1 天 |
| 4 | 修正卷积负值纵轴及采样频谱相消边界，保证图像与实际计算一致。 | 中，约 1–2 天 |
| 5 | 修复 CLT 格心坐标和空样本绘图，消除累积偏移及重置残影。 | 低至中，约 1 天 |
| 6 | 对 Canvas 登记去重、倒地历史限制容量，消除持续增长的重绘成本。 | 低，约半天至 1 天 |
| 7 | 统一语言枚举校验及状态按钮渲染，覆盖运行中切语言和属性翻译。 | 中，约 1–2 天 |
| 8 | 给 CLT 设置真实采样预算，给暂停画面增加 dirty 标记，改善主线程响应。 | 中，约 1–2 天 |
| 9 | 保留索引筛选节点、补选择语义和图表说明，再补主要指针交互的键盘入口。 | 中，约 2–3 天 |
| 10 | 分批抽取 Canvas、i18n、调度器和基础 CSS，减少已发生的跨页修复漂移。 | 中至高，约 3–5 天 |
| 11 | 为数学核心补少量不变量与边界检查，并为部署脚本补成功校验和可重跑流程。 | 中，约 1–2 天 |

建议保留本次已验证的数值基线：卷积/FFT 一致、贝叶斯概率与赔率更新一致、特征向量残差约 `1e-15`、梯度有限差分一致、卡尔曼测试场景协方差正定、五种排序输出正确；回归检查应重点增加**对象替换、数组末尾、零样本、重根、负值显示及运行中切语言**这些当前缺口。