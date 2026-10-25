"""Record unauthenticated official access. OUTPUT_DIR redirects generated evidence."""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

OUT = Path(os.environ.get("OUTPUT_DIR", Path(__file__).parent / "evidence"))
OUT.mkdir(parents=True, exist_ok=True)
OFFICIAL = "https://leetcode.com/problems/design-in-memory-file-system/"
PAYLOAD = {
    "query": """query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug difficulty isPaidOnly
    content translatedContent exampleTestcases sampleTestCase metaData
    codeSnippets { lang langSlug code }
  }
}""",
    "variables": {"titleSlug": "design-in-memory-file-system"},
}
(OUT / "graphql-request.json").write_text(json.dumps(PAYLOAD, indent=2) + "\n")
summary = {
    "checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "officialUrl": OFFICIAL,
    "authentication": "Public unauthenticated requests; no credentials read or used.",
}
for name, url, data in [
    ("official-page", OFFICIAL, None),
    ("graphql", "https://leetcode.com/graphql/", json.dumps(PAYLOAD).encode()),
]:
    request = urllib.request.Request(url, data=data, headers={
        "User-Agent": "Mozilla/5.0", "Content-Type": "application/json", "Referer": OFFICIAL,
    })
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body, status = response.read(), response.status
        suffix = "json" if name == "graphql" else "html"
        filename = f"{name}-response.{suffix}"
        (OUT / filename).write_bytes(body)
        summary[name] = {"url": url, "httpStatus": status, "bodyFile": filename}
        if name == "graphql":
            question = json.loads(body).get("data", {}).get("question")
            summary["observed"] = question
            summary["contractAvailable"] = bool(question and question.get("content") and question.get("codeSnippets"))
    except urllib.error.HTTPError as error:
        filename = f"{name}-error-body.txt"
        (OUT / filename).write_bytes(error.read())
        summary[name] = {"url": url, "httpStatus": error.code, "error": str(error), "bodyFile": filename}
    except Exception as error:
        summary[name] = {"url": url, "error": f"{type(error).__name__}: {error}"}
(OUT / "access-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
print(json.dumps(summary, indent=2))
