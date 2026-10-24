"""Recheck ordinary public access. OUTPUT_DIR keeps reviewer evidence separate."""
import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


def main():
    evidence = Path(__file__).parent / "evidence"
    output = Path(os.environ.get("OUTPUT_DIR", "/tmp/leetcode-425-access-probe"))
    output.mkdir(parents=True, exist_ok=True)
    payload = (evidence / "graphql-request.json").read_bytes()
    request = urllib.request.Request(
        "https://leetcode.com/graphql/", data=payload, method="POST",
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0",
                 "Referer": "https://leetcode.com/problems/word-squares/"},
    )
    record = {"verifiedAt": datetime.now(timezone.utc).isoformat(),
              "url": request.full_url, "method": "POST",
              "authentication": "Unauthenticated public request; no credentials accessed."}
    body = ""
    try:
        with urllib.request.urlopen(request, timeout=35) as response:
            record["status"] = response.status
            body = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as error:
        record["status"] = error.code
        body = error.read().decode("utf-8", errors="replace")
    except Exception as error:
        record["error"] = str(error)
    (output / "graphql-response.txt").write_text(body)
    record["responseFile"] = "graphql-response.txt"
    (output / "graphql-access.json").write_text(json.dumps(record, indent=2) + "\n")
    try:
        question = json.loads(body)["data"]["question"]
        available = bool(question.get("content") and question.get("codeSnippets"))
        print(json.dumps({"status": record.get("status"),
                          "statementAvailable": bool(question.get("content")),
                          "snippetsAvailable": bool(question.get("codeSnippets")),
                          "evidenceDirectory": str(output)}))
    except (ValueError, KeyError, TypeError):
        available = False
        print(json.dumps(record))
    # Even available fields require human verification of the complete contract.
    return 0 if available else 2


if __name__ == "__main__":
    raise SystemExit(main())
