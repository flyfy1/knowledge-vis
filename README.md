# visual.integ.life — 知识索引站（原 knowledge.integ.life，已改名）

把难懂的知识点做成可以上手玩的交互页：每页一个主题，由浅入深，一步一交互。

## 结构
- `index.html` — 索引首页，卡片由配置自动渲染（无构建、无后端，纯静态）
- `pages.config.js` — **索引配置**：新增知识页 = 在此数组加一条 + 把页面放进同名子目录
- `atlas/` — Bilingual mathematics and physics knowledge map: 24 curated concepts, typed relations with supporting explanations, and three suggested routes through existing lessons. Scope: waves, systems, and measurement.
- `leetcode/` — Interactive algorithm lessons, with a dedicated collection and Python solutions. Register new problems in `leetcode/problems.config.js`; the first ten Hard problems by ascending ID (4, 10, 23, 25, 30, 32, 37, 41, 42, 44) and the original [2916](https://visual.integ.life/leetcode/2916/) are available.
- `specs/` — Reusable lesson authoring and verification guidance. Start with [LeetCode explainers](specs/leetcode-explainers.md) and the problem-local `BRIEF.md`. Batch-specific failure prevention is in [Hard lesson trace specification](specs/leetcode-hard-traces.md).
- `fourier/` — 傅里叶变换交互讲解页（源码自 ~/workspace/fourier-lab 迁入，三轮评审档案留在 fourier-lab/rounds/）
- `fourier-redirect.html` — 旧域名 fourier.integ.life 根路径的跳转页（已部署在 Pi 的 fourier-site 目录）

## 部署
Pi：`~/projects/visual-site/`，systemd `visual-site.service`（python http.server :18513），
CF Tunnel ingress visual.integ.life → localhost:18513（隧道脚本 cf_tunnel_visual.py 在本目录）。
`~/projects/knowledge-site/`（:18512）与 fourier-site.service（:18511）都只保留跳转页，跳到 visual 对应路径。

## LeetCode authoring and checks

The first-ten pages share navigation and trace controls, while each algorithm has
its own model, bilingual derivation, boundary presets, and Python solution.
Author copy in `leetcode/hard-first-ten/lessons.py`, run `build.py` in that folder
from any working directory, then regenerate code bundles with `write_solutions.py`.
`solution.py` remains the canonical displayed/downloaded Python source.

```sh
python3 leetcode/hard-first-ten/build.py
python3 leetcode/hard-first-ten/write_solutions.py
python3 leetcode/tests/test_hard_solutions.py
node leetcode/tests/test_hard_core.cjs
python3 -m http.server 18768 --bind 127.0.0.1
# In another shell, using an existing Playwright installation:
NODE_PATH=/path/to/node_modules node leetcode/tests/test_hard_browser.cjs
```

Browser checks accept `LESSON_BASE_URL` and optional `LESSON_SCREENSHOTS`.
See [review evidence](specs/reviews/leetcode-first-ten-review.md) for scope and
limitations. The site itself has no build-time or runtime package dependency.
