import { describe, test, expect } from 'vitest';
import { emptyState, addSession, removeSession, selectSession, markEnded } from './sessionListState';

describe('addSession', () => {
  test('adding grows the list and activates the new entry', () => {
    const state = addSession(emptyState(), '/home/user/project', 'id-1', 'project');
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0]).toEqual({
      id: 'id-1',
      title: 'project',
      directory: '/home/user/project',
      isEnded: false,
      exitCode: null,
    });
    expect(state.activeId).toBe('id-1');
  });

  test('adding a second session activates it, keeping the first', () => {
    let state = addSession(emptyState(), '/a', 'id-1', 'a');
    state = addSession(state, '/b', 'id-2', 'b');
    expect(state.entries).toHaveLength(2);
    expect(state.activeId).toBe('id-2');
  });
});

describe('removeSession', () => {
  test('removing the active entry activates a neighbor', () => {
    let state = addSession(emptyState(), '/a', 'id-1', 'a');
    state = addSession(state, '/b', 'id-2', 'b');
    state = removeSession(state, 'id-2');
    expect(state.entries).toHaveLength(1);
    expect(state.activeId).toBe('id-1');
  });

  test('removing the only entry leaves activeId null', () => {
    let state = addSession(emptyState(), '/a', 'id-1', 'a');
    state = removeSession(state, 'id-1');
    expect(state.entries).toHaveLength(0);
    expect(state.activeId).toBeNull();
  });

  test('removing a non-active entry leaves the active selection alone', () => {
    let state = addSession(emptyState(), '/a', 'id-1', 'a');
    state = addSession(state, '/b', 'id-2', 'b');
    state = selectSession(state, 'id-1');
    state = removeSession(state, 'id-2');
    expect(state.activeId).toBe('id-1');
    expect(state.entries).toHaveLength(1);
  });
});

describe('selectSession', () => {
  test('selecting a different entry changes activeId only', () => {
    let state = addSession(emptyState(), '/a', 'id-1', 'a');
    state = addSession(state, '/b', 'id-2', 'b');
    state = selectSession(state, 'id-1');
    expect(state.activeId).toBe('id-1');
    expect(state.entries).toHaveLength(2);
  });
});

describe('markEnded', () => {
  test('marks the entry ended with its exit code, does not change activeId', () => {
    let state = addSession(emptyState(), '/a', 'id-1', 'a');
    state = addSession(state, '/b', 'id-2', 'b');
    state = selectSession(state, 'id-1');
    state = markEnded(state, 'id-2', 0);
    const ended = state.entries.find((e) => e.id === 'id-2')!;
    expect(ended.isEnded).toBe(true);
    expect(ended.exitCode).toBe(0);
    expect(state.activeId).toBe('id-1');
  });
});
