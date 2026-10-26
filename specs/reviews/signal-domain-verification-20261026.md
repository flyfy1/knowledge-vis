# 连续/离散信号短审与必要修复

状态：本轮实现与范围内验收完成，科学/source与独立UI最终均为0必须项。本验收阶段未push/部署；随后用户明确授权发布visual.integ.life，发布状态另由发布记录证明，不能用本地验收代替。无新课/节点/路线、模型、时钟、存储或学习画像。

## 选择依据与负面发现

从已有覆盖审计的δ[n]→频率响应域候选出发，短读sampling/freqresp及相关Z5，代表性查看Fourier/convolution/modulation的现有记号；没有宣称审完所有六门课程。fresh UI-first先走两课中英，再六条真实概念入口与320px键盘，不读源码/BRIEF。它确认采样单点/连接方式原本区分，频响S1rad/s、S3rad/样本/x[n]、S6的2πf/Fs原本正确；正常别名预设/六入口无断链。这些不是本轮新增功能。

实际必要缺口：采样S3无带限唯一性与等号‘运气’误导；有限两遍盒滤保证无假纹及CD采样率唯一因果过强；MA零点漏整数条件。可达M2→首零点π→M3既让native max3.13钳值，又使退化实测幅值从应有1/3报成2/3。根已跑红测试，独立UI在其原盲走后按明确提供路径复现，归属不混淆。Z5互链没有明确Hz/rad/s和T单位；atlas离散冲激关系需区别DTFT与连续积分。

[独立gate与根裁决](signal-domain-design-20261026.md)先于课内修复BRIEF/实现；source/science审阅和fresh UI-first是不同执行路径。P1最高价值为修已有科学/状态矛盾；P0无系统阻断；广泛Z稳定性/ROC/Fourier/音频硬件/完整重建实现不扩展。

## 实际改动

- `freqresp/app.js`：仅rank-one退化投影用存活基能量归一，以及原S3频率控件的精确值键步；其余RC/RK4/带通/设计台/quiz计算保留。原s3.M/w仍唯一状态；0.05..π、不新增DC控件，←/→0.005、Shift0.05、Home0.05、Endπ；Alt/Ctrl/Meta留给浏览器。
- `freqresp/{index.html,i18n.js,style.css,BRIEF.md}`：合法π/stepany、帮助关联、零点k非M倍数/0mod2π增益1、零响应相位/局部群延迟限定、既有单位换算。实测2倍字号S5长英文h2溢出8px局部换行；本次频率滑杆48px。无配色/token重造。
- `sampling/{index.html,i18n.js,BRIEF.md}`：t秒/n整数、已知带限/完整理想样本、显示插值与原波区别、Nyquist等号只能确定A sinφ、正频谱位置视图、有限盒滤残留及44.1带宽例。原aliasSigned、波形/音频/图像/相位/播放逻辑未改。
- `ztransform/{index.html,i18n.js,style.css}`：仅关联S5解释T秒、ωrad/s、Ωrad/样本、复制间距换算、主条带虚部方向及本图σ<0像范围。实际2倍字号英文页头/中文数学长串溢出分别局部修；周期滑杆48px和3px焦点。原Z函数/绘图/音频不动，不等于全Z科学审查。
- `atlas/data.js`：既有freqresp节点与impulse→freqresp关系就近区分CT/DT，不改变38节点/47关系/10路线或原连续极点关系。
- `atlas/tests/signal-domain-{core,browser}.cjs`：紧回归与实际可见条件断言；现有atlas索引、晨间三路径总览、前轮候选就近后继注记、设计/验收/证据延续同一系统。没有第四条晨间体验路线。

## 模型、条件与来源

独立有限tap和给出移动平均真值，M奇数在π增益1/M、偶数零；原样本序列没错，错在rank-one情况下仍用2/L投影。纯DC也检验但不是声称当前UI有DC入口。原均匀正弦采样精确、未含ADC量化/噪声；线连与保持不做sinc精确重建。数字单位需要采样率才能换成物理Hz。Z页只映指数模态，不是任意模拟系统的通用离散化。盒滤仍有旁瓣，滤波效果不作硬件保证。

一手依据：[TI AN236](https://www.ti.com/lit/pdf/snaa079)、[MIT2.161采样讲义](https://ocw.mit.edu/courses/2-161-signal-processing-continuous-and-discrete-fall-2008/2934569026a399e9062597924c730a78_lecture_10.pdf)、[Smith移动平均章](https://www.analog.com/media/en/technical-documentation/dsp-book/dsp_book_ch15.pdf)、[MIT DTFT讲义入口](https://ocw.mit.edu/courses/res-6-008-digital-signal-processing-spring-2011/resources/lecture-4-the-discrete-time-fourier-transform/)。各来源符号可能不同，未直接照搬为本站变量。gate/独立probe保存自己的推导和原错误，未复制教材全文，也未为CD标准历史额外造故事。

## 运行与验收范围

现有18775本机预览保持运行；没有进程检查/服务重启。无npm build、lint配置、TypeScript步骤；node语法与现有零依赖测试适用。

```sh
node atlas/tests/signal-domain-core.cjs
NODE_PATH=/Users/songyy/Documents/integ-life/integ-games/node_modules \
  ATLAS_BASE_URL=http://127.0.0.1:18775 SIGNAL_EVIDENCE=/tmp/signal-domain \
  node atlas/tests/signal-domain-browser.cjs
```

实际入口：[移动平均π边界](http://127.0.0.1:18775/freqresp/#step3)、[采样条件](http://127.0.0.1:18775/sampling/#step3)、[单边频谱与Z互链](http://127.0.0.1:18775/sampling/#step4)、[单位/条带](http://127.0.0.1:18775/ztransform/#step5)。本轮刷新沿用原课初始化/bfcache合同，没有新增跨课参数恢复；atlas的路线/locale/filter返回仍保留。

- 根新增core由真实旧maSim(3,π)0.6667vs0.3333变红；修后支持域/零点/别名/相位歧义/单位不变量绿。独立有限tap复算最大解析差约1.06e−15、测量差约5.00e−11；这不代表无限精度或学习效果。
- 受影响12条语法/模型/数据命令通过；根新浏览器两语原错误路径、preset/键盘/指针/locale、RC/设计台、真实Z链接、atlas Back、三课320px实际DOM字号×2/forcedcolors通过。此前程序化focus探针未先滚控件可见，补正确前置条件并保留实际视口/导航检查；未为该测试等待改产品。
- 既有atlas、response、真实来源锚点三套串行回归通过；未再次全跑48课/全部历史16套。源/science独立审阅无剩余必须；独立UI实际复验最终0必须项/0阻塞；其先盲走、后获指定路径复现、再修后复验的归属明确，未用源码/隐藏API代替教学可见性。
- 红与修复过程保留：频响长h2、Z页头/中文数学长串、Z1px焦点的原截图/DOM/失败日志；首轮纯DC红和实际可达π红分开；成功记录不覆盖先前失败。随后独立UI发现本次S4 HTML小于号未转义使正文截断，已用`&lt;`修正并增加真实可见全文断言；独立中英刷新及320px字号2倍确认带限/双边基带/正频半边与Z比较条件完整，保留原红截图。根新套件在最终HTML修复后两语再通过。不能仅凭数学正确宣布页面正确。

## 下一步与未验证

可本地继续：先复现eigen来源step4的学习任务是否需要调整；或按具体问题短审尚未验证的完整Fourier/Z/音频路径，不为覆盖率重复加课。已修本短审不是全信号内容已认证。优先真实学习者解释带限条件、别名和π单位换算；真实设备/触控硬件/读屏语音/音频实听/硬件性能/学习收益仍未知。本轮验收时尚未发布；用户随后另行明确授权部署，发布内容/状态应读独立发布记录。付费/新凭据/安全或系统设置变更仍未授权。

无新增未解决权限阻塞。每次写入核目标SHA，LeetCode及其他并发增量保留；最终并发与文件清单/独立报告/命令输出归档于本报告同名目录。后继Agent先核最新状态/指纹与索引，不把本轮限定结果当整站保证。
