# Network Flow

## Route
- slug: `network-flow`
- category: `computing`
- stage: `university`

## Causal contract
1. Packet count is `ceil(size × 1024 / MTU)` and header overhead grows with packet count.
2. Transfer time separates round-trip latency from payload time: `RTT + size / bandwidth`.
3. Route choice changes hop count, propagation delay and queue waiting together.
4. TCP advances only through `SYN → SYN-ACK → ACK`, then congestion load changes loss, waiting and the window.

## Scope
A compact teaching model. It omits real routing tables, MSS/TLS details, cumulative ACK behavior and implementation-specific `cwnd` units.
