"""Capture public official access only; never reads credentials or authenticates.

Rerun from the repository root with OUTPUT_DIR=/tmp/471-access python3 -B
leetcode/471/tests/check_official_access.py. Results describe access, not acceptance.
"""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request


OFFICIAL = "https://leetcode.com/problems/encode-string-with-shortest-length/"
QUERY = """query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId title titleSlug isPaidOnly content translatedContent
    exampleTestcases sampleTestCase metaData
    codeSnippets { lang langSlug code }
  }
}"""


def main():
    output = Path(os.environ.get("OUTPUT_DIR", Path(__file__).parent / "evidence"))
    output.mkdir(parents=True, exist_ok=True)
    payload = {"query": QUERY, "variables": {"titleSlug": "encode-string-with-shortest-length"}}
    (output / "graphql-request.json").write_text(json.dumps(payload, indent=2) + "\n")
    result = {"verifiedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
              "officialSource": OFFICIAL, "access": "public unauthenticated; no credentials read",
              "observations": {}}
    for name, url, data in [("official-page", OFFICIAL, None),
                            ("graphql", "https://leetcode.com/graphql/", json.dumps(payload).encode())]:
        request = urllib.request.Request(url, data=data, headers={
            "User-Agent": "Mozilla/5.0", "Content-Type": "application/json", "Referer": OFFICIAL})
        try:
            with urllib.request.urlopen(request, timeout=40) as response:
                body, status = response.read(), response.status
            suffix = "json" if name == "graphql" else "html"
            (output / f"{name}-response.{suffix}").write_bytes(body)
            observed = {"url": url, "httpStatus": status, "bytes": len(body)}
            if name == "graphql":
                question = json.loads(body).get("data", {}).get("question")
                observed["question"] = question
                observed["contractAvailable"] = bool(question and question.get("content") and question.get("codeSnippets"))
            else:
                text = body.decode("utf-8", errors="replace")
                observed["premiumPromptFound"] = any(phrase in text for phrase in
                    ["Subscribe to unlock", "To view this question you must subscribe to premium"])
            result["observations"][name] = observed
        except (urllib.error.URLError, TimeoutError) as error:
            result["observations"][name] = {"url": url, "error": str(error)}
    result["status"] = "contract-available-needs-human-verification" if result["observations"].get("graphql", {}).get("contractAvailable") else "blocked"
    (output / "access-results.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
