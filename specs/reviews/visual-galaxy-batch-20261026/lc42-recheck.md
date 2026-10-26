# LC42 原Back输入丢失问题窄复验

2026-10-26。仅本地用户可见UI；未读源码、BRIEF、内部history或其它报告。不增加题目/算法审查。AI页面复验，非真实用户研究。Chrome已关闭，CLOSED、exit0。

**结论：原mustfix修复，限定范围zero remaining mustfix。**

390×1000视口，设末柱6、i=3，按Next三次至用户可见4/4（内部phase编号未读取）。离开前数组[3,0,2,0,6]，左max3、右max6、水位3、水深3。

点击“← LeetCode collection”→浏览器Back→明确reload。两次返回的整个lab可见文字均与离开前逐字一致，三个原生控件value也一致：预设0、i=3、末柱6。刷新后viewport截图显示目标i=3橙色底线、左右最高墙虚线框、橙色水位3与蓝色3格，公式高亮在depth行。没有再出现旧i=2计算。

随后各做一次：Reset steps保留数组/i=3/末柱6，回1/4，只有左max3、其余尚未计算；Restore default回默认数组、i=2/末柱4与1/4。均符合说明。

证据：recheck.cjs为自建UI脚本，recheck-ui.json保存操作前、Back、reload、两个reset的可见文字与控件值；唯一新增截图04-recheck-after-reload.png。初审review.md与原三张图保留。此次未复查先前其它已通过项，也未模拟损坏或拒绝history（根线程结果未计入独立证据）。
