# BRIEF — how-nginx-handles-ten-thousand-connections

Author: Antigravity, 2026-11-21. Task: W7 in Software Core Principles (`computing/software/how-nginx-handles-ten-thousand-connections/`).
Status: unregistered draft (`page.json` omits `"status"`). Both Chinese (`content.zh.md`) and English (`content.en.md`) are complete native prose (no stub flag).

## Pinned release & honest build-host note

- **Pinned release:** **Nginx `1.28.0` stable** (released 2025-04-23).
- **Files cited:** `src/core/ngx_connection.h`, `src/core/ngx_palloc.h`, `src/core/ngx_rbtree.h`, `src/core/ngx_cycle.c`; `src/os/unix/ngx_process_cycle.c`, `src/os/unix/ngx_linux_sendfile_chain.c`; `src/event/ngx_event.c`, `src/event/ngx_event_timer.h`, `src/event/modules/ngx_epoll_module.c`; `src/http/ngx_http_core_module.h`, `src/http/ngx_http_core_module.c`, `src/http/ngx_http_request.c`, `src/http/ngx_http_upstream_round_robin.c`, `src/http/modules/ngx_http_limit_req_module.c`.
- **Host environment caveat:** No native `nginx` binary is installed on this macOS build host (verified via `which nginx`). Accordingly, `tools/crosscheck.cjs` does not invoke an external `nginx` binary; it checks all C-derived scaling equations, `ngx_http_core_find_location` precedence rules across edge cases, exact Smooth Weighted Round-Robin (`ngx_http_upstream_get_peer`) sequence and zero-sum invariants, `ngx_http_limit_req_lookup` fixed-point leaky-bucket arithmetic (`excess = lr->excess - rate*ms/1000 + 1000`), red-black tree structural invariants (`rootIsBlack`, `noRedRed`, uniform `blackHeight`, `maxDepth <= 2*log2(N+1)`), and `sendfile()` vs `read()`+`write()` copy counts.

## One question

Once a minimal `nginx.conf` starts up, why does a server spawning one thread per connection collapse at ten thousand clients while a handful of single-threaded Nginx worker processes juggle all ten thousand sockets, pick exact routes, smooth upstream bursts, enforce millisecond rate limits, and reload config with zero dropped connections?

## Chapter ladder (11 chapters, 9 labs, 9 static SVG diagrams)

1. `#ch1` **The C10K cliff**: Thread-per-connection (`8 MiB` virtual stack reserve, `128 KiB` touched RSS + context-switch thrashing) vs Nginx preallocated `ngx_connection_t` (`232 B`) + 2×`ngx_event_t` (`104 B`) = `440 B/slot` + `4 KiB` active pool (`6.15 MiB` at 10k, 5% active). Lab: `ch1-model`; Diagram: `dg-c10k`; Code: `ch1-code`.
2. `#ch2` **Master–Worker & zero-downtime hot reload**: `SIGHUP` (`nginx -s reload`) & `USR2`/`WINCH`/`QUIT` inheritance of shared listening `fd=6`, new v2 workers accepting immediately while v1 workers drain in-flight responses (`0` dropped vs `26` dropped in hard restart). Lab: `ch2-model`; Diagram: `dg-reload`.
3. `#ch3` **Non-blocking event loop (`epoll`/`kqueue`) & `SO_REUSEPORT`**: `select`/`poll` `O(N)` bitmap copy/scan vs `epoll_wait` `O(active)` `rdllist`, `accept_mutex` default `off` since 1.11.3 (`EPOLLEXCLUSIVE` / `NGX_EXCLUSIVE_EVENT`), and `listen ... reuseport` per-worker listen queues. Lab: `ch3-model`; Diagram: `dg-epoll`.
4. `#ch4` **11-phase HTTP state machine & `location` precedence**: `ngx_http_phases` (`POST_READ`..`LOG`), `PREACCESS` before `ACCESS`, and `ngx_http_core_find_location` (`=` exact > longest prefix `^~` halt > `~`/`~*` regex in config order > longest prefix fallback), including the longer-plain-prefix (`/static/images/`) trap overriding shorter `^~ /static/`. Lab: `ch4-model`; Diagram: `dg-phases`.
5. `#ch5` **Per-request memory pools (`ngx_pool_t`) & buffer chains (`ngx_chain_t`)**: `80 B` `ngx_pool_t` header, 16-byte aligned `d.last` bump allocation up to `pool->max = min(poolSize - 80, 4095)`, `d.next` block chaining (`32 B` `ngx_pool_data_t` header), `pool->large` fallback, and single `ngx_destroy_pool()`. Lab: `ch5-model`; Diagram: `dg-pool`.
6. `#ch6` **Smooth Weighted Round-Robin (`SWRR`)**: `ngx_http_upstream_get_peer` adding `effective_weight` and subtracting `total` from the winner to preserve `sum(current_weight) === 0`, smoothing `{5, 1, 1}` into `[A, A, B, A, C, A, A]` (max streak `2` vs `5` naive) plus `+1/round` fault recovery. Lab: `ch6-model`; Diagram: `dg-swrr`.
7. `#ch7` **Rate limiting (`limit_req` leaky bucket)**: `ngx_http_limit_req_lookup` in `ngx_shm_zone_t` shared memory using `excess = lr->excess - rate*ms/1000 + 1000` (1 req = `1000`), `burst` queue vs `nodelay`, and `503` leaving `lr->excess` & `lr->last` untouched. Lab: `ch7-model`; Diagram: `dg-limit`.
8. `#ch8` **Red-black timer tree (`ngx_event_timer_rbtree`)**: Leftmost node sets `epoll_wait` timeout (`min_key - now`), `O(expired)` drain on wake, `<= 2*log2(N+1)` depth bound (`<= 26` at 10k), and `NGX_TIMER_LAZY_DELAY = 300 ms` skipping `85%` of small-packet re-insertions. Lab: `ch8-model`; Diagram: `dg-rbtree`.
9. `#ch9` **Zero-copy `sendfile()` & reverse-proxy `proxy_buffering`**: `sendfile` + `TCP_CORK` skipping user-space copies (`0 MiB` vs `32 MiB` CPU copy, `8` vs `1,024` syscalls on `16 MiB`), kTLS caveat for HTTPS, and `proxy_buffering on` freeing a `1 Gbps` backend in `134.2 ms` instead of pinning it for `67.1 s` (`500×` faster release). Lab: `ch9-model`; Diagram: `dg-sendfile`.
10. `#ch10` **Frontier (November 2026)**: Established (C10K 1999, `kqueue` 2001, `epoll` 2002, QUIC RFC 9000 / HTTP/3 RFC 9114), Already Built (Nginx `1.28.0` stable Apr 2025 with QUIC CUBIC RFC 9438; `1.30.0` stable Apr 14, 2026 adding HTTP/2 upstreams, ECH, 103 Early Hints, MPTCP; `1.31.7+` mainline 2026 fixing `quic_bpf` seamless reloads/binary upgrades; Cloudflare Pingora Rust proxy reporting ~70% less CPU & ~67% less memory via shared connection pools; Envoy C++ thread-per-core xDS mesh), Experimental/Claims (`io_uring` not stock default in upstream Nginx as of Nov 2026; kTLS requires matching kernel/OpenSSL; Pingora as library vs `nginx.conf`).
11. `#ch11` **Wrap-up**: 3 diagnostic `.qs` questions, `.sum`, live links to `[[how-the-os-talks-to-hardware]]`, `[[how-virtual-memory-works]]`, `[[how-a-nic-moves-packets]]`, `[[tcp-congestion]]`.

## Facts that will go stale (Frontier Ch10)

- Nginx `1.30.0` stable (released 2026-04-14) and `1.31.x` mainline (`1.31.7+` QUIC BPF reload fixes, 2026) changelog notes from nginx.org, checked Nov 2026.
- Stock upstream Nginx default event loop status (`epoll`/`kqueue` vs experimental `io_uring`) as of Nov 2026.
- Cloudflare Pingora production figures (~70% less CPU, ~67% less memory vs Cloudflare's legacy Nginx/OpenResty stack), from Cloudflare engineering reports.

## Tuned parameters

- `ch1`: `THREAD_COMMIT_KIB = 128` KiB, `CTX_SWITCH_US = 3.5` µs across `workers = 4` cores (illustrative scaling parameters).
- `ch2`: `TRIGGER = 500` ms, `HARD_RESTART_GAP_MS = 300` ms, `20` initial in-flight requests (`5` per worker).
- `ch3`: `selectUs = 0.8 + conns * 0.015 + active * 0.25`, `epollUs = 0.8 + active * 0.25` (illustrative per-tick cost model).
- `ch7`: `dtMs = 20` ms spike arrival interval.
- `ch8`: seeded deadlines across `[100, 1150]` ms (`mulberry32(20261121)`), 100 packet updates (`mulberry32(99173)`).
- `ch9`: `RW_CHUNK_KIB = 32`, `SENDFILE_MAX_CHUNK_MIB = 2`, `UPSTREAM_MBPS = 1000`.

## Checked / not checked

- **Checked:**
  - `node computing/software/how-nginx-handles-ten-thousand-connections/tools/diagrams.cjs` (9 SVGs generated).
  - `node scripts/build-pages.cjs computing/software/how-nginx-handles-ten-thousand-connections` (0 errors, draft warning expected, 385 keys/lang, 40 bindings).
  - `node scripts/build-pages.cjs --print-budgets computing/software/how-nginx-handles-ten-thousand-connections` (all labels <= 89% room).
  - `node computing/software/how-nginx-handles-ten-thousand-connections/tools/crosscheck.cjs` (118/118 comparisons passed).
  - `node computing/software/how-nginx-handles-ten-thousand-connections/tests/models.cjs` (all unit, binding, parity, hygiene, and alias-collision checks passed).
- **Not checked in this subagent build:**
  - Playwright / Chromium (`tests/browser.cjs`, `tests/canvas-text-overlap.cjs --sweep`) deferred to coordinator serial browser runner per series instructions.
  - Native `nginx` binary execution (not installed on host).
