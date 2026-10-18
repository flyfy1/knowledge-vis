"""Lesson-local checks: execute canonical Python, preserve identity, test teaching arithmetic."""
from pathlib import Path
import json
import sys

folder = Path(__file__).resolve().parents[1]
source = (folder/'solution.py').read_text()
namespace = {}
exec(compile(source, str(folder/'solution.py'), 'exec'), namespace)
solve = namespace['Solution']().solveSudoku
assert json.loads((folder/'python-code.js').read_text().split('=',1)[1].strip().removesuffix(';')) == source
solved = ['534678912','672195348','198342567','859761423','426853791','713924856','961537284','287419635','345286179']
fixtures = json.loads((folder.parent/'hard-first-ten/fixtures.json').read_text())['37']
entries = 0

def invariant(frame, event, arg):
    global entries
    if event == 'call' and frame.f_code.co_name == 'search' and frame.f_code.co_filename == str(folder/'solution.py'):
        entries += 1
        loc = frame.f_locals
        board = loc['board']
        for r in range(9):
            assert loc['rows'][r] == set(board[r]) - {'.'}
            assert loc['cols'][r] == {board[i][r] for i in range(9)} - {'.'}
            assert loc['boxes'][r] == {board[i][j] for i in range(r//3*3,r//3*3+3) for j in range(r%3*3,r%3*3+3)} - {'.'}
    return invariant

def run(puzzle, trace=False):
    board = [list(r) for r in puzzle]
    rows = board[:]
    if trace: sys.settrace(invariant)
    try: assert solve(board) is None
    finally: sys.settrace(None)
    assert all(a is b for a,b in zip(rows,board))
    assert [''.join(r) for r in board] == solved
    for r in range(9):
        for c in range(9):
            if puzzle[r][c] != '.': assert board[r][c] == puzzle[r][c]

for i,puzzle in enumerate(fixtures): run(puzzle, i==0)
for cell in range(81):
    puzzle = [list(r) for r in solved]
    puzzle[cell//9][cell%9] = '.'
    run(puzzle)
fresh = [list(r) for r in solved]
fresh[0][0] = fresh[0][1] = '.'
assert ''.join(fresh[0]) == '..4678912'
assert ''.join(row[0] for row in fresh) == '.61847923'
allowed = set('123456789') - set(fresh[0]) - {row[0] for row in fresh} - {fresh[r][c] for r in range(3) for c in range(3)}
assert allowed == {'5'}
run(fresh)
assert set('123456789')-set('5312748..')-set('678')-set('68') == {'9'}
assert set('123456789')-set('53127489.')-set('13569')-set('689') == set()
print(f'PASS: canonical Python, 3 presets + 81 single holes + fresh two-hole case; {entries} recursive-entry constraint checks; exact source mirror; branch/quiz arithmetic.')
