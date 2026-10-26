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
    "id": 601,
    "title": {
      "zh": "体育馆的人流量",
      "en": "Human Traffic of Stadium"
    },
    "desc": {
      "zh": "用重叠的三连编号找出所有合格记录，分清编号与日期。",
      "en": "Use overlapping ID triples to recover every qualifying visit, even across date gaps."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "Pandas 数据筛选",
        "en": "Pandas filtering"
      },
      {
        "zh": "集合与连续编号",
        "en": "Sets and consecutive IDs"
      }
    ],
    "path": "601/",
    "leetcodeUrl": "https://leetcode.com/problems/human-traffic-of-stadium/",
    "language": "Python",
    "complexity": "O(n log n) time including output sorting (expected hash costs); O(n) auxiliary space"
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
    "id": 664,
    "title": {
      "zh": "奇怪的打印机",
      "en": "Strange Printer"
    },
    "desc": {
      "zh": "从覆盖 aba 到共享打印轮次，推导区间动态规划。",
      "en": "From overwriting aba to sharing a print turn: derive interval dynamic programming."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "区间动态规划",
        "en": "Interval dynamic programming"
      }
    ],
    "path": "664/",
    "leetcodeUrl": "https://leetcode.com/problems/strange-printer/",
    "language": "Python",
    "complexity": "O(n³) time; O(n²) auxiliary space"
  },
  {
    "id": 668,
    "title": {
      "zh": "乘法表中第 k 小的数",
      "en": "Kth Smallest Number in Multiplication Table"
    },
    "desc": {
      "zh": "从逐行数格子推导答案二分，保留重复值并证明区间边界。",
      "en": "Count cells row by row, then derive a binary search that keeps duplicates and preserves answer bounds."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "答案二分",
        "en": "Binary search on values"
      },
      {
        "zh": "逐行计数",
        "en": "Row counting"
      }
    ],
    "path": "668/",
    "leetcodeUrl": "https://leetcode.com/problems/kth-smallest-number-in-multiplication-table/",
    "language": "Python",
    "complexity": "O(min(m,n) log(mn)) time; O(1) auxiliary space"
  },
  {
    "id": 675,
    "title": {
      "zh": "为高尔夫比赛砍树",
      "en": "Cut Off Trees for Golf Event"
    },
    "desc": {
      "zh": "从穿过高树的小路，推导按高度排序与分层最短路。",
      "en": "Derive sorted targets and shortest paths from a walk past a taller tree."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "广度优先搜索",
        "en": "Breadth-first search"
      },
      {
        "zh": "最短路径",
        "en": "Shortest paths"
      }
    ],
    "path": "675/",
    "leetcodeUrl": "https://leetcode.com/problems/cut-off-trees-for-golf-event/",
    "language": "Python",
    "complexity": "O(Tmn + T log T) time; O(mn + T) auxiliary space"
  },
  {
    "id": 679,
    "title": {
      "zh": "24 点游戏",
      "en": "24 Game"
    },
    "desc": {
      "zh": "用两两合并与精确分数，穷尽四张牌的合法表达式。",
      "en": "Reduce pairs with exact fractions to cover every legal four-card expression."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "回溯",
        "en": "Backtracking"
      },
      {
        "zh": "分数运算",
        "en": "Rational arithmetic"
      }
    ],
    "path": "679/",
    "leetcodeUrl": "https://leetcode.com/problems/24-game/",
    "language": "Python",
    "complexity": "O(1) time and O(1) auxiliary space for exactly four bounded cards"
  },
  {
    "id": 685,
    "title": {
      "zh": "冗余连接 II",
      "en": "Redundant Connection II"
    },
    "desc": {
      "zh": "区分双亲冲突与环，用过滤后的森林找出该删的有向边。",
      "en": "Separate a two-parent conflict from a cycle and repair the filtered forest."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "图",
        "en": "Graphs"
      },
      {
        "zh": "并查集",
        "en": "Disjoint-set union"
      }
    ],
    "path": "685/",
    "leetcodeUrl": "https://leetcode.com/problems/redundant-connection-ii/",
    "language": "Python",
    "complexity": "O(n α(n)) amortized time; O(n) auxiliary space"
  },
  {
    "id": 689,
    "title": {
      "zh": "三个无重叠子数组的最大和",
      "en": "Maximum Sum of 3 Non-Overlapping Subarrays"
    },
    "desc": {
      "zh": "固定中间窗口，用左右最优摘要消除重复搜索，并正确处理同和下的最早起点。",
      "en": "Fix the middle window, reuse the best choices on both sides, and preserve the earliest triple on ties."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "滑动窗口",
        "en": "Sliding window"
      },
      {
        "zh": "前后缀最优",
        "en": "Prefix and suffix maxima"
      }
    ],
    "path": "689/",
    "leetcodeUrl": "https://leetcode.com/problems/maximum-sum-of-3-non-overlapping-subarrays/",
    "language": "Python",
    "complexity": "O(n) time; O(n) auxiliary space"
  },
  {
    "id": 691,
    "title": {
      "zh": "贴纸拼词",
      "en": "Stickers to Spell Word"
    },
    "desc": {
      "zh": "用剩余字母计数，推导记忆化搜索与安全的分支筛选。",
      "en": "Derive memoized search and safe branch filtering from missing letter counts."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "记忆化搜索",
        "en": "Memoization"
      },
      {
        "zh": "字母计数",
        "en": "Letter counts"
      }
    ],
    "path": "691/",
    "leetcodeUrl": "https://leetcode.com/problems/stickers-to-spell-word/",
    "language": "Python",
    "complexity": "O(nLm + nmS) time; O(nm + mS + m²) auxiliary space, S = product(count(c)+1) <= 2^m"
  },
  {
    "id": 699,
    "title": {
      "zh": "掉落的方块",
      "en": "Falling Squares"
    },
    "desc": {
      "zh": "从接触边界到支撑高度，逐次推导区间重叠的最高堆叠。",
      "en": "Derive exact landing heights from interval overlap and frozen square tops."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "区间重叠",
        "en": "Interval overlap"
      },
      {
        "zh": "模拟",
        "en": "Simulation"
      }
    ],
    "path": "699/",
    "leetcodeUrl": "https://leetcode.com/problems/falling-squares/",
    "language": "Python",
    "complexity": "O(n²) time; O(n) auxiliary space and O(n) output"
  },
  {
    "id": 710,
    "title": {
      "zh": "黑名单中的随机数",
      "en": "Random Pick with Blacklist"
    },
    "desc": {
      "zh": "将低区间的禁用票号映射到高区间的可用值，推导等概率抽取。",
      "en": "Repair blocked tickets with unused high values and derive uniform picking."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "随机化",
        "en": "Randomization"
      },
      {
        "zh": "哈希映射",
        "en": "Hash mapping"
      },
      {
        "zh": "一一对应",
        "en": "Bijection"
      }
    ],
    "path": "710/",
    "leetcodeUrl": "https://leetcode.com/problems/random-pick-with-blacklist/",
    "language": "Python",
    "complexity": "Expected O(b + 1) initialization time and space; expected O(1) time per pick, one random API call"
  },
  {
    "id": 715,
    "title": {
      "zh": "Range 模块",
      "en": "Range Module"
    },
    "desc": {
      "zh": "从挖去一段区间，推导有序边界的奇偶规则。",
      "en": "Derive endpoint parity by cutting, joining, and querying real-number ranges."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "有序边界",
        "en": "Sorted endpoints"
      },
      {
        "zh": "二分查找",
        "en": "Binary search"
      }
    ],
    "path": "715/",
    "leetcodeUrl": "https://leetcode.com/problems/range-module/",
    "language": "Python",
    "complexity": "O(k) time per update, O(log(k+1)) per query; O(k) space for k endpoints"
  },
  {
    "id": 719,
    "title": {
      "zh": "找出第 K 小的数对距离",
      "en": "Find K-th Smallest Pair Distance"
    },
    "desc": {
      "zh": "从数对手算到滑动窗口计数与答案二分。",
      "en": "From hand-counted pairs to window counting and binary search."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "二分查找",
        "en": "Binary Search"
      },
      {
        "zh": "双指针",
        "en": "Two Pointers"
      }
    ],
    "path": "719/",
    "leetcodeUrl": "https://leetcode.com/problems/find-k-th-smallest-pair-distance/",
    "language": "Python",
    "complexity": "O(n log n + n log(W+1)) time; O(n) space, W=max(nums)-min(nums)"
  },
  {
    "id": 726,
    "title": {
      "zh": "原子的数量",
      "en": "Number of Atoms"
    },
    "desc": {
      "zh": "逐层计数，理解括号怎样改变原子数量。",
      "en": "Count one group at a time and see exactly what parentheses multiply."
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
    "path": "726/",
    "leetcodeUrl": "https://leetcode.com/problems/number-of-atoms/",
    "language": "Python",
    "complexity": "O(n² + kL log k) time; O(n) auxiliary space"
  },
  {
    "id": 730,
    "title": {
      "zh": "统计不同回文子序列",
      "en": "Count Different Palindromic Subsequences"
    },
    "desc": {
      "zh": "从 bccb 的重复选择出发，按最外层字符推导无重复的区间计数。",
      "en": "From duplicate choices in bccb to counting intervals by their outer letter."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "区间动态规划",
        "en": "Interval dynamic programming"
      },
      {
        "zh": "去重计数",
        "en": "Distinct counting"
      }
    ],
    "path": "730/",
    "leetcodeUrl": "https://leetcode.com/problems/count-different-palindromic-subsequences/",
    "language": "Python",
    "complexity": "O(n²) time; O(n²) auxiliary space"
  },
  {
    "id": 732,
    "title": {
      "zh": "我的日程安排表 III",
      "en": "My Calendar III"
    },
    "desc": {
      "zh": "从半开区间的手算推导端点变化与扫描，求最大同时预订数。",
      "en": "Derive endpoint changes and a sorted sweep to count simultaneous bookings."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "扫描线",
        "en": "Sweep line"
      },
      {
        "zh": "前缀和",
        "en": "Prefix sum"
      }
    ],
    "path": "732/",
    "leetcodeUrl": "https://leetcode.com/problems/my-calendar-iii/",
    "language": "Python",
    "complexity": "O(b log b) time per book; O(b) space; O(B² log B) time for B calls"
  },
  {
    "id": 736,
    "title": {
      "zh": "Lisp 语法解析",
      "en": "Parse Lisp Expression"
    },
    "desc": {
      "zh": "逐步解析表达式，观察变量如何遮蔽与恢复。",
      "en": "Parse expressions and watch variable bindings hide and restore."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "递归解析",
        "en": "Recursive parsing"
      },
      {
        "zh": "作用域",
        "en": "Scope"
      }
    ],
    "path": "736/",
    "leetcodeUrl": "https://leetcode.com/problems/parse-lisp-expression/",
    "language": "Python",
    "complexity": "O(n) expected time; O(n) auxiliary space, n = expression character length"
  },
  {
    "id": 741,
    "title": {
      "zh": "摘樱桃",
      "en": "Cherry Pickup"
    },
    "desc": {
      "zh": "把往返变成同步行走，推导只记两行坐标的动态规划。",
      "en": "Reverse the return path and derive a synchronized two-traveler dynamic program."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic Programming"
      },
      {
        "zh": "网格路径",
        "en": "Grid Paths"
      }
    ],
    "path": "741/",
    "leetcodeUrl": "https://leetcode.com/problems/cherry-pickup/",
    "language": "Python",
    "complexity": "O(n³) time; O(n²) auxiliary space"
  },
  {
    "id": 745,
    "title": {
      "zh": "前缀和后缀搜索",
      "en": "Prefix and Suffix Search"
    },
    "desc": {
      "zh": "把短单词的两端配对，推导最大下标为何能安全覆盖。",
      "en": "Pair the ends of short words and derive why later indices safely overwrite earlier ones."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "哈希表",
        "en": "Hash map"
      },
      {
        "zh": "字符串",
        "en": "Strings"
      }
    ],
    "path": "745/",
    "leetcodeUrl": "https://leetcode.com/problems/prefix-and-suffix-search/",
    "language": "Python",
    "complexity": "Expected O(nL³) construction time; O(nL³) space; O(|pref|+|suff|) time per query"
  },
  {
    "id": 749,
    "title": {
      "zh": "隔离病毒",
      "en": "Contain Virus"
    },
    "desc": {
      "zh": "分清受威胁格与墙边，冻结日初边界，逐夜模拟隔离与扩散。",
      "en": "Separate threatened cells from wall edges, freeze day-start frontiers, and simulate quarantine and spread."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "网格模拟",
        "en": "Grid simulation"
      },
      {
        "zh": "连通区域",
        "en": "Connected components"
      },
      {
        "zh": "集合去重",
        "en": "Set deduplication"
      }
    ],
    "path": "749/",
    "leetcodeUrl": "https://leetcode.com/problems/contain-virus/",
    "language": "Python",
    "complexity": "O((D+1)mn) time, D ≤ mn, hence O((mn)²) worst case; O(mn) auxiliary space"
  },
  {
    "id": 753,
    "title": {
      "zh": "破解保险箱",
      "en": "Cracking the Safe"
    },
    "desc": {
      "zh": "让相邻密码重叠，用每条边一次构造最短开锁串。",
      "en": "Overlap passwords and use each edge once to build a shortest unlocking string."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "欧拉回路",
        "en": "Euler circuit"
      },
      {
        "zh": "de Bruijn 序列",
        "en": "de Bruijn sequence"
      }
    ],
    "path": "753/",
    "leetcodeUrl": "https://leetcode.com/problems/cracking-the-safe/",
    "language": "Python",
    "complexity": "O(k^n + n) time; O(k^n + n) space including output"
  },
  {
    "id": 757,
    "title": {
      "zh": "设置交集大小至少为二",
      "en": "Set Intersection Size At Least Two"
    },
    "desc": {
      "zh": "从手选整数推导最右贪心，用两个最大点维护所有区间的覆盖。",
      "en": "Derive rightmost greedy choices and cover intervals using only the two largest selected points."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "贪心",
        "en": "Greedy"
      },
      {
        "zh": "区间覆盖",
        "en": "Interval covering"
      }
    ],
    "path": "757/",
    "leetcodeUrl": "https://leetcode.com/problems/set-intersection-size-at-least-two/",
    "language": "Python",
    "complexity": "O(n log n) time; O(n) auxiliary space for sorting"
  },
  {
    "id": 761,
    "title": {
      "zh": "特殊的二进制序列",
      "en": "Special Binary String"
    },
    "desc": {
      "zh": "从前缀余额发现最小块，递归优化内部并证明兄弟块的降序排列。",
      "en": "Discover minimal blocks through prefix balance, optimize their interiors, and prove descending sibling order."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "递归",
        "en": "Recursion"
      },
      {
        "zh": "字符串",
        "en": "Strings"
      },
      {
        "zh": "贪心",
        "en": "Greedy"
      }
    ],
    "path": "761/",
    "leetcodeUrl": "https://leetcode.com/problems/special-binary-string/",
    "language": "Python",
    "complexity": "O(n² log n) time; O(n²) auxiliary space (conservative bounds for slicing implementation)"
  },
  {
    "id": 765,
    "title": {
      "zh": "情侣牵手",
      "en": "Couples Holding Hands"
    },
    "desc": {
      "zh": "固定一个座位对，找回伴侣；用环证明交换次数最少。",
      "en": "Repair one seat pair at a time, then prove the swap count with cycles."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "贪心",
        "en": "Greedy"
      },
      {
        "zh": "位置映射",
        "en": "Position map"
      },
      {
        "zh": "环",
        "en": "Cycles"
      }
    ],
    "path": "765/",
    "leetcodeUrl": "https://leetcode.com/problems/couples-holding-hands/",
    "language": "Python",
    "complexity": "O(n) time; O(n) auxiliary space, where n is the number of couples"
  },
  {
    "id": 768,
    "title": {
      "zh": "最多能完成排序的块 II",
      "en": "Max Chunks To Make Sorted II"
    },
    "desc": {
      "zh": "从亲手切分到前缀最大值与后缀最小值，推导所有安全切口。",
      "en": "Derive every safe cut using prefix maxima and suffix minima, starting with hand-sorted chunks."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "数组",
        "en": "Arrays"
      },
      {
        "zh": "前缀与后缀",
        "en": "Prefixes and suffixes"
      },
      {
        "zh": "贪心",
        "en": "Greedy"
      }
    ],
    "path": "768/",
    "leetcodeUrl": "https://leetcode.com/problems/max-chunks-to-make-sorted-ii/",
    "language": "Python",
    "complexity": "O(n) time; O(n) auxiliary space"
  },
  {
    "id": 770,
    "title": {
      "zh": "基本计算器 IV",
      "en": "Basic Calculator IV"
    },
    "desc": {
      "zh": "从四个手算乘积推导规范项键、递归解析与稀疏多项式运算。",
      "en": "Derive canonical term keys, recursive parsing and sparse polynomial arithmetic from four hand products."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "符号计算",
        "en": "Symbolic arithmetic"
      },
      {
        "zh": "递归解析",
        "en": "Recursive parsing"
      },
      {
        "zh": "哈希表",
        "en": "Hash maps"
      }
    ],
    "path": "770/",
    "leetcodeUrl": "https://leetcode.com/problems/basic-calculator-iv/",
    "language": "Python",
    "complexity": "O(E + n(P+1)²(D+1)log(D+2) + P log(P+1)(D+1)) key operations; O(E + n(P+1)(D+1)) auxiliary space plus output strings"
  },
  {
    "id": 773,
    "title": {
      "zh": "滑动谜题",
      "en": "Sliding Puzzle"
    },
    "desc": {
      "zh": "从一次空位交换推导广度优先搜索，用完整层证明最少移动次数。",
      "en": "Derive breadth-first search from a blank swap and prove minimum moves with complete layers."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "广度优先搜索",
        "en": "Breadth-first search"
      },
      {
        "zh": "状态空间",
        "en": "State space"
      }
    ],
    "path": "773/",
    "leetcodeUrl": "https://leetcode.com/problems/sliding-puzzle/",
    "language": "Python",
    "complexity": "O(V+E) time; O(V) auxiliary space for fixed six-cell states, V ≤ 720 and E ≤ 3V"
  },
  {
    "id": 778,
    "title": {
      "zh": "水位上升的泳池中游泳",
      "en": "Swim in Rising Water"
    },
    "desc": {
      "zh": "从路径最高点推导最小瓶颈搜索，逐步证明最早可达水位。",
      "en": "Derive a minimum-bottleneck search from path maxima and prove the earliest reachable water level."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "图搜索",
        "en": "Graph search"
      },
      {
        "zh": "最小堆",
        "en": "Min-heap"
      }
    ],
    "path": "778/",
    "leetcodeUrl": "https://leetcode.com/problems/swim-in-rising-water/",
    "language": "Python",
    "complexity": "O(n² log n) time; O(n²) auxiliary space"
  },
  {
    "id": 780,
    "title": {
      "zh": "到达终点",
      "en": "Reaching Points"
    },
    "desc": {
      "zh": "从加法倒推到取余，证明边界上的整除检查。",
      "en": "Reverse additions into remainders, then prove the boundary divisibility test."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "数学",
        "en": "Math"
      },
      {
        "zh": "逆向推理",
        "en": "Backward reasoning"
      }
    ],
    "path": "780/",
    "leetcodeUrl": "https://leetcode.com/problems/reaching-points/",
    "language": "Python",
    "complexity": "O(1 + log(max(tx, ty))) time; O(1) auxiliary space"
  },
  {
    "id": 782,
    "title": {
      "zh": "变为棋盘",
      "en": "Transform to Chessboard"
    },
    "desc": {
      "zh": "从整行整列交换，推导可行性与最少交换次数。",
      "en": "Derive feasibility and minimum swaps from preserved row relationships."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "不变量",
        "en": "Invariants"
      },
      {
        "zh": "贪心",
        "en": "Greedy"
      }
    ],
    "path": "782/",
    "leetcodeUrl": "https://leetcode.com/problems/transform-to-chessboard/",
    "language": "Python",
    "complexity": "O(n²) time; O(1) auxiliary space"
  },
  {
    "id": 793,
    "title": {
      "zh": "阶乘函数后 K 个零",
      "en": "Preimage Size of Factorial Zeroes Function"
    },
    "desc": {
      "zh": "从 24! 到 25! 的跳跃，推导两个边界之差。",
      "en": "Use the jump from 24! to 25! to derive a count from two search boundaries."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "二分查找",
        "en": "Binary search"
      },
      {
        "zh": "数学",
        "en": "Math"
      }
    ],
    "path": "793/",
    "leetcodeUrl": "https://leetcode.com/problems/preimage-size-of-factorial-zeroes-function/",
    "language": "Python",
    "complexity": "O(log²(k+2)) time; O(1) auxiliary space"
  },
  {
    "id": 798,
    "title": {
      "zh": "得分最高的最小轮调",
      "en": "Smallest Rotation with Highest Score"
    },
    "desc": {
      "zh": "从每个值的失分区间推导差分扫描。",
      "en": "Derive a difference scan from each value’s losing rotations."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "差分数组",
        "en": "Difference array"
      },
      {
        "zh": "循环索引",
        "en": "Circular indexing"
      }
    ],
    "path": "798/",
    "leetcodeUrl": "https://leetcode.com/problems/smallest-rotation-with-highest-score/",
    "language": "Python",
    "complexity": "O(n) time; O(n) space"
  },
  {
    "id": 801,
    "title": {
      "zh": "使序列递增的最小交换次数",
      "en": "Minimum Swaps To Make Sequences Increasing"
    },
    "desc": {
      "zh": "从一次竖直交换推导保留两种结尾的动态规划。",
      "en": "Derive a two-ending dynamic program from vertical swaps."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      }
    ],
    "path": "801/",
    "leetcodeUrl": "https://leetcode.com/problems/minimum-swaps-to-make-sequences-increasing/",
    "language": "Python",
    "complexity": "O(n) time; O(1) auxiliary space"
  },
  {
    "id": 803,
    "title": {
      "zh": "打砖块",
      "en": "Bricks Falling When Hit"
    },
    "desc": {
      "zh": "倒序补砖，用屋顶连通数的增量推导掉落数量。",
      "en": "Reverse the hits and derive fallen counts from growth in roof connectivity."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "并查集",
        "en": "Union-find"
      },
      {
        "zh": "逆序处理",
        "en": "Reverse processing"
      }
    ],
    "path": "803/",
    "leetcodeUrl": "https://leetcode.com/problems/bricks-falling-when-hit/",
    "language": "Python",
    "complexity": "O((mn + H) α(mn)) amortized time; O(mn + H) auxiliary space"
  },
  {
    "id": 805,
    "title": {
      "zh": "数组的均值分割",
      "en": "Split Array With Same Average"
    },
    "desc": {
      "zh": "从三张数字卡片推导等均值条件，用折半子集和寻找非空分组。",
      "en": "Derive an exact average condition, then pair count-indexed subset sums from two halves."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "折半搜索",
        "en": "Meet in the middle"
      },
      {
        "zh": "子集和",
        "en": "Subset sum"
      }
    ],
    "path": "805/",
    "leetcodeUrl": "https://leetcode.com/problems/split-array-with-same-average/",
    "language": "Python",
    "complexity": "O(n · 2^ceil(n/2)) expected time; O(2^ceil(n/2)) space"
  },
  {
    "id": 810,
    "title": {
      "zh": "黑板异或游戏",
      "en": "Chalkboard XOR Game"
    },
    "desc": {
      "zh": "从一次擦除看清输赢规则，用异或与奇偶性代替博弈搜索。",
      "en": "Explore losing erasures, then replace game search with XOR and parity."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "博弈",
        "en": "Game theory"
      },
      {
        "zh": "位运算",
        "en": "Bit manipulation"
      }
    ],
    "path": "810/",
    "leetcodeUrl": "https://leetcode.com/problems/chalkboard-xor-game/",
    "language": "Python",
    "complexity": "O(n) time; O(1) auxiliary space"
  },
  {
    "id": 815,
    "title": {
      "zh": "公交路线",
      "en": "Bus Routes"
    },
    "desc": {
      "zh": "从一次上车解锁整条线路，推导按乘车数分层的搜索与一次扫描不变量。",
      "en": "Unlock an entire route per boarding and derive BFS layers with a scan-once invariant."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "广度优先搜索",
        "en": "Breadth-first search"
      },
      {
        "zh": "倒排索引",
        "en": "Inverted index"
      }
    ],
    "path": "815/",
    "leetcodeUrl": "https://leetcode.com/problems/bus-routes/",
    "language": "Python",
    "complexity": "O(M + R) expected time; O(M + R) auxiliary space, M = total route entries, R = route count"
  },
  {
    "id": 818,
    "title": {
      "zh": "赛车",
      "en": "Race Car"
    },
    "desc": {
      "zh": "从完整状态的分层搜索，推导乐观下界并用 A* 减少探索。",
      "en": "Derive an optimistic bound from full-state BFS and prioritize exploration with A*."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "广度优先搜索",
        "en": "Breadth-first search"
      },
      {
        "zh": "状态建模",
        "en": "State modeling"
      },
      {
        "zh": "A* 搜索",
        "en": "A* search"
      }
    ],
    "path": "818/",
    "leetcodeUrl": "https://leetcode.com/problems/race-car/",
    "language": "Python",
    "complexity": "O(D * 2^D) time; O(2^D) space, conservative unit-cost bounds for optimal command depth D; heap work O(Q log Q) for Q generated entries"
  },
  {
    "id": 827,
    "title": {
      "zh": "最大人工岛",
      "en": "Making A Large Island"
    },
    "desc": {
      "zh": "给岛编号，用不同邻岛的面积求一次翻转的收益。",
      "en": "Label islands and combine distinct neighboring areas for one flip."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "连通分量",
        "en": "Connected components"
      },
      {
        "zh": "洪水填充",
        "en": "Flood fill"
      }
    ],
    "path": "827/",
    "leetcodeUrl": "https://leetcode.com/problems/making-a-large-island/",
    "language": "Python",
    "complexity": "O(n²) time; O(n²) auxiliary space"
  },
  {
    "id": 828,
    "title": {
      "zh": "统计所有子串中的唯一字符",
      "en": "Count Unique Characters of All Substrings of a Given String"
    },
    "desc": {
      "zh": "从 ABA 的六个子串，推导每个字符位置的贡献。",
      "en": "Derive occurrence contributions from the six substrings of ABA."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "贡献计数",
        "en": "Contribution counting"
      },
      {
        "zh": "字符串",
        "en": "Strings"
      }
    ],
    "path": "828/",
    "leetcodeUrl": "https://leetcode.com/problems/count-unique-characters-of-all-substrings-of-a-given-string/",
    "language": "Python",
    "complexity": "O(n) time; O(n) auxiliary space"
  },
  {
    "id": 829,
    "title": {
      "zh": "连续整数求和",
      "en": "Consecutive Numbers Sum"
    },
    "desc": {
      "zh": "减掉递增的台阶，用长度与整除条件数出正整数序列。",
      "en": "Remove the increasing offsets, then count lengths with an equal-sharing test."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "数学",
        "en": "Mathematics"
      },
      {
        "zh": "枚举长度",
        "en": "Length enumeration"
      }
    ],
    "path": "829/",
    "leetcodeUrl": "https://leetcode.com/problems/consecutive-numbers-sum/",
    "language": "Python",
    "complexity": "O(sqrt(n)) time; O(1) auxiliary space"
  },
  {
    "id": 834,
    "title": {
      "zh": "树中距离之和",
      "en": "Sum of Distances in Tree"
    },
    "desc": {
      "zh": "切开一条边，数清变近和变远的节点，推导线性换根算法。",
      "en": "Cut one edge, count who gets closer or farther, and derive linear rerooting."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "树",
        "en": "Tree"
      },
      {
        "zh": "换根动态规划",
        "en": "Rerooting DP"
      }
    ],
    "path": "834/",
    "leetcodeUrl": "https://leetcode.com/problems/sum-of-distances-in-tree/",
    "language": "Python",
    "complexity": "O(n) time; O(n) auxiliary space"
  },
  {
    "id": 839,
    "title": {
      "zh": "相似字符串组",
      "en": "Similar String Groups"
    },
    "desc": {
      "zh": "从一次交换到连通分组，推导并查集的不变量。",
      "en": "From one swap to connected groups: derive the disjoint-set invariant."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "并查集",
        "en": "Disjoint sets"
      },
      {
        "zh": "图连通性",
        "en": "Graph connectivity"
      }
    ],
    "path": "839/",
    "leetcodeUrl": "https://leetcode.com/problems/similar-string-groups/",
    "language": "Python",
    "complexity": "O(n²(L + log n)) time; O(n) auxiliary space, for n words of length L (conservative bound)"
  },
  {
    "id": 843,
    "title": {
      "zh": "猜猜这个单词",
      "en": "Guess the Word"
    },
    "desc": {
      "zh": "用逐位匹配排除候选，再用最坏回复桶选择提问。",
      "en": "Filter by positional matches and choose guesses by worst reply buckets."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "交互式搜索",
        "en": "Interactive search"
      },
      {
        "zh": "极小化最坏情况",
        "en": "Minimax"
      }
    ],
    "path": "843/",
    "leetcodeUrl": "https://leetcode.com/problems/guess-the-word/",
    "language": "Python",
    "complexity": "O(n²L + Gn²) time; O(n²) auxiliary space, L=6 and G≤n (worst-case O(n³+n²L) time)"
  },
  {
    "id": 847,
    "title": {
      "zh": "访问所有节点的最短路径",
      "en": "Shortest Path Visiting All Nodes"
    },
    "desc": {
      "zh": "从重复经过中心的星形走法，推导记录当前位置与访问集合的多起点搜索。",
      "en": "Derive a search over current nodes and visited sets from a walk that revisits a star’s center."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "广度优先搜索",
        "en": "Breadth-first search"
      },
      {
        "zh": "位掩码",
        "en": "Bitmask"
      }
    ],
    "path": "847/",
    "leetcodeUrl": "https://leetcode.com/problems/shortest-path-visiting-all-nodes/",
    "language": "Python",
    "complexity": "O((n+m)2^n) expected time; O(n2^n) auxiliary space, m = undirected edges"
  },
  {
    "id": 850,
    "title": {
      "zh": "矩形面积 II",
      "en": "Rectangle Area II"
    },
    "desc": {
      "zh": "把重叠矩形切成竖条，用区间合并计算覆盖高度。",
      "en": "Slice overlapping rectangles into strips and merge their covered heights."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "扫描线",
        "en": "Sweep line"
      },
      {
        "zh": "区间合并",
        "en": "Interval merging"
      }
    ],
    "path": "850/",
    "leetcodeUrl": "https://leetcode.com/problems/rectangle-area-ii/",
    "language": "Python",
    "complexity": "O(n² log n) time; O(n) auxiliary space"
  },
  {
    "id": 854,
    "title": {
      "zh": "相似度为 K 的字符串",
      "en": "K-Similar Strings"
    },
    "desc": {
      "zh": "从亲手交换到保留最短路径的首错剪枝 BFS。",
      "en": "Derive first-mismatch BFS pruning from concrete swaps."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "广度优先搜索",
        "en": "Breadth-first search"
      },
      {
        "zh": "字符串",
        "en": "Strings"
      }
    ],
    "path": "854/",
    "leetcodeUrl": "https://leetcode.com/problems/k-similar-strings/",
    "language": "Python",
    "complexity": "O(S n²) time; O(S n) space, S = n! / product of letter-count factorials"
  },
  {
    "id": 857,
    "title": {
      "zh": "雇佣 K 名工人的最低成本",
      "en": "Minimum Cost to Hire K Workers"
    },
    "desc": {
      "zh": "从共同工资单价推导排序与最大堆。",
      "en": "Derive a rate sweep and max-heap from proportional pay."
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
    "path": "857/",
    "leetcodeUrl": "https://leetcode.com/problems/minimum-cost-to-hire-k-workers/",
    "language": "Python",
    "complexity": "O(n log n + n log(k+1)) time; O(n+k) auxiliary space"
  },
  {
    "id": 862,
    "title": {
      "zh": "和至少为 K 的最短子数组",
      "en": "Shortest Subarray with Sum at Least K"
    },
    "desc": {
      "zh": "从负数反例推导前缀和与双端队列的两种安全删除。",
      "en": "Derive two safe deque removals from prefix sums and a negative-value counterexample."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "前缀和",
        "en": "Prefix sums"
      },
      {
        "zh": "单调队列",
        "en": "Monotonic deque"
      }
    ],
    "path": "862/",
    "leetcodeUrl": "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/",
    "language": "Python",
    "complexity": "O(n) time; O(n) auxiliary space"
  },
  {
    "id": 864,
    "title": {
      "zh": "获取所有钥匙的最短路径",
      "en": "Shortest Path to Get All Keys"
    },
    "desc": {
      "zh": "同一格子，不同钥匙：从手算路线推导完整状态的分层搜索。",
      "en": "Same square, different keys: derive a layered search over position and inventory."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "广度优先搜索",
        "en": "Breadth-first search"
      },
      {
        "zh": "位掩码",
        "en": "Bitmask"
      }
    ],
    "path": "864/",
    "leetcodeUrl": "https://leetcode.com/problems/shortest-path-to-get-all-keys/",
    "language": "Python",
    "complexity": "O(mn · 2^k) time; O(mn · 2^k) auxiliary space"
  },
  {
    "id": 871,
    "title": {
      "zh": "最低加油次数",
      "en": "Minimum Number of Refueling Stops"
    },
    "desc": {
      "zh": "从可达距离推导最大堆贪心，用可回退的补给记录证明最少停靠次数。",
      "en": "Derive the maximum-fuel greedy choice from reachable distance, then inspect a reversible refueling ledger."
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
    "path": "871/",
    "leetcodeUrl": "https://leetcode.com/problems/minimum-number-of-refueling-stops/",
    "language": "Python",
    "complexity": "O(n log(n+1)) time; O(n) auxiliary space"
  },
  {
    "id": 878,
    "title": {
      "zh": "第 N 个神奇数字",
      "en": "Nth Magical Number"
    },
    "desc": {
      "zh": "从重复的倍数到精确计数，推导保留答案的二分边界。",
      "en": "Count overlapping multiples, then derive a binary search that retains the answer."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "二分查找",
        "en": "Binary search"
      },
      {
        "zh": "容斥计数",
        "en": "Inclusion–exclusion"
      }
    ],
    "path": "878/",
    "leetcodeUrl": "https://leetcode.com/problems/nth-magical-number/",
    "language": "Python",
    "complexity": "O(log(min(a,b)) + log(n*min(a,b))) integer operations; O(1) auxiliary integer cells"
  },
  {
    "id": 879,
    "title": {
      "zh": "盈利计划",
      "en": "Profitable Schemes"
    },
    "desc": {
      "zh": "从四个子集推导人数与封顶利润的计数表。",
      "en": "Derive a count table for exact members and capped profit from four subsets."
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
    "path": "879/",
    "leetcodeUrl": "https://leetcode.com/problems/profitable-schemes/",
    "language": "Python",
    "complexity": "O(m*n*(minProfit+1)) time; O(n*(minProfit+1)) auxiliary space"
  },
  {
    "id": 882,
    "title": {
      "zh": "细分图中的可到达节点",
      "en": "Reachable Nodes In Subdivided Graph"
    },
    "desc": {
      "zh": "用最短距离与两端覆盖计数，避开巨大细分图。",
      "en": "Count coverage from both ends using shortest distances, without expanding the graph."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "最短路径",
        "en": "Shortest paths"
      },
      {
        "zh": "图",
        "en": "Graphs"
      }
    ],
    "path": "882/",
    "leetcodeUrl": "https://leetcode.com/problems/reachable-nodes-in-subdivided-graph/",
    "language": "Python",
    "complexity": "O(n + m log(n + 1)) time; O(n + m) space"
  },
  {
    "id": 887,
    "title": {
      "zh": "鸡蛋掉落",
      "en": "Super Egg Drop"
    },
    "desc": {
      "zh": "从两枚鸡蛋与六层楼，推导固定次数能覆盖多少楼层。",
      "en": "From two eggs and six floors, derive how many floors a move budget can cover."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "最坏情况分析",
        "en": "Worst-case analysis"
      }
    ],
    "path": "887/",
    "leetcodeUrl": "https://leetcode.com/problems/super-egg-drop/",
    "language": "Python",
    "complexity": "O(kM) time; O(k) auxiliary space, where M is the minimum move count and M <= n"
  },
  {
    "id": 891,
    "title": {
      "zh": "子序列宽度之和",
      "en": "Sum of Subsequence Widths"
    },
    "desc": {
      "zh": "从逐个子序列的宽度，推导每个排序位置的最大值与最小值贡献。",
      "en": "Count how often each sorted position contributes a maximum or minimum."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "排序",
        "en": "Sorting"
      },
      {
        "zh": "组合计数",
        "en": "Combinatorics"
      }
    ],
    "path": "891/",
    "leetcodeUrl": "https://leetcode.com/problems/sum-of-subsequence-widths/",
    "language": "Python",
    "complexity": "O(n log n) time; O(n) space"
  },
  {
    "id": 895,
    "title": {
      "zh": "最大频率栈",
      "en": "Maximum Frequency Stack"
    },
    "desc": {
      "zh": "用频率层的历史同时保存出现次数与最近顺序。",
      "en": "Preserve frequency and recency with a stack for each frequency level."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "栈",
        "en": "Stack"
      },
      {
        "zh": "哈希表",
        "en": "Hash table"
      }
    ],
    "path": "895/",
    "leetcodeUrl": "https://leetcode.com/problems/maximum-frequency-stack/",
    "language": "Python",
    "complexity": "O(1) expected amortized time per push/pop; O(q) space for q calls"
  },
  {
    "id": 899,
    "title": {
      "zh": "有序队列",
      "en": "Orderly Queue"
    },
    "desc": {
      "zh": "从三个字母出发，证明旋转与排序之间的分界。",
      "en": "Start with three letters and prove the boundary between rotation and sorting."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "字符串",
        "en": "Strings"
      },
      {
        "zh": "可达性",
        "en": "Reachability"
      }
    ],
    "path": "899/",
    "leetcodeUrl": "https://leetcode.com/problems/orderly-queue/",
    "language": "Python",
    "complexity": "k = 1: O(n²) time; k ≥ 2: O(n log n) time; O(n) auxiliary space in both cases"
  },
  {
    "id": 902,
    "title": {
      "zh": "最大为 N 的数字组合",
      "en": "Numbers At Most N Given Digit Set"
    },
    "desc": {
      "zh": "通过首个不同数位，把逐个检查变成互不重叠的计数块。",
      "en": "Count disjoint blocks by the first digit that differs from the bound."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "组合计数",
        "en": "Combinatorial counting"
      },
      {
        "zh": "数位前缀",
        "en": "Digit prefixes"
      }
    ],
    "path": "902/",
    "leetcodeUrl": "https://leetcode.com/problems/numbers-at-most-n-given-digit-set/",
    "language": "Python",
    "complexity": "O(Lm) time; O(L) auxiliary space, where L = len(str(n)) and m = len(digits)"
  },
  {
    "id": 903,
    "title": {
      "zh": "DI 序列的有效排列",
      "en": "Valid Permutations for DI Sequence"
    },
    "desc": {
      "zh": "从末尾排名推导计数状态，逐格观察前缀与后缀求和。",
      "en": "Derive counts by final rank and inspect prefix and suffix contributions."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "前缀和",
        "en": "Prefix sums"
      }
    ],
    "path": "903/",
    "leetcodeUrl": "https://leetcode.com/problems/valid-permutations-for-di-sequence/",
    "language": "Python",
    "complexity": "O(n²) time; O(n) auxiliary space"
  },
  {
    "id": 906,
    "title": {
      "zh": "超级回文数",
      "en": "Super Palindromes"
    },
    "desc": {
      "zh": "镜像构造回文平方根，完整检查超级回文数。",
      "en": "Mirror square roots and prove a complete super-palindrome search."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "数学",
        "en": "Math"
      },
      {
        "zh": "枚举",
        "en": "Enumeration"
      }
    ],
    "path": "906/",
    "leetcodeUrl": "https://leetcode.com/problems/super-palindromes/",
    "language": "Python",
    "complexity": "O(R^(1/4) log R) time; O(log R) auxiliary space, R = int(right)"
  },
  {
    "id": 913,
    "title": {
      "zh": "猫和老鼠",
      "en": "Cat and Mouse"
    },
    "desc": {
      "zh": "从一个安全出口推导逆向胜负传播，区分尚未证明与平局。",
      "en": "Derive backward win propagation from a safe exit, and distinguish unknown from draw."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "图上博弈",
        "en": "Graph games"
      },
      {
        "zh": "逆向推理",
        "en": "Retrograde analysis"
      }
    ],
    "path": "913/",
    "leetcodeUrl": "https://leetcode.com/problems/cat-and-mouse/",
    "language": "Python",
    "complexity": "O(nE) time; O(n²) auxiliary space, E = undirected edges"
  },
  {
    "id": 920,
    "title": {
      "zh": "播放列表的数量",
      "en": "Number of Music Playlists"
    },
    "desc": {
      "zh": "从 A、B 的三次播放出发，推导新歌与重播的计数递推。",
      "en": "Count tiny A/B playlists, then derive the new-song and replay transitions."
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
    "path": "920/",
    "leetcodeUrl": "https://leetcode.com/problems/number-of-music-playlists/",
    "language": "Python",
    "complexity": "O(goal * n) time; O(n) auxiliary space"
  },
  {
    "id": 940,
    "title": {
      "zh": "不同的子序列 II",
      "en": "Distinct Subsequences II"
    },
    "desc": {
      "zh": "按末尾字母分组，理解重复子序列为何必须替换。",
      "en": "Group by final letter to replace repeated subsequences exactly once."
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
    "path": "940/",
    "leetcodeUrl": "https://leetcode.com/problems/distinct-subsequences-ii/",
    "language": "Python",
    "complexity": "O(n) time; O(26) = O(1) auxiliary space"
  },
  {
    "id": 956,
    "title": {
      "zh": "最高的广告牌",
      "en": "Tallest Billboard"
    },
    "desc": {
      "zh": "从焊接两根等高支架，推导高度差动态规划。",
      "en": "Derive difference-state DP by welding two equal supports."
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
    "path": "956/",
    "leetcodeUrl": "https://leetcode.com/problems/tallest-billboard/",
    "language": "Python",
    "complexity": "O(nS) expected time; O(S) auxiliary space, S = sum(rods)"
  },
  {
    "id": 960,
    "title": {
      "zh": "删列造序 III",
      "en": "Delete Columns to Make Sorted III"
    },
    "desc": {
      "zh": "从共享列的兼容关系推导最长保留链。",
      "en": "Derive a longest kept chain from shared-column compatibility."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      },
      {
        "zh": "子序列",
        "en": "Subsequences"
      }
    ],
    "path": "960/",
    "leetcodeUrl": "https://leetcode.com/problems/delete-columns-to-make-sorted-iii/",
    "language": "Python",
    "complexity": "O(nm²) time; O(m) auxiliary space"
  },
  {
    "id": 964,
    "title": {
      "zh": "表示数字的最少运算符",
      "en": "Least Operators to Express Number"
    },
    "desc": {
      "zh": "从 3×3−3÷3 推导保留两种进位选择的数位动态规划。",
      "en": "Derive a two-state digit DP from 3×3−3÷3 and compare direct and complement costs."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "数位动态规划",
        "en": "Digit DP"
      },
      {
        "zh": "进位",
        "en": "Carry"
      }
    ],
    "path": "964/",
    "leetcodeUrl": "https://leetcode.com/problems/least-operators-to-express-number/",
    "language": "Python",
    "complexity": "O(1 + log_x(target)) time; O(1) auxiliary space"
  },
  {
    "id": 968,
    "title": {
      "zh": "监控二叉树",
      "en": "Binary Tree Cameras"
    },
    "desc": {
      "zh": "从三节点覆盖实验推导后序遍历的三种状态与最少摄像头。",
      "en": "Derive three postorder states from a tiny camera coverage experiment."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "二叉树",
        "en": "Binary trees"
      },
      {
        "zh": "贪心",
        "en": "Greedy"
      },
      {
        "zh": "后序遍历",
        "en": "Postorder traversal"
      }
    ],
    "path": "968/",
    "leetcodeUrl": "https://leetcode.com/problems/binary-tree-cameras/",
    "language": "Python",
    "complexity": "O(n) time; O(n) auxiliary space"
  },
  {
    "id": 972,
    "title": {
      "zh": "相等的有理数",
      "en": "Equal Rational Numbers"
    },
    "desc": {
      "zh": "把无限循环小数变成精确分数，辨认不同写法背后的同一个数。",
      "en": "Turn repeating decimals into exact fractions and compare different spellings."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "数学",
        "en": "Math"
      },
      {
        "zh": "字符串",
        "en": "Strings"
      }
    ],
    "path": "972/",
    "leetcodeUrl": "https://leetcode.com/problems/equal-rational-numbers/",
    "language": "Python",
    "complexity": "O(n) parsing time; O(n) auxiliary space under the official bounded-digit arithmetic model"
  },
  {
    "id": 975,
    "title": {
      "zh": "奇偶跳",
      "en": "Odd Even Jump"
    },
    "desc": {
      "zh": "从强制跳跃推导排序、栈与双状态倒推。",
      "en": "Derive sorted targets and two-state reachability from forced jumps."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "单调栈",
        "en": "Monotonic stack"
      },
      {
        "zh": "动态规划",
        "en": "Dynamic programming"
      }
    ],
    "path": "975/",
    "leetcodeUrl": "https://leetcode.com/problems/odd-even-jump/",
    "language": "Python",
    "complexity": "O(n log n) time; O(n) auxiliary space"
  },
  {
    "id": 980,
    "title": {
      "zh": "不同路径 III",
      "en": "Unique Paths III"
    },
    "desc": {
      "zh": "从提前到达终点的失败，推导覆盖每个格子的回溯计数。",
      "en": "Derive complete-walk backtracking from an early arrival that fails."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "回溯",
        "en": "Backtracking"
      },
      {
        "zh": "网格搜索",
        "en": "Grid search"
      }
    ],
    "path": "980/",
    "leetcodeUrl": "https://leetcode.com/problems/unique-paths-iii/",
    "language": "Python",
    "complexity": "O(mn + 3^V) time; O(V) auxiliary space, V non-obstacle cells"
  },
  {
    "id": 982,
    "title": {
      "zh": "按位与为零的三元组",
      "en": "Triples with Bitwise AND Equal To Zero"
    },
    "desc": {
      "zh": "保留有序数对的次数，再用子集求和统计兼容的第三个数。",
      "en": "Preserve ordered-pair multiplicities, then sum compatible masks for each third value."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "位运算",
        "en": "Bit manipulation"
      },
      {
        "zh": "子集求和",
        "en": "Subset sums"
      }
    ],
    "path": "982/",
    "leetcodeUrl": "https://leetcode.com/problems/triples-with-bitwise-and-equal-to-zero/",
    "language": "Python",
    "complexity": "O(n² + B·2^B) time; O(2^B) auxiliary space, B = max(1, bit_length(max(nums))) ≤ 16"
  },
  {
    "id": 987,
    "title": {
      "zh": "二叉树的垂序遍历",
      "en": "Vertical Order Traversal of a Binary Tree"
    },
    "desc": {
      "zh": "用坐标与三层排序规则解决同位置节点的冲突。",
      "en": "Use coordinates and three ordering keys to resolve nodes sharing a position."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "二叉树",
        "en": "Binary tree"
      },
      {
        "zh": "排序",
        "en": "Sorting"
      }
    ],
    "path": "987/",
    "leetcodeUrl": "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/",
    "language": "Python",
    "complexity": "O(n log n) time; O(n) auxiliary space and O(n) output space"
  },
  {
    "id": 992,
    "title": {
      "zh": "K 个不同整数的子数组",
      "en": "Subarrays with K Different Integers"
    },
    "desc": {
      "zh": "从手算到两个左边界：用至多计数相减，恰好数出 k 种值的连续区间。",
      "en": "Derive two left boundaries and subtract at-most counts to count exactly-k intervals."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "滑动窗口",
        "en": "Sliding window"
      },
      {
        "zh": "频次计数",
        "en": "Frequency counting"
      }
    ],
    "path": "992/",
    "leetcodeUrl": "https://leetcode.com/problems/subarrays-with-k-different-integers/",
    "language": "Python",
    "complexity": "O(n) expected time; O(n) auxiliary space"
  },
  {
    "id": 995,
    "title": {
      "zh": "K 连续位的最小翻转次数",
      "en": "Minimum Number of K Consecutive Bit Flips"
    },
    "desc": {
      "zh": "从左端的必选翻转，推导奇偶性与到期事件的线性扫描。",
      "en": "Derive a linear parity-and-expiry scan from forced leftmost flips."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "贪心",
        "en": "Greedy"
      },
      {
        "zh": "差分事件",
        "en": "Difference events"
      }
    ],
    "path": "995/",
    "leetcodeUrl": "https://leetcode.com/problems/minimum-number-of-k-consecutive-bit-flips/",
    "language": "Python",
    "complexity": "O(n) time; O(n) auxiliary space"
  },
  {
    "id": 996,
    "title": {
      "zh": "正方形数组的数目",
      "en": "Number of Squareful Arrays"
    },
    "desc": {
      "zh": "用剩余次数回溯，既检查相邻平方和，又避免重复排列。",
      "en": "Track remaining counts to build legal squareful orders without duplicates."
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
    "path": "996/",
    "leetcodeUrl": "https://leetcode.com/problems/number-of-squareful-arrays/",
    "language": "Python",
    "complexity": "O(n*n! + k²) time; O(n + k²) auxiliary space, k distinct values"
  },
  {
    "id": 1000,
    "title": {
      "zh": "合并石头的最低成本",
      "en": "Minimum Cost to Merge Stones"
    },
    "desc": {
      "zh": "从每次付费到区间与堆数：推导合法合并的动态规划。",
      "en": "From merge payments to interval states with an explicit pile count."
    },
    "difficulty": "hard",
    "topics": [
      {
        "zh": "区间动态规划",
        "en": "Interval DP"
      }
    ],
    "path": "1000/",
    "leetcodeUrl": "https://leetcode.com/problems/minimum-cost-to-merge-stones/",
    "language": "Python",
    "complexity": "O(n³k) time; O(n²k) auxiliary space"
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
