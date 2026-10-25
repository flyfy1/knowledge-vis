# Queue identity guard closure

Independent review found that the pinned ordered 984-ID queue was checked only
before fetch/wait. Before changing the operator, two deterministic execute-seam
tests swapped the first two IDs after fetch or during the simulated natural-stop
wait. Both reached the import call instead of refusing (`queue-drift-red.log`,
0.039s). The test uses disposable state and simulated process observation, not Pi.

Ranked falsifiable hypotheses before correction:
1. Missing repeated queue checks allow a unique reordered queue to become the new
   baseline. Rechecking the exact length/hash just before STOP and before imports
   should make both cases refuse without calling the importer.
2. Ordered-hash encoding could be at fault. The same canonical helper and initial
   hash must accept the unchanged queue and distinguish the swapped order.
3. The wait fixture could be mutating at the wrong seam. Separate after-fetch and
   sleep-callback mutations should both be observed at their respective checkpoints;
   only the during-wait case should retain an already-written STOP.

The correction adds only those two repeated checks. No queue or runtime is
rewritten. Original red output is retained; the green cases also assert zero
import calls, no STOP for pre-STOP drift, and retained STOP for wait-time drift.

Confirmed hypothesis: H1. Both original execute-seam negatives now pass; all16
local checks pass. Event controls show pre-STOP drift produces no STOP while
wait-time drift retains it. Commit explanation should record that exact queue
identity must be revalidated after fetch and the natural-stop wait.
