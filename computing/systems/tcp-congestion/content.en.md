---
lang: en
---

::: strings
docTitle: Network Flow · A Message’s Journey
back: ← Knowledge Index
pageTitle: Network Flow · A Message’s Journey
tagline: A message does not “fly there” in one piece: it is split into packets, queued on links, forwarded by routers, then stitched into a reliable byte stream by TCP acknowledgements and retransmissions. Move each control and watch the causal chain.
foot: Network Flow · A Message’s Journey
:::

## A large message is cut into small packets {#step0 h2=s0t}

::: strings
nav0: 0 Packetize
:::

STEP 0 · PACKETS {#s0k .step-kicker i18n=text}

A 4 MB file is not one giant box on the network; MTU cuts it into numbered packets. **Smaller packets wait less per item, but more headers cost more overhead.** Send a round and watch packets cross the link. {#s0e .explain}

::: html step0-1
sizeLab: Message size (MB)
mtuLab: MTU tier
send: Send one round
reset: Reset
:::

Real networks can lose or reorder packets; sequence numbers let the receiver reorder them and checksums detect damage. Packetization turns one large failure into retryable small failures. {#s0hint .hint}

::: strings
sizeVal: {v} MB
mtuVal: {v} KB
s0ro: packets {n} · header overhead {h}% · arrived {a}/{n}
:::

## Bandwidth is pipe width; latency is where the water is {#step1 h2=s1t}

::: strings
nav1: 1 Latency & bandwidth
:::

STEP 1 · LATENCY & BANDWIDTH {#s1k .step-kicker i18n=text}

Total time is roughly **round-trip latency + data ÷ bandwidth**. Raise latency and short messages slow immediately; raise bandwidth and long messages benefit. The knobs control different bottlenecks. {#s1e .explain}

::: html step1-1
latLab: Round-trip latency RTT (ms)
bwLab: Bandwidth (MB/s)
:::

Latency decides when the first drop arrives; bandwidth decides how much can flow each second. That is why first-paint and video buffering need different optimisations. {#s1hint .hint}

::: strings
s1formula: total time = RTT + message size ÷ bandwidth
s1ro: Current 4 MB: RTT {l} ms · bandwidth {b} MB/s · total {t} ms
:::

## Routers choose the next hop, not the whole journey {#step2 h2=s2t}

::: strings
nav2: 2 Routing
:::

STEP 2 · ROUTING {#s2k .step-kicker i18n=text}

Each router consults a table and chooses a **next hop**. A different route may be longer but avoid a queue; the path is a policy and state result, not a straight line on a map. {#s2e .explain}

::: html step2-1
routeLab: Path policy
:::

IP forwards best effort: no delivery or order guarantee. A higher layer supplies reliability. {#s2hint .hint}

::: strings
routeVal: {v}
s2ro: path {p} · hops {h} · propagation {d} ms · queue wait {q} ms
:::

## Three steps confirm that both sides can hear {#step3 h2=s3t}

::: strings
nav3: 3 TCP handshake
:::

STEP 3 · TCP HANDSHAKE {#s3k .step-kicker i18n=text}

The client sends SYN, the server replies SYN-ACK, then the client sends ACK. The third step confirms **both sending and receiving abilities** and synchronises initial sequence numbers. {#s3e .explain}

::: html step3-1
syn: Send SYN
synAck: Send SYN-ACK
ack: Send ACK
:::

The handshake establishes a connection; it does not carry your file. Data segments then use the same sequence, acknowledgement and window rules. {#s3hint .hint}

::: strings
s3ro: state: {st} · control packets {n} · connection seq {seq}
:::

## When queues fill, the sender must slow down {#step4 h2=s4t}

::: strings
nav4: 4 Congestion
:::

STEP 4 · CONGESTION CONTROL {#s4k .step-kicker i18n=text}

As load rises, queueing delay and loss rise. TCP probes capacity with a congestion window: grow after successful ACKs, retreat after timeout or duplicate ACKs. **Stable throughput is a probe-and-retreat loop.** {#s4e .explain}

::: html step4-1
loadLab: Network load
:::

More bandwidth is not every congestion answer: when RTT or queues are the bottleneck, window and queue policy matter too. {#s4hint .hint}

::: strings
loadVal: {v}/10
s4formula: throughput ≈ min(bandwidth, congestion window ÷ RTT)
s4ro: load {l}/10 · loss {p}% · mean wait {q} ms · window {w} KB
:::

## Read one message as five causal layers {#step5 h2=s5t}

::: strings
nav5: 5 Wrap-up
:::

STEP 5 · WRAP-UP {#s5k .step-kicker i18n=text}

The app writes bytes → TCP numbers, acknowledges and retransmits → IP picks the next hop → the link sends at its bandwidth → queues turn congestion into waiting. Each layer owns one problem; together they look like a “reliable network”. {#s5e .explain}

::: html step5-1
s5formula: reliability = packets + sequence + ACK + retransmit; speed = bandwidth, latency and queues
:::

Keep exploring: change one knob, predict which layer should move, then check the readout. {#s5ro .readout}
