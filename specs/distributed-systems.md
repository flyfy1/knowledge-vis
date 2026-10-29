# Distributed Systems

## Route
- slug: `distributed-systems`
- category: `computing`
- stage: `university`

## Causal contract
1. With N replicas, a write waits for W acknowledgements and a read asks R replicas.
2. `R + W > N` gives quorum overlap and a stronger freshness guarantee.
3. A network partition reduces available replicas; writes fail when fewer than W can answer.
4. Strong reads prefer freshness; eventual reads prefer availability and converge later.

## Scope
A versioned key-value teaching model. It does not implement Raft, Paxos, anti-entropy, transactions or production recovery policy.
