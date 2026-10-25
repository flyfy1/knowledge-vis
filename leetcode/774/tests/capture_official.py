"""Capture public official access evidence; never reads credentials or cookies.

Run from the repository root. Set OUTPUT_DIR to preserve the frozen evidence.
This is an access probe, not an algorithm or lesson acceptance test.
"""
import datetime
import json
import os
from pathlib import Path
import requests

DEST = Path(os.environ.get("OUTPUT_DIR", Path(__file__).parent / "evidence"))
DEST.mkdir(parents=True, exist_ok=True)
QUERY = """query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly
    content translatedContent exampleTestcases sampleTestCase metaData
    codeSnippets { lang langSlug code }
  }
}"""
payload = {"query": QUERY, "variables": {"titleSlug": "minimize-max-distance-to-gas-station"}, "operationName": "questionData"}
(DEST / "graphql-request.json").write_text(json.dumps(payload, indent=2) + "\n")
url = "https://leetcode.com/graphql/"
record = {"requestedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "url": url,
          "method": "POST", "authentication": "Unauthenticated public request; no cookies or credentials"}
try:
    response = requests.post(url, json=payload, timeout=30)
    body = response.content
    record["httpStatus"] = response.status_code
    (DEST / "graphql-response.json").write_bytes(body)
    response.raise_for_status()
    question = json.loads(body).get("data", {}).get("question")
    if question:
        record["observed"] = {key: question.get(key) for key in ("questionFrontendId", "isPaidOnly", "content", "translatedContent", "codeSnippets")}
        record["statementAndInterfaceAvailable"] = bool(question.get("content") and question.get("codeSnippets"))
except (requests.RequestException, ValueError) as error:
    record["error"] = str(error)
(DEST / "access-result.json").write_text(json.dumps(record, indent=2) + "\n")
print(json.dumps(record, indent=2))
