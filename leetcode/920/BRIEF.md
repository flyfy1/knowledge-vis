# #920 · Number of Music Playlists — author brief

Written before implementation. Category computing / LeetCode; stage university.
Audience: readers who know loops and multiplication, learning counting DP.
Smallest outcome: reconstruct why two legal prefixes with the same length and
number of used songs have identical extension counts, then implement the official
Python callable. Learning loop: hand-count → group → step/reverse → predict → code.

Product verdict: reuse the approved collection lesson pattern. Product/design
review and dispatcher adjudication: specs/reviews/leetcode-all-hard-design-review.md.
Also follows WORKFLOW, UI-I18N-SPEC, explainers, hard traces, review gates, and
rendered-state contract. No new shared renderer, registry edit or deployment.
Independent lesson review is still pending; author checks do not replace it.

## Official contract and provenance
Official URL: https://leetcode.com/problems/number-of-music-playlists/
Accessed 2026-10-25 via public page and public GraphQL. Raw capture:
provenance/official.json (timestamp, query, full statement and codeSnippets).
Frontend ID 920; internal questionId 956 is not the displayed problem number.
Public, not paid. n different labeled songs; goal ordered plays; every song must
appear; repeats require k intervening songs; answer modulo 1,000,000,007.
0 <= k < n <= goal <= 100, so no empty input is legal. Official examples:
(3,3,1) → 6, (2,3,0) → 6, (2,3,1) → 2.
Observed Python3 interface: class Solution, numMusicPlaylists(self, n: int,
goal: int, k: int) -> int. Python preferred and faithful; no language exception.
No mutation or identity requirement; scalar integer inputs and result.

## Exact reused token contract
Shared style.css palette: --bg #0d1117; --panel #161b22; --panel2 #1c2330;
--line #2b3547; --text #e8edf4; --muted #9aa7b8; --accent #6ee7ff;
--accent2 #ffb454; --good #7ee2a8; --bad #ff7a93. Shared system font stack,
body line height 1.75, h1 clamp(28px,5vw,46px), h2 clamp(23px,3.5vw,32px),
952px content, 24/16px gutters, 14px stage and 8px control radii.
Local geometry uses shared values; 48px controls and 3px focus, no animation.
Disabled controls use solid shared muted/panel2, not opacity. Zero external assets.

## Priority and state scope
P0 / highest-return 20%: causal worked example, count table with source values,
reversible transitions, faithful Python, bilingual labels and readable phones.
P1: all presets, native clipboard/fallback parity, keyboard and contrast evidence.
P2: none. Deferred: user-sized 100x100 animation (obscures mechanism); audio
(unnecessary for counting); arbitrary playlist editor (separate interaction scope).
No loading/auth/reconnect states: static local page. Clipboard success/fallback,
initial/middle/end, selected/revealed/changed answers, both locales are applicable.

## Step plan — five required fields each
| Step | Already known | Single question | Input → sought quantity | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|0|Two labeled songs A/B|Which three-play lists work?|n=2,goal=3,k=1 → count|Reveal all eight candidates; only ABA/BAB survive|Order matters; all songs and cooldown required|
|1|Legal playlists|Why not enumerate?|Same case → correct baseline and repeated work|Read enumerator, compare k=0 six with k=1 two|Exhaustive baseline only for tiny inputs|
|2|Counting prefixes|What information permits aggregation?|n,goal,k → dp[i][j]|Step one cell; inspect two source counts, multipliers, sum and retained table; reverse|Legal prefixes; last k positions distinct; exact small demo|
|3|Two extension classes|Can this state transfer?|Fresh n=3,goal=4,k=1 → full count|Select before reveal; change clears feedback; locale preserves|Independent of trace presets|
|4|Recurrence and invariant|How is it submitted and bounded?|Scalars → integer modulo M|Map shown transition to Python; copy/download|Official bounds; two rows, no trace storage in submission|

## First-use dependencies and definitions
- Step0: playlist = ordered sequence; n = available distinct songs; goal = number
  of plays; k = required intervening plays; modulo = remainder after division.
- Step1: baseline = explicitly enumerate candidates, filter validity; prefix =
  initial segment, allowed to omit songs until the end.
- Step2: dp[i][j] = number of legal length-i prefixes using exactly j labeled
  songs from all n. Dynamic programming = reuse those counts. New/replay classes
  partition extensions. Each step redefines its own symbols locally.
- Step3: restates dp meaning and cooldown. Step4: dp/nxt = previous/current row;
  i/j locally defined; time and space parameter meanings repeated.

## Derivation, invariant and failure mode
For n=2,k=1: dp[1][1]=2; dp[2][1]=0; dp[2][2]=2;
dp[3][2]=0*(2-2+1)+2*(2-1)=2. k=0 changes last multiplier to 2,
and dp[2][1] to 2, giving 2*1+2*2=6. Wrong fixed (n-k) branching
counts AAA/BBB when k=0 and forgets coverage: 2^3=8, desired 6.
Invariant: each dp cell counts exactly the legal prefixes of that length and
used count, with no duplicates. Delete final song to partition new vs reused;
new songs have n-j+1 identities, reused songs have max(j-k,0) choices.
Last min(i,k) positions of a legal prefix are distinct. If j<k there are no
replays; reachable such prefixes have i=j. Labels/history need not be retained
because the number of available choices is identical within each source class.
Base dp[0][0]=1; impossible cells zero. Induction and unique deletion prove
recurrence, and selecting dp[goal][n] enforces coverage. Modular arithmetic
preserves addition/multiplication; no floating point in canonical source.

## Simulation and limits
Browser trace is a JavaScript simulation, never execution of solution.py. All
small preset cells retained; no omitted transitions. A frame is after computing
one dp cell. Future cells show ?; impossible row-zero cells are known zero.
Submission uses two O(n) rows; educational deep snapshots use O((goal*n)^2)
integer cells in worst case and are bounded to tiny presets. No timers.
Canonical costs O(goal*n) modular arithmetic operations, O(n) cells; baseline
O(goal*n^goal) time, O(goal+n) auxiliary space with streamed candidates.
Tests independently enumerate small strings, check prefix buckets and boundary
closed forms/inclusion-exclusion; browser matrix and evidence recorded locally.
