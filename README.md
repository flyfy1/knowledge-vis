# visual.integ.life — 知识索引站（原 knowledge.integ.life，已改名）

把难懂的知识点做成可以上手玩的交互页：每页一个主题，由浅入深，一步一交互。

## 结构
- `index.html` — 索引首页，卡片由配置自动渲染（无构建、无后端，纯静态）
- `pages.config.js` — **索引配置**：新增知识页 = 在此数组加一条 + 把页面放进同名子目录
- `fourier/` — 傅里叶变换交互讲解页（源码自 ~/workspace/fourier-lab 迁入，三轮评审档案留在 fourier-lab/rounds/）
- `fourier-redirect.html` — 旧域名 fourier.integ.life 根路径的跳转页（已部署在 Pi 的 fourier-site 目录）

## 部署
Pi：`~/projects/visual-site/`，systemd `visual-site.service`（python http.server :18513），
CF Tunnel ingress visual.integ.life → localhost:18513（隧道脚本 cf_tunnel_visual.py 在本目录）。
`~/projects/knowledge-site/`（:18512）与 fourier-site.service（:18511）都只保留跳转页，跳到 visual 对应路径。
