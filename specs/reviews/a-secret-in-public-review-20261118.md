# Review: computing/systems/a-secret-in-public (2026-11-18)

- Reviewer: Claude Code subagent (claude-fable-5-2), independent of the builder and the finishing agent.
- Scope: REVIEW-COMMON.md steps 1–7. **The review was cut short by the team lead (token budget) during step 4.**
  What was finished and what was not is listed at the end.
- **Verdict: not ready to register yet.** The prose, models and facts are in good shape and corrected; the
  English page fails the diagram layout check (labels outside the drawing at 390/320, one overlap at 1280), and
  the canvas sweep and the screenshot pass were not done.

## 1. First-read notes (Chinese, 1280, before reading BRIEF or code)

1. Ch3: the paragraph after the model began "这就是中间人攻击" with nothing on screen showing it (the default
   state is the honest exchange). Fixed: it now says what you see after ticking "Mallory 在中间".
2. Ch3: the man-in-the-middle diagram sits after the model, but its caption said "下面模型". Fixed (上面 / above).
3. Ch5: the curve equation is followed directly by the model; the addition rule is only in the "how" line, and
   O (the point at infinity) is used in the prose before it is named. The ladder diagram reads k from the lowest
   bit while chapter 2 reads from the highest, yet the prose calls them "the same algorithm". Not wrong; left.
4. Ch7 and ch10: the records text said all three 2026 factorizations used GPU CADO-NFS. For RSA-270 no source
   states the method. Fixed (see §3).
5. Ch9: "能解一般情形的 LWE … 至少和那些格问题一样难" was loose. Rewritten (see §2).

Smaller: the standards list in ch10 is not in date order (2026-10 before 2026-08); negative numbers use a
hyphen-minus; wrapped SVG labels lose the space between lines in `textContent` (visual rendering is fine, a
screen reader hears "thelist"). Not fixed.

## 2. Models re-derived (independent Python, `/tmp/agent-tasks/essays/review-a-secret-in-public/verify.py`)

All agree with models.js:
- modRing for every (n, a), n = 3…17: gcd, inverse, order, φ(n), generator, powers; order divides φ(n).
- 4^x mod 2039 for x = 1…1018 with squarings = bitlen − 1, multiplications = popcount − 1; order of 4 is 1019.
- Safe primes 8–40 bits (largest below 2^bits checked up to 26 bits); BSGS finds x, steps ≤ 2√q (1,305 at 20 bits).
- DH 1,027 / 265 / 294; Eve 42 steps; MITM 534 / 1,735 / 60 / 212.
- RSA 56,153 / 55,680 / e 257 / d 5,633 / c 16,748 / s 12,763; tamper gives 200; 116 trial divisions.
  Cube root: n 512 bits (154 digits), m 95 bits, m³ 283 bits (86 digits), padded 488 bits.
- Curves: point counts by Legendre symbol for every p on the slider, Hasse, order of G; p = 97: N = 100,
  G = (0, 10) order 50, 23G = (49, 34); double-and-add operations = bitlen − 1 + popcount − 1 (7 for k = 23);
  every row of the ladder diagram. Real curve sum (0.72, −0.97), slope −0.35.
- GNFS formula at 12 sizes (63.9 … 269.4), rho, Grover 63.65, 17.6 s for 512 bits at 10^18/s.
- Shor: every N on the slider, success share recomputed; minimum 51.7 % (≥ 1/2 holds; N = 143: 90/118 = 76 %).
  "At least one half" is the correct bound for two primes.
- Lattice: det 44 for every tilt; Babai success with an independent brute-force CVP 92 / 54 / 21 / 9 / 6 %.
- LWE: b = A·s + e holds; **exact** per-key failure probability by convolving the subset-sum distribution:
  default key 0.439 % (page's normal approximation 0.48 %, simulation 8/2000 = 0.40 %). Over 48 settings the
  simulation is within |z| 1.94 of the exact value; the normal approximation is off by up to 1.2 percentage
  points mid-range and by a factor of ~6 in a far tail (0.047 % vs 0.008 %). The page now says the prediction
  is a normal approximation, good to an order of magnitude when the probability is small.
- ML-KEM sizes and hybrid shares 1,216 / 1,120.

Ch9 LWE wording, final:
- zh: "Regev 证明了：谁能解随机生成的 LWE 实例（平均情形），谁就能用量子算法解任何一个格上的近似最短向量问题（最坏情形）。在这个意义上，LWE 不比那些格问题容易。要注意两点：这个归约只有一个方向，没有说两者等价；它只对足够大的噪声成立，ML-KEM 这类实际参数的安全性是按已知最好的攻击估算的，不是由这条定理保证的。"
- en: the same, in `ch9.p2`.

Not changed: ML-KEM-768 failure probability "约 2^−164" comes from draft-cfrg-schwabe-kyber-04; I believe
FIPS 203 Table 1 gives 2^−164.8 but could not extract the PDF text to confirm.

## 3. Facts spot-checked (opened 2026-11-18)

| Fact | Source opened | Result |
|---|---|---|
| RSA-260: 3 Sep 2026, Eric Lu, Devin, ~4,900 GPU-days, record | cognition.com/blog/factoring-rsa-260 (factors found 2026-09-03 01:48 UTC; "prepared and run using Devin"; "about 4,900 GPU-days"); Wikipedia RSA numbers | confirmed |
| RSA-896: 19 Sep 2026, Stephen A. Weis | saweis.net/posts/rsa-896.html; Wikipedia; postquantum.com | confirmed. The post does **not** state his employer; it says the compute ran "at Anthropic", "up to 2048 GPUs", "10-day period", "about 30 GPU-years", Claude "was used to port CADO-NFS to run on GPUs" and "orchestrated" the run. It does not use the word record. "Member of technical staff at Anthropic" is from postquantum.com only. |
| RSA-270: 12 Nov 2026, Eric Lu | Wikipedia only. mersenneforum returned 403 again (curl, WebFetch and a real browser: Cloudflare challenge); no Wayback copy; archive.today's only capture predates the post; a web search found no other report | **secondary source only**; the page says so. Wikipedia gives no method or compute. |
| Factors | multiplied back myself from Wikipedia's wikitext and from the authors' pages: RSA-250, 260, 270, 896 all p·q = N, both factors pass Miller–Rabin; RSA-896 (896 bits) > RSA-270 (895 bits); no larger challenge number is listed as factored | confirmed |
| EO 14412 | Federal Register 2026-12909 (25 Jun 2026) and presidency.ucsb.edu: HVAs and high impact systems, excluding NSS, key establishment by 31 Dec 2030, signatures by 31 Dec 2031 | confirmed from the order itself |
| OMB M-26-15 | not found; described only through NIST IR 8547 | page now says it was not opened |
| NIST IR 8547 final, 27 Oct 2026 | csrc page + PDF text: deprecated after 2030 / disallowed after 2035; ML-KEM-768 default; "A FIPS that specifies HQC-KEM is under development"; hybrid §3.2 | confirmed (English quote corrected to "under development") |
| NSA CNSA 2.0 FAQ v2.2, Oct 2026 | PDF via Wayback: 1 Jan 2027, 31 Dec 2030, 31 Dec 2031, ML-KEM-1024 / ML-DSA-87, "FN-DSA is not available yet", "will not require NSS developers to use hybrid certified products for security purposes" | confirmed |
| 18-state joint statement, 27 Nov 2024 | BSI PDF (text decoded from the font maps): "latest by the end of 2030"; "strongly recommend to deploy PQC in hybrid solutions for most use-cases"; 18 member states | confirmed |
| EU roadmap v1.1 | PDF: 31.12.2026 / 31.12.2030 / 31.12.2035, low-risk "as much as feasible" | confirmed |
| Round-3 signatures, HAWK | NIST page (updated 13 Oct 2026): withdrawn by the submission team | confirmed |
| Microsoft 18 Nov 2025 | techcommunity post: GA in Windows Server 2025, Windows 11 (24H2, 25H2), .NET 10 | confirmed |
| Signal | pqxdh post 19 Sep 2023; spqr post 2 Oct 2025, Triple Ratchet | confirmed |
| OpenSSH 10.0 | release notes: 2025-04-09, mlkem768x25519-sha256 default | confirmed |
| SIKE / Rainbow / Chen | ePrint 2022/975 (ten minutes, single core, SIKEp434), 2022/214 (53 hours, laptop), 2024/555 (step 9 bug, note of 18 April) | confirmed |
| Speeds and sizes table | Cloudflare pq-2024: every figure matches; source adds a warning on FN-DSA signing (floating point) | confirmed; caption now says single source and carries the warning |

Not re-opened by me: FIPS 206 status, Cloudflare 70 % / 15 %, browser versions, RFC 10024, GRI survey, the two
arXiv estimates, NCSC dates, Apple pages, FIPS 203 text.

## 4. Self-interest disclosure: final wording (for the owner to confirm)

In `fx.records` (chapter 10). The three 2026 items now have the same form: who, date, what was used according to whom.

zh:
> RSA-260（862 位）：2026 年 9 月 3 日，Eric Lu。按 Cognition 公司博客上他署名的文章，用的是一个为 GPU 新写的数域筛实现（维基百科称它是大幅修改过的 CADO-NFS），由该公司的 AI 编程工具 Devin 准备并运行，约 4,900 GPU 日。RSA-896（896 位）：2026 年 9 月 19 日，Stephen A. Weis。按他本人的帖子，Claude 被用来把 CADO-NFS 移植到 GPU 上并调度运行，计算在 Anthropic 进行，最多 2,048 块 GPU，历时 10 天，约 30 GPU 年。它是目前公开分解过的最大的 RSA 挑战数（帖子本身没有用“纪录”一词）。RSA-270（895 位）：2026 年 11 月 12 日，Eric Lu。这一条只有二手来源：维基百科引的是他在 mersenneforum 的帖子，原帖我两次都没能打开，方法和计算量我也没有查到。它比 RSA-896 短 1 位，不是新纪录。计算量都是作者自己报的数，我没有找到第三方的复算；因子不需要信任谁：我核对过，三组公布的因子都是质数，相乘都等于对应的 RSA 挑战数。**利害关系：本页由 Claude 写成，Claude 是 Anthropic 的产品；按作者的帖子，RSA-896 的计算用了 Claude，并在 Anthropic 进行。**

en:
> … **Disclosure of interest: this page was written by Claude, which is made by Anthropic; according to the author's post, the RSA-896 computation used Claude and ran at Anthropic.**

The earlier text said "Anthropic 公司的 Stephen Weis" and "Anthropic 的员工"; his post does not say that, so the
page no longer does. Chapter 7 (`ch7.p4`) now attributes the RSA-1024 statement to "the same post", calls it
his judgement, and points to the chapter 10 disclosure.

## 5. Other changes made

- `ch7.rec.*`, `ch7.p3`, `ch7.p4`: authors named on all three rows; RSA-270 marked "per Wikipedia", method removed.
- `fx.ir8547`, `ch8.limit`: EO 14412 described from the order (civilian HVAs and high impact systems, NSS excluded); M-26-15 marked as not opened; the causal "所以" replaced by "the order matches".
- `ch10.merit.cap`: speeds have a single source; FN-DSA caveat.
- Footer: EO 14412 added; Wikipedia marked secondary.
- Links to the unregistered drafts are now plain text in both languages (`ch3.p4`, `ch8.p1`, `ch11.links`), with
  the drafts' own titles: 《网页是怎么来到你手机上的》 / "How a Web Page Reaches Your Phone" (its REGISTRY.json;
  it has no copy.en.js), 《量子计算机到底能做什么》 / "What Quantum Computers Can Actually Do".
- Titles of external works are `<cite>` in both languages; CSS makes them italic in English and upright in Chinese.
- Dates: `u.ym` en is `{mon} {y}` and the formatter uses long month names ("August 2024").
- English: mistranslations fixed in `ch8.p3` (256-bit sentence), `ch9.p2` (garbled reduction sentence),
  `ch2.law`, `ch2.mod.p2`, `ch2.modelB.how`, `ch5.modelA.how`, `ch7.say.both`, `ch7.say.qsym`, `ch9.p3`,
  `dg.ladder.hsum`, "Mosca's inequality", the HQC quotation.
- `tests/browser.cjs`: the width loop now runs in zh and en; English adds no-CJK checks (DOM text, aria/title
  attributes, document title, meta description, every string drawn on a canvas), date format, italic titles,
  drafts not linked; the toggle block checks the switch to English and the canvas redraw.

## 6. Test output

- `node computing/systems/a-secret-in-public/tests/models.cjs` → `4321/4321 checks passed` (4 fewer than before: the four removed draft links).
- `node computing/systems/how-a-computer-boots/tests/models.cjs` → `PASS: 7187 checks`.
- copy.zh.js / copy.en.js: 564 keys, identical order.
- `tests/browser.cjs` (one run, after the edits): **fails in English only**:
  - `en 1280: diagrams: shor: "Only this st" overlaps "The other st"`
  - `en 390` and `en 320`: labels outside the drawing in `clock` ("Back to 1 at s…"), `rsa` ("Public: everyo…"),
    `ladder` ("bit of k"), `chain` ("The site certi…"), `shor` ("The other step…").
  - Chinese at all three widths, the no-CJK checks, date format, the model drive and reduced motion reported no failure in that run.

## 7. Left undone (review stopped here)

- **English diagram labels** above: need shorter strings or wrap widths in `DG.*`. Not fixed. My new
  "Add when bit is 1" header in `ladder` was never looked at.
- `tests/canvas-text-overlap.cjs --sweep` was **not run** in either language.
- No screenshot of any diagram or model was looked at (shots were saved to the scratch dir by the test run but
  not opened); the 390/320 look of the clock and DH diagrams is unchecked; the wider "September 2026" date chips
  and the longer record rows were not looked at.
- Keyboard operation, focus visibility and extremes of every control were not driven by me.
- `tests/models.cjs` has no English checks (placeholder and tag parity between the two copy files, pinned English numbers).
- REGISTRY.json not reviewed. The registrar must link the two draft titles once those pages are registered.
- Server on 19025 stopped. Originals of every file I changed are in `/tmp/agent-tasks/essays/review-a-secret-in-public/orig/`.
