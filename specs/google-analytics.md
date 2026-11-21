# Visual 全站 GA4（2026-11-21）

用户要求将 Integ.Life 系列网站统一接入 Google Analytics，获得稳定的网站表现数据。
Visual 之前没有 Google tag。生产 web stream 为 `G-LPRZ9XLGWX`，增强型衡量在 GA 管理界面关闭。

## 行为边界

- 只在顶层 `visual.integ.life` 启用；本地、预览、嵌入 iframe 不发送。
- 每个文档只发送一次显式 `page_view`，关闭 config 自动 pageview、Google signals 与广告个性化。
- 页面位置来自发布时已知的公开文件路径；不发送查询、片段、站内搜索词、文档标题、referrer 或交互输入。统一标题 `Integ Visual`。Google 的自动 engagement 等仍使用这份已清洗页面配置。
- 跳转页不额外计数。章节锚点、语言切换和搜索筛选仍属于同一文档访问，不另发 pageview。
- 保留页面作者及 provenance：注入只发生在一次性发布包，不修改几百篇手写与模板生成页的源文件。

## 发布覆盖

`node scripts/inject-google-analytics.cjs <发布目录>` 扫描发布 HTML，按脚本内容 hash 添加版本化引用和公开路径。它拒绝 Git checkout，可重复运行且不重复标签；不处理测试、证据、内部文档与 redirect。首页、课程、长文、LeetCode、图谱、平行版本自动覆盖，未来新页无需手贴埋点。

Pi 发布必须使用 `python3 scripts/deploy-pi.py`：从干净、已推送的 origin/main 导出，运行模板、登记表、provenance 和 GA 检查，注入后 rsync。脚本不删除生产独立文件、不重启服务。`analytics-release.json` 记录实际发布 SHA。现有 Pages 工作流在组装 `_site` 后执行相同注入步骤。旧的原始源码 rsync 会移除标签，不应继续使用。

## 防复发验证

`node tests/google-analytics.cjs`：生产域/iframe限制、去重、不泄露敏感 canary、静态/模板/平行路径覆盖、跳转与测试排除、幂等和 checkout 写保护。
部署前还跑 `build-pages --all --check`、`build-registry --check`、`page-provenance-core`；部署后检查首页、模板长文、平行版、LeetCode 的标签、公共脚本 hash 与 release SHA。GA 实际收数由管理界面另验，源码标签存在不等于收到事件。

## 远端初始化防护（2026-11-21 现场回归）

GA 实时验收发现首次访问同时出现固定标题 `Integ Visual` 与原始标题 `知识索引` 的两次 pageview。公共 Google loader 的远端配置在 `gtm.js` 注册 destination；仅在其后的本地 `config` 里关自动 pageview，不能保护之前的初始化。

现最先用 consent default 拒绝 `ad_storage`、`ad_user_data`、`ad_personalization`，仅授权 `analytics_storage`（网站基础统计）；然后发全局 `gtag('set', settings)`，再发 `js`、同值 `config`、显式 pageview。全局包含清洗后的公开 URL、固定标题、空 referrer，以及 `send_page_view:false`、`allow_google_signals:false`、`allow_ad_personalization_signals:false`、`allow_enhanced_conversions:false`。测试固定队列次序并模拟远端在 js 时初始化，确保提前已有安全值。它不是实际 Google runtime 的替代测试；部署后仍须在 GA 实时页核实唯一 pageview。

Google tag 界面的自动事件、用户提供的数据自动检测是独立设置，须关闭并检查保存结果，不能仅凭 web stream 的增强衡量总开关或源码 flag 宣称关闭。范围与优先级依据 [Google tag API reference](https://developers.google.com/tag-platform/gtagjs/reference)。
