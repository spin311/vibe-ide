import { randomUUID } from 'crypto';
import * as path from 'path';
import {
  SessionListState,
  emptyState,
  addSession,
  removeSession,
  selectSession as selectSessionState,
  markEnded,
} from './sessionListState';
import { HostedSession } from './hostedSession';

export class SessionManager {
  private state: SessionListState = emptyState();
  private sessions = new Map<string, HostedSession>();
  private onStateChanged: (state: SessionListState) => void;
  private onOutput: (sessionId: string, data: string) => void;

  constructor(
    onStateChanged: (state: SessionListState) => void,
    onOutput: (sessionId: string, data: string) => void
  ) {
    this.onStateChanged = onStateChanged;
    this.onOutput = onOutput;
  }

  openSession(directory: string): string {
    const id = randomUUID();
    const title = path.basename(directory);
    const session = new HostedSession(id, directory);
    this.sessions.set(id, session);
    this.state = addSession(this.state, directory, id, title);
    this.onStateChanged(this.state);

    session.start(
      (data) => this.onOutput(id, data),
      (exitCode) => {
        this.state = markEnded(this.state, id, exitCode);
        this.onStateChanged(this.state);
      }
    );
    return id;
  }

  closeSession(id: string): void {
    this.sessions.get(id)?.stop();
    this.sessions.delete(id);
    this.state = removeSession(this.state, id);
    this.onStateChanged(this.state);
  }

  selectSession(id: string): void {
    this.state = selectSessionState(this.state, id);
    this.onStateChanged(this.state);
  }

  handleInput(id: string, data: string): void {
    this.sessions.get(id)?.write(data);
  }

  handleResize(id: string, cols: number, rows: number): void {
    this.sessions.get(id)?.resize(cols, rows);
  }

  getState(): SessionListState {
    return this.state;
  }
}
