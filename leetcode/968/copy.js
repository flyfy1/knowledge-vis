window.LESSON_COPY = {
  "docTitle": [
    "968 · 监控二叉树",
    "968 · Binary Tree Cameras"
  ],
  "back": [
    "← LeetCode 知识课",
    "← LeetCode lessons"
  ],
  "title": [
    "#968 · 监控二叉树",
    "#968 · Binary Tree Cameras"
  ],
  "intro": [
    "一台摄像头只能看一条边以内。先亲手覆盖三个节点，再看子节点如何告诉父节点该不该装摄像头。",
    "A camera sees only one edge away. Cover three nodes by hand, then let children tell their parent where a camera is needed."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "nav1": [
    "1 · 亲手覆盖",
    "1 · Cover by hand"
  ],
  "nav2": [
    "2 · 提炼需求",
    "2 · Summarize needs"
  ],
  "nav3": [
    "3 · 逐步返回",
    "3 · Trace returns"
  ],
  "nav4": [
    "4 · 先预测",
    "4 · Predict first"
  ],
  "nav5": [
    "5 · 实现与边界",
    "5 · Code & limits"
  ],
  "h1": [
    "1 · A → B → C：一台装在哪里？",
    "1 · A → B → C: where should one camera go?"
  ],
  "p1": [
    "这一步要回答：三个节点能否只用一台摄像头？A 是根，B 是 A 的孩子，C 是 B 的孩子；父节点就是上一层相连的节点。摄像头覆盖自身、父节点和直接孩子，不会穿过两条边。",
    "Can one camera cover all three nodes? A is the root, B is A’s child, and C is B’s child. A parent is the connected node one level above. A camera covers itself, its parent, and its immediate children; it cannot see across two edges."
  ],
  "contract": [
    "官方要求返回覆盖整棵二叉树的最少摄像头数。每个节点最多两个孩子，节点数为 1–1000，节点值都为 0。字母仅用于区分节点，并不是输入值。",
    "Return the minimum number of cameras covering the entire binary tree. Each node has at most two children; there are 1–1000 nodes and every value is 0. Letters identify nodes in this lesson; they are not input values."
  ],
  "handHelp": [
    "固定 A→B→C，点击节点添加或移除摄像头。先只选 A，看谁没被覆盖；再改成只选 B，看覆盖数。这里只改变摄像头位置。",
    "Keep A→B→C fixed. Click nodes to add or remove cameras. First select only A and inspect the missed node; then select only B and compare coverage. Only camera positions change."
  ],
  "handNode": [
    "{node}：{state}",
    "{node}: {state}"
  ],
  "installed": [
    "有摄像头",
    "camera"
  ],
  "off": [
    "无摄像头",
    "no camera"
  ],
  "handOut": [
    "当前 {count} 台；已覆盖 {covered}/3 个节点。已覆盖：{names}。未覆盖：{missing}。",
    "Current cameras: {count}; covered: {covered}/3 nodes. Covered: {names}. Uncovered: {missing}."
  ],
  "none": [
    "无",
    "none"
  ],
  "clearHand": [
    "移除全部摄像头",
    "Remove all cameras"
  ],
  "handConclusion": [
    "手算：只选 A 覆盖 A、B，漏掉 C；只选 B 覆盖 A、B、C。0 台显然不够，所以最少为 1 台。覆盖父节点与覆盖孙节点是两回事。",
    "By hand: A alone covers A and B, missing C. B alone covers A, B, and C. Zero cameras cannot cover a node, so the minimum is 1. Covering a parent does not mean covering a grandchild."
  ],
  "h2": [
    "2 · 子树只需上报三种情况",
    "2 · A subtree reports just three possibilities"
  ],
  "p2": [
    "这一步要回答：父节点需要知道孩子的哪些信息？子树是某个节点及其所有后代；叶子是没有孩子的节点。先处理叶子，再处理父节点，这种孩子先于父节点的顺序叫后序遍历。",
    "What does a parent need to know about its children? A subtree contains a node and all its descendants; a leaf has no children. Process leaves before their parents. This children-before-parent order is called postorder traversal."
  ],
  "baseline": [
    "正确但昂贵的基线：枚举每个节点装或不装的所有 2ⁿ 种选择，对每种检查全部 n 个节点，保留覆盖全树的最小台数。时间 O(n·2ⁿ)，辅助空间 O(n)；n=1000 时枚举不可行。下面的 neighbors 只含父节点和直接孩子，返回值仍是最少台数。",
    "A correct baseline tries all 2ⁿ camera subsets, checks all n nodes for each, and keeps the smallest full cover. It costs O(n·2ⁿ) time and O(n) auxiliary space; enumeration is infeasible at n=1000. In the code, neighbors contains only parents and immediate children; the return value is the minimum count."
  ],
  "baseCode": [
    "查看穷举基线 Python",
    "Inspect the exhaustive Python baseline"
  ],
  "wrong": [
    "诱人的错误：从根往下，每遇到没覆盖的节点就装。A→B→C 中，它先在 A 装，再在 C 装，共 2 台；B 一台就够。根看不见孙节点，过早决定会浪费位置。",
    "A tempting mistake: scan downward and install at each uncovered node. On A→B→C, it installs at A, then C: 2 cameras instead of 1 at B. The root cannot see its grandchild, so deciding too early wastes a position."
  ],
  "derive": [
    "看 A 的两个叶子孩子 B、C：叶子可以先不装，让父节点处理；A 一台能同时解决 B、C，并覆盖自身。于是每次子树返回时，所有严格后代必须已被覆盖，只允许子树根暂时等待父节点。只报“已覆盖”还不够：有摄像头的孩子能覆盖父节点，无摄像头的孩子不能。",
    "Consider root A with leaf children B and C. Each leaf can wait; one camera at A resolves both leaves and covers A. This suggests the invariant at each subtree return: every strict descendant is covered, while the subtree root alone may wait for its parent. A single “covered” flag is insufficient: a child with a camera covers its parent, but a covered child without a camera does not."
  ],
  "stateN": [
    "N（等待）：后代都已覆盖，本节点还未覆盖，需父节点帮忙。",
    "N (needs parent): all descendants are covered, but this node is uncovered."
  ],
  "stateK": [
    "K（摄像头）：本节点装了摄像头，整棵子树已覆盖。",
    "K (camera): this node has a camera and its entire subtree is covered."
  ],
  "stateC": [
    "C（已覆盖）：本节点没有摄像头，但被孩子的摄像头覆盖；整棵子树已覆盖。空孩子也记作 C，因为不存在覆盖需求。",
    "C (covered): this node has no camera, but a child camera covers it; its whole subtree is covered. A missing child also returns C because it has no coverage demand."
  ],
  "rules": [
    "由实际需求得到规则：只要一个孩子为 N，就在本节点装摄像头并返回 K；否则若有孩子为 K，本节点返回 C；否则两个孩子都为 C，本节点返回 N。顺序不能颠倒：一个 K 孩子不能隔着父节点覆盖另一个 N 孩子。",
    "The demands give the rule: if either child is N, install here and return K. Otherwise, if either child is K, return C. Otherwise both are C, so return N. Check N first: one K child cannot cover its N sibling across two edges."
  ],
  "proof": [
    "为何不会比最优多装？考虑剩余未覆盖需求中最深的节点 u；其后代需求都已解决。已解决需求由固定摄像头继续覆盖。若 u 有父 v，任何尚待选择且能覆盖 u 的摄像头，只能在 u、u 的直接孩子或 v；将它移到 v，不会丢掉更深的未覆盖需求，还可能覆盖兄弟和祖父。故总能选一个包含 v 的最优方案，固定它并移除已覆盖需求。重复此交换就是后序规则：N 孩子把需求交给父节点，K 孩子消掉父节点需求，C 孩子不产生覆盖能力。若最后根仍为 N，没有父节点可等，只能补一台。每次选择都能保留一个最优方案，因而最终台数最少。",
    "Why is this optimal? Take a deepest remaining uncovered demand u; all demands below it are already resolved. Fixed cameras continue to cover resolved demands. If u has parent v, any remaining camera covering u must be at u, an immediate child of u, or v. Moving that camera to v loses no deeper unresolved demand and may also cover a sibling or grandparent. Thus some optimum can include v; fix that choice and remove the demands it covers. Repeating this exchange gives the postorder rule: an N child passes a demand up, a K child removes its parent’s demand, and a C child supplies no camera. If the root is still N, it has no parent and needs one final camera. Each choice preserves an optimum, so the final count is minimum."
  ],
  "toTrace": [
    "逐步验证这些返回值 →",
    "Check these returns step by step →"
  ],
  "h3": [
    "3 · 看孩子返回，再决定父节点",
    "3 · Read child returns before deciding the parent"
  ],
  "p3": [
    "这一步要回答：当前节点为何装或不装？N 是等父节点覆盖，K 是本节点有摄像头，C 是无摄像头但已覆盖。每帧完成一个节点的后序决策，或完成最后的根修补；返回时的状态和操作记录都会保留；祖先后来覆盖该节点时，旧 N 不会改写为 C。问号是尚未返回，不表示未覆盖。",
    "Why does the current node install a camera or wait? N needs its parent, K has a camera, and C is covered without a camera. Each frame completes one postorder decision, or the final root repair. Return-time states and the operation history accumulate; an old N is not rewritten to C when an ancestor later covers it. A question mark means not returned yet, not uncovered."
  ],
  "walk": [
    "默认树中：先处理 A 的左孩子 B；B 先接收 C 的 N，再接收兄弟 D 的 N（这时 B 还未决定）。B 在自身装一台并返回 K，A 才读取 B=K 与空右孩子=C，返回 C。孩子的状态保留在记录中，不会在返回时撤销摄像头。",
    "In the default tree, enter A’s left child B. B receives N from C, then N from sibling D; B has not decided yet. B installs one camera and returns K. Only then does A read B=K and its missing right child=C, and return C. Returning does not undo cameras; child states remain in the history."
  ],
  "preset": [
    "选择树（更换后从头开始；不影响独立练习）",
    "Choose a tree (restarts this trace; leaves the exercise unchanged)"
  ],
  "pre0": [
    "官方例 1：四节点，最少 1 台",
    "Example 1 · min 1"
  ],
  "pre1": [
    "官方例 2：五节点，最少 2 台",
    "Example 2 · min 2"
  ],
  "pre2": [
    "单个根：最少 1 台",
    "Single root · min 1"
  ],
  "pre3": [
    "四节点链：最少 2 台",
    "Chain (4) · min 2"
  ],
  "pre4": [
    "满三层树：最少 2 台",
    "Full tree · min 2"
  ],
  "simulation": [
    "教学模拟，不会执行下方 Python。只展示这些小树，完整保留每次决策。图可横向滚动；下方记录是文字等价说明。",
    "Teaching simulation; it does not execute the Python below. These small trees retain every decision. Scroll the diagram horizontally if needed; the ledger below provides a text equivalent."
  ],
  "legend": [
    "图中上方为根，连线向下指向孩子；字母区分节点。字母旁是返回时状态，旧 N 可在后来被祖先覆盖。K=摄像头，C=已覆盖但无摄像头，N=等待父节点，?=未返回。橙色粗边框标记刚处理的节点。",
    "Root at the top; downward edges lead to children. Letters identify nodes. States are recorded at return time; an old N may later be covered by an ancestor. K=camera, C=covered without camera, N=needs parent, ?=not returned. A thick orange outline marks the node just processed."
  ],
  "treeLabel": [
    "当前树与已返回节点的状态",
    "Current tree and returned node states"
  ],
  "treeScroll": [
    "可横向滚动的二叉树图",
    "Horizontally scrollable binary tree diagram"
  ],
  "progress": [
    "已完成决策 {done}/{total}；累计放置 {count} 台。",
    "Completed decisions: {done}/{total}; cameras placed so far: {count}."
  ],
  "prev": [
    "退回上个决策",
    "Previous decision"
  ],
  "next": [
    "处理下个节点",
    "Process next node"
  ],
  "reset": [
    "重置本次遍历",
    "Reset this traversal"
  ],
  "end": [
    "完成全部决策",
    "Complete all decisions"
  ],
  "start": [
    "尚未处理任何节点；从最深的左侧叶子开始。",
    "No nodes processed yet. Begin at the deepest left leaf."
  ],
  "rowN": [
    "{node}：左={left}，右={right} → N。没有孩子提供摄像头，等待父节点；累计 {count} 台。",
    "{node}: left={left}, right={right} → N. Neither child supplies a camera; wait for the parent. Cameras so far: {count}."
  ],
  "rowK": [
    "{node}：左={left}，右={right} → K。至少一个孩子为 N，在此装一台；累计 {count} 台。",
    "{node}: left={left}, right={right} → K. At least one child is N, so install here. Cameras so far: {count}."
  ],
  "rowC": [
    "{node}：左={left}，右={right} → C。无 N 孩子，有 K 孩子覆盖本节点；累计 {count} 台。",
    "{node}: left={left}, right={right} → C. No child is N; a K child covers this node. Cameras so far: {count}."
  ],
  "rowroot": [
    "根 {node} 原为 N，没有父节点；补装一台，N → K。累计 {count} 台。",
    "Root {node} was N and has no parent; add one camera, N → K. Cameras so far: {count}."
  ],
  "pending": [
    "尚未完成：当前累计台数不是最终答案。",
    "Traversal incomplete: the current camera count is not the final answer."
  ],
  "final": [
    "全部节点已覆盖。最少 {count} 台；位置：{names}。",
    "All nodes covered. Minimum cameras: {count}; positions: {names}."
  ],
  "rootRule": [
    "边界：单个叶子读取两个空孩子 C、C，先返回 N；若它就是根，最后必须补一台。四节点链也会在根处补一台。空孩子不是一个真实节点，不会安装摄像头。",
    "Boundary: a leaf reads two missing children C,C and returns N. If it is the root, the final repair adds one camera. A four-node chain also needs a root repair. A missing child is not a real node and never receives a camera."
  ],
  "h4": [
    "4 · 新链条，先预测再揭晓",
    "4 · A fresh chain: predict before revealing"
  ],
  "p4": [
    "这一步要回答：七节点链 A→B→C→D→E→F→G 最少需要几台？每个节点只有一个孩子。用 N（等父）、K（摄像头）、C（已覆盖无摄像头）从 G 向上推，别忘了最后检查根。这里不是上面的预设树。",
    "How many cameras does the seven-node chain A→B→C→D→E→F→G need? Each node has just one child. Work upward from G using N (needs parent), K (camera), and C (covered without camera); check the root last. This is a fresh tree, separate from the presets."
  ],
  "choose": [
    "选择最少台数，再揭晓推导",
    "Choose the minimum count, then reveal the reasoning"
  ],
  "opt0": [
    "2 台",
    "2 cameras"
  ],
  "opt1": [
    "4 台",
    "4 cameras"
  ],
  "opt2": [
    "3 台",
    "3 cameras"
  ],
  "reveal": [
    "揭晓并检查",
    "Reveal and check"
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "wrongAnswer": [
    "再看每个等待需求。",
    "Follow each waiting demand again."
  ],
  "answer": [
    "G=N，F=K，E=C，D=N，C=K，B=C，A=N；最后给 A 补一台，共 3 台（F、C、A）。2 台漏掉一个需求，4 台不是最少。每台在链上最多覆盖 3 个节点，2 台最多覆盖 6 个，也不足以覆盖 7 个。",
    "G=N, F=K, E=C, D=N, C=K, B=C, A=N. Repair A last: 3 cameras at F, C, and A. Two cameras miss a demand; four are unnecessary. Each camera covers at most 3 chain nodes, so two can cover at most 6 of the 7 nodes."
  ],
  "h5": [
    "5 · 把返回规则写成可提交的 Python",
    "5 · Turn the return rule into submittable Python"
  ],
  "p5": [
    "这一步要回答：如何在官方接口中返回台数？LeetCode 提供 TreeNode（val、left、right）。Solution.minCameraCover 接收根对象并返回整数，不修改树。NEED=0、CAMERA=1、COVERED=2 分别对应 N、K、C。",
    "How does the official interface return the count? LeetCode supplies TreeNode with val, left, and right. Solution.minCameraCover takes the root object and returns an integer without changing the tree. NEED=0, CAMERA=1, COVERED=2 correspond to N, K, C."
  ],
  "mapping": [
    "stack 是待办任务列表。首次弹出 (node, False)，先把 (node, True) 放回，再压右、左孩子；后进先出使左孩子先处理，父节点最后处理。再次弹出时孩子已写入 states。三个 if 分支就是图中的 N→K、K→C、否则 N；states[None]=COVERED 是空孩子的返回值，末尾的 if 是根修补。",
    "stack is a list of pending tasks. On the first pop (node, False), push (node, True), then right and left children. Last-in-first-out processes the left child first and the parent last. On the second pop, both child results are in states. The branches implement N→K, K→C, otherwise N; states[None]=COVERED is the missing-child result. The final if repairs the root."
  ],
  "costs": [
    "n 是节点数。每个节点入栈出栈各两次，查询字典按均摊 O(1) 计，总时间 O(n)。states 保存 n 个状态，栈最坏 O(n)，故辅助空间 O(n)；使用显式栈避免 Python 在长链上的递归深度限制。教学模拟复制每帧状态需 O(n²) 存储，仅用于上面的小树，不是提交代码的成本。",
    "Let n be the node count. Each node is pushed and popped twice; with amortized O(1) dictionary access, total time is O(n). states stores n results and the stack uses O(n) in the worst case, so auxiliary space is O(n). The explicit stack avoids Python recursion-depth limits on long chains. Teaching snapshots copy each state in O(n²) total storage and are limited to the small trees above; this is not submission storage."
  ],
  "boundaries": [
    "核对：官方例 1 返回 1，官方例 2 返回 2，单节点返回 1。空树不在官方范围内，代码防御性返回 0。所有节点值相同，算法只读连接关系。摄像头覆盖若改成两条边，这套三状态证明便不适用。",
    "Check: official example 1 returns 1, example 2 returns 2, and a single node returns 1. An empty tree is outside the official constraints; the code defensively returns 0. Values are identical, so only links matter. If cameras could see two edges away, this three-state proof would no longer apply."
  ],
  "source": [
    "查看官方接口 Python 解法",
    "Inspect the Python solution for the official interface"
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
    "已复制完整 Python 源码。",
    "Full Python source copied."
  ],
  "fallback": [
    "自动复制不可用。源码已全选，请按系统复制快捷键。",
    "Automatic copy unavailable. The full source is selected; use your system copy shortcut."
  ],
  "manualLabel": [
    "手动复制完整 Python 源码",
    "Manually copy the full Python source"
  ],
  "related": [
    "继续连接这些概念",
    "Connect these ideas"
  ],
  "link1": [
    "回看三种覆盖需求 →",
    "Revisit the three coverage demands →"
  ],
  "link2": [
    "树上的后序信息汇总（#124）→",
    "Postorder summaries on trees (#124) →"
  ],
  "link3": [
    "已知边界如何支持局部决定（#42）→",
    "How known bounds justify a local decision (#42) →"
  ],
  "navLabel": [
    "课程步骤",
    "Lesson steps"
  ],
  "langLabel": [
    "语言",
    "Language"
  ]
};
