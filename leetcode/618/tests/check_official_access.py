"""Capture public official access, without credentials or paywall workarounds.

Run from the repository root:
OUTPUT_DIR=/tmp/618-access python3 -B leetcode/618/tests/check_official_access.py
"""

import datetime
import json
import os
from pathlib import Path
import requests


QUERY = """query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly difficulty
    content exampleTestcases codeSnippets { lang langSlug code }
  }
}"""


def main():
    output = Path(os.environ.get("OUTPUT_DIR", "/tmp/leetcode-618-access"))
    output.mkdir(parents=True, exist_ok=True)
    payload = {
        "query": QUERY,
        "variables": {"titleSlug": "students-report-by-geography"},
    }
    endpoint = "https://leetcode.com/graphql/"
    response = requests.post(endpoint, json=payload, timeout=30)
    body = response.content
    status = response.status_code
    (output / "official-graphql-response.json").write_bytes(body)
    response.raise_for_status()
    parsed = json.loads(body)
    question = parsed.get("data", {}).get("question")
    assert question and question["questionFrontendId"] == "618", parsed
    report = {
        "accessedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "officialSource": "https://leetcode.com/problems/students-report-by-geography/",
        "endpoint": endpoint,
        "method": "POST",
        "httpStatus": status,
        "access": "Public unauthenticated request; no credentials read or supplied",
        "request": payload,
        "statementAvailable": question.get("content") is not None,
        "interfacesAvailable": question.get("codeSnippets") is not None,
        "conclusion": (
            "Official statement and interfaces accessible; inspect before authoring"
            if question.get("content") and question.get("codeSnippets")
            else "Blocked: official statement or submission interfaces unavailable"
        ),
    }
    (output / "official-access-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
