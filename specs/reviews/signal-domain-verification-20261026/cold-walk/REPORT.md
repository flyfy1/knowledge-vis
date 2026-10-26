# Sampling / Frequency Response：独立 UI-first 短审

日期：2026-10-25。执行环境：Mac，现有预览 http://127.0.0.1:18775 ，Chrome headless，桌面 1440×1000，窄屏 320×800。

## 方法与边界

- 先读祖先 `/Users/songyy/AGENTS.md` 和项目 `UI-I18N-SPEC.md`；没有读课程 app.js、i18n.js、BRIEF、根代理实施结论。
- 通过 Playwright 标准 DOM、按钮、range 输入、键盘和截图学习。没有用隐藏状态或页面内部 API 证明可理解性。
- 顺序：采样 EN S1–S4 → ZH S1–S4 → 频响 ZH S0–S6 交互 → EN S0–S6 对照 → 六条概念链接 → 320 键盘短试。
- 源项目只读；未启动、停止或探查服务进程，未安装依赖，未操作 LeetCode，未推送或部署。证据脚本只写当前任务目录。每段脚本都调用 browser.close()；Chrome 已释放。
- `38/39` 是首次冷走结束后，根代理明确提供路径的独立复现，不能冒称为盲走自行发现。

## 可复述的学习路径

| 页面/步 | 我从可见文字学到什么 | 我操作后实际看见什么 | 判断 |
|---|---|---|---|
| sampling S1 | 每隔 1/fs 秒记录一个值；黄点是样本，直线/阶梯是显示连接方式。f 与 fs 都用 Hz；横轴秒。 | 从直线切到阶梯，灰色原波、黄色样本不变，青色连法变化。 | 区分原信号与展示插值的主要正文清楚；“错误在连法”的结尾容易被下一步读成混叠由连线造成。 |
| sampling S2 | 原波与一个折入 [0, fs/2] 的低频候选波可穿过相同采样点，单看样本分不出。 | 9/10→1 Hz；14/20→6 Hz（翻转）；10/10→0 Hz；3/25→3 Hz。 | 预设兑现。标题“你连错了”偏向错误归因，建议与 S3 条件修复一起收紧。 |
| sampling S3 | 页面想说明 fs 与 2f 的关系，等号时采样可完全丢掉正弦。 | f=4，固定 fs=8，φ=90°点满幅、读数1.00；φ=0°点为零、读数0.00；fs=7读数混叠3 Hz；fs=9显示“点只可能属于原波”。 | 前三个观察成立；最后的唯一性断言缺带限候选条件，必须修复。 |
| sampling S4 | 采样后的谱副本按 fs 间隔出现；正频基带内可见别处折入的峰。 | f=13/fs=10：基带[0,5]标3 Hz；fs=30：基带[0,15]保留原13 Hz。 | Hz 标记一致、图与读数一致；应说明此处是实信号的正频视图，避免把[0,fs/2]说成一般完整频谱。 |
| freqresp S0–S1 | 用正弦探测 RC 低通；稳态输出同频、改变幅值/相位；ω单位rad/s。 | ω=1时两卡0.7071/−45°；扫到10 rad/s时0.0995/−84.3°，测量点增加。 | 学习闭环成立；连续图用x(t)、cos(ωt)。 |
| freqresp S2 | 幅值换成dB、频率用对数轴，R/C改变截止角频率。 | R增大，截止点向低频移；换题更换读图任务。 | 未见本轮相关断点。 |
| freqresp S3 | 数字移动平均处理M个样本；数字ω单位rad/样本；输入画x[n]=cos(ωn)。 | M8零点约0；旁瓣按钮给0.2292；低频0.20给非零输出；M2零点无区间内旁瓣，读数有解释。 | 连续/离散记号在图例及标签中区别清楚；零点公式条件遗漏，另有后述状态路径bug。 |
| freqresp S4 | 纯延迟保形，RC改变分量幅值及相位、脉冲被抹圆拖尾。 | 方波/脉冲按钮改变输入形状，纯延迟保持形状，RC仍圆滑。 | 未把数字样本误画为连续时间；相位/群延迟在此不是本轮扩展重点。 |
| freqresp S5 | 高通的截止点与低通同一τ；标准归一化带通的Q=峰频/半功率带宽。 | Q从5到19.95，峰变尖、半功率带宽20→5 Hz；Hz读数一致。 | 未见单位混用的可复现数值问题。公式用角频率、控件用f₀ Hz，最好就近补换算，但可由比值理解，不列独立阻断。 |
| freqresp S6 | Fs=4000 Hz下，模拟f折成数字ω=2πf/Fs；选择滤波器按50/500Hz指标验收。 | MA M8给50Hz衰减0.14dB、500Hz数值零/>120dB，验收通过。 | 转换说明可见，未把rad/sample叫Hz。 |

## 需要修复的问题

### CW-1 · P1：sampling S3 缺带限条件的唯一性断言

- URL：http://127.0.0.1:18775/sampling/#step3 。操作：f=4Hz，fs从8改9Hz。
- 中英正文：“高于两倍，采样点只可能属于原波，假波无从谈起” / “above twice, the samples can only belong to the original wave and no fake exists”。动态读数重复“the dots can only belong to the original”。
- 问题：即使fs>2f，不限制候选频带，f+kfs等仍能产生同样样本；唯一可恢复的结论依赖已知带限，以及理想采样/重建条件。仅凭“连点形状接近”也不能证明唯一恢复。
- 最小修复方向：在这一步明确候选信号限于严格低于fs/2的频带；解释青线只是直线显示，并非采样定理的理想重建。S1/S2“错误在连法/你连错了”建议同时避免把混叠归因于画线动作。
- 证据：`10-sampling-en-step3-above.png/.txt`，中文`14-sampling-zh-step3.png/.txt`，边界对照`08`、`09`、`11`。

### CW-2 · P2：freqresp S3 零点公式没有排除DC及2π整数倍

- URL：http://127.0.0.1:18775/freqresp/#step3 。正文中英均称“每当ω=2πk/M响应恰好为零” / “whenever … response is exactly zero”；公式注释同样未限制k。
- 同屏频响图在ω=0的增益画为1，因分子分母同时为零，不能用分子为零直接判零点。零点需排除k为M整数倍；一周期可写k=1,…,M−1，DC增益为1。
- 最小修复方向：补整数范围/排除条件，紧邻公式解释DC极限；不用扩展理论。
- 证据：`16-freqresp-zh-step3.png/.txt`、`27-freqresp-en-step3.png/.txt`。

### CW-3 · P1：根代理提供路径，独立复现M2→M3的幅值与原生控件不一致

- 明确归属：根代理在首次 UI-first 结果提交后提供此路径；本项是后续定向复现。
- URL：http://127.0.0.1:18775/freqresp/#step3 。操作：M调2→点击首零点→M调3。
- M2时：原生s3-w.value=3.13，max=3.13；页面当前ω=3.142，解析≈0，实测0。
- 继续M3：原生值仍3.13，页面ω仍3.142；解析|H|=0.3333，离散仿真实测幅值=0.6667。同屏两张数值口径不一致。
- 此复现完全依靠普通控件/DOM；没有调用隐藏状态或FREQ API。
- 证据：`explicit-M2-M3-results.json`、`38-parent-request-M2-zero.png`、`39-parent-request-M2-to-M3.png`。

### CW-4 · P2：sampling→Z5 跨页Hz/角频率衔接缺失

- sampling S4讲谱副本间距fs（Hz）；点击“同一件事，去z平面看条带与孪生点”到http://127.0.0.1:18775/ztransform/#step5。
- Z5转述“采样页那句……复制间距2π/T”，但sampling原句是fs。T滑杆及读数未标s，s极点虚部未标rad/s。
- 最小修复方向：写清T=1/fs秒、普通频率间距fs Hz、连续角频率间距2π/T rad/s，并给数字Ω=ωT rad/sample。不扩大到整页理论审计。
- 证据：`29-entry-ztransform5.txt`、`37-ztransform5-settled.png`。

## 概念入口与窄屏核验

- 六条实际点击入口均存在正确锚点：sampling→Fourier#step5、Ztransform#step5；freqresp→Laplace#step4、Ztransform#step6、LTI#step2、atlas/?trail=response&node=resonance#response-lab。入口标题及URL见`links-mobile-results.json`。这里只核对进入后的可见内容，不声称已审完这些课程。
- Z6解释单位圆数字频率Ω，演示读数给f=θfs/(2π)；LTI2清楚使用h[n]/x[n]。Fourier5用x(t)/X(f)；这些入口未见跳错概念。
- 320宽键盘：sampling固定2f后聚焦相位Home→0，满幅读数变0；freqresp聚焦s3-w ArrowRight→0.790，解析/实测均0.0060。两页body.scrollWidth均320。见`settled-check.json`、`36-mobile320-*-settled.png`。
- 早期`34/35`截图和部分`28–33`入口截图捕获了平滑滚动中间帧；最终位置以`36/37`及`settled-check.json`为准，不据中间帧判导航bug。
- 频响主路径pageerror=[]。没有启动音频，未审音色与听感；未做全站或完整无障碍认证。

## 交付状态

只读审查完成；本轮必须修复CW-1及CW-3，CW-2/CW-4是与本轮记号/单位直接相关的最小文案修复。未修改真实项目。所有Chrome实例已关闭并通知根代理；等待实施后的窄复验。没有denied、pending或uncertain的操作。
