# Hard catalog drift audit — 2026-10-26

**The current public all-problems response contains 986 Hard problems, two more
than the frozen 984-problem campaign catalog.** Observed at **01:57:14 Singapore
(2026-10-25 17:57:14 UTC)** through exactly one ordinary unauthenticated GET to the
[official all-problems API](https://leetcode.com/api/problems/all/). HTTP 200;
response server date is 17:57:13 UTC, Cloudflare reports `DYNAMIC`. Although the
content-type header says HTML, the returned body parses as the expected JSON.

| Count | Frozen 2026-10-18 | Current response | Delta |
| --- | ---: | ---: | ---: |
| All returned/reported records | 4,086 / 4,086 | 4,095 / 4,095 | +9 |
| Hard (`difficulty.level == 3`) | 984 | 986 | +2 |
| Free Hard | 789 | 791 | +2 |
| Paid-only Hard | 195 | 195 | 0 |

Exact additions to the frozen Hard set:

| ID | Title | Official slug/link | Current access |
| --- | --- | --- | --- |
| 4091 | Count Magical Substring Pairs II | [count-magical-substring-pairs-ii](https://leetcode.com/problems/count-magical-substring-pairs-ii/) | Hard; `paid_only:false`; not hidden |
| 4095 | Count Frequency Staircase Subarrays II | [count-frequency-staircase-subarrays-ii](https://leetcode.com/problems/count-frequency-staircase-subarrays-ii/) | Hard; `paid_only:false`; not hidden |

**Removed frozen Hard IDs: none.** For every one of the original 984 IDs, the
current response still reports Hard, with identical title, slug and paid-only
flag. Thus there are no observed difficulty/access changes, title renames or slug
changes among the frozen Hard records. Frontend IDs are unique, and returned count
equals the API-reported total.

The retained baseline contains only normalized Hard records, not the full prior
all-problems response. Therefore “additions” means newly present in the compared
Hard set; this audit does not independently distinguish entirely new problems
from promotions of formerly non-Hard entries. The +9 all-record count is not a
verified enumeration of nine new IDs. No category endpoints or individual problem
statements were crawled; official links above are API-provided slugs, not claims
of per-statement/UI access verification.

## Reproducible evidence

- [Comparison JSON](comparison.json) contains both count sets, exact additions,
  empty removal/change arrays, timing, headers and source identities.
- [Compressed original response](official-all-response.json.gz) preserves the
  2,113,979 raw response bytes. SHA-256 after decompression:
  `71306d3fe7e0b11bb0b53dfa9c8d98da32c9f1bb5962a1acbdec1c210bcca532`.
- Baseline `leetcode/catalog/hard-problems.json` SHA-256:
  `fb4ac08e84b8825cd380cdac8ccb791f0e53ecf3660e7445b9ac623f43e85fb6`;
  snapshot `2026-10-18T08:59:47.124517+00:00`, prior raw-response hash
  `979b8216f2a4c48fcbc9f1a824eeb0a5bdca98d99c0ed6baa4714764a06f8e7a`.

Only this dated evidence directory was created. No catalog, queue, policy,
reservation, lane, worker, launch/import pin or publication state was changed.
The [campaign contract](../../leetcode-all-hard-campaign.md) explicitly targets the
finite **2026-10-18 snapshot of 984 problems**, not recurring catalog monitoring.
Keep that scope, the running queue and its frozen imports intact. This audit does
not expand the campaign to 986 or make catalog/queue adoption a current requirement.

Track #4091 and #4095 as a possible future extension outside the frozen snapshot.
Any selected extension would need separate scope adoption at a safe boundary,
preserving existing candidates and history; no such extension is enacted here.
Completion of all required work for the 984 dated records may support a claim of
**2026-10-18 snapshot coverage**, subject to the campaign's normal completion audit.
It must not be described as coverage of the current 986-problem catalog. These
scope-qualified claims preserve both the finite goal contract and the drift facts.
