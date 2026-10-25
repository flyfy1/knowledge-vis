"""Capture unauthenticated official access; OUTPUT_DIR keeps reruns separate."""
import datetime as dt
import json
import os
from pathlib import Path
import requests

OUT = Path(os.environ.get("OUTPUT_DIR", Path(__file__).parent / "evidence"))
OUT.mkdir(parents=True, exist_ok=True)
URL = "https://leetcode.com/problems/split-array-with-equal-sum/"
QUERY = """query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId title titleSlug isPaidOnly content exampleTestcases
    codeSnippets { lang langSlug code }
  }
}"""
payload = {"query": QUERY, "variables": {"titleSlug": "split-array-with-equal-sum"}}
report = {"checkedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
          "officialUrl": URL, "authentication": "none; no credentials read"}
for name, method, url, kwargs in (
    ("page", requests.get, URL, {}),
    ("graphql", requests.post, "https://leetcode.com/graphql/", {"json": payload}),
):
    try:
        response = method(url, timeout=30, **kwargs)
        filename = name + (".html" if name == "page" else ".json")
        (OUT / filename).write_text(response.text, encoding="utf-8")
        report[name] = {"url": url, "status": response.status_code, "body": filename}
        if name == "graphql":
            report[name]["request"] = payload
            question = response.json().get("data", {}).get("question")
            report[name]["observedQuestion"] = question
            report["contractAccessible"] = bool(question and question.get("content") and question.get("codeSnippets"))
    except (requests.RequestException, ValueError) as exc:
        report[name] = {"url": url, "error": str(exc)}
(OUT / "access-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, indent=2))
