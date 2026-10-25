"""Capture ordinary unauthenticated official access; never load credentials.

Rerun: OUTPUT_DIR=/tmp/leetcode-772-access python3 -B \
    leetcode/772/tests/check_official_access.py
Exit 2 means the official contract remains unavailable, not a solution failure.
"""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request


OFFICIAL = "https://leetcode.com/problems/basic-calculator-iii/"
GRAPHQL = "https://leetcode.com/graphql/"
QUERY = """query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly
    content exampleTestcases metaData
    codeSnippets { lang langSlug code }
  }
}"""


def main():
    out = Path(os.environ.get("OUTPUT_DIR", Path(__file__).parent / "evidence"))
    out.mkdir(parents=True, exist_ok=True)
    payload = {"query": QUERY, "variables": {"titleSlug": "basic-calculator-iii"}}
    report = {
        "accessedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "officialSource": OFFICIAL,
        "accessMode": "Public unauthenticated requests; no credentials or cookies loaded",
        "requests": [],
        "statementAvailable": False,
        "interfacesAvailable": False,
    }
    (out / "graphql-request.json").write_text(json.dumps(payload, indent=2) + "\n")
    for name, url, body in [("official-page", OFFICIAL, None),
                             ("official-graphql", GRAPHQL, json.dumps(payload).encode())]:
        headers = {"User-Agent": "Mozilla/5.0", "Referer": OFFICIAL}
        if body is not None:
            headers["Content-Type"] = "application/json"
        request = urllib.request.Request(url, data=body, headers=headers)
        entry = {"url": url, "method": request.get_method()}
        try:
            try:
                response = urllib.request.urlopen(request, timeout=30)
            except urllib.error.HTTPError as error:
                response = error
            with response:
                raw = response.read()
                entry.update(status=response.status, finalUrl=response.url)
            filename = name + (".json" if body is not None else ".html")
            (out / filename).write_bytes(raw)
            entry["responseFile"] = filename
            if body is not None:
                data = json.loads(raw)
                question = (data.get("data") or {}).get("question") or {}
                entry["observedQuestion"] = question
                report["statementAvailable"] = bool(question.get("content"))
                report["interfacesAvailable"] = bool(question.get("codeSnippets"))
        except (OSError, ValueError) as error:
            entry["error"] = f"{type(error).__name__}: {error}"
        report["requests"].append(entry)
    report["outcome"] = ("contract-available-for-review" if
                         report["statementAvailable"] and report["interfacesAvailable"]
                         else "blocked")
    (out / "access-report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"outcome": report["outcome"], "report": str(out / "access-report.json")}))
    return 2 if report["outcome"] == "blocked" else 0


if __name__ == "__main__":
    raise SystemExit(main())
