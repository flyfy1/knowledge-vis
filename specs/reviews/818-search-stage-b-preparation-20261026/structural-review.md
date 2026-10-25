# Independent structural review of pending Stage B

Root inspected the complete operator authored by a separate agent, SHA-256
`20041ff880e5d9fb59088e41d2c5bb451867a516817bb8edc209b68baed5abc2`,
and independently ran its 12 focused tests successfully. No structural correction
was identified. This is preparation review only: the dispatch entry remains
disabled, actual evidence and final pins do not yet exist, and final exact-byte
review remains required before execution.

The payload validator checks the actual 10,000 unique target records, successful
canonical returns, small independent BFS comparisons, isolated reruns of the
observed timing/RSS maxima and three representative inputs, Darwin RSS units,
exact source/harness hashes and the complete artifact hashes. These checks were
compared with the reviewed Mac harness's output fields. Reference-DP agreement
remains numerical corroboration, not a proof of optimality. The human report must
still accurately interpret the measurements; finding required identifiers in its
text does not itself validate that interpretation.

The operation requires the successful Stage A receipt, exact owned STOP and
frozen progress/source/tree/ledger. Its commit can add only the fixed report and
one evidence directory. Checkpointing changes only expected_head. Resume requires
a fresh reviewer session on the evidence-adoption head, with historical runs and
lesson content preserved. Startup publication and same-digest receipt refreshes
are refused; the full queue and ordinary review flow remain intact.

The failure path retains actual state and restores its owned STOP if absent;
it does not interrupt an agent or authorize a retry. Tests cover refused evidence
and history mutations, plus the real runner's review candidate refresh using an
intercepted agent call. They are synthetic fixtures, not Mac candidate measurements,
live process proof, independent lesson acceptance, or publication evidence.

Before final approval: read the frozen canonical source, inspect the real Mac
outputs and report, freeze their exact commit and pins, review the sole enabling
constant change, and recheck actual Stage A state. None of these pending duties
is waived by this structural review.
