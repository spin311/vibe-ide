// extensions/vibe-claude-terminal/src/extension.ts
import * as vscode from 'vscode';
import { ClaudeTerminalPanel } from './panel';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('vibeClaudeTerminal.open', () => {
    ClaudeTerminalPanel.createOrShow(context.extensionUri);
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {}
