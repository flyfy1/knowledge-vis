window.LESSON_COPY = {
  "docTitle": [
    "#732 · 我的日程安排表 III",
    "#732 · My Calendar III"
  ],
  "title": [
    "#732 · 我的日程安排表 III",
    "#732 · My Calendar III"
  ],
  "back": [
    "← 知识索引",
    "← Knowledge Index"
  ],
  "hard": [
    "困难 · Python",
    "Hard · Python"
  ],
  "intro": [
    "三场会议，两间同时占用？找到某一时刻最多有多少场会议正在进行。",
    "Three meetings, but how many run at once? Find the busiest instant after each booking."
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "nav0": [
    "手算重叠",
    "Count by hand"
  ],
  "nav1": [
    "推导扫描",
    "Derive the sweep"
  ],
  "nav2": [
    "逐步实验",
    "Step through"
  ],
  "nav3": [
    "先预测",
    "Predict first"
  ],
  "nav4": [
    "实现与边界",
    "Code & limits"
  ],
  "s0t": [
    "01 · 哪个时刻最拥挤？",
    "01 · Which instant is busiest?"
  ],
  "s0e": [
    "这一步要回答：预订 [2,5)、[4,7)、[5,6) 后，最多几场同时进行？半开区间 [s,e) 包含开始 s，不包含结束 e。k 重预订指 k 场共享某个时刻，并不是共有几对会议相撞。点击 4、5、6，看同一组三场会议在该时刻的计数。",
    "How many events overlap after booking [2,5), [4,7), [5,6)? A half-open interval [s,e) includes its start s and excludes its end e. A k-booking means k events share one instant; it does not count colliding pairs. Select 4, 5, or 6 to count this same set of events at that time."
  ],
  "handLegend": [
    "横向表示时间；每行是一场会议。实心左端包含，空心右端不包含。条旁的区间给出精确值。",
    "Horizontal position is time; each row is one event. The filled start is included; the open end is excluded. Interval labels give exact values."
  ],
  "probe": [
    "检查时刻 {x}",
    "Inspect time {x}"
  ],
  "handRead": [
    "时刻 {x}：{a} + {b} + {c} = {k} 场正在进行。三个时刻都最多 2 场；5 时第一场已结束，第三场才开始。",
    "At time {x}: {a} + {b} + {c} = {k} active events. The peak is 2; at 5 the first event has ended as the third begins."
  ],
  "constraints": [
    "官方范围：0 ≤ startTime < endTime ≤ 10⁹，最多调用 book 400 次。每次都添加会议并返回截至该次的最大同时数；不拒绝冲突。示例返回 1, 1, 2, 3, 3, 3。",
    "Official bounds: 0 ≤ startTime < endTime ≤ 10⁹, at most 400 calls to book. Every call adds an event and returns the maximum simultaneous count so far; conflicts are accepted. The official example returns 1, 1, 2, 3, 3, 3."
  ],
  "s1t": [
    "02 · 为什么只需要记录端点？",
    "02 · Why keep only endpoints?"
  ],
  "baseline": [
    "这一步要回答：怎样避免对十亿个时间单位逐一加一？正确的小范围基线把 cells[x] 当作 [x,x+1) 上的会议数，每场在 startTime 到 endTime−1 的格子加一，然后取最大值。整数端点之间没有开始或结束，因此格子计数也代表连续时间。",
    "How can we avoid incrementing a billion time units? A correct small-domain baseline stores cells[x], the number of events on [x,x+1). Increment cells from startTime through endTime−1, then take the maximum. With integer endpoints, no event starts or ends inside a unit cell, so this also represents continuous time."
  ],
  "baseCost": [
    "固定范围宽度 U 时，基线每次最坏 O(U) 时间、O(U) 空间。U=10⁹ 无法合理分配。我们需要记录“哪里发生变化”，而不是每个时刻的值。",
    "For a fixed domain width U, the baseline costs O(U) time per call and O(U) space. Allocating U=10⁹ cells is impractical. Store where the count changes instead of storing every time value."
  ],
  "derive": [
    "先看两场 [2,5)、[4,7)：在 2 开始一场，4 再开始一场，5 结束一场，7 结束最后一场。把净变化记作 delta：2:+1、4:+1、5:−1、7:−1。按时间依次相加，得到 1、2、1、0。这种从左到右访问端点的方法叫扫描；运行总和叫前缀和。",
    "Start with [2,5) and [4,7): one event starts at 2, another at 4, one ends at 5, and the last ends at 7. Call the net change delta: 2:+1, 4:+1, 5:−1, 7:−1. Adding in time order gives 1, 2, 1, 0. Visiting sorted endpoints is a sweep; its running total is a prefix sum."
  ],
  "complicate": [
    "再添加 [5,6)：delta[5] 从 −1 变成 0，delta[6] 从 0 变成 −1。完整端点表为 2:+1、4:+1、5:0、6:−1、7:−1；运行总和为 1、2、2、1、0。端点 5 同时一进一出，不会产生 3 场重叠。零变化端点保留也无妨。",
    "Now add [5,6): delta[5] changes from −1 to 0, and delta[6] changes from 0 to −1. The full ledger is 2:+1, 4:+1, 5:0, 6:−1, 7:−1; running totals are 1, 2, 2, 1, 0. At 5 one event leaves as one enters, so there is no triple overlap. Keeping zero-change endpoints is harmless."
  ],
  "wrong": [
    "诱人但错误：在相同时刻先处理开始、立刻更新最大值，再处理结束。[1,3) 与 [3,5) 会被误报为 2，其实答案为 1。先把同一时刻的变化合并，再观察人数，才能遵守“不含右端”的规则。只记重叠的会议对数也不行：三场 [0,2) 有 3 对但最大重叠为 3；四场有 6 对但最大重叠为 4。",
    "A tempting mistake is to process starts at a shared time, update the maximum, then process ends. It reports 2 for [1,3) and [3,5), whose answer is 1. Group all changes at a time before measuring the count to respect excluded ends. Counting overlapping pairs also fails: three copies of [0,2) have 3 pairs and peak 3; four copies have 6 pairs but peak 4."
  ],
  "invariant": [
    "因此得到不变式（每一步都成立的事实）：处理完坐标 x 的所有净变化后，active 等于 [x,下个端点) 内的会议数，best 等于已处理区间上的最大人数。",
    "This gives an invariant, a fact preserved at every step: after applying all net changes at x, active is the event count on [x,next endpoint), and best is the maximum over the intervals processed so far."
  ],
  "formula": [
    "active(x) = Σ(t ≤ x) delta[t]；best ← max(best, active(x))",
    "active(x) = Σ(t ≤ x) delta[t]; best ← max(best, active(x))"
  ],
  "proof": [
    "为什么成立？每场 [s,e) 对这个和的贡献在 x<s 时为 0，在 s≤x<e 时为 +1，在 x≥e 时 +1−1=0，恰好是其是否正在进行。初始无人；按坐标加入净变化保持上述事实。两端点之间人数不变，所以扫描全部端点就覆盖所有可能的最大值，最后端点人数为 0。每次添加只修改两个端点，但需要重新排序并完整扫描才能返回本次答案。",
    "Why does it hold? Each [s,e) contributes 0 when x<s, +1 when s≤x<e, and +1−1=0 when x≥e: exactly its active status. Start with no events; applying each grouped change preserves that fact. Counts stay constant between endpoints, so scanning every endpoint covers every possible maximum. The last endpoint returns active to 0. Adding a booking changes just two deltas, but we sort and rescan them all to return the new answer."
  ],
  "s2t": [
    "03 · 添加一场，再扫描所有端点",
    "03 · Add one event, then sweep every endpoint"
  ],
  "traceIntro": [
    "这一步要回答：添加会议后，端点变化如何成为返回值？这是浏览器模拟，不是执行 Python。每次先修改两个 delta（该坐标的净人数变化），再从 0 开始计算前缀和（依次累加变化）。只有全部扫描结束，best 才是本次返回值。",
    "How do endpoint changes become a return value? This is a browser simulation, not execution of Python. First change two deltas (net count changes at those coordinates), then restart the prefix sum (running total) at 0. Only after the full scan is best the return value for this call."
  ],
  "traceTask": [
    "保持预设不变，逐步前进：先看新增会议和两个 delta 的前后值，再看表格中 active 与 best。后退应完全恢复。更换预设会重置本实验；不影响独立预测题。所有操作均展示，无跳步。",
    "Keep the preset fixed and advance: inspect the new event and the two before/after deltas, then active and best in the ledger. Back restores the complete state. Changing the preset restarts this experiment; the independent prediction is unaffected. No operations are omitted."
  ],
  "presetLabel": [
    "选择预订序列（切换会重置）",
    "Booking sequence (change restarts)"
  ],
  "preset0": [
    "手算 · 3 场",
    "Hand case · 3 events"
  ],
  "preset1": [
    "官方 · 6 场",
    "Official · 6 events"
  ],
  "preset2": [
    "相接 · 2 场",
    "Touching · 2 events"
  ],
  "preset3": [
    "重复 · 3 场",
    "Duplicates · 3 events"
  ],
  "preset4": [
    "大端点 · 3 场",
    "Large times · 3 events"
  ],
  "prev": [
    "← 撤回一步",
    "← Back one step"
  ],
  "next": [
    "执行下一操作 →",
    "Apply next operation →"
  ],
  "reset": [
    "重置实验",
    "Reset experiment"
  ],
  "last": [
    "完成全部预订",
    "Finish all bookings"
  ],
  "progress": [
    "操作 {at}/{total} · 已添加 {b} 场 · 已返回 {done} 次",
    "Operation {at}/{total} · {b} events added · {done} calls returned"
  ],
  "empty": [
    "空日历；尚未调用 book。",
    "Empty calendar; book has not been called."
  ],
  "update": [
    "添加 [{l},{r})：delta[{l}] {oldL} → {newL}；delta[{r}] {oldR} → {newR}。扫描尚未开始，active=0、best=0。",
    "Add [{l},{r}): delta[{l}] {oldL} → {newL}; delta[{r}] {oldR} → {newR}. Scan not started: active=0, best=0."
  ],
  "scan": [
    "处理坐标 {x}：active = {old} + ({d}) = {a}；best = max({oldBest}, {a}) = {best}。已扫描 {n}/{u} 个端点；best 暂定。",
    "Process {x}: active = {old} + ({d}) = {a}; best = max({oldBest}, {a}) = {best}. Scanned {n}/{u} endpoints; best is provisional."
  ],
  "returned": [
    "本次完整扫描结束：book({l}, {r}) 返回 {k}。active 已回到 0；返回的是整次扫描的最大值，而不是最后的 active。",
    "Full scan complete: book({l}, {r}) returns {k}. active is back at 0; return the maximum over the sweep, not its final active count."
  ],
  "events": [
    "已添加的会议（横轴按当前预设的时间范围同比例绘制）",
    "Added events (horizontal time uses one scale for this preset)"
  ],
  "none": [
    "暂无会议或返回值。",
    "No events or return values yet."
  ],
  "tableTitle": [
    "本次调用的端点扫描账本",
    "Endpoint ledger for this call"
  ],
  "time": [
    "坐标",
    "Time"
  ],
  "delta": [
    "净变化",
    "Delta"
  ],
  "active": [
    "此后人数",
    "Active after"
  ],
  "best": [
    "截至此处最大值",
    "Best so far"
  ],
  "status": [
    "状态",
    "Status"
  ],
  "pending": [
    "待扫描",
    "Pending"
  ],
  "processed": [
    "已扫描",
    "Scanned"
  ],
  "history": [
    "已完成调用的返回历史",
    "Return history of completed calls"
  ],
  "historyRow": [
    "book({l}, {r}) → {k}",
    "book({l}, {r}) → {k}"
  ],
  "s3t": [
    "04 · 共享端点会不会多算？",
    "04 · Can a shared endpoint inflate the count?"
  ],
  "quiz": [
    "这一步要回答：已预订 [1,4)、[4,8)，再添加 [2,6) 会返回多少？这是新题，不沿用实验数据。使用前缀和不变式：合并同一坐标全部变化后，运行总和才代表此刻人数。先选择，再揭晓。",
    "After [1,4) and [4,8), what does adding [2,6) return? This fresh case is independent of the experiment. Use the prefix-sum invariant: the running total represents the active count only after grouping all changes at the same coordinate. Choose before revealing."
  ],
  "legend": [
    "预测本次 book 的返回值",
    "Predict this book return value"
  ],
  "option0": [
    "1 · 只看两场旧会议相接",
    "1 · The two old events only touch"
  ],
  "option1": [
    "2 · 合并同一时刻的进出",
    "2 · Group arrivals and departures"
  ],
  "option2": [
    "3 · 在 4 先加开始再减结束",
    "3 · At 4, add starts before removing ends"
  ],
  "reveal": [
    "揭晓并解释",
    "Reveal & explain"
  ],
  "quizReset": [
    "清除预测",
    "Clear prediction"
  ],
  "await": [
    "请选择，再揭晓；更改选项会清除旧反馈。",
    "Choose, then reveal. Changing the choice clears previous feedback."
  ],
  "correct": [
    "预测正确。",
    "Correct prediction."
  ],
  "incorrect": [
    "需要重新检查端点。",
    "Recheck the endpoints."
  ],
  "answer": [
    "答案是 2。净变化为 1:+1、2:+1、4:0、6:−1、8:−1；前缀和为 1、2、2、1、0。在 4 一场结束、一场开始，人数保持 2。选 1 忽略新增会议；选 3 把结束端点错误地算进去了。",
    "The answer is 2. Net changes are 1:+1, 2:+1, 4:0, 6:−1, 8:−1; prefix sums are 1, 2, 2, 1, 0. At 4 one event ends and another starts, keeping the count at 2. Choosing 1 ignores the new event; choosing 3 incorrectly includes an ending event."
  ],
  "s4t": [
    "05 · 从账本到可提交的 Python",
    "05 · From ledger to submittable Python"
  ],
  "codeIntro": [
    "这一步要回答：如何在多次调用之间保留会议信息？官方 Python 类 MyCalendarThree 的构造函数创建 delta 字典；book(startTime,endTime) 更新它并返回整数。下面是原始提交代码；上方图示仅为独立模拟，没有运行这份代码。",
    "How does state survive multiple calls? The official Python class MyCalendarThree creates a delta dictionary in its constructor; book(startTime,endTime) updates it and returns an integer. This is the canonical submission source. The diagram above is a separate simulation and does not run this source."
  ],
  "map1": [
    "两行 self.delta 更新：每场开始 +1、结束 −1；get(...,0) 让新坐标从 0 开始。保留字典，保留重复预订。",
    "The two self.delta updates add +1 at a start and −1 at an end; get(...,0) initializes new coordinates. Keeping the dictionary preserves all bookings, including duplicates."
  ],
  "map2": [
    "for time in sorted(self.delta)：按端点递增访问；同一坐标只有一个合并值，不会先观察开始产生的虚假峰值。",
    "for time in sorted(self.delta) visits increasing endpoints; each coordinate has one grouped value, so no false peak is measured between starts and ends."
  ],
  "map3": [
    "active += self.delta[time] 对应表格的“此后人数”；best = max(best, active) 保留已经扫描的峰值；return best 只在整个循环结束后执行。",
    "active += self.delta[time] maps to “Active after”; best = max(best, active) retains the peak scanned so far. return best runs only after the entire loop."
  ],
  "cost": [
    "设 b 为截至本次的调用数，u 为不同端点数（u≤2b）。两次字典更新平均 O(1)，排序 O(u log u)，扫描 O(u)，每次 O(b log b) 时间、O(b) 空间（包括排序列表）。B 次调用总计 O(B² log B)。这比扫描十亿格子更合适，但不是每次 O(log b) 的树结构。",
    "Let b be calls so far, and u the distinct endpoints (u≤2b). Two dictionary updates average O(1), sorting costs O(u log u), and scanning O(u): O(b log b) time per call and O(b) space, including the sorted list. B calls total O(B² log B) time. This suits the bounds better than scanning a billion cells; it does not claim a tree’s O(log b) update time."
  ],
  "boundaries": [
    "相接会议不重叠；重复会议分别计数；端点 0 与 10⁹ 也只占两个字典项；未调用时无需返回值。每次添加不会降低全局峰值。图示为便于撤回保存快照，最坏 O(B³) 存储，本页最多 6 场；这不是 Python 的辅助空间。作者用独立单位格子/起点计数基线验证；未声称 LeetCode 接受或真实学习效果。",
    "Touching events do not overlap; duplicate events count separately. Endpoints 0 and 10⁹ still occupy just two dictionary entries. No output is required before a call. Adding an event cannot lower the global peak. Rewind snapshots cost up to O(B³) storage, bounded here to six events; that is not Python auxiliary space. Author checks use independent unit-cell/start-time counting baselines; no LeetCode acceptance or learner outcome is claimed."
  ],
  "copy": [
    "复制 Python",
    "Copy Python"
  ],
  "download": [
    "下载 solution.py",
    "Download solution.py"
  ],
  "source": [
    "查看完整 Python 源码",
    "View complete Python source"
  ],
  "manual": [
    "手动复制区（已全选）",
    "Manual copy area (fully selected)"
  ],
  "copying": [
    "正在复制…",
    "Copying…"
  ],
  "copied": [
    "已复制完整源码。",
    "Complete source copied."
  ],
  "fallback": [
    "自动复制不可用；源码已全选，请使用系统复制快捷键。",
    "Automatic copy unavailable. Source is selected; use your system copy shortcut."
  ],
  "related1": [
    "区间端点：学习 Range Module 如何维护区间 →",
    "Interval endpoints: how Range Module maintains ranges →"
  ],
  "related2": [
    "范围差异：学习 Data Stream 如何合并离散整数 →",
    "Compare ranges: merging discrete integers in Data Stream →"
  ],
  "foot": [
    "作者自查候选 · 独立评审待完成 · 无在线代码执行",
    "Author self-checked candidate · Independent review pending · No online code execution"
  ],
  "scanDone": [
    "处理坐标 {x}：active = {old} + ({d}) = {a}；best = max({oldBest}, {a}) = {best}。已扫描 {n}/{u} 个端点；扫描已完成，best 为返回值。",
    "Process {x}: active = {old} + ({d}) = {a}; best = max({oldBest}, {a}) = {best}. Scanned {n}/{u} endpoints; scan complete, best is the return value."
  ]
};
