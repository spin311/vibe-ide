// extensions/vibe-claude-terminal/src/panel.ts
import * as vscode from 'vscode';
import { SessionManager } from './sessionManager';

export class ClaudeTerminalPanel {
  private static current: ClaudeTerminalPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly sessionManager: SessionManager;

  static createOrShow(extensionUri: vscode.Uri): void {
    if (ClaudeTerminalPanel.current) {
      ClaudeTerminalPanel.current.panel.reveal();
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'vibeClaudeTerminal',
      'Claude',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'media'),
          vscode.Uri.joinPath(extensionUri, 'node_modules', '@xterm'),
        ],
      }
    );
    ClaudeTerminalPanel.current = new ClaudeTerminalPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.sessionManager = new SessionManager(
      (state) => this.panel.webview.postMessage({ type: 'stateChanged', state }),
      (sessionId, data) => this.panel.webview.postMessage({ type: 'output', sessionId, data })
    );

    this.panel.webview.html = this.getHtml(extensionUri);

    this.panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'newSession': {
          const folders = vscode.workspace.workspaceFolders;
          const directory = folders && folders.length > 0 ? folders[0].uri.fsPath : process.env.HOME || '/';
          this.sessionManager.openSession(directory);
          break;
        }
        case 'closeSession':
          this.sessionManager.closeSession(message.sessionId);
          break;
        case 'selectSession':
          this.sessionManager.selectSession(message.sessionId);
          break;
        case 'input':
          this.sessionManager.handleInput(message.sessionId, message.data);
          break;
        case 'resize':
          this.sessionManager.handleResize(message.sessionId, message.cols, message.rows);
          break;
      }
    });

    this.panel.onDidDispose(() => {
      ClaudeTerminalPanel.current = undefined;
    });
  }

  private getHtml(extensionUri: vscode.Uri): string {
    const webview = this.panel.webview;
    const xtermJs = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'node_modules', '@xterm', 'xterm', 'lib', 'xterm.js')
    );
    const xtermCss = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'node_modules', '@xterm', 'xterm', 'css', 'xterm.css')
    );
    const fitAddonJs = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'node_modules', '@xterm', 'addon-fit', 'lib', 'addon-fit.js')
    );
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'webview.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'webview.css'));

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="${xtermCss}">
  <link rel="stylesheet" href="${styleUri}">
</head>
<body>
  <div id="tab-bar"><span id="new-session">+</span></div>
  <div id="terminal-container"></div>
  <script src="${xtermJs}"></script>
  <script src="${fitAddonJs}"></script>
  <script src="${scriptUri}"></script>
</body>
</html>`;
  }
}
