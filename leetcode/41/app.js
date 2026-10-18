'use strict';
// This lesson exposes operation markers, not the Python frame's saved locals.
// Keep shared array transitions intact; sentinel indices must never look like
// Python assignments (Python's saved target survives a skipped iteration).
const placementTrace = HardModels[41];
HardModels[41] = input => {
  const trace = placementTrace(input);
  for (const frame of trace.frames) {
    const {i, target} = frame.state;
    frame.state = {
      op_i: i < 0 ? null : i,
      swap_to: target < 0 ? null : target
    };
    frame.rows.forEach(row => { row.active = row.active.filter(index => index >= 0); });
  }
  return trace;
};
HardLesson.mount(41);
