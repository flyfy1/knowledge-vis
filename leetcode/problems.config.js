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
    "complexity": "O(n)"
  },
  {
    "id": 44,
    "title": {
      "zh": "通配符匹配",
      "en": "Wildcard Matching"
    },
    "desc": {
      "zh": "dp[i][j] 表示文本前 i 个字符与模式前 j 个字符完全匹配。普通字符与 ? 从左上格转移；* 为零字符时读左格 dp[i][j−1]，再吃一个字符时读上格 dp[i−1][j]。",
      "en": "dp[i][j] means the first i text characters fully match the first j pattern characters. Literals and ? use the diagonal. A * consuming nothing uses the left cell dp[i][j−1]; consuming one more uses above, dp[i−1][j]."
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
    "complexity": "O((m+1)(n+1))"
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
