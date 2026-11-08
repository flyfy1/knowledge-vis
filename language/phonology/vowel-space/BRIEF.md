# BRIEF：元音空间（vowel-space）· 用两个共振峰给元音定位

- **作者 Agent**：Claude Code（`claude-opus-5-5`），2026-11-08 从零编写（原创版本，见 [AUTHORSHIP.md](../../../AUTHORSHIP.md)）
- **起因**：Yangyu 要求扩充只有一页的 language/phonology 子主题，并在 metadata 中记明是 Claude 写的
- **评审状态**：仅自检（self-check）；独立评审待做

## 定位

- 路径 `language/phonology/vowel-space/`，category `language`，subtopic `phonology`，stage `senior`。
- 受众：高中高年级及以上；知道「频率」和「倍数」即可，对数页、傅里叶页、共振页可作前置。
- 一句话直觉：**元音是 F1–F2 平面上的一个位置，但坐标要先按说话人的整体高低校准。**
- 与兄弟页的分工：`phonemes` 讲发音动作、音位对立、音节与同化（不含声学测量）；本页只讲元音的声学测量。
- v1 不含声音。

## 教学链（每步五项）

| 步 | 读者已知 | 唯一要回答的问题 | 输入 → 想求的量 | 操作与预期观察 | 结论适用条件 |
| --- | --- | --- | --- | --- | --- |
| 0 共振峰 | 频率 | 一个元音里哪些数决定它是哪个元音？ | 词、说话人组 → F0、谐波、F1–F3 | 换组：谐波间距 136→270 Hz；换词：谐波不动、峰移动 | 峰形是示意，只有位置是数据 |
| 1 F1–F2 平面 | 共振峰 | 只用 F1、F2 能分开 10 个元音吗？ | 男性 10 个平均点 | 点词高亮；heard 读数提示 F3 偏低 | 平均值；单个录音会散开 |
| 2 三组说话人 | 平面 | 不同人说同一个词，点会重合吗？ | 三组开关、词 → 三组 F1/F2 与儿童÷男性 | 三圈形状相近、整体错开；比值多在 1.2–1.5 | 儿童组 15 人、男女混合 |
| 3 男性模板 | 三组错开 | 只看绝对频率去认会怎样？ | 组 → 最近的男性模板（对数平面距离） | 女性 7/10、儿童 3/10 认对 | 只比较平均点 |
| 4 整体缩放 | 认错原因 | 怎样去掉「谁在说」的影响？ | λ、组 → 平移后的圈、平均距离、认对数 | λ 0→1：两组都到 10/10 | 归一化用到该组全部 10 个元音（页面明说） |
| 5 收束 | — | — | — | 公式、边界、判断题、4 条互链 | — |

判断题正确项：儿童整体偏高，单看绝对频率落进男性另一个元音附近；按本组整体缩放后认对。

## 新术语首次出现表（规则 11）

| 术语 | 首次出现 | 白话口径 |
| --- | --- | --- |
| 基频 F0、谐波 | s0e | 每秒重复次数，听起来是音高；F0 的整数倍频率 |
| 共振峰 F1–F3 | s0e | 声道共鸣放大的峰，从低到高编号 |
| F1–F2 平面、对数刻度 | s1e | 横 F2、纵 F1；相同距离代表相同倍数 |
| 说话人组 | s2e | 男 33、女 28、儿童 15（8 名女孩） |
| 模板、最近的男性模板 | s3e | 男性 10 个平均点；对数平面上直线距离最近者 |
| 归一化、几何平均、λ | s4e | 按组几何平均之比缩放；相乘再开 10 次方；缩放程度 |

## 数据来源（可复现）

- 原始研究：G. E. Peterson & H. L. Barney (1952), "Control methods used in a study of the vowels", *JASA* 24(2): 175–184。**本页没有取得原文或其 Table II**；页面和测试里的数字都不是 Table II 的数，也不声称与它在多少 Hz 内一致。
- 数据路径：Praat 源码 `dwtools/Table_dataSets.cpp`，`Table_create_petersonBarney1952`。抓取自 <https://raw.githubusercontent.com/praat/praat/master/dwtools/Table_dataSets.cpp>，当时 master 为 commit `6a9874e525d80a2b4c2e6a8d687081963c6d4e6a`（2026-11-08），文件 sha256 `3027b8856df330f4abf9149b140d87411d4de835dc8d7c821cc0c1e2b1da3cc3`。
  - 源码注释说明：数据来自 Ignatius Mattingly 1990 年提供的印刷版，经 UPenn FTP 分发；1520 行 = 76 位说话人 × 10 个元音 × 2 次；33 男、28 女、15 儿童；儿童 62、63、65、66、67、68、73、76 号为女性；hVd 词。
  - Praat 手册页 *Create formant table (Peterson & Barney 1952)*（docs/manual，同一 commit）给出词与标签：heed iy, hid ih, head eh, had ae, hod aa, hawed ao, hood uh, who'd uw, hud ah, heard er；IPA 用 P&B 原文记法。
- 本页的处理：用 `tools/pb-means.cjs` 对每组每个元音的**全部** token 求平均（包括源码 `star` 字段为 1 的 321 行；源码对该字段的说明仅为 "was there a * in front of the vowel-type?"），四舍五入到 1 Hz，写入 `sim-core.js` 的 `MEANS`。只提交 30 组均值，不提交 1520 行原始数据（原始数据位于 GPL 源码内）。
  - 复现：`node tools/pb-means.cjs <Table_dataSets.cpp 路径>`，输出 `MATCH sim-core.js MEANS`。
  - 标签检查（`tests/core.cjs`）：三组都满足 F2 ʌ > ɑ > ɔ，且 ɔ 的 F1 最低。

## 其他事实来源

- 「共振峰 = 从喉到唇的声道的共鸣」、「P&B 表明除 /ɝ/ 外美式英语元音大体可用 F1、F2 解释，各元音区域边界略有重叠，男、女、儿童的划分不同」：UIUC ECE590SIP（2018 春）*Spectrogram Reading Seminar, Lecture 4*，<https://courses.grainger.illinois.edu/ece590sip/sp2018/spectrograms4_vowels.html>（页面写作「讲义对 P&B 的概括」，未当作原文引述）。
- 第 1 步「heed、who'd 的 F1 最低」等排序、第 2 步比值区间、第 3–4 步认对数，都是本页数据算出来的，由 `tests/core.cjs` 固定。

## 页面自定的约定（页面明说）

- F1–F2 平面的方向（F2 从右往左增大、F1 从上往下增大）和两轴对数刻度，是本页的选择，不归于 P&B 原图。
- 第 0 步谱线的峰形与带宽是示意画法。
- 归一化方法（按组几何平均之比缩放，F1、F2 分开）和最近模板识别都是本页的教学设定，没有声称与任何文献的方法相同；也不讨论听者实际怎样归一化。
- 不讨论儿童与成人差异的生理原因（未取得来源）。

## 跨页链接（规则 12）

- 出链：s0e → `signal/transforms/fourier/#step5`、`physics/waves/resonance/#step3`；s1e → `math/algebra/exponents-logarithms/#step3`；终章 → `phonemes/#step0`、`#step1`、`resonance/#step3`、`fourier/#step5`。
- 入链：CONCEPT-MAP 登记；`phonemes`（authorship.cjs 推导为 Codex 所写）本次不改。

## 可访问性与双语

- 中/英由 `knowledge-lang` 切换，切换不清空选择；词、组按钮带 aria-pressed；原生 checkbox/range/radio；读数 aria-live。
- 无自动动画。已检查宽度 1280 / 390 / 320、中英文、减弱动态，无横向溢出，无控制台错误。
