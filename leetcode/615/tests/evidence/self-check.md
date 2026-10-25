# Author access check — 2026-10-25

This is author evidence, not independent review or acceptance.

Reproduce with installed Python `requests`:

```sh
OUTPUT_DIR=/tmp/leetcode-615-access python3 -B leetcode/615/tests/check_official_access.py
```

Actual final run (default lesson-local output) exited 0 and reported:

```json
{"httpStatus": 200, "isPaidOnly": true, "contentAvailable": false, "codeSnippetsAvailable": false}
```

The script captures request/response and UTC timestamp; its success means the
access check completed, not that the lesson contract is accessible. Earlier
standard-library HTTP access returned 403; the ordinary requests client returned
200 without authentication. No restricted content was recovered.

Mandatory non-mutating preflight executed from repository root:

```sh
python3 -B scripts/register_leetcode_lesson.py 615 --validate-only
```

Exit 2:

```text
Metadata validation failed: [Errno 2] No such file or directory: '/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/615/lesson-entry.json'
```

Metadata intentionally absent: no official contract or canonical interface has
been verified. No implementation, numerical/oracle tests, learner UI/browser
checks, deployment, LeetCode submission, or independent acceptance is claimed.

Only leetcode/615/ was written. No registry or campaign records were changed.
