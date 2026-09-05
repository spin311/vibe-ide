export interface SessionEntry {
  readonly id: string;
  readonly title: string;
  readonly directory: string;
  readonly isEnded: boolean;
  readonly exitCode: number | null;
}

export interface SessionListState {
  readonly entries: readonly SessionEntry[];
  readonly activeId: string | null;
}

export function emptyState(): SessionListState {
  return { entries: [], activeId: null };
}

export function addSession(
  state: SessionListState,
  directory: string,
  id: string,
  title: string
): SessionListState {
  const entry: SessionEntry = { id, title, directory, isEnded: false, exitCode: null };
  return { entries: [...state.entries, entry], activeId: id };
}

export function removeSession(state: SessionListState, id: string): SessionListState {
  const index = state.entries.findIndex((e) => e.id === id);
  if (index === -1) {
    return state;
  }
  const entries = state.entries.filter((e) => e.id !== id);
  if (state.activeId !== id) {
    return { entries, activeId: state.activeId };
  }
  if (entries.length === 0) {
    return { entries, activeId: null };
  }
  const neighborIndex = Math.min(index, entries.length - 1);
  return { entries, activeId: entries[neighborIndex].id };
}

export function selectSession(state: SessionListState, id: string): SessionListState {
  if (!state.entries.some((e) => e.id === id)) {
    return state;
  }
  return { entries: state.entries, activeId: id };
}

export function markEnded(
  state: SessionListState,
  id: string,
  exitCode: number | null
): SessionListState {
  const entries = state.entries.map((e) =>
    e.id === id ? { ...e, isEnded: true, exitCode } : e
  );
  return { entries, activeId: state.activeId };
}
