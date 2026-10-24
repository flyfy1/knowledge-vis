"""Capture anonymous official access; never reads credentials or bypasses a paywall.

Rerun: OUTPUT_DIR=/tmp/lc431-access python3 -B leetcode/431/tests/check_official_access.py
"""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

DEST = Path(os.environ.get("OUTPUT_DIR", Path(__file__).resolve().parents[1] / "provenance"))
DEST.mkdir(parents=True, exist_ok=True)
URL = "https://leetcode.com/problems/encode-n-ary-tree-to-binary-tree/"
QUERY = """query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionFrontendId questionId title titleSlug difficulty isPaidOnly
    content exampleTestcases sampleTestCase metaData
    codeSnippets { lang langSlug code }
  }
}"""
payload = {"query": QUERY, "variables": {"titleSlug": "encode-n-ary-tree-to-binary-tree"}}
(DEST / "graphql-request.json").write_text(json.dumps(payload, indent=2) + "\n")
request = urllib.request.Request(
    "https://leetcode.com/graphql/", data=json.dumps(payload).encode(),
    headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
)
record = {"verifiedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
          "officialSource": URL, "endpoint": request.full_url,
          "access": "Anonymous public request; no cookies, authorization, or credentials."}
try:
    with urllib.request.urlopen(request, timeout=30) as response:
        raw = response.read()
        record["httpStatus"] = response.status
    (DEST / "graphql-response.json").write_bytes(raw)
    decoded = json.loads(raw)
    question = (decoded.get("data") or {}).get("question") or {}
    record["observed"] = question
    record["contractAccessible"] = bool(question.get("content") and question.get("codeSnippets"))
    record["conclusion"] = (
        "Statement and snippets returned; manual contract verification required."
        if record["contractAccessible"] else
        "Blocked: official statement and/or submission snippets unavailable; do not infer contract."
    )
except (urllib.error.URLError, ValueError) as error:
    record["contractAccessible"] = False
    record["error"] = str(error)
    record["conclusion"] = "Blocked: public official request failed."
(DEST / "access-check.json").write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n")
print(json.dumps({key: record[key] for key in ("verifiedAt", "contractAccessible", "conclusion")}, indent=2))
