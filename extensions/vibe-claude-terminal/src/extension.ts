import * as vscode from 'vscode';
import * as pty from 'node-pty';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('vibeClaudeTerminal.open', () => {
    const shell = process.env.SHELL || '/bin/zsh';
    const ptyProcess = pty.spawn(shell, ['-l', '-i', '-c', 'echo node-pty-loaded-ok'], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env as { [key: string]: string },
    });
    ptyProcess.onData((data: string) => {
      console.log('[vibe-claude-terminal] pty output:', JSON.stringify(data));
    });
    ptyProcess.onExit(({ exitCode }: { exitCode: number }) => {
      console.log('[vibe-claude-terminal] pty exited with code', exitCode);
    });
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {}
