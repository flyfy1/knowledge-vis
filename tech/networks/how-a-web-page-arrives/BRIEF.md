# BRIEF · how-a-web-page-arrives 网页是怎么来到你手机上的

- Built-By: Claude Code (claude-opus-5-5), essay batch 3, 2026-11-11
- Verified-By: self-check (node model test, browser smoke test, canvas sweep, screenshots at 1280/390/320 and reduced motion); independent review pending
- category `tech`, subtopic `networks` (new: 网络与互联网 / Networks & the Internet), stage `senior`
- Format: one long interactive essay in the style of `demos/scarcity-moves` (see `/tmp/agent-tasks/standard/STANDARD.md`). Not a step page: no `lesson-shell.js`, no provenance label yet (the integrator adds it once a commit exists).
- Files: `index.html` (markup + styles; Chinese only in the static `<title>`, meta description and the 中 button), `copy.zh.js` (all visible text), `models.js` (pure models, UMD), `app.js` (wiring, drawing, i18n, IntersectionObserver gating), `tests/models.cjs`, `tests/browser.cjs` (env `ESSAY_BASE_URL`). `copy.en.js` is not written yet (translation is a later step); the page loads it if present and falls back to zh per key.

## The one question

You tap a link and the page is there in about a second, though it may live on a computer thousands of kilometres away. Where does that second go, which parts can be made faster, and which cannot?

Answer the essay builds: the time is mostly waiting for replies. Load time ≈ (number of round trips) × (time per round trip). Ch1–7 show where the round trips come from (name lookup, the TCP and TLS handshakes, retransmission, slow start) and why packets get lost (queues); ch8 adds them up against the propagation floor (fibre ≈ 2/3 c) and shows what fewer round trips (TLS 1.3, QUIC, caching) and a shorter distance (CDN) buy. Ch9 turns it into three questions.

## Changes from the starting list in the task

- **Order**: name → packets → routing → loss → reliability → congestion window → key exchange → budget. Encryption moved before the budget so the budget can count the TLS round trips the reader has just seen, and the budget became the synthesis chapter that reuses ch1, ch6 and ch7 by name.
- **Split "why delivery is unreliable" from "how TCP makes it reliable"** into two chapters (ch4 queue loss, ch5 ARQ) because each has its own standard model (M/M/1/K; selective-repeat ARQ) and its own non-obvious result (a bigger buffer cannot fix overload; one loss nearly doubles the time for 20 packets and holds up packets behind it).
- **Packet chapter (ch2) uses the store-and-forward pipelining result** rather than a picture of chopping, because it gives a real optimum (√(LH/(k−1))) and explains why packets sit near 1,500 bytes.
- **Two-flow fairness (Chiu & Jain)** folded into ch6 as a checkbox instead of a separate chapter.
- Ending (ch9) is three questions and four things the reader can now explain, not a recap.

## Chapters

Each: law · everyday case · model (state, parameters, reader controls, what to discover, closed form) · limits.

1. **先把名字换成地址 / Name lookup** (`#ch1`). Law: a name becomes an address by following referrals, caching each answer. Case: asking a guard, then a front desk. Model: iterative resolution by referral with a TTL cache (RFC 1034 §3.6, §5.3.3): the resolver asks the root, then the TLD, then the domain's own servers, starting from the closest still-valid cached delegation. TLD delegation TTL 2 days, zone NS TTL 1 day, address TTL chosen by the reader (1 min / 5 min / 1 h). Times: phone↔resolver 10 ms, resolver↔each server 30 ms (assumed, labelled). Reader: query three names under `example.com`/`example.org` (RFC 2606 reserved names), wait 10 min / 3 days, clear. Discover: cold 3 servers, 4 round trips, 100 ms; sibling name 1 server, 40 ms; repeat 0 servers, 10 ms; after 3 days from the root again. Limits: phone/browser caches not drawn; IPv6, CNAME chains, encrypted DNS omitted.
2. **切成小包 / Packets** (`#ch2`). Law: small packets let several links work at once. Case: one lorry vs a convoy. Model: store-and-forward over k equal links of 10 Mbit/s (assumed) with 40-byte headers; makespan of a proportionate flow shop = Σ packet times + (k − 1) × largest packet time (checked in the test against a direct simulation). Optimum payload √(L·H/(k−1)). Reader: payload 20 B–1 MB (21 steps, log), hops 1–12. Discover: 1 MB over 5 hops: whole 4.0 s, 1,460 B 0.83 s, 100 B 1.12 s (headers 29 % of bytes sent), optimum ≈ 3,200 B but < 1 % faster than 1,460; one hop gains nothing. Limits: no propagation, no cross traffic, equal link speeds.
3. **一跳一跳地转交 / Routing** (`#ch3`). Law: each router knows only the next hop; a broken link re-forms the route. Case: road signs at junctions. Model: Dijkstra shortest-path tree toward the server on a 9-node graph with illustrative one-way delays (link-state routing, OSPF, RFC 2328); fewest-hops path by BFS for comparison. Reader: break/repair any of 13 links (buttons or tapping the line). Discover: default 你→B→C→D→F→服务器 14 ms, 5 hops, while the 4-hop path takes 17 ms; break C–D → 16 ms via C→E→G with 2 next hops changed; break B–E → nothing changes; only cutting both of your links disconnects you. Test checks Dijkstra against brute force for every single break. Limits: convergence time, BGP policy routing between networks, ties broken alphabetically.
4. **路口排满了 / Queues and loss** (`#ch4`). Law: loss is mostly full buffers; a longer queue trades loss for delay. Case: toll booth. Model: M/M/1/K closed form, loss = (1−ρ)ρ^K/(1−ρ^{K+1}), mean occupancy, delay by Little's law; plus a seeded event simulation of the same queue (converges to the formula in the test). One packet = 1.2 ms (1,500 B at 10 Mbit/s, same link as ch2). Reader: load 0.1–1.5, buffer 1–60. Discover: ρ 0.8, K 10 → 2.3 %, 4.6 ms; K 50 → ~0, 6.0 ms; ρ 1.2: K 10 → 19 %, 8.3 ms; K 50 → 17 % (floor 1 − 1/ρ), 54 ms (bufferbloat). Limits: bursty traffic, mixed sizes, AQM not modelled.
5. **丢了就再发一遍 / Retransmission** (`#ch5`). Law: number, acknowledge, resend on timeout: loss becomes delay. Case: numbered letters and postcards. Model: selective-repeat ARQ, 20 segments, window W, independent loss p each way, RTT 1, send spacing 0.1 RTT, fixed timeout 2 RTT (chosen for the picture, labelled); receiver delivers in order. Attempts per segment are geometric with success (1−p)², mean 1/(1−p)² (test: 1,500 seeded runs within 4 %). Reader: p 0–50 %, W 1–10, reseed, replay. Discover: W 5 no loss 4.4 RTT, W 1 20 RTT; 10 % each way with the default seed 8.4 RTT, nearly double, with a packet waiting 1.9 RTT for an earlier one (head-of-line blocking); 1.23 / 2.04 / 4 sends at 10 / 30 / 50 %. Limits: fast retransmit, adaptive RTO (RFC 6298 suggests ≥ 1 s).
6. **没人告诉你路有多宽 / Congestion window** (`#ch6`). Law: probe by doubling, halve on loss, add one per RTT: a sawtooth, and flows even out. Case: people in a dark corridor. Model: TCP Reno per round trip (RFC 5681): IW 10 (RFC 6928), slow start doubles until ssthresh, +1 per RTT after, on loss ssthresh = max(⌊cwnd/2⌋, 2) and cwnd = ssthresh (fast recovery); loss when total window > C + B; queue = min(W, C+B) − C (ch4's queue). Second flow joins at round 20; losses synchronised (Chiu & Jain's assumption, stated). Reader: C 10–100, B 0–100, second flow, replay. Discover: C 40/B 20: 10→20→40→80, loss on round 4, sawtooth 30–61, utilisation 96 %; B 0: 20–41, 76 %; B 40: 100 % but 40 queued (one extra RTT); two flows: 10 vs 55 at the first shared loss, gap 45→22→11→6→3, then equal. Limits: no timeout/slow-start restart, synchronised loss, fixed capacity; CUBIC/BBR mentioned.
7. **当众商量一个秘密 / Key exchange** (`#ch7`). Law: two people can agree a secret in public using a one-way-ish operation. Case: shouting across a room. Model: Diffie–Hellman mod p for p ∈ {23, 107, 1019, 10007, 65537}, g = smallest primitive root (5, 2, 2, 5, 3; test checks each is primitive); brute-force discrete log by trying x = 1, 2, …; man in the middle with fixed secrets derived from p. Reader: p, a, b, step through four steps, start the eavesdropper, toggle MITM. Discover: p 23, a 6, b 15 → both get 2; eavesdropper needs 6 tries; 65537 → at most 65,535 tries; with MITM the two sides get different keys. Prose: 2048-bit groups ≈ 617 decimal digits, ≈ 112-bit strength (NIST), X25519 ≈ 128-bit (RFC 7748); certificates and TLS handshake; links to RSA and hashing. Limits: no randomness, KDF, signatures; small numbers have no security.
8. **这一秒花在哪里 / Latency budget** (`#ch8`). Law: wait ≈ round trips × time per round trip; protocols cut the first, distance the second, light sets a floor. Case: a phone call that needs confirmation at every line. Model: RTT = access + 2·d/v with v = c/1.468 (≈ 204,000 km/s); DNS from ch1 (cold = access + 3 × 30 ms, resolver-cached = access, phone-cached = 0); TCP 1 RTT (0 for QUIC), TLS 1.2 2 / TLS 1.3 1 / QUIC 1 (combined); request 1 RTT; remaining data (k − 1) RTT with k = slow-start rounds from ch6 (IW 10, MSS 1,460, no loss, bandwidth assumed sufficient); CDN edge at 50 km (assumed), miss adds one origin RTT. Reader: distance 10–20,000 km, access 0–60 ms, page 14 KB–5 MB, protocol, DNS state, CDN. Discover: default 10,000 km: 98 ms floor, 108 ms RTT, 963 ms total; TLS 1.2 +108, QUIC −108; CDN hit 184 ms with DNS the biggest part; best case 20 ms reach ≈ 1,000 km. Limits: server time, bandwidth, route stretch (so distances are a lower bound), 0-RTT resumption, parallel connections, subresources.
9. **下次页面慢的时候 / When a page is slow** (`#ch9`). No model. Three questions (how many round trips, how far, queuing/loss) with chapter references, four things the reader can now explain, a one-paragraph synthesis, links.

Reuse of earlier models by name: ch5 (ch4's losses), ch6 (ch4's queue; ch5's window), ch8 (ch1's DNS trips and its 10/30 ms assumptions, ch6's slow-start rounds, ch7's TLS handshake).

Links to existing pages (relative): `computing/algorithms/shortest-path/` (ch3), `computing/systems/tcp-congestion/` (ch6, ch9), `computing/systems/rsa-encryption/` and `computing/algorithms/hashing/` (ch7, ch9), `math/arithmetic/division-remainder/` (ch7 limit), `tech/devices/inside-a-phone/#radio` (ch9: its radio and error-correction chapters), `computing/systems/switches-that-compute/` (ch9). The existing `tcp-congestion` page ("网络流 · 一封消息的旅程") covers packetization, latency/bandwidth, routing choice, the SYN handshake and a load-driven congestion picture in six short steps with illustrative formulas; it does not cover DNS, queueing loss, ARQ, Reno dynamics, key exchange or the latency budget, so this essay links to it rather than repeating it.

## Real-world figures and sources (checked 2026-11-11)

| Figure in the page | Source actually checked |
| --- | --- |
| Light in fibre ≈ 200,000 km/s, about 2/3 c; group index ≈ 1.467–1.468 | Wikipedia "Optical fiber" (fetched): "around 200,000 kilometers per second"; Corning product sheets via search excerpts: SMF-28e+ group index 1.4674 (1310 nm) / 1.4679 (1550 nm), SMF-28 Contour 1.4673 / 1.4680, SMF-28 Ultra 1.4676 (1310 nm). The Corning PDFs themselves returned 403. The page uses 1.468; c = 299,792.458 km/s (exact). |
| Ethernet IP datagram ≤ 1,500 octets | RFC 894 (fetched). |
| IPv4 header ≥ 20 bytes, TCP header ≥ 20 bytes | RFC 9293 (fetched: data offset minimum 5 words); RFC 791 IPv4 minimum header 20 octets (standard; not re-opened). |
| TCP three-way handshake | RFC 9293 (fetched). |
| Slow start, +1 MSS per RTT, ssthresh = max(FlightSize/2, 2·SMSS), cwnd = ssthresh after fast recovery, initial ssthresh arbitrarily high | RFC 5681 (fetched, quoted). |
| Initial window min(10·MSS, max(2·MSS, 14600)) | RFC 6928 (fetched; Experimental status). |
| RTO SHOULD be rounded up to 1 s | RFC 6298 §2.4 (fetched). |
| TLS 1.2 full handshake: two round trips before application data | RFC 5246 Figure 1 (fetched). |
| TLS 1.3: 1-RTT handshake, 0-RTT option; groups include x25519, ffdhe2048 | RFC 8446 §1.2, §2.3, §4.2.7 (fetched). |
| QUIC combines the cryptographic and transport handshakes | RFC 9000 §7 (fetched). |
| CUBIC is a standard TCP congestion control | RFC 9438 (fetched header). |
| Root servers: 13 identities, 12 operators, about 2,000 instances | root-servers.org (fetched: "2048 operational instances"); the page says "两千多台". |
| DNS TTL caching and referrals | RFC 1034 §3.6, §5.3.3 (fetched). |
| 2048-bit finite-field DH ≈ 112-bit security; 3072 ≈ 128 | NIST SP 800-57 Part 1 Rev. 5, Table 2 (read via the tex2e.github.io mirror of the text; the NIST PDF downloaded but could not be rendered here). |
| X25519 ≈ 128-bit security | RFC 7748 §4.1 (fetched). |
| AIMD converges to fairness (synchronous feedback, one bottleneck) | Chiu D-M, Jain R. *Computer Networks and ISDN Systems* 17 (1989) 1–14, doi:10.1016/0169-7552(89)90019-6 (abstract and summaries via search). |
| Buffer ≈ bandwidth × RTT rule of thumb | Not stated as a rule on the page; the B = C case is shown as one setting. Background: Appenzeller, Keslassy, McKeown, "Sizing Router Buffers", SIGCOMM 2004 (search excerpt). |
| 192.0.2.10 is a documentation address; example.com/.org reserved | RFC 5737 / RFC 2606 (standard; not re-opened). |

Model parameters not in this table are assumptions and the page says so where they appear: DNS times 10 ms and 30 ms; DNS TTLs (2 days, 1 day; the reader picks the address TTL); link speed 10 Mbit/s; routing link delays; queue service 1.2 ms; ARQ timeout 2 RTT and spacing 0.1 RTT; Reno capacity and buffer (reader-owned); access delay (reader-owned, default 10 ms); CDN edge 50 km; page sizes.

## First appearance of terms

解析器/根服务器/TTL/DNS ch1 · 路由器/存储转发/分组交换 ch2 · 转发表/迪杰斯特拉/链路状态路由/OSPF/BGP ch3 · 缓冲区/排队论/缓冲膨胀 ch4 · TCP/确认/重传/窗口/队头阻塞/QUIC ch5 · 拥塞窗口/慢启动/AIMD/CUBIC/BBR ch6 · 迪菲–赫尔曼/证书/TLS 握手 ch7 · 往返/CDN/0-RTT ch8.

## Checked / not checked

Checked:
- `node tech/networks/how-a-web-page-arrives/tests/models.cjs`: every number the prose states is recomputed from `models.js` and asserted in the copy; closed forms checked against simulation (flow shop vs direct store-and-forward; Dijkstra vs brute force for all single breaks; M/M/1/K vs seeded simulation; ARQ mean sends vs 1/(1−p)²; DH agreement and primitive roots for every listed prime); all keys used by the page exist; say-template placeholders are all supplied; no Chinese outside copy.zh.js except the static title/description and 中; quoted site page titles match pages.config.js; REGISTRY anchors exist.
- `ESSAY_BASE_URL=http://127.0.0.1:18961 node …/tests/browser.cjs`: zh at 1280/390/320 (no overflow, no clipped text, targets ≥ 48 px, no errors), language toggle without copy.en.js, keyboard (slider arrow, button Enter), each model driven to its extremes with every live sentence checked for unfilled placeholders/NaN, reduced motion (end states, no moving packets, no smooth scroll).
- Canvas sweep (`tests/canvas-text-overlap.cjs --sweep`), see report.
- Screenshots of every figure at 1280, 390, 320 and reduced motion were looked at; live sentences were read at control extremes (probe in `/tmp/agent-tasks/essays/how-a-web-page-arrives/probe.cjs`).

Not checked:
- English: copy.en.js does not exist yet; English layout and CJK leaks are tested by browser.cjs once it does.
- Screen-reader output was not listened to; only accessible names and `aria-live` regions were checked in the DOM.
- The Corning datasheets and the NIST PDF were not read directly (see table).
- No independent review yet.
