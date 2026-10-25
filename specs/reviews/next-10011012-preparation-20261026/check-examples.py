"""Dispatcher-only tiny direct oracles; no optimized lesson implementation."""
import json


def illumination(n, lamps, queries):
    active = set(map(tuple, lamps))
    assert all(0 <= x < n and 0 <= y < n for x, y in active)
    frames = []
    for row, col in queries:
        assert 0 <= row < n and 0 <= col < n
        witnesses = sorted((x, y) for x, y in active
                           if x == row or y == col or abs(x-row) == abs(y-col))
        removed = sorted((x, y) for x, y in active
                         if abs(x-row) <= 1 and abs(y-col) <= 1)
        frames.append({'query': [row, col], 'answer': int(bool(witnesses)),
                       'illuminatingLampsBeforeShutdown': witnesses,
                       'removed': removed, 'activeBefore': sorted(active)})
        active.difference_update(removed)
        frames[-1]['activeAfter'] = sorted(active)
    return {'answers': [f['answer'] for f in frames], 'frames': frames}


def repeated_up_to(n):
    return [value for value in range(1, n+1)
            if len(set(str(value))) < len(str(value))]


def main():
    lamp_cases = [
        ('official1', 5, [[0,0],[4,4]], [[1,1],[1,0]], [1,0]),
        ('official2', 5, [[0,0],[4,4]], [[1,1],[1,1]], [1,1]),
        ('official3', 5, [[0,0],[0,4]], [[0,4],[0,1],[1,4]], [1,1,0]),
        ('duplicate-single-cell', 1, [[0,0],[0,0]], [[0,0],[0,0]], [1,0]),
        ('no-lamps', 3, [], [[0,0],[1,1]], [0,0]),
        ('no-queries', 3, [[1,1]], [], []),
        ('shared-row-survives', 5, [[0,0],[0,4]], [[0,0],[0,2]], [1,1]),
        ('diagonal-neighbor-removed', 3, [[0,0]], [[1,1],[2,2]], [1,0]),
        ('negative-difference-diagonal', 6, [[0,3]], [[2,5],[0,3],[2,5]], [1,1,0]),
        ('anti-diagonal', 5, [[0,4]], [[2,2],[4,0]], [1,1]),
        ('large-sparse', 10**9, [[999999999,999999998],[999999999,999999999]],
         [[999999999,999999998],[999999999,999999998]], [1,0]),
    ]
    grids = []
    for label, n, lamps, queries, expected in lamp_cases:
        result = illumination(n, lamps, queries)
        assert result['answers'] == expected, (label, result)
        grids.append({'label': label, 'n': n, 'lamps': lamps, 'queries': queries, **result})
    digit_cases = [(1,0),(9,0),(10,0),(11,1),(20,1),(98,8),(99,9),(100,10),
                   (101,11),(110,12),(111,13),(112,14),(1000,262)]
    digits = []
    for n, expected in digit_cases:
        values = repeated_up_to(n)
        assert len(values) == expected, (n, len(values))
        digits.append({'n':n, 'count':len(values), 'values':values})
    membership = {str(n): n in repeated_up_to(n) for n in [10,100,101,102,110,111,1000]}
    assert membership == {'10':False,'100':True,'101':True,'102':False,'110':True,'111':True,'1000':True}
    # Every number contributes either zero or one to this inclusive count,
    # even when multiple digits or pairs repeat (111 and 1000).
    for n in range(2, 1001):
        assert len(repeated_up_to(n))-len(repeated_up_to(n-1)) == int(len(set(str(n))) < len(str(n)))
    print(json.dumps({'scope':'tiny direct oracles only; no candidate or full-constraint performance proof',
                      'gridCases':grids, 'digitCases':digits, 'digitMembership':membership,
                      'inclusiveDeltaChecks':999}, indent=2))


if __name__ == '__main__':
    main()
