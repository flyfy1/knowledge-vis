import importlib.util
from pathlib import Path
p=Path(__file__).parents[1]/'solution.py'
s=importlib.util.spec_from_file_location('solution1192',p); m=importlib.util.module_from_spec(s); s.loader.exec_module(m)
Solution=m.Solution
