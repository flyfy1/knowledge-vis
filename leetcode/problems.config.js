/* Registered lessons, sorted by official frontend ID. */
window.LEETCODE_PROBLEMS = [
  {
    "id": 4,
    "title": {
      "zh": "寻找两个正序数组的中位数",
      "en": "Median of Two Sorted Arrays"
    },
    "desc": {
      "zh": "先把较短数组叫 a。切口 i 表示从 a 取多少个数到左边；j=half−i，half=(m+n+1)//2，保证左半边恰好多一个或与右边一样多。两数组内部已有序，所以只需检查 aL≤bR 和 bL≤aR。",
      "en": "Call the shorter array a. Cut i puts i values of a on the left; j=half−i with half=(m+n+1)//2 gives the required left size. Each array is already sorted, so only aL≤bR and bL≤aR need checking."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "二分划分",
        "en": "Binary partition"
      }
    ],
    "path": "4/",
    "leetcodeUrl": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    "language": "Python",
    "complexity": "O(log(min(m,n)+1))"
  },
  {
    "id": 10,
    "title": {
      "zh": "正则表达式匹配",
      "en": "Regular Expression Matching"
    },
    "desc": {
      "zh": "dp[i][j] 表示 s 的前 i 个字符与 p 的前 j 个字符能否完全匹配。普通字符或 . 只看左上格 dp[i−1][j−1]。遇到 x*，零次用 dp[i][j−2]；一次以上要求当前字符匹配 x，再用 dp[i−1][j]。",
      "en": "dp[i][j] means the first i text characters fully match the first j pattern characters. An ordinary atom or . uses the diagonal dp[i−1][j−1]. For x*, zero repeats use dp[i][j−2]; one more repeat requires an atom match and dp[i−1][j]."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "前缀动态规划",
        "en": "Prefix dynamic programming"
      }
    ],
    "path": "10/",
    "leetcodeUrl": "https://leetcode.com/problems/regular-expression-matching/",
    "language": "Python",
    "complexity": "O(mn)"
  },
  {
    "id": 23,
    "title": {
      "zh": "合并 K 个升序链表",
      "en": "Merge k Sorted Lists"
    },
    "desc": {
      "zh": "最小堆是一棵以数组保存的完全二叉树，父节点值不大于孩子；根就是所有候选中最小的。数组下标 h 的孩子是 2h+1、2h+2。只保存每条尚未耗尽链表的第一个节点。",
      "en": "A min-heap is a complete binary tree stored in an array; parents are no greater than children, so the root is the minimum. Array position h has children 2h+1 and 2h+2. Store only the first remaining node of each list."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "最小堆",
        "en": "Min-heap"
      }
    ],
    "path": "23/",
    "leetcodeUrl": "https://leetcode.com/problems/merge-k-sorted-lists/",
    "language": "Python",
    "complexity": "O(k + N log(k+1))"
  },
  {
    "id": 25,
    "title": {
      "zh": "K 个一组翻转链表",
      "en": "Reverse Nodes in k-Group"
    },
    "desc": {
      "zh": "dummy 是值无关的虚拟前驱，统一处理第一组。group_prev 指向组前节点；先向后数 k 步找 kth。找不到就直接结束。group_next=kth.next 保存组外后继；prev 初始指向它，curr 指向组头。",
      "en": "dummy is an artificial predecessor that makes the first group ordinary. group_prev precedes the group. Walk k links to find kth; stop if it does not exist. group_next=kth.next preserves the suffix. Start prev there and curr at the group head."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "指针重连",
        "en": "Pointer rewiring"
      }
    ],
    "path": "25/",
    "leetcodeUrl": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
    "language": "Python",
    "complexity": "O(n)"
  },
  {
    "id": 30,
    "title": {
      "zh": "串联所有单词的子串",
      "en": "Substring with Concatenation of All Words"
    },
    "desc": {
      "zh": "把起点按除以 w 的余数分成 w 条扫描轨道。每条轨道 right 每次增加 w；left 是窗口左边界，图里的 right 是右端之后的字符下标。need 是所需次数，have 是当前次数，used 是词总数。",
      "en": "Partition starts into w tracks by their remainder modulo w. Each track advances right by w. left is the window start; the displayed right is the exclusive end. need stores required counts, have current counts, and used the number of words."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "定长滑动窗口",
        "en": "Word-aligned sliding window"
      }
    ],
    "path": "30/",
    "leetcodeUrl": "https://leetcode.com/problems/substring-with-concatenation-of-all-words/",
    "language": "Python",
    "complexity": "O(Lw + kw) expected time; O(kw) auxiliary space plus output (L text characters, k words, w word width)"
  },
  {
    "id": 32,
    "title": {
      "zh": "最长有效括号",
      "en": "Longest Valid Parentheses"
    },
    "desc": {
      "zh": "手算括号配对，再用未匹配下标和排除边界求最长连续合法片段。",
      "en": "Work through pairing by hand, then retain unmatched indices and an excluded boundary to find the longest valid contiguous fragment."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "边界栈",
        "en": "Boundary stack"
      }
    ],
    "path": "32/",
    "leetcodeUrl": "https://leetcode.com/problems/longest-valid-parentheses/",
    "language": "Python",
    "complexity": "O(n) time; O(n) auxiliary space"
  },
  {
    "id": 37,
    "title": {
      "zh": "解数独",
      "en": "Sudoku Solver"
    },
    "desc": {
      "zh": "逐格排除冲突，用已用数集合保持约束，失败后完整撤销。",
      "en": "Exclude conflicts cell by cell, cache used digits, and restore each failed choice."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "回溯",
        "en": "Backtracking"
      },
      {
        "zh": "约束集合",
        "en": "Constraint sets"
      }
    ],
    "path": "37/",
    "leetcodeUrl": "https://leetcode.com/problems/sudoku-solver/",
    "language": "Python",
    "complexity": "O(9^E) time; O(E) auxiliary space for E empty cells on the fixed 9×9 board"
  },
  {
    "id": 41,
    "title": {
      "zh": "缺失的第一个正数",
      "en": "First Missing Positive"
    },
    "desc": {
      "zh": "用原数组的位置记录正数是否出现，逐次交换并解释重复值为何必须停止。",
      "en": "Record positive values in their own array positions, tracing swaps and why equal destinations stop."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "原地位置标记",
        "en": "In-place placement"
      }
    ],
    "path": "41/",
    "leetcodeUrl": "https://leetcode.com/problems/first-missing-positive/",
    "language": "Python",
    "complexity": "O(n) time; O(1) auxiliary space"
  },
  {
    "id": 42,
    "title": {
      "zh": "接雨水",
      "en": "Trapping Rain Water"
    },
    "desc": {
      "zh": "left、right 围住尚未结算区域。left_max 包含从起点到 left 的最高墙，right_max 包含从 right 到末尾的最高墙；先把当前两端柱子纳入最大值，再比较。",
      "en": "left and right bound the unsettled region. left_max is the highest wall through left, and right_max the highest from right to the end. Include the current endpoint bars before comparing these maxima."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "双指针边界",
        "en": "Two-pointer bounds"
      }
    ],
    "path": "42/",
    "leetcodeUrl": "https://leetcode.com/problems/trapping-rain-water/",
    "language": "Python",
    "complexity": "O(n) time; O(1) auxiliary space"
  },
  {
    "id": 44,
    "title": {
      "zh": "通配符匹配",
      "en": "Wildcard Matching"
    },
    "desc": {
      "zh": "从重复递归推导前缀状态，逐格解释独立星号的两种选择与滚动行。",
      "en": "Derive prefix states from repeated recursion, then trace standalone stars and rolling rows."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划与滚动行",
        "en": "Dynamic programming and rolling rows"
      }
    ],
    "path": "44/",
    "leetcodeUrl": "https://leetcode.com/problems/wildcard-matching/",
    "language": "Python",
    "complexity": "O((m+1)(n+1)) time; O(n+1) auxiliary space"
  },
  {
    "id": 51,
    "title": {
      "zh": "N 皇后",
      "en": "N-Queens"
    },
    "desc": {
      "zh": "用列与对角线集合剪枝，逐步撤销并保存所有完整棋盘。",
      "en": "Prune with column and diagonal sets, undo each choice, and retain every complete board."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "回溯",
        "en": "Backtracking"
      },
      {
        "zh": "约束搜索",
        "en": "Constraint search"
      }
    ],
    "path": "51/",
    "leetcodeUrl": "https://leetcode.com/problems/n-queens/",
    "language": "Python",
    "complexity": "O(n·n! + S·n²) time; O(n) auxiliary + O(S·n²) output"
  },
  {
    "id": 52,
    "title": {
      "zh": "N 皇后 II",
      "en": "N-Queens II"
    },
    "desc": {
      "zh": "用逐行约束搜索数完整解，观察计数与完整撤销。",
      "en": "Count complete queen arrangements with row-by-row constraints and reversible search."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "回溯",
        "en": "Backtracking"
      },
      {
        "zh": "计数",
        "en": "Counting"
      }
    ],
    "path": "52/",
    "leetcodeUrl": "https://leetcode.com/problems/n-queens-ii/",
    "language": "Python",
    "complexity": "O(n·n!) time, O(n) auxiliary space; average O(1) set operations"
  },
  {
    "id": 60,
    "title": {
      "zh": "排列序列",
      "en": "Permutation Sequence"
    },
    "desc": {
      "zh": "用阶乘分块、从零计数和可逆账本直接定位第 k 个排列。",
      "en": "Locate permutation k with factorial blocks, zero-based ranks and a reversible ledger."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "排列组合",
        "en": "Combinatorics"
      },
      {
        "zh": "数学",
        "en": "Math"
      }
    ],
    "path": "60/",
    "leetcodeUrl": "https://leetcode.com/problems/permutation-sequence/",
    "language": "Python",
    "complexity": "O(n²) time, O(n) auxiliary space"
  },
  {
    "id": 65,
    "title": {
      "zh": "有效数字",
      "en": "Valid Number"
    },
    "desc": {
      "zh": "用逐字符证据区分未完成前缀与不可能的数字。",
      "en": "Track which prefixes can still become a valid number."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "字符串",
        "en": "Strings"
      },
      {
        "zh": "状态与语法",
        "en": "State and grammar"
      }
    ],
    "path": "65/",
    "leetcodeUrl": "https://leetcode.com/problems/valid-number/",
    "language": "Python",
    "complexity": "O(n) time, O(1) auxiliary space"
  },
  {
    "id": 68,
    "title": {
      "zh": "文本左右对齐",
      "en": "Text Justification"
    },
    "desc": {
      "zh": "从最长可容纳词段推导空格分配，逐步检查末行与单词行例外。",
      "en": "Derive maximal word groups and even spacing, then inspect last-line and single-word exceptions."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "字符串",
        "en": "Strings"
      },
      {
        "zh": "贪心",
        "en": "Greedy"
      }
    ],
    "path": "68/",
    "leetcodeUrl": "https://leetcode.com/problems/text-justification/",
    "language": "Python",
    "complexity": "O(n + mW) time; O(W) auxiliary space, excluding O(mW) output"
  },
  {
    "id": 76,
    "title": {
      "zh": "最小覆盖子串",
      "en": "Minimum Window Substring"
    },
    "desc": {
      "zh": "按副本计数，扩展覆盖后收缩，推导线性最小窗口。",
      "en": "Count required copies, expand to cover, then shrink to derive a linear minimum-window scan."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "滑动窗口",
        "en": "Sliding window"
      },
      {
        "zh": "字符计数",
        "en": "Character counts"
      }
    ],
    "path": "76/",
    "leetcodeUrl": "https://leetcode.com/problems/minimum-window-substring/",
    "language": "Python",
    "complexity": "O(m+n) time; O(k) auxiliary space, k≤52; O(L) output"
  },
  {
    "id": 84,
    "title": {
      "zh": "柱状图中最大的矩形",
      "en": "Largest Rectangle in Histogram"
    },
    "desc": {
      "zh": "从最短柱限制面积，到用单调栈确定矩形边界。",
      "en": "Derive rectangle boundaries from the shortest bar and a monotonic stack."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "单调栈",
        "en": "Monotonic stack"
      },
      {
        "zh": "数组",
        "en": "Arrays"
      }
    ],
    "path": "84/",
    "leetcodeUrl": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "language": "Python",
    "complexity": "O(n) time, O(n) auxiliary space"
  },
  {
    "id": 85,
    "title": {
      "zh": "最大矩形",
      "en": "Maximal Rectangle"
    },
    "desc": {
      "zh": "把全 1 矩形变成逐行高度，推导单调栈的宽度边界。",
      "en": "Turn all-one rectangles into row heights and derive stack width boundaries."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "单调栈",
        "en": "Monotonic stack"
      },
      {
        "zh": "矩阵",
        "en": "Matrix"
      }
    ],
    "path": "85/",
    "leetcodeUrl": "https://leetcode.com/problems/maximal-rectangle/",
    "language": "Python",
    "complexity": "O(rows × cols) time · O(cols) auxiliary space"
  },
  {
    "id": 87,
    "title": {
      "zh": "扰乱字符串",
      "en": "Scramble String"
    },
    "desc": {
      "zh": "从两片纸条到区间动态规划：逐个切口验证两侧的合法对应。",
      "en": "Derive interval dynamic programming by testing both child alignments at each split."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "字符串",
        "en": "Strings"
      }
    ],
    "path": "87/",
    "leetcodeUrl": "https://leetcode.com/problems/scramble-string/",
    "language": "Python",
    "complexity": "O(n^4) time; O(n^3) auxiliary space"
  },
  {
    "id": 115,
    "title": {
      "zh": "不同的子序列",
      "en": "Distinct Subsequences"
    },
    "desc": {
      "zh": "从三个位置组合推导子序列计数与倒序动态规划。",
      "en": "Derive subsequence counting and reverse DP from three choices of positions."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "字符串",
        "en": "Strings"
      }
    ],
    "path": "115/",
    "leetcodeUrl": "https://leetcode.com/problems/distinct-subsequences/",
    "language": "Python",
    "complexity": "O(mn) arithmetic operations; O(n) integer cells"
  },
  {
    "id": 123,
    "title": {
      "zh": "买卖股票的最佳时机 III",
      "en": "Best Time to Buy and Sell Stock III"
    },
    "desc": {
      "zh": "从两笔手算交易推导四个现金状态。",
      "en": "Derive four cash states from two hand-worked trades."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "状态压缩",
        "en": "State compression"
      }
    ],
    "path": "123/",
    "leetcodeUrl": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/",
    "language": "Python",
    "complexity": "O(n) time / O(1) auxiliary space"
  },
  {
    "id": 124,
    "title": {
      "zh": "二叉树中的最大路径和",
      "en": "Binary Tree Maximum Path Sum"
    },
    "desc": {
      "zh": "区分向上延伸的单臂与在此结束的双臂，逐节点推导最大路径和。",
      "en": "Separate an extendable arm from a completed path and derive the maximum sum node by node."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "二叉树",
        "en": "Binary tree"
      },
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      }
    ],
    "path": "124/",
    "leetcodeUrl": "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    "language": "Python",
    "complexity": "O(n) time / O(n) auxiliary space"
  },
  {
    "id": 126,
    "title": {
      "zh": "单词接龙 II",
      "en": "Word Ladder II"
    },
    "desc": {
      "zh": "保留同层的每条来路，重建全部最短变换。",
      "en": "Keep every same-layer parent and reconstruct all shortest transformations."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "广度优先搜索",
        "en": "Breadth-first search"
      },
      {
        "zh": "回溯",
        "en": "Backtracking"
      }
    ],
    "path": "126/",
    "leetcodeUrl": "https://leetcode.com/problems/word-ladder-ii/",
    "language": "Python",
    "complexity": "O(26NL² + M) time / O(NL + E + M) space including output"
  },
  {
    "id": 127,
    "title": {
      "zh": "单词接龙",
      "en": "Word Ladder"
    },
    "desc": {
      "zh": "从一字母转换推导广度优先搜索的最短距离。",
      "en": "Derive shortest-path breadth-first search from one-letter edits."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "广度优先搜索",
        "en": "Breadth-first search"
      },
      {
        "zh": "最短路径",
        "en": "Shortest path"
      }
    ],
    "path": "127/",
    "leetcodeUrl": "https://leetcode.com/problems/word-ladder/",
    "language": "Python",
    "complexity": "O(26NL²) expected time; O(NL) auxiliary space"
  },
  {
    "id": 132,
    "title": {
      "zh": "分割回文串 II",
      "en": "Palindrome Partitioning II"
    },
    "desc": {
      "zh": "从最后一段出发，用回文表与前缀最少段数求最少切割。",
      "en": "Compare every final palindrome using a palindrome table and prefix minima."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "字符串",
        "en": "Strings"
      }
    ],
    "path": "132/",
    "leetcodeUrl": "https://leetcode.com/problems/palindrome-partitioning-ii/",
    "language": "Python",
    "complexity": "O(n²) time; O(n²) auxiliary space"
  },
  {
    "id": 135,
    "title": {
      "zh": "分发糖果",
      "en": "Candy"
    },
    "desc": {
      "zh": "从相邻约束推导两个方向的最低糖果数，并证明逐项取最大值恰好最优。",
      "en": "Derive two directional candy bounds and prove why their maximum is exactly enough."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "贪心",
        "en": "Greedy"
      },
      {
        "zh": "双向扫描",
        "en": "Two passes"
      }
    ],
    "path": "135/",
    "leetcodeUrl": "https://leetcode.com/problems/candy/",
    "language": "Python",
    "complexity": "O(n) time; O(n) auxiliary space"
  },
  {
    "id": 140,
    "title": {
      "zh": "单词拆分 II",
      "en": "Word Break II"
    },
    "desc": {
      "zh": "保留每个后缀的全部句子，用可逆轨迹推导完整枚举。",
      "en": "Build every sentence from complete suffix lists, with a reversible trace."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "字符串",
        "en": "Strings"
      }
    ],
    "path": "140/",
    "leetcodeUrl": "https://leetcode.com/problems/word-break-ii/",
    "language": "Python",
    "complexity": "O(D + nL² + T) expected time; O(m + n + L + T) auxiliary space, including cached/output strings"
  },
  {
    "id": 149,
    "title": {
      "zh": "直线上最多的点数",
      "en": "Max Points on a Line"
    },
    "desc": {
      "zh": "从尺子覆盖的小例子，推导锚点与精确方向计数。",
      "en": "Derive exact direction counts from a tiny ruler-and-pins example."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "几何",
        "en": "Geometry"
      },
      {
        "zh": "哈希表",
        "en": "Hash table"
      }
    ],
    "path": "149/",
    "leetcodeUrl": "https://leetcode.com/problems/max-points-on-a-line/",
    "language": "Python",
    "complexity": "O(n² log C) time; O(n) auxiliary space, C = max(2, coordinate span)"
  },
  {
    "id": 154,
    "title": {
      "zh": "寻找旋转排序数组中的最小值 II",
      "en": "Find Minimum in Rotated Sorted Array II"
    },
    "desc": {
      "zh": "重复值为什么让二分查找退化？保留至少一个最小值。",
      "en": "See why duplicates weaken binary search, while preserving a minimum."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "二分查找",
        "en": "Binary search"
      },
      {
        "zh": "数组",
        "en": "Arrays"
      }
    ],
    "path": "154/",
    "leetcodeUrl": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array-ii/",
    "language": "Python",
    "complexity": "O(n) worst-case time; O(1) auxiliary space"
  },
  {
    "id": 174,
    "title": {
      "zh": "地下城游戏",
      "en": "Dungeon Game"
    },
    "desc": {
      "zh": "从出口倒推：进入每个房间前至少需要多少生命值？",
      "en": "Work backward from the exit to find the health needed before each room."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "网格",
        "en": "Grid"
      }
    ],
    "path": "174/",
    "leetcodeUrl": "https://leetcode.com/problems/dungeon-game/",
    "language": "Python",
    "complexity": "O(mn) time; O(n) auxiliary space"
  },
  {
    "id": 185,
    "title": {
      "zh": "部门工资前三高的所有员工",
      "en": "Department Top Three Salaries"
    },
    "desc": {
      "zh": "并列不占新名次：按部门保留前三个不同工资层级的所有员工。",
      "en": "Keep every employee on the top three distinct salary levels in each department."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "Pandas 排名",
        "en": "Pandas ranking"
      },
      {
        "zh": "分组与并列",
        "en": "Grouping and ties"
      }
    ],
    "path": "185/",
    "leetcodeUrl": "https://leetcode.com/problems/department-top-three-salaries/",
    "language": "Python",
    "complexity": "O(n log n + d) expected time; O(n + d) auxiliary space, plus O(k) output"
  },
  {
    "id": 188,
    "title": {
      "zh": "买卖股票的最佳时机 IV",
      "en": "Best Time to Buy and Sell Stock IV"
    },
    "desc": {
      "zh": "从交易额度推导逐日现金状态，比较持有与卖出。",
      "en": "Derive daily cash states for each trade budget and compare holding with selling."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "状态压缩",
        "en": "State compression"
      }
    ],
    "path": "188/",
    "leetcodeUrl": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/",
    "language": "Python",
    "complexity": "O(nk) time; O(k) auxiliary space"
  },
  {
    "id": 212,
    "title": {
      "zh": "单词搜索 II",
      "en": "Word Search II"
    },
    "desc": {
      "zh": "在棋盘路径中共享前缀，理解字典树与回溯。",
      "en": "Share board-path prefixes with a trie and reversible backtracking."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "字典树",
        "en": "Trie"
      },
      {
        "zh": "回溯",
        "en": "Backtracking"
      }
    ],
    "path": "212/",
    "leetcodeUrl": "https://leetcode.com/problems/word-search-ii/",
    "language": "Python",
    "complexity": "O(S + B·4·3^(L-1)) time; O(S + L) auxiliary space, plus O(W) output references"
  },
  {
    "id": 214,
    "title": {
      "zh": "最短回文串",
      "en": "Shortest Palindrome"
    },
    "desc": {
      "zh": "从前置字符的手算出发，推导最长回文前缀与 KMP 回退。",
      "en": "Derive the longest palindromic prefix and KMP fallback from a tiny prepend puzzle."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "字符串",
        "en": "Strings"
      },
      {
        "zh": "前缀函数",
        "en": "Prefix function"
      }
    ],
    "path": "214/",
    "leetcodeUrl": "https://leetcode.com/problems/shortest-palindrome/",
    "language": "Python",
    "complexity": "O(n) time; O(n) auxiliary space and output space"
  },
  {
    "id": 218,
    "title": {
      "zh": "天际线问题",
      "en": "The Skyline Problem"
    },
    "desc": {
      "zh": "从两栋楼的屋顶推导端点扫描与延迟删除堆。",
      "en": "Derive an endpoint sweep and lazy heap removal from two overlapping roofs."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "扫描线",
        "en": "Sweep line"
      },
      {
        "zh": "堆",
        "en": "Heap"
      }
    ],
    "path": "218/",
    "leetcodeUrl": "https://leetcode.com/problems/the-skyline-problem/",
    "language": "Python",
    "complexity": "O(n log n) time; O(n) auxiliary space and O(n) output"
  },
  {
    "id": 220,
    "title": {
      "zh": "存在重复元素 III",
      "en": "Contains Duplicate III"
    },
    "desc": {
      "zh": "用两个距离限制推导滑动窗口与数值桶，逐步检查每一次到期和匹配。",
      "en": "Derive a sliding window and value buckets from two distance limits."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "滑动窗口",
        "en": "Sliding window"
      },
      {
        "zh": "桶",
        "en": "Buckets"
      },
      {
        "zh": "哈希表",
        "en": "Hash table"
      }
    ],
    "path": "220/",
    "leetcodeUrl": "https://leetcode.com/problems/contains-duplicate-iii/",
    "language": "Python",
    "complexity": "Expected O(n) time; O(min(n, indexDiff)) auxiliary space"
  },
  {
    "id": 224,
    "title": {
      "zh": "基本计算器",
      "en": "Basic Calculator"
    },
    "desc": {
      "zh": "逐步保存括号外的总和与符号，推导无递归计算器。",
      "en": "Derive an iterative calculator by saving outer totals and signs."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "栈",
        "en": "Stack"
      },
      {
        "zh": "字符串解析",
        "en": "Parsing"
      }
    ],
    "path": "224/",
    "leetcodeUrl": "https://leetcode.com/problems/basic-calculator/",
    "language": "Python",
    "complexity": "O(n) time; O(d) auxiliary space, d is maximum parenthesis depth"
  },
  {
    "id": 233,
    "title": {
      "zh": "数字 1 的个数",
      "en": "Number of Digit One"
    },
    "desc": {
      "zh": "按数位周期统计 0 到 n 中每一次数字 1 的出现。",
      "en": "Count every digit-one occurrence from 0 to n with place-value cycles."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "数学",
        "en": "Math"
      },
      {
        "zh": "数位统计",
        "en": "Digit counting"
      }
    ],
    "path": "233/",
    "leetcodeUrl": "https://leetcode.com/problems/number-of-digit-one/",
    "language": "Python",
    "complexity": "O(log n) time; O(1) auxiliary space"
  },
  {
    "id": 239,
    "title": {
      "zh": "滑动窗口最大值",
      "en": "Sliding Window Maximum"
    },
    "desc": {
      "zh": "从重复扫描出发，推导单调双端队列如何在线维护每个窗口的最大值。",
      "en": "Start from repeated scans and derive a monotonic deque that maintains every window maximum online."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "数组",
        "en": "Array"
      },
      {
        "zh": "单调队列",
        "en": "Monotonic deque"
      }
    ],
    "path": "239/",
    "leetcodeUrl": "https://leetcode.com/problems/sliding-window-maximum/",
    "language": "Python",
    "complexity": "O(n) time; O(k) auxiliary space"
  },
  {
    "id": 262,
    "title": {
      "zh": "行程与用户",
      "en": "Trips and Users"
    },
    "desc": {
      "zh": "先筛掉任一端被封禁的行，再按天计算取消率。",
      "en": "Filter out trips with either endpoint banned, then compute a daily cancellation rate."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "数据库",
        "en": "Database"
      },
      {
        "zh": "Pandas",
        "en": "Pandas"
      },
      {
        "zh": "分组聚合",
        "en": "Grouped aggregation"
      }
    ],
    "path": "262/",
    "leetcodeUrl": "https://leetcode.com/problems/trips-and-users/",
    "language": "Python",
    "complexity": "O(T + U) expected time; O(T + U) space"
  },
  {
    "id": 273,
    "title": {
      "zh": "整数转换为英文单词",
      "en": "Integer to English Words"
    },
    "desc": {
      "zh": "用三位分组和不变式，把整数安全地拼成英文单词。",
      "en": "Turn an integer into English words with three-digit groups and a spacing invariant."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "字符串",
        "en": "Strings"
      },
      {
        "zh": "数学",
        "en": "Math"
      }
    ],
    "path": "273/",
    "leetcodeUrl": "https://leetcode.com/problems/integer-to-english-words/",
    "language": "Python",
    "complexity": "O(log₁₀ num) time; O(log₁₀ num) space"
  },
  {
    "id": 282,
    "title": {
      "zh": "表达式添加运算符",
      "en": "Expression Add Operators"
    },
    "desc": {
      "zh": "用回溯枚举切分，用 last 修正乘法优先级。",
      "en": "Enumerate cuts with backtracking and preserve precedence with last."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "回溯",
        "en": "Backtracking"
      },
      {
        "zh": "表达式求值",
        "en": "Expression evaluation"
      }
    ],
    "path": "282/",
    "leetcodeUrl": "https://leetcode.com/problems/expression-add-operators/",
    "language": "Python",
    "complexity": "O(n·4^n) time; O(n²) recursion auxiliary space for immutable expression prefixes, plus output space"
  },
  {
    "id": 295,
    "title": {
      "zh": "数据流的中位数",
      "en": "Find Median from Data Stream"
    },
    "desc": {
      "zh": "用两个堆维护中位数两侧的边界，逐次解释插入与再平衡。",
      "en": "Maintain the two middle boundaries with two heaps as values arrive."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "堆",
        "en": "Heaps"
      },
      {
        "zh": "数据流",
        "en": "Data streams"
      }
    ],
    "path": "295/",
    "leetcodeUrl": "https://leetcode.com/problems/find-median-from-data-stream/",
    "language": "Python",
    "complexity": "O(log n) per addNum; O(1) per findMedian; O(n) space"
  },
  {
    "id": 297,
    "title": {
      "zh": "序列化和反序列化二叉树",
      "en": "Serialize and Deserialize Binary Tree"
    },
    "desc": {
      "zh": "用前序与空标记保留二叉树的完整形状。",
      "en": "Preserve a binary tree's full shape with preorder and null markers."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "二叉树",
        "en": "Binary Tree"
      },
      {
        "zh": "递归",
        "en": "Recursion"
      }
    ],
    "path": "297/",
    "leetcodeUrl": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    "language": "Python",
    "complexity": "O(n) time; O(n) explicit stack plus O(n) input/output storage"
  },
  {
    "id": 301,
    "title": {
      "zh": "删除无效括号",
      "en": "Remove Invalid Parentheses"
    },
    "desc": {
      "zh": "从最少删除预算出发，推导不重复的括号搜索。",
      "en": "Derive duplicate-free search from the exact minimum-removal budget."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "回溯",
        "en": "Backtracking"
      },
      {
        "zh": "括号与剪枝",
        "en": "Parentheses and pruning"
      }
    ],
    "path": "301/",
    "leetcodeUrl": "https://leetcode.com/problems/remove-invalid-parentheses/",
    "language": "Python",
    "complexity": "O(2^n) time in the worst case; O(n) recursion space plus output"
  },
  {
    "id": 312,
    "title": {
      "zh": "戳气球",
      "en": "Burst Balloons"
    },
    "desc": {
      "zh": "用固定边界与区间动态规划，把最后一次戳破变成可枚举的状态。",
      "en": "Use fixed boundaries and interval DP to enumerate the final burst safely."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic Programming"
      },
      {
        "zh": "区间 DP",
        "en": "Interval DP"
      }
    ],
    "path": "312/",
    "leetcodeUrl": "https://leetcode.com/problems/burst-balloons/",
    "language": "Python",
    "complexity": "O(n^3) time; O(n^2) auxiliary space"
  },
  {
    "id": 315,
    "title": {
      "zh": "右侧更小元素计数",
      "en": "Count of Smaller Numbers After Self"
    },
    "desc": {
      "zh": "从手算到 Fenwick 树，理解如何统计每个位置右侧的严格更小值。",
      "en": "Derive a Fenwick-tree solution for strict-smaller values to the right of every position."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "数组",
        "en": "Arrays"
      },
      {
        "zh": "树状数组",
        "en": "Fenwick trees"
      }
    ],
    "path": "315/",
    "leetcodeUrl": "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
    "language": "Python",
    "complexity": "O(n log n) time; O(n) space"
  },
  {
    "id": 321,
    "title": {
      "zh": "拼接最大数",
      "en": "Create Maximum Number"
    },
    "desc": {
      "zh": "先分配位数，再用可撤销的删位与后缀比较构造最大数。",
      "en": "Allocate digits, remove smaller tails, and resolve merge ties by comparing suffixes."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "贪心",
        "en": "Greedy"
      },
      {
        "zh": "单调栈",
        "en": "Monotonic stack"
      },
      {
        "zh": "字典序",
        "en": "Lexicographic order"
      }
    ],
    "path": "321/",
    "leetcodeUrl": "https://leetcode.com/problems/create-maximum-number/",
    "language": "Python",
    "complexity": "O(S(m+n+k²)) time; O(m+n+k) auxiliary space, where S ≤ min(m,n,k)+1 is the number of feasible splits"
  },
  {
    "id": 327,
    "title": {
      "zh": "区间和的个数",
      "en": "Count of Range Sum"
    },
    "desc": {
      "zh": "从逐段相加到前缀差，用归并的有序两半数出合法区间。",
      "en": "Derive prefix differences and count valid pairs across sorted halves."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "前缀和",
        "en": "Prefix sums"
      },
      {
        "zh": "归并排序",
        "en": "Merge sort"
      }
    ],
    "path": "327/",
    "leetcodeUrl": "https://leetcode.com/problems/count-of-range-sum/",
    "language": "Python",
    "complexity": "O(n log n) time; O(n) auxiliary space"
  },
  {
    "id": 329,
    "title": {
      "zh": "矩阵中的最长递增路径",
      "en": "Longest Increasing Path in a Matrix"
    },
    "desc": {
      "zh": "从四格路径推导逐层移除峰值的不变量。",
      "en": "Derive peak-removal rounds from a four-cell path."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "有向无环图",
        "en": "Directed acyclic graph"
      },
      {
        "zh": "拓扑排序",
        "en": "Topological sorting"
      }
    ],
    "path": "329/",
    "leetcodeUrl": "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/",
    "language": "Python",
    "complexity": "O(mn) time; O(mn) auxiliary space"
  },
  {
    "id": 330,
    "title": {
      "zh": "按要求补齐数组",
      "en": "Patching Array"
    },
    "desc": {
      "zh": "从第一个无法组成的和，推导最少补数的贪心法。",
      "en": "Derive the minimum patches from the first sum you cannot form."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "贪心",
        "en": "Greedy"
      },
      {
        "zh": "覆盖不变式",
        "en": "Coverage invariant"
      }
    ],
    "path": "330/",
    "leetcodeUrl": "https://leetcode.com/problems/patching-array/",
    "language": "Python",
    "complexity": "O(m + log n) time; O(1) auxiliary space"
  },
  {
    "id": 332,
    "title": {
      "zh": "重新安排行程",
      "en": "Reconstruct Itinerary"
    },
    "desc": {
      "zh": "用逆序收尾修复字典序贪心的死路。",
      "en": "Repair lexical dead ends by finishing airports in reverse order."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "欧拉路径",
        "en": "Euler trail"
      },
      {
        "zh": "栈",
        "en": "Stack"
      }
    ],
    "path": "332/",
    "leetcodeUrl": "https://leetcode.com/problems/reconstruct-itinerary/",
    "language": "Python",
    "complexity": "O(E log E) time; O(E) space"
  },
  {
    "id": 335,
    "title": {
      "zh": "路径交叉",
      "en": "Self Crossing"
    },
    "desc": {
      "zh": "从手绘路径推导三种首次相交形态，用常数空间判断触碰与交叉。",
      "en": "Derive three first-contact patterns from a hand-drawn path and detect crossings in constant space."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "几何",
        "en": "Geometry"
      },
      {
        "zh": "不变量",
        "en": "Invariants"
      }
    ],
    "path": "335/",
    "leetcodeUrl": "https://leetcode.com/problems/self-crossing/",
    "language": "Python",
    "complexity": "O(n) time; O(1) auxiliary space"
  },
  {
    "id": 336,
    "title": {
      "zh": "回文对",
      "en": "Palindrome Pairs"
    },
    "desc": {
      "zh": "从中间剩余回文推导反向字典树与线性回文边界预处理。",
      "en": "Derive reversed-trie search and linear palindrome boundaries from the unmatched middle."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "字典树",
        "en": "Trie"
      },
      {
        "zh": "回文",
        "en": "Palindromes"
      },
      {
        "zh": "Manacher 算法",
        "en": "Manacher algorithm"
      }
    ],
    "path": "336/",
    "leetcodeUrl": "https://leetcode.com/problems/palindrome-pairs/",
    "language": "Python",
    "complexity": "O(S + n + P) expected time; O(S + n) auxiliary space plus O(P) output; S = total characters, n = words, P = pairs"
  },
  {
    "id": 352,
    "title": {
      "zh": "将数据流变为多个不相交区间",
      "en": "Data Stream as Disjoint Intervals"
    },
    "desc": {
      "zh": "从缺失的一个整数出发，推导有序区间的双邻居合并。",
      "en": "Fill one missing integer to derive a sorted interval summary and two-neighbor merging."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "区间合并",
        "en": "Interval merging"
      },
      {
        "zh": "二分查找",
        "en": "Binary search"
      }
    ],
    "path": "352/",
    "leetcodeUrl": "https://leetcode.com/problems/data-stream-as-disjoint-intervals/",
    "language": "Python",
    "complexity": "addNum O(k+1) worst-case time; getIntervals O(k+1) time; O(k+1) space, k = current interval count"
  },
  {
    "id": 354,
    "title": {
      "zh": "俄罗斯套娃信封问题",
      "en": "Russian Doll Envelopes"
    },
    "desc": {
      "zh": "从等宽陷阱推导最小结尾与二分更新。",
      "en": "Derive minimal tails and binary search from the equal-width trap."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "排序",
        "en": "Sorting"
      },
      {
        "zh": "最长递增子序列",
        "en": "Longest increasing subsequence"
      }
    ],
    "path": "354/",
    "leetcodeUrl": "https://leetcode.com/problems/russian-doll-envelopes/",
    "language": "Python",
    "complexity": "O(n log n) time; O(n) space"
  },
  {
    "id": 363,
    "title": {
      "zh": "矩形区域不超过 K 的最大数值和",
      "en": "Max Sum of Rectangle No Larger Than K"
    },
    "desc": {
      "zh": "把矩形压成一行，再寻找最小的合法历史前缀。",
      "en": "Compress rectangles into rows and find the smallest eligible earlier prefix."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "前缀和",
        "en": "Prefix sums"
      },
      {
        "zh": "二分查找",
        "en": "Binary search"
      }
    ],
    "path": "363/",
    "leetcodeUrl": "https://leetcode.com/problems/max-sum-of-rectangle-no-larger-than-k/",
    "language": "Python",
    "complexity": "O(a² b²) time; O(b) auxiliary space, a=min(m,n), b=max(m,n)"
  },
  {
    "id": 381,
    "title": {
      "zh": "O(1) 时间插入、删除和获取随机元素 — 允许重复",
      "en": "Insert Delete GetRandom O(1) - Duplicates allowed"
    },
    "desc": {
      "zh": "让每个副本占一个位置，用尾部填洞并修复位置集合。",
      "en": "Give each copy a slot, fill a deletion hole from the tail, and repair its index set."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "哈希表",
        "en": "Hash map"
      },
      {
        "zh": "随机采样",
        "en": "Random sampling"
      }
    ],
    "path": "381/",
    "leetcodeUrl": "https://leetcode.com/problems/insert-delete-getrandom-o1-duplicates-allowed/",
    "language": "Python",
    "complexity": "Expected amortized O(1) time per operation; O(n) space for n stored occurrences"
  },
  {
    "id": 391,
    "title": {
      "zh": "完美矩形",
      "en": "Perfect Rectangle"
    },
    "desc": {
      "zh": "用面积与奇数角点，证明矩形恰好覆盖一次。",
      "en": "Derive an exact-cover test from area and odd corner counts."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "几何",
        "en": "Geometry"
      },
      {
        "zh": "哈希集合",
        "en": "Hash set"
      },
      {
        "zh": "不变量",
        "en": "Invariant"
      }
    ],
    "path": "391/",
    "leetcodeUrl": "https://leetcode.com/problems/perfect-rectangle/",
    "language": "Python",
    "complexity": "O(n) expected time; O(n) auxiliary space"
  },
  {
    "id": 403,
    "title": {
      "zh": "青蛙过河",
      "en": "Frog Jump"
    },
    "desc": {
      "zh": "同一块石头，不同的上一跳：用可达跳长集合推导过河条件。",
      "en": "One stone, different arrival jumps: derive reachability by keeping possible jump lengths."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "状态设计",
        "en": "State design"
      }
    ],
    "path": "403/",
    "leetcodeUrl": "https://leetcode.com/problems/frog-jump/",
    "language": "Python",
    "complexity": "O(n²) expected time; O(n²) space"
  },
  {
    "id": 407,
    "title": {
      "zh": "接雨水 II",
      "en": "Trapping Rain Water II"
    },
    "desc": {
      "zh": "沿最低逃逸通道推导二维积水，用最小堆逐圈确定水位。",
      "en": "Derive escape levels along turning paths and fix water depths with a min-heap."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "最小堆",
        "en": "Min-heap"
      },
      {
        "zh": "边界扩展",
        "en": "Boundary expansion"
      }
    ],
    "path": "407/",
    "leetcodeUrl": "https://leetcode.com/problems/trapping-rain-water-ii/",
    "language": "Python",
    "complexity": "O(mn log(mn)) time; O(mn) auxiliary space"
  },
  {
    "id": 410,
    "title": {
      "zh": "分割数组的最大值",
      "en": "Split Array Largest Sum"
    },
    "desc": {
      "zh": "先验证一个和的上限，再二分寻找最小可行上限。",
      "en": "Test a sum cap with a greedy scan, then search for the smallest feasible cap."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "二分答案",
        "en": "Binary search on the answer"
      },
      {
        "zh": "贪心",
        "en": "Greedy"
      }
    ],
    "path": "410/",
    "leetcodeUrl": "https://leetcode.com/problems/split-array-largest-sum/",
    "language": "Python",
    "complexity": "O(n log(S - M + 2)) time; O(1) auxiliary space, S=sum(nums), M=max(nums)"
  },
  {
    "id": 420,
    "title": {
      "zh": "强密码检验器",
      "en": "Strong Password Checker"
    },
    "desc": {
      "zh": "从一次插入到删除优先级，推导最少修改次数。",
      "en": "Derive minimum edits from overlapping repairs and deletion priorities."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "贪心",
        "en": "Greedy"
      },
      {
        "zh": "字符串",
        "en": "Strings"
      }
    ],
    "path": "420/",
    "leetcodeUrl": "https://leetcode.com/problems/strong-password-checker/",
    "language": "Python",
    "complexity": "O(n) time; O(1) auxiliary space"
  },
  {
    "id": 432,
    "title": {
      "zh": "全 O(1) 的数据结构",
      "en": "All O`one Data Structure"
    },
    "desc": {
      "zh": "从单步计数变化推导相邻桶移动与极值查询。",
      "en": "Derive neighboring-bucket moves and extreme-key queries from unit count changes."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "双向链表",
        "en": "Doubly linked list"
      },
      {
        "zh": "哈希表",
        "en": "Hash map"
      }
    ],
    "path": "432/",
    "leetcodeUrl": "https://leetcode.com/problems/all-oone-data-structure/",
    "language": "Python",
    "complexity": "Average O(1) time per operation; O(n) space for n live keys"
  },
  {
    "id": 440,
    "title": {
      "zh": "字典序的第 K 小数字",
      "en": "K-th Smallest in Lexicographical Order"
    },
    "desc": {
      "zh": "用十进制前缀的分层计数，推导整组跳过与向下寻找。",
      "en": "Count decimal-prefix groups to derive when to skip a group or descend."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "前缀计数",
        "en": "Prefix counting"
      },
      {
        "zh": "字典序",
        "en": "Lexicographical order"
      }
    ],
    "path": "440/",
    "leetcodeUrl": "https://leetcode.com/problems/k-th-smallest-in-lexicographical-order/",
    "language": "Python",
    "complexity": "O((log n)^2) time; O(1) auxiliary space"
  },
  {
    "id": 446,
    "title": {
      "zh": "等差数列划分 II - 子序列",
      "en": "Arithmetic Slices II - Subsequence"
    },
    "desc": {
      "zh": "从两项起点推导按结尾与差值计数的动态规划。",
      "en": "Derive endpoint-and-difference counting from two-term starting points."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "计数",
        "en": "Counting"
      }
    ],
    "path": "446/",
    "leetcodeUrl": "https://leetcode.com/problems/arithmetic-slices-ii-subsequence/",
    "language": "Python",
    "complexity": "O(n²) expected time; O(n²) auxiliary space"
  },
  {
    "id": 458,
    "title": {
      "zh": "可怜的小猪",
      "en": "Poor Pigs"
    },
    "desc": {
      "zh": "从三桶液体的等待实验，推导可区分结果的乘法与最少小猪数。",
      "en": "Build a feeding schedule, count distinguishable outcomes, and derive the minimum pigs."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "组合数学",
        "en": "Combinatorics"
      },
      {
        "zh": "信息编码",
        "en": "Outcome encoding"
      }
    ],
    "path": "458/",
    "leetcodeUrl": "https://leetcode.com/problems/poor-pigs/",
    "language": "Python",
    "complexity": "O(1 + log_(R+1) buckets) arithmetic time; O(1) auxiliary words, R = floor(minutesToTest / minutesToDie)"
  },
  {
    "id": 460,
    "title": {
      "zh": "LFU 缓存",
      "en": "LFU Cache"
    },
    "desc": {
      "zh": "从频次与先后顺序推导常数时间缓存淘汰。",
      "en": "Derive constant-time cache eviction from frequency and recency."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "哈希表",
        "en": "Hash table"
      },
      {
        "zh": "有序频次桶",
        "en": "Ordered frequency buckets"
      }
    ],
    "path": "460/",
    "leetcodeUrl": "https://leetcode.com/problems/lfu-cache/",
    "language": "Python",
    "complexity": "O(1) average time per get/put; O(C) space for capacity C"
  },
  {
    "id": 466,
    "title": {
      "zh": "统计重复个数",
      "en": "Count The Repetitions"
    },
    "desc": {
      "zh": "保留跨块匹配的位置，用重复状态跳过整段扫描。",
      "en": "Carry matching progress across blocks and skip cycles of repeated states."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "子序列",
        "en": "Subsequences"
      },
      {
        "zh": "循环检测",
        "en": "Cycle detection"
      }
    ],
    "path": "466/",
    "leetcodeUrl": "https://leetcode.com/problems/count-the-repetitions/",
    "language": "Python",
    "complexity": "O(|s1| min(n1, |s2|)) time; O(min(n1, |s2|)) auxiliary space"
  },
  {
    "id": 472,
    "title": {
      "zh": "连接词",
      "en": "Concatenated Words"
    },
    "desc": {
      "zh": "保留可达的前缀边界，排除整词自匹配。",
      "en": "Keep reachable prefix boundaries and exclude a whole-word self-match."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "字符串",
        "en": "Strings"
      }
    ],
    "path": "472/",
    "leetcodeUrl": "https://leetcode.com/problems/concatenated-words/",
    "language": "Python",
    "complexity": "O(S + sum(len(w)^3)) expected time; O(N + L) auxiliary space"
  },
  {
    "id": 479,
    "title": {
      "zh": "最大回文数乘积",
      "en": "Largest Palindrome Product"
    },
    "desc": {
      "zh": "构造递减回文候选，用较大因子的平方界限证明安全截止。",
      "en": "Construct descending palindromes and derive a safe square cutoff for larger factors."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "数学",
        "en": "Mathematics"
      },
      {
        "zh": "枚举",
        "en": "Enumeration"
      }
    ],
    "path": "479/",
    "leetcodeUrl": "https://leetcode.com/problems/largest-palindrome-product/",
    "language": "Python",
    "complexity": "O(10^(2n) + n·10^n) time under unit-cost integer arithmetic; O(n) auxiliary space"
  },
  {
    "id": 480,
    "title": {
      "zh": "滑动窗口中位数",
      "en": "Sliding Window Median"
    },
    "desc": {
      "zh": "从逐窗排序到频数树：用区间计数定位中间的出现次数。",
      "en": "From sorting windows to a count tree: locate the middle occurrence by interval totals."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "滑动窗口",
        "en": "Sliding window"
      },
      {
        "zh": "线段树",
        "en": "Segment tree"
      },
      {
        "zh": "顺序统计",
        "en": "Order statistics"
      }
    ],
    "path": "480/",
    "leetcodeUrl": "https://leetcode.com/problems/sliding-window-median/",
    "language": "Python",
    "complexity": "O(n log n) time; O(n) auxiliary space plus O(n-k+1) output"
  },
  {
    "id": 483,
    "title": {
      "zh": "最小好进制",
      "en": "Smallest Good Base"
    },
    "desc": {
      "zh": "从全 1 位值推导按长度枚举与精确整数二分。",
      "en": "Derive a descending-length search and exact integer binary search from all-ones place values."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "数学",
        "en": "Math"
      },
      {
        "zh": "二分查找",
        "en": "Binary search"
      }
    ],
    "path": "483/",
    "leetcodeUrl": "https://leetcode.com/problems/smallest-good-base/",
    "language": "Python",
    "complexity": "O((log n)^2) integer operations; O(1) integer cells (O(log n) bits) extra space"
  },
  {
    "id": 488,
    "title": {
      "zh": "祖玛游戏",
      "en": "Zuma Game"
    },
    "desc": {
      "zh": "从连锁消除推导完整状态与记忆化搜索。",
      "en": "Derive complete search states from chain reactions."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "记忆化搜索",
        "en": "Memoized search"
      },
      {
        "zh": "状态建模",
        "en": "State modeling"
      }
    ],
    "path": "488/",
    "leetcodeUrl": "https://leetcode.com/problems/zuma-game/",
    "language": "Python",
    "complexity": "O(5SL³) time; O(S(L+h)+hL) space, where L=n+h and S is the exponential number of visited states"
  },
  {
    "id": 493,
    "title": {
      "zh": "翻转对",
      "en": "Reverse Pairs"
    },
    "desc": {
      "zh": "从严格倍数比较推导归并计数。",
      "en": "Derive merge counting from strict doubled comparisons."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "归并排序",
        "en": "Merge sort"
      },
      {
        "zh": "双指针",
        "en": "Two pointers"
      }
    ],
    "path": "493/",
    "leetcodeUrl": "https://leetcode.com/problems/reverse-pairs/",
    "language": "Python",
    "complexity": "O(n log n) time; O(n) auxiliary space"
  },
  {
    "id": 502,
    "title": {
      "zh": "IPO",
      "en": "IPO"
    },
    "desc": {
      "zh": "从资金门槛推导最大利润选择，用排序与堆避免重复扫描。",
      "en": "Derive the affordable-profit greedy rule, then replace repeated scans with sorting and a heap."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "贪心",
        "en": "Greedy"
      },
      {
        "zh": "堆",
        "en": "Heap"
      },
      {
        "zh": "排序",
        "en": "Sorting"
      }
    ],
    "path": "502/",
    "leetcodeUrl": "https://leetcode.com/problems/ipo/",
    "language": "Python",
    "complexity": "O(n log n + min(k,n) log n) time; O(n) auxiliary space"
  },
  {
    "id": 514,
    "title": {
      "zh": "自由之路",
      "en": "Freedom Trail"
    },
    "desc": {
      "zh": "从转盘的两条路，到按终点保留最小代价。",
      "en": "From two arcs on a dial to minimum costs at each endpoint."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      }
    ],
    "path": "514/",
    "leetcodeUrl": "https://leetcode.com/problems/freedom-trail/",
    "language": "Python",
    "complexity": "O(m n²) time; O(n) auxiliary space"
  },
  {
    "id": 517,
    "title": {
      "zh": "超级洗衣机",
      "en": "Super Washing Machines"
    },
    "desc": {
      "zh": "从同时传衣服推导边界流量与单机发送瓶颈。",
      "en": "Derive cut-flow and sender bottlenecks from simultaneous dress transfers."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "贪心",
        "en": "Greedy"
      },
      {
        "zh": "前缀和",
        "en": "Prefix sum"
      }
    ],
    "path": "517/",
    "leetcodeUrl": "https://leetcode.com/problems/super-washing-machines/",
    "language": "Python",
    "complexity": "O(n) time; O(1) auxiliary space"
  },
  {
    "id": 546,
    "title": {
      "zh": "移除盒子",
      "en": "Remove Boxes"
    },
    "desc": {
      "zh": "清空中间，合并两端：为何区间还要记住保留的同色盒子。",
      "en": "Clear the middle and join the ends: why an interval must remember saved boxes."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "区间动态规划",
        "en": "Interval dynamic programming"
      },
      {
        "zh": "记忆化搜索",
        "en": "Memoized recursion"
      }
    ],
    "path": "546/",
    "leetcodeUrl": "https://leetcode.com/problems/remove-boxes/",
    "language": "Python",
    "complexity": "O(n⁴) time; O(n³) auxiliary space"
  },
  {
    "id": 552,
    "title": {
      "zh": "学生出勤记录 II",
      "en": "Student Attendance Record II"
    },
    "desc": {
      "zh": "从两天考勤推导六状态计数，逐日检查来源与不变式。",
      "en": "Derive six attendance states and inspect each day’s incoming counts."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "计数",
        "en": "Counting"
      }
    ],
    "path": "552/",
    "leetcodeUrl": "https://leetcode.com/problems/student-attendance-record-ii/",
    "language": "Python",
    "complexity": "O(n) time; O(1) auxiliary space"
  },
  {
    "id": 564,
    "title": {
      "zh": "寻找最近的回文数",
      "en": "Find the Closest Palindrome"
    },
    "desc": {
      "zh": "从镜像前缀推导完整候选集，逐项比较距离与平局。",
      "en": "Derive a complete set of mirrored-prefix candidates and compare distances and ties."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "字符串",
        "en": "Strings"
      },
      {
        "zh": "数学",
        "en": "Mathematics"
      }
    ],
    "path": "564/",
    "leetcodeUrl": "https://leetcode.com/problems/find-the-closest-palindrome/",
    "language": "Python",
    "complexity": "O(d) time; O(d) space for d ≤ 18 decimal digits (bounded integer arithmetic)"
  },
  {
    "id": 587,
    "title": {
      "zh": "安装栅栏",
      "en": "Erect the Fence"
    },
    "desc": {
      "zh": "从直线边界与带符号转弯，推导保留共线树的单调链。",
      "en": "Derive a monotone chain that retains every tree on straight fence edges."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "凸包",
        "en": "Convex hull"
      },
      {
        "zh": "单调链",
        "en": "Monotone chain"
      }
    ],
    "path": "587/",
    "leetcodeUrl": "https://leetcode.com/problems/erect-the-fence/",
    "language": "Python",
    "complexity": "O(n log n) time; O(n) auxiliary space"
  },
  {
    "id": 591,
    "title": {
      "zh": "标签验证器",
      "en": "Tag Validator"
    },
    "desc": {
      "zh": "用待闭合标签栈区分嵌套、CDATA 与唯一根标签。",
      "en": "Track pending tags to validate nesting, opaque CDATA, and one enclosing root."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "栈",
        "en": "Stack"
      },
      {
        "zh": "字符串解析",
        "en": "String parsing"
      }
    ],
    "path": "591/",
    "leetcodeUrl": "https://leetcode.com/problems/tag-validator/",
    "language": "Python",
    "complexity": "O(n) time; O(n) auxiliary space worst case, O(d) stack for valid input"
  },
  {
    "id": 600,
    "title": {
      "zh": "不含连续 1 的非负整数",
      "en": "Non-negative Integers without Consecutive Ones"
    },
    "desc": {
      "zh": "从二进制小例子推导后缀计数，按首次不同的位划分答案。",
      "en": "Count binary suffixes and partition answers by their first differing bit."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "数位动态规划",
        "en": "Digit dynamic programming"
      },
      {
        "zh": "计数",
        "en": "Counting"
      }
    ],
    "path": "600/",
    "leetcodeUrl": "https://leetcode.com/problems/non-negative-integers-without-consecutive-ones/",
    "language": "Python",
    "complexity": "O(log n) time; O(log n) auxiliary space (unit-cost arithmetic within the official bounds)"
  },
  {
    "id": 629,
    "title": {
      "zh": "K 个逆序对数组",
      "en": "K Inverse Pairs Array"
    },
    "desc": {
      "zh": "插入最大值，数清新增逆序对，再让相邻计数和共享计算。",
      "en": "Insert the largest value, count its new inversions, then reuse neighboring sums."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "滑动窗口计数",
        "en": "Sliding window counting"
      }
    ],
    "path": "629/",
    "leetcodeUrl": "https://leetcode.com/problems/k-inverse-pairs-array/",
    "language": "Python",
    "complexity": "O(n(k+1)) time; O(k+1) auxiliary space"
  },
  {
    "id": 630,
    "title": {
      "zh": "课程表 III",
      "en": "Course Schedule III"
    },
    "desc": {
      "zh": "按截止日安排课程，用最长课程替换挽回时间。",
      "en": "Order courses by deadline and recover time by removing the longest."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "贪心",
        "en": "Greedy"
      },
      {
        "zh": "堆",
        "en": "Heap"
      }
    ],
    "path": "630/",
    "leetcodeUrl": "https://leetcode.com/problems/course-schedule-iii/",
    "language": "Python",
    "complexity": "O(n log n) time; O(n) auxiliary space"
  },
  {
    "id": 632,
    "title": {
      "zh": "最小区间",
      "en": "Smallest Range Covering Elements from K Lists"
    },
    "desc": {
      "zh": "从逐行选数推导最小堆，观察最小覆盖区间如何收紧。",
      "en": "Derive a min-heap scan by selecting one value per row and discarding dominated choices."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "最小堆",
        "en": "Min-heap"
      },
      {
        "zh": "贪心",
        "en": "Greedy"
      }
    ],
    "path": "632/",
    "leetcodeUrl": "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/",
    "language": "Python",
    "complexity": "O(N log(k+1)) time; O(k) auxiliary space, where N is the total number of elements"
  },
  {
    "id": 639,
    "title": {
      "zh": "解码方法 II",
      "en": "Decode Ways II"
    },
    "desc": {
      "zh": "从具体星号替换出发，按最后一个字母分组，推导常数空间的前缀计数。",
      "en": "Count concrete wildcard choices, partition by the final letter, and derive constant-space prefix counting."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "组合计数",
        "en": "Combinatorial counting"
      }
    ],
    "path": "639/",
    "leetcodeUrl": "https://leetcode.com/problems/decode-ways-ii/",
    "language": "Python",
    "complexity": "O(n) time; O(1) auxiliary space"
  },
  {
    "id": 2916,
    "leetcodeUrl": "https://leetcode.com/problems/subarrays-distinct-element-sum-of-squares-ii/",
    "title": {
      "zh": "子数组不同元素数目的平方和 II",
      "en": "Subarrays Distinct Element Sum of Squares II"
    },
    "desc": {
      "zh": "从 6 个子数组的手算出发，发现最后一次出现位置决定的更新区间，再亲手推导平方和与懒标记。",
      "en": "Start with six subarrays, discover the update interval from the previous occurrence, then derive square-sum updates and lazy propagation."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "固定右端点",
        "en": "Fixed right endpoint"
      },
      {
        "zh": "线段树",
        "en": "Segment tree"
      },
      {
        "zh": "懒标记",
        "en": "Lazy propagation"
      }
    ],
    "path": "2916/",
    "language": "Python",
    "complexity": "O(n log n)"
  }
];
