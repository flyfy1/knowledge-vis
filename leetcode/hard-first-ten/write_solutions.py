"""Regenerate offline bundles from the canonical submission-shaped Python files."""
from pathlib import Path
import json
ROOT = Path(__file__).resolve().parents[1]
for number in (4, 10, 23, 25, 30, 32, 37, 41, 42, 44):
    directory = ROOT / str(number)
    source = (directory / 'solution.py').read_text()
    (directory / 'python-code.js').write_text('window.PYTHON_SOURCE = ' + json.dumps(source) + ';\n')
