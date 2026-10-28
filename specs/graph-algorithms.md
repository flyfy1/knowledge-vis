# Graph algorithms slice

## Scope

This slice teaches BFS and DFS over an editable undirected graph. The page intentionally keeps one small graph so the learner can attribute a changed visit order to a single edge or container choice.

## State model

- `graph.nodes`: stable labels `A…F`.
- `graph.edges`: unique undirected pairs; toggling an edge updates only this list.
- `run.container`: queue front at index 0 for BFS, stack top at the end for DFS.
- `run.seen`: prevents cycles from re-entering the container.
- `run.scans`: increments once per adjacency-list entry inspected.

## Review gates

- A single step must never skip a node scan or silently mutate the graph.
- BFS and DFS use the same neighbor order (`sort()`), so the only intentional ordering difference is FIFO vs LIFO.
- Complexity cards must equal `V`, `E`, `2E`, and the current visited count for the rendered graph.
- The browser canvas is progressive enhancement; core traversal exports are testable in Node.
