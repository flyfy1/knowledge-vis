# BRIEF：波的干涉（interference）· 高中物理

## 定位
- slug `interference`，category physics，stage senior。受众：高中生 + 家长。前置：三角函数/正弦曲线（站内三角页）、波长频率的基本概念（页面内自足交代）。干涉是波动最反直觉的现象：两列波相加，能加出「更响」也能加出「安静」——而且静点永远静、响点永远响，图样稳定。
- 核心直觉一句话：**波相遇时每一点的振动是两列波的相加：步调一致就加强、步调相反就抵消；某个点加强还是抵消，只看它到两个波源的路程差是波长的整数倍还是半整数倍——所以干涉图样是稳定的**。
- 已知：正弦曲线、水波纹扩散的样子。唯一新问题：两列波叠在一起，为什么有的地方更闹、有的地方反而没波，而且图样不动？

## 步骤（每步五必填项：已知 / 唯一问题 / 输入与求量 / 控件操作与预期观察 / 结论适用条件）
1. **一列波先看清**：已知水波纹；唯一问题：一列波走到某点，那点的水面怎么动？控件：单个波源点动（俯视同心圆纹）+ 侧面波形曲线双视图联动（点一个观测点 P，读数给 P 的位移随时间正弦变化、振幅 A、周期 T）；波长 λ 由相邻波峰间距在图上量出并标示。预期观察：P 点只是上下振动、不随波跑（质点不迁移一句点明）。结论：一列波 = 振动的传播，每点的位移随时间按正弦变化。适用：简谐波口径。
2. **两个波源：加强与抵消**：唯一问题：再放一个同频波源，哪些点变强、哪些点变弱？控件：双源俯视图动画（同相位、同频、同 λ），点任意观测点 P：读数给到两源的路程 r₁、r₂、路程差 Δr 与 Δr/λ、两列波到达 P 的位移与合成位移的时序小图；沿中垂线与两侧拖动 P，采到 Δr=0（合振幅 2A）、Δr=λ/2（合振幅 0、该点始终不动、静点标记）两类典型点。预期观察：同样的两列波，换个位置结果完全不同——取决于路程差。结论：**Δr=kλ 加强、Δr=(k+½)λ 抵消**（k=0,1,2…），合成位移动画与读数同源于两列正弦实算（y=A·sin(ωt−kr)+A·sin(ωt−kr₂) 叠加，不得用示意幅度冒充）。
3. **稳定的图样**：唯一问题：动画里波纹乱成一团，为什么说图样稳定？控件：切换「包络视图」——把加强点的连线（双曲线族）与静止点的连线（另一组双曲线）叠印在俯视图上，动画继续时连线不动；滑杆改 λ（频率），双曲线族疏密随之变（λ 越小线越密）；点任意点仍可读 Δr 判定它落在哪种线上。预期观察：闹与静的位置由几何定死、不随时间漂移。结论：干涉图样 = 由路程差决定的双曲线族；适用条件：两波源同频（相位差恒定，本页用同相位）——不同频不形成稳定图样，一句明说。
4. **相位也能翻转**：唯一问题：两源步调一开始就反着（一个起波峰、一个起波谷），图样怎么变？控件：相位差开关 0 / π 两档切换（滑杆 0–π 连续亦可，但判定读数以 0 与 π 两档为准），包络连线整体互换（原加强线变静线）；观测点读数给两源相位差参与的合成（实算）。预期观察：图样还是双曲线族，只是加强/静止两族对调。结论：决定加强抵消的是「到达时的步调差」= 路程差贡献 + 初始相位差，两笔账合起来算。
5. **自测 + 终章**：①某点 Δr=1.5λ、同相双源，它是加强还是静点（静点）；②把 λ 减半，原静点（Δr=λ_old/2）变成什么（Δr=λ_new、加强——须借判定实测）；③判断题「干涉时静点是因为没有波到达」（错：两列波都到达、恰好抵消）。终章三卡（相加是本质 / 路程差定加强抵消 / 图样由几何定死）+ 深链：reflection-refraction 是光的界面行为不硬链；双缝干涉一句埋线纯文本（光的干涉同理、条纹间距在光学线展开，本页不链）；若站内三角函数页有正弦叠加步可回链（构建者查 CONCEPT-MAP 后按实锚点定，无贴切则不链并说明）。

## 新术语首现表（首现处就近一句话解释）
- 波长 λ（第 1 步）、振幅（第 1 步）、波源（第 1 步）、路程差（第 2 步）、干涉（第 2 步收口：一词定义为「两列波叠加后强弱分布稳定的现象」）、相位/相位差（第 4 步：步调差）。

## 硬性规范（照 UI-I18N-SPEC.md 与 WORKFLOW.md）
- 双语 #langToggle / knowledge-lang、键集占位符一致；页头/骨架/深色主题照 fractions 与 pythagoras。
- 合成位移必须由两列波方程实算：y=A sin(ωt−k r₁)+A sin(ωt−k r₂)（第 4 步加相位差 φ）；断言自查：Δr=0 点合成振幅 2A（时序极值 ±2A）、Δr=λ/2 点任意时刻 y≈0（采样多时刻 <1e-9）、Δr=λ 点 2A；包络判定（加强/静点线归属）与 Δr/λ 的 k/半整数分类纯函数一致。
- 动画性能：俯视图纹动画以可读为准，帧内不做全像素逐点波场计算（可用圆环纹示意 + 观测点实算时序的双层方案，但**观测点读数与判定必须实算**、圆环纹只作视觉、不得与读数矛盾——波纹相位与源振动相位一致）；构建报告须明说视觉层与计算层的边界。
- 状态一致性：拖 P×切 λ×切相位×答题、切语言×各步状态；静点标记进出干净。
- 390 宽零溢出；console 零错误。
- 文件：interference/{index.html,app.js,i18n.js,style.css} + BRIEF.md 副本。不要动 pages.config.js 与 CONCEPT-MAP.md，不要动其他页。

## 交付
- 自查：node --check、键集比对、上述断言组、无头浏览器实测（含组合路径与 390）。
- 报告 ~/workspace/interference-lab/build-report.md。

## Codex phase-comparison correction — 2026-10-26

The earlier two-preset/absolute-path and broad-classification contract is superseded only by [relative-phase spec](../specs/interference-phase.md), after independent design gate. Existing yAt/ySum/source geometry and other course flow retained. Confirmed defect: near-half-cycle0.03window labelled nonzero motion as strictly still. Canonical strict phase/B helper repairs it, signed d=r2−r1 for continuousφ. S3keeps one P/t/φ and oldclock; changingφ pauses and immediately rebuilds CURRENT-parameter analytic2T traces, not recorded history, with instantaneous y(t) versus B separated. Coherent equal-received-amplitude linear/normalized model, no spreading or energy-flow inference. θ/δ/φ first-use units and source/energy boundaries beside controls. Samepointφ0/π/2/π/2π prediction, reset/oldpresets/nativecoordinates, historyentry paused recovery, ENZHmobilekeyboard acceptance. One existing-course graph node/application link, no new route/model. User-authorized shared graph/provenance/spec edits override the original worker-only file boundary. Original Alberto/Muse contributions are retained and not reattributed as Codex original authorship.

Accepted Codex implementation source: 595ee8e6dc5b07855ce1cba8799eead33b1dd760. One revised-edition header/inventory record credits only this increment; original844643ca Alberto/Muse source retained. Publication and public verification are separate from source identity.
