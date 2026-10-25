"""Capture only public official access; no cookies or credentials.
Rerun: OUTPUT_DIR=/tmp/716-official python3 -B leetcode/716/tests/capture_official.py
"""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

OUT = Path(os.environ.get("OUTPUT_DIR", Path(__file__).parent / "evidence"))
OUT.mkdir(parents=True, exist_ok=True)
URL = "https://leetcode.com/problems/max-stack/"
QUERY = "query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId questionFrontendId title titleSlug isPaidOnly content exampleTestcases codeSnippets { lang langSlug code } metaData } }"
payload = {"query": QUERY, "variables": {"titleSlug": "max-stack"}}
(OUT / "graphql-request.json").write_text(json.dumps(payload, indent=2) + "\n")
receipt = {"verifiedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "officialUrl": URL, "access": "Public requests without authentication, cookies, or credentials", "requests": []}
for name, url, data in [("official-page", URL, None), ("graphql-response", "https://leetcode.com/graphql/", json.dumps(payload).encode())]:
    headers = {"User-Agent": "Mozilla/5.0", "Referer": URL}
    if data is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        response = urllib.request.urlopen(req, timeout=30)
    except urllib.error.HTTPError as exc:
        response = exc
    body = response.read()
    suffix = ".json" if name == "graphql-response" else ".html"
    (OUT / (name + suffix)).write_bytes(body)
    receipt["requests"].append({"url": url, "status": response.status, "contentType": response.headers.get("Content-Type"), "file": name + suffix})
    if name == "graphql-response" and response.status == 200:
        question = json.loads(body).get("data", {}).get("question")
        if question:
            receipt["observed"] = {key: question.get(key) for key in ["questionFrontendId", "title", "isPaidOnly", "content", "codeSnippets"]}
            receipt["contractVerified"] = bool(question.get("content") and question.get("codeSnippets"))
(OUT / "access-receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
print(json.dumps(receipt, indent=2))
