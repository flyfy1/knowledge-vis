/* One registry entry per published lesson. See specs/leetcode-explainers.md. */
window.LEETCODE_PROBLEMS = [
  {
    id: 2916,
    title: {zh: '子数组不同元素数目的平方和 II', en: 'Subarrays Distinct Element Sum of Squares II'},
    desc: {
      zh: '从 6 个子数组的手算出发，发现最后一次出现位置决定的更新区间，再亲手推导平方和与懒标记。',
      en: 'Start with six subarrays, discover the update interval from the previous occurrence, then derive square-sum updates and lazy propagation.'
    },
    difficulty: 'hard',
    topics: [{zh: '固定右端点', en: 'Fixed right endpoint'}, {zh: '线段树', en: 'Segment tree'}, {zh: '懒标记', en: 'Lazy propagation'}],
    path: '2916/',
    language: 'Python',
    complexity: 'O(n log n)'
  }
];
