"""Bounded experimental survey; reference DP is a comparison, not its proof."""
import concurrent.futures
import json
import os
from pathlib import Path
import time
from probe import search


def reference_values(limit):
    values = [0]*(limit+1)
    for target in range(1, limit+1):
        n = target.bit_length()
        if target == (1 << n)-1:
            values[target] = n
            continue
        best = n+1+values[(1 << n)-1-target]
        for backward in range(n-1):
            remaining = target-((1 << (n-1))-1)+((1 << backward)-1)
            best = min(best, n+backward+1+values[remaining])
        values[target] = best
    return values


def batch(task):
    targets, deadline = task
    rows = []
    for target in targets:
        if time.time() >= deadline:
            rows.append(dict(target=target, status='survey_deadline'))
            continue
        rows.append(dict(target=target, **search(target, True, 1000000, 10)))
    return rows


if __name__ == '__main__':
    directory = Path(__file__).parent
    started = time.time()
    deadline = started+1200
    reference = reference_values(10000)
    rows = []
    tasks = [(list(range(begin, min(begin+50,10001))), deadline)
             for begin in range(1,10001,50)]
    with (directory/'full-range-rows.jsonl').open('x') as output:
        with concurrent.futures.ProcessPoolExecutor(max_workers=2) as pool:
            for completed in pool.map(batch, tasks):
                for row in completed:
                    row['reference_answer'] = reference[row['target']]
                    row['matches_reference'] = row.get('answer') == row['reference_answer']
                    output.write(json.dumps(row)+'\n')
                    rows.append(row)
                output.flush()
                summary = dict(pid=os.getpid(), status='running', completed=len(rows),
                               found=sum(r['status']=='found' for r in rows),
                               capped=sum(r['status']=='capped' for r in rows),
                               mismatches=[r['target'] for r in rows if r['status']=='found' and not r['matches_reference']],
                               elapsed_seconds=time.time()-started)
                (directory/'full-range-progress.json').write_text(json.dumps(summary,indent=2)+'\n')
                if len(rows)%1000 == 0:
                    print(json.dumps(summary),flush=True)
    summary['status'] = 'complete'
    summary['elapsed_seconds'] = time.time()-started
    summary['all_found_and_matched'] = len(rows)==10000 and all(r['status']=='found' and r['matches_reference'] for r in rows)
    summary['maximum_states_found'] = max((r['states'] for r in rows if r['status']=='found'),default=0)
    (directory/'full-range-progress.json').write_text(json.dumps(summary,indent=2)+'\n')
    print(json.dumps(summary),flush=True)
