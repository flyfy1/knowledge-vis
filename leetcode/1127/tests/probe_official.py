"""Capture ordinary unauthenticated official GraphQL access; never use credentials.

Rerun: OUTPUT_DIR=/tmp/1127-access python3 -B leetcode/1127/tests/probe_official.py
The output directory can be changed without altering this frozen record.
"""
import datetime
import json
import os
from pathlib import Path
import requests

QUERY = """query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly
    content translatedContent exampleTestcases sampleTestCase
    codeSnippets { lang langSlug code }
    mysqlSchemas
  }
}"""


def main():
    output = Path(os.environ.get("OUTPUT_DIR", Path(__file__).parent / "evidence"))
    output.mkdir(parents=True, exist_ok=True)
    payload = {"query": QUERY, "variables": {"titleSlug": "user-purchase-platform"}}
    response = requests.post("https://leetcode.com/graphql/", json=payload, timeout=30)
    raw = response.content
    status = response.status_code
    (output / "graphql-response.json").write_bytes(raw)
    (output / "graphql-request.json").write_text(json.dumps(payload, indent=2) + "\n")
    data = json.loads(raw)
    question = data.get("data", {}).get("question")
    summary = {
        "checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "officialSource": "https://leetcode.com/problems/user-purchase-platform/",
        "endpoint": "https://leetcode.com/graphql/",
        "access": "ordinary public request; no cookies or authorization headers",
        "httpStatus": status,
        "questionFrontendId": question.get("questionFrontendId") if question else None,
        "isPaidOnly": question.get("isPaidOnly") if question else None,
        "statementAvailable": bool(question and question.get("content")),
        "interfacesAvailable": bool(question and question.get("codeSnippets")),
        "graphqlErrors": data.get("errors", []),
    }
    summary["outcome"] = (
        "requires-contract-inspection"
        if summary["statementAvailable"] and summary["interfacesAvailable"]
        else "blocked"
    )
    (output / "access-result.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
