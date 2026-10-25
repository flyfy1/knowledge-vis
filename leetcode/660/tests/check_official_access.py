"""Capture public official access only. Rerun with OUTPUT_DIR=/tmp/660-access."""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

OUT = Path(os.environ.get("OUTPUT_DIR", Path(__file__).parent / "evidence"))
OUT.mkdir(parents=True, exist_ok=True)
URL = "https://leetcode.com/problems/remove-9/"
QUERY = """query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly difficulty
    content exampleTestcases sampleTestCase metaData
    codeSnippets { lang langSlug code }
  }
}"""


def capture(name, url, payload=None):
    headers = {"User-Agent": "Mozilla/5.0", "Referer": URL}
    data = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(payload).encode()
    request = urllib.request.Request(url, data=data, headers=headers)
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    try:
        response = urllib.request.urlopen(request, timeout=40)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        body = response.read()
        status = response.status
        (OUT / name).write_bytes(body)
    return {"url": url, "accessedAt": started, "httpStatus": status,
            "bodyFile": name, "request": payload}, body


records = []
page, _ = capture("official-page.html", URL)
records.append(page)
graphql, body = capture("official-graphql.json", "https://leetcode.com/graphql/",
                        {"query": QUERY, "variables": {"titleSlug": "remove-9"}})
records.append(graphql)
question = json.loads(body).get("data", {}).get("question")
assert question and question["questionFrontendId"] == "660", "Unexpected official response"
summary = {
    "problemId": 660,
    "officialSource": URL,
    "requests": records,
    "observed": {
        "paidOnly": question["isPaidOnly"],
        "statementAvailable": question["content"] is not None,
        "languageSnippetsAvailable": question["codeSnippets"] is not None,
        "rawSampleInputs": question["exampleTestcases"],
        "metadata": json.loads(question["metaData"]),
    },
    "scope": "Unauthenticated public official requests; no cookies or credentials used.",
}
summary["blocked"] = not (summary["observed"]["statementAvailable"] and
                           summary["observed"]["languageSnippetsAvailable"])
(OUT / "access-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
print(json.dumps(summary, indent=2))
