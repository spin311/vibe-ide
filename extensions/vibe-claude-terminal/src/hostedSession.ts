import * as pty from 'node-pty';

export class HostedSession {
  readonly id: string;
  readonly directory: string;
  private ptyProcess: pty.IPty | null = null;

  constructor(id: string, directory: string) {
    this.id = id;
    this.directory = directory;
  }

  start(onData: (chunk: string) => void, onExit: (exitCode: number | null) => void): void {
    const shell = process.env.SHELL || '/bin/zsh';
    this.ptyProcess = pty.spawn(shell, ['-l', '-i', '-c', 'claude'], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: this.directory,
      env: process.env as { [key: string]: string },
    });
    this.ptyProcess.onData(onData);
    this.ptyProcess.onExit(({ exitCode }: { exitCode: number }) => {
      onExit(exitCode);
      this.ptyProcess = null;
    });
  }

  write(data: string): void {
    this.ptyProcess?.write(data);
  }

  resize(cols: number, rows: number): void {
    this.ptyProcess?.resize(cols, rows);
  }

  stop(): void {
    this.ptyProcess?.kill();
    this.ptyProcess = null;
  }
}
