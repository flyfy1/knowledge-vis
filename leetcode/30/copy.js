window.LESSON_COPY = {
  "back": [
    "← LeetCode 专区",
    "← LeetCode collection"
  ],
  "official": [
    "LeetCode 原题 ↗",
    "View on LeetCode ↗"
  ],
  "s0": [
    "要找什么？",
    "What are we finding?"
  ],
  "s1": [
    "为什么能省去工作？",
    "Why can we skip work?"
  ],
  "s2": [
    "一次操作改变什么？",
    "What changes in one operation?"
  ],
  "s3": [
    "先预测，再验证",
    "Predict before revealing"
  ],
  "s4": [
    "如何写成 Python？",
    "How does this become Python?"
  ],
  "handTitle": [
    "先手算一个例子",
    "Work one example by hand"
  ],
  "baselineTitle": [
    "一个简单正确的基线",
    "A simple correct baseline"
  ],
  "presets": [
    "实验输入（切换会重启）",
    "Experiment input (changing restarts)"
  ],
  "prev": [
    "回退一次操作",
    "Rewind one operation"
  ],
  "next": [
    "执行下一次操作",
    "Execute next operation"
  ],
  "reset": [
    "重启当前实验",
    "Restart this experiment"
  ],
  "position": [
    "事件位置",
    "Event position"
  ],
  "progress": [
    "事件 {current} / {total}",
    "Event {current} / {total}"
  ],
  "before": [
    "上一次状态",
    "Previous state"
  ],
  "now": [
    "当前状态",
    "Current state"
  ],
  "result": [
    "最终结果",
    "Final result"
  ],
  "state": [
    "算法状态（变量与图示索引）",
    "Algorithm state (variables and diagram indices)"
  ],
  "operation": [
    "对应 Python 操作（局部展开）",
    "Corresponding Python operation (focused excerpt)"
  ],
  "history": [
    "最近的操作（保留最多 6 条）",
    "Recent operations (up to 6 retained)"
  ],
  "reveal": [
    "验证我的预测",
    "Check my prediction"
  ],
  "choose": [
    "请先选择，答案尚未揭晓。",
    "Choose first; the answer has not been revealed."
  ],
  "right": [
    "推理正确。",
    "Correct reasoning."
  ],
  "wrong": [
    "再检查这个边界。",
    "Check this boundary again."
  ],
  "mapping": [
    "图中的量如何对应代码？",
    "How do visible quantities map to code?"
  ],
  "quantity": [
    "Python 名称",
    "Python name"
  ],
  "meaning": [
    "图中的含义",
    "Meaning in the view"
  ],
  "copy": [
    "复制 Python",
    "Copy Python"
  ],
  "download": [
    "下载 solution.py",
    "Download solution.py"
  ],
  "copied": [
    "已复制。",
    "Copied."
  ],
  "copyFail": [
    "无法自动复制；请从下方文本框选择复制。",
    "Automatic copy unavailable; select the code in the text box below."
  ],
  "fallback": [
    "手动复制 Python 源码",
    "Python source for manual copying"
  ],
  "fullCode": [
    "完整 Python 解法",
    "Complete Python solution"
  ],
  "counterHelp": [
    "Counter 是按词保存次数的表：Counter([\"foo\",\"foo\"]) 得到 foo:2；have = Counter() 从空表开始。读取尚未出现的 have[\"bar\"] 得到 0，所以 += 1 能直接加入新词。缩窗的三行必须一起做：次数减 1、used 减 1、left 增加 width。例如事件 6→7：foo:2→1，used:2→1，left:3→6；图中 right 仍为 9。",
    "Counter is a table of word counts: Counter([\"foo\",\"foo\"]) gives foo:2; have = Counter() starts empty. Reading an absent have[\"bar\"] gives 0, so += 1 can add a new word directly. Shrinking needs all three updates: decrement the word count, decrement used, and advance left by width. For event 6→7: foo:2→1, used:2→1, left:3→6; displayed right stays 9."
  ],
  "trapsTitle": [
    "哪些边界最容易出错？",
    "Which boundaries are easy to get wrong?"
  ],
  "verifyTitle": [
    "怎样独立核对？",
    "How can we check independently?"
  ],
  "verify": [
    "对每个预设，先按题意手算，再把实验推进到终点。上面的基线可独立核对小输入；测试文件还覆盖随机、穷举与边界。浏览器执行的是 JavaScript 模型，不是 Python 运行器。",
    "For each preset, first calculate from the definition, then reach the experiment endpoint. The baseline independently checks small inputs; test files cover random, exhaustive, and boundary cases. The browser runs a JavaScript model, not a Python interpreter."
  ],
  "related": [
    "继续连接这些概念",
    "Connect these ideas"
  ],
  "foot": [
    "算法实验 · 中英双语 · Python 解法 · 未声称 LeetCode 提交通过或真实学习效果",
    "Algorithm experiments · Chinese / English · Python solutions · No claim of LeetCode submission acceptance or measured learning outcomes"
  ],
  "output": [
    "已记录的起点下标",
    "Recorded starting indices"
  ],
  "empty": [
    "∅（空）",
    "∅ (empty)"
  ],
  "heap": [
    "最小堆（按树的层级展示）",
    "Min-heap (shown by tree level)"
  ],
  "head": [
    "入口 head",
    "Entry head"
  ],
  "links": [
    "所有节点的 next；# 是永久身份",
    "Every node’s next; # is permanent identity"
  ],
  "dpLegend": [
    "行：文本前缀；列：模式前缀。青色=当前；橙边=依赖；T/F=真假；·=待算。",
    "Rows: text prefixes; columns: pattern prefixes. Cyan=current; orange border=dependency; T/F=true/false; ·=uncomputed."
  ],
  "waterLegend": [
    "每格单位高度；灰=柱子，青=已结算水。底部为下标；· 表示尚未结算。",
    "Each block is one height unit; gray=bar, cyan=settled water. Indices are below; · means unsettled."
  ],
  "sudokuLegend": [
    "粗线围住 3×3 宫；橙色=原始已知数；青色=当前格；坐标从 0 开始。",
    "Thick lines bound 3×3 boxes; orange=givens; cyan=current cell; coordinates start at zero."
  ],
  "cut": [
    "切口",
    "Cut"
  ],
  "activeLegend": [
    "高亮与下划线表示这一帧保留的窗口 [left, right)：包含 left，不含 right。当前图是操作后状态；“上一次状态”是操作前状态。移走的词不再高亮；清空后没有高亮。次数行才是计数数据；字符下方是下标。",
    "Highlight and underline show the retained window [left, right): include left, exclude right. The current diagram is after the operation; Previous state is before it. Removed words are no longer highlighted; clearing leaves no highlight. Count rows hold the count data; character indices appear below values."
  ],
  "unchanged": [
    "还没有上一帧。",
    "No previous frame yet."
  ],
  "docTitle": [
    "30 · 串联所有单词的子串",
    "30 · Substring with Concatenation of All Words"
  ],
  "title": [
    "#30 · 串联所有单词的子串",
    "#30 · Substring with Concatenation of All Words"
  ],
  "topic": [
    "定长滑动窗口",
    "Word-aligned sliding window"
  ],
  "statement": [
    "哪些起点能连续放下全部单词？words 中所有词等长，顺序任意，但每个词必须按给定次数使用，且不能夹杂别的字符。返回所有合法起点的字符下标。",
    "Which starts contain all words consecutively? All words have equal length and may appear in any order, but each must occur with its given multiplicity and with no gaps. Return every valid character index."
  ],
  "constraints": [
    "文本长度 ≤ 10⁴；1…5000 个词；词长 1…30；均为小写字母。返回下标的顺序不限。",
    "Text length ≤ 10⁴; 1…5000 words; word length 1…30; lowercase letters only. Output order is unrestricted."
  ],
  "hand": [
    "s=\"barfoofoo\"，words=[\"bar\",\"foo\"]：起点 0 给出 bar+foo，合法；起点 3 给出 foo+foo，缺 bar 且多 foo，不合法。不能只检查词是否在集合里。",
    "For s=\"barfoofoo\", words=[\"bar\",\"foo\"], start 0 gives bar+foo and is valid. Start 3 gives foo+foo, missing bar and overusing foo. Set membership alone is insufficient."
  ],
  "cost": [
    "每个起点重新切出 k 个词并计数，最坏 O(Lkw) 时间；相邻的同对齐窗口重复检查大量相同词。L 是字符数，k 是词数，w 是词长。",
    "Re-splitting and counting k words at every start costs O(Lkw) worst-case time. Adjacent word-aligned windows recount many identical words. L counts characters, k words, and w characters per word."
  ],
  "derive": [
    "词长为 3 时，轨道 0 访问 0、3、6，轨道 1 访问 1、4、7，轨道 2 访问 2、5、8。余数就是除以词长后剩下的数；它标识一条轨道。所有起点都恰好属于一条轨道。同一轨道从 bar+foo 移到 foo+foo 时，中间的 foo 可以保留，只移走 bar、加入下一个 foo，无需重新计数。每条轨道的边界每次移动 w 个字符；left 是窗口起点，图里的 right 是右端之后的字符下标。need 是所需次数，have 是当前次数，used 是窗口词数。",
    "For width 3, track 0 visits 0,3,6; track 1 visits 1,4,7; track 2 visits 2,5,8. A remainder is what is left after division by the word width; it identifies the track. Every start belongs to exactly one track. Moving from bar+foo to foo+foo on one track can retain the middle foo: remove bar and add the next foo instead of recounting both words. Each boundary moves w characters at a time. left is the window start; the displayed right is the exclusive end. need stores required counts, have current counts, and used the number of words in the window."
  ],
  "proof": [
    "新词不在 need 中，跨过它的窗口全都无效，清空即可。若新词超额，从左端不断移走词，直到次数合法。所有词次数不超过 need 且 used=k，就必然恰好相等。记录后移走最左词，保留重叠答案的机会。",
    "An unknown word invalidates every window crossing it, so clear the window. If a word exceeds its quota, remove words from the left until counts are valid. If every count is within need and used=k, all counts must match exactly. After recording, remove the leftmost word to allow overlapping matches."
  ],
  "invariant": [
    "缩窗完成后，窗口内没有陌生词或超额词。每条轨道的 left 和 right 只前进。所有余数都扫描，才不会漏掉起点 1、2 等不从零对齐的答案。",
    "After shrinking, the window has no unknown or excess words. left and right only move forward on each track. Scanning all remainders prevents missing starts such as 1 or 2 that are not aligned with zero."
  ],
  "task": [
    "先用“重复词触发缩窗”，看 have 如何超额后恢复；再用“非零起点”，看 offset=1 找到答案。换预设会重启实验。",
    "Use “Excess word” to watch have exceed and return to its quota. Then use “Nonzero start” to find an answer at offset=1. Changing presets restarts the experiment."
  ],
  "complexity": [
    "L 是文本字符数，k 是所需词数，w 是词长。每条轨道约读 L/w 个词，w 条合计约 w × (L/w) = L 次读取。left 只前进，每个加入的词至多移走一次；清空的计数也可计入之前的加入。Python 每次切片与字符串哈希需 O(w)，建立 need 需 O(kw)，所以期望时间 O(Lw+kw)。计数表至多存 k 种长 w 的词，辅助空间 O(kw)，另加输出；完整教学快照不计入提交代码的空间。",
    "L counts text characters, k required words, and w characters per word. Each track reads about L/w words, so w tracks make about w × (L/w) = L reads. left only advances: each added word is removed at most once, and clearing counts can be charged to earlier additions. Each Python slice and string hash costs O(w); building need costs O(kw). Thus expected time is O(Lw+kw). Count tables store at most k distinct words of width w: O(kw) auxiliary space, plus output. Full teaching snapshots are excluded from submission space."
  ],
  "traps": [
    "重复词必须保留次数。缩窗必须用 while，不能只移一次。不要只扫描 offset=0。总词长大于文本时直接返回空；输出顺序可以不同。",
    "Preserve duplicate counts. Shrink with while, not a single removal. Do not scan only offset=0. Return empty if total word length exceeds the text; answer order may differ."
  ],
  "quizQuestion": [
    "新例：s=\"aaaaaa\"，words=[\"aa\",\"aa\"]。所有合法起点是哪些？",
    "Fresh case: s=\"aaaaaa\", words=[\"aa\",\"aa\"]. Which starts are valid?"
  ],
  "option0": [
    "[0,1,2]",
    "[0,1,2]"
  ],
  "option1": [
    "[0,2]",
    "[0,2]"
  ],
  "option2": [
    "[0]",
    "[0]"
  ],
  "preset0": [
    "重复词触发缩窗",
    "Excess word"
  ],
  "preset1": [
    "非零起点",
    "Nonzero start"
  ],
  "preset2": [
    "单词本身重复",
    "Repeated required word"
  ],
  "preset3": [
    "文本太短",
    "Text too short"
  ],
  "related0": [
    "连续子串与无效边界",
    "Contiguous substrings and invalid boundaries"
  ],
  "related1": [
    "重复值为什么改变条件",
    "Why duplicates change the stopping rule"
  ],
  "introducedLink": [
    "连续子串与无效边界",
    "Contiguous substrings and invalid boundaries"
  ]
};
window.LESSON = {
  "id": 30,
  "slug": "substring-with-concatenation-of-all-words",
  "title": [
    "串联所有单词的子串",
    "Substring with Concatenation of All Words"
  ],
  "topic": [
    "定长滑动窗口",
    "Word-aligned sliding window"
  ],
  "statement": [
    "哪些起点能连续放下全部单词？words 中所有词等长，顺序任意，但每个词必须按给定次数使用，且不能夹杂别的字符。返回所有合法起点的字符下标。",
    "Which starts contain all words consecutively? All words have equal length and may appear in any order, but each must occur with its given multiplicity and with no gaps. Return every valid character index."
  ],
  "constraints": [
    "文本长度 ≤ 10⁴；1…5000 个词；词长 1…30；均为小写字母。返回下标的顺序不限。",
    "Text length ≤ 10⁴; 1…5000 words; word length 1…30; lowercase letters only. Output order is unrestricted."
  ],
  "hand": [
    "s=\"barfoofoo\"，words=[\"bar\",\"foo\"]：起点 0 给出 bar+foo，合法；起点 3 给出 foo+foo，缺 bar 且多 foo，不合法。不能只检查词是否在集合里。",
    "For s=\"barfoofoo\", words=[\"bar\",\"foo\"], start 0 gives bar+foo and is valid. Start 3 gives foo+foo, missing bar and overusing foo. Set membership alone is insufficient."
  ],
  "baseline": "from collections import Counter\n\ndef baseline(s, words):\n    w, k = len(words[0]), len(words)\n    need = Counter(words)\n    return [i for i in range(len(s) - w*k + 1)\n            if Counter(s[j:j+w] for j in range(i, i+w*k, w)) == need]",
  "cost": [
    "每个起点重新切出 k 个词并计数，最坏 O(Lkw) 时间；相邻的同对齐窗口重复检查大量相同词。L 是字符数，k 是词数，w 是词长。",
    "Re-splitting and counting k words at every start costs O(Lkw) worst-case time. Adjacent word-aligned windows recount many identical words. L counts characters, k words, and w characters per word."
  ],
  "derive": [
    "词长为 3 时，轨道 0 访问 0、3、6，轨道 1 访问 1、4、7，轨道 2 访问 2、5、8。余数就是除以词长后剩下的数；它标识一条轨道。所有起点都恰好属于一条轨道。同一轨道从 bar+foo 移到 foo+foo 时，中间的 foo 可以保留，只移走 bar、加入下一个 foo，无需重新计数。每条轨道的边界每次移动 w 个字符；left 是窗口起点，图里的 right 是右端之后的字符下标。need 是所需次数，have 是当前次数，used 是窗口词数。",
    "For width 3, track 0 visits 0,3,6; track 1 visits 1,4,7; track 2 visits 2,5,8. A remainder is what is left after division by the word width; it identifies the track. Every start belongs to exactly one track. Moving from bar+foo to foo+foo on one track can retain the middle foo: remove bar and add the next foo instead of recounting both words. Each boundary moves w characters at a time. left is the window start; the displayed right is the exclusive end. need stores required counts, have current counts, and used the number of words in the window."
  ],
  "proof": [
    "新词不在 need 中，跨过它的窗口全都无效，清空即可。若新词超额，从左端不断移走词，直到次数合法。所有词次数不超过 need 且 used=k，就必然恰好相等。记录后移走最左词，保留重叠答案的机会。",
    "An unknown word invalidates every window crossing it, so clear the window. If a word exceeds its quota, remove words from the left until counts are valid. If every count is within need and used=k, all counts must match exactly. After recording, remove the leftmost word to allow overlapping matches."
  ],
  "invariant": [
    "缩窗完成后，窗口内没有陌生词或超额词。每条轨道的 left 和 right 只前进。所有余数都扫描，才不会漏掉起点 1、2 等不从零对齐的答案。",
    "After shrinking, the window has no unknown or excess words. left and right only move forward on each track. Scanning all remainders prevents missing starts such as 1 or 2 that are not aligned with zero."
  ],
  "task": [
    "先用“重复词触发缩窗”，看 have 如何超额后恢复；再用“非零起点”，看 offset=1 找到答案。换预设会重启实验。",
    "Use “Excess word” to watch have exceed and return to its quota. Then use “Nonzero start” to find an answer at offset=1. Changing presets restarts the experiment."
  ],
  "complexity": [
    "L 是文本字符数，k 是所需词数，w 是词长。每条轨道约读 L/w 个词，w 条合计约 w × (L/w) = L 次读取。left 只前进，每个加入的词至多移走一次；清空的计数也可计入之前的加入。Python 每次切片与字符串哈希需 O(w)，建立 need 需 O(kw)，所以期望时间 O(Lw+kw)。计数表至多存 k 种长 w 的词，辅助空间 O(kw)，另加输出；完整教学快照不计入提交代码的空间。",
    "L counts text characters, k required words, and w characters per word. Each track reads about L/w words, so w tracks make about w × (L/w) = L reads. left only advances: each added word is removed at most once, and clearing counts can be charged to earlier additions. Each Python slice and string hash costs O(w); building need costs O(kw). Thus expected time is O(Lw+kw). Count tables store at most k distinct words of width w: O(kw) auxiliary space, plus output. Full teaching snapshots are excluded from submission space."
  ],
  "mapping": [
    [
      "offset",
      [
        "起点对词长取余的扫描轨道",
        "Track identified by start modulo word width"
      ]
    ],
    [
      "have / need / used",
      [
        "当前词频 / 所需词频 / 当前词数",
        "Current counts / required counts / current number of words"
      ]
    ],
    [
      "right + width",
      [
        "图中的右开边界；Python right 是新词起点",
        "Exclusive end in the view; Python right is the new word start"
      ]
    ]
  ],
  "traps": [
    "重复词必须保留次数。缩窗必须用 while，不能只移一次。不要只扫描 offset=0。总词长大于文本时直接返回空；输出顺序可以不同。",
    "Preserve duplicate counts. Shrink with while, not a single removal. Do not scan only offset=0. Return empty if total word length exceeds the text; answer order may differ."
  ],
  "presets": [
    {
      "label": [
        "重复词触发缩窗",
        "Excess word"
      ],
      "input": [
        "barfoofoofoobar",
        [
          "bar",
          "foo"
        ]
      ]
    },
    {
      "label": [
        "非零起点",
        "Nonzero start"
      ],
      "input": [
        "xbarfoo",
        [
          "bar",
          "foo"
        ]
      ]
    },
    {
      "label": [
        "单词本身重复",
        "Repeated required word"
      ],
      "input": [
        "foofoofoo",
        [
          "foo",
          "foo"
        ]
      ]
    },
    {
      "label": [
        "文本太短",
        "Text too short"
      ],
      "input": [
        "a",
        [
          "aa"
        ]
      ]
    }
  ],
  "quiz": {
    "question": [
      "新例：s=\"aaaaaa\"，words=[\"aa\",\"aa\"]。所有合法起点是哪些？",
      "Fresh case: s=\"aaaaaa\", words=[\"aa\",\"aa\"]. Which starts are valid?"
    ],
    "options": [
      [
        "[0,1,2]",
        "[0,1,2]"
      ],
      [
        "[0,2]",
        "[0,2]"
      ],
      [
        "[0]",
        "[0]"
      ]
    ],
    "correct": 0,
    "feedback": [
      [
        "每个长度 4 的子串都由两个 aa 组成；起点 1 来自第二条轨道。",
        "Every length-4 substring is two aa words; start 1 comes from the second track."
      ],
      [
        "漏了 offset=1 轨道上的起点 1。",
        "This misses start 1 on the offset=1 track."
      ],
      [
        "答案可以重叠；起点 1 和 2 也恰好含两个 aa。",
        "Matches may overlap; starts 1 and 2 also contain exactly two aa words."
      ]
    ]
  },
  "related": [
    [
      32,
      1,
      [
        "连续子串与无效边界",
        "Contiguous substrings and invalid boundaries"
      ]
    ],
    [
      41,
      1,
      [
        "重复值为什么改变条件",
        "Why duplicates change the stopping rule"
      ]
    ]
  ]
};
