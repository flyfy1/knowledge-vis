"""Refresh only this lesson's exact source mirror."""
from pathlib import Path
import json
root = Path(__file__).resolve().parents[1]
(root/'python-code.js').write_text("'use strict';\nconst PYTHON_SOURCE = "+json.dumps((root/'solution.py').read_text(), ensure_ascii=False)+";\n")
