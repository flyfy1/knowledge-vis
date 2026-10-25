# Official access self-check

Run on 2026-10-25; timestamp with timezone is in `access-result.json`.

Reproduce from repository root:

```sh
OUTPUT_DIR=/tmp/leetcode-711-access python3 -B leetcode/711/tests/check_official_access.py
```

`OUTPUT_DIR` separates reviewer outputs from this frozen evidence. This script makes ordinary public requests and reads no credentials. `official-graphql.json` is the exact response, including the visible sample inputs and method schema; it has no statement or code snippets. `official-page.html` is the direct HTTP 403 response. `official-web-reader.txt` records the separate web reader's Premium notice.

Metadata preflight command, executed from repository root:

```sh
python3 -B scripts/register_leetcode_lesson.py 711 --validate-only
```

Exit code: 2. Output: `metadata-preflight.txt`. Expected current blocker: no `lesson-entry.json`, because the official contract cannot be verified and no lesson candidate has been fabricated. No registration occurred. A future completed candidate must pass this preflight and undergo separate independent review.
