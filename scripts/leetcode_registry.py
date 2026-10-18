"""Read the legacy JS registry and merge entries without deleting other batches."""
import json
import subprocess
from pathlib import Path


def read_registry(path):
    script = "const fs=require('fs'),vm=require('vm'); const c={window:{}}; vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),c); process.stdout.write(JSON.stringify(c.window.LEETCODE_PROBLEMS));"
    entries = json.loads(subprocess.check_output(['node', '-e', script, str(path)], text=True))
    if len({entry['id'] for entry in entries}) != len(entries):
        raise ValueError('Duplicate problem IDs in registry')
    return entries


def merge_registry(path, additions):
    path = Path(path)
    entries = {entry['id']: entry for entry in read_registry(path)}
    if len({entry['id'] for entry in additions}) != len(additions):
        raise ValueError('Duplicate additions')
    entries.update({entry['id']: entry for entry in additions})
    result = [entries[key] for key in sorted(entries)]
    path.write_text('/* Registered lessons, sorted by official frontend ID. */\nwindow.LEETCODE_PROBLEMS = ' + json.dumps(result, ensure_ascii=False, indent=2) + ';\n')
