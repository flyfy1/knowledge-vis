# Rebuild only the lesson's source mirror. No shared generator is used.
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
(root/'python-code.js').write_text('window.PYTHON_SOURCE = '+json.dumps((root/'solution.py').read_text(),ensure_ascii=False)+';\n')
