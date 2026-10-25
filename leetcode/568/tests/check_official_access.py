"""Capture normal public official access; OUTPUT_DIR keeps reruns separate."""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request


def main():
    lesson = Path(__file__).resolve().parents[1]
    output = Path(os.environ.get("OUTPUT_DIR", str(lesson / "tests" / "output")))
    output.mkdir(parents=True, exist_ok=True)
    payload = (lesson / "provenance" / "graphql-request.json").read_bytes()
    receipt = {
        "accessedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "url": "https://leetcode.com/graphql/",
        "authentication": "none; no credentials or cookies read",
    }
    request = urllib.request.Request(
        receipt["url"], data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=40) as response:
            raw = response.read()
            receipt["status"] = response.status
        (output / "graphql-response.txt").write_bytes(raw)
        question = json.loads(raw).get("data", {}).get("question")
        if not question:
            receipt["result"] = "blocked: no question returned"
        else:
            assert question["questionFrontendId"] == "568"
            assert question["titleSlug"] == "maximum-vacation-days"
            receipt["isPaidOnly"] = question["isPaidOnly"]
            receipt["statementAvailable"] = bool(question.get("content"))
            receipt["interfacesAvailable"] = bool(question.get("codeSnippets"))
            receipt["result"] = (
                "source available: requires fresh manual verification"
                if receipt["statementAvailable"] and receipt["interfacesAvailable"]
                else "blocked: statement or official interfaces unavailable"
            )
    except (urllib.error.URLError, ValueError, AssertionError) as error:
        receipt["result"] = "blocked: request or identity verification failed"
        receipt["error"] = str(error)
    (output / "access-result.json").write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps(receipt, indent=2))
    return 2 if receipt["result"].startswith("blocked:") else 0


if __name__ == "__main__":
    raise SystemExit(main())
