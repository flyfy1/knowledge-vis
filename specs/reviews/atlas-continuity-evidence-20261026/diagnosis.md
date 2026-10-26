# Cumulative-test loading failure investigation

Observed red feedback (actual browser suites): concurrently running atlas/motion/rates/response/travel plus continuity produced missing `.source-note`/opener, three `Cannot read properties of undefined (reading update)` errors, and a frequency lesson with only its untranslated skeleton. Travel and continuity completed green. All model/syntax checks passed. These errors were NOT counted as acceptance. No production failure is alleged.

Ranked falsifiable hypotheses BEFORE targeted probe:
1. Local server/browser resource or transport concurrency: unrelated unchanged scripts fail during a burst. Prediction: failed network loads/HTTP responses cluster at concurrent6 versus serial1; fresh sequential runs load complete runtimes.
2. File-copy timing during tests: the second guard-protected apply copied app/index/style while other suites had started. Prediction: partial-body/hash mismatch at copy time; an unwritten stable tree should stop failures. No runtime mutation will happen during the probe.
3. Actual startup regression in the new app/HTML: prediction: repeatable failure even serially, despite complete200 responses matching disk resources; error precedes route interaction. Requires code fix if confirmed.

Next: instrument local pages only, record requestfailed/status/resource lengths/errors and loaded globals in serial and burst contexts. Then rerun the original failing suites one at a time. No broad debug logging or framework changes; no external credentials/network required. This is the diagnosing-bugs skill's red-feedback→minimal probe→hypothesis protocol. Any unconfirmed cause stays labelled uncertain.

## Targeted result

Stable files, no writes: serial1 {'cases': 6, 'failures': 0}; batch6 {'cases': 12, 'failures': 9}. Failed batch requests explicitly report net::ERR_CONNECTION_RESET with decoded body size0, including unchanged motion/response scripts. A missing response-bridge load reproduces the same undefined.update symptom. Thus hypothesis1 (concurrency-dependent local transport failures) is supported; file-copy timing is not necessary, and a deterministic app startup bug is not supported by the serial evidence. Exact Python/kernel/proxy reset mechanism is not established.

Test mitigation: do not overlap cumulative browser suites against this lightweight local server. Rerun the original complete suites serially, with all page errors still treated as failures. No error-suppression or production runtime workaround is added. This local test-service limit is distinct from application acceptance and no production-load claim follows.

An optional read-only command ps -p69578 -o pid,ppid,command was denied by the environment (operation not permitted). It was not retried. lsof confirmed the local Python listener; browser network evidence suffices, so this is not an implementation or acceptance blocker. No process/system settings were changed.
