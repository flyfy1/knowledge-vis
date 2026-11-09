# 二分查找 · 每次砍掉一半

## 教学目标

- 用有序数组建立“候选区间”模型，区分 `lo`、`mid`、`hi`。
- 把每次比较造成的区间缩短显示成可单步复算的轨迹。
- 通过改目标值观察路径从左、右、命中和不存在分叉。
- 用可调 `n` 对照线性查找与二分查找的比较次数，解释 `O(n)` 与 `O(log n)`。

## 交互契约

1. 每次点击“走一步”严格执行一次闭区间二分迭代；数组、目标和状态来自同一 `binaryStep`。
2. 灰色单元格已被排除；`mid` 橙色，命中绿色，读数同步 `lo / hi / comparisons`。
3. 目标输入、预设按钮和语言切换只重置或重绘，不改变排序数据。
4. 方向轨迹和复杂度卡片均由 `binarySearch`、`worstBinaryComparisons` 的真实结果驱动。
5. 页面不依赖网络资源，支持窄屏和中英文切换。

## 验证

- `node tests/core.cjs`
- `node --check app.js`
- `node --check i18n.js`

- 2026-11-09 canvas 文字修复（Claude Code，self-check）：页面加载 [`canvas-label-guard.js`](../../../canvas-label-guard.js)（说明见 specs/canvas-label-guard.md），重叠的画布标注会错开、文字不伸出画布。修后 `tests/canvas-text-overlap.cjs --sweep` 结果见 specs/reviews/canvas-text-survey-20261109.md。
- 同日补充：窄屏下第 1 步的 31 个数组格原来会排到画布外，现在放不下时分多行排列，下标行改为只显示数字，当前 mid 格的下标位置显示 mid。
