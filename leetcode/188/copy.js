window.LESSON_COPY = {
  "docTitle": [
    "#188 · 买卖股票的最佳时机 IV",
    "#188 · Best Time to Buy and Sell Stock IV"
  ],
  "title": [
    "#188 · 买卖股票的最佳时机 IV",
    "#188 · Best Time to Buy and Sell Stock IV"
  ],
  "back": [
    "← LeetCode 知识索引",
    "← LeetCode collection"
  ],
  "meta": [
    "算法 / 困难 / Python",
    "ALGORITHMS / HARD / PYTHON"
  ],
  "tagline": [
    "交易额度从 1 变成 k：该记住哪些现金值？",
    "From one trade to k: which cash values must we remember?"
  ],
  "official": [
    "官方题目 ↗",
    "Official problem ↗"
  ],
  "s0": [
    "交易额度改变什么？",
    "What does the trade budget change?"
  ],
  "s1": [
    "每种额度的两种状态",
    "Two states for each budget"
  ],
  "s2": [
    "逐日比较旧值与新值",
    "Compare yesterday and today"
  ],
  "s3": [
    "先预测，再揭晓",
    "Predict before revealing"
  ],
  "s4": [
    "证明与 Python",
    "Proof and Python"
  ],
  "statement": [
    "这一步要回答：价格 [2,5,1,4]，最多 k 笔交易能赚多少？一笔交易是先买入再卖出，利润为卖价减买价；总利润是各笔利润之和。必须先卖再买，不能同时持有多股，也可以完全不交易。k 是交易额度，不是必须完成的次数。",
    "Question: for prices [2,5,1,4], how much can at most k transactions earn? A transaction is a buy followed by a sell; its profit is sale price minus buy price. Add those profits. Sell before buying again, never hold multiple shares, and allow doing nothing. k is a trade budget, not a required count."
  ],
  "hand": [
    "k=1 时，买 2 卖 5 赚 3；买 1 卖 4 也赚 3；买 2 持到 4 只赚 2。所以最多赚 3。只把额度改成 k=2：买 2 卖 5，再买 1 卖 4，共赚 3+3=6。天数从 1 开始，输入下标从 0 开始。",
    "With k=1, buy at 2 and sell at 5 for 3, or buy at 1 and sell at 4 for 3. Holding from 2 to 4 earns only 2, so the best is 3. Change only the budget to k=2: buy at 2, sell at 5, then buy at 1, sell at 4, for 3+3=6. Teaching days start at 1; input indices start at 0."
  ],
  "constraints": [
    "官方范围：1 ≤ k ≤ 100，1 ≤ n ≤ 1000，0 ≤ prices[i] ≤ 1000。n 是天数。无手续费或冷却期；返回最大利润整数，不要求交易日期。空数组和 k=0 不在官方范围内。",
    "Official bounds: 1 ≤ k ≤ 100, 1 ≤ n ≤ 1000, 0 ≤ prices[i] ≤ 1000; n is the number of days. No fee or cooldown is specified. Return the maximum integer profit, not trade dates. Empty arrays and k=0 are outside the official bounds."
  ],
  "examples": [
    "官方示例：k=2，[2,4,1] → 2；k=2，[3,2,6,5,0,3] → 7（2→6 赚 4，0→3 赚 3）。",
    "Official examples: k=2, [2,4,1] → 2; k=2, [3,2,6,5,0,3] → 7 (2→6 earns 4, 0→3 earns 3)."
  ],
  "baseTitle": [
    "可靠但昂贵的起点",
    "A reliable but costly baseline"
  ],
  "baseline": [
    "可靠的起点：每天枚举休息、买入、卖出中的合法动作。holding 表示手里有一股；remaining 是还能完成多少笔。卖出后额度减 1；最后还持股的分支无效，记为 −∞（负无穷，永远不会胜过合法值）。下方递归不缓存结果，同一未来会被反复计算：至多 O(2ⁿ) 时间、O(n) 调用栈；n=1000 时无法这样枚举。",
    "A reliable starting point: enumerate every legal rest, buy, or sell decision each day. holding means one share is held; remaining counts trades still available. A sale spends one slot. Ending with a share is invalid, represented by −∞ (negative infinity, which cannot beat a valid value). This recursion does not cache results and repeatedly explores the same future: at most O(2ⁿ) time and O(n) stack space. It is infeasible for n=1000."
  ],
  "wrong": [
    "诱人的错误：取最大的 k 段连续上涨。[1,3,2,4,3,5] 有三段上涨，每段赚 2；k=2 时这样只得 4。但买 1 持到 4（赚 3），再买 3 卖 5（赚 2），共 5。跨过一次小跌幅，可以节省一次交易额度；只按每段涨幅排序会漏掉它。",
    "Tempting mistake: take the k largest rising runs. In [1,3,2,4,3,5], three runs each gain 2, so k=2 would give 4. But buy at 1 and hold until 4 for 3, then buy at 3 and sell at 5 for 2: total 5. Holding through a small dip saves a transaction slot; sorting isolated gains misses this option."
  ],
  "derive": [
    "这一步要回答：两个不同的交易历史，什么时候能合并？现金是卖出收入减去买入支出，从 0 开始，不含手中股票的价值；持股时现金不等于已结算利润。已处理的前几天称为前缀。若两段历史在同一天结束、持股情况相同、已用交易次数相同，则以后的合法动作相同；现金较低的历史永远追不上现金较高的历史。比如第 3 天后只买过一次：买 2 后一直持有的现金 −2，不如后来买 1 的现金 −1。",
    "Question: when can two different trade histories be merged? Cash is sale receipts minus buy payments, starting at 0 and excluding any held share’s value; holding cash is not realized profit. A prefix is the days processed so far. Histories ending on the same day with the same holding status and number of trades used allow the same future actions. The lower-cash history cannot overtake the higher-cash one. For example, after day 3 with one buy, holding from price 2 leaves −2 cash, worse than buying later at 1 for −1 cash."
  ],
  "states": [
    "于是，对每个额度 t=1…k，记录 h[t]：最多买入 t 次且持有一股的最大现金；c[t]：最多完成 t 笔且空仓（不持股）的最大现金。t 是额度，不是恰好次数。c[0]=0，h[0]=−∞，因为不买就不能持股。各个最大值可能来自不同历史，不能把整行当成一条交易记录。 最多 t 的值再对已用次数不超过 t 的各类取最大值；买入时从额度 t−1 转到 t，卖出不再增加买入次数。",
    "For each budget t=1…k, keep h[t]: greatest cash while holding one share with at most t buys; and c[t]: greatest cash while flat (no share) with at most t completed trades. t is a budget, not an exact count. c[0]=0 and h[0]=−∞: no buys means no held share. The maxima may come from different histories, so a row is not one trade log. Each at-most-t value also maximizes over all eligible counts up to t. A buy moves from budget t−1 to t; selling adds no further buy."
  ],
  "deriveHand": [
    "仍看 k=2，[2,5,1,4]。按 (h[1],c[1];h[2],c[2]) 排列：价格 2 后为 (−2,0;−2,0)。价格 5 后，卖出候选 −2+5=3，得到 (−2,3;−2,3)。价格 1 后，h[1] 可改为 0−1=−1；h[2] 可用昨天 c[1]=3 买入，变成 3−1=2，得到 (−1,3;2,3)。价格 4 后，c[2] 可由昨天 h[2]=2 卖出得到 2+4=6，而 c[1] 只能得 3。",
    "Keep k=2 and [2,5,1,4]. Write (h[1],c[1];h[2],c[2]). After price 2: (−2,0;−2,0). At price 5, selling offers −2+5=3: (−2,3;−2,3). At price 1, h[1] can become 0−1=−1; h[2] can spend yesterday’s c[1]=3, giving 3−1=2: (−1,3;2,3). At price 4, c[2] can sell yesterday’s h[2]=2 for 2+4=6, while c[1] stays 3."
  ],
  "recurrence": [
    "为什么只比较两项？今天结束时持股，要么昨天已持股并休息，要么昨天以额度 t−1 空仓、今天支付价格 p 买入。今天空仓，要么昨天就空仓，要么卖掉昨天持有的一股。撇号表示今天处理完的新值，右侧全部取昨天值：",
    "Why compare only two options? Ending today with a share means either keeping yesterday’s share or buying at today’s price p from a flat state with budget t−1. Ending flat means either resting while flat or selling yesterday’s share. Primes denote today’s completed values; every right-hand value is from yesterday:"
  ],
  "init": [
    "未读价格时，所有 c[t]=0（不交易），所有 h[t]=−∞（无法持股）。每次先复制旧数组，避免误把今天产生的现金当作昨天状态。最后返回 c[k]，因为未卖出的股票不算完成利润。本题无手续费或冷却期，同日卖后再买可合并成继续持有，不增加利润；按每天最多一个动作计算不损失最优解。",
    "Before any prices, all c[t]=0 (do nothing) and all h[t]=−∞ (holding is impossible). Copy the old arrays before each day so today’s new cash cannot masquerade as yesterday’s state. Return c[k], since unsold stock is not completed profit. With no fees or cooldown, a same-day sale and repurchase can be merged into continued holding without changing profit; allowing at most one action per day loses no optimum."
  ],
  "labTask": [
    "这一步要回答：哪一个旧状态使今天的最大现金提高？先保持 k=2，逐日处理 [2,5,1,4]，在价格 1 时看 h[2]，在价格 4 时看 c[2]。再选相同价格、k=1 的预设，对比终值。换预设会把天数归零；上一步和重置可逆转实验。",
    "Question: which old state improves today’s greatest cash? Keep k=2 and process [2,5,1,4] day by day. Watch h[2] at price 1 and c[2] at price 4. Then choose the same prices with k=1 and compare the final result. Changing a preset restarts at day zero; step backward or reset to reverse the experiment."
  ],
  "labDefs": [
    "本步口径：h[t] 是已处理天数内、最多 t 次买入且持股的最大现金；c[t] 是最多 t 笔交易且空仓的最大现金。现金不含股票价值。卡片显示昨天值、今天动作候选和处理后的值；下方保留已处理天数的完整历史。t 是额度，不是完成次数。 t=1…k，其中 k 是总额度；−∞ 表示不可能的持股状态。",
    "Here h[t] is greatest holding cash after the processed days with at most t buys; c[t] is greatest flat cash with at most t completed trades. Cash excludes share value. Cards show yesterday, today’s action candidate, and the completed value; the ledger retains every processed day. t is a budget, not a completed count. Here t=1…k, where k is the total budget; −∞ marks an impossible holding state."
  ],
  "simulation": [
    "这是 JavaScript 教学模拟，不是执行下方 Python。每帧恰好处理完一天，无省略；只展示 n≤6、k≤3 的小输入。Python 只保存当前数组；教学模拟另外保存 O(nk) 历史快照。",
    "This is a JavaScript teaching simulation, not execution of the Python below. Each frame completes one day with no omissions; presets have n≤6 and k≤3. Python keeps only current arrays; the tutorial additionally stores O(nk) history snapshots."
  ],
  "presets": [
    "价格预设（切换会重置实验）",
    "Prices (changing restarts the experiment)"
  ],
  "p0": [
    "手算：k=2，[2,5,1,4]",
    "Hand case: k=2, [2,5,1,4]"
  ],
  "p1": [
    "只改额度：k=1，[2,5,1,4]",
    "Budget only: k=1, [2,5,1,4]"
  ],
  "p2": [
    "官方 1：k=2，[2,4,1]",
    "Official 1: k=2, [2,4,1]"
  ],
  "p3": [
    "官方 2：k=2，[3,2,6,5,0,3]",
    "Official 2: k=2, [3,2,6,5,0,3]"
  ],
  "p4": [
    "小跌幅：k=2，[1,3,2,4,3,5]",
    "Small dips: k=2, [1,3,2,4,3,5]"
  ],
  "p5": [
    "一直下跌：k=3，[5,4,3,2]",
    "Falling: k=3, [5,4,3,2]"
  ],
  "p6": [
    "一天零价：k=1，[0]",
    "One zero-price day: k=1, [0]"
  ],
  "prev": [
    "← 回退一天",
    "← Rewind one day"
  ],
  "next": [
    "处理下一天 →",
    "Process next day →"
  ],
  "reset": [
    "回到第 0 天",
    "Return to day 0"
  ],
  "end": [
    "处理到末日",
    "Process to the end"
  ],
  "position": [
    "已处理天数",
    "Processed days"
  ],
  "ledger": [
    "逐日最大现金账本",
    "Daily greatest-cash ledger"
  ],
  "day": [
    "天",
    "Day"
  ],
  "price": [
    "价格",
    "Price"
  ],
  "state": [
    "状态",
    "State"
  ],
  "old": [
    "昨日",
    "Yesterday"
  ],
  "candidate": [
    "今天动作候选",
    "Action today"
  ],
  "new": [
    "今日 = max",
    "Today = max"
  ],
  "decision": [
    "选择",
    "Decision"
  ],
  "keep": [
    "保持",
    "Keep"
  ],
  "improve": [
    "更新 ↑",
    "Improve ↑"
  ],
  "tie": [
    "持平 =",
    "Tie ="
  ],
  "noDay": [
    "尚未处理价格；下表是初始条件。",
    "No price processed yet; the table shows initial conditions."
  ],
  "progress": [
    "已处理 {day}/{n} 天 · k={k} · 当前空仓最大利润 c[k]={profit}",
    "Processed {day}/{n} days · k={k} · current greatest flat profit c[k]={profit}"
  ],
  "dayNote": [
    "刚处理第 {day} 天，价格 {p}。所有动作候选读取昨日状态。",
    "Just processed day {day} at price {p}. Every action candidate reads yesterday’s state."
  ],
  "pricesLabel": [
    "每日价格，按天排列；箭头指向刚处理的价格。",
    "Daily prices in day order; the arrow marks the last processed price."
  ],
  "current": [
    "← 当前",
    "← current"
  ],
  "future": [
    "待处理",
    "Pending"
  ],
  "done": [
    "已处理",
    "Processed"
  ],
  "quiz": [
    "新题：k=2，已处理 [1,4,2]。h[1]=−1，c[1]=3，h[2]=1，c[2]=3；h 是持股现金，c 是空仓现金，方括号内为最多交易额度。下一天价格为 5，处理后 c[2] 是多少？请先选择，再揭晓。",
    "Fresh case: k=2, after [1,4,2], h[1]=−1, c[1]=3, h[2]=1, c[2]=3. h is holding cash and c is flat cash; brackets give the maximum trade budget. The next price is 5. What is the new c[2]? Choose before revealing."
  ],
  "option0": [
    "4：只看最低买价 1",
    "4: use only the minimum buy price 1"
  ],
  "option1": [
    "6：把持股现金 1 加上售价 5",
    "6: add sale price 5 to holding cash 1"
  ],
  "option2": [
    "8：把空仓现金 3 加上售价 5",
    "8: add sale price 5 to flat cash 3"
  ],
  "reveal": [
    "揭晓并解释",
    "Reveal and explain"
  ],
  "correct": [
    "正确。",
    "Correct."
  ],
  "incorrect": [
    "再检查现金的含义。",
    "Check what cash includes."
  ],
  "answer": [
    "c[2]′=max(3,1+5)=6。h[2]=1 已包含买 1 卖 4 再买 2 的现金 3−2；卖出收 5 得 6。选 4 丢掉了第一笔收益；选 8 忘了买入支出，空仓现金 3 不能直接卖股。",
    "c[2]′=max(3,1+5)=6. h[2]=1 already includes buying at 1, selling at 4, then buying at 2: cash 3−2. Selling for 5 yields 6. Answer 4 drops the first trade’s gain; answer 8 forgets the purchase payment, since flat cash 3 has no share to sell."
  ],
  "proof": [
    "这一步要回答：为什么不保留日期也能保证最优？不变式（每一天后都成立的状态含义）是：cash[t] 为最多 t 笔、空仓的最大现金，hold[t] 为最多 t 次买入、持股的最大现金。初始空仓 0、持股不可能，成立。任一合法历史的最后一天只能休息、买或卖；这三类由递推式穷尽。每项候选又都从合法旧历史加一个合法动作而来，因此取最大值既不漏解，也不引入非法解。 这里 t=1…k，k 为总额度；空仓表示没有股票，现金不含持有股票的价值。",
    "Question: why can we discard dates and still guarantee the optimum? The invariant (a meaning preserved after every day) is: cash[t] is greatest flat cash with at most t trades, and hold[t] is greatest holding cash with at most t buys. Initially flat cash is 0 and holding is impossible. A legal history’s last day must rest, buy, or sell, all covered by the recurrence. Every candidate also extends a legal old history by a legal action. Taking the maximum neither misses a history nor invents an illegal one. Here t=1…k, k is the total budget, flat means no share, and cash excludes the value of any held share."
  ],
  "sufficiency": [
    "这里采用动态规划：按天数与持股情况、已用次数归类，再用最多 t 次的最大现金概括所有符合额度的历史。旧日期不再影响未来价格或动作；递推只需要各额度的最大现金。最终要求卖完，故取 cash[k] 而不是 hold[k]。",
    "This is dynamic programming: group histories by day, holding status, and count used, then summarize all histories within each budget t by their greatest cash. Past dates cannot change future prices or actions; the recurrence needs only the greatest cash for each budget. Finish flat, so return cash[k], not hold[k]."
  ],
  "map1": [
    "图中的 c[t] 对应 cash[t]，h[t] 对应 hold[t]；old_cash、old_hold 是昨天的完整快照。",
    "Diagram c[t] maps to cash[t], and h[t] to hold[t]; old_cash and old_hold snapshot yesterday."
  ],
  "map2": [
    "外层 for price 每次读一天；内层 t=1…k 为每种额度计算休息或动作的最大值。",
    "The outer for price reads one day; the inner t=1…k compares resting with acting for each budget."
  ],
  "map3": [
    "hold[t] 的买入用 old_cash[t−1]；cash[t] 的卖出用 old_hold[t]。快照保证读数都来自前一天。",
    "Buying into hold[t] uses old_cash[t−1]; selling into cash[t] uses old_hold[t]. Snapshots make every read refer to yesterday."
  ],
  "cost": [
    "n 天 × k 种额度：O(nk) 时间，O(k) 额外空间（含每日复制数组）；返回一个整数 O(1)。官方最大 n=1000、k=100，仅 100000 次额度更新。基线是 O(2ⁿ) 时间、O(n) 栈；教学历史为 O(nk) 空间，不是提交解的空间。",
    "n days × k budgets: O(nk) time and O(k) auxiliary space, including daily array copies; the integer result is O(1). Official maxima n=1000, k=100 require 100000 budget updates. The baseline costs O(2ⁿ) time and O(n) stack; tutorial history uses O(nk) space, separate from submission space."
  ],
  "boundaries": [
    "一天、一直下跌或全部相等时，最优为不交易的 0。零价格可以买入，持股现金可以为 0 或正数。k≥⌊n/2⌋ 时额度已足够多：可把每段上涨全部拿到，利润等于所有正相邻差之和；本实现仍运行同一 O(nk) 递推，没有额外捷径。空数组或 k=0 防御性返回 0，但并非官方输入。",
    "For one day, falling prices, or equal prices, doing nothing earns the optimum 0. Zero-price purchases are legal; holding cash may be zero or positive. When k≥⌊n/2⌋, the budget is sufficient to capture every rising run, equaling the sum of positive adjacent differences. This implementation still uses the same O(nk) recurrence without a shortcut. Empty arrays or k=0 defensively return 0, although neither is official input."
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
    "查看官方接口 Python 解法",
    "Inspect the Python submission"
  ],
  "copied": [
    "已复制。",
    "Copied."
  ],
  "fallback": [
    "剪贴板不可用。请从下框手动复制完整源码：",
    "Clipboard unavailable. Copy the full source manually below:"
  ],
  "related": [
    "继续理解状态与边界",
    "More on state and boundaries"
  ],
  "related0": [
    "股票 III：固定两笔时的四状态 →",
    "Stock III: four states for a fixed two-trade budget →"
  ],
  "related1": [
    "正则匹配：按前缀保存状态 →",
    "Regex matching: keeping states for prefixes →"
  ],
  "foot": [
    "作者实现与自查 · 独立评审待完成 · 无在线提交记录",
    "Author implementation and self-check · Independent review pending · No online submission result"
  ],
  "verify": [
    "本地自查会执行这个 Python 接口，并用独立的买卖日期枚举验证小输入；浏览器模拟的每一天、每种额度也对账。通过测试不表示 LeetCode 已接受，也不表示独立评审通过。",
    "Local self-checks execute this Python interface against independent buy/sell-date enumeration on small inputs. Every simulated day and budget is also checked. Passing tests establishes neither LeetCode acceptance nor independent review acceptance."
  ],
  "language": [
    "语言",
    "Language"
  ],
  "navigation": [
    "学习步骤",
    "Lesson steps"
  ],
  "scrollLedger": [
    "可横向滚动的现金账本",
    "Horizontally scrollable cash ledger"
  ],
  "p7": [
    "相等价格：k=3，[2,2,2]",
    "Equal prices: k=3, [2,2,2]"
  ]
};
