# 分布式系统 · build brief

四步双语切片：副本与 quorum、写入复制、读取一致性、分区取舍。

- 核心 API：`quorumStatus`、`writeStatus`、`readStatus`。
- 模型是版本化 key-value 集群；明确不模拟 Raft/Paxos、反熵或数据库恢复细节。
- 验证：`node tests/core.cjs`、`node --check app.js`，浏览器切换分区、模式和双语。
