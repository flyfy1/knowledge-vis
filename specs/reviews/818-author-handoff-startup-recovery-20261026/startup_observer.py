"""Narrow startup observation adapter; no I/O or dispatch."""
def observe(state, before, old_ids, launched_pid_alive, running_observer):
    if not launched_pid_alive:
        raise RuntimeError('Resumed runner exited before handoff arm')
    if state.get('status') == 'stopped':
        if before.get('status') != 'stopped' or state != before:
            raise RuntimeError('Stopped startup state differs from exact prelaunch snapshot')
        return None
    return running_observer(state, old_ids)
