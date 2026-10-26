# 驻波S2边界独立UI冷走

390手机，UI-first；未读source/spec/brief/既有报告，仅S2本次增量，不审S4。AI页面试走，非人类学习效果研究。每个短脚本finally关闭Chrome，不改产品。

操作前预测：L6、λ6.05的q≈1.98347不是整数；即使某一瞬间端点恰为0，全周期端点包络仍非0，所以不是两固定端单模态。Snap应到λ6、n2，包络全周期归0。另选L6.1、λ4时q3.05不匹配；Snap到n3应保留完整λ=12.2/3≈4.066666667，而非强压到0.05网格。

## 结论

物理/交互限定检查通过；**1项mustfix：波长滑杆没有无障碍名称。** 所有自有Chrome已finally关闭、exit0/CLOSED；根线程已获串行释放信号。未读源码/spec或S4，未改产品。

### Mustfix证据

S2可见“Wavelength λ”文本没有关联到实际range。UI检查：nativeLabels=[]，aria-label/aria-labelledby/title均null；实际ariaSnapshot为`- slider: "4"`，S2存在1个无名slider。它能键盘聚焦/调值，但读屏无法按名称识别波长；应关联现有可见label或aria-labelledby。wavelength-accessibility-ui.json保存独立UI无障碍结果，不是源码推断。

### 实际试走

- EN390近模式按钮：L6/λ6.05，q≈1.98347107，瞬时右端/全周期包络均≈0.103807636A。明确写“不兼容试探，不是已成立模态”；图实际为青色虚线、红圈端点/红虚线包络，白钉仍在要求的0处。
- Snap聚焦后Space：λ6/q2、端点包络0，图变绿色实线并显示节点。cold-EN-near.png与cold-EN-snap.png已逐张检查。
- 原生控件L6.1、λ4给q3.05/包络≈0.31286893A，仍不兼容。Snap用Enter后λinput=4.06666666666667、q3、模态n3。随后λ键盘ArrowRight得4.11666666666667且重新不兼容；再次Snap恢复完整非0.05格点值。
- 实际Reset回L6/λ4、t0、暂停、n3。再次设置并Snap非默认值后切中文，L6.1/完整λ值与匹配状态保持；中文近模式→Snap同样正确。
- 页面把“固定端每一时刻为零”与“瞬时过零”说清，也并列显示瞬时端点和全周期包络。它明确图画不兼容试探不代表真实固定弦运动；T=4秒只是候选空间形状演示，不是固定波速弦扫频。本轮实际快照为t0，未另取恰好cos(ωt)=0的帧，不把该未测项算运行通过。
- 中文限定S2的HTML字号/像素行高各×2，页面宽390、文字换行可纵滚，截图cold-ZH-200.png。图内固定绘图字号未计入完整200%认证。

initial-ui.json为初读，tasks-ui.json保存控件原生值/标签和各状态全文。除上述名字缺失外未发现已证实mustfix；未审其它步骤、原生触控、全键盘边界组合或全模型参数矩阵，也未以根线程科学/数值回归替代独立证据。

## 原mustfix修后窄验

只复验波长滑杆名字，没有重走物理/交互全流程。EN原生labels为`Wavelength λ (length units)`，ZH为`波长 λ（单位长度）`；两语按slider名称λ定位各1个，S2无名slider均0，实际ariaSnapshot含对应双语名称和值4。证据named-slider-recheck-ui.json。

浏览器finally关闭、CLOSED/exit0，已通知根线程可run focused。**原mustfix修复，限定S2最终zero remaining mustfix。** 上方原发现保留，不读源/spec。
