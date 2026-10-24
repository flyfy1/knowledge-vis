const COPY={
  "back": [
    "← 知识索引",
    "← Knowledge index"
  ],
  "meta": [
    "LeetCode Hard · 算法",
    "LeetCode Hard · Algorithms"
  ],
  "title": [
    "#297 · 序列化和反序列化二叉树",
    "#297 · Serialize and Deserialize Binary Tree"
  ],
  "tagline": [
    "用一个可逆的前序串，保留每个空孩子的位置。",
    "Keep every child position with one reversible preorder string."
  ],
  "official": [
    "查看官方题目 ↗",
    "Open official problem ↗"
  ],
  "s0": [
    "01 先看形状",
    "01 See the shape"
  ],
  "s1": [
    "02 逐 token 解码",
    "02 Decode one token"
  ],
  "s2": [
    "03 不变量",
    "03 The invariant"
  ],
  "s3": [
    "04 先预测",
    "04 Predict first"
  ],
  "s4": [
    "05 对照代码",
    "05 Map to code"
  ],
  "statement": [
    "这道题要把二叉树变成字符串，再从字符串恢复完全相同的结构。小树 [1,2,3,null,null,4,5] 的关键不是数值，而是两个空孩子的位置。",
    "Serialize a binary tree to a string, then recover exactly the same structure. In [1,2,3,null,null,4,5], the hard part is preserving the two missing-child positions."
  ],
  "handTitle": [
    "手算一个最小例子",
    "Calculate a tiny case"
  ],
  "hand": [
    "前序（根 → 左 → 右）访问 1, 2 后，2 的左右孩子都为空，所以写成 1,2,#,#；再访问 3,4,#,#,5,#,#。完整串是 1,2,#,#,3,4,#,#,5,#,#。每个 # 都占据一个孩子位置。",
    "Preorder means root → left → right. After visiting 1,2, both children of 2 are empty, so we write 1,2,#,#; then 3,4,#,#,5,#,#. The full string is 1,2,#,#,3,4,#,#,5,#,#. Each # occupies a child position."
  ],
  "baselineTitle": [
    "容易踩的坑",
    "A tempting wrong approach"
  ],
  "baseline": [
    "只写 1,2,3,4,5 会让 [1,2,3,null,null,4,5] 与另一棵树共享同一串；值不等于形状。",
    "Writing only 1,2,3,4,5 makes [1,2,3,null,null,4,5] collide with another shape. Values do not encode positions."
  ],
  "constraints": [
    "官方约束：节点数 0–10^4，值 -1000–1000。",
    "Official constraints: 0–10^4 nodes, values -1000..1000."
  ],
  "derive": [
    "解码从串的左端开始。读到数字就创建节点；读到 # 就返回空子树。创建数字后，必须先完整读完左子树，再读右子树。",
    "Decoding starts at the left edge. A number creates a node; # returns an empty subtree. After a number, consume the complete left subtree before the right subtree."
  ],
  "cursor": [
    "cursor 是下一个未读 token 的下标。每一步只消费一个 token，账本显示“读前 → 读后”。",
    "The cursor is the index of the next unread token. Each step consumes one token; the ledger shows before → after."
  ],
  "task": [
    "把光标沿着同一个串移动，观察已消费前缀如何确定树的形状。",
    "Move through one string and watch the consumed prefix determine the tree shape."
  ],
  "simulation": [
    "这是教学模拟，不执行下方 Python；树和账本来自同一份确定性 trace。",
    "This is a teaching simulation, not execution of the Python below; tree and ledger come from one deterministic trace."
  ],
  "preset": [
    "示例树",
    "Tree preset"
  ],
  "p0": [
    "[1,2,3,null,null,4,5]",
    "[1,2,3,null,null,4,5]"
  ],
  "p1": [
    "只有根 [8]",
    "Root only [8]"
  ],
  "p2": [
    "空树 []",
    "Empty []"
  ],
  "p3": [
    "左链 [1,2,null,null]",
    "Left chain [1,2,null,null]"
  ],
  "p4": [
    "负值 [-1,0,2]",
    "Negative values [-1,0,2]"
  ],
  "custom": [
    "也可输入逗号 token，例如 1,2,#,#,3,#,#。",
    "You can also enter tokens, e.g. 1,2,#,#,3,#,#."
  ],
  "apply": [
    "应用 token 串",
    "Apply tokens"
  ],
  "prev": [
    "上一步",
    "Previous"
  ],
  "next": [
    "下一 token",
    "Next token"
  ],
  "reset": [
    "重置",
    "Reset"
  ],
  "progress": [
    "已消费 {i}/{n} 个 token",
    "Consumed {i}/{n} tokens"
  ],
  "treeTitle": [
    "当前递归结果",
    "Current recursive result"
  ],
  "tokens": [
    "Token 串",
    "Token string"
  ],
  "ledger": [
    "递归账本",
    "Recursive ledger"
  ],
  "before": [
    "读前 cursor={i}",
    "before cursor={i}"
  ],
  "after": [
    "读后 cursor={i}",
    "after cursor={i}"
  ],
  "read": [
    "读到 {token}",
    "Read {token}"
  ],
  "node": [
    "创建 TreeNode({v})",
    "Create TreeNode({v})"
  ],
  "empty": [
    "返回 None（空子树）",
    "Return None (empty subtree)"
  ],
  "done": [
    "串已读完；根为 {root}",
    "String consumed; root is {root}"
  ],
  "invalid": [
    "请输入合法 token 串。",
    "Enter a valid token string."
  ],
  "quizQuestion": [
    "下一 token 是 # 时，递归会做什么？",
    "When the next token is #, what does recursion do?"
  ],
  "option0": [
    "创建值为 # 的节点",
    "Create a node whose value is #"
  ],
  "option1": [
    "返回空子树，并消费这个位置",
    "Return an empty subtree and consume this position"
  ],
  "option2": [
    "跳过它但不移动 cursor",
    "Skip it without moving the cursor"
  ],
  "reveal": [
    "揭晓",
    "Reveal"
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "还差一步。",
    "Not quite."
  ],
  "explainAnswer": [
    "“#” 明确表示当前子树为空；它既消费一个 token，也让父节点知道这个孩子存在但没有节点。",
    "“#” explicitly means the current subtree is empty; it consumes one token and tells the parent that this child position has no node."
  ],
  "proof": [
    "不变量：build() 返回时，恰好消费了一个完整子树的 token，并把 cursor 停在下一个兄弟子树。数字 token 的后面必然跟着左子树和右子树各自的完整编码；# 本身就是空子树的完整编码。",
    "Invariant: when build() returns, it has consumed exactly one complete subtree encoding, and the cursor points to the next sibling subtree. A number is followed by complete encodings for left and right; # is itself a complete empty encoding."
  ],
  "proof2": [
    "因此同一串不会有两种树：根 token 决定根，随后两个完整子串分别决定左、右。反例是删除 #：不同形状会碰撞。",
    "So one string cannot describe two trees: the root token fixes the root, then two complete substrings fix left and right. Remove # and different shapes collide."
  ],
  "mapping": [
    "代码映射",
    "Code mapping"
  ],
  "map1": [
    "serialize：用 pending 栈取节点；空节点写 #，非空节点写值，并把 right、left 压栈，保证前序。",
    "serialize: pop from a pending stack; write # for an empty node, otherwise write its value and push right then left for preorder."
  ],
  "map2": [
    "deserialize：pending 栈保存尚未填的父节点孩子位置；每个 token 填一个位置，数字创建节点并把它的 right、left 位置压栈。",
    "deserialize: a pending stack holds open parent-child slots; each token fills one slot, and a number creates a node then pushes its right and left slots."
  ],
  "map3": [
    "边界：空树序列化为 #；负值通过 int(token) 保留。",
    "Boundaries: an empty tree serializes to #; int(token) preserves negative values."
  ],
  "complexity": [
    "若 n 个节点，字符串有 2n+1 个 token；时间 O(n)，显式 pending 栈最多 O(n)，另有 O(n) 输入/输出存储；因此即使树高达到官方上限也不会依赖 Python 递归深度。",
    "For n nodes there are 2n+1 tokens; O(n) time, an explicit pending stack of O(n) plus O(n) input/output storage, so the official height limit does not depend on Python recursion depth."
  ],
  "copy": [
    "复制 Python",
    "Copy Python"
  ],
  "download": [
    "下载 solution.py",
    "Download solution.py"
  ],
  "fallback": [
    "复制失败时可从这里选择文本",
    "If copy is blocked, select the text here"
  ],
  "fullCode": [
    "显示完整 canonical source",
    "Show full canonical source"
  ],
  "verifyTitle": [
    "独立验证",
    "Independent checks"
  ],
  "verify": [
    "tests/ 下执行了 round-trip、空树、负值、单链和多棵小树的独立 oracle 检查。页面 trace 仍是模拟。",
    "tests/ runs round-trip, empty, negative, chain, and small-tree oracle checks. The page trace remains a simulation."
  ],
  "related": [
    "相关概念",
    "Related concepts"
  ],
  "related0": [
    "树遍历：前序步骤 ↗",
    "Tree traversal: preorder step ↗"
  ],
  "related1": [
    "队列与层序遍历 ↗",
    "Queue and level order ↗"
  ],
  "foot": [
    "双语交互 · 本页仅解释与验证，不代表已提交 LeetCode",
    "Bilingual interactive · explanation and verification only; no LeetCode submission claimed"
  ],
  "copied": [
    "已复制",
    "Copied"
  ],
  "copyFallback": [
    "浏览器不允许直接复制，请使用下方文本",
    "Clipboard blocked; use the text area below"
  ],
  "customLabel": [
    "自定义串",
    "Custom string"
  ],
  "traceStart": [
    "从 cursor=0 开始",
    "Start at cursor=0"
  ],
  "traceHint": [
    "按“下一 token”观察每个 token 如何落到树上。",
    "Press “Next token” to see where each token lands."
  ],
  "docTitle": [
    "#297 · 序列化和反序列化二叉树",
    "#297 · Serialize and Deserialize Binary Tree"
  ]
};
