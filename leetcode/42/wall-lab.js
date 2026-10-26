'use strict';
Object.assign(window.LESSON_COPY, {
  wallCredit: ['Codex 开发', 'Developed by Codex'],
  wallTitle: ['亲手验证：升高右墙，水就一定变多吗？', 'Does raising the right wall always add water?'],
  wallIntro: ['先固定位置 i = 2，只改变最右柱的高度。按“下一步”依次找两侧最高墙、取较低高度、减去柱高。再把右墙调到 1 和 6 比较：先上升，超过左侧最高墙后就不再增加。', 'Keep i = 2 fixed and change only the last bar. Use Next to find each side’s highest wall, take the lower height, then subtract the bar. Compare right-wall heights 1 and 6: the water rises only until the left wall becomes the limit.'],
  wallScope: ['这是独立的小数组模拟，演示前一步 baseline 对一个位置的计算；不会更改下方双指针回放。每格高 1、每柱宽 1。灰色是柱子，青色格是已算出的水，橙色底线标出所选位置 i，虚线框标出已找到的最高墙。', 'This separate small-array simulation expands the baseline calculation for one column; it does not change the two-pointer trace below. Each square is 1 high and each bar is 1 wide. Gray cells are bars, cyan cells are calculated water, the orange underline marks i, and dashed outlines mark the highest walls found so far.'],
  wallPreset: ['起始预设（当前数组见下方）', 'Starting preset (current array below)'],
  wallPreset0: ['两侧有墙 [3,0,2,0,4]', 'Basin [3,0,2,0,4]'],
  wallPreset1: ['较矮右墙 [3,0,2,0,1]', 'Low right wall [3,0,2,0,1]'],
  wallPreset2: ['相同高度 [3,3,3]', 'Equal heights [3,3,3]'],
  wallPreset3: ['全为零 [0,0,0]', 'All zeros [0,0,0]'],
  wallPreset4: ['单根柱 [4]', 'Single bar [4]'],
  wallFocus: ['所选位置 i（从 0 开始）', 'Selected index i (starts at 0)'],
  wallHeight: ['最右柱高度（更改会从找左墙重新开始）', 'Last bar height (changes restart at the left wall)'],
  wallBack: ['← 上一步', '← Previous'],
  wallNext: ['下一步 →', 'Next →'],
  wallReset: ['重置演算', 'Reset steps'],
  wallRestore: ['恢复初始实验', 'Restore default'],
  wallResetHint: ['重置演算保留当前数组和所选位置；恢复初始实验会回到 [3,0,2,0,4]、i = 2。换数组、位置或高度会清除旧演算。', 'Reset steps keeps the current array and index. Restore default returns to [3,0,2,0,4], i = 2. Changing the array, index, or height clears the old calculation.'],
  wallLeft: ['左侧最高（包括 i）', 'Left maximum (includes i)'],
  wallRight: ['右侧最高（包括 i）', 'Right maximum (includes i)'],
  wallLevel: ['可达到的水面高度', 'Possible surface height'],
  wallDepth: ['仅位置 i 的水深', 'Water depth at i only'],
  wallUnknown: ['尚未计算', 'Not computed'],
  wallStage0: ['1 / 4 · 左侧：height[0..{i}] = [{slice}]，最高为 {left}（位置 {li}）。先只标出左墙；另一侧尚未检查。', '1 / 4 · Left side: height[0..{i}] = [{slice}]. Its maximum is {left} at index {li}. Only the left wall is marked; the other side is still unchecked.'],
  wallStage1: ['2 / 4 · 右侧：height[{i}..{last}] = [{slice}]，最高为 {right}（位置 {ri}）。两侧都包括当前柱，因而最终水深不会为负。', '2 / 4 · Right side: height[{i}..{last}] = [{slice}]. Its maximum is {right} at index {ri}. Both ranges include the selected bar, so its final depth cannot be negative.'],
  wallStage2: ['3 / 4 · 水面高度 = min({left}, {right}) = {level}。高于 {level} 的水会越过较矮的一侧；橙色虚线标记这一高度，它还不是水深。', '3 / 4 · Surface height = min({left}, {right}) = {level}. Water above {level} escapes over the lower side. The orange dashed line marks this height, which is not the water depth.'],
  wallStage3: ['4 / 4 · 位置 {i} 的水深 = {level} − {bar} = {depth}。青色格只画这一个位置的水，不是整个数组的总水量。', '4 / 4 · Depth at index {i} = {level} − {bar} = {depth}. Cyan cells show water at this column only, not the total for the array.'],
  wallChartLabel: ['横轴为位置，纵轴为高度；所选位置 {i}，柱高 {bar}。', 'Horizontal axis: index; vertical axis: height. Selected index {i}, bar height {bar}.'],
  wallBridgeTitle: ['从两个完整区间，走向两个已知边界', 'From full ranges to two known bounds'],
  wallBridge: ['这个实验先扫描两侧，得到一个位置的精确水深。若每个位置都重新扫描，就是上一步的 O(n²) baseline。双指针把工作缩小：left_max 只记录已看过的左边，right_max 只记录已看过的右边。在每轮先纳入当前两端柱子后，若 left_max ≤ right_max，右边已经有一堵至少同样高的墙；更远、更高的墙也不会抬高由左边限制的水面，所以可以确定 left 位置的水深。反之结算 right。相等时任意一侧都安全，这份 Python 选择左侧。', 'This experiment scans both full ranges to get one exact depth. Repeating those scans at every index gives the O(n²) baseline above. Two pointers retain only the maxima already seen from each side. After including both current endpoint bars, if left_max ≤ right_max, a wall at least as high already exists on the right. Any higher wall farther inside cannot raise the surface limited by the left side, so left can be settled. Otherwise settle right. On a tie either side is safe; this Python chooses left.'],
  wallEdge: ['端点为什么没有水？端点一侧的区间只有它自己，min 不可能高于自身柱高。单柱、全零、平顶都遵循同一公式。注意：把最右柱降到 1，不代表右侧最高墙就是 1；中间的柱子仍可能更高。', 'Why are endpoints dry? One side’s range contains only the endpoint itself, so the minimum cannot exceed its own height. Single bars, all zeros, and flat arrays obey the same formula. A last bar of height 1 does not imply a right maximum of 1: an interior bar may be taller.']
});

window.RainWallLab = {mount() {
  const $ = id => document.getElementById(id);
  const presets = [[3,0,2,0,4], [3,0,2,0,1], [3,3,3], [0,0,0], [4]];
  let height = presets[0].slice(), index = 2, phase = 0;
  const t = (key, values = {}) => window.LESSON_COPY[key][document.documentElement.lang.startsWith('zh') ? 0 : 1]
    .replace(/\{(\w+)\}/g, (_, name) => String(values[name]));
  function element(tag, value, cls) {
    const node = document.createElement(tag);
    if (value !== undefined) node.textContent = value;
    if (cls) node.className = cls;
    return node;
  }
  function render() {
    const s = RainWallModel.inspect(height, index);
    $('wall-input').textContent = 'height = [' + height.join(', ') + ']';
    $('wall-height-value').textContent = String(height.at(-1));
    $('wall-height').value = height.at(-1);
    $('wall-prev').disabled = phase === 0;
    $('wall-next').disabled = phase === 3;
    const values = {...s, i: index, li: s.leftIndex, ri: s.rightIndex, last: height.length - 1,
      slice: (phase === 0 ? height.slice(0, index + 1) : height.slice(index)).join(', '), bar: height[index]};
    $('wall-message').textContent = t('wallStage' + phase, values);
    [['left',0], ['right',1], ['level',2], ['depth',3]].forEach(([key, start]) => {
      $('wall-' + key).textContent = phase >= start ? String(s[key]) : t('wallUnknown');
    });
    document.querySelectorAll('.wall-code code').forEach((node, i) => node.classList.toggle('active', i === phase));
    const chart = $('wall-chart');
    chart.replaceChildren();
    chart.style.setProperty('--columns', height.length);
    chart.setAttribute('aria-label', t('wallChartLabel', values) + ' ' + $('wall-message').textContent);
    const maximum = Math.max(1, ...height);
    const axis = element('div', undefined, 'wall-axis');
    for (let y = maximum; y >= 1; y--) axis.append(element('span', String(y), 'wall-unit'));
    axis.append(element('small', '0')); chart.append(axis);
    height.forEach((h, i) => {
      const boundary = i === s.leftIndex || (phase >= 1 && i === s.rightIndex);
      const col = element('div', undefined, 'wall-column' + (i === index ? ' selected' : '') + (boundary ? ' boundary' : ''));
      for (let y = maximum; y >= 1; y--) {
        const water = phase === 3 && i === index && y > h && y <= s.level;
        col.append(element('span', undefined, 'wall-unit' + (y <= h ? ' solid' : water ? ' water' : '') + (phase >= 2 && i === index && y === s.level ? ' level' : '')));
      }
      // At level zero there is no cell with y=0; mark the baseline instead.
      if (phase >= 2 && i === index && s.level === 0) col.style.borderBottom = '3px dashed var(--accent2)';
      col.append(element('small', 'i=' + i), element('small', 'h=' + h));
      chart.append(col);
    });
  }
  function setOptions() {
    $('wall-focus').replaceChildren(...height.map((_, i) => {
      const option = element('option', String(i)); option.value = i; return option;
    }));
    $('wall-focus').value = index;
  }
  $('wall-preset').addEventListener('change', event => {
    height = presets[Number(event.target.value)].slice(); index = Math.min(2, height.length - 1); phase = 0; setOptions(); render();
  });
  $('wall-focus').addEventListener('change', event => {index = Number(event.target.value); phase = 0; render();});
  $('wall-height').addEventListener('input', event => {height[height.length - 1] = Number(event.target.value); phase = 0; render();});
  $('wall-prev').addEventListener('click', () => {phase = Math.max(0, phase - 1); render();});
  $('wall-next').addEventListener('click', () => {phase = Math.min(3, phase + 1); render();});
  $('wall-reset').addEventListener('click', () => {phase = 0; render();});
  $('wall-restore').addEventListener('click', () => {
    height = presets[0].slice(); index = 2; phase = 0; $('wall-preset').value = '0'; setOptions(); render();
  });
  new MutationObserver(render).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  setOptions(); render();
  window.wallSnapshot = () => ({phase, ...RainWallModel.inspect(height, index)});
}};
