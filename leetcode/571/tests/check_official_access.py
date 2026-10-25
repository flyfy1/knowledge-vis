"""Repeat the public source probe; not a solution test.

OUTPUT_DIR=/tmp/571-access python3 -B leetcode/571/tests/check_official_access.py
Without OUTPUT_DIR, prints results without writing files.
"""

import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request


def main():
    provenance = Path(__file__).resolve().parents[1] / "provenance"
    request_body = (provenance / "graphql-request.json").read_bytes()
    endpoint = "https://leetcode.com/graphql/"
    request = urllib.request.Request(
        endpoint,
        data=request_body,
        headers={
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com/problems/find-median-given-frequency-of-numbers/",
            "User-Agent": "Mozilla/5.0",
        },
    )
    report = {
        "verifiedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "endpoint": endpoint,
        "authentication": "None; public request, no credentials used",
    }
    try:
        with urllib.request.urlopen(request, timeout=40) as response:
            body = response.read()
            report["status"] = response.status
    except urllib.error.HTTPError as error:
        body = error.read()
        report["status"] = error.code
    except Exception as error:
        body = b""
        report["error"] = str(error)
    try:
        question = json.loads(body).get("data", {}).get("question")
        report["questionFrontendId"] = question.get("questionFrontendId") if question else None
        report["statementAvailable"] = bool(question and question.get("content"))
        report["interfacesAvailable"] = bool(question and question.get("codeSnippets"))
    except (ValueError, AttributeError):
        report["parseError"] = "No readable question JSON"
    if os.environ.get("OUTPUT_DIR"):
        output = Path(os.environ["OUTPUT_DIR"])
        output.mkdir(parents=True, exist_ok=True)
        (output / "graphql-request.json").write_bytes(request_body)
        (output / "graphql-response.txt").write_bytes(body)
        (output / "graphql-access.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
    return 0 if report.get("statementAvailable") and report.get("interfacesAvailable") else 2


if __name__ == "__main__":
    raise SystemExit(main())
